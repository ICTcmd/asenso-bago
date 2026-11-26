// Health Services Request Form JavaScript
// Shared by index.html (#page-programs) and health-request.html

// ============================================================================
// SUPABASE CLIENT (Reuse global instance to avoid duplicate GoTrue clients)
// ============================================================================
function getHealthSupabaseClient() {
  if (window.supabaseClient) return window.supabaseClient;
  if (window.authManager && window.authManager.supabase) {
    window.supabaseClient = window.authManager.supabase;
    return window.supabaseClient;
  }
  const { url: SUPABASE_URL, anonKey: SUPABASE_ANON_KEY } = window.SUPABASE_CONFIG || {};
  if (typeof window.supabase !== 'undefined' && SUPABASE_URL && SUPABASE_ANON_KEY) {
    window.supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    return window.supabaseClient;
  }
  return null;
}

// ============================================================================
// FORM STATE
// ============================================================================
let selectedProgram = null;
const uploadedFiles = {
  pwdId: null,
  medicalCert: null
};

function escapeHealthHTML(val) {
  return String(val ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

// ============================================================================
// PROGRAM SELECTION
// ============================================================================
function selectHealthProgram(program, scrollToForm = true) {
  if (!program) return;
  const radio = document.querySelector(`#health-request-form input[name="program"][value="${program}"]`);
  if (!radio) return;

  radio.checked = true;
  selectedProgram = program;

  document.querySelectorAll('#health-request-form .program-option').forEach(opt => {
    opt.classList.toggle('selected', opt.dataset.program === program);
  });

  showProgramFields(program);

  // Highlight active showcase card if present
  document.querySelectorAll('.health-service-card').forEach(card => {
    card.classList.toggle('selected-service', card.dataset.program === program);
  });

  if (scrollToForm) {
    const target = document.getElementById('health-request-section') || document.getElementById('health-request-form');
    if (target) {
      setTimeout(() => {
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 60);
    }
  }
}

window.selectHealthProgram = selectHealthProgram;

function showProgramFields(program) {
  document.querySelectorAll('.program-specific-section').forEach(section => {
    section.classList.remove('active');
  });

  if (program === 'heart_warriors') {
    document.getElementById('heart-warriors-fields')?.classList.add('active');
  } else if (program === 'wheels_of_love') {
    document.getElementById('wheels-of-love-fields')?.classList.add('active');
  } else if (program === 'smile_bright') {
    document.getElementById('smile-bright-fields')?.classList.add('active');
  }
}

// ============================================================================
// INITIALIZATION
// ============================================================================
document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('health-request-form');
  if (!form) return;

  // Handle program selection clicks
  const programOptions = form.querySelectorAll('.program-option');
  const programRadios = form.querySelectorAll('input[name="program"]');

  programOptions.forEach(option => {
    option.addEventListener('click', () => {
      const radio = option.querySelector('input[type="radio"]');
      if (radio) selectHealthProgram(radio.value, false);
    });
  });

  programRadios.forEach(radio => {
    radio.addEventListener('change', () => {
      selectHealthProgram(radio.value, false);
    });
  });

  // Set minimum date = today on appointment date inputs
  const todayStr = new Date().toISOString().split('T')[0];
  form.querySelectorAll('input[type="date"]').forEach(input => {
    input.min = todayStr;
  });

  // File upload handlers
  setupFileUpload('pwd-id-upload', 'pwd-id-preview', 'pwdId');
  setupFileUpload('medical-cert-upload', 'medical-cert-preview', 'medicalCert');

  // Form submission
  form.addEventListener('submit', handleFormSubmit);

  // Pre-select program from URL ?program=...
  const urlParams = new URLSearchParams(window.location.search);
  const preselected = urlParams.get('program');
  if (preselected) {
    selectHealthProgram(preselected, false);
  }

  // Auto-fill signed-in citizen info if available
  prefillUserProfile(form);
});

async function prefillUserProfile(form) {
  try {
    const client = getHealthSupabaseClient();
    if (!client) return;

    const { data: { session } } = await client.auth.getSession();
    if (!session || !session.user) return;

    let profile = null;
    if (window.authManager && window.authManager.currentUser) {
      profile = await window.authManager.loadUserProfile();
    } else {
      const { data } = await client
        .from('profiles')
        .select('full_name, phone_number')
        .eq('id', session.user.id)
        .single();
      profile = data;
    }

    const nameInput = form.querySelector('input[name="full_name"]');
    const phoneInput = form.querySelector('input[name="contact_number"]');
    if (nameInput && !nameInput.value && profile?.full_name) {
      nameInput.value = profile.full_name;
    }
    if (phoneInput && !phoneInput.value && profile?.phone_number) {
      phoneInput.value = profile.phone_number.replace(/\s+/g, '');
    }
  } catch (_) {
    // Non-blocking convenience prefill
  }
}

// ============================================================================
// FILE UPLOAD HANDLING
// ============================================================================
function setupFileUpload(inputId, previewId, fileKey) {
  const input = document.getElementById(inputId);
  const preview = document.getElementById(previewId);
  if (!input || !preview) return;

  input.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      showError('File size must be less than 5MB.');
      input.value = '';
      return;
    }

    const fileName = escapeHealthHTML(file.name);
    const fileSize = (file.size / 1024).toFixed(1) + ' KB';

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
    uploadedFiles[fileKey] = file;
  });
}

