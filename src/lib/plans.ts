export const PLAN_CREDITS: Record<string, number> = {
  growthlight: 4,
  growth: 8,
  pro: 20,
  enterprise: 50,
};

export const PLAN_AMOUNTS: Record<string, number> = {
  growthlight: 14.99,
  growth: 24.99,
  pro: 49.99,
  enterprise: 99.99,
};

export const PLAN_NAMES: Record<string, string> = {
  growthlight: "Dexpert Growth L",
  growth: "Dexpert Growth",
  pro: "Dexpert Pro",
  enterprise: "Dexpert Enterprise",
};

export const PLANS: Record<string, { amount: number; name: string }> = {
  growthlight: { amount: 14.99, name: "Dexpert Growth L" },
  growth: { amount: 24.99, name: "Dexpert Growth" },
  pro: { amount: 49.99, name: "Dexpert Pro" },
  enterprise: { amount: 99.99, name: "Dexpert Enterprise" },
  talent: { amount: 7.99, name: "Acceso a Talento" },
};

export const BOOST_AMOUNT = 2.99;
export const CERTIFICATE_AMOUNT = 4.99;
export const PORTFOLIO_AMOUNT = 9.99;
