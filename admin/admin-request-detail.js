// Admin Request Detail JavaScript
// Handles viewing and updating individual request details

const { url: SUPABASE_URL, anonKey: SUPABASE_ANON_KEY } = window.SUPABASE_CONFIG || {};
const { createClient } = supabase;
const supabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

let currentUser = null;
let requestData = null;
let requestId = null;

// ============================================================================
// INITIALIZATION
// ============================================================================
document.addEventListener('DOMContentLoaded', async () => {
  // Get request ID from URL
  const params = new URLSearchParams(window.location.search);
  requestId = params.get('id');
  
  if (!requestId) {
    alert('No request ID provided');
    window.location.href = 'requests.html';
    return;
  }
  
  // Check authentication
  await checkAuth();
  
  // Load user info
  await loadUserInfo();
  
  // Load request details
  await loadRequestDetails();
  
  // Setup save notes button
  document.getElementById('save-notes-btn').addEventListener('click', saveNotes);
  
  // Setup logout
  document.getElementById('logout-btn').addEventListener('click', handleLogout);
});

// ============================================================================
// AUTHENTICATION CHECK
// ============================================================================
async function checkAuth() {
  try {
    const { data: { session } } = await supabaseClient.auth.getSession();
    
    if (!session) {
      window.location.href = 'login.html';
      return;
    }
    
    // Verify admin role
    const { data, error } = await supabaseClient
      .from('profiles')
      .select('role')
      .eq('id', session.user.id)
      .single();
    
    if (error || !data || (data.role !== 'admin' && data.role !== 'supervisor')) {
      await supabaseClient.auth.signOut();
      window.location.href = 'login.html';
      return;
    }
    
    currentUser = session.user;
    
  } catch (error) {
    console.error('Auth check error:', error);
    window.location.href = 'login.html';
  }
}

// ============================================================================
// LOAD USER INFO
// ============================================================================
async function loadUserInfo() {
  try {
    const { data, error } = await supabaseClient
      .from('profiles')
      .select('full_name, role')
      .eq('id', currentUser.id)
      .single();
    
    if (error) throw error;
    
    const fullName = data.full_name || currentUser.email.split('@')[0];
    const role = data.role === 'admin' ? 'Administrator' : 'Supervisor';
    
    document.getElementById('user-name').textContent = fullName;
    document.getElementById('user-role').textContent = role;
    document.getElementById('user-avatar').textContent = fullName.charAt(0).toUpperCase();
    
  } catch (error) {
    console.error('Error loading user info:', error);
  }
}

// ============================================================================
// LOAD REQUEST DETAILS
// ============================================================================
async function loadRequestDetails() {
  try {
    const { data, error } = await supabaseClient
      .from('health_service_requests')
      .select('*')
      .eq('id', requestId)
      .single();
    
    if (error) throw error;
    
    if (!data) {
      alert('Request not found');
      window.location.href = 'requests.html';
      return;
    }
    
    requestData = data;
    
    // Populate basic info
    document.getElementById('page-title').textContent = `Request #${data.reference_number}`;
    document.getElementById('ref-number').textContent = data.reference_number;
    document.getElementById('full-name').textContent = data.full_name;
    document.getElementById('age').textContent = `${data.age} years old`;
    document.getElementById('gender').textContent = data.gender;
    document.getElementById('contact').textContent = data.contact_number;
    document.getElementById('barangay').textContent = data.barangay;
    document.getElementById('created-at').textContent = formatDateTime(data.created_at);
    
    // Set program badge
    const programBadge = document.getElementById('program-badge');
    programBadge.textContent = `${getProgramIcon(data.program)} ${formatProgramName(data.program)}`;
    programBadge.className = `program-badge program-${getProgramClass(data.program)}`;
    
    // Set status badge
    const statusBadge = document.getElementById('current-status-badge');
    statusBadge.textContent = data.status;
    statusBadge.className = `status-badge status-${data.status}`;
    
    // Populate program-specific details
    populateProgramDetails(data.program, data.program_details);
    
    // Show uploaded files if any
    if (data.uploaded_files && data.uploaded_files.length > 0) {
      populateFiles(data.uploaded_files);
    }
    
    // Populate staff notes
    document.getElementById('staff-notes').value = data.staff_notes || '';
    
    // Render status action buttons
    renderStatusActions(data.status);
    
    // Show content, hide loading
    document.getElementById('loading-state').style.display = 'none';
    document.getElementById('request-content').style.display = 'block';
    
  } catch (error) {
    console.error('Error loading request:', error);
    alert('Failed to load request details');
    window.location.href = 'requests.html';
  }
}

