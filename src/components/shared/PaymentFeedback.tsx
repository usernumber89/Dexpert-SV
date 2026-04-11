"use client";

import { useEffect } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { toast } from "sonner";

export function PaymentFeedback() {
  const params = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (params.get("success") === "true") {
      const plan = params.get("plan") ?? "Basic";
      toast.success(`Payment successful! Your ${plan} plan is active.`);
      router.replace(pathname);
    }
    if (params.get("canceled") === "true") {
      toast.error("Payment canceled.");
      router.replace(pathname);
    }
  }, [params, router, pathname]);

  return null;
}