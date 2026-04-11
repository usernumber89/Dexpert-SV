import { Quote } from "lucide-react";

const testimonies = [
  { name: "Fernando Pérez", role: "Dexpert User", initials: "FP", quote: "I had never worked on a real project before. Dexpert helped me believe in what I can do and now I feel ready to apply for my first job." },
  { name: "Tatiana Salazar", role: "Entrepreneur", initials: "TS", quote: "My small business got real support from talented young people. It was not just help, it was collaboration with future professionals." },
  { name: "Sara Mejía", role: "Dexpert User", initials: "SM", quote: "As a person with a disability, it is hard to be taken seriously. On Dexpert, I was heard, included, and valued." },
];

export function Testimony() {
  return (
    <section className="py-20 px-6 bg-white">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <p className="text-xs font-medium uppercase tracking-widest text-[#38A3F1] mb-2">Testimonials</p>
          <h2 className="text-2xl font-semibold text-[#0D3A6E] mb-2">What our users say</h2>
          <p className="text-sm text-[#5B8DB8] max-w-md mx-auto">
            Many young people in El Salvador just need one opportunity. At Dexpert, they found it.
          </p>
        </div>
        <div className="grid md:grid-cols-3 gap-4">
          {testimonies.map((t) => (
            <div key={t.name} className="bg-[#F0F7FF] border border-[#BAD8F7] rounded-2xl p-6 flex flex-col gap-4">
              <Quote className="w-4 h-4 text-[#38A3F1]" />
              <p className="text-sm text-[#5B8DB8] leading-relaxed flex-1">{t.quote}</p>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-[#BAD8F7] flex items-center justify-center text-xs font-medium text-[#0D5FA6]">
                  {t.initials}
                </div>
                <div>
                  <p className="text-xs font-medium text-[#0D3A6E]">{t.name}</p>
                  <p className="text-xs text-[#93B8D4]">{t.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}