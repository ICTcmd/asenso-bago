/**
 * Barangay Profile Page - Dynamic Content Loader
 */

// Get barangay slug from URL parameter
const urlParams = new URLSearchParams(window.location.search);
const barangaySlug = urlParams.get('id');

// Elements
const loading = document.getElementById('loading');
const profileContent = document.getElementById('profile-content');
const errorState = document.getElementById('error-state');

/**
 * Load barangay data and populate the page
 */
async function loadBarangayProfile() {
  if (!barangaySlug) {
    showError();
    return;
  }

  try {
    // Fetch barangay data
    const response = await fetch('barangay-profiles-data.json');
    if (!response.ok) throw new Error('Failed to load data');
    
    const barangays = await response.json();
    
    // Find the specific barangay
    const barangay = barangays.find(b => b.slug === barangaySlug);
    
    if (!barangay) {
      showError();
      return;
    }

    // Populate the page
    populateProfile(barangay);
    
    // Hide loading, show content
    loading.style.display = 'none';
    profileContent.style.display = 'block';

  } catch (error) {
    console.error('Error loading barangay profile:', error);
    showError();
  }
}

/**
 * Populate profile page with barangay data
 */
function populateProfile(barangay) {
  // Update page title
  document.title = `Barangay ${barangay.name} - Asenso Bago`;

  // Header
  const logo = barangay.images.logo 
    ? `assets/images/barangays/${barangay.slug}-logo.png`
    : 'assets/images/bago-icon.png';
  
  document.getElementById('brgy-logo').src = logo;
  document.getElementById('brgy-logo').alt = `${barangay.name} Logo`;
  document.getElementById('brgy-name').textContent = `Barangay ${barangay.name}`;
  
  const typeBadge = document.getElementById('brgy-type-badge');
  typeBadge.textContent = barangay.type;
  typeBadge.className = `profile-badge ${barangay.type}-badge`;

  // Description
  const description = barangay.description || 
    `Barangay ${barangay.name} is ${barangay.type === 'urban' ? 'an urban' : 'a rural'} barangay located ${barangay.distance} from the city center.`;
  document.getElementById('brgy-description').textContent = description;

  // Captain
  const captainPhoto = barangay.images.captain
    ? `assets/images/barangays/${barangay.slug}-captain.jpg`
    : 'assets/images/placeholder-official.jpg';
  
  document.getElementById('captain-photo').src = captainPhoto;
  document.getElementById('captain-photo').alt = barangay.officials.captain.name;
  document.getElementById('captain-name').textContent = barangay.officials.captain.name || 'Vacant';

  // SK Chairperson
  const skPhoto = barangay.images.sk_chair
    ? `assets/images/barangays/${barangay.slug}-sk.jpg`
    : 'assets/images/placeholder-official.jpg';
  
  document.getElementById('sk-photo').src = skPhoto;
  document.getElementById('sk-photo').alt = barangay.officials.sk_chair.name;
  document.getElementById('sk-name').textContent = barangay.officials.sk_chair.name || 'Vacant';

  // Barangay Kagawad
  const kagawadList = document.getElementById('kagawad-list');
  kagawadList.innerHTML = '';
  barangay.officials.kagawad.forEach(kagawad => {
    const li = document.createElement('li');
    li.textContent = kagawad;
    kagawadList.appendChild(li);
  });

  // SK Kagawad
  const skKagawadList = document.getElementById('sk-kagawad-list');
  skKagawadList.innerHTML = '';
  barangay.officials.sk_kagawad.forEach(kagawad => {
    const li = document.createElement('li');
    li.textContent = kagawad;
    skKagawadList.appendChild(li);
  });

  // Other Officials
  document.getElementById('secretary-name').textContent = barangay.officials.secretary || 'Vacant';
  document.getElementById('treasurer-name').textContent = barangay.officials.treasurer || 'Vacant';
  document.getElementById('sk-secretary-name').textContent = barangay.officials.sk_secretary || 'Vacant';
  document.getElementById('sk-treasurer-name').textContent = barangay.officials.sk_treasurer || 'Vacant';

  // Fast Facts
  document.getElementById('fact-puroks').textContent = barangay.puroks;
  document.getElementById('fact-land-area').textContent = barangay.landArea;
  document.getElementById('fact-distance').textContent = barangay.distance;
  document.getElementById('fact-type').textContent = barangay.type === 'urban' ? 'Urban' : 'Rural';
}

/**
 * Show error state
 */
function showError() {
  loading.style.display = 'none';
  errorState.style.display = 'flex';
}

// Load profile on page load
document.addEventListener('DOMContentLoaded', loadBarangayProfile);
