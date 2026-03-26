'use client';
import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from 'next/link';

function SubscriptionRequiredContent() {
  const searchParams = useSearchParams();
  const message = searchParams.get('message') || 'Subscription required';

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Subscription Required For Dashboard Access 
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            {message}
          </p>
        </div>
        <div className="space-y-4">
          <Link
            href="/pricing"
            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary"
          >
            View Pricing Plans
          </Link>
          <Link
            href="/"
            className="w-full flex justify-center py-3 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-primary bg-white hover:bg-gray-50"
          >
            Return to Home
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function SubscriptionRequired() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-gray-50" />}>
      <SubscriptionRequiredContent />
    </Suspense>
  );
}