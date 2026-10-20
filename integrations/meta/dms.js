#!/usr/bin/env node
// Instagram comments, DMs and insights.
// Usage:
//   node meta/dms.js comments <media_id>
//   node meta/dms.js reply-comment <comment_id> "text"
//   node meta/dms.js conversations
//   node meta/dms.js messages <conversation_id>
//   node meta/dms.js send <recipient_igsid> "text"      (only within 24h of the user's last message)
//   node meta/dms.js insights account|<media_id>
// Read commands call the network only with LIVE=1; in dry run they print the request.
import { requireEnv, env } from '../lib/env.js';
import { request } from '../lib/http.js';
import { log, fail } from '../lib/log.js';
import { parseArgs } from '../lib/queue.js';

async function main() {
  const { positional: [cmd, a, ...rest] } = parseArgs();
  const { values: e } = requireEnv(['IG_USER_ID', 'IG_ACCESS_TOKEN']);
  const base = `https://graph.facebook.com/${env('META_GRAPH_VERSION', 'v21.0')}`;
  const token = e.IG_ACCESS_TOKEN;
  const ig = e.IG_USER_ID;
  let r;

  switch (cmd) {
    case 'comments':
      if (!a) throw new Error('Usage: comments <media_id>');
      r = await request({ url: `${base}/${a}/comments`, query: { fields: 'id,text,username,timestamp,like_count,replies{id,text,username,timestamp}', limit: 50, access_token: token }, label: 'list comments' });
      break;
    case 'reply-comment':
      if (!a || !rest[0]) throw new Error('Usage: reply-comment <comment_id> "text"');
      r = await request({ method: 'POST', url: `${base}/${a}/replies`, form: { message: rest.join(' '), access_token: token }, label: 'reply to comment' });
      break;
    case 'conversations':
      r = await request({ url: `${base}/${ig}/conversations`, query: { platform: 'instagram', fields: 'id,updated_time,participants', limit: 25, access_token: token }, label: 'list conversations' });
      break;
    case 'messages':
      if (!a) throw new Error('Usage: messages <conversation_id>');
      r = await request({ url: `${base}/${a}`, query: { fields: 'messages{id,created_time,from,to,message}', access_token: token }, label: 'read messages' });
      break;
    case 'send':
      if (!a || !rest[0]) throw new Error('Usage: send <recipient_igsid> "text"');
      log.warn('IG DMs can only be sent within 24 hours of the user\'s last message to you. Outside that window the API returns an error.');
      r = await request({ method: 'POST', url: `${base}/${ig}/messages`, headers: { Authorization: `Bearer ${token}` }, json: { recipient: { id: a }, message: { text: rest.join(' ') } }, label: 'send DM' });
      break;
    case 'insights': {
      if (!a) throw new Error('Usage: insights account|<media_id>');
      if (a === 'account') {
        r = await request({ url: `${base}/${ig}/insights`, query: { metric: 'reach,profile_views,accounts_engaged,follower_count', period: 'day', access_token: token }, label: 'account insights' });
      } else {
        r = await request({ url: `${base}/${a}/insights`, query: { metric: 'reach,likes,comments,shares,saved,total_interactions', access_token: token }, label: 'media insights' });
      }
      break;
    }
    default:
      throw new Error('Unknown command. Use: comments | reply-comment | conversations | messages | send | insights');
  }
  if (!r.dryRun) log.json(r.body);
}

main().catch((err) => fail(err.message));
