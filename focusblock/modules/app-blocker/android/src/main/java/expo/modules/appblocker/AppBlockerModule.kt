package expo.modules.appblocker

import android.content.ComponentName
import android.content.Context
import android.content.Intent
import android.provider.Settings
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition

class AppBlockerModule : Module() {
  companion object {
    const val PREFS = "focusblock"
    const val KEY_ON = "on"
    const val KEY_APPS = "apps"
  }

  private val ctx: Context
    get() = appContext.reactContext ?: throw IllegalStateException("No context")

  private fun prefs() = ctx.getSharedPreferences(PREFS, Context.MODE_PRIVATE)

  private fun serviceEnabled(): Boolean {
    val me = ComponentName(ctx, FocusAccessibilityService::class.java).flattenToString()
    val enabled = Settings.Secure.getString(
      ctx.contentResolver, Settings.Secure.ENABLED_ACCESSIBILITY_SERVICES
    ) ?: return false
    return enabled.split(':').any { it.equals(me, ignoreCase = true) }
  }

  override fun definition() = ModuleDefinition {
    Name("AppBlocker")

    AsyncFunction("hasPermission") { serviceEnabled() }

    AsyncFunction("requestPermission") {
      val i = Intent(Settings.ACTION_ACCESSIBILITY_SETTINGS).addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
      ctx.startActivity(i)
      serviceEnabled()
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
      prefs().edit().putStringSet(KEY_APPS, ids.toSet()).apply()
    }

    AsyncFunction("pickApps") { -1 }

    Function("setBlocking") { on: Boolean ->
      prefs().edit().putBoolean(KEY_ON, on).apply()
    }

    Function("isBlocking") { prefs().getBoolean(KEY_ON, false) }
  }
}
