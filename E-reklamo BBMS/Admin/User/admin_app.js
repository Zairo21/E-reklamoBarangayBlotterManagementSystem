// Admin App JavaScript
// Navigation
function goTo(page) {
  window.location.href = page;
}

// ===== ADMIN AUTHENTICATION =====
// Switch between login and signup
if (document.getElementById('showAdminSignup')) {
  document.getElementById('showAdminSignup').addEventListener('click', function(e) {
    e.preventDefault();
    document.getElementById('adminLoginForm').style.display = 'none';
    document.getElementById('adminSignupForm').style.display = 'block';
  });
}

if (document.getElementById('showAdminLogin')) {
  document.getElementById('showAdminLogin').addEventListener('click', function(e) {
    e.preventDefault();
    document.getElementById('adminSignupForm').style.display = 'none';
    document.getElementById('adminLoginForm').style.display = 'block';
  });
}

// Admin Login Handler
if (document.getElementById('adminLoginForm')) {
  document.getElementById('adminLoginForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const username = document.getElementById('adminUsername').value.trim();
    const password = document.getElementById('adminPassword').value;

    if (!username || !password) {
      alert('Please fill in all fields.');
      return;
    }

    const storedPassword = localStorage.getItem('admin_' + username);
    
    if (!storedPassword) {
      alert('Admin account not found. Please check your credentials or create an account.');
      return;
    }

    if (storedPassword !== password) {
      alert('Incorrect password. Please try again.');
      return;
    }

    localStorage.setItem('current_admin', username);
    alert('Login successful!');
    window.location.href = 'admin_dashboard.html';
  });
}

// Admin Signup Handler
if (document.getElementById('adminSignupForm')) {
  document.getElementById('adminSignupForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const username = document.getElementById('signupAdminUsername').value.trim();
    const email = document.getElementById('signupAdminEmail').value.trim();
    const phone = document.getElementById('signupAdminPhone').value.trim();
    const password = document.getElementById('signupAdminPassword').value;
    const confirmPassword = document.getElementById('signupAdminConfirmPassword').value;

    if (!username || !email || !phone || !password || !confirmPassword) {
      alert('Please fill in all fields.');
      return;
    }

    if (password.length < 8) {
      alert('Password must be at least 8 characters long.');
      return;
    }

    if (password !== confirmPassword) {
      alert('Passwords do not match.');
      return;
    }

    if (localStorage.getItem('admin_' + username)) {
      alert('Username already exists. Please choose a different username.');
      return;
    }

    localStorage.setItem('admin_' + username, password);
    localStorage.setItem('admin_email_' + username, email);
    localStorage.setItem('admin_phone_' + username, phone);
    localStorage.setItem('current_admin', username);
    
    // Initialize admin data
    localStorage.setItem('admin_blotters', JSON.stringify([]));
    
    alert('Admin account created successfully!');
    window.location.href = 'admin_dashboard.html';
  });
}

// ===== SHARED DATA STRUCTURE =====
// Get all blotters from all users + admin-created ones
function getAllBlotters() {
  const allBlotters = [];
  let caseNumber = 1;
  
  // Get user blotters
  const allKeys = Object.keys(localStorage);
  for (let key of allKeys) {
    if (key.startsWith('blotters_')) {
      const username = key.replace('blotters_', '');
      const userBlotters = JSON.parse(localStorage.getItem(key) || '[]');
      userBlotters.forEach(blotter => {
        allBlotters.push({
          ...blotter,
          caseNumber: caseNumber++,
          submittedBy: username,
          source: 'user'
        });
      });
    }
  }
  
  // Get admin-created blotters
  const adminBlotters = JSON.parse(localStorage.getItem('admin_blotters') || '[]');
  adminBlotters.forEach(blotter => {
    allBlotters.push({
      ...blotter,
      caseNumber: caseNumber++,
      source: 'admin'
    });
  });
  
  return allBlotters.sort((a, b) => new Date(b.dateSubmitted) - new Date(a.dateSubmitted));
}