// ============================================================================
// POPULATE PROGRAM-SPECIFIC DETAILS
// ============================================================================
function populateProgramDetails(program, details) {
  const container = document.getElementById('program-details-container');
  
  if (program === 'heart_warriors') {
    container.innerHTML = `
      <div class="detail-grid">
        <div class="detail-item">
          <span class="detail-label">Existing Heart Condition</span>
          <span class="detail-value">${details.existing_condition ? 'Yes' : 'No'}</span>
        </div>
        <div class="detail-item">
          <span class="detail-label">Current Medications</span>
          <span class="detail-value">${details.current_medications || 'None'}</span>
        </div>
        <div class="detail-item">
          <span class="detail-label">Preferred Screening Date</span>
          <span class="detail-value">${details.preferred_date || 'Not specified'}</span>
        </div>
        <div class="detail-item">
          <span class="detail-label">Emergency Contact Name</span>
          <span class="detail-value">${details.emergency_contact_name || '-'}</span>
        </div>
        <div class="detail-item">
          <span class="detail-label">Emergency Contact Number</span>
          <span class="detail-value">${details.emergency_contact_number || '-'}</span>
        </div>
      </div>
      ${details.medical_history ? `
        <div style="margin-top: 20px;">
          <span class="detail-label">Medical History</span>
          <p style="margin-top: 8px; line-height: 1.6; color: var(--color-text-primary);">${details.medical_history}</p>
        </div>
      ` : ''}
    `;
  } else if (program === 'wheels_of_love') {
    container.innerHTML = `
      <div class="detail-grid">
        <div class="detail-item">
          <span class="detail-label">PWD ID Number</span>
          <span class="detail-value">${details.pwd_id_number || '-'}</span>
        </div>
        <div class="detail-item">
          <span class="detail-label">Disability Type</span>
          <span class="detail-value">${details.disability_type || '-'}</span>
        </div>
        <div class="detail-item">
          <span class="detail-label">Mobility Aid Needed</span>
          <span class="detail-value">${details.mobility_aid_needed || '-'}</span>
        </div>
        <div class="detail-item">
          <span class="detail-label">Living Situation</span>
          <span class="detail-value">${details.living_situation || '-'}</span>
        </div>
      </div>
      ${details.situation_description ? `
        <div style="margin-top: 20px;">
          <span class="detail-label">Situation Description</span>
          <p style="margin-top: 8px; line-height: 1.6; color: var(--color-text-primary);">${details.situation_description}</p>
        </div>
      ` : ''}
    `;
  } else if (program === 'smile_bright') {
    container.innerHTML = `
      <div class="detail-grid">
        <div class="detail-item">
          <span class="detail-label">Services Needed</span>
          <span class="detail-value">${Array.isArray(details.services_needed) ? details.services_needed.join(', ') : 'Not specified'}</span>
        </div>
        <div class="detail-item">
          <span class="detail-label">Preferred Date</span>
          <span class="detail-value">${details.preferred_date || 'Not specified'}</span>
        </div>
        <div class="detail-item">
          <span class="detail-label">Preferred Time</span>
          <span class="detail-value">${details.preferred_time || 'Not specified'}</span>
        </div>
        <div class="detail-item">
          <span class="detail-label">Last Dental Visit</span>
          <span class="detail-value">${details.last_dental_visit || 'Never'}</span>
        </div>
        <div class="detail-item">
          <span class="detail-label">Allergies</span>
          <span class="detail-value">${details.allergies || 'None'}</span>
        </div>
        <div class="detail-item">
          <span class="detail-label">Current Medications</span>
          <span class="detail-value">${details.current_medications || 'None'}</span>
        </div>
      </div>
      ${details.dental_concern ? `
        <div style="margin-top: 20px;">
          <span class="detail-label">Dental Concern</span>
          <p style="margin-top: 8px; line-height: 1.6; color: var(--color-text-primary);">${details.dental_concern}</p>
        </div>
      ` : ''}
    `;
  }
}

// ============================================================================
// POPULATE FILES
// ============================================================================
function populateFiles(files) {
  const filesSection = document.getElementById('files-section');
  const filesContainer = document.getElementById('files-container');
  
  filesSection.style.display = 'block';
  
  filesContainer.innerHTML = files.map(file => `
    <a href="${file.url}" target="_blank" class="file-preview">
      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
        <path stroke-linecap="round" stroke-linejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
      </svg>
      ${file.filename || 'Document'}
    </a>
  `).join('');
}

