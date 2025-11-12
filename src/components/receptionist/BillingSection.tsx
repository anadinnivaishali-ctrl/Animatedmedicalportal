import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Toaster } from "sonner";
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
import { Receipt, Printer } from 'lucide-react';
import { projectId, publicAnonKey } from '../../utils/supabase/info';

const governmentSchemes = [
  { value: '', label: 'None' },
  { value: 'ayushman', label: 'Ayushman Bharat (80% discount)' },
  { value: 'bpl', label: 'BPL Card (50% discount)' }
];

export default function BillingSection() {
  const [loading, setLoading] = useState(false);
  const [aadhaar, setAadhaar] = useState('');
  const [patient, setPatient] = useState<any>(null);
  const [record, setRecord] = useState<any>(null);
  const [selectedScheme, setSelectedScheme] = useState('');
  const [billing, setBilling] = useState<any>(null);

  const handleFetchPatient = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Fetch patient data
      const patientResponse = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-790bca28/patient/${aadhaar}`,
        {
          headers: {
            Authorization: `Bearer ${publicAnonKey}`,
          },
        }
      );

      const patientData = await patientResponse.json();

      if (!patientResponse.ok) {
        throw new Error(patientData.error || 'Patient not found');
      }

      setPatient(patientData.patient);

      // Fetch patient record
      const recordResponse = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-790bca28/patient-record/${aadhaar}`,
        {
          headers: {
            Authorization: `Bearer ${publicAnonKey}`,
          },
        }
      );

      const recordData = await recordResponse.json();
      setRecord(recordData.record);

      toast.success('Patient data loaded');
    } catch (error: any) {
      toast.error(error.message);
      setPatient(null);
      setRecord(null);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateBill = async () => {
    if (!record || !record.rows) {
      toast.error('No medical records found');
      return;
    }

    // Collect all tests from all rows
    const allTests: string[] = [];
    record.rows.forEach((row: any) => {
      if (row.tests && row.tests.length > 0) {
        row.tests.forEach((test: any) => {
          allTests.push(test.name);
        });
      }
    });

    if (allTests.length === 0) {
      toast.error('No tests prescribed');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-790bca28/billing/calculate`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${publicAnonKey}`,
          },
          body: JSON.stringify({
            aadhaar,
            selectedTests: allTests,
            governmentScheme: selectedScheme,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Billing calculation failed');
      }

      setBilling(data.billing);
      toast.success('Bill generated successfully');
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="max-w-6xl mx-auto"
    >
      <h1 className="text-4xl mb-8 text-center">Billing Counter</h1>

      {/* Patient Lookup */}
      <Card className="mb-8 print:hidden">
        <CardHeader>
          <CardTitle>Find Patient</CardTitle>
          <CardDescription>Enter patient's Aadhaar number to generate bill</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleFetchPatient} className="space-y-4">
            <div className="flex gap-4">
              <div className="flex-1 space-y-2">
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
              </div>
              <div className="pt-8">
                <Button type="submit" disabled={loading}>
                  {loading ? 'Loading...' : 'Fetch Patient'}
                </Button>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Patient Info & Billing */}
      {patient && (
        <>
          <Card className="mb-8 print:hidden">
            <CardHeader>
              <CardTitle>Patient Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
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
                  <p className="text-sm text-gray-600">Age</p>
                  <p>{patient.age} years</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="scheme">Government Scheme (Optional)</Label>
                  <Select value={selectedScheme} onValueChange={setSelectedScheme}>
                    <SelectTrigger id="scheme">
                      <SelectValue placeholder="Select scheme" />
                    </SelectTrigger>
                    <SelectContent>
                      {governmentSchemes.map((scheme) => (
                        <SelectItem key={scheme.value} value={scheme.value}>
                          {scheme.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <Button onClick={handleGenerateBill} className="w-full" disabled={loading}>
                  <Receipt className="h-4 w-4 mr-2" />
                  {loading ? 'Generating...' : 'Generate Bill'}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Bill Display */}
          {billing && (
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Final Bill</CardTitle>
                  <CardDescription>Patient billing summary</CardDescription>
                </div>
                <Button onClick={handlePrint} variant="outline" className="print:hidden">
                  <Printer className="h-4 w-4 mr-2" />
                  Print
                </Button>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {/* Bill Header */}
                  <div className="text-center pb-4 border-b">
                    <h2 className="text-2xl">MEDIXA HEALTHCARE</h2>
                    <p className="text-sm text-gray-600">Patient Billing Invoice</p>
                  </div>

                  {/* Patient Details */}
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-600">Patient Name:</p>
                      <p>{patient.name}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Aadhaar:</p>
                      <p>{patient.aadhaar}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Mobile:</p>
                      <p>{patient.mobile}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Date:</p>
                      <p>{new Date().toLocaleDateString()}</p>
                    </div>
                  </div>

                  {/* Bill Table */}
                  <table className="w-full text-sm border">
                    <thead>
                      <tr className="bg-gray-100">
                        <th className="text-left p-3 border">S.No</th>
                        <th className="text-left p-3 border">Test Name</th>
                        <th className="text-right p-3 border">Cost (₹)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {billing.tests.map((test: any, index: number) => (
                        <tr key={index} className="border">
                          <td className="p-3 border">{index + 1}</td>
                          <td className="p-3 border">{test.name}</td>
                          <td className="text-right p-3 border">₹{test.cost}</td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr className="border-t-2">
                        <td colSpan={2} className="p-3 text-right">
                          <strong>Subtotal:</strong>
                        </td>
                        <td className="text-right p-3">
                          <strong>₹{billing.subtotal}</strong>
                        </td>
                      </tr>
                      {billing.discount > 0 && (
                        <>
                          <tr className="text-green-600">
                            <td colSpan={2} className="p-3 text-right">
                              Discount ({billing.schemeApplied}):
                            </td>
                            <td className="text-right p-3">-₹{billing.discount}</td>
                          </tr>
                        </>
                      )}
                      <tr className="border-t-2 bg-gray-50">
                        <td colSpan={2} className="p-3 text-right">
                          <strong className="text-lg">Final Amount:</strong>
                        </td>
                        <td className="text-right p-3">
                          <strong className="text-lg">₹{billing.finalAmount}</strong>
                        </td>
                      </tr>
                    </tfoot>
                  </table>

                  {/* Footer */}
                  <div className="text-center text-sm text-gray-600 pt-4 border-t">
                    <p>Thank you for choosing Medixa Healthcare</p>
                    <p className="text-xs mt-2">This is a system-generated bill</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </motion.div>
  );
}
