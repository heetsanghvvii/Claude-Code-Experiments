package expo.modules.appblocker

import android.accessibilityservice.AccessibilityService
import android.content.Intent
import android.content.pm.PackageManager
import android.os.SystemClock
import android.view.accessibility.AccessibilityEvent
import android.view.inputmethod.InputMethodManager

class FocusAccessibilityService : AccessibilityService() {
  private var lastHomeAt = 0L
  private var launcherPkgs: Set<String> = emptySet()
  private var imePkgs: Set<String> = emptySet()
  private var imeCheckedAt = 0L

  private val ignoredPkgs = setOf(
    "com.android.systemui", "android", "com.google.android.permissioncontroller",
    "com.android.permissioncontroller"
  )

  override fun onServiceConnected() {
    super.onServiceConnected()
    refreshLaunchers()
  }

  private fun refreshLaunchers() {
    val home = Intent(Intent.ACTION_MAIN).addCategory(Intent.CATEGORY_HOME)
    launcherPkgs = packageManager
      .queryIntentActivities(home, PackageManager.MATCH_DEFAULT_ONLY or PackageManager.MATCH_ALL)
      .map { it.activityInfo.packageName }.toSet()
  }

  private fun refreshImes() {
    val now = SystemClock.elapsedRealtime()
    if (now - imeCheckedAt < 30_000) return
    imeCheckedAt = now
    val imm = getSystemService(INPUT_METHOD_SERVICE) as? InputMethodManager
    imePkgs = imm?.enabledInputMethodList?.map { it.packageName }?.toSet() ?: emptySet()
  }

  override fun onAccessibilityEvent(event: AccessibilityEvent?) {
    if (event?.eventType != AccessibilityEvent.TYPE_WINDOW_STATE_CHANGED) return
    val pkg = event.packageName?.toString() ?: return
    if (pkg == packageName || pkg in ignoredPkgs) return

    // Ignore non-activity windows (popups, dialogs, keyboards inside apps).
    val cls = event.className?.toString()
    if (cls != null && (cls.startsWith("android.widget.") || cls.startsWith("android.view."))) return

    val prefs = getSharedPreferences(AppBlockerModule.PREFS, MODE_PRIVATE)
    if (!prefs.getBoolean(AppBlockerModule.KEY_ON, false)) return
    val blocked = prefs.getStringSet(AppBlockerModule.KEY_APPS, emptySet()) ?: emptySet()
    if (!blocked.contains(pkg)) return

    // Never act on launcher or keyboard, even if the user selected them.
    if (launcherPkgs.isEmpty()) refreshLaunchers()
    refreshImes()
    if (pkg in launcherPkgs || pkg in imePkgs) return

    // Debounce: a block already in flight produces repeat events (also covers
    // apps opened from notifications, which fire several window events).
    val now = SystemClock.elapsedRealtime()
    if (now - lastHomeAt < 500) return
    lastHomeAt = now

    performGlobalAction(GLOBAL_ACTION_HOME)
    try {
      startActivity(
        Intent(this, BlockedActivity::class.java).addFlags(
          Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TOP or
            Intent.FLAG_ACTIVITY_NO_ANIMATION
        )
      )
    } catch (_: Exception) {
      // Background-start restrictions: HOME already happened, so still safe.
    }
  }

  override fun onInterrupt() {}
}
