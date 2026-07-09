"use client";

import { useDroppable } from "@dnd-kit/core";
import { Plus } from "lucide-react";
import type { Task, TaskStatus } from "@/app/actions/tasks";
import TaskCard from "./TaskCard";

interface TaskColumnProps {
  status: TaskStatus;
  tasks: Task[];
  commentCounts: Record<string, number>;
  onTaskClick: (task: Task) => void;
  onAddTask: (statusId: string) => void;
  role: "STUDENT" | "PYME";
}

export default function TaskColumn({
  status,
  tasks,
  commentCounts,
  onTaskClick,
  onAddTask,
  role,
}: TaskColumnProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: `column-${status.id}`,
    data: { statusId: status.id },
  });

  return (
    <div
      ref={setNodeRef}
      className={`flex-shrink-0 w-[260px] sm:w-[280px] flex flex-col rounded-xl border transition-colors ${
        isOver
          ? "border-[#38A3F1] bg-[#F0F7FF]/50"
          : "border-[#E8F3FD] bg-[#FAFCFF]"
      }`}
    >
      {/* Column header */}
      <div className="shrink-0 flex items-center justify-between px-3 py-3 border-b border-[#E8F3FD]">
        <div className="flex items-center gap-2">
          <span
            className="w-2.5 h-2.5 rounded-full"
            style={{ backgroundColor: status.color }}
          />
          <h3 className="text-xs font-semibold text-[#0D3A6E]">{status.name}</h3>
          <span className="text-[10px] text-[#93B8D4] font-medium bg-[#F0F7FF] px-1.5 py-0.5 rounded-full">
            {tasks.length}
          </span>
        </div>
        {role === "PYME" && (
          <button
            onClick={() => onAddTask(status.id)}
            className="p-1 hover:bg-[#E8F3FD] rounded-lg transition-colors"
          >
            <Plus className="w-3.5 h-3.5 text-[#5B8DB8]" />
          </button>
        )}
      </div>

      {/* Tasks */}
      <div className="flex-1 overflow-y-auto p-2 space-y-2 min-h-[120px]">
        {tasks.length === 0 ? (
          <div className="flex items-center justify-center py-8">
            <p className="text-[10px] text-[#93B8D4] text-center">
              Arrastra tareas aquí
            </p>
          </div>
        ) : (
          tasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              commentCount={commentCounts[task.id] || 0}
              onClick={() => onTaskClick(task)}
            />
          ))
        )}
      </div>
    </div>
  );
}
