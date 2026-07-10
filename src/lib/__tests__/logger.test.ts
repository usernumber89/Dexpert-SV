import { describe, it, expect } from "vitest";
import { createLogger } from "@/lib/logger";

describe("createLogger", () => {
  it("debería crear un logger con info/warn/error", () => {
    const log = createLogger("test");
    expect(log.info).toBeInstanceOf(Function);
    expect(log.warn).toBeInstanceOf(Function);
    expect(log.error).toBeInstanceOf(Function);
  });

  it("no debería lanzar error al llamar métodos", () => {
    const log = createLogger("test");
    expect(() => log.info("test message")).not.toThrow();
    expect(() => log.warn("test warning")).not.toThrow();
    expect(() => log.error("test error")).not.toThrow();
  });
});
