# Play Console Checklist: Nope

Verify each item against current Play policy and Console screens before acting. Fees, testing rules and form wording change.

## 1. Developer account

- [ ] Create a Google Play Developer account at play.google.com/console.
- [ ] Pay the one-time registration fee. Currently US$25 (charged in INR with applicable tax). Verify the current amount.
- [ ] Choose "Personal" account type unless you have a registered business. Personal accounts need the closed testing step in section 2.
- [ ] Complete identity verification (government ID, and address details). This can take several days.
- [ ] Add a public developer contact email. It shows on the listing.

## 2. Closed testing (personal accounts)

Verify this rule, because it applies to personal accounts created after late 2023 and may have changed.

- [ ] Create a closed testing track.
- [ ] Recruit at least 12 testers who opt in with a Google account and stay opted in.
- [ ] Keep the test running continuously for 14 days.
- [ ] Only then apply for production access. Until then, you cannot publish to production.
- [ ] Testers can be friends or family. Send them the opt-in link from the track page.

## 3. Create the app and upload

- [ ] Create app: name, default language (English (India)), app or game (App), free or paid (Free).
- [ ] Enrol in Play App Signing. Keep the upload key backed up.
- [ ] Build an Android App Bundle (.aab), not an APK. Use a release build, not Expo Go or a debug dev client.
- [ ] Confirm the release manifest has the right package name (currently a placeholder, `com.yourname.focusblock`) and version code.
- [ ] Check the target API level meets the current Play requirement. Verify the current number.
- [ ] Check the release manifest does not include permissions the app does not use. Check the merged manifest after build.

## 4. Store listing

- [ ] App name, short description (80 characters), full description. Use `store-listing.md`.
- [ ] App icon (512 x 512 PNG).
- [ ] Feature graphic (verify size; commonly 1024 x 500).
- [ ] Phone screenshots (2 to 8). Use the ideas in `store-listing.md`.
- [ ] Privacy policy URL. This is required. Host `privacy-policy.md` as a web page on a public URL. It must load without login and must not be a PDF or a geo-blocked page. Check that the URL matches the link in the listing.
- [ ] Support email (`[CONTACT EMAIL]`).

## 5. Policy declarations

- [ ] **Accessibility API declaration.** Complete using Part 2 of `accessibility-disclosure.md`. Upload the demo video. Expect a manual review, and expect questions about why the Accessibility service is used.
- [ ] **In-app disclosure is live.** Confirm the disclosure from Part 1 of `accessibility-disclosure.md` shows before the Settings screen opens, in the release build. Reviewers check this in the build.
- [ ] **App access.** No login is required. Select "All functionality is available without special access".
- [ ] **Ads.** Select "No, my app does not contain ads".
- [ ] **Content rating.** Complete the IARC questionnaire under Policy, App content. Expected result: lowest rating (for example, PEGI 3, Everyone or equivalent). Answer "No" to violence, sexual content, gambling, user-generated content, and location sharing. Verify the answers when you complete it.
- [ ] **Target audience.** Choose 18 and over, or 13 and over. Do not select "Designed for Families", as that brings extra rules. Avoid child-directed content.
- [ ] **News app, COVID, government, financial features, health.** Select "No" or "Not applicable" as they apply.
- [ ] **Data safety form.** See section 6.

## 6. Data safety form (answers)

Verify wording in the Console. Answers below match the app as described in `privacy-policy.md`.

- [ ] Does your app collect or share any of the required user data types? **No.**
- [ ] Is all user data encrypted in transit? **Not applicable. No data is transmitted.** Select the option that matches the form's "no data collected" path.
- [ ] Do you provide a way for users to request data deletion? **Yes, by uninstalling the app (data is stored only on device). Add a support email if the form asks.**
- [ ] Declare on-device-only processing (no data leaves the device). Do not declare the block list or the sticker code as collected, because they are not transmitted.
- [ ] Sensitive data: none.
- [ ] Re-check the form after every release that adds a permission, an SDK, or any network call. If the app ever sends data off the device, these answers change.

## 7. Testing before release

- [ ] Install the release build on a real Android device. Confirm the minimum SDK in the merged manifest (Expo's default is 24, Android 7.0).
- [ ] Enable the Accessibility service and confirm the disclosure appears first.
- [ ] Block one app, start a session by tapping the sticker, and open the app. Confirm it goes to Home.
- [ ] Turn the service off in Settings and confirm blocking stops.
- [ ] Check the NFC scan works on a real NTAG213 sticker.
- [ ] Check the app does not crash on first launch with no sticker paired.

## 8. Submit

- [ ] Run the pre-launch report in the Console and fix any critical issues.
- [ ] Send to closed testing review, then production review after the 14-day test.
- [ ] Expect review times of several days. The Accessibility declaration may add more.
- [ ] Note the risk: app-blocking tools that use AccessibilityService are a policy-sensitive category. Keep the listing, disclosure, and demo video consistent with each other.
