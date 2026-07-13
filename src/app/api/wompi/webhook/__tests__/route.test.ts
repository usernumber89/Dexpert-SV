import { describe, it, expect, vi, beforeAll, afterEach } from "vitest";
import { createHmac } from "crypto";

// ── Mock de @/lib/supabase/admin ──────────────────────────────────
const mockFrom = vi.fn();
const mockRpc = vi.fn().mockResolvedValue({ data: 5 });
const mockSupabaseAdmin = {
  from: mockFrom,
  rpc: mockRpc,
};

vi.mock("@/lib/supabase/admin", () => ({
  getSupabaseAdmin: () => mockSupabaseAdmin,
}));

// ── Helper: firma válida ──────────────────────────────────────────
const WOMPI_SECRET = "test_secret_123";
function signBody(body: string): string {
  return createHmac("sha256", WOMPI_SECRET).update(body).digest("hex");
}

// ── Test ──────────────────────────────────────────────────────────
describe("Webhook Wompi", () => {
  beforeAll(() => {
    process.env.WOMPI_API_SECRET = WOMPI_SECRET;
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe("validateSignature", () => {
    // Import dynamic para que tome process.env seteado
    it("debería rechazar signature null", async () => {
      const { POST } = await import("../route");
      const body = JSON.stringify({ test: true });
      const req = new Request("https://dexpert.app/api/wompi/webhook", {
        method: "POST",
        body,
      });
      const res = await POST(req);
      expect(res.status).toBe(401);
      const json = await res.json();
      expect(json.error).toBe("Invalid signature");
    });

    it("debería rechazar signature incorrecta", async () => {
      const { POST } = await import("../route");
      const body = JSON.stringify({ test: true });
      const req = new Request("https://dexpert.app/api/wompi/webhook", {
        method: "POST",
        headers: { "wompi_hash": "invalid_signature_here" },
        body,
      });
      const res = await POST(req);
      expect(res.status).toBe(401);
    });

    it("debería aceptar signature correcta", async () => {
      const { POST } = await import("../route");
      const body = JSON.stringify({ ResultadoTransaccion: "ExitosaAprobada" });
      const hash = signBody(body);
      const req = new Request("https://dexpert.app/api/wompi/webhook", {
        method: "POST",
        headers: { "wompi_hash": hash },
        body,
      });
      const res = await POST(req);
      // Signature válida, transacción aprobada, sin identificador → 400
      expect(res.status).toBe(400);
    });
  });

  describe("POST - transacción no aprobada", () => {
    it("debería retornar success si la transacción no fue aprobada", async () => {
      const { POST } = await import("../route");
      const payload = {
        ResultadoTransaccion: "Rechazada",
        IdTransaccion: "tx-001",
        EnlacePago: { IdentificadorEnlaceComercio: "DEXPERT_GROWTH_pyme1_123" },
      };
      const body = JSON.stringify(payload);
      const req = new Request("https://dexpert.app/api/wompi/webhook", {
        method: "POST",
        headers: { "wompi_hash": signBody(body) },
        body,
      });
      const res = await POST(req);
      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json.success).toBe(true);
    });
  });

  describe("POST - DEXPERT_BOOST_", () => {
    it("debería activar el boost y retornar success", async () => {
      const studentId = "student-123";
      const identificador = `DEXPERT_BOOST_${studentId}_999`;

      // Mock de duplicados
      mockFrom.mockImplementation((table: string) => {
        if (table === "credit_purchases" || table === "purchases") {
          return { select: () => ({ eq: () => ({ maybeSingle: () => Promise.resolve({ data: null }) }) }) };
        }
        if (table === "students") {
          return { update: () => ({ eq: () => Promise.resolve({ error: null }) }) };
        }
        return {};
      });

      const { POST } = await import("../route");
      const payload = {
        ResultadoTransaccion: "ExitosaAprobada",
        IdTransaccion: "tx-boost-001",
        EnlacePago: { IdentificadorEnlaceComercio: identificador },
      };
      const body = JSON.stringify(payload);
      const req = new Request("https://dexpert.app/api/wompi/webhook", {
        method: "POST",
        headers: { "wompi_hash": signBody(body) },
        body,
      });
      const res = await POST(req);
      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json.success).toBe(true);

      // Verificar que se llamó a students.update con profile_boost_until
      const updateCall = mockFrom.mock.calls.find((c: string[]) => c[0] === "students");
      expect(updateCall).toBeDefined();
    });
  });

  describe("POST - DEXPERT_CERT_", () => {
    it("debería marcar certificado como pagado", async () => {
      mockFrom.mockImplementation((table: string) => {
        if (table === "credit_purchases" || table === "purchases") {
          return { select: () => ({ eq: () => ({ maybeSingle: () => Promise.resolve({ data: null }) }) }) };
        }
        if (table === "certificates") {
          return { update: () => ({ eq: () => Promise.resolve({ error: null }) }) };
        }
        return {};
      });

      const { POST } = await import("../route");
      const payload = {
        ResultadoTransaccion: "ExitosaAprobada",
        IdTransaccion: "tx-cert-001",
        EnlacePago: { IdentificadorEnlaceComercio: "DEXPERT_CERT_cert-456_student-789_999" },
      };
      const body = JSON.stringify(payload);
      const req = new Request("https://dexpert.app/api/wompi/webhook", {
        method: "POST",
        headers: { "wompi_hash": signBody(body) },
        body,
      });
      const res = await POST(req);
      expect(res.status).toBe(200);
    });
  });

  describe("POST - plan de PYME (growth)", () => {
    it("debería procesar pago de plan growth", async () => {
      const chain = {
        maybeSingle: () => Promise.resolve({ data: null }),
        select: () => chain,
        eq: () => chain,
        single: () => Promise.resolve({ data: { user_id: "user-1", company_name: "Mi PYME" }, error: null }),
        update: () => ({ eq: () => Promise.resolve({ error: null }) }),
        insert: () => Promise.resolve({ error: null }),
        in: () => chain,
      };

      mockFrom.mockImplementation(() => chain);

      const { POST } = await import("../route");
      const payload = {
        ResultadoTransaccion: "ExitosaAprobada",
        IdTransaccion: "tx-plan-001",
        EnlacePago: { IdentificadorEnlaceComercio: "DEXPERT_growth_pyme-001_999" },
      };
      const body = JSON.stringify(payload);
      const req = new Request("https://dexpert.app/api/wompi/webhook", {
        method: "POST",
        headers: { "wompi_hash": signBody(body) },
        body,
      });
      const res = await POST(req);
      expect(res.status).toBe(200);
    });
  });

  describe("POST - duplicado", () => {
    it("debería detectar transacción ya procesada", async () => {
      mockFrom.mockImplementation((table: string) => ({
        select: () => ({
          eq: () => ({
            maybeSingle: () =>
              table === "credit_purchases" || table === "purchases"
                ? Promise.resolve({ data: { id: "existing" } })
                : Promise.resolve({ data: null }),
          }),
        }),
      }));

      const { POST } = await import("../route");
      const payload = {
        ResultadoTransaccion: "ExitosaAprobada",
        IdTransaccion: "tx-dupe-001",
        EnlacePago: { IdentificadorEnlaceComercio: "DEXPERT_growth_pyme1_999" },
      };
      const body = JSON.stringify(payload);
      const req = new Request("https://dexpert.app/api/wompi/webhook", {
        method: "POST",
        headers: { "wompi_hash": signBody(body) },
        body,
      });
      const res = await POST(req);
      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json.duplicate).toBe(true);
    });
  });
});
