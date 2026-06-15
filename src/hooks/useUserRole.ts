// hooks/useUserRole.ts
import { useSupabaseAuth } from "@/hooks/useSupabaseAuth";
import { useEffect, useState } from "react";

// 1. Creamos una interfaz extendida local para este hook
interface ProfileWithRole {
  role?: "STUDENT" | "PYME" | null;
  [key: string]: any; // Permite cualquier otra propiedad que ya tenga Profile
}

export function useUserRole() {
  const { user, profile, isLoading: authLoading } = useSupabaseAuth();
  const [role, setRole] = useState<"STUDENT" | "PYME" | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;

    if (!user) {
      setRole(null);
      setIsLoading(false);
      return;
    }

    // 1. Intentar leer de los metadatos de autenticación
    let userRole = user.user_metadata?.role as "STUDENT" | "PYME" | undefined;

    // 2. Si no existe en el auth, casteamos temporalmente el perfil para leer 'role'
    const customProfile = profile as ProfileWithRole | null;
    
    if (!userRole && customProfile?.role) {
      userRole = customProfile.role as "STUDENT" | "PYME";
    }

    setRole(userRole || null);
    setIsLoading(false);
  }, [user, profile, authLoading]);

  return { role, isLoading };
}