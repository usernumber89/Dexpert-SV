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
import {DexpertLogo} from "@/components/DexpertLogo";
import {InstagramLogoIcon, XLogoIcon,FacebookLogoIcon  }  from "@phosphor-icons/react";

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
            <div className="flex h-10 items-center gap-2 mb-4">
            
               <Link href="/" className="flex items-center gap-2 group">
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="  rounded-lg flex items-center justify-center "
          >
           <img src="/dark.png" className="w-50"></img>
          </motion.div>
          
        </Link>
            </div>
            
            <p className="text-sm text-[#BAD8F7] leading-relaxed mb-6">
              Rompiendo la brecha entre el talento emergente y las oportunidades del mundo real en El Salvador.
            </p>
            
            {/* Social Links */}
            <div className="flex gap-3">
              {[
                { icon: InstagramLogoIcon, href: "https://www.instagram.com/dexpert.sv", label: "Instagram" },
                { icon: FacebookLogoIcon, href: "#", label: "Facebook" }, // ✅ Facebook → Globe
                { icon: XLogoIcon, href: "#", label: "Twitter" },
                
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
            <h3 className="text-sm font-semibold text-white mb-4">Enlaces Rápidos</h3>
            <ul className="space-y-3">
              {[
                { href: "#about", label: "Sobre nosotros" },
                { href: "#how", label: "¿Cómo funciona?" },
                { href: "#plans", label: "Planes" },
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
                { href: "/privacidad", label: "Política de Privacidad", icon: Shield },
                { href: "/terminos", label: "Términos y Condiciones", icon: Shield },
                { href: "/cookies", label: "Política de Cookies", icon: Shield },
                { href: "/accessibility", label: "Accesibilidad", icon: HelpCircle },
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
            <h3 className="text-sm font-semibold text-white mb-4">Información de Contacto</h3>
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

            
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-white/10">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            
            {/* Copyright */}
            <div className="flex items-center gap-2 text-xs text-[#5B8DB8]">
              <span>© {currentYear} Dexpert. Todos los derechos reservados.</span>
              
             
            </div>

            {/* Trust Badges */}
            
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