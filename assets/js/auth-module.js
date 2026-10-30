// Authentication JavaScript for Asenso Bago PWA (ES Module)
// Handles sign in, sign up, and session management

// Get Supabase client from global
const supabaseClient = window.supabaseClient;

// DOM Elements
const tabSignin = document.getElementById('tab-signin');
const tabSignup = document.getElementById('tab-signup');
const formSignin = document.getElementById('form-signin');
const formSignup = document.getElementById('form-signup');
const errorMessage = document.getElementById('error-message');
const successMessage = document.getElementById('success-message');

// Tab switching
tabSignin?.addEventListener('click', () => {
  tabSignin.classList.add('active');
  tabSignup.classList.remove('active');
  formSignin.classList.add('active');
  formSignup.classList.remove('active');
  clearMessages();
});

tabSignup?.addEventListener('click', () => {
  tabSignup.classList.add('active');
  tabSignin.classList.remove('active');
  formSignup.classList.add('active');
  formSignin.classList.remove('active');
  clearMessages();
});

// Helper functions
function showError(message) {
  errorMessage.textContent = message;
  errorMessage.classList.add('visible');
  successMessage.classList.remove('visible');
}

function showSuccess(message) {
  successMessage.textContent = message;
  successMessage.classList.add('visible');
  errorMessage.classList.remove('visible');
}

function clearMessages() {
  errorMessage.classList.remove('visible');
  successMessage.classList.remove('visible');
}

function setButtonLoading(button, isLoading) {
  if (isLoading) {
    button.disabled = true;
    const originalText = button.textContent;
    button.dataset.originalText = originalText;
    button.innerHTML = '<div class="spinner"></div> Processing...';
  } else {
    button.disabled = false;
    button.innerHTML = button.dataset.originalText || 'Submit';
  }
}

// Sign In Form Handler
formSignin?.addEventListener('submit', async (e) => {
  e.preventDefault();
  clearMessages();

  const email = document.getElementById('signin-email').value.trim();
  const password = document.getElementById('signin-password').value;
  const btn = document.getElementById('btn-signin');

  if (!email || !password) {
    showError('Please enter both email and password');
    return;
  }

  setButtonLoading(btn, true);

  try {
    const { data, error } = await supabaseClient.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;

    // Success! Redirect to main app
    showSuccess('✓ Sign in successful! Redirecting...');
    setTimeout(() => {
      window.location.href = 'index.html';
    }, 1000);

  } catch (error) {
    console.error('Sign in error:', error);
    showError(error.message || 'Failed to sign in. Please check your credentials.');
    setButtonLoading(btn, false);
  }
});

// Sign Up Form Handler
formSignup?.addEventListener('submit', async (e) => {
  e.preventDefault();
  clearMessages();

  const fullName = document.getElementById('signup-fullname').value.trim();
  const email = document.getElementById('signup-email').value.trim();
  const phone = document.getElementById('signup-phone').value.trim();
  const password = document.getElementById('signup-password').value;
  const passwordConfirm = document.getElementById('signup-password-confirm').value;
  const btn = document.getElementById('btn-signup');

  // Validation
  if (!fullName || !email || !password || !passwordConfirm) {
    showError('Please fill in all required fields');
    return;
  }

  if (password !== passwordConfirm) {
    showError('Passwords do not match');
    return;
  }

  if (password.length < 6) {
    showError('Password must be at least 6 characters long');
    return;
  }

  setButtonLoading(btn, true);

  try {
    // Sign up with Supabase Auth
    const { data, error } = await supabaseClient.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          phone_number: phone || null,
        },
      },
    });

    if (error) throw error;

    // Check if email confirmation is required
    if (data.user && !data.session) {
      showSuccess('✓ Account created! Please check your email to verify your account.');
      formSignup.reset();
      setButtonLoading(btn, false);
    } else {
      // Auto sign-in successful
      showSuccess('✓ Account created successfully! Redirecting...');
      setTimeout(() => {
        window.location.href = 'index.html';
      }, 1500);
    }

  } catch (error) {
    console.error('Sign up error:', error);
    showError(error.message || 'Failed to create account. Please try again.');
    setButtonLoading(btn, false);
  }
});

// Check if user is already logged in
async function checkAuthStatus() {
  try {
    const { data: { session } } = await supabaseClient.auth.getSession();
    
    if (session) {
      // User is already logged in, redirect to main app
      window.location.href = 'index.html';
    }
  } catch (error) {
    console.error('Auth check error:', error);
  }
}

// Run auth check on page load
checkAuthStatus();