// Update blotter status
function updateBlotterStatus(caseNumber, newStatus) {
  const allBlotters = getAllBlotters();
  const blotter = allBlotters.find(b => b.caseNumber === caseNumber);
  
  if (!blotter) return false;
  
  blotter.status = newStatus;
  blotter.lastUpdated = new Date().toLocaleString();
  
  // Save back to appropriate storage
  if (blotter.source === 'user') {
    const userBlotters = JSON.parse(localStorage.getItem('blotters_' + blotter.submittedBy) || '[]');
    const index = userBlotters.findIndex(b => 
      b.reporterName === blotter.reporterName && 
      b.dateSubmitted === blotter.dateSubmitted
    );
    if (index !== -1) {
      userBlotters[index].status = newStatus;
      userBlotters[index].lastUpdated = blotter.lastUpdated;
      localStorage.setItem('blotters_' + blotter.submittedBy, JSON.stringify(userBlotters));
      
      // Add notification for user
      const userNotifs = JSON.parse(localStorage.getItem('notifications') || '[]');
      userNotifs.unshift({
        text: `Your blotter (Case #${caseNumber}) status updated to: ${newStatus}`,
        date: new Date().toLocaleString()
      });
      localStorage.setItem('notifications', JSON.stringify(userNotifs));
    }
  } else {
    const adminBlotters = JSON.parse(localStorage.getItem('admin_blotters') || '[]');
    const index = adminBlotters.findIndex(b => 
      b.reporterName === blotter.reporterName && 
      b.dateSubmitted === blotter.dateSubmitted
    );
    if (index !== -1) {
      adminBlotters[index].status = newStatus;
      adminBlotters[index].lastUpdated = blotter.lastUpdated;
      localStorage.setItem('admin_blotters', JSON.stringify(adminBlotters));
    }
  }
  
  // Add admin notification
  const adminNotifs = JSON.parse(localStorage.getItem('admin_notifications') || '[]');
  adminNotifs.unshift({
    text: `Case #${caseNumber} status updated to: ${newStatus}`,
    date: new Date().toLocaleString()
  });
  localStorage.setItem('admin_notifications', JSON.stringify(adminNotifs));
  
  return true;
}

// ===== DARK MODE =====
function initDarkMode() {
  const darkMode = localStorage.getItem('admin_darkMode') === 'true';
  if (darkMode) {
    document.body.classList.add('dark-mode');
  }
  
  const darkModeToggle = document.getElementById('darkModeToggle');
  if (darkModeToggle) {
    darkModeToggle.checked = darkMode;
    darkModeToggle.addEventListener('change', function() {
      if (this.checked) {
        document.body.classList.add('dark-mode');
        localStorage.setItem('admin_darkMode', 'true');
      } else {
        document.body.classList.remove('dark-mode');
        localStorage.setItem('admin_darkMode', 'false');
      }
    });
  }
}

initDarkMode();

