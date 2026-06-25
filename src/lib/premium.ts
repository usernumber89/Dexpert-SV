export function isPremiumPlan(plan: string | null): boolean {
  return plan === "GROWTH" || plan === "PRO";
}

export const PREMIUM_FEATURES = {
  talent_pool: { label: "Talent Pool (guardar estudiantes)", minPlan: "GROWTH" },
} as const;
