import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import { createClient } from "jsr:@supabase/supabase-js@2";
import * as kv from "./kv_store.tsx";

const app = new Hono();

// Enable logger
app.use('*', logger(console.log));

// Enable CORS for all routes and methods
app.use(
  "/*",
  cors({
    origin: "*",
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
  }),
);

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
);

// Initialize storage bucket
const bucketName = 'make-790bca28-reports';
const initializeBucket = async () => {
  const { data: buckets } = await supabase.storage.listBuckets();
  const bucketExists = buckets?.some(bucket => bucket.name === bucketName);
  if (!bucketExists) {
    await supabase.storage.createBucket(bucketName, { public: false });
  }
};
initializeBucket();

// Helper to generate OTP
function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Helper to verify OTP
async function verifyOTP(identifier: string, inputOTP: string): Promise<boolean> {
  const stored = await kv.get(`otp:${identifier}`);
  if (!stored) return false;
  
  const { otp, timestamp } = JSON.parse(stored);
  // OTP valid for 5 minutes
  if (Date.now() - timestamp > 5 * 60 * 1000) {
    await kv.del(`otp:${identifier}`);
    return false;
  }
  
  if (otp === inputOTP) {
    await kv.del(`otp:${identifier}`);
    return true;
  }
  return false;
}

// Mock Aadhaar data fetch (in production, integrate with actual Aadhaar API)
function fetchAadhaarData(aadhaar: string) {
  // Mock data - in real scenario, this would call Aadhaar API
  const mockData: Record<string, any> = {
    '123456789012': {
      name: 'Rajesh Kumar',
      mobile: '9876543210',
      gender: 'Male',
      dob: '1990-05-15'
    },
    '234567890123': {
      name: 'Priya Sharma',
      mobile: '9876543211',
      gender: 'Female',
      dob: '1985-08-20'
    },
    '345678901234': {
      name: 'Amit Patel',
      mobile: '9876543212',
      gender: 'Male',
      dob: '1995-03-10'
    }
  };
  
  return mockData[aadhaar] || null;
}

// Calculate age from DOB
function calculateAge(dob: string): number {
  const birthDate = new Date(dob);
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
}

// Health check endpoint
app.get("/make-server-790bca28/health", (c) => {
  return c.json({ status: "ok" });
});

// ========== RECEPTIONIST ROUTES ==========

app.post("/make-server-790bca28/receptionist/register", async (c) => {
  try {
    const { hospitalName, receptionistName, hospitalEmail } = await c.req.json();
    
    if (!hospitalName || !receptionistName || !hospitalEmail) {
      return c.json({ error: "All fields are required" }, 400);
    }
    
    // Check if receptionist already exists
    const existing = await kv.get(`receptionist:${hospitalEmail}`);
    if (existing) {
      return c.json({ error: "Receptionist already registered with this email" }, 409);
    }
    
    // Store receptionist data
    await kv.set(`receptionist:${hospitalEmail}`, JSON.stringify({
      hospitalName,
      receptionistName,
      hospitalEmail,
      createdAt: Date.now()
    }));
    
    console.log(`Receptionist registered: ${hospitalEmail}`);
    return c.json({ success: true, message: "Receptionist registered successfully" });
  } catch (error) {
    console.error('Receptionist registration error:', error);
    return c.json({ error: "Registration failed: " + error.message }, 500);
  }
});

app.post("/make-server-790bca28/receptionist/send-otp", async (c) => {
  try {
    const { email } = await c.req.json();
    
    // Verify receptionist exists
    const receptionist = await kv.get(`receptionist:${email}`);
    if (!receptionist) {
      return c.json({ error: "Receptionist not found. Please register first." }, 404);
    }
    
    // Generate and store OTP
    const otp = generateOTP();
    await kv.set(`otp:${email}`, JSON.stringify({ otp, timestamp: Date.now() }));
    
    // In production, send OTP via email
    console.log(`OTP for ${email}: ${otp}`);
    
    return c.json({ success: true, message: "OTP sent to your email", otp }); // Remove otp in production
  } catch (error) {
    console.error('OTP send error:', error);
    return c.json({ error: "Failed to send OTP: " + error.message }, 500);
  }
});

