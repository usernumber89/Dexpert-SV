"use client";

import React, { useState } from "react";
import {
  Clock,
  AlertCircle,
  ExternalLink,
  MessageSquare,
  Send,
  Check,
  X,
  Plus,
} from "lucide-react";
import { submitMilestoneDeliverable, reviewMilestone, createMilestone } from "@/app/actions/milestones";

interface Milestone {
  id: string;
  project_id: string;
  title: string;
  description: string | null;
  status: "PENDING" | "IN_PROGRESS" | "IN_REVIEW" | "APPROVED";
  due_date: string | null;
  deliverable_url: string | null;
  feedback: string | null;
}

interface MilestoneTrackerProps {
  projectId: string;
  initialMilestones: Milestone[];
  role: "STUDENT" | "PYME";
}

export default function MilestoneTracker({
  projectId,
  initialMilestones,
  role,
}: MilestoneTrackerProps) {
  const [milestones, setMilestones] = useState<Milestone[]>(initialMilestones);
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [newDueDate, setNewDueDate] = useState("");
  const [creating, setCreating] = useState(false);

  const [activeSubmitId, setActiveSubmitId] = useState<string | null>(null);
  const [urlInput, setUrlInput] = useState("");
  const [activeRejectId, setActiveRejectId] = useState<string | null>(null);
  const [feedbackInput, setFeedbackInput] = useState("");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "Sin fecha";
    return new Date(dateString).toLocaleDateString("es-SV", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const handleCreateMilestone = async () => {
    setErrorMsg(null);
    if (!newTitle.trim()) {
      setErrorMsg("El título del hito es obligatorio.");
      return;
    }
    setCreating(true);
    const res = await createMilestone(projectId, newTitle, newDescription, newDueDate);
    if (res.success && res.milestone) {
      setMilestones(prev => [...prev, res.milestone]);
      setShowCreateForm(false);
      setNewTitle("");
      setNewDescription("");
      setNewDueDate("");
    } else {
      setErrorMsg(res.error || "Error al crear el hito.");
    }
    setCreating(false);
  };

  const handleSubmitDeliverable = async (milestoneId: string) => {
    setErrorMsg(null);
    setLoadingId(milestoneId);

    const res = await submitMilestoneDeliverable(milestoneId, urlInput);

    if (res.success && res.milestone) {
      setMilestones((prev) =>
        prev.map((m) => (m.id === milestoneId ? { ...m, ...res.milestone } : m))
      );
      setActiveSubmitId(null);
      setUrlInput("");
    } else {
      setErrorMsg(res.error || "Error al enviar el entregable.");
    }
    setLoadingId(null);
  };

  const handleReview = async (
    milestoneId: string,
    action: "APPROVE" | "REJECT"
  ) => {
    setErrorMsg(null);
    if (action === "REJECT" && !feedbackInput.trim()) {
      setErrorMsg("Por favor, introduce retroalimentación para el estudiante.");
      return;
    }

    setLoadingId(milestoneId);
    const res = await reviewMilestone(milestoneId, action, feedbackInput);

    if (res.success && res.milestone) {
      setMilestones((prev) =>
        prev.map((m) => (m.id === milestoneId ? { ...m, ...res.milestone } : m))
      );
      setActiveRejectId(null);
      setFeedbackInput("");
    } else {
      setErrorMsg(res.error || "Error al procesar la revisión.");
    }
    setLoadingId(null);
  };

  const statusStyles = {
    indicator: (status: Milestone["status"]) => {
      switch (status) {
        case "APPROVED":
          return "bg-emerald-500 border-emerald-500 text-white shadow-sm shadow-emerald-500/20";
        case "IN_REVIEW":
          return "bg-amber-500 border-amber-500 text-white shadow-sm shadow-amber-500/20";
        case "IN_PROGRESS":
          return "bg-surface-base border-brand-mid text-brand-navy ring-4 ring-brand-mid/10";
        default:
          return "bg-surface-raised border-surface-muted text-ink-muted";
      }
    },
    badge: (status: Milestone["status"]) => {
      switch (status) {
        case "APPROVED":
          return "bg-emerald-50 border-emerald-100 text-emerald-700";
        case "IN_REVIEW":
          return "bg-amber-50 border-amber-100 text-amber-700 animate-pulse";
        case "IN_PROGRESS":
          return "bg-brand-light/40 border-brand-border text-brand-title";
        default:
          return "bg-surface-raised border-brand-border text-ink-muted";
      }
    },
    label: (status: Milestone["status"]) => {
      switch (status) {
        case "APPROVED":
          return "Aprobado";
        case "IN_REVIEW":
          return "En Revisión";
        case "IN_PROGRESS":
          return "En Progreso";
        default:
          return "Pendiente";
      }
    },
    icon: (status: Milestone["status"]) => {
      switch (status) {
        case "APPROVED":
          return <Check className="w-3.5 h-3.5" />;
        case "IN_REVIEW":
          return <Clock className="w-3.5 h-3.5" />;
        case "IN_PROGRESS":
          return <Clock className="w-3.5 h-3.5 text-brand-mid" />;
        default:
          return <span className="w-1.5 h-1.5 bg-ink-muted rounded-full" />;
      }
    },
  };

  return (
    <div className="w-full bg-surface-base border border-brand-border rounded-2xl">
      <div className="p-5 sm:p-6 md:p-7">
        <div className="mb-5 sm:mb-6 flex flex-wrap items-start justify-between gap-3">
          <div>
            <h3 className="text-lg sm:text-xl font-black text-ink-primary tracking-tight">
              Línea de Tiempo del Proyecto
            </h3>
            <p className="text-xs sm:text-sm text-ink-secondary mt-1">
              Trazabilidad de entregas, revisiones técnicas e hitos alcanzados.
            </p>
          </div>
          {role === "PYME" && (
            <button
              onClick={() => { setShowCreateForm(true); setErrorMsg(null); }}
              className="inline-flex items-center gap-1.5 text-xs font-bold bg-brand-navy hover:bg-brand-title text-white px-3 py-1.5 rounded-xl transition-all shrink-0"
            >
              <Plus className="w-3.5 h-3.5" /> Nuevo Hito
            </button>
          )}
        </div>

        {errorMsg && (
          <div className="mb-4 p-3 bg-red-50 border border-red-100 text-red-600 rounded-xl text-xs font-medium flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            {errorMsg}
          </div>
        )}

        {showCreateForm && (
          <div className="mb-6 p-4 sm:p-5 bg-surface-raised rounded-2xl border border-brand-border space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-black text-ink-primary tracking-tight">
                Nuevo Hito
              </h4>
              <button
                onClick={() => { setShowCreateForm(false); setErrorMsg(null); }}
                className="text-xs font-bold text-ink-muted hover:text-ink-secondary transition-colors"
              >
                Cancelar
              </button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="block text-[10px] font-black uppercase tracking-wider text-ink-muted mb-1">
                  Título del hito *
                </label>
                <input
                  type="text"
                  placeholder="Ej: Diseño de interfaz de usuario"
                  className="w-full text-xs sm:text-sm p-2.5 bg-surface-base border border-surface-muted rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-mid/20 focus:border-brand-title text-ink-primary placeholder:text-ink-muted/60"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  disabled={creating}
                />
              </div>
              <div>
                <label className="block text-[10px] font-black uppercase tracking-wider text-ink-muted mb-1">
                  Descripción
                </label>
                <textarea
                  rows={2}
                  placeholder="Describe qué debe incluir este hito..."
                  className="w-full text-xs sm:text-sm p-2.5 bg-surface-base border border-surface-muted rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-mid/20 focus:border-brand-title text-ink-primary leading-relaxed placeholder:text-ink-muted/60"
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  disabled={creating}
                />
              </div>
              <div>
                <label className="block text-[10px] font-black uppercase tracking-wider text-ink-muted mb-1">
                  Fecha de entrega estimada
                </label>
                <input
                  type="date"
                  className="w-full text-xs sm:text-sm p-2.5 bg-surface-base border border-surface-muted rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-mid/20 focus:border-brand-title text-ink-primary"
                  value={newDueDate}
                  onChange={(e) => setNewDueDate(e.target.value)}
                  disabled={creating}
                />
              </div>
            </div>
            <div className="flex items-center gap-2 pt-1">
              <button
                onClick={handleCreateMilestone}
                disabled={creating || !newTitle.trim()}
                className="text-xs font-bold bg-brand-navy hover:bg-brand-title text-white px-4 py-1.5 rounded-xl transition-all disabled:opacity-50"
              >
                {creating ? "Creando..." : "Crear Hito"}
              </button>
              <button
                onClick={() => { setShowCreateForm(false); setErrorMsg(null); }}
                className="text-xs font-bold bg-surface-base text-ink-secondary border border-surface-muted px-3 py-1.5 rounded-xl hover:bg-surface-raised transition-all"
              >
                Cancelar
              </button>
            </div>
          </div>
        )}

        <div className="space-y-0">
          {milestones.length === 0 ? (
            <div className="py-12 flex flex-col items-center gap-2 text-center">
              <div className="w-12 h-12 rounded-2xl bg-surface-raised flex items-center justify-center">
                <Clock className="w-6 h-6 text-ink-muted" />
              </div>
              <p className="text-sm font-semibold text-ink-primary">No hay hitos definidos</p>
              <p className="text-xs text-ink-muted max-w-xs">
                {role === "PYME"
                  ? "Crea el primer hito para comenzar a trazar el progreso del proyecto."
                  : "La empresa definirá los hitos del proyecto próximamente."}
              </p>
            </div>
          ) : (
            milestones.map((milestone, idx) => {
            const isApproved = milestone.status === "APPROVED";
            const isInReview = milestone.status === "IN_REVIEW";
            const isInProgress = milestone.status === "IN_PROGRESS";
            const isPending = milestone.status === "PENDING";
            const isLast = idx === milestones.length - 1;

            return (
              <div key={milestone.id} className="relative flex gap-3 sm:gap-4">
                {/* Timeline column */}
                <div className="flex flex-col items-center">
                  <div
                    className={`relative z-10 w-6 h-6 rounded-xl flex items-center justify-center border-2 transition-all shrink-0 ${statusStyles.indicator(milestone.status)}`}
                  >
                    {statusStyles.icon(milestone.status)}
                  </div>
                  {!isLast && (
                    <div className="w-0.5 flex-1 bg-surface-muted mt-1 min-h-6" />
                  )}
                </div>

                {/* Content column */}
                <div className="flex-1 min-w-0 pb-8 space-y-2">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div className="min-w-0">
                      <h4
                        className={`font-bold text-sm sm:text-base tracking-tight break-words ${
                          isApproved
                            ? "text-ink-muted line-through"
                            : "text-ink-primary"
                        }`}
                      >
                        {milestone.title}
                      </h4>
                      {milestone.description && (
                        <p className="text-xs sm:text-sm text-ink-secondary max-w-xl mt-0.5 leading-relaxed">
                          {milestone.description}
                        </p>
                      )}
                    </div>

                    <span
                      className={`text-[10px] sm:text-xs font-bold px-2.5 sm:px-3 py-1 rounded-full border tracking-wide shrink-0 ${statusStyles.badge(milestone.status)}`}
                    >
                      {statusStyles.label(milestone.status)}
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[11px] sm:text-xs font-semibold text-ink-muted pt-0.5">
                    <span>
                      Entrega estimada: {formatDate(milestone.due_date)}
                    </span>

                    {milestone.deliverable_url && (
                      <a
                        href={milestone.deliverable_url}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 text-brand-mid hover:text-ink-primary transition-colors"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        Ver entregable técnico
                      </a>
                    )}
                  </div>

                  {milestone.feedback && !isApproved && !isInReview && (
                    <div className="bg-amber-50/50 border border-dashed border-amber-200 rounded-xl p-3 text-xs text-amber-800 flex items-start gap-2">
                      <MessageSquare className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-bold">
                          Correcciones solicitadas por la empresa:
                        </span>
                        <p className="mt-0.5 leading-relaxed font-medium">
                          {milestone.feedback}
                        </p>
                      </div>
                    </div>
                  )}

                  {role === "STUDENT" &&
                    (isInProgress || (isPending && !milestone.deliverable_url)) && (
                      <div className="pt-1">
                        {activeSubmitId !== milestone.id ? (
                          <button
                            onClick={() => {
                              setActiveSubmitId(milestone.id);
                              setErrorMsg(null);
                            }}
                            className="inline-flex items-center gap-1.5 text-xs font-bold bg-surface-raised hover:bg-brand-light/40 border border-surface-muted hover:border-brand-mid/30 text-ink-secondary hover:text-brand-title px-3 py-1.5 rounded-xl transition-all"
                          >
                            <Send className="w-3 h-3" /> Enviar evidencias
                          </button>
                        ) : (
                          <div className="mt-2 p-3 sm:p-4 bg-surface-raised rounded-2xl border border-surface-muted space-y-3 max-w-lg">
                            <div>
                              <label className="block text-[10px] font-black uppercase tracking-wider text-ink-muted mb-1">
                                URL del Entregable (GitHub / Figma / Vercel)
                              </label>
                              <input
                                type="text"
                                placeholder="https://github.com/..."
                                className="w-full text-xs p-2.5 bg-surface-base border border-surface-muted rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-mid/20 focus:border-brand-title font-mono text-ink-primary placeholder:text-ink-muted/60"
                                value={urlInput}
                                onChange={(e) => setUrlInput(e.target.value)}
                                disabled={loadingId === milestone.id}
                              />
                            </div>
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() =>
                                  handleSubmitDeliverable(milestone.id)
                                }
                                disabled={
                                  loadingId === milestone.id || !urlInput.trim()
                                }
                                className="text-xs font-bold bg-brand-navy text-surface-base px-3 py-1.5 rounded-xl hover:bg-brand-title transition-all disabled:opacity-50"
                              >
                                {loadingId === milestone.id
                                  ? "Subiendo..."
                                  : "Confirmar Envío"}
                              </button>
                              <button
                                onClick={() => {
                                  setActiveSubmitId(null);
                                  setUrlInput("");
                                }}
                                className="text-xs font-bold bg-surface-base text-ink-secondary border border-surface-muted px-3 py-1.5 rounded-xl hover:bg-surface-raised transition-all"
                              >
                                Cancelar
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                  {role === "PYME" && isInReview && (
                    <div className="pt-2 flex flex-col gap-2">
                      {activeRejectId !== milestone.id ? (
                        <div className="flex flex-wrap items-center gap-2">
                          <button
                            onClick={() =>
                              handleReview(milestone.id, "APPROVE")
                            }
                            disabled={loadingId === milestone.id}
                            className="inline-flex items-center gap-1 text-xs font-bold bg-emerald-500 hover:bg-emerald-600 text-white px-3 py-1.5 rounded-xl shadow-sm shadow-emerald-500/10 transition-all disabled:opacity-50"
                          >
                            <Check className="w-3.5 h-3.5" /> Aprobar Hito
                          </button>
                          <button
                            onClick={() => {
                              setActiveRejectId(milestone.id);
                              setErrorMsg(null);
                            }}
                            disabled={loadingId === milestone.id}
                            className="inline-flex items-center gap-1 text-xs font-bold bg-surface-base hover:bg-red-50 border border-surface-muted hover:border-red-200 text-ink-secondary hover:text-red-600 px-3 py-1.5 rounded-xl transition-all disabled:opacity-50"
                          >
                            <X className="w-3.5 h-3.5" /> Solicitar Cambios
                          </button>
                        </div>
                      ) : (
                        <div className="mt-2 p-3 sm:p-4 bg-red-50/40 rounded-2xl border border-red-100/70 space-y-3 max-w-lg">
                          <div>
                            <label className="block text-[10px] font-black uppercase tracking-wider text-red-500 mb-1">
                              ¿Qué correcciones necesita hacer el alumno?
                            </label>
                            <textarea
                              rows={3}
                              placeholder="Ej: El botón de navegación se desborda en pantallas móviles, y falta corregir..."
                              className="w-full text-xs p-2.5 bg-surface-base border border-surface-muted rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500/10 focus:border-red-500 text-ink-primary leading-relaxed placeholder:text-ink-muted/60"
                              value={feedbackInput}
                              onChange={(e) => setFeedbackInput(e.target.value)}
                              disabled={loadingId === milestone.id}
                            />
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() =>
                                handleReview(milestone.id, "REJECT")
                              }
                              disabled={
                                loadingId === milestone.id ||
                                !feedbackInput.trim()
                              }
                              className="text-xs font-bold bg-red-600 text-white px-3 py-1.5 rounded-xl hover:bg-red-700 transition-all disabled:opacity-50"
                            >
                              Enviar feedback al alumno
                            </button>
                            <button
                              onClick={() => {
                                setActiveRejectId(null);
                                setFeedbackInput("");
                              }}
                              className="text-xs font-bold bg-surface-base text-ink-secondary border border-surface-muted px-3 py-1.5 rounded-xl hover:bg-surface-raised transition-all"
                            >
                              Cancelar
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          }))}
        </div>
      </div>
    </div>
  );
}
