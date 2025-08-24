import React, { Suspense, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'sonner';
import { useHotkeys } from 'react-hotkeys-hook';

import { useAuthStore } from '@/stores/auth-store';
import { useUIStore } from '@/stores/ui-store';
import { useWebSocketStore } from '@/stores/websocket-store';
import { ErrorBoundary } from '@/components/ui/error-boundary';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { ThemeProvider } from '@/providers/theme-provider';

// Layout Components
import { AppLayout } from '@/components/layout/app-layout';
import { AuthLayout } from '@/components/layout/auth-layout';

// Page Components (Lazy loaded)
const Dashboard = React.lazy(() => import('@/pages/dashboard'));
const Chat = React.lazy(() => import('@/pages/chat'));
const Agents = React.lazy(() => import('@/pages/agents'));
const Projects = React.lazy(() => import('@/pages/projects'));
const Files = React.lazy(() => import('@/pages/files'));
const Settings = React.lazy(() => import('@/pages/settings'));
const Analytics = React.lazy(() => import('@/pages/analytics'));

// Auth Pages
const Login = React.lazy(() => import('@/pages/auth/login'));
const Register = React.lazy(() => import('@/pages/auth/register'));
const AuthCallback = React.lazy(() => import('@/pages/auth/callback'));

// Utility Pages
const NotFound = React.lazy(() => import('@/pages/not-found'));

function App() {
  const { user, initialize: initializeAuth, isInitializing } = useAuthStore();
  const { theme, toggleTheme } = useUIStore();
  const { 
    initialize: initializeWebSocket, 
    connectionState 
  } = useWebSocketStore();

  // Initialize application
  useEffect(() => {
    const initializeApp = async () => {
      console.log('🚀 [App] Initializing application...');
      
      try {
        // Initialize authentication first
        await initializeAuth();
        
        // Initialize WebSocket connection if user is authenticated
        if (user) {
          await initializeWebSocket();
        }
        
        console.log('✅ [App] Application initialized successfully');
        
      } catch (error) {
        console.error('🚨 [App] Application initialization failed:', error);
      }
    };

    initializeApp();
  }, [initializeAuth, initializeWebSocket, user]);

  // Global keyboard shortcuts
  useHotkeys('ctrl+k,cmd+k', (e) => {
    e.preventDefault();
    // Open command palette
    console.log('🔍 [App] Command palette shortcut triggered');
  });

  useHotkeys('ctrl+shift+d,cmd+shift+d', (e) => {
    e.preventDefault();
    toggleTheme();
  });

  useHotkeys('ctrl+/,cmd+/', (e) => {
    e.preventDefault();
    // Show keyboard shortcuts help
    console.log('⌨️ [App] Keyboard shortcuts help triggered');
  });

  // Show loading screen during initialization
  if (isInitializing) {
    return <AppLoadingScreen />;
  }

  return (
    <ThemeProvider defaultTheme={theme} storageKey="claude-remote-theme">
      <div className="min-h-screen bg-background text-foreground">
        <ErrorBoundary>
          <Routes>
            {/* Public Routes */}
            <Route path="/auth/*" element={
              <Suspense fallback={<PageLoadingFallback />}>
                <AuthLayout>
                  <Routes>
                    <Route path="login" element={<Login />} />
                    <Route path="register" element={<Register />} />
                    <Route path="callback" element={<AuthCallback />} />
                    <Route path="*" element={<Navigate to="/auth/login" replace />} />
                  </Routes>
                </AuthLayout>
              </Suspense>
            } />

            {/* Protected Routes */}
            <Route path="/*" element={
              <ProtectedRoute>
                <Suspense fallback={<PageLoadingFallback />}>
                  <AppLayout>
                    <Routes>
                      <Route index element={<Navigate to="/dashboard" replace />} />
                      <Route path="dashboard" element={<Dashboard />} />
                      <Route path="chat" element={<Chat />} />
                      <Route path="agents" element={<Agents />} />
                      <Route path="projects" element={<Projects />} />
                      <Route path="files" element={<Files />} />
                      <Route path="settings" element={<Settings />} />
                      <Route path="analytics" element={<Analytics />} />
                      <Route path="*" element={<NotFound />} />
                    </Routes>
                  </AppLayout>
                </Suspense>
              </ProtectedRoute>
            } />
          </Routes>
        </ErrorBoundary>

        {/* Global Components */}
        <Toaster 
          position="bottom-right"
          theme={theme === 'dark' ? 'dark' : 'light'}
          richColors
          closeButton
        />
        
        {/* Connection Status Indicator */}
        <ConnectionStatusIndicator />
        
        {/* Development Tools */}
        {import.meta.env.DEV && <DevTools />}
      </div>
    </ThemeProvider>
  );
}

/**
 * Protected Route Component
 */
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user } = useAuthStore();

  if (!user) {
    return <Navigate to="/auth/login" replace />;
  }

  return <>{children}</>;
}

/**
 * App Loading Screen
 */
function AppLoadingScreen() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center">
        <div className="mb-8">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-r from-claude-500 to-primary p-3">
            <svg
              className="w-full h-full text-white animate-pulse"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold gradient-text mb-2">
            Claude Code Remote
          </h1>
          <p className="text-muted-foreground">
            Initializing advanced AI coordination...
          </p>
        </div>
        <LoadingSpinner size="lg" />
        <div className="mt-4 space-y-2">
          <div className="animate-pulse text-sm text-muted-foreground">
            Loading agents and systems...
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Page Loading Fallback
 */
function PageLoadingFallback() {
  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="text-center">
        <LoadingSpinner size="lg" className="mb-4" />
        <p className="text-muted-foreground">Loading page...</p>
      </div>
    </div>
  );
}

/**
 * Connection Status Indicator
 */
function ConnectionStatusIndicator() {
  const { connectionState } = useWebSocketStore();

  if (connectionState.status === 'connected') {
    return null; // Don't show indicator when connected
  }

  return (
    <div className="fixed top-4 right-4 z-50">
      <div className="bg-card border rounded-lg px-3 py-2 shadow-lg flex items-center gap-2">
        <div className={`status-dot ${
          connectionState.status === 'connecting' || connectionState.status === 'reconnecting'
            ? 'status-dot-connecting'
            : 'status-dot-disconnected'
        }`} />
        <span className="text-sm font-medium">
          {connectionState.status === 'connecting' && 'Connecting...'}
          {connectionState.status === 'reconnecting' && 'Reconnecting...'}
          {connectionState.status === 'disconnected' && 'Disconnected'}
          {connectionState.status === 'error' && 'Connection Error'}
        </span>
      </div>
    </div>
  );
}

/**
 * Development Tools
 */
function DevTools() {
  const [showDevPanel, setShowDevPanel] = React.useState(false);

  useHotkeys('ctrl+shift+dev', () => {
    setShowDevPanel(!showDevPanel);
  });

  if (!showDevPanel) {
    return null;
  }

  return (
    <div className="fixed bottom-4 left-4 z-50 bg-card border rounded-lg p-4 shadow-lg max-w-sm">
      <div className="flex justify-between items-center mb-2">
        <h3 className="font-semibold text-sm">Dev Tools</h3>
        <button
          onClick={() => setShowDevPanel(false)}
          className="text-muted-foreground hover:text-foreground"
        >
          ✕
        </button>
      </div>
      <div className="space-y-2 text-xs">
        <div>Environment: {import.meta.env.MODE}</div>
        <div>Hot Reload: {import.meta.hot ? '✅' : '❌'}</div>
        <div>React StrictMode: ✅</div>
      </div>
    </div>
  );
}

export default App;