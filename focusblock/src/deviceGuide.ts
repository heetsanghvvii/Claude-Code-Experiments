// Brand specific setup help for the Setup doctor screen.
// ALL menu names below are APPROXIMATE and UNVERIFIED. They change between OS versions,
// regions and languages. Test on a real phone before telling customers they are exact.

export type Guide = { name: string; steps: string[] };

const GENERIC: Guide = {
  name: 'Your phone',
  steps: [
    'Open Settings, then Apps, then Nope.',
    'Tap Battery (or App battery usage).',
    'Choose Unrestricted (or Do not optimise).',
    'If there is an Autostart or Background activity switch, turn it on.',
  ],
};

const GUIDES: { match: string[]; guide: Guide }[] = [
  {
    match: ['xiaomi', 'redmi', 'poco'],
    guide: {
      name: 'Xiaomi, Redmi or Poco (HyperOS or MIUI)',
      steps: [
        'Open Settings, then Apps, then Manage apps, then Nope.',
        'Turn on Autostart.',
        'Tap Battery saver (or Battery) and choose No restrictions.',
        'Open recent apps, long press Nope and tap the lock icon so it is not cleared.',
      ],
    },
  },
  {
    match: ['samsung'],
    guide: {
      name: 'Samsung (One UI)',
      steps: [
        'Open Settings, then Apps, then Nope, then Battery.',
        'Choose Unrestricted.',
        'Open Settings, then Battery, then Background usage limits.',
        'Make sure Nope is not in Sleeping apps or Deep sleeping apps. Add it to Never sleeping apps.',
      ],
    },
  },
  {
    match: ['vivo', 'iqoo'],
    guide: {
      name: 'Vivo or iQOO (Funtouch OS or OriginOS)',
      steps: [
        'Open Settings, then Battery, then Background power consumption management.',
        'Find Nope and choose Allow background high power consumption (or Don\'t restrict).',
        'Open Settings, then Apps, then Autostart (or i Manager, App manager) and allow Nope.',
        'In recent apps, pull down on Nope to lock it.',
      ],
    },
  },
  {
    match: ['oppo'],
    guide: {
      name: 'Oppo (ColorOS)',
      steps: [
        'Open Settings, then Apps, then App management, then Nope.',
        'Tap Battery usage and turn on Allow background activity and Allow auto launch.',
        'In recent apps, tap the menu on Nope and choose Lock.',
      ],
    },
  },
  {
    match: ['realme'],
    guide: {
      name: 'Realme (Realme UI)',
      steps: [
        'Open Settings, then Apps, then App management, then Nope.',
        'Tap Battery usage and turn on Allow background activity and Allow auto launch.',
        'In recent apps, tap the menu on Nope and choose Lock.',
      ],
    },
  },
  {
    match: ['oneplus'],
    guide: {
      name: 'OnePlus (OxygenOS)',
      steps: [
        'Open Settings, then Apps, then App management, then Nope.',
        'Tap Battery usage and turn on Allow background activity.',
        'Open Settings, then Battery, then Battery optimisation, and set Nope to Don\'t optimise.',
        'In recent apps, tap the menu on Nope and choose Lock.',
      ],
    },
  },
  {
    match: ['motorola', 'moto'],
    guide: {
      name: 'Motorola',
      steps: [
        'Open Settings, then Apps, then Nope, then App battery usage.',
        'Choose Unrestricted.',
        'Check that Allow background usage is on.',
      ],
    },
  },
  {
    match: ['google'],
    guide: {
      name: 'Google Pixel',
      steps: [
        'Open Settings, then Apps, then Nope, then App battery usage.',
        'Choose Unrestricted.',
      ],
    },
  },
];

export function batteryGuide(manufacturer: string, brand: string): Guide {
  const m = `${manufacturer} ${brand}`.toLowerCase();
  for (const g of GUIDES) if (g.match.some((k) => m.includes(k))) return g.guide;
  return GENERIC;
}

/**
 * Android 13 and later block accessibility (and some other settings) for apps installed from
 * an APK file until the user allows "restricted settings". Behaviour is believed correct for
 * Android 13 to 15; exact menu names are APPROXIMATE and UNVERIFIED, and some brands differ.
 */
export const RESTRICTED_SETTINGS_STEPS = [
  'Try to switch Nope on in Accessibility first. If it says Restricted setting, tap OK.',
  'Open Settings, then Apps, then Nope (or tap Open app info below).',
  'Tap the three dots at the top right.',
  'Tap Allow restricted settings and confirm with your PIN or fingerprint.',
  'Go back to Accessibility and switch Nope on. It should work now.',
];
