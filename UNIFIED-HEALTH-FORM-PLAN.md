# Unified Health Services Request Form 🏥

**Date:** October 28, 2026  
**Approach:** ONE form for ALL health programs (simplified!)

---

## ✅ Why This is Better

**Advantages:**
- ✅ **Simpler for users** — One form to learn
- ✅ **Easier to maintain** — One codebase
- ✅ **Faster to build** — ~4-6 hours instead of 8-13
- ✅ **Consistent UX** — Same flow for all programs
- ✅ **Mobile-friendly** — Less complex navigation

---

## 📋 Unified Form Design

### Step 1: Choose Program
```
┌─────────────────────────────────────┐
│ ← Back to Programs                  │
├─────────────────────────────────────┤
│  🏥 Health Services Request         │
│  Request assistance from Bago City  │
│  Health Programs                    │
├─────────────────────────────────────┤
│                                     │
│  Which service do you need? *       │
│                                     │
│  ○ Heart Warriors                   │
│    Cardiovascular screening         │
│                                     │
│  ○ Wheels of Love                   │
│    Wheelchair / Mobility Aid        │
│                                     │
│  ○ Smile Bright Bago                │
│    Dental Services                  │
│                                     │
└─────────────────────────────────────┘
```

### Step 2: Personal Information
```
┌─────────────────────────────────────┐
│  Personal Information               │
├─────────────────────────────────────┤
│  ┌──────────────────────────────┐  │
│  │ Full Name *                  │  │
│  └──────────────────────────────┘  │
│                                     │
│  ┌───────────┐ ┌────────────────┐ │
│  │ Age *     │ │ Gender *       │ │
│  └───────────┘ └────────────────┘ │
│                                     │
│  ┌──────────────────────────────┐  │
│  │ Mobile Number *              │  │
│  │ 09XXXXXXXXX                  │  │
│  └──────────────────────────────┘  │
│                                     │
│  ┌──────────────────────────────┐  │
│  │ Barangay * (dropdown)        │  │
│  └──────────────────────────────┘  │
└─────────────────────────────────────┘
```

### Step 3: Program-Specific Questions

**If Heart Warriors selected:**
```
┌─────────────────────────────────────┐
│  Medical Information                │
├─────────────────────────────────────┤
│  Do you have existing heart         │
│  condition?                         │
│  ○ Yes  ○ No                       │
│                                     │
│  ┌──────────────────────────────┐  │
│  │ Current medications          │  │
│  │ (optional)                   │  │
│  └──────────────────────────────┘  │
│                                     │
│  ┌──────────────────────────────┐  │
│  │ Preferred screening date     │  │
│  │ 📅 Select date               │  │
│  └──────────────────────────────┘  │
│                                     │
│  ┌──────────────────────────────┐  │
│  │ Emergency Contact Name *     │  │
│  └──────────────────────────────┘  │
│  ┌──────────────────────────────┐  │
│  │ Emergency Contact Number *   │  │
│  └──────────────────────────────┘  │
└─────────────────────────────────────┘
```

**If Wheels of Love selected:**
```
┌─────────────────────────────────────┐
│  Disability Information             │
├─────────────────────────────────────┤
│  ┌──────────────────────────────┐  │
│  │ PWD ID Number *              │  │
│  └──────────────────────────────┘  │
│                                     │
│  ┌──────────────────────────────┐  │
│  │ Type of Disability *         │  │
│  │ (dropdown)                   │  │
│  └──────────────────────────────┘  │
│                                     │
│  ┌──────────────────────────────┐  │
│  │ What do you need? *          │  │
│  │ (dropdown)                   │  │
│  │ Manual Wheelchair            │  │
│  │ Electric Wheelchair          │  │
│  │ Walker                       │  │
│  │ Crutches                     │  │
│  │ Cane                         │  │
│  └──────────────────────────────┘  │
│                                     │
│  ┌──────────────────────────────┐  │
│  │ Describe your situation *    │  │
│  │ (text area)                  │  │
│  └──────────────────────────────┘  │
│                                     │
│  📸 Upload PWD ID Photo *          │
│  [Choose Photo] or [Take Photo]    │
│                                     │
│  📄 Upload Medical Certificate     │
│  [Choose File] (optional)          │
└─────────────────────────────────────┘
```

