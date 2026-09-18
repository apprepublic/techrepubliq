import type { PaymentIntent, ProviderId } from "@/lib/payments/provider";

export interface ProjectRow {
  id: string;
  customer_id: string;
  order_id: string | null;
  name: string;
  category: string;
  tier_id: string;
  status: string;
  preview_url: string | null;
  custom_domain: string | null;
  launch_at: string | null;
  dev_fee_cents: number;
  cadence: string;
  created_at: string;
  services?: ServiceRow[];
  installments?: {
    planId: string;
    paid: number;
    count: number;
    currency: string;
    nextDueAt: string | null;
    nextAmountMinor: number | null;
    nextSeq: number | null;
    status: string;
  } | null;
}

export interface ServiceRow {
  id: string;
  project_id?: string;
  name: string;
  /** The add-on's stable id (`google` | `email` | `ai`); null on the base service. */
  service_key?: string | null;
  kind: "base" | "addon";
  monthly_cents: number;
  status: string;
  renews_on: string | null;
  grace_until?: string | null;
}

export interface EmailMessage {
  id: string;
  direction: "inbound" | "outbound";
  from_addr: string;
  to_addr: string;
  subject: string;
  body: string;
  sent_at: string;
  read_at: string | null;
}

export interface EmailCenter {
  /** Null until the project has a domain — there's no address without one. */
  mailbox: string | null;
  domain: string | null;
  folder: "inbound" | "sent";
  messages: EmailMessage[];
  unread: number;
}

export interface AnalyticsPayload {
  range: "7d" | "30d";
  connected: boolean;
  reason: string | null;
  stale: boolean;
  sampled: boolean;
  totals: {
    requests: number;
    pageViews: number;
    bytes: number;
    cachedBytes: number;
    cachedRequests: number;
    uniques: number;
    threats: number;
    cacheRatio: number | null;
    uniquesAreEstimated: boolean;
  };
  series: {
    date: string;
    requests: number;
    pageViews: number;
    bytes: number;
    cachedBytes: number;
    cachedRequests: number;
    uniques: number;
  }[];
  countries: { name: string; requests: number; bytes: number; threats: number }[];
  statuses: { status: number; requests: number }[];
  browsers: { name: string; pageViews: number }[] | null;
  limits: { notOlderThan: number | null; maxDuration: number | null };
  ranges: { id: "7d" | "30d"; label: string; available: boolean; reason: string | null }[];
  tier: {
    id: string;
    requestsPerDay: number | null;
    averagePerDay: number;
    ratio: number | null;
    level: "none" | "warn" | "breach";
  } | null;
  mobile: boolean;
}

export interface TierNudge {
  projectId: string;
  name: string;
  level: "warn" | "breach";
  observed: number;
  ceiling: number;
}

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "https://techrepubliq-api.areh4biz.workers.dev";

async function request<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const token = typeof window !== "undefined" ? sessionStorage.getItem("auth_token") : null;
  const isFormData =
    typeof FormData !== "undefined" && options.body instanceof FormData;

  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      // Let the browser set the multipart boundary.
      ...(isFormData ? {} : { "Content-Type": "application/json" }),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });

  const text = await res.text();
  let data: any = null;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = null;
  }

  if (!res.ok) {
    throw new Error(data?.error || `Request failed: ${res.status}`);
  }

  return data as T;
}

interface Customer {
  id: string;
  email: string;
  name: string;
  phone?: string;
  phone_country_code?: string;
  country?: string;
  emailVerified?: boolean;
}

/** PRD §1.3–§1.7 — what the intake step sends to the server. */
export interface QuoteIntake {
  category: string;
  tierId: string;
  brief: string;
  /** Engine output. The server clamps and recomputes; the client never sends money. */
  pages: number;
  components: number;
  complexity: "standard" | "elevated" | "complex";
  metrics: {
    requestsPerDay?: number;
    users?: number;
    transactions?: number;
    staff?: number;
    stage?: string;
  };
  assets: { key: string; name: string }[];
  domainOption?: string;
  cadence: "annual" | "monthly";
  devFeeMode: "once" | "installments";
  addons: string[];
  oneTimeServices: string[];
  contactEmail?: string;
}

/**
 * §4.4 — the customer sees one total. This carries the four option totals the summary
 * screen toggles between, and deliberately no per-page / per-component breakdown.
 */
