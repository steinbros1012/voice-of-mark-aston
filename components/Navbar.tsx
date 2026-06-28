"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About" },
  { href: "/demos", label: "Demos" },
  { href: "/contact", label: "Contact" },
];

function VomaLogo() {
  return (
    <Link href="/" className="flex items-center gap-2.5 group">
      {/* V lettermark */}
      <div
        className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
        style={{
          background: "linear-gradient(135deg, #C47ED6 0%, #7040A8 100%)",
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
    </Link>
  );
}

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();
  const isHome = pathname === "/";

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  const transparent = isHome && !scrolled;

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        transparent
          ? "bg-transparent"
          : "backdrop-blur-sm"
      }`}
      style={
        transparent
          ? undefined
          : {
              backgroundColor: "rgba(11,9,16,0.92)",
              borderBottom: "1px solid var(--border)",
            }
      }
    >
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 md:h-[68px]">
          <VomaLogo />

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  pathname === link.href
                    ? "text-white"
                    : "hover:bg-white/5"
                }`}
                style={{
                  color:
                    pathname === link.href
                      ? "white"
                      : "var(--text-secondary)",
                }}
              >
                {link.label}
              </Link>
            ))}
            <Link
              href="/contact"
              className="ml-4 px-5 py-2.5 rounded-full text-sm font-semibold text-white transition-all duration-200 hover:opacity-85"
              style={{ background: "var(--purple)" }}
            >
              Book Now
            </Link>
          </nav>

          {/* Mobile toggle */}
          <button
            className="md:hidden p-2 rounded-lg transition-colors"
            style={{ color: "var(--text-secondary)" }}
            onClick={() => setMobileOpen((v) => !v)}
            aria-label="Toggle navigation"
          >
            {mobileOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div
          className="md:hidden"
          style={{
            background: "var(--bg-base)",
            borderTop: "1px solid var(--border)",
          }}
        >
          <nav className="flex flex-col px-6 py-4 gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="py-3 text-sm font-medium transition-colors border-b last:border-0"
                style={{
                  color:
                    pathname === link.href
                      ? "white"
                      : "var(--text-secondary)",
                  borderColor: "var(--border)",
                }}
              >
                {link.label}
              </Link>
            ))}
            <Link
              href="/contact"
              className="mt-4 py-3 rounded-full text-sm font-semibold text-white text-center transition-colors"
              style={{ background: "var(--purple)" }}
            >
              Book Now
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}
