import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { toast } from 'sonner@2.0.3';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Upload, FileText, Search, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import { projectId, publicAnonKey } from '../../utils/supabase/info';

interface TestDepartmentDashboardProps {
  department: any;
}

interface TestRequest {
  id: string;
  aadhaar: string;
  patientName: string;
  testName: string;
  status: 'pending' | 'in-progress' | 'completed';
  requestedAt: number;
  result?: string;
  resultFile?: string;
  completedAt?: number;
}

export default function TestDepartmentDashboard({ department }: TestDepartmentDashboardProps) {
  const [loading, setLoading] = useState(false);
  const [testRequests, setTestRequests] = useState<TestRequest[]>([]);
  const [filteredRequests, setFilteredRequests] = useState<TestRequest[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedRequest, setSelectedRequest] = useState<TestRequest | null>(null);
  const [resultText, setResultText] = useState('');
  const [resultFile, setResultFile] = useState<File | null>(null);

  useEffect(() => {
    loadTestRequests();
  }, []);

  useEffect(() => {
    filterRequests();
  }, [testRequests, searchTerm, selectedStatus]);

  const loadTestRequests = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-790bca28/test-requests/${department.testName}`,
        {
          headers: {
            Authorization: `Bearer ${publicAnonKey}`,
          },
        }
      );
      
      const data = await response.json();
      if (response.ok) {
        setTestRequests(data.requests || []);
      }
    } catch (error) {
      console.error('Failed to load test requests:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterRequests = () => {
    let filtered = testRequests;
    
    if (selectedStatus !== 'all') {
      filtered = filtered.filter(req => req.status === selectedStatus);
    }
    
    if (searchTerm) {
      filtered = filtered.filter(req => 
        req.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        req.aadhaar.includes(searchTerm)
      );
    }
    
    setFilteredRequests(filtered);
  };

  const handleUpdateStatus = async (requestId: string, newStatus: 'pending' | 'in-progress' | 'completed') => {
    setLoading(true);
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-790bca28/test-requests/update-status`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${publicAnonKey}`,
          },
          body: JSON.stringify({ requestId, status: newStatus }),
        }
      );

      if (!response.ok) {
        throw new Error('Failed to update status');
      }

      toast.success('Status updated successfully');
      loadTestRequests();
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitResult = async () => {
    if (!selectedRequest || !resultText) {
      toast.error('Please enter test results');
      return;
    }

    setLoading(true);
    try {
      // If there's a file, upload it first
      let fileUrl = '';
      if (resultFile) {
        const formData = new FormData();
        formData.append('file', resultFile);
        formData.append('aadhaar', selectedRequest.aadhaar);
        formData.append('department', department.testName);

        const uploadResponse = await fetch(
          `https://${projectId}.supabase.co/functions/v1/make-server-790bca28/reports/upload`,
          {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${publicAnonKey}`,
            },
            body: formData,
          }
        );

        if (uploadResponse.ok) {
          const uploadData = await uploadResponse.json();
          fileUrl = uploadData.reportId;
        }
      }

      // Update test request with results
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-790bca28/test-requests/submit-result`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${publicAnonKey}`,
          },
          body: JSON.stringify({
            requestId: selectedRequest.id,
            result: resultText,
            resultFile: fileUrl,
          }),
        }
      );

      if (!response.ok) {
        throw new Error('Failed to submit result');
      }

      toast.success('Test result submitted successfully');
      setSelectedRequest(null);
      setResultText('');
      setResultFile(null);
      loadTestRequests();
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-300"><Clock className="h-3 w-3 mr-1" />Pending</Badge>;
      case 'in-progress':
        return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-300"><AlertCircle className="h-3 w-3 mr-1" />In Progress</Badge>;
      case 'completed':
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-300"><CheckCircle className="h-3 w-3 mr-1" />Completed</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const pendingCount = testRequests.filter(r => r.status === 'pending').length;
  const inProgressCount = testRequests.filter(r => r.status === 'in-progress').length;
  const completedCount = testRequests.filter(r => r.status === 'completed').length;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-7xl mx-auto"
    >
      <div className="mb-8">
        <h1 className="text-4xl mb-2">{department.testName} Department</h1>
        <p className="text-gray-600">Manage test requests and upload results</p>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Pending Tests</p>
                <p className="text-3xl">{pendingCount}</p>
              </div>
              <Clock className="h-10 w-10 text-yellow-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">In Progress</p>
                <p className="text-3xl">{inProgressCount}</p>
              </div>
              <AlertCircle className="h-10 w-10 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Completed</p>
                <p className="text-3xl">{completedCount}</p>
              </div>
              <CheckCircle className="h-10 w-10 text-green-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="requests">
        <TabsList>
          <TabsTrigger value="requests">Test Requests</TabsTrigger>
          <TabsTrigger value="submit">Submit Results</TabsTrigger>
        </TabsList>

        <TabsContent value="requests" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Test Requests</CardTitle>
              <CardDescription>View and manage all test requests for your department</CardDescription>
            </CardHeader>
            <CardContent>
              {/* Filters */}
              <div className="flex gap-4 mb-6">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Search by patient name or Aadhaar..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-9"
                    />
                  </div>
                </div>
                <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="in-progress">In Progress</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Test Requests Table */}
              {loading && testRequests.length === 0 ? (
                <div className="text-center py-12 text-gray-500">Loading test requests...</div>
              ) : filteredRequests.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <FileText className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                  <p>No test requests found</p>
                </div>
              ) : (
                <div className="border rounded-lg overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Patient Name</TableHead>
                        <TableHead>Aadhaar</TableHead>
                        <TableHead>Test Name</TableHead>
                        <TableHead>Requested Date</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredRequests.map((request) => (
                        <TableRow key={request.id}>
                          <TableCell>{request.patientName}</TableCell>
                          <TableCell className="font-mono">{request.aadhaar}</TableCell>
                          <TableCell>{request.testName}</TableCell>
                          <TableCell>{new Date(request.requestedAt).toLocaleDateString()}</TableCell>
                          <TableCell>{getStatusBadge(request.status)}</TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              {request.status === 'pending' && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleUpdateStatus(request.id, 'in-progress')}
                                >
                                  Start
                                </Button>
                              )}
                              {request.status === 'in-progress' && (
                                <Button
                                  size="sm"
                                  onClick={() => setSelectedRequest(request)}
                                >
                                  Submit Result
                                </Button>
                              )}
                              {request.status === 'completed' && (
                                <Button size="sm" variant="ghost">
                                  View Result
                                </Button>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="submit">
          <Card>
            <CardHeader>
              <CardTitle>Submit Test Results</CardTitle>
              <CardDescription>Enter test results and upload reports</CardDescription>
            </CardHeader>
            <CardContent>
              {selectedRequest ? (
                <div className="space-y-4">
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <h3 className="font-semibold mb-2">Patient Information</h3>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <span className="text-gray-600">Patient Name:</span> {selectedRequest.patientName}
                      </div>
                      <div>
                        <span className="text-gray-600">Aadhaar:</span> {selectedRequest.aadhaar}
                      </div>
                      <div className="col-span-2">
                        <span className="text-gray-600">Test Name:</span> {selectedRequest.testName}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="resultText">Test Results</Label>
                    <Textarea
                      id="resultText"
                      placeholder="Enter detailed test results..."
                      value={resultText}
                      onChange={(e) => setResultText(e.target.value)}
                      rows={8}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="resultFile">Upload Report (Optional)</Label>
                    <Input
                      id="resultFile"
                      type="file"
                      onChange={(e) => setResultFile(e.target.files?.[0] || null)}
                      accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                    />
                    {resultFile && (
                      <p className="text-sm text-gray-600">Selected: {resultFile.name}</p>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <Button onClick={handleSubmitResult} disabled={loading}>
                      <Upload className="h-4 w-4 mr-2" />
                      {loading ? 'Submitting...' : 'Submit Result'}
                    </Button>
                    <Button variant="outline" onClick={() => {
                      setSelectedRequest(null);
                      setResultText('');
                      setResultFile(null);
                    }}>
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12 text-gray-500">
                  <FileText className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                  <p>Select a test request from the "Test Requests" tab to submit results</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </motion.div>
  );
}
