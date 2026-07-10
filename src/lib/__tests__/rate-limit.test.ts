import { describe, it, expect } from "vitest";
import { getRateLimitKey, rateLimitResponse } from "@/lib/rate-limit";

describe("rate-limit", () => {
  it("getRateLimitKey debería concatenar endpoint + identifier", () => {
    expect(getRateLimitKey("user-1", "checkout")).toBe("checkout:user-1");
  });

  it("rateLimitResponse debería retornar 429", async () => {
    const res = rateLimitResponse();
    expect(res.status).toBe(429);
    const json = await res.json();
    expect(json.error).toBe("Too many requests");
  });
});
