import React, { Suspense } from "react";
import InfluencerOnboardingPage from "./InfluencerOnboardingPage";

const InfluencerOnboardingSuspense = () => {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <InfluencerOnboardingPage />
    </Suspense>
  );
};

export default InfluencerOnboardingSuspense;