// ============================================================================
// RENDER STATUS ACTION BUTTONS
// ============================================================================
function renderStatusActions(currentStatus) {
  const container = document.getElementById('status-actions-container');
  
  const buttons = [];
  
  // Pending → Approve or Reject
  if (currentStatus === 'pending') {
    buttons.push(`
      <button class="status-btn status-btn-approve" onclick="updateStatus('approved')">
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
        </svg>
        Approve Request
      </button>
      <button class="status-btn status-btn-reject" onclick="updateStatus('rejected')">
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"/>
        </svg>
        Reject Request
      </button>
    `);
  }
  
  // Approved → Schedule
  if (currentStatus === 'approved') {
    buttons.push(`
      <button class="status-btn status-btn-schedule" onclick="updateStatus('scheduled')">
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
        </svg>
        Mark as Scheduled
      </button>
    `);
  }
  
  // Scheduled → Complete
  if (currentStatus === 'scheduled') {
    buttons.push(`
      <button class="status-btn status-btn-complete" onclick="updateStatus('completed')">
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"/>
        </svg>
        Mark as Completed
      </button>
    `);
  }
  
  if (buttons.length === 0) {
    container.innerHTML = '<p style="color: var(--color-text-secondary);">No actions available for current status.</p>';
  } else {
    container.innerHTML = buttons.join('');
  }
}

// ============================================================================
// UPDATE STATUS
// ============================================================================
async function updateStatus(newStatus) {
  if (!confirm(`Are you sure you want to change status to "${newStatus}"?`)) {
    return;
  }
  
  try {
    const updateData = {
      status: newStatus,
      reviewed_by: currentUser.id,
      reviewed_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    // Add timestamp fields based on status
    if (newStatus === 'scheduled') {
      updateData.scheduled_date = new Date().toISOString();
    } else if (newStatus === 'completed') {
      updateData.completed_date = new Date().toISOString();
    }
    
    const { error } = await supabaseClient
      .from('health_service_requests')
      .update(updateData)
      .eq('id', requestId);
    
    if (error) throw error;
    
    alert('Status updated successfully!');
    
    // Reload page to show updated data
    window.location.reload();
    
  } catch (error) {
    console.error('Error updating status:', error);
    alert('Failed to update status. Please try again.');
  }
}

// ============================================================================
// SAVE NOTES
// ============================================================================
async function saveNotes() {
  const notes = document.getElementById('staff-notes').value;
  const saveBtn = document.getElementById('save-notes-btn');
  
  saveBtn.disabled = true;
  saveBtn.querySelector('span').textContent = 'Saving...';
  
  try {
    const { error } = await supabaseClient
      .from('health_service_requests')
      .update({ 
        staff_notes: notes,
        updated_at: new Date().toISOString()
      })
      .eq('id', requestId);
    
    if (error) throw error;
    
    alert('Notes saved successfully!');
    
  } catch (error) {
    console.error('Error saving notes:', error);
    alert('Failed to save notes. Please try again.');
  } finally {
    saveBtn.disabled = false;
    saveBtn.querySelector('span').textContent = 'Save Notes';
  }
}

// ============================================================================
// HANDLE LOGOUT
// ============================================================================
async function handleLogout() {
  try {
    await supabaseClient.auth.signOut();
    window.location.href = 'login.html';
  } catch (error) {
    console.error('Logout error:', error);
  }
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================
function formatDateTime(dateString) {
  const date = new Date(dateString);
  const options = { 
    weekday: 'short',
    month: 'long', 
    day: 'numeric', 
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  };
  return date.toLocaleString('en-US', options);
}

function formatProgramName(program) {
  const names = {
    heart_warriors: 'Heart Warriors',
    wheels_of_love: 'Wheels of Love',
    smile_bright: 'Smile Bright'
  };
  return names[program] || program;
}

function getProgramClass(program) {
  const classes = {
    heart_warriors: 'heart',
    wheels_of_love: 'wheels',
    smile_bright: 'smile'
  };
  return classes[program] || 'heart';
}

function getProgramIcon(program) {
  const icons = {
    heart_warriors: '❤️',
    wheels_of_love: '♿',
    smile_bright: '😊'
  };
  return icons[program] || '📋';
}
