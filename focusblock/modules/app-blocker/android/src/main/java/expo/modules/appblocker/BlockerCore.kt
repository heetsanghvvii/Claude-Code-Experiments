package expo.modules.appblocker

import android.accessibilityservice.AccessibilityService
import android.app.AppOpsManager
import android.content.ComponentName
import android.content.Context
import android.content.Intent
import android.content.SharedPreferences
import android.content.pm.PackageManager
import android.os.Build
import android.os.PowerManager
import android.os.Process
import android.os.SystemClock
import android.provider.Settings
import android.telecom.TelecomManager
import android.util.Log
import android.view.inputmethod.InputMethodManager

/**
 * Shared blocking rules for BOTH detection modes:
 *  - "accessibility" (default): FocusAccessibilityService reacts to window changes.
 *  - "usage" (fallback): UsageMonitorService polls UsageStatsManager.
 *
 * Both modes read the same SharedPreferences (on flag, blocked list), use the same
 * never-block list and the same debounce, so behaviour stays identical.
 */
object BlockerCore {
  private const val TAG = "NopeBlocker"

  const val PREFS = "focusblock"
  const val KEY_ON = "on"
  const val KEY_APPS = "apps"
  const val KEY_MODE = "mode"
  const val KEY_STRICT = "strictMode"
  /** Wall clock ms of the last lock or unlock. Used for the strict mode grace window. */
  const val KEY_CHANGED_AT = "stateChangedAt"
  /** Wall clock ms of the last sign of life from whichever blocking service is running. */
  const val KEY_HEARTBEAT = "heartbeatAt"

  const val MODE_ACCESSIBILITY = "accessibility"
  const val MODE_USAGE = "usage"

  /** Same debounce the accessibility service always used. */
  const val DEBOUNCE_MS = 500L

  /** Strict mode does nothing for this long after a lock or unlock (user "just unlocked"). */
  const val STRICT_GRACE_MS = 15_000L

  /**
   * Never blocked under ANY mode, even if they somehow end up in the blocked list.
   * Mirrors the 'never' entries in src/essentials.ts plus in-call and emergency screens.
   * Package names for OEM emergency apps are best effort and UNVERIFIED on every brand;
   * the default dialer is also looked up at runtime (see defaultDialer).
   */
  private val NEVER_BLOCK = setOf(
    // Dialers
    "com.google.android.dialer", "com.android.dialer", "com.samsung.android.dialer",
    "com.android.phone", "com.android.server.telecom",
    // In-call screens
    "com.android.incallui", "com.samsung.android.incallui", "com.google.android.incallui",
    // Emergency
    "com.android.emergency", "com.google.android.apps.safetyhub",
    "com.samsung.android.emergency", "com.android.cellbroadcastreceiver",
    "com.google.android.cellbroadcastreceiver",
  )

  /** System surfaces we never react to (same list the accessibility service had). */
  val IGNORED = setOf(
    "com.android.systemui", "android", "com.google.android.permissioncontroller",
    "com.android.permissioncontroller",
  )

  /** Set by the services themselves; both run in the app process, so the module can read them. */
  @Volatile var accessibilityAlive = false
  @Volatile var usageAlive = false
  @Volatile private var lastBeatWrite = 0L

  @Volatile private var lastHomeAt = 0L
  @Volatile private var launcherPkgs: Set<String> = emptySet()
  @Volatile private var launchersCheckedAt = 0L
  @Volatile private var imePkgs: Set<String> = emptySet()
  @Volatile private var imeCheckedAt = 0L
  @Volatile private var dialerPkg: String? = null
  @Volatile private var dialerCheckedAt = 0L

  fun prefs(ctx: Context): SharedPreferences =
    ctx.getSharedPreferences(PREFS, Context.MODE_PRIVATE)

  fun isOn(ctx: Context) = prefs(ctx).getBoolean(KEY_ON, false)

  fun getMode(ctx: Context): String {
    val m = prefs(ctx).getString(KEY_MODE, MODE_ACCESSIBILITY)
    return if (m == MODE_USAGE) MODE_USAGE else MODE_ACCESSIBILITY
  }

  fun isStrict(ctx: Context) = prefs(ctx).getBoolean(KEY_STRICT, false)

