import React, { useState } from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, UserRound, Users, FileText, Receipt } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import ReceptionistAuth from './receptionist/ReceptionistAuth';
import PatientManagement from './receptionist/PatientManagement';
import DoctorRegistration from './receptionist/DoctorRegistration';
import BillingSection from './receptionist/BillingSection';

interface ReceptionistPortalProps {
  onBack: () => void;
}

type ReceptionistView = 'auth' | 'menu' | 'patient-management' | 'doctor-registration' | 'billing';

export default function ReceptionistPortal({ onBack }: ReceptionistPortalProps) {
  const [currentView, setCurrentView] = useState<ReceptionistView>('auth');
  const [receptionist, setReceptionist] = useState<any>(null);

  const handleLogin = (receptionistData: any) => {
    setReceptionist(receptionistData);
    setCurrentView('menu');
  };

  const handleLogout = () => {
    setReceptionist(null);
    setCurrentView('auth');
  };

  if (currentView === 'auth') {
    return (
      <div className="min-h-screen p-8">
        <Button onClick={onBack} variant="ghost" className="mb-8">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Home
        </Button>
        <ReceptionistAuth onLogin={handleLogin} />
      </div>
    );
  }

  if (currentView === 'menu') {
    return (
      <div className="min-h-screen p-8">
        <div className="flex justify-between items-center mb-8">
          <Button onClick={onBack} variant="ghost">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Home
          </Button>
          <div className="text-right">
            <p className="text-sm text-gray-600">Logged in as</p>
            <p>{receptionist?.receptionistName} - {receptionist?.hospitalName}</p>
          </div>
          <Button onClick={handleLogout} variant="outline">
            Logout
          </Button>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-4xl mx-auto"
        >
          <h1 className="text-4xl mb-8 text-center">Receptionist Dashboard</h1>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Card 
                className="cursor-pointer hover:shadow-xl transition-shadow"
                onClick={() => setCurrentView('patient-management')}
              >
                <CardHeader>
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                    <Users className="w-6 h-6 text-blue-600" />
                  </div>
                  <CardTitle>Patient Management</CardTitle>
                  <CardDescription>Register and manage patients</CardDescription>
                </CardHeader>
              </Card>
            </motion.div>

            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Card 
                className="cursor-pointer hover:shadow-xl transition-shadow"
                onClick={() => setCurrentView('doctor-registration')}
              >
                <CardHeader>
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4">
                    <UserRound className="w-6 h-6 text-green-600" />
                  </div>
                  <CardTitle>Doctor</CardTitle>
                  <CardDescription>Register new doctors</CardDescription>
                </CardHeader>
              </Card>
            </motion.div>

            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Card 
                className="cursor-pointer hover:shadow-xl transition-shadow"
                onClick={() => setCurrentView('billing')}
              >
                <CardHeader>
                  <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mb-4">
                    <Receipt className="w-6 h-6 text-purple-600" />
                  </div>
                  <CardTitle>Billing</CardTitle>
                  <CardDescription>Generate bills and invoices</CardDescription>
                </CardHeader>
              </Card>
            </motion.div>
          </div>
        </motion.div>
      </div>
    );
  }

  if (currentView === 'patient-management') {
    return (
      <div className="min-h-screen p-8">
        <Button onClick={() => setCurrentView('menu')} variant="ghost" className="mb-8">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Dashboard
        </Button>
        <PatientManagement />
      </div>
    );
  }

  if (currentView === 'doctor-registration') {
    return (
      <div className="min-h-screen p-8">
        <Button onClick={() => setCurrentView('menu')} variant="ghost" className="mb-8">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Dashboard
        </Button>
        <DoctorRegistration />
      </div>
    );
  }

  if (currentView === 'billing') {
    return (
      <div className="min-h-screen p-8">
        <Button onClick={() => setCurrentView('menu')} variant="ghost" className="mb-8">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Dashboard
        </Button>
        <BillingSection />
      </div>
    );
  }

  return null;
}
