"""Light stress test for the live Knock deployment. Stdlib only.

Usage: python tests/live/stress.py BASE_URL [concurrency=50] [seconds=60]
Mix: 60% home page, 30% /api/health, 10% /api/intake with the honeypot filled (dropped server side, no DB rows).
"""
import json
import random
import statistics
import sys
import threading
import time
import urllib.error
import urllib.request

BASE = (sys.argv[1] if len(sys.argv) > 1 else "https://knock-eosin-beta.vercel.app").rstrip("/")
CONC = int(sys.argv[2]) if len(sys.argv) > 2 else 50
SECS = int(sys.argv[3]) if len(sys.argv) > 3 else 60
lock = threading.Lock()
stats = {}


def hit(kind):
    if kind == "intake":
        body = json.dumps({"full_name": "STRESS bot", "email": "bot@example.com", "website": "x"}).encode()
        req = urllib.request.Request(BASE + "/api/intake", data=body, method="POST", headers={"Content-Type": "application/json"})
    else:
        req = urllib.request.Request(BASE + ("/" if kind == "home" else "/api/health"))
    t = time.time()
    try:
        with urllib.request.urlopen(req, timeout=30) as r:
            r.read()
            code = r.status
    except urllib.error.HTTPError as e:
        code = e.code
    except Exception:
        code = 0
    return code, (time.time() - t) * 1000


def worker(stop):
    while time.time() < stop:
        kind = random.choices(["home", "health", "intake"], [6, 3, 1])[0]
        code, ms = hit(kind)
        with lock:
            s = stats.setdefault(kind, {"ms": [], "codes": {}})
            s["ms"].append(ms)
            s["codes"][code] = s["codes"].get(code, 0) + 1


stop = time.time() + SECS
threads = [threading.Thread(target=worker, args=(stop,)) for _ in range(CONC)]
[t.start() for t in threads]
[t.join() for t in threads]

report, total, errors = {}, 0, 0
for kind, s in stats.items():
    ms = sorted(s["ms"])
    n = len(ms)
    err = sum(v for k, v in s["codes"].items() if k != 200)
    total += n
    errors += err
    report[kind] = {"requests": n, "p50_ms": round(statistics.median(ms)), "p95_ms": round(ms[int(n * 0.95) - 1]),
                    "max_ms": round(ms[-1]), "codes": s["codes"], "error_rate": round(err / n, 4)}
summary = {"base": BASE, "concurrency": CONC, "seconds": SECS, "total_requests": total,
           "rps": round(total / SECS, 1), "error_rate": round(errors / max(total, 1), 4), "by_route": report}
print(json.dumps(summary, indent=2))
sys.exit(1 if summary["error_rate"] > 0.01 else 0)
