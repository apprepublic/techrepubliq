import type { Env } from "../index";

/**
 * §13 — inbound mail for a project's own domain address.
 *
 * Cloudflare Email Routing is pointed at this Worker, so anything sent to
 * `hello@<project domain>` arrives here as a raw RFC 822 message. Mail for a domain we
 * don't host, or for a project without the Email add-on, is rejected outright rather
 * than stored somewhere nobody can read it.
 *
 * The vendor is never named in anything a customer sees (§7) — this is "your inbox on
 * your domain", full stop.
 */

/** The mailbox every project gets. One address, on the project's own domain. */
export const MAILBOX_LOCAL_PART = "hello";

export function mailboxFor(customDomain: string | null): string | null {
  if (!customDomain) return null;
  return `${MAILBOX_LOCAL_PART}@${customDomain}`;
}

/** Strips a display name and angle brackets: "Ada Lovelace" <ada@example.com> → the address. */
export function addressOnly(value: string): string {
  const match = value.match(/<([^>]+)>/);
  const raw = (match ? match[1] : value).trim().toLowerCase();
  return raw;
}

export function domainOf(address: string): string {
  const at = addressOnly(address).lastIndexOf("@");
  return at === -1 ? "" : addressOnly(address).slice(at + 1);
}

interface ParsedMessage {
  subject: string;
  body: string;
}

/**
 * Enough of an RFC 822 parser to fill an inbox: the Subject header and a plain-text
 * body. Multipart messages are common and quoted-printable is a fact of life, but a
 * full MIME implementation is not what this feature is — if the body can't be read, the
 * subject still identifies the message and the row still lands.
 */
export function parseMessage(raw: string): ParsedMessage {
  const normalised = raw.replace(/\r\n/g, "\n");
  const splitAt = normalised.indexOf("\n\n");
  const headerBlock = splitAt === -1 ? normalised : normalised.slice(0, splitAt);
  const bodyBlock = splitAt === -1 ? "" : normalised.slice(splitAt + 2);

  const headers = parseHeaders(headerBlock);

  return {
    subject: decodeHeader(headers.get("subject") ?? "(no subject)"),
    body: extractText(
      bodyBlock,
      headers.get("content-type") ?? "text/plain",
      headers.get("content-transfer-encoding") ?? ""
    ),
  };
}

/**
 * Header block → lowercase name → value. Continuation lines (those starting with
 * whitespace) belong to the header above them, joined with a single space.
 *
 * The one exception is RFC 2047: whitespace *between two adjacent encoded words* is
 * ignored, not turned into a space. Without that carve-out a subject that was folded
 * mid-word decodes as "Invoice – NG 123 follow-up" instead of "…123follow-up".
 */
function parseHeaders(block: string): Map<string, string> {
  const headers = new Map<string, string>();

  for (const line of block.split("\n")) {
    if (/^[ \t]/.test(line) && headers.size > 0) {
      const key = [...headers.keys()].pop()!;
      const previous = headers.get(key) ?? "";
      const continuation = line.trim();
      const betweenEncodedWords = previous.endsWith("?=") && continuation.startsWith("=?");
      headers.set(key, betweenEncodedWords ? previous + continuation : `${previous} ${continuation}`);
      continue;
    }
    const colon = line.indexOf(":");
    if (colon === -1) continue;
    headers.set(line.slice(0, colon).trim().toLowerCase(), line.slice(colon + 1).trim());
  }

  return headers;
}

/** RFC 2047 encoded words: =?utf-8?B?...?= or =?utf-8?Q?...?= */
function decodeHeader(value: string): string {
  return value.replace(/=\?([^?]+)\?([bBqQ])\?([^?]*)\?=/g, (_all: string, charset: string, encoding: string, text: string) => {
    try {
      if (encoding.toLowerCase() === "b") {
        const bytes = Uint8Array.from(atob(text), (c: string) => c.charCodeAt(0));
        return new TextDecoder(charset).decode(bytes);
      }
      return text
        .replace(/_/g, " ")
        .replace(/=([0-9A-Fa-f]{2})/g, (_h: string, hex: string) =>
          String.fromCharCode(parseInt(hex, 16))
        );
    } catch {
      return text;
    }
  });
}

