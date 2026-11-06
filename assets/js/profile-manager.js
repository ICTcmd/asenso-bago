// ═══════════════════════════════════════════════════════════
// PROFILE MANAGER
// Handles profile pages and user data management
// ═══════════════════════════════════════════════════════════

class ProfileManager {
  constructor() {
    this.currentPage = null;
  }

  // Initialize profile manager
  init() {
    this.setupMenuHandlers();
  }

  // Setup menu click handlers
  setupMenuHandlers() {
    // My Profile
    const myProfileBtn = document.querySelector('.menu-row[data-action="my-profile"]');
    if (myProfileBtn) {
      myProfileBtn.onclick = () => this.showMyProfile();
    }

    // My Applications
    const applicationsBtn = document.querySelector('.menu-row[data-action="my-applications"]');
    if (applicationsBtn) {
      applicationsBtn.onclick = () => this.showMyApplications();
    }

    // Notifications
    const notificationsBtn = document.querySelector('.menu-row[data-action="notifications"]');
    if (notificationsBtn) {
      notificationsBtn.onclick = () => this.showNotifications();
    }

    // Privacy & Security
    const privacyBtn = document.querySelector('.menu-row[data-action="privacy"]');
    if (privacyBtn) {
      privacyBtn.onclick = () => this.showPrivacySettings();
    }

    // Help & Support
    const helpBtn = document.querySelector('.menu-row[data-action="help"]');
    if (helpBtn) {
      helpBtn.onclick = () => this.showHelpSupport();
    }

    // About Asenso Bago
    const aboutBtn = document.querySelector('.menu-row[data-action="about"]');
    if (aboutBtn) {
      aboutBtn.onclick = () => this.showAbout();
    }
  }

  // Check authentication before showing pages
  checkAuth() {
    if (!window.authManager || !window.authManager.isAuthenticated()) {
      showToast('Sign In Required', 'Please sign in to access this feature');
      window.authManager.showSignInModal();
      return false;
    }
    return true;
  }

  // Show My Profile edit page
  async showMyProfile() {
    if (!this.checkAuth()) return;

    const profile = await window.authManager.loadUserProfile();
    if (!profile) return;

    const modal = this.createModal('Edit Profile', `
      <form id="edit-profile-form" class="profile-form">
        <div class="form-group">
          <label for="profile-name">Full Name</label>
          <input type="text" id="profile-name" class="form-input" value="${profile.full_name || ''}" required />
        </div>
        
        <div class="form-group">
          <label for="profile-email">Email Address</label>
          <input type="email" id="profile-email" class="form-input" value="${profile.email || ''}" disabled />
          <small style="color: #6B7280; font-size: 12px;">Email cannot be changed</small>
        </div>
        
        <div class="form-group">
          <label for="profile-phone">Phone Number</label>
          <input type="tel" id="profile-phone" class="form-input" value="${profile.phone_number || ''}" placeholder="09XX XXX XXXX" />
        </div>
        
        <button type="submit" class="btn-primary" style="width: 100%; margin-top: 16px;">
          Save Changes
        </button>
      </form>
    `);

    // Handle form submission
    const form = document.getElementById('edit-profile-form');
    form.onsubmit = async (e) => {
      e.preventDefault();
      
      const updates = {
        full_name: document.getElementById('profile-name').value,
        phone_number: document.getElementById('profile-phone').value
      };

      const result = await window.authManager.updateProfile(updates);
      if (result.success) {
        modal.remove();
        await window.authManager.updateUIForAuthenticatedUser();
      }
    };
  }

  // Show My Applications page
  showMyApplications() {
    if (!this.checkAuth()) return;

    this.createModal('My Applications', `
      <div class="applications-list">
        <p style="text-align: center; color: #6B7280; padding: 40px 20px;">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" style="width: 64px; height: 64px; margin: 0 auto 16px; color: #D97732;">
            <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9z"/>
          </svg>
          <br>
          <strong style="font-size: 16px; display: block; margin-bottom: 8px;">No Applications Yet</strong>
          You haven't submitted any applications for government services.
        </p>
        <div style="padding: 0 20px;">
          <button class="btn-primary" onclick="document.querySelector('.page.active').classList.remove('active'); document.getElementById('page-home').classList.add('active');" style="width: 100%;">
            Browse Services
          </button>
        </div>
      </div>
    `);
  }

