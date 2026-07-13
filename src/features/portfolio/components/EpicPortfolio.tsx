"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { motion, useInView, animate, MotionConfig } from "framer-motion";
import Link from "next/link";
import {
  Award, Star, BookOpen, FileText, Calendar,
  Building, Briefcase, MapPin, GraduationCap,
  Globe, Code2, ChevronRight, ExternalLink,
  Quote, Sparkles, Download, Send, Eye,
  BadgeCheck, ShieldCheck,
} from "lucide-react";
import { toast } from "sonner";

/* ─────────────────────────────────────────────────────────────
   Design system notes (see chat for the 3-line setup this needs):
   - font-display  → Spectral (serif, used sparingly for names/titles)
   - font-mono     → JetBrains Mono (record numbers, dates, labels)
   - default sans  → Public Sans (body)
   - gold accent   → #B8924A, only for verification + the paid PDF CTA
   ───────────────────────────────────────────────────────────── */

const GOLD = "#B8924A";

function prefersReducedMotion() {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function slugify(input: string) {
  return input
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "") || "portafolio";
}

/* ─── HOOKS ─── */
function useCountUp(target: number, duration = 1.4) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });
  useEffect(() => {
    if (!inView) return;
    if (prefersReducedMotion()) { setCount(target); return; }
    const controls = animate(0, target, { duration, ease: "easeOut", onUpdate: (v) => setCount(Math.round(v)) });
    return () => controls.stop();
  }, [inView, target, duration]);
  return { ref, count };
}

/* ─── SIGNATURE ELEMENT: quiet "official document" framing ─── */
function DocumentMarks() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
      <svg className="absolute inset-0 w-full h-full opacity-[0.08]">
        <defs>
          <pattern id="doc-grid" width="26" height="26" patternUnits="userSpaceOnUse">
            <circle cx="1" cy="1" r="1" fill="white" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#doc-grid)" />
      </svg>
      <div className="absolute top-6 left-6 w-6 h-6 border-t border-l border-white/25" />
      <div className="absolute top-6 right-6 w-6 h-6 border-t border-r border-white/25" />
      <div className="absolute bottom-6 left-6 w-6 h-6 border-b border-l border-white/25" />
      <div className="absolute bottom-6 right-6 w-6 h-6 border-b border-r border-white/25" />
    </div>
  );
}

function VerifiedSeal({ className = "", size = "sm" }: { className?: string; size?: "sm" | "md" }) {
  const dim = size === "md" ? "w-9 h-9" : "w-8 h-8";
  return (
    <div
      className={`${dim} rounded-full border-2 border-white shadow-lg flex items-center justify-center ${className}`}
      style={{ background: GOLD }}
      role="img"
      aria-label="Verificado por empresas en Dexpert"
      title="Verificado por empresas en Dexpert"
    >
      <BadgeCheck className="w-4 h-4 text-white" strokeWidth={2.25} />
    </div>
  );
}

/* ─── STAT: one bordered "ficha" bar instead of four floating tiles ─── */
function StatBlock({ label, value, icon: Icon, index, divider }: { label: string; value: string | number; icon: any; index: number; divider?: boolean }) {
  const isPercent = typeof value === "string" && value.includes("%");
  const numVal = isPercent ? parseInt(value, 10) : (typeof value === "number" ? value : 0);
  const { ref, count } = useCountUp(numVal);
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4, delay: index * 0.06 }}
      className={`flex items-center gap-3 px-5 py-4 sm:px-6 sm:py-5 ${divider ? "border-l border-[#E3EEF7]" : ""}`}
    >
      <Icon className="w-4 h-4 shrink-0" style={{ color: GOLD }} strokeWidth={1.75} />
      <div>
        <p className="font-mono text-2xl font-semibold text-[#0D3A6E] leading-none tabular-nums">
          <span ref={ref}>{count}</span>{isPercent && "%"}
        </p>
        <p className="text-[10.5px] uppercase tracking-[0.09em] text-[#7098B8] mt-1.5 font-medium">{label}</p>
      </div>
    </motion.div>
  );
}

