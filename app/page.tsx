"use client";

import { useState } from "react";
import { SignIn, SignUp } from "@clerk/nextjs";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Sparkles,
  ChevronRight,
  Leaf,
  Target,
  Calendar,
  CheckCircle,
} from "lucide-react";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-slate-50">
      {/* Hero Section com gradiente azul/verde */}
      <section className="relative overflow-hidden">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#007BFF] via-[#007BFF] to-[#28A745] opacity-95" />

        {/* Decorative elements */}
        <div className="absolute top-20 left-10 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-80 h-80 bg-white/10 rounded-full blur-3xl" />

        <div className="relative max-w-7xl mx-auto px-4 py-20 sm:py-24 lg:py-32">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center max-w-4xl mx-auto"
          >
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full text-white/90 text-sm mb-8 border border-white/30"
            >
              <Sparkles size={16} className="text-yellow-300" />
              <span>Planos alimentares com IA personalizada</span>
            </motion.div>

            {/* Title */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight"
            >
              Planos alimentares
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-white">
                personalizados com IA
              </span>
            </motion.h1>

            {/* Subtitle */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-xl text-white/90 mb-10 max-w-2xl mx-auto"
            >
              Deixe nossa IA fazer o planejamento. Você se concentra em cozinhar
              e aproveitar!
            </motion.p>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="flex flex-col sm:flex-row gap-4 justify-center items-center"
            >
              <Link
                href="/sign-up"
                className="group bg-white text-[#007BFF] px-8 py-4 rounded-xl font-semibold text-lg hover:shadow-xl transition-all duration-300 flex items-center gap-2"
              >
                Comece Agora Grátis
                <ChevronRight
                  size={20}
                  className="group-hover:translate-x-1 transition-transform"
                />
              </Link>
              <Link
                href="#how-it-works"
                className="bg-white/20 backdrop-blur-sm text-white px-8 py-4 rounded-xl font-semibold text-lg hover:bg-white/30 transition-all duration-300 border border-white/40"
              >
                Como Funciona
              </Link>
            </motion.div>

            {/* Stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="flex flex-wrap justify-center gap-8 mt-16"
            >
              <div className="text-center">
                <div className="text-3xl font-bold text-white">+10k</div>
                <div className="text-white/80 text-sm">Planos gerados</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-white">98%</div>
                <div className="text-white/80 text-sm">Satisfação</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-white">+5k</div>
                <div className="text-white/80 text-sm">Usuários ativos</div>
              </div>
            </motion.div>
          </motion.div>
        </div>

        {/* Wave divider */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 1440 120"
            className="w-full h-auto"
          >
            <path
              fill="#f8fafc"
              fillOpacity="1"
              d="M0,64L80,69.3C160,75,320,85,480,80C640,75,800,53,960,48C1120,43,1280,53,1360,58.7L1440,64L1440,120L1360,120C1280,120,1120,120,960,120C800,120,640,120,480,120C320,120,160,120,80,120L0,120Z"
            ></path>
          </svg>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <div className="inline-flex items-center gap-2 bg-[#007BFF]/10 text-[#007BFF] px-4 py-2 rounded-full text-sm font-medium mb-4">
              <Target size={16} />
              <span>Passo a passo</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-800 mb-4">
              Como Funciona
            </h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              Siga estas etapas para obter seu plano alimentar personalizado em
              minutos
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Step 1 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              viewport={{ once: true }}
              className="bg-white rounded-2xl p-8 shadow-sm border border-slate-100 hover:shadow-md transition-all group"
            >
              <div className="relative">
                <div className="w-16 h-16 bg-gradient-to-br from-[#007BFF] to-[#28A745] rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <span className="text-2xl text-white font-bold">1</span>
                </div>
                <div className="absolute -top-2 -right-2 w-8 h-8 bg-[#28A745]/10 rounded-full blur-xl" />
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-3">
                Crie sua Conta
              </h3>
              <p className="text-slate-600 leading-relaxed">
                Cadastre-se ou faça login gratuitamente para acessar seus planos
                alimentares personalizados.
              </p>
              <div className="mt-4 flex items-center gap-2 text-sm text-[#28A745]">
                <CheckCircle size={16} />
                <span>Grátis para começar</span>
              </div>
            </motion.div>

            {/* Step 2 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              viewport={{ once: true }}
              className="bg-white rounded-2xl p-8 shadow-sm border border-slate-100 hover:shadow-md transition-all group"
            >
              <div className="relative">
                <div className="w-16 h-16 bg-gradient-to-br from-[#007BFF] to-[#28A745] rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <span className="text-2xl text-white font-bold">2</span>
                </div>
                <div className="absolute -top-2 -right-2 w-8 h-8 bg-[#28A745]/10 rounded-full blur-xl" />
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-3">
                Defina suas Preferências
              </h3>
              <p className="text-slate-600 leading-relaxed">
                Informe seu tipo de dieta, calorias desejadas, alergias e
                culinárias preferidas.
              </p>
              <div className="mt-4 flex items-center gap-2 text-sm text-[#28A745]">
                <CheckCircle size={16} />
                <span>Personalizado para você</span>
              </div>
            </motion.div>

            {/* Step 3 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              viewport={{ once: true }}
              className="bg-white rounded-2xl p-8 shadow-sm border border-slate-100 hover:shadow-md transition-all group"
            >
              <div className="relative">
                <div className="w-16 h-16 bg-gradient-to-br from-[#007BFF] to-[#28A745] rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <span className="text-2xl text-white font-bold">3</span>
                </div>
                <div className="absolute -top-2 -right-2 w-8 h-8 bg-[#28A745]/10 rounded-full blur-xl" />
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-3">
                Receba seu Plano
              </h3>
              <p className="text-slate-600 leading-relaxed">
                Receba um plano semanal personalizado com café, almoço, jantar e
                lanches.
              </p>
              <div className="mt-4 flex items-center gap-2 text-sm text-[#28A745]">
                <CheckCircle size={16} />
                <span>Plano de 7 dias</span>
              </div>
            </motion.div>
          </div>

          {/* Final CTA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            viewport={{ once: true }}
            className="mt-16 text-center"
          >
            <Link
              href="/sign-up"
              className="inline-flex items-center gap-2 bg-gradient-to-r from-[#007BFF] to-[#28A745] text-white px-8 py-4 rounded-xl font-semibold text-lg hover:shadow-xl transition-all duration-300 group"
            >
              Começar Agora
              <Leaf
                size={20}
                className="group-hover:rotate-12 transition-transform"
              />
            </Link>
            <p className="mt-4 text-sm text-slate-500">
              ✅ Sem compromisso • Cancele quando quiser
            </p>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <div className="inline-flex items-center gap-2 bg-[#28A745]/10 text-[#28A745] px-4 py-2 rounded-full text-sm font-medium mb-4">
                <Sparkles size={16} />
                <span>Diferenciais</span>
              </div>
              <h2 className="text-3xl font-bold text-slate-800 mb-4">
                Mais que um simples gerador de dietas
              </h2>
              <p className="text-lg text-slate-600 mb-6">
                Nossa IA aprende com suas preferências e se adapta ao seu estilo
                de vida.
              </p>
              <div className="space-y-4">
                {[
                  "Planos personalizados baseados em IA",
                  "Acompanhamento de progresso",
                  "Lista de compras automática",
                  "Receitas adaptadas ao seu nível na cozinha",
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="w-6 h-6 bg-[#28A745]/20 rounded-full flex items-center justify-center">
                      <CheckCircle size={14} className="text-[#28A745]" />
                    </div>
                    <span className="text-slate-700">{item}</span>
                  </div>
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="bg-gradient-to-br from-[#007BFF]/10 to-[#28A745]/10 rounded-3xl p-8"
            >
              <div className="bg-white rounded-2xl p-6 shadow-lg">
                <div className="flex items-center gap-3 mb-4">
                  <Calendar size={20} className="text-[#007BFF]" />
                  <span className="font-semibold text-slate-800">
                    Plano de hoje
                  </span>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-slate-600">
                      Café da manhã
                    </span>
                    <span className="text-sm font-medium">320 kcal</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-slate-600">Almoço</span>
                    <span className="text-sm font-medium">520 kcal</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-slate-600">Jantar</span>
                    <span className="text-sm font-medium">450 kcal</span>
                  </div>
                  <div className="pt-3 border-t border-slate-100">
                    <div className="flex justify-between items-center font-semibold">
                      <span className="text-slate-800">Total</span>
                      <span className="text-[#007BFF]">1.290 kcal</span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  );
}
