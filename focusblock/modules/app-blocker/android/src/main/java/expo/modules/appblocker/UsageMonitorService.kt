package expo.modules.appblocker

import android.app.Notification
import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.app.Service
import android.app.usage.UsageEvents
import android.app.usage.UsageStatsManager
import android.content.Context
import android.content.Intent
import android.content.pm.ServiceInfo
import android.os.Build
import android.os.Handler
import android.os.IBinder
import android.os.Looper
import android.os.PowerManager
import android.os.SystemClock
import android.util.Log

/**
 * FALLBACK detection mode ("usage"). Used when the accessibility route is not possible
 * (Play policy review, or restricted settings on sideloaded installs).
 *
 * A foreground service polls UsageStatsManager about every 650 ms to find the app in front.
 * When a blocked app is in front it sends the user Home and shows BlockedActivity. Starting
 * activities from the background needs the "Display over other apps" (SYSTEM_ALERT_WINDOW)
 * permission, which is a background activity start exemption.
 *
 * Foreground service type is "specialUse" (targetSdk 34+ requires a type). Play requires a
 * declaration in Play Console for specialUse (UNVERIFIED for this use case; check before upload).
 */
class UsageMonitorService : Service() {
  companion object {
    private const val TAG = "NopeUsageMonitor"
    const val CHANNEL_ID = "nope_focus_monitor"
    const val NOTIF_ID = 4711
    const val POLL_MS = 650L
    /** Do not re-act on the same app without a new foreground event for this long. */
    const val SAME_APP_REACT_MS = 2_000L

    fun start(ctx: Context) {
      try {
        val i = Intent(ctx, UsageMonitorService::class.java)
        if (Build.VERSION.SDK_INT >= 26) ctx.startForegroundService(i) else ctx.startService(i)
      } catch (e: Exception) {
        // e.g. ForegroundServiceStartNotAllowedException when started from the background.
        Log.w(TAG, "start failed", e)
      }
    }

    fun stop(ctx: Context) {
      try {
        ctx.stopService(Intent(ctx, UsageMonitorService::class.java))
      } catch (e: Exception) {
        Log.w(TAG, "stop failed", e)
      }
    }
  }

  private val handler = Handler(Looper.getMainLooper())
  private var running = false
  private var lastQueryEnd = 0L
  private var lastSeenTs = 0L
  private var fgPkg: String? = null
  private var lastActedPkg: String? = null
  private var lastActedAt = 0L

  private val tick = object : Runnable {
    override fun run() {
      try {
        poll()
      } catch (e: Exception) {
        Log.w(TAG, "poll failed", e)
      }
      if (running) handler.postDelayed(this, POLL_MS)
    }
  }

  override fun onBind(intent: Intent?): IBinder? = null

  override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
    // startForeground must be called quickly after startForegroundService, even if we stop
    // right after, or Android kills the app.
    if (!goForeground()) {
      stopSelfSafely()
      return START_NOT_STICKY
    }
    if (!BlockerCore.shouldRunUsageService(this)) {
      stopSelfSafely()
      return START_NOT_STICKY
    }
    BlockerCore.usageAlive = true
    BlockerCore.beat(this, force = true)
    if (!running) {
      running = true
      lastQueryEnd = 0L
      handler.post(tick)
    }
    return START_STICKY
  }

  override fun onDestroy() {
    BlockerCore.usageAlive = false
    running = false
    handler.removeCallbacks(tick)
    super.onDestroy()
  }

  private fun stopSelfSafely() {
    BlockerCore.usageAlive = false
    running = false
    handler.removeCallbacks(tick)
    try {
      // minSdk is 24, so the int overload is always available.
      stopForeground(Service.STOP_FOREGROUND_REMOVE)
    } catch (_: Exception) {
    }
    stopSelf()
  }

  private fun goForeground(): Boolean = try {
    val n = buildNotification()
    if (Build.VERSION.SDK_INT >= 34) {
      startForeground(NOTIF_ID, n, ServiceInfo.FOREGROUND_SERVICE_TYPE_SPECIAL_USE)
    } else {
      startForeground(NOTIF_ID, n)
    }
    true
  } catch (e: Exception) {
    Log.w(TAG, "startForeground failed", e)
    false
  }

  @Suppress("DEPRECATION")
  private fun legacyBuilder(): Notification.Builder =
    Notification.Builder(this).setPriority(Notification.PRIORITY_LOW)

  private fun buildNotification(): Notification {
    val builder = if (Build.VERSION.SDK_INT >= 26) {
      try {
        val nm = getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
        val ch = NotificationChannel(CHANNEL_ID, "Nope focus", NotificationManager.IMPORTANCE_LOW)
        ch.description = "Shows while Nope is locked in usage access mode."
        ch.setShowBadge(false)
        nm.createNotificationChannel(ch)
      } catch (_: Exception) {
      }
      Notification.Builder(this, CHANNEL_ID)
    } else {
      legacyBuilder()
    }
    builder
      .setSmallIcon(android.R.drawable.ic_lock_idle_lock)
      .setContentTitle("Nope is locked")
      .setContentText("Your chosen apps are blocked until you tap your Nope.")
      .setOngoing(true)
      .setShowWhen(false)
    try {
      val launch = packageManager.getLaunchIntentForPackage(packageName)
      if (launch != null) {
        val pi = PendingIntent.getActivity(
          this, 0, launch,
          PendingIntent.FLAG_IMMUTABLE or PendingIntent.FLAG_UPDATE_CURRENT
        )
        builder.setContentIntent(pi)
      }
    } catch (_: Exception) {
    }
    return builder.build()
  }

  @Suppress("DEPRECATION")
  private fun poll() {
    if (!BlockerCore.shouldRunUsageService(this)) {
      stopSelfSafely()
      return
    }
    // Screen off: nothing can be in front, save battery.
    BlockerCore.beat(this)
    val power = getSystemService(Context.POWER_SERVICE) as? PowerManager
    if (power != null && !power.isInteractive) return

    val usm = getSystemService(Context.USAGE_STATS_SERVICE) as? UsageStatsManager ?: return
    val now = System.currentTimeMillis()
    // Small overlap so events reported late are not missed. lastSeenTs keeps order.
    val begin = if (lastQueryEnd == 0L) now - 60_000L else lastQueryEnd - 2_000L
    val events = usm.queryEvents(begin, now) ?: return
    val e = UsageEvents.Event()
    var sawNew = false
    while (events.hasNextEvent()) {
      events.getNextEvent(e)
      // MOVE_TO_FOREGROUND has the same value as ACTIVITY_RESUMED on Android 10 and later.
      if (e.eventType == UsageEvents.Event.MOVE_TO_FOREGROUND && e.timeStamp >= lastSeenTs) {
        if (e.timeStamp > lastSeenTs || e.packageName != fgPkg) sawNew = true
        lastSeenTs = e.timeStamp
        fgPkg = e.packageName
      }
    }
    lastQueryEnd = now

    val pkg = fgPkg ?: return
    if (!BlockerCore.isUserBlocked(this, pkg)) return

    val t = SystemClock.elapsedRealtime()
    if (!sawNew && pkg == lastActedPkg && t - lastActedAt < SAME_APP_REACT_MS) return
    if (!BlockerCore.tryBeginBlock()) return
    lastActedPkg = pkg
    lastActedAt = t
    BlockerCore.blockNow(this, null)
  }
}
