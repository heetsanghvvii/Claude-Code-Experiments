# nope Setup Guide (for someone who is not technical)

Owner: CCO. Date: 9 Nov 2026. Status: DRAFT, never tested on a real phone.

Labels: **[F]** fact, **[A]** assumption, **[U]** unverified.

IMPORTANT: Every menu name below is approximate and unverified [U]. Phone makers rename menus with every update. Before this guide goes to a customer, someone must follow it on a real phone of each brand and fix the words and screenshots. Where a step says "look for something like", that is the honest level of certainty.

Time needed: about 10 minutes. You need your phone, your nope puck, and Wi-Fi.

---

## Before you start (1 minute)

1. Your phone must be Android. nope does not work on iPhone [F].
2. Your phone must have NFC. Check: open Settings, tap the search bar, type "NFC". If you see an NFC setting, you have it. If nothing appears, see "My phone has no NFC" at the end.
3. Turn NFC on. Swipe down from the top of the screen and look for an NFC icon, or find it in Settings.
4. Take off any thick or metal phone cover if the tap does not work later.

---

## Step 1: Get the app on your phone

nope is not on the Play Store yet, so your phone will ask you to approve it. This is normal [F: Phase 1 is a direct APK install]. It is safe because we sent you this link ourselves. If you did not get the link from us, do not install it.

1. Open the link we sent you on WhatsApp. It starts the download.
2. Your phone may say "this type of file can harm your device". Tap "Download anyway" or "OK". [U: exact words vary]
3. Open the downloaded file. You can find it in the notification, or in your Files app, inside "Downloads".
4. Your phone may say "For your security, your phone is not allowed to install unknown apps from this source". Tap "Settings", then switch on "Allow from this source". Press the back button and tap "Install". [U]
5. If a Google Play Protect box appears, tap "More details", then "Install anyway". [U]
6. Tap "Open".

If you are stuck here, send us a screenshot on WhatsApp. This is the step where most people need help, and it is our job to help.

---

## Step 2: Allow blocking (the permission)

nope needs one permission. It is called "Accessibility". Android uses that word for lots of things. For nope it only means: "notice which app just opened, so I can send you to the Home screen." It cannot read your messages, passwords or what is on the screen. [F: matches the in-app explanation and docs/play-store/accessibility-disclosure.md. Nothing leaves your phone.]

1. In nope, tap "Allow", then read the screen, then tap "Allow in Settings".
2. Your phone opens a list. Look for "Installed apps" or "Downloaded apps". Tap "nope".
3. Switch it on. Tap "Allow" or "OK" on the warning box.
4. Press back until you are in nope again. The row should say "Done".

### If the switch is grey, or says "Restricted setting" (Android 13 and newer) [U]

Android blocks this switch for apps installed from outside the Play Store. You must unlock it first. This takes 1 minute.

1. Press the Home button. Long press the nope app icon, then tap "App info" (or the small "i").
2. Tap the three dots in the top right corner.
3. Tap "Allow restricted settings". You may need to enter your PIN or fingerprint. [U: the name and where the dots are can differ by phone and Android version.]
4. Go back to Step 2 and switch nope on.

If you do not see the three dots: first try to turn the switch on once (it will show a message), then go back to App info. The three dots often only appear after that first try. [U]

---

## Step 3: Choose your apps

1. Tap "Choose apps".
2. Pick only 2 or 3 apps for your first week, the ones that waste the most of your time. Starting small works better than blocking everything.
3. Apps like Phone, messages and payment apps may show "Keep reachable" or "Always allowed for safety". That is on purpose, so you are never locked out of calls.
4. There is a switch "Also block web browsers while locked". If it is on, Chrome is blocked too, so Instagram.com cannot be used as a loophole. It also blocks Chrome for everything else. Choose what you prefer.
5. Tap "Done".

---

## Step 4: Pair your puck

1. Tap "Pair". Hold the back of your phone against the puck. Hold still for 2 seconds.
2. Where to touch: the NFC spot is usually near the top middle or the middle of the back of the phone [U: varies]. If nothing happens, slide the phone slowly over the puck.
3. A screen shows your BACKUP CODE. This is very important.
   - Write it on the backup code card in your box, right now, with a pen.
   - Take a photo only if it is a photo you will not lose.
   - The code is shown only once.
4. Tap "I saved it".

Tip: The backup code can unlock your apps without the puck. So do not leave it in a place you will look at in a weak moment. Ask a trusted person to keep a photo of it, or keep it in a bag you do not open.

---

## Step 5: Your first lock (5 minutes, do not skip)

1. Tap the big button, or tap your phone on the puck. It should say LOCKED.
2. Try opening one of your chosen apps. You should be sent to the Home screen. That is nope working.
3. Tap your phone on the puck again. It says UNLOCKED. Open the app. Good.
4. Now put the puck in another room. Use the "leave it in another room" ritual on your card.

---

## Battery settings (so nope does not get switched off)

