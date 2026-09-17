#!/usr/bin/env python3
"""
Stand-in for the Cloudflare GraphQL Analytics API, on 127.0.0.1:8789.

The sandbox has no network, and analytics is the one part of the system whose entire
job is talking to something outside it. `CF_API_BASE` makes that base URL configurable,
so pointing it here lets the real code path run — settings discovery, the traffic query,
the nightly roll-up, the tier nudge, the 429 backoff — with nothing faked inside the
product.

Serves:
  POST /graphql            the settings node and the zone traffic query
  GET  /zones?name=<name>  zone lookup
  POST /zones              zone creation
  POST /__mock/config      test control: daily volume, retention, sampling, 429s

Numbers are deterministic per date, so a roll-up and a live query for the same day agree
and a fifteen-minute cache can't make the figures look like they moved.

Local test only. Nothing in the product references this file.
"""

import json
import random
import re
import threading
from datetime import date, timedelta
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from urllib.parse import urlparse, parse_qs

PORT = 8789

STATE = {
    # Requests a day. MVP's ceiling is 10,000, so this sits under it by default.
    "daily_requests": 4200,
    # Seconds of history this "plan" keeps. 31 days — both presets available.
    "not_older_than": 2_678_400,
    # 1 = raw counts. 10 = Cloudflare sampled 1-in-10 and scaled back up.
    "sample_interval": 1,
    # Serve this many 429s before answering, to exercise the backoff.
    "fail_429_times": 0,
}
LOCK = threading.Lock()

COUNTRIES = [("US", 0.42), ("NG", 0.18), ("GB", 0.12), ("DE", 0.08), ("IN", 0.07),
             ("CA", 0.05), ("FR", 0.04), ("BR", 0.04)]
STATUSES = [(200, 0.78), (304, 0.09), (301, 0.04), (404, 0.05), (403, 0.02),
            (500, 0.01), (503, 0.01)]
BROWSERS = [("Chrome", 0.54), ("Safari", 0.22), ("Edge", 0.09), ("Firefox", 0.07),
            ("Samsung Internet", 0.05), ("Opera", 0.03)]

DATASET = "httpRequests1dGroups"
ADAPTIVE = "httpRequestsAdaptiveGroups"
AVAILABLE_FIELDS = [
    "sum_requests", "sum_pageViews", "sum_bytes", "sum_cachedBytes", "sum_cachedRequests",
    "sum_encryptedBytes", "sum_threats", "sum_countryMap", "sum_responseStatusMap",
    "sum_browserMap", "uniq_uniques", "avg_sampleInterval", "dimensions_date",
]


def day_numbers(day: str) -> dict:
    """One day's traffic, stable for a given date and volume setting."""
    rng = random.Random(f"{day}:{STATE['daily_requests']}")
    requests = int(STATE["daily_requests"] * (0.8 + 0.4 * rng.random()))
    return {
        "requests": requests,
        "pageViews": int(requests * (0.55 + 0.1 * rng.random())),
        "bytes": int(requests * (38_000 + 8_000 * rng.random())),
        "cachedBytes": int(requests * 0.72 * 40_000),
        "cachedRequests": int(requests * (0.68 + 0.08 * rng.random())),
        "encryptedBytes": int(requests * 0.99 * 40_000),
        "threats": int(requests * 0.004),
        "uniques": int(requests * (0.28 + 0.06 * rng.random())),
    }


def days_between(since: str, until: str) -> list:
    start = date.fromisoformat(since)
    end = date.fromisoformat(until)
    out = []
    cursor = start
    while cursor <= end and len(out) < 100:
        out.append(cursor.isoformat())
        cursor += timedelta(days=1)
    return out


def maps_for(total: dict) -> dict:
    requests = total["requests"]
    return {
        "countryMap": [
            {
                "clientCountryName": code,
                "requests": int(requests * share),
                "bytes": int(total["bytes"] * share),
                "threats": int(total["threats"] * share),
            }
            for code, share in COUNTRIES
        ],
        "responseStatusMap": [
            {"edgeResponseStatus": status, "requests": max(int(requests * share), 1)}
            for status, share in STATUSES
        ],
        "browserMap": [
            {"uaBrowserFamily": name, "pageViews": int(total["pageViews"] * share)}
            for name, share in BROWSERS
        ],
    }


def settings_response(zone_tag: str) -> dict:
    return {
        "data": {
            "viewer": {
                "zones": [{
                    "settings": {
                        DATASET: {
                            "enabled": True,
                            "availableFields": AVAILABLE_FIELDS,
                            "maxPageSize": 10000,
                            "maxNumberOfFields": 30,
                            "maxDuration": 259200,
                            "notOlderThan": STATE["not_older_than"],
                        }
                    }
                }]
            }
        },
        "errors": None,
    }


