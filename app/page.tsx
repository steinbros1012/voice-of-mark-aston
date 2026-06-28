"use client";

import Image from "next/image";
import Link from "next/link";
import { motion, type Variants } from "framer-motion";
import { ArrowRight, Mic, Radio, Film } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SoundBars from "@/components/SoundBars";
import AudioPlayer from "@/components/AudioPlayer";

const clients = [
  "CBS",
  "MTV",
  "Coca-Cola",
  "Six Flags",
  "Disney",
  "Warner Bros.",
  "Pepsi",
  "Walmart",
];

const services = [
  {
    icon: Radio,
    title: "Commercial & Broadcast",
    description:
      "TV and radio spots, network promos, and imaging for the brands people actually know.",
    tags: ["TV Spot", "Radio", "Imaging", "Promo"],
  },
  {
    icon: Mic,
    title: "Narration & Documentary",
    description:
      "Corporate narration, documentary, e-learning, and audiobooks.",
    tags: ["Documentary", "Corporate", "E-Learning", "Audiobook"],
  },
  {
    icon: Film,
    title: "Character & Animation",
    description:
      "Animation and video games to theme park attractions, dynamic characters.",
    tags: ["Animation", "Video Game", "Theme Park"],
  },
];

const stats = [
  { value: "20+", label: "Years experience" },
  { value: "SAG", label: "AFTRA union member" },
  { value: "24hr", label: "Standard turnaround" },
  { value: "100+", label: "Brands served" },
];

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.09, duration: 0.55, ease: "easeOut" },
  }),
};

