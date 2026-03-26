"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { CheckCircle } from "lucide-react";
import Image from "next/image";

export default function SuccessPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-700 flex items-center justify-center px-6">
      <div className="w-full max-w-lg bg-white rounded-xl shadow-2xl p-10 text-center">
        
        {/* Logo */}
        {/* <Link href="/" className="inline-block mb-8">
          <Image
            src="/images/logo.png"
            width={180}
            height={50}
            alt="Social Market"
            className="mx-auto"
          />
        </Link> */}

        {/* Success Icon */}
        <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="w-10 h-10 text-white" />
        </div>

        {/* Message */}
        <h1 className="text-3xl font-bold text-slate-800 mb-3">
          Account Created Successfully
        </h1>

        <p className="text-slate-600 mb-8">
          Your account has been created. You can continue to your dashboard to complete the next steps.
        </p>

        {/* Primary CTA */}
        <Button
          asChild
          className="w-full bg-secondary hover:bg-[var(--secondaryhover)] text-slate-800 font-semibold py-3 rounded-lg"
        >
          <Link href="/home_dashboard">Continue to Dashboard</Link>
        </Button>

        {/* Secondary Action */}
        <div className="mt-4">
          <Link
            href="/"
            className="text-sm text-slate-500 hover:text-slate-700 transition"
          >
            Go to home
          </Link>
        </div>
      </div>
    </div>
  );
}
