import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
<<<<<<< HEAD
import { toast } from "sonner";
=======
import { toast } from 'sonner@2.0.3';
>>>>>>> 0598809536fc89d9adfc1f1a4cc8762b6339f77d
import { Button } from '../ui/button';
import { Textarea } from '../ui/textarea';
import { Card } from '../ui/card';
import { Label } from '../ui/label';
import { Mic, Plus, Trash2, Save, FileText, Check } from 'lucide-react';
import { projectId, publicAnonKey } from '../../utils/supabase/info';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import { Checkbox } from '../ui/checkbox';

interface DoctorPageProps {
  patient: any;
}

interface Test {
  name: string;
  cost: number;
  department: string;
  paid: boolean;
}

interface TableRow {
  id: string;
  cause: string;
  prescription: string;
  tests: Test[];
}

export default function DoctorPage({ patient }: DoctorPageProps) {
  const [loading, setLoading] = useState(false);
  const [rows, setRows] = useState<TableRow[]>([]);
  const [availableTests, setAvailableTests] = useState<Test[]>([]);
  const [summary, setSummary] = useState('');
  const [discharged, setDischarged] = useState(false);
  const [recording, setRecording] = useState<{rowId: string, field: 'cause' | 'prescription'} | null>(null);

  useEffect(() => {
    loadTests();
    loadPatientRecord();
  }, []);

  const loadTests = async () => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-790bca28/tests`,
        {
          headers: {
            Authorization: `Bearer ${publicAnonKey}`,
          },
        }
      );
      const data = await response.json();
      setAvailableTests(data.tests.map((t: any) => ({ ...t, paid: false })));
    } catch (error) {
      console.error('Failed to load tests:', error);
    }
  };

  const loadPatientRecord = async () => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-790bca28/patient-record/${patient.aadhaar}`,
        {
          headers: {
            Authorization: `Bearer ${publicAnonKey}`,
          },
        }
      );
      const data = await response.json();
      if (data.record.rows && data.record.rows.length > 0) {
        setRows(data.record.rows);
        setSummary(data.record.summary || '');
        setDischarged(data.record.discharged || false);
      } else {
        addRow();
      }
    } catch (error) {
      console.error('Failed to load patient record:', error);
      addRow();
    }
  };

  const addRow = () => {
    setRows([...rows, {
      id: Date.now().toString(),
      cause: '',
      prescription: '',
      tests: []
    }]);
  };

  const removeRow = (id: string) => {
    setRows(rows.filter(row => row.id !== id));
  };

  const updateRow = (id: string, field: keyof TableRow, value: any) => {
    setRows(rows.map(row => row.id === id ? { ...row, [field]: value } : row));
  };

  const toggleTest = (rowId: string, test: Test) => {
    setRows(rows.map(row => {
      if (row.id === rowId) {
        const exists = row.tests.find(t => t.name === test.name);
        if (exists) {
          return { ...row, tests: row.tests.filter(t => t.name !== test.name) };
        } else {
          return { ...row, tests: [...row.tests, { ...test }] };
        }
      }
      return row;
    }));
  };

  const handleVoiceNote = (rowId: string, field: 'cause' | 'prescription') => {
    setRecording({ rowId, field });
    toast.info('Voice recording feature - In production, this would use Web Speech API');
    
    // Simulate voice input after 2 seconds
    setTimeout(() => {
      const mockText = field === 'cause' 
        ? 'Patient complains of fever and headache since 2 days'
        : 'Prescribed Paracetamol 500mg twice daily for 3 days';
      updateRow(rowId, field, mockText);
      setRecording(null);
      toast.success('Voice note added (simulated)');
    }, 2000);
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-790bca28/patient-record/save`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${publicAnonKey}`,
          },
          body: JSON.stringify({
            aadhaar: patient.aadhaar,
            rows,
            summary,
            discharged
          }),
        }
      );

      if (!response.ok) {
        throw new Error('Failed to save record');
      }

      toast.success('Record saved successfully!');
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSummarize = () => {
    // Generate summary from all rows
    let summaryText = `Medical Summary for ${patient.name}\n\n`;
    
    rows.forEach((row, index) => {
      if (row.cause || row.prescription || row.tests.length > 0) {
        summaryText += `Visit ${index + 1}:\n`;
        if (row.cause) summaryText += `Cause: ${row.cause}\n`;
        if (row.prescription) summaryText += `Prescription: ${row.prescription}\n`;
        if (row.tests.length > 0) {
          summaryText += `Tests: ${row.tests.map(t => t.name).join(', ')}\n`;
        }
        summaryText += '\n';
      }
    });

    setSummary(summaryText);
    toast.success('Summary generated! Save to apply to final report.');
  };

  return (
    <div className="max-w-7xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white shadow-lg rounded-lg"
        style={{ width: '210mm', minHeight: '297mm', margin: '0 auto', padding: '20mm' }}
      >
        {/* Patient Header */}
        <div className="mb-8 pb-4 border-b-2 border-gray-300">
          <h1 className="text-3xl mb-4 text-center">MEDICAL RECORD</h1>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div><strong>Patient Name:</strong> {patient.name}</div>
            <div><strong>Aadhaar:</strong> {patient.aadhaar}</div>
            <div><strong>Mobile:</strong> {patient.mobile}</div>
            <div><strong>Gender:</strong> {patient.gender}</div>
            <div><strong>Date of Birth:</strong> {patient.dob}</div>
            <div><strong>Age:</strong> {patient.age} years</div>
          </div>
        </div>

        {/* Medical Records Table */}
        <div className="space-y-4 mb-6">
          {rows.map((row, index) => (
            <Card key={row.id} className="p-4">
              <div className="flex justify-between items-center mb-4">
                <h3>Record #{index + 1}</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeRow(row.id)}
                  disabled={rows.length === 1}
                >
                  <Trash2 className="h-4 w-4 text-red-500" />
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Cause Column */}
                <div className="space-y-2">
                  <Label>Cause / Symptoms</Label>
                  <Textarea
                    value={row.cause}
                    onChange={(e) => updateRow(row.id, 'cause', e.target.value)}
                    placeholder="Enter symptoms..."
                    rows={4}
                    className={recording?.rowId === row.id && recording?.field === 'cause' ? 'border-red-500' : ''}
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleVoiceNote(row.id, 'cause')}
                    className="w-full"
                  >
                    <Mic className="h-4 w-4 mr-2" />
                    {recording?.rowId === row.id && recording?.field === 'cause' ? 'Recording...' : 'Voice Note'}
                  </Button>
                </div>

                {/* Prescription Column */}
                <div className="space-y-2">
                  <Label>Prescription</Label>
                  <Textarea
                    value={row.prescription}
                    onChange={(e) => updateRow(row.id, 'prescription', e.target.value)}
                    placeholder="Enter prescription..."
                    rows={4}
                    className={recording?.rowId === row.id && recording?.field === 'prescription' ? 'border-red-500' : ''}
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleVoiceNote(row.id, 'prescription')}
                    className="w-full"
                  >
                    <Mic className="h-4 w-4 mr-2" />
                    {recording?.rowId === row.id && recording?.field === 'prescription' ? 'Recording...' : 'Voice Note'}
                  </Button>
                </div>

                {/* Tests Required Column */}
                <div className="space-y-2">
                  <Label>Tests Required</Label>
                  <div className="border rounded-md p-3 max-h-48 overflow-y-auto space-y-2">
                    {availableTests.map((test) => {
                      const isSelected = row.tests.some(t => t.name === test.name);
                      return (
                        <div key={test.name} className="flex items-start space-x-2">
                          <Checkbox
                            checked={isSelected}
                            onCheckedChange={() => toggleTest(row.id, test)}
                          />
                          <div className="flex-1 text-sm">
                            <div>{test.name}</div>
                            <div className="text-xs text-gray-500">
                              ₹{test.cost} - {test.department}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Paid History Column */}
                <div className="space-y-2">
                  <Label>Payment Status</Label>
                  <div className="border rounded-md p-3 max-h-48 overflow-y-auto space-y-2">
                    {row.tests.length === 0 ? (
                      <p className="text-sm text-gray-500">No tests selected</p>
                    ) : (
                      row.tests.map((test, idx) => (
                        <div key={idx} className="flex items-center justify-between text-sm">
                          <span className="flex-1 truncate">{test.name}</span>
                          <span className={`px-2 py-1 rounded text-xs ${test.paid ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                            {test.paid ? 'Paid' : 'Unpaid'}
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>

        <Button onClick={addRow} variant="outline" className="w-full mb-6">
          <Plus className="h-4 w-4 mr-2" />
          Add New Record Entry
        </Button>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-4 mb-6">
          <Button onClick={handleSave} disabled={loading}>
            <Save className="h-4 w-4 mr-2" />
            {loading ? 'Saving...' : 'Save'}
          </Button>
          <Button onClick={handleSummarize} variant="outline">
            <FileText className="h-4 w-4 mr-2" />
            Generate Summary
          </Button>
          <Button
            onClick={() => setDischarged(!discharged)}
            variant={discharged ? 'default' : 'outline'}
          >
            <Check className="h-4 w-4 mr-2" />
            {discharged ? 'Patient Discharged' : 'Enable Discharge'}
          </Button>
        </div>

        {/* Summary Display */}
        {summary && (
          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <h3 className="text-lg mb-2">Generated Summary:</h3>
            <pre className="whitespace-pre-wrap text-sm">{summary}</pre>
          </div>
        )}
      </motion.div>
    </div>
  );
}
