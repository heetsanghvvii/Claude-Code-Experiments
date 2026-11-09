package expo.modules.appblocker

import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent

/**
 * Restarts the usage mode service after a reboot or an app update while locked.
 * (The accessibility service is restarted by Android itself.)
 * Starting a "specialUse" foreground service from BOOT_COMPLETED is believed to be allowed on
 * Android 15 (the boot restriction lists other types), UNVERIFIED on a device.
 */
class BootReceiver : BroadcastReceiver() {
  override fun onReceive(context: Context, intent: Intent?) {
    val action = intent?.action ?: return
    if (action == Intent.ACTION_BOOT_COMPLETED ||
      action == Intent.ACTION_MY_PACKAGE_REPLACED ||
      action == "android.intent.action.QUICKBOOT_POWERON"
    ) {
      BlockerCore.syncUsageService(context.applicationContext ?: context)
    }
  }
}
