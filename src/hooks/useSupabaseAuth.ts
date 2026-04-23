// hooks/useSupabaseAuth.ts
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
    let mounted = true;

    const loadProfile = async () => {
      if (!user) {
        setProfile(null);
        setIsLoading(false);
        return;
      }

      // Evitar consultas duplicadas
      if (fetchingRef.current) return;
      fetchingRef.current = true;

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
          setProfile({
            full_name: student?.full_name,
            avatar_url: student?.avatar_url,
          });
        } else if (profileRole?.role === "PYME") {
          const { data: pyme } = await supabase
            .from("pymes")
            .select("company_name, logo_url")
            .eq("user_id", user.id)
            .single();
          setProfile({
            full_name: pyme?.company_name,
            avatar_url: pyme?.logo_url,
          });
        } else {
          setProfile({
            full_name: user.user_metadata?.full_name ?? user.email,
            avatar_url: null,
          });
        }
      } catch (error) {
        console.error("Error loading profile:", error);
      } finally {
        if (mounted) {
          setIsLoading(false);
          fetchingRef.current = false;
        }
      }
    };

    if (!authLoading) {
      loadProfile();
    }

    return () => {
      mounted = false;
    };
  }, [user, supabase, authLoading]);

  return { user, profile, isLoading: authLoading || isLoading };
}