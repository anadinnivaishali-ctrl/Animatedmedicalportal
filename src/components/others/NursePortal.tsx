import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Toaster } from "sonner";
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Badge } from '../ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Activity, Heart, Thermometer, Droplet, User, Clock, Plus, Save, Search } from 'lucide-react';
import { projectId, publicAnonKey } from '../../utils/supabase/info';

interface VitalSigns {
  bloodPressure: string;
  heartRate: string;
  temperature: string;
  oxygenLevel: string;
  respiratoryRate: string;
}

interface MedicationRecord {
  id: string;
  medicationName: string;
  dosage: string;
  time: string;
  administered: boolean;
}

export default function NursePortal() {
  const [loading, setLoading] = useState(false);
  const [aadhaar, setAadhaar] = useState('');
  const [patientData, setPatientData] = useState<any>(null);
  
  // Vitals State
  const [vitals, setVitals] = useState<VitalSigns>({
    bloodPressure: '',
    heartRate: '',
    temperature: '',
    oxygenLevel: '',
    respiratoryRate: '',
  });

  // Medication State
  const [medications, setMedications] = useState<MedicationRecord[]>([]);
  const [newMedication, setNewMedication] = useState({
    name: '',
    dosage: '',
    time: '',
  });

  // Notes State
  const [nursingNotes, setNursingNotes] = useState('');

  const handleLoadPatient = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-790bca28/patient/${aadhaar}`,
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

      setPatientData(data.patient);
      toast.success('Patient loaded successfully');
      
      // Load existing vitals and medications
      loadNursingData();
    } catch (error: any) {
      toast.error(error.message);
      setPatientData(null);
    } finally {
      setLoading(false);
    }
  };

  const loadNursingData = async () => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-790bca28/nursing/${aadhaar}`,
        {
          headers: {
            Authorization: `Bearer ${publicAnonKey}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        if (data.nursingData) {
          setVitals(data.nursingData.vitals || vitals);
          setMedications(data.nursingData.medications || []);
          setNursingNotes(data.nursingData.notes || '');
        }
      }
    } catch (error) {
      console.error('Failed to load nursing data:', error);
    }
  };

  const handleSaveVitals = async () => {
    if (!patientData) {
      toast.error('Please load a patient first');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-790bca28/nursing/save-vitals`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${publicAnonKey}`,
          },
          body: JSON.stringify({
            aadhaar,
            vitals,
            timestamp: Date.now(),
          }),
        }
      );

      if (!response.ok) {
        throw new Error('Failed to save vitals');
      }

      toast.success('Vital signs saved successfully');
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAddMedication = () => {
    if (!newMedication.name || !newMedication.dosage || !newMedication.time) {
      toast.error('Please fill all medication fields');
      return;
    }

    const medication: MedicationRecord = {
      id: Date.now().toString(),
      medicationName: newMedication.name,
      dosage: newMedication.dosage,
      time: newMedication.time,
      administered: false,
    };

    setMedications([...medications, medication]);
    setNewMedication({ name: '', dosage: '', time: '' });
    toast.success('Medication added');
  };

  const handleToggleMedication = (id: string) => {
    setMedications(medications.map(med => 
      med.id === id ? { ...med, administered: !med.administered } : med
    ));
  };

  const handleSaveMedications = async () => {
    if (!patientData) {
      toast.error('Please load a patient first');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-790bca28/nursing/save-medications`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${publicAnonKey}`,
          },
          body: JSON.stringify({
            aadhaar,
            medications,
          }),
        }
      );

      if (!response.ok) {
        throw new Error('Failed to save medications');
      }

      toast.success('Medications saved successfully');
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveNotes = async () => {
    if (!patientData) {
      toast.error('Please load a patient first');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-790bca28/nursing/save-notes`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${publicAnonKey}`,
          },
          body: JSON.stringify({
            aadhaar,
            notes: nursingNotes,
            timestamp: Date.now(),
          }),
        }
      );

      if (!response.ok) {
        throw new Error('Failed to save notes');
      }

      toast.success('Nursing notes saved successfully');
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-7xl mx-auto"
    >
      <h1 className="text-4xl mb-8">Nurse Station</h1>

      {/* Patient Lookup */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Patient Lookup</CardTitle>
          <CardDescription>Enter patient Aadhaar to access nursing records</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLoadPatient} className="flex gap-4">
            <div className="flex-1">
              <Input
                type="text"
                placeholder="Enter 12-digit Aadhaar"
                value={aadhaar}
                onChange={(e) => setAadhaar(e.target.value.replace(/\D/g, '').slice(0, 12))}
                required
                maxLength={12}
              />
              <p className="text-xs text-gray-500 mt-1">
                Demo Aadhaar: 123456789012, 234567890123, 345678901234
              </p>
            </div>
            <Button type="submit" disabled={loading}>
              <Search className="h-4 w-4 mr-2" />
              {loading ? 'Loading...' : 'Load Patient'}
            </Button>
          </form>

          {patientData && (
            <div className="mt-4 p-4 bg-blue-50 rounded-lg">
              <h3 className="font-semibold mb-2">Current Patient</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-sm">
                <div><span className="text-gray-600">Name:</span> {patientData.name}</div>
                <div><span className="text-gray-600">Age:</span> {patientData.age} years</div>
                <div><span className="text-gray-600">Gender:</span> {patientData.gender}</div>
                <div><span className="text-gray-600">Mobile:</span> {patientData.mobile}</div>
                <div className="col-span-2"><span className="text-gray-600">Aadhaar:</span> {patientData.aadhaar}</div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {patientData && (
        <Tabs defaultValue="vitals">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="vitals">Vital Signs</TabsTrigger>
            <TabsTrigger value="medications">Medications</TabsTrigger>
            <TabsTrigger value="notes">Nursing Notes</TabsTrigger>
          </TabsList>

          <TabsContent value="vitals">
            <Card>
              <CardHeader>
                <CardTitle>Vital Signs Monitoring</CardTitle>
                <CardDescription>Record patient vital signs</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="bloodPressure" className="flex items-center gap-2">
                      <Activity className="h-4 w-4 text-red-600" />
                      Blood Pressure (mmHg)
                    </Label>
                    <Input
                      id="bloodPressure"
                      placeholder="120/80"
                      value={vitals.bloodPressure}
                      onChange={(e) => setVitals({ ...vitals, bloodPressure: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="heartRate" className="flex items-center gap-2">
                      <Heart className="h-4 w-4 text-pink-600" />
                      Heart Rate (bpm)
                    </Label>
                    <Input
                      id="heartRate"
                      type="number"
                      placeholder="72"
                      value={vitals.heartRate}
                      onChange={(e) => setVitals({ ...vitals, heartRate: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="temperature" className="flex items-center gap-2">
                      <Thermometer className="h-4 w-4 text-orange-600" />
                      Temperature (°F)
                    </Label>
                    <Input
                      id="temperature"
                      type="number"
                      step="0.1"
                      placeholder="98.6"
                      value={vitals.temperature}
                      onChange={(e) => setVitals({ ...vitals, temperature: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="oxygenLevel" className="flex items-center gap-2">
                      <Droplet className="h-4 w-4 text-blue-600" />
                      Oxygen Level (%)
                    </Label>
                    <Input
                      id="oxygenLevel"
                      type="number"
                      placeholder="98"
                      value={vitals.oxygenLevel}
                      onChange={(e) => setVitals({ ...vitals, oxygenLevel: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="respiratoryRate" className="flex items-center gap-2">
                      <Activity className="h-4 w-4 text-teal-600" />
                      Respiratory Rate (breaths/min)
                    </Label>
                    <Input
                      id="respiratoryRate"
                      type="number"
                      placeholder="16"
                      value={vitals.respiratoryRate}
                      onChange={(e) => setVitals({ ...vitals, respiratoryRate: e.target.value })}
                    />
                  </div>
                </div>

                <Button onClick={handleSaveVitals} disabled={loading}>
                  <Save className="h-4 w-4 mr-2" />
                  {loading ? 'Saving...' : 'Save Vital Signs'}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="medications">
            <Card>
              <CardHeader>
                <CardTitle>Medication Administration</CardTitle>
                <CardDescription>Track and administer medications</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Add Medication Form */}
                <div className="p-4 border rounded-lg space-y-4">
                  <h3 className="font-semibold">Add New Medication</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label>Medication Name</Label>
                      <Input
                        placeholder="e.g., Paracetamol"
                        value={newMedication.name}
                        onChange={(e) => setNewMedication({ ...newMedication, name: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Dosage</Label>
                      <Input
                        placeholder="e.g., 500mg"
                        value={newMedication.dosage}
                        onChange={(e) => setNewMedication({ ...newMedication, dosage: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Time</Label>
                      <Input
                        type="time"
                        value={newMedication.time}
                        onChange={(e) => setNewMedication({ ...newMedication, time: e.target.value })}
                      />
                    </div>
                  </div>
                  <Button onClick={handleAddMedication} variant="outline" className="w-full">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Medication
                  </Button>
                </div>

                {/* Medication List */}
                {medications.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    No medications added yet
                  </div>
                ) : (
                  <>
                    <div className="border rounded-lg overflow-hidden">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Medication</TableHead>
                            <TableHead>Dosage</TableHead>
                            <TableHead>Time</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Action</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {medications.map((med) => (
                            <TableRow key={med.id}>
                              <TableCell>{med.medicationName}</TableCell>
                              <TableCell>{med.dosage}</TableCell>
                              <TableCell className="flex items-center gap-2">
                                <Clock className="h-4 w-4 text-gray-400" />
                                {med.time}
                              </TableCell>
                              <TableCell>
                                {med.administered ? (
                                  <Badge className="bg-green-100 text-green-800">Administered</Badge>
                                ) : (
                                  <Badge variant="outline">Pending</Badge>
                                )}
                              </TableCell>
                              <TableCell>
                                <Button
                                  size="sm"
                                  variant={med.administered ? 'outline' : 'default'}
                                  onClick={() => handleToggleMedication(med.id)}
                                >
                                  {med.administered ? 'Undo' : 'Mark as Given'}
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>

                    <Button onClick={handleSaveMedications} disabled={loading}>
                      <Save className="h-4 w-4 mr-2" />
                      {loading ? 'Saving...' : 'Save Medication Records'}
                    </Button>
                  </>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="notes">
            <Card>
              <CardHeader>
                <CardTitle>Nursing Notes</CardTitle>
                <CardDescription>Document patient observations and care activities</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="nursingNotes">Notes</Label>
                  <Textarea
                    id="nursingNotes"
                    placeholder="Enter nursing notes, observations, patient condition, care provided..."
                    value={nursingNotes}
                    onChange={(e) => setNursingNotes(e.target.value)}
                    rows={12}
                  />
                  <p className="text-xs text-gray-500">
                    Document all relevant patient care information, observations, and interventions.
                  </p>
                </div>

                <Button onClick={handleSaveNotes} disabled={loading}>
                  <Save className="h-4 w-4 mr-2" />
                  {loading ? 'Saving...' : 'Save Nursing Notes'}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}
    </motion.div>
  );
}
