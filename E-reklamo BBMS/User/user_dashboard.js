document.addEventListener("DOMContentLoaded", () => {
  const user = localStorage.getItem("current_user");
  if (!user) {
    alert("Please login first.");
    window.location.href = "user_index.html";
  }
  document.getElementById("userName").innerText = "Hello, " + user;

  const btnNew = document.getElementById("btnNewBlotter");
  const btnStatus = document.getElementById("btnViewStatus");
  const newSection = document.getElementById("newBlotterSection");
  const statusSection = document.getElementById("statusSection");
  const blotterForm = document.getElementById("blotterForm");
  const blotterList = document.getElementById("blotterList");

  // Toggle sections
  btnNew.addEventListener("click", () => {
    newSection.classList.remove("hidden");
    statusSection.classList.add("hidden");
  });
  btnStatus.addEventListener("click", () => {
    newSection.classList.add("hidden");
    statusSection.classList.remove("hidden");
    loadBlotters();
  });

  // Submit new blotter
  blotterForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const data = {
      user,
      complainant: document.getElementById("complainant").value,
      contact: document.getElementById("contact").value,
      location: document.getElementById("location").value,
      incidentType: document.getElementById("incidentType").value,
      narrative: document.getElementById("narrative").value,
      date: new Date().toISOString(),
    };
    const all = JSON.parse(localStorage.getItem("user_blotters") || "[]");
    all.push(data);
    localStorage.setItem("user_blotters", JSON.stringify(all));
    alert("Blotter submitted!");
    blotterForm.reset();
  });

  // Show user blotters
  function loadBlotters() {
    const all = JSON.parse(localStorage.getItem("user_blotters") || "[]");
    const mine = all.filter(b => b.user === user);
    blotterList.innerHTML = mine.length
      ? mine.map(b => `<li><strong>${b.incidentType}</strong> at ${b.location}<br><small>${new Date(b.date).toLocaleString()}</small></li>`).join("")
      : "<li>No blotters yet.</li>";
  }

  // Logout
  document.getElementById("logoutBtn").addEventListener("click", () => {
    localStorage.removeItem("current_user");
    window.location.href = "user_index.html";
  });
});

// Submit new blotter
blotterForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const data = {
    user,
    complainant: document.getElementById("complainant").value,
    contact: document.getElementById("contact").value,
    location: document.getElementById("location").value,
    incidentType: document.getElementById("incidentType").value,
    narrative: document.getElementById("narrative").value,
    date: new Date().toISOString(),
    status: "Pending" // default status
  };

  // Save to user_blotters (for the user’s personal view)
  const allUser = JSON.parse(localStorage.getItem("user_blotters") || "[]");
  allUser.push(data);
  localStorage.setItem("user_blotters", JSON.stringify(allUser));

  // 🔗 Save to bbms_blotters (for the admin’s dashboard)
  const allAdmin = JSON.parse(localStorage.getItem("bbms_blotters") || "[]");
  allAdmin.push(data);
  localStorage.setItem("bbms_blotters", JSON.stringify(allAdmin));

  alert("Blotter submitted! The barangay will review it.");
  blotterForm.reset();
});

