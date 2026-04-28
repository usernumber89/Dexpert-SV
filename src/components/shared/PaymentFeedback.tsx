"use client";

import { useEffect } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { toast } from "sonner";
import { Sparkles } from "lucide-react";

export function PaymentFeedback() {
  const params = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
  if (params.get("success") === "true") {
    const credits = params.get("credits") ?? "3";
    toast.success(`Payment successful! ${credits} credits added to your account.`, {
      icon: <Sparkles className="w-4 h-4 text-[#F59E0B]" />,
      duration: 5000,
    });
    router.replace(pathname);
    router.refresh(); // ← agrega esto
  }
  if (params.get("canceled") === "true") {
    toast.error("Payment canceled.");
    router.replace(pathname);
  }
}, [params, router, pathname]);

  return null;
}