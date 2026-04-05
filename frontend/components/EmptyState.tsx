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
  icon = "No items",
  title,
  description,
  ctaLabel,
  ctaHref,
  ctaOnClick,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-20 text-center">
      <div className="mb-4 text-5xl">{icon}</div>
      <h3 className="mb-2 text-lg font-semibold text-primary">{title}</h3>
      {description && (
        <p className="mb-6 max-w-xs text-sm text-gray-500">{description}</p>
      )}
      {ctaLabel && ctaHref && (
        <Link
          href={ctaHref}
          className="rounded-lg bg-primary px-6 py-2.5 text-sm font-medium text-white transition hover:opacity-90"
        >
          {ctaLabel}
        </Link>
      )}
      {ctaLabel && ctaOnClick && !ctaHref && (
        <button
          onClick={ctaOnClick}
          className="rounded-lg bg-primary px-6 py-2.5 text-sm font-medium text-white transition hover:opacity-90"
        >
          {ctaLabel}
        </button>
      )}
    </div>
  );
}
