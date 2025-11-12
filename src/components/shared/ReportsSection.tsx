import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
<<<<<<< HEAD
import { toast } from "sonner";
=======
import { toast } from 'sonner@2.0.3';
>>>>>>> 0598809536fc89d9adfc1f1a4cc8762b6339f77d
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import { Upload, FileText, Download, Eye } from 'lucide-react';
import { projectId, publicAnonKey } from '../../utils/supabase/info';

interface ReportsSectionProps {
  patient: any;
}

const testDepartments = [
  'Pathology',
  'Radiology',
  'Cardiology',
  'Neurology',
  'Orthopedics',
  'General Medicine'
];

export default function ReportsSection({ patient }: ReportsSectionProps) {
  const [loading, setLoading] = useState(false);
  const [selectedDepartment, setSelectedDepartment] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [reports, setReports] = useState<any[]>([]);

  useEffect(() => {
    loadReports();
  }, []);

  const loadReports = async () => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-790bca28/reports/${patient.aadhaar}`,
        {
          headers: {
            Authorization: `Bearer ${publicAnonKey}`,
          },
        }
      );
      const data = await response.json();
      setReports(data.reports || []);
    } catch (error) {
      console.error('Failed to load reports:', error);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedFile || !selectedDepartment) {
      toast.error('Please select a department and file');
      return;
    }

    setLoading(true);

    try {
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('aadhaar', patient.aadhaar);
      formData.append('department', selectedDepartment);

      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-790bca28/reports/upload`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${publicAnonKey}`,
          },
          body: formData,
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Upload failed');
      }

      toast.success('Report uploaded successfully!');
      setSelectedFile(null);
      setSelectedDepartment('');
      loadReports();
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleViewReport = (url: string) => {
    window.open(url, '_blank');
  };

  return (
    <div className="max-w-6xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-4xl mb-8">Medical Reports</h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Upload Section */}
          <Card>
            <CardHeader>
              <CardTitle>Upload New Report</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleUpload} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="department">Select Test Department</Label>
                  <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
                    <SelectTrigger id="department">
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
                  <Label htmlFor="file">Choose File</Label>
                  <Input
                    id="file"
                    type="file"
                    onChange={handleFileChange}
                    accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                  />
                  {selectedFile && (
                    <p className="text-sm text-gray-600">
                      Selected: {selectedFile.name}
                    </p>
                  )}
                </div>

                <Button type="submit" className="w-full" disabled={loading}>
                  <Upload className="h-4 w-4 mr-2" />
                  {loading ? 'Uploading...' : 'Upload Report'}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Patient Info */}
          <Card>
            <CardHeader>
              <CardTitle>Patient Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
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
            </CardContent>
          </Card>
        </div>

        {/* Reports List */}
        <div className="mt-8">
          <h2 className="text-2xl mb-4">Uploaded Reports</h2>
          {reports.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center text-gray-500">
                <FileText className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                <p>No reports uploaded yet</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {reports.map((report, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="hover:shadow-lg transition-shadow">
                    <CardContent className="pt-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                          <FileText className="h-6 w-6 text-blue-600" />
                        </div>
                      </div>
                      <h3 className="font-semibold mb-2">{report.department}</h3>
                      <p className="text-sm text-gray-600 mb-1">{report.fileName}</p>
                      <p className="text-xs text-gray-500 mb-4">
                        {new Date(report.uploadedAt).toLocaleDateString()}
                      </p>
                      <Button
                        variant="outline"
                        className="w-full"
                        onClick={() => handleViewReport(report.url)}
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        View Report
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
