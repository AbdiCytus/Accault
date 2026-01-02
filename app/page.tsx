// app/page.tsx
"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  ShieldCheckIcon,
  BoltIcon,
  ChartBarIcon,
  ArrowRightIcon,
  GlobeAltIcon,
  DevicePhoneMobileIcon,
} from "@heroicons/react/24/outline";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

// --- UTILITY ---
function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// --- ANIMATION WRAPPER ---
const FadeIn = ({
  children,
  delay = 0,
  className,
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.8, delay, ease: "easeOut" }}
      className={className}>
      {children}
    </motion.div>
  );
};

export default function LandingPage() {
  return (
    <div className="bg-linear-to-br from-blue-200 via-white to-indigo-200 dark:from-gray-950 dark:via-gray-900 dark:to-black overflow-hidden flex flex-col min-h-screen">
      {/* --- HERO SECTION --- */}
      <section className="relative pt-20 pb-32 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-blue-400/50 rounded-full blur-[120px] -z-10 mix-blend-multiply dark:mix-blend-screen opacity-50" />
        <div className="absolute bottom-0 right-0 w-[800px] h-[600px] bg-purple-400/50 rounded-full blur-[100px] -z-10 mix-blend-multiply dark:mix-blend-screen opacity-50" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <FadeIn>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/60 dark:bg-white/10 backdrop-blur-md text-blue-600 dark:text-blue-300 text-xs font-semibold uppercase tracking-wider mb-6 border border-blue-100 dark:border-white/10 shadow-sm">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
              </span>
              v1.0 is Now Live
            </div>
          </FadeIn>

          <FadeIn delay={0.1}>
            <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-gray-900 dark:text-white mb-6 leading-tight">
              Master Your <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 drop-shadow-sm">
                Digital Identity
              </span>
            </h1>
          </FadeIn>

          <FadeIn delay={0.2}>
            <p className="mt-4 text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto mb-10 leading-relaxed">
              Stop forgetting passwords. Accault is the secure,
              minimalist vault for all your credentials, emails, and digital
              assets.
            </p>
          </FadeIn>

          <FadeIn
            delay={0.3}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link
              href="/dashboard"
              className="px-8 py-4 text-base font-bold rounded-full text-white bg-gray-900 dark:bg-white dark:text-gray-900 hover:scale-105 hover:shadow-2xl hover:shadow-blue-500/20 transition-all duration-300">
              Get Started (Free)
            </Link>
            <Link
              href="/about"
              className="px-8 py-4 text-base font-bold rounded-full text-gray-700 dark:text-gray-200 bg-white/50 dark:bg-white/10 backdrop-blur-sm border border-gray-200 dark:border-white/10 hover:bg-white dark:hover:bg-white/20 transition-all flex items-center gap-2">
              Learn More <ArrowRightIcon className="w-4 h-4" />
            </Link>
          </FadeIn>

          {/* Abstract Dashboard Mockup */}
          <FadeIn delay={0.5} className="mt-20 relative mx-auto max-w-5xl">
            <div className="relative rounded-2xl border border-white/50 dark:border-white/10 bg-white/40 dark:bg-gray-900/40 backdrop-blur-xl shadow-2xl p-2 md:p-4 ring-1 ring-black/5 dark:ring-white/5">
              <div className="rounded-xl overflow-hidden border border-white/60 dark:border-white/5 bg-white/80 dark:bg-black/80 aspect-[16/9] relative group shadow-inner">
                {/* Mockup UI Elements */}
                <div className="absolute top-0 left-0 w-full h-12 border-b border-gray-100/50 dark:border-white/5 flex items-center px-4 gap-2 bg-gray-50/50 dark:bg-white/5">
                  <div className="w-3 h-3 rounded-full bg-red-400/80" />
                  <div className="w-3 h-3 rounded-full bg-yellow-400/80" />
                  <div className="w-3 h-3 rounded-full bg-green-400/80" />
                </div>
                {/* Content Simulation */}
                <div className="absolute top-16 left-8 right-8 grid grid-cols-1 md:grid-cols-3 gap-6 opacity-80 group-hover:opacity-100 transition-opacity duration-500">
                  <div className="h-32 rounded-xl bg-gradient-to-br from-blue-50 to-white dark:from-blue-900/20 dark:to-transparent border border-blue-100 dark:border-blue-500/10" />
                  <div className="h-32 rounded-xl bg-gradient-to-br from-purple-50 to-white dark:from-purple-900/20 dark:to-transparent border border-purple-100 dark:border-purple-500/10" />
                  <div className="h-32 rounded-xl bg-gradient-to-br from-emerald-50 to-white dark:from-emerald-900/20 dark:to-transparent border border-emerald-100 dark:border-emerald-500/10" />
                  <div className="col-span-1 md:col-span-2 h-64 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/5" />
                  <div className="col-span-1 h-64 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/5" />
                </div>

                {/* Overlay Text */}
                <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-t from-white/80 via-transparent to-transparent dark:from-black/80 dark:via-transparent z-10 pointer-events-none">
                  <p className="translate-y-20 text-sm font-medium text-gray-500 dark:text-gray-400 tracking-widest uppercase">
                    Dashboard Preview
                  </p>
                </div>
              </div>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* --- FEATURES SECTION --- */}
      {/* UBAH: Background dibuat Glassmorphism (semi-transparan) agar gradasi utama terlihat */}
      <section className="py-24 bg-white/30 dark:bg-black/20 backdrop-blur-lg border-y border-white/50 dark:border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <FadeIn>
              <h2 className="text-base font-semibold text-blue-600 dark:text-blue-400 tracking-wide uppercase">
                Features
              </h2>
              <p className="mt-2 text-3xl font-extrabold text-gray-900 dark:text-white sm:text-4xl">
                Everything you need to secure your data.
              </p>
            </FadeIn>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <FeatureCard
              delay={0.1}
              icon={<ShieldCheckIcon className="w-8 h-8 text-emerald-500" />}
              title="Bank-Grade Security"
              desc="Your passwords are encrypted using industry-standard algorithms. Only you hold the keys."
            />
            <FeatureCard
              delay={0.2}
              icon={<ChartBarIcon className="w-8 h-8 text-blue-500" />}
              title="Smart Analytics"
              desc="Visualize your account distribution and track your digital footprint with interactive charts."
            />
            <FeatureCard
              delay={0.3}
              icon={<BoltIcon className="w-8 h-8 text-amber-500" />}
              title="Instant Access"
              desc="Optimized for speed. Search, filter, and copy credentials in milliseconds."
            />
            <FeatureCard
              delay={0.4}
              icon={<GlobeAltIcon className="w-8 h-8 text-purple-500" />}
              title="Identity Management"
              desc="Link accounts to specific email identities. Know exactly where your data lives."
            />
            <FeatureCard
              delay={0.5}
              icon={<ArrowRightIcon className="w-8 h-8 text-rose-500" />}
              title="Import & Export"
              desc="Your data is yours. Easily backup to Excel or restore from previous archives."
            />
            <FeatureCard
              delay={0.6}
              icon={<DevicePhoneMobileIcon className="w-8 h-8 text-cyan-500" />}
              title="Responsive Design"
              desc="Access your vault from any device. Fully optimized for desktop, tablet, and mobile."
            />
          </div>
        </div>
      </section>

      {/* --- TECH STACK --- */}
      {/* UBAH: Background transparan agar menyatu dengan gradasi bawah */}
      <section className="py-16 bg-transparent">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <FadeIn>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-8 tracking-widest">
              POWERED BY MODERN TECHNOLOGY
            </p>
            <div className="flex flex-wrap justify-center gap-8 md:gap-16 opacity-60 grayscale hover:grayscale-0 transition-all duration-500">
              <span className="text-xl font-bold text-gray-900 dark:text-white">
                Next.js 16
              </span>
              <span className="text-xl font-bold text-cyan-500">
                Tailwind 4
              </span>
              <span className="text-xl font-bold text-indigo-500">Prisma</span>
              <span className="text-xl font-bold text-green-500">
                PostgreSQL
              </span>
              <span className="text-xl font-bold text-pink-500">
                Framer Motion
              </span>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* --- CTA SECTION --- */}
      <section className="py-24 relative overflow-hidden">
        {/* Background CTA dengan gradasi biru yang kuat tapi tetap smooth */}
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-900 dark:to-indigo-900 opacity-90"></div>
        <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:20px_20px]"></div>

        <div className="relative max-w-4xl mx-auto px-4 text-center z-10">
          <FadeIn>
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-6 drop-shadow-md">
              Ready to take control?
            </h2>
            <p className="text-blue-100 text-lg mb-10 max-w-2xl mx-auto">
              Join the new standard of personal account management. Open source,
              secure, and built for developers.
            </p>
            <Link
              href="/dashboard"
              className="inline-block px-10 py-4 bg-white text-blue-600 font-bold rounded-full shadow-xl hover:shadow-2xl hover:-translate-y-1 hover:bg-gray-50 transition-all duration-300">
              Start Managing Now
            </Link>
          </FadeIn>
        </div>
      </section>
    </div>
  );
}

// --- SUB COMPONENT: Feature Card ---
function FeatureCard({
  icon,
  title,
  desc,
  delay,
}: {
  icon: React.ReactNode;
  title: string;
  desc: string;
  delay: number;
}) {
  return (
    <FadeIn delay={delay} className="h-full">
      {/* Kartu dengan background putih transparan agar blend dengan gradasi halaman */}
      <div className="h-full p-8 rounded-2xl bg-white/60 dark:bg-gray-800/40 backdrop-blur-sm border border-white/50 dark:border-white/10 hover:border-blue-400/50 dark:hover:border-blue-400/50 transition-all shadow-sm hover:shadow-lg hover:-translate-y-1">
        <div className="mb-5 p-3 bg-white dark:bg-gray-900 rounded-xl w-fit shadow-sm ring-1 ring-black/5">
          {icon}
        </div>
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
          {title}
        </h3>
        <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
          {desc}
        </p>
      </div>
    </FadeIn>
  );
}
