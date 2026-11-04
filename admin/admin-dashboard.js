// Admin Dashboard JavaScript
// Loads statistics and recent requests

const { url: SUPABASE_URL, anonKey: SUPABASE_ANON_KEY } = window.SUPABASE_CONFIG || {};
const { createClient } = supabase;
const supabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

let currentUser = null;
let currentProgram = 'all';

// ============================================================================
// INITIALIZATION
// ============================================================================
document.addEventListener('DOMContentLoaded', async () => {
  // Check authentication
  await checkAuth();
  
  // Load user info
  await loadUserInfo();
  
  // Load dashboard data
  await loadDashboardStats();
  await loadRecentRequests();
  
  // Setup filter buttons
  setupFilters();
  
  // Setup logout
  document.getElementById('logout-btn').addEventListener('click', handleLogout);
  
  // Update datetime
  updateDateTime();
  setInterval(updateDateTime, 60000); // Update every minute
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
// LOAD DASHBOARD STATISTICS
// ============================================================================
async function loadDashboardStats() {
  try {
    // Get all requests
    const { data: allRequests, error } = await supabaseClient
      .from('health_service_requests')
      .select('status');
    
    if (error) throw error;
    
    // Calculate stats
    const total = allRequests.length;
    const pending = allRequests.filter(r => r.status === 'pending').length;
    const approved = allRequests.filter(r => r.status === 'approved').length;
    const completed = allRequests.filter(r => r.status === 'completed').length;
    
    // Update UI
    document.getElementById('stat-total').textContent = total;
    document.getElementById('stat-pending').textContent = pending;
    document.getElementById('stat-approved').textContent = approved;
    document.getElementById('stat-completed').textContent = completed;
    
  } catch (error) {
    console.error('Error loading stats:', error);
  }
}

// ============================================================================
// LOAD RECENT REQUESTS
// ============================================================================
async function loadRecentRequests() {
  const loadingState = document.getElementById('loading-state');
  const emptyState = document.getElementById('empty-state');
  const tableContainer = document.getElementById('requests-table-container');
  const tbody = document.getElementById('requests-tbody');
  
  // Show loading
  loadingState.style.display = 'block';
  emptyState.style.display = 'none';
  tableContainer.style.display = 'none';
  
  try {
    let query = supabaseClient
      .from('health_service_requests')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(10);
    
    // Apply program filter
    if (currentProgram !== 'all') {
      query = query.eq('program', currentProgram);
    }
    
    const { data: requests, error } = await query;
    
    if (error) throw error;
    
    // Hide loading
    loadingState.style.display = 'none';
    
    // Show empty state or table
    if (!requests || requests.length === 0) {
      emptyState.style.display = 'block';
      return;
    }
    
    // Populate table
    tbody.innerHTML = requests.map(request => `
      <tr onclick="viewRequest('${request.id}')">
        <td>
          <span class="request-ref">${request.reference_number}</span>
        </td>
        <td>
          <div class="request-name">${request.full_name}</div>
          <div class="request-meta">${request.age} years old, ${request.gender}</div>
        </td>
        <td>
          <span class="program-badge program-${getProgramClass(request.program)}">
            ${getProgramIcon(request.program)} ${formatProgramName(request.program)}
          </span>
        </td>
        <td>${request.barangay}</td>
        <td>
          <span class="status-badge status-${request.status}">${request.status}</span>
        </td>
        <td>${formatDate(request.created_at)}</td>
        <td>
          <button class="action-btn" onclick="viewRequest('${request.id}'); event.stopPropagation();">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
              <path stroke-linecap="round" stroke-linejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
            </svg>
            View
          </button>
        </td>
      </tr>
    `).join('');
    
    tableContainer.style.display = 'block';
    
  } catch (error) {
    console.error('Error loading requests:', error);
    loadingState.style.display = 'none';
    emptyState.style.display = 'block';
  }
}

// ============================================================================
// SETUP FILTERS
// ============================================================================
function setupFilters() {
  const filterBtns = document.querySelectorAll('.filter-btn');
  
  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      // Update active state
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      
      // Update current program
      currentProgram = btn.dataset.program;
      
      // Reload requests
      loadRecentRequests();
    });
  });
}

// ============================================================================
// VIEW REQUEST
// ============================================================================
function viewRequest(id) {
  window.location.href = `request-detail.html?id=${id}`;
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
// UPDATE DATE TIME
// ============================================================================
function updateDateTime() {
  const now = new Date();
  const options = { 
    weekday: 'short', 
    month: 'short', 
    day: 'numeric', 
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  };
  
  const formatted = now.toLocaleString('en-US', options);
  const datetimeEl = document.getElementById('current-datetime');
  if (datetimeEl) {
    datetimeEl.textContent = formatted;
  }
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================
function formatDate(dateString) {
  const date = new Date(dateString);
  const options = { 
    month: 'short', 
    day: 'numeric', 
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit'
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
