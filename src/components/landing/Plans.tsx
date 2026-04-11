"use client";

import { useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { motion } from "framer-motion";
import { 
  Package, 
  Briefcase, 
  Star, 
  Check, 
  Sparkles, 
  Zap, 
  Crown,
  ArrowRight,
  Shield,
  TrendingUp
} from "lucide-react";

type PlanKey = "BASIC" | "ASSISTED" | "PREMIUM";

// ✅ Interfaz para las características (solución del error)
interface PlanFeature {
  text: string;
  included: boolean;
  highlight?: boolean;
}

// ✅ Interfaz completa para los planes
interface Plan {
  key: PlanKey;
  name: string;
  price: string;
  description: string;
  icon: any;
  color: string;
  gradient: string;
  features: PlanFeature[];
  badge: { text: string; icon: any } | null;
  cta: string;
  savings?: string;
}

const plans: Plan[] = [
  {
    key: "BASIC" as PlanKey,
    name: "Basic",
    price: "$4.99",
    description: "Publish one project on your own — straightforward and fast.",
    icon: Package,
    color: "#38A3F1",
    gradient: "from-[#38A3F1] to-[#5BB3F3]",
    features: [
      { text: "1 project listing", included: true },
      { text: "Student applications", included: true },
      { text: "Standard visibility", included: true },
      { text: "AI project brief writer", included: false },
      { text: "Recommended candidates", included: false },
      { text: "Priority support", included: false },
    ],
    badge: null,
    cta: "Start Basic",
  },
  {
    key: "ASSISTED" as PlanKey,
    name: "Assisted",
    price: "$14.99",
    description: "AI helps you write the project brief and recommends the best candidates.",
    icon: Briefcase,
    color: "#1D9E75",
    gradient: "from-[#1D9E75] to-[#3DB892]",
    features: [
      { text: "Everything in Basic", included: true },
      { text: "AI project brief writer", included: true, highlight: true },
      { text: "Recommended candidates", included: true, highlight: true },
      { text: "Priority support", included: false },
    ],
    badge: { text: "Most Popular", icon: TrendingUp },
    cta: "Get Assisted",
    savings: "Save 20% vs Premium"
  },
  {
    key: "PREMIUM" as PlanKey,
    name: "Premium",
    price: "$24.99",
    description: "Full support, top candidate access, and featured listing.",
    icon: Crown,
    color: "#F59E0B",
    gradient: "from-[#F59E0B] to-[#FBBF24]",
    features: [
      { text: "Everything in Assisted", included: true },
      { text: "Top candidates only", included: true, highlight: true },
      { text: "Featured listing", included: true, highlight: true },
      { text: "Priority support", included: true, highlight: true },
      { text: "Dedicated account manager", included: true },
    ],
    badge: { text: "Best Value", icon: Crown },
    cta: "Go Premium",
  },
];

export function Plans() {
  const { isSignedIn } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState<PlanKey | null>(null);
  const [hoveredPlan, setHoveredPlan] = useState<PlanKey | null>(null);

  const handleCheckout = async (plan: PlanKey) => {
    if (!isSignedIn) { 
      router.push("/sign-up"); 
      return; 
    }
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
    <section id="plans" className="relative py-24 px-6 bg-gradient-to-b from-[#F0F7FF] to-white overflow-hidden">
      
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-0 left-0 w-96 h-96 bg-[#38A3F1] rounded-full opacity-5 blur-3xl animate-pulse" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-[#1D9E75] rounded-full opacity-5 blur-3xl animate-pulse delay-1000" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#F59E0B] rounded-full opacity-[0.03] blur-3xl" />
      </div>

      <div className="relative max-w-7xl mx-auto">
        
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-white rounded-full shadow-sm border border-[#BAD8F7] mb-4">
            <Zap className="w-4 h-4 text-[#F59E0B] fill-[#F59E0B]" />
            <span className="text-xs font-semibold uppercase tracking-wider text-[#0D5FA6]">
              For businesses
            </span>
          </div>
          
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-[#0D3A6E] mb-4">
            Find talent that{" "}
            <span className="relative">
              <span className="relative z-10 bg-gradient-to-r from-[#38A3F1] via-[#1D9E75] to-[#F59E0B] bg-clip-text text-transparent">
                fits your needs
              </span>
              <svg className="absolute -bottom-2 left-0 w-full h-3 text-[#38A3F1]/20" viewBox="0 0 100 10" preserveAspectRatio="none">
                <path d="M0,5 Q50,10 100,5" stroke="currentColor" strokeWidth="8" fill="none" />
              </svg>
            </span>
          </h2>
          
          <div className="flex items-center justify-center gap-4">
            <p className="text-[#5B8DB8] max-w-2xl">
              One-time payment — no subscriptions, no hidden fees
            </p>
            <div className="flex items-center gap-1 px-3 py-1 bg-green-50 rounded-full border border-green-200">
              <Shield className="w-3 h-3 text-green-600" />
              <span className="text-xs font-medium text-green-700">30-day money back</span>
            </div>
          </div>
        </motion.div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
          {plans.map((plan, index) => {
            const Icon = plan.icon;
            const isHovered = hoveredPlan === plan.key;
            
            return (
              <motion.div
                key={plan.key}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                onHoverStart={() => setHoveredPlan(plan.key)}
                onHoverEnd={() => setHoveredPlan(null)}
                className="relative"
              >
                {/* Glow Effect on Hover */}
                {isHovered && (
                  <div 
                    className="absolute inset-0 rounded-3xl blur-xl opacity-20 transition-opacity duration-300"
                    style={{ background: `linear-gradient(135deg, ${plan.color}, transparent)` }}
                  />
                )}
                
                {/* Card */}
                <div className={`relative h-full bg-white rounded-3xl p-6 lg:p-8 flex flex-col transition-all duration-300 ${
                  plan.key === "ASSISTED" 
                    ? "border-2 border-[#1D9E75] shadow-2xl shadow-[#1D9E75]/20 scale-105 md:scale-110 z-10" 
                    : "border border-[#E8F3FD] shadow-lg hover:shadow-xl"
                }`}>
                  
                  {/* Popular Badge */}
                  {plan.badge && (
                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                      <div 
                        className="flex items-center gap-1.5 px-4 py-1.5 rounded-full shadow-lg"
                        style={{ 
                          background: `linear-gradient(135deg, ${plan.color}, ${plan.color}dd)` 
                        }}
                      >
                        {plan.badge.icon && <plan.badge.icon className="w-3 h-3 text-white" />}
                        <span className="text-xs font-bold text-white uppercase tracking-wider">
                          {plan.badge.text}
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Icon & Name */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <motion.div
                        animate={isHovered ? { rotate: 360 } : {}}
                        transition={{ duration: 0.5 }}
                        className="w-12 h-12 rounded-xl flex items-center justify-center shadow-md"
                        style={{ 
                          background: `linear-gradient(135deg, ${plan.color}15, ${plan.color}05)` 
                        }}
                      >
                        <Icon className="w-6 h-6" style={{ color: plan.color }} />
                      </motion.div>
                      <div>
                        <h3 className="text-xl font-bold text-[#0D3A6E]">{plan.name}</h3>
                        {plan.savings && (
                          <span className="text-xs font-medium text-green-600">{plan.savings}</span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Description */}
                  <p className="text-sm text-[#5B8DB8] leading-relaxed mb-4">
                    {plan.description}
                  </p>

                  {/* Price */}
                  <div className="mb-6">
                    <div className="flex items-end gap-1">
                      <span className="text-4xl font-bold text-[#0D3A6E]">{plan.price}</span>
                      <span className="text-sm text-[#93B8D4] mb-1">/ project</span>
                    </div>
                    <p className="text-xs text-[#93B8D4] mt-1">One-time payment • No subscription</p>
                  </div>

                  {/* Features */}
                  <div className="flex-1 mb-6">
                    <p className="text-xs font-semibold text-[#0D3A6E] uppercase tracking-wider mb-3">
                      What's included
                    </p>
                    <ul className="space-y-2.5">
                      {plan.features.map((feature, i) => (
                        <motion.li
                          key={i}
                          initial={{ opacity: 0, x: -10 }}
                          whileInView={{ opacity: 1, x: 0 }}
                          viewport={{ once: true }}
                          transition={{ delay: i * 0.05 }}
                          className="flex items-start gap-2"
                        >
                          <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${
                            feature.included 
                              ? feature.highlight 
                                ? "bg-gradient-to-br from-[#1D9E75] to-[#3DB892]" 
                                : "bg-[#E8F3FD]"
                              : "bg-gray-100"
                          }`}>
                            <Check className={`w-3 h-3 ${
                              feature.included 
                                ? feature.highlight ? "text-white" : "text-[#1D9E75]" 
                                : "text-gray-400"
                            }`} />
                          </div>
                          <span className={`text-sm ${
                            feature.included 
                              ? feature.highlight 
                                ? "text-[#0D3A6E] font-medium" 
                                : "text-[#5B8DB8]"
                              : "text-[#93B8D4] line-through"
                          }`}>
                            {feature.text}
                            {feature.highlight && (
                              <Sparkles className="inline w-3 h-3 ml-1 text-[#F59E0B] fill-[#F59E0B]" />
                            )}
                          </span>
                        </motion.li>
                      ))}
                    </ul>
                  </div>

                  {/* CTA Button */}
                  <motion.button
                    onClick={() => handleCheckout(plan.key)}
                    disabled={loading === plan.key}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className={`relative w-full py-3.5 rounded-xl font-semibold transition-all duration-300 overflow-hidden group ${
                      plan.key === "ASSISTED"
                        ? "bg-gradient-to-r from-[#1D9E75] to-[#3DB892] text-white shadow-lg shadow-[#1D9E75]/25 hover:shadow-xl hover:shadow-[#1D9E75]/30"
                        : plan.key === "PREMIUM"
                        ? "bg-gradient-to-r from-[#F59E0B] to-[#FBBF24] text-white shadow-lg shadow-[#F59E0B]/25 hover:shadow-xl hover:shadow-[#F59E0B]/30"
                        : "bg-white border-2 border-[#38A3F1] text-[#38A3F1] hover:bg-[#38A3F1] hover:text-white"
                    } disabled:opacity-50 disabled:cursor-not-allowed`}
                  >
                    <span className="relative z-10 flex items-center justify-center gap-2">
                      {loading === plan.key ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          Redirecting...
                        </>
                      ) : (
                        <>
                          {plan.cta}
                          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </>
                      )}
                    </span>
                    {plan.key !== "BASIC" && (
                      <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-10 transition-opacity" />
                    )}
                  </motion.button>

                  {/* Trust Badge */}
                  <div className="flex items-center justify-center gap-2 mt-4 pt-4 border-t border-[#E8F3FD]">
                    <Shield className="w-3 h-3 text-[#1D9E75]" />
                    <span className="text-xs text-[#93B8D4]">Secure checkout • SSL encrypted</span>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Bottom Note */}
        <motion.div 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="mt-12 text-center"
        >
          <p className="text-sm text-[#93B8D4]">
            All plans include access to our AI-powered platform and student matching system.
            <br />
            <span className="text-[#38A3F1]">No hidden fees. Cancel anytime.</span>
          </p>
        </motion.div>
      </div>
    </section>
  );
}