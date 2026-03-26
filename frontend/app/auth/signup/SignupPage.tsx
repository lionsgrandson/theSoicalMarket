"use client";

import type React from "react";
import Cookies from "js-cookie";
import { useMemo, useState, Suspense } from "react";
import Link from "next/link";
import { Check, Eye, EyeOff, Loader2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { setAuthFromResponse, signup } from "@/lib/auth";
import { signIn } from "next-auth/react";

function SignupPageContent() {
  const router = useRouter();
  const params = useSearchParams();
  const returnTo = params.get("returnTo") || "";
  const result = params.get("role")
  console.log("current to where go",returnTo ,result);
  

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    password: "",
    confirmPassword: "",
    agreeToTerms: false,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  // --- PASSWORD VALIDATION LOGIC START ---
  const passwordRequirements = useMemo(() => {
    const pwd = formData.password;
    return [
      { id: 1, label: "At least 8 characters", met: pwd.length >= 8 },
      { id: 2, label: "At least one uppercase letter", met: /[A-Z]/.test(pwd) },
      { id: 3, label: "At least one lowercase letter", met: /[a-z]/.test(pwd) },
      { id: 4, label: "At least one number", met: /\d/.test(pwd) },
      { id: 5, label: "At least one special character (@$!%*?&)", met: /[@$!%*?&#]/.test(pwd) },
    ];
  }, [formData.password]);

  const isPasswordValid = passwordRequirements.every((req) => req.met);
  // --- PASSWORD VALIDATION LOGIC END ---
const isFormValid =
  formData.first_name.trim() !== "" &&
  formData.last_name.trim() !== "" &&
  formData.email.trim() !== "" &&
  formData.password !== "" &&
  isPasswordValid &&
  formData.password === formData.confirmPassword &&
  formData.agreeToTerms;


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: { [key: string]: string } = {};

    if (!formData.first_name) newErrors.firstName = "First name is required";
    if (!formData.last_name) newErrors.lastName = "Last name is required";
    if (!formData.email) newErrors.email = "Email is required";
    if (!formData.password) newErrors.password = "Password is required";

    // Strict Password Validation on Submit
    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (!isPasswordValid) {
      newErrors.password = "Password does not meet security requirements";
    }

    if (formData.password !== formData.confirmPassword)
      newErrors.confirmPassword = "Passwords do not match";
    if (!formData.agreeToTerms)
      newErrors.agreeToTerms = "You must agree to the terms";

    setErrors(newErrors);
    setLoading(true);
    

    if (formData.first_name && formData.last_name && formData.email && formData.password && formData.password === formData.confirmPassword && formData.agreeToTerms) {
      try {
      const res = await signup({
        ...formData,
        signup_method: "normal",
        signed_up_as: result ?? undefined,
        state: result ?? undefined,
      });
      if (typeof window !== "undefined") {
      localStorage.setItem("access_token", res.data.access_token);
    }
      setAuthFromResponse(res);
      

      if (res.status === "Success") {
        router.push(`/auth/verify-email?returnTo=${returnTo}`);
      } else {
        setError(res?.error || "Signup failed");
      }

    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "signup failed";
      setError(message);
    } finally {
      setLoading(false);
    }
    }
    

   
  };

const handleGoogleSignUp = async () => {
  if (result) {
    Cookies.set("signup_role", result, {
      expires: 1,
      sameSite: "lax",
    });
  }
  signIn("google", {
    callbackUrl: `/home_dashboard`,
  });
};

const handleAppleSignUp = async () => {
  if (result) {
    Cookies.set("signup_role", result, {
      expires: 1,
      sameSite: "lax",
    });
  }
  signIn("apple", {
    callbackUrl: `/home_dashboard`,
  });
};

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Left Side - Form */}
      <div className="w-full lg:w-1/2 bg-slate-800 flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center p-6">
          <Link href={"/"}>
            <div className="flex-shrink-0">
              <Image
                priority
                width={160}
                height={45}
                alt="social market"
                src={"/images/logo.png"}
              />
            </div>
          </Link>
        </div>

        {/* Form Content */}
        <div className="flex-1 flex items-center justify-center px-6 py-8">
          <div className="w-full max-w-xl">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-white mb-2">
                Create an account
              </h1>
              <p className="text-slate-300">
                Join today and earn money collaborating with top brands!
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <input
                    type="text"
                    placeholder="First name"
                    className="w-full px-4 py-3 rounded-lg bg-white border border-gray-300 focus:outline-none focus:ring-2 focus:ring-secondary"
                    value={formData.first_name}
                    onChange={(e) =>
                      setFormData({ ...formData, first_name: e.target.value })
                    }
                  />
                  {errors.firstName && (
                    <p className="text-red-400 text-sm mt-1">
                      {errors.firstName}
                    </p>
                  )}
                </div>
                <div>
                  <input
                    type="text"
                    placeholder="Last name"
                    className="w-full px-4 py-3 rounded-lg bg-white border border-gray-300 focus:outline-none focus:ring-2 focus:ring-secondary"
                    value={formData.last_name}
                    onChange={(e) =>
                      setFormData({ ...formData, last_name: e.target.value })
                    }
                  />
                  {errors.lastName && (
                    <p className="text-red-400 text-sm mt-1">
                      {errors.lastName}
                    </p>
                  )}
                </div>
              </div>

              <div>
                <div className="relative">
                  <input
                    type="email"
                    placeholder="Email"
                    className="w-full px-4 py-3 pl-12 rounded-lg bg-white border border-gray-300 focus:outline-none focus:ring-2 focus:ring-secondary"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                  />
                  <svg
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                    />
                  </svg>
                </div>
                {errors.email && (
                  <p className="text-red-400 text-sm mt-1">{errors.email}</p>
                )}
              </div>

              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="password"
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

              <div className="relative">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Confirm password"
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

              <div>
                <label className="flex items-start gap-2">
                  <input
                    type="checkbox"
                    checked={formData.agreeToTerms}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        agreeToTerms: e.target.checked,
                      })
                    }
                    className="mt-1"
                  />
                  <span className="text-white text-sm">
                    I agree to the{" "}
                    <Link
                      href="/privacy"
                      className="text-secondary hover:text-yellow-400"
                    >
                      Terms & conditions
                    </Link>
                  </span>
                </label>
                {errors.agreeToTerms && (
                  <p className="text-red-400 text-sm mt-1">
                    {errors.agreeToTerms}
                  </p>
                )}
              </div>
              <p className="text-red-400 text-sm mt-1">{error}</p>

              <Button
                type="submit"
                disabled={!isFormValid || loading}
                title={!isFormValid ? "Please complete all required fields" : ""}
                className="w-full cursor-pointer bg-secondary hover:bg-secondary text-slate-800 font-semibold py-3 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating account...
                  </>
                ) : (
                  "Create account"
                )}
              </Button>

              <div className="text-center">
                <span className="text-slate-400">
                  Already have an account?{" "}
                  <Link className="text-secondary" href={"/auth/login"}>
                    Login
                  </Link>
                </span>
              </div>

              <div className="text-center">
                <span className="text-slate-400">or</span>
              </div>

              <Button
                type="button"
                variant="outline"
                className="w-full border-[#F7F8F9]/60 border-2 text-white hover:bg-primary hover:text-white py-5 cursor-pointer rounded-lg bg-transparent"
                onClick={handleGoogleSignUp}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  className="h-5 w-5"
                >
                  {/* Colorful Google Icon using official brand colors */}
                  <path
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    fill="#4285F4"
                  ></path>
                  <path
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    fill="#34A853"
                  ></path>
                  <path
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
                    fill="#FBBC05"
                  ></path>
                  <path
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    fill="#EA4335"
                  ></path>
                  <path d="M1 1h22v22H1z" fill="none"></path>
                </svg>
                Continue with Google
              </Button>

              <Button
                type="button"
                onClick={handleAppleSignUp}
                variant="outline"
                className="w-full border-[#F7F8F9]/60 border-2 text-white hover:bg-primary hover:text-white  py-5 cursor-pointer rounded-lg bg-transparent"
              >
                <svg
                  className="w-5 h-5 mr-2"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
                </svg>
                Continue with Apple
              </Button>
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
        <div className="max-w-md text-center">
          <Image
            width={600}
            height={600}
            src="/images/signup-illustration.png"
            alt="Signup illustration"
            className="w-full h-auto mb-6"
          />
          {/* <p className="text-slate-600 text-lg">
            <span className="underline font-semibold">Sign up</span> and get{" "}
            <span className="font-semibold">14 days free trial</span>
          </p> */}
        </div>
      </div>
    </div>
  );
}

export default function SignupPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-50 flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-slate-800" /></div>}>
      <SignupPageContent />
    </Suspense>
  );
}
