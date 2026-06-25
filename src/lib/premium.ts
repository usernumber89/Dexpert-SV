export function isPremiumPlan(plan: string | null): boolean {
  return plan === "GROWTH" || plan === "PRO";
}