Many phones stop apps running in the background to save battery. If that happens, nope stops blocking without telling you. This is the second most common problem [F: named as a risk in the plan]. Do this once.

All menu names below are APPROXIMATE and UNVERIFIED [U]. Use the phone search bar in Settings and type "battery" or "autostart" if you cannot find them.

**Every phone, first:** Settings, Apps, nope, Battery. Choose "Unrestricted" or "No restrictions" or "Don't optimise". [U]

### Xiaomi, Redmi, Poco (MIUI or HyperOS)
1. Settings, Apps, Manage apps, nope. [U]
2. Turn on "Autostart".
3. Tap "Battery saver" (or "Battery usage"), choose "No restrictions".
4. Open the recent apps screen, find nope, press and hold the card, and tap the lock icon so it stays. [U]

### Samsung (One UI)
1. Settings, Battery (or "Battery and device care"), Background usage limits. [U]
2. Remove nope from "Sleeping apps" and "Deep sleeping apps".
3. Turn off "Put unused apps to sleep" for nope (Settings, Apps, nope, Battery).
4. Add nope to "Never sleeping apps".

### Vivo (Funtouch OS or OriginOS)
1. Settings, Battery, Background power consumption management (name varies). [U]
2. Find nope, choose "Allow high background power consumption".
3. Also look for "Autostart" (Settings, Apps, Autostart) and turn it on for nope.

### Oppo and Realme (ColorOS or Realme UI)
1. Settings, Battery, scroll to the app list, tap nope, turn off "Optimise battery use" and turn on "Allow background activity". [U]
2. Settings, Apps, App management, nope, "Allow auto-launch" (or "Autostart") on.
3. In the recent apps screen, pull nope down or tap the lock to keep it. [U]

### OnePlus (OxygenOS)
1. Settings, Battery, Battery optimisation. Tap nope, choose "Don't optimise". [U]
2. Settings, Apps, nope, Battery, "Allow background activity". [U]
3. Lock the app in the recent apps screen.

### Motorola
1. Settings, Apps, nope, Battery. Choose "Unrestricted" or "Not optimised". [U]
2. Turn off "Adaptive Battery" for nope if the option exists. [U]
3. Motorola is close to plain Android, so there are usually fewer steps.

### Google Pixel
1. Settings, Apps, nope, App battery usage, choose "Unrestricted". [U]
2. Settings, Apps, nope, uncheck "Pause app activity if unused". [U]

After any big phone update, open nope and check the "Allow blocking" row still says Done. Updates sometimes switch permissions off [U].

---

## My phone has no NFC

You have three honest options. Do not guess. Send us a WhatsApp message with your phone model.

1. **Check again.** Some phones hide NFC under "Connection and sharing", "Connected devices" or "Wireless and networks". Search Settings for "NFC" and for "tap". [U]
2. **Refund.** The puck needs NFC to work. If your phone has none, we give a full refund. Ask before you pay if you can, which is why the website asks you to check first.
3. **Borrow or switch.** The puck pairs to one phone. If someone at home has an NFC phone, it can work there, but it will not lock your own phone. If you later buy a phone with NFC, we can help you pair again.

We do not have a no-NFC product [F: Phase 1 uses NFC only]. Do not promise one.

---

## Script for the founder setup video (about 2 minutes)

Film in one take on a real phone with a screen recording. Smile, speak slowly. About 300 words. Hindi, English or Hinglish versions are worth making [A].

**0:00 to 0:15, hello.**
"Hi, I am [name]. I made nope. This video takes two minutes and gets you from the box to your first lock. If you get stuck at any point, message me on WhatsApp. I will reply, I promise."

**0:15 to 0:35, what you need.**
"You need an Android phone with NFC. Check that in Settings, search NFC. And you need your puck. Put your phone on Wi-Fi."

**0:35 to 1:00, install.**
"Open the link on your card. Your phone will warn you about installing outside the Play Store. That warning is normal for now. We are a small team and are working on the Play Store. Tap Download anyway, then Install."

**1:00 to 1:25, the permission.**
"Now the scary bit. nope asks for Accessibility. It only does one thing with it: when you open an app you chose to block, it sends you to the Home screen. It cannot read your messages or passwords. Nothing leaves your phone. If your phone says restricted setting, I will show you the fix on the screen now." (Show App info, three dots, Allow restricted settings.)

**1:25 to 1:40, apps and backup code.**
"Pick only two or three apps to start. Then pair your puck by holding the phone against it. You will see a backup code. Write it on the card in the box. It is only shown once."

**1:40 to 2:00, first lock and the ritual.**
"Tap the puck. It says locked. Open Instagram. See? It sends you home. Tap again to unlock. Now the important part: put the puck in another room. That one walk is the whole idea. Message me tomorrow and tell me how day one went. Thank you for trusting a tiny company."

Do not say in the video: "guaranteed", "cure", "addiction", or that this has proven results [F: we have no results].
