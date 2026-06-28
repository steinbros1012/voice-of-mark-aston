"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Clock, Mail, Phone, CheckCircle2 } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

interface FormData {
  name: string;
  email: string;
  phone: string;
  projectType: string;
  budget: string;
  message: string;
}

const initialForm: FormData = {
  name: "",
  email: "",
  phone: "",
  projectType: "",
  budget: "",
  message: "",
};

const projectTypes = [
  "Commercial / Broadcast",
  "Narration / Documentary",
  "Character / Animation",
  "Theme Park / Attraction",
  "Promo / Imaging",
  "Audiobook",
  "IVR / Phone System",
  "Other",
];

const budgetRanges = [
  "Under $250",
  "$250 – $500",
  "$500 – $1,000",
  "$1,000 – $2,500",
  "$2,500+",
  "Not sure yet",
];

export default function ContactPage() {
  const [form, setForm] = useState<FormData>(initialForm);
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("loading");
    setErrorMessage("");

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(
          (data as { error?: string }).error ?? "Something went wrong. Please try again."
        );
      }

      setStatus("success");
      setForm(initialForm);
    } catch (err: unknown) {
      setStatus("error");
      setErrorMessage(
        err instanceof Error ? err.message : "Something went wrong. Please try again."
      );
    }
  }

  const inputClass =
    "w-full px-4 py-3 rounded-xl border border-[#E5E5E5] bg-white text-sm text-[#111111] placeholder-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-[#1A3A5C]/20 focus:border-[#1A3A5C] transition-colors";

  const labelClass = "block text-xs font-semibold uppercase tracking-[0.12em] text-[#6B7280] mb-2";

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
                Contact & Booking
              </motion.p>
              <motion.h1
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="text-4xl sm:text-5xl font-bold text-[#111111] tracking-tight mb-6 leading-tight"
              >
                Let&apos;s work together
              </motion.h1>
              <motion.p
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="text-base text-[#444444] leading-relaxed"
              >
                Tell Mark about your project and he&apos;ll be in touch promptly.
                Quick turnaround is the standard, often within the hour.
              </motion.p>
            </div>
          </div>
        </section>

        {/* Content */}
        <section className="py-20 sm:py-28 bg-[#F7F7F7]">
          <div className="max-w-7xl mx-auto px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
              {/* Sidebar Info */}
              <div className="lg:col-span-1 flex flex-col gap-6">
                {[
                  {
                    icon: Clock,
                    title: "Quick Response",
                    body: "Response within 24 hours, often within the hour.",
                  },
                  {
                    icon: Mail,
                    title: "Email",
                    body: "Use the form to send your project details directly.",
                  },
                  {
                    icon: Phone,
                    title: "Phone",
                    body: "Available upon request for direct consultation.",
                  },
                ].map((item, i) => {
                  const Icon = item.icon;
                  return (
                    <motion.div
                      key={item.title}
                      initial={{ opacity: 0, y: 16 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.55, delay: i * 0.1 + 0.2 }}
                      className="bg-white border border-[#E5E5E5] rounded-2xl p-6 shadow-sm"
                    >
                      <div className="flex items-start gap-4">
                        <div className="w-10 h-10 rounded-xl bg-[#1A3A5C]/8 flex items-center justify-center flex-shrink-0">
                          <Icon size={18} className="text-[#1A3A5C]" />
                        </div>
                        <div>
                          <h3 className="text-sm font-bold text-[#111111] mb-1">
                            {item.title}
                          </h3>
                          <p className="text-sm text-[#6B7280] leading-relaxed">
                            {item.body}
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}

                <motion.div
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.55, delay: 0.5 }}
                  className="bg-[#1A3A5C] rounded-2xl p-6 text-white"
                >
                  <h3 className="text-sm font-bold mb-2">Atlanta, Georgia</h3>
                  <p className="text-sm text-white/70 leading-relaxed">
                    SAG-AFTRA union member. Available for remote sessions
                    globally. Professional home studio with broadcast-quality
                    audio.
                  </p>
                </motion.div>
              </div>

              {/* Form */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="lg:col-span-2"
              >
                {status === "success" ? (
                  <div className="bg-white border border-[#E5E5E5] rounded-2xl p-12 shadow-sm text-center">
                    <div className="w-16 h-16 rounded-full bg-green-50 flex items-center justify-center mx-auto mb-6">
                      <CheckCircle2 size={32} className="text-green-600" />
                    </div>
                    <h2 className="text-2xl font-bold text-[#111111] mb-3 tracking-tight">
                      Message sent!
                    </h2>
                    <p className="text-sm text-[#6B7280] leading-relaxed max-w-sm mx-auto">
                      Thank you for reaching out. Mark will be in touch within
                      24 hours — often much sooner.
                    </p>
                  </div>
                ) : (
                  <form
                    onSubmit={handleSubmit}
                    className="bg-white border border-[#E5E5E5] rounded-2xl p-8 shadow-sm"
                  >
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      {/* Name */}
                      <div>
                        <label htmlFor="name" className={labelClass}>
                          Full Name <span className="text-red-500">*</span>
                        </label>
                        <input
                          id="name"
                          name="name"
                          type="text"
                          required
                          value={form.name}
                          onChange={handleChange}
                          placeholder="Your name"
                          className={inputClass}
                        />
                      </div>

                      {/* Email */}
                      <div>
                        <label htmlFor="email" className={labelClass}>
                          Email Address <span className="text-red-500">*</span>
                        </label>
                        <input
                          id="email"
                          name="email"
                          type="email"
                          required
                          value={form.email}
                          onChange={handleChange}
                          placeholder="your@email.com"
                          className={inputClass}
                        />
                      </div>

                      {/* Phone */}
                      <div>
                        <label htmlFor="phone" className={labelClass}>
                          Phone <span className="text-[#9CA3AF] normal-case font-normal tracking-normal">(optional)</span>
                        </label>
                        <input
                          id="phone"
                          name="phone"
                          type="tel"
                          value={form.phone}
                          onChange={handleChange}
                          placeholder="+1 (555) 000-0000"
                          className={inputClass}
                        />
                      </div>

                      {/* Project Type */}
                      <div>
                        <label htmlFor="projectType" className={labelClass}>
                          Project Type <span className="text-red-500">*</span>
                        </label>
                        <select
                          id="projectType"
                          name="projectType"
                          required
                          value={form.projectType}
                          onChange={handleChange}
                          className={inputClass}
                        >
                          <option value="">Select a type...</option>
                          {projectTypes.map((t) => (
                            <option key={t} value={t}>
                              {t}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Budget */}
                      <div className="sm:col-span-2">
                        <label htmlFor="budget" className={labelClass}>
                          Budget Range
                        </label>
                        <select
                          id="budget"
                          name="budget"
                          value={form.budget}
                          onChange={handleChange}
                          className={inputClass}
                        >
                          <option value="">Select a range...</option>
                          {budgetRanges.map((b) => (
                            <option key={b} value={b}>
                              {b}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Message */}
                      <div className="sm:col-span-2">
                        <label htmlFor="message" className={labelClass}>
                          Project Details <span className="text-red-500">*</span>
                        </label>
                        <textarea
                          id="message"
                          name="message"
                          required
                          rows={5}
                          value={form.message}
                          onChange={handleChange}
                          placeholder="Tell Mark about your project — what you need, your timeline, and any style direction..."
                          className={`${inputClass} resize-none`}
                        />
                      </div>
                    </div>

                    {status === "error" && (
                      <div className="mt-4 p-4 rounded-xl bg-red-50 border border-red-100 text-sm text-red-700">
                        {errorMessage}
                      </div>
                    )}

                    <div className="mt-8">
                      <button
                        type="submit"
                        disabled={status === "loading"}
                        className="w-full sm:w-auto px-10 py-3.5 rounded-full bg-[#1A3A5C] text-white font-semibold text-sm hover:bg-[#2B5C8A] transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                      >
                        {status === "loading" ? "Sending..." : "Send Message"}
                      </button>
                    </div>
                  </form>
                )}
              </motion.div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
