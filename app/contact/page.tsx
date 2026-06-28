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

const sidebarItems = [
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
];

export default function ContactPage() {
  const [form, setForm] = useState<FormData>(initialForm);
  const [status, setStatus] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");
  const [errorMessage, setErrorMessage] = useState("");

  function handleChange(
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
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
          (data as { error?: string }).error ??
            "Something went wrong. Please try again."
        );
      }

      setStatus("success");
      setForm(initialForm);
    } catch (err: unknown) {
      setStatus("error");
      setErrorMessage(
        err instanceof Error
          ? err.message
          : "Something went wrong. Please try again."
      );
    }
  }

  const inputClass =
    "w-full px-4 py-3 rounded-xl text-sm text-white placeholder-[var(--text-muted)] focus:outline-none focus:ring-2 transition-all";
  const inputStyle = {
    background: "var(--bg-base)",
    border: "1px solid var(--border)",
    "--tw-ring-color": "var(--purple)",
  } as React.CSSProperties;

  const labelClass =
    "block text-[10px] font-semibold uppercase tracking-[0.14em] mb-2";

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
                "radial-gradient(ellipse 60% 80% at 0% 60%, rgba(107,63,160,0.12) 0%, transparent 65%)",
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
                Contact & Booking
              </motion.p>
              <motion.h1
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="text-4xl sm:text-5xl font-bold text-white tracking-tight mb-6 leading-tight"
                style={{ fontFamily: "var(--font-playfair)" }}
              >
                Let&apos;s work together
              </motion.h1>
              <motion.p
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="text-base leading-relaxed"
                style={{ color: "var(--text-secondary)" }}
              >
                Tell Mark about your project and he&apos;ll be in touch
                promptly. Quick turnaround is the standard, often within the
                hour.
              </motion.p>
            </div>
          </div>
        </section>

        {/* Form + Sidebar */}
        <section className="py-20 sm:py-28">
          <div className="max-w-7xl mx-auto px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
              {/* Sidebar */}
              <div className="flex flex-col gap-4">
                {sidebarItems.map((item, i) => {
                  const Icon = item.icon;
                  return (
                    <motion.div
                      key={item.title}
                      initial={{ opacity: 0, y: 16 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.55, delay: i * 0.1 + 0.2 }}
                      className="rounded-2xl p-5"
                      style={{
                        background: "var(--bg-card)",
                        border: "1px solid var(--border)",
                      }}
                    >
                      <div className="flex items-start gap-4">
                        <div
                          className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                          style={{ background: "rgba(147,97,202,0.1)" }}
                        >
                          <Icon
                            size={17}
                            style={{ color: "var(--purple-light)" }}
                          />
                        </div>
                        <div>
                          <h3 className="text-sm font-bold text-white mb-1">
                            {item.title}
                          </h3>
                          <p
                            className="text-sm leading-relaxed"
                            style={{ color: "var(--text-secondary)" }}
                          >
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
                  className="rounded-2xl p-5"
                  style={{
                    background: "rgba(147,97,202,0.08)",
                    border: "1px solid rgba(147,97,202,0.18)",
                  }}
                >
                  <h3 className="text-sm font-bold text-white mb-2">
                    Atlanta, Georgia
                  </h3>
                  <p
                    className="text-sm leading-relaxed"
                    style={{ color: "var(--text-secondary)" }}
                  >
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
                  <div
                    className="rounded-2xl p-12 text-center"
                    style={{
                      background: "var(--bg-card)",
                      border: "1px solid var(--border)",
                    }}
                  >
                    <div
                      className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-6"
                      style={{ background: "rgba(147,97,202,0.12)" }}
                    >
                      <CheckCircle2
                        size={28}
                        style={{ color: "var(--purple-light)" }}
                      />
                    </div>
                    <h2
                      className="text-2xl font-bold text-white mb-3 tracking-tight"
                      style={{ fontFamily: "var(--font-playfair)" }}
                    >
                      Message sent!
                    </h2>
                    <p
                      className="text-sm leading-relaxed max-w-sm mx-auto"
                      style={{ color: "var(--text-secondary)" }}
                    >
                      Thank you for reaching out. Mark will be in touch within
                      24 hours, often much sooner.
                    </p>
                  </div>
                ) : (
                  <form
                    onSubmit={handleSubmit}
                    className="rounded-2xl p-8"
                    style={{
                      background: "var(--bg-card)",
                      border: "1px solid var(--border)",
                    }}
                  >
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <div>
                        <label
                          htmlFor="name"
                          className={labelClass}
                          style={{ color: "var(--text-muted)" }}
                        >
                          Full Name <span className="text-red-400">*</span>
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
                          style={inputStyle}
                        />
                      </div>

                      <div>
                        <label
                          htmlFor="email"
                          className={labelClass}
                          style={{ color: "var(--text-muted)" }}
                        >
                          Email Address <span className="text-red-400">*</span>
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
                          style={inputStyle}
                        />
                      </div>

                      <div>
                        <label
                          htmlFor="phone"
                          className={labelClass}
                          style={{ color: "var(--text-muted)" }}
                        >
                          Phone{" "}
                          <span
                            className="normal-case font-normal tracking-normal text-xs"
                            style={{ color: "var(--text-muted)", opacity: 0.6 }}
                          >
                            (optional)
                          </span>
                        </label>
                        <input
                          id="phone"
                          name="phone"
                          type="tel"
                          value={form.phone}
                          onChange={handleChange}
                          placeholder="+1 (555) 000-0000"
                          className={inputClass}
                          style={inputStyle}
                        />
                      </div>

                      <div>
                        <label
                          htmlFor="projectType"
                          className={labelClass}
                          style={{ color: "var(--text-muted)" }}
                        >
                          Project Type <span className="text-red-400">*</span>
                        </label>
                        <select
                          id="projectType"
                          name="projectType"
                          required
                          value={form.projectType}
                          onChange={handleChange}
                          className={inputClass}
                          style={{
                            ...inputStyle,
                            color: form.projectType
                              ? "var(--text)"
                              : "var(--text-muted)",
                          }}
                        >
                          <option value="">Select a type...</option>
                          {projectTypes.map((t) => (
                            <option key={t} value={t}>
                              {t}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="sm:col-span-2">
                        <label
                          htmlFor="budget"
                          className={labelClass}
                          style={{ color: "var(--text-muted)" }}
                        >
                          Budget Range
                        </label>
                        <select
                          id="budget"
                          name="budget"
                          value={form.budget}
                          onChange={handleChange}
                          className={inputClass}
                          style={{
                            ...inputStyle,
                            color: form.budget
                              ? "var(--text)"
                              : "var(--text-muted)",
                          }}
                        >
                          <option value="">Select a range...</option>
                          {budgetRanges.map((b) => (
                            <option key={b} value={b}>
                              {b}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="sm:col-span-2">
                        <label
                          htmlFor="message"
                          className={labelClass}
                          style={{ color: "var(--text-muted)" }}
                        >
                          Project Details <span className="text-red-400">*</span>
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
                          style={inputStyle}
                        />
                      </div>
                    </div>

                    {status === "error" && (
                      <div
                        className="mt-4 p-4 rounded-xl text-sm text-red-300"
                        style={{
                          background: "rgba(239,68,68,0.08)",
                          border: "1px solid rgba(239,68,68,0.2)",
                        }}
                      >
                        {errorMessage}
                      </div>
                    )}

                    <div className="mt-8">
                      <button
                        type="submit"
                        disabled={status === "loading"}
                        className="w-full sm:w-auto px-10 py-3.5 rounded-full text-sm font-semibold text-white transition-all hover:opacity-85 disabled:opacity-50 disabled:cursor-not-allowed"
                        style={{ background: "var(--purple)" }}
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
