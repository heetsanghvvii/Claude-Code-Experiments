package expo.modules.appblocker

import android.accessibilityservice.AccessibilityService
import android.view.accessibility.AccessibilityEvent

/**
 * Default detection mode ("accessibility"). Reads only the package and window class/title of
 * window state change events. It does nothing when the saved mode is "usage", so the two
 * modes never double handle. Blocking rules live in BlockerCore and are shared with
 * UsageMonitorService.
 */
class FocusAccessibilityService : AccessibilityService() {

  private var appLabel: String = "Nope"

  override fun onServiceConnected() {
    super.onServiceConnected()
    appLabel = try {
      packageManager.getApplicationLabel(applicationInfo).toString()
    } catch (_: Exception) {
      "Nope"
    }
  }

  override fun onAccessibilityEvent(event: AccessibilityEvent?) {
    try {
      handle(event)
    } catch (_: Exception) {
      // Never crash the service: Android would leave it disabled.
    }
  }

  private fun handle(event: AccessibilityEvent?) {
    if (event?.eventType != AccessibilityEvent.TYPE_WINDOW_STATE_CHANGED) return
    val pkg = event.packageName?.toString() ?: return
    if (BlockerCore.isNeverBlocked(this, pkg)) return // Phone, emergency, Nope, launcher, keyboard

    val prefs = BlockerCore.prefs(this)
    if (!prefs.getBoolean(BlockerCore.KEY_ON, false)) return
    if (BlockerCore.getMode(this) != BlockerCore.MODE_ACCESSIBILITY) return

    val cls = event.className?.toString()

    if (STRICT_MODE_ALLOWED && BlockerCore.isStrict(this) && !BlockerCore.inStrictGrace(this) &&
      isProtectedSettingsScreen(pkg, cls, event)
    ) {
      if (BlockerCore.tryBeginBlock()) BlockerCore.blockNow(this, this)
      return
    }

    // Ignore non-activity windows (popups, dialogs, keyboards inside apps).
    if (cls != null && (cls.startsWith("android.widget.") || cls.startsWith("android.view."))) return

    if (!BlockerCore.isUserBlocked(this, pkg)) return
    if (!BlockerCore.tryBeginBlock()) return
    BlockerCore.blockNow(this, this)
  }

  // ------------------------------------------------------------------------------------
  // STRICT MODE (opt-in, default OFF, set with AppBlocker.setStrictMode)
  //
  // POLICY WARNING: Google Play policy forbids using the Accessibility API to prevent users
  // from disabling or uninstalling an app (UNVERIFIED exact wording; re-read the current
  // "Use of the AccessibilityService API" policy before any Play upload).
  // Strict mode MUST stay OFF in any Play Store build. It is for direct APK distribution only.
  // Set STRICT_MODE_ALLOWED to false in a Play build to compile the feature out entirely.
  //
  // While locked (and not within STRICT_GRACE_MS of a lock or unlock), it sends the user Home
  // from Settings screens that could disable Nope: Accessibility settings, App info pages,
  // the uninstall dialog and the Usage access page. Detection uses the window class name and
  // the window title text only (no screen content). Keywords are English only and approximate;
  // OEM class names differ (UNVERIFIED on Xiaomi, Vivo, Oppo, Samsung). The Phone dialer and
  // emergency apps are never affected because isNeverBlocked runs first.
  // ------------------------------------------------------------------------------------

  private fun isProtectedSettingsScreen(pkg: String, cls: String?, event: AccessibilityEvent): Boolean {
    val isSettings = pkg in SETTINGS_PKGS
    val isInstaller = pkg in INSTALLER_PKGS
    if (!isSettings && !isInstaller) return false

    val c = cls?.lowercase() ?: ""
    val title = try {
      event.text?.joinToString(" ") { it?.toString() ?: "" }?.lowercase() ?: ""
    } catch (_: Exception) {
      ""
    }

    if (isInstaller) {
      // Uninstall dialog (and installer windows in general) while strictly locked.
      return true
    }
    if (CLASS_HINTS.any { c.contains(it) }) return true
    if (TITLE_HINTS.any { title.contains(it) }) return true
    val label = appLabel.lowercase()
    return label.isNotEmpty() && title.contains(label)
  }

  override fun onInterrupt() {}

  companion object {
    /** Compile-time kill switch for strict mode. Set to false for Play Store builds. */
    const val STRICT_MODE_ALLOWED = true

    private val SETTINGS_PKGS = setOf(
      "com.android.settings", "com.samsung.android.settings",
      "com.miui.securitycenter", "com.coloros.safecenter", "com.oplus.safecenter",
    )
    private val INSTALLER_PKGS = setOf(
      "com.android.packageinstaller", "com.google.android.packageinstaller",
      "com.samsung.android.packageinstaller", "com.miui.packageinstaller",
    )
    private val CLASS_HINTS = listOf(
      "accessibility", "usageaccess", "usagestats", "installedappdetails",
      "appinfo", "appdetails", "applicationsdetails", "uninstall",
    )
    private val TITLE_HINTS = listOf(
      "accessibility", "usage access", "usage data access", "app info", "application info",
      "uninstall",
    )
  }
}
