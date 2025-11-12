import React, { useState } from 'react';
import { motion } from 'motion/react';
<<<<<<< HEAD
import { toast } from "sonner";
=======
import { toast } from 'sonner@2.0.3';
>>>>>>> 0598809536fc89d9adfc1f1a4cc8762b6339f77d
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import { projectId, publicAnonKey } from '../../utils/supabase/info';

const specializations = [
  'Cardiologist',
  'Dermatologist',
  'Endocrinologist',
  'Gastroenterologist',
  'General Physician',
  'Neurologist',
  'Oncologist',
  'Ophthalmologist',
  'Orthopedic Surgeon',
  'Pediatrician',
  'Psychiatrist',
  'Radiologist',
  'Surgeon',
  'Urologist'
];

export default function DoctorRegistration() {
  const [loading, setLoading] = useState(false);
  const [doctorId, setDoctorId] = useState('');
  const [name, setName] = useState('');
  const [mobile, setMobile] = useState('');
  const [specialist, setSpecialist] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-790bca28/doctor/register`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${publicAnonKey}`,
          },
          body: JSON.stringify({
            doctorId,
            name,
            mobile,
            specialist,
            password,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Registration failed');
      }

      toast.success(`Doctor registered successfully! Email: ${data.email}`);
      
      // Reset form
      setDoctorId('');
      setName('');
      setMobile('');
      setSpecialist('');
      setPassword('');
      setConfirmPassword('');
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="max-w-2xl mx-auto"
    >
      <Card>
        <CardHeader>
          <CardTitle>Doctor Registration</CardTitle>
          <CardDescription>Register a new doctor in the system</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="doctorId">Doctor ID</Label>
                <Input
                  id="doctorId"
                  type="text"
                  placeholder="e.g., DOC001"
                  value={doctorId}
                  onChange={(e) => setDoctorId(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="name">Doctor Name</Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="Enter full name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="mobile">Mobile Number</Label>
                <Input
                  id="mobile"
                  type="tel"
                  placeholder="10-digit mobile"
                  value={mobile}
                  onChange={(e) => setMobile(e.target.value.replace(/\D/g, '').slice(0, 10))}
                  required
                  maxLength={10}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="specialist">Specialization</Label>
                <Select value={specialist} onValueChange={setSpecialist} required>
                  <SelectTrigger id="specialist">
                    <SelectValue placeholder="Select specialization" />
                  </SelectTrigger>
                  <SelectContent>
                    {specializations.map((spec) => (
                      <SelectItem key={spec} value={spec}>
                        {spec}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="password">Create Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Minimum 6 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="Re-enter password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  minLength={6}
                />
              </div>
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Registering...' : 'Register Doctor'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </motion.div>
  );
}
