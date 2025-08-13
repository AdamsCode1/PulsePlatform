import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { BrowserRouter, Routes, Route } from "react-router-dom";

// Public Pages
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import DealsPage from './pages/DealsPage';
import MeetTheTeam from './pages/MeetTheTeam';
import EventSubmissionPage from './pages/EventSubmissionPage';
import SocietyEventsPage from './pages/SocietyEventsPage';
import ManageRedirect from './pages/ManageRedirect';

// Authentication
import UserTypeSelection from "./pages/UserTypeSelection";
import StudentLogin from "./pages/StudentLogin";
import StudentRegister from "./pages/StudentRegister";
import SocietyLogin from "./pages/SocietyLogin";
import SocietyRegister from "./pages/SocietyRegister";
import PartnerLogin from './pages/PartnerLogin';
import PartnerRegister from './pages/PartnerRegister';

// Student Dashboard Components
import StudentDashboard from "./pages/student/Dashboard";
import StudentRSVPs from "./pages/student/RSVPs";

// Society Dashboard Components  
import SocietyDashboard from "./pages/society/Dashboard";
import SocietyEvents from "./pages/society/Events";
import SocietySubmitEvent from "./pages/society/SubmitEvent";

// Partner Dashboard Components
import PartnerDashboard from "./pages/partner/Dashboard";
import PartnerEvents from "./pages/partner/Events";
import PartnerDeals from "./pages/partner/Deals";
import PartnerSubmitEvent from "./pages/partner/SubmitEvent";
import SubmitDealPage from "./pages/SubmitDealPage";

// Admin Components
import AdminLogin from './pages/AdminLogin';
import AboutPage from './pages/AboutPage';
import Schedule from './pages/Schedule';
import AdminDashboard from './pages/admin/Dashboard';
import AdminEvents from './pages/admin/Events';
import AdminDeals from './pages/admin/Deals';
import AdminUsers from './pages/admin/Users';
import AdminSettings from './pages/admin/Settings';

const App = () => (
  <TooltipProvider>
    <Toaster />
    <Sonner />
    <BrowserRouter
      future={{
        v7_startTransition: true,
        v7_relativeSplatPath: true,
      }}
    >
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Index />} />
        <Route path="/deals" element={<DealsPage />} />
        <Route path="/about" element={<AboutPage />} />

        {/* Authentication Routes */}
        <Route path="/login" element={<UserTypeSelection />} />
        <Route path="/register" element={<UserTypeSelection />} />
        <Route path="/login/student" element={<StudentLogin />} />
        <Route path="/login/society" element={<SocietyLogin />} />
        <Route path="/login/partner" element={<PartnerLogin />} />
        <Route path="/register/student" element={<StudentRegister />} />
        <Route path="/register/society" element={<SocietyRegister />} />
        <Route path="/register/organization" element={<PartnerRegister />} />
        <Route path="/submit-event" element={<EventSubmissionPage />} />
        <Route path="/events/manage" element={<ManageRedirect />} />
        <Route path="/user-type" element={<UserTypeSelection />} />
        <Route path="/schedule" element={<Schedule />} />
        <Route path="/team" element={<MeetTheTeam />} />
        <Route path="/register/partner" element={<PartnerRegister />} />

        {/* Student Dashboard Routes */}
        <Route path="/student/dashboard" element={<StudentDashboard />} />
        <Route path="/student/rsvps" element={<StudentRSVPs />} />

        {/* Society Dashboard Routes */}
        <Route path="/society/dashboard" element={<SocietyDashboard />} />
        <Route path="/society/events" element={<SocietyEvents />} />
        <Route path="/society/submit-event" element={<SocietySubmitEvent />} />

        {/* Partner Dashboard Routes */}
        <Route path="/partner/dashboard" element={<PartnerDashboard />} />
        <Route path="/partner/events" element={<PartnerEvents />} />
        <Route path="/partner/deals" element={<PartnerDeals />} />
        <Route path="/partner/submit-event" element={<PartnerSubmitEvent />} />
        <Route path="/partner/submit-deal" element={<SubmitDealPage />} />

        {/* Admin Routes */}
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/admin/events" element={<AdminEvents />} />
        <Route path="/admin/deals" element={<AdminDeals />} />
        <Route path="/admin/users" element={<AdminUsers />} />
        <Route path="/admin/settings" element={<AdminSettings />} />

        {/* Legacy redirects for backward compatibility */}
        <Route path="/admin" element={<AdminLogin />} />

        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  </TooltipProvider>
);

export default App;
