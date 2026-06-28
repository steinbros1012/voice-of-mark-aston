import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-[#1A3A5C] text-white">
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {/* Brand */}
          <div>
            <div className="flex flex-col leading-tight mb-4">
              <span className="text-sm font-bold tracking-[0.2em] uppercase text-white">
                Mark Aston
              </span>
              <span className="text-[10px] font-medium tracking-[0.15em] uppercase text-white/60">
                Voice Actor
              </span>
            </div>
            <p className="text-sm text-white/70 leading-relaxed max-w-xs">
              SAG-AFTRA voice over talent based in Atlanta, GA. Available for
              commercial, narration, character, and broadcast work.
            </p>
          </div>

          {/* Navigation */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-[0.2em] text-white/50 mb-5">
              Navigation
            </h3>
            <nav className="flex flex-col gap-3">
              {[
                { href: "/", label: "Home" },
                { href: "/about", label: "About" },
                { href: "/demos", label: "Voice Demos" },
                { href: "/contact", label: "Contact & Booking" },
              ].map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-sm text-white/70 hover:text-white transition-colors"
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-[0.2em] text-white/50 mb-5">
              Get in Touch
            </h3>
            <div className="flex flex-col gap-3">
              <p className="text-sm text-white/70">Atlanta, Georgia</p>
              <p className="text-sm text-white/70">SAG-AFTRA Union Member</p>
              <p className="text-sm text-white/70">Response within 24 hours</p>
              <Link
                href="/contact"
                className="mt-2 inline-flex px-6 py-2.5 rounded-full border border-white/30 text-white text-sm font-semibold hover:bg-white hover:text-[#1A3A5C] transition-colors w-fit"
              >
                Book a Session
              </Link>
            </div>
          </div>
        </div>

        <div className="mt-14 pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-white/40">
            &copy; {new Date().getFullYear()} Mark Aston. All rights reserved.
          </p>
          <p className="text-xs text-white/40">
            The Voice of Mark Aston · VOMA
          </p>
        </div>
      </div>
    </footer>
  );
}