// ===== MAIN DASHBOARD =====
document.addEventListener('DOMContentLoaded', () => {
  const admin = localStorage.getItem('current_admin');
  
  // Redirect if not logged in
  if (!admin && !window.location.href.includes('admin_auth.html')) {
    window.location.href = 'admin_auth.html';
    return;
  }
  
  // Set admin name
  if (document.getElementById('adminUserName')) {
    document.getElementById('adminUserName').textContent = admin;
  }
  if (document.getElementById('adminName')) {
    document.getElementById('adminName').textContent = admin;
  }
  
  // Load profile picture
  const profilePic = localStorage.getItem('admin_profilePic_' + admin);
  if (profilePic && document.getElementById('adminProfilePic')) {
    document.getElementById('adminProfilePic').src = profilePic;
  }
  
  // Dashboard stats
  if (document.getElementById('totalBlotters')) {
    const allBlotters = getAllBlotters();
    document.getElementById('totalBlotters').textContent = allBlotters.length;
    document.getElementById('pendingBlotters').textContent = 
      allBlotters.filter(b => b.status === 'Pending').length;
    document.getElementById('ongoingBlotters').textContent = 
      allBlotters.filter(b => b.status === 'Ongoing').length;
    document.getElementById('resolvedBlotters').textContent = 
      allBlotters.filter(b => b.status === 'Resolved').length;
    
    renderBlotterTable(allBlotters);
  }
  
  // Notifications count
  const adminNotifs = JSON.parse(localStorage.getItem('admin_notifications') || '[]');
  if (document.getElementById('notifCount') && adminNotifs.length > 0) {
    document.getElementById('notifCount').textContent = adminNotifs.length;
    document.getElementById('notifCount').style.display = 'block';
    document.getElementById('notifDot').style.display = 'block';
  }
  
  // Search functionality
  if (document.getElementById('searchBtn')) {
    document.getElementById('searchBtn').onclick = performSearch;
    document.getElementById('searchBar').onkeypress = (e) => {
      if (e.key === 'Enter') performSearch();
    };
  }
  
  // Filter functionality
  if (document.getElementById('applyFilter')) {
    document.getElementById('applyFilter').onclick = applyFilter;
  }
  
  if (document.getElementById('clearFilter')) {
    document.getElementById('clearFilter').onclick = () => {
      document.getElementById('filterStatus').value = 'all';
      document.getElementById('searchBar').value = '';
      renderBlotterTable(getAllBlotters());
    };
  }
  
  // Export CSV
  if (document.getElementById('exportCSV')) {
    document.getElementById('exportCSV').onclick = exportToCSV;
  }
  
  // Export PDF
  if (document.getElementById('exportPDF')) {
    document.getElementById('exportPDF').onclick = exportToPDF;
  }
  
  // Logout
  if (document.getElementById('logoutBtn')) {
    document.getElementById('logoutBtn').onclick = () => {
      if (confirm('Are you sure you want to log out?')) {
        localStorage.removeItem('current_admin');
        window.location.href = 'admin_auth.html';
      }
    };
  }
  
  // Profile picture upload
  if (document.getElementById('uploadAdminPic')) {
    document.getElementById('uploadAdminPic').onchange = function(e) {
      const file = e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = function(ev) {
        document.getElementById('adminProfilePicLarge').src = ev.target.result;
        localStorage.setItem('admin_profilePic_' + admin, ev.target.result);
      };
      reader.readAsDataURL(file);
    };
  }
  
  // Settings - Change password
  if (document.getElementById('saveAdminSettings')) {
    document.getElementById('saveAdminSettings').onclick = () => {
      const newPass = document.getElementById('newAdminPassword').value;
      if (newPass && newPass.length < 8) {
        alert('Password must be at least 8 characters.');
        return;
      }
      if (newPass) {
        localStorage.setItem('admin_' + admin, newPass);
        alert('Password changed successfully!');
        document.getElementById('newAdminPassword').value = '';
      } else {
        alert('Settings saved!');
      }
    };
  }
  
  // Notifications list
  if (document.getElementById('adminNotifList')) {
    const notifList = document.getElementById('adminNotifList');
    if (adminNotifs.length === 0) {
      notifList.innerHTML = '<li class="empty-notif">No notifications yet</li>';
    } else {
      notifList.innerHTML = adminNotifs.map(n => `
        <li>
          <div class="notif-text">${n.text}</div>
          <div class="notif-date">${n.date}</div>
        </li>
      `).join('');
    }
  }
  
  // History page
  if (document.getElementById('historyContainer')) {
    renderHistory();
  }
  
  // New blotter form
  if (document.getElementById('submitAdminBlotter')) {
    document.getElementById('submitAdminBlotter').onclick = submitAdminBlotter;
  }
  
  // Handle incident type change
  if (document.getElementById('adminIncidentType')) {
    document.getElementById('adminIncidentType').onchange = function() {
      const otherLabel = document.getElementById('adminOtherTypeLabel');
      const otherInput = document.getElementById('adminOtherType');
      if (this.value === 'Other') {
        otherLabel.style.display = 'block';
        otherInput.required = true;
      } else {
        otherLabel.style.display = 'none';
        otherInput.required = false;
        otherInput.value = '';
      }
    };
  }
});

// Render blotter table
function renderBlotterTable(blotters) {
  const tbody = document.getElementById('blotterTableBody');
  if (!tbody) return;
  
  if (blotters.length === 0) {
    tbody.innerHTML = `
      <tr class="empty-row">
        <td colspan="8">
          <div class="empty-state">
            <div class="empty-icon">📋</div>
            <p>No blotter reports found</p>
          </div>
        </td>
      </tr>
    `;
    return;
  }
  
  tbody.innerHTML = blotters.map(b => `
    <tr>
      <td><strong>#${b.caseNumber}</strong></td>
      <td>${b.reporterName || 'N/A'}</td>
      <td>${b.respondent || 'N/A'}</td>
      <td>${b.incidentType || 'N/A'}</td>
      <td>${b.location || 'N/A'}</td>
      <td><span class="status-badge status-${(b.status || 'pending').toLowerCase()}">${b.status || 'Pending'}</span></td>
      <td>${b.dateSubmitted || 'N/A'}</td>
      <td>
        <button class="btn-action view" onclick="viewBlotter(${b.caseNumber})">View</button>
        <button class="btn-action edit" onclick="editBlotter(${b.caseNumber})">Edit</button>
      </td>
    </tr>
  `).join('');
}

