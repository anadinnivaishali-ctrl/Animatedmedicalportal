import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Button } from '../ui/button';
import { Printer } from 'lucide-react';
import { projectId, publicAnonKey } from '../../utils/supabase/info';

interface PatientFinalReportProps {
  patient: any;
}

export default function PatientFinalReport({ patient }: PatientFinalReportProps) {
  const [record, setRecord] = useState<any>(null);
  const [billing, setBilling] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      // Load patient record
      const recordResponse = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-790bca28/patient-record/${patient.aadhaar}`,
        {
          headers: {
            Authorization: `Bearer ${publicAnonKey}`,
          },
        }
      );
      const recordData = await recordResponse.json();
      setRecord(recordData.record);

      // Load billing
      const billingResponse = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-790bca28/billing/${patient.aadhaar}`,
        {
          headers: {
            Authorization: `Bearer ${publicAnonKey}`,
          },
        }
      );
      const billingData = await billingResponse.json();
      setBilling(billingData.billing);
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return <div className="text-center py-12">Loading patient report...</div>;
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-4 print:hidden">
        <Button onClick={handlePrint}>
          <Printer className="h-4 w-4 mr-2" />
          Print Report
        </Button>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white shadow-lg rounded-lg print:shadow-none"
        style={{ width: '210mm', minHeight: '297mm', margin: '0 auto', padding: '20mm' }}
      >
        {/* Hospital Header */}
        <div className="text-center mb-8 pb-4 border-b-2 border-gray-300">
          <h1 className="text-4xl mb-2">MEDIXA HEALTHCARE</h1>
          <p className="text-lg">Patient Final Report</p>
          <p className="text-sm text-gray-600">Complete Medical Summary & Billing</p>
        </div>

        {/* Patient Information */}
        <div className="mb-8">
          <h2 className="text-2xl mb-4 bg-blue-100 p-2 rounded">Patient Information</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600">Patient Name</p>
              <p>{patient.name}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Aadhaar Number</p>
              <p>{patient.aadhaar}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Mobile Number</p>
              <p>{patient.mobile}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Gender</p>
              <p>{patient.gender}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Date of Birth</p>
              <p>{patient.dob}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Age</p>
              <p>{patient.age} years</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Report Date</p>
              <p>{new Date().toLocaleDateString()}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Status</p>
              <p className={record?.discharged ? 'text-green-600 font-semibold' : 'text-orange-600'}>
                {record?.discharged ? 'Discharged' : 'Under Treatment'}
              </p>
            </div>
          </div>
        </div>

        {/* Medical Summary */}
        {record?.summary && (
          <div className="mb-8">
            <h2 className="text-2xl mb-4 bg-green-100 p-2 rounded">Medical Summary</h2>
            <div className="whitespace-pre-wrap bg-gray-50 p-4 rounded border">
              {record.summary}
            </div>
          </div>
        )}

        {/* Medical Records */}
        {record?.rows && record.rows.length > 0 && (
          <div className="mb-8">
            <h2 className="text-2xl mb-4 bg-purple-100 p-2 rounded">Medical Records</h2>
            <div className="space-y-4">
              {record.rows.map((row: any, index: number) => (
                <div key={row.id} className="border rounded p-4">
                  <h3 className="font-semibold mb-3">Record #{index + 1}</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    {row.cause && (
                      <div>
                        <p className="text-gray-600 mb-1">Symptoms/Cause:</p>
                        <p className="bg-yellow-50 p-2 rounded">{row.cause}</p>
                      </div>
                    )}
                    {row.prescription && (
                      <div>
                        <p className="text-gray-600 mb-1">Prescription:</p>
                        <p className="bg-green-50 p-2 rounded">{row.prescription}</p>
                      </div>
                    )}
                  </div>
                  {row.tests && row.tests.length > 0 && (
                    <div className="mt-3">
                      <p className="text-gray-600 mb-2">Tests Prescribed:</p>
                      <div className="grid grid-cols-2 gap-2">
                        {row.tests.map((test: any, idx: number) => (
                          <div key={idx} className="flex justify-between bg-blue-50 p-2 rounded text-sm">
                            <span>{test.name}</span>
                            <span className="text-gray-600">₹{test.cost}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Billing Information */}
        {billing && (
          <div className="mb-8">
            <h2 className="text-2xl mb-4 bg-orange-100 p-2 rounded">Billing Information</h2>
            <div className="border rounded p-4">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2">Test Name</th>
                    <th className="text-left py-2">Department</th>
                    <th className="text-right py-2">Cost</th>
                  </tr>
                </thead>
                <tbody>
                  {billing.tests?.map((test: any, idx: number) => (
                    <tr key={idx} className="border-b">
                      <td className="py-2">{test.name}</td>
                      <td className="py-2">{test.department || 'N/A'}</td>
                      <td className="text-right py-2">₹{test.cost}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="border-t-2">
                    <td colSpan={2} className="py-2 text-right">Subtotal:</td>
                    <td className="text-right py-2">₹{billing.subtotal}</td>
                  </tr>
                  {billing.discount > 0 && (
                    <>
                      <tr>
                        <td colSpan={2} className="py-2 text-right text-green-600">
                          Discount ({billing.schemeApplied}):
                        </td>
                        <td className="text-right py-2 text-green-600">-₹{billing.discount}</td>
                      </tr>
                    </>
                  )}
                  <tr className="border-t-2">
                    <td colSpan={2} className="py-2 text-right">
                      <strong>Final Amount:</strong>
                    </td>
                    <td className="text-right py-2">
                      <strong>₹{billing.finalAmount}</strong>
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="mt-12 pt-8 border-t-2 border-gray-300">
          <div className="grid grid-cols-2 gap-8">
            <div>
              <p className="text-sm text-gray-600 mb-2">Authorized By:</p>
              <div className="border-t border-gray-400 pt-2 mt-8">
                <p>Doctor's Signature</p>
              </div>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-2">Hospital Seal:</p>
              <div className="border-t border-gray-400 pt-2 mt-8">
                <p>Hospital Stamp</p>
              </div>
            </div>
          </div>
          <div className="mt-6 text-center text-sm text-gray-500">
            <p>This is a system-generated report from Medixa Healthcare Management System</p>
            <p>Report ID: MED-{patient.aadhaar}-{Date.now()}</p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
