import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { User } from "@supabase/supabase-js";

export function useSupabaseAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<{ full_name?: string; avatar_url?: string } | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();

    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);

      if (user) {
        const { data: student } = await supabase
          .from("students")
          .select("full_name, avatar_url")
          .eq("user_id", user.id)
          .single();

        if (student) {
          setProfile(student);
        }
      }
      setIsLoading(false);
    };

    getUser();
  }, []);

  return { user, profile, isLoading };
}