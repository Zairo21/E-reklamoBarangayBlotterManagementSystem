// dashboard.js
document.addEventListener('DOMContentLoaded', () => {
  // Elements
  const adminNameEl = document.getElementById('adminName');
  const btnNew = document.getElementById('btnNew');
  const btnLogout = document.getElementById('btnLogout');
  const btnExport = document.getElementById('btnExport');
  const btnSearch = document.getElementById('btnSearch');
  const btnClear = document.getElementById('btnClear');
  const searchInput = document.getElementById('searchInput');
  const fromDate = document.getElementById('fromDate');
  const toDate = document.getElementById('toDate');

  const modalForm = document.getElementById('modalForm');
  const blotterForm = document.getElementById('blotterForm');
  const modalTitle = document.getElementById('modalTitle');
  const evidenceInput = document.getElementById('evidence');
  const evidencePreview = document.getElementById('evidencePreview');

  // Notifications system
  const notifBtn = document.getElementById("notifBtn");
  const notifPanel = document.getElementById("notifPanel");
  const notifList = document.getElementById("notifList");

  const viewModal = document.getElementById('viewModal');
  const viewContent = document.getElementById('viewContent');
  const confirmModal = document.getElementById('confirmModal');

  const tableBody = document.getElementById('tableBody');
  const totalCnt = document.getElementById('totalCnt');
  const recentCnt = document.getElementById('recentCnt');
  const lastCase = document.getElementById('lastCase');
  const pageInfo = document.getElementById('pageInfo');
  const prevPage = document.getElementById('prevPage');
  const nextPage = document.getElementById('nextPage');

  let editId = null;
  let deleteId = null;

  // Pagination
  let currentPage = 1;
  const pageSize = 8;

  // Auth check
  const session = localStorage.getItem('bbms_session_user');
  if (!session) {
    alert('Not logged in. Redirecting to login.');
    window.location.href = 'index.html';
    return;
  }
  adminNameEl.innerText = session;

  // Bindings
  btnNew.addEventListener('click', openNewModal);
  btnLogout.addEventListener('click', logout);
  btnExport.addEventListener('click', exportCSV);
  btnSearch.addEventListener('click', () => { currentPage = 1; renderTable(); });
  btnClear.addEventListener('click', clearFilters);
  prevPage.addEventListener('click', () => { if (currentPage>1) { currentPage--; renderTable(); }});
  nextPage.addEventListener('click', () => { currentPage++; renderTable(); });

  document.getElementById('cancelModal').addEventListener('click', closeModal);
  document.getElementById('closeView').addEventListener('click', () => viewModal.style.display='none');
  document.getElementById('cancelDelete').addEventListener('click', () => confirmModal.style.display='none');
  document.getElementById('confirmDelete').addEventListener('click', confirmDelete);

  searchInput.addEventListener('keyup', (e) => { if (e.key === 'Enter') { currentPage=1; renderTable(); } });
  evidenceInput.addEventListener('change', previewFiles);

  // Form submit
  blotterForm.addEventListener('submit', async (ev) => {
    ev.preventDefault();
    await saveBlotter();
  });

  // Initial render
  renderTable();

  // ---------- Storage helpers ----------
  function getBlotters() {
    return JSON.parse(localStorage.getItem('bbms_blotters') || '[]');
  }
  function setBlotters(arr) {
    localStorage.setItem('bbms_blotters', JSON.stringify(arr));
  }
  function nextCaseNumber() {
    let c = parseInt(localStorage.getItem('bbms_case_counter') || '0', 10);
    c = c + 1;
    localStorage.setItem('bbms_case_counter', String(c));
    return c;
  }

  // Pull notifications from storage or start empty
  function getNotifs() {
    return JSON.parse(localStorage.getItem("bbms_notifications") || "[]");
  }
  function addNotif(msg) {
    const all = getNotifs();
    all.unshift({ msg, at: new Date().toISOString() });
    localStorage.setItem("bbms_notifications", JSON.stringify(all.slice(0, 20))); // keep latest 20
  }
  function renderNotifs() {
    const all = getNotifs();
    notifList.innerHTML = all.length
      ? all.map(n => `<li>${new Date(n.at).toLocaleString()} — ${n.msg}</li>`).join("")
      : "<li>No notifications</li>";
  }

  // ---------- Render ----------
  function renderTable() {
    const all = getBlotters().sort((a,b)=>b.id - a.id); // newest first
    // summary
    totalCnt.innerText = all.length;
    const cutOff = new Date(); cutOff.setDate(cutOff.getDate()-30);
    recentCnt.innerText = all.filter(x => new Date(x.createdAt) >= cutOff).length;
    lastCase.innerText = all.length ? all[0].caseNo : '—';

    // filters
    const q = searchInput.value.trim().toLowerCase();
    const fFrom = fromDate.value ? new Date(fromDate.value) : null;
    const fTo = toDate.value ? new Date(toDate.value) : null;

    let filtered = all.filter(item => {
      if (q) {
        const hay = `${item.caseNo} ${item.complainant} ${item.incidentType} ${item.location}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      if (fFrom && new Date(item.incidentDate) < fFrom) return false;
      if (fTo) {
        // include entire day (toDate is midnight)
        const d = new Date(item.incidentDate);
        const end = new Date(fTo); end.setDate(end.getDate() + 1);
        if (d >= end) return false;
      }
      return true;
    });

    // Dashboard animation on load
document.addEventListener("DOMContentLoaded", () => {
  document.body.style.opacity = "0";
  setTimeout(() => {
    document.body.style.transition = "opacity 1s ease";
    document.body.style.opacity = "1";
  }, 100);
});

// Example dynamic notification
document.querySelector(".notification").addEventListener("click", () => {
  alert("No new notifications.");
});

    // Toggle panel
  notifBtn.addEventListener("click", () => {
    if (notifPanel.style.display === "block") {
      notifPanel.style.display = "none";
  } else {
    renderNotifs();
    notifPanel.style.display = "block";
    }
  });

    // pagination
    const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
    if (currentPage > totalPages) currentPage = totalPages;
    const start = (currentPage - 1) * pageSize;
    const pageItems = filtered.slice(start, start + pageSize);

    // fill table
    tableBody.innerHTML = pageItems.map(row => {
      return `<tr>
        <td>#${row.caseNo}</td>
        <td>${new Date(row.incidentDate).toLocaleString()}</td>
        <td>${escapeHtml(row.complainant)}</td>
        <td>${escapeHtml(row.incidentType)}</td>
        <td>${escapeHtml(row.location)}</td>
        <td class="actions">
          <button onclick="viewBlotter(${row.id})">View</button>
          <button onclick="editBlotter(${row.id})">Edit</button>
          <button onclick="askDelete(${row.id})" style="background:var(--danger);color:white">Delete</button>
        </td>
      </tr>`;
    }).join('') || `<tr><td colspan="6" style="text-align:center;padding:18px">No entries</td></tr>`;

    pageInfo.innerText = `${currentPage} / ${totalPages}`;
    prevPage.disabled = currentPage <= 1;
    nextPage.disabled = currentPage >= totalPages;

    // expose small API to global for button callbacks
    window.viewBlotter = (id) => { openViewModal(id); };
    window.editBlotter = (id) => { openEditModal(id); };
    window.askDelete = (id) => { deleteId = id; confirmModal.style.display = 'flex'; };
  }

  // ---------- CRUD ----------
  async function saveBlotter() {
    const complainant = document.getElementById('complainant').value.trim();
    const contact = document.getElementById('contact').value.trim();
    const respondent = document.getElementById('respondent').value.trim();
    const location = document.getElementById('location').value.trim();
    const incidentType = document.getElementById('incidentType').value;
    const incidentDate = document.getElementById('incidentDate').value || new Date().toISOString();
    const narrative = document.getElementById('narrative').value.trim();
    addNotif(`Blotter #${editId ? entries[idx].caseNo : cno} ${editId ? 'updated' : 'created'} by ${localStorage.getItem('bbms_session_user')}`);

    if (!complainant || !location) return alert('Please fill required fields (complainant, location).');

    // read evidence files (if any)
    const files = evidenceInput.files;
    let evidence = [];
    if (files && files.length) {
      evidence = await readFilesAsDataUrls(files);
    }

    const entries = getBlotters();
    const now = new Date().toISOString();

    if (editId) {
      // update existing
      const idx = entries.findIndex(x => x.id === editId);
      if (idx === -1) return alert('Entry not found.');
      const entry = entries[idx];
      entry.complainant = complainant;
      entry.contact = contact;
      entry.respondent = respondent;
      entry.location = location;
      entry.incidentType = incidentType;
      entry.incidentDate = incidentDate;
      entry.narrative = narrative;

      // append new evidence (keep old)
      entry.evidence = entry.evidence.concat(evidence);
      entry.updatedAt = now;
      entry.audit = entry.audit || [];
      entry.audit.push({ action: 'edited', by: localStorage.getItem('bbms_session_user'), at: now });
      entries[idx] = entry;
      setBlotters(entries);
      alert('Blotter updated.');
    } else {

      // new entry
      const cno = nextCaseNumber();
      const newEntry = {
        id: Date.now(),
        caseNo: cno,
        complainant, contact, respondent, location,
        incidentType, incidentDate,
        narrative, evidence,
        createdBy: localStorage.getItem('bbms_session_user'),
        createdAt: now,
        updatedAt: null,
        audit: [{ action: 'created', by: localStorage.getItem('bbms_session_user'), at: now }]
      };
      entries.push(newEntry);
      setBlotters(entries);
      alert('Blotter saved.');
    }

    closeModal();
    currentPage = 1;
    renderTable();
  }

  function openNewModal() {
    editId = null;
    modalTitle.innerText = 'New Blotter';
    blotterForm.reset();
    evidencePreview.innerHTML = '';
    incidentDate.value = new Date().toISOString().slice(0,16); // local datetime-local format
    modalForm.style.display = 'flex';
  }

  // Report generator (basic placeholder)
  document.getElementById("btnReport").addEventListener("click", () => {
    alert("Report generated! In production, this could create a PDF or summary view.");
  });

  function openEditModal(id) {
    const entries = getBlotters();
    const e = entries.find(x => x.id === id);
    if (!e) return alert('Not found');
    editId = id;
    modalTitle.innerText = `Edit Blotter (#${e.caseNo})`;
    document.getElementById('complainant').value = e.complainant;
    document.getElementById('contact').value = e.contact || '';
    document.getElementById('respondent').value = e.respondent || '';
    document.getElementById('location').value = e.location || '';
    document.getElementById('incidentType').value = e.incidentType;

    // ensure datetime-local format (YYYY-MM-DDTHH:MM)
    const dt = new Date(e.incidentDate);
    const local = dt.toISOString().slice(0,16);
    document.getElementById('incidentDate').value = local;
    document.getElementById('narrative').value = e.narrative || '';

    // preview existing evidence
    evidencePreview.innerHTML = '';
    if (e.evidence && e.evidence.length) {
      e.evidence.forEach(ev => {
        const d = document.createElement('div'); d.className='preview-item';
        const img = document.createElement('img'); img.src = ev.data; img.alt = ev.name;
        d.appendChild(img); evidencePreview.appendChild(d);
      });
    }
    modalForm.style.display = 'flex';
  }

  function openViewModal(id) {
    const entries = getBlotters();
    const e = entries.find(x => x.id === id);
    if (!e) return alert('Not found');
    viewContent.innerHTML = `
      <p><strong>Case #</strong> #${e.caseNo}</p>
      <p><strong>Date / Time</strong> ${new Date(e.incidentDate).toLocaleString()}</p>
      <p><strong>Complainant</strong> ${escapeHtml(e.complainant)}</p>
      <p><strong>Contact</strong> ${escapeHtml(e.contact||'—')}</p>
      <p><strong>Respondent</strong> ${escapeHtml(e.respondent||'—')}</p>
      <p><strong>Location</strong> ${escapeHtml(e.location)}</p>
      <p><strong>Type</strong> ${escapeHtml(e.incidentType)}</p>
      <p><strong>Narrative</strong><br>${escapeHtml(e.narrative||'—')}</p>
      <p><strong>Evidence</strong></p>
      <div style="display:flex;gap:8px;flex-wrap:wrap" id="evidenceView"></div>
      <hr>
      <p><small>Created by ${escapeHtml(e.createdBy)} on ${new Date(e.createdAt).toLocaleString()}</small></p>
      ${e.updatedAt ? `<p><small>Last updated ${new Date(e.updatedAt).toLocaleString()}</small></p>` : ''}
    `;
    // add evidence images
    const container = document.getElementById('evidenceView');
    if (e.evidence && e.evidence.length) {
      e.evidence.forEach(ev => {
        const box = document.createElement('div'); box.style.width='160px'; box.style.height='90px'; box.style.border='1px solid #eee'; box.style.borderRadius='6px'; box.style.overflow='hidden';
        const img = document.createElement('img'); img.src = ev.data; img.style.width='100%'; img.style.height='100%'; img.style.objectFit='cover';
        box.appendChild(img); container.appendChild(box);
      });
    } else {
      container.innerHTML = '<div>No evidence</div>';
    }
    viewModal.style.display = 'flex';
  }

  function askDelete(id) {
    deleteId = id;
    confirmModal.style.display = 'flex';
  }

  function confirmDelete() {
    const entries = getBlotters();
    const idx = entries.findIndex(x => x.id === deleteId);
    if (idx !== -1) {
      entries.splice(idx, 1);
      setBlotters(entries);
      addNotif(`Blotter #${entries[idx].caseNo} deleted`);
      alert('Deleted.');
      confirmModal.style.display = 'none';
      renderTable();
    } else {
      alert('Not found.');
    }
  }

  // ---------- Utilities ----------
  function logout() {
    localStorage.removeItem('bbms_session_user');
    window.location.href = 'index.html';
  }

  function closeModal() {
    modalForm.style.display = 'none';
    editId = null;
    blotterForm.reset();
    evidencePreview.innerHTML = '';
  }

  function clearFilters() {
    searchInput.value = '';
    fromDate.value = '';
    toDate.value = '';
    currentPage = 1;
    renderTable();
  }

  function previewFiles() {
    evidencePreview.innerHTML = '';
    const files = evidenceInput.files;
    if (!files || !files.length) return;
    Array.from(files).slice(0,6).forEach(f => {
      const p = document.createElement('div'); p.className = 'preview-item';
      const img = document.createElement('img');
      const reader = new FileReader();
      reader.onload = (ev) => { img.src = ev.target.result; p.appendChild(img); };
      reader.readAsDataURL(f);
      evidencePreview.appendChild(p);
    });
  }

  function readFilesAsDataUrls(fileList) {
    const arr = Array.from(fileList || []);
    const promises = arr.map(f => new Promise((res, rej) => {
      const fr = new FileReader();
      fr.onload = e => res({ name: f.name, data: e.target.result });
      fr.onerror = () => rej(new Error('File read error'));
      fr.readAsDataURL(f);
    }));
    return Promise.all(promises);
  }

  // CSV Export
  function exportCSV() {
    const arr = getBlotters();
    if (!arr.length) return alert('No blotters to export.');
    const header = ['CaseNo','IncidentDate','Complainant','Contact','Respondent','Location','Type','Narrative','CreatedBy','CreatedAt','UpdatedAt'];
    const rows = arr.map(r => [
      r.caseNo,
      new Date(r.incidentDate).toISOString(),
      `"${(r.complainant||'').replace(/"/g,'""')}"`,
      `"${(r.contact||'').replace(/"/g,'""')}"`,
      `"${(r.respondent||'').replace(/"/g,'""')}"`,
      `"${(r.location||'').replace(/"/g,'""')}"`,
      `"${(r.incidentType||'').replace(/"/g,'""')}"`,
      `"${(r.narrative||'').replace(/"/g,'""')}"`,
      r.createdBy,
      r.createdAt,
      r.updatedAt || ''
    ].join(','));
    const csv = [header.join(','), ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url;
    a.download = `bbms_blotters_${new Date().toISOString().slice(0,10)}.csv`;
    document.body.appendChild(a); a.click(); a.remove(); URL.revokeObjectURL(url);
  }

  // Escape html for safety in display (simple)
  function escapeHtml(s) {
    if (!s) return '';
    return s.replace(/[&<>"']/g, function(m){ return ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m]); });
  }
});
