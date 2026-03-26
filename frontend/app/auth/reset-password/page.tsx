"use client";

import type React from "react";

import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { Check, Eye, EyeOff, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { apiClient } from "@/lib/apiClient";
import { useSearchParams } from "next/navigation";

function ResetPasswordContent() {
  const [formData, setFormData] = useState({
    password: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const searchParams = useSearchParams();
  const userEmail = searchParams.get("email");
  const otp = searchParams.get("code");
  const [loading, setLoading] = useState(false);
  const[apiError,setApiError]=useState("");

  console.log("Email:", userEmail);
 // Refs for OTP inputs

  
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
  e.preventDefault();

  setLoading(true);
  setApiError("");

  try {
    const errors: Record<string, string> = {};


    if (!formData.password) {
      errors.password = "Password is required.";
    } else if (!isPasswordValid) {
      errors.password = "Password does not meet security requirements.";
    }

    if (!formData.confirmPassword) {
      errors.confirmPassword = "Please confirm your password.";
    } else if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = "Passwords do not match.";
    }

    if (Object.keys(errors).length > 0) {
      setErrors(errors);
      return;
    }

    // API Call
    const response = await apiClient("user_service/reset_password/", {
      method: "POST",
      body: JSON.stringify({
        email: userEmail,
        new_password: formData.password,
        otp: otp,
      }),
    });

    if (response?.status === "failure") {
      setApiError(response?.message || "Something went wrong. Please try again.");
      return;
    }

    if (response?.code == 200) {
      window.location.href = "/auth/password-changed";
    } else {
      setApiError("Unexpected server response.");
    }

  } catch (error) {
    console.error("Reset password error:", error);
    setApiError("An unexpected error occurred. Please try again later.");
  } finally {
    setLoading(false);
  }
};

  // --- PASSWORD VALIDATION LOGIC START ---
  const passwordRequirements = useMemo(() => {
    const pwd = formData.password;
    return [
      { id: 1, label: "At least 8 characters", met: pwd.length >= 8 },
      { id: 2, label: "At least one uppercase letter", met: /[A-Z]/.test(pwd) },
      { id: 3, label: "At least one lowercase letter", met: /[a-z]/.test(pwd) },
      { id: 4, label: "At least one number", met: /\d/.test(pwd) },
      {
        id: 5,
        label: "At least one special character (@$!%*?&)",
        met: /[@$!%*?&#]/.test(pwd),
      },
    ];
  }, [formData.password]);

  const isPasswordValid = passwordRequirements.every((req) => req.met);

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
                Set new password
              </h1>
              <p className="text-slate-300">
                Secure Your Account With A New Password
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="New Password"
                  className="w-full px-4 py-3 rounded-lg bg-white border border-gray-300 focus:outline-none focus:ring-2 focus:ring-secondary pr-12"
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
                {errors.password && (
                  <p className="text-red-400 text-sm mt-1">{errors.password}</p>
                )}
              </div>

              <div className="relative">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Confirm New Password"
                  className="w-full px-4 py-3 rounded-lg bg-white border border-gray-300 focus:outline-none focus:ring-2 focus:ring-secondary pr-12"
                  value={formData.confirmPassword}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      confirmPassword: e.target.value,
                    })
                  }
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500"
                >
                  {showConfirmPassword ? (
                    <EyeOff size={20} />
                  ) : (
                    <Eye size={20} />
                  )}
                </button>
                {errors.confirmPassword && (
                  <p className="text-red-400 text-sm mt-1">
                    {errors.confirmPassword}
                  </p>
                )}
              </div>

              {/* PASSWORD STRENGTH INDICATOR */}
              <div className="bg-slate-700/50 p-3 rounded-lg space-y-2">
                <p className="text-xs text-slate-300 font-medium">
                  Password must contain:
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {passwordRequirements.map((req) => (
                    <div key={req.id} className="flex items-center space-x-2">
                      {req.met ? (
                        <Check className="w-3 h-3 text-green-400" />
                      ) : (
                        <X className="w-3 h-3 text-red-400" />
                      )}
                      <span
                        className={`text-xs ${
                          req.met ? "text-green-400" : "text-slate-400"
                        }`}
                      >
                        {req.label}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {errors.password && (
                <p className="text-red-400 text-sm mt-1">{errors.password}</p>
              )}

              <Button
                type="submit"
                  disabled={loading}

                className="w-full bg-secondary hover:bg-secondary text-slate-800 font-semibold py-3 rounded-lg"
              >
                {loading ? "Resetting..." : "Reset Password"}
              </Button>
              {
                <p className="text-red-400 text-sm mt-1">{apiError}</p>
              }

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
          className="absolute top-4 right-4 bg-secondary text-slate-800 border-secondary hover:bg-secondary"
          asChild
        >
          <Link href="/">Back to website →</Link>
        </Button>
        <div className="max-w-md">
          <Image
            width={600}
            height={600}
            src="/images/password-illustration.png"
            alt="Password reset illustration"
            className="w-full h-auto"
          />
        </div>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-50" />}>
      <ResetPasswordContent />
    </Suspense>
  );
}