  // Show Notifications page
  showNotifications() {
    if (!this.checkAuth()) return;

    this.createModal('Notifications', `
      <div class="notifications-list">
        <div class="notification-item">
          <div class="notification-icon" style="background: linear-gradient(135deg, #D97732, #F3A65A);">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="white" style="width: 24px; height: 24px;">
              <path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0z"/>
            </svg>
          </div>
          <div class="notification-content">
            <h4>Welcome to Asenso Bago!</h4>
            <p>Your account has been created successfully. Explore city services and programs.</p>
            <span class="notification-time">Just now</span>
          </div>
        </div>
        
        <div class="notification-item">
          <div class="notification-icon" style="background: linear-gradient(135deg, #0A2E5C, #104682);">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="white" style="width: 24px; height: 24px;">
              <path stroke-linecap="round" stroke-linejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z"/>
            </svg>
          </div>
          <div class="notification-content">
            <h4>Asenso Bago Update</h4>
            <p>Stay tuned for more city services and features coming soon!</p>
            <span class="notification-time">1 hour ago</span>
          </div>
        </div>
      </div>
    `);
  }

  // Show Privacy & Security settings
  showPrivacySettings() {
    if (!this.checkAuth()) return;

    this.createModal('Privacy & Security', `
      <div class="settings-list">
        <div class="setting-item">
          <div class="setting-info">
            <h4>Email Notifications</h4>
            <p>Receive email updates about your applications</p>
          </div>
          <label class="toggle-switch">
            <input type="checkbox" checked>
            <span class="toggle-slider"></span>
          </label>
        </div>
        
        <div class="setting-item">
          <div class="setting-info">
            <h4>Push Notifications</h4>
            <p>Get push notifications on your device</p>
          </div>
          <label class="toggle-switch">
            <input type="checkbox" checked>
            <span class="toggle-slider"></span>
          </label>
        </div>
        
        <div class="setting-divider"></div>
        
        <div class="setting-item">
          <div class="setting-info">
            <h4>Data Sharing</h4>
            <p>Share anonymous usage data to improve services</p>
          </div>
          <label class="toggle-switch">
            <input type="checkbox">
            <span class="toggle-slider"></span>
          </label>
        </div>
        
        <div class="setting-divider"></div>
        
        <button class="btn-secondary" onclick="alert('Password change functionality coming soon!')" style="width: 100%; margin-top: 16px;">
          Change Password
        </button>
        
        <button class="btn-secondary" onclick="if(confirm('Are you sure you want to delete your account? This action cannot be undone.')) { alert('Account deletion functionality coming soon!'); }" style="width: 100%; margin-top: 12px; background: #fee2e2; color: #dc2626; border-color: #fecaca;">
          Delete Account
        </button>
      </div>
    `);
  }

  // Show Help & Support
  showHelpSupport() {
    this.createModal('Help & Support', `
      <div class="help-content">
        <div class="help-section">
          <h3 style="font-size: 16px; font-weight: 700; margin-bottom: 12px; color: #0A2E5C;">Contact Us</h3>
          
          <a href="mailto:info@bagocity.gov.ph" class="help-item">
            <div class="help-icon">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75"/>
              </svg>
            </div>
            <div>
              <div class="help-label">Email Support</div>
              <div class="help-value">info@bagocity.gov.ph</div>
            </div>
          </a>
          
          <a href="tel:+63344461319" class="help-item">
            <div class="help-icon">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z"/>
              </svg>
            </div>
            <div>
              <div class="help-label">Phone Support</div>
              <div class="help-value">(034) 446-1319</div>
            </div>
          </a>
          
          <a href="https://lgu-bago-portal.vercel.app" target="_blank" rel="noopener noreferrer" class="help-item">
            <div class="help-icon">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418"/>
              </svg>
            </div>
            <div>
              <div class="help-label">Visit Website</div>
              <div class="help-value">lgu-bago-portal.vercel.app</div>
            </div>
          </a>
        </div>
        
        <div class="help-section" style="margin-top: 24px;">
          <h3 style="font-size: 16px; font-weight: 700; margin-bottom: 12px; color: #0A2E5C;">Frequently Asked Questions</h3>
          
          <details class="faq-item">
            <summary>How do I apply for government services?</summary>
            <p>Navigate to the Services section from the home page and select the service you need. Follow the application process for each specific service.</p>
          </details>
          
          <details class="faq-item">
            <summary>How do I track my applications?</summary>
            <p>Go to Profile > My Applications to view all your submitted applications and their current status.</p>
          </details>
          
          <details class="faq-item">
            <summary>Is my personal data secure?</summary>
            <p>Yes, we use industry-standard encryption and security measures to protect your personal information. We never share your data without your consent.</p>
          </details>
          
          <details class="faq-item">
            <summary>How do I update my profile information?</summary>
            <p>Go to Profile > My Profile to edit your name and phone number. Your email address cannot be changed for security reasons.</p>
          </details>
        </div>
      </div>
    `);
  }

