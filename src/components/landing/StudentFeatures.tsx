"use client";

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import {
  BotMessageSquare, BookOpen, ArrowRight,
  CheckCircle2, BarChart3, GripVertical, MessageSquare,
  Columns3,
} from "lucide-react";
import {
  DndContext, DragOverlay, useDraggable, useDroppable,
  PointerSensor, useSensor, useSensors,
} from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import Link from "next/link";

const levels = [
  {
    level: 1,
    title: "Simulación Profesional",
    subtitle: "Practicá con clientes reales simulados por IA",
    color: "#38A3F1",
    bg: "#F0F7FF",
    features: [
      "Briefs profesionales por área (Software, Diseño, Marketing, Admin, Arquitectura, Ingeniería)",
      "Clientes ficticios con personalidad y objetivos únicos",
      "Objetivos, restricciones y fechas de entrega realistas",
      "Solicitudes de cambio espontáneas del cliente",
    ],
  },
  {
    level: 2,
    title: "Evaluación y Retroalimentación",
    subtitle: "IA evalúa tu trabajo y te ayuda a mejorar",
    color: "#F59E0B",
    bg: "#FFFBEB",
    features: [
      "Evaluación automática con rúbrica por criterios",
      "Identificación de fortalezas y áreas de mejora",
      "Retroalimentación detallada y constructiva",
      "Aprendizaje continuo basado en práctica real",
    ],
  },
  {
    level: 3,
    title: "Portafolio Automático",
    subtitle: "Cada proyecto completado genera evidencia profesional",
    color: "#1D9E75",
    bg: "#E1F5EE",
    features: [
      "Registro automático con nombre, descripción y competencias",
      "Horas invertidas y resultados obtenidos documentados",
      "Habilidades demostradas visibles para empleadores",
      "Portafolio digital compartible desde el primer proyecto",
    ],
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.12 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0 },
};

function KanbanCard({ task }: { task: { id: string; title: string } }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: task.id,
    data: { type: "task", ...task },
  });

  const style = transform
    ? { transform: CSS.Translate.toString(transform), opacity: isDragging ? 0.3 : 1 }
    : undefined;

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      className="bg-white rounded-lg border border-[#E8F3FD] p-2.5 shadow-sm cursor-grab active:cursor-grabbing transition-shadow hover:shadow-md"
      style={style}
    >
      <div className="flex items-start gap-1.5">
        <GripVertical className="w-3 h-3 text-[#BAD8F7] shrink-0 mt-0.5" />
        <p className="text-[11px] font-medium text-[#0D3A6E] leading-snug">{task.title}</p>
      </div>
    </div>
  );
}

function KanbanColumn({ column }: { column: { id: string; title: string; color: string; bg: string; tasks: { id: string; title: string }[] } }) {
  const { setNodeRef, isOver } = useDroppable({
    id: column.id,
    data: { type: "column" },
  });

  return (
    <div
      ref={setNodeRef}
      className="rounded-xl p-3 min-h-[160px] transition-all duration-200"
      style={{
        background: isOver ? "#E3F0FA" : column.bg,
        boxShadow: isOver ? "inset 0 0 0 2px #38A3F1" : "none",
      }}
    >
      <div className="flex items-center gap-2 mb-3 px-1">
        <div className="w-2 h-2 rounded-full" style={{ background: column.color }} />
        <span className="text-xs font-semibold text-[#0D3A6E]">{column.title}</span>
        <span className="text-[10px] text-[#93B8D4] ml-auto">{column.tasks.length}</span>
      </div>
      <div className="space-y-2">
        {column.tasks.map((task) => (
          <KanbanCard key={task.id} task={task} />
        ))}
      </div>
    </div>
  );
}

