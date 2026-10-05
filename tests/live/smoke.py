"""Smoke test for the live Knock deployment. Stdlib only.

Usage: python tests/live/smoke.py https://knock-eosin-beta.vercel.app
Sends ONE tagged intake row (full_name starts with "SMOKE TEST") so it can be found and deleted.
"""
import json
import sys
import time
import urllib.error
import urllib.request

BASE = (sys.argv[1] if len(sys.argv) > 1 else "https://knock-eosin-beta.vercel.app").rstrip("/")
RUN = time.strftime("%Y%m%d%H%M%S")
results = []


def call(method, path, body=None, headers=None):
    data = json.dumps(body).encode() if body is not None else None
    req = urllib.request.Request(BASE + path, data=data, method=method,
                                 headers={"Content-Type": "application/json", **(headers or {})})
    t = time.time()
    try:
        with urllib.request.urlopen(req, timeout=30) as r:
            return r.status, r.read().decode(errors="replace"), time.time() - t
    except urllib.error.HTTPError as e:
        return e.code, e.read().decode(errors="replace"), time.time() - t


def check(name, method, path, expect, body=None, headers=None, contains=None):
    status, text, secs = call(method, path, body, headers)
    ok = status in expect and (contains is None or contains in text)
    results.append({"check": name, "status": status, "ok": ok, "ms": round(secs * 1000)})
    print(f"{'PASS' if ok else 'FAIL'}  {name}: {status} in {secs*1000:.0f} ms" + ("" if ok else f"  body={text[:200]!r}"))


check("home page", "GET", "/", {200}, contains="Knock")
check("crm page", "GET", "/crm/", {200, 308}, contains=None)
check("health", "GET", "/api/health", {200})
check("crm summary rejects no key", "GET", "/api/crm/summary", {401, 403})
check("crm summary rejects wrong key", "GET", "/api/crm/summary", {401, 403}, headers={"x-crm-key": "wrong"})
check("cron rejects no secret", "GET", "/api/cron/sync", {401, 403})
check("intake rejects bad email", "POST", "/api/intake", {422}, body={"full_name": "SMOKE TEST bad", "email": "nope"})
check("intake honeypot dropped", "POST", "/api/intake", {200},
      body={"full_name": "SMOKE TEST bot", "email": "bot@example.com", "website": "spam"})
check("intake real row", "POST", "/api/intake", {200},
      body={"full_name": f"SMOKE TEST {RUN}", "email": f"smoke+{RUN}@example.com",
            "target_companies": "Zepto, Razorpay", "package": "sprint"})

failed = [r for r in results if not r["ok"]]
print(json.dumps({"run": RUN, "base": BASE, "passed": len(results) - len(failed), "failed": len(failed)}))
sys.exit(1 if failed else 0)
