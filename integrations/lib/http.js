// HTTP helper around built-in fetch: dry-run printing, redaction, retry with backoff.
import { isLive, env } from './env.js';
import { log, printPlannedRequest } from './log.js';

const SECRET_KEYS = /(token|secret|authorization|password|code_verifier|client_secret)/i;

function redactObject(o) {
  if (!o || typeof o !== 'object') return o;
  if (Array.isArray(o)) return o.map(redactObject);
  const out = {};
  for (const [k, v] of Object.entries(o)) {
    out[k] = SECRET_KEYS.test(k) ? '<redacted>' : redactObject(v);
  }
  return out;
}

export function redactUrl(u) {
  try {
    const url = new URL(u);
    for (const k of [...url.searchParams.keys()]) {
      if (SECRET_KEYS.test(k)) url.searchParams.set(k, '<redacted>');
    }
    return url.toString();
  } catch {
    return u;
  }
}

function redactHeaders(h = {}) {
  const out = {};
  for (const [k, v] of Object.entries(h)) out[k] = SECRET_KEYS.test(k) ? '<redacted>' : v;
  return out;
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

export class HttpError extends Error {
  constructor(message, status, body) {
    super(message);
    this.status = status;
    this.body = body;
  }
}

function buildUrl(url, query) {
  const u = new URL(url);
  for (const [k, v] of Object.entries(query || {})) {
    if (v !== undefined && v !== null) u.searchParams.set(k, String(v));
  }
  return u.toString();
}

/**
 * request({ method, url, query, headers, json, form, body, label, dryResponse })
 * - json: object sent as application/json
 * - form: object sent as application/x-www-form-urlencoded
 * - body: raw Buffer/string (for binary uploads); printed as a size summary
 * - dryResponse: object returned (as body) in dry run so multi-step flows can continue
 * Returns { dryRun, status, headers, body }.
 */
export async function request({ method = 'GET', url, query, headers = {}, json, form, body, label = '', dryResponse = {} }) {
  const fullUrl = buildUrl(url, query);
  const h = { ...headers };
  let payload;
  if (json !== undefined) {
    h['Content-Type'] = h['Content-Type'] || 'application/json';
    payload = JSON.stringify(json);
  } else if (form !== undefined) {
    h['Content-Type'] = 'application/x-www-form-urlencoded';
    payload = new URLSearchParams(form).toString();
  } else if (body !== undefined) {
    payload = body;
  }

  if (!isLive()) {
    printPlannedRequest({
      step: label || undefined,
      method,
      url: redactUrl(fullUrl),
      headers: redactHeaders(h),
      body: json !== undefined ? redactObject(json)
        : form !== undefined ? redactObject(form)
        : body !== undefined ? `<${body.length ?? body.byteLength ?? '?'} bytes>` : undefined,
    });
    return { dryRun: true, status: 0, headers: {}, body: dryResponse };
  }

  const maxRetries = Number(env('HTTP_MAX_RETRIES', '4'));
  const timeout = Number(env('HTTP_TIMEOUT_MS', '60000'));
  let attempt = 0;
  for (;;) {
    let res;
    try {
      res = await fetch(fullUrl, { method, headers: h, body: payload, signal: AbortSignal.timeout(timeout) });
    } catch (err) {
      if (attempt >= maxRetries) throw new HttpError(`Network error calling ${label || method + ' ' + redactUrl(fullUrl)}: ${err.message}`, 0, null);
      const wait = backoff(attempt++);
      log.warn(`Network error (${err.message}); retry ${attempt}/${maxRetries} in ${wait}ms`);
      await sleep(wait);
      continue;
    }
    const text = await res.text();
    let parsed = text;
    try { parsed = text ? JSON.parse(text) : {}; } catch { /* keep text */ }
    const rh = Object.fromEntries(res.headers.entries());

    if (res.ok) return { dryRun: false, status: res.status, headers: rh, body: parsed };

    const retryable = res.status === 429 || res.status >= 500 || isRateLimitBody(parsed);
    if (retryable && attempt < maxRetries) {
      const ra = Number(res.headers.get('retry-after'));
      const wait = Number.isFinite(ra) && ra > 0 ? ra * 1000 : backoff(attempt);
      attempt++;
      log.warn(`HTTP ${res.status} on ${label || redactUrl(fullUrl)}; retry ${attempt}/${maxRetries} in ${wait}ms`);
      await sleep(wait);
      continue;
    }
    throw new HttpError(describe(res.status, parsed, label), res.status, parsed);
  }
}

function backoff(attempt) {
  return Math.min(30000, 1000 * 2 ** attempt) + Math.floor(Math.random() * 400);
}

// Meta signals throttling with error codes 4, 17, 32, 613 (HTTP 400).
function isRateLimitBody(b) {
  const code = b?.error?.code;
  return [4, 17, 32, 613].includes(code);
}

function describe(status, body, label) {
  const msg = body?.error?.message || body?.error_description || body?.message || (typeof body === 'string' ? body.slice(0, 300) : JSON.stringify(body)?.slice(0, 300));
  const hint = status === 401 || status === 403
    ? ' Check token validity, scopes/permissions and app review status (see integrations/README.md).'
    : status === 429 ? ' Rate limited, retries exhausted. Wait and run again later.' : '';
  return `${label || 'Request'} failed with HTTP ${status}: ${msg}.${hint}`;
}