function removeFile(inputId, previewId, fileKey) {
  const input = document.getElementById(inputId);
  const preview = document.getElementById(previewId);
  if (input) input.value = '';
  if (preview) {
    preview.innerHTML = '';
    preview.classList.remove('active');
  }
  uploadedFiles[fileKey] = null;
}

window.removeFile = removeFile;

// ============================================================================
// VALIDATION & SUBMISSION
// ============================================================================
function validateHealthForm(formData) {
  if (!selectedProgram) {
    return 'Please select a health program above.';
  }

  if (!formData.full_name?.trim()) {
    return 'Please enter your full name.';
  }

  const age = parseInt(formData.age, 10);
  if (!age || age < 1 || age > 120) {
    return 'Please enter a valid age between 1 and 120.';
  }

  if (!formData.gender) {
    return 'Please select your gender.';
  }

  const phone = (formData.contact_number || '').replace(/\s+/g, '');
  if (!/^09\d{9}$/.test(phone)) {
    return 'Please enter a valid 11-digit Philippine mobile number (e.g., 09171234567).';
  }

  if (!formData.barangay) {
    return 'Please select your barangay.';
  }

  if (selectedProgram === 'heart_warriors') {
    if (!formData.emergency_contact_name?.trim()) {
      return 'Please provide an emergency contact name.';
    }
    const ecPhone = (formData.emergency_contact_number || '').replace(/\s+/g, '');
    if (!/^09\d{9}$/.test(ecPhone)) {
      return 'Please enter a valid 11-digit emergency contact mobile number.';
    }
  } else if (selectedProgram === 'wheels_of_love') {
    if (!formData.pwd_id_number?.trim()) {
      return 'Please enter your PWD ID number.';
    }
    if (!formData.disability_type) {
      return 'Please select the type of disability.';
    }
    if (!formData.mobility_aid_needed) {
      return 'Please select the mobility aid needed.';
    }
    if (!formData.situation_description?.trim()) {
      return 'Please describe your mobility needs and current situation.';
    }
    if (!uploadedFiles.pwdId) {
      return 'Please upload a photo of your PWD ID.';
    }
  } else if (selectedProgram === 'smile_bright') {
    if (!Array.isArray(formData.services_needed) || formData.services_needed.length === 0) {
      return 'Please select at least one dental service needed.';
    }
    if (!formData.dental_concern?.trim()) {
      return 'Please describe your dental concern.';
    }
  }

  return null;
}