// Search functionality
function performSearch() {
  const searchTerm = document.getElementById('searchBar').value.toLowerCase().trim();
  if (!searchTerm) {
    renderBlotterTable(getAllBlotters());
    return;
  }
  
  const allBlotters = getAllBlotters();
  const filtered = allBlotters.filter(b => 
    b.caseNumber.toString().includes(searchTerm) ||
    (b.reporterName && b.reporterName.toLowerCase().includes(searchTerm)) ||
    (b.respondent && b.respondent.toLowerCase().includes(searchTerm)) ||
    (b.status && b.status.toLowerCase().includes(searchTerm))
  );
  
  renderBlotterTable(filtered);
}

// Apply filter
function applyFilter() {
  const status = document.getElementById('filterStatus').value;
  const allBlotters = getAllBlotters();
  
  if (status === 'all') {
    renderBlotterTable(allBlotters);
  } else {
    const filtered = allBlotters.filter(b => b.status === status);
    renderBlotterTable(filtered);
  }
}

// View blotter details
window.viewBlotter = function(caseNumber) {
  const allBlotters = getAllBlotters();
  const blotter = allBlotters.find(b => b.caseNumber === caseNumber);
  if (!blotter) return;
  
  const modalBody = document.getElementById('modalBody');
  modalBody.innerHTML = `
    <div class="detail-section">
      <h4>Case Information</h4>
      <div class="detail-grid">
        <div class="detail-item">
          <span class="detail-label">Case Number</span>
          <span class="detail-value">#${blotter.caseNumber}</span>
        </div>
        <div class="detail-item">
          <span class="detail-label">Status</span>
          <span class="status-badge status-${(blotter.status || 'pending').toLowerCase()}">${blotter.status || 'Pending'}</span>
        </div>
        <div class="detail-item">
          <span class="detail-label">Date Submitted</span>
          <span class="detail-value">${blotter.dateSubmitted || 'N/A'}</span>
        </div>
        <div class="detail-item">
          <span class="detail-label">Last Updated</span>
          <span class="detail-value">${blotter.lastUpdated || 'N/A'}</span>
        </div>
      </div>
    </div>
    
    <div class="detail-section">
      <h4>Reporter Information</h4>
      <div class="detail-grid">
        <div class="detail-item">
          <span class="detail-label">Name</span>
          <span class="detail-value">${blotter.reporterName || 'N/A'}</span>
        </div>
        <div class="detail-item">
          <span class="detail-label">Contact</span>
          <span class="detail-value">${blotter.contactNumber || 'N/A'}</span>
        </div>
      </div>
    </div>
    
    <div class="detail-section">
      <h4>Incident Details</h4>
      <div class="detail-grid">
        <div class="detail-item">
          <span class="detail-label">Respondent</span>
          <span class="detail-value">${blotter.respondent || 'N/A'}</span>
        </div>
        <div class="detail-item">
          <span class="detail-label">Location</span>
          <span class="detail-value">${blotter.location || 'N/A'}</span>
        </div>
        <div class="detail-item">
          <span class="detail-label">Type</span>
          <span class="detail-value">${blotter.incidentType || 'N/A'}</span>
        </div>
      </div>
      
      <div class="detail-item" style="margin-top: 16px;">
        <span class="detail-label">Narrative</span>
        <div class="narrative-text">${blotter.narrative || 'No description'}</div>
      </div>
    </div>
    
    ${blotter.evidence ? `
      <div class="detail-section">
        <h4>Evidence</h4>
        <img src="${blotter.evidence}" alt="Evidence" class="evidence-image">
      </div>
    ` : ''}
    
    <div class="detail-section">
      <h4>Update Status</h4>
      <select id="statusUpdate" class="status-select">
        <option value="Pending" ${blotter.status === 'Pending' ? 'selected' : ''}>Pending</option>
        <option value="Ongoing" ${blotter.status === 'Ongoing' ? 'selected' : ''}>Ongoing</option>
        <option value="Resolved" ${blotter.status === 'Resolved' ? 'selected' : ''}>Resolved</option>
      </select>
      <button class="btn-update-status" onclick="saveStatusUpdate(${caseNumber})">Update Status</button>
    </div>
  `;
  
  document.getElementById('modalTitle').textContent = `Case #${caseNumber} - Details`;
  document.getElementById('blotterModal').style.display = 'flex';
};

