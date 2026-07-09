"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Send, Trash2, User } from "lucide-react";
import { getTaskComments, addComment, deleteComment } from "@/app/actions/tasks";
import type { TaskComment } from "@/app/actions/tasks";
import { createClient } from "@/lib/supabase/client";
import type { RealtimePostgresChangesPayload } from "@supabase/supabase-js";

interface CommentSectionProps {
  taskId: string;
}

export default function CommentSection({ taskId }: CommentSectionProps) {
  const [comments, setComments] = useState<TaskComment[]>([]);
  const [newContent, setNewContent] = useState("");
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const bottomRef = useRef<HTMLDivElement>(null);

  const loadComments = useCallback(async () => {
    const res = await getTaskComments(taskId);
    if (res.success && res.data) {
      setComments(res.data);
    }
    setLoading(false);
  }, [taskId]);

  useEffect(() => {
    loadComments();
  }, [loadComments]);

  useEffect(() => {
    const supabase = createClient();
    const channel = supabase
      .channel(`task-comments-${taskId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "task_comments",
          filter: `task_id=eq.${taskId}`,
        },
        (payload: RealtimePostgresChangesPayload<{ [key: string]: unknown }>) => {
          const newComment = payload.new as unknown as TaskComment;
          setComments((prev) => {
            if (prev.some((c) => c.id === newComment.id)) return prev;
            return [...prev, newComment];
          });
        }
      )
      .on(
        "postgres_changes",
        {
          event: "DELETE",
          schema: "public",
          table: "task_comments",
          filter: `task_id=eq.${taskId}`,
        },
        (payload: RealtimePostgresChangesPayload<{ [key: string]: unknown }>) => {
          const deletedId = (payload.old as Record<string, unknown>).id as string;
          setComments((prev) => prev.filter((c) => c.id !== deletedId));
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [taskId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [comments]);

  const handleSend = async () => {
    if (!newContent.trim() || sending) return;
    setSending(true);
    const res = await addComment(taskId, newContent);
    if (res.success) {
      setNewContent("");
    }
    setSending(false);
  };

  const handleDelete = async (commentId: string) => {
    await deleteComment(commentId);
  };

  const formatTime = (dateString: string) => {
    const d = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 1) return "Ahora";
    if (diffMins < 60) return `hace ${diffMins} min`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `hace ${diffHours}h`;
    return d.toLocaleDateString("es-SV", { day: "numeric", month: "short" });
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto space-y-2 min-h-0 pr-1">
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="w-5 h-5 border-2 border-[#BAD8F7] border-t-[#38A3F1] rounded-full animate-spin" />
          </div>
        ) : comments.length === 0 ? (
          <p className="text-xs text-[#93B8D4] text-center py-8">
            Sin comentarios aún. Escribe el primero.
          </p>
        ) : (
          comments.map((comment) => (
            <div key={comment.id} className="group flex gap-2.5">
              <div className="w-7 h-7 rounded-full bg-[#F0F7FF] flex items-center justify-center shrink-0 mt-0.5">
                <User className="w-3.5 h-3.5 text-[#5B8DB8]" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-semibold text-[#0D3A6E]">
                    {comment.user?.full_name || "Usuario"}
                  </span>
                  <span className="text-[10px] text-[#93B8D4]">
                    {formatTime(comment.created_at)}
                  </span>
                  <button
                    onClick={() => handleDelete(comment.id)}
                    className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Trash2 className="w-3 h-3 text-[#93B8D4] hover:text-[#E24B4A]" />
                  </button>
                </div>
                <p className="text-xs text-[#5B8DB8] mt-0.5 leading-relaxed break-words">
                  {comment.content}
                </p>
              </div>
            </div>
          ))
        )}
        <div ref={bottomRef} />
      </div>

      <div className="flex gap-2 pt-3 border-t border-[#E8F3FD] mt-3">
        <input
          type="text"
          placeholder="Escribe un comentario..."
          value={newContent}
          onChange={(e) => setNewContent(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleSend();
            }
          }}
          className="flex-1 text-xs px-3 py-2 bg-[#F0F7FF] border border-[#E8F3FD] rounded-lg focus:outline-none focus:border-[#38A3F1] text-[#0D3A6E] placeholder:text-[#93B8D4]"
        />
        <button
          onClick={handleSend}
          disabled={!newContent.trim() || sending}
          className="px-3 py-2 bg-[#0D3A6E] text-white rounded-lg hover:bg-[#0D5FA6] disabled:opacity-50 transition-colors shrink-0"
        >
          <Send className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
