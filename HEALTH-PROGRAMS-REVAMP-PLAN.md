# Health Programs Revamp Plan 🏥

**Date:** October 28, 2026  
**Objective:** Transform health programs from informational pages to **service request/registration systems**

---

## 🎯 Current vs. New Approach

### Current State (Informational):
- **Heart Warriors** → Link to external website (info only)
- **Wheels of Love** → Link to external website (info only)
- **Smile Bright Bago** → Link to external website (info only)

### New State (Functional):
- **Heart Warriors** → **Request cardiovascular screening/consultation**
- **Wheels of Love** → **Apply for wheelchair/mobility aid**
- **Smile Bright Bago** → **Book dental services appointment**

---

## 🔄 Transformation Strategy

### Approach: Service Request System
Each program will have a **registration/request form** where citizens can:
1. Submit their information
2. Request the specific service
3. Get a reference number
4. Track their request status
5. Receive notifications about approval/schedule

---

## 📋 Program Details

### 1. Heart Warriors (Cardiovascular Health)

**Service Type:** Request Screening/Consultation

**Form Fields:**
- Full Name *
- Age *
- Gender *
- Contact Number *
- Barangay * (dropdown: 24 barangays)
- Existing Heart Condition (Yes/No)
- Current Medications (text area, optional)
- Medical History (text area, optional)
- Preferred Date for Screening (calendar picker)
- Emergency Contact Name *
- Emergency Contact Number *

**Status Workflow:**
1. **Pending** — Request submitted, awaiting review
2. **Scheduled** — Appointment date confirmed
3. **Completed** — Screening done
4. **Follow-up Required** — Needs additional consultation

**Reference Number Format:** `HW-YYYY-XXXXX`  
Example: `HW-2026-00123`

---

### 2. Wheels of Love (PWD Mobility)

**Service Type:** Apply for Wheelchair/Mobility Aid

**Form Fields:**
- Full Name *
- Age *
- Gender *
- Contact Number *
- Barangay * (dropdown)
- PWD ID Number *
- Type of Disability * (dropdown: Physical, Visual, Hearing, etc.)
- Mobility Aid Needed * (dropdown: Manual Wheelchair, Electric Wheelchair, Walker, Crutches, Cane)
- Current Mobility Situation (text area) *
- Living Situation (dropdown: Alone, With Family, Caregiver)
- Medical Certificate Upload (photo/PDF)
- PWD ID Upload (photo) *
- Guardian Name (if applicable)
- Guardian Contact Number (if applicable)

**Status Workflow:**
1. **Pending** — Application submitted
2. **Under Review** — Verifying documents
3. **Approved** — Ready for distribution
4. **For Pickup/Delivery** — Schedule pickup
5. **Released** — Mobility aid provided

**Reference Number Format:** `WOL-YYYY-XXXXX`  
Example: `WOL-2026-00456`

---

### 3. Smile Bright Bago (Dental Health)

**Service Type:** Book Dental Service Appointment

**Form Fields:**
- Full Name *
- Age *
- Gender *
- Contact Number *
- Barangay * (dropdown)
- Service Needed * (checkboxes: Cleaning, Extraction, Check-up, Tooth Restoration, Others)
- Dental Concern (text area) *
- Last Dental Visit (date picker, optional)
- Allergies (text area, optional)
- Current Medications (text area, optional)
- Preferred Date (calendar picker)
- Preferred Time (dropdown: Morning 8-12, Afternoon 1-5)

**Status Workflow:**
1. **Pending** — Booking submitted
2. **Confirmed** — Appointment scheduled
3. **Completed** — Service done
4. **Follow-up Required** — Additional visits needed

**Reference Number Format:** `SBB-YYYY-XXXXX`  
Example: `SBB-2026-00789`

---

## 🎨 UI/UX Design

### Program Page Redesign

**Keep:**
- Beautiful cover images
- Program logos
- Program badges
- Statistics (5,000+ Beneficiaries, etc.)

**Add:**
- **"Request Service" button** (replaces "Visit Program" button)
- Quick info card: "How it works" (3 steps)
- Success stories carousel (optional)

**Remove:**
- External links to separate websites

### Request Form Design

