"use client";

import Link from "next/link";
import { useUserRole } from "@/hooks/useUserRole";
import { Menu, X, User, LogOut, Settings, LayoutDashboard, ChevronDown } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";

export function Navbar() {
  const { role } = useUserRole();
  const [open, setOpen] = useState(false);
  const [isSignedIn, setIsSignedIn] = useState(false);
  const [userData, setUserData] = useState<{ name: string; email: string; avatar: string | null }>({
    name: "",
    email: "",
    avatar: null,
  });
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const dashboardHref = role === "PYME" ? "/pyme/dashboard" : "/student/dashboard";
  const profileHref = role === "PYME" ? "/pyme/settings" : "/student/profile";

  useEffect(() => {
    const supabase = createClient();
    
    // Obtener usuario y perfil
    const getUserData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setIsSignedIn(!!user);
      
      if (user) {
        // Obtener perfil de la tabla profiles
        const { data: profile } = await supabase
          .from('profiles')
          .select('full_name, avatar_url')
          .eq('id', user.id)
          .single();
        
        setUserData({
          name: profile?.full_name || user.user_metadata?.full_name || 'User',
          email: user.email || '',
          avatar: profile?.avatar_url || user.user_metadata?.avatar_url || null,
        });
      }
    };
    
    getUserData();
    
    // Escuchar cambios de autenticación
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsSignedIn(!!session?.user);
      if (session?.user) {
        getUserData();
      } else {
        setUserData({ name: "", email: "", avatar: null });
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // Cerrar dropdown al hacer click fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    setDropdownOpen(false);
    setOpen(false);
    router.push("/");
    router.refresh();
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();
  };

  return (
    <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-xl border-b border-[#BAD8F7]">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group">
          <motion.div 
            whileHover={{ scale: 1.05 }}
            className="w-8 h-8 bg-gradient-to-br from-[#0D3A6E] to-[#1D5A9E] rounded-lg flex items-center justify-center shadow-md"
          >
            <span className="text-white text-xs font-bold">D</span>
          </motion.div>
          <span className="text-sm font-semibold text-[#0D3A6E] group-hover:text-[#38A3F1] transition-colors">
            Dexpert<span className="text-[#38A3F1]">.</span>
          </span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-8">
          <Link href="#about" className="text-sm text-[#5B8DB8] hover:text-[#0D3A6E] transition-colors">
            About
          </Link>
          <Link href="#how" className="text-sm text-[#5B8DB8] hover:text-[#0D3A6E] transition-colors">
            How it works
          </Link>
          <Link href="#plans" className="text-sm text-[#5B8DB8] hover:text-[#0D3A6E] transition-colors">
            Plans
          </Link>
          <Link href="#faq" className="text-sm text-[#5B8DB8] hover:text-[#0D3A6E] transition-colors">
            FAQ
          </Link>
        </div>

        {/* Auth / User Menu */}
        <div className="hidden md:flex items-center gap-3">
          {isSignedIn ? (
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-[#F0F7FF] transition-colors group"
              >
                {/* Avatar */}
                {userData.avatar ? (
                  <Image
                    src={userData.avatar}
                    alt={userData.name}
                    width={32}
                    height={32}
                    className="rounded-full border-2 border-[#BAD8F7] group-hover:border-[#38A3F1] transition-colors object-cover"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#38A3F1] to-[#1D9E75] flex items-center justify-center text-white text-xs font-medium border-2 border-[#BAD8F7] group-hover:border-[#38A3F1] transition-colors">
                    {getInitials(userData.name)}
                  </div>
                )}
                <div className="flex flex-col items-start">
                  <span className="text-xs font-medium text-[#0D3A6E] max-w-[120px] truncate">
                    {userData.name.split(' ')[0]}
                  </span>
                  <span className="text-[10px] text-[#93B8D4] capitalize">
                    {role?.toLowerCase()}
                  </span>
                </div>
                <ChevronDown className={`w-4 h-4 text-[#93B8D4] transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {/* Dropdown Menu */}
              <AnimatePresence>
                {dropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute right-0 mt-2 w-56 bg-white rounded-xl border border-[#BAD8F7] shadow-xl overflow-hidden"
                  >
                    {/* User Info */}
                    <div className="px-4 py-3 border-b border-[#E8F3FD]">
                      <p className="text-sm font-semibold text-[#0D3A6E] truncate">
                        {userData.name}
                      </p>
                      <p className="text-xs text-[#93B8D4] truncate">
                        {userData.email}
                      </p>
                    </div>

                    {/* Menu Items */}
                    <div className="py-1">
                      <Link
                        href={dashboardHref}
                        onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-[#5B8DB8] hover:bg-[#F0F7FF] hover:text-[#0D3A6E] transition-colors"
                      >
                        <LayoutDashboard className="w-4 h-4" />
                        Dashboard
                      </Link>
                      
                      <Link
                        href={profileHref}
                        onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-[#5B8DB8] hover:bg-[#F0F7FF] hover:text-[#0D3A6E] transition-colors"
                      >
                        <User className="w-4 h-4" />
                        My Profile
                      </Link>
                      
                      <Link
                        href={role === "PYME" ? "/pyme/settings" : "/student/settings"}
                        onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-[#5B8DB8] hover:bg-[#F0F7FF] hover:text-[#0D3A6E] transition-colors"
                      >
                        <Settings className="w-4 h-4" />
                        Settings
                      </Link>
                    </div>

                    {/* Logout */}
                    <div className="border-t border-[#E8F3FD] py-1">
                      <button
                        onClick={handleSignOut}
                        className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-red-400 hover:bg-red-50 transition-colors"
                      >
                        <LogOut className="w-4 h-4" />
                        Sign out
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ) : (
            <>
              <Link
                href="/sign-in"
                className="text-sm font-medium text-[#5B8DB8] hover:text-[#0D3A6E] transition-colors"
              >
                Sign in
              </Link>
              <Link
                href="/sign-up"
                className="text-sm font-medium bg-gradient-to-r from-[#0D3A6E] to-[#1D5A9E] text-white px-5 py-2 rounded-lg hover:shadow-lg hover:shadow-[#38A3F1]/25 transition-all"
              >
                Get started
              </Link>
            </>
          )}
        </div>

        {/* Mobile toggle */}
        <button 
          className="md:hidden p-2 rounded-lg hover:bg-[#F0F7FF] transition-colors" 
          onClick={() => setOpen(!open)}
        >
          {open ? (
            <X className="w-5 h-5 text-[#0D3A6E]" />
          ) : (
            <Menu className="w-5 h-5 text-[#0D3A6E]" />
          )}
        </button>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden border-t border-[#BAD8F7] bg-white overflow-hidden"
          >
            <div className="px-6 py-4 flex flex-col gap-3">
              {/* User Info Mobile */}
              {isSignedIn && (
                <div className="flex items-center gap-3 pb-3 border-b border-[#E8F3FD]">
                  {userData.avatar ? (
                    <Image
                      src={userData.avatar}
                      alt={userData.name}
                      width={40}
                      height={40}
                      className="rounded-full border-2 border-[#BAD8F7]"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#38A3F1] to-[#1D9E75] flex items-center justify-center text-white text-sm font-medium">
                      {getInitials(userData.name)}
                    </div>
                  )}
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-[#0D3A6E]">{userData.name}</p>
                    <p className="text-xs text-[#93B8D4] capitalize">{role?.toLowerCase()}</p>
                  </div>
                </div>
              )}

              {/* Navigation Links */}
              <Link 
                href="#about" 
                className="text-sm text-[#5B8DB8] hover:text-[#0D3A6E] py-1" 
                onClick={() => setOpen(false)}
              >
                About
              </Link>
              <Link 
                href="#how" 
                className="text-sm text-[#5B8DB8] hover:text-[#0D3A6E] py-1" 
                onClick={() => setOpen(false)}
              >
                How it works
              </Link>
              <Link 
                href="#plans" 
                className="text-sm text-[#5B8DB8] hover:text-[#0D3A6E] py-1" 
                onClick={() => setOpen(false)}
              >
                Plans
              </Link>
              <Link 
                href="#faq" 
                className="text-sm text-[#5B8DB8] hover:text-[#0D3A6E] py-1" 
                onClick={() => setOpen(false)}
              >
                FAQ
              </Link>

              {/* Auth Links Mobile */}
              {isSignedIn ? (
                <>
                  <div className="border-t border-[#E8F3FD] my-2" />
                  <Link 
                    href={dashboardHref} 
                    className="flex items-center gap-2 text-sm font-medium text-[#0D3A6E] py-1"
                    onClick={() => setOpen(false)}
                  >
                    <LayoutDashboard className="w-4 h-4" />
                    Dashboard
                  </Link>
                  <Link 
                    href={profileHref} 
                    className="flex items-center gap-2 text-sm font-medium text-[#0D3A6E] py-1"
                    onClick={() => setOpen(false)}
                  >
                    <User className="w-4 h-4" />
                    My Profile
                  </Link>
                  <Link 
                    href={role === "PYME" ? "/pyme/settings" : "/student/settings"} 
                    className="flex items-center gap-2 text-sm font-medium text-[#0D3A6E] py-1"
                    onClick={() => setOpen(false)}
                  >
                    <Settings className="w-4 h-4" />
                    Settings
                  </Link>
                  <button 
                    onClick={handleSignOut} 
                    className="flex items-center gap-2 text-sm font-medium text-red-400 py-1 text-left"
                  >
                    <LogOut className="w-4 h-4" />
                    Sign out
                  </button>
                </>
              ) : (
                <>
                  <div className="border-t border-[#E8F3FD] my-2" />
                  <Link 
                    href="/sign-in" 
                    className="text-sm font-medium text-[#0D3A6E] py-1"
                    onClick={() => setOpen(false)}
                  >
                    Sign in
                  </Link>
                  <Link 
                    href="/sign-up" 
                    className="text-sm font-medium bg-gradient-to-r from-[#0D3A6E] to-[#1D5A9E] text-white px-4 py-2.5 rounded-lg text-center"
                    onClick={() => setOpen(false)}
                  >
                    Get started
                  </Link>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}