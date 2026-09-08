"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { CheckCircle2, XCircle, Loader2 } from "lucide-react";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "https://techrepubliq-api.apprepublic.workers.dev";

export default function VerifyPage() {
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const token = new URLSearchParams(window.location.search).get("token");
    if (!token) {
      setStatus("error");
      setMessage("Missing verification token.");
      return;
    }

    fetch(`${API_BASE}/api/auth/verify?token=${encodeURIComponent(token)}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.verified) {
          setStatus("success");
          setMessage("Your email has been verified. Welcome to TechRepubliQ!");
        } else {
          setStatus("error");
          setMessage(data.error || "Verification failed. The link may have expired.");
        }
      })
      .catch(() => {
        setStatus("error");
        setMessage("Could not connect to verify your email. Please try again.");
      });
  }, []);

  return (
    <div className="mx-auto max-w-[480px] px-md min-h-[60vh] flex flex-col items-center justify-center text-center">
      {status === "loading" && (
        <>
          <Loader2 size={48} className="text-accent mb-md animate-spin" aria-hidden="true" />
          <h1 className="font-display text-[28px] leading-[36px] font-semibold text-ink mb-sm">Verifying your email...</h1>
        </>
      )}

      {status === "success" && (
        <>
          <CheckCircle2 size={48} className="text-success mb-md" aria-hidden="true" />
          <h1 className="font-display text-[28px] leading-[36px] font-semibold text-ink mb-sm">Email verified</h1>
          <p className="text-sm text-slate mb-lg">{message}</p>
          <Link href="/login" className="inline-flex items-center px-7 py-3.5 rounded-full text-sm font-medium text-white bg-gradient-to-br from-[#FF5C4D] to-[#C8102E] no-underline">
            Log in
          </Link>
        </>
      )}

      {status === "error" && (
        <>
          <XCircle size={48} className="text-error mb-md" aria-hidden="true" />
          <h1 className="font-display text-[28px] leading-[36px] font-semibold text-ink mb-sm">Verification failed</h1>
          <p className="text-sm text-slate mb-lg">{message}</p>
          <Link href="/login" className="inline-flex items-center px-7 py-3.5 rounded-full text-sm font-medium text-white bg-gradient-to-br from-[#FF5C4D] to-[#C8102E] no-underline">
            Back to login
          </Link>
        </>
      )}
    </div>
  );
}