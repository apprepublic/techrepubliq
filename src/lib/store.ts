import type { ProjectStatus, TierId, BillingCadence } from "./product";

export type StoredService = {
  id: string;
  name: string;
  monthly: number;
  status: "Active" | "Cancel at renewal" | "Grace period";
  renewsOn: string;
};

export type StoredProject = {
  id: string;
  name: string;
  category: string;
  tierId: TierId;
  status: ProjectStatus;
  previewUrl: string | null;
  customDomain: string | null;
  createdAt: string;
  totalPaid: number;
  cadence: BillingCadence;
  services: StoredService[];
  revisionsLeft: number | null;
  launched: boolean;
  hasEmail: boolean;
  hasDatabase: boolean;
  isMobile: boolean;
};

const KEY = "techrepubliq-projects-v2";

const seed: StoredProject[] = [
  {
    id: "PRJ-NORTH",
    name: "Northshore Kitchen",
    category: "web-development",
    tierId: "startup",
    status: "In preview",
    previewUrl: "https://northshore.techrepubliq.app",
    customDomain: "northshore.kitchen",
    createdAt: "2026-08-02",
    totalPaid: 1688,
    cadence: "annual",
    services: [
      { id: "email", name: "Email", monthly: 25, status: "Active", renewsOn: "2027-08-02" },
      { id: "maps", name: "Maps", monthly: 10, status: "Active", renewsOn: "2027-08-02" },
    ],
    revisionsLeft: 3,
    launched: false,
    hasEmail: true,
    hasDatabase: true,
    isMobile: false,
  },
  {
    id: "PRJ-FIELD",
    name: "FieldLog",
    category: "app-development",
    tierId: "mvp",
    status: "Queued",
    previewUrl: null,
    customDomain: null,
    createdAt: "2026-09-01",
    totalPaid: 812,
    cadence: "annual",
    services: [],
    revisionsLeft: 3,
    launched: false,
    hasEmail: false,
    hasDatabase: true,
    isMobile: true,
  },
  {
    id: "PRJ-INBOX",
    name: "InboxFlow",
    category: "ai-automation",
    tierId: "business",
    status: "Live",
    previewUrl: "https://inboxflow.techrepubliq.app",
    customDomain: "inboxflow.io",
    createdAt: "2026-05-18",
    totalPaid: 4200,
    cadence: "annual",
    services: [
      { id: "email", name: "Email", monthly: 50, status: "Active", renewsOn: "2027-05-18" },
      { id: "ai-chat-agent", name: "AI Chat Agent", monthly: 50, status: "Active", renewsOn: "2027-05-18" },
    ],
    revisionsLeft: 0,
    launched: true,
    hasEmail: true,
    hasDatabase: true,
    isMobile: false,
  },
];

function canUseStorage() {
  return typeof window !== "undefined";
}

export function listProjects(): StoredProject[] {
  if (!canUseStorage()) return seed;
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) {
      localStorage.setItem(KEY, JSON.stringify(seed));
      return seed;
    }
    const extra = JSON.parse(raw) as StoredProject[];
    const byId = new Map(seed.map((p) => [p.id, p]));
    for (const p of extra) byId.set(p.id, p);
    return Array.from(byId.values()).sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
  } catch {
    return seed;
  }
}

export function getProject(id: string): StoredProject | undefined {
  return listProjects().find((p) => p.id === id);
}

export function saveProject(project: StoredProject) {
  if (!canUseStorage()) return;
  const all = listProjects();
  const next = [project, ...all.filter((p) => p.id !== project.id)];
  localStorage.setItem(KEY, JSON.stringify(next));
}

export function updateProject(id: string, patch: Partial<StoredProject>) {
  const current = getProject(id);
  if (!current) return;
  saveProject({ ...current, ...patch });
}
