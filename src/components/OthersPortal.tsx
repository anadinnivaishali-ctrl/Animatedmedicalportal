import React, { useState } from 'react';
import { motion } from 'motion/react';
<<<<<<< HEAD
import { toast } from "sonner";
=======
import { toast } from 'sonner@2.0.3';
>>>>>>> 0598809536fc89d9adfc1f1a4cc8762b6339f77d
import { ArrowLeft, TestTube, Heart } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import { projectId, publicAnonKey } from '../utils/supabase/info';
import TestDepartmentDashboard from './others/TestDepartmentDashboard';
import NursePortal from './others/NursePortal';

interface OthersPortalProps {
  onBack: () => void;
}

type OthersView = 'menu' | 'test-auth' | 'test-dashboard' | 'nurse';

const testDepartments = [
  'Pathology',
  'Radiology',
  'Cardiology',
  'Neurology',
  'Orthopedics',
  'General Medicine'
];

export default function OthersPortal({ onBack }: OthersPortalProps) {
  const [currentView, setCurrentView] = useState<OthersView>('menu');
  const [loading, setLoading] = useState(false);
  const [department, setDepartment] = useState<any>(null);
  
  // Registration state
  const [selectedTest, setSelectedTest] = useState('');
  const [personName, setPersonName] = useState('');
  const [personEmail, setPersonEmail] = useState('');
  const [createPassword, setCreatePassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  // Login state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    if (createPassword !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (createPassword.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-790bca28/test-department/register`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${publicAnonKey}`,
          },
          body: JSON.stringify({
            testName: selectedTest,
            name: personName,
            email: personEmail,
            password: createPassword,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Registration failed');
      }

      toast.success('Registration successful! Please login.');
      setSelectedTest('');
      setPersonName('');
      setPersonEmail('');
      setCreatePassword('');
      setConfirmPassword('');
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-790bca28/test-department/login`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${publicAnonKey}`,
          },
          body: JSON.stringify({ email: loginEmail, password: loginPassword }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Login failed');
      }

      toast.success('Login successful!');
      setDepartment(data.department);
      setCurrentView('test-dashboard');
      setLoginEmail('');
      setLoginPassword('');
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    setDepartment(null);
    setCurrentView('test-auth');
  };

  // Menu View
  if (currentView === 'menu') {
    return (
      <div className="min-h-screen p-8">
        <Button onClick={onBack} variant="ghost" className="mb-8">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Home
        </Button>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-4xl mx-auto"
        >
          <h1 className="text-4xl mb-8 text-center">Others Portal</h1>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Card 
                className="cursor-pointer hover:shadow-xl transition-shadow"
                onClick={() => setCurrentView('test-auth')}
              >
                <CardHeader>
                  <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mb-4">
                    <TestTube className="w-6 h-6 text-purple-600" />
                  </div>
                  <CardTitle>Test Departments</CardTitle>
                  <CardDescription>Pathology, Radiology, and other test departments</CardDescription>
                </CardHeader>
              </Card>
            </motion.div>

            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Card 
                className="cursor-pointer hover:shadow-xl transition-shadow"
                onClick={() => setCurrentView('nurse')}
              >
                <CardHeader>
                  <div className="w-12 h-12 bg-pink-100 rounded-full flex items-center justify-center mb-4">
                    <Heart className="w-6 h-6 text-pink-600" />
                  </div>
                  <CardTitle>Nurse</CardTitle>
                  <CardDescription>Nursing staff portal</CardDescription>
                </CardHeader>
              </Card>
            </motion.div>
          </div>
        </motion.div>
      </div>
    );
  }

  // Test Department Dashboard
  if (currentView === 'test-dashboard' && department) {
    return (
      <div className="min-h-screen p-8">
        <div className="flex justify-between items-center mb-8">
          <Button onClick={() => setCurrentView('menu')} variant="ghost">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Menu
          </Button>
          <div className="text-right">
            <p className="text-sm text-gray-600">Logged in as</p>
            <p>{department.name} - {department.testName}</p>
          </div>
          <Button onClick={handleLogout} variant="outline">
            Logout
          </Button>
        </div>

        <TestDepartmentDashboard department={department} />
      </div>
    );
  }

  // Test Department Auth
  if (currentView === 'test-auth') {
    return (
      <div className="min-h-screen p-8">
        <Button onClick={() => setCurrentView('menu')} variant="ghost" className="mb-8">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Menu
        </Button>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md mx-auto"
        >
          <Card>
            <CardHeader>
              <CardTitle>Test Department</CardTitle>
              <CardDescription>Register or login to your department</CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="login">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="login">Login</TabsTrigger>
                  <TabsTrigger value="register">Register</TabsTrigger>
                </TabsList>

                <TabsContent value="login">
                  <form onSubmit={handleLogin} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="loginEmail">Email</Label>
                      <Input
                        id="loginEmail"
                        type="email"
                        placeholder="your@email.com"
                        value={loginEmail}
                        onChange={(e) => setLoginEmail(e.target.value)}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="loginPassword">Password</Label>
                      <Input
                        id="loginPassword"
                        type="password"
                        placeholder="Enter password"
                        value={loginPassword}
                        onChange={(e) => setLoginPassword(e.target.value)}
                        required
                      />
                    </div>

                    <Button type="submit" className="w-full" disabled={loading}>
                      {loading ? 'Logging in...' : 'Login'}
                    </Button>
                  </form>
                </TabsContent>

                <TabsContent value="register">
                  <form onSubmit={handleRegister} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="selectedTest">Select Test Department</Label>
                      <Select value={selectedTest} onValueChange={setSelectedTest} required>
                        <SelectTrigger id="selectedTest">
                          <SelectValue placeholder="Choose department" />
                        </SelectTrigger>
                        <SelectContent>
                          {testDepartments.map((dept) => (
                            <SelectItem key={dept} value={dept}>
                              {dept}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="personName">Your Name</Label>
                      <Input
                        id="personName"
                        type="text"
                        placeholder="Enter your name"
                        value={personName}
                        onChange={(e) => setPersonName(e.target.value)}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="personEmail">Email</Label>
                      <Input
                        id="personEmail"
                        type="email"
                        placeholder="your@email.com"
                        value={personEmail}
                        onChange={(e) => setPersonEmail(e.target.value)}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="createPassword">Create Password</Label>
                      <Input
                        id="createPassword"
                        type="password"
                        placeholder="Minimum 6 characters"
                        value={createPassword}
                        onChange={(e) => setCreatePassword(e.target.value)}
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

                    <Button type="submit" className="w-full" disabled={loading}>
                      {loading ? 'Registering...' : 'Register'}
                    </Button>
                  </form>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }

  // Nurse Portal
  if (currentView === 'nurse') {
    return (
      <div className="min-h-screen p-8">
        <Button onClick={() => setCurrentView('menu')} variant="ghost" className="mb-8">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Menu
        </Button>

        <NursePortal />
      </div>
    );
  }

  return null;
}
