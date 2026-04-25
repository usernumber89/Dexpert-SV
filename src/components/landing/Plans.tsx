"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { motion } from "framer-motion";
import {
  Check, Sparkles, Zap, Crown, ArrowRight, Shield, Star
} from "lucide-react";
import { useSupabaseAuth } from "@/hooks/useSupabaseAuth";

type PlanKey = "STARTER" | "GROWTH" | "PRO";

const plans = [
  {
    key: "STARTER" as PlanKey,
    name: "Starter",
    price: "$9.99",
    credits: 3,
    description: "Perfect to try Dexpert with your first real projects.",
    color: "#38A3F1",
    features: [
      { text: "3 project credits", highlight: true },
      { text: "Student applications", highlight: false },
      { text: "Standard visibility", highlight: false },
      { text: "Basic AI brief writer", highlight: false },
      { text: "Email support", highlight: false },
    ],
    badge: null,
    cta: "Get started",
  },
  {
    key: "GROWTH" as PlanKey,
    name: "Growth",
    price: "$24.99",
    credits: 10,
    description: "For businesses that need consistent talent across multiple projects.",
    color: "#1D9E75",
    features: [
      { text: "10 project credits", highlight: true },
      { text: "Everything in Starter", highlight: false },
      { text: "AI brief writer (full)", highlight: true },
      { text: "Recommended candidates", highlight: true },
      { text: "Priority support", highlight: false },
    ],
    badge: "Most popular",
    cta: "Get Growth",
  },
  {
    key: "PRO" as PlanKey,
    name: "Pro",
    price: "$49.99",
    credits: 25,
    description: "Maximum reach for growing businesses with constant hiring needs.",
    color: "#F59E0B",
    features: [
      { text: "25 project credits", highlight: true },
      { text: "Everything in Growth", highlight: false },
      { text: "Featured listings", highlight: true },
      { text: "Top candidates only", highlight: true },
      { text: "Dedicated account manager", highlight: true },
    ],
    badge: "Best value",
    cta: "Go Pro",
  },
];

export default function Plans() {
  const { user } = useSupabaseAuth();
  const router = useRouter();
  const [loading, setLoading] = useState<PlanKey | null>(null);

  const handleCheckout = async (plan: PlanKey) => {
    if (!user) { router.push("/sign-up"); return; }
    setLoading(plan);
    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan }),
      });
      const data = await res.json();
      if (data.url) window.location.href = data.url;
    } catch {
      console.error("Checkout error");
    } finally {
      setLoading(null);
    }
  };

  return (
    <section id="plans" className="py-24 px-6 bg-gradient-to-b from-white to-[#F0F7FF]">
      <div className="max-w-5xl mx-auto">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-white rounded-full shadow-sm border border-[#BAD8F7] mb-5">
            <Zap className="w-4 h-4 text-[#F59E0B] fill-[#F59E0B]" />
            <span className="text-xs font-semibold uppercase tracking-wider text-[#0D5FA6]">
              For businesses
            </span>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-[#0D3A6E] mb-3">
            Buy credits, publish projects
          </h2>
          <p className="text-[#5B8DB8] max-w-xl mx-auto">
            No subscriptions. Buy a credit pack and use them whenever you need.
            Credits never expire.
          </p>
        </motion.div>

        {/* Cards */}
        <div className="grid md:grid-cols-3 gap-6">
          {plans.map((plan, index) => (
            <motion.div
              key={plan.key}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className={`relative bg-white rounded-2xl p-7 flex flex-col transition-all duration-300 hover:shadow-xl ${
                plan.key === "GROWTH"
                  ? "border-2 border-[#1D9E75] shadow-lg shadow-[#1D9E75]/10 md:scale-105 z-10"
                  : "border border-[#E8F3FD] shadow-sm"
              }`}
            >
              {/* Badge */}
              {plan.badge && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <div className="flex items-center gap-1 px-3 py-1 rounded-full text-white text-xs font-bold"
                    style={{ background: plan.color }}>
                    <Star className="w-3 h-3 fill-white" />
                    {plan.badge}
                  </div>
                </div>
              )}

              {/* Name */}
              <div className="mb-4">
                <h3 className="text-lg font-bold text-[#0D3A6E]">{plan.name}</h3>
                <p className="text-xs text-[#5B8DB8] mt-1 leading-relaxed">{plan.description}</p>
              </div>

              {/* Price + credits */}
              <div className="mb-6">
                <div className="flex items-end gap-1 mb-1">
                  <span className="text-3xl font-bold text-[#0D3A6E]">{plan.price}</span>
                </div>
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg w-fit"
                  style={{ background: `${plan.color}15` }}>
                  <Sparkles className="w-3.5 h-3.5" style={{ color: plan.color }} />
                  <span className="text-sm font-semibold" style={{ color: plan.color }}>
                    {plan.credits} project credits
                  </span>
                </div>
                <p className="text-[10px] text-[#93B8D4] mt-1.5">
                  ${(parseFloat(plan.price.replace("$", "")) / plan.credits).toFixed(2)} per project • Credits never expire
                </p>
              </div>

              <hr className="border-[#E8F3FD] mb-5" />

              {/* Features */}
              <ul className="flex flex-col gap-2.5 flex-1 mb-6">
                {plan.features.map((f, i) => (
                  <li key={i} className="flex items-center gap-2.5">
                    <div className={`w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 ${
                      f.highlight ? "bg-[#1D9E75]" : "bg-[#E8F3FD]"
                    }`}>
                      <Check className={`w-2.5 h-2.5 ${f.highlight ? "text-white" : "text-[#1D9E75]"}`} />
                    </div>
                    <span className={`text-sm ${f.highlight ? "text-[#0D3A6E] font-medium" : "text-[#5B8DB8]"}`}>
                      {f.text}
                    </span>
                  </li>
                ))}
              </ul>

              {/* CTA */}
              <motion.button
                onClick={() => handleCheckout(plan.key)}
                disabled={loading === plan.key}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`w-full py-3 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-all disabled:opacity-50 group ${
                  plan.key === "GROWTH"
                    ? "bg-[#1D9E75] text-white hover:bg-[#158A5F] shadow-lg shadow-[#1D9E75]/20"
                    : plan.key === "PRO"
                    ? "bg-[#F59E0B] text-white hover:bg-[#D97706]"
                    : "border-2 border-[#38A3F1] text-[#38A3F1] hover:bg-[#38A3F1] hover:text-white"
                }`}
              >
                {loading === plan.key ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    {plan.cta}
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </motion.button>

              <div className="flex items-center justify-center gap-1.5 mt-4">
                <Shield className="w-3 h-3 text-[#1D9E75]" />
                <span className="text-[10px] text-[#93B8D4]">Secure checkout • SSL encrypted</span>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Bottom */}
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center text-xs text-[#93B8D4] mt-10"
        >
          All plans include AI-powered matching and student access. Credits never expire.
          <br />
          <span className="text-[#38A3F1]">Questions? Contact us at dexpertwork@gmail.com</span>
        </motion.p>
      </div>
    </section>
  );
}