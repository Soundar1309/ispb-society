
import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import HomePage from '@/components/HomePage';
import OfficeBearers from '@/components/OfficeBearers';
import Genesis from '@/components/Genesis';
import MandateActivities from '@/components/MandateActivities';
import Publications from '@/components/Publications';
import Membership from '@/components/Membership';
import LifeMembers from '@/components/LifeMembers';
import Conference from '@/components/Conference';
import ContactUs from '@/components/ContactUs';
import LoginModal from '@/components/LoginModal';

const Index = () => {
  const [isLoginOpen, setIsLoginOpen] = useState(false);

  return (
    <Router>
      <div className="min-h-screen bg-background">
        <Header onLoginClick={() => setIsLoginOpen(true)} />
        <main className="pt-16">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/office-bearers" element={<OfficeBearers />} />
            <Route path="/genesis" element={<Genesis />} />
            <Route path="/mandate-activities" element={<MandateActivities />} />
            <Route path="/publications" element={<Publications />} />
            <Route path="/membership" element={<Membership />} />
            <Route path="/life-members" element={<LifeMembers />} />
            <Route path="/conference" element={<Conference />} />
            <Route path="/contact" element={<ContactUs />} />
          </Routes>
        </main>
        <Footer />
        <LoginModal isOpen={isLoginOpen} onClose={() => setIsLoginOpen(false)} />
      </div>
    </Router>
  );
};

export default Index;
