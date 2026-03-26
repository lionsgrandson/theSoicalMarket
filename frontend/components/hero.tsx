"use client";
import Image from "next/image";
import { useRouter } from "next/navigation";
import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { Button } from "./ui/button";
import Typewriter from "./Typewriter";

const Hero = () => {
  const [showAuthModal, setShowAuthModal] = useState(false);
  const router = useRouter();

  const handleSignupRoute = () => {
    setShowAuthModal(true);
  };
  return (
    <section className="bg-gradient-to-b from-[#ffffff] to-[#E9F4FF]">
      <main className="container mx-auto px-4 py-16 lg:py-24">
        <div className="grid lg:grid-cols-3 gap-12 lg:gap-16 items-center">
          {/* Left Content */}
          <div className="lg:col-span-2 space-y-8 flex-1">
            <div className="space-y-4">
              {/* Eyebrow */}
              <p className="text-sm font-medium text-primary/70 tracking-wide ">
                Collabs Are Easier Here
              </p>

              {/* Headline */}
              <h1 className="text-4xl md:h-auto h-[100px] md:text-5xl font-bold text-primary leading-tight">
                <Typewriter
                  words={["Influencers", "Brands"]}
                  speed={80}
                  pause={2000}
                />{" "}
                Mega results.
              </h1>

              {/* Supporting text */}
              <p className="text-lg text-primary leading-relaxed max-w-xl">
                The Social Market is where brands and influencers team up.
                Brands get affordable, authentic marketing. Influencers
                get paid to share services they actually love. It’s
                word-of-mouth, made smarter, faster, and scalable.
              </p>

              {/* Offer/Promo */}
              {/* <p className="text-md text-primary font-semibold">
      For the first 100 users: Use coupon code{" "}
      <span className="font-bold">FIRST100</span> at checkout to sign up for
      free.
    </p> */}

              {/* CTA button */}
              <button
                className="bg-secondary cursor-pointer hover:bg-[var(--secondaryhover)] text-primary font-semibold px-8 py-4 rounded-lg transition-colors duration-200 text-lg"
                onClick={handleSignupRoute}
              >
                Start Here
              </button>
            </div>
          </div>

          {/* Right Image (1/3) */}
          <div className="relative">
            <Image
              width={365}
              height={393}
              src={"/images/hero-img.png"}
              alt="Two stylish women representing micro-influencers"
              className="w-full h-auto max-w-md mx-auto lg:max-w-full"
            />
          </div>
        </div>
      </main>
      {/* Auth Required Modal */}
      <Dialog open={showAuthModal} onOpenChange={setShowAuthModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Join The Social Market</DialogTitle>
            <DialogDescription>
              Choose your role to continue. You can always switch later if
              needed.
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col gap-3 pt-4">
            <Button
              onClick={() => {
                router.push("/auth/signup?role=influencer&returnTo=/influencer-onboarding");
                
              }}
            >
              Sign up as Influencer
            </Button>
            <Button
              onClick={() => {
                router.push("/auth/signup?role=brand&returnTo=/brand-onboarding");
                
              }}
            >
              Sign up as Brand
            </Button>
            <Button
              onClick={() => {
                router.push("/auth/signup?role=both&returnTo=/brand-onboarding");
               
              }}
            >
              Sign up as Both
            </Button>
          </div>

          <div className="flex justify-center pt-4 text-sm">
            <p className="text-muted-foreground">
              Already have an account?{" "}
              <button
                onClick={() => router.push("/auth/login")}
                className="text-primary hover:underline"
              >
                Log in
              </button>
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </section>
  );
};

export default Hero;
