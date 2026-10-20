#!/usr/bin/env node
// Publish an approved queue file to Instagram via the Instagram Graph API.
// Usage: node meta/publish.js queue/approved/<file>.md
// Front matter used: channel, format (reel|carousel|image), media_url, media_urls (comma list, carousel), cover_url (optional)
// Media must be at a PUBLIC https URL. Dry run by default; LIVE=1 executes.
import { requireEnv, env, isLive } from '../lib/env.js';
import { request } from '../lib/http.js';
import { log, fail } from '../lib/log.js';
import { parseQueueFile, buildCaption, parseArgs, assertChannel } from '../lib/queue.js';

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function waitForContainer(base, id, token) {
  if (!isLive()) return;
  for (let i = 0; i < 40; i++) {
    const r = await request({ url: `${base}/${id}`, query: { fields: 'status_code,status', access_token: token }, label: 'poll container' });
    const code = r.body.status_code;
    if (code === 'FINISHED') return;
    if (code === 'ERROR' || code === 'EXPIRED') throw new Error(`Container ${id} ended in ${code}: ${r.body.status || ''}`);
    await sleep(5000);
  }
  throw new Error(`Container ${id} not ready after 200s. Try publishing again later.`);
}

async function main() {
  const { positional } = parseArgs();
  const q = parseQueueFile(positional[0]);
  assertChannel(q, 'instagram');
  const { values: e } = requireEnv(['IG_USER_ID', 'IG_ACCESS_TOKEN']);
  const base = `https://graph.facebook.com/${env('META_GRAPH_VERSION', 'v21.0')}`;
  const token = e.IG_ACCESS_TOKEN;
  const ig = e.IG_USER_ID;
  const caption = buildCaption(q);
  const format = q.meta.format || 'image';

  let creationId;
  if (format === 'carousel') {
    const urls = (q.meta.media_urls || '').split(',').map((s) => s.trim()).filter(Boolean);
    if (urls.length < 2 || urls.length > 10) throw new Error('Carousel needs media_urls with 2 to 10 public image URLs in front matter.');
    const children = [];
    for (const [i, u] of urls.entries()) {
      const r = await request({ method: 'POST', url: `${base}/${ig}/media`, form: { image_url: u, is_carousel_item: 'true', access_token: token }, label: `carousel child ${i + 1}`, dryResponse: { id: `<CHILD_${i + 1}_ID>` } });
      children.push(r.body.id);
    }
    const r = await request({ method: 'POST', url: `${base}/${ig}/media`, form: { media_type: 'CAROUSEL', children: children.join(','), caption, access_token: token }, label: 'carousel container', dryResponse: { id: '<CONTAINER_ID>' } });
    creationId = r.body.id;
  } else if (format === 'reel') {
    if (!q.meta.media_url) throw new Error('Reel needs media_url (public https video URL) in front matter.');
    const form = { media_type: 'REELS', video_url: q.meta.media_url, caption, share_to_feed: 'true', access_token: token };
    if (q.meta.cover_url) form.cover_url = q.meta.cover_url;
    const r = await request({ method: 'POST', url: `${base}/${ig}/media`, form, label: 'reel container', dryResponse: { id: '<CONTAINER_ID>' } });
    creationId = r.body.id;
  } else {
    if (!q.meta.media_url) throw new Error('Image post needs media_url (public https image URL) in front matter.');
    const r = await request({ method: 'POST', url: `${base}/${ig}/media`, form: { image_url: q.meta.media_url, caption, access_token: token }, label: 'image container', dryResponse: { id: '<CONTAINER_ID>' } });
    creationId = r.body.id;
  }

  await waitForContainer(base, creationId, token);

  const pub = await request({ method: 'POST', url: `${base}/${ig}/media_publish`, form: { creation_id: creationId, access_token: token }, label: 'media_publish', dryResponse: { id: '<MEDIA_ID>' } });
  const mediaId = pub.body.id;
  if (!isLive()) { log.info('Dry run complete. Set LIVE=1 to publish.'); return; }

  const info = await request({ url: `${base}/${mediaId}`, query: { fields: 'permalink', access_token: token }, label: 'permalink' });
  log.published('instagram', mediaId, info.body.permalink || '');
}

main().catch((err) => fail(err.message));
