
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useState } from "react";

// Pages
import Index from "./pages/Index";
import Dashboard from "./pages/Dashboard";
import Clients from "./pages/Clients";
import ClientDetails from "./pages/Clients/ClientDetails";
import Cashflow from "./pages/Cashflow";
import Transactions from "./pages/Transactions";
import Accounts from "./pages/Accounts";
import NotFound from "./pages/NotFound";

// Types
import { UserRole } from "./types";
import Categories from "./pages/Categories";

const queryClient = new QueryClient();

const App = () => {
  // In a real app, this would come from authentication
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState<UserRole>("accountant");

  // Mock login function (for demo only)
  const handleLogin = (role: UserRole) => {
    setUserRole(role);
    setIsAuthenticated(true);
  };

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route 
              path="/" 
              element={
                isAuthenticated ? (
                  <Navigate to="/dashboard" replace />
                ) : (
                  <Index onLogin={handleLogin} />
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
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
