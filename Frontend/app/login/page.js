"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import GlassNavbar from "../components/navbar";

const ACCENT = "#f2a93b";
const emailOk = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);

export default function LoginPage() {
  const router = useRouter();
  const [form, setForm] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState({});
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState("");
  const login = process.env.NEXT_PUBLIC_API_URL

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  async function onSubmit(e) {
    e.preventDefault();
    setServerError("");
    const errs = {};
    if (!emailOk(form.email)) errs.email = "Enter a valid email address.";
    if (!form.password) errs.password = "Enter your password.";
    setErrors(errs);
    if (Object.keys(errs).length) return;

    setLoading(true);
    try {
      // Change this URL to your own login endpoint
      const res = await fetch(`${login}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(form),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.message || "Wrong email or password.");
      router.push("/shop");
    } catch (err) {
      setServerError(err.message);
    } finally {
      setLoading(false);
    }
  }

  const input =
    "w-full rounded-lg border bg-white/5 px-4 py-3 text-[#f6efe6] placeholder:text-[#f6efe6]/40 outline-none transition focus:border-[#f2a93b] focus:ring-2 focus:ring-[#f2a93b]/40";

  return (
    <>
    <GlassNavbar/>
    <main className="grid min-h-screen place-items-center bg-[linear-gradient(160deg,#0d0b09_0%,#1c150e_100%)] px-4 py-12 font-sans text-[#f6efe6]">
      <div className="w-full max-w-md rounded-2xl border border-white/15 bg-white/[0.07] p-8 shadow-[inset_0_1px_0_rgba(255,255,255,0.18),0_8px_32px_rgba(0,0,0,0.4)] backdrop-blur-xl">
        <Link href="/" className="mb-6 inline-block font-serif text-2xl font-semibold" style={{ color: ACCENT }}>
          GetCapes
        </Link>
        <h1 className="mb-1 font-serif text-3xl font-semibold">Welcome back</h1>
        <p className="mb-8 text-[#f6efe6]/65">Log in to your account.</p>

        <form onSubmit={onSubmit} noValidate className="space-y-5">
          <div>
            <label htmlFor="email" className="mb-1.5 block text-sm font-medium">Email</label>
            <input
              id="email" name="email" type="email" autoComplete="email" placeholder="you@example.com"
              value={form.email} onChange={set("email")}
              aria-invalid={!!errors.email} aria-describedby={errors.email ? "email-err" : undefined}
              className={`${input} ${errors.email ? "border-red-400" : "border-white/20"}`}
            />
            {errors.email && <p id="email-err" className="mt-1.5 text-sm text-red-300">{errors.email}</p>}
          </div>

          <div>
            <label htmlFor="password" className="mb-1.5 block text-sm font-medium">Password</label>
            <div className="relative">
              <input
                id="password" type={showPw ? "text" : "password"} autoComplete="current-password" name="password"
                placeholder="Your password"
                value={form.password} onChange={set("password")}
                aria-invalid={!!errors.password} aria-describedby={errors.password ? "pw-err" : undefined}
                className={`${input} pr-16 ${errors.password ? "border-red-400" : "border-white/20"}`}
              />
              <button
                type="button" onClick={() => setShowPw((s) => !s)}
                aria-label={showPw ? "Hide password" : "Show password"}
                className="absolute right-3 top-1/2 -translate-y-1/2 rounded px-2 py-1 text-sm text-[#f6efe6]/70 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#f2a93b]"
              >
                {showPw ? "Hide" : "Show"}
              </button>
            </div>
            {errors.password && <p id="pw-err" className="mt-1.5 text-sm text-red-300">{errors.password}</p>}
          </div>

          {serverError && (
            <p role="alert" className="rounded-lg border border-red-400/40 bg-red-500/10 px-4 py-3 text-sm text-red-200">
              {serverError}
            </p>
          )}

          <button
            type="submit" disabled={loading}
            className="w-full rounded-lg px-4 py-3 font-semibold text-[#1a1208] transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#f2a93b]"
            style={{ background: ACCENT }}
          >
            {loading ? "Logging in..." : "Log in"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-[#f6efe6]/65">
          New to GetCapes?{" "}
          <Link href="/register" className="font-semibold underline underline-offset-4" style={{ color: ACCENT }}>
            Create an account
          </Link>
        </p>
      </div>
    </main>
    </>
  );
}