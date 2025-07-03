
import { Routes, Route } from 'react-router-dom';
import HomePage from '@/components/HomePage';
import Genesis from '@/components/Genesis';
import MandateActivities from '@/components/MandateActivities';
import OfficeBearers from '@/components/OfficeBearers';
import Membership from '@/components/Membership';
import Conference from '@/components/Conference';
import ContactUs from '@/components/ContactUs';
import AuthPage from '@/components/AuthPage';
import UserDashboard from '@/components/UserDashboard';
import MemberPage from '@/components/MemberPage';
import AdminPanel from '@/components/AdminPanel';
import AdminLogin from '@/components/AdminLogin';
import LifeMembers from '@/components/LifeMembers';
import Publications from '@/components/Publications';
import Gallery from '@/components/Gallery';
import EnhancedMembershipPage from '@/components/EnhancedMembershipPage';
import MembershipCancellation from '@/components/MembershipCancellation';
import PrivacyPolicy from '@/components/PrivacyPolicy';
import TermsOfService from '@/components/TermsOfService';
import CookiePolicy from '@/components/CookiePolicy';
import ProtectedRoute from '@/components/ProtectedRoute';
import NotFound from './NotFound';

const Index = () => {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/genesis" element={<Genesis />} />
      <Route path="/mandate-activities" element={<MandateActivities />} />
      <Route path="/office-bearers" element={<OfficeBearers />} />
      <Route path="/membership" element={<Membership />} />
      <Route path="/enhanced-membership" element={<EnhancedMembershipPage />} />
      <Route path="/membership-cancellation" element={<MembershipCancellation />} />
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
      <Route path="/admin-login" element={<AdminLogin />} />
      <Route 
        path="/admin" 
        element={
          <ProtectedRoute>
            <AdminPanel />
          </ProtectedRoute>
        } 
      />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default Index;
