# Verified Claims List (app side)

Owner: CTO. Date: 9 Nov 2026. Status: PARTIAL. Based on reading the code only; no claim below has been checked on a real phone yet. Re-check after G0 (Wed 11 Nov) and after every release build. Labels: FACT (seen in code), UNVERIFIED (needs a phone or a build check), BANNED (do not say).

## Allowed today

| Claim | Label | Evidence |
|---|---|---|
| Works on Android phones that have NFC | FACT (code), UNVERIFIED per brand | App needs NFC to read the puck; Setup doctor says so if NFC is missing. Brands untested until G0. |
| Tap the puck to lock chosen apps, tap again to unlock | FACT (code), UNVERIFIED on phone | src/useBrick.ts tap(). G0 checks 4 and 5. |
| Locking and unlocking work without internet | FACT (code) | No network calls in src/ or the native module (searched for fetch, XMLHttpRequest, WebSocket). |
| Nope has no account, no sign up and no analytics | FACT (code) | No login screen, no analytics SDK in package.json. |
| Backup code unlocks if you lose the puck | FACT (code), UNVERIFIED on phone | src/rescue.ts, Rescue screen. G0 check 9. |
| Emergency unlock, 2 a day, hold for 10 seconds | FACT (code) | src/storage.ts MAX_EMERGENCY_PER_DAY = 2, Home HOLD_SECONDS = 10. |
| Phone and emergency apps are never blocked | FACT (code), UNVERIFIED on every brand | Never-block list in src/essentials.ts and BlockerCore.kt, plus the default dialer found at runtime. OEM emergency package names are best effort. G0 check 10. |
| The share my week card only sends something when you tap Share | FACT (code) | src/screens/WeeklyCard.tsx uses the system share sheet only. |
| The app tells you when blocking has stopped | FACT (code), UNVERIFIED on phone | Home amber warning from getDiagnostics (permission plus service running). Cannot detect every OEM kill. |

## Allowed with this exact wording only

- "Nope does not send your app usage anywhere." (FACT for the app code.) Do NOT say "cannot" or "nothing can leave your phone": see INTERNET below.
- "Nope only notices which app is open." (FACT in default mode. In strict mode it also reads the title of Settings pages; strict mode is off by default and not in a Play build.)

## Banned until verified

| Claim | Why |
|---|---|
| "Nothing leaves your phone" | React Native release builds normally include the INTERNET permission in the app manifest (UNVERIFIED for our build). Our code makes no network calls, but the permission exists. Check the release APK with `aapt dump permissions` or Android Studio APK Analyzer. If INTERNET is present, the honest line is "Nope does not send your data anywhere." Sharing the week card or backup code via WhatsApp sends it through WhatsApp. |
| "Cannot be bypassed" | Emergency unlock, backup code, uninstall, safe mode and turning off the accessibility switch all bypass it. Strict mode only makes some of this harder and is APK only. |
| "Never locked out" | Lock-out is possible if the puck and code are both lost (COO rescue route is open). |
| "Works on every Android" | Untested. Some brands kill background services; phones without NFC cannot work. |
| "Blocks instantly" | Accessibility mode is believed under 1 second, usage mode about 1 to 2 seconds. UNVERIFIED until G0 checks 4 and 11. |
| "Survives reboot" or "works for days" | UNVERIFIED until G0 checks 7 and 8. |
| "On the Play Store" or "Google approved" | Not submitted. Play policy for accessibility blocking apps is a risk (UNVERIFIED outcome). |
| Any iPhone claim | iOS code exists but needs Apple Family Controls approval; not shipping. |

## Release checks before any customer build

1. TEST_MODE is off: build with the `standalone` or `production` EAS profile, not `tester` or `preview` (preview is a development client build, so test buttons show). FACT in src/testMode.ts; confirm on phone (protocol final step).
2. Strict mode compiled out for Play: set `STRICT_MODE_ALLOWED = false` in FocusAccessibilityService.kt.
3. Permissions in the merged manifest (from code, FACT): NFC, PACKAGE_USAGE_STATS, SYSTEM_ALERT_WINDOW, FOREGROUND_SERVICE, FOREGROUND_SERVICE_SPECIAL_USE, POST_NOTIFICATIONS, RECEIVE_BOOT_COMPLETED, REQUEST_IGNORE_BATTERY_OPTIMIZATIONS, plus INTERNET and others React Native and Expo add (UNVERIFIED list, check the APK).
4. Set SUPPORT_WHATSAPP in src/support.ts to the real number, or the Help button only says "message the person who gave you your puck".
