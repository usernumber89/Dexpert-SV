"use client";

import { useState } from "react";
import { Star, Loader2, Crown } from "lucide-react";
import { toggleFeaturedProject } from "@/app/actions/pyme/premium";
import { toast } from "sonner";

export function FeaturedToggle({ projectId, isFeatured, isPremium, onToggle }: {
  projectId: string;
  isFeatured: boolean;
  isPremium: boolean;
  onToggle?: (projectId: string, newFeatured: boolean) => void;
}) {
  const [loading, setLoading] = useState(false);
  const [featured, setFeatured] = useState(isFeatured);

  const handleToggle = async () => {
    if (!isPremium) {
      toast.error("Disponible en planes GROWTH y PRO");
      return;
    }

    setLoading(true);
    const newFeatured = !featured;
    const res = await toggleFeaturedProject(projectId, newFeatured);
    if (res.success) {
      setFeatured(newFeatured);
      onToggle?.(projectId, newFeatured);
      toast.success(newFeatured ? "¡Proyecto destacado!" : "Proyecto ya no está destacado");
    } else {
      toast.error(res.error || "Error al actualizar");
    }
    setLoading(false);
  };

  return (
    <button
      onClick={handleToggle}
      disabled={loading}
      className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg border transition-all"
      style={{
        background: featured ? "#FFFBEB" : isPremium ? "white" : "#F9FAFB",
        color: featured ? "#D97706" : isPremium ? "#5B8DB8" : "#D1D5DB",
        borderColor: featured ? "#FDE9C0" : "#E8F3FD",
        cursor: isPremium ? "pointer" : "not-allowed",
      }}
      title={isPremium ? "Destacar proyecto" : "Disponible en planes premium"}
    >
      {loading ? (
        <Loader2 className="w-3.5 h-3.5 animate-spin" />
      ) : featured ? (
        <Star className="w-3.5 h-3.5 fill-[#D97706]" />
      ) : isPremium ? (
        <Star className="w-3.5 h-3.5" />
      ) : (
        <Crown className="w-3.5 h-3.5" />
      )}
      {featured ? "Destacado" : isPremium ? "Destacar" : "Premium"}
    </button>
  );
}
