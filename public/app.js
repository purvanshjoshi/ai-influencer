// API Configuration
const API_CONFIG = {
  endpoint: 'http://localhost:5000/api',
  bellaKey: ''
};

// Store for Bella AI data
const store = {
  influencers: [],
  contentItems: [],
  analyticsData: {}
};

// Initialize the application
function initApp() {
  loadSettings();
  loadInfluencersFromAPI();
  attachEventListeners();
}

// View Management
function switchView(viewName) {
  // Hide all views
  document.querySelectorAll('.view').forEach(view => {
    view.classList.remove('active');
  });
  
  // Show selected view
  document.getElementById(viewName).classList.add('active');
  
  // Update nav active state
  document.querySelectorAll('.nav-item').forEach(item => {
    item.classList.remove('active');
  });
  event.target.closest('.nav-item').classList.add('active');
  
  // Update header text
  const titles = {
    'dashboard': { title: 'Dashboard', subtitle: 'Welcome to your AI Influencer Platform' },
    'create': { title: 'Create Influencer', subtitle: 'Build your next AI personality' },
    'generate': { title: 'Generate Content', subtitle: 'Create engaging posts with Bella AI' },
    'analytics': { title: 'Analytics', subtitle: 'Track engagement and performance' },
    'settings': { title: 'Settings', subtitle: 'Configure your preferences' }
  };
  
  const titleData = titles[viewName];
  document.getElementById('page-title').textContent = titleData.title;
  document.getElementById('page-subtitle').textContent = titleData.subtitle;
}

// Create Influencer
async function createInfluencer(event) {
  event.preventDefault();
  
  const influencerData = {
    name: document.getElementById('inf-name').value,
    personality: document.getElementById('inf-personality').value,
    audience: document.getElementById('inf-audience').value,
    platform: document.getElementById('inf-platform').value,
    tone: document.getElementById('inf-tone').value
  };
  
  try {
    const response = await fetch(`${API_CONFIG.endpoint}/influencers/create`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(influencerData)
    });
    
    if (response.ok) {
      const result = await response.json();
      store.influencers.push(result);
      updateInfluencerSelects();
      updateDashboard();
      document.getElementById('influencer-form').reset();
      showNotification('Influencer created successfully!', 'success');
    }
  } catch (error) {
    console.error('Error creating influencer:', error);
    showNotification('Failed to create influencer', 'error');
  }
}

