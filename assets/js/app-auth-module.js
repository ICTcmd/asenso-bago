// Main App Authentication Integration (ES Module)
// Handles user session, profile display, and sign out

// Get Supabase client from global
const supabaseClient = window.supabaseClient;

// Current user state
let currentUser = null;
let currentProfile = null;

// Initialize authentication on page load
async function initAuth() {
  try {
    // Get current session
    const { data: { session } } = await supabaseClient.auth.getSession();
    
    if (session) {
      currentUser = session.user;
      await loadUserProfile();
      updateUIForAuthenticatedUser();
    } else {
      updateUIForGuestUser();
    }

    // Listen for auth state changes
    supabaseClient.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session) {
        currentUser = session.user;
        loadUserProfile().then(() => {
          updateUIForAuthenticatedUser();
        });
      } else if (event === 'SIGNED_OUT') {
        currentUser = null;
        currentProfile = null;
        updateUIForGuestUser();
      }
    });

  } catch (error) {
    console.error('Auth initialization error:', error);
  }
}

// Load user profile from database
async function loadUserProfile() {
  if (!currentUser) return;

  try {
    const { data, error } = await supabaseClient
      .from('profiles')
      .select('*')
      .eq('id', currentUser.id)
      .single();

    if (error) {
      console.error('Profile load error:', error);
      return;
    }

    currentProfile = data;
  } catch (error) {
    console.error('Profile fetch error:', error);
  }
}

// Update UI for authenticated user
function updateUIForAuthenticatedUser() {
  // Update profile card in Profile tab
  const profileCard = document.querySelector('.profile-card');
  if (profileCard) {
    const profileInfo = profileCard.querySelector('.profile-info');
    const signInBtn = profileCard.querySelector('.signin-btn');
    
    if (profileInfo && currentProfile) {
      const userName = currentProfile.full_name || currentUser.email.split('@')[0];
      profileInfo.querySelector('h3').textContent = userName;
      profileInfo.querySelector('p').textContent = currentUser.email;
    }
    
    if (signInBtn) {
      signInBtn.textContent = 'Sign Out';
      signInBtn.onclick = handleSignOut;
    }
  }

  // Update "Already have an Account?" buttons to show sign out
  updateAuthButtons();
}

// Update UI for guest user
function updateUIForGuestUser() {
  const profileCard = document.querySelector('.profile-card');
  if (profileCard) {
    const profileInfo = profileCard.querySelector('.profile-info');
    const signInBtn = profileCard.querySelector('.signin-btn');
    
    if (profileInfo) {
      profileInfo.querySelector('h3').textContent = 'Guest User';
      profileInfo.querySelector('p').textContent = 'Sign in to access all features';
    }
    
    if (signInBtn) {
      signInBtn.textContent = 'Sign In';
      signInBtn.onclick = () => window.location.href = 'auth.html';
    }
  }

  updateAuthButtons();
}

// Update auth buttons throughout the app
function updateAuthButtons() {
  // Sign in buttons on splash screen
  const authLinks = document.querySelectorAll('.btn-link');
  authLinks.forEach(link => {
    if (currentUser) {
      link.innerHTML = 'Signed in as <span>' + (currentProfile?.full_name || currentUser.email.split('@')[0]) + '</span>';
      link.onclick = (e) => {
        e.preventDefault();
        // Switch to profile tab
        const profileTab = document.querySelector('[data-tab="profile"]');
        if (profileTab) profileTab.click();
      };
    } else {
      link.innerHTML = 'Already have an Account? <span>Sign in</span>';
      link.onclick = (e) => {
        e.preventDefault();
        window.location.href = 'auth.html';
      };
    }
  });

  // Profile card sign in button
  const signinBtn = document.querySelector('.signin-btn');
  if (signinBtn) {
    if (currentUser) {
      signinBtn.textContent = 'Sign Out';
      signinBtn.onclick = handleSignOut;
    } else {
      signinBtn.textContent = 'Sign In';
      signinBtn.onclick = () => window.location.href = 'auth.html';
    }
  }
}

// Handle sign out
async function handleSignOut(e) {
  if (e) e.preventDefault();

  const confirmed = confirm('Are you sure you want to sign out?');
  if (!confirmed) return;

  try {
    const { error } = await supabaseClient.auth.signOut();
    
    if (error) throw error;

    currentUser = null;
    currentProfile = null;
    updateUIForGuestUser();
    
    // Show notification
    alert('You have been signed out successfully');

  } catch (error) {
    console.error('Sign out error:', error);
    alert('Failed to sign out. Please try again.');
  }
}

// Add sign in button click handlers on page load
function setupAuthButtons() {
  // Sign in button in profile card
  const signinBtn = document.querySelector('.signin-btn');
  if (signinBtn) {
    signinBtn.addEventListener('click', (e) => {
      e.preventDefault();
      if (currentUser) {
        handleSignOut();
      } else {
        window.location.href = 'auth.html';
      }
    });
  }

  // "Already have an Account?" links
  const authLinks = document.querySelectorAll('.btn-link');
  authLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      if (!currentUser) {
        window.location.href = 'auth.html';
      }
    });
  });
}

// Export functions for global access
window.getCurrentUser = () => currentUser;
window.getCurrentProfile = () => currentProfile;
window.signOut = handleSignOut;

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    setupAuthButtons();
    initAuth();
  });
} else {
  setupAuthButtons();
  initAuth();
}
