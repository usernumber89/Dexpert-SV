"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Mail, Building, Calendar, MessageSquare, Eye, EyeOff, Trash2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";

interface Message {
  id: string;
  sender_name: string;
  sender_email: string;
  company: string | null;
  message: string;
  read: boolean;
  created_at: string;
}

export function MessagesInbox({ studentId, onClose }: { studentId: string; onClose: () => void }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMsg, setSelectedMsg] = useState<Message | null>(null);
  const supabase = createClient();

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from("portfolio_messages")
        .select("*")
        .eq("student_id", studentId)
        .order("created_at", { ascending: false });
      if (data) setMessages(data);
      setLoading(false);
    })();
  }, [studentId, supabase]);

  const toggleRead = async (msg: Message) => {
    const { error } = await supabase
      .from("portfolio_messages")
      .update({ read: !msg.read })
      .eq("id", msg.id);
    if (error) { toast.error("Error al actualizar"); return; }
    setMessages(messages.map((m) => m.id === msg.id ? { ...m, read: !m.read } : m));
    if (selectedMsg?.id === msg.id) setSelectedMsg({ ...selectedMsg, read: !selectedMsg.read });
  };

  const deleteMessage = async (id: string) => {
    const { error } = await supabase.from("portfolio_messages").delete().eq("id", id);
    if (error) { toast.error("Error al eliminar"); return; }
    setMessages(messages.filter((m) => m.id !== id));
    if (selectedMsg?.id === id) setSelectedMsg(null);
    toast.success("Mensaje eliminado");
  };

  const unreadCount = messages.filter((m) => !m.read).length;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
        onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col"
        >
          <div className="flex items-center justify-between p-5 border-b border-[#E8F3FD] sticky top-0 bg-white z-10 rounded-t-2xl">
            <div>
              <h2 className="text-base font-bold text-[#0D3A6E] flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-[#38A3F1]" />
                Mensajes recibidos
              </h2>
              <p className="text-xs text-[#5B8DB8] mt-0.5">
                {unreadCount > 0 ? `${unreadCount} sin leer` : "Todos leídos"}
              </p>
            </div>
            <button onClick={onClose} className="w-8 h-8 rounded-lg hover:bg-[#F0F7FF] flex items-center justify-center">
              <X className="w-4 h-4 text-[#5B8DB8]" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-5">
            {loading ? (
              <div className="flex justify-center py-12">
                <div className="w-6 h-6 border-2 border-[#BAD8F7] border-t-[#38A3F1] rounded-full animate-spin" />
              </div>
            ) : messages.length === 0 ? (
              <div className="text-center py-16">
                <div className="w-14 h-14 mx-auto mb-4 bg-[#F0F7FF] rounded-2xl flex items-center justify-center">
                  <Mail className="w-7 h-7 text-[#BAD8F7]" />
                </div>
                <p className="text-sm text-[#5B8DB8]">Aún no has recibido mensajes</p>
                <p className="text-xs text-[#93B8D4] mt-1">Cuando alguien te contacte desde tu portafolio, aparecerá aquí</p>
              </div>
            ) : selectedMsg ? (
              <div>
                <button onClick={() => setSelectedMsg(null)} className="text-xs font-semibold text-[#38A3F1] hover:text-[#0D5FA6] mb-4">&larr; Volver</button>
                <div className="bg-[#F8FAFC] rounded-xl p-5 border border-[#E8F3FD]">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-sm font-bold text-[#0D3A6E]">{selectedMsg.sender_name}</h3>
                      <p className="text-xs text-[#5B8DB8]">{selectedMsg.sender_email}</p>
                      {selectedMsg.company && (
                        <p className="text-xs text-[#38A3F1] flex items-center gap-1 mt-1"><Building className="w-3 h-3" />{selectedMsg.company}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <button onClick={() => toggleRead(selectedMsg)} className="text-[#93B8D4] hover:text-[#38A3F1] p-1.5 rounded-lg hover:bg-[#F0F7FF]" title={selectedMsg.read ? "Marcar no leído" : "Marcar leído"}>
                        {selectedMsg.read ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                      <button onClick={() => deleteMessage(selectedMsg.id)} className="text-[#93B8D4] hover:text-red-500 p-1.5 rounded-lg hover:bg-red-50" title="Eliminar">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 text-[11px] text-[#93B8D4] mb-4">
                    <Calendar className="w-3 h-3" />
                    {new Date(selectedMsg.created_at).toLocaleDateString("es-SV", { year: "numeric", month: "long", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                  </div>
                  <div className="bg-white rounded-xl p-4 border border-[#E8F3FD]">
                    <p className="text-sm text-[#0D3A6E] leading-relaxed whitespace-pre-line">{selectedMsg.message}</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                {messages.map((msg) => (
                  <div key={msg.id}
                    onClick={() => setSelectedMsg(msg)}
                    className={`flex items-start gap-3 p-4 rounded-xl border cursor-pointer transition-all hover:shadow-md ${
                      msg.read ? "bg-white border-[#E8F3FD]" : "bg-[#F0F7FF] border-[#BAD8F7]"
                    }`}
                  >
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${msg.read ? "bg-[#F0F7FF] text-[#93B8D4]" : "bg-[#38A3F1] text-white"}`}>
                      <Mail className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h3 className={`text-sm truncate ${msg.read ? "text-[#0D3A6E]" : "text-[#0D3A6E] font-bold"}`}>{msg.sender_name}</h3>
                        <div className="flex items-center gap-2 shrink-0">
                          <span className="text-[10px] text-[#93B8D4]">{new Date(msg.created_at).toLocaleDateString("es-SV")}</span>
                          {!msg.read && <div className="w-2 h-2 rounded-full bg-[#38A3F1]" />}
                        </div>
                      </div>
                      <p className={`text-xs truncate mt-0.5 ${msg.read ? "text-[#5B8DB8]" : "text-[#5B8DB8]"}`}>{msg.message}</p>
                      {msg.company && <p className="text-[10px] text-[#38A3F1] mt-0.5">{msg.company}</p>}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