  fun inStrictGrace(ctx: Context): Boolean {
    val at = prefs(ctx).getLong(KEY_CHANGED_AT, 0L)
    val now = System.currentTimeMillis()
    return at > 0L && now >= at && now - at < STRICT_GRACE_MS
  }

  /** Records a heartbeat, written at most every 30 s to keep disk writes low. */
  fun beat(ctx: Context, force: Boolean = false) {
    val now = SystemClock.elapsedRealtime()
    if (!force && lastBeatWrite != 0L && now - lastBeatWrite < 30_000) return
    lastBeatWrite = now
    try {
      prefs(ctx).edit().putLong(KEY_HEARTBEAT, System.currentTimeMillis()).apply()
    } catch (_: Exception) {
    }
  }

  fun lastHeartbeat(ctx: Context): Long = prefs(ctx).getLong(KEY_HEARTBEAT, 0L)

  /** Is the service for the chosen mode running right now (in this process)? */
  fun isServiceAlive(ctx: Context): Boolean =
    if (getMode(ctx) == MODE_USAGE) usageAlive else accessibilityAlive

  /**
   * True only when blocking would really happen now: permissions for the chosen mode are
   * granted AND its service is running. In usage mode the service only runs while locked,
   * so when unlocked we report the permissions only.
   */
  fun isBlockingHealthy(ctx: Context): Boolean {
    if (!hasModePermissions(ctx)) return false
    if (getMode(ctx) == MODE_USAGE && !isOn(ctx)) return true
    return isServiceAlive(ctx)
  }

  // ---------------- never-block rules ----------------

  private fun defaultDialer(ctx: Context): String? {
    val now = SystemClock.elapsedRealtime()
    if (dialerCheckedAt != 0L && now - dialerCheckedAt < 60_000) return dialerPkg
    dialerCheckedAt = now
    dialerPkg = try {
      (ctx.getSystemService(Context.TELECOM_SERVICE) as? TelecomManager)?.defaultDialerPackage
    } catch (_: Exception) {
      null
    }
    return dialerPkg
  }

  private fun refreshLaunchers(ctx: Context) {
    val now = SystemClock.elapsedRealtime()
    if (launcherPkgs.isNotEmpty() && now - launchersCheckedAt < 10 * 60_000) return
    launchersCheckedAt = now
    launcherPkgs = try {
      val home = Intent(Intent.ACTION_MAIN).addCategory(Intent.CATEGORY_HOME)
      ctx.packageManager
        .queryIntentActivities(home, PackageManager.MATCH_DEFAULT_ONLY or PackageManager.MATCH_ALL)
        .map { it.activityInfo.packageName }.toSet()
    } catch (_: Exception) {
      emptySet()
    }
  }

  private fun refreshImes(ctx: Context) {
    val now = SystemClock.elapsedRealtime()
    if (imeCheckedAt != 0L && now - imeCheckedAt < 30_000) return
    imeCheckedAt = now
    imePkgs = try {
      val imm = ctx.getSystemService(Context.INPUT_METHOD_SERVICE) as? InputMethodManager
      imm?.enabledInputMethodList?.map { it.packageName }?.toSet() ?: emptySet()
    } catch (_: Exception) {
      emptySet()
    }
  }

  /** Phone, emergency, Nope itself, launcher, keyboard and system UI are never blocked. */
  fun isNeverBlocked(ctx: Context, pkg: String): Boolean {
    if (pkg == ctx.packageName || pkg in NEVER_BLOCK || pkg in IGNORED) return true
    if (pkg == defaultDialer(ctx)) return true
    refreshLaunchers(ctx)
    refreshImes(ctx)
    return pkg in launcherPkgs || pkg in imePkgs
  }

  /** True when the lock is on and pkg is a chosen app that is allowed to be blocked. */
  fun isUserBlocked(ctx: Context, pkg: String): Boolean {
    val p = prefs(ctx)
    if (!p.getBoolean(KEY_ON, false)) return false
    val blocked = p.getStringSet(KEY_APPS, emptySet()) ?: emptySet()
    if (!blocked.contains(pkg)) return false
    return !isNeverBlocked(ctx, pkg)
  }

  /**
   * Debounce: a block already in flight produces repeat events (also covers apps opened
   * from notifications, which fire several window events). Returns true if we may act now.
   */
  @Synchronized
  fun tryBeginBlock(): Boolean {
    val now = SystemClock.elapsedRealtime()
    if (now - lastHomeAt < DEBOUNCE_MS) return false
    lastHomeAt = now
    return true
  }

