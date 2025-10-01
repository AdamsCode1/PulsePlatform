import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Suspense, lazy } from "react";
import LoadingSpinner from "./components/LoadingSpinner";

// Keep critical components non-lazy for faster initial load
import Index from "./pages/Index";

// Lazy load non-critical pages for better performance
const EnhancedIndex = lazy(() => import("./pages/enhanced/EnhancedIndex"));
const NotFound = lazy(() => import("./pages/NotFound"));
const DealsPage = lazy(() => import('./pages/DealsPage'));
const MeetTheTeam = lazy(() => import('./pages/MeetTheTeam'));
const EventSubmissionPage = lazy(() => import('./pages/EventSubmissionPage'));
const SocietyEventsPage = lazy(() => import('./pages/SocietyEventsPage'));
const ManageRedirect = lazy(() => import('./pages/ManageRedirect'));

// Authentication pages - lazy load
const UserTypeSelection = lazy(() => import("./pages/UserTypeSelection"));
const StudentLogin = lazy(() => import("./pages/StudentLogin"));
const StudentRegister = lazy(() => import("./pages/StudentRegister"));
const SocietyLogin = lazy(() => import("./pages/SocietyLogin"));
const SocietyRegister = lazy(() => import("./pages/SocietyRegister"));
const PartnerLogin = lazy(() => import('./pages/PartnerLogin'));
const PartnerRegister = lazy(() => import('./pages/PartnerRegister'));

// Dashboard components - lazy load since they're behind auth
const StudentDashboard = lazy(() => import("./pages/student/Dashboard"));
const StudentRSVPs = lazy(() => import("./pages/student/RSVPs"));
const ProfileEdit = lazy(() => import("./pages/student/ProfileEdit"));

const SocietyDashboard = lazy(() => import("./pages/society/Dashboard"));
const SocietyEvents = lazy(() => import("./pages/society/Events"));
const SocietySubmitEvent = lazy(() => import("./pages/society/SubmitEvent"));
const ViewRSVPlist = lazy(() => import('./pages/society/ViewRSVPlist'));

const PartnerDashboard = lazy(() => import("./pages/partner/Dashboard"));
const PartnerEvents = lazy(() => import("./pages/partner/Events"));
const PartnerDeals = lazy(() => import("./pages/partner/Deals"));
const PartnerSubmitEvent = lazy(() => import("./pages/partner/SubmitEvent"));
const SubmitDealPage = lazy(() => import("./pages/SubmitDealPage"));

const AdminLogin = lazy(() => import('./pages/AdminLogin'));
const AboutPage = lazy(() => import('./pages/AboutPage'));
const Schedule = lazy(() => import('./pages/Schedule'));

// Admin components - lazy load
const AdminDashboard = lazy(() => import('./pages/admin/Dashboard'));
const AdminEvents = lazy(() => import('./pages/admin/Events'));
const AdminDeals = lazy(() => import('./pages/admin/Deals'));
const AdminUsers = lazy(() => import('./pages/admin/Users'));
const AdminSettings = lazy(() => import('./pages/admin/Settings'));

console.log('[App] App component mounting');

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
      <Suspense fallback={<LoadingSpinner />}>
        <Routes>
          {/* Public Routes - Available in Dev Mode */}
          <Route path="/" element={<Index />} />
          <Route path="/enhanced" element={<EnhancedIndex />} />
          <Route path="/platform" element={<Index />} />
          <Route path="/dev" element={<Index />} />
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
          <Route path="/student/profile" element={<ProfileEdit />} />

          {/* Society Dashboard Routes */}
          <Route path="/society/dashboard" element={<SocietyDashboard />} />
          <Route path="/society/events" element={<SocietyEvents />} />
          <Route path="/society/submit-event" element={<SocietySubmitEvent />} />
          <Route path="/viewRSVPlist/:eventId" element={<ViewRSVPlist />} />

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
      </Suspense>
    </BrowserRouter>
  </TooltipProvider>
);

export default App;
