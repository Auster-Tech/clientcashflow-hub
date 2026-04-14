import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ClientProvider } from "@/contexts/ClientContext";
import { TranslationProvider } from "@/contexts/TranslationContext";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { ApiConfigurator } from "@/components/ApiConfigurator";

// Pages
import Index from "./pages/Index";
import Dashboard from "./pages/Dashboard";
import Clients from "./pages/Clients";
import ClientDetails from "./pages/Clients/ClientDetails";
import Cashflow from "./pages/Cashflow";
import Transactions from "./pages/Transactions";
import Accounts from "./pages/Accounts";
import NotFound from "./pages/NotFound";
import CostCenters from "./pages/CostCenters";
import Partners from "./pages/Partners";
import Invoices from "./pages/Invoices";
import Categories from "./pages/Categories";

const queryClient = new QueryClient();

function AppRoutes() {
  const { isAuthenticated, user } = useAuth();
  const userRole = (user?.role as any) ?? 'client-user';

  return (
    <>
      <ApiConfigurator />
      <Routes>
        <Route
          path="/"
          element={
            isAuthenticated ? (
              <Navigate to="/dashboard" replace />
            ) : (
              <Index />
            )
          }
        />
        <Route
          path="/dashboard"
          element={
            isAuthenticated ? (
              <Dashboard userRole={userRole} />
            ) : (
              <Navigate to="/" replace />
            )
          }
        />
        <Route
          path="/clients"
          element={
            isAuthenticated && userRole === "accountant" ? (
              <Clients />
            ) : (
              <Navigate to={isAuthenticated ? "/dashboard" : "/"} replace />
            )
          }
        />
        <Route
          path="/clients/:id"
          element={
            isAuthenticated && userRole === "accountant" ? (
              <ClientDetails />
            ) : (
              <Navigate to={isAuthenticated ? "/dashboard" : "/"} replace />
            )
          }
        />
        <Route
          path="/cashflow"
          element={
            isAuthenticated ? (
              <Cashflow userRole={userRole} />
            ) : (
              <Navigate to="/" replace />
            )
          }
        />
        <Route
          path="/transactions"
          element={
            isAuthenticated ? (
              <Transactions userRole={userRole} />
            ) : (
              <Navigate to="/" replace />
            )
          }
        />
        <Route
          path="/accounts"
          element={
            isAuthenticated ? (
              <Accounts userRole={userRole} />
            ) : (
              <Navigate to="/" replace />
            )
          }
        />
        <Route
          path="/categories"
          element={
            isAuthenticated ? (
              <Categories userRole={userRole} />
            ) : (
              <Navigate to="/" replace />
            )
          }
        />
        <Route
          path="/cost-centers"
          element={
            isAuthenticated ? (
              <CostCenters userRole={userRole} />
            ) : (
              <Navigate to="/" replace />
            )
          }
        />
        <Route
          path="/partners"
          element={
            isAuthenticated ? (
              <Partners userRole={userRole} />
            ) : (
              <Navigate to="/" replace />
            )
          }
        />
        <Route
          path="/invoices"
          element={
            isAuthenticated ? (
              <Invoices userRole={userRole} />
            ) : (
              <Navigate to="/" replace />
            )
          }
        />
        {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  );
}

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <TranslationProvider>
        <AuthProvider>
          <ClientProvider>
            <TooltipProvider>
              <Toaster />
              <Sonner />
              <BrowserRouter>
                <AppRoutes />
              </BrowserRouter>
            </TooltipProvider>
          </ClientProvider>
        </AuthProvider>
      </TranslationProvider>
    </QueryClientProvider>
  );
};

export default App;
