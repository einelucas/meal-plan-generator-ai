// components/PublicNavBar.tsx
"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Home, Sparkles, Menu, X, Leaf } from "lucide-react";

export default function PublicNavBar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${
          scrolled ? "bg-white/90 backdrop-blur-md shadow-md py-2" : "bg-white shadow-sm py-3"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-10 h-10 bg-gradient-to-br from-[#007BFF] to-[#28A745] rounded-xl flex items-center justify-center shadow-md">
              <Leaf size={20} className="text-white" />
            </div>
            <span className="text-lg font-bold text-slate-800">
              SmartPlate<span className="text-[#28A745]">AI</span>
            </span>
          </Link>

          <div className="hidden md:flex items-center space-x-1">
            <div className="flex items-center space-x-1">
              <Link href="/">
                <motion.div
                  whileHover={{ y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl text-slate-600 hover:text-[#007BFF] hover:bg-[#007BFF]/5 transition-all"
                >
                  <Home size={18} />
                  <span className="text-sm font-medium">Início</span>
                </motion.div>
              </Link>
              <Link href="/#how-it-works">
                <motion.div
                  whileHover={{ y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl text-slate-600 hover:text-[#007BFF] hover:bg-[#007BFF]/5 transition-all"
                >
                  <Sparkles size={18} />
                  <span className="text-sm font-medium">Como Funciona</span>
                </motion.div>
              </Link>
            </div>

            <div className="flex items-center gap-3 ml-4">
              <Link href="/sign-in">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-5 py-2 text-sm font-medium text-slate-600 hover:text-[#007BFF] transition-colors"
                >
                  Entrar
                </motion.button>
              </Link>
              <Link href="/sign-up">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-5 py-2 bg-gradient-to-r from-[#007BFF] to-[#28A745] text-white text-sm font-medium rounded-xl shadow-md hover:shadow-lg transition-shadow"
                >
                  Cadastre-se
                </motion.button>
              </Link>
            </div>
          </div>

          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden p-2 text-slate-600 hover:text-[#007BFF] rounded-lg hover:bg-slate-100 transition-colors"
          >
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </motion.nav>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-[73px] left-0 right-0 bg-white border-b border-slate-100 shadow-lg z-40 md:hidden"
          >
            <div className="p-4 space-y-2">
              <Link href="/" onClick={() => setIsOpen(false)}>
                <motion.div whileTap={{ scale: 0.98 }} className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-600 hover:bg-[#007BFF]/5 hover:text-[#007BFF] transition-colors">
                  <Home size={20} />
                  <span className="font-medium">Início</span>
                </motion.div>
              </Link>
              <Link href="/#how-it-works" onClick={() => setIsOpen(false)}>
                <motion.div whileTap={{ scale: 0.98 }} className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-600 hover:bg-[#007BFF]/5 hover:text-[#007BFF] transition-colors">
                  <Sparkles size={20} />
                  <span className="font-medium">Como Funciona</span>
                </motion.div>
              </Link>

              <div className="grid grid-cols-2 gap-3 pt-4 mt-4 border-t border-slate-100">
                <Link href="/sign-in" onClick={() => setIsOpen(false)}>
                  <motion.button whileTap={{ scale: 0.98 }} className="w-full py-3 text-center font-medium text-slate-600 border border-slate-200 rounded-xl hover:bg-slate-50">
                    Entrar
                  </motion.button>
                </Link>
                <Link href="/sign-up" onClick={() => setIsOpen(false)}>
                  <motion.button whileTap={{ scale: 0.98 }} className="w-full py-3 text-center font-medium bg-gradient-to-r from-[#007BFF] to-[#28A745] text-white rounded-xl shadow-md">
                    Cadastre-se
                  </motion.button>
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="h-[73px]" />
    </>
  );
}
