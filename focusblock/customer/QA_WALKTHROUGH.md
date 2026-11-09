# QA Walkthrough: Real Screens in src/screens

Owner: CCO. Date: 9 Nov 2026. For: CTO and Creative head.

Method: I read the code of Home, Onboarding, PermissionExplainer, AppPicker, BackupCode and Rescue [F]. I did NOT run the app on a phone. Anything about runtime behaviour (for example what happens when returning from Settings) is [U] and needs a test.

Severity: **High** = likely to make someone quit, get locked out or feel unsafe. **Med** = confusing, slows people. **Low** = polish.

---

## Findings

| # | Screen | Issue | Severity | Suggested rewrite or fix |
|---|---|---|---|---|
| 1 | All | "Sticker" is used in Onboarding, Home ("Hold near sticker...", "Pair sticker"), BackupCode and Rescue, but the customer owns a "puck" and Home says "Lost my puck?". Mixed words confuse. | High | Use "puck" everywhere in customer text. "Pair your puck", "Hold your phone near the puck", "Tap to scan your puck". |
| 2 | Onboarding step 1 | "Allow blocking: Nope needs permission to block distracting apps while you are locked in." Does not warn that Android will open a scary Accessibility settings screen, nor mention the restricted setting step on Android 13+. | High | "Next, Android will open a settings page. Find nope in the list and switch it on. This is the only permission nope needs. If the switch is grey, tap Need help for a 1 minute fix." Add a "Need help" link to the guide. |
| 3 | PermissionExplainer | Good content, but the heading "Why Android calls it accessibility" is placed last and the first line is "What Nope can see". A nervous user reads "see" and stops. Also the three boxes do not say the switch may be grey. | High | Reorder: 1) "Why Android calls this accessibility", 2) "What Nope never does", 3) "What Nope can see". Change "can see" to "can notice". Add a 4th box: "If the switch is grey: App info, three dots, Allow restricted settings." |
| 4 | PermissionExplainer | "Allow in Settings" opens Android settings. No confirmation when they return; [U] whether the row updates to Done automatically. If it does not, user thinks it failed. | High | After return, show a visible check: "Permission on. Nice." If still off: "Not on yet. Did the switch turn blue?" with a retry button. |
| 5 | PermissionExplainer | "Not now" is a dead end: goes back, no message about what is lost, easy to leave setup stuck at step 1. | Med | "Not now" returns with a gentle line: "Nope cannot block until this is on. You can finish any time from the home screen." |
| 6 | Onboarding | "Step 1 of 3" has no "Skip" or "Back" button. Cannot return to a previous step. If permission is already done, the user is pushed through anyway. | Med | Add Back. If a step is already done, show a tick and "Next" straight away. |
| 7 | Onboarding step 2 | "Pick the apps you want blocked during a focus session." Does not suggest starting small. Users may choose none (Next stays hidden until at least 1 is chosen, which is correct) or too many. | Med | "Pick 2 or 3 apps that waste the most time. You can change this any time." |
| 8 | Onboarding step 3 | "Hold an NFC sticker to the back of your phone." No hint where the NFC spot is; no troubleshooting; busy state shows "Hold near sticker..." with no timeout or cancel. [U] what happens if NFC is off or the phone has none. | High | "Hold the back of your phone against the puck. Keep still for 2 seconds. Nothing happening? Slide it slowly, or turn on NFC in Settings." Show a clear error if NFC is off ("NFC is off. Tap to open settings") and if unsupported ("This phone has no NFC. See help"). Add a Cancel button and 15 second timeout. |
| 9 | Onboarding | No first lock rehearsal after pairing. The flow ends at Finish; user has no idea what happens next. This is where "aha" or confusion happens (journey stage 8). | High | Add step 4 "Try it": "Tap your puck to lock. Now open one of your apps. Tap the puck again to unlock." Confirm success with a tick. Add the "leave the puck in another room" tip as the last card. |
| 10 | BackupCode | Shown once, then gone. Body is clear, but "Write it down, or save it in a password manager" omits the bypass risk: a code saved in Notes next to the blocked app defeats the purpose. | Med | "This code unlocks your apps without the puck. Write it on the card in the box, or give it to someone you trust. Do not keep it where you will see it on a bad night." |
| 11 | BackupCode | "I saved it" is one tap with no check; no "Are you sure?" The code is gone forever on tap. If the person saves nothing, a lost puck leads to lockout. | High | Confirm dialog: "You will not see this again. Did you write it down?" with "Show again" and "Yes, I wrote it". Or require retyping 2 characters of the code. |
| 12 | BackupCode | "Send it to myself" uses the OS share sheet, which may put the code in WhatsApp or Gmail, both reachable by the person on a bad night, and stored on servers. | Low | Keep, but add the line "Sharing sends it through that app. Only share it with yourself or someone you trust." |
| 13 | BackupCode | Body says "If you ever lose or damage your sticker". Placeholder in Rescue shows "XXXXX-XXXXX". Good. But no mention of how many characters or that it is case insensitive. | Low | "Your code has 10 letters and numbers. Case does not matter." |
| 14 | Home | Big button text: UNLOCKED / LOCKED with sub-text "Tap to scan your Nope". Pressing it scans the puck. A first-time user may think pressing the button locks or unlocks by itself. | High | UNLOCKED state: "Tap your phone on the puck to lock". LOCKED: "Tap your phone on the puck to unlock". Use "puck", not "Nope". |
| 15 | Home | "Allow blocking: Allow" is a button labelled the same as its state. If the permission later gets switched off by a phone update, "Allow" with no explanation looks like first time setup, not a warning. | High | When permission is lost: red banner "Blocking is off. Nope is not protecting you. Tap to fix." Also warn if a battery restriction is detected [U if possible]. |
| 16 | Home | No indicator that the service is actually running. If the phone kills it, the screen still shows LOCKED. This is a trust-killer: the user opens Instagram while "LOCKED". | High | Add a health line "Blocking is working" with a green dot and check the service status on open. If unhealthy: "Blocking stopped. Tap to fix." (CTO decision, see CCO report.) |
| 17 | Home | Two links to "lost": a hint after 24 hours and a permanent "Lost my puck?" text. A permanent link is visible every day and lowers friction to bypass. Product trade-off. | Med | Keep the safety net but make it quieter (small text at the bottom). Add a short wait or confirmation before showing the code entry. Decide with CPO. |
| 18 | Home | "Emergency unlock: 2 of 2 left today", hold 10 seconds. Two a day is a lot for something the user is supposed to avoid, and nothing explains what an emergency is. | Med | Rewrite: "For real emergencies. 2 a day. Hold for 10 seconds." Show how many they used this week (on the phone only). Decision for CPO on 2 versus 1 and the cooldown. |
| 19 | Home | After emergency unlock the user likely stays unlocked indefinitely [U]. | Med | Auto relock after a set time (for example 15 minutes), with a notification. CTO and CPO to confirm. |
| 20 | Home | Stats: "Focused today" and "Day streak" with no definition. How is a "day" counted? Does an emergency unlock break the streak? A broken streak with no explanation causes quitting. | Med | Tap to explain: "A streak day = locked for at least X hours." Show "Streak paused, not lost" for one missed day (CPO). |
| 21 | Home | Rows "Allow blocking / Choose apps / Sticker (Pair or Re-pair)": "Re-pair" is scary. It may break the old backup code. | Med | "Re-pair" confirm dialog: "Pairing a new puck gives you a new backup code. Your old code will stop working." (check with CTO that this is the behaviour). |
| 22 | Home | TEST_MODE rows ("Test: pair without sticker") look like dev leftovers. If TEST_MODE is true in a customer build, anyone can bypass the puck. [U] | High | CTO to confirm TEST_MODE is false in release builds, and add a check in the release checklist. |
| 23 | AppPicker | Browser switch note: "Stops Instagram.com and YouTube.com in Chrome. Also blocks Chrome for everything else." Scary and unclear: user fears losing the browser while locked, including for OTPs and bank links. | High | "Blocks Chrome and other browsers while locked, so you cannot open Instagram or YouTube in a browser. You will not be able to browse the web until you unlock." Default state: CPO decision, on may cause lock-out fear. |
| 24 | AppPicker | Alert text "Keep reachable? This could lock you out of calls or payments. Block anyway?" is useful, but "Block anyway" is the destructive action in red with no explanation of how to undo. | Med | "This app may be needed for calls, payments or emergencies. Block it anyway? You can change this any time when unlocked." |
| 25 | AppPicker | Cannot change the app list while locked? [U]. If it can be edited while locked, user can remove Instagram from the list and defeat the lock. If it cannot, there is no message why. | High | Disable editing while locked, with a visible line: "Unlock first to change apps." |
| 26 | AppPicker | "Always allowed for safety" for some apps with a greyed switch, but which apps and why is not stated. | Low | Tap the tag to see: "Phone, Messages and emergency apps stay open so you can always call for help." |
| 27 | AppPicker | No search; with 100+ apps the list is hard to use. | Med | Add a search box and "Suggested: Instagram, YouTube, Facebook" at the top. |
| 28 | Rescue | Title "Lost my puck?" but body "the 10 character backup code you saved when you paired your sticker". Mixed words (see #1). | Med | "Enter the 10 character backup code you wrote down when you paired your puck." |
| 29 | Rescue | Error "That code does not match. 3 of 5 tries left." After 5 tries: cooldown for 10 minutes, "Please wait 10 minutes". A person locked out at 11 pm, panicking, gets no way to contact us. | High | Add under the error: "Still stuck? Message us on WhatsApp [number]." Add an in-app "Message support" button that opens WhatsApp. |
| 30 | Rescue | "nobackup" message: "No backup code was set up on this phone." No next step. If the user reinstalls the app or clears data, they lose the code AND the pairing state; if the lock persists in a service [U], they could be locked out. | High | "No backup code was found. If you reinstalled nope or cleared its data, message us: [WhatsApp]." Test the reinstall case on a real phone. |
| 31 | Rescue | Unlock success screen: "You are unlocked. If your sticker is gone for good, you can pair a new one now." No confirmation that apps are actually unblocked. | Low | "You are unlocked. Your apps work again." |
| 32 | Rescue | The Rescue footer line "Not lost, just stuck? You can also use an emergency unlock from the home screen." is good, but only if emergency unlocks are left. Otherwise silent. | Low | When none left: "No emergency unlocks left today. They reset at midnight." (confirm reset time). |
| 33 | All | No empty or error states are visible in the code for NFC off, NFC unsupported, tag not recognised, or a tag that is not a nope tag. [U] may exist elsewhere in useBrick or nfc code. | High | Add plain messages for each: "NFC is off", "This phone has no NFC", "That is not a nope puck", "Could not read, try again". |
| 34 | All | No help or contact anywhere in the app. | High | Add "Help" in Home: setup guide link, WhatsApp support, and the permission explainer again. |
| 35 | All | Language: English only. Many target users prefer Hindi or Hinglish [A]. | Low | Plan Hindi strings after the English copy stabilises. |
| 36 | Home | Everything is dark and the LOCKED state is red (c.danger). Red for a state the user chose can feel like punishment or an error. | Low | Use a calm colour for LOCKED (for example green or the brand colour). Creative head to decide. |
| 37 | All | Accessibility of the app itself: unlabelled buttons, text sizes, contrast [U, not tested]. Ironic if an app that needs the accessibility service is hard to use for someone with low vision. | Low | Run a TalkBack and large font pass before launch. |

---

## Scary moments, in order of how many people they affect

1. Permission screen and restricted setting (items 2, 3, 4).
2. First pairing with nothing happening (item 8).
3. Backup code shown once and dismissed (item 11).
4. "LOCKED" while blocking has quietly stopped (items 15, 16).
5. Locked out with a wrong code and no support (items 29, 30).

## Top 5 fixes to do first (my ranking)

1. Add a first lock rehearsal after pairing (item 9).
2. Show blocking health and permission-lost banner (items 15, 16).
3. Reword permission flow and add restricted setting help (items 2, 3, 4).
4. Add NFC off, no NFC and read failure messages (items 8, 33).
5. Add support contact in Rescue and Home (items 29, 30, 34).
