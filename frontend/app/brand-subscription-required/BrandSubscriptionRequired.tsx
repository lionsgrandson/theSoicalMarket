"use client"
import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from 'next/link';
import { PiBuildingOffice } from "react-icons/pi";
function BrandSubscriptionRequiredContent() {
  const searchParams = useSearchParams();
  const reason = searchParams.get('reason');

  const getMessage = () => {
    switch(reason) {
      case 'subscription_inactive':
        return 'Your subscription is not active. Please renew your subscription.';
      case 'wrong_plan_type':
        return 'Your current plan is for influencers. Upgrade to a Business or (Brand + Influencer Access) plan to access the Brand Dashboard.';
      default:
        return 'You need a Business subscription to access the Brand Dashboard.';
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow">
        <div className="text-center">
          <PiBuildingOffice className="mx-auto h-12 w-12 text-primary" />
          <h2 className="mt-6 text-3xl font-extrabold text-primary">
            Brand Dashboard Access Required
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            {getMessage()}
          </p>
        </div>
        
        <div className="bg-blue-50 p-4 rounded-md">
          <h3 className="text-sm font-medium text-primary">Available Plans for Brands:</h3>
          <ul className="mt-2 text-sm text-primary space-y-1">
            <li>✓ <strong>Business Plan</strong> - Full brand features</li>
            <li>✓ <strong>Brand + Influencer Access</strong> – Access to both Brand and Influencer dashboards</li>

          </ul>
        </div>

        <div className="space-y-4">
          <Link
            href="/pricing?type=brand"
            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary"
          >
            View Brand Plans
          </Link>
          {/* <Link
            href="/brand-dashboard"
            className="w-full flex justify-center py-3 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            Go to My Dashboard
          </Link> */}
        </div>
      </div>
    </div>
  );
}

export default function BrandSubscriptionRequired() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-gray-50" />}>
      <BrandSubscriptionRequiredContent />
    </Suspense>
  );
}