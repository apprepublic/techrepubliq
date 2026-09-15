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
  /** "local" when the API was unreachable and the client model priced it instead. */
  source?: "server" | "local";
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
    createIntent: (body: {
      quoteRef: string;
      amountCents: number;
      currency: string;
      discountCode?: string;
    }) =>
      request<{
        intent: {
          orderId: string;
          amountCents: number;
          currency: string;
          provider: string;
          discountApplied: boolean;
          discountAmountCents: number;
        };
        valid?: boolean;
        error?: string;
      }>("/api/payments/create-intent", {
        method: "POST",
        body: JSON.stringify(body),
      }),
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