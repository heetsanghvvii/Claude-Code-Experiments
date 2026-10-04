---
name: model-router
description: Pick the cheapest model and effort that can do a sub-task well whenever an agent or workflow agent is spawned (Agent tool `model`, Workflow `agent(..., {model, effort})`). Use before spawning any subagent, building any Workflow script, or when the user asks to save tokens, cut cost, or "use Haiku/Sonnet for easy tasks". Routes mechanical work to Haiku, standard work to Sonnet, and only hard reasoning, judging and final synthesis to Opus.
---

# Model router

Every spawned agent gets an explicit `model` (and, in Workflow scripts, an `effort`) chosen by the task's difficulty, not by habit. The goal is the fewest tokens and dollars per **completed** task: a cheap model that fails and needs a rerun costs more than the right model once.

Relative cost (per token, current list prices): Haiku ≈ 1x, Sonnet ≈ 2x, Opus ≈ 4x, Fable ≈ 10x.

## Routing table

| Tier | Model / effort | Use for | Examples |
|---|---|---|---|
| **Mechanical** | `haiku`, effort `low` | Deterministic steps with a clear right answer and little judgment | run a script and return its output, list or move files, grep/scan for patterns, render screenshots, convert formats, extract fields from text, short summaries of one document, status checks, rename/format |
| **Standard** | `sonnet`, effort `medium` | Normal building and research with a clear brief | build a page or deck from a complete brief, write or fix code in one area, web research on one subtopic, write a report section, draft messages from a template, routine reviews |
| **Hard** | `opus`, effort `high` | Ambiguous problems, judgment, quality gates, anything whose output decides other work | blind judging and scoring, adversarial verification, architecture and design decisions, final synthesis across many sources, security review, business strategy, prompts that other agents will follow |
| **Frontier** | `fable` | Only when the user explicitly asks for the most capable model | never by default |

## Rules

1. **Decide per agent, not per workflow.** A competition uses Haiku to render, Sonnet to build, Opus to judge. A research run uses Sonnet researchers and an Opus report writer.
2. **When unsure between two tiers, take the higher one for anything that judges, decides or ships; the lower one for anything that is checked afterwards** (an Opus judge or a test suite will catch a weak Sonnet draft; nothing catches a weak judge).
3. **Escalate on failure, once.** If a cheap agent returns null, garbage, or fails validation, rerun that one item one tier up. Never downgrade a judge to save money.
4. **Effort is the second lever.** Within a tier, use `low` for mechanical, `medium` for standard, `high` for hard; `xhigh`/`max` only for the single most important call (e.g. final scoring) and only when measured quality needs it.
5. **Keep context small.** Pass agents only the paths and facts they need; tokens saved on input are cheaper than any model switch.
6. **Say what you chose.** In a Workflow script, set `model` and `effort` on every `agent()` call and add the tier to its `label` (e.g. `render[haiku]`), so the cost profile is visible.

## How to apply

**Agent tool**
```
Agent(description="Render screenshots", model="haiku", prompt="...")
Agent(description="Research LinkedIn limits", model="sonnet", prompt="...")
Agent(description="Judge entries blind", model="opus", prompt="...")
```

**Workflow script**
```js
const render = await agent(prompt, { label: 'render[haiku]', model: 'haiku', effort: 'low' })
const builds = await parallel(items.map(i => () => agent(buildPrompt(i), { label: `build[sonnet]:${i.id}`, model: 'sonnet', effort: 'medium' })))
const verdict = await agent(judgePrompt, { label: 'judge[opus]', model: 'opus', effort: 'high' })
```

**Skill-competition defaults:** discovery and vetting inline; builders `sonnet`/`medium` (use `opus` only if the brief is ambiguous or the artifact is the final production version); render `haiku`/`low`; judges `opus`/`high`; final report `opus`/`medium`.

**Deep-research defaults:** researchers `sonnet`/`medium`; report writer `opus`/`high`.

## Quick classifier

Answer these for the sub-task; the first "yes" picks the tier.
1. Will its output score, approve, or decide what others do? → **Opus**
2. Does it need to resolve ambiguity, design something new, or combine many sources into one judgment? → **Opus**
3. Does it create something substantial from a clear brief (code, page, deck, research notes)? → **Sonnet**
4. Otherwise (run, fetch, convert, list, extract, check) → **Haiku**
