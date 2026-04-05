// components/EmptyState.tsx
// Phase 7: Reusable empty state for all dashboard pages.
//
// Usage:
//   <EmptyState
//     icon="📋"
//     title="No campaigns yet"
//     description="Create your first campaign to start connecting with influencers."
//     ctaLabel="Create campaign"
//     ctaHref="/brand-dashboard/campaigns/new"
//   />

import Link from "next/link";

interface EmptyStateProps {
  icon?: string;
  title: string;
  description?: string;
  ctaLabel?: string;
  ctaHref?: string;
  ctaOnClick?: () => void;
}

export default function EmptyState({
  icon = "📭",
  title,
  description,
  ctaLabel,
  ctaHref,
  ctaOnClick,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-6 text-center">
      <div className="text-5xl mb-4">{icon}</div>
      <h3 className="text-lg font-semibold text-primary mb-2">{title}</h3>
      {description && (
        <p className="text-gray-500 text-sm max-w-xs mb-6">{description}</p>
      )}
      {ctaLabel && ctaHref && (
        <Link
          href={ctaHref}
          className="bg-primary text-white font-medium px-6 py-2.5 rounded-lg hover:opacity-90 transition text-sm"
        >
          {ctaLabel}
        </Link>
      )}
      {ctaLabel && ctaOnClick && !ctaHref && (
        <button
          onClick={ctaOnClick}
          className="bg-primary text-white font-medium px-6 py-2.5 rounded-lg hover:opacity-90 transition text-sm"
        >
          {ctaLabel}
        </button>
      )}
    </div>
  );
}
