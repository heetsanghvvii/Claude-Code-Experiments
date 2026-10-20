#!/usr/bin/env node
// List and reply to YouTube comments.
// Usage:
//   node youtube/comments.js list <video_id>
//   node youtube/comments.js reply <parent_comment_id> "text"
import { request } from '../lib/http.js';
import { log, fail } from '../lib/log.js';
import { parseArgs } from '../lib/queue.js';
import { getAccessToken } from './auth.js';

async function main() {
  const { positional: [cmd, a, ...rest] } = parseArgs();
  const token = await getAccessToken();
  const headers = { Authorization: `Bearer ${token}` };
  let r;
  if (cmd === 'list') {
    if (!a) throw new Error('Usage: list <video_id>');
    r = await request({ url: 'https://www.googleapis.com/youtube/v3/commentThreads', query: { part: 'snippet,replies', videoId: a, maxResults: 50, order: 'time', textFormat: 'plainText' }, headers, label: 'list comment threads' });
  } else if (cmd === 'reply') {
    if (!a || !rest[0]) throw new Error('Usage: reply <parent_comment_id> "text"');
    r = await request({ method: 'POST', url: 'https://www.googleapis.com/youtube/v3/comments', query: { part: 'snippet' }, headers, json: { snippet: { parentId: a, textOriginal: rest.join(' ') } }, label: 'reply to comment (50 quota units)' });
  } else throw new Error('Unknown command. Use: list | reply');
  if (!r.dryRun) log.json(r.body);
}

main().catch((err) => fail(err.message));
