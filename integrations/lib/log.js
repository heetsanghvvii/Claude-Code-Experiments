// Tiny logger. Human messages go to stderr, machine-readable results to stdout.
const stamp = () => new Date().toISOString();

export const log = {
  info: (...a) => console.error(`[${stamp()}] INFO`, ...a),
  warn: (...a) => console.error(`[${stamp()}] WARN`, ...a),
  error: (...a) => console.error(`[${stamp()}] ERROR`, ...a),
  // Pretty JSON on stdout for results the caller (or scheduler agent) reads.
  json: (obj) => console.log(JSON.stringify(obj, null, 2)),
  // The scheduler agent looks for a line starting with PUBLISHED.
  published: (platform, id, url = '') => console.log(`PUBLISHED ${platform} ${id} ${url}`.trim()),
};

// Print a request that would be made. Secrets must already be redacted.
export function printPlannedRequest(req) {
  console.log('DRY RUN: would send this request (no network call made)');
  console.log(JSON.stringify(req, null, 2));
}

// Exit with a clear message and non-zero code.
export function fail(message, code = 1) {
  log.error(message);
  process.exit(code);
}
