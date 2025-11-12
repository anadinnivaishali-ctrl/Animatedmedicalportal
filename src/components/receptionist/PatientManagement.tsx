import React, { useState } from 'react';
import { motion } from 'motion/react';
import { toast } from "sonner";
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { projectId, publicAnonKey } from '../../utils/supabase/info';
import PatientDashboard from '../shared/PatientDashboard';

export default function PatientManagement() {
  const [loading, setLoading] = useState(false);
  const [currentPatient, setCurrentPatient] = useState<any>(null);
  
  // Registration state
  const [aadhaar, setAadhaar] = useState('');
  const [patientData, setPatientData] = useState<any>(null);
  
  // Login state
  const [loginAadhaar, setLoginAadhaar] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [mobileNumber, setMobileNumber] = useState('');

  const handleFetchAadhaar = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-790bca28/patient/register`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${publicAnonKey}`,
          },
          body: JSON.stringify({ aadhaar }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Registration failed');
      }

      toast.success('Patient registered successfully!');
      setPatientData(data.patient);
      setAadhaar('');
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-790bca28/patient/send-otp`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${publicAnonKey}`,
          },
          body: JSON.stringify({ aadhaar: loginAadhaar }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to send OTP');
      }

      toast.success(`OTP sent to mobile ${data.mobile}! (Demo OTP: ${data.otp})`);
      setOtpSent(true);
      setMobileNumber(data.mobile);
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-790bca28/patient/verify-otp`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${publicAnonKey}`,
          },
          body: JSON.stringify({ aadhaar: loginAadhaar, otp }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Invalid OTP');
      }

      toast.success('Patient login successful!');
      setCurrentPatient(data.patient);
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  if (currentPatient) {
    return (
      <PatientDashboard 
        patient={currentPatient} 
        onBack={() => {
          setCurrentPatient(null);
          setLoginAadhaar('');
          setOtp('');
          setOtpSent(false);
        }}
      />
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="max-w-4xl mx-auto"
    >
      <h1 className="text-4xl mb-8 text-center">Patient Management</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Patient Registration</CardTitle>
            <CardDescription>Register new patient using Aadhaar</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleFetchAadhaar} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="aadhaar">Aadhaar Number</Label>
                <Input
                  id="aadhaar"
                  type="text"
                  placeholder="Enter 12-digit Aadhaar"
                  value={aadhaar}
                  onChange={(e) => setAadhaar(e.target.value.replace(/\D/g, '').slice(0, 12))}
                  required
                  maxLength={12}
                />
                <p className="text-xs text-gray-500">
                  Demo Aadhaar: 123456789012, 234567890123, 345678901234
                </p>
              </div>

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'Fetching...' : 'Fetch & Register'}
              </Button>

              {patientData && (
                <div className="mt-4 p-4 bg-green-50 rounded-lg space-y-2">
                  <h3 className="font-semibold text-green-900">Patient Registered:</h3>
                  <p><strong>Name:</strong> {patientData.name}</p>
                  <p><strong>Mobile:</strong> {patientData.mobile}</p>
                  <p><strong>Gender:</strong> {patientData.gender}</p>
                  <p><strong>DOB:</strong> {patientData.dob}</p>
                  <p><strong>Age:</strong> {patientData.age} years</p>
                </div>
              )}
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Patient Login</CardTitle>
            <CardDescription>Login existing patient with Aadhaar & OTP</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={otpSent ? handleVerifyOTP : handleSendOTP} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="loginAadhaar">Aadhaar Number</Label>
                <Input
                  id="loginAadhaar"
                  type="text"
                  placeholder="Enter 12-digit Aadhaar"
                  value={loginAadhaar}
                  onChange={(e) => setLoginAadhaar(e.target.value.replace(/\D/g, '').slice(0, 12))}
                  required
                  maxLength={12}
                  disabled={otpSent}
                />
              </div>

              {otpSent && (
                <>
                  <div className="p-3 bg-blue-50 rounded text-sm text-blue-900">
                    OTP sent to: {mobileNumber}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="otp">Enter OTP</Label>
                    <Input
                      id="otp"
                      type="text"
                      placeholder="Enter 6-digit OTP"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                      required
                      maxLength={6}
                    />
                  </div>
                </>
              )}

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'Processing...' : otpSent ? 'Verify OTP & Login' : 'Send OTP'}
              </Button>

              {otpSent && (
                <Button
                  type="button"
                  variant="ghost"
                  className="w-full"
                  onClick={() => {
                    setOtpSent(false);
                    setOtp('');
                  }}
                >
                  Change Aadhaar
                </Button>
              )}
            </form>
          </CardContent>
        </Card>
      </div>
    </motion.div>
  );
}
