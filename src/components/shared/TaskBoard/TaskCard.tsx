"use client";

import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { Calendar, User, MessageSquare, GripVertical } from "lucide-react";
import type { Task } from "@/app/actions/tasks";

interface TaskCardProps {
  task: Task;
  commentCount: number;
  onClick: () => void;
}

const priorityStyles: Record<string, { dot: string; bg: string }> = {
  low: { dot: "#93B8D4", bg: "#F8FAFC" },
  medium: { dot: "#38A3F1", bg: "#F0F7FF" },
  high: { dot: "#D97706", bg: "#FFFBEB" },
  urgent: { dot: "#E24B4A", bg: "#FCEBEB" },
};

export default function TaskCard({ task, commentCount, onClick }: TaskCardProps) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: task.id,
    data: { task },
  });

  const style = transform ? {
    transform: CSS.Translate.toString(transform),
    zIndex: 50,
  } : undefined;

  const pStyle = priorityStyles[task.priority] || priorityStyles.medium;

  const formatDate = (dateString: string | null) => {
    if (!dateString) return null;
    const d = new Date(dateString);
    const now = new Date();
    const diff = d.getTime() - now.getTime();
    const days = Math.ceil(diff / 86400000);
    return days <= 3 ? `en ${days <= 0 ? "0" : days}d` : d.toLocaleDateString("es-SV", { day: "numeric", month: "short" });
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={onClick}
      className={`group bg-white border rounded-xl p-3 cursor-grab active:cursor-grabbing transition-all ${
        isDragging
          ? "border-[#38A3F1] shadow-lg shadow-[#38A3F1]/10 opacity-90 rotate-2 scale-105"
          : "border-[#E8F3FD] hover:border-[#BAD8F7] hover:shadow-sm"
      }`}
    >
      <div className="flex items-start gap-2">
        <div className="mt-0.5 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
          <GripVertical className="w-3 h-3 text-[#93B8D4]" />
        </div>
        <div className="flex-1 min-w-0 space-y-2">
          <div className="flex items-start justify-between gap-2">
            <h4 className="text-[12px] font-semibold text-[#0D3A6E] leading-snug line-clamp-2">
              {task.title}
            </h4>
            <span
              className="w-2 h-2 rounded-full shrink-0 mt-0.5"
              style={{ backgroundColor: pStyle.dot }}
            />
          </div>

          <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
            {task.due_date && (
              <span className="flex items-center gap-1 text-[10px] text-[#93B8D4]">
                <Calendar className="w-3 h-3" />
                {formatDate(task.due_date)}
              </span>
            )}
            {task.assignee && (
              <span className="flex items-center gap-1 text-[10px] text-[#93B8D4]">
                <User className="w-3 h-3" />
                {task.assignee.full_name.split(" ")[0]}
              </span>
            )}
            {commentCount > 0 && (
              <span className="flex items-center gap-1 text-[10px] text-[#93B8D4]">
                <MessageSquare className="w-3 h-3" />
                {commentCount}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
