import React, { useState } from 'react';
import { motion } from 'motion/react';
import { toast } from 'sonner@2.0.3';
import { ArrowLeft } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { projectId, publicAnonKey } from '../utils/supabase/info';
import PatientDashboard from './shared/PatientDashboard';

interface DoctorPortalProps {
  onBack: () => void;
}

export default function DoctorPortal({ onBack }: DoctorPortalProps) {
  const [loading, setLoading] = useState(false);
  const [doctor, setDoctor] = useState<any>(null);
  const [currentPatient, setCurrentPatient] = useState<any>(null);
  
  // Login state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  // Forgot password state
  const [resetEmail, setResetEmail] = useState('');
  const [resetOtp, setResetOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  
  // Patient login state
  const [patientAadhaar, setPatientAadhaar] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-790bca28/doctor/login`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${publicAnonKey}`,
          },
          body: JSON.stringify({ email, password }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Login failed');
      }

      toast.success('Login successful!');
      setDoctor(data.doctor);
      setEmail('');
      setPassword('');
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSendResetOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-790bca28/doctor/send-reset-otp`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${publicAnonKey}`,
          },
          body: JSON.stringify({ email: resetEmail }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to send OTP');
      }

      toast.success(`OTP sent to your email! (Demo OTP: ${data.otp})`);
      setOtpSent(true);
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-790bca28/doctor/reset-password`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${publicAnonKey}`,
          },
          body: JSON.stringify({ email: resetEmail, otp: resetOtp, newPassword }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Password reset failed');
      }

      toast.success('Password reset successful! Please login.');
      setResetEmail('');
      setResetOtp('');
      setNewPassword('');
      setOtpSent(false);
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handlePatientLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-790bca28/patient/${patientAadhaar}`,
        {
          headers: {
            Authorization: `Bearer ${publicAnonKey}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Patient not found');
      }

      setCurrentPatient(data.patient);
      toast.success('Patient accessed successfully');
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    setDoctor(null);
    setCurrentPatient(null);
  };

  // If viewing patient dashboard
  if (currentPatient) {
    return (
      <div className="min-h-screen p-8">
        <div className="flex justify-between items-center mb-8">
          <Button onClick={() => setCurrentPatient(null)} variant="ghost">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Doctor Portal
          </Button>
          <div className="text-right">
            <p className="text-sm text-gray-600">Doctor</p>
            <p>Dr. {doctor?.name}</p>
          </div>
        </div>
        <PatientDashboard 
          patient={currentPatient} 
          onBack={() => setCurrentPatient(null)}
        />
      </div>
    );
  }

  // If doctor is logged in
  if (doctor) {
    return (
      <div className="min-h-screen p-8">
        <div className="flex justify-between items-center mb-8">
          <Button onClick={onBack} variant="ghost">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Home
          </Button>
          <div className="text-center flex-1">
            <p className="text-sm text-gray-600">Welcome</p>
            <p className="text-xl">Dr. {doctor.name} - {doctor.specialist}</p>
          </div>
          <Button onClick={handleLogout} variant="outline">
            Logout
          </Button>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md mx-auto"
        >
          <Card>
            <CardHeader>
              <CardTitle>Access Patient Record</CardTitle>
              <CardDescription>Enter patient's Aadhaar number</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handlePatientLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="patientAadhaar">Patient Aadhaar Number</Label>
                  <Input
                    id="patientAadhaar"
                    type="text"
                    placeholder="Enter 12-digit Aadhaar"
                    value={patientAadhaar}
                    onChange={(e) => setPatientAadhaar(e.target.value.replace(/\D/g, '').slice(0, 12))}
                    required
                    maxLength={12}
                  />
                  <p className="text-xs text-gray-500">
                    Demo Aadhaar: 123456789012, 234567890123, 345678901234
                  </p>
                </div>

                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? 'Loading...' : 'Access Patient Record'}
                </Button>
              </form>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }

  // Login screen
  return (
    <div className="min-h-screen p-8">
      <Button onClick={onBack} variant="ghost" className="mb-8">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Home
      </Button>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-md mx-auto"
      >
        <Card>
          <CardHeader>
            <CardTitle>Doctor Login</CardTitle>
            <CardDescription>Access your doctor portal</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="login">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="login">Login</TabsTrigger>
                <TabsTrigger value="forgot">Forgot Password</TabsTrigger>
              </TabsList>

              <TabsContent value="login">
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="doctor@medixa.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <Input
                      id="password"
                      type="password"
                      placeholder="Enter password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                  </div>

                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? 'Logging in...' : 'Login'}
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="forgot">
                <form onSubmit={otpSent ? handleResetPassword : handleSendResetOTP} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="resetEmail">Email</Label>
                    <Input
                      id="resetEmail"
                      type="email"
                      placeholder="your@email.com"
                      value={resetEmail}
                      onChange={(e) => setResetEmail(e.target.value)}
                      required
                      disabled={otpSent}
                    />
                  </div>

                  {otpSent && (
                    <>
                      <div className="space-y-2">
                        <Label htmlFor="resetOtp">Enter OTP</Label>
                        <Input
                          id="resetOtp"
                          type="text"
                          placeholder="6-digit OTP"
                          value={resetOtp}
                          onChange={(e) => setResetOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                          required
                          maxLength={6}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="newPassword">New Password</Label>
                        <Input
                          id="newPassword"
                          type="password"
                          placeholder="Enter new password"
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          required
                          minLength={6}
                        />
                      </div>
                    </>
                  )}

                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? 'Processing...' : otpSent ? 'Reset Password' : 'Send OTP'}
                  </Button>

                  {otpSent && (
                    <Button
                      type="button"
                      variant="ghost"
                      className="w-full"
                      onClick={() => {
                        setOtpSent(false);
                        setResetOtp('');
                        setNewPassword('');
                      }}
                    >
                      Change Email
                    </Button>
                  )}
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
