# Health Services Database Setup 🗄️

**Time Required:** 5-10 minutes  
**Difficulty:** Easy (copy & paste)

---

## 📋 What We're Setting Up

Adding health services tables to your **existing Bago Safe Supabase project**:

- ✅ `health_service_requests` table
- ✅ Reference number generation (HW-2026-00123, etc.)
- ✅ Row-Level Security policies
- ✅ Storage bucket for PWD IDs and medical certificates
- ✅ Sample test data

---

## 🚀 Step-by-Step Instructions

### Step 1: Open Supabase SQL Editor

1. Go to your Supabase dashboard: https://supabase.com/dashboard
2. Select your **Bago Safe** project
3. Click **SQL Editor** in the left sidebar
4. Click **+ New Query** button

### Step 2: Run the Schema

1. Open the file: `health-services-schema.sql` (in this folder)
2. **Copy ALL the SQL code** (Ctrl+A, Ctrl+C)
3. **Paste into Supabase SQL Editor** (Ctrl+V)
4. Click **Run** button (or press Ctrl+Enter)

### Step 3: Verify Success

You should see:
```
✅ Health Services schema created successfully!
📋 Table created: health_service_requests
🔐 Row-Level Security enabled
🗂️ Storage bucket: health-documents
📝 Sample data inserted (3 test requests)

🎯 Reference number format:
   - Heart Warriors: HW-2026-00001
   - Wheels of Love: WOL-2026-00001
   - Smile Bright Bago: SBB-2026-00001

🚀 Ready to start building the form!
```

### Step 4: Verify Table Created

1. Click **Table Editor** in left sidebar
2. Look for **health_service_requests** table
3. You should see 3 sample requests (test data)

### Step 5: Verify Storage Bucket

1. Click **Storage** in left sidebar
2. Look for **health-documents** bucket
3. It should be listed (may be empty for now)

---

## ✅ What Was Created

### Table: `health_service_requests`

**Columns:**
- `id` - UUID primary key
- `reference_number` - Unique tracking number (auto-generated)
- `program` - heart_warriors, wheels_of_love, or smile_bright
- `status` - pending, approved, scheduled, completed, rejected, cancelled
- `full_name` - Citizen's full name
- `age` - Age
- `gender` - Male, Female, Other
- `contact_number` - Mobile number
- `barangay` - One of 24 barangays
- `program_details` - JSONB with program-specific data
- `uploaded_files` - JSONB array of file URLs
- `created_at` - Submission timestamp
- `updated_at` - Last update timestamp
- `scheduled_date` - When service is scheduled
- `completed_date` - When service was completed
- `staff_notes` - Admin notes
- `reviewed_by` - Staff who reviewed
- `reviewed_at` - Review timestamp

### Functions Created:

1. **`generate_health_reference_number(program_type)`**
   - Generates unique reference numbers
   - Format: `HW-2026-00001`, `WOL-2026-00123`, `SBB-2026-00456`
   - Sequential per year and program

2. **Triggers:**
   - Auto-generates reference number on insert
   - Auto-updates `updated_at` timestamp

### Security (RLS Policies):

- ✅ Anyone can submit requests (even anonymous)
- ✅ Anyone can view requests (need reference number)
- ✅ Only admins can update requests
- ✅ Only admins can delete requests

### Storage Bucket: `health-documents`

- For PWD ID photos
- For medical certificates
- Private (not public)
- Anyone can upload (during request submission)
- Anyone can view if they have the URL

---

## 🧪 Test the Database

### Test 1: View Sample Data

Run this in SQL Editor:
```sql
SELECT 
  reference_number,
  program,
  full_name,
  barangay,
  status,
  created_at
FROM health_service_requests
ORDER BY created_at DESC;
```

You should see 3 test requests.

### Test 2: Test Reference Number Generation

Run this:
```sql
INSERT INTO health_service_requests (
  program, full_name, age, gender, contact_number, barangay,
  program_details
) VALUES (
  'heart_warriors',
  'Test User',
  50,
  'Male',
  '09171234567',
  'Barangay Poblacion',
  '{}'::jsonb
)
RETURNING reference_number;
```

You should get: `HW-2026-00002` (or next number)

