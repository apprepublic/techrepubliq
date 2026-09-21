import type { CategorySlug, DomainOptionId, TierId } from "@/lib/product";

/** Browser-only draft shared by the target-style quote and result screens. */
export type IntakeState = {
  category: CategorySlug | "";
  tierId: TierId | "";
  brief: string;
  logoName: string;
  requestsPerDay: string;
  users: string;
  transactions: string;
  staff: string;
  stage: string;
  domainOption: DomainOptionId | "";
  storeDeploy: boolean;
  addons: string[];
  cadence: "annual" | "monthly";
  devFeeMode: "once" | "installments";
};

export const INTAKE_KEY = "techrepubliq-intake-v2";

export const emptyIntake = (): IntakeState => ({
  category: "",
  tierId: "startup",
  brief: "",
  logoName: "",
  requestsPerDay: "",
  users: "",
  transactions: "",
  staff: "",
  stage: "",
  domainOption: "",
  storeDeploy: false,
  addons: [],
  cadence: "annual",
  devFeeMode: "once",
});

/** Accept drafts made by the older target page while moving them to the current model. */
export function normalizeIntake(value: unknown): IntakeState {
  const raw = (value && typeof value === "object" ? value : {}) as Record<string, unknown>;
  const category = typeof raw.category === "string" ? raw.category : "";
  const tierId = typeof raw.tierId === "string" ? raw.tierId : "startup";
  const legacyDomain = raw.hasDomain === "yes" ? "have" : raw.hasDomain === "no" ? "buy" : "";
  const domainOption = raw.domainOption === "have" || raw.domainOption === "buy" ? raw.domainOption : legacyDomain;
  const addons = Array.isArray(raw.addons)
    ? raw.addons.filter((item): item is string => typeof item === "string")
    : Array.isArray(raw.extraAddonIds)
      ? raw.extraAddonIds.filter((item): item is string => typeof item === "string")
      : [];

  return {
    ...emptyIntake(),
    category: category as IntakeState["category"],
    tierId: tierId as IntakeState["tierId"],
    brief: typeof raw.brief === "string" ? raw.brief : "",
    logoName: typeof raw.logoName === "string" ? raw.logoName : "",
    requestsPerDay:
      typeof raw.requestsPerDay === "string"
        ? raw.requestsPerDay
        : typeof raw.traffic === "string"
          ? raw.traffic
          : "",
    users: typeof raw.users === "string" ? raw.users : "",
    transactions: typeof raw.transactions === "string" ? raw.transactions : "",
    staff: typeof raw.staff === "string" ? raw.staff : "",
    stage: typeof raw.stage === "string" ? raw.stage : "",
    domainOption: domainOption as IntakeState["domainOption"],
    storeDeploy: raw.storeDeploy === true,
    addons: Array.from(new Set(addons)),
    cadence: raw.cadence === "monthly" ? "monthly" : "annual",
    devFeeMode: raw.devFeeMode === "installments" ? "installments" : "once",
  };
}

export function metricsFor(intake: IntakeState) {
  return {
    requestsPerDay: Number(intake.requestsPerDay) || 0,
    users: Number(intake.users) || 0,
    transactions: Number(intake.transactions) || 0,
    staff: Number(intake.staff) || 0,
    stage: intake.stage || undefined,
  };
}
