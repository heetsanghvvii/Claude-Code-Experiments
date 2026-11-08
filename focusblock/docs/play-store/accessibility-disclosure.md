# Accessibility Disclosure and Play Console Declaration

Part 1 is the in-app prominent disclosure. Show it before the user is sent to the Accessibility settings screen, and do not open that screen until the user taps the affirmative button.

Part 2 holds the answers for the Play Console Accessibility API declaration.

Verify current Play policy before submitting. The wording of the Console form and the disclosure rules change over time.

---

## Part 1: In-app prominent disclosure

**Title**
Allow FocusBlock to notice which app is open

**Body**
FocusBlock needs its Accessibility service turned on for one job. When you open an app you chose to block during a Brick session, FocusBlock sends you back to your Home screen.

**What it reads**
Only the name of the app that just came to the front, such as `com.example.app`. It checks that name against your block list.

**What it does not do**
- It does not read what is on your screen or any text in other apps.
- It does not read what you type, record your taps, or collect passwords.
- It does not click or type for you. The only action it takes is pressing Home.
- It does not save or send this information. Nothing leaves your phone. FocusBlock has no account and no analytics.

**Turning it off**
You can turn this off at any time in Settings, Accessibility, FocusBlock. Blocking will stop working until you turn it back on.

**Buttons**
- Continue to Settings
- Not now

If the user taps "Not now", return to the app. Do not show the disclosure again until they try to turn on blocking again.

---

## Part 2: Play Console Accessibility API declaration

Use these answers as a draft. Check the exact option names in the Console, since they change.

**Does your app use the AccessibilityService API?**
Yes.

**Is it a core feature of your app?**
Yes. Blocking apps is the core feature. Without the service, FocusBlock cannot tell when a blocked app opens.

**Is your app an accessibility tool (an app built to help users with disabilities)?**
No. FocusBlock is a focus and app-blocking tool. It is not designed to help users with disabilities, and it should not be listed as an accessibility app.

**Why does the app need this API?**
FocusBlock needs to know, straight away, when the user opens an app on a blocked list during an active session. The service receives a window-state-changed event each time a different app comes to the front. The app checks the package name in that event against the user's block list. If it matches, the app performs the global Home action. We chose this over polling with Usage Access because the event is delivered immediately and the app does not need to keep checking in the background.

**Which events and capabilities does the service use?**
- Event type: `typeWindowStateChanged` only.
- Feedback type: generic.
- Window content retrieval: not requested. The service does not read node text or view contents.
- Gestures: none.
- Global action: `GLOBAL_ACTION_HOME` only, used when a blocked app opens.

**What data is collected or shared?**
None. The package name is used in memory on the device to make the match. It is not written to disk or sent off the device. The block list is stored only on the device.

**What happens if the user declines?**
The app keeps working as a manual lock, with blocking unavailable. The user is not forced to enable the service.

**Demo video (usually required)**
Record a short screen capture, under about 2 minutes, that shows:
1. Opening FocusBlock and choosing an app to block.
2. The in-app disclosure from Part 1, before Settings opens.
3. Turning on FocusBlock in Accessibility settings.
4. Tapping the NFC sticker to start a session.
5. Opening the blocked app, which sends the user to Home.
6. Turning the service off in Settings, which stops blocking.

**Reviewer notes (paste in the notes field)**
FocusBlock needs no login. Install the build, tap "Continue" on the disclosure, enable FocusBlock under Accessibility, and pick any app to block. Tap an NFC sticker written by the app (a sticker can be requested from the developer if needed, or use the in-app "Pair" flow with any NTAG213 sticker). Open the blocked app to see the Home redirect.

**Risk note for the developer**
Google restricts AccessibilityService for purposes other than accessibility. App-blocking apps have been rejected before. Keep the disclosure, the video, and the explanation above consistent with each other. If the review is rejected, the fallback is to rebuild blocking on Usage Access (`UsageStatsManager`), which needs a different disclosure and a user-granted permission. Verify current Play policy before deciding.
