export function isPremiumPlan(plan: string | null): boolean {
  return plan === "GROWTH" || plan === "PRO";
}

export const PREMIUM_FEATURES = {
  featured_projects: { label: "Proyectos Destacados", minPlan: "GROWTH" },
  talent_pool: { label: "Talent Pool", minPlan: "GROWTH" },
  analytics: { label: "Analítica de Proyectos", minPlan: "GROWTH" },
} as const;
