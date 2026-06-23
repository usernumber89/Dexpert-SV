"use client";

import { useState } from "react";
import {
  HelpCircle,
  Mail,
  MessageCircle,
  Clock,
  ChevronDown,
  ArrowRight,
  Building2,
  GraduationCap,
} from "lucide-react";

const faqsPyme = [
  {
    q: "¿Cómo puedo publicar un proyecto?",
    a: 'Completa el formulario en "Crear proyecto", describe lo que necesitas y define las habilidades requeridas. Si no tienes créditos, adquiere un plan en la sección de Precios.',
  },
  {
    q: "¿Qué hago si no tengo créditos disponibles?",
    a: 'Ve a "Precios" y elige el plan que mejor se ajuste a tus necesidades. Puedes comprar créditos adicionales en cualquier momento desde tu panel.',
  },
  {
    q: "¿Cómo selecciono al estudiante ideal?",
    a: "Revisa los perfiles, portafolios y aplicaciones que recibas. Puedes contactar directamente a los estudiantes que más te interesen.",
  },
  {
    q: "¿Qué pasa si el proyecto no se completa?",
    a: "Comunícate con nosotros para evaluar el caso. Trabajamos con los estudiantes para asegurar la mejor experiencia posible.",
  },
  {
    q: "¿Cómo recibo mi factura?",
    a: "Las facturas se generan automáticamente y están disponibles en tu perfil. Si necesitas una factura específica, escríbenos.",
  },
];

const faqsStudent = [
  {
    q: "¿Cómo aplico a un proyecto?",
    a: 'Explora los proyectos disponibles en "Proyectos", revisa los detalles y haz clic en "Aplicar". Asegúrate de que tu perfil esté completo.',
  },
  {
    q: "¿Cómo recibo mi certificado?",
    a: 'Al completar un proyecto, el certificado aparecerá automáticamente en tu sección "Certificados". Puedes descargarlo y compartirlo.',
  },
  {
    q: "¿Qué habilidades necesito tener?",
    a: "Depende del proyecto al que quieras aplicar. Revisa los requisitos de cada proyecto y personaliza tu perfil para destacar tus fortalezas.",
  },
  {
    q: "¿Puedo trabajar en varios proyectos a la vez?",
    a: "Sí, siempre que puedas cumplir con los plazos de cada uno. Organiza tu tiempo y comunica cualquier inconveniente al contratante.",
  },
  {
    q: "¿Qué hago si tengo un problema con un proyecto?",
    a: "Contáctanos de inmediato. Mediaremos entre tú y el contratante para encontrar una solución justa.",
  },
];

type Role = "pyme" | "student";

function RoleIcon({ role }: { role: Role }) {
  return role === "pyme" ? (
    <Building2 className="w-5 h-5" />
  ) : (
    <GraduationCap className="w-5 h-5" />
  );
}

function RoleLabel({ role }: { role: Role }) {
  return role === "pyme" ? "PYME" : "Estudiante";
}