app.post("/make-server-790bca28/receptionist/verify-otp", async (c) => {
  try {
    const { email, otp } = await c.req.json();
    
    const isValid = await verifyOTP(email, otp);
    if (!isValid) {
      return c.json({ error: "Invalid or expired OTP" }, 401);
    }
    
    const receptionist = await kv.get(`receptionist:${email}`);
    return c.json({ success: true, receptionist: JSON.parse(receptionist!) });
  } catch (error) {
    console.error('OTP verification error:', error);
    return c.json({ error: "Verification failed: " + error.message }, 500);
  }
});

// ========== PATIENT ROUTES ==========

app.post("/make-server-790bca28/patient/register", async (c) => {
  try {
    const { aadhaar } = await c.req.json();
    
    if (!aadhaar || aadhaar.length !== 12) {
      return c.json({ error: "Valid 12-digit Aadhaar number is required" }, 400);
    }
    
    // Check if patient already exists
    const existing = await kv.get(`patient:${aadhaar}`);
    if (existing) {
      return c.json({ error: "Patient already registered" }, 409);
    }
    
    // Fetch data from Aadhaar
    const aadhaarData = fetchAadhaarData(aadhaar);
    if (!aadhaarData) {
      return c.json({ error: "Aadhaar data not found. Please use demo Aadhaar: 123456789012, 234567890123, or 345678901234" }, 404);
    }
    
    const age = calculateAge(aadhaarData.dob);
    const patientData = {
      aadhaar,
      ...aadhaarData,
      age,
      registeredAt: Date.now()
    };
    
    await kv.set(`patient:${aadhaar}`, JSON.stringify(patientData));
    
    console.log(`Patient registered: ${aadhaar}`);
    return c.json({ success: true, patient: patientData });
  } catch (error) {
    console.error('Patient registration error:', error);
    return c.json({ error: "Registration failed: " + error.message }, 500);
  }
});

app.post("/make-server-790bca28/patient/send-otp", async (c) => {
  try {
    const { aadhaar } = await c.req.json();
    
    const patient = await kv.get(`patient:${aadhaar}`);
    if (!patient) {
      return c.json({ error: "Patient not found. Please register first." }, 404);
    }
    
    const patientData = JSON.parse(patient);
    const otp = generateOTP();
    await kv.set(`otp:patient:${aadhaar}`, JSON.stringify({ otp, timestamp: Date.now() }));
    
    // In production, send OTP to mobile
    console.log(`OTP for patient ${aadhaar} (${patientData.mobile}): ${otp}`);
    
    return c.json({ success: true, message: "OTP sent to registered mobile", otp, mobile: patientData.mobile });
  } catch (error) {
    console.error('Patient OTP send error:', error);
    return c.json({ error: "Failed to send OTP: " + error.message }, 500);
  }
});

app.post("/make-server-790bca28/patient/verify-otp", async (c) => {
  try {
    const { aadhaar, otp } = await c.req.json();
    
    const isValid = await verifyOTP(`patient:${aadhaar}`, otp);
    if (!isValid) {
      return c.json({ error: "Invalid or expired OTP" }, 401);
    }
    
    const patient = await kv.get(`patient:${aadhaar}`);
    return c.json({ success: true, patient: JSON.parse(patient!) });
  } catch (error) {
    console.error('Patient OTP verification error:', error);
    return c.json({ error: "Verification failed: " + error.message }, 500);
  }
});

app.get("/make-server-790bca28/patient/:aadhaar", async (c) => {
  try {
    const aadhaar = c.req.param('aadhaar');
    const patient = await kv.get(`patient:${aadhaar}`);
    
    if (!patient) {
      return c.json({ error: "Patient not found" }, 404);
    }
    
    return c.json({ patient: JSON.parse(patient) });
  } catch (error) {
    console.error('Patient fetch error:', error);
    return c.json({ error: "Failed to fetch patient: " + error.message }, 500);
  }
});

