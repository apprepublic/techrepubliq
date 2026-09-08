"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Button } from "@/components/Button";
import { Eye, EyeOff } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";

type Tab = "login" | "signup";

export default function LoginPage() {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("login");
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [signupEmailError, setSignupEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSignupEmailError("");
    setPasswordError("");

    if (tab === "signup") {
      if (!name.trim()) {
        setError("Name is required.");
        setLoading(false);
        return;
      }
      if (password.length < 6) {
        setPasswordError("Password must be at least 6 characters.");
        setLoading(false);
        return;
      }
    }

    if (!email.trim() || !password.trim()) {
      setError("Email and password are required.");
      setLoading(false);
      return;
    }

    try {
      if (tab === "signup") {
        const res = await api.auth.register({ email, name, password });
        sessionStorage.setItem("auth_token", res.token);
        sessionStorage.setItem("customer_email", res.customer.email);
        sessionStorage.setItem("customer_name", res.customer.name);
        sessionStorage.setItem("email_verified", "false");
        router.push("/dashboard?verified=false&just_registered=true");
      } else {
        const res = await api.auth.login({ email, password });
        sessionStorage.setItem("auth_token", res.token);
        sessionStorage.setItem("customer_email", res.customer.email);
        sessionStorage.setItem("customer_name", res.customer.name);
        sessionStorage.setItem("email_verified", String(res.customer.emailVerified));
        router.push("/dashboard");
      }
    } catch (err: any) {
      const msg = err.message || "Something went wrong. Please try again.";

      if (tab === "signup" && msg.toLowerCase().includes("already registered")) {
        setSignupEmailError(msg);
      } else if (tab === "signup" && msg.toLowerCase().includes("already exists")) {
        setSignupEmailError("An account with this email already exists.");
      } else {
        setError(msg);
      }
    }

    setLoading(false);
  };

  const switchToLogin = () => {
    setTab("login");
    setError("");
    setSignupEmailError("");
    setPasswordError("");
  };

  return (
    <div className="mx-auto max-w-[400px] px-md min-h-[70vh] flex flex-col justify-center">
      <div className="text-center mb-lg">
        <Link href="/" className="inline-flex items-center gap-2.5">
          <Image src="/assets/logo-light.png" alt="TechRepubliQ" height={40} width={200} className="shrink-0" />
        </Link>
      </div>
      <div className="border border-line rounded-sm p-lg bg-paper-raised">
        <div role="tablist" aria-label="Authentication" className="flex gap-lg mb-lg">
          <button
            role="tab"
            aria-selected={tab === "login"}
            onClick={switchToLogin}
            className={`text-md font-body no-underline pb-sm transition-colors duration-150 ${
              tab === "login" ? "text-accent border-b-2 border-accent" : "text-slate hover:text-ink"
            }`}
          >
            Log in
          </button>
          <button
            role="tab"
            aria-selected={tab === "signup"}
            onClick={() => { setTab("signup"); setError(""); setSignupEmailError(""); setPasswordError(""); }}
            className={`text-md font-body no-underline pb-sm transition-colors duration-150 ${
              tab === "signup" ? "text-accent border-b-2 border-accent" : "text-slate hover:text-ink"
            }`}
          >
            Sign up
          </button>
        </div>

        <AnimatePresence mode="wait">
          <motion.form
            key={tab}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.16, ease: "easeOut" }}
            onSubmit={handleSubmit}
          >
            {tab === "signup" && (
              <div className="mb-md">
                <label htmlFor="name" className="text-sm font-medium text-ink mb-sm block">Name</label>
                <input
                  id="name" type="text" value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full border border-line rounded-sm px-md py-sm text-sm font-body text-ink bg-paper focus:border-accent outline-none transition-colors duration-150"
                />
              </div>
            )}

            <div className="mb-md">
              <label htmlFor="email" className="text-sm font-medium text-ink mb-sm block">Email</label>
              <input
                id="email" type="email" value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={`w-full border rounded-sm px-md py-sm text-sm font-body text-ink bg-paper focus:border-accent outline-none transition-colors duration-150 ${
                  signupEmailError ? "border-error" : "border-line"
                }`}
                aria-describedby={signupEmailError ? "email-error" : undefined}
                aria-invalid={!!signupEmailError}
              />
              {signupEmailError && (
                <p id="email-error" className="text-xs text-error mt-xs">
                  {signupEmailError}{" "}
                  <button type="button" onClick={switchToLogin} className="text-accent hover:text-accent-hover underline">
                    Log in instead.
                  </button>
                </p>
              )}
            </div>

            <div className="mb-lg">
              <label htmlFor="password" className="text-sm font-medium text-ink mb-sm block">Password</label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setPasswordError(""); }}
                  className={`w-full border rounded-sm px-md py-sm pr-xl text-sm font-body text-ink bg-paper focus:border-accent outline-none transition-colors duration-150 ${
                    passwordError ? "border-error" : "border-line"
                  }`}
                  aria-describedby={passwordError ? "pw-error" : undefined}
                  aria-invalid={!!passwordError}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-sm top-1/2 -translate-y-1/2 text-slate hover:text-ink transition-colors duration-150"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {passwordError && <p id="pw-error" className="text-xs text-error mt-xs">{passwordError}</p>}
              {tab === "login" && (
                <Link
                  href="/forgot-password"
                  className="inline-block mt-xs text-xs text-accent hover:text-accent-hover no-underline transition-colors duration-150"
                >
                  Forgot password?
                </Link>
              )}
            </div>

            {error && (
              <div role="alert" className="mb-md p-sm bg-error/10 border border-error rounded-sm text-sm text-error">
                {error}
              </div>
            )}

            <Button type="submit" className="w-full" loading={loading}>
              {tab === "login" ? "Log in" : "Create account"}
            </Button>
          </motion.form>
        </AnimatePresence>
      </div>
    </div>
  );
}