async function handleFormSubmit(e) {
  e.preventDefault();
  hideError();

  const formData = collectFormData();
  const validationError = validateHealthForm(formData);
  if (validationError) {
    showError(validationError);
    return;
  }

  const client = getHealthSupabaseClient();
  if (!client) {
    showError('Service connection is unavailable. Please refresh the page and try again.');
    return;
  }

  const submitBtn = document.getElementById('submit-btn');
  const submitText = document.getElementById('submit-text');
  const submitIcon = document.getElementById('submit-icon');

  submitBtn.disabled = true;
  submitIcon.innerHTML = '<div class="loading-spinner"></div>';
  submitText.textContent = 'Submitting...';

  try {
    const fileUrls = await uploadFiles(client);
    const programDetails = collectProgramDetails(formData);

    const { data, error } = await client
      .from('health_service_requests')
      .insert([{
        program: selectedProgram,
        full_name: formData.full_name.trim(),
        age: parseInt(formData.age, 10),
        gender: formData.gender,
        contact_number: formData.contact_number.replace(/\s+/g, ''),
        barangay: formData.barangay,
        program_details: programDetails,
        uploaded_files: fileUrls
      }])
      .select('reference_number')
      .single();

    if (error) throw error;

    // Save reference number locally for quick tracking
    try {
      const refs = JSON.parse(localStorage.getItem('healthServiceRefs') || '[]');
      if (data?.reference_number && !refs.includes(data.reference_number)) {
        refs.unshift(data.reference_number);
        localStorage.setItem('healthServiceRefs', JSON.stringify(refs.slice(0, 10)));
      }
    } catch (_) {}

    window.location.href = `health-success.html?ref=${encodeURIComponent(data.reference_number)}&program=${encodeURIComponent(selectedProgram)}`;

  } catch (error) {
    console.error('Error submitting request:', error);
    showError(error.message || 'Failed to submit request. Please try again.');

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

  for (const [key, value] of formData.entries()) {
    if (key === 'services_needed') {
      if (!data[key]) data[key] = [];
      data[key].push(value);
    } else {
      data[key] = value;
    }
  }

  return data;
}

function collectProgramDetails(formData) {
  const details = {};

  if (selectedProgram === 'heart_warriors') {
    details.existing_condition = formData.existing_condition === 'yes';
    details.current_medications = formData.current_medications || '';
    details.preferred_date = formData.preferred_date || '';
    details.emergency_contact_name = formData.emergency_contact_name || '';
    details.emergency_contact_number = (formData.emergency_contact_number || '').replace(/\s+/g, '');
  } else if (selectedProgram === 'wheels_of_love') {
    details.pwd_id_number = formData.pwd_id_number || '';
    details.disability_type = formData.disability_type || '';
    details.mobility_aid_needed = formData.mobility_aid_needed || '';
    details.situation_description = formData.situation_description || '';
    details.living_situation = 'With family';
  } else if (selectedProgram === 'smile_bright') {
    details.services_needed = formData.services_needed || [];
    details.dental_concern = formData.dental_concern || '';
    details.preferred_date = formData.dental_preferred_date || '';
    details.preferred_time = formData.preferred_time || '';
    details.allergies = formData.allergies || 'None';
  }

  return details;
}

// ============================================================================
// UPLOAD FILES TO SUPABASE STORAGE
// ============================================================================
async function uploadFiles(client) {
  const files = [];

  try {
    if (uploadedFiles.pwdId) {
      const safeName = uploadedFiles.pwdId.name.replace(/[^a-zA-Z0-9._-]/g, '_');
      const fileName = `pwd-id-${Date.now()}-${safeName}`;
      const { error } = await client.storage
        .from('health-documents')
        .upload(fileName, uploadedFiles.pwdId);

      if (error) throw error;

      const { data: { publicUrl } } = client.storage
        .from('health-documents')
        .getPublicUrl(fileName);

      files.push({
        type: 'pwd_id',
        filename: uploadedFiles.pwdId.name,
        url: publicUrl,
        uploaded_at: new Date().toISOString()
      });
    }

    if (uploadedFiles.medicalCert) {
      const safeName = uploadedFiles.medicalCert.name.replace(/[^a-zA-Z0-9._-]/g, '_');
      const fileName = `medical-cert-${Date.now()}-${safeName}`;
      const { error } = await client.storage
        .from('health-documents')
        .upload(fileName, uploadedFiles.medicalCert);

      if (error) throw error;

      const { data: { publicUrl } } = client.storage
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
    throw new Error('Failed to upload files. Please check file format and try again.');
  }

  return files;
}

// ============================================================================
// ERROR HANDLING
// ============================================================================
function showError(message) {
  const errorDiv = document.getElementById('error-message');
  if (!errorDiv) return;
  errorDiv.textContent = message;
  errorDiv.classList.add('active');
  errorDiv.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

function hideError() {
  const errorDiv = document.getElementById('error-message');
  if (errorDiv) errorDiv.classList.remove('active');
}
