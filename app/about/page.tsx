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
    transition: { delay: i * 0.08, duration: 0.55, ease: "easeOut" as const },
  }),
};

export default function AboutPage() {
  return (
    <>
      <Navbar />
      <main className="flex-1 pt-20">
        {/* Hero */}
        <section className="py-20 sm:py-28 bg-white">
          <div className="max-w-7xl mx-auto px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
              {/* Text */}
              <div>
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5 }}
                  className="text-xs font-semibold uppercase tracking-[0.2em] text-[#1A3A5C] mb-4"
                >
                  About Mark Aston
                </motion.p>
                <motion.h1
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.1 }}
                  className="text-4xl sm:text-5xl font-bold text-[#111111] tracking-tight mb-8 leading-tight"
                >
                  A voice you<br />
                  <span className="italic font-serif font-normal text-[#1A3A5C]">won&apos;t forget.</span>
                </motion.h1>
                <motion.div
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                  className="space-y-5 text-base text-[#444444] leading-relaxed"
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
                    Quick turnaround is standard — delivery within one day, and
                    often within the hour.
                  </p>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.35 }}
                  className="mt-8 flex items-center gap-4"
                >
                  <div className="flex items-center gap-2 px-4 py-2 bg-[#F7F7F7] border border-[#E5E5E5] rounded-full">
                    <span className="w-2 h-2 rounded-full bg-[#1A3A5C]" />
                    <span className="text-xs font-semibold uppercase tracking-[0.15em] text-[#1A3A5C]">
                      SAG-AFTRA
                    </span>
                  </div>
                  <div className="flex items-center gap-2 px-4 py-2 bg-[#F7F7F7] border border-[#E5E5E5] rounded-full">
                    <span className="w-2 h-2 rounded-full bg-[#6B7280]" />
                    <span className="text-xs font-semibold uppercase tracking-[0.15em] text-[#6B7280]">
                      Member Since 2005
                    </span>
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.45 }}
                  className="mt-8"
                >
                  <Link
                    href="/contact"
                    className="inline-flex px-8 py-3.5 rounded-full bg-[#1A3A5C] text-white font-semibold text-sm hover:bg-[#2B5C8A] transition-colors"
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
                <div className="relative w-[320px] h-[400px] sm:w-[380px] sm:h-[460px]">
                  <Image
                    src="/images/mark-aston.jpg"
                    alt="Mark Aston, Voice Over Actor"
                    fill
                    className="object-cover object-top rounded-2xl"
                    sizes="(max-width: 640px) 320px, 380px"
                  />
                  <div className="absolute inset-0 rounded-2xl ring-1 ring-black/10" />
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Capabilities */}
        <section className="py-20 sm:py-28 bg-[#F7F7F7] border-y border-[#E5E5E5]">
          <div className="max-w-7xl mx-auto px-6 lg:px-8">
            <div className="max-w-3xl mx-auto">
              <motion.p
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                className="text-xs font-semibold uppercase tracking-[0.2em] text-[#1A3A5C] mb-3"
              >
                Services
              </motion.p>
              <motion.h2
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className="text-3xl sm:text-4xl font-bold text-[#111111] tracking-tight mb-12"
              >
                Full range of voice capabilities
              </motion.h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {capabilities.map((item, i) => (
                  <motion.div
                    key={item}
                    custom={i}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true }}
                    variants={fadeUp}
                    className="flex items-center gap-3 bg-white border border-[#E5E5E5] rounded-xl px-5 py-4 shadow-sm"
                  >
                    <CheckCircle2 size={18} className="text-[#1A3A5C] flex-shrink-0" />
                    <span className="text-sm font-medium text-[#111111]">{item}</span>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Voice Qualities */}
        <section className="py-20 sm:py-28 bg-white">
          <div className="max-w-7xl mx-auto px-6 lg:px-8">
            <div className="text-center mb-16">
              <motion.p
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                className="text-xs font-semibold uppercase tracking-[0.2em] text-[#1A3A5C] mb-3"
              >
                The Voice
              </motion.p>
              <motion.h2
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className="text-3xl sm:text-4xl font-bold text-[#111111] tracking-tight"
              >
                How people describe it
              </motion.h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {qualities.map((q, i) => (
                <motion.div
                  key={q.word}
                  custom={i}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                  variants={fadeUp}
                  className="bg-[#F7F7F7] border border-[#E5E5E5] rounded-2xl p-7"
                >
                  <h3 className="text-2xl font-bold text-[#1A3A5C] mb-2 tracking-tight">
                    {q.word}
                  </h3>
                  <p className="text-sm text-[#6B7280] leading-relaxed">
                    {q.desc}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-20 sm:py-28 bg-[#1A3A5C]">
          <div className="max-w-4xl mx-auto px-6 lg:px-8 text-center">
            <motion.h2
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-3xl sm:text-4xl font-bold text-white tracking-tight mb-6"
            >
              Ready to work with Mark?
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-base text-white/70 leading-relaxed mb-10 max-w-lg mx-auto"
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
                className="px-8 py-3.5 rounded-full bg-white text-[#1A3A5C] font-semibold text-sm hover:bg-white/90 transition-colors"
              >
                Book a Session
              </Link>
              <Link
                href="/demos"
                className="px-8 py-3.5 rounded-full border-2 border-white/40 text-white font-semibold text-sm hover:bg-white/10 transition-colors"
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
