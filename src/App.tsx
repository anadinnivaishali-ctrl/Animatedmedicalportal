import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Toaster } from './components/ui/sonner';
import WelcomeScreen from './components/WelcomeScreen';
import ReceptionistPortal from './components/ReceptionistPortal';
import DoctorPortal from './components/DoctorPortal';
import OthersPortal from './components/OthersPortal';
import PatientPortal from './components/PatientPortal';

export type UserType = 'receptionist' | 'doctor' | 'others' | 'patient' | null;

export default function App() {
  const [selectedPortal, setSelectedPortal] = useState<UserType>(null);

  const handlePortalSelect = (portal: UserType) => {
    setSelectedPortal(portal);
  };

  const handleBackToHome = () => {
    setSelectedPortal(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      <Toaster position="top-center" />
      
      {!selectedPortal && (
        <WelcomeScreen onPortalSelect={handlePortalSelect} />
      )}
      
      {selectedPortal === 'receptionist' && (
        <ReceptionistPortal onBack={handleBackToHome} />
      )}
      
      {selectedPortal === 'doctor' && (
        <DoctorPortal onBack={handleBackToHome} />
      )}
      
      {selectedPortal === 'others' && (
        <OthersPortal onBack={handleBackToHome} />
      )}
      
      {selectedPortal === 'patient' && (
        <PatientPortal onBack={handleBackToHome} />
      )}
    </div>
  );
}
