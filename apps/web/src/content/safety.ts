// Safety, consent and rules copy for MANHUNT. Plain text only, so screens can render it as they like.
// Keep the tone calm and short. Anything that changes a rule must also change docs/SAFETY.md and the engine.

export interface RulesStep {
  step: number;
  title: string;
  body: string;
}

export interface GlossaryEntry {
  term: string;
  meaning: string;
}

export interface LocationConsentCopy {
  title: string;
  intro: string;
  collected: string[];
  whoSees: string[];
  whenSharingStops: string[];
  retention: string[];
  consentPrompt: string;
}

export interface EmergencyCopy {
  title: string;
  body: string;
  steps: string[];
}

export const safetyWarnings: readonly string[] = [
  'Stay off roads, pavements next to traffic, and crossings. Never run across a road to tag someone.',
  'Keep off railway tracks, metro lines and platform edges.',
  'Only enter private property with permission. Locked gates and "no entry" signs mean stop.',
  'Avoid cliffs, water, construction sites, steep slopes, and uneven or slippery ground.',
  'Stay in daylight and in busy, public pedestrian areas. Tell someone where you are going.',
  'Bring water and drink often. Take breaks in the shade when it is hot.',
  'Run at a pace you can control. Walk if you feel unsafe. Nobody wins a tag by getting hurt.',
  'Stop straight away for any emergency, including someone who is hurt, lost or unwell.',
  'Tag gently. A light touch on the shoulder or arm is enough. No pushing, grabbing or chasing into danger.',
  'If someone asks you to stop, stop. Respect "no" and leave people alone who are not playing.',
];

export const locationConsentCopy: LocationConsentCopy = {
  title: 'Location sharing during a round',
  intro:
    'MANHUNT uses your location only while a round you have joined is active. Outside a round, your location is not shared with the game.',
  collected: [
    'Your precise position, accuracy estimate and the time your phone recorded it, while a round is active.',
    'Whether your phone reported the position as simulated (for fair play checks).',
  ],
  whoSees: [
    'Hunters never see your raw positions.',
    'Hunters see your position only as delayed snapshots, released at set intervals (the host chooses how often).',
    'You always see your own positions.',
    'The people running the service can access data for support and safety reasons, under strict internal rules.',
  ],
  whenSharingStops: [
    'Sharing stops when the round ends, when you are eliminated, when you leave the round, or when you turn sharing off.',
    'Turning off location access also stops new readings. If your phone cannot read your location, nothing new is shared.',
  ],
  retention: [
    'Raw precise positions are deleted 1 hour after the round ends, and never kept longer than 24 hours after they were received.',
    'Snapshots shown to hunters are deleted 24 hours after the round ends, or 7 days after they were released, whichever comes first.',
  ],
  consentPrompt:
    'I understand my precise location is shared with other players in delayed form during active rounds, and that sharing stops when the round ends. I can leave or stop sharing at any time.',
};

export const emergencyCopy: EmergencyCopy = {
  title: 'If something goes wrong',
  body:
    'Your safety comes before any round. If someone is hurt, lost, or in danger, stop playing and get help. The game can wait.',
  steps: [
    'Stop moving and stay where it is safe.',
    'Call your local emergency number. In India, dial 112.',
    'Tell the people you are with, or a bystander, exactly where you are.',
    'Leave the round from the app once you are safe. Your team and the host will see that you have left.',
    'If a host or player is unsafe, report it to the host and to the MANHUNT safety contact in the app.',
  ],
};

export const rulesSummary: readonly RulesStep[] = [
  {
    step: 1,
    title: 'Join a round',
    body: 'The host creates a round inside an arena and shares a six-letter code. Players join with the code and wait in the lobby.',
  },
  {
    step: 2,
    title: 'Teams form',
    body: 'Most players are runners. A smaller group are hunters. Roles are set before the round starts.',
  },
  {
    step: 3,
    title: 'Head start',
    body: 'Runners start first and hide inside the arena. Hunters wait until the head start ends.',
  },
  {
    step: 4,
    title: 'Hunt',
    body: 'Hunters see runner positions only as delayed snapshots. Runners keep moving and stay inside the arena.',
  },
  {
    step: 5,
    title: 'Tag in person',
    body: 'A hunter submits a tag when they are close to a runner. The runner confirms it in the app, or the game confirms it from repeated nearby readings.',
  },
  {
    step: 6,
    title: 'Win',
    body: 'Hunters win if every runner is tagged. Runners win if time runs out with at least one runner still free.',
  },
];

export const glossary: readonly GlossaryEntry[] = [
  {
    term: 'Arena',
    meaning: 'The area a round is played in. It is a circle on the map. Players must stay inside it.',
  },
  {
    term: 'Host',
    meaning: 'The player who creates a round, sets its rules and can start or cancel it.',
  },
  {
    term: 'Hunter',
    meaning: 'A player who tries to tag runners.',
  },
  {
    term: 'Runner',
    meaning: 'A player who hides and tries to avoid being tagged until time runs out.',
  },
  {
    term: 'Head start',
    meaning: 'The time at the beginning of a round when runners move alone before hunters are released.',
  },
  {
    term: 'Snapshot',
    meaning: 'A delayed, approximate runner position shown to hunters. It is not live.',
  },
  {
    term: 'Tag',
    meaning: 'A hunter reaching a runner in person. A tag counts only after it is confirmed.',
  },
  {
    term: 'Confirmed tag',
    meaning: 'A tag the runner accepted in the app, or one the game confirmed from repeated nearby readings.',
  },
  {
    term: 'Round',
    meaning: 'One full game, from the lobby until it is won, lost or cancelled.',
  },
  {
    term: 'Lobby',
    meaning: 'The waiting room before a round starts. Players join here and teams are set here.',
  },
];
