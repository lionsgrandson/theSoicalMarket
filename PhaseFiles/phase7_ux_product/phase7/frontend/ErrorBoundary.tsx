// components/ErrorBoundary.tsx
// Phase 7: Wraps any dashboard section so a single crash doesn't
// wipe the whole page. Wrap any component that makes API calls.
//
// Usage:
//   <ErrorBoundary>
//     <CampaignsSection />
//   </ErrorBoundary>

"use client";

import React from "react";

interface Props {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

interface State {
  hasError: boolean;
  errorMessage: string;
}

export default class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, errorMessage: "" };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, errorMessage: error.message };
  }

  componentDidCatch(error: Error) {
    // Log to console in development only
    if (process.env.NODE_ENV === "development") {
      console.error("[ErrorBoundary]", error);
    }
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;

      return (
        <div className="flex flex-col items-center justify-center py-12 px-6 text-center bg-red-50 rounded-xl border border-red-100">
          <div className="text-3xl mb-3">⚠️</div>
          <p className="text-sm font-medium text-red-700 mb-1">
            Something went wrong loading this section
          </p>
          <p className="text-xs text-red-500 mb-4">
            Try refreshing the page
          </p>
          <button
            onClick={() => this.setState({ hasError: false, errorMessage: "" })}
            className="text-xs bg-white border border-red-200 text-red-700 px-4 py-1.5 rounded-lg hover:bg-red-50 transition"
          >
            Try again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
