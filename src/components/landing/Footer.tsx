"use client";

import { 
  Mail,           // ✅ MailIcon → Mail 
  Globe,          // ✅ Reemplaza Facebook (o usa FacebookIcon)
  MapPin, 
  Phone,
  ArrowUp,
  Shield,
  HelpCircle,
  Sparkles,
  Heart
} from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";

export function Footer() {
  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 400);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const currentYear = new Date().getFullYear();

  return (
    <footer id="contact" className="relative bg-gradient-to-b from-[#0A2E5E] to-[#0D3A6E] text-white overflow-hidden">
      
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div 
          className="absolute inset-0"
          style={{
            backgroundImage: `radial-gradient(circle at 20% 80%, #38A3F1 1px, transparent 1px), 
                              radial-gradient(circle at 80% 20%, #1D9E75 1px, transparent 1px)`,
            backgroundSize: '50px 50px'
          }}
        />
      </div>

      {/* Glow Effects */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-[#38A3F1] rounded-full opacity-10 blur-3xl -translate-x-1/2 -translate-y-1/2" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-[#1D9E75] rounded-full opacity-10 blur-3xl translate-x-1/2 translate-y-1/2" />

      <div className="relative max-w-7xl mx-auto px-6 py-16">
        
        {/* Main Footer Content */}
        <div className="grid md:grid-cols-4 gap-12 mb-12">
          
          {/* Brand Column */}
          <div className="md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <motion.div 
                whileHover={{ rotate: 360 }}
                transition={{ duration: 0.5 }}
                className="w-10 h-10 bg-gradient-to-br from-[#38A3F1] to-[#1D9E75] rounded-xl flex items-center justify-center shadow-lg"
              >
                <span className="text-white text-lg font-bold">D</span>
              </motion.div>
              <span className="text-xl font-bold text-white">
                Dexpert<span className="text-[#38A3F1]">.</span>
              </span>
            </div>
            
            <p className="text-sm text-[#BAD8F7] leading-relaxed mb-6">
              Bridging the gap between emerging talent and real-world opportunities in El Salvador.
            </p>
            
            {/* Social Links */}
            <div className="flex gap-3">
              {[
                { icon: Globe, href: "https://www.instagram.com/dexpert.sv", label: "Instagram" },
                { icon: Globe, href: "#", label: "Website" }, // ✅ Facebook → Globe
                { icon: Globe, href: "#", label: "Twitter" },
                { icon: Globe, href: "#", label: "LinkedIn" },
              ].map((social, i) => {
                const Icon = social.icon;
                return (
                  <motion.a
                    key={i}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    whileHover={{ y: -3 }}
                    className="w-9 h-9 bg-white/10 rounded-lg flex items-center justify-center hover:bg-[#38A3F1] transition-colors group"
                    aria-label={social.label}
                  >
                    <Icon className="w-4 h-4 text-[#BAD8F7] group-hover:text-white" />
                  </motion.a>
                );
              })}
            </div>
          </div>

          {/* Quick Links */}
          <div className="md:col-span-1">
            <h3 className="text-sm font-semibold text-white mb-4">Quick Links</h3>
            <ul className="space-y-3">
              {[
                { href: "#about", label: "About us" },
                { href: "#how", label: "How it works" },
                { href: "#plans", label: "Plans" },
                { href: "#faq", label: "FAQ" },
              ].map((link) => (
                <li key={link.href}>
                  <Link 
                    href={link.href} 
                    className="text-sm text-[#BAD8F7] hover:text-white transition-colors inline-block hover:translate-x-1 duration-200"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div className="md:col-span-1">
            <h3 className="text-sm font-semibold text-white mb-4">Legal</h3>
            <ul className="space-y-3">
              {[
                { href: "/privacy", label: "Privacy Policy", icon: Shield },
                { href: "/terms", label: "Terms & Conditions", icon: Shield },
                { href: "/cookies", label: "Cookie Policy", icon: Shield },
                { href: "/accessibility", label: "Accessibility", icon: HelpCircle },
              ].map((link) => {
                const Icon = link.icon;
                return (
                  <li key={link.href}>
                    <Link 
                      href={link.href} 
                      className="text-sm text-[#BAD8F7] hover:text-white transition-colors inline-flex items-center gap-2 group"
                    >
                      <Icon className="w-3 h-3 text-[#5B8DB8] group-hover:text-[#38A3F1] transition-colors" />
                      <span className="group-hover:translate-x-1 duration-200 inline-block">
                        {link.label}
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>

          {/* Contact Info */}
          <div className="md:col-span-1">
            <h3 className="text-sm font-semibold text-white mb-4">Get in Touch</h3>
            <ul className="space-y-4">
              <li>
                <a 
                  href="mailto:dexpertwork@gmail.com" 
                  className="flex items-start gap-3 text-sm text-[#BAD8F7] hover:text-white transition-colors group"
                >
                  <Mail className="w-4 h-4 flex-shrink-0 mt-0.5 text-[#38A3F1]" /> {/* ✅ MailIcon → Mail */}
                  <span className="group-hover:underline">dexpertwork@gmail.com</span>
                </a>
              </li>
              <li>
                <div className="flex items-start gap-3 text-sm text-[#BAD8F7]">
                  <MapPin className="w-4 h-4 flex-shrink-0 mt-0.5 text-[#38A3F1]" />
                  <span>San Salvador, El Salvador</span>
                </div>
              </li>
              <li>
                <div className="flex items-start gap-3 text-sm text-[#BAD8F7]">
                  <Phone className="w-4 h-4 flex-shrink-0 mt-0.5 text-[#38A3F1]" />
                  <span>+503 74747474</span>
                </div>
              </li>
            </ul>

            {/* Newsletter Signup */}
            <div className="mt-6">
              <p className="text-xs text-[#5B8DB8] mb-2">Subscribe to our newsletter</p>
              <form className="flex gap-2">
                <input
                  type="email"
                  placeholder="Your email"
                  className="flex-1 px-3 py-2 text-xs bg-white/10 border border-white/20 rounded-lg text-white placeholder-[#5B8DB8] focus:outline-none focus:border-[#38A3F1] transition-colors"
                />
                <button
                  type="submit"
                  className="px-3 py-2 bg-[#38A3F1] text-white text-xs font-medium rounded-lg hover:bg-[#0D5FA6] transition-colors"
                >
                  Subscribe
                </button>
              </form>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-white/10">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            
            {/* Copyright */}
            <div className="flex items-center gap-2 text-xs text-[#5B8DB8]">
              <span>© {currentYear} Dexpert. All rights reserved.</span>
              <span className="w-1 h-1 bg-[#5B8DB8] rounded-full" />
              <span className="flex items-center gap-1">
                Made in El Salvador
              </span>
            </div>

            {/* Trust Badges */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1">
                <Shield className="w-3 h-3 text-[#1D9E75]" />
                <span className="text-xs text-[#5B8DB8]">SSL Secure</span>
              </div>
              <div className="flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-[#F59E0B] fill-[#F59E0B]" />
                <span className="text-xs text-[#5B8DB8]">100% Inclusive</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll to Top Button */}
      <AnimatePresence>
        {showScrollTop && (
          <motion.button
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5 }}
            onClick={scrollToTop}
            className="fixed bottom-6 right-6 w-12 h-12 bg-gradient-to-br from-[#38A3F1] to-[#1D9E75] text-white rounded-full shadow-lg hover:shadow-xl transition-shadow flex items-center justify-center z-50"
            aria-label="Scroll to top"
          >
            <ArrowUp className="w-5 h-5" />
          </motion.button>
        )}
      </AnimatePresence>
    </footer>
  );
}