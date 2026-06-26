"use client";

import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import {
  Award, Clock, Star,
  BookOpen, Code2, Palette, Megaphone, Building2, Compass, Wrench,
  Sparkles, CheckCircle2, RefreshCw,
  FileText, Calendar, Building, ChevronRight,
  Briefcase,
} from "lucide-react";
import { getPortfolioEntries, getCertificates, CertificateEntry } from "@/app/actions/simulation";
import { CertificateActions } from "./CertificateActions";

const AREA_ICONS: Record<string, typeof Code2> = {
  "Desarrollo de Software": Code2,
  "Diseño Gráfico": Palette,
  "Marketing": Megaphone,
  "Administración": Building2,
  "Arquitectura": Compass,
  "Ingeniería": Wrench,
};

export function PortfolioView() {
  const [entries, setEntries] = useState<any[]>([]);
  const [certificates, setCertificates] = useState<CertificateEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "simulation" | "real_project" | "certificate">("all");

  const fetchData = useCallback(async () => {
    try {
      const [entriesData, certsData] = await Promise.all([
        getPortfolioEntries(),
        getCertificates(),
      ]);
      setEntries(entriesData);
      setCertificates(certsData);
    } catch (err) {
      console.error("Error fetching portfolio data:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    const refresh = () => { if (document.visibilityState === "visible") fetchData(); };
    window.addEventListener("focus", refresh);
    document.addEventListener("visibilitychange", () => {
      if (document.visibilityState === "visible") refresh();
    });
    const interval = setInterval(() => {
      if (document.visibilityState === "visible") fetchData();
    }, 30000);
    return () => {
      window.removeEventListener("focus", refresh);
      clearInterval(interval);
    };
  }, [fetchData]);

  const showCertificates = filter === "certificate";

  const totalHours = entries.reduce((sum, e) => sum + (e.hours_invested || 0), 0);
  const totalProjects = entries.length;
  const totalCertificates = certificates.length;
  const avgScore = entries.length > 0
    ? Math.round(entries.reduce((sum, e) => sum + (e.score || 0), 0) / entries.length)
    : 0;

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#F4F9FF] via-white to-[#EEF6FF] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-[#BAD8F7] border-t-[#38A3F1] rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F4F9FF] via-white to-[#EEF6FF]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-8 space-y-6 sm:space-y-8">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-brand-mid mb-1 sm:mb-2">
              Nivel 3 · Portafolio Automático
            </p>
            <h1 className="text-xl sm:text-2xl font-bold text-ink-primary md:text-3xl">
              Mi Portafolio Profesional
            </h1>
            <p className="text-xs sm:text-sm text-ink-secondary mt-1 sm:mt-2">
              Cada proyecto completado genera evidencia automática de tus competencias
            </p>
          </div>
          <div className="flex items-center gap-2">
            {/*<button
              onClick={async () => {
                try {
                  await fetch("/api/backfill");
                  fetchData();
                } catch {}
              }}
              className="flex items-center gap-1.5 text-xs font-semibold text-[#38A3F1] bg-white border border-[#BAD8F7] px-3 py-2 rounded-xl hover:bg-[#F0F7FF] transition shrink-0"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Sincronizar
            </button>
            <button
              onClick={fetchData}
              className="flex items-center gap-1.5 text-xs font-semibold text-[#5B8DB8] bg-white border border-[#E8F3FD] px-3 py-2 rounded-xl hover:bg-[#F0F7FF] transition shrink-0"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Actualizar
            </button>*/}
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
          {[
            { label: "Proyectos", value: totalProjects, icon: BookOpen, color: "#38A3F1", bg: "#F0F7FF" },
            { label: "Horas invertidas", value: totalHours, icon: Clock, color: "#F59E0B", bg: "#FFFBEB" },
            { label: "Certificados", value: totalCertificates, icon: Award, color: "#1D9E75", bg: "#E1F5EE" },
            { label: "Puntaje promedio", value: `${avgScore}%`, icon: Star, color: "#8B5CF6", bg: "#F5F3FF" },
          ].map((stat) => (
            <div key={stat.label} className="bg-white rounded-xl sm:rounded-2xl border border-[#E8F3FD] p-3 sm:p-5 shadow-sm">
              <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-3">
                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl flex items-center justify-center" style={{ background: stat.bg }}>
                  <stat.icon className="w-4 h-4 sm:w-5 sm:h-5" style={{ color: stat.color }} />
                </div>
              </div>
              <p className="text-lg sm:text-2xl font-bold text-[#0D3A6E]">{stat.value}</p>
              <p className="text-[10px] sm:text-xs text-[#93B8D4] mt-0.5">{stat.label}</p>
            </div>
          ))}
        </div>

        <div className="flex flex-wrap gap-2">
          {[
            { key: "all" as const, label: "Todos" },
            { key: "certificate" as const, label: "Certificados" },
            { key: "simulation" as const, label: "Simulaciones" },
            { key: "real_project" as const, label: "Proyectos reales" },
          ].map((f) => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className="text-xs font-semibold px-3 py-1.5 rounded-full border transition-all"
              style={{
                background: filter === f.key ? "#0D3A6E" : "white",
                color: filter === f.key ? "white" : "#5B8DB8",
                borderColor: filter === f.key ? "#0D3A6E" : "#E8F3FD",
              }}
            >
              {f.label}
            </button>
          ))}
        </div>

        {showCertificates ? (
          certificates.length === 0 ? (
            <div className="flex flex-col items-center gap-4 py-16">
              <div className="w-16 h-16 bg-[#F0F7FF] rounded-2xl flex items-center justify-center">
                <Award className="w-8 h-8 text-[#BAD8F7]" />
              </div>
              <h3 className="text-sm font-semibold text-[#0D3A6E]">Aún no tienes certificados</h3>
              <p className="text-xs text-[#5B8DB8] text-center max-w-md">
                Los certificados se generan automáticamente al completar un proyecto real
              </p>
            </div>
          ) : (
            <CertificateGrid certificates={certificates} />
          )
        ) : (
          <>
            {(filter === "all" || filter === "simulation") && (
              <Section
                title="Simulaciones"
                icon={Code2}
                entries={entries.filter(e => e.source_type === "simulation")}
                emptyMessage="No hay simulaciones aún. Completa una simulación profesional para que aparezca aquí."
              />
            )}
            {(filter === "all" || filter === "real_project") && (
              <Section
                title="Proyectos reales"
                icon={Building}
                entries={entries.filter(e => e.source_type === "real_project")}
                emptyMessage="No hay proyectos reales aún. Postúlate a un proyecto para que aparezca aquí."
              />
            )}
          </>
        )}
      </div>
    </div>
  );
}

