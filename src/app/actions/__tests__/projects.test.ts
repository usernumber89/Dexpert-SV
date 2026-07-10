import { describe, it, expect, vi, beforeEach } from "vitest";

// ── Mocks ──────────────────────────────────────────────────────────
const mockRevalidatePath = vi.fn();
vi.mock("next/cache", () => ({
  revalidatePath: mockRevalidatePath,
}));

// Mock del admin client (createClient de @supabase/supabase-js)
const mockAdminFrom = vi.fn();
const mockAdminRpc = vi.fn();
vi.mock("@supabase/supabase-js", () => ({
  createClient: () => ({
    from: mockAdminFrom,
    rpc: mockAdminRpc,
  }),
}));

// Mock del server client
const mockServerFrom = vi.fn();
const mockServerGetUser = vi.fn();
vi.mock("@/lib/supabase/server", () => ({
  createClient: async () => ({
    auth: { getUser: mockServerGetUser },
    from: mockServerFrom,
  }),
}));

// ── Tests ──────────────────────────────────────────────────────────
describe("completeProject", () => {
  const projectId = "proj-001";

  beforeEach(() => {
    vi.clearAllMocks();
    process.env.NEXT_PUBLIC_SUPABASE_URL = "https://test.supabase.co";
    process.env.SUPABASE_SERVICE_ROLE_KEY = "service-role-key-test";
  });

  it("debería retornar error si no hay usuario autenticado", async () => {
    mockServerGetUser.mockResolvedValue({ data: { user: null }, error: { message: "No auth" } });

    const { completeProject } = await import("../projects");
    const result = await completeProject(projectId);

    expect(result.success).toBe(false);
    expect(result.error).toContain("No autorizado");
  });

  it("debería retornar error si no hay applications ACCEPTED", async () => {
    mockServerGetUser.mockResolvedValue({ data: { user: { id: "user-1" } }, error: null });
    mockServerFrom.mockImplementation((table: string) => {
      if (table === "applications") {
        return { select: () => ({ eq: () => ({ eq: () => Promise.resolve({ data: [], error: null }) }) }) };
      }
      return {};
    });

    const { completeProject } = await import("../projects");
    const result = await completeProject(projectId);

    expect(result.success).toBe(false);
    expect(result.error).toContain("No se encontró ningún estudiante");
  });

  it("debería completar proyecto exitosamente con portfolio+XP+certificados", async () => {
    mockServerGetUser.mockResolvedValue({ data: { user: { id: "user-1" } }, error: null });

    const applications = [
      { id: "app-1", student_id: "stud-1" },
      { id: "app-2", student_id: "stud-2" },
    ];

    const chain: Record<string, any> = {};
    chain.applications = {
      select: () => ({
        eq: () => ({
          eq: () => Promise.resolve({ data: applications, error: null }),
          in: () => ({
            select: () => Promise.resolve({ data: applications, error: null }),
          }),
        }),
      }),
      update: () => ({
        in: () => ({
          select: () => Promise.resolve({ data: applications, error: null }),
        }),
      }),
    };
    chain.projects = {
      select: () => ({
        eq: () => ({
          single: () => Promise.resolve({ data: { title: "Mi Proyecto", description: "Desc" } }),
        }),
      }),
      update: () => ({
        eq: () => Promise.resolve({ error: null }),
      }),
    };

    mockServerFrom.mockImplementation((table: string) => chain[table] || {});

    // Admin: no existing experience, no existing portfolios
    mockAdminFrom.mockImplementation((table: string) => {
      if (table === "student_experience") {
        return { select: () => ({ in: () => Promise.resolve({ data: [], error: null }) }) };
      }
      if (table === "portfolio_entries") {
        return {
          select: () => ({
            eq: () => ({
              eq: () => ({
                in: () => Promise.resolve({ data: [], error: null }),
              }),
            }),
          }),
          insert: () => Promise.resolve({ error: null }),
        };
      }
      if (table === "certificates") {
        return { insert: () => ({ select: () => Promise.resolve({ data: [{ id: "cert-1" }], error: null }) }) };
      }
      if (table === "student_experience") {
        return { select: () => ({ in: () => Promise.resolve({ data: [], error: null }) }) };
      }
      return { select: vi.fn(), eq: vi.fn(), single: vi.fn(), update: vi.fn(), insert: vi.fn(), in: vi.fn() };
    });

    // Need to handle the second mockAdminFrom call for the insert
    let callCount = 0;
    mockAdminFrom.mockImplementation((table: string) => {
      callCount++;
      if (table === "student_experience") {
        if (callCount <= 2) {
          // First call: select existing experiences
          return { select: () => ({ in: () => Promise.resolve({ data: [], error: null }) }) };
        }
        // Subsequent calls: update/insert experience
        return { update: () => ({ eq: () => Promise.resolve({ error: null }) }), insert: () => Promise.resolve({ error: null }) };
      }
      if (table === "portfolio_entries") {
        return {
          select: () => ({
            eq: () => ({
              eq: () => ({
                in: () => Promise.resolve({ data: [], error: null }),
              }),
            }),
          }),
          insert: () => Promise.resolve({ error: null }),
        };
      }
      if (table === "certificates") {
        return { insert: () => ({ select: () => Promise.resolve({ data: [{ id: "cert-1" }], error: null }) }) };
      }
      return { select: vi.fn(), eq: vi.fn(), single: vi.fn(), update: vi.fn(), insert: vi.fn(), in: vi.fn() };
    });

    const { completeProject } = await import("../projects");
    const result = await completeProject(projectId);

    expect(result.success).toBe(true);
    expect(result.certificates).toBeDefined();
    expect(mockRevalidatePath).toHaveBeenCalledWith("/student/portfolio");
    expect(mockRevalidatePath).toHaveBeenCalledWith("/student/dashboard");
    expect(mockRevalidatePath).toHaveBeenCalledWith("/pyme/dashboard");
  });

  it("debería actualizar XP existente y no duplicar portfolios", async () => {
    mockServerGetUser.mockResolvedValue({ data: { user: { id: "user-1" } }, error: null });

    const applications = [{ id: "app-1", student_id: "stud-1" }];

    mockServerFrom.mockImplementation((table: string) => {
      if (table === "applications") {
        return {
          select: () => ({
            eq: () => ({
              eq: () => Promise.resolve({ data: applications, error: null }),
              in: () => ({ select: () => Promise.resolve({ data: applications, error: null }) }),
            }),
          }),
          update: () => ({
            in: () => ({ select: () => Promise.resolve({ data: applications, error: null }) }),
          }),
        };
      }
      if (table === "projects") {
        return {
          select: () => ({
            eq: () => ({ single: () => Promise.resolve({ data: { title: "Test", description: null } }) }),
          }),
          update: () => ({ eq: () => Promise.resolve({ error: null }) }),
        };
      }
      return {};
    });

    let adminCallIndex = 0;
    mockAdminFrom.mockImplementation((table: string) => {
      adminCallIndex++;
      if (table === "student_experience") {
        if (adminCallIndex <= 2) {
          // select existing - student already has experience
          return { select: () => ({ in: () => Promise.resolve({ data: [{ student_id: "stud-1", real_projects_completed: 2, total_xp: 300, id: "exp-1" }], error: null }) }) };
        }
        // update existing XP
        return { update: () => ({ eq: () => Promise.resolve({ error: null }) }) };
      }
      if (table === "portfolio_entries") {
        return {
          select: () => ({
            eq: () => ({
              eq: () => ({
                in: () => Promise.resolve({ data: [{ student_id: "stud-1" }], error: null }),
              }),
            }),
          }),
          // no insert should happen because portfolio already exists
        };
      }
      if (table === "certificates") {
        return { insert: () => ({ select: () => Promise.resolve({ data: [{ id: "cert-1" }], error: null }) }) };
      }
      return { select: vi.fn(), eq: vi.fn(), single: vi.fn(), update: vi.fn(), insert: vi.fn(), in: vi.fn() };
    });

    const { completeProject } = await import("../projects");
    const result = await completeProject(projectId);

    expect(result.success).toBe(true);
  });
});

describe("deleteProject", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("debería retornar error si no hay usuario autenticado", async () => {
    mockServerGetUser.mockResolvedValue({ data: { user: null }, error: { message: "No auth" } });

    const { deleteProject } = await import("../projects");
    const result = await deleteProject("proj-001");

    expect(result.success).toBe(false);
    expect(result.error).toContain("No autorizado");
  });

  it("debería eliminar proyecto y revalidar paths", async () => {
    mockServerGetUser.mockResolvedValue({ data: { user: { id: "user-1" } }, error: null });
    mockServerFrom.mockImplementation((table: string) => {
      if (table === "projects") {
        return { delete: () => ({ eq: () => Promise.resolve({ error: null }) }) };
      }
      return {};
    });

    const { deleteProject } = await import("../projects");
    const result = await deleteProject("proj-001");

    expect(result.success).toBe(true);
    expect(mockRevalidatePath).toHaveBeenCalledWith("/pyme/dashboard");
    expect(mockRevalidatePath).toHaveBeenCalledWith("/pyme/in-progress");
  });
});
