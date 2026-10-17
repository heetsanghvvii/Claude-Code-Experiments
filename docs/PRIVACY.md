# MANHUNT privacy disclosure (DRAFT)

> **Draft for legal review.** This is a working draft to help the team and counsel. It is not legal advice, it has not been reviewed by a lawyer, and it must not be published to players until it has been. Items marked **Verify** need a decision or a check against current law and store policy.

The plain-language version players see is in `apps/web/src/content/privacy.ts`. Keep the two in step.

## 1. Who we are

- Service: MANHUNT, a real-world hide and hunt game played in a web app (PWA) and, later, in native apps.
- Controller: **Verify**. Insert the legal entity name, registered address and contact email. The founder is based in India.
- Grievance contact: **Verify**. Name and email for complaints and data requests.

## 2. Data we collect

| Data | Source | When | Where it lives |
| --- | --- | --- | --- |
| Email address, password hash | Player at sign-up | Account lifetime | Supabase Auth (`auth.users`) |
| Display name (up to 32 characters) | Player | Account lifetime | `manhunt.profiles` |
| Game membership, role, status, join and elimination times | Game actions | Round lifetime | `manhunt.games`, `manhunt.game_players` |
| Precise location: lat/lng, accuracy, device time, server receipt time, `is_mocked` flag | Phone, while a round is ACTIVE | Round, then purged | `manhunt.player_locations` (owner only) |
| Released runner snapshots (lat/lng, accuracy, device time, release time) | Derived by the server from location readings | Round, then purged | `manhunt.location_snapshots` (hunters of that round, plus the runner) |
| Tag requests and their confirmation method | Hunter and runner actions | Round lifetime | `manhunt.tag_requests` |
| Game events (for example tag requested, tag rejected, speed flags) | Server | Round lifetime | `manhunt.game_events` |
| Hosting logs (IP address, user agent, request metadata) | Hosting and database providers | Set by each provider | Vercel, Supabase (see section 6) |

Not collected by design: contacts, photos, microphone, background activity outside a round, and any location outside an active round.

**Verify:** the map SDK (Mapbox or Google Maps, not yet chosen). If the map provider receives tile requests or device identifiers, list it here and in section 6.

## 3. Purposes

1. Run the round: teams, arena, snapshots, tags and the winner.
2. Confirm tags: runner acknowledgement, or proximity from at least two nearby readings within the confirm window.
3. Keep play fair: flag impossible speeds (over 12 m/s on foot) and mocked locations in `game_events`.
4. Keep the service secure and working: logs, debugging, abuse handling.
5. Respond to safety reports.

Precise location is **not** used for advertising, profiling, analytics on individuals, or sale. **Verify** that analytics tooling added later does not receive location.

## 4. Legal basis and consent

- **Consent for location.** Location is requested only when a player joins a round and only collected while the round is ACTIVE. The consent screen must say: what is collected, who sees it, when it stops, and how long it is kept (copy in `locationConsentCopy`). Consent is separate from accepting terms, can be withdrawn at any time (leaving the round or turning off the permission), and is not a condition of using the rest of the app.
- **Consent for account data.** Given at sign-up, with a link to this notice.
- **Verify:** whether the consent screen records a timestamp and notice version per player, so consent can be shown later. The current schema does not store it.

## 5. Retention and deletion

Enforced by `manhunt.purge_expired_locations()` (see `docs/DEPLOY.md` for scheduling).

| Data | Rule in code | Plain English |
| --- | --- | --- |
| Raw precise locations (`player_locations`) | Deleted when received more than 24 h ago, or when the game ended more than 1 h ago | Gone 1 hour after the round, and never more than 24 hours after receipt |
| Snapshots (`location_snapshots`) | Deleted when the game ended more than 24 h ago, or when released more than 7 days ago | Gone 24 hours after the round, or 7 days after release |
| Game events, tag requests, game players | Kept with the game | **Verify** a retention period. Deleting a game cascades to its children. |
| Profile and auth account | Kept while the account exists | Deleted on account deletion (**Verify** the deletion path, including backups) |

Purge runs every 15 minutes, so data can exist up to about 15 minutes past its deadline. Backups: **Verify** the backup retention of the hosting provider and state it here.

Account deletion must work from inside the app (required by Apple and Google, see section 8).

## 6. Recipients and transfers

- Supabase: database, authentication, realtime. **Verify** the region of the project and whether data leaves India.
- Vercel: hosting for the web app. Serves static files and functions. **Verify** region.
- Map provider: not yet chosen. See section 2.
- No sale of data. No third-party advertising or analytics SDKs on location screens.

