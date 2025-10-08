// Utility navigation
function goTo(page) {
  window.location.href = page;
}

// ===== AUTHENTICATION HANDLERS =====
// Add this code at the very beginning of your user_app.js file

// ===== AUTHENTICATION HANDLERS =====
// Replace the authentication section at the top of your user_app.js with this code

// Switch between login and signup forms
if (document.getElementById('showSignup')) {
  document.getElementById('showSignup').addEventListener('click', function(e) {
    e.preventDefault();
    document.getElementById('loginForm').style.display = 'none';
    document.getElementById('signupForm').style.display = 'block';
  });
}

if (document.getElementById('showLogin')) {
  document.getElementById('showLogin').addEventListener('click', function(e) {
    e.preventDefault();
    document.getElementById('signupForm').style.display = 'none';
    document.getElementById('loginForm').style.display = 'block';
  });
}

// Settings
  if (document.getElementById("saveSettings")) {
    document.getElementById("saveSettings").onclick = () => {
      const newPass = document.getElementById("newPassword").value;
      if (newPass && newPass.length < 8) return alert("Password must be at least 8 characters.");
      if (newPass) {
        localStorage.setItem("user_" + user, newPass);
        alert("Password changed!");
      }
      alert("Settings saved!");
    };
  }

  // Logout Handler
  if (document.getElementById("logoutBtn")) {
    document.getElementById("logoutBtn").onclick = () => {
      if (confirm("Are you sure you want to log out?")) {
        localStorage.removeItem("current_user");
        alert("You have been logged out successfully.");
        window.location.href = "user_auth.html";
      }
    };
  }

// Login Handler - Allow login with username OR phone number
if (document.getElementById('loginForm')) {
  document.getElementById('loginForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const usernameOrPhone = document.getElementById('loginUsername').value.trim();
    const password = document.getElementById('loginPassword').value;

    if (!usernameOrPhone || !password) {
      alert('Please fill in all fields.');
      return;
    }

    // Try to find user by username first
    let storedPassword = localStorage.getItem('user_' + usernameOrPhone);
    let foundUsername = usernameOrPhone;
    
    // If not found by username, try to find by phone number
    if (!storedPassword) {
      // Get all users and check phone numbers
      const allKeys = Object.keys(localStorage);
      let found = false;
      
      for (let key of allKeys) {
        if (key.startsWith('phone_')) {
          const username = key.replace('phone_', '');
          const storedPhone = localStorage.getItem(key);
          
          if (storedPhone === usernameOrPhone) {
            storedPassword = localStorage.getItem('user_' + username);
            foundUsername = username;
            found = true;
            break;
          }
        }
      }
      
      if (!found) {
        alert('User not found. Please check your username/phone number or sign up first.');
        return;
      }
    }

    if (storedPassword !== password) {
      alert('Incorrect password. Please try again.');
      return;
    }

    // Login successful
    localStorage.setItem('current_user', foundUsername);
    alert('Login successful!');
    window.location.href = 'user_dashboard.html';
  });
}

// Signup Handler - Now includes phone number
if (document.getElementById('signupForm')) {
  document.getElementById('signupForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const username = document.getElementById('signupUsername').value.trim();
    const phone = document.getElementById('signupPhone').value.trim();
    const password = document.getElementById('signupPassword').value;
    const confirmPassword = document.getElementById('signupConfirmPassword').value;

    if (!username || !phone || !password || !confirmPassword) {
      alert('Please fill in all fields.');
      return;
    }

    if (password.length < 8) {
      alert('Password must be at least 8 characters long.');
      return;
    }

    if (password !== confirmPassword) {
      alert('Passwords do not match. Please try again.');
      return;
    }

    // Check if username already exists
    if (localStorage.getItem('user_' + username)) {
      alert('Username already exists. Please choose a different username.');
      return;
    }

    // Check if phone number already exists
    const allKeys = Object.keys(localStorage);
    for (let key of allKeys) {
      if (key.startsWith('phone_')) {
        const storedPhone = localStorage.getItem(key);
        if (storedPhone === phone) {
          alert('Phone number already registered. Please use a different phone number or log in.');
          return;
        }
      }
    }

    // Create new user
    localStorage.setItem('user_' + username, password);
    localStorage.setItem('phone_' + username, phone);
    localStorage.setItem('current_user', username);
    
    // Initialize empty data for new user
    localStorage.setItem('blotters_' + username, '[]');
    
    alert('Account created successfully!');
    window.location.href = 'user_dashboard.html';
  });
}

