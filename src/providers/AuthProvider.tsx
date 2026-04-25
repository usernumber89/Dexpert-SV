"use client";

import { createContext, useContext, useEffect, useState, useMemo } from "react";
import { createClient } from "@/lib/supabase/client";
import type { SupabaseClient, User, Session, AuthChangeEvent } from "@supabase/supabase-js";

type AuthContextType = {
  supabase: SupabaseClient;
  user: User | null;
  isLoading: boolean;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  // Verificar que las variables de entorno existan
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    // Error temprano: no hay configuración, pero igual renderizamos hijos sin auth
    return (
      <AuthContext.Provider
        value={{ supabase: null as any, user: null, isLoading: false }}
      >
        {children}
      </AuthContext.Provider>
    );
  }

  const supabase = useMemo(() => createClient(), []);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    let timeoutId: NodeJS.Timeout;

    // Timeout de seguridad (2 segundos es suficiente para conexión normal)
    timeoutId = setTimeout(() => {
      if (mounted) {
        console.warn("AuthProvider: timeout, forcing isLoading false");
        setIsLoading(false);
      }
    }, 2000);

    const initSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (mounted) {
          setUser(session?.user ?? null);
        }
      } catch (err) {
        console.error("Error getting session:", err);
        if (mounted) setUser(null);
      } finally {
        if (mounted) setIsLoading(false);
        clearTimeout(timeoutId);
      }
    };

    initSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event: AuthChangeEvent, session: Session | null) => {
        if (mounted) {
          setUser(session?.user ?? null);
          setIsLoading(false);
        }
      }
    );

    return () => {
      mounted = false;
      clearTimeout(timeoutId);
      subscription.unsubscribe();
    };
  }, [supabase]);

  return (
    <AuthContext.Provider value={{ supabase, user, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuthContext() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuthContext must be used within AuthProvider");
  return context;
}