### Test 3: Query by Reference Number (Tracking)

```sql
SELECT * FROM health_service_requests 
WHERE reference_number = 'HW-2026-00001';
```

Should return the Juan Dela Cruz sample request.

---

## 📊 Sample Data Overview

### Request 1: Heart Warriors
- **Reference:** HW-2026-00001
- **Name:** Juan Dela Cruz
- **Age:** 58
- **Barangay:** Barangay Dulao
- **Details:** Has hypertension, needs screening

### Request 2: Wheels of Love
- **Reference:** WOL-2026-00001
- **Name:** Rosa Santos
- **Age:** 45
- **Barangay:** Barangay Ma-ao
- **Details:** Needs manual wheelchair (paraplegia)

### Request 3: Smile Bright Bago
- **Reference:** SBB-2026-00001
- **Name:** Pedro Garcia
- **Age:** 32
- **Barangay:** Barangay Poblacion
- **Details:** Needs tooth extraction and cleaning

---

## 🔍 Useful Queries for Later

### Get All Pending Requests
```sql
SELECT * FROM health_service_requests 
WHERE status = 'pending' 
ORDER BY created_at DESC;
```

### Get Requests by Program
```sql
SELECT * FROM health_service_requests 
WHERE program = 'heart_warriors' 
ORDER BY created_at DESC;
```

### Get Statistics by Program
```sql
SELECT 
  program,
  COUNT(*) as total_requests,
  COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending,
  COUNT(CASE WHEN status = 'approved' THEN 1 END) as approved,
  COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed
FROM health_service_requests
GROUP BY program;
```

### Get Recent Requests (Last 7 days)
```sql
SELECT * FROM health_service_requests 
WHERE created_at >= NOW() - INTERVAL '7 days'
ORDER BY created_at DESC;
```

### Search by Barangay
```sql
SELECT * FROM health_service_requests 
WHERE barangay = 'Barangay Dulao'
ORDER BY created_at DESC;
```

---

## 🔐 Security Notes

### Row-Level Security is Enabled:
- Citizens can submit anonymously (no login required)
- Anyone can view requests (but need reference number)
- Only staff with admin/supervisor role can update/delete
- All data is protected by Supabase security

### Storage Security:
- Files are private (not publicly accessible)
- Need direct URL to view
- URLs are long and random (hard to guess)
- Only admins can delete files

---

## 🚨 Troubleshooting

### Error: "relation already exists"
**Solution:** Table already created! Skip to verification step.

### Error: "bucket already exists"
**Solution:** Storage bucket already created! This is fine.

### Error: "permission denied"
**Solution:** Make sure you're logged into the correct Supabase project.

### Can't see table in Table Editor
**Solution:** 
1. Refresh the page
2. Check you're in the right project
3. Look in SQL Editor > Tables list

### RLS policies not working
**Solution:** 
1. Check the policies in Authentication > Policies
2. Make sure RLS is enabled on the table

---

## ✅ Checklist

Before moving to Phase 2 (building the form):

- [ ] SQL script executed successfully
- [ ] Table `health_service_requests` exists
- [ ] Can see 3 sample requests in Table Editor
- [ ] Storage bucket `health-documents` created
- [ ] Test query returns data
- [ ] Reference numbers working (HW-2026-00001, etc.)

---

## 🎉 Success!

Your database is ready! 

**Next Step:** Phase 2 - Build the unified health services request form

**Estimated Time:** 3-4 hours

---

## 📞 Need Help?

**Common Issues:**
1. **Wrong Supabase project:** Make sure you're in the Bago Safe project
2. **Permissions error:** You need project owner access
3. **SQL syntax error:** Copy the entire schema file, don't modify

**Quick Fix:** Delete everything and start over:
```sql
-- Only run this if you need to start fresh
DROP TABLE IF EXISTS health_service_requests CASCADE;
DROP TYPE IF EXISTS health_program CASCADE;
DROP TYPE IF EXISTS request_status CASCADE;
DROP FUNCTION IF EXISTS generate_health_reference_number CASCADE;
DROP FUNCTION IF EXISTS set_health_reference_number CASCADE;

-- Then run the full schema again
```

---

**Database setup complete! Ready for Phase 2!** 🚀
