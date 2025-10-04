(function () {
  document.addEventListener('DOMContentLoaded', () => {
    const id = (s) => document.getElementById(s);
    const escapeHtml = (s) => !s ? '' : String(s).replace(/[&<>"']/g, (m) => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m]));

    const session = localStorage.getItem('bbms_session_user');
    if (!session) { window.location.href = 'index.html'; return; }

    const adminNameEl = id('adminName');
    const profilePic = id('profilePic');
    const profileInput = id('profileInput');
    const btnSettings = id('btnSettings');
    const profileMenu = id('profileMenu');
    const notifBtn = id('notifBtn');
    const notifPanel = id('notifPanel');
    const notifList = id('notifList');
    const btnNew = id('btnNew');
    const btnLogout = id('btnLogout');
    const btnExport = id('btnExport');
    const btnReport = id('btnReport');
    const btnDownloadReport = id('btnDownloadReport');
    const btnChangePassword = id('btnChangePassword');
    const btnClearData = id('btnClearData');

    const tableBody = id('tableBody');
    const totalCnt = id('totalCnt');
    const recentCnt = id('recentCnt');
    const lastCase = id('lastCase');

    const searchInput = id('searchInput');
    const filterType = id('filterType');
    const filterInput = id('filterInput');
    const btnSearch = id('btnSearch');
    const btnClear = id('btnClear');
    const prevPage = id('prevPage');
    const nextPage = id('nextPage');
    const pageInfo = id('pageInfo');

    const modalForm = id('modalForm');
    const blotterForm = id('blotterForm');
    const modalTitle = id('modalTitle');
    const evidenceInput = id('evidence');
    const evidencePreview = id('evidencePreview');
    const viewModal = id('viewModal');
    const viewContent = id('viewContent');
    const confirmModal = id('confirmModal');

    setTimeout(() => document.body.classList.remove('initial-hide'), 60);
    if (adminNameEl) adminNameEl.innerText = session;

    const getBlotters = () => JSON.parse(localStorage.getItem('bbms_blotters') || '[]');
    const setBlotters = (arr) => localStorage.setItem('bbms_blotters', JSON.stringify(arr));
    const nextCaseNumber = () => {
      let c = parseInt(localStorage.getItem('bbms_case_counter') || '0', 10);
      c++; localStorage.setItem('bbms_case_counter', String(c)); return c;
    };

    try { const saved = localStorage.getItem('bbms_profile_pic'); if (saved && profilePic) profilePic.src = saved; } catch (e) {}

    if (profilePic && profileInput) {
      profilePic.addEventListener('click', () => profileInput.click());
      profileInput.addEventListener('change', () => {
        const f = profileInput.files && profileInput.files[0]; if (!f) return;
        const fr = new FileReader();
        fr.onload = (e) => { if (profilePic) profilePic.src = e.target.result; try { localStorage.setItem('bbms_profile_pic', e.target.result); } catch (er) {} };
        fr.readAsDataURL(f);
      });
    }

    if (profileMenu) { profileMenu.style.display = 'none'; profileMenu.setAttribute('aria-hidden', 'true'); }
    if (btnSettings && profileMenu) {
      btnSettings.addEventListener('click', (ev) => {
        ev.stopPropagation();
        const open = profileMenu.style.display === 'flex';
        profileMenu.style.display = open ? 'none' : 'flex';
        profileMenu.setAttribute('aria-hidden', String(!open));
        btnSettings.setAttribute('aria-expanded', String(!open));
      });
      document.addEventListener('click', (ev) => {
        if (profileMenu.style.display === 'flex' && !profileMenu.contains(ev.target) && ev.target !== btnSettings) {
          profileMenu.style.display = 'none';
          profileMenu.setAttribute('aria-hidden', 'true');
          btnSettings.setAttribute('aria-expanded', 'false');
        }
      });
      document.addEventListener('keydown', (ev) => { if (ev.key === 'Escape') { profileMenu.style.display = 'none'; profileMenu.setAttribute('aria-hidden', 'true'); btnSettings && btnSettings.setAttribute('aria-expanded', 'false'); } });
    }

    const getNotifs = () => JSON.parse(localStorage.getItem('bbms_notifications') || '[]');
    const setNotifs = (a) => localStorage.setItem('bbms_notifications', JSON.stringify(a));
    const addNotif = (m) => { const a = getNotifs(); a.unshift({ msg: m, at: new Date().toISOString() }); setNotifs(a.slice(0, 40)); };
    const renderNotifs = () => { if (!notifList) return; const a = getNotifs(); notifList.innerHTML = a.length ? a.map(n => `<li>${new Date(n.at).toLocaleString()} — ${escapeHtml(n.msg)}</li>`).join('') : '<li>No notifications</li>'; };

    if (notifBtn && notifPanel) {
      notifBtn.addEventListener('click', () => {
        if (notifPanel.style.display === 'block') notifPanel.style.display = 'none';
        else { renderNotifs(); notifPanel.style.display = 'block'; }
      });
    }

    let currentPage = 1, pageSize = 8;

    function renderTable() {
      if (!tableBody) return;
      const all = getBlotters().slice().sort((a, b) => (b.id || 0) - (a.id || 0));
      if (totalCnt) totalCnt.innerText = all.length;
      const cutOff = new Date(); cutOff.setDate(cutOff.getDate() - 30);
      if (recentCnt) recentCnt.innerText = all.filter(x => new Date(x.createdAt) >= cutOff).length;
      if (lastCase) lastCase.innerText = all.length ? all[0].caseNo : '—';

      const qRaw = (searchInput && searchInput.value) ? searchInput.value.trim().toLowerCase() : '';
      const qNorm = qRaw.replace(/#/g, '').replace(/\bcase\b/g, '').replace(/\s+/g, ' ').trim();
      const qNum = qNorm && /^\d+$/.test(qNorm) ? Number(qNorm) : null;

      const fType = filterType && filterType.value ? filterType.value : '';
      const fKwRaw = filterInput && filterInput.value ? filterInput.value.trim().toLowerCase() : '';
      const fKw = fKwRaw.replace(/#/g, '').replace(/\bcase\b/g, '').trim();

      let filtered = all.filter(item => {
        if (qNorm) {
          const hay = `${item.caseNo || ''} ${item.complainant || ''} ${item.incidentType || ''} ${item.location || ''}`.toLowerCase();
          if (qNum !== null) {
            if (Number(item.caseNo) !== qNum && !hay.includes(qNorm)) return false;
          } else {
            if (!hay.includes(qNorm)) return false;
          }
        }

        if (fType && fKw) {
          const kw = fKw;
          if (fType === 'case') return String(item.caseNo || '').toLowerCase().includes(kw) || String(item.caseNo || '') === kw;
          if (fType === 'complainant') return (item.complainant || '').toLowerCase().includes(kw);
          if (fType === 'respondent') return (item.respondent || '').toLowerCase().includes(kw);
          if (fType === 'status') return (item.status || '').toLowerCase().includes(kw);
          if (fType === 'date') return new Date(item.incidentDate || '').toLocaleDateString().toLowerCase().includes(kw);
        }
        return true;
      });

      const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
      if (currentPage > totalPages) currentPage = totalPages;
      const start = (currentPage - 1) * pageSize;
      const pageItems = filtered.slice(start, start + pageSize);

      if (!pageItems.length) {
        tableBody.innerHTML = `<tr><td colspan="7" class="empty">No entries</td></tr>`;
      } else {
        tableBody.innerHTML = pageItems.map(row => {
          const statusVal = String(row.status || 'open').toLowerCase();
          const statusLabel = statusVal.charAt(0).toUpperCase() + statusVal.slice(1);
          return `
            <tr>
              <td>#${row.caseNo}</td>
              <td>${new Date(row.incidentDate || row.createdAt || Date.now()).toLocaleString()}</td>
              <td>${escapeHtml(row.complainant)}</td>
              <td>${escapeHtml(row.incidentType || '—')}</td>
              <td>${escapeHtml(row.location || '—')}</td>
              <td class="status status-${statusVal}">${escapeHtml(statusLabel)}</td>
              <td>
                <button data-action="view" data-id="${row.id}">View</button>
                <button data-action="edit" data-id="${row.id}">Edit</button>
              </td>
            </tr>
          `;
        }).join('');
      }

      if (pageInfo) pageInfo.innerText = `${currentPage} / ${totalPages}`;
      if (prevPage) prevPage.disabled = currentPage <= 1;
      if (nextPage) nextPage.disabled = currentPage >= totalPages;

      tableBody.querySelectorAll('button[data-action]').forEach(b => {
        b.removeEventListener('click', delegatedHandler);
        b.addEventListener('click', delegatedHandler);
      });
    }

    function delegatedHandler(e) {
      const idAttr = e.currentTarget.getAttribute('data-id');
      const act = e.currentTarget.getAttribute('data-action');
      const idNum = Number(idAttr);
      if (act === 'view') openViewModal(idNum);
      if (act === 'edit') openEditModal(idNum);
    }

    let editId = null, deleteId = null;

    function openNewModal() {
      editId = null;
      if (modalTitle) modalTitle.innerText = 'New Blotter';
      if (blotterForm) blotterForm.reset();
      if (evidencePreview) evidencePreview.innerHTML = '';
      if (id('incidentDate')) id('incidentDate').value = new Date().toISOString().slice(0, 16);
      if (modalForm) modalForm.style.display = 'flex';
    }

    function closeModal() { if (modalForm) modalForm.style.display = 'none'; editId = null; if (blotterForm) blotterForm.reset(); if (evidencePreview) evidencePreview.innerHTML = ''; }

    async function saveBlotter(ev) {
      ev && ev.preventDefault();
      if (!blotterForm) return;
      const complainant = (id('complainant') && id('complainant').value.trim()) || '';
      const location = (id('location') && id('location').value.trim()) || '';
      if (!complainant || !location) { alert('Please fill required fields (complainant, location).'); return; }
      const incidentType = (id('incidentType') && id('incidentType').value) || '';
      const incidentDate = (id('incidentDate') && id('incidentDate').value) || new Date().toISOString();
      const status = (id('status') && id('status').value) || 'open';
      const narrative = (id('narrative') && id('narrative').value.trim()) || '';

      let evidence = [];
      if (evidenceInput && evidenceInput.files && evidenceInput.files.length) {
        evidence = await Promise.all(Array.from(evidenceInput.files).slice(0, 6).map(f => new Promise(res => {
          const fr = new FileReader(); fr.onload = e => res({ name: f.name, data: e.target.result }); fr.readAsDataURL(f);
        })));
      }

      const entries = getBlotters();
      const now = new Date().toISOString();

      if (editId) {
        const idx = entries.findIndex(x => x.id === editId);
        if (idx === -1) { alert('Not found'); return; }
        const entry = entries[idx];
        entry.complainant = complainant; entry.location = location; entry.incidentType = incidentType;
        entry.incidentDate = incidentDate; entry.status = status; entry.narrative = narrative; entry.evidence = (entry.evidence || []).concat(evidence);
        entry.updatedAt = now;
        entries[idx] = entry;
        setBlotters(entries);
        addNotif(`Blotter #${entry.caseNo} updated`);
        alert('Updated.');
      } else {
        const cno = nextCaseNumber();
        const newEntry = {
          id: Date.now(),
          caseNo: cno,
          complainant, location, incidentType, incidentDate, narrative, evidence, status,
          createdBy: session, createdAt: now, updatedAt: null
        };
        entries.push(newEntry);
        setBlotters(entries);
        addNotif(`Blotter #${cno} created`);
        alert('Saved.');
      }
      closeModal();
      currentPage = 1;
      renderTable(); renderNotifs();
    }

    function openEditModal(rowId) {
      const e = getBlotters().find(x => x.id === rowId);
      if (!e) return alert('Not found');
      editId = rowId;
      modalTitle && (modalTitle.innerText = `Edit Blotter (#${e.caseNo})`);
      id('complainant') && (id('complainant').value = e.complainant || '');
      id('location') && (id('location').value = e.location || '');
      id('incidentType') && (id('incidentType').value = e.incidentType || '');
      id('status') && (id('status').value = e.status || 'open');
      id('incidentDate') && (id('incidentDate').value = new Date(e.incidentDate).toISOString().slice(0, 16));
      id('narrative') && (id('narrative').value = e.narrative || '');
      if (evidencePreview) {
        evidencePreview.innerHTML = '';
        (e.evidence || []).forEach(ev => {
          const d = document.createElement('div'); d.className = 'preview-item';
          const img = document.createElement('img'); img.src = ev.data; img.style.width = '100%'; img.style.height = '100%'; img.style.objectFit = 'cover';
          d.appendChild(img); evidencePreview.appendChild(d);
        });
      }
      modalForm && (modalForm.style.display = 'flex');
    }

    function openViewModal(rowId) {
      const e = getBlotters().find(x => x.id === rowId);
      if (!e) return alert('Not found');
      if (!viewContent) return;
      viewContent.innerHTML = `
        <p><strong>Case #</strong> #${e.caseNo}</p>
        <p><strong>Date</strong> ${new Date(e.incidentDate).toLocaleString()}</p>
        <p><strong>Complainant</strong> ${escapeHtml(e.complainant)}</p>
        <p><strong>Location</strong> ${escapeHtml(e.location)}</p>
        <p><strong>Type</strong> ${escapeHtml(e.incidentType)}</p>
        <p><strong>Narrative</strong><br>${escapeHtml(e.narrative || '—')}</p>
      `;
      viewModal && (viewModal.style.display = 'flex');
    }

    function previewFiles() {
      if (!evidencePreview || !evidenceInput) return;
      evidencePreview.innerHTML = '';
      const files = evidenceInput.files;
      if (!files) return;
      Array.from(files).slice(0, 6).forEach(f => {
        const p = document.createElement('div'); p.className = 'preview-item';
        const img = document.createElement('img');
        const fr = new FileReader();
        fr.onload = (e) => { img.src = e.target.result; img.style.width = '100%'; img.style.height = '100%'; img.style.objectFit = 'cover'; p.appendChild(img); };
        fr.readAsDataURL(f);
        evidencePreview.appendChild(p);
      });
    }

    function confirmDelete() {
      const arr = getBlotters(); const idx = arr.findIndex(x => x.id === deleteId);
      if (idx === -1) return alert('Not found');
      const removed = arr.splice(idx, 1)[0]; setBlotters(arr); addNotif(`Blotter #${removed.caseNo} deleted`); alert('Deleted.'); confirmModal && (confirmModal.style.display = 'none'); renderTable(); renderNotifs();
    }

    function exportCSV() {
      const arr = getBlotters(); if (!arr.length) return alert('No blotters to export.');
      const header = ['CaseNo','IncidentDate','Complainant','Contact','Respondent','Location','Type','Narrative','CreatedBy','CreatedAt','UpdatedAt'];
      const rows = arr.map(r => [r.caseNo, new Date(r.incidentDate).toISOString(), `"${(r.complainant||'').replace(/"/g,'""')}"`, `"${(r.contact||'').replace(/"/g,'""')}"`, `"${(r.respondent||'').replace(/"/g,'""')}"`, `"${(r.location||'').replace(/"/g,'""')}"`, `"${(r.incidentType||'').replace(/"/g,'""')}"`, `"${(r.narrative||'').replace(/"/g,'""')}"`, r.createdBy, r.createdAt, r.updatedAt||''].join(','));
      const csv = [header.join(','), ...rows].join('\n');
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a'); a.href = url; a.download = `bbms_blotters_${new Date().toISOString().slice(0,10)}.csv`; document.body.appendChild(a); a.click(); a.remove(); URL.revokeObjectURL(url);
    }

    function generatePDFReport() {
      try {
        if (!window.jspdf) { alert('PDF library missing'); return; }
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF({ unit: 'pt', format: 'a4' });

        const margin = 36;
        const pageWidth = doc.internal.pageSize.getWidth ? doc.internal.pageSize.getWidth() : doc.internal.pageSize.width;
        const pageHeight = doc.internal.pageSize.getHeight ? doc.internal.pageSize.getHeight() : doc.internal.pageSize.height;
        const usableWidth = pageWidth - margin * 2;
        let y = margin + 18;

        doc.setFontSize(16);
        doc.text('Barangay Blotter Summary Report', margin, y);
        doc.setFontSize(9);
        doc.text('Generated: ' + new Date().toLocaleString(), margin, y + 16);
        y += 36;

        const min = { case: 36, date: 110, location: 120, type: 70, complainant: 80 };

        let w_case = Math.max(min.case, Math.floor(usableWidth * 0.06));
        let w_date = Math.max(min.date, Math.floor(usableWidth * 0.18));
        let w_location = Math.max(min.location, Math.floor(usableWidth * 0.20));
        let w_type = Math.max(min.type, Math.floor(usableWidth * 0.12));
        let w_complainant = usableWidth - (w_case + w_type + w_location + w_date);

        if (w_complainant < min.complainant) {
          const need = min.complainant - w_complainant;
          const takeFromType = Math.min(need, w_type - min.type);
          w_type -= takeFromType;
          w_complainant += takeFromType;
          if (w_complainant < min.complainant) {
            const takeFromComplainantFallback = Math.min(min.complainant - w_complainant, w_complainant - 40);
            w_complainant += takeFromComplainantFallback;
          }
        }

        if (w_date < min.date) w_date = min.date;
        if (w_location < min.location) w_location = min.location;
        w_complainant = usableWidth - (w_case + w_type + w_location + w_date);
        if (w_complainant < 40) w_complainant = 40; 

        const colX = {
          case: margin,
          complainant: margin + w_case,
          type: margin + w_case + w_complainant,
          location: margin + w_case + w_complainant + w_type,
          date: margin + w_case + w_complainant + w_type + w_location
        };

        doc.setFontSize(11);
        doc.text('Case#', colX.case, y);
        doc.text('Complainant', colX.complainant, y);
        doc.text('Type', colX.type, y);
        doc.text('Location', colX.location, y);
        doc.text('Date & Time', colX.date, y);
        y += 14;

        doc.setFontSize(10);
        const lineHeight = 12;
        const rowGap = 8;

        const rows = getBlotters() || [];
        for (let rIdx = 0; rIdx < rows.length; rIdx++) {
          const r = rows[rIdx];
          const caseNo = '#' + String(r.caseNo || '');
          const complainant = (r.complainant || '—').trim();
          const type = (r.incidentType || '—').trim();
          const location = (r.location || '—').trim();
          const dateStr = new Date(r.incidentDate || r.createdAt || Date.now()).toLocaleString();

          const caseLines = doc.splitTextToSize(caseNo, w_case);
          const complainantLines = doc.splitTextToSize(complainant, w_complainant);
          const typeLines = doc.splitTextToSize(type, w_type);
          const locationLines = doc.splitTextToSize(location, w_location);
          const dateLines = doc.splitTextToSize(dateStr, w_date);

          const linesCount = Math.max(caseLines.length, complainantLines.length, typeLines.length, locationLines.length, dateLines.length, 1);
          const rowHeight = linesCount * lineHeight;

          if (y + rowHeight > pageHeight - margin) {
            doc.addPage();
            y = margin + 18;
            doc.setFontSize(11);
            doc.text('Case#', colX.case, y);
            doc.text('Complainant', colX.complainant, y);
            doc.text('Type', colX.type, y);
            doc.text('Location', colX.location, y);
            doc.text('Date & Time', colX.date, y);
            y += 14;
            doc.setFontSize(10);
          }

          for (let i = 0; i < linesCount; i++) {
            const lineY = y + i * lineHeight;
            if (caseLines[i]) doc.text(caseLines[i], colX.case, lineY);
            if (complainantLines[i]) doc.text(complainantLines[i], colX.complainant, lineY);
            if (typeLines[i]) doc.text(typeLines[i], colX.type, lineY);
            if (locationLines[i]) doc.text(locationLines[i], colX.location, lineY);
            if (dateLines[i]) doc.text(dateLines[i], colX.date, lineY);
          }

          y += rowHeight + rowGap;
        }

        doc.save(`bbms_report_${new Date().toISOString().slice(0, 10)}.pdf`);
      } catch (e) {
        alert('PDF failed: ' + (e && e.message ? e.message : e));
      }
    }

    function changePassword() {
      const stored = localStorage.getItem('admin_password') || '';
      const current = prompt('Enter current password:');
      if (current === null) return;
      if (current !== stored) { alert('Incorrect current password'); return; }
      const next = prompt('Enter new password (min 8 chars):');
      if (next === null) return;
      if (next.length < 8) { alert('Password must be at least 8 characters'); return; }
      const conf = prompt('Confirm new password:');
      if (conf !== next) { alert('Passwords do not match'); return; }
      localStorage.setItem('admin_password', next);
      alert('Password changed successfully.');
    }

    function clearAllData() {
      const storedPwd = localStorage.getItem('admin_password') || '';
      if (!storedPwd) { alert('No admin password set — cannot clear data.'); return; }
      const entered = prompt('Enter admin password to confirm clearing ALL data:');
      if (entered === null) return;
      if (entered !== storedPwd) { alert('Incorrect password. Operation cancelled.'); return; }
      const confirmText = prompt('Type DELETE to permanently remove ALL data:');
      if (confirmText === null) return;
      if (confirmText !== 'DELETE') { alert('Confirmation text did not match. Operation cancelled.'); return; }
      const ok = confirm('This will permanently delete all stored blotters, notifications, profile image, session and admin credentials. Continue?');
      if (!ok) return;
      const keys = ['bbms_blotters','bbms_case_counter','bbms_notifications','bbms_profile_pic','bbms_session_user','admin_username','admin_password'];
      keys.forEach(k => localStorage.removeItem(k));
      alert('All data cleared. Redirecting to login.');
      document.body.classList.add('fade-out');
      setTimeout(() => { window.location.href = 'index.html'; }, 450);
    }

    if (btnNew) btnNew.addEventListener('click', openNewModal);
    if (id('cancelModal')) id('cancelModal').addEventListener('click', closeModal);
    if (id('closeView')) id('closeView').addEventListener('click', () => viewModal && (viewModal.style.display = 'none'));
    if (blotterForm) blotterForm.addEventListener('submit', saveBlotter);
    if (evidenceInput) evidenceInput.addEventListener('change', previewFiles);
    if (btnSearch) btnSearch.addEventListener('click', () => { currentPage = 1; renderTable(); });
    if (btnClear) btnClear.addEventListener('click', () => { if (searchInput) searchInput.value = ''; if (filterType) filterType.value = ''; if (filterInput) filterInput.value = ''; currentPage = 1; renderTable(); });

    if (searchInput) {
      searchInput.addEventListener('input', () => { currentPage = 1; renderTable(); });
      searchInput.addEventListener('keydown', (e) => { if (e.key === 'Enter') { e.preventDefault(); currentPage = 1; renderTable(); } });
    }

    if (prevPage) prevPage.addEventListener('click', () => { if (currentPage > 1) { currentPage--; renderTable(); } });
    if (nextPage) nextPage.addEventListener('click', () => { currentPage++; renderTable(); });

    if (btnExport) btnExport.addEventListener('click', exportCSV);
    if (btnReport) btnReport.addEventListener('click', generatePDFReport);
    if (btnDownloadReport) btnDownloadReport.addEventListener('click', () => {
      generatePDFReport();
    });
    if (btnChangePassword) btnChangePassword.addEventListener('click', changePassword);
    if (btnClearData) btnClearData.addEventListener('click', clearAllData);

    if (btnLogout) btnLogout.addEventListener('click', () => {
      localStorage.removeItem('bbms_session_user');
      document.body.classList.add('fade-out');
      setTimeout(() => { window.location.href = 'index.html'; }, 450);
    });

    renderTable(); renderNotifs();
  });
})();