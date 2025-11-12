# Medixa Healthcare Management System - User Guide

Welcome to **Medixa**, a comprehensive healthcare management system with multiple portals for different user types.

## 🏥 System Overview

Medixa provides a complete digital healthcare solution with the following portals:
1. **Receptionist Portal** - Patient registration, doctor registration, and billing
2. **Doctor Portal** - Patient record management and prescriptions
3. **Others Portal** - Test departments and nursing staff
4. **Patient Portal** - View medical records and reports

---

## 🔐 Demo Credentials & Test Data

### Demo Aadhaar Numbers (for patient registration/login):
- `123456789012` - Rajesh Kumar (Male, DOB: 1990-05-15)
- `234567890123` - Priya Sharma (Female, DOB: 1985-08-20)
- `345678901234` - Amit Patel (Male, DOB: 1995-03-10)

### OTP System:
- **OTP is displayed in the success toast notification** for demo purposes
- In production, OTPs would be sent via email/SMS
- OTPs are valid for 5 minutes

---

## 📋 How to Use Each Portal

### 1️⃣ Receptionist Portal

#### Registration:
1. Click **"Receptionist"** from home
2. Go to **"Register"** tab
3. Enter:
   - Hospital Name
   - Receptionist Name
   - Hospital Email
4. Click **"Register"**

#### Login:
1. Enter registered hospital email
2. Click **"Send OTP"**
3. Copy OTP from toast notification
4. Enter OTP and verify

#### After Login - Three Options:

**A) Patient Management:**
- **Patient Registration:**
  - Enter one of the demo Aadhaar numbers
  - System auto-fills patient data from Aadhaar
  - Patient is registered
  
- **Patient Login:**
  - Enter registered patient's Aadhaar
  - OTP sent to linked mobile
  - Verify OTP to access patient dashboard

**B) Doctor Registration:**
- Enter Doctor ID (e.g., DOC001)
- Enter doctor details
- Select specialization
- Set password
- System generates email as: `{doctorId}@medixa.com`

**C) Billing:**
- Enter patient's Aadhaar
- System fetches all prescribed tests
- Select government scheme (optional):
  - Ayushman Bharat (80% discount)
  - BPL Card (50% discount)
- Generate and print final bill

---

### 2️⃣ Doctor Portal

#### Login:
1. Click **"Doctor"** from home
2. Enter email (format: `DOC001@medixa.com`)
3. Enter password set during registration
4. Click **"Login"**

#### Forgot Password:
1. Go to **"Forgot Password"** tab
2. Enter registered email
3. Get OTP via email (shown in toast)
4. Enter OTP and new password
5. Password reset complete

#### After Login - Patient Access:
1. Enter patient's Aadhaar number
2. Access patient dashboard with 3 sections:

**A) Patient Final Report:**
- Complete A4-sized medical summary
- Patient information
- Medical summary from doctor
- All medical records
- Billing information
- Print-ready format

**B) Doctor Page:**
- A4-sized medical record form
- Patient details header
- Dynamic table with 4 columns:
  - **Cause/Symptoms** - Type or use voice note
  - **Prescription** - Type or use voice note
  - **Tests Required** - Select from list with costs
  - **Payment Status** - Auto-updated from billing
- Add multiple record entries
- Actions:
  - **Save** - Save current records
  - **Generate Summary** - Create medical summary
  - **Enable Discharge** - Mark patient as discharged

**C) Reports:**
- Upload test reports
- Select department (Pathology, Radiology, etc.)
- Choose file (PDF, images, documents)
- Upload and view reports
- All reports accessible to doctors and test departments

---

### 3️⃣ Others Portal

#### Test Departments:

**Registration:**
1. Select test department (Pathology, Radiology, etc.)
2. Enter your name
3. Enter email
4. Create password
5. Register

**Login:**
1. Enter registered email
2. Enter password
3. Access department dashboard

**Department Dashboard:**
- **Statistics Overview:**
  - View pending, in-progress, and completed test counts
  - Real-time updates on department workload

- **Test Requests Tab:**
  - View all test requests for your department
  - Search by patient name or Aadhaar
  - Filter by status (Pending/In Progress/Completed)
  - Start processing pending tests
  - Submit results for in-progress tests
  - View completed test details

- **Submit Results Tab:**
  - Enter detailed test results
  - Upload test report files (PDF, images, documents)
  - Mark tests as completed
  - Results automatically linked to patient records

**Workflow:**
1. Doctor prescribes tests → Automatically creates test requests
2. Test department sees pending requests
3. Technician starts test (status: In Progress)
4. Technician enters results and uploads report
5. Test marked as Completed
6. Results available to doctor and patient

#### Nurse Portal:

**Patient Lookup:**
1. Enter patient's Aadhaar number
2. Load patient information
3. Access three main sections

**Vital Signs Monitoring:**
- Record patient vital signs:
  - Blood Pressure (mmHg)
  - Heart Rate (bpm)
  - Temperature (°F)
  - Oxygen Level (%)
  - Respiratory Rate (breaths/min)
