import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import EventSubmissionPage from "./pages/EventSubmissionPage";
import SocietyLogin from "./pages/SocietyLogin";
import UserTypeSelection from "./pages/UserTypeSelection";
import SocietyRegister from "./pages/SocietyRegister";
import StudentLogin from "./pages/StudentLogin";
import StudentRegister from "./pages/StudentRegister";
import OrganizationRegister from './pages/OrganizationRegister';
import OrganizationLogin from './pages/OrganizationLogin';
import DealsPage from './pages/DealsPage';
import MeetTheTeam from './pages/MeetTheTeam';

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/login" element={<UserTypeSelection />} />
          <Route path="/login/student" element={<StudentLogin />} />
          <Route path="/login/society" element={<SocietyLogin />} />
          <Route path="/login/organization" element={<OrganizationLogin />} />
          <Route path="/register/student" element={<StudentRegister />} />
          <Route path="/register/society" element={<SocietyRegister />} />
          <Route path="/register/organization" element={<OrganizationRegister />} />
          <Route path="/submit-event" element={<EventSubmissionPage />} />
          <Route path="/user-type" element={<UserTypeSelection />} />
          <Route path="/deals" element={<DealsPage />} />
          <Route path="/about" element={<MeetTheTeam />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
