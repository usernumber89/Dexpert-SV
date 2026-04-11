"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";

const faqs = [
  { question: "What is Dexpert?", answer: "Dexpert is a platform that connects young people without work experience to small businesses that need help with real projects." },
  { question: "Who can use Dexpert?", answer: "Young people including those with disabilities who want to gain experience, and small businesses looking for affordable talent." },
  { question: "Do I need experience to join?", answer: "No experience required. Dexpert is made for beginners. Our AI assistant guides you through each step." },
  { question: "How does Dexpert help small businesses?", answer: "Businesses post projects with AI help, get support from motivated students, and choose plans that fit their budget." },
  { question: "Is Dexpert accessible to people with disabilities?", answer: "Yes. Dexpert is fully inclusive with equal access, respect, and participation for all users." },
  { question: "What do students get from the experience?", answer: "Practical experience, AI mentorship, and a certificate proving their contribution to real-world projects." },
  { question: "How much does it cost for businesses?", answer: "Three plans: $4.99 Basic, $14.99 Assisted with AI, and $24.99 Premium with full support." },
  { question: "Where is Dexpert available?", answer: "Currently focused on El Salvador with plans to expand across Latin America." },
];

export function Faq() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section id="faq" className="py-20 px-6 bg-[#F0F7FF]">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-12">
          <p className="text-xs font-medium uppercase tracking-widest text-[#38A3F1] mb-2">FAQ</p>
          <h2 className="text-2xl font-semibold text-[#0D3A6E]">Frequently asked questions</h2>
        </div>
        <div className="bg-white rounded-2xl border border-[#BAD8F7] overflow-hidden divide-y divide-[#E8F3FD]">
          {faqs.map((faq, i) => (
            <div key={i} className="cursor-pointer" onClick={() => setOpenIndex(openIndex === i ? null : i)}>
              <div className="flex items-center justify-between px-6 py-4 gap-4">
                <p className={`text-sm font-medium transition-colors ${openIndex === i ? "text-[#38A3F1]" : "text-[#0D3A6E]"}`}>
                  {faq.question}
                </p>
                <ChevronDown className={`w-4 h-4 flex-shrink-0 transition-transform ${openIndex === i ? "rotate-180 text-[#38A3F1]" : "text-[#93B8D4]"}`} />
              </div>
              {openIndex === i && (
                <div className="px-6 pb-4">
                  <p className="text-sm text-[#5B8DB8] leading-relaxed">{faq.answer}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}