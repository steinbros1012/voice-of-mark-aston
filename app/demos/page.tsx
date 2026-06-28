"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Mail } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import AudioPlayer from "@/components/AudioPlayer";
import VideoShowcase from "@/components/VideoShowcase";

export default function DemosPage() {
  return (
    <>
      <Navbar />
      <main className="flex-1 pt-20" style={{ background: "var(--bg-base)" }}>
        {/* Header */}
        <section
          className="py-20 sm:py-28 relative overflow-hidden"
          style={{
            background: "var(--bg-surface)",
            borderBottom: "1px solid var(--border)",
          }}
        >
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                "radial-gradient(ellipse 70% 60% at 0% 50%, rgba(107,63,160,0.14) 0%, transparent 65%)",
            }}
          />
          <div className="relative max-w-7xl mx-auto px-6 lg:px-8">
            <div className="max-w-2xl">
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
                className="text-[10px] font-semibold uppercase tracking-[0.28em] mb-4"
                style={{ color: "var(--purple-light)" }}
              >
                Voice Demos
              </motion.p>
              <motion.h1
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="text-4xl sm:text-5xl font-bold text-white tracking-tight mb-6 leading-tight"
                style={{ fontFamily: "var(--font-playfair)" }}
              >
                Hear the{" "}
                <em
                  className="not-italic font-normal"
                  style={{ color: "var(--purple-light)" }}
                >
                  voice
                </em>
              </motion.h1>
              <motion.p
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="text-base leading-relaxed"
                style={{ color: "var(--text-secondary)" }}
              >
                Audio demos across commercial, promo, imaging, and trailer
                work — plus video reels from real broadcast productions.
              </motion.p>
            </div>
          </div>
        </section>

        {/* Player */}
        <section className="py-20 sm:py-28">
          <div className="max-w-3xl mx-auto px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.15 }}
            >
              <AudioPlayer />
            </motion.div>
          </div>
        </section>

        {/* Video Showcase */}
        <section
          className="py-20 sm:py-28"
          style={{
            background: "var(--bg-surface)",
            borderTop: "1px solid var(--border)",
          }}
        >
          <div className="max-w-7xl mx-auto px-6 lg:px-8">
            <div className="mb-12">
              <motion.p
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                className="text-[10px] font-semibold uppercase tracking-[0.28em] mb-3"
                style={{ color: "var(--purple-light)" }}
              >
                Broadcast Work
              </motion.p>
              <motion.h2
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className="text-3xl sm:text-4xl font-bold text-white tracking-tight"
                style={{ fontFamily: "var(--font-playfair)" }}
              >
                See the work in action
              </motion.h2>
            </div>
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              <VideoShowcase />
            </motion.div>
          </div>
        </section>

        {/* Contact CTA */}
        <section
          className="py-16 sm:py-20"
          style={{
            background: "var(--bg-surface)",
            borderTop: "1px solid var(--border)",
          }}
        >
          <div className="max-w-4xl mx-auto px-6 lg:px-8 text-center">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="flex flex-col items-center"
            >
              <div
                className="w-12 h-12 rounded-full flex items-center justify-center mb-6"
                style={{ background: "rgba(147,97,202,0.1)" }}
              >
                <Mail size={20} style={{ color: "var(--purple-light)" }} />
              </div>
              <h2
                className="text-2xl sm:text-3xl font-bold text-white tracking-tight mb-4"
                style={{ fontFamily: "var(--font-playfair)" }}
              >
                Ready to work together?
              </h2>
              <p
                className="text-base leading-relaxed max-w-md mb-8"
                style={{ color: "var(--text-secondary)" }}
              >
                Union quality, fast turnaround. Mark typically delivers within
                the hour. Get in touch to start your project.
              </p>
              <Link
                href="/contact"
                className="px-8 py-3.5 rounded-full text-sm font-semibold text-white transition-all hover:opacity-85"
                style={{ background: "var(--purple)" }}
              >
                Book a Session
              </Link>
            </motion.div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