  // Show About page
  showAbout() {
    this.createModal('About Asenso Bago', `
      <div class="about-content">
        <div style="text-align: center; padding: 24px 0;">
          <img src="assets/images/May Gugma Nga Panghimanwa Logo Final.png" alt="Asenso Bago" style="width: 120px; height: 120px; object-fit: contain; margin-bottom: 16px;" />
          <h2 style="font-size: 24px; font-weight: 800; color: #0A2E5C; margin-bottom: 8px;">Asenso Bago</h2>
          <p style="color: #6B7280; font-size: 14px; margin-bottom: 4px;">Version 1.0.0</p>
          <p style="color: #D97732; font-weight: 600; font-size: 14px;">City of Bago Official App</p>
        </div>
        
        <div class="about-section">
          <h3 style="font-size: 16px; font-weight: 700; margin-bottom: 12px; color: #0A2E5C;">About the App</h3>
          <p style="color: #4B5563; line-height: 1.6; font-size: 14px;">
            Asenso Bago is the official mobile application of the City Government of Bago, Negros Occidental. 
            Our mission is to bring government services closer to every Bagonhon through digital technology.
          </p>
        </div>
        
        <div class="about-section" style="margin-top: 20px;">
          <h3 style="font-size: 16px; font-weight: 700; margin-bottom: 12px; color: #0A2E5C;">Features</h3>
          <ul style="list-style: none; padding: 0; margin: 0;">
            <li style="padding: 8px 0; color: #4B5563; font-size: 14px;">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="#D97732" style="width: 20px; height: 20px; display: inline-block; margin-right: 8px; vertical-align: middle;">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clip-rule="evenodd"/>
              </svg>
              Access to health programs
            </li>
            <li style="padding: 8px 0; color: #4B5563; font-size: 14px;">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="#D97732" style="width: 20px; height: 20px; display: inline-block; margin-right: 8px; vertical-align: middle;">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clip-rule="evenodd"/>
              </svg>
              City tourism information
            </li>
            <li style="padding: 8px 0; color: #4B5563; font-size: 14px;">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="#D97732" style="width: 20px; height: 20px; display: inline-block; margin-right: 8px; vertical-align: middle;">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clip-rule="evenodd"/>
              </svg>
              News and updates
            </li>
            <li style="padding: 8px 0; color: #4B5563; font-size: 14px;">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="#D97732" style="width: 20px; height: 20px; display: inline-block; margin-right: 8px; vertical-align: middle;">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clip-rule="evenodd"/>
              </svg>
              Barangay profiles
            </li>
            <li style="padding: 8px 0; color: #4B5563; font-size: 14px;">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="#D97732" style="width: 20px; height: 20px; display: inline-block; margin-right: 8px; vertical-align: middle;">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clip-rule="evenodd"/>
              </svg>
              Legislative documents
            </li>
          </ul>
        </div>
        
        <div class="about-section" style="margin-top: 20px;">
          <h3 style="font-size: 16px; font-weight: 700; margin-bottom: 12px; color: #0A2E5C;">Developed By</h3>
          <p style="color: #4B5563; line-height: 1.6; font-size: 14px;">
            ICT Department<br>
            City Government of Bago<br>
            Negros Occidental, Philippines
          </p>
        </div>
        
        <div style="text-align: center; margin-top: 24px; padding-top: 20px; border-top: 1px solid #E5E7EB;">
          <p style="color: #9CA3AF; font-size: 12px;">
            &copy; 2026 LGU Bago City. All rights reserved.
          </p>
        </div>
      </div>
    `);
  }

  // Create modal helper
  createModal(title, content) {
    // Remove existing modal if any
    const existing = document.getElementById('profile-modal');
    if (existing) existing.remove();

    const modal = document.createElement('div');
    modal.id = 'profile-modal';
    modal.className = 'profile-modal';
    modal.innerHTML = `
      <div class="profile-modal-overlay" onclick="document.getElementById('profile-modal').remove(); document.body.style.overflow = '';"></div>
      <div class="profile-modal-content">
        <div class="profile-modal-header">
          <h2>${title}</h2>
          <button class="profile-modal-close" onclick="document.getElementById('profile-modal').remove(); document.body.style.overflow = '';">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>
        </div>
        <div class="profile-modal-body">
          ${content}
        </div>
      </div>
    `;

    document.body.appendChild(modal);
    document.body.style.overflow = 'hidden';
    
    return modal;
  }
}

// Create global profile manager instance
window.profileManager = new ProfileManager();
