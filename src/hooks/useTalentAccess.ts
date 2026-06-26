"use client";

import { useState, useEffect, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import { hasTalentAccess } from "@/app/actions/pyme/premium";

export function useTalentAccess() {
  const [hasAccess, setHasAccess] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);

  const check = async () => {
    const cached = sessionStorage.getItem("talent_unlocked");
    if (cached === "true") {
      setHasAccess(true);
      setLoading(false);
      return true;
    }

    const access = await hasTalentAccess();
    setHasAccess(access);
    setLoading(false);
    if (access) sessionStorage.setItem("talent_unlocked", "true");
    return access;
  };

  useEffect(() => {
    const init = async () => {
      await check();

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const channel = supabase
        .channel("talent-access-realtime")
        .on(
          "postgres_changes",
          {
            event: "INSERT",
            schema: "public",
            table: "purchases",
            filter: `user_id=eq.${user.id}`,
          },
          async () => {
            const access = await check();
            if (access && channelRef.current) {
              supabase.removeChannel(channelRef.current);
              channelRef.current = null;
            }
          }
        )
        .subscribe();

      channelRef.current = channel;
    };

    init();

    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
    };
  }, []);

  return { hasAccess, loading, refetch: check };
}
