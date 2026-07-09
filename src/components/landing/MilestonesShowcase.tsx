"use client";

import { motion } from "framer-motion";
import { CheckCircle2, Clock, AlertCircle, ArrowRight, Columns3, MessageSquare, GripVertical } from "lucide-react";

const columns = [
  { title: "Por hacer", color: "#93B8D4", bg: "#F8FAFC", tasks: [
    { title: "Integración y pruebas", priority: "medium" },
  ]},
  { title: "En progreso", color: "#38A3F1", bg: "#F0F7FF", tasks: [
    { title: "Desarrollo del frontend", priority: "high" },
  ]},
  { title: "En revisión", color: "#D97706", bg: "#FFFBEB", tasks: [
    { title: "Diseño de UI en Figma", priority: "medium", comments: 3 },
  ]},
  { title: "Completado", color: "#1D9E75", bg: "#E1F5EE", tasks: [
    { title: "Investigación y wireframes", priority: "low" },
  ]},
];

const priorityDot: Record<string, string> = {
  low: "#93B8D4", medium: "#38A3F1", high: "#D97706",
};

export function MilestonesShowcase() {
  const totalTasks = columns.reduce((s, c) => s + c.tasks.length, 0);
  const doneTasks = columns[3].tasks.length;
  const progress = Math.round((doneTasks / totalTasks) * 100);

  return (
    <section className="py-24 px-6 bg-gradient-to-b from-white to-[#F0F7FF]">
      <div className="max-w-6xl mx-auto">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-white rounded-md shadow-sm border border-[#BAD8F7] mb-5">
            <Columns3 className="w-4 h-4 text-[#38A3F1]" />
            <span className="text-xs font-semibold uppercase tracking-wider text-[#0D5FA6]">
              Tablero de tareas
            </span>
          </div>
          <h2 className="lg:text-3xl md:text-2xl font-bold text-[#0D3A6E] mb-3">
            Cada proyecto, <span className="text-[#38A3F1]">en un tablero visual</span>
          </h2>
          <p className="text-[#5B8DB8] max-w-xl text-sm mx-auto leading-relaxed">
            PYME y estudiante organizan el trabajo en columnas de progreso:
            asignan tareas, mueven tarjetas con drag & drop y dejan comentarios.
          </p>
        </motion.div>

        {/* Progress bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-xl mx-auto mb-8"
        >
          <div className="flex items-center justify-between text-xs mb-1.5">
            <span className="text-[#93B8D4]">Avance del proyecto</span>
            <span className="font-medium text-[#0D3A6E]">{doneTasks}/{totalTasks} tareas</span>
          </div>
          <div className="w-full h-2 bg-[#F0F7FF] rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              whileInView={{ width: `${progress}%` }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="h-full rounded-full bg-[#38A3F1]"
            />
          </div>
        </motion.div>

        {/* Kanban board demo */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-12">
          {columns.map((col) => (
            <motion.div
              key={col.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="rounded-xl p-3 min-h-[180px]"
              style={{ background: col.bg }}
            >
              <div className="flex items-center gap-2 mb-3 px-1">
                <div className="w-2 h-2 rounded-full" style={{ background: col.color }} />
                <span className="text-xs font-semibold text-[#0D3A6E]">{col.title}</span>
                <span className="text-[10px] text-[#93B8D4] ml-auto">{col.tasks.length}</span>
              </div>
              <div className="space-y-2">
                {col.tasks.map((task) => (
                  <div
                    key={task.title}
                    className="bg-white rounded-lg border border-[#E8F3FD] p-2.5 shadow-sm"
                  >
                    <div className="flex items-start gap-1.5">
                      <GripVertical className="w-3 h-3 text-[#BAD8F7] shrink-0 mt-0.5" />
                      <div className="min-w-0 flex-1">
                        <p className="text-[11px] font-medium text-[#0D3A6E] leading-snug">{task.title}</p>
                        <div className="flex items-center gap-2 mt-1.5">
                          <div className="w-1.5 h-1.5 rounded-full" style={{ background: priorityDot[task.priority] }} />
                          {'comments' in task && task.comments && (
                            <span className="flex items-center gap-0.5 text-[10px] text-[#93B8D4]">
                              <MessageSquare className="w-3 h-3" />{task.comments}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Features + CTA */}
        <div className="grid md:grid-cols-3 gap-6 max-w-3xl mx-auto">
          {[
            {
              title: "Arrastra y organiza",
              text: "Mueve tareas entre columnas con drag & drop. PYME y estudiante ven el flujo de trabajo en tiempo real.",
            },
            {
              title: "Comentarios por tarea",
              text: "Cada tarjeta tiene su propio hilo de discusión. Sin perder contexto entre chats y correos.",
            },
            {
              title: "Prioridades claras",
              text: "Marca tareas como baja, media, alta o urgente. El equipo sabe qué hacer primero.",
            },
          ].map((f) => (
            <div key={f.title} className="flex gap-3">
              <div className="w-8 h-8 rounded-lg bg-[#F0F7FF] flex items-center justify-center shrink-0 mt-0.5">
                <CheckCircle2 className="w-4 h-4 text-[#38A3F1]" />
              </div>
              <div>
                <p className="text-sm font-semibold text-[#0D3A6E] mb-0.5">{f.title}</p>
                <p className="text-xs text-[#5B8DB8] leading-relaxed">{f.text}</p>
              </div>
            </div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center mt-10"
        >
          <a
            href="/sign-up"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-[#38A3F1] hover:text-[#0D5FA6] transition-colors group"
          >
            Empieza tu primer proyecto
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </a>
        </motion.div>
      </div>
    </section>
  );
}