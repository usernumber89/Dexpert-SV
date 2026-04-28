"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { Check, Zap, Star, Trophy, ArrowLeft, ShieldCheck, Infinity } from "lucide-react";
import Link from "next/link";

type Props = {
  creditsAvailable: number;
  creditsUsed: number;
};

const PLANS = [
  {
    id: "STARTER",
    name: "Starter",
    tagline: "Perfect to try Dexpert with your first real projects.",
    price: 9.99,
    credits: 3,
    perCredit: "3.33",
    icon: Zap,
    iconBg: "bg-[#F0F7FF]",
    iconColor: "text-[#38A3F1]",
    badge: null,
    cta: "Get started",
    features: [
      "3 project credits",
      "Student applications",
      "Standard visibility",
      "Basic AI brief writer",
      "Email support",
    ],
    highlighted: false,
  },
  {
    id: "GROWTH",
    name: "Growth",
    tagline: "For businesses that need consistent talent across multiple projects.",
    price: 24.99,
    credits: 10,
    perCredit: "2.50",
    icon: Star,
    iconBg: "bg-[#0D3A6E]",
    iconColor: "text-white",
    badge: "Most popular",
    cta: "Get Growth",
    features: [
      "10 project credits",
      "Everything in Starter",
      "AI brief writer (full)",
      "Recommended candidates",
      "Priority support",
    ],
    highlighted: true,
  },
  {
    id: "PRO",
    name: "Pro",
    tagline: "Maximum reach for growing businesses with constant hiring needs.",
    price: 49.99,
    credits: 25,
    perCredit: "2.00",
    icon: Trophy,
    iconBg: "bg-amber-50",
    iconColor: "text-amber-500",
    badge: "Best value",
    cta: "Go Pro",
    features: [
      "25 project credits",
      "Everything in Growth",
      "Featured listings",
      "Top candidates only",
      "Dedicated account manager",
    ],
    highlighted: false,
  },
];

