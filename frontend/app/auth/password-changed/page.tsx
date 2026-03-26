"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { CheckCircle } from "lucide-react";
import Image from "next/image";

export default function PasswordChangedPage() {
  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Left Side - Success Message */}
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

        {/* Success Content */}
        <div className="flex-1 flex items-center justify-center px-6">
          <div className="w-full max-w-md text-center">
            <div className="mb-8">
              <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="w-10 h-10 text-white" />
              </div>
              <h1 className="text-3xl font-bold text-white mb-2">
                Password changed successfully
              </h1>
            </div>

            <Button
              className="bg-secondary hover:bg-[var(--secondaryhover)] text-slate-800 font-semibold py-3 px-8 rounded-lg"
              asChild
            >
              <Link href="/auth/login">← Back to Log in</Link>
            </Button>
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
            src="/images/password-illustration.png"
            alt="Success illustration"
            className="w-full h-auto"
          />
        </div>
      </div>
    </div>
  );
}
