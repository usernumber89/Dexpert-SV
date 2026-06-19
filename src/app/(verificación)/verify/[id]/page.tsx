import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { CheckCircle2, AlertTriangle, Building2, Briefcase, GraduationCap, Calendar } from "lucide-react";

interface VerifyPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function VerifyCertificatePage({ params }: VerifyPageProps) {
  const resolvedParams = await params;
  const certificateId = resolvedParams.id;
  const supabase = await createClient();

  // Consultamos usando el ID único del certificado
  const { data: certificate } = await supabase
    .from("certificates")
    .select(`
      id,
      created_at,
      applications (
        id,
        students!student_id ( full_name ),
        projects (
          id,
          title,
          pymes ( company_name )
        )
      )
    `)
    .eq("id", certificateId)
    .single();

  // Desempaquetado seguro de relaciones idéntico a tu API de PDF
  const application = Array.isArray(certificate?.applications)
    ? certificate.applications[0]
    : certificate?.applications;

  const studentData = Array.isArray(application?.students)
    ? application?.students[0]
    : application?.students;

  const project = Array.isArray(application?.projects)
    ? application?.projects[0]
    : application?.projects;

  const pyme = Array.isArray(project?.pymes)
    ? project?.pymes[0]
    : project?.pymes;

  const formattedDate = certificate?.created_at
    ? new Date(certificate.created_at).toLocaleDateString("es-SV", {
        day: "2-digit",
        month: "long",
        year: "numeric",
      })
    : null;

  // Estado: No encontrado
  if (!certificate) {
    return (
      <div className="min-h-screen bg-[#FCFCFA] flex flex-col items-center justify-center p-4">
        <div className="max-w-md w-full bg-white border border-red-100 rounded-2xl p-8 text-center shadow-sm">
          <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto text-red-500 mb-4">
            <AlertTriangle className="w-8 h-8" />
          </div>
          <h1 className="text-xl font-bold text-[#0A2647] mb-2">Certificado No Válido</h1>
          <p className="text-sm text-slate-500 mb-6">
            El código ingresado no coincide con ningún registro en nuestro sistema de acreditación segura. Por favor revisa el ID e inténtalo de nuevo.
          </p>
          <Link
            href="/"
            className="inline-flex w-full justify-center rounded-xl bg-[#0A2647] px-4 py-2.5 text-sm font-semibold text-white shadow hover:bg-[#1E4E8C] transition-colors"
          >
            Ir al inicio
          </Link>
        </div>
      </div>
    );
  }

  // Estado: Verificado Exitosamente
  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center p-4 antialiased">
      <div className="max-w-2xl w-full bg-white border border-slate-100 rounded-3xl shadow-xl overflow-hidden">
        
        {/* Encabezado de la Tarjeta */}
        <div className="bg-[#0A2647] px-8 py-8 text-center relative border-b-4 border-[#D4A843]">
          <div className="absolute top-4 right-4 text-[#D4A843] font-black tracking-widest text-xs opacity-40">
            DEXPERT SECURE
          </div>
          <div className="w-14 h-14 bg-emerald-500/10 border border-emerald-500/30 rounded-full flex items-center justify-center mx-auto mb-3 text-emerald-400 shadow-inner">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-bold text-white">Certificado Auténtico</h1>
          <p className="text-xs text-slate-300 mt-1">Ecosistema Oficial de Validación y Acreditación</p>
        </div>

        {/* Cuerpo de Información */}
        <div className="p-8 space-y-6">
          <div className="text-center pb-4 border-b border-slate-100">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400 block mb-1">
              Código Único de Registro
            </span>
            <span className="text-sm font-mono font-semibold text-slate-700 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200">
              {certificate.id}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Estudiante */}
            <div className="flex items-start gap-3">
              <div className="mt-0.5 p-2 bg-blue-50 text-[#1B5597] rounded-xl">
                <GraduationCap className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wide">Estudiante Certificado</h4>
                <p className="text-base font-semibold text-slate-800 mt-0.5">{studentData?.full_name || "Estudiante de Dexpert"}</p>
              </div>
            </div>

            {/* Organización Aliada */}
            <div className="flex items-start gap-3">
              <div className="mt-0.5 p-2 bg-amber-50 text-[#D4A843] rounded-xl">
                <Building2 className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wide">Organización Aliada (PYME)</h4>
                <p className="text-base font-semibold text-slate-800 mt-0.5">{pyme?.company_name || "Empresa Corporativa"}</p>
              </div>
            </div>

            {/* Proyecto */}
            <div className="flex items-start gap-3 md:col-span-2">
              <div className="mt-0.5 p-2 bg-slate-100 text-slate-600 rounded-xl">
                <Briefcase className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wide">Proyecto Ejecutado</h4>
                <p className="text-base font-semibold text-slate-800 mt-0.5 italic">
                  "{project?.title || "Proyecto de Consultoría Tecnológica"}"
                </p>
              </div>
            </div>

            {/* Fecha de Emisión */}
            <div className="flex items-start gap-3">
              <div className="mt-0.5 p-2 bg-purple-50 text-purple-600 rounded-xl">
                <Calendar className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wide">Fecha de Acreditación</h4>
                <p className="text-sm font-medium text-slate-700 mt-0.5">{formattedDate || "N/A"}</p>
              </div>
            </div>

            {/* Emisor */}
            <div className="flex items-start gap-3">
              <div className="mt-0.5 p-2 bg-emerald-50 text-emerald-600 rounded-xl">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wide">Entidad Emisora</h4>
                <p className="text-sm font-medium text-slate-700 mt-0.5">Dexpert (El Salvador)</p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer de la tarjeta */}
        <div className="bg-slate-50 px-8 py-5 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-center sm:text-left">
          <p className="text-xs text-slate-400">
            Este documento cumple con los estándares internos de auditoría de Dexpert.
          </p>
          <Link
            href="/"
            className="text-xs font-semibold text-[#1B5597] hover:underline whitespace-nowrap"
          >
            Saber más de Dexpert →
          </Link>
        </div>
      </div>
    </div>
  );
}