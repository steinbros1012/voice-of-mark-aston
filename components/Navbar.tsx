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

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();

  const isHome = pathname === "/";

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  const navBg =
    isHome && !scrolled
      ? "bg-transparent"
      : "bg-white border-b border-[#E5E5E5]";

  const textColor =
    isHome && !scrolled ? "text-white" : "text-[#1A3A5C]";

  const logoSubColor =
    isHome && !scrolled ? "text-white/70" : "text-[#6B7280]";

  const linkHoverColor =
    isHome && !scrolled
      ? "hover:text-white/80"
      : "hover:text-[#2B5C8A]";

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${navBg}`}
    >
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="flex items-center justify-between h-18 py-4">
          {/* Logo */}
          <Link href="/" className="flex flex-col leading-tight">
            <span
              className={`text-sm font-bold tracking-[0.2em] uppercase transition-colors duration-300 ${textColor}`}
            >
              Mark Aston
            </span>
            <span
              className={`text-[10px] font-medium tracking-[0.15em] uppercase transition-colors duration-300 ${logoSubColor}`}
            >
              Voice Actor
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`text-sm font-medium transition-colors duration-200 ${textColor} ${linkHoverColor} ${
                  pathname === link.href ? "opacity-100" : "opacity-80"
                }`}
              >
                {link.label}
              </Link>
            ))}
            <Link
              href="/contact"
              className="px-6 py-2.5 rounded-full bg-[#1A3A5C] text-white font-semibold text-sm hover:bg-[#2B5C8A] transition-colors duration-200 ml-2"
            >
              Book Now
            </Link>
          </nav>

          {/* Mobile Toggle */}
          <button
            className={`md:hidden p-2 rounded-md transition-colors ${textColor}`}
            onClick={() => setMobileOpen((v) => !v)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="md:hidden bg-white border-t border-[#E5E5E5]">
          <nav className="flex flex-col px-6 py-4 gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`py-3 text-sm font-medium text-[#1A3A5C] hover:text-[#2B5C8A] border-b border-[#F0F0F0] last:border-0 transition-colors ${
                  pathname === link.href ? "font-semibold" : ""
                }`}
              >
                {link.label}
              </Link>
            ))}
            <Link
              href="/contact"
              className="mt-4 px-6 py-3 rounded-full bg-[#1A3A5C] text-white font-semibold text-sm text-center hover:bg-[#2B5C8A] transition-colors"
            >
              Book Now
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}