**Layout:**
```
┌─────────────────────────────────────┐
│ ← Back to Programs                  │
├─────────────────────────────────────┤
│  🏥 Heart Warriors                  │
│  Request Cardiovascular Screening    │
├─────────────────────────────────────┤
│                                     │
│  Personal Information               │
│  ┌──────────────────────────────┐  │
│  │ Full Name *                  │  │
│  └──────────────────────────────┘  │
│  ┌──────────────────────────────┐  │
│  │ Age *        Gender *        │  │
│  └──────────────────────────────┘  │
│                                     │
│  Contact Information                │
│  ┌──────────────────────────────┐  │
│  │ Mobile Number *              │  │
│  └──────────────────────────────┘  │
│  ┌──────────────────────────────┐  │
│  │ Barangay * (dropdown)        │  │
│  └──────────────────────────────┘  │
│                                     │
│  Medical Information                │
│  ┌──────────────────────────────┐  │
│  │ Existing heart condition?    │  │
│  │ ○ Yes  ○ No                 │  │
│  └──────────────────────────────┘  │
│                                     │
│  [Submit Request]                   │
│                                     │
└─────────────────────────────────────┘
```

**Style:**
- Navy blue header (`#0A2E5C`)
- White cards with shadow
- Program color accents (Red for HW, Orange for WOL, Blue for SBB)
- Mobile-first responsive
- 44px touch targets
- Inline validation

### Success Page

```
┌─────────────────────────────────────┐
│                                     │
│         ✅ Request Submitted!       │
│                                     │
│  Your Heart Warriors screening      │
│  request has been received.         │
│                                     │
│  Reference Number:                  │
│  ┌──────────────────────────────┐  │
│  │  HW-2026-00123   [Copy]      │  │
│  └──────────────────────────────┘  │
│                                     │
│  What's Next?                       │
│  1. We'll review your request       │
│  2. You'll receive a confirmation   │
│  3. Attend your scheduled screening │
│                                     │
│  [Track Request Status]             │
│  [Back to Home]                     │
│                                     │
└─────────────────────────────────────┘
```

---

## 🗄️ Database Schema

### Table: `health_program_requests`

```sql
CREATE TABLE health_program_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  reference_number TEXT UNIQUE NOT NULL,
  program TEXT NOT NULL, -- 'heart_warriors', 'wheels_of_love', 'smile_bright'
  status TEXT NOT NULL DEFAULT 'pending',
  
  -- Personal Info
  full_name TEXT NOT NULL,
  age INTEGER NOT NULL,
  gender TEXT NOT NULL,
  contact_number TEXT NOT NULL,
  barangay TEXT NOT NULL,
  
  -- Program-specific data (JSONB for flexibility)
  program_data JSONB NOT NULL,
  
  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  scheduled_date TIMESTAMP WITH TIME ZONE,
  completed_date TIMESTAMP WITH TIME ZONE,
  
  -- Notes from staff
  staff_notes TEXT,
  admin_user_id UUID REFERENCES auth.users(id)
);

-- Indexes
CREATE INDEX idx_reference_number ON health_program_requests(reference_number);
CREATE INDEX idx_program ON health_program_requests(program);
CREATE INDEX idx_status ON health_program_requests(status);
CREATE INDEX idx_barangay ON health_program_requests(barangay);
CREATE INDEX idx_created_at ON health_program_requests(created_at DESC);
```

**Example `program_data` for Heart Warriors:**
```json
{
  "existing_condition": true,
  "current_medications": "Aspirin 100mg daily",
  "medical_history": "History of hypertension",
  "preferred_date": "2026-11-15",
  "emergency_contact_name": "Maria Santos",
  "emergency_contact_number": "09171234567"
}
```

**Example `program_data` for Wheels of Love:**
```json
{
  "pwd_id_number": "PWD-2026-1234",
  "disability_type": "Physical",
  "mobility_aid_needed": "Manual Wheelchair",
  "current_situation": "Unable to walk, uses old wheelchair",
  "living_situation": "With Family",
  "medical_cert_url": "https://storage.../cert.pdf",
  "pwd_id_url": "https://storage.../pwd-id.jpg",
  "guardian_name": "Juan Dela Cruz",
  "guardian_contact": "09181234567"
}
```

**Example `program_data` for Smile Bright Bago:**
```json
{
  "services_needed": ["Cleaning", "Extraction"],
  "dental_concern": "Toothache on lower left molar",
  "last_dental_visit": "2025-06-20",
  "allergies": "None",
  "current_medications": "None",
  "preferred_date": "2026-11-10",
  "preferred_time": "Morning 8-12"
}
```

---

## 🔐 Row-Level Security (RLS)

```sql
-- Enable RLS
ALTER TABLE health_program_requests ENABLE ROW LEVEL SECURITY;

-- Public can insert (submit requests)
CREATE POLICY "Anyone can submit requests"
  ON health_program_requests
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Public can view their own requests (by reference number)
CREATE POLICY "Anyone can view own request by reference"
  ON health_program_requests
  FOR SELECT
  TO anon, authenticated
  USING (true);

-- Only admins can update
CREATE POLICY "Only admins can update requests"
  ON health_program_requests
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.email LIKE '%@bagocity.gov.ph'
    )
  );
```

