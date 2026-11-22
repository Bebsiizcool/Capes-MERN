"use client";
import { useEffect, useState } from "react";

const LINKS = [
  { label: "Why GetCapes", href: "#why" },
  { label: "Early access", href: "#join" },
];

function Logo({ accent }) {
  return (
    <span
      className="grid h-9 w-9 place-items-center rounded-xl"
      style={{ background: accent }}
      aria-hidden="true"
    >
      {/* baseball cap icon */}
      <svg viewBox="0 0 32 32" className="h-6 w-6" fill="#1a1208">
        <path d="M6 20c0-6.2 4.4-11 10-11s10 4.8 10 11H6z" />
        <path d="M17 20h12c1.2 0 1.8 1.1 1.2 2.1-.6 1-1.8 1.9-3.4 1.9H17z" />
        <circle cx="16" cy="9" r="1.5" />
      </svg>
    </span>
  );
}

export default function GlassNavbar({
  accent = "#f2a93b",
  onLogin = () => {},
  onGetAccess = () => {},
}) {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const focus =
    "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--acc)]";

  return (
    <header
      className="fixed inset-x-0 top-4 z-50 px-4"
      style={{ "--acc": accent }}
    >
      <div
        className={`mx-auto max-w-6xl rounded-2xl border border-white/15 backdrop-blur-xl backdrop-saturate-150 transition-all duration-300 ${
          scrolled ? "bg-white/[0.12]" : "bg-white/[0.07]"
        } shadow-[inset_0_1px_0_rgba(255,255,255,0.18),0_8px_32px_rgba(0,0,0,0.35)]`}
      >
        <nav className="flex items-center justify-between px-4 py-3 text-[#f6efe6]" aria-label="Main">
          {/* Logo + name */}
          <a href="/" className={`flex items-center gap-3 rounded-lg ${focus}`}>
            <Logo accent={accent} />
            <span className="font-serif text-xl font-semibold tracking-tight">GetCapes</span>
          </a>

          {/* Links */}
          <ul className="hidden items-center gap-8 md:flex">
            {LINKS.map((l) => (
              <li key={l.href}>
                <a
                  href={l.href}
                  className={`rounded text-sm font-medium text-[#f6efe6]/75 transition-colors hover:text-white ${focus}`}
                >
                  {l.label}
                </a>
              </li>
            ))}
          </ul>

          {/* Buttons */}
          <div className="hidden items-center gap-3 md:flex">
            <button
              onClick={onLogin}
              className={`rounded-lg border border-white/20 px-4 py-2 text-sm font-semibold transition hover:bg-white/10 ${focus}`}
            >
            <a href="/login">Log in</a>
              
            </button>
            <button
              onClick={onGetAccess}
              className={`rounded-lg px-4 py-2 text-sm font-semibold text-[#1a1208] transition hover:-translate-y-0.5 hover:brightness-110 ${focus}`}
              style={{ background: accent }}
            >
              <a href="/shop">Shop Now</a>
            </button>
          </div>

          {/* Mobile toggle */}
          <button
            className={`grid h-10 w-10 place-items-center rounded-lg border border-white/20 md:hidden ${focus}`}
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            onClick={() => setOpen((o) => !o)}
          >
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              {open ? <path d="M6 6l12 12M18 6L6 18" /> : <path d="M4 7h16M4 12h16M4 17h16" />}
            </svg>
          </button>
        </nav>

        {/* Mobile panel */}
        {open && (
          <div className="border-t border-white/15 px-4 pb-4 pt-3 text-[#f6efe6] md:hidden">
            <ul className="mb-4 space-y-1">
              {LINKS.map((l) => (
                <li key={l.href}>
                  <a
                    href={l.href}
                    onClick={() => setOpen(false)}
                    className={`block rounded-lg px-3 py-2 text-[#f6efe6]/85 hover:bg-white/10 ${focus}`}
                  >
                    {l.label}
                  </a>
                </li>
              ))}
            </ul>
            <div className="flex gap-3">
              <button
                onClick={onLogin}
                className={`flex-1 rounded-lg border border-white/20 px-4 py-2.5 text-sm font-semibold hover:bg-white/10 ${focus}`}
              >
                Log in
              </button>
              <button
                onClick={onGetAccess}
                className={`flex-1 rounded-lg px-4 py-2.5 text-sm font-semibold text-[#1a1208] ${focus}`}
                style={{ background: accent }}
              >
                Get early access
              </button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}