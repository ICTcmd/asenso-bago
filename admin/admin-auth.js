// Admin Authentication Module
// Handles admin login with role verification

const { url: SUPABASE_URL, anonKey: SUPABASE_ANON_KEY } = window.SUPABASE_CONFIG || {};
const { createClient } = supabase;
const supabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// ============================================================================
// LOGIN FORM HANDLER
// ============================================================================
document.addEventListener('DOMContentLoaded', () => {
  const loginForm = document.getElementById('admin-login-form');
  
  // Check if already logged in
  checkExistingSession();
  
  loginForm.addEventListener('submit', handleLogin);
});

// ============================================================================
// CHECK EXISTING SESSION
// ============================================================================
async function checkExistingSession() {
  try {
    const { data: { session } } = await supabaseClient.auth.getSession();
    
    if (session) {
      // Verify admin role
      const isAdmin = await verifyAdminRole(session.user.id);
      if (isAdmin) {
        window.location.href = 'index.html';
      } else {
        // Not an admin, sign them out
        await supabaseClient.auth.signOut();
      }
    }
  } catch (error) {
    console.error('Session check error:', error);
  }
}

// ============================================================================
// HANDLE LOGIN
// ============================================================================
async function handleLogin(e) {
  e.preventDefault();
  
  const loginBtn = document.getElementById('login-btn');
  const loginText = document.getElementById('login-text');
  const loginIcon = document.getElementById('login-icon');
  const errorDiv = document.getElementById('login-error');
  
  const email = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value;
  
  // Show loading state
  loginBtn.disabled = true;
  loginIcon.innerHTML = '<div class="loading-spinner"></div>';
  loginText.textContent = 'Signing in...';
  errorDiv.classList.remove('active');
  
  try {
    // Sign in with Supabase Auth
    const { data, error } = await supabaseClient.auth.signInWithPassword({
      email,
      password
    });
    
    if (error) throw error;
    
    // Verify user has admin role
    const isAdmin = await verifyAdminRole(data.user.id);
    
    if (!isAdmin) {
      // Not an admin, sign them out
      await supabaseClient.auth.signOut();
      throw new Error('Access denied. Admin privileges required.');
    }
    
    // Success! Redirect to dashboard
    window.location.href = 'index.html';
    
  } catch (error) {
    console.error('Login error:', error);
    
    let errorMessage = 'Invalid email or password';
    
    if (error.message.includes('Access denied')) {
      errorMessage = error.message;
    } else if (error.message.includes('Invalid login credentials')) {
      errorMessage = 'Invalid email or password';
    } else if (error.message.includes('Email not confirmed')) {
      errorMessage = 'Please verify your email address';
    }
    
    errorDiv.textContent = errorMessage;
    errorDiv.classList.add('active');
    
    // Reset button
    loginBtn.disabled = false;
    loginIcon.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3"/></svg>';
    loginText.textContent = 'Sign In';
  }
}

// ============================================================================
// VERIFY ADMIN ROLE
// ============================================================================
async function verifyAdminRole(userId) {
  try {
    const { data, error } = await supabaseClient
      .from('profiles')
      .select('role')
      .eq('id', userId)
      .single();
    
    if (error) throw error;
    
    // Check if user has admin or supervisor role
    return data && (data.role === 'admin' || data.role === 'supervisor');
    
  } catch (error) {
    console.error('Role verification error:', error);
    return false;
  }
}
