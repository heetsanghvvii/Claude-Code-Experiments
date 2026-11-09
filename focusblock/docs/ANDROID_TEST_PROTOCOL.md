# Android phone test (G0 and G1)

For: the founder. Time: about 60 minutes for 3 phones, plus a 24 hour wait for check 8. Status: complete for this build. Nothing here was run on a real phone yet, so every result below must come from you.

## What you need

- 3 Android phones from 3 different brands, Android 13 or later on at least 2 of them (for example Samsung, Xiaomi or Redmi, Vivo or Realme). Note each model.
- The nope APK from EAS, built with the **tester** profile (shows the test buttons) for checks 1 to 12, and once more with the **standalone** profile to confirm the test buttons are gone.
- A real NFC sticker (NTAG213 or similar), and the printed case or a card stack about 2.3 mm thick.
- A pen and the results table at the bottom.

## Before you start

On each phone: Settings, About phone, note the brand, model and Android version. Charge to at least 50 percent. Install Instagram or YouTube to use as the "blocked app".

## The 12 checks

1. **Install and restricted settings.** Send the APK to the phone (WhatsApp or USB), open it and allow "install unknown apps" when asked. Open nope. Try to turn on blocking. On Android 13 and later the switch may be grey and say "Restricted setting". Then: Settings, Apps, nope, three dots at the top right, Allow restricted settings, enter your PIN. Go back and switch it on. **Pass:** you did it alone in under 5 minutes. Time it.
2. **Permission and Setup doctor.** On the nope home screen tap Setup doctor. **Pass:** NFC, Accessibility switch and Blocking service are green. Tap Allow next to Battery saver and follow the brand steps shown. Battery should turn green.
3. **Pair a real sticker.** Tap Puck, Pair. Hold the phone flat on the bare sticker for 2 seconds. Write the backup code on paper. **Pass:** "Paired" message within 3 tries; note where on the phone back the sweet spot is.
4. **Lock and blocked app.** Choose Instagram as a blocked app. Tap the big button and hold the phone on the sticker. Home shows LOCKED and "Blocking is working". Open Instagram. **Pass:** you are sent home and see "Blocked." within about 1 second, 5 times out of 5.
5. **Unlock.** Tap the big button and the sticker again. Open Instagram. **Pass:** it opens normally. Repeat lock and unlock 10 times on the bare sticker: count successes.
6. **NFC through the printed case.** Put the sticker inside the printed case (or under the 2.3 mm card stack). Do 10 lock or unlock taps. **Pass:** 9 of 10 or better. Also try the phone with its own cover on.
7. **Reboot.** While LOCKED, restart the phone. Unlock the screen and open Instagram. **Pass:** still blocked, and nope still shows LOCKED with no amber warning.
8. **24 hour idle.** Leave the phone LOCKED and unused for 24 hours (normal pocket use is fine, do not open nope). Then open Instagram. **Pass:** still blocked. If not, open nope and write down what the amber warning says.
9. **Rescue code.** While LOCKED tap "Lost my puck?" and type the backup code from check 3. **Pass:** "You are unlocked. Your apps work again." Type a wrong code once first: you should see the tries left and a "Message us" button.
10. **Emergency unlock.** Lock again. Tap Emergency unlock and hold the button for 10 seconds. **Pass:** unlocked, and the count drops from 2 to 1. While locked, also check that the Phone app opens and you can dial (do not call 112, just open the dialer).
11. **Usage mode fallback.** Unlock. In Setup doctor choose "Usage access (fallback)". Tap Open next to Usage access and Display over other apps, and allow both. Lock with the sticker. A small "nope is locked" notification appears. Open Instagram. **Pass:** sent home within about 1 to 2 seconds, 5 of 5. Reboot once and test again. Switch back to Accessibility when done.
12. **Strict mode (APK only).** Unlock. In Setup doctor turn on strict mode. Lock. Try to open Settings, Accessibility, and Settings, Apps, nope. **Pass:** you are sent home from both, but Wi-Fi settings and the Phone app still open. Unlock with the sticker, turn strict mode off.

Finally install the **standalone** APK on one phone. **Pass:** no "Test:" buttons anywhere.

## Results table

| Phone (brand and model) | Android version | Check | Pass or fail | Notes (time taken, taps out of 10, what you saw) |
|---|---|---|---|---|
| | | 1 Install and restricted settings | | minutes: |
| | | 2 Setup doctor all green | | |
| | | 3 Pair | | tries: |
| | | 4 Lock and blocked app | | of 5: |
| | | 5 Unlock, 10 taps bare | | of 10: |
| | | 6 Through case or 2.3 mm | | of 10: |
| | | 7 Reboot | | |
| | | 8 24 hour idle | | |
| | | 9 Rescue code | | |
| | | 10 Emergency unlock and dialer | | |
| | | 11 Usage mode | | of 5: |
| | | 12 Strict mode | | |

Copy the table once per phone.

## Pass criteria

- **G0 passes** when all 3 phones pass checks 1, 3, 4, 5 and 7, with 10 of 10 bare taps (check 5), 9 of 10 at 2.3 mm (check 6), and check 1 done by you alone in under 5 minutes.
- **Fix list** if 2 of 3 phones pass, or check 1 takes over 5 minutes: send me the table and photos of any error screen.
- **Stop** if 1 or fewer phones pass.
- Checks 8, 11 and 12 do not block G0, but they decide whether we need the Play Store version (usage mode) and must be done before the pilot ships.
- Any time the Phone app does not open while locked: stop and tell me the same day.
