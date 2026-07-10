import { describe, it, expect } from "vitest";
import { PLANS, PLAN_CREDITS, PLAN_AMOUNTS, PLAN_NAMES, BOOST_AMOUNT, CERTIFICATE_AMOUNT, PORTFOLIO_AMOUNT } from "@/lib/plans";

describe("plans", () => {
  it("PLANS debería tener todos los planes esperados", () => {
    expect(Object.keys(PLANS)).toEqual(["growthlight", "growth", "pro", "enterprise", "talent"]);
  });

  it("PLANS debería tener montos consistentes con PLAN_AMOUNTS", () => {
    for (const key of Object.keys(PLAN_AMOUNTS)) {
      expect(PLANS[key].amount).toBe(PLAN_AMOUNTS[key]);
    }
  });

  it("PLANS debería tener nombres consistentes con PLAN_NAMES", () => {
    for (const key of Object.keys(PLAN_NAMES)) {
      expect(PLANS[key].name).toBe(PLAN_NAMES[key]);
    }
  });

  it("PLAN_CREDITS debería tener valores positivos", () => {
    for (const val of Object.values(PLAN_CREDITS)) {
      expect(val).toBeGreaterThan(0);
    }
  });

  it("BOOST_AMOUNT debería ser 2.99", () => {
    expect(BOOST_AMOUNT).toBe(2.99);
  });

  it("CERTIFICATE_AMOUNT debería ser 4.99", () => {
    expect(CERTIFICATE_AMOUNT).toBe(4.99);
  });

  it("PORTFOLIO_AMOUNT debería ser 9.99", () => {
    expect(PORTFOLIO_AMOUNT).toBe(9.99);
  });
});
