import React, { Suspense } from "react";
import BrandOnboarding from "./BrandOnboardingPage";

const BrandOnboardingSuspense = () => {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <BrandOnboarding />
    </Suspense>
  );
};

export default BrandOnboardingSuspense;
