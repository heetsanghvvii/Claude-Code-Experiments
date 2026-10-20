#!/usr/bin/env node
// Upload a video to YouTube (resumable upload) and optionally schedule it with publishAt.
// Usage: node youtube/upload.js queue/approved/<file>.md [--publish-at=2026-01-01T12:00:00Z]
// Front matter used: channel, format (short|long), video_path, title (else HOOK), publish_at, privacy, category_id, made_for_kids
// Dry run by default; LIVE=1 executes. Quota: videos.insert costs 1600 units of the 10,000 daily default.
import fs from 'node:fs';
import { isLive } from '../lib/env.js';
import { request } from '../lib/http.js';
import { log, fail } from '../lib/log.js';
import { parseQueueFile, parseArgs, assertChannel } from '../lib/queue.js';
import { getAccessToken } from './auth.js';

async function main() {
  const { positional, flags } = parseArgs();
  const q = parseQueueFile(positional[0]);
  assertChannel(q, 'youtube');
  const videoPath = q.meta.video_path;
  if (!videoPath) throw new Error('Front matter needs video_path (local file to upload).');
  let size = 0;
  if (fs.existsSync(videoPath)) size = fs.statSync(videoPath).size;
  else if (isLive()) throw new Error(`video_path not found: ${videoPath}`);
  else log.warn(`video_path not found (${videoPath}); continuing because this is a dry run.`);

  let title = (q.meta.title || q.hook || 'Untitled').replace(/\s+/g, ' ').slice(0, 100);
  if (q.meta.format === 'short' && !/#shorts/i.test(`${title} ${q.body}`)) q.body += '\n\n#Shorts';
  const description = [q.body, q.hashtags].filter(Boolean).join('\n\n').slice(0, 5000);
  const publishAt = flags['publish-at'] || q.meta.publish_at;
  const status = { privacyStatus: publishAt ? 'private' : (q.meta.privacy || 'private'), selfDeclaredMadeForKids: q.meta.made_for_kids === 'true' };
  if (publishAt) {
    const d = new Date(publishAt);
    if (Number.isNaN(d.getTime())) throw new Error(`publish_at is not a valid date: ${publishAt}`);
    if (d.getTime() < Date.now() + 60_000) throw new Error('publish_at must be in the future.');
    status.publishAt = d.toISOString();
  }
  const metadata = { snippet: { title, description, categoryId: q.meta.category_id || '22' }, status };

  const token = await getAccessToken();
  const auth = { Authorization: `Bearer ${token}` };

  // Step 1: start resumable session
  const init = await request({
    method: 'POST',
    url: 'https://www.googleapis.com/upload/youtube/v3/videos',
    query: { uploadType: 'resumable', part: 'snippet,status' },
    headers: { ...auth, 'X-Upload-Content-Length': String(size), 'X-Upload-Content-Type': 'video/*' },
    json: metadata,
    label: 'start resumable upload',
  });
  const uploadUrl = init.headers.location || '<RESUMABLE_UPLOAD_URL>';

  // Step 2: send the bytes (single request; whole file is read into memory)
  const bytes = isLive() ? fs.readFileSync(videoPath) : Buffer.alloc(0);
  const up = await request({
    method: 'PUT',
    url: uploadUrl,
    headers: { ...auth, 'Content-Type': 'video/*', 'Content-Length': String(size) },
    body: isLive() ? bytes : Buffer.alloc(0),
    label: `upload bytes (${size} bytes)`,
    dryResponse: { id: '<VIDEO_ID>' },
  });
  if (!isLive()) { log.info('Dry run complete. Set LIVE=1 to upload.'); return; }
  const id = up.body.id;
  if (!id) throw new Error('Upload finished but no video id returned.');
  log.published('youtube', id, `https://www.youtube.com/watch?v=${id}`);
}

main().catch((err) => fail(err.message));
