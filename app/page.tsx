"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, type Variants } from "framer-motion";
import { ArrowRight, Mic, Radio, Film, Play, Pause } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SoundBars from "@/components/SoundBars";
import AudioPlayer from "@/components/AudioPlayer";
import LogoMarquee from "@/components/LogoMarquee";

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

// Play a preview clip directly from the hero
function HeroPlayButton() {
  const [playing, setPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  function toggle() {
    const a = audioRef.current;
    if (!a) return;
    if (playing) {
      a.pause();
      setPlaying(false);
    } else {
      a.play().then(() => setPlaying(true)).catch(() => {});
    }
  }

  return (
    <>
      <audio
        ref={audioRef}
        src="https://voice123.com/samples/Voice123%20-%20Trailers%20-%20Mark%20Aston.mp3"
        onEnded={() => setPlaying(false)}
        preload="none"
      />
      <button
        onClick={toggle}
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "10px",
          padding: "13px 22px",
          fontFamily: "var(--font-inter)",
          fontSize: "11px",
          fontWeight: 600,
          letterSpacing: "0.14em",
          textTransform: "uppercase" as const,
          color: "white",
          background: "var(--purple)",
          border: "none",
          cursor: "pointer",
          borderRadius: 0,
        }}
      >
        {playing ? (
          <>
            <Pause size={14} fill="white" />
            Playing...
          </>
        ) : (
          <>
            <Play size={14} fill="white" />
            Hear the Voice
          </>
        )}
      </button>
    </>
  );
}

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
        <section style={{ background: "var(--bg-base)", minHeight: "100vh", display: "flex", flexDirection: "column", position: "relative", overflow: "hidden" }}>

          {/* Text + photo */}
          <div style={{ flex: 1, padding: "clamp(100px, 14vh, 140px) clamp(24px, 5vw, 72px) clamp(32px, 5vh, 56px)", position: "relative" }}>

            {/* Eyebrow */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6 }}
              style={{ fontFamily: "var(--font-inter)", fontSize: "11px", fontWeight: 600, letterSpacing: "0.25em", textTransform: "uppercase", color: "var(--purple-light)", marginBottom: "clamp(20px, 4vh, 40px)" }}
            >
              SAG-AFTRA · Atlanta, GA
            </motion.p>

            {/* Name — MASSIVE */}
            <motion.h1
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.08 }}
              style={{ lineHeight: 0.88, marginBottom: "clamp(24px, 4vh, 40px)" }}
            >
              <span style={{ display: "block", fontFamily: "var(--font-playfair)", fontSize: "clamp(72px, 15vw, 200px)", fontWeight: 900, color: "#ffffff", letterSpacing: "-0.025em" }}>Mark</span>
              <span style={{ display: "block", fontFamily: "var(--font-playfair)", fontSize: "clamp(72px, 15vw, 200px)", fontWeight: 900, color: "var(--purple)", letterSpacing: "-0.025em" }}>Aston</span>
            </motion.h1>

            {/* Tagline */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.22 }}
              style={{ fontFamily: "var(--font-inter)", fontSize: "11px", fontWeight: 600, letterSpacing: "0.22em", textTransform: "uppercase", color: "var(--text-muted)" }}
            >
              Powerful · Versatile · Unforgettable
            </motion.p>

            {/* Photo — absolute bottom-right, hidden on small screens */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1, delay: 0.3 }}
              className="hidden sm:block"
              style={{ position: "absolute", right: "clamp(24px, 5vw, 72px)", bottom: 0, width: "clamp(150px, 18vw, 260px)" }}
            >
              <div style={{ position: "relative", width: "100%", paddingBottom: "140%", overflow: "hidden" }}>
                <Image
                  src="/images/mark-aston-v2.jpg"
                  alt="Mark Aston"
                  fill
                  style={{ objectFit: "cover", objectPosition: "top center" }}
                  sizes="260px"
                  priority
                />
                {/* Gradient fade at bottom so it blends into sound bars */}
                <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: "60%", background: "linear-gradient(to bottom, transparent, var(--bg-base))", pointerEvents: "none" }} />
              </div>
              {/* Small animated bars alongside photo */}
              <div style={{ position: "absolute", left: "-14px", top: "30%", display: "flex", flexDirection: "column", gap: "3px", width: "8px", height: "64px" }}>
                {Array.from({ length: 6 }).map((_, i) => (
                  <div
                    key={i}
                    style={{
                      flex: 1,
                      background: "var(--purple)",
                      opacity: 0.4 + (i % 3) * 0.18,
                      animation: `soundBar ${0.7 + i * 0.14}s ease-in-out ${i * 0.1}s infinite`,
                    }}
                  />
                ))}
              </div>
            </motion.div>
          </div>

          {/* Sound bars — full bleed */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1.2, delay: 0.4 }}
            style={{ width: "100%", height: "clamp(120px, 18vh, 200px)", flexShrink: 0 }}
          >
            <SoundBars count={60} className="h-full w-full" color="#E87722" minOpacity={0.18} maxOpacity={0.72} />
          </motion.div>

          {/* Bottom stats + CTA strip */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            style={{ borderTop: "1px solid var(--border)", padding: "clamp(20px, 3vh, 28px) clamp(24px, 5vw, 72px) clamp(32px, 5vh, 48px)", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "20px" }}
          >
            {/* Stats */}
            <div style={{ display: "flex", gap: "clamp(20px, 4vw, 48px)", flexWrap: "wrap" }}>
              {stats.map((stat) => (
                <div key={stat.label}>
                  <p style={{ fontFamily: "var(--font-playfair)", fontSize: "clamp(22px, 2.5vw, 32px)", fontWeight: 900, color: "white", lineHeight: 1 }}>{stat.value}</p>
                  <p style={{ fontFamily: "var(--font-inter)", fontSize: "9px", fontWeight: 600, color: "var(--text-muted)", letterSpacing: "0.18em", textTransform: "uppercase", marginTop: "3px" }}>{stat.label}</p>
                </div>
              ))}
            </div>

            {/* CTAs */}
            <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
              <HeroPlayButton />
              <Link
                href="/contact"
                style={{ display: "inline-flex", alignItems: "center", gap: "8px", padding: "13px 22px", fontFamily: "var(--font-inter)", fontSize: "11px", fontWeight: 600, letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--text-secondary)", border: "1px solid var(--border-subtle)", textDecoration: "none" }}
              >
                Book a Session
              </Link>
            </div>
          </motion.div>
        </section>

        {/* ─── CREDITS MARQUEE ─── */}
        <section style={{ background: "var(--bg-surface)", borderTop: "1px solid var(--border-subtle)", borderBottom: "1px solid var(--border-subtle)", padding: "clamp(40px, 6vw, 64px) 0" }}>
          <p
            style={{ textAlign: "center", fontFamily: "var(--font-inter)", fontSize: "10px", fontWeight: 600, letterSpacing: "0.28em", textTransform: "uppercase", color: "var(--text-muted)", marginBottom: "32px" }}
          >
            Credits include
          </p>
          <LogoMarquee />
        </section>

        {/* ─── DEMOS ─── */}
        <section style={{ background: "var(--bg-base)", padding: "clamp(72px, 10vw, 120px) clamp(24px, 5vw, 72px)" }}>
          <div style={{ maxWidth: "900px", margin: "0 auto" }}>
            <motion.p
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              style={{ fontFamily: "var(--font-inter)", fontSize: "10px", fontWeight: 600, letterSpacing: "0.28em", textTransform: "uppercase", color: "var(--purple-light)", marginBottom: "16px" }}
            >
              Voice Demos
            </motion.p>
            <motion.h2
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              style={{ fontFamily: "var(--font-playfair)", fontSize: "clamp(40px, 7vw, 88px)", fontWeight: 900, color: "white", lineHeight: 0.92, letterSpacing: "-0.03em", marginBottom: "20px" }}
            >
              Hear the{" "}
              <em style={{ fontStyle: "normal", color: "var(--purple)" }}>Voice</em>
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              style={{ fontFamily: "var(--font-inter)", fontSize: "15px", lineHeight: 1.75, color: "var(--text-secondary)", maxWidth: "480px" }}
            >
              Commercial. Narration. Character. Promo. Twenty years of work for the networks and brands you know.
            </motion.p>
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.18 }}
              style={{ display: "flex", alignItems: "center", marginBottom: "48px" }}
            >
              <Link
                href="/demos"
                style={{ color: "var(--purple-light)", fontSize: "12px", fontWeight: 600, letterSpacing: "0.14em", textTransform: "uppercase", textDecoration: "none", display: "inline-flex", alignItems: "center", gap: "6px", marginTop: "20px" }}
              >
                All demos <ArrowRight size={13} />
              </Link>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <AudioPlayer />
            </motion.div>
          </div>
        </section>

        {/* ─── SERVICES (editorial numbered list) ─── */}
        <section style={{ background: "var(--bg-surface)", borderTop: "1px solid var(--border-subtle)", padding: "clamp(72px, 10vw, 120px) clamp(24px, 5vw, 72px)" }}>
          <div style={{ maxWidth: "960px", margin: "0 auto" }}>
            {/* Header row */}
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: "24px", marginBottom: "clamp(48px, 6vw, 72px)" }}>
              <div>
                <motion.p
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true }}
                  style={{ fontFamily: "var(--font-inter)", fontSize: "10px", fontWeight: 600, letterSpacing: "0.28em", textTransform: "uppercase", color: "var(--purple-light)", marginBottom: "12px" }}
                >
                  What I Do
                </motion.p>
                <motion.h2
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  style={{ fontFamily: "var(--font-playfair)", fontSize: "clamp(36px, 5vw, 64px)", fontWeight: 900, color: "white", lineHeight: 0.95, letterSpacing: "-0.02em" }}
                >
                  Services
                </motion.h2>
              </div>
              <motion.div
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                style={{ paddingTop: "4px" }}
              >
                <Link
                  href="/contact"
                  style={{ display: "inline-flex", alignItems: "center", gap: "8px", padding: "13px 22px", fontFamily: "var(--font-inter)", fontSize: "11px", fontWeight: 600, letterSpacing: "0.14em", textTransform: "uppercase", color: "white", background: "var(--purple)", textDecoration: "none" }}
                >
                  Book Now <ArrowRight size={13} />
                </Link>
              </motion.div>
            </div>

            {/* Numbered list */}
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
                  style={{ display: "grid", gridTemplateColumns: "clamp(48px, 6vw, 80px) 1fr", gap: "clamp(16px, 3vw, 40px)", alignItems: "start", padding: "clamp(28px, 4vw, 44px) 0", borderTop: "1px solid var(--border-subtle)" }}
                >
                  <span style={{ fontFamily: "var(--font-playfair)", fontSize: "clamp(28px, 4vw, 48px)", fontWeight: 900, color: "var(--text-muted)", lineHeight: 1, opacity: 0.5 }}>
                    0{i + 1}
                  </span>

                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "10px" }}>
                      <Icon size={16} style={{ color: "var(--purple)", flexShrink: 0 }} />
                      <h3 style={{ fontFamily: "var(--font-playfair)", fontSize: "clamp(20px, 2.5vw, 30px)", fontWeight: 700, color: "white", lineHeight: 1.1 }}>{service.title}</h3>
                    </div>
                    <p style={{ fontFamily: "var(--font-inter)", fontSize: "14px", lineHeight: 1.75, color: "var(--text-secondary)", maxWidth: "480px", marginBottom: "14px" }}>{service.description}</p>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                      {service.tags.map((tag) => (
                        <span
                          key={tag}
                          style={{ fontFamily: "var(--font-inter)", fontSize: "9px", fontWeight: 600, letterSpacing: "0.12em", textTransform: "uppercase", padding: "4px 10px", border: "1px solid var(--border)", color: "var(--text-muted)" }}
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </motion.div>
              );
            })}
            <div style={{ borderTop: "1px solid var(--border-subtle)" }} />
          </div>
        </section>

        {/* ─── CTA ─── */}
        <section style={{ background: "var(--bg-base)", borderTop: "1px solid var(--border)", padding: "clamp(80px, 12vw, 160px) clamp(24px, 5vw, 72px)" }}>
          <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
            <motion.p
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              style={{ fontFamily: "var(--font-inter)", fontSize: "10px", fontWeight: 600, letterSpacing: "0.28em", textTransform: "uppercase", color: "var(--purple-light)", marginBottom: "20px" }}
            >
              Ready to Work Together?
            </motion.p>
            <motion.h2
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              style={{ fontFamily: "var(--font-playfair)", fontSize: "clamp(44px, 8vw, 110px)", fontWeight: 900, color: "white", lineHeight: 0.9, letterSpacing: "-0.035em", marginBottom: "clamp(36px, 5vw, 60px)", maxWidth: "800px" }}
            >
              Let&apos;s make something unforgettable.
            </motion.h2>
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.15 }}
              style={{ display: "flex", gap: "14px", flexWrap: "wrap" }}
            >
              <Link
                href="/contact"
                style={{ display: "inline-flex", alignItems: "center", gap: "10px", padding: "16px 32px", fontFamily: "var(--font-inter)", fontSize: "11px", fontWeight: 700, letterSpacing: "0.16em", textTransform: "uppercase", color: "white", background: "var(--purple)", textDecoration: "none" }}
              >
                Book a Session <ArrowRight size={14} />
              </Link>
              <Link
                href="/demos"
                style={{ display: "inline-flex", alignItems: "center", gap: "10px", padding: "16px 32px", fontFamily: "var(--font-inter)", fontSize: "11px", fontWeight: 700, letterSpacing: "0.16em", textTransform: "uppercase", color: "var(--text-secondary)", border: "1px solid var(--border)", textDecoration: "none" }}
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
