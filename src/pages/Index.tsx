
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from '@/hooks/useAuth';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import HomePage from '@/components/HomePage';
import OfficeBearers from '@/components/OfficeBearers';
import Genesis from '@/components/Genesis';
import MandateActivities from '@/components/MandateActivities';
import Publications from '@/components/Publications';
import EnhancedMembership from '@/components/EnhancedMembership';
import LifeMembers from '@/components/LifeMembers';
import Conference from '@/components/Conference';
import ContactForm from '@/components/ContactForm';
import AuthPage from '@/components/AuthPage';
import AdminLogin from '@/components/AdminLogin';
import AdminPanel from '@/components/AdminPanel';
import UserDashboard from '@/components/UserDashboard';
import ProtectedRoute from '@/components/ProtectedRoute';
import NotFound from '@/pages/NotFound';

const Index = () => {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-background w-full">
          <Header />
          <main className="pt-14 sm:pt-16 w-full">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/auth" element={<AuthPage />} />
              <Route path="/admin-login" element={<AdminLogin />} />
              <Route path="/office-bearers" element={<OfficeBearers />} />
              <Route path="/genesis" element={<Genesis />} />
              <Route path="/mandate-activities" element={<MandateActivities />} />
              <Route path="/publications" element={<Publications />} />
              <Route 
                path="/membership" 
                element={
                  <ProtectedRoute>
                    <EnhancedMembership />
                  </ProtectedRoute>
                } 
              />
              <Route path="/life-members" element={<LifeMembers />} />
              <Route path="/conference" element={<Conference />} />
              <Route path="/contact" element={<ContactForm />} />
              <Route 
                path="/dashboard" 
                element={
                  <ProtectedRoute>
                    <UserDashboard />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/admin" 
                element={
                  <ProtectedRoute>
                    <AdminPanel />
                  </ProtectedRoute>
                } 
              />
              {/* Catch all undefined routes */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </Router>
    </AuthProvider>
  );
};

export default Index;
