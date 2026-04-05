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
    if (process.env.NODE_ENV === "development") {
      console.error("[ErrorBoundary]", error);
    }
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;

      return (
        <div className="flex flex-col items-center justify-center rounded-xl border border-red-100 bg-red-50 px-6 py-12 text-center">
          <div className="mb-3 text-3xl">!</div>
          <p className="mb-1 text-sm font-medium text-red-700">
            Something went wrong loading this section
          </p>
          <p className="mb-4 text-xs text-red-500">Try refreshing the page</p>
          <button
            onClick={() => this.setState({ hasError: false, errorMessage: "" })}
            className="rounded-lg border border-red-200 bg-white px-4 py-1.5 text-xs text-red-700 transition hover:bg-red-50"
          >
            Try again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