// Edit blotter
window.editBlotter = function(caseNumber) {
  const allBlotters = getAllBlotters();
  const blotter = allBlotters.find(b => b.caseNumber === caseNumber);
  if (!blotter) return;
  
  const modalBody = document.getElementById('modalBody');
  modalBody.innerHTML = `
    <form id="editBlotterForm" class="edit-form">
      <div class="form-group">
        <label>Reporter Name</label>
        <input type="text" id="editReporterName" value="${blotter.reporterName || ''}" required>
      </div>
      
      <div class="form-group">
        <label>Contact Number</label>
        <input type="tel" id="editContactNumber" value="${blotter.contactNumber || ''}" required>
      </div>
      
      <div class="form-group">
        <label>Respondent</label>
        <input type="text" id="editRespondent" value="${blotter.respondent || ''}" required>
      </div>
      
      <div class="form-group">
        <label>Location</label>
        <input type="text" id="editLocation" value="${blotter.location || ''}" required>
      </div>
      
      <div class="form-group">
        <label>Incident Type</label>
        <input type="text" id="editIncidentType" value="${blotter.incidentType || ''}" required>
      </div>
      
      <div class="form-group">
        <label>Narrative</label>
        <textarea id="editNarrative" rows="5" required>${blotter.narrative || ''}</textarea>
      </div>
      
      <div class="form-group">
        <label>Status</label>
        <select id="editStatus">
          <option value="Pending" ${blotter.status === 'Pending' ? 'selected' : ''}>Pending</option>
          <option value="Ongoing" ${blotter.status === 'Ongoing' ? 'selected' : ''}>Ongoing</option>
          <option value="Resolved" ${blotter.status === 'Resolved' ? 'selected' : ''}>Resolved</option>
        </select>
      </div>
      
      <div class="modal-actions">
        <button type="button" class="btn-save" onclick="saveBlotterEdit(${caseNumber})">Save Changes</button>
        <button type="button" class="btn-cancel" onclick="closeModal()">Cancel</button>
      </div>
    </form>
  `;
  
  document.getElementById('modalTitle').textContent = `Edit Case #${caseNumber}`;
  document.getElementById('blotterModal').style.display = 'flex';
};

// Save status update
window.saveStatusUpdate = function(caseNumber) {
  const newStatus = document.getElementById('statusUpdate').value;
  if (updateBlotterStatus(caseNumber, newStatus)) {
    alert('Status updated successfully!');
    closeModal();
    location.reload();
  } else {
    alert('Failed to update status.');
  }
};

// Save blotter edit
window.saveBlotterEdit = function(caseNumber) {
  const allBlotters = getAllBlotters();
  const blotter = allBlotters.find(b => b.caseNumber === caseNumber);
  if (!blotter) return;
  
  blotter.reporterName = document.getElementById('editReporterName').value.trim();
  blotter.contactNumber = document.getElementById('editContactNumber').value.trim();
  blotter.respondent = document.getElementById('editRespondent').value.trim();
  blotter.location = document.getElementById('editLocation').value.trim();
  blotter.incidentType = document.getElementById('editIncidentType').value.trim();
  blotter.narrative = document.getElementById('editNarrative').value.trim();
  const newStatus = document.getElementById('editStatus').value;
  
  // Save back
  if (blotter.source === 'user') {
    const userBlotters = JSON.parse(localStorage.getItem('blotters_' + blotter.submittedBy) || '[]');
    const index = userBlotters.findIndex(b => 
      b.dateSubmitted === blotter.dateSubmitted
    );
    if (index !== -1) {
      userBlotters[index] = { ...blotter };
      delete userBlotters[index].caseNumber;
      delete userBlotters[index].source;
      delete userBlotters[index].submittedBy;
      localStorage.setItem('blotters_' + blotter.submittedBy, JSON.stringify(userBlotters));
    }
  } else {
    const adminBlotters = JSON.parse(localStorage.getItem('admin_blotters') || '[]');
    const index = adminBlotters.findIndex(b => 
      b.dateSubmitted === blotter.dateSubmitted
    );
    if (index !== -1) {
      adminBlotters[index] = { ...blotter };
      delete adminBlotters[index].caseNumber;
      delete adminBlotters[index].source;
      localStorage.setItem('admin_blotters', JSON.stringify(adminBlotters));
    }
  }
  
  if (newStatus !== blotter.status) {
    updateBlotterStatus(caseNumber, newStatus);
  }
  
  alert('Blotter updated successfully!');
  closeModal();
  location.reload();
};

