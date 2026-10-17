# Host safety guidelines: picking an arena

Hosts choose the arena (a circle on the map, up to 5 km across). A good arena keeps players safe before the game starts. Read this before you create a round.

The short rules players see are in `apps/web/src/content/safety.ts`. This page is for hosts.

## Golden rules

1. **Scout it in daylight first.** Walk the arena before you invite anyone. Night rounds are not recommended.
2. **Get permission.** If the arena is private, a school, a religious site, a hospital, a construction site or a residential area, get written permission from the owner or manager first.
3. **Keep the circle inside safe ground.** The arena edge is where players are told to stay. Draw it well away from roads, rail lines and water.
4. **Know the emergency plan.** Know the nearest hospital and police station, and who will call 112 if needed.
5. **Keep it small enough to supervise.** A few hundred metres is plenty for most rounds. Use the smallest arena that makes sense for the number of players.

## Arena checklist

Walk the whole arena and tick each point. If any item fails, move the arena or change its shape.

- [ ] No public roads, service roads, car parks or driveways inside the circle. Keep a clear margin from the edge.
- [ ] No railway lines, tram lines, metro tracks or platform edges nearby.
- [ ] No cliffs, quarries, deep pits, open drains, wells, lakes, rivers, ponds, pools or tanks.
- [ ] No construction sites, broken pavements, exposed rebar, unlit stairs or loose gravel.
- [ ] No dogs known to be aggressive, animal enclosures or livestock areas.
- [ ] No private property unless the owner has said yes in writing. Check gates and signs.
- [ ] Clear rules for shops, schools, temples, mosques, churches, hospitals and homes: players do not enter them.
- [ ] Public toilets and drinking water are available. Shade is available, or the round is scheduled for cooler hours.
- [ ] Phone signal works across the whole arena. Test it in the corners and under trees.
- [ ] Mobile data plan and battery: players should bring a charged phone and a power bank.
- [ ] Enough space to move without climbing fences, walls, trees or vehicles. Hiding places must be safe to stand in.
- [ ] Nobody is expected to enter water, mud, crowded markets or areas with heavy traffic.

## Times and conditions

- **Daylight only.** Start the round early enough that it ends before dark. Use the sunset time for the location.
- **Weather.** Cancel for heavy rain, storms, extreme heat, high pollution or flooding. In monsoon season, check the forecast and local warnings the same morning.
- **Heat.** In hot weather, use shorter rounds, more breaks and water stops.
- **Crowds.** Avoid festivals, rallies, processions, election events and crowded markets unless you have permission.

## Players and group management

- **Minimum age and supervision.** Under-18s should play with a parent or guardian's agreement. For teen rounds, the host should be an adult who can supervise, and must confirm guardian consent. See `docs/PRIVACY.md` section 7.
- **Know who is playing.** Only invite people you know, or whose guardians you know.
- **Hard stop rule.** Everyone can leave at any time. Leaving stops location sharing straight away.
- **Briefing.** Before the round, tell everyone the rules in the app, the arena edge, the emergency plan and that a light tag is enough.
- **Head count.** Check everyone in and out at the lobby and at the end.

## During the round

- Host or a trusted adult stays at a fixed meeting point, with a first aid kit and water.
- The host cannot see players' precise locations, so check in by phone or in person with anyone who is overdue, unreachable or unwell.
- Stop the round for an injury, a lost player, a fight, an approaching vehicle or bad weather. **Current limitation:** the app does not let a host cancel an ACTIVE round (`cancel_game` refuses it), so an active round only ends by its own rules or when players leave. Until an emergency stop exists, the host must tell everyone to stop and leave, and players must leave the round in the app. Do not rely on the app to end a round early.

## Tagging rules

Remind players that:

- Tags are light taps, not grabs or shoves.
- No running into roads, stairs, crowds or private spaces to make a tag.
- If a tag is disputed, the runner's answer in the app decides it. Players should not argue or follow each other.

## After the round

- Confirm everyone has left the arena and is safe.
- Report any incident to the people involved and, where needed, the police. Use the in-app report option.
- Check that the round has ended so location sharing has stopped. Raw locations are deleted within the retention periods in `docs/PRIVACY.md`.

## When to cancel

Cancel the round if you see any of these:

- Any player or bystander is hurt and the round cannot continue safely.
- The arena is no longer safe or permitted (for example, a closed gate or an event starting nearby).
- The weather or light turns bad.
- Players are ignoring the rules or pushing each other.
- A player is under 18 without a confirmed guardian consent.

Hosts can cancel a round from the app while it is still in the lobby or countdown. Once it is active, see the current limitation under "During the round".

## Reporting a safety concern

Report a concern from inside the app, or contact the MANHUNT safety contact listed in the app. For emergencies, always call 112 first.
