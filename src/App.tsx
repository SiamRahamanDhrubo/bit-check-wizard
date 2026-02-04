import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import GameSelection from "./pages/GameSelection";
import OSSelection from "./pages/OSSelection";
import AndroidMusicSelection from "./pages/AndroidMusicSelection";
import AndroidArchitecture from "./pages/AndroidArchitecture";
import GeometryDashOS from "./pages/GeometryDashOS";
import UpGraderlyDownload from "./pages/UpGraderlyDownload";
import Architecture from "./pages/Architecture";
import Download from "./pages/Download";
import Redeem from "./pages/Redeem";
import AdminCodes from "./pages/AdminCodes";
import AdminUsers from "./pages/AdminUsers";
import AdminRobloxCodes from "./pages/AdminRobloxCodes";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<GameSelection />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/os-selection" element={<OSSelection />} />
            <Route path="/android-architecture" element={<AndroidArchitecture />} />
            <Route path="/android-music" element={<AndroidMusicSelection />} />
            <Route path="/geometry-dash-os" element={<GeometryDashOS />} />
            <Route path="/upgraderly-download" element={<UpGraderlyDownload />} />
            <Route path="/architecture" element={<Architecture />} />
            <Route path="/download" element={<Download />} />
            <Route path="/redeem" element={<Redeem />} />
            <Route path="/admin/codes" element={<AdminCodes />} />
            <Route path="/admin/users" element={<AdminUsers />} />
            <Route path="/admin/roblox-codes" element={<AdminRobloxCodes />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
