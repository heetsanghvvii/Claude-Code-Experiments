package expo.modules.appblocker

import android.content.Context
import android.content.Intent
import android.net.Uri
import android.os.Build
import android.provider.Settings
import android.util.Log
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition

class AppBlockerModule : Module() {
  companion object {
    // Kept for compatibility; the source of truth is BlockerCore.
    const val PREFS = BlockerCore.PREFS
    const val KEY_ON = BlockerCore.KEY_ON
    const val KEY_APPS = BlockerCore.KEY_APPS
    private const val TAG = "NopeModule"
  }

  private val ctx: Context
    get() = appContext.reactContext ?: throw IllegalStateException("No context")

  private fun prefs() = BlockerCore.prefs(ctx)

  /** Opens a settings screen; tries each intent in turn until one starts. */
  private fun openFirst(vararg intents: Intent): Boolean {
    for (i in intents) {
      try {
        ctx.startActivity(i.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK))
        return true
      } catch (e: Exception) {
        Log.w(TAG, "Could not open ${i.action}", e)
      }
    }
    return false
  }

  private fun pkgUri() = Uri.parse("package:" + ctx.packageName)

  private fun openAccessibility() = openFirst(Intent(Settings.ACTION_ACCESSIBILITY_SETTINGS))

  private fun openUsageAccess() = openFirst(
    // Package specific page works on some Android versions only (UNVERIFIED); falls back.
    Intent(Settings.ACTION_USAGE_ACCESS_SETTINGS, pkgUri()),
    Intent(Settings.ACTION_USAGE_ACCESS_SETTINGS),
  )

  private fun openOverlay() = openFirst(
    Intent(Settings.ACTION_MANAGE_OVERLAY_PERMISSION, pkgUri()),
    Intent(Settings.ACTION_MANAGE_OVERLAY_PERMISSION),
  )

  private fun requestNotificationPermissionIfNeeded() {
    // Android 13+: the usage mode notification is hidden without this. The service still runs.
    if (Build.VERSION.SDK_INT < 33) return
    try {
      val perm = "android.permission.POST_NOTIFICATIONS"
      if (ctx.checkSelfPermission(perm) == android.content.pm.PackageManager.PERMISSION_GRANTED) return
      appContext.currentActivity?.requestPermissions(arrayOf(perm), 4712)
    } catch (e: Exception) {
      Log.w(TAG, "notification permission request failed", e)
    }
  }

  override fun definition() = ModuleDefinition {
    Name("AppBlocker")

    // Mode aware: accessibility mode needs the service; usage mode needs usage access + overlay.
    AsyncFunction("hasPermission") {
      BlockerCore.syncUsageService(ctx)
      BlockerCore.hasModePermissions(ctx)
    }

    AsyncFunction("requestPermission") {
      if (BlockerCore.getMode(ctx) == BlockerCore.MODE_USAGE) {
        when {
          !BlockerCore.hasUsageAccess(ctx) -> openUsageAccess()
          !BlockerCore.canDrawOverlays(ctx) -> openOverlay()
          else -> Unit
        }
      } else {
        openAccessibility()
      }
      BlockerCore.hasModePermissions(ctx)
    }

    AsyncFunction("getInstalledApps") {
      val pm = ctx.packageManager
      val launch = Intent(Intent.ACTION_MAIN).addCategory(Intent.CATEGORY_LAUNCHER)
      pm.queryIntentActivities(launch, 0)
        .map { mapOf("id" to it.activityInfo.packageName, "name" to it.loadLabel(pm).toString()) }
        .filter { it["id"] != ctx.packageName }
        .distinctBy { it["id"] }
        .sortedBy { it["name"]?.lowercase() }
    }

    Function("setBlockedApps") { ids: List<String> ->
      prefs().edit().putStringSet(BlockerCore.KEY_APPS, ids.toSet()).apply()
    }

    AsyncFunction("pickApps") { -1 }

    Function("setBlocking") { on: Boolean ->
      prefs().edit()
        .putBoolean(BlockerCore.KEY_ON, on)
        .putLong(BlockerCore.KEY_CHANGED_AT, System.currentTimeMillis())
        .commit() // commit so the usage service reads the new value right away
      BlockerCore.syncUsageService(ctx)
    }

    Function("isBlocking") { prefs().getBoolean(BlockerCore.KEY_ON, false) }

    // ---- detection mode ----
    Function("setMode") { mode: String ->
      val m = if (mode == BlockerCore.MODE_USAGE) BlockerCore.MODE_USAGE else BlockerCore.MODE_ACCESSIBILITY
      prefs().edit().putString(BlockerCore.KEY_MODE, m).commit()
      if (m == BlockerCore.MODE_USAGE) requestNotificationPermissionIfNeeded()
      BlockerCore.syncUsageService(ctx)
    }

    Function("getMode") { BlockerCore.getMode(ctx) }

    // ---- strict mode (direct APK only, see FocusAccessibilityService) ----
    Function("setStrictMode") { on: Boolean ->
      prefs().edit().putBoolean(BlockerCore.KEY_STRICT, on && FocusAccessibilityService.STRICT_MODE_ALLOWED).apply()
    }

    Function("getStrictMode") { BlockerCore.isStrict(ctx) }

    // ---- setup doctor ----
    AsyncFunction("getDiagnostics") {
      BlockerCore.syncUsageService(ctx)
      mapOf(
        "accessibilityEnabled" to BlockerCore.isAccessibilityEnabled(ctx),
        "usageAccessGranted" to BlockerCore.hasUsageAccess(ctx),
        "overlayGranted" to BlockerCore.canDrawOverlays(ctx),
        "batteryOptimizationIgnored" to BlockerCore.isIgnoringBatteryOptimizations(ctx),
        "manufacturer" to (Build.MANUFACTURER ?: ""),
        "brand" to (Build.BRAND ?: ""),
        "model" to (Build.MODEL ?: ""),
        "sdk" to Build.VERSION.SDK_INT,
        "mode" to BlockerCore.getMode(ctx),
        "strictMode" to BlockerCore.isStrict(ctx),
      )
    }

    AsyncFunction("requestAccessibility") {
      openAccessibility()
      BlockerCore.isAccessibilityEnabled(ctx)
    }

    AsyncFunction("requestUsageAccess") {
      openUsageAccess()
      BlockerCore.hasUsageAccess(ctx)
    }

    AsyncFunction("requestOverlay") {
      openOverlay()
      BlockerCore.canDrawOverlays(ctx)
    }

    AsyncFunction("requestIgnoreBatteryOptimization") {
      if (!BlockerCore.isIgnoringBatteryOptimizations(ctx)) {
        // Direct request dialog. Play restricts REQUEST_IGNORE_BATTERY_OPTIMIZATIONS to some
        // app types (UNVERIFIED for Nope); the list screen is the fallback.
        openFirst(
          Intent(Settings.ACTION_REQUEST_IGNORE_BATTERY_OPTIMIZATIONS, pkgUri()),
          Intent(Settings.ACTION_IGNORE_BATTERY_OPTIMIZATION_SETTINGS),
        )
      }
      BlockerCore.isIgnoringBatteryOptimizations(ctx)
    }

    // App info page: needed for "Allow restricted settings" on sideloaded Android 13+ installs.
    AsyncFunction("openAppDetails") {
      openFirst(Intent(Settings.ACTION_APPLICATION_DETAILS_SETTINGS, pkgUri()))
    }
  }
}
