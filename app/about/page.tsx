"use client";

import Image from "next/image";
import Link from "next/link";
import { motion, type Variants } from "framer-motion";
import { CheckCircle2 } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const capabilities = [
  "Radio & TV Commercial",
  "Corporate Narration",
  "Documentary",
  "Character & Animation",
  "Theme Park Attractions",
  "Promo & Imaging",
  "Audiobooks",
  "IVR & Phone Systems",
];

const qualities = [
  { word: "Powerful", desc: "Commands attention from the first word." },
  { word: "Bold", desc: "Delivery that never fades into the background." },
  { word: "Versatile", desc: "Works across narration, commercial, and character work." },
  { word: "Hypnotic", desc: "Holds attention and keeps it." },
  { word: "Uplifting", desc: "Brings energy to every read." },
  { word: "Distinctive", desc: "You know it when you hear it." },
];

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.08, duration: 0.55, ease: "easeOut" },
  }),
};

export default function AboutPage() {
  return (
    <>
      <Navbar />
      <main className="flex-1 pt-20" style={{ background: "var(--bg-base)" }}>
        {/* Hero */}
        <section
          className="py-20 sm:py-28 relative overflow-hidden"
          style={{ background: "var(--bg-surface)" }}
        >
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                "radial-gradient(ellipse 60% 80% at 100% 0%, rgba(107,63,160,0.12) 0%, transparent 65%)",
            }}
          />
          <div className="relative max-w-7xl mx-auto px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
              {/* Text */}
              <div>
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5 }}
                  className="text-[10px] font-semibold uppercase tracking-[0.28em] mb-4"
                  style={{ color: "var(--purple-light)" }}
                >
                  About Mark Aston
                </motion.p>
                <motion.h1
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.1 }}
                  className="text-4xl sm:text-5xl font-bold text-white tracking-tight mb-8 leading-tight"
                  style={{ fontFamily: "var(--font-playfair)" }}
                >
                  A voice you
                  <br />
                  <em
                    className="not-italic font-normal"
                    style={{ color: "var(--purple-light)" }}
                  >
                    won&apos;t forget.
                  </em>
                </motion.h1>
                <motion.div
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                  className="space-y-5 text-base leading-relaxed mb-8"
                  style={{ color: "var(--text-secondary)" }}
                >
                  <p>
                    Mark Aston is a SAG-AFTRA voice over actor and announcer
                    based in Atlanta, Georgia. Over the past two decades, he has
                    worked with some of the most recognizable brands out there,
                    including CBS, Disney, Coca-Cola, and Walmart.
                  </p>
                  <p>
                    His voice is powerful and versatile. Whether it&apos;s a
                    30-second commercial, a feature-length documentary, or a
                    theme park experience, Mark delivers with precision and
                    consistent union-level quality.
                  </p>
                  <p>
                    Quick turnaround is the standard — delivery within one day,
                    and often within the hour.
                  </p>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.32 }}
                  className="flex items-center gap-3 mb-8"
                >
                  {[
                    { label: "SAG-AFTRA", color: "var(--purple)" },
                    { label: "Member Since 2005", color: "var(--text-muted)" },
                  ].map((badge) => (
                    <div
                      key={badge.label}
                      className="flex items-center gap-2 px-4 py-2 rounded-full"
                      style={{
                        background: "rgba(147,97,202,0.07)",
                        border: "1px solid var(--border)",
                      }}
                    >
                      <span
                        className="w-1.5 h-1.5 rounded-full"
                        style={{ background: badge.color }}
                      />
                      <span
                        className="text-[10px] font-semibold uppercase tracking-[0.14em]"
                        style={{ color: badge.color }}
                      >
                        {badge.label}
                      </span>
                    </div>
                  ))}
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.42 }}
                >
                  <Link
                    href="/contact"
                    className="inline-flex px-8 py-3.5 rounded-full text-sm font-semibold text-white transition-all hover:opacity-85"
                    style={{ background: "var(--purple)" }}
                  >
                    Book a Session
                  </Link>
                </motion.div>
              </div>

              {/* Photo */}
              <motion.div
                initial={{ opacity: 0, scale: 0.97 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.7, delay: 0.2 }}
                className="flex justify-center lg:justify-end"
              >
                <div className="relative">
                  <div
                    className="absolute -inset-8 rounded-full blur-3xl pointer-events-none"
                    style={{ background: "var(--purple)", opacity: 0.08 }}
                  />
                  <div
                    className="relative w-[300px] h-[380px] sm:w-[360px] sm:h-[440px] rounded-2xl overflow-hidden"
                    style={{
                      boxShadow:
                        "0 40px 80px rgba(0,0,0,0.5), 0 0 0 1px rgba(147,97,202,0.15)",
                    }}
                  >
                    <Image
                      src="/images/mark-aston.jpg"
                      alt="Mark Aston, Voice Over Actor"
                      fill
                      className="object-cover object-top"
                      sizes="(max-width: 640px) 300px, 360px"
                    />
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Capabilities */}
        <section className="py-20 sm:py-28" style={{ background: "var(--bg-base)" }}>
          <div className="max-w-7xl mx-auto px-6 lg:px-8">
            <div className="max-w-3xl mx-auto">
              <motion.p
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                className="text-[10px] font-semibold uppercase tracking-[0.28em] mb-3"
                style={{ color: "var(--purple-light)" }}
              >
                Services
              </motion.p>
              <motion.h2
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className="text-3xl sm:text-4xl font-bold text-white tracking-tight mb-12"
                style={{ fontFamily: "var(--font-playfair)" }}
              >
                Full range of voice capabilities
              </motion.h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {capabilities.map((item, i) => (
                  <motion.div
                    key={item}
                    custom={i}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true }}
                    variants={fadeUp}
                    className="flex items-center gap-3 rounded-xl px-5 py-4"
                    style={{
                      background: "var(--bg-card)",
                      border: "1px solid var(--border)",
                    }}
                  >
                    <CheckCircle2
                      size={17}
                      style={{ color: "var(--purple-light)", flexShrink: 0 }}
                    />
                    <span className="text-sm font-medium text-white">{item}</span>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Voice Qualities */}
        <section
          className="py-20 sm:py-28"
          style={{
            background: "var(--bg-surface)",
            borderTop: "1px solid var(--border)",
            borderBottom: "1px solid var(--border)",
          }}
        >
          <div className="max-w-7xl mx-auto px-6 lg:px-8">
            <div className="text-center mb-16">
              <motion.p
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                className="text-[10px] font-semibold uppercase tracking-[0.28em] mb-3"
                style={{ color: "var(--purple-light)" }}
              >
                The Voice
              </motion.p>
              <motion.h2
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className="text-3xl sm:text-4xl font-bold text-white tracking-tight"
                style={{ fontFamily: "var(--font-playfair)" }}
              >
                How people describe it
              </motion.h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {qualities.map((q, i) => (
                <motion.div
                  key={q.word}
                  custom={i}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                  variants={fadeUp}
                  className="p-7 rounded-2xl"
                  style={{
                    background: "var(--bg-card)",
                    border: "1px solid var(--border)",
                  }}
                >
                  <h3
                    className="text-xl font-bold mb-2"
                    style={{
                      color: "var(--purple-light)",
                      fontFamily: "var(--font-playfair)",
                    }}
                  >
                    {q.word}
                  </h3>
                  <p
                    className="text-sm leading-relaxed"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    {q.desc}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-20 sm:py-28" style={{ background: "var(--bg-base)" }}>
          <div className="max-w-4xl mx-auto px-6 lg:px-8 text-center">
            <motion.h2
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-3xl sm:text-4xl font-bold text-white tracking-tight mb-6"
              style={{ fontFamily: "var(--font-playfair)" }}
            >
              Ready to work with Mark?
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-base leading-relaxed mb-10 max-w-lg mx-auto"
              style={{ color: "var(--text-secondary)" }}
            >
              Get in touch and Mark will get back to you quickly. Union quality,
              fast turnaround, and a straightforward booking process.
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="flex flex-wrap justify-center gap-4"
            >
              <Link
                href="/contact"
                className="px-8 py-3.5 rounded-full text-sm font-semibold text-white transition-all hover:opacity-85"
                style={{ background: "var(--purple)" }}
              >
                Book a Session
              </Link>
              <Link
                href="/demos"
                className="px-8 py-3.5 rounded-full text-sm font-semibold transition-all hover:bg-white/5"
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