/* ─── PROJECT CARD ─── */
function ProjectCard({ entry, index }: { entry: any; index: number }) {
  const tools = (entry.tools_used as string[]) || [];
  const skills = (entry.skills_demonstrated as string[]) || [];
  const statusLabel = entry._isActive ? "En curso" : entry.source_type === "simulation" ? "Simulación" : "Proyecto real";
  const statusColor = entry.featured ? GOLD : entry._isActive ? "#C99A2E" : entry.source_type === "simulation" ? "#38A3F1" : "#1D9E75";
  const statusBg = entry.featured ? "#FBF4E8" : entry._isActive ? "#FEF9EC" : entry.source_type === "simulation" ? "#F0F7FF" : "#ECFBF5";

  return (
    <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: Math.min(index, 8) * 0.06 }}>
      <div className="relative pl-8 sm:pl-12">
        <div className="absolute left-0 top-7 w-3 h-3 rounded-full border-2 border-white shadow z-10" style={{ background: statusColor }} />
        <div className="absolute left-[5px] top-10 bottom-0 w-px bg-[#E3EEF7]" />
        <div className="group bg-white rounded-xl border border-[#E3EEF7] overflow-hidden transition-all duration-300 hover:border-[#BAD8F7] hover:shadow-[0_18px_36px_-22px_rgba(13,58,110,0.28)] hover:-translate-y-0.5">
          <div className="h-[3px] w-full" style={{ background: statusColor }} aria-hidden="true" />
          <div className="p-6 sm:p-7">
            <div className="flex items-start justify-between gap-4 mb-4">
              <span
                className="text-[10px] font-mono font-semibold tracking-[0.08em] uppercase px-2.5 py-1 rounded-full border"
                style={{ color: statusColor, background: statusBg, borderColor: `${statusColor}33` }}
              >
                {statusLabel}
              </span>
            </div>

            <h3 className="font-display text-lg font-medium text-[#0D3A6E] mb-3 group-hover:text-[#38A3F1] transition-colors">{entry.title}</h3>

            {/* Metrics bar */}
            <div className="grid grid-cols-2 gap-3 mb-4">
              {tools.length > 0 && (
                <div className="bg-[#F8FBFE] rounded-xl p-3 text-center border border-[#E3EEF7]">
                  <p className="font-mono text-lg font-bold text-[#0D5FA6]">{tools.length}</p>
                  <p className="text-[9px] font-mono uppercase tracking-wider text-[#93B8D4] mt-0.5">Herramientas</p>
                </div>
              )}
              {entry.completed_at && (
                <div className="bg-[#F8FBFE] rounded-xl p-3 text-center border border-[#E3EEF7]">
                  <p className="font-mono text-xs font-bold text-[#0D3A6E]">{new Date(entry.completed_at).toLocaleDateString("es-SV", { year: "numeric", month: "short" })}</p>
                  <p className="text-[9px] font-mono uppercase tracking-wider text-[#93B8D4] mt-0.5">Finalizado</p>
                </div>
              )}
              {!tools.length && (
                <div className="bg-[#F8FBFE] rounded-xl p-3 text-center border border-[#E3EEF7]">
                  <p className="font-mono text-xs font-bold text-[#0D3A6E]">{entry.source_type === "simulation" ? "Simulación" : "Real"}</p>
                  <p className="text-[9px] font-mono uppercase tracking-wider text-[#93B8D4] mt-0.5">Tipo</p>
                </div>
              )}
            </div>

            {/* Role */}
            {entry.role_description && (
              <div className="mb-4 p-3 bg-gradient-to-r from-[#F8FBFE] to-white rounded-xl border border-[#E8F3FD]">
                <p className="text-[10px] font-mono font-semibold uppercase tracking-wider text-[#93B8D4] mb-1">Rol</p>
                <p className="text-sm font-medium text-[#0D3A6E]">{entry.role_description}</p>
              </div>
            )}

            {/* Custom description (optional, editable) */}
            {entry.custom_description && (
              <p className="text-sm text-[#4C7BA0] leading-relaxed mb-4 italic border-l-2 border-[#BAD8F7] pl-4">{entry.custom_description}</p>
            )}

            {/* Tools / Skills */}
            <div className="flex flex-wrap items-center gap-2">
              {tools.length > 0 && tools.map((tool: string) => (
                <span key={tool} className="text-[11px] font-mono font-medium px-2.5 py-1 rounded-md bg-[#F8FBFE] text-[#0D5FA6] border border-[#E3EEF7]">{tool}</span>
              ))}
              {!tools.length && skills.length > 0 && (
                skills.slice(0, 4).map((skill: string) => (
                  <span key={skill} className="text-[11px] bg-[#F8FBFE] text-[#0D5FA6] px-2.5 py-1 rounded-md font-medium border border-[#E3EEF7]">{skill}</span>
                ))
              )}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between mt-5 pt-4 border-t border-[#E8F3FD]">
              <div className="flex items-center gap-4 text-[11px] font-mono text-[#93B8D4]" />
              {entry.project_url && (
                <a href={entry.project_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-[11px] font-semibold text-[#38A3F1] hover:text-[#0D5FA6] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#38A3F1] rounded">
                  <ExternalLink className="w-3.5 h-3.5" /> Ver proyecto
                </a>
              )}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

/* ─── CONTACT FORM ─── */
function ContactForm({ studentId, studentName, onMessageSent }: { studentId: string; studentName: string; onMessageSent: () => void }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [company, setCompany] = useState("");
  const [message, setMessage] = useState("");
  const [website, setWebsite] = useState(""); // honeypot — real visitors never fill this
  const [sending, setSending] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (website) return;
    if (!name || !email || !message) { toast.error("Completa los campos requeridos"); return; }
    setSending(true);
    try {
      const res = await fetch("/api/portfolio/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ student_id: studentId, sender_name: name, sender_email: email, company: company || null, message }),
      });
      if (!res.ok) throw new Error("Error al enviar");
      toast.success("Mensaje enviado");
      setName(""); setEmail(""); setCompany(""); setMessage("");
      onMessageSent();
    } catch (err) {
      toast.error("No se pudo enviar el mensaje. Intenta de nuevo.");
      console.error(err);
    } finally { setSending(false); }
  };

  const fieldClass = "w-full text-sm bg-white/10 border border-white/15 rounded-xl px-4 py-3 text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-white/40 focus:border-white/30 backdrop-blur-sm transition-colors";

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="hidden" aria-hidden="true">
        <label htmlFor="website">No completar</label>
        <input id="website" tabIndex={-1} autoComplete="off" value={website} onChange={(e) => setWebsite(e.target.value)} />
      </div>
      <div>
        <label htmlFor="cf-name" className="sr-only">Tu nombre</label>
        <input id="cf-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Tu nombre *" required className={fieldClass} />
      </div>
      <div>
        <label htmlFor="cf-email" className="sr-only">Tu email</label>
        <input id="cf-email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Tu email *" required type="email" className={fieldClass} />
      </div>
      <div>
        <label htmlFor="cf-company" className="sr-only">Empresa</label>
        <input id="cf-company" value={company} onChange={(e) => setCompany(e.target.value)} placeholder="Empresa (opcional)" className={fieldClass} />
      </div>
      <div>
        <label htmlFor="cf-message" className="sr-only">Tu mensaje</label>
        <textarea id="cf-message" value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Tu mensaje *" required rows={4} className={`${fieldClass} resize-none`} />
      </div>
      <button type="submit" disabled={sending}
        className="w-full flex items-center justify-center gap-2 bg-white text-[#0D3A6E] font-semibold px-6 py-3 rounded-xl hover:bg-[#F0F7FF] transition-all shadow-lg disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#0D3A6E]">
        <Send className="w-4 h-4" />
        {sending ? "Enviando…" : "Enviar mensaje"}
      </button>
    </form>
  );
}