function KanbanBoard() {
  const [columns, setColumns] = useState([
    { id: "todo", title: "Por hacer", color: "#93B8D4", bg: "#F8FAFC", tasks: [
      { id: "t1", title: "Integración y pruebas" },
      { id: "t5", title: "Configurar CI/CD" },
    ]},
    { id: "progress", title: "En progreso", color: "#38A3F1", bg: "#F0F7FF", tasks: [
      { id: "t2", title: "Desarrollo frontend" },
      { id: "t6", title: "API REST endpoints" },
    ]},
    { id: "review", title: "En revisión", color: "#D97706", bg: "#FFFBEB", tasks: [
      { id: "t3", title: "Diseño UI en Figma" },
    ]},
    { id: "done", title: "Completado", color: "#1D9E75", bg: "#E1F5EE", tasks: [
      { id: "t4", title: "Wireframes" },
      { id: "t7", title: "Research de usuarios" },
    ]},
  ]);

  const [activeId, setActiveId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  );

  const completedCount = useMemo(
    () => columns.find((c) => c.id === "done")?.tasks.length ?? 0,
    [columns]
  );
  const totalCount = useMemo(
    () => columns.reduce((s, c) => s + c.tasks.length, 0),
    [columns]
  );
  const progressPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  function handleDragStart(event: any) {
    setActiveId(event.active.id);
  }

  function handleDragEnd(event: any) {
    const { active, over } = event;
    setActiveId(null);
    if (!over) return;

    const activeTaskId = active.id as string;
    const taskData = active.data.current;

    let targetColumnId: string;
    if (over.data.current?.type === "column") {
      targetColumnId = over.id as string;
    } else {
      const overCol = columns.find((c) => c.tasks.some((t) => t.id === over.id));
      if (!overCol) return;
      targetColumnId = overCol.id;
    }

    const sourceColumn = columns.find((c) => c.tasks.some((t) => t.id === activeTaskId));
    if (!sourceColumn || sourceColumn.id === targetColumnId) return;

    setColumns((cols) =>
      cols.map((col) => {
        if (col.id === sourceColumn.id) {
          return { ...col, tasks: col.tasks.filter((t) => t.id !== activeTaskId) };
        }
        if (col.id === targetColumnId) {
          return { ...col, tasks: [...col.tasks, { ...taskData }] };
        }
        return col;
      })
    );
  }

  function handleDragCancel() {
    setActiveId(null);
  }

  const activeTask = activeId
    ? columns.flatMap((c) => c.tasks).find((t) => t.id === activeId)
    : null;

  return (
    <>
      {/* Progress bar */}
      <div className="max-w-xl mx-auto mb-8">
        <div className="flex items-center justify-between text-xs mb-1.5">
          <span className="text-[#93B8D4]">Avance del proyecto</span>
          <span className="font-medium text-[#0D3A6E]">{completedCount}/{totalCount} tareas</span>
        </div>
        <div className="w-full h-2 bg-[#F0F7FF] rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progressPercent}%` }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="h-full rounded-full bg-gradient-to-r from-[#38A3F1] to-[#1D5A9E]"
          />
        </div>
      </div>

      {/* Interactive Kanban */}
      <DndContext
        sensors={sensors}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        onDragCancel={handleDragCancel}
      >
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-10">
          {columns.map((col) => (
            <KanbanColumn key={col.id} column={col} />
          ))}
        </div>
        <DragOverlay dropAnimation={null}>
          {activeTask ? (
            <div className="bg-white rounded-lg border border-[#38A3F1] p-2.5 shadow-lg rotate-2">
              <div className="flex items-start gap-1.5">
                <GripVertical className="w-3 h-3 text-[#BAD8F7] shrink-0 mt-0.5" />
                <p className="text-[11px] font-medium text-[#0D3A6E] leading-snug">{activeTask.title}</p>
              </div>
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>
    </>
  );
}

export function StudentFeatures() {
  return (
    <section className="relative py-24 px-6 bg-gradient-to-b from-white to-[#F0F7FF] overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-40 left-10 w-72 h-72 bg-[#38A3F1] rounded-full opacity-[0.03] blur-3xl" />
        <div className="absolute bottom-40 right-10 w-96 h-96 bg-[#8B5CF6] rounded-full opacity-[0.03] blur-3xl" />
      </div>

      <div className="relative max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-white rounded-md shadow-sm border border-[#BAD8F7] mb-5">
            
            <span className="text-xs font-semibold uppercase tracking-wider text-[#0D5FA6]">
              3 niveles de crecimiento
            </span>
          </div>
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-[#0D3A6E] mb-4">
            De principiante a{" "}
            <span className="relative">
              <span className="relative z-10 bg-[#38A3F1] bg-clip-text text-transparent">
                profesional
              </span>
              <svg className="absolute -bottom-2 left-0 w-full h-3 text-[#38A3F1]/20" viewBox="0 0 100 10" preserveAspectRatio="none">
                <path d="M0,5 Q50,10 100,5" stroke="currentColor" strokeWidth="8" fill="none" />
              </svg>
            </span>
          </h2>
          <p className="text-[#5B8DB8] max-w-2xl text-sm mx-auto leading-relaxed">
            Un camino progresivo donde simulás, aprendés, construís portafolio y accedés a proyectos reales.
            Todo en una sola plataforma, impulsado por IA.
          </p>
        </motion.div>

        {/* Levels Grid */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          variants={containerVariants}
          className="grid md:grid-cols-3 gap-5"
        >
          {levels.map((lvl) => {
            const Icon = [BotMessageSquare, BarChart3, BookOpen][lvl.level - 1];
            return (
              <motion.div
                key={lvl.level}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: lvl.level * 0.1 }}
                className="group relative bg-white rounded-2xl border border-[#E8F3FD] p-6 sm:p-7 hover:shadow-xl transition-all duration-300 overflow-hidden"
                style={{ borderColor: lvl.color + "20" }}
              >
                <div className="flex flex-col items-center text-center">
                  {/* Icon */}
                  <div
                    className="w-16 h-16 rounded-2xl flex items-center justify-center shadow-md mb-4"
                    style={{ background: lvl.bg }}
                  >
                    <Icon className="w-8 h-8" style={{ color: lvl.color }} />
                  </div>

                  {/* Level badge + title */}
                  <div className="flex items-center gap-2 mb-1.5">
                    <span
                      className="text-[10px] font-bold px-2 py-0.5 rounded-full border"
                      style={{
                        background: lvl.bg,
                        color: lvl.color,
                        borderColor: lvl.color + "40",
                      }}
                    >
                      Nivel {lvl.level}
                    </span>
                    <h3 className="text-base font-bold text-[#0D3A6E]">{lvl.title}</h3>
                  </div>
                  <p className="text-xs text-[#5B8DB8] mb-4 leading-relaxed">{lvl.subtitle}</p>

                  {/* Features */}
                  <ul className="space-y-1.5 w-full text-left">
                    {lvl.features.map((feat, i) => (
                      <li key={i} className="flex items-start gap-2 text-xs text-[#0D3A6E]">
                        <CheckCircle2 className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" style={{ color: lvl.color }} />
                        <span className="leading-relaxed">{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Arrow hint on hover */}
                <div
                  className="absolute bottom-4 right-5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  style={{ color: lvl.color }}
                >
                  <ArrowRight className="w-5 h-5" />
                </div>
              </motion.div>
            );
          })}
        </motion.div>

        {/* ── Kanban Board Demo (MilestonesShowcase fusionado) ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-20 mb-16"
        >
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-white rounded-md shadow-sm border border-[#BAD8F7] mb-5">
              <Columns3 className="w-4 h-4 text-[#38A3F1]" />
              <span className="text-xs font-semibold uppercase tracking-wider text-[#0D5FA6]">
                Tablero de tareas
              </span>
            </div>
            <h3 className="text-xl md:text-2xl font-bold text-[#0D3A6E] mb-3">
              Cada proyecto, <span className="text-[#38A3F1]">en un tablero visual</span>
            </h3>
            <p className="text-[#5B8DB8] max-w-xl text-sm mx-auto leading-relaxed">
              PYME y estudiante organizan el trabajo en columnas de progreso:
              arrastran tareas, comentan y ven el avance en tiempo real.
            </p>
          </div>

          <KanbanBoard />

          {/* Features grid */}
          <div className="grid md:grid-cols-3 gap-6 max-w-3xl mx-auto">
            {[
              { title: "Arrastrá y organizá", text: "Mové tareas entre columnas con drag & drop. PYME y estudiante ven el flujo en tiempo real." },
              { title: "Comentarios por tarea", text: "Cada tarjeta tiene su propio hilo de discusión. Sin perder contexto entre chats." },
              { title: "Prioridades claras", text: "Marcá tareas como baja, media o alta. El equipo sabe qué hacer primero." },
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
        </motion.div>

        {/* Free vs Paid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <div className="text-center mb-10">
            <h3 className="text-xl font-bold text-[#0D3A6E] mb-2">
              Gratis para estudiantes, <span className="text-[#38A3F1]">potencia tu perfil cuando quieras</span>
            </h3>
            <p className="text-sm text-[#5B8DB8] max-w-lg mx-auto">
              Crear tu cuenta, aplicar a proyectos reales, usar el simulador IA y el tablero de tareas es 100% gratis.
              Solo pagas por lo que te da valor extra.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto">
            {/* Free column */}
            <div className="bg-white rounded-2xl border-2 border-[#E8F3FD] p-6">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg bg-[#E1F5EE] flex items-center justify-center">
                  <CheckCircle2 className="w-4 h-4 text-[#1D9E75]" />
                </div>
                <span className="text-sm font-bold text-[#0D3A6E]">Gratis</span>
              </div>
              <ul className="space-y-3">
                {[
                  "Perfil profesional visible para empresas",
                  "Aplicar a proyectos reales de PYMES",
                  "Simulador IA con clientes ficticios",
                  "Evaluación y retroalimentación automática",
                  "Acceso al tablero Kanban de tareas",
                  "Certificado digital del simulador",
                ].map((f) => (
                  <li key={f} className="flex items-start gap-2 text-xs text-[#0D3A6E]">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#1D9E75] shrink-0 mt-0.5" />
                    {f}
                  </li>
                ))}
              </ul>
            </div>

            {/* Paid column */}
            <div className="bg-white rounded-2xl border-2 border-[#BAD8F7] p-6 relative">
              <div className="absolute -top-3 right-4 bg-[#38A3F1] text-white text-[10px] font-bold px-3 py-1 rounded-full">
                Premium
              </div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg bg-[#F0F7FF] flex items-center justify-center">
                  <BotMessageSquare className="w-4 h-4 text-[#38A3F1]" />
                </div>
                <span className="text-sm font-bold text-[#0D3A6E]">Pago único</span>
              </div>
              <ul className="space-y-3">
                {[
                  { text: "Certificado verificable de proyecto real", price: "$4.99" },
                  { text: "Portfolio profesional compartible", price: "$9.99" },
                  { text: "Perfil destacado (top del buscador por 30 días)", price: "$2.99/mes" },
                ].map((f) => (
                  <li key={f.text} className="flex items-start justify-between gap-2 text-xs text-[#0D3A6E]">
                    <div className="flex items-start gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#38A3F1] shrink-0 mt-0.5" />
                      <span>{f.text}</span>
                    </div>
                    <span className="font-bold text-[#38A3F1] shrink-0">{f.price}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </motion.div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-12 text-center"
        >
          <div className="inline-flex flex-col sm:flex-row items-center gap-4 sm:gap-6 bg-white rounded-2xl border border-[#E8F3FD] shadow-sm px-8 py-5">
            <div className="flex items-center gap-2">
              
              <span className="text-sm text-[#0D3A6E] font-medium">
                Empezá gratis · Sin experiencia previa requerida
              </span>
            </div>
            <Link
              href="/sign-up"
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-white bg-[#0D3A6E] px-6 py-2.5 rounded-xl hover:bg-[#0D5FA6] transition-colors shadow-sm"
            >
              Crear cuenta gratuita
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
