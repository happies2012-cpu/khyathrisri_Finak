import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import Profile from "./pages/Profile";
import Settings from "./pages/Settings";
import Billing from "./pages/Billing";
import HostingAccounts from "./pages/HostingAccounts";
import DashboardDomains from "./pages/DashboardDomains";
import Support from "./pages/Support";
import Activity from "./pages/Activity";
import VPSHosting from "./pages/VPSHosting";
import WordPressHosting from "./pages/WordPressHosting";
import CloudHosting from "./pages/CloudHosting";
import Domains from "./pages/Domains";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/vps" element={<VPSHosting />} />
            <Route path="/wordpress" element={<WordPressHosting />} />
            <Route path="/cloud" element={<CloudHosting />} />
            <Route path="/domains" element={<Domains />} />
            
            {/* Protected Routes */}
            <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/dashboard/hosting" element={<ProtectedRoute><HostingAccounts /></ProtectedRoute>} />
            <Route path="/dashboard/hosting/new" element={<ProtectedRoute><HostingAccounts /></ProtectedRoute>} />
            <Route path="/dashboard/domains" element={<ProtectedRoute><DashboardDomains /></ProtectedRoute>} />
            <Route path="/dashboard/support" element={<ProtectedRoute><Support /></ProtectedRoute>} />
            <Route path="/dashboard/activity" element={<ProtectedRoute><Activity /></ProtectedRoute>} />
            <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
            <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
            <Route path="/billing" element={<ProtectedRoute><Billing /></ProtectedRoute>} />
            
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