Cross-border transfer: **Verify** against the latest DPDP transfer rules and any negative list.

## 7. Children and teens

Players include teenagers, and some may be under 18 in India and elsewhere. Points for counsel:

- **Verify:** under the Digital Personal Data Protection Act, 2023 (DPDP Act), processing data of a child (under 18) requires verifiable consent from a parent or lawful guardian. Confirm the threshold, the Rules, and their commencement dates.
- **Verify:** the DPDP Act restricts tracking or behavioural monitoring of children. Live location sharing between players may need a specific assessment. Consider whether teens may only play where the host and every player are in the same supervised group.
- Age gate at sign-up: **Verify** the design. Self-declared age alone is weak. Consider a parent or guardian consent flow for under-18s before any location sharing.
- Product rule to consider: no location sharing for under-18s until a guardian consent record exists.
- Other countries: check the applicable child privacy rules (for example COPPA in the US and GDPR Article 8 in the EU) for each market before launch there.

## 8. Checklist: DPDP Act, 2023 (India)

Status key: [ ] not started, [~] partly done, [x] done. Section numbers refer to the Act. **Verify all of this with counsel.**

- [ ] Notice (s.5): itemised description of data, purpose and how to withdraw or complain, in English and, where needed, Indian languages. Draft in section 1 to 7.
- [ ] Consent (s.6): free, specific, informed, unconditional, unambiguous, with a clear affirmative action, and withdrawable as easily as it was given. Record consent and notice version.
- [ ] Purpose limitation and minimisation (s.6 and s.8): location only during an active round; no secondary use.
- [ ] Security safeguards (s.8(5)): access control via RLS, encryption in transit, restricted service keys, logging.
- [ ] Breach handling (s.8(6)): process to notify the Data Protection Board and affected people. Write it down.
- [ ] Erasure (s.8(7)): retention in section 5 is enforced in code. Confirm backups and logs.
- [ ] Data principal rights (s.11 to s.14): access, correction, erasure, grievance redressal, nomination. Build an in-app or email request flow with a response deadline.
- [ ] Grievance officer and contact published in the notice.
- [ ] Children (s.9): verifiable parental consent for under 18s; no tracking or behavioural monitoring of children; no targeted ads to children.
- [ ] Significant Data Fiduciary assessment (s.10): **Verify** whether the thresholds apply.
- [ ] Cross-border transfers (s.16): **Verify** current rules.
- [ ] Rules and phased commencement: check the DPDP Rules and their timelines before launch.
- [ ] Records of processing and a data protection impact assessment for location tracking.

## 9. Checklist: Apple App Store

Relevant parts of the App Store Review Guidelines (section numbers change; **Verify** against the current version).

- [ ] Privacy policy URL in App Store Connect and inside the app.
- [ ] App Privacy "nutrition label" matches this notice (location, contact info, identifiers, user content, usage data).
- [ ] Location purpose strings (`NSLocationWhenInUseUsageDescription`, `NSLocationAlwaysAndWhenInUseUsageDescription`) explain the game purpose and that sharing stops at the end of a round. The current string in `apps/mobile/app.json` still says OUTRUN and needs updating.
- [ ] Background location (`UIBackgroundModes: location`) is justified in review notes, with a demo account and a clear in-app disclosure before the "Always" request.
- [ ] Account deletion is available inside the app (guideline 5.1.1(v)).
- [ ] Age rating and content questions answered honestly, including user-to-user interaction and location.
- [ ] Safety features: in-app way to report a player or a safety concern.

## 10. Checklist: Google Play

- [ ] Data safety form matches this notice: data types, purposes, sharing, encryption in transit, deletion option.
- [ ] Prominent in-app disclosure before any background location request, plus the video and declaration form Play requires for location permissions.
- [ ] Background location only if it is core to the app, and documented as such in the declaration.
- [ ] Account deletion: in-app and a web link, both listed in the Play Console.
- [ ] Target audience and content: include teens. Do not claim the app is designed for children unless it meets the Families policy.
- [ ] Privacy policy link in the Play Console and in the app.

## 11. Known gaps (must be closed or accepted before launch)

- The web app (PWA) cannot reliably track location in the background. Browsers pause geolocation when the screen locks or the tab is hidden. The native app in `apps/mobile` is designed for background updates in a dev build. Decide the native path before promising continuous sharing.
- The consent record (who agreed, when, to which notice version) is not stored yet.
- Deletion of an account, with cascade to location and snapshot rows, is not built yet. Confirm it removes everything in section 5.
- The client in `apps/mobile/src/lib/supabase.ts` does not set `db.schema` to `manhunt`. See `docs/DEPLOY.md`.
