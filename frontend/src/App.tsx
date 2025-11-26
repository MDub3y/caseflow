import React, { useEffect, useState } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { useAuthStore } from "./store/authStore";
import { Login } from "./pages/Login";
import { ImportPage } from "./pages/ImportPage";
import { CasesList } from "./pages/CasesList";
import { CaseDetails } from "./pages/CaseDetails";
import { LandingPage } from "./pages/LandingPage";
import { Toaster } from "@/components/ui/toaster";
import { ThemeProvider } from "@/components/theme-provider";
import { Layout } from "./components/Layout";
import { Loader2 } from "lucide-react";

const PrivateRoute: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { isAuthenticated } = useAuthStore();
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />;
};

const PublicRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuthStore();
  return isAuthenticated ? <Navigate to="/import" replace /> : <>{children}</>;
};

const App: React.FC = () => {
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    setIsInitialized(true);
  }, []);

  if (!isInitialized) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <ThemeProvider defaultTheme="dark" storageKey="caseflow-theme">
      <Router>
        <Routes>
          <Route
            path="/"
            element={
              <PublicRoute>
                <LandingPage />
              </PublicRoute>
            }
          />
          <Route
            path="/login"
            element={
              <PublicRoute>
                <Login />
              </PublicRoute>
            }
          />

          <Route
            path="/import"
            element={
              <PrivateRoute>
                <Layout>
                  <ImportPage />
                </Layout>
              </PrivateRoute>
            }
          />
          <Route
            path="/cases"
            element={
              <PrivateRoute>
                <Layout>
                  <CasesList />
                </Layout>
              </PrivateRoute>
            }
          />
          <Route
            path="/cases/:id"
            element={
              <PrivateRoute>
                <Layout>
                  <CaseDetails />
                </Layout>
              </PrivateRoute>
            }
          />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        <Toaster />
      </Router>
    </ThemeProvider>
  );
};

export default App;
