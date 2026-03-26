'use client';
import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from 'next/link';
import { FaUserGroup } from "react-icons/fa6";

function InfluencerSubscriptionRequiredContent() {
  const searchParams = useSearchParams();
  const reason = searchParams.get('reason');

  const getMessage = () => {
    switch(reason) {
      case 'subscription_inactive':
        return 'Your subscription is not active. Please renew your subscription.';
      case 'wrong_plan_type':
        return 'Your current plan is for brands. Switch to a Influencer or (Brand + Influencer) plan to access the Influencer Dashboard.';
      default:
        return 'You need an Influencer subscription to access the Influencer Dashboard.';
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow">
        <div className="text-center">
          <FaUserGroup className="mx-auto h-12 w-12 text-primary" />
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            Influencer Dashboard Access Required
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            {getMessage()}
          </p>
        </div>
        
        <div className="bg-primary/10 p-4 rounded-md">
          <h3 className="text-sm font-medium text-primary">Available Plans for Influencers:</h3>
          <ul className="mt-2 text-sm text-primary space-y-1">
            <li>✓ <strong>Influencer Plan</strong> - Full influencer features</li>
            <li>✓ <strong>Brand + Influencer Access</strong> – Access to both Brand and Influencer dashboards</li>

          </ul>
        </div>

        <div className="space-y-4">
          <Link
            href="/pricing?type=influencer"
            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary"
          >
            View Influencer Plans
          </Link>
          {/* <Link
            href="/influencer-dashboard"
            className="w-full flex justify-center py-3 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            Go to My Dashboard
          </Link> */}
        </div>
      </div>
    </div>
  );
}

export default function InfluencerSubscriptionRequired() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-gray-50" />}>
      <InfluencerSubscriptionRequiredContent />
    </Suspense>
  );
}