function FaqItem({
  question,
  answer,
  defaultOpen = false,
}: {
  question: string;
  answer: string;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="group">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between gap-3 px-5 py-4 text-left transition-colors hover:bg-[#F0F7FF]/50"
      >
        <span className="text-sm font-medium text-[#0D3A6E]">{question}</span>
        <ChevronDown
          className={`w-4 h-4 text-[#5B8DB8] shrink-0 transition-transform duration-200 ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>
      <div
        className={`overflow-hidden transition-all duration-200 ${
          open ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <p className="px-5 pb-4 text-sm text-[#5B8DB8] leading-relaxed">{answer}</p>
      </div>
    </div>
  );
}

export function ContactSupport({ role }: { role: Role }) {
  const faqs = role === "pyme" ? faqsPyme : faqsStudent;
  const roleName = role === "pyme" ? "pymes" : "estudiantes";
  const supportEmail = "soporte@dexpert.sv";
  const whatsappNumber = "+503 1234-5678";
  const whatsappLink = `https://wa.me/${whatsappNumber.replace(/[^0-9]/g, "")}`;

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F4F9FF] via-white to-[#EEF6FF]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">

        {/* Hero */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#0D3A6E] via-[#0D5FA6] to-[#38A3F1] p-8 sm:p-12 mb-8 sm:mb-12">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMiIvPjwvZz48L2c+PC9zdmc+')] opacity-40" />
          <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6">
            <div className="flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 rounded-xl bg-white/15 backdrop-blur-sm border border-white/20 shrink-0">
              <HelpCircle className="w-7 h-7 sm:w-8 sm:h-8 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] sm:text-xs font-semibold bg-white/15 text-white border border-white/20 mb-2">
                <RoleIcon role={role} />
                <span>Soporte para {RoleLabel({ role })}</span>
              </div>
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-white tracking-tight">
                ¿Necesitas ayuda?
              </h1>
              <p className="text-sm sm:text-base text-white/80 mt-1 max-w-xl">
                Estamos aquí para resolver tus dudas y ayudarte a aprovechar al máximo Dexpert.
              </p>
            </div>
          </div>
        </div>

        {/* Contact channels */}
        <h2 className="text-sm font-semibold text-[#0D3A6E] mb-4 flex items-center gap-2">
          <span className="w-1 h-5 rounded-full bg-[#38A3F1]" />
          Canales de contacto
        </h2>

        <div className="grid sm:grid-cols-2 gap-4 mb-10 sm:mb-14">
          {/* Email card */}
          <a
            href={`mailto:${supportEmail}?subject=Soporte%20${roleName}`}
            className="group relative overflow-hidden rounded-xl bg-white border border-[#BAD8F7] p-5 sm:p-6 transition-all duration-200 hover:shadow-lg hover:border-[#38A3F1]/40 hover:-translate-y-0.5"
          >
            <div className="flex items-start gap-4">
              <div className="flex items-center justify-center w-11 h-11 rounded-lg bg-[#F0F7FF] group-hover:bg-[#38A3F1] transition-colors duration-200 shrink-0">
                <Mail className="w-5 h-5 text-[#38A3F1] group-hover:text-white transition-colors duration-200" />
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="text-sm font-semibold text-[#0D3A6E]">Correo electrónico</h3>
                <p className="text-xs text-[#5B8DB8] mt-0.5 break-all">{supportEmail}</p>
                <p className="text-xs text-[#93B8D4] mt-1.5">Respuesta en 24-48 horas hábiles</p>
              </div>
              <ArrowRight className="w-4 h-4 text-[#BAD8F7] group-hover:text-[#38A3F1] transition-colors duration-200 shrink-0 mt-1.5" />
            </div>
          </a>

          {/* WhatsApp card */}
          <a
            href={whatsappLink}
            target="_blank"
            rel="noopener noreferrer"
            className="group relative overflow-hidden rounded-xl bg-white border border-[#BAD8F7] p-5 sm:p-6 transition-all duration-200 hover:shadow-lg hover:border-[#25D366]/40 hover:-translate-y-0.5"
          >
            <div className="flex items-start gap-4">
              <div className="flex items-center justify-center w-11 h-11 rounded-lg bg-[#F0F7FF] group-hover:bg-[#25D366] transition-colors duration-200 shrink-0">
                <MessageCircle className="w-5 h-5 text-[#25D366] group-hover:text-white transition-colors duration-200" />
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="text-sm font-semibold text-[#0D3A6E]">WhatsApp</h3>
                <p className="text-xs text-[#5B8DB8] mt-0.5">{whatsappNumber}</p>
                <p className="text-xs text-[#93B8D4] mt-1.5">Respuesta inmediata en horario laboral</p>
              </div>
              <ArrowRight className="w-4 h-4 text-[#BAD8F7] group-hover:text-[#25D366] transition-colors duration-200 shrink-0 mt-1.5" />
            </div>
          </a>
        </div>

        {/* Hours banner */}
        <div className="rounded-xl bg-gradient-to-r from-[#F0F7FF] to-white border border-[#BAD8F7] p-4 sm:p-5 mb-10 sm:mb-14">
          <div className="flex items-start gap-3">
            <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-white shrink-0">
              <Clock className="w-4 h-4 text-[#38A3F1]" />
            </div>
            <div>
              <p className="text-sm font-semibold text-[#0D3A6E]">Horario de atención</p>
              <p className="text-xs text-[#5B8DB8] mt-0.5">
                Lunes a viernes de 8:00 a.m. a 5:00 p.m. | Sábados de 9:00 a.m. a 1:00 p.m.
              </p>
            </div>
          </div>
        </div>

        {/* FAQ */}
        <div className="mb-8">
          <h2 className="text-sm font-semibold text-[#0D3A6E] mb-4 flex items-center gap-2">
            <span className="w-1 h-5 rounded-full bg-[#38A3F1]" />
            Preguntas frecuentes
          </h2>

          <div className="rounded-xl bg-white border border-[#BAD8F7] divide-y divide-[#BAD8F7]/50 overflow-hidden">
            {faqs.map((faq, i) => (
              <FaqItem key={i} question={faq.q} answer={faq.a} defaultOpen={i === 0} />
            ))}
          </div>
        </div>

        {/* Footer note */}
        <div className="text-center">
          <p className="text-xs text-[#93B8D4]">
            ¿No encontraste lo que buscabas? Escríbenos a{" "}
            <a
              href={`mailto:${supportEmail}`}
              className="text-[#38A3F1] hover:text-[#0D5FA6] underline underline-offset-2 transition-colors"
            >
              {supportEmail}
            </a>{" "}
            y te responderemos a la brevedad.
          </p>
        </div>
      </div>
    </div>
  );
}
