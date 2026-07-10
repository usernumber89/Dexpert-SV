"use client";

import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import {
  DndContext, DragEndEvent, DragOverlay, DragStartEvent,
  PointerSensor, useSensor, useSensors,
} from "@dnd-kit/core";
import { X, Plus, ListFilter, Search } from "lucide-react";
import {
  getProjectTaskStatuses, getProjectTasks, getProjectParticipants,
  createTask, reorderTask,
} from "@/app/actions/tasks";
import type { Task, TaskStatus } from "@/app/actions/tasks";
import TaskColumn from "./TaskColumn";
import TaskDialog from "./TaskDialog";
import { createClient } from "@/lib/supabase/client";

interface ProjectTaskBoardProps {
  projectId: string;
  projectTitle: string;
  role: "STUDENT" | "PYME";
  onClose: () => void;
}

interface NewTaskForm {
  statusId: string;
  title: string;
  assignedTo: string;
}

const PRIORITY_FILTERS = [
  { value: "all", label: "Todas" },
  { value: "urgent", label: "Urgentes" },
  { value: "high", label: "Alta" },
  { value: "medium", label: "Media" },
  { value: "low", label: "Baja" },
] as const;

export default function ProjectTaskBoard({
  projectId,
  projectTitle,
  role,
  onClose,
}: ProjectTaskBoardProps) {
  const [statuses, setStatuses] = useState<TaskStatus[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [participants, setParticipants] = useState<{ id: string; full_name: string; avatar_url?: string | null; role: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [newTask, setNewTask] = useState<NewTaskForm | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [priorityFilter, setPriorityFilter] = useState<string>("all");
  const [showFilters, setShowFilters] = useState(false);
  const [commentCounts, setCommentCounts] = useState<Record<string, number>>({});

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
  );

  const loadData = useCallback(async () => {
    const [statusesRes, tasksRes, participantsRes] = await Promise.all([
      getProjectTaskStatuses(projectId),
      getProjectTasks(projectId),
      getProjectParticipants(projectId),
    ]);

    if (statusesRes.success && statusesRes.data) setStatuses(statusesRes.data);
    if (tasksRes.success && tasksRes.data) setTasks(tasksRes.data);
    if (participantsRes.success && participantsRes.data) setParticipants(participantsRes.data);
    setLoading(false);
  }, [projectId]);

  useEffect(() => { loadData(); }, [loadData]);

  // Real-time updates for tasks
  useEffect(() => {
    const supabase = createClient();

    const channel = supabase
      .channel(`project-board-${projectId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "project_tasks",
          filter: `project_id=eq.${projectId}`,
        },
        () => { loadData(); }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [projectId, loadData]);

  // Load comment counts
  useEffect(() => {
    const supabase = createClient();
    let cancelled = false;
    const fetchCounts = async () => {
      const taskIds = tasks.map((t) => t.id);
      if (taskIds.length === 0) return;

      const { data } = await supabase
        .from("task_comments")
        .select("task_id")
        .in("task_id", taskIds);

      if (cancelled) return;

      const counts: Record<string, number> = {};
      if (data) {
        for (const id of taskIds) {
          counts[id] = data.filter((c: { task_id: string }) => c.task_id === id).length;
        }
      }
      setCommentCounts(counts);
    };
    fetchCounts();
    return () => { cancelled = true; };
  }, [tasks]);

  // Group tasks by status
  const tasksByStatus = useMemo(() => {
    const map: Record<string, Task[]> = {};
    for (const s of statuses) {
      map[s.id] = [];
    }

    const query = searchTerm.toLowerCase();
    for (const task of tasks) {
      if (searchTerm && !task.title.toLowerCase().includes(query)) continue;
      if (priorityFilter !== "all" && task.priority !== priorityFilter) continue;

      if (map[task.status_id]) {
        map[task.status_id].push(task);
      }
    }

    // Sort by position within each column
    for (const key of Object.keys(map)) {
      map[key].sort((a, b) => a.position - b.position);
    }

    return map;
  }, [tasks, statuses, searchTerm, priorityFilter]);

  // Handle drag start
  const handleDragStart = (event: DragStartEvent) => {
    const task = event.active.data.current?.task as Task | undefined;
    if (task) setActiveTask(task);
  };

  // Handle drag end
  const handleDragEnd = async (event: DragEndEvent) => {
    setActiveTask(null);
    const { active, over } = event;
    if (!over) return;

    const taskId = active.id as string;
    const task = tasks.find((t) => t.id === taskId);
    if (!task) return;

    const overId = over.id.toString();
    let targetStatusId: string | null = null;

    if (overId.startsWith("column-")) {
      targetStatusId = over.data.current?.statusId as string;
    }

    if (!targetStatusId || targetStatusId === task.status_id) {
      loadData();
      return;
    }

    // Optimistic update
    setTasks((prev) =>
      prev.map((t) =>
        t.id === taskId ? { ...t, status_id: targetStatusId! } : t
      )
    );

    await reorderTask(taskId, targetStatusId, 0);
  };

  const handleCreateTask = async () => {
    if (!newTask || !newTask.title.trim()) return;
    const res = await createTask(projectId, {
      title: newTask.title.trim(),
      status_id: newTask.statusId,
      assigned_to: newTask.assignedTo || undefined,
    });
    if (!res.success) {
      console.error("Error creating task:", res.error);
    }
    setNewTask(null);
    setShowFilters(false);
    if (res.success && res.data) {
      setTasks((prev) => [...prev, res.data as Task]);
    } else {
      loadData();
    }
  };

  const handleTaskUpdate = async () => {
    loadData();
  };

  const handleTaskDelete = (taskId: string) => {
    setSelectedTask(null);
    loadData();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full min-h-[400px]">
        <div className="w-8 h-8 border-2 border-[#BAD8F7] border-t-[#38A3F1] rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Board Header */}
      <div className="shrink-0 flex items-center justify-between px-4 py-3 border-b border-[#E8F3FD] bg-white">
        <div className="min-w-0">
          <p className="text-[10px] font-medium uppercase tracking-widest text-[#93B8D4] mb-0.5">
            Tablero de tareas
          </p>
          <h2 className="text-sm font-semibold text-[#0D3A6E] truncate">
            {projectTitle}
          </h2>
        </div>
        <div className="flex items-center gap-2">
          {/* Summary stat */}
          <div className="hidden sm:flex items-center gap-3 text-[10px] text-[#93B8D4]">
            <span>{tasks.length} tareas</span>
            <span>{statuses.length} columnas</span>
          </div>

          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`p-1.5 rounded-lg transition-colors ${
              showFilters || searchTerm || priorityFilter !== "all"
                ? "bg-[#0D3A6E] text-white"
                : "text-[#5B8DB8] hover:bg-[#F0F7FF]"
            }`}
          >
            <ListFilter className="w-4 h-4" />
          </button>
          <button
            onClick={onClose}
            className="p-1.5 text-[#93B8D4] hover:bg-[#F0F7FF] rounded-lg transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Filters */}
      {showFilters && (
        <div className="shrink-0 px-4 py-3 border-b border-[#E8F3FD] bg-[#FAFCFF] space-y-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#93B8D4]" />
            <input
              type="text"
              placeholder="Buscar tareas..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-xs bg-white border border-[#E8F3FD] rounded-lg focus:outline-none focus:border-[#38A3F1] text-[#0D3A6E] placeholder:text-[#93B8D4]"
            />
          </div>
          <div className="flex flex-wrap gap-1.5">
            {PRIORITY_FILTERS.map((f) => (
              <button
                key={f.value}
                onClick={() => setPriorityFilter(f.value)}
                className={`text-[10px] font-medium px-2.5 py-1 rounded-full border transition-colors ${
                  priorityFilter === f.value
                    ? "bg-[#0D3A6E] border-[#0D3A6E] text-white"
                    : "bg-white border-[#E8F3FD] text-[#5B8DB8]"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* New task quick form */}
      {newTask && (
        <div className="shrink-0 px-4 py-3 border-b border-[#E8F3FD] bg-[#FFFBEB]">
          <div className="flex items-center gap-2">
            <input
              type="text"
              placeholder="Título de la nueva tarea..."
              value={newTask.title}
              onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleCreateTask();
                if (e.key === "Escape") setNewTask(null);
              }}
              autoFocus
              className="flex-1 text-xs px-3 py-1.5 bg-white border border-[#E8F3FD] rounded-lg focus:outline-none focus:border-[#38A3F1] text-[#0D3A6E] placeholder:text-[#93B8D4]"
            />
            <select
              value={newTask.assignedTo}
              onChange={(e) => setNewTask({ ...newTask, assignedTo: e.target.value })}
              className="text-xs px-2 py-1.5 bg-white border border-[#E8F3FD] rounded-lg focus:outline-none focus:border-[#38A3F1] text-[#0D3A6E]"
            >
              <option value="">Sin asignar</option>
              {participants.map((p) => (
                <option key={p.id} value={p.id}>{p.full_name}</option>
              ))}
            </select>
            <button
              onClick={handleCreateTask}
              disabled={!newTask.title.trim()}
              className="text-xs font-medium bg-[#0D3A6E] text-white px-3 py-1.5 rounded-lg hover:bg-[#0D5FA6] disabled:opacity-50 transition-colors"
            >
              Crear
            </button>
            <button
              onClick={() => setNewTask(null)}
              className="p-1.5 text-[#93B8D4] hover:bg-[#E8F3FD] rounded-lg transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Board Columns */}
      <div className="flex-1 overflow-x-auto p-4">
        <DndContext
          sensors={sensors}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <div className="flex gap-4 h-full min-w-max pb-4">
            {statuses.map((status) => (
              <TaskColumn
                key={status.id}
                status={status}
                tasks={tasksByStatus[status.id] || []}
                commentCounts={commentCounts}
                onTaskClick={setSelectedTask}
                onAddTask={(statusId) => {
                  if (role === "PYME") {
                    setNewTask({ statusId, title: "", assignedTo: "" });
                    setShowFilters(false);
                  }
                }}
                role={role}
              />
            ))}
          </div>

          <DragOverlay>
            {activeTask && (
              <div className="bg-white border border-[#38A3F1] rounded-xl p-3 shadow-xl shadow-[#38A3F1]/10 rotate-2 max-w-[260px]">
                <p className="text-[12px] font-semibold text-[#0D3A6E]">
                  {activeTask.title}
                </p>
              </div>
            )}
          </DragOverlay>
        </DndContext>
      </div>

      {/* Task Dialog Modal */}
      {selectedTask && (
        <TaskDialog
          task={selectedTask}
          statuses={statuses}
          participants={participants}
          role={role}
          onClose={() => setSelectedTask(null)}
          onUpdate={handleTaskUpdate}
          onDelete={handleTaskDelete}
        />
      )}
    </div>
  );
}
