export const meta = {
  name: 'skill-competition',
  description: 'Contestant skills build the same brief in parallel; render; blind judges score; aggregate',
  phases: [
    { title: 'Build', detail: 'one builder per contestant skill' },
    { title: 'Render', detail: 'screenshots or slide renders for every entry' },
    { title: 'Judge', detail: 'blind judges, different lenses' },
  ],
}

// Fill args when calling Workflow:
// { root, type: 'website'|'deck'|'document'|'other', deliverable, renderCmd, viewInstructions,
//   criteria: {name: weight}, contestants: [{id, skill, how}], lenses: [{key, lens}] }
const A = args

const BUILD_SCHEMA = {
  type: 'object',
  properties: {
    entry: { type: 'string' }, built: { type: 'boolean' }, direction: { type: 'string' },
    skill_steps_followed: { type: 'string' }, problems: { type: 'string' },
  },
  required: ['entry', 'built', 'direction', 'skill_steps_followed', 'problems'],
}

phase('Build')
const builds = await parallel(A.contestants.map(c => () => agent(
  `You are a contestant in a blind ${A.type} competition.
1. Read the brief: ${A.root}/BRIEF.md and follow its content and technical rules exactly. It is complete: never ask questions, never wait for confirmation. If your skill has approval gates or "ask the user" steps, treat the brief as the approval and continue.
2. ${c.how}
3. Work only inside ${A.root}/${c.id}/ (create it). Deliverable: ${A.deliverable} plus NOTES.md (direction in 3 lines, skill steps followed, problems). Never read or touch other entry folders or shared scratch files; keep temp files inside your own folder and delete them at the end.
4. Self-check once: render your output (${A.renderHint}), look at the images with the Read tool, fix everything in one batch, confirm once, stop.
5. Never publish, deploy, purchase, commit or push. Never mention your skill inside the deliverable. Do not run downloaded binaries or call paid external APIs.
Return the structured summary.`,
  { label: `build:${c.id}`, phase: 'Build', schema: BUILD_SCHEMA }
).then(r => ({ id: c.id, skill: c.skill, build: r }))))

phase('Render')
const render = await agent(
  `In ${A.root}, run: ${A.renderCmd}. If it fails, fix the cause and rerun (do not modify any entry's deliverable). Return the JSON report verbatim.`,
  { label: 'render', phase: 'Render' })

const crit = Object.keys(A.criteria)
const scoreProps = { entry: { type: 'string' }, brief_violations: { type: 'string' }, strengths: { type: 'string' }, weaknesses: { type: 'string' } }
for (const k of crit) scoreProps[k] = { type: 'number', description: '1-10' }
const JUDGE_SCHEMA = {
  type: 'object',
  properties: {
    scores: { type: 'array', items: { type: 'object', properties: scoreProps, required: ['entry', ...crit, 'brief_violations', 'strengths', 'weaknesses'] } },
    ranking: { type: 'array', items: { type: 'string' } },
    best_ideas_to_graft: { type: 'string' },
  },
  required: ['scores', 'ranking', 'best_ideas_to_graft'],
}
const ids = A.contestants.map(c => c.id)

phase('Judge')
const judgements = await parallel(A.lenses.map(l => () => agent(
  `${l.lens}
Judge a BLIND competition: entries ${ids.join(', ')} were built from the same brief, ${A.root}/BRIEF.md (read it first).
${A.viewInstructions}
Do not open NOTES.md, design-spec or any file that reveals how an entry was made. An entry with no render scores 1 on everything.
Render report: ${String(render).slice(0, 6000)}
Score every entry 1-10 on: ${crit.join(', ')}. List brief violations. Be harsh, specific and use the full scale. Rank all entries, best first.`,
  { label: `judge:${l.key}`, phase: 'Judge', schema: JUDGE_SCHEMA, effort: 'high' }
).then(r => ({ lens: l.key, ...r }))))

return {
  mapping: A.contestants.map(c => ({ id: c.id, skill: c.skill })),
  criteria: A.criteria,
  builds,
  render,
  judgements: judgements.filter(Boolean),
}