// ========== DOCTOR ROUTES ==========

app.post("/make-server-790bca28/doctor/register", async (c) => {
  try {
    const { doctorId, name, mobile, specialist, password } = await c.req.json();
    
    if (!doctorId || !name || !mobile || !specialist || !password) {
      return c.json({ error: "All fields are required" }, 400);
    }
    
    // Check if doctor already exists
    const existing = await kv.get(`doctor:${doctorId}`);
    if (existing) {
      return c.json({ error: "Doctor ID already registered" }, 409);
    }
    
    const email = `${doctorId}@medixa.com`; // Generate email from ID
    
    await kv.set(`doctor:${doctorId}`, JSON.stringify({
      doctorId,
      name,
      email,
      mobile,
      specialist,
      password, // In production, hash this
      createdAt: Date.now()
    }));
    
    console.log(`Doctor registered: ${doctorId}`);
    return c.json({ success: true, message: "Doctor registered successfully", email });
  } catch (error) {
    console.error('Doctor registration error:', error);
    return c.json({ error: "Registration failed: " + error.message }, 500);
  }
});

app.post("/make-server-790bca28/doctor/login", async (c) => {
  try {
    const { email, password } = await c.req.json();
    
    // Find doctor by email
    const allDoctors = await kv.getByPrefix('doctor:');
    const doctor = allDoctors.find(d => {
      const data = JSON.parse(d.value);
      return data.email === email;
    });
    
    if (!doctor) {
      return c.json({ error: "Doctor not found" }, 404);
    }
    
    const doctorData = JSON.parse(doctor.value);
    if (doctorData.password !== password) {
      return c.json({ error: "Invalid password" }, 401);
    }
    
    const { password: _, ...doctorWithoutPassword } = doctorData;
    return c.json({ success: true, doctor: doctorWithoutPassword });
  } catch (error) {
    console.error('Doctor login error:', error);
    return c.json({ error: "Login failed: " + error.message }, 500);
  }
});

app.post("/make-server-790bca28/doctor/send-reset-otp", async (c) => {
  try {
    const { email } = await c.req.json();
    
    const allDoctors = await kv.getByPrefix('doctor:');
    const doctor = allDoctors.find(d => {
      const data = JSON.parse(d.value);
      return data.email === email;
    });
    
    if (!doctor) {
      return c.json({ error: "Doctor not found" }, 404);
    }
    
    const otp = generateOTP();
    await kv.set(`otp:doctor:${email}`, JSON.stringify({ otp, timestamp: Date.now() }));
    
    console.log(`Password reset OTP for ${email}: ${otp}`);
    return c.json({ success: true, message: "OTP sent to your email", otp });
  } catch (error) {
    console.error('Doctor reset OTP error:', error);
    return c.json({ error: "Failed to send OTP: " + error.message }, 500);
  }
});

app.post("/make-server-790bca28/doctor/reset-password", async (c) => {
  try {
    const { email, otp, newPassword } = await c.req.json();
    
    const isValid = await verifyOTP(`doctor:${email}`, otp);
    if (!isValid) {
      return c.json({ error: "Invalid or expired OTP" }, 401);
    }
    
    const allDoctors = await kv.getByPrefix('doctor:');
    const doctorEntry = allDoctors.find(d => {
      const data = JSON.parse(d.value);
      return data.email === email;
    });
    
    if (!doctorEntry) {
      return c.json({ error: "Doctor not found" }, 404);
    }
    
    const doctorData = JSON.parse(doctorEntry.value);
    doctorData.password = newPassword;
    await kv.set(doctorEntry.key, JSON.stringify(doctorData));
    
    return c.json({ success: true, message: "Password reset successfully" });
  } catch (error) {
    console.error('Doctor password reset error:', error);
    return c.json({ error: "Password reset failed: " + error.message }, 500);
  }
});