---

## 🚀 Implementation Plan

### Phase 1: Database Setup (30 mins)
1. Create Supabase project or use existing
2. Run SQL schema creation
3. Configure RLS policies
4. Test insert/select operations

### Phase 2: Request Forms (2-3 hours)
1. Create form components for each program
2. Add form validation
3. Implement file upload (for WOL)
4. Add submission logic
5. Generate reference numbers

### Phase 3: Success & Tracking (1-2 hours)
1. Create success confirmation pages
2. Build request tracking page (by reference number)
3. Add status timeline visualization
4. Copy reference number feature

### Phase 4: Update Program Pages (1 hour)
1. Update "page-programs" section
2. Replace "Visit Program" → "Request Service"
3. Add "How it Works" sections
4. Update navigation flow

### Phase 5: Admin Dashboard (3-4 hours)
**Separate task — for staff to manage requests**
1. Staff login
2. View all requests (filterable by program, status, barangay)
3. Update request status
4. Add notes
5. Schedule appointments
6. Mark as completed

### Phase 6: Testing & Deployment (1-2 hours)
1. Test all forms on mobile
2. Test submission flow
3. Test tracking feature
4. Deploy to Vercel
5. Test in production

**Total Estimated Time:** 8-13 hours

---

## 📱 Mobile Responsiveness

**All forms will be:**
- Full-width on mobile
- Stacked inputs (no side-by-side on small screens)
- 44px minimum touch targets
- Large, tappable buttons
- Inline validation with clear error messages
- Photo upload with camera access
- Date pickers optimized for mobile

---

## 🎯 Benefits

### For Citizens:
✅ **Easy access** — Request services directly from app  
✅ **No phone calls** — Submit anytime, 24/7  
✅ **Track status** — Know where your request is  
✅ **Reference number** — Easy to track and follow up  
✅ **Mobile-friendly** — Works on any phone

### For City Health Office:
✅ **Centralized system** — All requests in one place  
✅ **Digital records** — No paper forms  
✅ **Better tracking** — Monitor all requests  
✅ **Data insights** — See which barangays need services  
✅ **Reduced calls** — Less phone inquiries

### For Bago City:
✅ **Modern government** — Digital service delivery  
✅ **Transparency** — Citizens see request status  
✅ **Efficiency** — Faster processing  
✅ **Data-driven** — Make informed health policy decisions

---

## 🔄 User Journey Example

### Heart Warriors Request Flow:

1. **Home** → Tap "Health Programs"
2. **Programs Page** → See Heart Warriors card
3. Tap **"Request Cardiovascular Screening"**
4. **Form Page** → Fill out personal, contact, medical info
5. Submit request
6. **Success Page** → Get reference number `HW-2026-00123`
7. Copy reference number
8. **Track Status** → Check status anytime with reference number
9. Receive confirmation (SMS/notification — future phase)
10. Attend scheduled screening

---

## 📊 Analytics to Track

**Metrics:**
- Total requests per program
- Requests by barangay
- Average processing time
- Completion rate
- Popular time slots (for SBB)
- Most requested services

**Dashboard (Admin):**
- Today's requests: 45
- Pending review: 23
- Scheduled: 67
- Completed this month: 234

---

## 🎨 Color Scheme (Maintain Existing)

**Heart Warriors:**
- Primary: `#c0392b` (Red)
- Background: `rgba(192,57,43,0.12)`

**Wheels of Love:**
- Primary: `#e05c00` (Orange)
- Background: `rgba(224,92,0,0.12)`

**Smile Bright Bago:**
- Primary: `#0077b6` (Blue)
- Background: `rgba(0,119,182,0.12)`

**App Theme:**
- Navy: `#0A2E5C`
- Text: `#1f2937`
- Background: `#f9fafb`

---

## ✅ Ready to Start?

**Next Steps:**
1. **Approve this plan** — Confirm approach
2. **Choose database** — New Supabase project or existing?
3. **Start Phase 1** — Set up database
4. **Build forms** — Create request pages
5. **Deploy** — Push to production

---

## 📝 Questions to Answer

Before we start implementation:

1. **Database:** Use existing Bago Safe Supabase or create new project?
2. **Authentication:** Should users log in or submit anonymously (with reference number tracking)?
3. **Notifications:** Plan to add SMS/email notifications later?
4. **Admin access:** Who will manage requests? (City Health Office staff)
5. **File uploads:** Only for Wheels of Love, or for all programs?
6. **Priority:** Which program to build first? (Recommend: Heart Warriors → simplest form)

---

**This plan transforms health programs from informational pages into functional service request systems that citizens can actually use!** 🎉

Ready to start building? 🚀
