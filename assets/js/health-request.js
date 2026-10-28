// Health Services Request Form JavaScript
// Handles form logic, Supabase connection, and file uploads

// ============================================================================
// SUPABASE CONFIGURATION
// ============================================================================
// Configuration is loaded from supabase-config.js
const { url: SUPABASE_URL, anonKey: SUPABASE_ANON_KEY } = window.SUPABASE_CONFIG || {};

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error('⚠️ Supabase credentials not configured! Please update assets/js/supabase-config.js');
}

// Initialize Supabase client
const { createClient } = supabase;
const supabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// ============================================================================
// FORM STATE
// ============================================================================
let selectedProgram = null;
let uploadedFiles = {
  pwdId: null,
  medicalCert: null
};

// ============================================================================
// PROGRAM SELECTION
// ============================================================================
document.addEventListener('DOMContentLoaded', () => {
  // Handle program selection
  const programOptions = document.querySelectorAll('.program-option');
  const programRadios = document.querySelectorAll('input[name="program"]');
  
  programOptions.forEach(option => {
    option.addEventListener('click', () => {
      const radio = option.querySelector('input[type="radio"]');
      radio.checked = true;
      selectedProgram = radio.value;
      
      // Update visual state
      programOptions.forEach(opt => opt.classList.remove('selected'));
      option.classList.add('selected');
      
      // Show/hide program-specific fields
      showProgramFields(selectedProgram);
    });
  });
  
  programRadios.forEach(radio => {
    radio.addEventListener('change', () => {
      selectedProgram = radio.value;
      programOptions.forEach(opt => opt.classList.remove('selected'));
      radio.closest('.program-option').classList.add('selected');
      showProgramFields(selectedProgram);
    });
  });
  
  // File upload handlers
  setupFileUpload('pwd-id-upload', 'pwd-id-preview', 'pwdId');
  setupFileUpload('medical-cert-upload', 'medical-cert-preview', 'medicalCert');
  
  // Form submission
  document.getElementById('health-request-form').addEventListener('submit', handleFormSubmit);
});

// ============================================================================
// SHOW/HIDE PROGRAM-SPECIFIC FIELDS
// ============================================================================
function showProgramFields(program) {
  // Hide all program-specific sections
  document.querySelectorAll('.program-specific-section').forEach(section => {
    section.classList.remove('active');
  });
  
  // Show selected program section
  if (program === 'heart_warriors') {
    document.getElementById('heart-warriors-fields').classList.add('active');
  } else if (program === 'wheels_of_love') {
    document.getElementById('wheels-of-love-fields').classList.add('active');
  } else if (program === 'smile_bright') {
    document.getElementById('smile-bright-fields').classList.add('active');
  }
}

// ============================================================================
// FILE UPLOAD HANDLING
// ============================================================================
function setupFileUpload(inputId, previewId, fileKey) {
  const input = document.getElementById(inputId);
  const preview = document.getElementById(previewId);
  
  input.addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('File size must be less than 5MB');
      input.value = '';
      return;
    }
    
    // Show preview
    const fileName = file.name;
    const fileSize = (file.size / 1024).toFixed(2) + ' KB';
    
    preview.innerHTML = `
      <div class="file-preview-item">
        <div class="file-info">
          <strong>${fileName}</strong><br>
          <small>${fileSize}</small>
        </div>
        <button type="button" class="file-remove" onclick="removeFile('${inputId}', '${previewId}', '${fileKey}')">Remove</button>
      </div>
    `;
    preview.classList.add('active');
    
    // Store file for upload
    uploadedFiles[fileKey] = file;
  });
}

function removeFile(inputId, previewId, fileKey) {
  document.getElementById(inputId).value = '';
  document.getElementById(previewId).innerHTML = '';
  document.getElementById(previewId).classList.remove('active');
  uploadedFiles[fileKey] = null;
}

