import { supabaseAdmin } from "@/lib/supabase/admin";
import { notFound } from "next/navigation";
import { EpicPortfolio } from "@/features/portfolio/components/EpicPortfolio";
import type { Metadata } from "next";

const THEMES: Record<string, string> = {
  blue: "from-[#0D3A6E] via-[#1a5a9e] to-[#38A3F1]",
  dark: "from-[#0f0c29] via-[#302b63] to-[#24243e]",
  purple: "from-[#1a0533] via-[#4a1942] to-[#7c3aed]",
  teal: "from-[#003333] via-[#006666] to-[#009999]",
};

function parseSkills(skills: unknown): string[] {
  if (!skills) return [];
  if (Array.isArray(skills)) return skills;
  if (typeof skills === "string") {
    try { const p = JSON.parse(skills); return Array.isArray(p) ? p : [skills]; }
    catch { return [skills]; }
  }
  return [];
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const { data: student } = await supabaseAdmin
    .from("students")
    .select("full_name, portfolio_pdf_paid")
    .eq("id", id)
    .single();

  if (!student || !student.portfolio_pdf_paid) {
    return { title: "Portafolio no disponible" };
  }
  return {
    title: `Portafolio de ${student.full_name}`,
    description: `Portafolio profesional de ${student.full_name} en Dexpert`,
    openGraph: {
      title: `Portafolio de ${student.full_name}`,
      description: `Conoce la trayectoria profesional de ${student.full_name}`,
      type: "profile",
    },
  };
}

export default async function PublicPortfolioPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const { data: student } = await supabaseAdmin
    .from("students")
    .select("*")
    .eq("id", id)
    .single();

  if (!student) notFound();
  if (!student.portfolio_pdf_paid) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#F4F9FF] via-white to-[#EEF6FF] flex items-center justify-center">
        <div className="text-center max-w-md px-6">
          <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-[#F0F7FF] to-[#E8F3FD] rounded-full flex items-center justify-center shadow-lg">
            <svg className="w-9 h-9 text-[#BAD8F7]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
          </div>
          <h1 className="text-2xl font-bold text-[#0D3A6E] mb-3">Portafolio no publicado</h1>
          <p className="text-sm text-[#5B8DB8] leading-relaxed">
            Este portafolio aún no está disponible. El estudiante debe activar su portafolio profesional para compartirlo.
          </p>
        </div>
      </div>
    );
  }

  const skills = parseSkills(student.skills);

  const [entriesResult, activeResult, allAppsResult] = await Promise.all([
    supabaseAdmin
      .from("portfolio_entries")
      .select("*")
      .eq("student_id", id)
      .order("sort_order", { ascending: true })
      .order("completed_at", { ascending: false }),
    supabaseAdmin
      .from("applications")
      .select("id, status, created_at, project:projects(title, description, pyme:pymes(company_name))")
      .eq("student_id", id)
      .eq("status", "ACCEPTED")
      .order("created_at", { ascending: false }),
    supabaseAdmin
      .from("applications")
      .select("id")
      .eq("student_id", id),
  ]);

  const entries = entriesResult.data || [];
  const activeProjs = (activeResult.data || []).map((a: any) => ({
    id: a.id, source_type: "real_project" as const,
    title: a.project?.title || "Proyecto activo",
    description: a.project?.description || null,
    score: null, skills_demonstrated: [],
    completed_at: a.created_at, hours_invested: 0,
    _isActive: true,
  }));

  const appIds = (allAppsResult.data || []).map((a: any) => a.id);
  let certificates: any[] = [];
  if (appIds.length > 0) {
    const { data: certs } = await supabaseAdmin
      .from("certificates")
      .select("*, applications!inner(project:projects(title, pyme:pymes(company_name)))")
      .in("application_id", appIds);
    certificates = certs || [];
  }

  const totalEntries = entries.length + activeProjs.length;
  const totalCertificates = certificates.length;
  const totalSkills = skills.length;

  const themeGrad = THEMES[student.portfolio_theme] || THEMES.blue;

  // Increment view counter (fire and forget)
  supabaseAdmin.from("students").update({ portfolio_views: student.portfolio_views + 1 }).eq("id", id).match(() => {});

  // Fetch premium sections
  const [eduRes, expRes, linksRes] = await Promise.all([
    supabaseAdmin.from("portfolio_education").select("*").eq("student_id", id).order("sort_order"),
    supabaseAdmin.from("portfolio_experience").select("*").eq("student_id", id).order("sort_order"),
    supabaseAdmin.from("portfolio_links").select("*").eq("student_id", id).order("sort_order"),
  ]);

  return (
    <EpicPortfolio
      student={student}
      entries={entries}
      activeProjs={activeProjs}
      certificates={certificates}
      skills={skills}
      totalEntries={totalEntries}
      totalCertificates={totalCertificates}
      totalSkills={totalSkills}
      themeGrad={themeGrad}
      education={eduRes.data || []}
      experience={expRes.data || []}
      links={linksRes.data || []}
    />
  );
}
