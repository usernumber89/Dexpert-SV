"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  BarChart3, Users, Eye, Clock, TrendingUp, Crown,
  Star, BookOpen, Target, Loader2, AlertCircle,
} from "lucide-react";
import { getProjectAnalytics, getPymePlan } from "@/app/actions/pyme/premium";
import { isPremiumPlan } from "@/lib/premium";
import Link from "next/link";

type AnalyticsData = {
  analytics: {
    total_views: number;
    total_applications: number;
    avg_student_score: number;
    avg_completion_time_days: number;
  } | null;
  applications: any[];
};

export function PremiumAnalytics({ projectId }: { projectId?: string }) {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [plan, setPlan] = useState<string | null>(null);

  useEffect(() => {
    getPymePlan().then(setPlan);
    if (projectId) {
      getProjectAnalytics(projectId).then((res) => {
        setData(res);
        setLoading(false);
      });
    } else {
      setLoading(false);
    }
  }, [projectId]);

  const isPremium = isPremiumPlan(plan);

  if (!isPremium) {
    return (
      <div className="bg-white rounded-2xl border border-[#E8F3FD] p-6 text-center">
        <Crown className="w-10 h-10 text-[#F59E0B] mx-auto mb-3" />
        <h3 className="text-sm font-bold text-[#0D3A6E] mb-1">Analítica Premium</h3>
        <p className="text-xs text-[#5B8DB8] mb-4">
          Obtené estadísticas detalladas de tus proyectos y postulantes
        </p>
        <Link
          href="/pyme/pricing"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-white bg-[#0D3A6E] px-4 py-2 rounded-xl hover:bg-[#0D5FA6] transition"
        >
          <Crown className="w-3.5 h-3.5" />
          Actualizar a premium
        </Link>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="w-5 h-5 animate-spin text-[#38A3F1]" />
      </div>
    );
  }

  const stats = data?.analytics;
  const applications = data?.applications || [];

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Postulaciones", value: stats?.total_applications || 0, icon: Users, color: "#38A3F1" },
          { label: "Puntaje promedio", value: stats?.avg_student_score ? `${stats.avg_student_score}%` : "—", icon: Star, color: "#F59E0B" },
          { label: "Tiempo promedio", value: stats?.avg_completion_time_days ? `${stats.avg_completion_time_days}d` : "—", icon: Clock, color: "#1D9E75" },
          { label: "Vistas", value: stats?.total_views || 0, icon: Eye, color: "#8B5CF6" },
        ].map((stat) => (
          <div key={stat.label} className="bg-white rounded-xl border border-[#E8F3FD] p-3">
            <div className="flex items-center gap-2 mb-1">
              <stat.icon className="w-3.5 h-3.5" style={{ color: stat.color }} />
            </div>
            <p className="text-lg font-bold text-[#0D3A6E]">{stat.value}</p>
            <p className="text-[10px] text-[#93B8D4]">{stat.label}</p>
          </div>
        ))}
      </div>

      {applications.length > 0 && (
        <div className="bg-white rounded-xl border border-[#E8F3FD] overflow-hidden">
          <div className="px-4 py-3 border-b border-[#E8F3FD] flex items-center gap-2">
            <Users className="w-4 h-4 text-[#38A3F1]" />
            <span className="text-xs font-semibold text-[#0D3A6E]">Postulantes</span>
          </div>
          <div className="divide-y divide-[#E8F3FD]">
            {applications.slice(0, 10).map((app) => (
              <div key={app.id} className="flex items-center gap-3 px-4 py-3">
                <div className="w-8 h-8 rounded-full bg-[#F0F7FF] border border-[#E8F3FD] flex items-center justify-center text-xs font-semibold text-[#0D5FA6]">
                  {app.student?.full_name?.[0] || "?"}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-[#0D3A6E] truncate">{app.student?.full_name || "Anónimo"}</p>
                  <p className="text-[10px] text-[#93B8D4]">
                    {app.status} · {new Date(app.created_at).toLocaleDateString("es-SV")}
                  </p>
                </div>
                <span
                  className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
                  style={{
                    background: app.status === "ACCEPTED" ? "#E1F5EE" : app.status === "REJECTED" ? "#FEF2F2" : "#FFFBEB",
                    color: app.status === "ACCEPTED" ? "#1D9E75" : app.status === "REJECTED" ? "#EF4444" : "#D97706",
                  }}
                >
                  {app.status === "ACCEPTED" ? "Aceptado" : app.status === "REJECTED" ? "Rechazado" : "Pendiente"}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
