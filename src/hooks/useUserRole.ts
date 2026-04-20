import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

export function useUserRole() {
  const [role, setRole] = useState<"STUDENT" | "PYME" | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();

    const getRole = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setIsLoading(false); return; }

      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

      setRole(profile?.role ?? null);
      setIsLoading(false);
    };

    getRole();
  }, []);

  return { role, isLoading };
}