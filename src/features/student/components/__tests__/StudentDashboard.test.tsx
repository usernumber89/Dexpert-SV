// @vitest-environment jsdom
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { StudentDashboard } from "../StudentDashboard";

// Mock framer-motion
vi.mock("framer-motion", () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  },
}));

// Mock next/image
vi.mock("next/image", () => ({
  default: ({ src, alt, ...props }: any) => <img src={src} alt={alt} {...props} />,
}));

// Mock next/link
vi.mock("next/link", () => ({
  default: ({ children, href, ...props }: any) => <a href={href} {...props}>{children}</a>,
}));

// Mock next/navigation
vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace: vi.fn() }),
}));

// Mock sonner
vi.mock("sonner", () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}));

// Mock supabase client
vi.mock("@/lib/supabase/client", () => ({
  createClient: () => ({
    channel: () => ({ on: () => ({ subscribe: () => {} }) }),
    removeChannel: () => {},
  }),
}));

describe("StudentDashboard", () => {
  const baseProps = {
    user: { name: "Test Student", avatarUrl: null },
    student: { id: "student-1", full_name: "Test Student", avatar_url: null, profile_boost_until: null },
    applications: [],
    projects: [],
    serverStats: { totalApps: 0, totalAccepted: 0, totalCompleted: 0, totalCerts: 0 },
  };

  it("debería renderizar el nombre del usuario", () => {
    render(<StudentDashboard {...baseProps} />);
    expect(screen.getByText("Test Student")).toBeDefined();
  });

  it("debería mostrar 'Destaca tu perfil' cuando no hay boost activo", () => {
    render(<StudentDashboard {...baseProps} />);
    expect(screen.getByText("Destaca tu perfil")).toBeDefined();
    expect(screen.getByText("Destacar por $2.99")).toBeDefined();
  });

  it("debería mostrar 'Perfil destacado' cuando el boost está activo", () => {
    const futureDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
    const props = {
      ...baseProps,
      student: { ...baseProps.student!, profile_boost_until: futureDate },
    };
    render(<StudentDashboard {...props} />);
    expect(screen.getByText("Perfil destacado")).toBeDefined();
  });

  it("debería mostrar estado 'Sin postulaciones aún' cuando no hay applications", () => {
    render(<StudentDashboard {...baseProps} />);
    expect(screen.getByText("Sin postulaciones aún")).toBeDefined();
  });

  it("debería mostrar las stats correctas", () => {
    const props = {
      ...baseProps,
      serverStats: { totalApps: 5, totalAccepted: 3, totalCompleted: 1, totalCerts: 2 },
    };
    render(<StudentDashboard {...props} />);
    expect(screen.getByText("5")).toBeDefined();
    expect(screen.getByText("3")).toBeDefined();
    expect(screen.getByText("1")).toBeDefined();
    expect(screen.getByText("2")).toBeDefined();
  });
});
