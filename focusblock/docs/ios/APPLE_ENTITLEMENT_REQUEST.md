# Apple Family Controls entitlement: request pack

Status: DRAFT. Not submitted. Needs a paid Apple Developer account first.
UNVERIFIED: exact form name and URL. Search developer.apple.com for "Family Controls" request when enrolled.
UNVERIFIED: development builds on your own iPhone may work before approval.

## Fix before submitting
- Bundle ID in app.json is a placeholder (com.yourname.focusblock). Pick final one, for example in.getnope.app (needs domain).
- Entitlement is needed on the app and on any extension target.
- Privacy policy and support page must be live on a public URL (landing/privacy.html is a draft).

## Request text (paste into the form)

App name: nope
Developer: <legal name or business name>
Platform: iPhone (iOS 16+)
Entitlement: com.apple.developer.family-controls (Distribution)

Summary:
nope is a self-control app for adults. The user chooses which apps to lock for themselves. They place a small NFC tag (the nope puck) somewhere away from their phone. Tapping the phone on the puck turns focus mode on and the chosen apps are shielded. Tapping again turns it off.

Why we need Family Controls:
We use the FamilyControls authorization (individual, .individual member) with FamilyActivityPicker so the user picks their own apps, and ManagedSettings to shield those apps while focus mode is on. There is no other way to restrict apps on iOS.

What we do not do:
- No parental control and no monitoring of other people.
- No collection of app usage, selections or Screen Time data. The picker selection stays on the device. We have no servers or accounts.
- No advertising or tracking.
- The user can turn off focus mode at any time through the app (emergency unlock) and can remove authorization in iOS Settings.

User consent:
The system authorization prompt is shown before any restriction. NSFamilyControlsUsageDescription explains the purpose in plain words.

Links: <website>, <privacy policy>, <support email>
Test access: TestFlight build and a short screen recording of the flow on request.

## Attach
1. 60 second screen recording: authorize, pick apps, tap tag, apps shielded, tap again, unlocked (needs working iOS build).
2. Link to live privacy policy.
3. Link to live site showing the product.

## Odds (honest)
No guarantee. Vague or kids/monitoring wording gets rejected. A working demo plus clear self-control wording is the best lever. A freelancer who has had this approved can review the text, but cannot influence Apple.