export default function HomePage() {
  return (
    <>
      <Navbar />
      <main className="flex-1">
        {/* ─── HERO ─── */}
        <section
          className="relative min-h-screen flex items-center overflow-hidden"
          style={{ background: "var(--bg-base)" }}
        >
          {/* Radial purple glow */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                "radial-gradient(ellipse 90% 55% at 30% 0%, rgba(107,63,160,0.18) 0%, transparent 65%)",
            }}
          />

          {/* Animated sound bars — decorative background layer */}
          <div
            className="absolute bottom-0 left-0 right-0 h-48 pointer-events-none"
            style={{ opacity: 0.25 }}
          >
            <SoundBars count={60} className="h-full w-full" />
          </div>

          <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8 w-full pt-28 pb-24">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
              {/* Text column */}
              <div>
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                  className="flex items-center gap-3 mb-8"
                >
                  <span
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-semibold uppercase tracking-[0.18em]"
                    style={{
                      border: "1px solid rgba(147,97,202,0.3)",
                      color: "var(--purple-light)",
                      background: "rgba(147,97,202,0.07)",
                    }}
                  >
                    <span
                      className="w-1.5 h-1.5 rounded-full"
                      style={{
                        background: "var(--purple)",
                        animation: "pulseRing 2s ease-out infinite",
                      }}
                    />
                    SAG-AFTRA Talent
                  </span>
                  <span
                    className="text-xs"
                    style={{ color: "var(--text-muted)" }}
                  >
                    Atlanta, GA
                  </span>
                </motion.div>

                <motion.p
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.07 }}
                  className="text-xs font-semibold uppercase tracking-[0.32em] mb-3"
                  style={{ color: "var(--purple-light)" }}
                >
                  The Voice Of
                </motion.p>

                <motion.h1
                  initial={{ opacity: 0, y: 24 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.7, delay: 0.12 }}
                  className="text-[clamp(4rem,10vw,7rem)] font-bold text-white leading-[0.92] tracking-tight mb-8"
                  style={{ fontFamily: "var(--font-playfair)" }}
                >
                  Mark<br />
                  <em
                    className="not-italic font-normal"
                    style={{ color: "var(--purple-light)" }}
                  >
                    Aston
                  </em>
                </motion.h1>

                <motion.p
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                  className="text-base leading-relaxed max-w-md mb-10"
                  style={{ color: "var(--text-secondary)" }}
                >
                  Twenty years of union voice work for CBS, Disney, Coca-Cola,
                  and dozens of the world&apos;s most recognized brands.
                </motion.p>

                <motion.div
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.28 }}
                  className="flex flex-wrap gap-3"
                >
                  <Link
                    href="/demos"
                    className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full text-sm font-semibold text-white transition-all hover:opacity-85"
                    style={{ background: "var(--purple)" }}
                  >
                    Listen to Demos
                    <ArrowRight size={15} />
                  </Link>
                  <Link
                    href="/contact"
                    className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full text-sm font-semibold transition-all hover:bg-white/5"
                    style={{
                      border: "1.5px solid rgba(147,97,202,0.3)",
                      color: "var(--text-secondary)",
                    }}
                  >
                    Book a Session
                  </Link>
                </motion.div>
              </div>

              {/* Photo column */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.18 }}
                className="flex justify-center lg:justify-end"
              >
                <div className="relative">
                  {/* Ambient glow behind photo */}
                  <div
                    className="absolute -inset-10 rounded-full blur-3xl pointer-events-none"
                    style={{
                      background: "var(--purple)",
                      opacity: 0.12,
                    }}
                  />

                  {/* Photo */}
                  <div
                    className="relative w-[300px] h-[380px] sm:w-[340px] sm:h-[430px] rounded-2xl overflow-hidden"
                    style={{
                      boxShadow:
                        "0 40px 80px rgba(0,0,0,0.55), 0 0 0 1px rgba(147,97,202,0.18)",
                    }}
                  >
                    <Image
                      src="/images/mark-aston.jpg"
                      alt="Mark Aston, Voice Over Actor"
                      fill
                      className="object-cover object-top"
                      priority
                      sizes="(max-width: 640px) 300px, 340px"
                    />
                  </div>

                  {/* Equalizer bars alongside photo */}
                  <div
                    className="absolute -right-5 top-1/2 -translate-y-1/2 flex flex-col gap-1"
                    style={{ width: "12px", height: "120px" }}
                  >
                    {Array.from({ length: 7 }).map((_, i) => (
                      <div
                        key={i}
                        className="rounded-full flex-1 origin-bottom"
                        style={{
                          background: "var(--purple-light)",
                          opacity: 0.25 + (i % 3) * 0.12,
                          animation: `soundBar ${0.85 + i * 0.17}s ease-in-out ${i * 0.11}s infinite`,
                        }}
                      />
                    ))}
                  </div>

                  {/* SAG-AFTRA badge */}
                  <div
                    className="absolute -bottom-4 -left-4 rounded-xl px-4 py-3"
                    style={{
                      background: "var(--bg-card)",
                      border: "1px solid var(--border)",
                      boxShadow: "0 8px 24px rgba(0,0,0,0.4)",
                    }}
                  >
                    <p
                      className="text-[9px] font-semibold uppercase tracking-[0.14em]"
                      style={{ color: "var(--text-muted)" }}
                    >
                      Union Member
                    </p>
                    <p className="text-sm font-bold text-white">SAG-AFTRA</p>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>

          {/* Bottom fade into next section */}
          <div
            className="absolute bottom-0 left-0 right-0 h-28 pointer-events-none"
            style={{
              background:
                "linear-gradient(to bottom, transparent, var(--bg-surface))",
            }}
          />
        </section>

        {/* ─── STATS BAR ─── */}
        <section
          style={{
            background: "var(--bg-surface)",
            borderBottom: "1px solid var(--border)",
          }}
        >
          <div className="max-w-7xl mx-auto px-6 lg:px-8 py-10">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {stats.map((stat, i) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 12 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.08 }}
                  className="text-center"
                >
                  <p
                    className="text-2xl sm:text-3xl font-bold text-white mb-1"
                    style={{ fontFamily: "var(--font-playfair)" }}
                  >
                    {stat.value}
                  </p>
                  <p
                    className="text-[10px] uppercase tracking-[0.14em]"
                    style={{ color: "var(--text-muted)" }}
                  >
                    {stat.label}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ─── CLIENT LOGOS ─── */}
        <section
          style={{ background: "var(--bg-base)" }}
          className="py-16"
        >
          <div className="max-w-7xl mx-auto px-6 lg:px-8">
            <motion.p
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="text-center text-[10px] font-semibold uppercase tracking-[0.28em] mb-10"
              style={{ color: "var(--text-muted)" }}
            >
              Clients include
            </motion.p>
            <div className="flex flex-wrap items-center justify-center gap-8 sm:gap-12 lg:gap-16">
              {clients.map((client, i) => (
                <motion.span
                  key={client}
                  custom={i}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                  variants={fadeUp}
                  className="text-base sm:text-lg font-bold tracking-tight transition-all duration-300 hover:opacity-60"
                  style={{ color: "rgba(147,97,202,0.32)" }}
                >
                  {client}
                </motion.span>
              ))}
            </div>
          </div>
        </section>

        {/* ─── FEATURED DEMO PLAYER ─── */}
        <section
          className="py-20 sm:py-28"
          style={{
            background: "var(--bg-surface)",
            borderTop: "1px solid var(--border)",
          }}
        >
          <div className="max-w-7xl mx-auto px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-14 lg:gap-20 items-start">
              {/* Left — copy */}
              <div className="lg:sticky lg:top-24">
                <motion.p
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true }}
                  className="text-[10px] font-semibold uppercase tracking-[0.28em] mb-4"
                  style={{ color: "var(--purple-light)" }}
                >
                  Voice Demos
                </motion.p>
                <motion.h2
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  className="text-4xl sm:text-5xl font-bold text-white leading-tight mb-6"
                  style={{ fontFamily: "var(--font-playfair)" }}
                >
                  Hear the{" "}
                  <em
                    className="not-italic font-normal"
                    style={{ color: "var(--purple-light)" }}
                  >
                    voice
                  </em>
                </motion.h2>
                <motion.p
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.1 }}
                  className="text-base leading-relaxed max-w-sm mb-8"
                  style={{ color: "var(--text-secondary)" }}
                >
                  Commercial. Narration. Character. Promo. Browse every category
                  and find the right sound for your project.
                </motion.p>
                <motion.div
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.18 }}
                >
                  <Link
                    href="/demos"
                    className="inline-flex items-center gap-1.5 text-sm font-semibold transition-colors hover:opacity-70"
                    style={{ color: "var(--purple-light)" }}
                  >
                    All demos <ArrowRight size={14} />
                  </Link>
                </motion.div>
              </div>

              {/* Right — audio player */}
              <motion.div
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
              >
                <AudioPlayer />
              </motion.div>
            </div>
          </div>
        </section>

        {/* ─── SERVICES ─── */}
        <section
          style={{ background: "var(--bg-base)" }}
          className="py-20 sm:py-28"
        >
          <div className="max-w-7xl mx-auto px-6 lg:px-8">
            <div className="text-center mb-16">
              <motion.p
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                className="text-[10px] font-semibold uppercase tracking-[0.28em] mb-4"
                style={{ color: "var(--purple-light)" }}
              >
                What I Do
              </motion.p>
              <motion.h2
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="text-3xl sm:text-4xl font-bold text-white"
                style={{ fontFamily: "var(--font-playfair)" }}
              >
                Services
              </motion.h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {services.map((service, i) => {
                const Icon = service.icon;
                return (
                  <motion.div
                    key={service.title}
                    custom={i}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true }}
                    variants={fadeUp}
                    className="p-8 rounded-2xl transition-all duration-300 hover:border-purple-500/20"
                    style={{
                      background: "var(--bg-card)",
                      border: "1px solid var(--border)",
                    }}
                  >
                    <div
                      className="w-11 h-11 rounded-xl flex items-center justify-center mb-6"
                      style={{ background: "rgba(147,97,202,0.1)" }}
                    >
                      <Icon size={20} style={{ color: "var(--purple-light)" }} />
                    </div>
                    <h3 className="text-sm font-bold text-white mb-3">
                      {service.title}
                    </h3>
                    <p
                      className="text-sm leading-relaxed mb-5"
                      style={{ color: "var(--text-secondary)" }}
                    >
                      {service.description}
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {service.tags.map((tag) => (
                        <span
                          key={tag}
                          className="text-[10px] font-medium px-2 py-0.5 rounded-full uppercase tracking-wide"
                          style={{
                            background: "rgba(147,97,202,0.07)",
                            color: "var(--text-muted)",
                            border: "1px solid rgba(147,97,202,0.1)",
                          }}
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </section>

        {/* ─── CTA ─── */}
        <section
          className="py-24 sm:py-32 relative overflow-hidden"
          style={{
            background: "var(--bg-surface)",
            borderTop: "1px solid var(--border)",
          }}
        >
          {/* Purple ambient glow */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                "radial-gradient(ellipse 55% 75% at 50% 50%, rgba(107,63,160,0.14) 0%, transparent 70%)",
            }}
          />
          <div className="relative max-w-4xl mx-auto px-6 lg:px-8 text-center">
            <motion.p
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="text-[10px] font-semibold uppercase tracking-[0.28em] mb-6"
              style={{ color: "var(--purple-light)" }}
            >
              Ready to work together?
            </motion.p>
            <motion.h2
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-4xl sm:text-5xl font-bold text-white mb-6 leading-tight"
              style={{ fontFamily: "var(--font-playfair)" }}
            >
              Let&apos;s work together
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-base leading-relaxed max-w-lg mx-auto mb-10"
              style={{ color: "var(--text-secondary)" }}
            >
              Quick turnaround. Union quality. Response within 24 hours, often
              within the hour.
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="flex flex-wrap justify-center gap-4"
            >
              <Link
                href="/contact"
                className="inline-flex items-center gap-2 px-8 py-4 rounded-full text-sm font-semibold text-white transition-all hover:opacity-85"
                style={{ background: "var(--purple)" }}
              >
                Book a Session <ArrowRight size={15} />
              </Link>
              <Link
                href="/demos"
                className="inline-flex items-center gap-2 px-8 py-4 rounded-full text-sm font-semibold transition-all hover:bg-white/5"
                style={{
                  border: "1.5px solid rgba(147,97,202,0.3)",
                  color: "var(--text-secondary)",
                }}
              >
                Hear the Demos
              </Link>
            </motion.div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
