#!/usr/bin/env node
// Publish a text or single-image post with the LinkedIn Posts API (successor to the UGC Posts API).
// Usage: node linkedin/post.js queue/approved/<file>.md
// Front matter used: channel, format (text|image), image_path (local file, for image posts), image_alt
// Dry run by default; LIVE=1 executes. Needs w_member_social (member) or w_organization_social (Page).
import fs from 'node:fs';
import { requireEnv, isLive } from '../lib/env.js';
import { request } from '../lib/http.js';
import { log, fail } from '../lib/log.js';
import { parseQueueFile, parseArgs, assertChannel } from '../lib/queue.js';
import { linkedinHeaders, API } from './common.js';

// Commentary uses a reserved-character format: these must be escaped or the post is truncated.
const escapeLi = (s) => s.replace(/([\\|{}@\[\]()<>#*_~])/g, '\\$1');

async function main() {
  const { positional } = parseArgs();
  const q = parseQueueFile(positional[0]);
  assertChannel(q, 'linkedin');
  const { values: e } = requireEnv(['LINKEDIN_AUTHOR_URN']);
  const headers = linkedinHeaders();
  // Hashtags are allowed in commentary; keep them unescaped by appending after the escaped body.
  const commentary = [escapeLi(q.body), q.hashtags].filter(Boolean).join('\n\n').slice(0, 3000);

  const post = {
    author: e.LINKEDIN_AUTHOR_URN,
    commentary,
    visibility: 'PUBLIC',
    distribution: { feedDistribution: 'MAIN_FEED', targetEntities: [], thirdPartyDistributionChannels: [] },
    lifecycleState: 'PUBLISHED',
    isReshareDisabledByAuthor: false,
  };

  if (q.meta.format === 'image' || q.meta.image_path) {
    const imgPath = q.meta.image_path;
    if (!imgPath) throw new Error('Image post needs image_path in front matter.');
    if (!fs.existsSync(imgPath) && isLive()) throw new Error(`image_path not found: ${imgPath}`);
    const init = await request({
      method: 'POST', url: `${API}/images`, query: { action: 'initializeUpload' }, headers,
      json: { initializeUploadRequest: { owner: e.LINKEDIN_AUTHOR_URN } },
      label: 'initialize image upload',
      dryResponse: { value: { uploadUrl: '<UPLOAD_URL>', image: 'urn:li:image:<IMAGE_ID>' } },
    });
    const { uploadUrl, image } = init.body.value;
    await request({
      method: 'PUT', url: uploadUrl, headers: { Authorization: headers.Authorization },
      body: isLive() ? fs.readFileSync(imgPath) : Buffer.alloc(0), label: 'upload image bytes',
    });
    post.content = { media: { id: image, altText: q.meta.image_alt || '' } };
  }

  const r = await request({ method: 'POST', url: `${API}/posts`, headers, json: post, label: 'create post', dryResponse: {} });
  if (!isLive()) { log.info('Dry run complete. Set LIVE=1 to publish.'); return; }
  const id = r.headers['x-restli-id'];
  if (!id) throw new Error('Post created but no x-restli-id header returned.');
  log.published('linkedin', id, `https://www.linkedin.com/feed/update/${id}/`);
}

main().catch((err) => fail(err.message));