// ============================================================================
// FORM SUBMISSION
// ============================================================================
async function handleFormSubmit(e) {
  e.preventDefault();
  
  if (!selectedProgram) {
    showError('Please select a health program');
    return;
  }
  
  const submitBtn = document.getElementById('submit-btn');
  const submitText = document.getElementById('submit-text');
  const submitIcon = document.getElementById('submit-icon');
  
  // Show loading state
  submitBtn.disabled = true;
  submitIcon.innerHTML = '<div class="loading-spinner"></div>';
  submitText.textContent = 'Submitting...';
  
  try {
    // Collect form data
    const formData = collectFormData();
    
    // Upload files if any (for Wheels of Love)
    const fileUrls = await uploadFiles();
    
    // Prepare program_details
    const programDetails = collectProgramDetails(formData);
    
    // Insert into database
    const { data, error } = await supabaseClient
      .from('health_service_requests')
      .insert([{
        program: selectedProgram,
        full_name: formData.full_name,
        age: parseInt(formData.age),
        gender: formData.gender,
        contact_number: formData.contact_number,
        barangay: formData.barangay,
        program_details: programDetails,
        uploaded_files: fileUrls
      }])
      .select('reference_number')
      .single();
    
    if (error) throw error;
    
    // Success! Redirect to success page
    window.location.href = `health-success.html?ref=${data.reference_number}&program=${selectedProgram}`;
    
  } catch (error) {
    console.error('Error submitting request:', error);
    showError('Failed to submit request. Please try again.');
    
    // Reset button
    submitBtn.disabled = false;
    submitIcon.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7"/></svg>';
    submitText.textContent = 'Submit Request';
  }
}

// ============================================================================
// COLLECT FORM DATA
// ============================================================================
function collectFormData() {
  const form = document.getElementById('health-request-form');
  const formData = new FormData(form);
  const data = {};
  
  for (let [key, value] of formData.entries()) {
    // Handle checkboxes (services_needed)
    if (key === 'services_needed') {
      if (!data[key]) data[key] = [];
      data[key].push(value);
    } else {
      data[key] = value;
    }
  }
  
  return data;
}

// ============================================================================
// COLLECT PROGRAM-SPECIFIC DETAILS
// ============================================================================
function collectProgramDetails(formData) {
  const details = {};
  
  if (selectedProgram === 'heart_warriors') {
    details.existing_condition = formData.existing_condition === 'yes';
    details.current_medications = formData.current_medications || '';
    details.preferred_date = formData.preferred_date || '';
    details.emergency_contact_name = formData.emergency_contact_name;
    details.emergency_contact_number = formData.emergency_contact_number;
    
  } else if (selectedProgram === 'wheels_of_love') {
    details.pwd_id_number = formData.pwd_id_number;
    details.disability_type = formData.disability_type;
    details.mobility_aid_needed = formData.mobility_aid_needed;
    details.situation_description = formData.situation_description;
    details.living_situation = 'With family'; // Can add field for this
    
  } else if (selectedProgram === 'smile_bright') {
    details.services_needed = formData.services_needed || [];
    details.dental_concern = formData.dental_concern;
    details.preferred_date = formData.dental_preferred_date || '';
    details.preferred_time = formData.preferred_time || '';
    details.allergies = formData.allergies || 'None';
  }
  
  return details;
}

// ============================================================================
// UPLOAD FILES TO SUPABASE STORAGE
// ============================================================================
async function uploadFiles() {
  const files = [];
  
  try {
    // Upload PWD ID if present
    if (uploadedFiles.pwdId) {
      const fileName = `pwd-id-${Date.now()}-${uploadedFiles.pwdId.name}`;
      const { data, error } = await supabaseClient.storage
        .from('health-documents')
        .upload(fileName, uploadedFiles.pwdId);
      
      if (error) throw error;
      
      const { data: { publicUrl } } = supabaseClient.storage
        .from('health-documents')
        .getPublicUrl(fileName);
      
      files.push({
        type: 'pwd_id',
        filename: uploadedFiles.pwdId.name,
        url: publicUrl,
        uploaded_at: new Date().toISOString()
      });
    }
    
    // Upload Medical Certificate if present
    if (uploadedFiles.medicalCert) {
      const fileName = `medical-cert-${Date.now()}-${uploadedFiles.medicalCert.name}`;
      const { data, error } = await supabaseClient.storage
        .from('health-documents')
        .upload(fileName, uploadedFiles.medicalCert);
      
      if (error) throw error;
      
      const { data: { publicUrl } } = supabaseClient.storage
        .from('health-documents')
        .getPublicUrl(fileName);
      
      files.push({
        type: 'medical_certificate',
        filename: uploadedFiles.medicalCert.name,
        url: publicUrl,
        uploaded_at: new Date().toISOString()
      });
    }
    
  } catch (error) {
    console.error('Error uploading files:', error);
    throw new Error('Failed to upload files');
  }
  
  return files;
}

// ============================================================================
// ERROR HANDLING
// ============================================================================
function showError(message) {
  const errorDiv = document.getElementById('error-message');
  errorDiv.textContent = message;
  errorDiv.classList.add('active');
  
  // Scroll to error
  errorDiv.scrollIntoView({ behavior: 'smooth', block: 'center' });
  
  // Auto-hide after 5 seconds
  setTimeout(() => {
    errorDiv.classList.remove('active');
  }, 5000);
}