/* ─── MAIN ─── */
export function EpicPortfolio({
  student, entries, activeProjs, certificates, skills,
  totalEntries, totalCertificates, totalSkills, themeGrad,
  education = [], experience = [], links = [],
}: {
  student: any; entries: any[]; activeProjs: any[]; certificates: any[];
  skills: string[]; totalEntries: number; totalCertificates: number;
  totalSkills: number; themeGrad: string;
  education?: any[]; experience?: any[]; links?: any[];
}) {
  const featured = entries.filter((e: any) => e.featured);
  const regular = entries.filter((e: any) => !e.featured);
  const allItems = [...featured, ...activeProjs, ...regular];
  const [msgCount, setMsgCount] = useState(0);
  const [pdfGenerating, setPdfGenerating] = useState(false);
  const portfolioRef = useRef<HTMLDivElement>(null);
  const allTools = [...new Set(entries.flatMap((e: any) => (e.tools_used as string[]) || []))];

  // Verification is earned, not purchased: it reflects certificates real companies
  // have actually issued through Dexpert, independent of the paid PDF export below.
  const isVerified = Boolean(student.is_premium) || totalCertificates > 0;
  const shortId = student.id ? String(student.id).replace(/-/g, "").slice(0, 8).toUpperCase() : "—";

  const printFallback = useCallback(() => {
    document.body.classList.add("printing-portfolio");
    const cleanup = () => document.body.classList.remove("printing-portfolio");
    window.addEventListener("beforeprint", cleanup, { once: true });
    window.addEventListener("afterprint", cleanup, { once: true });
    setTimeout(cleanup, 3000);
    window.print();
  }, []);

  const downloadPDF = useCallback(async () => {
    setPdfGenerating(true);
    try {
      // TODO(backend): implement this route with the same PDFKit approach used
      // for invoices — see the export-pdf scaffold shared alongside this file.
      // If it isn't live yet, or the request fails, we fall back to the browser
      // print dialog so the button never dead-ends.
      const res = await fetch(`/api/portfolio/${student.id}/export-pdf`, { method: "POST" });
      if (!res.ok) throw new Error(`export-pdf failed: ${res.status}`);
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${slugify(student.full_name || "portafolio")}-dexpert.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      toast.success("PDF descargado");
    } catch (err) {
      console.error(err);
      printFallback();
    } finally {
      setPdfGenerating(false);
    }
  }, [student.id, student.full_name, printFallback]);

  return (
    <MotionConfig reducedMotion="user">
    <div ref={portfolioRef} className="min-h-screen bg-[#F8FAFC] font-sans">
      {/* ═══ HERO ═══ */}
      <section className={`relative bg-gradient-to-br ${themeGrad} px-4 pt-20 pb-28 overflow-hidden`}>
        <DocumentMarks />
        <div className="absolute top-0 right-0 w-[420px] h-[420px] bg-white/5 rounded-full blur-3xl" aria-hidden="true" />
        <div className="absolute bottom-0 left-0 w-[340px] h-[340px] bg-white/5 rounded-full blur-3xl" aria-hidden="true" />
        <div className="relative max-w-5xl mx-auto">
          <div className="flex flex-col items-center text-center">
            <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 font-mono text-[10.5px] tracking-[0.16em] text-white/70 uppercase mb-8 border border-white/20 rounded-full px-3.5 py-1.5">
              <ShieldCheck className="w-3.5 h-3.5" /> Ficha Nº {shortId} · Dexpert
            </motion.div>

            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 0.5 }} className="relative mb-6">
              <div className="w-28 h-28 rounded-full bg-gradient-to-br from-white/90 to-white/70 p-1 shadow-2xl ring-1 ring-white/20">
                <div className="w-full h-full rounded-full bg-gradient-to-br from-[#38A3F1] to-[#0D3A6E] flex items-center justify-center">
                  <span className="font-display text-3xl font-medium text-white">{student.full_name?.split(" ").map((n: string) => n[0]).filter(Boolean).slice(0, 2).join("").toUpperCase() || "?"}</span>
                </div>
              </div>
              {isVerified && <VerifiedSeal className="absolute -bottom-1 -right-1" size="md" />}
            </motion.div>

            <motion.h1 initial={{ y: 16, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.5, delay: 0.1 }}
              className="font-display text-4xl sm:text-5xl font-medium mb-3 text-white">
              {student.full_name}
            </motion.h1>

            <motion.div initial={{ y: 16, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.5, delay: 0.15 }}
              className="flex flex-wrap items-center justify-center gap-x-2.5 gap-y-1 font-mono text-[12px] text-white/70 mb-7">
              {student.university && <span>{student.university}{student.major && ` — ${student.major}`}</span>}
              {student.university && student.location && <span className="text-white/30" aria-hidden="true">·</span>}
              {student.location && <span className="inline-flex items-center gap-1"><MapPin className="w-3 h-3" />{student.location}</span>}
            </motion.div>

            <motion.div initial={{ y: 16, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.5, delay: 0.2 }} className="flex items-center gap-2 mb-6">
              {student.linkedin && (
                <a href={student.linkedin} target="_blank" rel="noopener noreferrer" aria-label="LinkedIn"
                  className="w-9 h-9 rounded-full bg-white/15 hover:bg-white/30 flex items-center justify-center transition-all backdrop-blur-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white">
                  <svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
                </a>
              )}
              {student.github && (
                <a href={student.github} target="_blank" rel="noopener noreferrer" aria-label="GitHub"
                  className="w-9 h-9 rounded-full bg-white/15 hover:bg-white/30 flex items-center justify-center transition-all backdrop-blur-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white">
                  <Code2 className="w-4 h-4 text-white" aria-hidden="true" />
                </a>
              )}
            </motion.div>

            {skills.length > 0 && (
              <motion.div initial={{ y: 16, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.5, delay: 0.25 }} className="flex flex-wrap justify-center gap-2 max-w-xl">
                {skills.map((skill) => (
                  <span key={skill} className="text-xs font-medium px-3.5 py-1.5 rounded-full bg-white/10 text-white/90 backdrop-blur-sm border border-white/15 hover:bg-white/20 transition-colors">{skill}</span>
                ))}
              </motion.div>
            )}
          </div>
        </div>
      </section>

      {/* ═══ STATS — one ficha bar, not four floating tiles ═══ */}
      <div className="relative -mt-16 z-10 max-w-5xl mx-auto px-4">
        <div className="grid grid-cols-3 divide-x divide-[#E3EEF7] bg-white rounded-2xl border border-[#E3EEF7] shadow-[0_18px_40px_-24px_rgba(13,58,110,0.25)] overflow-hidden">
          <StatBlock label="Proyectos" value={totalEntries} icon={BookOpen} index={0} />
          <StatBlock label="Habilidades" value={totalSkills} icon={Star} index={1} />
          <StatBlock label="Certificados" value={totalCertificates} icon={Award} index={2} />
        </div>
      </div>

      {/* ═══ TOOLS ═══ */}
      {allTools.length > 0 && (
        <motion.section initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="max-w-5xl mx-auto px-4 mt-8">
          <div className="bg-white rounded-2xl border border-[#E3EEF7] p-6">
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="w-4 h-4" style={{ color: GOLD }} />
              <h2 className="text-base font-display font-medium text-[#0D3A6E]">Stack tecnológico</h2>
            </div>
            <div className="flex flex-wrap gap-2">
              {allTools.map((tool) => (
                <span key={tool} className="text-[12px] font-mono px-3 py-1.5 rounded-lg bg-[#F8FBFE] text-[#0D5FA6] font-medium border border-[#E3EEF7]">{tool}</span>
              ))}
            </div>
          </div>
        </motion.section>
      )}

      {/* ═══ ABOUT ME ═══ */}
      {student.about_me && (
        <motion.section initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="max-w-5xl mx-auto px-4 mt-6">
          <div className="bg-white rounded-2xl border border-[#E3EEF7] p-6 sm:p-8">
            <div className="flex items-center gap-2 mb-4">
              <Quote className="w-4 h-4 text-[#8B5CF6]" />
              <h2 className="text-base font-display font-medium text-[#0D3A6E]">Sobre mí</h2>
            </div>
            <p className="text-[15px] font-display text-[#2E5476] leading-relaxed whitespace-pre-line">{student.about_me}</p>
          </div>
        </motion.section>
      )}

      {/* ═══ BIO (fallback) ═══ */}
      {student.bio && !student.about_me && (
        <motion.section initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="max-w-5xl mx-auto px-4 mt-6">
          <div className="bg-white rounded-2xl border border-[#E3EEF7] p-6">
            <div className="flex items-start gap-3"><Quote className="w-5 h-5 text-[#38A3F1] mt-0.5 shrink-0" /><p className="text-sm text-[#4C7BA0] leading-relaxed italic">{student.bio}</p></div>
          </div>
        </motion.section>
      )}

      {/* ═══ EDUCATION ═══ */}
      {education.length > 0 && (
        <motion.section initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="max-w-5xl mx-auto px-4 mt-8">
          <div className="flex items-center gap-2 mb-4">
            <GraduationCap className="w-5 h-5 text-[#8B5CF6]" />
            <h2 className="text-lg font-display font-medium text-[#0D3A6E]">Formación</h2>
          </div>
          <div className="space-y-4">
            {education.map((edu: any, i: number) => (
              <motion.div key={edu.id || i} initial={{ opacity: 0, x: -16 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: Math.min(i, 6) * 0.08 }}
                className="relative pl-8">
                <div className="absolute left-0 top-1.5 w-3 h-3 rounded-full bg-[#8B5CF6] border-2 border-white shadow" />
                <div className="bg-white rounded-xl border border-[#E3EEF7] p-4 hover:border-[#D6C7F5] transition-colors">
                  <p className="text-xs font-mono font-semibold text-[#8B5CF6]">{edu.degree}{edu.field && ` en ${edu.field}`}</p>
                  <h3 className="text-sm font-display font-medium text-[#0D3A6E] mt-0.5">{edu.institution}</h3>
                  {(edu.start_date || edu.end_date) && (
                    <p className="text-[11px] font-mono text-[#93B8D4] mt-1">{edu.start_date}{edu.start_date && edu.end_date && " — "}{edu.end_date}</p>
                  )}
                  {edu.description && <p className="text-xs text-[#4C7BA0] mt-2">{edu.description}</p>}
                </div>
              </motion.div>
            ))}
          </div>
        </motion.section>
      )}

      {/* ═══ WORK EXPERIENCE ═══ */}
      {experience.length > 0 && (
        <motion.section initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="max-w-5xl mx-auto px-4 mt-8">
          <div className="flex items-center gap-2 mb-4">
            <Briefcase className="w-5 h-5 text-[#D97706]" />
            <h2 className="text-lg font-display font-medium text-[#0D3A6E]">Experiencia</h2>
          </div>
          <div className="space-y-4">
            {experience.map((exp: any, i: number) => (
              <motion.div key={exp.id || i} initial={{ opacity: 0, x: -16 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: Math.min(i, 6) * 0.08 }}
                className="relative pl-8">
                <div className="absolute left-0 top-1.5 w-3 h-3 rounded-full bg-[#D97706] border-2 border-white shadow" />
                <div className="bg-white rounded-xl border border-[#E3EEF7] p-4 hover:border-[#F3D9AD] transition-colors">
                  <p className="text-xs font-mono font-semibold text-[#D97706]">{exp.role}</p>
                  <h3 className="text-sm font-display font-medium text-[#0D3A6E] mt-0.5">{exp.company}</h3>
                  {(exp.start_date || exp.end_date) && (
                    <p className="text-[11px] font-mono text-[#93B8D4] mt-1">{exp.start_date}{exp.start_date && exp.end_date && " — "}{exp.end_date}</p>
                  )}
                  {exp.description && <p className="text-xs text-[#4C7BA0] mt-2">{exp.description}</p>}
                  {exp.tools?.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {(exp.tools as string[]).map((t: string) => (
                        <span key={t} className="text-[10px] font-mono bg-[#F8FBFE] text-[#0D5FA6] px-2 py-0.5 rounded-full font-medium border border-[#E3EEF7]">{t}</span>
                      ))}
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </motion.section>
      )}

      {/* ═══ CUSTOM LINKS ═══ */}
      {links.length > 0 && (
        <motion.section initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="max-w-5xl mx-auto px-4 mt-6">
          <div className="bg-white rounded-2xl border border-[#E3EEF7] p-6">
            <div className="flex items-center gap-2 mb-4">
              <Globe className="w-4 h-4 text-[#38A3F1]" />
              <h2 className="text-base font-display font-medium text-[#0D3A6E]">Enlaces</h2>
            </div>
            <div className="flex flex-wrap gap-3">
              {links.map((link: any) => (
                <a key={link.id} href={link.url} target="_blank" rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-sm font-semibold text-[#38A3F1] bg-[#F8FBFE] px-4 py-2.5 rounded-xl hover:bg-[#EEF6FF] transition-all border border-[#E3EEF7] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#38A3F1]">
                  <ExternalLink className="w-4 h-4" />
                  {link.label}
                </a>
              ))}
            </div>
          </div>
        </motion.section>
      )}

      {/* ═══ PROJECTS TIMELINE ═══ */}
      <section className="max-w-5xl mx-auto px-4 mt-12 pb-8">
        <motion.div initial={{ opacity: 0, x: -16 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="flex items-center gap-2 mb-8">
          <Briefcase className="w-5 h-5 text-[#0D3A6E]" />
          <h2 className="text-lg font-display font-medium text-[#0D3A6E]">Trayectoria</h2>
          <span className="text-xs font-mono text-[#93B8D4] font-medium bg-[#F8FBFE] px-2.5 py-1 rounded-full border border-[#E3EEF7]">{allItems.length}</span>
        </motion.div>
        {allItems.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-[#D9E8F5]">
            <div className="w-16 h-16 mx-auto mb-4 bg-[#F8FBFE] rounded-2xl flex items-center justify-center"><Briefcase className="w-8 h-8 text-[#BAD8F7]" /></div>
            <p className="text-sm text-[#4C7BA0]">Los proyectos verificados de {student.full_name?.split(" ")[0] || "este perfil"} aparecerán aquí.</p>
          </div>
        ) : (
          <div className="space-y-8">{allItems.map((entry: any, idx: number) => <ProjectCard key={entry.id} entry={entry} index={idx} />)}</div>
        )}
      </section>

      {/* ═══ CERTIFICATES ═══ */}
      {certificates.length > 0 && (
        <section className="max-w-5xl mx-auto px-4 pb-8">
          <motion.div initial={{ opacity: 0, x: -16 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="flex items-center gap-2 mb-6">
            <Award className="w-5 h-5 text-emerald-600" />
            <h2 className="text-lg font-display font-medium text-[#0D3A6E]">Certificados</h2>
            <span className="text-xs font-mono text-[#93B8D4] font-medium bg-[#F8FBFE] px-2.5 py-1 rounded-full border border-[#E3EEF7]">{certificates.length}</span>
          </motion.div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {certificates.map((cert: any, i: number) => (
              <motion.div key={cert.id} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: Math.min(i, 6) * 0.08 }}
                className="group bg-white rounded-2xl border border-[#E3EEF7] p-6 hover:border-emerald-200 hover:shadow-[0_18px_36px_-24px_rgba(16,185,129,0.35)] transition-all duration-300 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-[3px] bg-emerald-500" aria-hidden="true" />
                <span className="inline-flex items-center gap-1.5 text-[10px] font-mono font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200 mb-3"><FileText className="h-3 w-3" />Certificado</span>
                <h3 className="text-sm font-display font-medium text-[#0D3A6E] mb-2">{cert.applications?.project?.title || "Certificado"}</h3>
                <div className="flex items-center gap-2 bg-[#F8FBFE] p-2.5 rounded-xl mb-3 border border-[#E3EEF7]"><Building className="w-4 h-4 text-[#38A3F1] shrink-0" /><span className="text-xs font-semibold text-[#2E5476] truncate">{cert.applications?.project?.pyme?.company_name || cert.pymeName || ""}</span></div>
                <div className="flex items-center gap-1.5 text-[11px] font-mono text-[#93B8D4]"><Calendar className="w-3.5 h-3.5" />{new Date(cert.created_at).toLocaleDateString("es-SV", { year: "numeric", month: "short" })}</div>
              </motion.div>
            ))}
          </div>
        </section>
      )}

      {/* ═══ CONTACT + ACTIONS ═══ */}
      <section className="max-w-5xl mx-auto px-4 pb-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Contact Form */}
          <motion.div initial={{ opacity: 0, x: -24 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}
            className="bg-gradient-to-br from-[#0D3A6E] to-[#1a5a9e] rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
            <DocumentMarks />
            <div className="relative">
              <h3 className="text-lg font-display font-medium text-white mb-1">Contactar</h3>
              <p className="text-white/60 text-xs mb-5">Déjale un mensaje a {student.full_name?.split(" ")[0] || "el estudiante"}</p>
              <ContactForm studentId={student.id} studentName={student.full_name} onMessageSent={() => setMsgCount(msgCount + 1)} />
            </div>
          </motion.div>

          {/* Actions */}
          <motion.div initial={{ opacity: 0, x: 24 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="space-y-4">
            {/* PDF Download — the paid deliverable, so it gets the gold treatment */}
            <div className="bg-white rounded-2xl border border-[#E3EEF7] p-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: GOLD }}>
                  <FileText className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-sm font-display font-medium text-[#0D3A6E]">Exportar portafolio en PDF</h3>
                  <p className="text-[11px] text-[#7098B8]">Documento formateado, listo para enviar a reclutadores</p>
                </div>
              </div>
              <button onClick={downloadPDF} disabled={pdfGenerating}
                className="w-full flex items-center justify-center gap-2 text-white text-sm font-semibold px-5 py-3 rounded-xl transition-all shadow-md disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
                style={{ background: GOLD }}>
                {pdfGenerating ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" aria-hidden="true" />
                ) : (
                  <Download className="w-4 h-4" />
                )}
                {pdfGenerating ? "Generando…" : "Descargar PDF"}
              </button>
              <button onClick={printFallback} className="w-full text-center text-[11px] text-[#93B8D4] hover:text-[#5B8DB8] mt-2.5 underline underline-offset-2">
                Prefiero imprimir desde el navegador
              </button>
            </div>

            {/* Views counter */}
            <div className="bg-white rounded-2xl border border-[#E3EEF7] p-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#0D3A6E] flex items-center justify-center"><Eye className="w-5 h-5 text-white" /></div>
                <div>
                  <h3 className="text-sm font-display font-medium text-[#0D3A6E]">{student.portfolio_views || 0} vistas</h3>
                  <p className="text-[11px] text-[#7098B8]">Personas han visto este portafolio</p>
                </div>
              </div>
            </div>

            {/* Share */}
            <div className="bg-white rounded-2xl border border-[#E3EEF7] p-6">
              <ShareButton url={`/portfolio/${student.id}`} />
            </div>
          </motion.div>
        </div>
      </section>

      {/* ═══ FOOTER ═══ */}
      <footer className="border-t border-[#E3EEF7] py-6">
        <div className="max-w-5xl mx-auto px-4 text-center">
          <Link href="/" className="text-sm text-[#38A3F1] hover:text-[#0D5FA6] font-semibold">Dexpert — Conectando talento con empresas salvadoreñas</Link>
        </div>
      </footer>
    </div>
    </MotionConfig>
  );
}

function ShareButton({ url }: { url: string }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(`${window.location.origin}${url}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("No se pudo copiar el enlace");
    }
  };
  return (
    <div className="flex items-center gap-3">
      <div className="w-10 h-10 rounded-xl bg-emerald-600 flex items-center justify-center"><svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/><polyline points="16 6 12 2 8 6"/><line x1="12" y1="2" x2="12" y2="15"/></svg></div>
      <div className="flex-1">
        <h3 className="text-sm font-display font-medium text-[#0D3A6E]">Compartir portafolio</h3>
        <p className="text-[11px] text-[#7098B8]">Copia el enlace para compartir</p>
      </div>
      <button onClick={handleCopy}
        className="text-sm font-semibold px-4 py-2 rounded-xl bg-[#F8FBFE] text-[#38A3F1] hover:bg-[#EEF6FF] transition-all border border-[#E3EEF7] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#38A3F1]">
        {copied ? "¡Copiado!" : "Copiar"}
      </button>
    </div>
  );
}