**If Smile Bright Bago selected:**
```
┌─────────────────────────────────────┐
│  Dental Information                 │
├─────────────────────────────────────┤
│  What services do you need? *       │
│  (select all that apply)            │
│  ☐ Cleaning                         │
│  ☐ Tooth Extraction                 │
│  ☐ Check-up                         │
│  ☐ Tooth Restoration                │
│  ☐ Other                            │
│                                     │
│  ┌──────────────────────────────┐  │
│  │ Describe your concern *      │  │
│  │ (text area)                  │  │
│  └──────────────────────────────┘  │
│                                     │
│  ┌──────────────────────────────┐  │
│  │ Preferred appointment date   │  │
│  │ 📅 Select date               │  │
│  └──────────────────────────────┘  │
│                                     │
│  ┌──────────────────────────────┐  │
│  │ Preferred time               │  │
│  │ (dropdown)                   │  │
│  │ Morning (8AM - 12PM)         │  │
│  │ Afternoon (1PM - 5PM)        │  │
│  └──────────────────────────────┘  │
│                                     │
│  ┌──────────────────────────────┐  │
│  │ Allergies (optional)         │  │
│  └──────────────────────────────┘  │
└─────────────────────────────────────┘
```

### Step 4: Submit & Success
```
┌─────────────────────────────────────┐
│                                     │
│         ✅ Request Submitted!       │
│                                     │
│  Your Wheels of Love application    │
│  has been received.                 │
│                                     │
│  Reference Number:                  │
│  ┌──────────────────────────────┐  │
│  │  WOL-2026-00456   [Copy]     │  │
│  └──────────────────────────────┘  │
│                                     │
│  What's Next?                       │
│  1. We'll review your application   │
│  2. You'll receive a confirmation   │
│  3. We'll schedule your pickup      │
│                                     │
│  [Track Request Status]             │
│  [Submit Another Request]           │
│  [Back to Home]                     │
│                                     │
└─────────────────────────────────────┘
```

---

## 🗄️ Simplified Database Schema

### Single Table: `health_service_requests`

```sql
CREATE TABLE health_service_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  reference_number TEXT UNIQUE NOT NULL,
  
  -- Program Selection
  program TEXT NOT NULL CHECK (program IN ('heart_warriors', 'wheels_of_love', 'smile_bright')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'scheduled', 'completed', 'rejected')),
  
  -- Common Personal Info (everyone fills this)
  full_name TEXT NOT NULL,
  age INTEGER NOT NULL CHECK (age > 0 AND age < 120),
  gender TEXT NOT NULL,
  contact_number TEXT NOT NULL,
  barangay TEXT NOT NULL,
  
  -- Program-specific data stored as JSONB
  program_details JSONB NOT NULL,
  
  -- File uploads (URLs)
  uploaded_files JSONB DEFAULT '[]',
  
  -- Tracking
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  scheduled_date TIMESTAMP WITH TIME ZONE,
  completed_date TIMESTAMP WITH TIME ZONE,
  
  -- Admin notes
  staff_notes TEXT,
  reviewed_by UUID REFERENCES auth.users(id),
  reviewed_at TIMESTAMP WITH TIME ZONE
);

-- Indexes for performance
CREATE INDEX idx_reference_number ON health_service_requests(reference_number);
CREATE INDEX idx_program ON health_service_requests(program);
CREATE INDEX idx_status ON health_service_requests(status);
CREATE INDEX idx_barangay ON health_service_requests(barangay);
CREATE INDEX idx_created_at ON health_service_requests(created_at DESC);

-- Function to generate reference numbers
CREATE OR REPLACE FUNCTION generate_reference_number(program_type TEXT)
RETURNS TEXT AS $$
DECLARE
  prefix TEXT;
  next_num INTEGER;
  ref_number TEXT;
BEGIN
  -- Set prefix based on program
  prefix := CASE program_type
    WHEN 'heart_warriors' THEN 'HW'
    WHEN 'wheels_of_love' THEN 'WOL'
    WHEN 'smile_bright' THEN 'SBB'
    ELSE 'HSR'
  END;
  
  -- Get next sequential number for this year
  SELECT COALESCE(MAX(
    CAST(SUBSTRING(reference_number FROM '\d+$') AS INTEGER)
  ), 0) + 1
  INTO next_num
  FROM health_service_requests
  WHERE reference_number LIKE prefix || '-' || TO_CHAR(NOW(), 'YYYY') || '-%';
  
  -- Format: HW-2026-00123
  ref_number := prefix || '-' || TO_CHAR(NOW(), 'YYYY') || '-' || LPAD(next_num::TEXT, 5, '0');
  
  RETURN ref_number;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-generate reference numbers
CREATE OR REPLACE FUNCTION set_reference_number()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.reference_number IS NULL OR NEW.reference_number = '' THEN
    NEW.reference_number := generate_reference_number(NEW.program);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER generate_reference_on_insert
  BEFORE INSERT ON health_service_requests
  FOR EACH ROW
  EXECUTE FUNCTION set_reference_number();

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_health_service_requests_updated_at
  BEFORE UPDATE ON health_service_requests
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();
```

