'use client';

import { Suspense, ReactNode } from 'react';

interface SubscriptionRedirectWrapperProps {
  children: ReactNode;
}

export default function SubscriptionRedirectWrapper({ children }: SubscriptionRedirectWrapperProps) {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full space-y-8 p-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-3/4 mx-auto mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2 mx-auto mb-8"></div>
            <div className="h-12 bg-gray-200 rounded mb-4"></div>
            <div className="h-10 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    }>
      {children}
    </Suspense>
  );
}