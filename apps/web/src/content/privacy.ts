// Plain-language privacy notice for MANHUNT. DRAFT: needs legal review before it is shown to players.
// Keep it in step with docs/PRIVACY.md and the retention rules in supabase/migrations.

export interface PrivacySection {
  id: string;
  heading: string;
  paragraphs: string[];
  bullets?: string[];
}

export const privacyDraftNotice =
  'Draft for review. This notice has not been approved by a lawyer yet.';

export const privacySections: readonly PrivacySection[] = [
  {
    id: 'summary',
    heading: 'The short version',
    paragraphs: [
      'MANHUNT is a hide and hunt game played on phones. To play, we need your name, your account details and, during a round, your location.',
      'We use your location only while a round you joined is active. Other players see your position only as delayed snapshots. Your precise positions are deleted soon after the round.',
    ],
  },
  {
    id: 'what-we-collect',
    heading: 'What we collect',
    paragraphs: ['We collect only what the game needs.'],
    bullets: [
      'Account details: an email address and a display name you choose.',
      'Game details: the rounds you host or join, your role (hunter or runner), your status in the round, and tag requests.',
      'Location, during an active round only: precise position, accuracy estimate, the time your phone recorded it, and whether your phone reported the position as simulated.',
      'Round history: short event records, such as a tag being confirmed or a player leaving.',
    ],
  },
  {
    id: 'why-we-use-it',
    heading: 'Why we use it',
    paragraphs: ['We use your information to:'],
    bullets: [
      'Run the round: show the arena, teams, snapshots and tags.',
      'Keep play fair: spot impossible movement or simulated locations.',
      'Keep you safe: respond to safety reports and emergencies.',
      'Keep the service working: fix bugs and answer support requests.',
    ],
  },
  {
    id: 'who-sees-it',
    heading: 'Who can see your location',
    paragraphs: [
      'Your precise positions are visible only to you.',
      'Hunters in your round see your position only as delayed snapshots, at the intervals the host chose.',
      'Other players in your round see your name, role and status. They do not see your precise positions.',
    ],
  },
  {
    id: 'when-sharing-stops',
    heading: 'When location sharing stops',
    paragraphs: [
      'Location is shared only while a round is active. It stops when the round ends, when you are eliminated, when you leave, or when you turn location access off on your phone.',
    ],
  },
  {
    id: 'how-long',
    heading: 'How long we keep it',
    paragraphs: ['We keep information for the shortest time that does the job.'],
    bullets: [
      'Precise location: deleted 1 hour after the round ends, and no later than 24 hours after we received it.',
      'Snapshots shown to hunters: deleted 24 hours after the round ends, or 7 days after release, whichever comes first.',
      'Account details: kept while your account is active. You can delete your account at any time.',
      'Round events: removed with the round.',
    ],
  },
  {
    id: 'your-choices',
    heading: 'Your choices',
    paragraphs: [
      'You can turn off location access in your phone settings at any time. Leaving a round stops sharing straight away.',
      'You can ask us to see, correct or delete your information, and you can delete your account from the app.',
    ],
  },
  {
    id: 'service-providers',
    heading: 'Service providers',
    paragraphs: [
      'We use trusted providers to host the database, the web app and maps. They process data only to provide their service for MANHUNT.',
    ],
  },
  {
    id: 'children',
    heading: 'Teens and children',
    paragraphs: [
      'MANHUNT is for adults and for teenagers with a parent or guardian who agrees to them playing. Where local law requires verifiable parental consent for anyone under 18, we ask for it before a teen can share location.',
      'We do not use location to show ads, and we do not build profiles of anyone under 18.',
    ],
  },
  {
    id: 'security',
    heading: 'Keeping it safe',
    paragraphs: [
      'Data is protected with access controls, so each player can read only what they are allowed to. Writes go through server rules, not directly from the app. We will tell you and the relevant authorities about a serious breach as the law requires.',
    ],
  },
  {
    id: 'contact',
    heading: 'Questions and complaints',
    paragraphs: [
      'If you have a question or a complaint about your data, contact us through the in-app help screen. We will respond within the time the law sets.',
    ],
  },
  {
    id: 'changes',
    heading: 'Changes to this notice',
    paragraphs: [
      'If we change how we use your information, we will update this notice and ask for your consent again where the law requires it.',
    ],
  },
];