### Row-Level Security (RLS)

```sql
-- Enable RLS
ALTER TABLE health_service_requests ENABLE ROW LEVEL SECURITY;

-- Anyone can submit requests
CREATE POLICY "Anyone can submit health service requests"
  ON health_service_requests
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Anyone can view their own request by reference number
-- (We'll handle this in the application layer for anonymous users)
CREATE POLICY "Anyone can view requests"
  ON health_service_requests
  FOR SELECT
  TO anon, authenticated
  USING (true);

-- Only admins can update
CREATE POLICY "Only admins can update requests"
  ON health_service_requests
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND (
        auth.users.email LIKE '%@bagocity.gov.ph'
        OR auth.users.raw_user_meta_data->>'role' = 'admin'
      )
    )
  );
```

---

## 📊 Example Data

### Heart Warriors Request:
```json
{
  "reference_number": "HW-2026-00123",
  "program": "heart_warriors",
  "status": "pending",
  "full_name": "Juan Dela Cruz",
  "age": 58,
  "gender": "Male",
  "contact_number": "09171234567",
  "barangay": "Barangay Dulao",
  "program_details": {
    "existing_condition": true,
    "current_medications": "Aspirin 100mg daily, Metoprolol 50mg",
    "preferred_date": "2026-11-15",
    "emergency_contact_name": "Maria Dela Cruz",
    "emergency_contact_number": "09181234567"
  },
  "uploaded_files": []
}
```

### Wheels of Love Request:
```json
{
  "reference_number": "WOL-2026-00456",
  "program": "wheels_of_love",
  "status": "pending",
  "full_name": "Rosa Santos",
  "age": 45,
  "gender": "Female",
  "contact_number": "09191234567",
  "barangay": "Barangay Ma-ao",
  "program_details": {
    "pwd_id_number": "PWD-2026-1234",
    "disability_type": "Physical - Paraplegia",
    "mobility_aid_needed": "Manual Wheelchair",
    "situation_description": "Unable to walk due to spinal injury from accident. Current wheelchair is broken and unusable.",
    "living_situation": "With family"
  },
  "uploaded_files": [
    {
      "type": "pwd_id",
      "url": "https://storage.supabase.co/.../pwd-id-rosa.jpg",
      "uploaded_at": "2026-10-28T10:30:00Z"
    },
    {
      "type": "medical_certificate",
      "url": "https://storage.supabase.co/.../medical-cert-rosa.pdf",
      "uploaded_at": "2026-10-28T10:31:00Z"
    }
  ]
}
```

### Smile Bright Bago Request:
```json
{
  "reference_number": "SBB-2026-00789",
  "program": "smile_bright",
  "status": "pending",
  "full_name": "Pedro Garcia",
  "age": 32,
  "gender": "Male",
  "contact_number": "09201234567",
  "barangay": "Barangay Poblacion",
  "program_details": {
    "services_needed": ["Cleaning", "Extraction"],
    "dental_concern": "Severe toothache on lower left molar. Also need general cleaning.",
    "preferred_date": "2026-11-10",
    "preferred_time": "Morning (8AM - 12PM)",
    "last_dental_visit": "2024-03-15",
    "allergies": "None",
    "current_medications": "None"
  },
  "uploaded_files": []
}
```

---

## 🎨 Form Flow Logic

### JavaScript Logic:

