import React, { useState } from 'react';
import { motion } from 'motion/react';
import { toast } from "sonner";
import { ArrowLeft } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { projectId, publicAnonKey } from '../utils/supabase/info';
import PatientDashboard from './shared/PatientDashboard';

interface PatientPortalProps {
  onBack: () => void;
}

export default function PatientPortal({ onBack }: PatientPortalProps) {
  const [loading, setLoading] = useState(false);
  const [currentPatient, setCurrentPatient] = useState<any>(null);
  const [aadhaar, setAadhaar] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [mobileNumber, setMobileNumber] = useState('');

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
          body: JSON.stringify({ aadhaar }),
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
          body: JSON.stringify({ aadhaar, otp }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Invalid OTP');
      }

      toast.success('Login successful!');
      setCurrentPatient(data.patient);
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  if (currentPatient) {
    return (
      <div className="min-h-screen p-8">
        <PatientDashboard 
          patient={currentPatient} 
          onBack={() => {
            setCurrentPatient(null);
            setAadhaar('');
            setOtp('');
            setOtpSent(false);
          }}
        />
      </div>
    );
  }

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
            <CardTitle>Patient Portal</CardTitle>
            <CardDescription>Login to view your medical records</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={otpSent ? handleVerifyOTP : handleSendOTP} className="space-y-4">
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
                  disabled={otpSent}
                />
                {!otpSent && (
                  <p className="text-xs text-gray-500">
                    Demo Aadhaar: 123456789012, 234567890123, 345678901234
                  </p>
                )}
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
                  Change Aadhaar Number
                </Button>
              )}
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
