import { useAuthContext } from "@/providers/AuthProvider";
import { useEffect, useState, useRef } from "react";

type Profile = {
  full_name?: string | null;
  avatar_url?: string | null;
};

export function useSupabaseAuth() {
  const { supabase, user, isLoading: authLoading } = useAuthContext();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const fetchingRef = useRef(false);

  useEffect(() => {
    // Si auth aún carga, esperar
    if (authLoading) return;

    // Sin usuario, limpiar y salir
    if (!user) {
      setProfile(null);
      setIsLoading(false);
      return;
    }

    // Evitar fetch duplicado
    if (fetchingRef.current) return;
    fetchingRef.current = true;

    let mounted = true;

    const loadProfile = async () => {
      try {
        const { data: profileRole } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", user.id)
          .single();

        if (!mounted) return;

        if (profileRole?.role === "STUDENT") {
          const { data: student } = await supabase
            .from("students")
            .select("full_name, avatar_url")
            .eq("user_id", user.id)
            .single();
          if (mounted) setProfile({ full_name: student?.full_name, avatar_url: student?.avatar_url });
        } else if (profileRole?.role === "PYME") {
          const { data: pyme } = await supabase
            .from("pymes")
            .select("company_name, logo_url")
            .eq("user_id", user.id)
            .single();
          if (mounted) setProfile({ full_name: pyme?.company_name, avatar_url: pyme?.logo_url });
        } else {
          if (mounted) setProfile({ full_name: user.user_metadata?.full_name ?? user.email, avatar_url: null });
        }
      } catch (error) {
        console.error("Error loading profile:", error);
      } finally {
        if (mounted) setIsLoading(false);
        fetchingRef.current = false; // ← siempre resetear
      }
    };

    loadProfile();

    return () => {
      mounted = false;
      fetchingRef.current = false; // ← resetear en cleanup también
    };
  }, [user?.id, authLoading]); // ← solo user.id, no el objeto completo

  return { user, profile, isLoading: authLoading || isLoading };
}