// Generate Content
async function generateContent(event) {
  event.preventDefault();
  
  const contentData = {
    influencerId: document.getElementById('content-influencer').value,
    topic: document.getElementById('content-topic').value,
    contentType: document.getElementById('content-type').value,
    variations: parseInt(document.getElementById('content-variations').value)
  };
  
  try {
    const response = await fetch(`${API_CONFIG.endpoint}/content/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(contentData)
    });
    
    if (response.ok) {
      const result = await response.json();
      displayGeneratedContent(result);
    }
  } catch (error) {
    console.error('Error generating content:', error);
    showNotification('Failed to generate content', 'error');
  }
}

// Display Generated Content
function displayGeneratedContent(content) {
  const container = document.getElementById('generated-content');
  let html = '<div style="margin-top: 2rem;">';
  
  if (content.variations && Array.isArray(content.variations)) {
    html += content.variations.map((variation, index) => `
      <div style="background: rgba(0,212,255,0.1); padding: 1rem; border-radius: 0.6rem; margin-bottom: 1rem;">
        <h4 style="color: #00d4ff; margin-bottom: 0.5rem;">Variation ${index + 1}</h4>
        <p>${variation}</p>
        <button class="btn btn-secondary" style="margin-top: 0.5rem; display: inline-block; width: auto;" onclick="copyToClipboard('${variation.replace(/'/g, "\\'")}')">Copy</button>
      </div>
    `).join('');
  }
  
  html += '</div>';
  container.innerHTML = html;
}

// Load Analytics
async function loadAnalytics(event) {
  event.preventDefault();
  
  const influencerId = document.getElementById('analytics-influencer').value;
  const timeRange = document.getElementById('analytics-range').value;
  
  try {
    const response = await fetch(`${API_CONFIG.endpoint}/analytics/influencer/summary?influencerId=${influencerId}&timeRange=${timeRange}`);
    
    if (response.ok) {
      const analytics = await response.json();
      displayAnalytics(analytics);
    }
  } catch (error) {
    console.error('Error loading analytics:', error);
    showNotification('Failed to load analytics', 'error');
  }
}

// Display Analytics
function displayAnalytics(analytics) {
  const container = document.getElementById('analytics-data');
  
  let html = `
    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem; margin-top: 1rem;">
      <div style="background: rgba(0,212,255,0.1); padding: 1rem; border-radius: 0.6rem;">
        <p style="color: #b0b5c9; font-size: 0.9rem; margin-bottom: 0.3rem;">Total Engagements</p>
        <p style="font-size: 1.8rem; color: #00d4ff; font-weight: bold;">${analytics.totalEngagements || 0}</p>
      </div>
      <div style="background: rgba(111,0,255,0.1); padding: 1rem; border-radius: 0.6rem;">
        <p style="color: #b0b5c9; font-size: 0.9rem; margin-bottom: 0.3rem;">Avg. Engagement Rate</p>
        <p style="font-size: 1.8rem; color: #6f00ff; font-weight: bold;">${(analytics.engagementRate || 0).toFixed(2)}%</p>
      </div>
      <div style="background: rgba(255,0,110,0.1); padding: 1rem; border-radius: 0.6rem;">
        <p style="color: #b0b5c9; font-size: 0.9rem; margin-bottom: 0.3rem;">Top Performer</p>
        <p style="font-size: 1.8rem; color: #ff006e; font-weight: bold;">${analytics.topContent || 'N/A'}</p>
      </div>
    </div>
  `;
  
  container.innerHTML = html;
}

// Load Influencers from API
async function loadInfluencersFromAPI() {
  try {
    const response = await fetch(`${API_CONFIG.endpoint}/influencers`);
    if (response.ok) {
      store.influencers = await response.json();
      updateInfluencerSelects();
      updateDashboard();
    }
  } catch (error) {
    console.error('Error loading influencers:', error);
  }
}

// Update Influencer Selects
function updateInfluencerSelects() {
  const selects = ['content-influencer', 'analytics-influencer'];
  
  selects.forEach(selectId => {
    const select = document.getElementById(selectId);
    const options = store.influencers.map(inf => 
      `<option value="${inf._id || inf.id}">${inf.name}</option>`
    ).join('');
    
    select.innerHTML = '<option value="">Choose an influencer...</option>' + options;
  });
}

// Update Dashboard
function updateDashboard() {
  document.getElementById('total-influencers').textContent = store.influencers.length;
  document.getElementById('total-content').textContent = store.contentItems.length;
  document.getElementById('total-engagement').textContent = (store.influencers.length * 100).toString();
  document.getElementById('avg-score').textContent = (Math.random() * 100).toFixed(1);
  
  // Display influencers
  const listContainer = document.getElementById('influencers-list');
  
  if (store.influencers.length === 0) {
    listContainer.innerHTML = '<p class="empty-state">No influencers created yet. Start by creating one!</p>';
    return;
  }
  
  listContainer.innerHTML = store.influencers.map(inf => `
    <div style="background: linear-gradient(135deg, rgba(0,212,255,0.1), rgba(111,0,255,0.1)); border: 1px solid #2a3456; border-radius: 0.8rem; padding: 1.5rem; text-align: center;">
      <div style="font-size: 2rem; margin-bottom: 0.5rem;">🤖</div>
      <h4 style="color: #00d4ff; margin-bottom: 0.3rem;">${inf.name}</h4>
      <p style="color: #b0b5c9; font-size: 0.9rem; margin-bottom: 1rem;">${inf.personality}</p>
      <p style="color: #6f00ff; font-size: 0.85rem;">${inf.platform}</p>
    </div>
  `).join('');
}

// Settings
function saveSettings() {
  const endpoint = document.getElementById('api-endpoint').value;
  const bellaKey = document.getElementById('bella-api-key').value;
  
  API_CONFIG.endpoint = endpoint;
  API_CONFIG.bellaKey = bellaKey;
  
  localStorage.setItem('aiInfluencerSettings', JSON.stringify(API_CONFIG));
  showNotification('Settings saved successfully!', 'success');
}

function loadSettings() {
  const saved = localStorage.getItem('aiInfluencerSettings');
  if (saved) {
    const settings = JSON.parse(saved);
    Object.assign(API_CONFIG, settings);
    document.getElementById('api-endpoint').value = API_CONFIG.endpoint;
  }
}

function toggleDarkMode() {
  document.body.classList.toggle('dark-mode');
  localStorage.setItem('darkMode', document.body.classList.contains('dark-mode'));
}

// Utility Functions
function showNotification(message, type = 'info') {
  const notification = document.createElement('div');
  notification.textContent = message;
  notification.style.cssText = `
    position: fixed;
    top: 2rem;
    right: 2rem;
    padding: 1rem 1.5rem;
    background: ${type === 'success' ? '#00ff88' : type === 'error' ? '#ff0055' : '#00d4ff'};
    color: #000;
    border-radius: 0.6rem;
    z-index: 1000;
    animation: slideIn 0.3s ease;
  `;
  
  document.body.appendChild(notification);
  
  setTimeout(() => notification.remove(), 3000);
}

function copyToClipboard(text) {
  navigator.clipboard.writeText(text).then(() => {
    showNotification('Copied to clipboard!', 'success');
  }).catch(err => {
    console.error('Failed to copy:', err);
  });
}

function toggleNotifications() {
  showNotification('🔔 You have no new notifications', 'info');
}

function toggleProfile() {
  showNotification('👤 Profile: Bella AI Administrator', 'info');
}

function attachEventListeners() {
  document.getElementById('influencer-form').addEventListener('submit', createInfluencer);
  document.getElementById('content-form').addEventListener('submit', generateContent);
  document.getElementById('analytics-form').addEventListener('submit', loadAnalytics);
}

// Initialize on page load
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initApp);
} else {
  initApp();
}
