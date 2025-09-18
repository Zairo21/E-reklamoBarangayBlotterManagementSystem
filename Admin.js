let blotters = JSON.parse(localStorage.getItem("blotters") || "[]");
let currentUser = null;

function saveData() {
  localStorage.setItem("blotters", JSON.stringify(blotters));
}

// LOGIN SYSTEM
function login() {
  let user = document.getElementById("loginUser").value;
  let pass = document.getElementById("loginPass").value;

  if (user === "admin" && pass === "admin123") {
    currentUser = { username: "admin", role: "admin" };
    document.getElementById("adminPanel").style.display = "block";
  } else {
    currentUser = { username: user, role: "user" };
    document.getElementById("userPanel").style.display = "block";
  }

  document.getElementById("loginBox").style.display = "none";
  document.getElementById("logoutBtn").style.display = "inline-block";

  renderMyBlotters();
  renderAllBlotters();
}

function logout() {
  currentUser = null;
  document.getElementById("userPanel").style.display = "none";
  document.getElementById("adminPanel").style.display = "none";
  document.getElementById("logoutBtn").style.display = "none";
  document.getElementById("loginBox").style.display = "block";
}

// USER FUNCTIONS
document.getElementById("blotterForm").addEventListener("submit", function(e) {
  e.preventDefault();
  let blotter = {
    user: currentUser.username,
    location: document.getElementById("location").value,
    type: document.getElementById("type").value,
    narrative: document.getElementById("narrative").value,
    status: "pending",
    date: new Date().toLocaleString()
  };
  blotters.push(blotter);
  saveData();
  this.reset();
  renderMyBlotters();
  renderAllBlotters();
});

function renderMyBlotters() {
  if (!currentUser || currentUser.role !== "user") return;
  let container = document.getElementById("myBlotters");
  container.innerHTML = "";
  blotters.forEach((b, index) => {
    if (b.user === currentUser.username) {
      let card = document.createElement("div");
      card.className = "card";
      card.innerHTML = `
        <strong>${b.type}</strong> at ${b.location}<br>
        <em>${b.date}</em><br>
        <span class="badge ${b.status}">${b.status}</span>
        <p>${b.narrative}</p>
        <button class="btn btn-primary" onclick="editBlotter(${index})">Edit</button>
        <button class="btn btn-danger" onclick="deleteBlotter(${index})">Delete</button>
      `;
      container.appendChild(card);
    }
  });
}

function editBlotter(index) {
  let b = blotters[index];
  document.getElementById("location").value = b.location;
  document.getElementById("type").value = b.type;
  document.getElementById("narrative").value = b.narrative;
  deleteBlotter(index);
}

function deleteBlotter(index) {
  if (confirm("Delete this blotter?")) {
    blotters.splice(index, 1);
    saveData();
    renderMyBlotters();
    renderAllBlotters();
  }
}

// ADMIN FUNCTIONS
function renderAllBlotters() {
  if (!currentUser || currentUser.role !== "admin") return;
  let container = document.getElementById("allBlotters");
  container.innerHTML = "";
  blotters.forEach((b, index) => {
    let card = document.createElement("div");
    card.className = "card";
    card.innerHTML = `
      <strong>${b.type}</strong> at ${b.location}<br>
      Filed by: ${b.user}<br>
      <em>${b.date}</em><br>
      <span class="badge ${b.status}">${b.status}</span>
      <p>${b.narrative}</p>
      ${b.status === "pending" ? `
        <button class="btn btn-success" onclick="updateStatus(${index}, 'approved')">Approve</button>
        <button class="btn btn-warning" onclick="updateStatus(${index}, 'rejected')">Reject</button>
      ` : ""}
      <button class="btn btn-danger" onclick="deleteBlotter(${index})">Delete</button>
    `;
    container.appendChild(card);
  });
}

function updateStatus(index, status) {
  blotters[index].status = status;
  saveData();
  renderMyBlotters();
  renderAllBlotters();
}