// ========== PATIENT RECORDS ROUTES ==========

app.get("/make-server-790bca28/patient-record/:aadhaar", async (c) => {
  try {
    const aadhaar = c.req.param('aadhaar');
    const record = await kv.get(`patient-record:${aadhaar}`);
    
    if (!record) {
      // Return empty record structure
      return c.json({
        record: {
          aadhaar,
          rows: [],
          summary: '',
          discharged: false
        }
      });
    }
    
    return c.json({ record: JSON.parse(record) });
  } catch (error) {
    console.error('Patient record fetch error:', error);
    return c.json({ error: "Failed to fetch record: " + error.message }, 500);
  }
});

app.post("/make-server-790bca28/patient-record/save", async (c) => {
  try {
    const { aadhaar, rows, summary, discharged } = await c.req.json();
    
    // Get patient data for test requests
    const patientData = await kv.get(`patient:${aadhaar}`);
    const patient = patientData ? JSON.parse(patientData) : null;
    
    await kv.set(`patient-record:${aadhaar}`, JSON.stringify({
      aadhaar,
      rows: rows || [],
      summary: summary || '',
      discharged: discharged || false,
      updatedAt: Date.now()
    }));
    
    // Create test requests for newly prescribed tests
    if (rows && rows.length > 0 && patient) {
      for (const row of rows) {
        if (row.tests && row.tests.length > 0) {
          for (const test of row.tests) {
            const requestId = `${aadhaar}:${test.name}:${Date.now()}`;
            
            // Check if request already exists
            const existing = await kv.get(`test-request:${requestId}`);
            if (!existing) {
              await kv.set(`test-request:${requestId}`, JSON.stringify({
                id: requestId,
                aadhaar,
                patientName: patient.name,
                testName: test.name,
                department: test.department,
                status: 'pending',
                requestedAt: Date.now()
              }));
            }
          }
        }
      }
    }
    
    console.log(`Patient record saved for: ${aadhaar}`);
    return c.json({ success: true, message: "Record saved successfully" });
  } catch (error) {
    console.error('Patient record save error:', error);
    return c.json({ error: "Failed to save record: " + error.message }, 500);
  }
});

// ========== TEST ROUTES ==========

const testsList = [
  { name: 'Complete Blood Count (CBC)', cost: 500, department: 'Pathology' },
  { name: 'Blood Sugar Test', cost: 300, department: 'Pathology' },
  { name: 'Lipid Profile', cost: 800, department: 'Pathology' },
  { name: 'Liver Function Test (LFT)', cost: 1200, department: 'Pathology' },
  { name: 'Kidney Function Test (KFT)', cost: 1000, department: 'Pathology' },
  { name: 'Thyroid Profile', cost: 600, department: 'Pathology' },
  { name: 'X-Ray Chest', cost: 400, department: 'Radiology' },
  { name: 'X-Ray Full Body', cost: 1500, department: 'Radiology' },
  { name: 'CT Scan', cost: 5000, department: 'Radiology' },
  { name: 'MRI Scan', cost: 8000, department: 'Radiology' },
  { name: 'Ultrasound', cost: 1200, department: 'Radiology' },
  { name: 'ECG', cost: 300, department: 'Cardiology' },
  { name: 'Echo Cardiogram', cost: 2000, department: 'Cardiology' },
  { name: 'Urine Analysis', cost: 200, department: 'Pathology' },
  { name: 'Stool Test', cost: 250, department: 'Pathology' }
];

app.get("/make-server-790bca28/tests", (c) => {
  return c.json({ tests: testsList });
});

app.post("/make-server-790bca28/test-department/register", async (c) => {
  try {
    const { testName, name, email, password } = await c.req.json();
    
    if (!testName || !name || !email || !password) {
      return c.json({ error: "All fields are required" }, 400);
    }
    
    const existing = await kv.get(`test-dept:${email}`);
    if (existing) {
      return c.json({ error: "Test department already registered with this email" }, 409);
    }
    
    await kv.set(`test-dept:${email}`, JSON.stringify({
      testName,
      name,
      email,
      password,
      createdAt: Date.now()
    }));
    
    console.log(`Test department registered: ${email} for ${testName}`);
    return c.json({ success: true, message: "Test department registered successfully" });
  } catch (error) {
    console.error('Test department registration error:', error);
    return c.json({ error: "Registration failed: " + error.message }, 500);
  }
});

