// LoginRequiredModal.tsx
import Link from "next/link";
import { Button } from "./ui/button";
import { X } from "lucide-react"; // ← assuming you're using lucide-react icons

interface LoginRequiredModalProps {
  open: boolean;
  onClose: () => void;
  // priceId?: string;     // kept for future use (e.g. redirect with plan info)
}

export default function LoginRequiredModal({
  open,
  onClose,
}: LoginRequiredModalProps) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={onClose}           // ← click outside to close (common UX pattern)
    >
      {/* Stop propagation so clicking inside modal doesn't close it */}
      <div
        className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button – top right corner – very common pattern */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 p-1 text-gray-400 hover:text-gray-700 transition-colors"
          aria-label="Close modal"
        >
          <X size={20} />
        </button>

        <div className="px-8 pt-10 pb-8 text-center">
          {/* Icon / Illustration area (optional but looks pro) */}
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-blue-50">
            <svg
              className="h-8 w-8 text-primary"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M11 16l-4-4m0 0l4-4m-4 4h14"
              />
            </svg>
          </div>

          <h2 className="text-2xl font-semibold text-gray-900 mb-3">
            Login Required
          </h2>

          <p className="text-gray-600 mb-8 leading-relaxed">
            Please sign in to your account to continue with checkout 
            and complete your purchase.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              asChild
              size="lg"
              className="min-w-[140px] bg-primary"
            >
              <Link href="/auth/login">
                Sign in
              </Link>
            </Button>

            <Button
              variant="outline"
              size="lg"
              onClick={onClose}
              className="min-w-[140px]"
            >
              Cancel
            </Button>
          </div>

          {/* Optional trust / help text */}
          {/* <p className="mt-6 text-sm text-gray-500">
            Don’t have an account?{" "}
            <Link
              href="/auth/signup"
              className="text-blue-600 hover:text-blue-800 font-medium underline-offset-2 hover:underline"
            >
              Sign up
            </Link>
          </p> */}
        </div>
      </div>
    </div>
  );
}