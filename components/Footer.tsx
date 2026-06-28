import Link from "next/link";

const footerLinks = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About" },
  { href: "/demos", label: "Voice Demos" },
  { href: "/contact", label: "Contact & Booking" },
];

export default function Footer() {
  return (
    <footer
      style={{
        background: "var(--bg-surface)",
        borderTop: "1px solid var(--border)",
      }}
    >
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-14">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2.5 mb-5">
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                style={{
                  background:
                    "linear-gradient(135deg, #C47ED6 0%, #7040A8 100%)",
                }}
              >
                <span
                  className="text-white font-black text-sm leading-none"
                  style={{ fontFamily: "var(--font-playfair)" }}
                >
                  V
                </span>
              </div>
              <div className="flex flex-col leading-none">
                <span className="text-[11px] font-bold tracking-[0.22em] uppercase text-white">
                  Mark Aston
                </span>
                <span
                  className="text-[9px] tracking-[0.18em] uppercase mt-0.5"
                  style={{ color: "var(--purple-light)" }}
                >
                  Voice Actor
                </span>
              </div>
            </div>
            <p
              className="text-sm leading-relaxed max-w-xs"
              style={{ color: "var(--text-secondary)" }}
            >
              SAG-AFTRA voice over talent based in Atlanta, GA. Available for
              commercial, narration, character, and broadcast work.
            </p>
          </div>

          {/* Navigation */}
          <div>
            <h3
              className="text-[10px] font-semibold uppercase tracking-[0.2em] mb-5"
              style={{ color: "var(--text-muted)" }}
            >
              Navigation
            </h3>
            <nav className="flex flex-col gap-3">
              {footerLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-sm transition-colors hover:text-white"
                  style={{ color: "var(--text-secondary)" }}
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>

          {/* Contact */}
          <div>
            <h3
              className="text-[10px] font-semibold uppercase tracking-[0.2em] mb-5"
              style={{ color: "var(--text-muted)" }}
            >
              Get in Touch
            </h3>
            <div className="flex flex-col gap-3 mb-6">
              <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
                Atlanta, Georgia
              </p>
              <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
                SAG-AFTRA Union Member
              </p>
              <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
                Response within 24 hours
              </p>
            </div>
            <Link
              href="/contact"
              className="inline-flex px-5 py-2.5 rounded-full text-sm font-semibold transition-all hover:opacity-80"
              style={{
                border: "1px solid rgba(147,97,202,0.35)",
                color: "var(--purple-light)",
              }}
            >
              Book a Session
            </Link>
          </div>
        </div>

        {/* Bottom bar */}
        <div
          className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4"
          style={{ borderTop: "1px solid rgba(147,97,202,0.08)" }}
        >
          <p className="text-xs" style={{ color: "var(--text-muted)" }}>
            &copy; {new Date().getFullYear()} Mark Aston. All rights reserved.
          </p>
          <p className="text-xs" style={{ color: "var(--text-muted)" }}>
            The Voice of Mark Aston &middot; VOMA
          </p>
        </div>
      </div>
    </footer>
  );
}
