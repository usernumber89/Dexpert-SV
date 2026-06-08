'use client';

import { useState, useRef, useEffect } from 'react';
import { BotMessageSquare, CircleUser, Send, Sparkles } from "lucide-react";

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface SimulatorChatProps {
  scenarioId: string;
  onComplete?: (score: number) => void;
}

export function SimulatorChat({ scenarioId, onComplete }: SimulatorChatProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = { role: 'user', content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/ai-simulator', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: [...messages, userMessage], scenarioId }),
      });

      const data = await response.json();
      if (data.response) {
        setMessages((prev) => [...prev, { role: 'assistant', content: data.response }]);
      } else {
        throw new Error(data.error || 'Error en la IA');
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: 'Hubo un error de conexión. Por favor, intenta de nuevo.' },
      ]);
    } finally {
      setIsLoading(false);
      inputRef.current?.focus();
    }
  };

  useEffect(() => {
    if (messages.length >= 6 && onComplete && messages[messages.length - 1].role === 'assistant') {
      onComplete(85);
    }
  }, [messages, onComplete]);

  const msgCount = messages.length;

  return (
    <div className="flex flex-col h-[640px] max-w-[560px] mx-auto bg-[#F9FAFB] rounded-3xl overflow-hidden border border-zinc-200/80 shadow-[0_20px_50px_-12px_rgba(0,0,0,0.1)] transition-all">

      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 bg-white/80 backdrop-blur-md border-b border-zinc-200/60 flex-shrink-0 z-10">
        <div className="flex items-center gap-3">
          <div className="relative flex items-center justify-center w-10 h-10 rounded-full bg-blue-50 border border-blue-100 shadow-sm">
            <BotMessageSquare className="w-5 h-5 text-blue-600" />
            <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-emerald-500 border-2 border-white" />
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-bold text-zinc-900 tracking-tight">
              Asistente de Simulación
            </span>
           
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-semibold tracking-wider text-blue-600 uppercase bg-blue-50 px-2.5 py-1 rounded-full border border-blue-100">
            ID: {scenarioId.slice(0, 4) || 'TEST'}
          </span>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto px-6 py-6 space-y-4 scrollbar-none bg-zinc-50/50">
        {msgCount === 0 && (
          <div className="flex flex-col items-center justify-center h-full gap-4 text-center select-none" style={{ animation: 'fadeUp 0.4s ease forwards' }}>
            <div className="w-16 h-16 rounded-2xl bg-white border border-zinc-100 flex items-center justify-center shadow-sm ring-4 ring-zinc-50">
              <Sparkles className="w-7 h-7 text-blue-500" />
            </div>
            <div className="space-y-1.5">
              <h3 className="text-sm font-semibold text-zinc-900">Comienza la simulación</h3>
              <p className="text-[13px] text-zinc-500 max-w-[220px] leading-relaxed mx-auto">
                El asistente está listo para interactuar. Envía tu primer mensaje.
              </p>
            </div>
          </div>
        )}

        {messages.map((m, i) => (
          <div
            key={i}
            className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
            style={{ animation: 'fadeUp 0.3s ease forwards' }}
          >
            {m.role === 'assistant' && (
              <div className="w-7 h-7 rounded-full bg-blue-100 flex items-center justify-center mr-2 flex-shrink-0 mt-auto mb-1">
                <BotMessageSquare className="w-4 h-4 text-blue-600" />
              </div>
            )}
            <div
              className={[
                'max-w-[75%] px-4 py-3 text-[14px] leading-relaxed shadow-sm',
                m.role === 'user'
                  ? 'bg-blue-600 text-white rounded-2xl rounded-tr-[4px] font-medium'
                  : 'bg-white text-zinc-800 rounded-2xl rounded-tl-[4px] border border-zinc-200/80',
              ].join(' ')}
            >
              {m.content}
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex justify-start items-end" style={{ animation: 'fadeUp 0.3s ease forwards' }}>
             <div className="w-7 h-7 rounded-full bg-blue-100 flex items-center justify-center mr-2 flex-shrink-0 mb-1">
                <BotMessageSquare className="w-4 h-4 text-blue-600" />
              </div>
            <div className="bg-white border border-zinc-200/80 rounded-2xl rounded-tl-[4px] px-4 py-4 flex gap-1.5 items-center shadow-sm">
              {[0, 150, 300].map((delay) => (
                <span
                  key={delay}
                  className="w-1.5 h-1.5 rounded-full bg-zinc-400"
                  style={{ animation: `bounce 1s ease-in-out ${delay}ms infinite` }}
                />
              ))}
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="px-5 py-4 bg-white border-t border-zinc-200/60 flex-shrink-0 z-10">
        <form
          onSubmit={sendMessage}
          className="relative flex items-end gap-2 bg-zinc-50 border border-zinc-200 rounded-2xl p-1.5 focus-within:border-blue-500 focus-within:ring-4 focus-within:ring-blue-500/10 transition-all duration-300"
        >
          <input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Escribe tu mensaje..."
            disabled={isLoading}
            className="flex-1 bg-transparent border-none outline-none text-[14px] text-zinc-800 placeholder:text-zinc-400 px-3 py-2.5 min-w-0"
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center flex-shrink-0 hover:bg-blue-700 active:scale-95 disabled:bg-zinc-200 disabled:text-zinc-400 disabled:cursor-not-allowed transition-all text-white shadow-sm"
          >
            <Send className="w-4 h-4 ml-0.5" />
          </button>
        </form>
        
        <div className="flex justify-between items-center mt-3 px-1">
           <p className="text-[11px] font-medium text-zinc-400">
             Protegido por IA
           </p>
          {msgCount > 0 && (
            <p className="text-[11px] font-medium text-zinc-400">
              {msgCount} mensaje{msgCount !== 1 ? 's' : ''}
            </p>
          )}
        </div>
      </div>

      {/* Animations */}
      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(10px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes bounce {
          0%, 100% { transform: translateY(0); opacity: 0.4; }
          50%      { transform: translateY(-4px); opacity: 1; }
        }
        .scrollbar-none { scrollbar-width: none; }
        .scrollbar-none::-webkit-scrollbar { display: none; }
      `}</style>
    </div>
  );
}