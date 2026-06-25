import React from "react";

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI.
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // You can also log the error to an error reporting service
    console.error("ErrorBoundary caught an error", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      // You can render any custom fallback UI
      return (
        <div className="h-screen w-full flex items-center justify-center bg-white dark:bg-slate-950 text-gray-900 dark:text-gray-50 flex-col gap-4">
          <h2 className="text-3xl font-bold text-teal-600 dark:text-teal-400">Something went wrong.</h2>
          <p className="text-lg">Please try refreshing the page.</p>
          <button 
            onClick={() => window.location.reload()}
            className="px-6 py-2.5 bg-gradient-to-r from-teal-500 to-blue-600 text-white rounded-lg font-bold shadow-md hover:scale-105 transition-all"
          >
            Reload Page
          </button>
        </div>
      );
    }

    return this.props.children; 
  }
}

export default ErrorBoundary;
