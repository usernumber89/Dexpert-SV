"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Send, BotMessageSquare, User, Sparkles, Clock, Target,
  AlertTriangle, FileText, Loader2, CheckCircle2, X,
  ArrowLeft, BookOpen, ListChecks, GitPullRequest, Trophy,
  MessageSquare, ExternalLink,
} from "lucide-react";
import {
  SimulationSession, SimulationMessage, ChangeRequest,
  getSessionMessages, getChangeRequests, updateChangeRequestStatus,
  getEvaluation,
} from "@/app/actions/simulation";

type Evaluation = {
  id: string;
  overall_score: number;
  rubric: { criterion: string; score: number; comment: string }[];
  strengths: string[];
  improvements: string[];
  summary: string;
};

interface ScenarioInfo {
  clientName: string;
  client_personality?: string;
  title: string;
  brief: string;
  objectives: string[];
  constraints: string[];
  skillsRequired: string[];
  estimatedDays: number;
}

export function SimulationWorkspace({
  session,
  scenario,
  welcomeMessage,
}: {
  session: SimulationSession;
  scenario: ScenarioInfo;
  welcomeMessage: string;
}) {
  const router = useRouter();
  const [messages, setMessages] = useState<SimulationMessage[]>([
    { id: "welcome", session_id: session.id, role: "assistant", content: welcomeMessage, created_at: new Date().toISOString() },
  ]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [evaluating, setEvaluating] = useState(false);
  const [evaluation, setEvaluation] = useState<Evaluation | null>(null);
  const [changeRequests, setChangeRequests] = useState<ChangeRequest[]>([]);
  const [showBrief, setShowBrief] = useState(true);
  const [showChanges, setShowChanges] = useState(false);
  const [generatingChange, setGeneratingChange] = useState(false);
  const [messageCount, setMessageCount] = useState(0);
  const [activeTab, setActiveTab] = useState<"chat" | "brief" | "changes" | "evaluation">("chat");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadMessages();
    loadChangeRequests();
    checkEvaluation();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const loadMessages = async () => {
    const msgs = await getSessionMessages(session.id);
    if (msgs.length > 1) {
      setMessages(msgs);
      setMessageCount(msgs.filter(m => m.role === "user").length);
    }
  };

  const loadChangeRequests = async () => {
    const crs = await getChangeRequests(session.id);
    setChangeRequests(crs);
  };

  const checkEvaluation = async () => {
    const ev = await getEvaluation(session.id);
    if (ev) {
      setEvaluation(ev);
      setCompleted(true);
    }
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || sending) return;

    const userMsg: SimulationMessage = {
      id: `temp-${Date.now()}`,
      session_id: session.id,
      role: "user",
      content: input,
      created_at: new Date().toISOString(),
    };

    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setSending(true);

    try {
      const res = await fetch("/api/simulation/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId: session.id, message: userMsg.content }),
      });

      const data = await res.json();
      if (data.response) {
        setMessages(prev => [...prev, {
          id: `ai-${Date.now()}`,
          session_id: session.id,
          role: "assistant",
          content: data.response,
          created_at: new Date().toISOString(),
        }]);
        setMessageCount(data.messageCount || 0);
      }
    } catch {
      setMessages(prev => [...prev, {
        id: `err-${Date.now()}`,
        session_id: session.id,
        role: "assistant",
        content: "Hubo un error de conexión. Intenta de nuevo.",
        created_at: new Date().toISOString(),
      }]);
    } finally {
      setSending(false);
      inputRef.current?.focus();
    }
  };

  const generateChangeRequest = async () => {
    setGeneratingChange(true);
    try {
      const res = await fetch("/api/simulation/change-request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId: session.id }),
      });
      const data = await res.json();
      if (data.id) {
        setChangeRequests(prev => [...prev, data]);
        setShowChanges(true);
        setActiveTab("changes");
      }
    } catch {
      // Silently fail
    } finally {
      setGeneratingChange(false);
    }
  };

  const handleChangeRequestStatus = async (id: string, status: string) => {
    await updateChangeRequestStatus(id, status);
    setChangeRequests(prev => prev.map(cr => cr.id === id ? { ...cr, status: status as any } : cr));
  };

  const finishAndEvaluate = async () => {
    setEvaluating(true);
    try {
      const res = await fetch("/api/simulation/evaluate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId: session.id }),
      });
      const data = await res.json();
      if (data.overall_score !== undefined) {
        setEvaluation(data);
        setCompleted(true);
        setActiveTab("evaluation");
      }
    } finally {
      setEvaluating(false);
    }
  };

  const statusColors = {
    pending: { bg: "#FFFBEB", text: "#D97706", border: "#FDE9C0" },
    accepted: { bg: "#E1F5EE", text: "#1D9E75", border: "#BFE8DA" },
    rejected: { bg: "#FEF2F2", text: "#EF4444", border: "#FECACA" },
    completed: { bg: "#F0F7FF", text: "#0D5FA6", border: "#BAD8F7" },
  } as const;

  return (
    <div className="h-screen flex overflow-hidden bg-gradient-to-br from-[#F4F9FF] via-white to-[#EEF6FF]">
      {/* Tabs sidebar */}
      <div className="hidden sm:flex flex-col w-16 lg:w-20 bg-white border-r border-[#E8F3FD] items-center py-4 gap-2 flex-shrink-0">
        {[
          { key: "chat", icon: MessageSquare, label: "Chat" },
          { key: "brief", icon: BookOpen, label: "Brief" },
          { key: "changes", icon: GitPullRequest, label: "Cambios", badge: changeRequests.filter(c => c.status === "pending").length },
          { key: "evaluation", icon: Trophy, label: "Evaluación", highlight: completed },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key as any)}
            className="relative w-12 h-12 lg:w-14 lg:h-14 rounded-xl flex flex-col items-center justify-center gap-0.5 transition-all"
            style={{
              background: activeTab === tab.key ? "#F0F7FF" : "transparent",
              color: activeTab === tab.key ? "#0D3A6E" : "#93B8D4",
            }}
          >
            <tab.icon className="w-5 h-5" />
            <span className="text-[8px] font-semibold">{tab.label}</span>
            {tab.badge && tab.badge > 0 && (
              <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 text-white text-[8px] font-bold rounded-full flex items-center justify-center">
                {tab.badge}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <div className="flex items-center gap-3 px-4 py-3 bg-white border-b border-[#E8F3FD] flex-shrink-0">
          <button onClick={() => router.push("/student/simulation")} className="p-2 hover:bg-[#F0F7FF] rounded-lg transition">
            <ArrowLeft className="w-4 h-4 text-[#5B8DB8]" />
          </button>
          <div className="flex items-center gap-3 min-w-0">
            <div className="min-w-0">
              <h2 className="text-sm font-bold text-[#0D3A6E] truncate">{scenario.title}</h2>
              <p className="text-[11px] text-[#5B8DB8] flex items-center gap-1">
                <User className="w-3 h-3" />
                {scenario.clientName}
              </p>
            </div>
          </div>
          <div className="ml-auto flex items-center gap-2">
            {messageCount > 0 && messageCount % 5 === 0 && !completed && (
              <button
                onClick={generateChangeRequest}
                disabled={generatingChange}
                className="flex items-center gap-1.5 text-[11px] font-semibold text-[#F59E0B] bg-[#FFFBEB] border border-[#FDE9C0] px-3 py-1.5 rounded-lg hover:bg-[#FEF3C7] transition disabled:opacity-50"
              >
                {generatingChange ? <Loader2 className="w-3 h-3 animate-spin" /> : <GitPullRequest className="w-3.5 h-3.5" />}
                Solicitar cambio
              </button>
            )}
            {messageCount >= 3 && !completed && (
              <button
                onClick={finishAndEvaluate}
                disabled={evaluating}
                className="flex items-center gap-1.5 text-[11px] font-semibold text-white bg-[#0D3A6E] px-3 py-1.5 rounded-lg hover:bg-[#0D5FA6] transition disabled:opacity-50"
              >
                {evaluating ? <Loader2 className="w-3 h-3 animate-spin" /> : <Trophy className="w-3.5 h-3.5" />}
                {evaluating ? "Evaluando..." : "Finalizar"}
              </button>
            )}
          </div>
        </div>

        {/* Mobile tabs */}
        <div className="sm:hidden flex gap-1 px-3 py-2 bg-white border-b border-[#E8F3FD] overflow-x-auto">
          {[
            { key: "chat", icon: MessageSquare, label: "Chat" },
            { key: "brief", icon: BookOpen, label: "Brief" },
            { key: "changes", icon: GitPullRequest, label: "Cambios" },
            { key: "evaluation", icon: Trophy, label: "Evaluación" },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              className="flex items-center gap-1 text-[11px] font-semibold px-3 py-1.5 rounded-lg whitespace-nowrap transition"
              style={{
                background: activeTab === tab.key ? "#F0F7FF" : "transparent",
                color: activeTab === tab.key ? "#0D3A6E" : "#93B8D4",
              }}
            >
              <tab.icon className="w-3.5 h-3.5" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab content */}
        <div className="flex-1 overflow-hidden">
          {activeTab === "chat" && (
            <div className="h-full flex flex-col">
              <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
                <AnimatePresence>
                  {messages.map((msg) => (
                    <motion.div
                      key={msg.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                    >
                      {msg.role === "assistant" && (
                        <div className="w-7 h-7 rounded-full bg-[#F0F7FF] border border-[#BAD8F7] flex items-center justify-center mr-2 flex-shrink-0 mt-auto mb-1">
                          <BotMessageSquare className="w-4 h-4 text-[#38A3F1]" />
                        </div>
                      )}
                      <div
                        className={`max-w-[80%] px-4 py-2.5 text-[13px] leading-relaxed rounded-2xl ${
                          msg.role === "user"
                            ? "bg-[#0D3A6E] text-white rounded-tr-[4px]"
                            : "bg-white text-[#0D3A6E] border border-[#E8F3FD] rounded-tl-[4px]"
                        }`}
                      >
                        {msg.content}
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
                {sending && (
                  <div className="flex justify-start">
                    <div className="flex items-center gap-2 px-4 py-3 bg-white border border-[#E8F3FD] rounded-2xl rounded-tl-[4px]">
                      <Loader2 className="w-4 h-4 animate-spin text-[#38A3F1]" />
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              <div className="flex-shrink-0 px-4 py-3 bg-white border-t border-[#E8F3FD]">
                <form onSubmit={sendMessage} className="flex items-end gap-2 bg-[#F8FBFF] border border-[#E8F3FD] rounded-xl p-1.5 focus-within:border-[#38A3F1] transition">
                  <input
                    ref={inputRef}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Escribe tu mensaje al cliente..."
                    disabled={sending || completed}
                    className="flex-1 bg-transparent border-none outline-none text-[13px] text-[#0D3A6E] placeholder:text-[#93B8D4] px-3 py-2"
                  />
                  <button
                    type="submit"
                    disabled={sending || !input.trim() || completed}
                    className="w-9 h-9 rounded-lg bg-[#0D3A6E] flex items-center justify-center hover:bg-[#0D5FA6] disabled:bg-[#E8F3FD] disabled:text-[#BAD8F7] transition text-white"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </form>
                <p className="text-[10px] text-[#93B8D4] mt-1.5 px-1">
                  {messageCount} mensajes enviados · {scenario.clientName} te responde como cliente real
                </p>
              </div>
            </div>
          )}

          {activeTab === "brief" && (
            <div className="h-full overflow-y-auto p-4 sm:p-6 space-y-4">
              <div className="bg-white rounded-2xl border border-[#E8F3FD] p-5 space-y-4">
                <div className="flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-[#38A3F1]" />
                  <h3 className="text-sm font-bold text-[#0D3A6E]">Brief del Proyecto</h3>
                </div>

                <div className="space-y-3">
                  <div>
                    <p className="text-[10px] font-semibold text-[#93B8D4] uppercase tracking-wider">Cliente</p>
                    <p className="text-sm font-semibold text-[#0D3A6E]">{scenario.clientName}</p>
                    <p className="text-xs text-[#5B8DB8] mt-0.5">{scenario.client_personality || "Cliente simulado"}</p>
                  </div>

                  <div>
                    <p className="text-[10px] font-semibold text-[#93B8D4] uppercase tracking-wider">Descripción</p>
                    <p className="text-sm text-[#0D3A6E] leading-relaxed">{scenario.brief}</p>
                  </div>

                  <div>
                    <p className="text-[10px] font-semibold text-[#93B8D4] uppercase tracking-wider flex items-center gap-1">
                      <Target className="w-3 h-3" /> Objetivos
                    </p>
                    <ul className="space-y-1 mt-1">
                      {(scenario.objectives || []).map((obj, i) => (
                        <li key={i} className="flex items-start gap-2 text-xs text-[#0D3A6E]">
                          <CheckCircle2 className="w-3.5 h-3.5 text-[#1D9E75] mt-0.5 flex-shrink-0" />
                          {obj}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <p className="text-[10px] font-semibold text-[#93B8D4] uppercase tracking-wider flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3" /> Restricciones
                    </p>
                    <ul className="space-y-1 mt-1">
                      {(scenario.constraints || []).map((con, i) => (
                        <li key={i} className="flex items-start gap-2 text-xs text-[#EF4444]">
                          <span className="w-1 h-1 rounded-full bg-[#EF4444] mt-1.5 flex-shrink-0" />
                          {con}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="flex flex-wrap gap-2 pt-2">
                    {(scenario.skillsRequired || []).map((skill, i) => (
                      <span key={i} className="text-[10px] bg-[#F0F7FF] text-[#0D5FA6] px-2.5 py-1 rounded-full font-medium border border-[#BAD8F7]">
                        {skill}
                      </span>
                    ))}
                  </div>

                  <div className="flex items-center gap-4 pt-2 text-xs text-[#5B8DB8]">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      Tiempo estimado: {scenario.estimatedDays} días
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "changes" && (
            <div className="h-full overflow-y-auto p-4 sm:p-6 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-[#0D3A6E] flex items-center gap-2">
                  <GitPullRequest className="w-4 h-4" />
                  Solicitudes de cambio
                </h3>
                {messageCount > 0 && messageCount % 5 === 0 && !completed && (
                  <button
                    onClick={generateChangeRequest}
                    disabled={generatingChange}
                    className="text-[11px] font-semibold text-[#F59E0B] bg-[#FFFBEB] border border-[#FDE9C0] px-3 py-1.5 rounded-lg hover:bg-[#FEF3C7] transition disabled:opacity-50"
                  >
                    {generatingChange ? "Generando..." : "Nuevo cambio"}
                  </button>
                )}
              </div>

              {changeRequests.length === 0 ? (
                <div className="flex flex-col items-center gap-3 py-12 text-center">
                  <GitPullRequest className="w-10 h-10 text-[#BAD8F7]" />
                  <p className="text-sm text-[#5B8DB8]">Aún no hay solicitudes de cambio</p>
                  <p className="text-xs text-[#93B8D4]">Los clientes suelen pedir cambios después de varias interacciones</p>
                </div>
              ) : (
                changeRequests.map((cr) => {
                  const colors = statusColors[cr.status as keyof typeof statusColors] || statusColors.pending;
                  return (
                    <motion.div
                      key={cr.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="bg-white rounded-xl border border-[#E8F3FD] p-4 space-y-2"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <h4 className="text-sm font-semibold text-[#0D3A6E]">{cr.title}</h4>
                        <span
                          className="text-[10px] font-semibold px-2 py-0.5 rounded-full border flex-shrink-0"
                          style={{ background: colors.bg, color: colors.text, borderColor: colors.border }}
                        >
                          {cr.status === "pending" && "Pendiente"}
                          {cr.status === "accepted" && "Aceptado"}
                          {cr.status === "rejected" && "Rechazado"}
                          {cr.status === "completed" && "Completado"}
                        </span>
                      </div>
                      <p className="text-xs text-[#5B8DB8] leading-relaxed">{cr.description}</p>
                      {cr.status === "pending" && (
                        <div className="flex gap-2 pt-1">
                          <button
                            onClick={() => handleChangeRequestStatus(cr.id, "accepted")}
                            className="text-[11px] font-semibold text-[#1D9E75] bg-[#E1F5EE] px-3 py-1 rounded-lg hover:bg-[#BFE8DA] transition"
                          >
                            Aceptar cambio
                          </button>
                          <button
                            onClick={() => handleChangeRequestStatus(cr.id, "rejected")}
                            className="text-[11px] font-semibold text-[#EF4444] bg-[#FEF2F2] px-3 py-1 rounded-lg hover:bg-[#FECACA] transition"
                          >
                            Rechazar
                          </button>
                        </div>
                      )}
                    </motion.div>
                  );
                })
              )}
            </div>
          )}

          {activeTab === "evaluation" && (
            <div className="h-full overflow-y-auto p-4 sm:p-6 space-y-4">
              {evaluation ? (
                <>
                  <div className="bg-white rounded-2xl border border-[#E8F3FD] p-5 space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Trophy className="w-5 h-5 text-[#F59E0B]" />
                        <h3 className="text-sm font-bold text-[#0D3A6E]">Resultado de la Evaluación</h3>
                      </div>
                      <div
                        className="text-lg font-bold px-4 py-1.5 rounded-full"
                        style={{
                          background: evaluation.overall_score >= 70 ? "#E1F5EE" : evaluation.overall_score >= 40 ? "#FFFBEB" : "#FEF2F2",
                          color: evaluation.overall_score >= 70 ? "#1D9E75" : evaluation.overall_score >= 40 ? "#D97706" : "#EF4444",
                        }}
                      >
                        {evaluation.overall_score}/100
                      </div>
                    </div>

                    <p className="text-sm text-[#5B8DB8] leading-relaxed">{evaluation.summary}</p>

                    <div className="space-y-2">
                      <p className="text-[10px] font-semibold text-[#93B8D4] uppercase tracking-wider">Rúbrica</p>
                      {evaluation.rubric.map((item, i) => (
                        <div key={i} className="flex items-center gap-3 p-2.5 bg-[#F8FBFF] rounded-lg">
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-medium text-[#0D3A6E]">{item.criterion}</p>
                            <p className="text-[10px] text-[#93B8D4]">{item.comment}</p>
                          </div>
                          <div
                            className="text-xs font-bold px-2 py-1 rounded"
                            style={{
                              background: item.score >= 70 ? "#E1F5EE" : item.score >= 40 ? "#FFFBEB" : "#FEF2F2",
                              color: item.score >= 70 ? "#1D9E75" : item.score >= 40 ? "#D97706" : "#EF4444",
                            }}
                          >
                            {item.score}%
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="p-3 bg-[#E1F5EE] rounded-xl border border-[#BFE8DA]">
                        <p className="text-[10px] font-semibold text-[#1D9E75] uppercase tracking-wider mb-2">Fortalezas</p>
                        <ul className="space-y-1">
                          {evaluation.strengths.map((s, i) => (
                            <li key={i} className="flex items-start gap-1.5 text-xs text-[#0D3A6E]">
                              <CheckCircle2 className="w-3 h-3 text-[#1D9E75] mt-0.5 flex-shrink-0" />
                              {s}
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div className="p-3 bg-[#FFFBEB] rounded-xl border border-[#FDE9C0]">
                        <p className="text-[10px] font-semibold text-[#D97706] uppercase tracking-wider mb-2">Áreas de mejora</p>
                        <ul className="space-y-1">
                          {evaluation.improvements.map((imp, i) => (
                            <li key={i} className="flex items-start gap-1.5 text-xs text-[#0D3A6E]">
                              <AlertTriangle className="w-3 h-3 text-[#D97706] mt-0.5 flex-shrink-0" />
                              {imp}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>

                  <div className="bg-[#E1F5EE] border border-[#BFE8DA] rounded-xl p-4 flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-[#1D9E75] flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-semibold text-[#1D9E75]">Esta simulación se ha agregado a tu portafolio</p>
                      <p className="text-xs text-[#0D3A6E] mt-0.5">
                        Puedes ver todas tus simulaciones completadas y certificados en tu portafolio profesional.
                      </p>
                    </div>
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center gap-4 py-16">
                  <Trophy className="w-12 h-12 text-[#BAD8F7]" />
                  <p className="text-sm text-[#5B8DB8]">Finaliza la simulación para recibir tu evaluación</p>
                  <p className="text-xs text-[#93B8D4]">Interactúa con el cliente y luego presiona "Finalizar"</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