function Section({ title, icon: Icon, entries, emptyMessage }: {
  title: string;
  icon: any;
  entries: any[];
  emptyMessage: string;
}) {
  return (
    <section>
      <div className="flex items-center gap-2 mb-4">
        <div className="w-8 h-8 rounded-lg bg-[#F0F7FF] flex items-center justify-center">
          <Icon className="w-4 h-4 text-[#38A3F1]" />
        </div>
        <h2 className="text-base font-bold text-[#0D3A6E]">{title}</h2>
        <span className="text-xs text-[#93B8D4] font-medium ml-1">({entries.length})</span>
      </div>

      {entries.length === 0 ? (
        <div className="flex flex-col items-center gap-3 py-10 bg-white/60 rounded-2xl border border-dashed border-[#E8F3FD]">
          <Icon className="w-6 h-6 text-[#BAD8F7]" />
          <p className="text-xs text-[#5B8DB8] text-center max-w-md">{emptyMessage}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {entries.map((entry, i) => {
            const AreaIcon = AREA_ICONS[entry.skills_demonstrated?.[0]] || Briefcase  ;
            return (
              <motion.div
                key={entry.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="bg-white rounded-2xl border border-[#E8F3FD] overflow-hidden hover:shadow-xl hover:border-[#38A3F1]/30 transition-all duration-300"
              >
                <div className="p-5 space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-[#F0F7FF] flex items-center justify-center">
                        <AreaIcon className="w-4 h-4 text-[#38A3F1]" />
                      </div>
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
                        style={{
                          background: entry.source_type === "simulation" ? "#F0F7FF" : "#E1F5EE",
                          color: entry.source_type === "simulation" ? "#0D5FA6" : "#1D9E75",
                        }}
                      >
                        {entry.source_type === "simulation" ? "Simulación" : "Proyecto real"}
                      </span>
                    </div>
                    {entry.score && (
                      <span className="text-xs font-bold"
                        style={{
                          color: entry.score >= 70 ? "#1D9E75" : entry.score >= 40 ? "#D97706" : "#EF4444",
                        }}
                      >
                        {entry.score}/100
                      </span>
                    )}
                  </div>

                  <h3 className="text-sm font-bold text-[#0D3A6E] line-clamp-2">{entry.title}</h3>
                  <p className="text-xs text-[#5B8DB8] line-clamp-2 leading-relaxed">{entry.description}</p>

                  {entry.skills_demonstrated?.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {entry.skills_demonstrated.slice(0, 4).map((skill: string, j: number) => (
                        <span key={j} className="text-[10px] bg-[#F0F7FF] text-[#0D5FA6] px-2 py-0.5 rounded-full font-medium">
                          {skill}
                        </span>
                      ))}
                    </div>
                  )}

                  <div className="flex items-center gap-3 text-[10px] text-[#93B8D4] pt-1">
           {/* <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {entry.hours_invested || 0}h
                    </span>*/}
                    {entry.completed_at && (
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {new Date(entry.completed_at).toLocaleDateString("es-SV")}
                      </span>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </section>
  );
}

function CertificateGrid({ certificates }: { certificates: CertificateEntry[] }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
      {certificates.map((cert) => (
        <div
          key={cert.id}
          className="group relative rounded-2xl border border-[#E8F3FD] bg-white shadow-sm transition-all duration-300 hover:border-[#38A3F1]/30 hover:shadow-xl hover:shadow-[#0D3A6E]/5 flex flex-col justify-between overflow-hidden before:absolute before:top-0 before:left-0 before:w-full before:h-1 before:bg-gradient-to-r before:from-[#38b6ff] before:to-[#0D3A6E]"
        >
          <div className="p-5 space-y-3">
            <span className="inline-flex items-center gap-1.5 text-[10px] font-bold text-[#1D9E75] bg-[#E1F5EE] px-2 py-0.5 rounded-full border border-[#BFE8DA]">
              <FileText className="h-3 w-3" />
              Certificado
            </span>
            <h3 className="text-sm font-bold text-[#0D3A6E] line-clamp-2">{cert.projectTitle}</h3>
            <div className="flex items-center gap-2 bg-gray-50/70 p-2 rounded-lg">
              <Building className="w-4 h-4 text-[#38b6ff]" />
              <span className="text-xs font-semibold text-gray-700">{cert.pymeName}</span>
            </div>
            <div className="flex items-center gap-1.5 text-[10px] text-[#93B8D4]">
              <Calendar className="w-3 h-3" />
              {new Date(cert.created_at).toLocaleDateString("es-SV")}
            </div>
          </div>
          <div className="px-5 pb-5 pt-1">
            {cert.paid ? (
              <Link
                href={cert.url}
                target="_blank"
                className="w-full inline-flex items-center justify-center gap-2 text-[11px] font-bold bg-[#38b6ff] text-white hover:bg-[#0D3A6E] px-4 py-2.5 rounded-xl transition-all"
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Visualizar Certificado</span>
                <ChevronRight className="w-3 h-3" />
              </Link>
            ) : (
              <CertificateActions certificateId={cert.id} />
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