  /**
   * Sends the user Home and shows BlockedActivity.
   * With an AccessibilityService we use GLOBAL_ACTION_HOME. Without one (usage mode) we start
   * the Home intent ourselves, which Android only allows from the background when the app has
   * a background activity start exemption; holding SYSTEM_ALERT_WINDOW ("Display over other
   * apps") is one of the documented exemptions (verify again on Android 15 and 16, UNVERIFIED).
   */
  fun blockNow(ctx: Context, service: AccessibilityService?) {
    var wentHome = false
    if (service != null) {
      wentHome = try {
        service.performGlobalAction(AccessibilityService.GLOBAL_ACTION_HOME)
      } catch (_: Exception) {
        false
      }
    }
    if (!wentHome) {
      try {
        ctx.startActivity(
          Intent(Intent.ACTION_MAIN)
            .addCategory(Intent.CATEGORY_HOME)
            .addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
        )
      } catch (e: Exception) {
        Log.w(TAG, "Home start failed", e)
      }
    }
    try {
      ctx.startActivity(
        Intent(ctx, BlockedActivity::class.java).addFlags(
          Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TOP or
            Intent.FLAG_ACTIVITY_NO_ANIMATION
        )
      )
    } catch (e: Exception) {
      // Background-start restrictions: Home was attempted first, so still safe.
      Log.w(TAG, "BlockedActivity start failed", e)
    }
  }

  // ---------------- permission and device checks ----------------

  fun isAccessibilityEnabled(ctx: Context): Boolean = try {
    val me = ComponentName(ctx, FocusAccessibilityService::class.java).flattenToString()
    val enabled = Settings.Secure.getString(
      ctx.contentResolver, Settings.Secure.ENABLED_ACCESSIBILITY_SERVICES
    )
    enabled != null && enabled.split(':').any { it.equals(me, ignoreCase = true) }
  } catch (_: Exception) {
    false
  }

  fun hasUsageAccess(ctx: Context): Boolean = try {
    val ops = ctx.getSystemService(Context.APP_OPS_SERVICE) as AppOpsManager
    val mode = if (Build.VERSION.SDK_INT >= 29) {
      ops.unsafeCheckOpNoThrow(AppOpsManager.OPSTR_GET_USAGE_STATS, Process.myUid(), ctx.packageName)
    } else {
      @Suppress("DEPRECATION")
      ops.checkOpNoThrow(AppOpsManager.OPSTR_GET_USAGE_STATS, Process.myUid(), ctx.packageName)
    }
    if (mode == AppOpsManager.MODE_DEFAULT) {
      ctx.checkCallingOrSelfPermission(android.Manifest.permission.PACKAGE_USAGE_STATS) ==
        PackageManager.PERMISSION_GRANTED
    } else {
      mode == AppOpsManager.MODE_ALLOWED
    }
  } catch (_: Exception) {
    false
  }

  fun canDrawOverlays(ctx: Context): Boolean = try {
    Settings.canDrawOverlays(ctx)
  } catch (_: Exception) {
    false
  }

  fun isIgnoringBatteryOptimizations(ctx: Context): Boolean = try {
    val pm = ctx.getSystemService(Context.POWER_SERVICE) as PowerManager
    pm.isIgnoringBatteryOptimizations(ctx.packageName)
  } catch (_: Exception) {
    false
  }

  /** Everything the chosen mode needs to actually block. */
  fun hasModePermissions(ctx: Context): Boolean =
    if (getMode(ctx) == MODE_USAGE) hasUsageAccess(ctx) && canDrawOverlays(ctx)
    else isAccessibilityEnabled(ctx)

  // ---------------- usage mode service ----------------

  fun shouldRunUsageService(ctx: Context): Boolean =
    isOn(ctx) && getMode(ctx) == MODE_USAGE && hasUsageAccess(ctx)

  /** Starts or stops the usage mode foreground service to match the saved state. */
  fun syncUsageService(ctx: Context) {
    try {
      if (shouldRunUsageService(ctx)) UsageMonitorService.start(ctx)
      else UsageMonitorService.stop(ctx)
    } catch (e: Exception) {
      Log.w(TAG, "syncUsageService failed", e)
    }
  }
}