- Save vital signs with timestamp
- Automatic history tracking

**Medication Administration:**
- Add new medications:
  - Medication name
  - Dosage
  - Scheduled time
- Track medication status
- Mark medications as administered
- View complete medication schedule
- Save medication records

**Nursing Notes:**
- Document patient observations
- Record care activities
- Note patient condition changes
- Save with timestamp
- Comprehensive patient care documentation

---

### 4️⃣ Patient Portal

1. Click **"Patient"** from home
2. Enter your Aadhaar number
3. Get OTP on registered mobile
4. Verify OTP
5. Access your dashboard:
   - View final medical report
   - Check prescriptions and treatments
   - View uploaded test reports

---

## 🧪 Available Tests

The system includes 15 pre-configured tests:

### Pathology Department:
- Complete Blood Count (CBC) - ₹500
- Blood Sugar Test - ₹300
- Lipid Profile - ₹800
- Liver Function Test (LFT) - ₹1,200
- Kidney Function Test (KFT) - ₹1,000
- Thyroid Profile - ₹600
- Urine Analysis - ₹200
- Stool Test - ₹250

### Radiology Department:
- X-Ray Chest - ₹400
- X-Ray Full Body - ₹1,500
- CT Scan - ₹5,000
- MRI Scan - ₹8,000
- Ultrasound - ₹1,200

### Cardiology Department:
- ECG - ₹300
- Echo Cardiogram - ₹2,000

---

## 💡 Key Features

### 🎤 Voice Notes:
- Click microphone icon on Doctor Page
- Simulated in demo (shows mock text after 2 seconds)
- Production would use Web Speech API

### 💰 Government Schemes:
- **Ayushman Bharat**: 80% discount on bills
- **BPL Card**: 50% discount on bills

### 🖨️ Print Functionality:
- Patient Final Report - Print-ready A4 format
- Billing Invoice - Print-ready format
- Use browser print (Ctrl+P / Cmd+P)

### 📊 Real-time Updates:
- All data persists in Supabase database
- Records sync across all portals
- File uploads stored in Supabase Storage

### 🏥 Integrated Workflow:
- **Automatic Test Requests**: Tests prescribed by doctors automatically appear in test departments
- **Cross-Portal Data Sync**: Patient data accessible to all authorized portals
- **Complete Audit Trail**: All vital signs, medications, and notes timestamped
- **Multi-Department Coordination**: Seamless communication between nursing, doctors, and test labs

---

## 🔄 Complete Workflow Example

1. **Receptionist** registers patient with Aadhaar
2. **Nurse** records initial vital signs for patient
3. **Doctor** accesses patient via Aadhaar
4. **Doctor** adds symptoms, prescriptions, and test requirements
5. **Doctor** generates summary and saves
6. **Test Department** automatically receives test requests
7. **Test Technician** processes tests and uploads results
8. **Nurse** administers medications and updates vitals
9. **Receptionist** generates bill with all tests and schemes
10. **Patient** logs in to view complete medical report
11. **Doctor** reviews test results and discharges patient

---

## ⚠️ Important Notes

### Security & Compliance:
- **This is a DEMO/PROTOTYPE system**
- Do NOT use with real patient data
- Production systems require:
  - HIPAA compliance
  - Data encryption
  - Proper authentication
  - Audit logging
  - Access controls

### Demo Limitations:
- Aadhaar data is mocked (3 demo patients)
- OTPs displayed in UI (should be sent via SMS/email)
- Passwords not hashed (should use bcrypt)
- File storage is basic (needs proper medical document handling)
- Voice notes simulated (needs Web Speech API integration)

### Browser Compatibility:
- Best viewed in Chrome/Edge
- Print features work best in Chrome
- Responsive design for mobile/tablet

---

## 🚀 Production Enhancements

For a production-ready system, consider:

1. **Aadhaar Integration**: Real Aadhaar API for verification
2. **SMS Gateway**: Twilio/AWS SNS for OTP delivery
3. **Email Service**: SendGrid/AWS SES for notifications
4. **Advanced Security**: JWT tokens, role-based access control
5. **Database**: Dedicated tables instead of KV store
6. **File Management**: Medical document versioning
7. **Analytics**: Dashboard for hospital management
8. **Appointment System**: Scheduling and queue management
9. **Pharmacy Integration**: Prescription to pharmacy workflow
10. **Insurance**: Claims processing integration
11. **Compliance**: HIPAA/local regulations adherence
12. **Backup & Recovery**: Automated backups, disaster recovery

---

## 📞 Support

This system demonstrates a complete healthcare management workflow. Each feature is functional and connected to a real backend (Supabase).

For questions about the implementation, refer to the code comments or check the component files in `/components/`.

---

**Built with:** React, TypeScript, Tailwind CSS, Supabase, Motion (Framer Motion), ShadCN UI

**© 2025 Medixa Healthcare Solutions**