app.post("/make-server-790bca28/test-department/login", async (c) => {
  try {
    const { email, password } = await c.req.json();
    
    const dept = await kv.get(`test-dept:${email}`);
    if (!dept) {
      return c.json({ error: "Test department not found" }, 404);
    }
    
    const deptData = JSON.parse(dept);
    if (deptData.password !== password) {
      return c.json({ error: "Invalid password" }, 401);
    }
    
    const { password: _, ...deptWithoutPassword } = deptData;
    return c.json({ success: true, department: deptWithoutPassword });
  } catch (error) {
    console.error('Test department login error:', error);
    return c.json({ error: "Login failed: " + error.message }, 500);
  }
});

// ========== REPORTS ROUTES ==========

app.post("/make-server-790bca28/reports/upload", async (c) => {
  try {
    const formData = await c.req.formData();
    const file = formData.get('file') as File;
    const aadhaar = formData.get('aadhaar') as string;
    const department = formData.get('department') as string;
    
    if (!file || !aadhaar || !department) {
      return c.json({ error: "File, aadhaar, and department are required" }, 400);
    }
    
    const fileName = `${aadhaar}/${department}/${Date.now()}_${file.name}`;
    const fileBuffer = await file.arrayBuffer();
    
    const { data, error } = await supabase.storage
      .from(bucketName)
      .upload(fileName, fileBuffer, {
        contentType: file.type,
        upsert: false
      });
    
    if (error) {
      console.error('File upload error:', error);
      return c.json({ error: "File upload failed: " + error.message }, 500);
    }
    
    // Store report metadata
    const reportId = `report:${aadhaar}:${department}:${Date.now()}`;
    await kv.set(reportId, JSON.stringify({
      aadhaar,
      department,
      fileName: file.name,
      storagePath: fileName,
      uploadedAt: Date.now()
    }));
    
    console.log(`Report uploaded: ${fileName}`);
    return c.json({ success: true, message: "Report uploaded successfully", reportId });
  } catch (error) {
    console.error('Report upload error:', error);
    return c.json({ error: "Upload failed: " + error.message }, 500);
  }
});

app.get("/make-server-790bca28/reports/:aadhaar", async (c) => {
  try {
    const aadhaar = c.req.param('aadhaar');
    const allReports = await kv.getByPrefix(`report:${aadhaar}:`);
    
    const reports = await Promise.all(allReports.map(async (r) => {
      const reportData = JSON.parse(r.value);
      
      // Generate signed URL
      const { data: signedUrlData } = await supabase.storage
        .from(bucketName)
        .createSignedUrl(reportData.storagePath, 3600); // 1 hour expiry
      
      return {
        ...reportData,
        url: signedUrlData?.signedUrl
      };
    }));
    
    return c.json({ reports });
  } catch (error) {
    console.error('Reports fetch error:', error);
    return c.json({ error: "Failed to fetch reports: " + error.message }, 500);
  }
});

// ========== BILLING ROUTES ==========

