"use client";

import type React from "react";

import { useState, useRef, useEffect, Suspense } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { apiClient } from "@/lib/apiClient";
import { toast } from "react-toastify";
import { Loader2 } from "lucide-react";

function VerifyEmailPageContent() {
  const router = useRouter();
  const params = useSearchParams();
  const returnTo = params.get("returnTo");
  const [code, setCode] = useState(["", "", "", ""]);
  const [error, setError] = useState("");
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const [userEmail, setUserEmail] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const[loading,setLoading]=useState(false);
  const [isVerified, setIsVerified] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await apiClient("user_service/get_user_info/", {
          method: "GET",
          auth: true,
        });

        const email = res.data.user.email;
        setUserEmail(email);
        console.log("Email:", email);

        // Send OTP only once
        await apiClient("user_service/send_otp/", {
          method: "POST",
          body: JSON.stringify({ email }),
        });

        setOtpSent(true);
        console.log("✅ OTP sent to email:", email);
        console.log("✅ User full Info:", res.data);
      } catch (error) {
        console.error("❌ API Error:", error);
        setError("Failed to send verification code. Please try again.");
      }
    };

    fetchUser();
  }, []); 

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
    setLoading(true);
    e.preventDefault();
    const verificationCode = code.join("");

    if (verificationCode.length !== 4) {
      setError("Please enter the complete verification code");
      return;
    }

    try {
      const res = await apiClient("user_service/verify_email/", {
        method: "POST",
        body: JSON.stringify({ email: userEmail, otp: verificationCode }),
      });

      console.log("Verification response:", res);

      if (res.code == 200) {
        localStorage.setItem("emailVerified", "true");
        setIsVerified(true);
        setTimeout(() => {
          router.push("/auth/success")
        // if (returnTo) {
        //   router.push(returnTo);
        // } else {
        //   // router.push("/brand-dashboard");
        //   router.push("/auth/login");
        // }
      }, 2000);

        
      } else {
        setError("Invalid verification code. Please try again.");
      }
    } catch (error) {
      console.error("❌ Verification Error:", error);
      setError("Verification failed. Please try again.");
      setLoading(false);
    }
  };

  const handleResendCode = async () => {
    try {
      setError("");
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
              <p className="text-slate-300">{userEmail || "your email"}</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="flex justify-center gap-4">
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
                    className="w-12 h-12 text-center rounded-md border border-slate-400 text-white bg-slate-700 focus:outline-none focus:ring-2 focus:ring-secondary"
                  />
                ))}

                
                
              </div>

              {error && (
                <p className="text-red-400 text-center text-sm">{error}</p>
              )}

              <button
                  onClick={handleSubmit}
                  disabled={loading || isVerified}
                  className="w-full bg-secondary cursor-pointer text-slate-900 font-semibold py-3 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>Verifying...</span>
                    </>
                  ) : (
                    "Verify Email"
                  )}
                </button>
              <div className="text-center">
               <span className="text-white/55"> Didn't receive any verification OTP? </span>
                <span
                  
                  onClick={handleResendCode}
                  className="text-secondary cursor-pointer font-semibold"
                >
                  Resend code
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
            width={500}
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

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-50 flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-slate-800" /></div>}>
      <VerifyEmailPageContent />
    </Suspense>
  );
}