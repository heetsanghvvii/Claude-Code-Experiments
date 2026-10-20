#!/usr/bin/env node
// Video or channel statistics.
// Usage: node youtube/stats.js video <video_id>[,<video_id>...]   |   node youtube/stats.js channel [channel_id]
import { env } from '../lib/env.js';
import { request } from '../lib/http.js';
import { log, fail } from '../lib/log.js';
import { parseArgs } from '../lib/queue.js';
import { getAccessToken } from './auth.js';

async function main() {
  const { positional: [cmd, a] } = parseArgs();
  const token = await getAccessToken();
  const headers = { Authorization: `Bearer ${token}` };
  let r;
  if (cmd === 'video') {
    if (!a) throw new Error('Usage: video <video_id>[,<video_id>]');
    r = await request({ url: 'https://www.googleapis.com/youtube/v3/videos', query: { part: 'snippet,statistics,status', id: a }, headers, label: 'video stats' });
  } else if (cmd === 'channel') {
    const id = a || env('YOUTUBE_CHANNEL_ID');
    r = await request({ url: 'https://www.googleapis.com/youtube/v3/channels', query: id ? { part: 'statistics,snippet', id } : { part: 'statistics,snippet', mine: 'true' }, headers, label: 'channel stats' });
  } else throw new Error('Unknown command. Use: video | channel');
  if (!r.dryRun) log.json(r.body);
}

main().catch((err) => fail(err.message));
