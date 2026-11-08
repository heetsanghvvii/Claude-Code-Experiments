package expo.modules.appblocker

import android.app.Activity
import android.content.Intent
import android.graphics.Color
import android.graphics.Typeface
import android.os.Bundle
import android.view.Gravity
import android.view.ViewGroup
import android.widget.Button
import android.widget.LinearLayout
import android.widget.TextView

class BlockedActivity : Activity() {
  override fun onCreate(savedInstanceState: Bundle?) {
    super.onCreate(savedInstanceState)
    val dp = resources.displayMetrics.density
    val pad = (32 * dp).toInt()

    val title = TextView(this).apply {
      text = "Blocked."
      setTextColor(Color.WHITE)
      textSize = 32f
      setTypeface(typeface, Typeface.BOLD)
      gravity = Gravity.CENTER
    }
    val body = TextView(this).apply {
      text = "Blocked. Tap your Brick to unlock."
      setTextColor(Color.LTGRAY)
      textSize = 18f
      gravity = Gravity.CENTER
      setPadding(0, (12 * dp).toInt(), 0, (32 * dp).toInt())
    }
    val button = Button(this).apply {
      text = "Go Home"
      setOnClickListener { goHome() }
    }

    val root = LinearLayout(this).apply {
      orientation = LinearLayout.VERTICAL
      gravity = Gravity.CENTER
      setBackgroundColor(Color.BLACK)
      setPadding(pad, pad, pad, pad)
      layoutParams = ViewGroup.LayoutParams(
        ViewGroup.LayoutParams.MATCH_PARENT, ViewGroup.LayoutParams.MATCH_PARENT
      )
      addView(title)
      addView(body)
      addView(button)
    }
    setContentView(root)
  }

  @Deprecated("Back also goes home so the blocked app is never revealed")
  override fun onBackPressed() = goHome()

  private fun goHome() {
    startActivity(
      Intent(Intent.ACTION_MAIN)
        .addCategory(Intent.CATEGORY_HOME)
        .addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
    )
    finishAndRemoveTask()
  }
}
