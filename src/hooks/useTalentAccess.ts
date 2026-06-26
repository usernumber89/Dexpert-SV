"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { hasTalentAccess } from "@/app/actions/pyme/premium";

export function useTalentAccess() {
  const [hasAccess, setHasAccess] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);

  const check = useCallback(async () => {
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
  }, []);

  useEffect(() => {
    let cancelled = false;
    let channelRef: ReturnType<ReturnType<typeof createClient>["channel"]> | null = null;
    const supabase = createClient();

    const init = async () => {
      await check();
      if (cancelled) return;

      const { data: { user } } = await supabase.auth.getUser();
      if (!user || cancelled) return;

      const channel = supabase
        .channel(`talent-access-${Date.now()}`)
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
            if (access && channelRef) {
              supabase.removeChannel(channelRef);
              channelRef = null;
            }
          }
        )
        .subscribe();

      if (!cancelled) {
        channelRef = channel;
      }
    };

    init();

    return () => {
      cancelled = true;
      if (channelRef) {
        supabase.removeChannel(channelRef);
        channelRef = null;
      }
    };
  }, [check]);

  return { hasAccess, loading, refetch: check };
}
