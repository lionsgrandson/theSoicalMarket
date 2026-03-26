"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

export default function AuthWelcomePage() {
  const [showAuthModal, setShowAuthModal] = useState(false);
  const router = useRouter();

  const handleSignupRoute = () => {
    setShowAuthModal(true);
  };

  return (
    <>
      {/* WELCOME PAGE */}
      <div className="min-h-screen flex items-center justify-center bg-white px-4">
        <div className="max-w-md w-full text-center space-y-6">
          <h1 className="text-4xl font-bold text-gray-900">WELCOME</h1>

          <p className="text-gray-600">
            Join The Social Market and get started today
          </p>

          <button
            className="bg-secondary cursor-pointer hover:bg-[var(--secondaryhover)] text-primary font-semibold px-8 py-4 rounded-lg transition-colors duration-200 text-lg w-full"
            onClick={handleSignupRoute}
          >
            Sign up for free
          </button>

          <p className="text-sm text-gray-500">
            Already a user?{" "}
            <button
              onClick={() => router.push("/auth/login")}
              className="text-primary hover:underline cursor-pointer"
            >
              Click here
            </button>
          </p>
        </div>
      </div>

      {/* SIGNUP ROLE MODAL */}
      <Dialog open={showAuthModal} onOpenChange={setShowAuthModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Join The Social Market</DialogTitle>
            <DialogDescription>
              Choose your role to continue. You can always switch later if needed.
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col gap-3 pt-4">
            <Button
              onClick={() => {
                router.push("/auth/signup?role=influencer&returnTo=/influencer-onboarding");
                setShowAuthModal(false);
              }}
            >
              Sign up as Influencer
            </Button>

            <Button
              onClick={() => {
                router.push("/auth/signup?role=brand&returnTo=/brand-onboarding");
                setShowAuthModal(false);
              }}
            >
              Sign up as Brand
            </Button>
            <Button
              onClick={() => {
                router.push("/auth/signup?role=both&returnTo=/brand-onboarding");
                setShowAuthModal(false);
              }}
            >
              Sign up as Both
            </Button>
          </div>

          
        </DialogContent>
      </Dialog>
    </>
  );
}
