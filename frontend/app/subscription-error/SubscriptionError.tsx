'use client';
import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from 'next/link';
import { FaExclamationTriangle } from "react-icons/fa";

function SubscriptionErrorContent() {
  const searchParams = useSearchParams();
  const message = searchParams.get('message') || 'Error verifying subscription';

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow">
        <div className="text-center">
          <FaExclamationTriangle className="mx-auto h-12 w-12 text-red-600" />
          <h2 className="mt-6 text-3xl font-extrabold text-primary">
            Subscription Error
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            {message}
          </p>
          <p className="mt-2 text-sm text-gray-500">
            Please try again or contact support if the issue persists.
          </p>
        </div>
        <div className="space-y-4">
          <Link
            href="/home_dashboard"
            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary"
          >
            Try Again
          </Link>
          <Link
            href="mailto:info@thesocialmarket.ai"
            className="w-full flex justify-center py-3 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-primary bg-white hover:bg-gray-50"
          >
            Contact Support
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function SubscriptionError() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-gray-50" />}>
      <SubscriptionErrorContent />
    </Suspense>
  );
}