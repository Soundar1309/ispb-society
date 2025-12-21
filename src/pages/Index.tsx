
import { Suspense, lazy } from 'react';
import { Routes, Route } from 'react-router-dom';
import { LoadingSkeleton } from '@/components/ui/loading-skeleton';

// Lazy load components
const HomePage = lazy(() => import('@/components/HomePage'));
const Genesis = lazy(() => import('@/components/Genesis'));
const MandateActivities = lazy(() => import('@/components/MandateActivities'));
const OfficeBearers = lazy(() => import('@/components/OfficeBearers'));
const Membership = lazy(() => import('@/components/Membership'));
const Conference = lazy(() => import('@/components/Conference'));
const ContactUs = lazy(() => import('@/components/ContactUs'));
const AuthPage = lazy(() => import('@/components/AuthPage'));
const UserDashboard = lazy(() => import('@/components/UserDashboard'));
const MemberPage = lazy(() => import('@/components/MemberPage'));
const PaymentIntegration = lazy(() => import('@/components/PaymentIntegration'));
const AdminPanel = lazy(() => import('@/components/AdminPanel'));
const AdminLogin = lazy(() => import('@/components/AdminLogin'));
const LifeMembers = lazy(() => import('@/components/LifeMembers'));
const Publications = lazy(() => import('@/components/Publications'));
const Gallery = lazy(() => import('@/components/Gallery'));
const EnhancedMembershipPage = lazy(() => import('@/components/EnhancedMembershipPage'));
const MembershipApplication = lazy(() => import('@/components/MembershipApplication'));
const PrivacyPolicy = lazy(() => import('@/components/PrivacyPolicy'));
const TermsOfService = lazy(() => import('@/components/TermsOfService'));
const CookiePolicy = lazy(() => import('@/components/CookiePolicy'));
const ProtectedRoute = lazy(() => import('@/components/ProtectedRoute'));
const NotFound = lazy(() => import('./NotFound'));
import Layout from '@/components/Layout';

// Loading fallback component
const PageLoader = () => (
  <div className="container mx-auto p-8 space-y-8">
    <LoadingSkeleton variant="card" count={1} />
    <LoadingSkeleton variant="table" count={1} />
  </div>
);

const Index = () => {
  return (
    <Suspense fallback={<PageLoader />}>

      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/genesis" element={<Genesis />} />
          <Route path="/mandate-activities" element={<MandateActivities />} />
          <Route path="/office-bearers" element={<OfficeBearers />} />
          <Route path="/membership" element={<Membership />} />
          <Route path="/enhanced-membership" element={<EnhancedMembershipPage />} />
          <Route path="/membership-application" element={<MembershipApplication />} />
          <Route path="/conference" element={<Conference />} />
          <Route path="/contact" element={<ContactUs />} />
          <Route path="/auth" element={<AuthPage />} />
          <Route path="/life-members" element={<LifeMembers />} />
          <Route path="/publications" element={<Publications />} />
          <Route path="/gallery" element={<Gallery />} />
          <Route path="/privacy-policy" element={<PrivacyPolicy />} />
          <Route path="/terms-of-service" element={<TermsOfService />} />
          <Route path="/cookie-policy" element={<CookiePolicy />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <UserDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/member"
            element={
              <ProtectedRoute>
                <MemberPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/payment"
            element={
              <ProtectedRoute>
                <PaymentIntegration />
              </ProtectedRoute>
            }
          />
          <Route path="/admin-login" element={<AdminLogin />} />
          <Route
            path="/admin"
            element={
              <ProtectedRoute>
                <AdminPanel />
              </ProtectedRoute>
            }
          />
        </Route>
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  );
};

export default Index;
