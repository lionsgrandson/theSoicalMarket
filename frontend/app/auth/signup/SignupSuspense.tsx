// app/auth/signup/SignupSuspense.tsx
"use client";

import { Suspense } from "react";
import SignupPage from "./SignupPage";
export default function SignupSuspense() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <SignupPage />
    </Suspense>
  );
}