// Close modal
window.closeModal = function() {
  document.getElementById('blotterModal').style.display = 'none';
};

if (document.getElementById('closeModal')) {
  document.getElementById('closeModal').onclick = closeModal;
}

// Close modal on outside click
window.onclick = function(event) {
  if (event.target.classList.contains('modal')) {
    event.target.style.display = 'none';
  }
};

// Export to CSV
function exportToCSV() {
  const blotters = getAllBlotters();
  if (blotters.length === 0) {
    alert('No data to export');
    return;
  }
  
  const headers = ['Case #', 'Reporter Name', 'Contact', 'Respondent', 'Location', 'Incident Type', 'Status', 'Date Submitted', 'Narrative'];
  const rows = blotters.map(b => [
    b.caseNumber,
    b.reporterName || '',
    b.contactNumber || '',
    b.respondent || '',
    b.location || '',
    b.incidentType || '',
    b.status || 'Pending',
    b.dateSubmitted || '',
    (b.narrative || '').replace(/"/g, '""')
  ]);
  
  let csv = headers.join(',') + '\n';
  rows.forEach(row => {
    csv += row.map(cell => `"${cell}"`).join(',') + '\n';
  });
  
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `blotter_reports_${new Date().toISOString().split('T')[0]}.csv`;
  a.click();
  window.URL.revokeObjectURL(url);
  
  alert('CSV file downloaded successfully!');
}

// Export to PDF (simple text-based PDF)
function exportToPDF() {
  const blotters = getAllBlotters();
  if (blotters.length === 0) {
    alert('No data to export');
    return;
  }
  
  let content = `BARANGAY BLOTTER MANAGEMENT SYSTEM\nBLOTTER REPORTS\n\nGenerated: ${new Date().toLocaleString()}\n\n`;
  content += `Total Reports: ${blotters.length}\n`;
  content += `Pending: ${blotters.filter(b => b.status === 'Pending').length}\n`;
  content += `Ongoing: ${blotters.filter(b => b.status === 'Ongoing').length}\n`;
  content += `Resolved: ${blotters.filter(b => b.status === 'Resolved').length}\n\n`;
  content += '='.repeat(80) + '\n\n';
  
  blotters.forEach(b => {
    content += `CASE #${b.caseNumber}\n`;
    content += `-`.repeat(40) + '\n';
    content += `Reporter: ${b.reporterName || 'N/A'}\n`;
    content += `Contact: ${b.contactNumber || 'N/A'}\n`;
    content += `Respondent: ${b.respondent || 'N/A'}\n`;
    content += `Location: ${b.location || 'N/A'}\n`;
    content += `Incident Type: ${b.incidentType || 'N/A'}\n`;
    content += `Status: ${b.status || 'Pending'}\n`;
    content += `Date Submitted: ${b.dateSubmitted || 'N/A'}\n`;
    content += `Narrative: ${b.narrative || 'No description'}\n`;
    content += '\n' + '='.repeat(80) + '\n\n';
  });
  
  const blob = new Blob([content], { type: 'text/plain' });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `blotter_reports_${new Date().toISOString().split('T')[0]}.txt`;
  a.click();
  window.URL.revokeObjectURL(url);
  
  alert('Report downloaded successfully! (Note: For proper PDF format, use a PDF library)');
}

// Submit admin-created blotter
function submitAdminBlotter() {
  const reporterName = document.getElementById('adminReporterName').value.trim();
  const contactNumber = document.getElementById('adminContactNumber').value.trim();
  const respondent = document.getElementById('adminRespondent').value.trim();
  const location = document.getElementById('adminIncidentLocation').value.trim();
  const incidentType = document.getElementById('adminIncidentType').value;
  const otherType = document.getElementById('adminOtherType').value.trim();
  const narrative = document.getElementById('adminNarrative').value.trim();
  
  if (!reporterName || !contactNumber || !respondent || !location || !incidentType || !narrative) {
    alert('Please fill all required fields.');
    return;
  }
  
  if (incidentType === 'Other' && !otherType) {
    alert('Please specify the incident type.');
    return;
  }
  
  const finalIncidentType = incidentType === 'Other' ? otherType : incidentType;
  
  const newBlotter = {
    reporterName,
    contactNumber,
    respondent,
    location,
    incidentType: finalIncidentType,
    narrative,
    status: 'Pending',
    dateSubmitted: new Date().toLocaleString(),
    createdBy: localStorage.getItem('current_admin')
  };
  
  const adminBlotters = JSON.parse(localStorage.getItem('admin_blotters') || '[]');
  adminBlotters.push(newBlotter);
  localStorage.setItem('admin_blotters', JSON.stringify(adminBlotters));
  
  // Add notification
  const adminNotifs = JSON.parse(localStorage.getItem('admin_notifications') || '[]');
  adminNotifs.unshift({
    text: `New blotter created for walk-in client: ${reporterName}`,
    date: new Date().toLocaleString()
  });
  localStorage.setItem('admin_notifications', JSON.stringify(adminNotifs));
  
  alert('Blotter created successfully!');
  window.location.href = 'admin_dashboard.html';
}

// Render history
function renderHistory() {
  const allBlotters = getAllBlotters();
  const container = document.getElementById('historyContainer');
  
  if (allBlotters.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">📚</div>
        <h3>No History</h3>
        <p>No blotter reports in history yet</p>
      </div>
    `;
    return;
  }
  
  container.innerHTML = allBlotters.map(b => `
    <div class="history-card">
      <div class="history-header">
        <h3>Case #${b.caseNumber}</h3>
        <span class="status-badge status-${(b.status || 'pending').toLowerCase()}">${b.status || 'Pending'}</span>
      </div>
      <div class="history-info">
        <div class="info-row">
          <span class="label">Reporter:</span>
          <span>${b.reporterName || 'N/A'}</span>
        </div>
        <div class="info-row">
          <span class="label">Respondent:</span>
          <span>${b.respondent || 'N/A'}</span>
        </div>
        <div class="info-row">
          <span class="label">Type:</span>
          <span>${b.incidentType || 'N/A'}</span>
        </div>
        <div class="info-row">
          <span class="label">Date:</span>
          <span>${b.dateSubmitted || 'N/A'}</span>
        </div>
      </div>
      <div class="history-actions">
        <button class="btn-action view" onclick="viewBlotter(${b.caseNumber})">View Details</button>
      </div>
    </div>
  `).join('');
}

// Load profile data
    document.addEventListener('DOMContentLoaded', () => {
      const admin = localStorage.getItem('current_admin');
      if (admin) {
        document.getElementById('displayUsername').value = admin;
        document.getElementById('adminUserName').textContent = admin;
        
        const email = localStorage.getItem('admin_email_' + admin);
        const phone = localStorage.getItem('admin_phone_' + admin);
        
        if (email) {
          document.getElementById('adminEmail').textContent = email;
          document.getElementById('adminEmailInput').value = email;
        }
        if (phone) {
          document.getElementById('adminPhoneInput').value = phone;
        }

        const profilePic = localStorage.getItem('admin_profilePic_' + admin);
        if (profilePic) {
          document.getElementById('adminProfilePicLarge').src = profilePic;
        }
      }

      // Save profile changes
      if (document.getElementById('saveProfileBtn')) {
        document.getElementById('saveProfileBtn').onclick = () => {
          const email = document.getElementById('adminEmailInput').value.trim();
          const phone = document.getElementById('adminPhoneInput').value.trim();
          
          if (email) {
            localStorage.setItem('admin_email_' + admin, email);
            document.getElementById('adminEmail').textContent = email;
          }
          if (phone) {
            localStorage.setItem('admin_phone_' + admin, phone);
          }
          
          alert('Profile updated successfully!');
        };
      }
    });