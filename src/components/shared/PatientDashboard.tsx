import React, { useState } from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, FileText, Stethoscope, FileSearch } from 'lucide-react';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import PatientFinalReport from './PatientFinalReport';
import DoctorPage from './DoctorPage';
import ReportsSection from './ReportsSection';

interface PatientDashboardProps {
  patient: any;
  onBack: () => void;
}

type DashboardView = 'menu' | 'final-report' | 'doctor-page' | 'reports';

export default function PatientDashboard({ patient, onBack }: PatientDashboardProps) {
  const [currentView, setCurrentView] = useState<DashboardView>('menu');

  if (currentView === 'final-report') {
    return (
      <div>
        <Button onClick={() => setCurrentView('menu')} variant="ghost" className="mb-4">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Menu
        </Button>
        <PatientFinalReport patient={patient} />
      </div>
    );
  }

  if (currentView === 'doctor-page') {
    return (
      <div>
        <Button onClick={() => setCurrentView('menu')} variant="ghost" className="mb-4">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Menu
        </Button>
        <DoctorPage patient={patient} />
      </div>
    );
  }

  if (currentView === 'reports') {
    return (
      <div>
        <Button onClick={() => setCurrentView('menu')} variant="ghost" className="mb-4">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Menu
        </Button>
        <ReportsSection patient={patient} />
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-4xl mx-auto"
    >
      <Button onClick={onBack} variant="ghost" className="mb-8">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back
      </Button>

      <div className="mb-8 p-6 bg-gradient-to-r from-blue-50 to-green-50 rounded-lg">
        <h2 className="text-2xl mb-2">Patient Information</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <div>
            <p className="text-sm text-gray-600">Name</p>
            <p>{patient.name}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Aadhaar</p>
            <p>{patient.aadhaar}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Mobile</p>
            <p>{patient.mobile}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Gender</p>
            <p>{patient.gender}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Date of Birth</p>
            <p>{patient.dob}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Age</p>
            <p>{patient.age} years</p>
          </div>
        </div>
      </div>

      <h1 className="text-4xl mb-8 text-center">Patient Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          <Card 
            className="cursor-pointer hover:shadow-xl transition-shadow"
            onClick={() => setCurrentView('final-report')}
          >
            <CardHeader>
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                <FileText className="w-6 h-6 text-blue-600" />
              </div>
              <CardTitle>Patient Final Report</CardTitle>
              <CardDescription>View complete medical summary</CardDescription>
            </CardHeader>
          </Card>
        </motion.div>

        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          <Card 
            className="cursor-pointer hover:shadow-xl transition-shadow"
            onClick={() => setCurrentView('doctor-page')}
          >
            <CardHeader>
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4">
                <Stethoscope className="w-6 h-6 text-green-600" />
              </div>
              <CardTitle>Doctor Page</CardTitle>
              <CardDescription>Medical records and prescriptions</CardDescription>
            </CardHeader>
          </Card>
        </motion.div>

        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          <Card 
            className="cursor-pointer hover:shadow-xl transition-shadow"
            onClick={() => setCurrentView('reports')}
          >
            <CardHeader>
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mb-4">
                <FileSearch className="w-6 h-6 text-purple-600" />
              </div>
              <CardTitle>Reports</CardTitle>
              <CardDescription>Upload and view test reports</CardDescription>
            </CardHeader>
          </Card>
        </motion.div>
      </div>
    </motion.div>
  );
}
