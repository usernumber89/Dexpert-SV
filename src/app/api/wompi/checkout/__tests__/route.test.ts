import { describe, it, expect, vi, beforeAll, beforeEach } from "vitest";

// ── Mocks ─────────────────────────────────────────────────────────
const mockGetUser = vi.fn();
const mockFrom = vi.fn();
const mockFetch = vi.fn();

vi.mock("@/lib/supabase/server", () => ({
  createClient: () => ({
    auth: { getUser: mockGetUser },
    from: mockFrom,
  }),
}));

vi.mock("@/lib/supabase/admin", () => ({
  getSupabaseAdmin: () => ({ from: mockFrom }),
}));

vi.mock("@/lib/wompi", () => ({
  getWompiToken: () => Promise.resolve("mock_wompi_token"),
}));

vi.mock("@/lib/rate-limit", () => ({
  checkRateLimit: () => true,
  getRateLimitKey: () => "key",
  rateLimitResponse: () => new Response("{}", { status: 429 }),
}));

global.fetch = mockFetch;

// ── Tests ─────────────────────────────────────────────────────────
describe("Checkout Wompi", () => {
  beforeAll(() => {
    process.env.NEXT_PUBLIC_APP_URL = "https://dexpert.app";
    process.env.NEXT_PUBLIC_SUPABASE_URL = "https://test.supabase.co";
    process.env.SUPABASE_SERVICE_ROLE_KEY = "test-service-key";
  });

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("POST", () => {
    it("debería retornar 401 si no hay usuario autenticado", async () => {
      mockGetUser.mockResolvedValue({ data: { user: null } });

      const { POST } = await import("../route");
      const req = new Request("https://dexpert.app/api/wompi/checkout", {
        method: "POST",
        body: JSON.stringify({ plan: "growth" }),
      });
      const res = await POST(req);
      expect(res.status).toBe(401);
    });

    it("debería retornar 400 si el plan es inválido", async () => {
      mockGetUser.mockResolvedValue({ data: { user: { id: "user-1" } } });

      const { POST } = await import("../route");
      const req = new Request("https://dexpert.app/api/wompi/checkout", {
        method: "POST",
        body: JSON.stringify({ plan: "invalid_plan" }),
      });
      const res = await POST(req);
      expect(res.status).toBe(400);
    });

    it("debería retornar 404 si la PYME no existe", async () => {
      mockGetUser.mockResolvedValue({ data: { user: { id: "user-1" } } });
      mockFrom.mockImplementation(() => ({
        select: () => ({
          eq: () => ({ single: () => Promise.resolve({ data: null, error: new Error("Not found") }) }),
        }),
      }));

      const { POST } = await import("../route");
      const req = new Request("https://dexpert.app/api/wompi/checkout", {
        method: "POST",
        body: JSON.stringify({ plan: "growth" }),
      });
      const res = await POST(req);
      expect(res.status).toBe(404);
    });

    it("debería retornar URL de pago en caso exitoso", async () => {
      mockGetUser.mockResolvedValue({ data: { user: { id: "user-1" } } });

      const chain = {
        select: () => chain,
        eq: () => chain,
        single: () => Promise.resolve({ data: { id: "pyme-1" }, error: null }),
        in: () => chain,
      };
      mockFrom.mockImplementation(() => chain);

      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ urlEnlace: "https://wompi.sv/pay/123" }),
      });

      const { POST } = await import("../route");
      const req = new Request("https://dexpert.app/api/wompi/checkout", {
        method: "POST",
        body: JSON.stringify({ plan: "growth" }),
      });
      const res = await POST(req);
      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json.url).toBe("https://wompi.sv/pay/123");
    });

    it("debería retornar error 500 si Wompi no devuelve URL", async () => {
      mockGetUser.mockResolvedValue({ data: { user: { id: "user-1" } } });

      const chain = {
        select: () => chain,
        eq: () => chain,
        single: () => Promise.resolve({ data: { id: "pyme-1" }, error: null }),
        in: () => chain,
      };
      mockFrom.mockImplementation(() => chain);

      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({}),
      });

      const { POST } = await import("../route");
      const req = new Request("https://dexpert.app/api/wompi/checkout", {
        method: "POST",
        body: JSON.stringify({ plan: "growth" }),
      });
      const res = await POST(req);
      expect(res.status).toBe(500);
    });
  });
});
