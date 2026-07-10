import { describe, it, expect, vi, beforeAll, beforeEach } from "vitest";

const mockGetUser = vi.fn();
const mockFrom = vi.fn();
const mockFetch = vi.fn();

vi.mock("@/lib/supabase/server", () => ({
  createClient: () => ({
    auth: { getUser: mockGetUser },
    from: mockFrom,
  }),
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

describe("Certificate Checkout", () => {
  beforeAll(() => {
    process.env.NEXT_PUBLIC_APP_URL = "https://dexpert.app";
  });

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("debería retornar 401 si no hay usuario", async () => {
    mockGetUser.mockResolvedValue({ data: { user: null } });
    const { POST } = await import("../route");
    const res = await POST(new Request("https://dexpert.app/api/wompi/certificate-checkout", { method: "POST", body: JSON.stringify({ certificateId: "cert-1" }) }));
    expect(res.status).toBe(401);
  });

  it("debería retornar 400 si falta certificateId", async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: "user-1" } } });
    const { POST } = await import("../route");
    const res = await POST(new Request("https://dexpert.app/api/wompi/certificate-checkout", { method: "POST", body: JSON.stringify({}) }));
    expect(res.status).toBe(400);
  });

  it("debería retornar 404 si el estudiante no existe", async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: "user-1" } } });
    mockFrom.mockImplementation(() => ({
      select: () => ({ eq: () => ({ single: () => Promise.resolve({ data: null, error: new Error("Not found") }) }) }),
    }));
    const { POST } = await import("../route");
    const res = await POST(new Request("https://dexpert.app/api/wompi/certificate-checkout", { method: "POST", body: JSON.stringify({ certificateId: "cert-1" }) }));
    expect(res.status).toBe(404);
  });

  it("debería retornar URL de pago en caso exitoso", async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: "user-1" } } });
    mockFrom.mockImplementation(() => ({
      select: () => ({ eq: () => ({ single: () => Promise.resolve({ data: { id: "student-1" }, error: null }) }) }),
    }));
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ urlEnlace: "https://wompi.sv/pay/cert" }),
    });
    const { POST } = await import("../route");
    const res = await POST(new Request("https://dexpert.app/api/wompi/certificate-checkout", { method: "POST", body: JSON.stringify({ certificateId: "cert-1" }) }));
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.url).toBe("https://wompi.sv/pay/cert");
  });
});
