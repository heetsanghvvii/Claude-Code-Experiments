// Shared LinkedIn headers.
import { requireEnv, env } from '../lib/env.js';

export function linkedinHeaders() {
  const { values } = requireEnv(['LINKEDIN_ACCESS_TOKEN']);
  return {
    Authorization: `Bearer ${values.LINKEDIN_ACCESS_TOKEN}`,
    'Linkedin-Version': env('LINKEDIN_VERSION', '202506'),
    'X-Restli-Protocol-Version': '2.0.0',
  };
}

export const API = 'https://api.linkedin.com/rest';
