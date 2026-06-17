import { createClient } from "@/lib/supabase/server"; 
import { Award, ExternalLink, Calendar, Building, AlertCircle } from "lucide-react";
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

  // 1. Consulta corregida con la columna exacta: company_name
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
      detalles: error.details,
      sugerencia: error.hint,
      codigo: error.code
    });
  }console.log("🔍 === DEBUG DEXPERT CERTIFICADOS ===");
  console.log("¿Qué está devolviendo Supabase?:", JSON.stringify(certificates, null, 2));
  console.log("======================================");

  // 2. Mapeo y normalización de datos usando cert.applications -> projects -> pymes
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
      pymeName: pyme?.company_name || "Empresa desconocida", // 👈 Extraído correctamente aquí
      projectDescription: project?.description || "Sin descripción disponible."
    };
  }) || [];

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      {/* Encabezado */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between border-b border-gray-200 pb-6 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight flex items-center gap-3">
            <Award className="h-8 w-8 text-indigo-600" />
            Mis Certificados
          </h1>
          <p className="text-gray-500 mt-2">
            Aquí encontrarás las certificaciones oficiales de tus proyectos completados con éxito.
          </p>
        </div>
      </div>

      {/* Alerta de Error */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3 text-red-700">
          <AlertCircle className="h-5 w-5 mt-0.5 flex-shrink-0" />
          <div>
            <p className="font-semibold">Hubo un problema al cargar tus documentos</p>
            <p className="text-sm opacity-90">Por favor, intenta recargar la página o contacta al soporte técnico.</p>
          </div>
        </div>
      )}

      {/* Estado Vacío */}
      {!error && mappedCertificates.length === 0 && (
        <div className="text-center py-16 bg-white border border-dashed border-gray-300 rounded-2xl p-8 shadow-sm">
          <div className="mx-auto w-14 h-14 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center mb-4">
            <Award className="h-7 w-7" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-1">Aún no tienes certificados disponibles</h3>
          <p className="text-gray-500 max-w-sm mx-auto text-sm">
            Tus certificados aparecerán aquí de forma automática una vez que las empresas aliadas marquen tus proyectos postulados como finalizados.
          </p>
        </div>
      )}

      {/* Grid de Tarjetas */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {mappedCertificates.map((cert: MappedCertificate) => (
          <div 
            key={cert.id} 
            className="group relative bg-white border border-gray-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all duration-200 flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                  Completado
                </span>
                <span className="text-xs text-gray-400 flex items-center gap-1">
                  <Calendar className="h-3.5 w-3.5" />
                  {cert.createdAt}
                </span>
              </div>

              <h3 className="text-xl font-bold text-gray-900 group-hover:text-indigo-600 transition-colors duration-150 line-clamp-1">
                {cert.projectTitle}
              </h3>

              <p className="text-sm font-medium text-gray-600 mt-2 flex items-center gap-1.5">
                <Building className="h-4 w-4 text-gray-400" />
                {cert.pymeName}
              </p>

              <p className="text-sm text-gray-500 mt-3 line-clamp-2">
                {cert.projectDescription}
              </p>
            </div>

            <div className="mt-6 pt-4 border-t border-gray-100">
              <Link
                href={cert.url}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-gray-50 border border-gray-200 text-sm font-medium text-gray-700 rounded-xl hover:bg-indigo-600 hover:text-white hover:border-indigo-600 transition-all duration-200"
              >
                Ver Certificado Oficial
                <ExternalLink className="h-4 w-4" />
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}