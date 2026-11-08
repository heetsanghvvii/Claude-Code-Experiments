# Nope

Tap an NFC sticker to lock or unlock chosen apps. Android and iOS.

## Buy
NTAG213 NFC stickers, 13.56 MHz, ISO14443A. NTAG215 also works.

## Run (needs a dev build, Expo Go will not work)
```bash
npm install
npx expo prebuild
npx expo run:android
npx expo run:ios --device
```

## Notes
- Android: user turns on the Nope accessibility service once. Blocked apps get sent to Home.
- iOS: needs a paid Apple developer account and the Family Controls capability. Real device only.
  App Store release needs Apple approval for Family Controls distribution.
- Pairing writes a random token to the sticker. Scanning the same token toggles lock.