```javascript
// Program selection changes what fields show
const programSelect = document.querySelector('#program-select');
const programSpecificSection = document.querySelector('#program-specific');

programSelect.addEventListener('change', (e) => {
  const program = e.target.value;
  
  // Hide all program-specific fields
  document.querySelectorAll('.program-fields').forEach(el => {
    el.style.display = 'none';
  });
  
  // Show selected program fields
  if (program === 'heart_warriors') {
    document.querySelector('#heart-warriors-fields').style.display = 'block';
  } else if (program === 'wheels_of_love') {
    document.querySelector('#wheels-of-love-fields').style.display = 'block';
  } else if (program === 'smile_bright') {
    document.querySelector('#smile-bright-fields').style.display = 'block';
  }
});

// Form submission
async function submitHealthRequest(formData) {
  try {
    // Insert into Supabase
    const { data, error } = await supabase
      .from('health_service_requests')
      .insert([{
        program: formData.program,
        full_name: formData.fullName,
        age: parseInt(formData.age),
        gender: formData.gender,
        contact_number: formData.contactNumber,
        barangay: formData.barangay,
        program_details: formData.programDetails,
        uploaded_files: formData.uploadedFiles || []
      }])
      .select('reference_number')
      .single();
    
    if (error) throw error;
    
    // Show success page with reference number
    showSuccessPage(data.reference_number, formData.program);
    
  } catch (error) {
    console.error('Error submitting request:', error);
    alert('Error submitting request. Please try again.');
  }
}
```

---

## 🚀 Implementation Steps (Simplified!)

### Phase 1: Database Setup (30 mins)
1. ✅ Create Supabase project (or use existing)
2. ✅ Run SQL schema
3. ✅ Test reference number generation
4. ✅ Configure RLS policies

### Phase 2: Build Unified Form (3-4 hours)
1. ✅ Create form HTML structure
2. ✅ Add program selection dropdown
3. ✅ Build common fields section
4. ✅ Build conditional program-specific sections
5. ✅ Add form validation
6. ✅ Implement file upload (for WOL)
7. ✅ Connect to Supabase
8. ✅ Test submission

### Phase 3: Success & Tracking (1-2 hours)
1. ✅ Create success page with reference number
2. ✅ Add "Copy reference" button
3. ✅ Build tracking page (lookup by reference)
4. ✅ Show status timeline

### Phase 4: Update Program Cards (30 mins)
1. ✅ Update program buttons: "Visit Program" → "Request Service"
2. ✅ All cards link to same unified form
3. ✅ Test navigation

### Phase 5: Testing (1 hour)
1. ✅ Test all 3 programs
2. ✅ Test mobile responsiveness
3. ✅ Test file uploads
4. ✅ Test tracking
5. ✅ Deploy

**Total Time: ~6-8 hours** (vs 8-13 hours for separate forms!)

---

## 📱 Mobile-First Design

**Key Features:**
- ✅ Single-column layout
- ✅ Large touch targets (44px minimum)
- ✅ Clear section headings
- ✅ Progressive disclosure (show only relevant fields)
- ✅ Inline validation
- ✅ Camera access for photos
- ✅ Easy reference number copying

---

## ✅ Benefits of Unified Form

### For Users:
✅ **One form to learn** — Same process for all programs  
✅ **Faster navigation** — No decision paralysis  
✅ **Consistent experience** — Predictable flow  
✅ **Mobile-friendly** — Simpler interface

### For Developers:
✅ **Easier to maintain** — One codebase  
✅ **Faster to build** — ~40% less time  
✅ **Simpler testing** — One flow to test  
✅ **Easier updates** — Change once, affects all

### For City Staff:
✅ **Single dashboard** — All requests in one place  
✅ **Unified workflow** — Same process for all programs  
✅ **Better reporting** — Compare programs easily  
✅ **Centralized training** — Staff learn one system

---

## 🎯 Navigation Flow

```
Home
  ↓
Health Programs Page
  ↓ (tap any program card)
Unified Request Form
  ↓ (select program at top)
Program-specific fields appear
  ↓ (submit)
Success Page with Reference
  ↓
Track Status (anytime)
```

---

## 📋 24 Barangays Dropdown

```javascript
const barangays = [
  'Abuanan',
  'Alianza',
  'Atipuluan',
  'Bacong-Montilla',
  'Bagroy',
  'Balingasag',
  'Binubuhan',
  'Busay',
  'Calumangan',
  'Caridad',
  'Dulao',
  'Ilijan',
  'Lag-asan',
  'Ma-ao',
  'Mailum',
  'Malingin',
  'Napoles',
  'Pacol',
  'Poblacion',
  'Sagasa',
  'Sampinit',
  'San Isidro',
  'Taloc',
  'Talubangi'
];
```

---

## ✨ Ready to Build!

**This unified approach is:**
- ✅ Simpler
- ✅ Faster
- ✅ Better UX
- ✅ Easier to maintain

**Next questions:**
1. Should we use the existing Bago Safe Supabase or create a new project?
2. Want to start with Phase 1 (database setup) now?

**Let's do this!** 🚀
