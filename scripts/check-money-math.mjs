/**
 * Guards the arithmetic the customer is actually quoted.
 *
 * `check-pricing-mirror.mjs` proves the two copies of the model agree on their *inputs*
 * — the rates, the tiers, the multipliers. This proves the *outputs* hold their promises:
 *
 *   1. Twelve installments sum to the fee exactly. Not "within a cent" — exactly. The
 *      remainder is distributed one cent at a time across the earliest payments, so a
 *      fee that doesn't divide by twelve must not quietly gain or lose money.
 *   2. Paying once is 15% off the fee, and "you save" is the difference between the two.
 *   3. Monthly cadence is annual + 15%, split across twelve, rounded to the cent.
 *   4. Enterprise never resolves to a number — not for services, not for add-ons.
 *   5. No installment is more than a cent away from any other.
 *
 * Both copies are run through the same assertions. A model that agrees with itself on
 * its constants can still disagree on how it combines them.
 *
 * Run with:  node --experimental-strip-types scripts/check-money-math.mjs
 */

const [client, server] = await Promise.all([
  import("../src/lib/product.ts"),
  import("../workers/api/src/lib/pricing.ts"),
]);

const failures = [];
let checks = 0;

function ok(label, condition, detail = "") {
  checks++;
  if (!condition) failures.push(`${label}${detail ? `\n    ${detail}` : ""}`);
}

/** Fees chosen to exercise the remainder: exact multiples, off-by-one, and odd coprimes. */
const FEES = [0, 1, 11, 12, 13, 500, 499, 98963, 123457, 999_999, 1_000_001, 73_131];

for (const [side, lib] of [
  ["client", client],
  ["server", server],
]) {
  // 1 & 5 — the twelve payments are even and sum to the fee exactly.
  for (const fee of FEES) {
    const { perMonthCents, listCents, payOnceCents, savedCents } = lib.devFeeOptions(fee);

    const total = perMonthCents.reduce((sum, cents) => sum + cents, 0);
    ok(
      `${side}: 12 installments of ${fee} sum to the fee`,
      total === fee,
      `sum ${total} != fee ${fee}`
    );

    ok(
      `${side}: fee ${fee} splits into 12 payments`,
      perMonthCents.length === lib.INSTALLMENT_MONTHS,
      `got ${perMonthCents.length}`
    );

    if (perMonthCents.length) {
      const spread = Math.max(...perMonthCents) - Math.min(...perMonthCents);
      ok(
        `${side}: installments for ${fee} differ by at most a cent`,
        spread <= 1,
        `spread ${spread} across [${perMonthCents.join(", ")}]`
      );
    }

    // 2 — one payment is 15% off, and the saving is the honest difference.
    ok(
      `${side}: one-time payment for ${fee} is 15% off`,
      payOnceCents === Math.round(listCents * (1 - lib.ONE_TIME_DISCOUNT)),
      `got ${payOnceCents}`
    );
    ok(
      `${side}: saving for ${fee} is the difference`,
      savedCents === listCents - payOnceCents,
      `got ${savedCents}`
    );
    ok(
      `${side}: every installment for ${fee} is a whole number of cents`,
      perMonthCents.every((cents) => Number.isInteger(cents)),
      `[${perMonthCents.join(", ")}]`
    );
  }

  // 3 — monthly cadence is annual + 15%, split across twelve, to the cent.
  for (const annual of [0, 300, 3600, 45_000, 98_963, 1_234_567]) {
    ok(
      `${side}: monthly cadence on ${annual} is annual × 1.15 ÷ 12`,
      lib.servicesMonthlyCents(annual) ===
        Math.round((annual * (1 + lib.MONTHLY_MARKUP)) / 12),
      `got ${lib.servicesMonthlyCents(annual)}`
    );
  }

  // 4 — Enterprise resolves to no number on any surface.
  const paidTiers = ["mvp", "startup", "business"];
  ok(
    `${side}: Enterprise services annual is null`,
    lib.servicesAnnualCents("enterprise", []) === null,
    `got ${lib.servicesAnnualCents("enterprise", [])}`
  );
  for (const addon of lib.ADDON_CATALOG) {
    ok(
      `${side}: Enterprise add-on '${addon.id}' is null`,
      lib.addonMonthlyCents("enterprise", addon.id) === null,
      `got ${lib.addonMonthlyCents("enterprise", addon.id)}`
    );
  }
  for (const tier of paidTiers) {
    ok(
      `${side}: ${tier} services annual is a number`,
      typeof lib.servicesAnnualCents(tier, []) === "number"
    );
  }

  // The tier's own fee is the floor for recurring services — the bug that under-quoted
  // every project with no add-ons by the tier's entire annual fee.
  for (const tier of paidTiers) {
    const withNoAddons = lib.servicesAnnualCents(tier, []);
    const tierAnnual = lib.tierById(tier).monthlyCents * 12;
    ok(
      `${side}: ${tier} with no add-ons still bills the tier fee`,
      withNoAddons === tierAnnual,
      `got ${withNoAddons}, expected ${tierAnnual}`
    );
  }
}

// Both sides must produce identical schedules, not merely equivalent ones.
for (const fee of FEES) {
  const a = client.devFeeOptions(fee);
  const b = server.devFeeOptions(fee);
  ok(
    `client and server agree on the schedule for ${fee}`,
    JSON.stringify(a.perMonthCents) === JSON.stringify(b.perMonthCents),
    `client [${a.perMonthCents}] vs server [${b.perMonthCents}]`
  );
}

if (failures.length) {
  console.error(`money math: ${failures.length} of ${checks} checks FAILED\n`);
  for (const failure of failures) console.error(`  ✘ ${failure}`);
  process.exit(1);
}

console.log(`money math: OK — ${checks} checks across ${FEES.length} fee values and both copies.`);
