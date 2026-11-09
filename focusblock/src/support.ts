import { Alert, Linking } from 'react-native';

// Founder sets this before the pilot: WhatsApp number in international format, digits only,
// for example '9198XXXXXXXX'. Empty means "not set yet". No network call is made by Nope;
// tapping opens WhatsApp, which the user then controls.
export const SUPPORT_WHATSAPP = '';

export const hasSupport = () => SUPPORT_WHATSAPP.length > 0;

export function openSupport(text = 'Hi, I need help with my Nope.') {
  if (!hasSupport()) {
    Alert.alert('Support', 'Message the person who gave you your Nope puck. They can help you unlock.');
    return;
  }
  Linking.openURL(`https://wa.me/${SUPPORT_WHATSAPP}?text=${encodeURIComponent(text)}`).catch(() =>
    Alert.alert('Could not open WhatsApp', `Message us on WhatsApp at +${SUPPORT_WHATSAPP}.`),
  );
}
