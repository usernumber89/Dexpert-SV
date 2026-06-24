import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { TalentPoolPanel } from "@/features/pyme/components/premium/TalentPoolPanel";

export default async function TalentPoolPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/sign-in");

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F4F9FF] via-white to-[#EEF6FF]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 sm:py-8 space-y-6">
        <div>
          <p className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-brand-mid mb-1">
            Premium · Talent Pool
          </p>
          <h1 className="text-xl sm:text-2xl font-bold text-ink-primary">
            Mis Estudiantes Favoritos
          </h1>
          <p className="text-xs sm:text-sm text-ink-secondary mt-1">
            Guardá estudiantes destacados para contactarlos cuando tengas proyectos disponibles
          </p>
        </div>
        <TalentPoolPanel />
      </div>
    </div>
  );
}
