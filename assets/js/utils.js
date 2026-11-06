// ═══════════════════════════════════════════════════════════
// UTILITY FUNCTIONS
// Common helper functions used throughout the app
// ═══════════════════════════════════════════════════════════

/**
 * Display a toast notification
 * @param {string} title - Toast title
 * @param {string} message - Toast message
 * @param {number} duration - Duration in ms (default: 4000)
 */
function showToast(title, message, duration = 4000) {
  const container = document.getElementById('toast-container') || createToastContainer();
  
  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.innerHTML = `
    <div class="toast-title">${title}</div>
    <div class="toast-message">${message}</div>
  `;
  
  container.appendChild(toast);
  
  // Auto remove after duration
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(400px)';
    setTimeout(() => toast.remove(), 300);
  }, duration);
}

/**
 * Create toast container if it doesn't exist
 * @returns {HTMLElement} Toast container element
 */
function createToastContainer() {
  const container = document.createElement('div');
  container.id = 'toast-container';
  container.className = 'toast-container';
  document.body.appendChild(container);
  return container;
}

/**
 * Format date to readable string
 * @param {Date|string} date - Date to format
 * @returns {string} Formatted date string
 */
function formatDate(date) {
  const d = new Date(date);
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

/**
 * Format timestamp to relative time (e.g., "2 hours ago")
 * @param {Date|string} date - Date to format
 * @returns {string} Relative time string
 */
function timeAgo(date) {
  const seconds = Math.floor((new Date() - new Date(date)) / 1000);
  
  const intervals = {
    year: 31536000,
    month: 2592000,
    week: 604800,
    day: 86400,
    hour: 3600,
    minute: 60
  };
  
  for (const [unit, secondsInUnit] of Object.entries(intervals)) {
    const interval = Math.floor(seconds / secondsInUnit);
    if (interval >= 1) {
      return interval === 1 ? `1 ${unit} ago` : `${interval} ${unit}s ago`;
    }
  }
  
  return 'Just now';
}

/**
 * Debounce function calls
 * @param {Function} func - Function to debounce
 * @param {number} wait - Wait time in ms
 * @returns {Function} Debounced function
 */
function debounce(func, wait = 300) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

/**
 * Validate email format
 * @param {string} email - Email to validate
 * @returns {boolean} True if valid email
 */
function isValidEmail(email) {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
}

/**
 * Validate Philippine phone number
 * @param {string} phone - Phone number to validate
 * @returns {boolean} True if valid format
 */
function isValidPhoneNumber(phone) {
  // Accepts formats: 09XX XXX XXXX, +639XX XXX XXXX, etc.
  const re = /^(\+?63|0)?9\d{9}$/;
  return re.test(phone.replace(/\s+/g, ''));
}

/**
 * Escape HTML to prevent XSS
 * @param {string} text - Text to escape
 * @returns {string} Escaped text
 */
function escapeHTML(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

/**
 * Get greeting based on time of day
 * @returns {string} Greeting message
 */
function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return 'Maayong Aga'; // Good morning
  if (hour < 18) return 'Maayong Hapon'; // Good afternoon
  return 'Maayong Gab-i'; // Good evening
}

/**
 * Format Philippine Peso currency
 * @param {number} amount - Amount to format
 * @returns {string} Formatted currency
 */
function formatCurrency(amount) {
  return new Intl.NumberFormat('en-PH', {
    style: 'currency',
    currency: 'PHP'
  }).format(amount);
}

// Export functions for use in other modules
if (typeof window !== 'undefined') {
  window.utils = {
    showToast,
    formatDate,
    timeAgo,
    debounce,
    isValidEmail,
    isValidPhoneNumber,
    escapeHTML,
    getGreeting,
    formatCurrency
  };
}
