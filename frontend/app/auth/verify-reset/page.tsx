"use client";

import type React from "react";

import { Suspense, useState, useRef } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { apiClient } from "@/lib/apiClient";
import { useSearchParams } from "next/navigation";
import { toast } from "react-toastify";

function VerifyResetContent() {
  const [code, setCode] = useState(["", "", "", ""]);
  const [error, setError] = useState("");
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const searchParams = useSearchParams();
  const userEmail = searchParams.get("email");
  const[loading,setLoading]=useState(false);

  console.log("Email:", userEmail);
  console.log(userEmail);

  const handleInputChange = (index: number, value: string) => {
    if (value.length > 1) return;

    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);

    // Auto-focus next input
    if (value && index < 3) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();

  const verificationCode = code.join("");

  if (verificationCode.length !== 4) {
    setError("Please enter the complete verification code");
    return;
  }

  try {
    setLoading(true);
    setError("");

    const res = await apiClient("user_service/verify_email/", {
      method: "POST",
      body: JSON.stringify({
        email: userEmail,
        otp: verificationCode,
      }),
    });

    if (res?.status === "success" || res?.code === 200) {
      window.location.href = `/auth/reset-password?email=${encodeURIComponent(
        userEmail ?? ""
      )}&code=${encodeURIComponent(verificationCode)}`;
      return;
    }

    setError(res?.message || "Invalid verification code.");
  } catch (err) {
    console.error("Verification error:", err);
    setError("Something went wrong. Please try again.");
  } finally {
    setLoading(false);
  }
};

  const handleResendCode = async () => {
      try {
        setError("");
        setLoading(true)
        await apiClient("user_service/send_otp/", {
          method: "POST",
          body: JSON.stringify({ email: userEmail }),
        });
  
        console.log("✅ Verification code resent to:", userEmail);
        setError(""); // Clear any previous errors
        toast("Verification code resent to your email!");
      } catch (error) {
        toast("❌ Resend Error:");
        setError("Failed to resend code. Please try again.");
      }finally{
        setLoading(false);
      }
    };

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Left Side - Form */}
      <div className="w-full lg:w-1/2 bg-slate-800 flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center p-6">
          <div className="flex items-center gap-2">
            <Image
              src={"/images/logo.png"}
              width={200}
              height={55}
              alt="social market"
              className="w-auto h-auto"
            />
          </div>
        </div>

        {/* Form Content */}
        <div className="flex-1 flex items-center justify-center px-6">
          <div className="w-full max-w-md">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-white mb-2">
                Verify Your Email
              </h1>
              <p className="text-slate-300 mb-1">
                Enter The 4 Digit Code Sent To
              </p>
              <p className="text-slate-300">{userEmail}</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="flex justify-center gap-3">
                {code.map((digit, index) => (
                  <input
                    key={index}
                    ref={(el) => {
                      inputRefs.current[index] = el;
                    }}
                    type="text"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleInputChange(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    className="w-12 h-12 text-center text-xl font-semibold bg-slate-600 text-white border border-slate-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary"
                  />
                ))}
              </div>

              

              {error && (
                <p className="text-red-400 text-center text-sm">{error}</p>
              )}

              <Button
  type="submit"
  disabled={loading}
  className="w-full bg-secondary hover:bg-[var(--secondaryhover)] text-slate-800 font-semibold py-3 rounded-lg flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
>
  {loading && (
    <span className="w-4 h-4 border-2 border-slate-800 border-t-transparent rounded-full animate-spin" />
  )}
  {loading ? "Verifying..." : "Verify"}
</Button>

              <div className="text-center">
               <span className="text-white/55"> Didn't receive any verification OTP? </span>
                <span
  onClick={!loading ? handleResendCode : undefined}
  className={`text-secondary font-semibold ${
    loading ? "opacity-50 cursor-not-allowed" : "cursor-pointer"
  }`}
>
  {loading ? "Sending..." : "Resend code"}
</span>
              </div>

              <div className="text-center">
                <Button
                  variant="outline"
                  className="border-slate-600 text-white hover:bg-primary hover:text-white bg-transparent"
                  asChild
                >
                  <Link href="/auth/login">← Back to Log in</Link>
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Right Side - Illustration */}
      <div className="hidden relative lg:flex lg:w-1/2 bg-slate-100 items-center justify-center p-8">
        <Button
          variant="outline"
          className="absolute top-4 right-4 bg-secondary text-slate-800 border-secondary hover:bg-[var(--secondaryhover)]"
          asChild
        >
          <Link href="/">Back to website →</Link>
        </Button>
        <div className="max-w-md">
          <Image
            width={600}
            height={600}
            src="/images/verify-illustration.png"
            alt="Email verification illustration"
            className="w-full h-auto"
          />
        </div>
      </div>
    </div>
  );
}

export default function VerifyResetPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-50" />}>
      <VerifyResetContent />
    </Suspense>
  );
}
