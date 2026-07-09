"use client";

import { useState, useEffect } from "react";
import {
  X, Calendar, Flag, User, AlignLeft, Trash2, MessageSquare,
} from "lucide-react";
import type { Task, TaskStatus } from "@/app/actions/tasks";
import { updateTask, deleteTask } from "@/app/actions/tasks";
import CommentSection from "./CommentSection";

interface TaskDialogProps {
  task: Task;
  statuses: TaskStatus[];
  participants: { id: string; full_name: string; avatar_url?: string | null; role: string }[];
  role: "STUDENT" | "PYME";
  onClose: () => void;
  onUpdate: () => void;
  onDelete: (taskId: string) => void;
}

const PRIORITIES = [
  { value: "low", label: "Baja", color: "#93B8D4" },
  { value: "medium", label: "Media", color: "#38A3F1" },
  { value: "high", label: "Alta", color: "#D97706" },
  { value: "urgent", label: "Urgente", color: "#E24B4A" },
] as const;

const priorityColor: Record<string, string> = {
  low: "#93B8D4",
  medium: "#38A3F1",
  high: "#D97706",
  urgent: "#E24B4A",
};

export default function TaskDialog({
  task: initialTask,
  statuses,
  participants,
  role,
  onClose,
  onUpdate,
  onDelete,
}: TaskDialogProps) {
  const [task, setTask] = useState(initialTask);
  const [title, setTitle] = useState(task.title);
  const [description, setDescription] = useState(task.description ?? "");
  const [statusId, setStatusId] = useState(task.status_id);
  const [priority, setPriority] = useState(task.priority);
  const [assignedTo, setAssignedTo] = useState(task.assigned_to ?? "");
  const [dueDate, setDueDate] = useState(task.due_date ? task.due_date.split("T")[0] : "");
  const [saving, setSaving] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [activeTab, setActiveTab] = useState<"details" | "comments">("details");
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    setHasChanges(
      title !== task.title ||
      description !== (task.description ?? "") ||
      statusId !== task.status_id ||
      priority !== task.priority ||
      assignedTo !== (task.assigned_to ?? "") ||
      dueDate !== (task.due_date ? task.due_date.split("T")[0] : "")
    );
  }, [title, description, statusId, priority, assignedTo, dueDate, task]);

  const handleSave = async () => {
    if (!title.trim() || saving) return;
    setSaving(true);
    const res = await updateTask(task.id, {
      title: title.trim(),
      description: description || null,
      status_id: statusId,
      priority: priority as Task["priority"],
      assigned_to: assignedTo || null,
      due_date: dueDate || null,
    });
    if (res.success && res.data) {
      setTask(res.data);
      onUpdate();
      setHasChanges(false);
    }
    setSaving(false);
  };

  const handleDelete = async () => {
    await deleteTask(task.id);
    onDelete(task.id);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[10vh] pb-8 px-4">
      <div className="fixed inset-0 bg-black/30 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-lg bg-white rounded-2xl border border-[#E8F3FD] shadow-xl flex flex-col max-h-[80vh]">
        {/* Header */}
        <div className="shrink-0 flex items-center justify-between px-5 py-4 border-b border-[#E8F3FD]">
          <div className="flex items-center gap-2">
            <span
              className="w-2.5 h-2.5 rounded-full"
              style={{ backgroundColor: statuses.find((s) => s.id === statusId)?.color || "#93B8D4" }}
            />
            <select
              value={statusId}
              onChange={(e) => setStatusId(e.target.value)}
              className="text-xs font-medium bg-transparent border border-[#E8F3FD] rounded-lg px-2 py-1 text-[#5B8DB8] focus:outline-none focus:border-[#38A3F1]"
            >
              {statuses.map((s) => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </div>
          <div className="flex items-center gap-1">
            {hasChanges && (
              <button
                onClick={handleSave}
                disabled={saving}
                className="text-xs font-medium bg-[#0D3A6E] text-white px-3 py-1.5 rounded-lg hover:bg-[#0D5FA6] disabled:opacity-50 transition-colors"
              >
                {saving ? "Guardando..." : "Guardar"}
              </button>
            )}
            <button onClick={onClose} className="p-1.5 hover:bg-[#F0F7FF] rounded-lg transition-colors">
              <X className="w-4 h-4 text-[#93B8D4]" />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="shrink-0 flex border-b border-[#E8F3FD] px-5">
          <button
            onClick={() => setActiveTab("details")}
            className={`flex items-center gap-1.5 text-xs font-medium px-3 py-2.5 border-b-2 transition-colors ${
              activeTab === "details"
                ? "border-[#38A3F1] text-[#0D3A6E]"
                : "border-transparent text-[#93B8D4] hover:text-[#5B8DB8]"
            }`}
          >
            <AlignLeft className="w-3.5 h-3.5" />
            Detalles
          </button>
          <button
            onClick={() => setActiveTab("comments")}
            className={`flex items-center gap-1.5 text-xs font-medium px-3 py-2.5 border-b-2 transition-colors ${
              activeTab === "comments"
                ? "border-[#38A3F1] text-[#0D3A6E]"
                : "border-transparent text-[#93B8D4] hover:text-[#5B8DB8]"
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5" />
            Comentarios
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-5">
          {activeTab === "details" ? (
            <div className="space-y-4">
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full text-base font-semibold text-[#0D3A6E] bg-transparent border-b border-transparent focus:border-[#38A3F1] focus:outline-none pb-1 placeholder:text-[#93B8D4]"
                placeholder="Título de la tarea"
              />

              <div>
                <label className="flex items-center gap-1.5 text-[10px] font-medium text-[#93B8D4] uppercase tracking-wider mb-1.5">
                  <AlignLeft className="w-3 h-3" />
                  Descripción
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={4}
                  className="w-full text-xs px-3 py-2 bg-[#F0F7FF] border border-[#E8F3FD] rounded-lg focus:outline-none focus:border-[#38A3F1] text-[#0D3A6E] placeholder:text-[#93B8D4] resize-none"
                  placeholder="Agrega una descripción más detallada..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="flex items-center gap-1.5 text-[10px] font-medium text-[#93B8D4] uppercase tracking-wider mb-1.5">
                    <Flag className="w-3 h-3" />
                    Prioridad
                  </label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value as "low" | "medium" | "high" | "urgent")}
                    className="w-full text-xs px-3 py-2 bg-[#F0F7FF] border border-[#E8F3FD] rounded-lg focus:outline-none focus:border-[#38A3F1] text-[#0D3A6E]"
                  >
                    {PRIORITIES.map((p) => (
                      <option key={p.value} value={p.value}>{p.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="flex items-center gap-1.5 text-[10px] font-medium text-[#93B8D4] uppercase tracking-wider mb-1.5">
                    <Calendar className="w-3 h-3" />
                    Fecha límite
                  </label>
                  <input
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="w-full text-xs px-3 py-2 bg-[#F0F7FF] border border-[#E8F3FD] rounded-lg focus:outline-none focus:border-[#38A3F1] text-[#0D3A6E]"
                  />
                </div>
              </div>

              <div>
                <label className="flex items-center gap-1.5 text-[10px] font-medium text-[#93B8D4] uppercase tracking-wider mb-1.5">
                  <User className="w-3 h-3" />
                  Asignado a
                </label>
                <select
                  value={assignedTo}
                  onChange={(e) => setAssignedTo(e.target.value)}
                  className="w-full text-xs px-3 py-2 bg-[#F0F7FF] border border-[#E8F3FD] rounded-lg focus:outline-none focus:border-[#38A3F1] text-[#0D3A6E]"
                >
                  <option value="">Sin asignar</option>
                  {participants.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.full_name} ({p.role === "PYME" ? "Empresa" : "Estudiante"})
                    </option>
                  ))}
                </select>
              </div>
            </div>
          ) : (
            <CommentSection taskId={task.id} />
          )}
        </div>

        {/* Footer */}
        <div className="shrink-0 flex items-center justify-between px-5 py-3 border-t border-[#E8F3FD]">
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="flex items-center gap-1.5 text-[11px] font-medium text-[#E24B4A] hover:text-red-700 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Eliminar tarea
          </button>
          <span className="text-[10px] text-[#93B8D4]">
            Creada {new Date(task.created_at).toLocaleDateString("es-SV")}
          </span>
        </div>

        {/* Delete confirmation */}
        {showDeleteConfirm && (
          <div className="absolute inset-0 bg-white/95 rounded-2xl flex items-center justify-center p-6 z-10">
            <div className="text-center space-y-4">
              <p className="text-sm font-semibold text-[#0D3A6E]">¿Eliminar esta tarea?</p>
              <p className="text-xs text-[#5B8DB8]">Esta acción no se puede deshacer.</p>
              <div className="flex items-center justify-center gap-2">
                <button
                  onClick={handleDelete}
                  className="text-xs font-medium bg-[#E24B4A] text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
                >
                  Eliminar
                </button>
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="text-xs font-medium bg-[#F0F7FF] text-[#5B8DB8] px-4 py-2 rounded-lg hover:bg-[#E8F3FD] transition-colors"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