/**
 * Prefers a text/plain part when the message is multipart, since that's what an inbox
 * should show; falls back to the first HTML part with the markup stripped. Each part
 * carries its own Content-Type and Content-Transfer-Encoding, so those are read per part
 * rather than from the outer message — assuming otherwise was what left bodies sitting
 * there still base64'd.
 */
function extractText(body: string, contentType: string, transferEncoding: string): string {
  const boundary = contentType.match(/boundary="?([^";]+)"?/);
  if (!boundary) {
    return decodeTransfer(body, transferEncoding).trim();
  }

  const parts = body.split(`--${boundary[1]}`).slice(1, -1);
  let fallback = "";

  for (const part of parts) {
    const split = part.indexOf("\n\n");
    const head = split === -1 ? part : part.slice(0, split);
    const content = split === -1 ? "" : part.slice(split + 2);
    const partHeaders = parseHeaders(head);
    const type = (partHeaders.get("content-type") ?? "text/plain").trim();

    if (!/text\/html/i.test(type)) {
      const text = decodeTransfer(content, partHeaders.get("content-transfer-encoding") ?? "").trim();
      if (text) return text;
    } else if (!fallback) {
      fallback = stripHtml(
        decodeTransfer(content, partHeaders.get("content-transfer-encoding") ?? "")
      );
    }
  }

  return fallback.trim();
}

function decodeTransfer(content: string, encoding: string): string {
  switch (encoding.trim().toLowerCase()) {
    case "base64":
      try {
        const bytes = Uint8Array.from(atob(content.replace(/\s+/g, "")), (c: string) =>
          c.charCodeAt(0)
        );
        return new TextDecoder("utf-8").decode(bytes);
      } catch {
        return content;
      }
    case "quoted-printable":
      return content
        .replace(/=\n/g, "")
        .replace(/=([0-9A-Fa-f]{2})/g, (_h: string, hex: string) =>
          String.fromCharCode(parseInt(hex, 16))
        );
    default:
      return content;
  }
}

function stripHtml(html: string): string {
  return html
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/[ \t]+/g, " ")
    .trim();
}

/* ------------------------------------------------------------------ *
 * The inbound entry point
 * ------------------------------------------------------------------ */

export interface InboundResult {
  stored: boolean;
  reason: string;
  projectId?: string;
}

/**
 * Called from the Worker's `email()` handler. Deliberately throws nothing: an inbound
 * mail storm is not the time to discover that an unexpected MIME shape returns a 500 to
 * Cloudflare, and a reject is better than a silent retry loop.
 */
export async function storeInboundEmail(
  env: Env,
  message: { from: string; to: string; raw: ReadableStream | string }
): Promise<InboundResult> {
  const to = addressOnly(message.to);
  const domain = domainOf(to);
  if (!domain) return { stored: false, reason: "no domain on the recipient address" };

  const project = await env.DB.prepare("SELECT id, name, custom_domain FROM projects WHERE custom_domain = ?")
    .bind(domain)
    .first<any>();

  if (!project) return { stored: false, reason: `no project hosts ${domain}` };

  const entitled = await env.DB.prepare(
    "SELECT 1 FROM project_services WHERE project_id = ? AND service_key = 'email' AND status = 'Active'"
  )
    .bind(project.id)
    .first();

  if (!entitled) {
    return { stored: false, reason: `${project.id} has no active Email Center add-on` };
  }

  let raw: string;
  try {
    if (typeof message.raw === "string") {
      raw = message.raw;
    } else {
      const buffer = await new Response(message.raw).arrayBuffer();
      raw = new TextDecoder("utf-8").decode(buffer);
    }
  } catch (err) {
    return { stored: false, reason: `couldn't read the message: ${String(err)}` };
  }

  const parsed = parseMessage(raw);
  const id = `EM-${crypto.randomUUID().slice(0, 8).toUpperCase()}`;

  await env.DB.prepare(
    `INSERT INTO email_messages (id, project_id, direction, from_addr, to_addr, subject, body, sent_at)
     VALUES (?, ?, 'inbound', ?, ?, ?, ?, datetime('now'))`
  )
    .bind(id, project.id, addressOnly(message.from), to, parsed.subject.slice(0, 300), parsed.body.slice(0, 20_000))
    .run();

  return { stored: true, reason: "stored", projectId: project.id };
}