export function PymePricing({ creditsAvailable, creditsUsed }: Props) {
  const [loading, setLoading] = useState<string | null>(null);

  const handleCheckout = async (planId: string) => {
    setLoading(planId);
    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan: planId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      window.location.href = data.url;
    } catch {
      toast.error("Error starting checkout. Try again.");
      setLoading(null);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F0F7FF] via-white to-[#E8F3FD] px-6 py-10">
      <div className="max-w-5xl mx-auto space-y-10">

        {/* Back */}
        <Link
          href="/pyme/dashboard"
          className="inline-flex items-center gap-2 text-sm text-[#5B8DB8] hover:text-[#0D3A6E] transition"
        >
          <ArrowLeft className="w-4 h-4" /> Back to dashboard
        </Link>

        {/* Header */}
        <div className="text-center space-y-3">
          <p className="text-xs font-semibold uppercase tracking-widest text-[#38A3F1]">Credits</p>
          <h1 className="text-3xl font-bold text-[#0D3A6E]">Buy credits, publish projects</h1>
          <p className="text-sm text-[#5B8DB8] max-w-md mx-auto leading-relaxed">
            No subscriptions. Buy a credit pack and use them whenever you need.
            Credits never expire.
          </p>

          {/* Current balance */}
          {(creditsAvailable > 0 || creditsUsed > 0) && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-3 bg-white border border-[#BAD8F7] rounded-2xl px-5 py-3 mt-2 shadow-sm"
            >
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-green-400" />
                <span className="text-sm font-bold text-[#0D3A6E]">{creditsAvailable}</span>
                <span className="text-xs text-[#93B8D4]">credits available</span>
              </div>
              <div className="w-px h-4 bg-[#E8F3FD]" />
              <div className="flex items-center gap-1.5">
                <Infinity className="w-3.5 h-3.5 text-[#93B8D4]" />
                <span className="text-xs text-[#93B8D4]">never expire</span>
              </div>
              {creditsUsed > 0 && (
                <>
                  <div className="w-px h-4 bg-[#E8F3FD]" />
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs text-[#93B8D4]">{creditsUsed} used</span>
                  </div>
                </>
              )}
            </motion.div>
          )}
        </div>

        {/* Plans */}
        <div className="grid md:grid-cols-3 gap-6 items-start">
          {PLANS.map((plan, i) => {
            const Icon = plan.icon;
            const isLoadingThis = loading === plan.id;

            return (
              <motion.div
                key={plan.id}
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className={`relative bg-white rounded-3xl border overflow-hidden transition-all duration-300 ${
                  plan.highlighted
                    ? "border-[#0D3A6E] shadow-2xl shadow-[#0D3A6E]/10 md:scale-[1.03]"
                    : "border-[#E8F3FD] hover:border-[#BAD8F7] hover:shadow-xl"
                }`}
              >
                {/* Badge */}
                {plan.badge && (
                  <div className={`py-1.5 text-center text-[11px] font-bold uppercase tracking-widest ${
                    plan.highlighted
                      ? "bg-[#0D3A6E] text-white"
                      : "bg-amber-400 text-white"
                  }`}>
                    {plan.badge}
                  </div>
                )}

                <div className="p-7 space-y-6">
                  {/* Icon + name */}
                  <div className="flex items-start gap-3">
                    <div className={`w-11 h-11 rounded-2xl ${plan.iconBg} flex items-center justify-center flex-shrink-0`}>
                      <Icon className={`w-5 h-5 ${plan.iconColor}`} />
                    </div>
                    <div>
                      <p className="text-base font-bold text-[#0D3A6E]">{plan.name}</p>
                      <p className="text-[11px] text-[#93B8D4] leading-snug mt-0.5">{plan.tagline}</p>
                    </div>
                  </div>

                  {/* Price */}
                  <div>
                    <div className="flex items-end gap-1">
                      <span className="text-4xl font-extrabold text-[#0D3A6E]">${plan.price}</span>
                    </div>
                    <p className="text-sm font-semibold text-[#38A3F1] mt-1">{plan.credits} project credits</p>
                    <p className="text-xs text-[#93B8D4]">${plan.perCredit} per project • Credits never expire</p>
                  </div>

                  {/* CTA */}
                  <button
                    onClick={() => handleCheckout(plan.id)}
                    disabled={!!loading}
                    className={`w-full py-3.5 rounded-2xl text-sm font-bold transition-all flex items-center justify-center gap-2 disabled:opacity-60 ${
                      plan.highlighted
                        ? "bg-gradient-to-r from-[#0D3A6E] to-[#1D5A9E] text-white hover:shadow-lg hover:shadow-[#0D3A6E]/25"
                        : "bg-[#F0F7FF] text-[#0D3A6E] hover:bg-[#E8F3FD] border border-[#BAD8F7]"
                    }`}
                  >
                    {isLoadingThis ? (
                      <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                    ) : plan.cta}
                  </button>

                  {/* Security */}
                  <div className="flex items-center justify-center gap-1.5 text-[10px] text-[#93B8D4]">
                    <ShieldCheck className="w-3 h-3" />
                    Secure checkout • SSL encrypted
                  </div>

                  {/* Features */}
                  <ul className="space-y-2.5 pt-2 border-t border-[#F0F7FF]">
                    {plan.features.map((f, fi) => (
                      <li key={fi} className="flex items-start gap-2.5">
                        <div className={`w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${
                          plan.highlighted ? "bg-[#0D3A6E]" : "bg-[#F0F7FF]"
                        }`}>
                          <Check className={`w-2.5 h-2.5 ${plan.highlighted ? "text-white" : "text-[#38A3F1]"}`} />
                        </div>
                        <span className="text-xs text-[#5B8DB8]">{f}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Trust row */}
        <div className="flex flex-wrap justify-center gap-6 text-xs text-[#93B8D4] pb-4">
          {[
            "One-time payment, no subscriptions",
            "Credits never expire",
            "SSL encrypted checkout",
            "Instant access after payment",
          ].map(t => (
            <div key={t} className="flex items-center gap-1.5">
              <Check className="w-3.5 h-3.5 text-green-400" />
              {t}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}