// ===== REST OF YOUR EXISTING CODE BELOW =====

// ===== REST OF YOUR EXISTING CODE BELOW =====

// Dark Mode Handler
function initDarkMode() {
  const darkMode = localStorage.getItem('darkMode') === 'true';
  if (darkMode) {
    document.body.classList.add('dark-mode');
  }
  
  // Set toggle state if on settings page
  const darkModeToggle = document.getElementById('darkModeToggle');
  if (darkModeToggle) {
    darkModeToggle.checked = darkMode;
    
    darkModeToggle.addEventListener('change', function() {
      if (this.checked) {
        document.body.classList.add('dark-mode');
        localStorage.setItem('darkMode', 'true');
      } else {
        document.body.classList.remove('dark-mode');
        localStorage.setItem('darkMode', 'false');
      }
    });
  }
}

// Initialize dark mode on page load
initDarkMode();

// Show username and profile info
document.addEventListener("DOMContentLoaded", () => {
  let user = localStorage.getItem("current_user") || "User";
  
  // Set username in all places
  if (document.getElementById("userName")) {
    document.getElementById("userName").textContent = user;
  }
  if (document.getElementById("profileName")) {
    document.getElementById("profileName").textContent = user;
    if (document.getElementById("profileUsername")) {
      document.getElementById("profileUsername").textContent = "@" + user;
    }
  }

  // Show contact info (read-only, if present)
  if (document.getElementById("profileContact")) {
    document.getElementById("profileContact").textContent =
      localStorage.getItem("contact_" + user) || "Not set";
  }
  if (document.getElementById("profileEmail")) {
    document.getElementById("profileEmail").textContent =
      localStorage.getItem("email_" + user) || "Not set";
  }

  // Edit Contact Number
  if (document.getElementById("editContactBtn")) {
    document.getElementById("editContactBtn").onclick = function () {
      document.getElementById("editContactForm").style.display = "block";
      document.getElementById("editContactDiv").style.display = "flex";
      document.getElementById("editEmailDiv").style.display = "none";
      document.getElementById("editContact").value =
        localStorage.getItem("contact_" + user) || "";
    };
  }
  if (document.getElementById("saveContactBtn")) {
    document.getElementById("saveContactBtn").onclick = function () {
      const contact = document.getElementById("editContact").value.trim();
      if (!contact) {
        alert("Please enter a contact number.");
        return;
      }
      localStorage.setItem("contact_" + user, contact);
      document.getElementById("profileContact").textContent = contact;
      document.getElementById("editContactForm").style.display = "none";
    };
  }
  if (document.getElementById("cancelContactBtn")) {
    document.getElementById("cancelContactBtn").onclick = function () {
      document.getElementById("editContactForm").style.display = "none";
    };
  }

  // Edit Email
  if (document.getElementById("editEmailBtn")) {
    document.getElementById("editEmailBtn").onclick = function () {
      document.getElementById("editContactForm").style.display = "block";
      document.getElementById("editEmailDiv").style.display = "flex";
      document.getElementById("editContactDiv").style.display = "none";
      document.getElementById("editEmail").value =
        localStorage.getItem("email_" + user) || "";
    };
  }
  if (document.getElementById("saveEmailBtn")) {
    document.getElementById("saveEmailBtn").onclick = function () {
      const email = document.getElementById("editEmail").value.trim();
      if (!email) {
        alert("Please enter an email.");
        return;
      }
      localStorage.setItem("email_" + user, email);
      document.getElementById("profileEmail").textContent = email;
      document.getElementById("editContactForm").style.display = "none";
    };
  }
  if (document.getElementById("cancelEmailBtn")) {
    document.getElementById("cancelEmailBtn").onclick = function () {
      document.getElementById("editContactForm").style.display = "none";
    };
  }

  // Notifications
  const notifications = JSON.parse(localStorage.getItem("notifications") || "[]");
  if (document.getElementById("notifList")) {
    document.getElementById("notifList").innerHTML = notifications.length
      ? notifications.map(n => `<li>${n.text}</li>`).join("")
      : "<li>No notifications.</li>";
  }
  if (document.getElementById("notifDot")) {
    document.getElementById("notifDot").style.display = notifications.length ? "block" : "none";
  }
  
  // Dashboard Recent Updates - Enhanced version
  if (document.getElementById("recentUpdates")) {
    const recentUpdatesEl = document.getElementById("recentUpdates");
    
    if (notifications.length === 0) {
      recentUpdatesEl.innerHTML = `
        <li class="empty-updates">
          <div class="empty-updates-icon">📭</div>
          <p>No recent updates</p>
        </li>
      `;
    } else {
      recentUpdatesEl.innerHTML = notifications.slice(0, 3)
        .map(n => `<li>${n.text}</li>`).join("");
    }
  }

  // Dashboard Stats
  const blotters = JSON.parse(localStorage.getItem("blotters_" + user) || "[]");
  
  if (document.getElementById("totalReports")) {
    document.getElementById("totalReports").textContent = blotters.length;
  }
  
  if (document.getElementById("pendingReports")) {
    const pending = blotters.filter(b => (b.status || "Pending") === "Pending").length;
    document.getElementById("pendingReports").textContent = pending;
  }
  
  if (document.getElementById("resolvedReports")) {
    const resolved = blotters.filter(b => b.status === "Resolved").length;
    document.getElementById("resolvedReports").textContent = resolved;
  }

  // Blotter list (for other pages)
  if (document.getElementById("blotterList")) {
    document.getElementById("blotterList").innerHTML = blotters.length
      ? blotters.map((b, i) => `<li>
        <strong>${b.incidentType || b.subject || "Incident Report"}</strong><br>
        <span><strong>Reporter:</strong> ${b.reporterName || "N/A"}</span><br>
        <span><strong>Respondent:</strong> ${b.respondent || "N/A"}</span><br>
        <span><strong>Location:</strong> ${b.location || "N/A"}</span><br>
        <span>${b.narrative || b.desc || ""}</span><br>
        <small>Status: ${b.status || "Pending"}</small>
      </li>`).join("")
      : "<li>No blotters filed yet.</li>";
  }

  // Render blotter cards in user_blotter.html
  if (document.getElementById("blotterContainer")) {
    renderBlotterCards();
  }

  function renderBlotterCards() {
    const container = document.getElementById("blotterContainer");
    const blotters = JSON.parse(localStorage.getItem("blotters_" + user) || "[]");
    
    if (blotters.length === 0) {
      container.innerHTML = `
        <div class="empty-state">
          <div class="empty-state-icon">📋</div>
          <h3>No Reports Yet</h3>
          <p>You haven't filed any incident reports yet.</p>
          <a href="user_blotter_new.html" class="btn-new-report">File Your First Report</a>
        </div>
      `;
      return;
    }
    
    container.innerHTML = blotters.map((b, i) => `
      <div class="blotter-card">
        <div class="blotter-header">
          <h3 class="blotter-type">${b.incidentType || "Incident Report"}</h3>
          <span class="blotter-status status-${(b.status || "pending").toLowerCase()}">${b.status || "Pending"}</span>
        </div>
        
        <div class="blotter-info">
          <div class="info-item">
            <span class="info-label">Reporter</span>
            <span class="info-value">${b.reporterName || "N/A"}</span>
          </div>
          <div class="info-item">
            <span class="info-label">Contact</span>
            <span class="info-value">${b.contactNumber || "N/A"}</span>
          </div>
          <div class="info-item">
            <span class="info-label">Respondent</span>
            <span class="info-value">${b.respondent || "N/A"}</span>
          </div>
          <div class="info-item">
            <span class="info-label">Location</span>
            <span class="info-value">${b.location || "N/A"}</span>
          </div>
        </div>
        
        <div class="blotter-narrative">
          <strong>Narrative:</strong><br>
          ${(b.narrative || "No description").substring(0, 150)}${(b.narrative || "").length > 150 ? "..." : ""}
        </div>
        
        <div class="blotter-actions">
          <button class="btn-view" onclick="viewBlotter(${i})">View Details</button>
          <button class="btn-edit" onclick="editBlotter(${i})">Edit</button>
          <button class="btn-delete" onclick="deleteBlotter(${i})">Delete</button>
        </div>
      </div>
    `).join("");
  }

  // View blotter details
  window.viewBlotter = function(index) {
    const blotters = JSON.parse(localStorage.getItem("blotters_" + user) || "[]");
    const b = blotters[index];
    
    const modalBody = document.getElementById("viewModalBody");
    modalBody.innerHTML = `
      <div class="detail-section">
        <h4>Personal Information</h4>
        <div class="detail-grid">
          <div class="detail-item">
            <span class="detail-label">Reporter Name</span>
            <span class="detail-value">${b.reporterName || "N/A"}</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">Contact Number</span>
            <span class="detail-value">${b.contactNumber || "N/A"}</span>
          </div>
        </div>
      </div>
      
      <div class="detail-section">
        <h4>Incident Details</h4>
        <div class="detail-grid">
          <div class="detail-item">
            <span class="detail-label">Respondent</span>
            <span class="detail-value">${b.respondent || "N/A"}</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">Location</span>
            <span class="detail-value">${b.location || "N/A"}</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">Type of Incident</span>
            <span class="detail-value">${b.incidentType || "N/A"}</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">Status</span>
            <span class="detail-value">${b.status || "Pending"}</span>
          </div>
        </div>
        
        <div class="detail-item" style="margin-top: 16px;">
          <span class="detail-label">Narrative</span>
          <div class="blotter-narrative">${b.narrative || "No description"}</div>
        </div>
        
        ${b.dateSubmitted ? `
          <div class="detail-item" style="margin-top: 12px;">
            <span class="detail-label">Date Submitted</span>
            <span class="detail-value">${b.dateSubmitted}</span>
          </div>
        ` : ''}
      </div>
      
      ${b.evidence ? `
        <div class="detail-section">
          <h4>Evidence</h4>
          <img src="${b.evidence}" alt="Evidence" class="evidence-image">
        </div>
      ` : ''}
    `;
    
    document.getElementById("viewModal").style.display = "flex";
  };

  // Edit blotter
  window.editBlotter = function(index) {
    const blotters = JSON.parse(localStorage.getItem("blotters_" + user) || "[]");
    const b = blotters[index];
    
    document.getElementById("editIndex").value = index;
    document.getElementById("editReporterName").value = b.reporterName || "";
    document.getElementById("editContactNumber").value = b.contactNumber || "";
    document.getElementById("editRespondent").value = b.respondent || "";
    document.getElementById("editLocation").value = b.location || "";
    document.getElementById("editIncidentType").value = b.incidentType || "";
    document.getElementById("editNarrative").value = b.narrative || "";
    
    document.getElementById("editModal").style.display = "flex";
  };

  // Save edited blotter
  if (document.getElementById("saveEdit")) {
    document.getElementById("saveEdit").onclick = function() {
      const index = parseInt(document.getElementById("editIndex").value);
      const blotters = JSON.parse(localStorage.getItem("blotters_" + user) || "[]");
      
      blotters[index].reporterName = document.getElementById("editReporterName").value.trim();
      blotters[index].contactNumber = document.getElementById("editContactNumber").value.trim();
      blotters[index].respondent = document.getElementById("editRespondent").value.trim();
      blotters[index].location = document.getElementById("editLocation").value.trim();
      blotters[index].incidentType = document.getElementById("editIncidentType").value.trim();
      blotters[index].narrative = document.getElementById("editNarrative").value.trim();
      
      localStorage.setItem("blotters_" + user, JSON.stringify(blotters));
      
      document.getElementById("editModal").style.display = "none";
      renderBlotterCards();
      alert("Report updated successfully!");
    };
  }

  // Delete blotter
  window.deleteBlotter = function(index) {
    if (!confirm("Are you sure you want to delete this report? This action cannot be undone.")) {
      return;
    }
    
    const blotters = JSON.parse(localStorage.getItem("blotters_" + user) || "[]");
    blotters.splice(index, 1);
    localStorage.setItem("blotters_" + user, JSON.stringify(blotters));
    
    renderBlotterCards();
    alert("Report deleted successfully!");
  };

  // Close modals
  if (document.getElementById("closeViewModal")) {
    document.getElementById("closeViewModal").onclick = function() {
      document.getElementById("viewModal").style.display = "none";
    };
  }

  if (document.getElementById("closeEditModal")) {
    document.getElementById("closeEditModal").onclick = function() {
      document.getElementById("editModal").style.display = "none";
    };
  }

  if (document.getElementById("cancelEdit")) {
    document.getElementById("cancelEdit").onclick = function() {
      document.getElementById("editModal").style.display = "none";
    };
  }

  // Close modal when clicking outside
  window.onclick = function(event) {
    if (event.target.classList.contains("modal")) {
      event.target.style.display = "none";
    }
  };

  // Handle incident type change - show/hide "Other" input
  if (document.getElementById("incidentType")) {
    document.getElementById("incidentType").onchange = function() {
      const otherLabel = document.getElementById("otherTypeLabel");
      const otherInput = document.getElementById("otherType");
      
      if (this.value === "Other") {
        otherLabel.style.display = "block";
        otherInput.required = true;
      } else {
        otherLabel.style.display = "none";
        otherInput.required = false;
        otherInput.value = "";
      }
    };
  }

  // Handle evidence file upload
  let evidenceData = null;
  if (document.getElementById("uploadTrigger")) {
    document.getElementById("uploadTrigger").onclick = function() {
      document.getElementById("evidenceFile").click();
    };
  }

  if (document.getElementById("evidenceFile")) {
    document.getElementById("evidenceFile").onchange = function(e) {
      const file = e.target.files[0];
      if (!file) return;
      
      const reader = new FileReader();
      reader.onload = function(ev) {
        evidenceData = ev.target.result;
        document.getElementById("evidencePreview").src = evidenceData;
        document.getElementById("previewContainer").style.display = "block";
        document.getElementById("uploadText").textContent = file.name;
      };
      reader.readAsDataURL(file);
    };
  }

  if (document.getElementById("removeEvidence")) {
    document.getElementById("removeEvidence").onclick = function() {
      evidenceData = null;
      document.getElementById("evidenceFile").value = "";
      document.getElementById("previewContainer").style.display = "none";
      document.getElementById("uploadText").textContent = "Choose Image";
    };
  }

  // File new blotter with new fields
  if (document.getElementById("submitBlotter")) {
    document.getElementById("submitBlotter").onclick = () => {
      const reporterName = document.getElementById("reporterName").value.trim();
      const contactNumber = document.getElementById("contactNumber").value.trim();
      const respondent = document.getElementById("respondent").value.trim();
      const location = document.getElementById("incidentLocation").value.trim();
      const incidentType = document.getElementById("incidentType").value;
      const otherType = document.getElementById("otherType").value.trim();
      const narrative = document.getElementById("narrative").value.trim();
      
      // Validation
      if (!reporterName || !contactNumber || !respondent || !location || !incidentType || !narrative) {
        alert("Please fill all required fields.");
        return;
      }
      
      if (incidentType === "Other" && !otherType) {
        alert("Please specify the incident type.");
        return;
      }
      
      const finalIncidentType = incidentType === "Other" ? otherType : incidentType;
      
      const newBlotter = {
        reporterName,
        contactNumber,
        respondent,
        location,
        incidentType: finalIncidentType,
        narrative,
        evidence: evidenceData || null,
        status: "Pending",
        dateSubmitted: new Date().toLocaleString()
      };
      
      const blotters = JSON.parse(localStorage.getItem("blotters_" + user) || "[]");
      blotters.push(newBlotter);
      localStorage.setItem("blotters_" + user, JSON.stringify(blotters));
      
      // Add notification
      const notifications = JSON.parse(localStorage.getItem("notifications") || "[]");
      notifications.unshift({ text: `Incident report "${finalIncidentType}" filed successfully.` });
      localStorage.setItem("notifications", JSON.stringify(notifications));
      
      alert("Incident report submitted successfully!");
      goTo("user_blotter.html");
    };
  }

  // Settings
  if (document.getElementById("saveSettings")) {
    document.getElementById("saveSettings").onclick = () => {
      const newPass = document.getElementById("newPassword").value;
      if (newPass && newPass.length < 8) return alert("Password must be at least 8 characters.");
      if (newPass) {
        localStorage.setItem("user_" + user, newPass);
        alert("Password changed!");
      }
      alert("Settings saved!");
    };
  }

  // Profile picture upload
  if (document.getElementById("uploadPic")) {
    document.getElementById("uploadPic").onchange = function (e) {
      const file = e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = function (ev) {
        document.getElementById("profilePic").src = ev.target.result;
        localStorage.setItem("profilePic_" + user, ev.target.result);
      };
      reader.readAsDataURL(file);
    };
    // Load saved profile pic
    const pic = localStorage.getItem("profilePic_" + user);
    if (pic) document.getElementById("profilePic").src = pic;
  }

  // Change username logic
  if (document.getElementById("changeUsernameBtn")) {
    document.getElementById("changeUsernameBtn").onclick = function () {
      const newUsername = document.getElementById("newUsername").value.trim();
      const password = document.getElementById("confirmPassword").value;
      if (!newUsername || !password) {
        alert("Please fill all fields.");
        return;
      }
      const currentPassword = localStorage.getItem("user_" + user);
      if (password !== currentPassword) {
        alert("Incorrect password.");
        return;
      }
      // Move all user data to new username
      localStorage.setItem("user_" + newUsername, currentPassword);
      localStorage.setItem("current_user", newUsername);

      // Move contact/email/profilePic/blotters
      const contact = localStorage.getItem("contact_" + user);
      const email = localStorage.getItem("email_" + user);
      const profilePic = localStorage.getItem("profilePic_" + user);
      const blotters = localStorage.getItem("blotters_" + user);

      if (contact) localStorage.setItem("contact_" + newUsername, contact);
      if (email) localStorage.setItem("email_" + newUsername, email);
      if (profilePic) localStorage.setItem("profilePic_" + newUsername, profilePic);
      if (blotters) localStorage.setItem("blotters_" + newUsername, blotters);

      // Remove old user data (optional, for cleanliness)
      localStorage.removeItem("user_" + user);
      localStorage.removeItem("contact_" + user);
      localStorage.removeItem("email_" + user);
      localStorage.removeItem("profilePic_" + user);
      localStorage.removeItem("blotters_" + user);

      alert("Username changed! Please reload the page.");
      window.location.reload();
    };
  }
});