const API_BASE = process.env.NEXT_PUBLIC_API_URL || "https://techrepubliq-api.areh4biz.workers.dev";

async function request<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const token = typeof window !== "undefined" ? sessionStorage.getItem("auth_token") : null;

  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error || `Request failed: ${res.status}`);
  }

  return data;
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
    generate: (body: {
      category: string;
      description: string;
      features?: string[];
      timeline?: string;
      budget?: string;
    }) =>
      request<{
        referenceId: string;
        priceCents: number;
        currency: string;
        scopeSummary: string[];
        isEstimated: boolean;
        timeline: string;
      }>("/api/quotes/generate", {
        method: "POST",
        body: JSON.stringify(body),
      }),
    get: (ref: string) => request<{ quote: any }>(`/api/quotes/${ref}`),
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