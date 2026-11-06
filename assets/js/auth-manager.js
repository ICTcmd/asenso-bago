// ═══════════════════════════════════════════════════════════
// AUTHENTICATION MANAGER
// Handles user authentication with Supabase
// ═══════════════════════════════════════════════════════════

class AuthManager {
  constructor() {
    this.supabase = null;
    this.currentUser = null;
    this.initialized = false;
  }

  // Initialize Supabase client
  async init() {
    if (this.initialized) return;
    
    try {
      // Check if Supabase is loaded
      if (typeof window.supabase === 'undefined') {
        console.error('Supabase library not loaded');
        return;
      }

      // Create Supabase client
      this.supabase = window.supabase.createClient(
        window.SUPABASE_CONFIG.url,
        window.SUPABASE_CONFIG.anonKey
      );

      // Check for existing session
      const { data: { session } } = await this.supabase.auth.getSession();
      if (session) {
        this.currentUser = session.user;
        await this.loadUserProfile();
        this.updateUIForAuthenticatedUser();
      }

      // Listen for auth state changes
      this.supabase.auth.onAuthStateChange((event, session) => {
        if (event === 'SIGNED_IN') {
          this.currentUser = session.user;
          this.loadUserProfile();
          this.updateUIForAuthenticatedUser();
          this.closeAuthModal();
        } else if (event === 'SIGNED_OUT') {
          this.currentUser = null;
          this.updateUIForGuestUser();
        }
      });

      this.initialized = true;
    } catch (error) {
      console.error('Failed to initialize auth:', error);
    }
  }

  // Sign up new user
  async signUp(email, password, fullName, phone) {
    try {
      const { data, error } = await this.supabase.auth.signUp({
        email: email,
        password: password,
        options: {
          data: {
            full_name: fullName,
            phone_number: phone
          }
        }
      });

      if (error) throw error;

      showToast('Success', 'Account created! Please check your email to verify your account.');
      return { success: true, data };
    } catch (error) {
      console.error('Sign up error:', error);
      showToast('Sign Up Failed', error.message || 'Failed to create account');
      return { success: false, error };
    }
  }

  // Sign in existing user
  async signIn(email, password) {
    try {
      const { data, error } = await this.supabase.auth.signInWithPassword({
        email: email,
        password: password
      });

      if (error) throw error;

      showToast('Welcome Back!', 'You have successfully signed in.');
      return { success: true, data };
    } catch (error) {
      console.error('Sign in error:', error);
      showToast('Sign In Failed', error.message || 'Invalid credentials');
      return { success: false, error };
    }
  }

  // Sign out user
  async signOut() {
    try {
      const { error } = await this.supabase.auth.signOut();
      if (error) throw error;

      this.currentUser = null;
      showToast('Signed Out', 'You have been signed out successfully.');
      return { success: true };
    } catch (error) {
      console.error('Sign out error:', error);
      showToast('Error', 'Failed to sign out');
      return { success: false, error };
    }
  }

  // Load user profile from database
  async loadUserProfile() {
    if (!this.currentUser) return null;

    try {
      const { data, error } = await this.supabase
        .from('profiles')
        .select('*')
        .eq('id', this.currentUser.id)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Failed to load profile:', error);
      return null;
    }
  }

  // Update user profile
  async updateProfile(updates) {
    if (!this.currentUser) return { success: false };

    try {
      const { data, error } = await this.supabase
        .from('profiles')
        .update(updates)
        .eq('id', this.currentUser.id)
        .select()
        .single();

      if (error) throw error;

      showToast('Profile Updated', 'Your profile has been updated successfully.');
      return { success: true, data };
    } catch (error) {
      console.error('Failed to update profile:', error);
      showToast('Update Failed', error.message || 'Failed to update profile');
      return { success: false, error };
    }
  }

  // Update UI for authenticated user
  async updateUIForAuthenticatedUser() {
    const profile = await this.loadUserProfile();
    
    // Update profile card
    const profileCard = document.querySelector('.profile-card');
    if (profileCard) {
      const avatar = profileCard.querySelector('.avatar');
      const profileInfo = profileCard.querySelector('.profile-info');
      const signInBtn = profileCard.querySelector('.signin-btn');

      // Update avatar with initial
      if (avatar && profile?.full_name) {
        const initial = profile.full_name.charAt(0).toUpperCase();
        avatar.innerHTML = `<div style="font-size: 32px; font-weight: 700; color: #D97732;">${initial}</div>`;
      }

      // Update name and email
      if (profileInfo) {
        profileInfo.innerHTML = `
          <h3>${profile?.full_name || 'User'}</h3>
          <p>${this.currentUser.email}</p>
        `;
      }

      // Change button to Sign Out
      if (signInBtn) {
        signInBtn.textContent = 'Sign Out';
        signInBtn.onclick = () => this.signOut();
      }
    }
  }

  // Update UI for guest user
  updateUIForGuestUser() {
    const profileCard = document.querySelector('.profile-card');
    if (profileCard) {
      const avatar = profileCard.querySelector('.avatar');
      const profileInfo = profileCard.querySelector('.profile-info');
      const signInBtn = profileCard.querySelector('.signin-btn');

      // Reset avatar
      if (avatar) {
        avatar.innerHTML = `
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0zM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632z"/>
          </svg>
        `;
      }

      // Reset name and email
      if (profileInfo) {
        profileInfo.innerHTML = `
          <h3>Guest User</h3>
          <p>Sign in to access all features</p>
        `;
      }

      // Reset button
      if (signInBtn) {
        signInBtn.textContent = 'Sign In';
        signInBtn.onclick = () => this.showSignInModal();
      }
    }
  }

  // Show sign in modal
  showSignInModal() {
    const modal = document.getElementById('auth-modal');
    const signInForm = document.getElementById('signin-form');
    const signUpForm = document.getElementById('signup-form');
    
    if (modal && signInForm && signUpForm) {
      signInForm.style.display = 'block';
      signUpForm.style.display = 'none';
      modal.style.display = 'flex';
      document.body.style.overflow = 'hidden';
    }
  }

  // Show sign up modal
  showSignUpModal() {
    const modal = document.getElementById('auth-modal');
    const signInForm = document.getElementById('signin-form');
    const signUpForm = document.getElementById('signup-form');
    
    if (modal && signInForm && signUpForm) {
      signInForm.style.display = 'none';
      signUpForm.style.display = 'block';
      modal.style.display = 'flex';
      document.body.style.overflow = 'hidden';
    }
  }

  // Close auth modal
  closeAuthModal() {
    const modal = document.getElementById('auth-modal');
    if (modal) {
      modal.style.display = 'none';
      document.body.style.overflow = '';
    }
  }

  // Check if user is authenticated
  isAuthenticated() {
    return this.currentUser !== null;
  }

  // Get current user
  getCurrentUser() {
    return this.currentUser;
  }
}

// Create global auth manager instance
window.authManager = new AuthManager();
