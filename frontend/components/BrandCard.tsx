"use client";

import { Layers, MapPin, Lock } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { FaLock } from "react-icons/fa";
import { useAuthStore } from "@/stores/useAuthStore";
import { apiClient } from "@/lib/apiClient";

type Brand = {
  id: number;
  name: string;
  location: string;
  service: string;
  rating: number;
  reviews: number;
  category: string;
  description: string;
  image: string;
  logo: string;
  userId: number;
};

interface BrandCardProps extends Brand {
  planName?: string; // If present and truthy → user has access
}

export default function BrandCard({
  name,
  location,
  category,
  description,
  image,
  logo,
  userId,
  service,
  rating,
  reviews,
}: BrandCardProps) {
  const router = useRouter();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
const [authChecked, setAuthChecked] = useState(false);
const [planName, setPlanName] = useState<string | null>(null);
const [planChecked, setPlanChecked] = useState(false);

const {user}=useAuthStore();
  // Check for JWT token in localStorage
  useEffect(() => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("access_token");
    setIsAuthenticated(!!token);
    setAuthChecked(true);
  }
}, []);
useEffect(() => {
  const fetchPlan = async () => {
    try {
      const res = await apiClient(
        "subscription_service/get_user_subscription_information/",
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("access_token")}`,
          },
        }
      );

      setPlanName(res?.data?.plan_name ?? null);
    } catch (err) {
      setPlanName(null);
    } finally {
      setPlanChecked(true);
    }
  };

  fetchPlan();
}, []);
console.log(planName);

const signedUpAs = (user as any)?.signed_up_as;

const hasValidPlan =
  (signedUpAs === "influencer" &&
    (planName === "Influencer" || planName === "Both")) ||
  (planName === "Both");


  // Determine current state
  const hasAccess = authChecked &&
  isAuthenticated &&
  hasValidPlan;
const isLocked = authChecked &&
  !isAuthenticated; 
const needsUpgrade = authChecked &&
  isAuthenticated &&
  !hasValidPlan;
console.log("needsUpgrade:",needsUpgrade,"isLocked:",isLocked,"hasAccess:",hasAccess);


  const applyBlur = !hasAccess;

  return (
    <div className="group relative bg-white rounded-2xl border border-gray-200 hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col lg:flex-row">
      {/* Image Section */}
      <div className="relative w-full lg:w-96 h-80 lg:h-auto flex-shrink-0 bg-gray-100 overflow-hidden rounded-2xl">
  <Image
    src={image}
    alt={name}
    fill
    sizes="(max-width: 1024px) 100vw, 384px"
    quality={90}
    priority
    className={`object-cover transition-transform duration-500 ${
      applyBlur
        ? "blur-[6px] brightness-75"
        : "group-hover:scale-105"
    }`}
  />

  {/* Category Badge */}
  <div className="absolute top-4 left-4 z-20">
    <span className="px-3 py-1.5 bg-white/95 backdrop-blur-sm text-xs font-bold text-gray-900 rounded-full shadow-lg uppercase tracking-wide">
      {category || "Brand"}
    </span>
  </div>

  {/* Locked / Upgrade Overlay */}
  {applyBlur && (
    <div className="absolute inset-0 bg-black/30 flex items-center justify-center z-10">
      <div className="bg-white/95 p-5 rounded-2xl shadow-2xl text-center">
        <FaLock className="w-10 h-10 text-gray-800 mx-auto mb-3" />
        <p className="text-base font-bold text-gray-900">
          {isLocked ? "Locked" : "Upgrade Required"}
        </p>
      </div>
    </div>
  )}
</div>


      {/* Content Section */}
      <div className="flex-1 p-8 flex flex-col">
        <div className="flex justify-between items-start mb-4">
          <div className="flex-1">
            {/* Name */}
            <h3 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-2 group-hover:text-primary transition-colors">
              {hasAccess ? name : (isLocked ? "Locked Brand" : "Premium Brand")}
            </h3>

            {/* Meta Row */}
            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 mb-6">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-gray-400" />
                <span>
                  {hasAccess ? (location || "Location not specified") : "Hidden"}
                </span>
              </div>

              <span className="text-gray-300">•</span>

              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-gray-400" />
                <span className="uppercase tracking-wider text-xs">
                  {category || "General Brand"}
                </span>
              </div>
            </div>

            {/* Description */}
            <p className={`text-gray-600 leading-relaxed line-clamp-3 mb-6 ${applyBlur ? "blur-sm" : ""}`}>
              {hasAccess
                ? description || "No description available."
                : isLocked
                ? "Sign up or log in to view full brand details and connect."
                : "Upgrade your plan to access premium brand profiles."}
            </p>
          </div>

          {/* Logo */}
          <div className="flex-shrink-0 ml-4 hidden lg:block">
            <Image
              width={80}
              height={80}
              src={logo}
              alt={`${name} Logo`}
              className={`rounded-full border-4 border-white shadow-lg object-cover ${
                applyBlur ? "blur-sm opacity-60" : ""
              }`}
            />
          </div>
        </div>

        {/* Stats Row */}
        {/* <div className="grid grid-cols-2 gap-4 mb-6 border-t border-gray-100 pt-4">
          <div>
            <p className="text-xs font-medium text-gray-400 uppercase mb-1">Service</p>
            <p className={`font-semibold ${applyBlur ? "blur-sm" : ""}`}>
              {hasAccess ? service || "Various" : "Hidden"}
            </p>
          </div>
          <div>
            <p className="text-xs font-medium text-gray-400 uppercase mb-1">Rating</p>
            <p className={`font-semibold ${applyBlur ? "blur-sm" : ""}`}>
              {hasAccess ? `${rating || 0}★ (${reviews || 0} reviews)` : "Hidden"}
            </p>
          </div>
        </div> */}

        {/* CTA Button */}
        <div className="mt-auto">
          {hasAccess ? (
            <Link
              href={`/brands/${userId}`}
              className="block w-full py-3 px-6 text-center rounded-xl bg-primary text-white font-semibold hover:bg-primary/90 transition-all duration-200 shadow-md hover:shadow-lg"
            >
              Explore Brand
            </Link>
          ) : (
            <button
              onClick={() => setShowAuthModal(true)}
              className="w-full py-3 px-6 text-center rounded-xl bg-primary text-white font-semibold flex items-center justify-center gap-2 hover:bg-primary/90 transition-all duration-200 shadow-md"
            >
              <FaLock className="w-4 h-4" />
              {isLocked ? "Unlock Brand" : "Upgrade Plan"}
            </button>
          )}
        </div>
      </div>

      {/* Modal */}
<Dialog open={showAuthModal} onOpenChange={setShowAuthModal}>
  <DialogContent className="max-w-md bg-white p-8 rounded-2xl shadow-2xl">
    <DialogHeader className="space-y-4 text-center">
      <div className="mx-auto w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center">
        <Lock className="w-8 h-8 text-primary" />
      </div>
      <DialogTitle className="text-2xl font-bold text-gray-900">
        {needsUpgrade ? "Upgrade Your Plan" : "Unlock Full Access"}
      </DialogTitle>
      <DialogDescription className="text-gray-600 leading-relaxed">
        {needsUpgrade
          ? "You're logged in! Upgrade to a premium plan to access full brand details."
          : "Create an account to view complete brand profiles and start collaborations."}
      </DialogDescription>
    </DialogHeader>

    <div className="flex flex-col gap-4 pt-6">
      {/* PRIORITY 1: User is logged in but needs upgrade */}
      {needsUpgrade && (
        <Button
          className="w-full h-12 text-base font-semibold bg-primary text-white hover:opacity-90 shadow-lg"
          onClick={() => {
            setShowAuthModal(false);
            router.push("/pricing"); // Your pricing/upgrade page
          }}
        >
          View Plans & Upgrade
        </Button>
      )}

      {/* PRIORITY 2: User is NOT logged in */}
      {isLocked && (
        <>
          <Button
            className="w-full h-12 text-base font-semibold border-2 border-primary text-white hover:bg-primary hover:text-white"
            onClick={() => {
              setShowAuthModal(false);
              router.push("/auth/signup?role=brand&returnTo=/brand-onboarding");
            }}
          >
            Sign Up as Brand
          </Button>
          <Button
            variant="outline"
            className="w-full h-12 text-base font-semibold border-2 border-primary text-primary hover:bg-primary hover:text-white"
            onClick={() => {
              setShowAuthModal(false);
              router.push("/auth/signup?role=influencer&returnTo=/influencer-onboarding");
            }}
          >
            Sign Up as Influencer
          </Button>
          <Button
            variant="outline"
            className="w-full h-12 text-base font-semibold border-2 border-primary text-primary hover:bg-primary hover:text-white"
            onClick={() => {
              setShowAuthModal(false);
              router.push("/auth/signup?role=both&returnTo=/brand-onboarding");
            }}
          >
            Sign Up as Both
          </Button>
        </>
      )}
    </div>

    {/* Only show login link if user is NOT logged in */}
    {isLocked && (
      <div className="text-center pt-6 text-sm text-gray-600">
        <p>
          Already have an account?{" "}
          <button
            onClick={() => {
              setShowAuthModal(false);
              router.push("/auth/login");
            }}
            className="text-primary font-semibold hover:underline"
          >
            Log in here
          </button>
        </p>
      </div>
    )}
  </DialogContent>
</Dialog>
    </div>
  );
}