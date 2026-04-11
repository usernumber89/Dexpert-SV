"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ChevronDown, 
  HelpCircle, 
  MessageCircle, 
  Sparkles,
  ArrowRight,
  Search
} from "lucide-react";

const faqs = [
  { 
    question: "What is Dexpert?", 
    answer: "Dexpert is a platform that connects young people without work experience to small businesses that need help with real projects.",
    category: "General"
  },
  { 
    question: "Who can use Dexpert?", 
    answer: "Young people including those with disabilities who want to gain experience, and small businesses looking for affordable talent.",
    category: "General"
  },
  { 
    question: "Do I need experience to join?", 
    answer: "No experience required. Dexpert is made for beginners. Our AI assistant guides you through each step.",
    category: "Students",
    highlight: true
  },
  { 
    question: "How does Dexpert help small businesses?", 
    answer: "Businesses post projects with AI help, get support from motivated students, and choose plans that fit their budget.",
    category: "Business"
  },
  { 
    question: "Is Dexpert accessible to people with disabilities?", 
    answer: "Yes. Dexpert is fully inclusive with equal access, respect, and participation for all users.",
    category: "General",
    highlight: true
  },
  { 
    question: "What do students get from the experience?", 
    answer: "Practical experience, AI mentorship, and a certificate proving their contribution to real-world projects.",
    category: "Students"
  },
  { 
    question: "How much does it cost for businesses?", 
    answer: "Three plans: $4.99 Basic, $14.99 Assisted with AI, and $24.99 Premium with full support.",
    category: "Business"
  },
  { 
    question: "Where is Dexpert available?", 
    answer: "Currently focused on El Salvador with plans to expand across Latin America.",
    category: "General"
  },
];

const categories = ["All", "General", "Students", "Business"];