app.post("/make-server-790bca28/billing/calculate", async (c) => {
  try {
    const { aadhaar, selectedTests, governmentScheme } = await c.req.json();
    
    let total = 0;
    const testsWithCost = selectedTests.map((testName: string) => {
      const test = testsList.find(t => t.name === testName);
      const cost = test?.cost || 0;
      total += cost;
      return { name: testName, cost };
    });
    
    let discount = 0;
    let schemeApplied = '';
    
    if (governmentScheme === 'ayushman') {
      discount = total * 0.8; // 80% discount
      schemeApplied = 'Ayushman Bharat (80% discount)';
    } else if (governmentScheme === 'bpl') {
      discount = total * 0.5; // 50% discount
      schemeApplied = 'BPL Card (50% discount)';
    }
    
    const finalAmount = total - discount;
    
    // Store billing info
    await kv.set(`billing:${aadhaar}`, JSON.stringify({
      aadhaar,
      tests: testsWithCost,
      subtotal: total,
      discount,
      schemeApplied,
      finalAmount,
      billedAt: Date.now()
    }));
    
    console.log(`Billing calculated for: ${aadhaar}`);
    return c.json({
      success: true,
      billing: {
        tests: testsWithCost,
        subtotal: total,
        discount,
        schemeApplied,
        finalAmount
      }
    });
  } catch (error) {
    console.error('Billing calculation error:', error);
    return c.json({ error: "Billing calculation failed: " + error.message }, 500);
  }
});

app.get("/make-server-790bca28/billing/:aadhaar", async (c) => {
  try {
    const aadhaar = c.req.param('aadhaar');
    const billing = await kv.get(`billing:${aadhaar}`);
    
    if (!billing) {
      return c.json({ billing: null });
    }
    
    return c.json({ billing: JSON.parse(billing) });
  } catch (error) {
    console.error('Billing fetch error:', error);
    return c.json({ error: "Failed to fetch billing: " + error.message }, 500);
  }
});

app.post("/make-server-790bca28/billing/update-payment", async (c) => {
  try {
    const { aadhaar, testName, paid } = await c.req.json();
    
    const record = await kv.get(`patient-record:${aadhaar}`);
    if (!record) {
      return c.json({ error: "Patient record not found" }, 404);
    }
    
    const recordData = JSON.parse(record);
    recordData.rows = recordData.rows.map((row: any) => {
      if (row.tests?.some((t: any) => t.name === testName)) {
        return {
          ...row,
          tests: row.tests.map((t: any) => 
            t.name === testName ? { ...t, paid } : t
          )
        };
      }
      return row;
    });
    
    await kv.set(`patient-record:${aadhaar}`, JSON.stringify(recordData));
    
    return c.json({ success: true, message: "Payment status updated" });
  } catch (error) {
    console.error('Payment update error:', error);
    return c.json({ error: "Failed to update payment: " + error.message }, 500);
  }
});

// ========== TEST REQUEST ROUTES ==========

app.get("/make-server-790bca28/test-requests/:department", async (c) => {
  try {
    const department = c.req.param('department');
    const allRequests = await kv.getByPrefix('test-request:');
    
    // Filter requests for this department
    const departmentRequests = allRequests
      .map(r => JSON.parse(r.value))
      .filter(req => req.department === department);
    
    return c.json({ requests: departmentRequests });
  } catch (error) {
    console.error('Test requests fetch error:', error);
    return c.json({ error: "Failed to fetch test requests: " + error.message }, 500);
  }
});

app.post("/make-server-790bca28/test-requests/update-status", async (c) => {
  try {
    const { requestId, status } = await c.req.json();
    
    const request = await kv.get(`test-request:${requestId}`);
    if (!request) {
      return c.json({ error: "Test request not found" }, 404);
    }
    
    const requestData = JSON.parse(request);
    requestData.status = status;
    requestData.updatedAt = Date.now();
    
    await kv.set(`test-request:${requestId}`, JSON.stringify(requestData));
    
    return c.json({ success: true, message: "Status updated successfully" });
  } catch (error) {
    console.error('Test request status update error:', error);
    return c.json({ error: "Failed to update status: " + error.message }, 500);
  }
});

app.post("/make-server-790bca28/test-requests/submit-result", async (c) => {
  try {
    const { requestId, result, resultFile } = await c.req.json();
    
    const request = await kv.get(`test-request:${requestId}`);
    if (!request) {
      return c.json({ error: "Test request not found" }, 404);
    }
    
    const requestData = JSON.parse(request);
    requestData.status = 'completed';
    requestData.result = result;
    requestData.resultFile = resultFile;
    requestData.completedAt = Date.now();
    
    await kv.set(`test-request:${requestId}`, JSON.stringify(requestData));
    
    return c.json({ success: true, message: "Result submitted successfully" });
  } catch (error) {
    console.error('Test result submission error:', error);
    return c.json({ error: "Failed to submit result: " + error.message }, 500);
  }
});

