#!/usr/bin/env node
// LinkedIn share statistics for an organization Page, and social counts for one post.
// Usage:
//   node linkedin/stats.js org [urn:li:organization:123]
//   node linkedin/stats.js post <urn:li:share:... | urn:li:ugcPost:...>
// Needs r_organization_social (Community Management API). Member-level analytics are restricted by LinkedIn.
import { requireEnv } from '../lib/env.js';
import { request } from '../lib/http.js';
import { log, fail } from '../lib/log.js';
import { parseArgs } from '../lib/queue.js';
import { linkedinHeaders, API } from './common.js';

async function main() {
  const { positional: [cmd, a] } = parseArgs();
  const headers = linkedinHeaders();
  let r;
  if (cmd === 'org') {
    const urn = a || requireEnv(['LINKEDIN_AUTHOR_URN']).values.LINKEDIN_AUTHOR_URN;
    if (!urn.startsWith('urn:li:organization:')) throw new Error('org stats need an organization URN (urn:li:organization:NNN).');
    // Restli 2.0: the URN in a query parameter value must be URL-encoded; URLSearchParams does this.
    r = await request({ url: `${API}/organizationalEntityShareStatistics`, query: { q: 'organizationalEntity', organizationalEntity: urn }, headers, label: 'organization share statistics' });
  } else if (cmd === 'post') {
    if (!a) throw new Error('Usage: post <post_urn>');
    r = await request({ url: `${API}/socialMetadata/${encodeURIComponent(a)}`, headers, label: 'post social metadata' });
  } else throw new Error('Unknown command. Use: org | post');
  if (!r.dryRun) log.json(r.body);
}

main().catch((err) => fail(err.message));
