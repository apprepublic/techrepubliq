/**
 * The pricing-engine seam (locked decision 1).
 *
 * The app never calls an engine directly — it calls `getPricingEngine()`. v1 returns the
 * deterministic heuristic; swapping in an AI engine later is one `setPricingEngine()` call
 * (or a default change here) with no edits at any call site.
 */

import type { CategorySlug, ComplexityId } from "@/lib/product";
import { heuristicEngine } from "@/lib/pricing/heuristic";

export interface ProjectEstimate {
  pages: number;
  components: number;
  complexity: ComplexityId;
  /** Why the engine landed where it did — useful on the "Get Priced" screen. */
  signals: string[];
  confidence: "low" | "medium" | "high";
}

export interface PricingEngine {
  id: string;
  /** Turn a brief into the three numbers PRD §4.2 prices on. */
  estimate(brief: string, category: CategorySlug | string): ProjectEstimate;
  /** Which recurring add-ons the project needs (PRD §3.1). */
  inferAddons(brief: string, category: CategorySlug | string): string[];
}

let engine: PricingEngine = heuristicEngine;

export function getPricingEngine(): PricingEngine {
  return engine;
}

export function setPricingEngine(next: PricingEngine): void {
  engine = next;
}

export { heuristicEngine };
export type { CategorySlug, ComplexityId };
