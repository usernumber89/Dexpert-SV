// hooks/useUserRole.ts
import { useAuthContext } from "@/providers/AuthProvider";
import { useEffect, useState } from "react";

export function useUserRole() {
  const { user, isLoading: authLoading } = useAuthContext();
  const [role, setRole] = useState<"STUDENT" | "PYME" | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;

    if (!user) {
      setRole(null);
      setIsLoading(false);
      return;
    }

    // El rol viene en los metadatos del usuario (lo pusimos en el signUp)
    const userRole = user.user_metadata?.role as "STUDENT" | "PYME" | undefined;
    setRole(userRole || null);
    setIsLoading(false);
  }, [user, authLoading]);

  return { role, isLoading };
}