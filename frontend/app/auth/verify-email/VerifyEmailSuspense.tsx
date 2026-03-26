import React, { Suspense } from "react";
import VerifyEmailPage from "./VerifyEmailPage";

const VerifyEmailSuspense = () => {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <VerifyEmailPage />
    </Suspense>
  );
};

export default VerifyEmailSuspense;
