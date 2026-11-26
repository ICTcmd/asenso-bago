// Admin Requests Management JavaScript
// Handles listing, filtering, and searching requests

const { url: SUPABASE_URL, anonKey: SUPABASE_ANON_KEY } = window.SUPABASE_CONFIG || {};
const { createClient } = supabase;
const supabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

let currentUser = null;
let currentStatus = 'all';
let currentProgram = 'all';
let searchQuery = '';

// ============================================================================
// INITIALIZATION
// ============================================================================
document.addEventListener('DOMContentLoaded', async () => {
  // Check authentication
  await checkAuth();
  
  // Load user info
  await loadUserInfo();
  
  // Get URL parameters
  const params = new URLSearchParams(window.location.search);
  const urlProgram = params.get('program');
  if (urlProgram) {
    currentProgram = urlProgram;
    // Update active filter button
    document.querySelector(`[data-program="${urlProgram}"]`)?.classList.add('active');
    document.querySelector('[data-program="all"]')?.classList.remove('active');
  }
  
  // Load requests
  await loadRequests();
  
  // Setup filters
  setupFilters();
  
  // Setup search
  setupSearch();
  
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
// LOAD REQUESTS
// ============================================================================
async function loadRequests() {
  const loadingState = document.getElementById('loading-state');
  const emptyState = document.getElementById('empty-state');
  const tableContainer = document.getElementById('requests-table-container');
  const tbody = document.getElementById('requests-tbody');
  const resultsCount = document.getElementById('results-count');
  
  // Show loading
  loadingState.style.display = 'block';
  emptyState.style.display = 'none';
  tableContainer.style.display = 'none';
  
  try {
    let query = supabaseClient
      .from('health_service_requests')
      .select('id, reference_number, full_name, age, gender, program, barangay, status, created_at')
      .order('created_at', { ascending: false })
      .limit(100);
    
    // Apply status filter
    if (currentStatus !== 'all') {
      query = query.eq('status', currentStatus);
    }
    
    // Apply program filter
    if (currentProgram !== 'all') {
      query = query.eq('program', currentProgram);
    }

    // Apply server-side search filter when query is present
    if (searchQuery) {
      const safeQ = searchQuery.replace(/[,%()]/g, '');
      if (safeQ) {
        query = query.or(`full_name.ilike.%${safeQ}%,reference_number.ilike.%${safeQ}%`);
      }
    }
    
    const { data: requests, error } = await query;
    
    if (error) throw error;
    
    const filteredRequests = requests || [];
    
    // Hide loading
    loadingState.style.display = 'none';
    
    // Update results count
    resultsCount.textContent = filteredRequests.length === 100
      ? 'Showing latest 100 matching requests'
      : `Showing ${filteredRequests.length} request${filteredRequests.length !== 1 ? 's' : ''}`;
    
    // Show empty state or table
    if (filteredRequests.length === 0) {
      emptyState.style.display = 'block';
      return;
    }
    
    // Populate table (escape all database strings)
    tbody.innerHTML = filteredRequests.map(request => {
      const safeId = encodeURIComponent(request.id);
      const safeStatus = escapeHTML(request.status);
      return `
      <tr onclick="viewRequest('${safeId}')">
        <td>
          <span class="request-ref">${escapeHTML(request.reference_number)}</span>
        </td>
        <td>
          <div class="request-name">${escapeHTML(request.full_name)}</div>
          <div class="request-meta">${escapeHTML(request.age)} years old, ${escapeHTML(request.gender)}</div>
        </td>
        <td>
          <span class="program-badge program-${getProgramClass(request.program)}">
            ${getProgramIcon(request.program)} ${escapeHTML(formatProgramName(request.program))}
          </span>
        </td>
        <td>${escapeHTML(request.barangay)}</td>
        <td>
          <span class="status-badge status-${safeStatus}">${safeStatus}</span>
        </td>
        <td>${formatDate(request.created_at)}</td>
        <td>
          <button class="action-btn" onclick="viewRequest('${safeId}'); event.stopPropagation();">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
              <path stroke-linecap="round" stroke-linejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
            </svg>
            View
          </button>
        </td>
      </tr>
    `;
    }).join('');
    
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
  // Status filters
  const statusBtns = document.querySelectorAll('[data-status]');
  statusBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      statusBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentStatus = btn.dataset.status;
      loadRequests();
    });
  });
  
  // Program filters
  const programBtns = document.querySelectorAll('[data-program]');
  programBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      programBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentProgram = btn.dataset.program;
      loadRequests();
    });
  });
}

// ============================================================================
// SETUP SEARCH
// ============================================================================
function setupSearch() {
  const searchInput = document.getElementById('search-input');
  let searchTimeout;
  
  searchInput.addEventListener('input', (e) => {
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => {
      searchQuery = e.target.value.trim();
      loadRequests();
    }, 300); // Debounce 300ms
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
// UTILITY FUNCTIONS
// ============================================================================
function escapeHTML(val) {
  return String(val ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

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
