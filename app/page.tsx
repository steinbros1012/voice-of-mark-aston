"use client";

import Image from "next/image";
import Link from "next/link";
import { motion, type Variants } from "framer-motion";
import { Mic, Radio, Film, ChevronRight } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const qualities = [
  "Powerful",
  "Bold",
  "Versatile",
  "Hypnotic",
  "Uplifting",
  "Distinctive",
];

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
      "TV and radio spots, network promos, and imaging. The authoritative sound brands trust to move audiences.",
  },
  {
    icon: Mic,
    title: "Narration & Documentary",
    description:
      "Corporate narration, documentary voice work, e-learning, and audiobooks delivered with clarity and depth.",
  },
  {
    icon: Film,
    title: "Character & Animation",
    description:
      "From animation and video games to theme park attractions — dynamic characters brought to life with range and precision.",
  },
];

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.6, ease: "easeOut" as const },
  }),
};

export default function HomePage() {
  return (
    <>
      <Navbar />
      <main className="flex-1">
        {/* Hero */}
        <section className="relative min-h-screen flex items-center bg-[#1A3A5C] overflow-hidden">
          {/* Background texture */}
          <div className="absolute inset-0 bg-gradient-to-br from-[#0F2440] via-[#1A3A5C] to-[#1E4A72] opacity-100" />

          <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8 w-full pt-24 pb-20">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
              {/* Text */}
              <div>
                <motion.p
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                  className="text-xs font-semibold uppercase tracking-[0.25em] text-white/60 mb-6"
                >
                  SAG-AFTRA Talent &bull; Atlanta, GA
                </motion.p>

                <motion.h1
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.65, delay: 0.1 }}
                  className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight tracking-tight mb-6"
                >
                  The Voice of<br />
                  <span className="text-white/90">Mark Aston</span>
                </motion.h1>

                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.65, delay: 0.2 }}
                  className="text-lg text-white/70 leading-relaxed max-w-md mb-10"
                >
                  Powerful. Versatile. Unforgettable. Twenty years of union
                  voice work for the world&apos;s most recognized brands.
                </motion.p>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.65, delay: 0.3 }}
                  className="flex flex-wrap gap-4"
                >
                  <Link
                    href="/demos"
                    className="px-8 py-3.5 rounded-full bg-white text-[#1A3A5C] font-semibold text-sm hover:bg-white/90 transition-colors"
                  >
                    Listen to Demos
                  </Link>
                  <Link
                    href="/contact"
                    className="px-8 py-3.5 rounded-full border-2 border-white/40 text-white font-semibold text-sm hover:bg-white/10 transition-colors"
                  >
                    Book Now
                  </Link>
                </motion.div>
              </div>

              {/* Photo */}
              <motion.div
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="flex justify-center lg:justify-end"
              >
                <div className="relative w-[340px] h-[420px] sm:w-[380px] sm:h-[460px]">
                  <div className="absolute inset-0 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20" />
                  <Image
                    src="/images/mark-aston.jpg"
                    alt="Mark Aston — Voice Over Actor"
                    fill
                    className="object-cover object-top rounded-2xl"
                    priority
                    sizes="(max-width: 640px) 340px, 380px"
                  />
                  {/* Badge */}
                  <div className="absolute -bottom-4 -right-4 bg-white rounded-xl px-4 py-3 shadow-lg">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-[#6B7280]">
                      Union Member
                    </p>
                    <p className="text-sm font-bold text-[#1A3A5C]">
                      SAG-AFTRA
                    </p>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Voice Qualities Strip */}
        <section className="bg-[#F7F7F7] border-y border-[#E5E5E5]">
          <div className="max-w-7xl mx-auto px-6 lg:px-8 py-10">
            <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-4">
              {qualities.map((q, i) => (
                <motion.span
                  key={q}
                  custom={i}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                  variants={fadeUp}
                  className="text-sm font-semibold tracking-[0.15em] uppercase text-[#1A3A5C]"
                >
                  {q}
                  {i < qualities.length - 1 && (
                    <span className="ml-8 text-[#D1D5DB]">&middot;</span>
                  )}
                </motion.span>
              ))}
            </div>
          </div>
        </section>

        {/* Services */}
        <section className="py-20 sm:py-28 bg-white">
          <div className="max-w-7xl mx-auto px-6 lg:px-8">
            <div className="text-center mb-16">
              <motion.p
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                className="text-xs font-semibold uppercase tracking-[0.2em] text-[#1A3A5C] mb-3"
              >
                What I Do
              </motion.p>
              <motion.h2
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className="text-3xl sm:text-4xl font-bold text-[#111111] tracking-tight"
              >
                Voice work built for impact
              </motion.h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
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
                    className="bg-white border border-[#E5E5E5] rounded-2xl p-8 shadow-sm hover:shadow-md transition-shadow"
                  >
                    <div className="w-12 h-12 rounded-xl bg-[#1A3A5C]/8 flex items-center justify-center mb-6">
                      <Icon size={22} className="text-[#1A3A5C]" />
                    </div>
                    <h3 className="text-lg font-bold text-[#111111] mb-3">
                      {service.title}
                    </h3>
                    <p className="text-base text-[#444444] leading-relaxed">
                      {service.description}
                    </p>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Client Logos */}
        <section className="py-20 sm:py-24 bg-[#F7F7F7] border-y border-[#E5E5E5]">
          <div className="max-w-7xl mx-auto px-6 lg:px-8 text-center">
            <motion.p
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="text-xs font-semibold uppercase tracking-[0.2em] text-[#6B7280] mb-10"
            >
              Trusted by the world&apos;s leading brands
            </motion.p>
            <div className="flex flex-wrap items-center justify-center gap-8 sm:gap-12">
              {clients.map((client, i) => (
                <motion.span
                  key={client}
                  custom={i}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                  variants={fadeUp}
                  className="text-lg font-bold text-[#9CA3AF] hover:text-[#1A3A5C] transition-colors tracking-tight"
                >
                  {client}
                </motion.span>
              ))}
            </div>
          </div>
        </section>

        {/* Demos CTA */}
        <section className="py-20 sm:py-28 bg-white">
          <div className="max-w-4xl mx-auto px-6 lg:px-8 text-center">
            <motion.p
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="text-xs font-semibold uppercase tracking-[0.2em] text-[#1A3A5C] mb-4"
            >
              Voice Demos
            </motion.p>
            <motion.h2
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-3xl sm:text-4xl font-bold text-[#111111] tracking-tight mb-6"
            >
              Hear the voice
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-base text-[#444444] leading-relaxed max-w-xl mx-auto mb-10"
            >
              Commercial. Narration. Character. Animation. Listen to demos
              across every category and find the right sound for your project.
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <Link
                href="/demos"
                className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full bg-[#1A3A5C] text-white font-semibold text-sm hover:bg-[#2B5C8A] transition-colors"
              >
                Explore All Demos
                <ChevronRight size={16} />
              </Link>
            </motion.div>
          </div>
        </section>

        {/* Contact / Booking CTA */}
        <section className="py-20 sm:py-28 bg-[#1A3A5C]">
          <div className="max-w-4xl mx-auto px-6 lg:px-8 text-center">
            <motion.p
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="text-xs font-semibold uppercase tracking-[0.2em] text-white/50 mb-4"
            >
              Ready to work together?
            </motion.p>
            <motion.h2
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-3xl sm:text-4xl font-bold text-white tracking-tight mb-6"
            >
              Let&apos;s make something remarkable
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-base text-white/70 leading-relaxed max-w-lg mx-auto mb-10"
            >
              Quick turnaround. Union quality. Response within 24 hours — often
              within the hour.
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
                href="/about"
                className="px-8 py-3.5 rounded-full border-2 border-white/40 text-white font-semibold text-sm hover:bg-white/10 transition-colors"
              >
                Learn More
              </Link>
            </motion.div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
