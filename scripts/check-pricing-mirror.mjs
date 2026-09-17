/**
 * Guards the two copies of the money math against drift:
 *   src/lib/product.ts            (client truth)
 *   workers/api/src/lib/pricing.ts (server recompute)
 *
 * Run with:  node --experimental-strip-types scripts/check-pricing-mirror.mjs
 * (Node 22.6+ strips the types; both files are deliberately import-free.)
 */

const [client, server] = await Promise.all([
  import("../src/lib/product.ts"),
  import("../workers/api/src/lib/pricing.ts"),
]);

const failures = [];

function eq(label, a, b) {
  const same = JSON.stringify(a) === JSON.stringify(b);
  if (!same) failures.push(`${label}\n    client: ${JSON.stringify(a)}\n    server: ${JSON.stringify(b)}`);
  return same;
}

// Scalars
for (const key of [
  "BASE_DEV_FEE_CENTS",
  "RATE_PER_PAGE_CENTS",
  "RATE_PER_COMPONENT_CENTS",
  "MONTHLY_MARKUP",
  "ONE_TIME_DISCOUNT",
  "INSTALLMENT_MONTHS",
]) {
  eq(key, client[key], server[key]);
}

// Complexity multipliers
for (const level of ["standard", "elevated", "complex"]) {
  eq(`COMPLEXITY.${level}.multiplier`, client.COMPLEXITY[level].multiplier, server.COMPLEXITY[level].multiplier);
}

// Categories
eq(
  "CATEGORIES",
  client.CATEGORIES.map((c) => [c.slug, c.title]),
  server.CATEGORIES.map((c) => [c.slug, c.title])
);

// Tiers
eq(
  "TIERS",
  client.TIERS.map((t) => [t.id, t.name, t.monthlyCents, t.emailPerDay, t.revisions, t.requestsPerDay]),
  server.TIERS.map((t) => [t.id, t.name, t.monthlyCents, t.emailPerDay, t.revisions, t.requestsPerDay])
);

// Add-ons and one-time services
eq(
  "ADDON_CATALOG",
  client.ADDON_CATALOG.map((a) => [a.id, a.kind, a.label, a.multiple]),
  server.ADDON_CATALOG.map((a) => [a.id, a.kind, a.label, a.multiple])
);
eq(
  "ONE_TIME_SERVICES",
  client.ONE_TIME_SERVICES.map((s) => [s.id, s.cents]),
  server.ONE_TIME_SERVICES.map((s) => [s.id, s.cents])
);

// Behavioural check — the same inputs must produce the same money on both sides.
const sample = {
  category: "web-development",
  tierId: "startup",
  pages: 12,
  components: 7,
  complexity: "elevated",
  addons: ["email", "ai"],
  oneTimeServices: ["domain-purchase"],
  devFeeMode: "installments",
  cadence: "annual",
};
const a = client.computePrice(sample);
const b = server.computePrice(sample);
for (const key of [
  "devFeeCents",
  "servicesAnnualCents",
  "servicesMonthlyCents",
  "oneTimeServicesCents",
  "dueNowCents",
  "totalIfPaidOnceCents",
  "totalIfInstallmentsCents",
]) {
  eq(`computePrice.${key}`, a[key], b[key]);
}
eq("computePrice.devFee.perMonthCents", a.devFee.perMonthCents, b.devFee.perMonthCents);
eq("computePrice.devFee.payOnceCents", a.devFee.payOnceCents, b.devFee.payOnceCents);

// Sanity: 12 installments must sum back to the fee exactly, and the
// one-time price must be the fee less the discount.
const fee = 123457;
const opts = client.devFeeOptions(fee);
const summed = opts.perMonthCents.reduce((s, n) => s + n, 0);
if (summed !== fee) failures.push(`installments sum ${summed} != fee ${fee}`);
if (opts.payOnceCents !== Math.round(fee * (1 - client.ONE_TIME_DISCOUNT)))
  failures.push(`one-time price ${opts.payOnceCents} is not ${client.ONE_TIME_DISCOUNT * 100}% off ${fee}`);

// The 12-way split backs real money now (§11), so check it across awkward amounts:
// both sides must agree, and the parts must always sum back to the fee exactly.
for (const feeValue of [0, 1, 11, 12, 13, 999, 92100, 123457, 2500001]) {
  eq(
    `devFeeOptions(${feeValue}).perMonthCents`,
    client.devFeeOptions(feeValue).perMonthCents,
    server.devFeeOptions(feeValue).perMonthCents
  );
  const sum = client.devFeeOptions(feeValue).perMonthCents.reduce((s, n) => s + n, 0);
  if (sum !== feeValue) failures.push(`split of ${feeValue} sums to ${sum}, not ${feeValue}`);
}

if (failures.length) {
  console.error("pricing mirror: DRIFT DETECTED\n");
  for (const f of failures) console.error(`  - ${f}`);
  process.exit(1);
}

console.log(
  `pricing mirror: OK — ${client.CATEGORIES.length} categories, ${client.TIERS.length} tiers, ` +
    `${client.ADDON_CATALOG.length} add-ons; sample order $${(a.dueNowCents / 100).toLocaleString()} due now.`
);
