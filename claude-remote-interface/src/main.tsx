import React from 'react';
import ReactDOM from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { BrowserRouter } from 'react-router-dom';

import App from './App';
import './index.css';

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      cacheTime: 10 * 60 * 1000, // 10 minutes
      retry: 3,
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    },
    mutations: {
      retry: 1,
    },
  },
});

// Error boundary for the entire app
class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error?: Error }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('🚨 [App] Error caught by boundary:', error, errorInfo);
    
    // In production, you might want to log this to an error reporting service
    if (import.meta.env.PROD) {
      // Example: Sentry.captureException(error, { contexts: { react: errorInfo } });
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-background flex items-center justify-center p-8">
          <div className="max-w-md mx-auto text-center">
            <div className="mb-6">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-destructive/20 flex items-center justify-center">
                <svg
                  className="w-8 h-8 text-destructive"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                  />
                </svg>
              </div>
              <h1 className="text-2xl font-bold text-foreground mb-2">
                Something went wrong
              </h1>
              <p className="text-muted-foreground mb-6">
                Claude Code Remote encountered an unexpected error. Please try refreshing the page.
              </p>
              {import.meta.env.DEV && this.state.error && (
                <details className="text-left text-sm bg-muted p-4 rounded-lg mb-4">
                  <summary className="cursor-pointer font-medium">
                    Error Details (Development Mode)
                  </summary>
                  <pre className="mt-2 overflow-auto text-xs">
                    {this.state.error.stack}
                  </pre>
                </details>
              )}
              <button
                onClick={() => window.location.reload()}
                className="btn btn-primary btn-default"
              >
                Refresh Page
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Performance monitoring
const startTime = performance.now();

// Initialize the app
console.log('🚀 [App] Initializing Claude Code Remote Interface...');
console.log('🌍 [App] Environment:', import.meta.env.MODE);

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <App />
        </BrowserRouter>
        {import.meta.env.DEV && (
          <ReactQueryDevtools 
            initialIsOpen={false} 
            position="bottom-right"
          />
        )}
      </QueryClientProvider>
    </ErrorBoundary>
  </React.StrictMode>
);

// Log initialization time
window.addEventListener('load', () => {
  const loadTime = performance.now() - startTime;
  console.log(`⚡ [App] Loaded in ${Math.round(loadTime)}ms`);
});

// Service worker registration for PWA capabilities
if ('serviceWorker' in navigator && import.meta.env.PROD) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/sw.js')
      .then((registration) => {
        console.log('🔄 [SW] Service worker registered:', registration);
      })
      .catch((error) => {
        console.error('🚨 [SW] Service worker registration failed:', error);
      });
  });
}

// Global error handling
window.addEventListener('error', (event) => {
  console.error('🚨 [App] Global error:', event.error);
});

window.addEventListener('unhandledrejection', (event) => {
  console.error('🚨 [App] Unhandled promise rejection:', event.reason);
});

// Development hot reload info
if (import.meta.hot) {
  import.meta.hot.accept();
  console.log('🔥 [HMR] Hot module replacement is active');
}