"use client";

import type React from "react";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { apiClient } from "@/lib/apiClient";
import { useRouter } from "next/navigation";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const[loading,setLoading]=useState(false);
const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setLoading(true);

  if (!email) {
    setError("Email is required");
    setLoading(false);
    return;
  }

  try {
    const res = await apiClient("user_service/send_otp/", {
      method: "POST",
      body: JSON.stringify({ email }),
    });

    if (res.code == 200) {
      router.push(`/auth/verify-reset?email=${email}`);
    }
  } catch (error) {
    setError("Please try again later.");
  } finally {
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
                Forgot Password?
              </h1>
              <p className="text-slate-300">
                Enter Your Email  To Reset Your Password Quickly
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <input
                  type="email"
                  placeholder="Enter Your Email "
                  className="w-full px-4 py-3 rounded-lg bg-white border border-gray-300 focus:outline-none focus:ring-2 focus:ring-secondary"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
                {error && <p className="text-red-400 text-sm mt-1">{error}</p>}
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-secondary hover:bg-[var(--secondaryhover)] text-slate-800 font-semibold py-3 rounded-lg"
              >
                {loading? "Sending OTP":"Send OTP"}
              </Button>

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
            src="/images/forgot-illustration.png"
            alt="Forgot password illustration"
            className="w-full h-auto"
          />
        </div>
      </div>
    </div>
  );
}
