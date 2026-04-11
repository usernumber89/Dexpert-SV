"use client";

import { useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Package, Briefcase, Star } from "lucide-react";

type PlanKey = "BASIC" | "ASSISTED" | "PREMIUM";

const plans = [
  {
    key: "BASIC" as PlanKey,
    name: "Basic",
    price: "$4.99",
    description: "Publish one project on your own — straightforward and fast.",
    icon: Package,
    features: ["1 project listing", "Student applications", "Standard visibility"],
    featured: false,
  },
  {
    key: "ASSISTED" as PlanKey,
    name: "Assisted",
    price: "$14.99",
    description: "AI helps you write the project brief and recommends the best candidates.",
    icon: Briefcase,
    features: ["Everything in Basic", "AI project brief writer", "Recommended candidates"],
    featured: true,
  },
  {
    key: "PREMIUM" as PlanKey,
    name: "Premium",
    price: "$24.99",
    description: "Full support, top candidate access, and featured listing.",
    icon: Star,
    features: ["Everything in Assisted", "Top candidates only", "Featured listing", "Priority support"],
    featured: false,
  },
];

export function Plans() {
  const { isSignedIn } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState<PlanKey | null>(null);

  const handleCheckout = async (plan: PlanKey) => {
    if (!isSignedIn) { router.push("/sign-up"); return; }
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
    <section id="plans" className="py-20 px-6 bg-[#F0F7FF]">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <p className="text-xs font-medium uppercase tracking-widest text-[#38A3F1] mb-2">For businesses</p>
          <h2 className="text-2xl font-semibold text-[#0D3A6E] mb-2">Find talent that fits your needs</h2>
          <p className="text-sm text-[#5B8DB8]">One-time payment — no subscriptions, no hidden fees</p>
        </div>
        <div className="grid md:grid-cols-3 gap-4">
          {plans.map((plan) => {
            const Icon = plan.icon;
            return (
              <div
                key={plan.key}
                className={`bg-white rounded-2xl p-6 flex flex-col gap-4 ${
                  plan.featured ? "border-2 border-[#38A3F1]" : "border border-[#BAD8F7]"
                }`}
              >
                <div className="flex justify-between items-start">
                  <div className="w-9 h-9 rounded-xl bg-[#F0F7FF] flex items-center justify-center">
                    <Icon className="w-4 h-4 text-[#38A3F1]" />
                  </div>
                  {plan.featured && (
                    <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-[#F0F7FF] text-[#0D5FA6]">
                      Most popular
                    </span>
                  )}
                </div>
                <div>
                  <p className="text-sm font-semibold text-[#0D3A6E]">{plan.name}</p>
                  <p className="text-xs text-[#5B8DB8] mt-1 leading-relaxed">{plan.description}</p>
                </div>
                <p className="font-mono text-2xl font-medium text-[#0D3A6E]">
                  {plan.price} <span className="text-xs font-sans font-normal text-[#93B8D4]">/ project</span>
                </p>
                <hr className="border-[#E8F3FD]" />
                <ul className="flex flex-col gap-2 flex-1">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-center gap-2 text-xs text-[#5B8DB8]">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#38A3F1] flex-shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
                <button
                  onClick={() => handleCheckout(plan.key)}
                  disabled={loading === plan.key}
                  className={`mt-auto w-full py-2.5 rounded-xl text-sm font-medium transition ${
                    plan.featured
                      ? "bg-[#38A3F1] text-white hover:bg-[#0D5FA6]"
                      : "border border-[#BAD8F7] text-[#0D3A6E] hover:bg-[#F0F7FF]"
                  } disabled:opacity-50`}
                >
                  {loading === plan.key ? "Redirecting..." : "Get started"}
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}