export function Faq() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");

  const filteredFaqs = faqs.filter(faq => {
    const matchesSearch = faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         faq.answer.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = activeCategory === "All" || faq.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <section id="faq" className="relative py-24 px-6 bg-gradient-to-b from-[#F0F7FF] to-white overflow-hidden">
      
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#38A3F1] rounded-full opacity-5 blur-3xl animate-pulse" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-[#1D9E75] rounded-full opacity-5 blur-3xl animate-pulse delay-1000" />
        
        {/* Floating Icons */}
        <motion.div
          animate={{ y: [0, -20, 0] }}
          transition={{ duration: 6, repeat: Infinity }}
          className="absolute top-40 left-10 text-[#38A3F1]/10"
        >
          <HelpCircle className="w-16 h-16" />
        </motion.div>
        <motion.div
          animate={{ y: [0, 20, 0] }}
          transition={{ duration: 8, repeat: Infinity }}
          className="absolute bottom-40 right-10 text-[#1D9E75]/10"
        >
          <MessageCircle className="w-16 h-16" />
        </motion.div>
      </div>

      <div className="relative max-w-4xl mx-auto">
        
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-white rounded-full shadow-sm border border-[#BAD8F7] mb-4">
            <Sparkles className="w-4 h-4 text-[#F59E0B] fill-[#F59E0B]" />
            <span className="text-xs font-semibold uppercase tracking-wider text-[#0D5FA6]">
              FAQ
            </span>
          </div>
          
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-[#0D3A6E] mb-4">
            Frequently asked{" "}
            <span className="relative">
              <span className="relative z-10 bg-gradient-to-r from-[#38A3F1] to-[#1D9E75] bg-clip-text text-transparent">
                questions
              </span>
              <svg className="absolute -bottom-2 left-0 w-full h-3 text-[#38A3F1]/20" viewBox="0 0 100 10" preserveAspectRatio="none">
                <path d="M0,5 Q50,10 100,5" stroke="currentColor" strokeWidth="8" fill="none" />
              </svg>
            </span>
          </h2>
          
          <p className="text-[#5B8DB8] max-w-2xl mx-auto">
            Everything you need to know about Dexpert. Can't find what you're looking for? 
            <br className="hidden md:block" />
            <a href="#contact" className="text-[#38A3F1] hover:underline ml-1">
              Contact our support team
            </a>
          </p>
        </motion.div>

        {/* Search Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-8"
        >
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#93B8D4]" />
            <input
              type="text"
              placeholder="Search questions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3.5 bg-white border border-[#BAD8F7] rounded-2xl text-sm text-[#0D3A6E] placeholder-[#93B8D4] focus:outline-none focus:border-[#38A3F1] focus:ring-2 focus:ring-[#38A3F1]/20 transition-all"
            />
          </div>
        </motion.div>

        {/* Category Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex flex-wrap gap-2 mb-8"
        >
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setActiveCategory(category)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                activeCategory === category
                  ? "bg-gradient-to-r from-[#38A3F1] to-[#1D9E75] text-white shadow-md"
                  : "bg-white text-[#5B8DB8] hover:bg-[#F0F7FF] border border-[#BAD8F7]"
              }`}
            >
              {category}
            </button>
          ))}
        </motion.div>

        {/* FAQ List */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="bg-white rounded-3xl border border-[#E8F3FD] shadow-xl overflow-hidden"
        >
          {filteredFaqs.length > 0 ? (
            filteredFaqs.map((faq, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                className={`border-b border-[#E8F3FD] last:border-b-0 ${
                  faq.highlight ? "bg-gradient-to-r from-[#F0F7FF]/50 to-transparent" : ""
                }`}
              >
                <div 
                  className="cursor-pointer group"
                  onClick={() => setOpenIndex(openIndex === i ? null : i)}
                >
                  <div className="flex items-center justify-between px-6 py-5 gap-4">
                    <div className="flex items-center gap-3 flex-1">
                      {/* Question Number */}
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 transition-all ${
                        openIndex === i 
                          ? "bg-gradient-to-br from-[#38A3F1] to-[#1D9E75] text-white" 
                          : "bg-[#F0F7FF] text-[#38A3F1] group-hover:bg-[#38A3F1] group-hover:text-white"
                      }`}>
                        <span className="text-xs font-bold">{i + 1}</span>
                      </div>
                      
                      {/* Question Text */}
                      <p className={`text-sm md:text-base font-medium transition-colors ${
                        openIndex === i ? "text-[#38A3F1]" : "text-[#0D3A6E] group-hover:text-[#38A3F1]"
                      }`}>
                        {faq.question}
                        {faq.highlight && (
                          <Sparkles className="inline w-3 h-3 ml-2 text-[#F59E0B] fill-[#F59E0B]" />
                        )}
                      </p>
                    </div>
                    
                    {/* Chevron */}
                    <motion.div
                      animate={{ rotate: openIndex === i ? 180 : 0 }}
                      transition={{ duration: 0.3 }}
                      className={`flex-shrink-0 ${openIndex === i ? "text-[#38A3F1]" : "text-[#93B8D4]"}`}
                    >
                      <ChevronDown className="w-5 h-5" />
                    </motion.div>
                  </div>
                </div>

                {/* Answer */}
                <AnimatePresence>
                  {openIndex === i && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.3 }}
                      className="overflow-hidden"
                    >
                      <div className="px-6 pb-5 pl-17">
                        <div className="relative">
                          <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-gradient-to-b from-[#38A3F1] to-[#1D9E75] opacity-30" />
                          <p className="text-sm text-[#5B8DB8] leading-relaxed pl-4">
                            {faq.answer}
                          </p>
                          
                          {/* Category Badge */}
                          <div className="mt-3 pl-4">
                            <span className="inline-flex items-center gap-1 px-2 py-1 bg-[#F0F7FF] rounded-full text-xs text-[#0D5FA6]">
                              {faq.category}
                            </span>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))
          ) : (
            <div className="text-center py-16">
              <HelpCircle className="w-16 h-16 text-[#93B8D4] mx-auto mb-4 opacity-50" />
              <p className="text-[#5B8DB8]">No questions found matching your search.</p>
              <button
                onClick={() => {
                  setSearchTerm("");
                  setActiveCategory("All");
                }}
                className="mt-4 text-[#38A3F1] hover:underline"
              >
                Clear filters
              </button>
            </div>
          )}
        </motion.div>

        {/* Contact CTA */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-12 text-center"
        >
          <div className="inline-flex items-center gap-4 px-6 py-4 bg-white rounded-2xl border border-[#E8F3FD] shadow-lg">
            <MessageCircle className="w-5 h-5 text-[#38A3F1]" />
            <p className="text-[#0D3A6E] font-medium">
              Still have questions? We're here to help!
            </p>
            <a 
              href="#contact" 
              className="inline-flex items-center gap-2 text-[#38A3F1] font-medium hover:gap-3 transition-all"
            >
              Contact us
              <ArrowRight className="w-4 h-4" />
            </a>
          </div>
        </motion.div>
      </div>
    </section>
  );
}