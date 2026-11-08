// Test mode shows the "test without sticker" buttons.
// On for local dev builds and for the EAS "tester" profile (EXPO_PUBLIC_TEST_MODE=1).
// Keep it OFF for builds that go to customers.
export const TEST_MODE: boolean = __DEV__ || process.env.EXPO_PUBLIC_TEST_MODE === '1';
