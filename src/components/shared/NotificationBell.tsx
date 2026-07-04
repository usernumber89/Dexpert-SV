"use client";

import { useState, useEffect, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import { motion, AnimatePresence } from "framer-motion";
import { Bell, CheckCheck, Loader2, X, ExternalLink } from "lucide-react";
import Link from "next/link";
import { getNotifications, getUnreadCount, markAsRead, markAllAsRead } from "@/app/actions/notifications";

type Notification = {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: string;
  link: string | null;
  read: boolean;
  created_at: string;
};

export function NotificationBell({ userId }: { userId: string }) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const supabase = createClient();

  useEffect(() => {
    loadNotifications();

    const channel = supabase
      .channel(`notifications-${userId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "notifications",
          filter: `user_id=eq.${userId}`,
        },
        () => {
          loadNotifications();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const loadNotifications = async () => {
    const [notifs, count] = await Promise.all([
      getNotifications(10),
      getUnreadCount(),
    ]);
    setNotifications(notifs);
    setUnreadCount(count);
    setLoading(false);
  };

  const handleMarkRead = async (id: string) => {
    await markAsRead(id);
    setNotifications(prev =>
      prev.map(n => (n.id === id ? { ...n, read: true } : n))
    );
    setUnreadCount(prev => Math.max(0, prev - 1));
  };

  const handleMarkAllRead = async () => {
    await markAllAsRead();
    setNotifications(prev =>
      prev.map(n => ({ ...n, read: true }))
    );
    setUnreadCount(0);
  };

  const formatTime = (dateStr: string) => {
    const now = new Date();
    const date = new Date(dateStr);
    const diff = now.getTime() - date.getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "Ahora";
    if (mins < 60) return `hace ${mins} min`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `hace ${hours}h`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `hace ${days}d`;
    return date.toLocaleDateString("es-SV", { day: "2-digit", month: "short" });
  };

  return (
    <div ref={dropdownRef} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="relative p-2 rounded-lg hover:bg-[#F0F7FF] transition-colors text-[#93B8D4] hover:text-[#0D3A6E]"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 w-4.5 h-4.5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.96 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl border border-[#E8F3FD] shadow-2xl overflow-hidden z-50"
          >
            <div className="flex items-center justify-between px-4 py-3 border-b border-[#E8F3FD]">
              <h3 className="text-sm font-semibold text-[#0D3A6E]">Notificaciones</h3>
              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllRead}
                  className="flex items-center gap-1 text-[11px] font-medium text-[#38A3F1] hover:text-[#0D5FA6] transition"
                >
                  <CheckCheck className="w-3.5 h-3.5" />
                  Marcar todas leídas
                </button>
              )}
            </div>

            <div className="max-h-96 overflow-y-auto">
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-5 h-5 text-[#38A3F1] animate-spin" />
                </div>
              ) : notifications.length === 0 ? (
                <div className="text-center py-8">
                  <Bell className="w-8 h-8 text-[#BAD8F7] mx-auto mb-2" />
                  <p className="text-sm text-[#5B8DB8]">Sin notificaciones</p>
                  <p className="text-xs text-[#93B8D4] mt-1">No tienes notificaciones nuevas</p>
                </div>
              ) : (
                <div className="divide-y divide-[#E8F3FD]">
                  {notifications.map((notif) => {
                    const content = (
                      <div
                        className={`flex items-start gap-3 p-4 transition-colors cursor-pointer ${
                          notif.read ? "bg-white" : "bg-[#F4F9FF]"
                        } hover:bg-[#F0F7FF]`}
                        onClick={() => {
                          if (!notif.read) handleMarkRead(notif.id);
                          if (notif.link) setOpen(false);
                        }}
                      >
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                          notif.type === "success" ? "bg-green-50" :
                          notif.type === "error" ? "bg-red-50" :
                          "bg-[#F0F7FF]"
                        }`}>
                          <Bell className={`w-4 h-4 ${
                            notif.type === "success" ? "text-green-500" :
                            notif.type === "error" ? "text-red-400" :
                            "text-[#38A3F1]"
                          }`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <p className="text-sm font-semibold text-[#0D3A6E]">{notif.title}</p>
                            <span className="text-[10px] text-[#93B8D4] whitespace-nowrap">
                              {formatTime(notif.created_at)}
                            </span>
                          </div>
                          <p className="text-xs text-[#5B8DB8] mt-0.5 line-clamp-2">{notif.message}</p>
                        </div>
                      </div>
                    );

                    if (notif.link) {
                      return (
                        <Link key={notif.id} href={notif.link}>
                          {content}
                        </Link>
                      );
                    }
                    return <div key={notif.id}>{content}</div>;
                  })}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