// ========== NURSING ROUTES ==========

app.get("/make-server-790bca28/nursing/:aadhaar", async (c) => {
  try {
    const aadhaar = c.req.param('aadhaar');
    const nursingData = await kv.get(`nursing:${aadhaar}`);
    
    if (!nursingData) {
      return c.json({ nursingData: null });
    }
    
    return c.json({ nursingData: JSON.parse(nursingData) });
  } catch (error) {
    console.error('Nursing data fetch error:', error);
    return c.json({ error: "Failed to fetch nursing data: " + error.message }, 500);
  }
});

app.post("/make-server-790bca28/nursing/save-vitals", async (c) => {
  try {
    const { aadhaar, vitals, timestamp } = await c.req.json();
    
    // Get existing nursing data
    const existing = await kv.get(`nursing:${aadhaar}`);
    let nursingData = existing ? JSON.parse(existing) : {
      aadhaar,
      vitals: {},
      vitalHistory: [],
      medications: [],
      notes: ''
    };
    
    // Update vitals and add to history
    nursingData.vitals = vitals;
    nursingData.vitalHistory = nursingData.vitalHistory || [];
    nursingData.vitalHistory.push({
      ...vitals,
      timestamp
    });
    
    // Keep only last 50 vital sign records
    if (nursingData.vitalHistory.length > 50) {
      nursingData.vitalHistory = nursingData.vitalHistory.slice(-50);
    }
    
    await kv.set(`nursing:${aadhaar}`, JSON.stringify(nursingData));
    
    console.log(`Vitals saved for patient: ${aadhaar}`);
    return c.json({ success: true, message: "Vitals saved successfully" });
  } catch (error) {
    console.error('Vitals save error:', error);
    return c.json({ error: "Failed to save vitals: " + error.message }, 500);
  }
});

app.post("/make-server-790bca28/nursing/save-medications", async (c) => {
  try {
    const { aadhaar, medications } = await c.req.json();
    
    // Get existing nursing data
    const existing = await kv.get(`nursing:${aadhaar}`);
    let nursingData = existing ? JSON.parse(existing) : {
      aadhaar,
      vitals: {},
      vitalHistory: [],
      medications: [],
      notes: ''
    };
    
    nursingData.medications = medications;
    nursingData.medicationsUpdatedAt = Date.now();
    
    await kv.set(`nursing:${aadhaar}`, JSON.stringify(nursingData));
    
    console.log(`Medications saved for patient: ${aadhaar}`);
    return c.json({ success: true, message: "Medications saved successfully" });
  } catch (error) {
    console.error('Medications save error:', error);
    return c.json({ error: "Failed to save medications: " + error.message }, 500);
  }
});

app.post("/make-server-790bca28/nursing/save-notes", async (c) => {
  try {
    const { aadhaar, notes, timestamp } = await c.req.json();
    
    // Get existing nursing data
    const existing = await kv.get(`nursing:${aadhaar}`);
    let nursingData = existing ? JSON.parse(existing) : {
      aadhaar,
      vitals: {},
      vitalHistory: [],
      medications: [],
      notes: ''
    };
    
    nursingData.notes = notes;
    nursingData.notesUpdatedAt = timestamp;
    
    await kv.set(`nursing:${aadhaar}`, JSON.stringify(nursingData));
    
    console.log(`Nursing notes saved for patient: ${aadhaar}`);
    return c.json({ success: true, message: "Notes saved successfully" });
  } catch (error) {
    console.error('Nursing notes save error:', error);
    return c.json({ error: "Failed to save notes: " + error.message }, 500);
  }
});

Deno.serve(app.fetch);
