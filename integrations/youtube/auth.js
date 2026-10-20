// OAuth2 refresh token flow for the YouTube Data API. Exports getAccessToken().
import { requireEnv } from '../lib/env.js';
import { request } from '../lib/http.js';

export async function getAccessToken() {
  const { values: e } = requireEnv(['GOOGLE_CLIENT_ID', 'GOOGLE_CLIENT_SECRET', 'GOOGLE_REFRESH_TOKEN']);
  const r = await request({
    method: 'POST',
    url: 'https://oauth2.googleapis.com/token',
    form: { client_id: e.GOOGLE_CLIENT_ID, client_secret: e.GOOGLE_CLIENT_SECRET, refresh_token: e.GOOGLE_REFRESH_TOKEN, grant_type: 'refresh_token' },
    label: 'refresh access token',
    dryResponse: { access_token: '<ACCESS_TOKEN>' },
  });
  if (!r.dryRun && !r.body.access_token) throw new Error('Token refresh returned no access_token. The refresh token may be revoked or expired (apps in Testing mode expire refresh tokens after 7 days).');
  return r.body.access_token;
}
