"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { motion } from "framer-motion";
import {
  Check, Crown, ArrowRight, Sprout, Building2, X
} from "lucide-react";
import { useSupabaseAuth } from "@/hooks/useSupabaseAuth";

type PlanKey = "GROWTHLIGHT" | "GROWTH" | "PRO" | "ENTERPRISE";

const plans = [
  {
    key: "GROWTHLIGHT" as PlanKey,
    name: "Growth L",
    price: "$14.99",
    credits: 4,
    Icon: Sprout,
    description: "Ideal para probar con proyectos pequeños y crecer gradualmente.",
    color: "#38A3F1",
    features: [
      { text: "4 proyectos activos", highlight: true },

      { text: "Visibilidad destacada", highlight: true },
      { text: "Analítica completa", highlight: true },
      { text: "Escritor de briefs AI", highlight: true },
      { text: "Candidatos recomendados", highlight: true },
    ],
    badge: null,
    cta: "Obtener Growth L",
  },
  {
    key: "GROWTH" as PlanKey,
    name: "Growth",
    price: "$24.99",
    credits: 8,
    Icon: Sprout,
    description: "Para empresas que necesitan talento consistente en múltiples proyectos.",
    color: "#18508f",
    features: [
      { text: "8 proyectos activos", highlight: true },
      { text: "Todo en Growth L", highlight: true },
      { text: "Visibilidad destacada", highlight: true },
      { text: "Proyectos destacados", highlight: true },
      { text: "Talent Pool (guardar estudiantes)", highlight: true },
      { text: "Solo candidatos destacados", highlight: true },
      { text: "Soporte prioritario", highlight: true },
    ],
    badge: null,
    cta: "Obtener Growth",
  },
  {
    key: "PRO" as PlanKey,
    name: "Pro",
    price: "$49.99",
    credits: 20,
    Icon: Crown,
    description: "Para empresas en crecimiento con necesidades constantes de contratación.",
    color: "#38A3F1",
    features: [
      { text: "20 proyectos activos", highlight: true },
      { text: "Todo en Growth", highlight: true },
      { text: "Account Manager dedicado", highlight: true },
    ],
    badge: null,
    cta: "Obtener Pro",
  },
  {
    key: "ENTERPRISE" as PlanKey,
    name: "Enterprise",
    price: "$99.99",
    credits: 50,
    Icon: Crown,
    description: "Para empresas con alta demanda de talento y proyectos continuos.",
    color: "#0D3A6E",
    features: [
      { text: "50 proyectos activos", highlight: true },
      { text: "Todo en Pro", highlight: true },
      { text: "Soporte prioritario 24/7", highlight: true },
      { text: "Account Manager dedicado", highlight: true },
      { text: "Onboarding personalizado", highlight: true },
    ],
    badge: "Mejor valor",
    cta: "Obtener Enterprise",
  },
];

export default function Plans() {
  const { user } = useSupabaseAuth();
  const router = useRouter();
  const [loading, setLoading] = useState<PlanKey | null>(null);

  const handleCheckout = async (plan: PlanKey) => {
    if (!user) { router.push("/sign-up"); return; }
    router.push("/pyme/pricing");
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
          
          <h2 className="lg:text-3xl md:text-2xl font-bold text-[#0D3A6E] mb-3">
            Compra créditos, <span className="text-[#38A3F1]">publica proyectos</span>
          </h2>
          <p className="text-[#5B8DB8] max-w-xl text-sm mx-auto mb-5 leading-relaxed">
            <span className="font-bold text-[#38A3F1]">No hay suscripciones.</span> Compra un paquete de créditos y úsalos cuando los necesites.
Créditos válidos por 12 meses.
          </p>
          <div className="inline-flex  items-center gap-2 px-4 py-1.5 bg-white rounded-md shadow-sm border border-[#BAD8F7] mb-5">
            <Building2 className="w-6 h-6 text-[#38A3F1] " />
            <span className="text-xs font-semibold uppercase tracking-wider text-[#0D5FA6]">
              Negocios
            </span>
          </div>
        </motion.div>

        {/* Cards */}
        <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-7">
          {plans.map((plan, index) => (
            <motion.div
              key={plan.key}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className={`relative mt-0 bg-white rounded-2xl p-7 flex flex-col transition-all duration-300 hover:shadow-xl ${
                plan.key === "GROWTH"
                  ? "border-2  shadow-lg shadow-[#38A3F1]/10 md:scale-105 z-10"
                  : "border border-[#E8F3FD] shadow-sm"
              }`}
            >
              

              {/* Name */}
              <div className="mb-2">
                <plan.Icon className="w-6 h-6 mb-2" style={{ color: plan.color }} />
                <h3 className="text-lg font-bold text-[#0D3A6E]">{plan.name}</h3>
                <p className="text-xs text-[#5B8DB8] mt-1 leading-relaxed">{plan.description}</p>
              </div>

              {/* Price + credits */}
              <div className="mb-6">
                <div className="flex items-end gap-1 mb-1">
                  <span className="text-3xl font-bold text-[#0D3A6E]">{plan.price}</span>
                </div>
                
                <p className="text-[10px] text-[#93B8D4] mt-1.5">
                  ${(parseFloat(plan.price.replace("$", "")) / plan.credits).toFixed(2)} por proyecto • Válidos por 12 meses
                </p>
              </div>

              <hr className="border-[#E8F3FD] mb-5" />

              {/* Features */}
              <ul className="flex flex-col gap-2.5 flex-1 mb-6">
                {plan.features.map((f, i) => (
                  <li key={i} className="flex items-center gap-2.5">
                    <div className={`w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 ${
                      f.highlight ? "bg-[#38A3F1]" : "bg-[#E8F3FD]"
                    }`}>
                      {f.highlight ? <Check className="w-2.5 h-2.5 text-white" /> : <X className="w-2.5 h-2.5 text-[#38A3F1]" /> }
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
                    ? "bg-[#38A3F1] text-white shadow-lg shadow-[#38A3F1]/20"
                    : plan.key === "PRO"
                    ? "bg-[#18508f] text-white  hover:bg-[ tranparent hover:text-white] shadow-lg shadow-[#18508f]/20"
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
          Todos los planes incluyen emparejamiento impulsado por IA y acceso para estudiantes. Créditos válidos por 12 meses.
          <br />
          <span className="text-[#38A3F1]">¿Preguntas? Contáctanos en dexpertwork@gmail.com</span>
        </motion.p>
      </div>
    </section>
  );
}