def traffic_response(zone_tag: str, variables: dict) -> dict:
    since = str(variables.get("since", ""))[:10]
    until = str(variables.get("until", ""))[:10]

    days = days_between(since, until) if since and until else []
    series = []
    totals = {
        "requests": 0, "pageViews": 0, "bytes": 0, "cachedBytes": 0,
        "cachedRequests": 0, "encryptedBytes": 0, "threats": 0, "uniques": 0,
    }

    for day in days:
        numbers = day_numbers(day)
        series.append({
            "dimensions": {"date": day},
            "sum": {
                "requests": numbers["requests"],
                "pageViews": numbers["pageViews"],
                "bytes": numbers["bytes"],
                "cachedBytes": numbers["cachedBytes"],
                "cachedRequests": numbers["cachedRequests"],
            },
            "uniq": {"uniques": numbers["uniques"]},
        })
        for key in totals:
            totals[key] += numbers[key]

    totals.update(maps_for(totals))
    totals_node = {"sum": totals, "uniq": {"uniques": totals["uniques"]}}
    if STATE["sample_interval"] != 1:
        totals_node["avg"] = {"sampleInterval": STATE["sample_interval"]}

    return {
        "data": {
            "viewer": {
                "zones": [{
                    "totals": [totals_node],
                    "series": series,
                }]
            }
        },
        "errors": None,
    }


class Handler(BaseHTTPRequestHandler):
    protocol_version = "HTTP/1.1"

    def log_message(self, fmt, *args):
        print(f"  [mock-cf] {fmt % args}")

    def send_json(self, payload, status=200):
        body = json.dumps(payload).encode()
        self.send_response(status)
        self.send_header("Content-Type", "application/json")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def read_body(self) -> dict:
        length = int(self.headers.get("Content-Length") or 0)
        if not length:
            return {}
        try:
            return json.loads(self.rfile.read(length))
        except Exception:
            return {}

    def do_POST(self):
        path = urlparse(self.path).path
        body = self.read_body()

        if path == "/graphql":
            if not self.headers.get("Authorization", "").startswith("Bearer "):
                return self.send_json({"errors": [{"message": "missing token"}]}, 401)

            with LOCK:
                if STATE["fail_429_times"] > 0:
                    STATE["fail_429_times"] -= 1
                    self.send_response(429)
                    self.send_header("Retry-After", "1")
                    self.send_header("Content-Length", "0")
                    self.end_headers()
                    return

            query = body.get("query", "")
            variables = body.get("variables", {}) or {}
            zone_tag = variables.get("zoneTag", "")

            if "settings" in query:
                return self.send_json(settings_response(zone_tag))
            if ADAPTIVE in query or DATASET in query:
                return self.send_json(traffic_response(zone_tag, variables))
            return self.send_json({"errors": [{"message": f"unrecognised query"}]})

        if path == "/zones":
            name = (body.get("name") or "").strip()
            if not name:
                return self.send_json({"success": False, "errors": [{"message": "name required"}]}, 400)
            zone_id = "mockzone" + str(abs(hash(name)) % 10**12).zfill(12)
            return self.send_json({"success": True, "result": {"id": zone_id, "name": name}})

        if path == "/__mock/config":
            with LOCK:
                for key in ("daily_requests", "not_older_than", "sample_interval", "fail_429_times"):
                    if key in body:
                        STATE[key] = body[key]
            return self.send_json({"ok": True, "state": dict(STATE)})

        return self.send_json({"success": False, "errors": [{"message": "not found"}]}, 404)

    def do_GET(self):
        parsed = urlparse(self.path)
        if parsed.path == "/zones":
            name = parse_qs(parsed.query).get("name", [""])[0]
            if not name:
                return self.send_json({"success": True, "result": []})
            # No zone exists until one is created — the worker's POST does that.
            return self.send_json({"success": True, "result": []})
        return self.send_json({"success": True, "result": {}, "state": dict(STATE)})


if __name__ == "__main__":
    print(f"Mock Cloudflare Analytics on http://127.0.0.1:{PORT}")
    print(f"  POST /graphql    settings node + {DATASET} / {ADAPTIVE}")
    print(f"  POST /__mock/config  {{\"daily_requests\": 4200, \"not_older_than\": 2678400,")
    print(f"                        \"sample_interval\": 1, \"fail_429_times\": 0}}")
    ThreadingHTTPServer(("127.0.0.1", PORT), Handler).serve_forever()
