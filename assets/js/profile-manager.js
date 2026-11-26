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

    const esc = (v) => (window.utils ? window.utils.escapeHTML(String(v ?? '')) : String(v ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])));
    const modal = this.createModal('Edit Profile', `
      <form id="edit-profile-form" class="profile-form">
        <div class="form-group">
          <label for="profile-name">Full Name</label>
          <input type="text" id="profile-name" class="form-input" value="${esc(profile.full_name)}" required />
        </div>
        
        <div class="form-group">
          <label for="profile-email">Email Address</label>
          <input type="email" id="profile-email" class="form-input" value="${esc(profile.email)}" disabled />
          <small style="color: #6B7280; font-size: 12px;">Email cannot be changed</small>
        </div>
        
        <div class="form-group">
          <label for="profile-phone">Phone Number</label>
          <input type="tel" id="profile-phone" class="form-input" value="${esc(profile.phone_number)}" placeholder="09XX XXX XXXX" />
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

  // Show My Applications page (fetches saved local references via secure RPC)
  async showMyApplications() {
    if (!this.checkAuth()) return;

    const modal = this.createModal('My Applications', `
      <div id="my-apps-body" style="padding: 24px 16px; text-align: center; color: #6B7280;">
        Loading your submitted requests...
      </div>
    `);

    const container = modal.querySelector('#my-apps-body');
    let refs = [];
    try {
      refs = JSON.parse(localStorage.getItem('healthServiceRefs') || '[]');
    } catch (_) {
      refs = [];
    }

    if (!Array.isArray(refs) || refs.length === 0) {
      container.innerHTML = `
        <p style="text-align: center; color: #6B7280; padding: 20px 10px;">
          <strong style="font-size: 16px; display: block; margin-bottom: 8px; color: #1f2937;">No Applications Found on This Device</strong>
          Submit a health service request or track an existing reference number.
        </p>
        <div style="display:flex; gap:10px; flex-direction:column; margin-top:12px;">
          <button class="btn-primary" onclick="document.getElementById('profile-modal').remove(); document.body.style.overflow=''; navigateTo('page-programs');" style="width: 100%;">
            Browse Health Services
          </button>
          <a href="health-track.html" class="btn-secondary" style="width: 100%; text-align:center; text-decoration:none; display:block; padding:12px; border-radius:10px;">
            Track by Reference Number
          </a>
        </div>
      `;
      return;
    }

    const esc = (v) => (window.utils ? window.utils.escapeHTML(String(v ?? '')) : String(v ?? ''));
    const client = window.authManager?.supabase || window.supabaseClient;
    const rows = [];

    if (client) {
      const results = await Promise.all(
        refs.slice(0, 10).map(ref =>
          client.rpc('track_health_request', { p_reference_number: String(ref) })
            .then(r => (Array.isArray(r.data) ? r.data[0] : r.data))
            .catch(() => null)
        )
      );
      results.forEach(item => { if (item) rows.push(item); });
    }

    if (rows.length === 0) {
      container.innerHTML = `
        <p style="font-size:14px;color:#4b5563;margin-bottom:14px;">Recent Reference Numbers:</p>
        ${refs.map(r => `<div style="padding:10px;background:#f3f4f6;border-radius:8px;margin-bottom:8px;font-family:monospace;font-weight:700;">${esc(r)}</div>`).join('')}
        <a href="health-track.html" class="btn-primary" style="display:block;text-align:center;text-decoration:none;margin-top:12px;">Open Tracker</a>
      `;
      return;
    }

    const programNames = {
      heart_warriors: 'Heart Warriors',
      wheels_of_love: 'Wheels of Love',
      smile_bright: 'Smile Bright Bago'
    };

    container.style.textAlign = 'left';
    container.style.padding = '8px 0';
    container.innerHTML = rows.map(r => `
      <div style="border:1.5px solid #e5e7eb;border-radius:12px;padding:12px;margin-bottom:10px;background:#fff;">
        <div style="display:flex;justify-content:space-between;align-items:center;gap:8px;margin-bottom:6px;">
          <span style="font-family:monospace;font-weight:800;color:#0A2E5C;font-size:13px;">${esc(r.reference_number)}</span>
          <span style="font-size:11px;font-weight:700;padding:3px 8px;border-radius:999px;background:#eff6ff;color:#1e40af;text-transform:uppercase;">${esc(String(r.status || '').replace('_', ' '))}</span>
        </div>
        <div style="font-size:14px;font-weight:700;color:#1f2937;">${esc(programNames[r.program] || r.program)}</div>
        <div style="font-size:12px;color:#6b7280;margin-top:2px;">${esc(r.barangay)} • ${new Date(r.created_at).toLocaleDateString()}</div>
      </div>
    `).join('') + `<a href="health-track.html" class="btn-primary" style="display:block;text-align:center;text-decoration:none;margin-top:12px;">Open Full Tracker</a>`;
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
        
        <button class="btn-secondary" onclick="window.profileManager.showChangePassword()" style="width: 100%; margin-top: 16px;">
          Change Password
        </button>
        
        <button class="btn-secondary" onclick="if(confirm('To delete your account and personal data, please contact City Hall ICT at info@bagocity.gov.ph.')) { window.location.href='mailto:info@bagocity.gov.ph?subject=Account%20Deletion%20Request'; }" style="width: 100%; margin-top: 12px; background: #fee2e2; color: #dc2626; border-color: #fecaca;">
          Request Account Deletion
        </button>
      </div>
    `);
  }

  async showChangePassword() {
    if (!this.checkAuth()) return;
    const modal = this.createModal('Change Password', `
      <form id="change-password-form" class="profile-form">
        <div class="form-group">
          <label for="new-password">New Password</label>
          <input type="password" id="new-password" class="form-input" minlength="6" required placeholder="At least 6 characters" />
        </div>
        <div class="form-group">
          <label for="confirm-new-password">Confirm New Password</label>
          <input type="password" id="confirm-new-password" class="form-input" minlength="6" required placeholder="Re-enter new password" />
        </div>
        <button type="submit" class="btn-primary" style="width: 100%; margin-top: 12px;">Update Password</button>
      </form>
    `);

    const form = modal.querySelector('#change-password-form');
    form.onsubmit = async (e) => {
      e.preventDefault();
      const pw = document.getElementById('new-password').value;
      const pw2 = document.getElementById('confirm-new-password').value;
      if (pw !== pw2) {
        showToast('Password Mismatch', 'Passwords do not match.');
        return;
      }
      try {
        const client = window.authManager?.supabase || window.supabaseClient;
        const { error } = await client.auth.updateUser({ password: pw });
        if (error) throw error;
        modal.remove();
        document.body.style.overflow = '';
        showToast('Password Updated', 'Your password has been changed.');
      } catch (err) {
        showToast('Update Failed', err.message || 'Could not update password.');
      }
    };
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
