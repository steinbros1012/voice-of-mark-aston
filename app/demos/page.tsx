"use client";

import Link from "next/link";
import { motion, type Variants } from "framer-motion";
import { Play, Mail } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const demos = [
  {
    title: "Commercial Demo",
    description:
      "TV and radio spots across national brands, retail, automotive, and lifestyle.",
    tags: ["TV Spot", "Radio", "Retail", "Automotive"],
    duration: "1:30",
  },
  {
    title: "Narration Demo",
    description:
      "Corporate narration, documentary, e-learning, and audiobooks.",
    tags: ["Documentary", "Corporate", "E-Learning", "Audiobook"],
    duration: "1:45",
  },
  {
    title: "Character Demo",
    description:
      "A range of distinct character voices, from heroic leads to comedic supporting roles, villains, and everything in between.",
    tags: ["Animation", "Video Game", "Villain", "Hero"],
    duration: "1:30",
  },
  {
    title: "Animation Demo",
    description:
      "Dedicated animation showcase with voiced characters across genres — action, comedy, adventure, and children's.",
    tags: ["Kids", "Action", "Comedy", "Adventure"],
    duration: "1:15",
  },
  {
    title: "Promo & Imaging Demo",
    description:
      "Network promos, station imaging, and broadcast announcements.",
    tags: ["Network Promo", "Imaging", "Broadcast", "Announcer"],
    duration: "1:00",
  },
];

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.55, ease: "easeOut" as const },
  }),
};

export default function DemosPage() {
  return (
    <>
      <Navbar />
      <main className="flex-1 pt-20">
        {/* Header */}
        <section className="py-20 sm:py-28 bg-white border-b border-[#E5E5E5]">
          <div className="max-w-7xl mx-auto px-6 lg:px-8">
            <div className="max-w-2xl">
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
                className="text-xs font-semibold uppercase tracking-[0.2em] text-[#1A3A5C] mb-4"
              >
                Voice Demos
              </motion.p>
              <motion.h1
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="text-4xl sm:text-5xl font-bold text-[#111111] tracking-tight mb-6 leading-tight"
              >
                Hear the voice
              </motion.h1>
              <motion.p
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="text-base text-[#444444] leading-relaxed"
              >
                Five demo categories covering the full range of Mark&apos;s
                capabilities — commercial, narration, character, animation, and
                broadcast imaging. Demo files are being added shortly.
              </motion.p>
            </div>
          </div>
        </section>

        {/* Demo Cards */}
        <section className="py-20 sm:py-28 bg-[#F7F7F7]">
          <div className="max-w-7xl mx-auto px-6 lg:px-8">
            <div className="flex flex-col gap-6">
              {demos.map((demo, i) => (
                <motion.div
                  key={demo.title}
                  custom={i}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                  variants={fadeUp}
                  className="bg-white border border-[#E5E5E5] rounded-2xl p-6 sm:p-8 shadow-sm"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center gap-6">
                    {/* Play Button */}
                    <div className="flex-shrink-0">
                      <div className="w-16 h-16 rounded-full bg-[#1A3A5C]/8 border border-[#1A3A5C]/15 flex items-center justify-center">
                        <Play
                          size={22}
                          className="text-[#1A3A5C] ml-0.5"
                          fill="currentColor"
                        />
                      </div>
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-baseline gap-3 mb-2">
                        <h2 className="text-xl font-bold text-[#111111] tracking-tight">
                          {demo.title}
                        </h2>
                        <span className="text-xs font-medium text-[#9CA3AF]">
                          {demo.duration}
                        </span>
                      </div>
                      <p className="text-sm text-[#444444] leading-relaxed mb-4">
                        {demo.description}
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {demo.tags.map((tag) => (
                          <span
                            key={tag}
                            className="px-3 py-1 rounded-full bg-[#F7F7F7] border border-[#E5E5E5] text-xs font-medium text-[#6B7280]"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Coming Soon Badge */}
                    <div className="flex-shrink-0 sm:text-right">
                      <span className="inline-block px-3 py-1.5 rounded-full bg-[#F7F7F7] border border-[#E5E5E5] text-xs font-semibold uppercase tracking-[0.12em] text-[#9CA3AF]">
                        Coming Soon
                      </span>
                    </div>
                  </div>

                  {/* Waveform Placeholder */}
                  <div className="mt-6 h-12 rounded-xl bg-[#F7F7F7] border border-[#E5E5E5] flex items-center px-4 gap-1 overflow-hidden">
                    {Array.from({ length: 60 }).map((_, j) => (
                      <div
                        key={j}
                        className="flex-1 rounded-full bg-[#1A3A5C]/15"
                        style={{
                          height: `${20 + Math.sin(j * 0.8) * 12 + Math.cos(j * 0.4) * 8}px`,
                          minHeight: "4px",
                          maxHeight: "40px",
                        }}
                      />
                    ))}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Contact for Samples CTA */}
        <section className="py-20 sm:py-24 bg-white border-t border-[#E5E5E5]">
          <div className="max-w-4xl mx-auto px-6 lg:px-8 text-center">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="flex flex-col items-center"
            >
              <div className="w-14 h-14 rounded-full bg-[#1A3A5C]/8 flex items-center justify-center mb-6">
                <Mail size={22} className="text-[#1A3A5C]" />
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold text-[#111111] tracking-tight mb-4">
                Need samples now?
              </h2>
              <p className="text-base text-[#444444] leading-relaxed max-w-lg mb-8">
                Demo files are coming soon — but don&apos;t wait. Contact Mark directly
                for immediate samples tailored to your project.
              </p>
              <Link
                href="/contact"
                className="px-8 py-3.5 rounded-full bg-[#1A3A5C] text-white font-semibold text-sm hover:bg-[#2B5C8A] transition-colors"
              >
                Request Immediate Samples
              </Link>
            </motion.div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
