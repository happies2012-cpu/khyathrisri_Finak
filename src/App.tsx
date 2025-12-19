import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import Index from "./pages/Index";
import LandingPage from "./pages/LandingPage";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import Profile from "./pages/Profile";
import Settings from "./pages/Settings";
import Billing from "./pages/Billing";
import CartPage from "./components/cart/CartPage";
import HostingAccounts from "./pages/HostingAccounts";
import DashboardDomains from "./pages/DashboardDomains";
import Support from "./pages/Support";
import Activity from "./pages/Activity";
import VPSHosting from "./pages/VPSHosting";
import WordPressHosting from "./pages/WordPressHosting";
import CloudHosting from "./pages/CloudHosting";
import Domains from "./pages/Domains";
import NotFound from "./pages/NotFound";
import Footer from '@/components/layout/Footer';
import Terms from '@/pages/Terms';
import Privacy from '@/pages/Privacy';
import Admin from '@/pages/Admin';
import Orders from '@/pages/Orders';
import Invoices from '@/pages/Invoices';
import HostingControlPanel from '@/pages/HostingControlPanel';
import RequireRole from '@/components/auth/RequireRole';

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
            <Route path="/" element={<LandingPage />} />
            <Route path="/index" element={<Index />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/vps" element={<VPSHosting />} />
            <Route path="/wordpress" element={<WordPressHosting />} />
            <Route path="/cloud" element={<CloudHosting />} />
            <Route path="/domains" element={<Domains />} />
            <Route path="/terms" element={<Terms />} />
            <Route path="/privacy" element={<Privacy />} />
            <Route path="/admin" element={<ProtectedRoute><RequireRole role="admin"><Admin /></RequireRole></ProtectedRoute>} />
            <Route path="/orders" element={<ProtectedRoute><RequireRole role="admin"><Orders /></RequireRole></ProtectedRoute>} />
            <Route path="/invoices" element={<ProtectedRoute><RequireRole role="admin"><Invoices /></RequireRole></ProtectedRoute>} />
            
            {/* Protected Routes */}
            <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/dashboard/hosting" element={<ProtectedRoute><HostingAccounts /></ProtectedRoute>} />
            <Route path="/dashboard/hosting/new" element={<ProtectedRoute><HostingAccounts /></ProtectedRoute>} />
            <Route path="/dashboard/domains" element={<ProtectedRoute><DashboardDomains /></ProtectedRoute>} />
            <Route path="/dashboard/support" element={<ProtectedRoute><Support /></ProtectedRoute>} />
            <Route path="/hosting/control-panel/:accountId" element={<ProtectedRoute><HostingControlPanel /></ProtectedRoute>} />
            <Route path="/dashboard/activity" element={<ProtectedRoute><Activity /></ProtectedRoute>} />
            <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
            <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
            <Route path="/billing" element={<ProtectedRoute><Billing /></ProtectedRoute>} />
            <Route path="/cart" element={<ProtectedRoute><CartPage /></ProtectedRoute>} />
            
            <Route path="*" element={<NotFound />} />
          </Routes>
          <Footer />
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
