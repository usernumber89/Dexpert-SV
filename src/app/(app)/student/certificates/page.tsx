import { createClient } from "@/lib/supabase/server"; 
import { Award, ExternalLink, Calendar, Building, AlertCircle, ChevronRight, CheckCircle, FileText } from "lucide-react";
import Link from "next/link";

interface MappedCertificate {
  id: string;
  url: string;
  createdAt: string;
  projectTitle: string;
  pymeName: string;
  projectDescription: string;
}

export default async function StudentCertificatesPage() {
  const supabase = await createClient();

  // 1. Consulta limpia y eficiente
  const { data: certificates, error } = await supabase
    .from("certificates")
    .select(`
      id,
      url,
      created_at,
      applications (
        id,
        status,
        projects (
          id,
          title,
          description,
          pymes (
            id,
            company_name
          )
        )
      )
    `);

  if (error) {
    console.error("❌ Error cargando certificados:", {
      mensaje: error.message,
      codigo: error.code
    });
  }

  // 2. Mapeo seguro con Normalización Automática
  const mappedCertificates: MappedCertificate[] = certificates?.map((cert: any) => {
    const application = Array.isArray(cert.applications) ? cert.applications[0] : cert.applications;
    const project = Array.isArray(application?.projects) ? application?.projects[0] : application?.projects;
    const pyme = Array.isArray(project?.pymes) ? project?.pymes[0] : project?.pymes;

    return {
      id: cert.id,
      url: cert.url,
      createdAt: cert.created_at 
        ? new Date(cert.created_at).toLocaleDateString("es-SV", {
            day: "2-digit",
            month: "long",
            year: "numeric"
          })
        : "Fecha no disponible",
      projectTitle: project?.title || "Proyecto sin título",
      pymeName: pyme?.company_name || "Empresa aliada", 
      projectDescription: project?.description || "Sin descripción disponible."
    };
  }) || [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F4F9FF] via-white to-[#EEF6FF] pb-16">
      {/* Encabezado Principal */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 pb-6">
        <div className="flex flex-col gap-2 border-b border-gray-100 pb-6">
          <div className="inline-flex items-center gap-1.5 self-start px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 text-[#0D3A6E] border border-blue-100">
            <Award className="h-3.5 w-3.5 text-[#38b6ff]" />
            Logros Académicos
          </div>
          <h1 className="text-3xl font-extrabold text-[#0D3A6E] tracking-tight flex items-center gap-3 mt-1">
            Mis Certificados 
          </h1>
          <p className="text-sm text-[#5B8DB8] max-w-2xl">
            Visualiza, descarga y comparte las certificaciones técnicas obtenidas por el desarrollo exitoso de proyectos en la plataforma.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Alerta de Error de Supabase */}
        {error && (
          <div className="mb-8 p-4 bg-red-50 border border-red-200 rounded-2xl flex items-start gap-3 text-red-800 shadow-sm animate-fade-in">
            <AlertCircle className="h-5 w-5 mt-0.5 text-red-600 flex-shrink-0" />
            <div>
              <p className="font-bold text-sm">Hubo un problema de sincronización</p>
              <p className="text-xs text-red-700/90 mt-0.5">No pudimos enlazar tus archivos con la base de datos. Recarga o ponte en contacto con soporte técnico.</p>
            </div>
          </div>
        )}

        {/* Estado Vacío (Empty State) Estilizado */}
        {!error && mappedCertificates.length === 0 && (
          <div className="text-center py-20 bg-white/80 backdrop-blur border border-dashed border-gray-200 rounded-3xl p-8 max-w-lg mx-auto shadow-sm mt-6">
            <div className="mx-auto w-16 h-16 bg-gradient-to-tr from-blue-50 to-indigo-50 text-[#38b6ff] rounded-2xl flex items-center justify-center mb-5 shadow-inner">
              <Award className="h-8 w-8" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Sin certificados por el momento</h3>
            <p className="text-gray-500 text-sm leading-relaxed">
              Tus documentos de acreditación se generarán de forma automática en cuanto la contraparte empresarial declare el proyecto asignado como finalizado.
            </p>
          </div>
        )}

        {/* Grid de Tarjetas Premium */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-2">
          {mappedCertificates.map((cert: MappedCertificate) => (
            <div 
              key={cert.id} 
              className="group relative rounded-2xl border border-gray-100 bg-white shadow-sm transition-all duration-300 hover:border-[#38A3F1]/30 hover:shadow-xl hover:shadow-[#0D3A6E]/5 flex flex-col justify-between overflow-hidden before:absolute before:top-0 before:left-0 before:w-full before:h-1 before:bg-gradient-to-r before:from-[#38b6ff] before:to-[#0D3A6E]"
            >
              {/* Cuerpo Superior de la Tarjeta */}
              <div className="p-6 space-y-4">
                <div className="flex items-center justify-between gap-2">
                  {/* Badge de Estado Centrado y Seguro */}
                  <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-100 flex-shrink-0">
                    <CheckCircle className="h-3.5 w-3.5 text-emerald-600" /> 
                    Completado
                  </span>
                  
                  {/* Fecha de Emisión */}
                  <span className="text-xs font-medium text-[#5B8DB8] flex items-center gap-1.5 bg-slate-50 px-2.5 py-1 rounded-md border border-slate-100">
                    <Calendar className="h-3.5 w-3.5 text-slate-400" />
                    {cert.createdAt}
                  </span>
                </div>

                {/* Título del Proyecto */}
                <h3 className="text-base font-bold text-[#0D3A6E] line-clamp-2 leading-snug group-hover:text-[#38A3F1] transition-colors duration-200">
                  {cert.projectTitle}
                </h3>

                {/* Organización / PYME Aliada */}
                <div className="flex items-center gap-2 bg-gray-50/70 p-2.5 rounded-xl border border-gray-100/60">
                  <div className="w-7 h-7 rounded-lg bg-blue-100/60 text-[#38b6ff] flex items-center justify-center flex-shrink-0">
                    <Building className="h-4 w-4" />
                  </div>
                  <div className="overflow-hidden">
                    <p className="text-[11px] font-medium text-gray-400  tracking-wider leading-none">Empresa</p>
                    <p className="text-sm font-bold text-gray-700 truncate mt-0.5">"{cert.pymeName}"</p>
                  </div>
                </div>

                {/* Descripción Breve */}
                <p className="text-sm text-gray-500 line-clamp-2 leading-relaxed pt-1">
                  {cert.projectDescription}
                </p>
              </div>

              {/* Footer con Botón de Acción Estilizado */}
              <div className="px-6 pb-6 pt-3 bg-gradient-to-t from-gray-50/50 to-white rounded-b-2xl">
                <Link
                  href={cert.url}
                  target="_blank"
                  className="w-full inline-flex items-center justify-center gap-2 text-xs font-bold bg-[#38b6ff] text-[#0D3A6E] hover:bg-[#0D3A6E] hover:text-white px-4 py-3 rounded-xl transition-all duration-300 group/btn border border-[#0D3A6E]/10"
                >
                  <FileText className="w-4 h-4 transition-transform text-white group-hover/btn:scale-110" />
                  <span className="text-white">Visualizar Certificado Oficial</span>
                  <ChevronRight className="w-3.5 h-3.5 ml-0.5 group-hover/btn:translate-x-0.5 text-white transition-transform" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}