export interface QuotePricing {
  referenceId: string;
  currency: string;
  contactSales: boolean;
  feeCents: number;
  feeOnceCents: number;
  feePerMonthCents: number;
  installmentMonths: number;
  servicesAnnualCents: number | null;
  servicesMonthlyCents: number | null;
  oneTimeServicesCents: number;
  totals: {
    onceAnnual: number | null;
    onceMonthly: number | null;
    installAnnual: number | null;
    installMonthly: number | null;
  };
  addons: string[];
  oneTimeServices: string[];
}

export interface ContactSalesLeadInput {
  name: string;
  email: string;
  company?: string;
  businessStage?: string;
  expectedScale?: string;
  category?: string;
  tierId?: string;
  notes?: string;
  source?: string;
}

export const api = {
  auth: {
    register: (body: { email: string; name: string; password: string; phone?: string; phone_country_code?: string; country?: string }) =>
      request<{ token: string; customer: Customer }>("/api/auth/register", {
        method: "POST",
        body: JSON.stringify(body),
      }),
    login: (body: { email: string; password: string }) =>
      request<{ token: string; customer: Customer }>("/api/auth/login", {
        method: "POST",
        body: JSON.stringify(body),
      }),
    me: () => request<{ customer: Customer }>("/api/auth/me"),
    resendVerification: () =>
      request<{ sent: boolean }>("/api/auth/resend-verification", { method: "POST" }),
  },
  quotes: {
    generate: (body: QuoteIntake) =>
      request<QuotePricing>("/api/quotes/generate", {
        method: "POST",
        body: JSON.stringify(body),
      }),
    get: (ref: string) => request<{ quote: any }>(`/api/quotes/${ref}`),
  },
  uploads: {
    create: (file: File) => {
      const form = new FormData();
      form.append("file", file);
      return request<{ key: string; name: string; size: number; contentType: string }>(
        "/api/uploads",
        { method: "POST", body: form }
      );
    },
  },
  contactSales: {
    submit: (body: ContactSalesLeadInput) =>
      request<{ id: string; received: boolean }>("/api/contact-sales", {
        method: "POST",
        body: JSON.stringify(body),
      }),
  },
  orders: {
    list: () => request<{ orders: any[] }>("/api/orders"),
    get: (id: string) => request<{ order: any; migration: any | null }>(`/api/orders/${id}`),
  },
  payments: {
    /**
     * Open a payment. Note what is *not* sent: no amount and no currency decision that
     * matters — the server recomputes the total from the stored quote and locks the FX
     * rate it used onto the intent.
     */
    createIntent: (body: {
      quoteRef: string;
      email?: string;
      cadence?: "annual" | "monthly";
      devFeeMode?: "once" | "installments";
      provider?: ProviderId;
      currency?: string;
      discountCode?: string;
    }) =>
      request<{ intent: PaymentIntent } | { valid: false; error: string }>(
        "/api/payments/create-intent",
        { method: "POST", body: JSON.stringify(body) }
      ),
    verify: (reference: string) =>
      request<{
        status: "Pending" | "Paid" | "Failed";
        reference: string;
        provider: ProviderId;
        currency: string;
        amountCents: number;
        amountMinor: number;
        fxRateUsed: number | null;
        orderId: string | null;
      }>(`/api/payments/verify?reference=${encodeURIComponent(reference)}`),
  },
  projects: {
    list: () => request<{ projects: ProjectRow[]; nudges: TierNudge[] }>("/api/projects"),
    get: (id: string) =>
      request<{
        project: ProjectRow;
        services: ServiceRow[];
        revisions: { included: number; used: number; purchased: number };
        installments: {
          planId: string;
          paid: number;
          count: number;
          currency: string;
          nextDueAt: string | null;
          nextAmountMinor: number | null;
          nextSeq: number | null;
          status: string;
        } | null;
      }>(`/api/projects/${id}`),
    launch: (id: string) =>
      request<{ project: ProjectRow }>(`/api/projects/${id}/launch`, { method: "POST" }),
    database: (id: string) =>
      request<{ applicable: boolean; message?: string; records?: Record<string, number>; note?: string }>(
        `/api/projects/${id}/database`
      ),
    cancelService: (id: string, serviceId: string) =>
      request<{ service: ServiceRow }>(`/api/projects/${id}/services/cancel`, {
        method: "POST",
        body: JSON.stringify({ serviceId }),
      }),
    restoreService: (id: string, serviceId: string) =>
      request<{ ok: boolean }>(`/api/projects/${id}/services/restore`, {
        method: "POST",
        body: JSON.stringify({ serviceId }),
      }),
    /** PRD §3.2 — the dashboard half of "Add additional add-on". */
    addService: (id: string, addonId: string) =>
      request<{ service: ServiceRow; restored: boolean }>(`/api/projects/${id}/services/add`, {
        method: "POST",
        body: JSON.stringify({ addonId }),
      }),
    requestMigration: (id: string) =>
      request<{ sent: boolean; expiresAt: string }>(`/api/projects/${id}/migration`, {
        method: "POST",
      }),
    confirmMigration: (id: string, code: string) =>
      request<{ ok: boolean; bundle: { note: string } }>(`/api/projects/${id}/migration/confirm`, {
        method: "POST",
        body: JSON.stringify({ code }),
      }),
    /**
     * §12 — traffic, read from Cloudflare through the Worker. `stale` means these numbers
     * came from our own roll-up because the live query failed; `sampled` means Cloudflare
     * sampled the data and every figure is an estimate.
     */
    analytics: (id: string, range: "7d" | "30d") =>
      request<AnalyticsPayload>(`/api/projects/${id}/analytics?range=${range}`),
    /** §13 — the project's own inbox. Only projects with the Email add-on have one. */
    email: {
      list: (id: string, folder: "inbound" | "sent") =>
        request<EmailCenter>(`/api/projects/${id}/email?folder=${folder}`),
      send: (id: string, body: { to: string; subject: string; body: string }) =>
        request<{ ok: boolean; id: string; unread: number }>(`/api/projects/${id}/email`, {
          method: "POST",
          body: JSON.stringify(body),
        }),
      /** No id marks the whole inbox read. */
      markRead: (id: string, messageId?: string) =>
        request<{ ok: boolean; unread: number }>(`/api/projects/${id}/email/read`, {
          method: "POST",
          body: JSON.stringify({ id: messageId ?? null }),
        }),
    },
  },
  edits: {
    overview: (id: string) =>
      request<{
        status: string;
        revisions: { included: number; used: number; purchased: number };
        subscription: {
          id: string;
          monthly_cents: number;
          edits_included: number | null;
          edits_remaining: number | null;
          renews_on: string | null;
          status: string;
        } | null;
        requests: {
          id: string;
          description: string;
          pages: number | null;
          components: number | null;
          complexity: string | null;
          price_cents: number;
          billed_via: string;
          status: string;
          created_at: string;
        }[];
        packs: { cents: number; count: number }[];
        plans: { monthlyCents: number; edits: number | null }[];
      }>(`/api/projects/${id}/edits`),
    quote: (id: string, body: { pages: number; components: number; complexity: string }) =>
      request<{ priceCents: number; complexity: string }>(`/api/projects/${id}/edits/quote`, {
        method: "POST",
        body: JSON.stringify(body),
      }),
    request: (
      id: string,
      body: { description: string; pages: number; components: number; complexity: string }
    ) =>
      request<{ ok: boolean; id: string; billedVia: string; priceCents: number }>(
        `/api/projects/${id}/edits/request`,
        { method: "POST", body: JSON.stringify(body) }
      ),
    subscribe: (id: string, monthlyCents: number) =>
      request<{ ok: boolean; subscription: unknown }>(`/api/projects/${id}/edits/subscribe`, {
        method: "POST",
        body: JSON.stringify({ monthlyCents }),
      }),
    cancelSubscription: (id: string) =>
      request<{ ok: boolean; subscription: unknown }>(`/api/projects/${id}/edits/subscribe/cancel`, {
        method: "POST",
      }),
    buyReviews: (id: string, count: number) =>
      request<{ ok: boolean; revisions: { included: number; used: number; purchased: number } }>(
        `/api/projects/${id}/reviews/purchase`,
        { method: "POST", body: JSON.stringify({ count }) }
      ),
  },
  serviceCenter: {
    info: () =>
      request<{ handled: string[]; note: string; contact: string }>("/api/service-center"),
  },
  migrations: {
    request: (body: { orderId: string; scope: "frontend" | "full" }) =>
      request<{ request: { id: string; status: string } }>("/api/migrations/request", {
        method: "POST",
        body: JSON.stringify(body),
      }),
  },
  customers: {
    me: () => request<{ customer: any }>("/api/customers/me"),
    update: (body: { name?: string; email?: string }) =>
      request<{ customer: any }>("/api/customers/me", {
        method: "PUT",
        body: JSON.stringify(body),
      }),
    remove: () =>
      request<{ deleted: boolean; hadActiveOrder: boolean }>("/api/customers/me", {
        method: "DELETE",
      }),
  },
};