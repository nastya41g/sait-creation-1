
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Profile from "./pages/Profile";
import Catalog from "./pages/Catalog";
import Admin from "./pages/Admin";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/index.html" element={<Index />} />
          <Route path="/index_light.html" element={<Index forcedTheme="light" />} />
          <Route path="/login.html" element={<Login />} />
          <Route path="/register.html" element={<Register />} />
          <Route path="/profile.html" element={<Profile />} />
          <Route path="/catalog.html" element={<Catalog />} />
          <Route path="/admin.html" element={<Admin />} />
          <Route path="/light" element={<Navigate to="/index_light.html" replace />} />
          <Route path="/login" element={<Navigate to="/login.html" replace />} />
          <Route path="/register" element={<Navigate to="/register.html" replace />} />
          <Route path="/profile" element={<Navigate to="/profile.html" replace />} />
          <Route path="/catalog" element={<Navigate to="/catalog.html" replace />} />
          <Route path="/admin" element={<Navigate to="/admin.html" replace />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
