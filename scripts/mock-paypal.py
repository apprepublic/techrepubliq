#!/usr/bin/env python3
"""
A stand-in PayPal API for local testing only.

PayPal's base URL is configurable (PAYPAL_API_BASE), which lets the money path be
exercised end to end without touching a real account — including the off-session
charges that drive review packs, edits and edit subscriptions.

Not part of the app. Never referenced by production code.
"""
import json
from http.server import BaseHTTPRequestHandler, HTTPServer


class Handler(BaseHTTPRequestHandler):
    def _send(self, code: int, body: bytes = b"") -> None:
        self.send_response(code)
        self.send_header("Content-Type", "application/json")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def do_POST(self):  # noqa: N802
        length = int(self.headers.get("Content-Length") or 0)
        self.rfile.read(length)
        path = self.path

        if path.endswith("/v1/oauth2/token"):
            return self._send(200, json.dumps({"access_token": "mock-token", "expires_in": 3600}).encode())
        if path.endswith("/v2/checkout/orders"):
            return self._send(
                201,
                json.dumps(
                    {"id": "MOCK-ORDER-1", "links": [{"rel": "approve", "href": "https://example.test/approve"}]}
                ).encode(),
            )
        if "verify-webhook-signature" in path:
            return self._send(200, json.dumps({"verification_status": "SUCCESS"}).encode())
        if "bill-balance" in path:
            return self._send(204, b"")
        return self._send(404, json.dumps({"error": "unhandled"}).encode())

    def log_message(self, *args) -> None:
        pass


if __name__ == "__main__":
    HTTPServer(("127.0.0.1", 8788), Handler).serve_forever()
