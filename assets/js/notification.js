/* =========================================================
   NOTIFICATION MODULE
   Independent workspace. No CSV/API/database integration yet.
   Existing notification data is intentionally NOT loaded.
   ========================================================= */
(function (window, document) {
  'use strict';

  var records = [];
  var pageSize = 20;
  var currentPage = 1;
  var editingId = null;

  /* Test catalogue is intentionally empty in this first UI build.
     Backend/reference data can be connected later without changing the page shell. */
  var testCatalogue = {
    BIOCHEMISTRY: [],
    HAEMATOLOGY: [],
    MICROBIOLOGY: []
  };

  function $(id) { return document.getElementById(id); }
  function esc(value) {
    return String(value == null ? '' : value)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }
  function pad(n) { return String(n).padStart(2, '0'); }
  function nowLocalInput() {
    var d = new Date();
    return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()) + 'T' + pad(d.getHours()) + ':' + pad(d.getMinutes());
  }
  function timeNow() {
    var d = new Date(); return pad(d.getHours()) + ':' + pad(d.getMinutes());
  }
  function fmtDate(value) {
    if (!value) return '—';
    var d = new Date(value);
    if (isNaN(d.getTime())) return esc(value);
    return pad(d.getDate()) + '/' + pad(d.getMonth() + 1) + '/' + d.getFullYear() + '<br><small>' + pad(d.getHours()) + ':' + pad(d.getMinutes()) + '</small>';
  }
  function setDefaultForm() {
    var dt = $('notificationDateTime'); if (dt) dt.value = nowLocalInput();
    var ti = $('notificationInformedTime'); if (ti) ti.value = timeNow();
    var status = $('notificationStatus'); if (status) status.value = 'PENDING';
    editingId = null;
    var mode = $('notificationFormMode'); if (mode) mode.textContent = 'NEW RECORD';
  }
  function clearForm() {
    var form = $('notificationForm'); if (form) form.reset();
    var sex = $('notificationSex'); if (sex) sex.value = '';
    var age = $('notificationAge'); if (age) age.value = '';
    var test = $('notificationTest'); if (test) test.innerHTML = '<option value="">Select discipline first</option>';
    var rule = $('notificationCriticalLimit'); if (rule) { rule.className = 'notification-critical-box is-empty'; rule.innerHTML = '<strong>Reference</strong><span>Select a test to load the critical value rule.</span>'; }
    setFlag('Awaiting result', '');
    setDefaultForm();
  }
  function setFlag(text, tone) {
    var el = $('notificationFlag'); if (!el) return;
    el.textContent = text || 'Awaiting result';
    el.className = 'notification-flag' + (tone ? ' ' + tone : '');
  }
  function parseIc(value) {
    var s = String(value || '').replace(/[^0-9]/g, '');
    if (s.length < 6) return;
    var yy = Number(s.slice(0,2)), mm = Number(s.slice(2,4)), dd = Number(s.slice(4,6));
    var now = new Date(), currentYY = now.getFullYear() % 100;
    var year = yy <= currentYY ? 2000 + yy : 1900 + yy;
    var dob = new Date(year, mm - 1, dd);
    if (dob.getFullYear() !== year || dob.getMonth() !== mm - 1 || dob.getDate() !== dd) return;
    var age = now.getFullYear() - year;
    if (now.getMonth() < mm - 1 || (now.getMonth() === mm - 1 && now.getDate() < dd)) age--;
    var sex = '';
    if (s.length >= 12) sex = Number(s.slice(-1)) % 2 ? 'M' : 'F';
    if ($('notificationAge')) $('notificationAge').value = Math.max(0, age);
    if ($('notificationSex')) $('notificationSex').value = sex;
  }
  function populateTests() {
    var discipline = $('notificationDiscipline');
    var test = $('notificationTest');
    if (!discipline || !test) return;
    var list = testCatalogue[discipline.value] || [];
    if (!list.length) {
      test.innerHTML = '<option value="">Test catalogue not loaded yet</option>';
      test.disabled = true;
      return;
    }
    test.disabled = false;
    test.innerHTML = '<option value="">Select test</option>' + list.map(function (x) { return '<option value="' + esc(x.name) + '">' + esc(x.name) + '</option>'; }).join('');
  }
  function updateRuleAndFlag() {
    var discipline = $('notificationDiscipline');
    var test = $('notificationTest');
    var result = $('notificationResult');
    var box = $('notificationCriticalLimit');
    if (!discipline || !test || !box) return;
    var list = testCatalogue[discipline.value] || [];
    var item = list.find(function (x) { return String(x.name) === String(test.value); });
    if (!item) {
      box.className = 'notification-critical-box is-empty';
      box.innerHTML = '<strong>Reference</strong><span>Critical-value catalogue will be connected in the next step.</span>';
      setFlag(result && result.value ? 'REVIEW' : 'Awaiting result', result && result.value ? 'critical' : '');
      return;
    }
    box.className = 'notification-critical-box';
    box.innerHTML = '<strong>Critical Limit (' + esc(item.name) + ')</strong><span>' + esc(item.rule || 'See reference catalogue') + '</span>';
    evaluateResult(item, result ? result.value : '');
  }
  function evaluateResult(item, value) {
    var n = Number(String(value || '').replace(/,/g, '').trim());
    if (!value) { setFlag('Awaiting result', ''); return; }
    if (item && item.low != null && n < Number(item.low)) { setFlag('LOW CRITICAL', 'critical'); return; }
    if (item && item.high != null && n > Number(item.high)) { setFlag('HIGH CRITICAL', 'critical'); return; }
    setFlag('REVIEW', 'normal');
  }
  function collectForm() {
    return {
      id: editingId || ('N' + Date.now()),
      notification_datetime: $('notificationDateTime').value,
      barcode: $('notificationBarcode').value.trim(),
      patient_name: $('notificationPatientName').value.trim(),
      patient_id: $('notificationIdIc').value.trim(),
      sex: $('notificationSex').value.trim(),
      age: $('notificationAge').value.trim(),
      unit: $('notificationUnit').value,
      discipline: $('notificationDiscipline').value,
      test_name: $('notificationTest').value,
      critical_limit: $('notificationCriticalLimit').innerText.replace(/^Reference\s*/i, '').trim(),
      result: $('notificationResult').value.trim(),
      flag: $('notificationFlag').textContent.trim(),
      staff: $('notificationStaff').value.trim(),
      inform_to: $('notificationInformTo').value.trim(),
      informed_time: $('notificationInformedTime').value,
      status: $('notificationStatus').value,
      notes: $('notificationNotes').value.trim()
    };
  }
  function render() {
    var search = String(($('notificationSearch') || {}).value || '').trim().toLowerCase();
    var month = String(($('notificationMonthFilter') || {}).value || 'ALL');
    var discipline = String(($('notificationDisciplineFilter') || {}).value || 'ALL');
    var flag = String(($('notificationFlagFilter') || {}).value || 'ALL');
    var status = String(($('notificationStatusFilter') || {}).value || 'ALL');
    var filtered = records.filter(function (r) {
      var hay = [r.patient_name, r.patient_id, r.barcode, r.test_name, r.unit, r.staff].join(' ').toLowerCase();
      if (search && hay.indexOf(search) < 0) return false;
      if (month !== 'ALL' && String(r.notification_datetime || '').slice(5,7) !== month) return false;
      if (discipline !== 'ALL' && r.discipline !== discipline) return false;
      if (flag !== 'ALL' && r.flag !== flag) return false;
      if (status !== 'ALL' && r.status !== status) return false;
      return true;
    });
    var totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
    if (currentPage > totalPages) currentPage = totalPages;
    var start = (currentPage - 1) * pageSize;
    var rows = filtered.slice(start, start + pageSize);
    var body = $('notificationTableBody'), empty = $('notificationEmpty');
    if (body) body.innerHTML = rows.map(function (r) {
      var cls = r.discipline === 'BIOCHEMISTRY' ? 'bio' : r.discipline === 'HAEMATOLOGY' ? 'hema' : 'micro';
      var statusCls = String(r.status).toLowerCase();
      return '<tr><td>' + fmtDate(r.notification_datetime) + '</td>' +
        '<td class="patient">' + esc(r.patient_name) + '</td>' +
        '<td>' + esc(r.patient_id) + '</td>' +
        '<td>' + esc(r.unit) + '</td>' +
        '<td><span class="notification-pill ' + cls + '">' + esc(r.discipline) + '</span></td>' +
        '<td>' + esc(r.test_name || '—') + '</td>' +
        '<td class="result">' + esc(r.result) + '</td>' +
        '<td><span class="notification-pill flag">' + esc(r.flag) + '</span></td>' +
        '<td><span class="notification-pill status ' + statusCls + '">' + esc(r.status) + '</span></td>' +
        '<td><div class="notification-actions"><button class="notification-action" type="button" data-notification-view="' + esc(r.id) + '" title="View">◉</button><button class="notification-action" type="button" data-notification-edit="' + esc(r.id) + '" title="Edit">✎</button></div></td></tr>';
    }).join('');
    if (empty) empty.hidden = rows.length > 0;
    var shownStart = filtered.length ? start + 1 : 0;
    var shownEnd = Math.min(start + pageSize, filtered.length);
    var pager = $('notificationPager'); if (pager) pager.textContent = 'Showing ' + shownStart + '–' + shownEnd + ' of ' + filtered.length;
    updateStats();
  }
  function updateStats() {
    var total = records.length;
    var set = function (id, val) { var el = $(id); if (el) el.textContent = String(val); };
    set('notificationStatTotal', total); set('notificationTotal', total + ' TOTAL');
    set('notificationStatBio', records.filter(function (r) { return r.discipline === 'BIOCHEMISTRY'; }).length);
    set('notificationStatHema', records.filter(function (r) { return r.discipline === 'HAEMATOLOGY'; }).length);
    set('notificationStatMicro', records.filter(function (r) { return r.discipline === 'MICROBIOLOGY'; }).length);
  }
  function showDetail(record) {
    var modal = $('notificationDetailModal');
    if (!modal) {
      modal = document.createElement('div'); modal.id = 'notificationDetailModal'; modal.className = 'notification-modal'; modal.hidden = true;
      modal.innerHTML = '<div class="notification-modal-dialog"><div class="notification-modal-head"><h3>CRITICAL VALUE RECORD</h3><button class="notification-modal-close" type="button" data-notification-close>×</button></div><div class="notification-modal-body"><div class="notification-detail-grid" id="notificationDetailGrid"></div></div></div>';
      document.body.appendChild(modal);
      modal.addEventListener('click', function (e) { if (e.target === modal || e.target.closest('[data-notification-close]')) modal.hidden = true; });
    }
    var grid = $('notificationDetailGrid');
    var fields = [['Date / Time', fmtDate(record.notification_datetime)],['Barcode',esc(record.barcode)],['Patient',esc(record.patient_name)],['ID / IC',esc(record.patient_id)],['Sex',esc(record.sex)],['Age',esc(record.age)],['Unit',esc(record.unit)],['Discipline',esc(record.discipline)],['Test',esc(record.test_name)],['Critical Limit',esc(record.critical_limit)],['Result',esc(record.result)],['Flag',esc(record.flag)],['Staff',esc(record.staff)],['Inform To',esc(record.inform_to)],['Time Informed',esc(record.informed_time)],['Status',esc(record.status)],['Notes',esc(record.notes || '—')]];
    if (grid) grid.innerHTML = fields.map(function (f) { return '<div class="notification-detail"><small>' + f[0] + '</small><strong>' + f[1] + '</strong></div>'; }).join('');
    modal.hidden = false;
  }
  function editRecord(id) {
    var r = records.find(function (x) { return String(x.id) === String(id); }); if (!r) return;
    editingId = r.id;
    $('notificationDateTime').value = r.notification_datetime || '';
    $('notificationBarcode').value = r.barcode || '';
    $('notificationPatientName').value = r.patient_name || '';
    $('notificationIdIc').value = r.patient_id || '';
    $('notificationSex').value = r.sex || '';
    $('notificationAge').value = r.age || '';
    $('notificationUnit').value = r.unit || '';
    $('notificationDiscipline').value = r.discipline || '';
    populateTests();
    $('notificationTest').disabled = false;
    $('notificationTest').innerHTML = '<option value="' + esc(r.test_name || '') + '">' + esc(r.test_name || 'Current test') + '</option>';
    $('notificationResult').value = r.result || '';
    $('notificationStaff').value = r.staff || '';
    $('notificationInformTo').value = r.inform_to || '';
    $('notificationInformedTime').value = r.informed_time || '';
    $('notificationStatus').value = r.status || 'PENDING';
    $('notificationNotes').value = r.notes || '';
    var box = $('notificationCriticalLimit'); box.className = 'notification-critical-box'; box.innerHTML = '<strong>Critical Limit / Alert</strong><span>' + esc(r.critical_limit || 'Reference catalogue not loaded') + '</span>';
    setFlag(r.flag || 'REVIEW', r.flag && r.flag !== 'REVIEW' ? 'critical' : 'normal');
    $('notificationFormMode').textContent = 'EDIT RECORD';
    var page = $('notification'); if (page) page.querySelector('.notification-form-card').scrollIntoView({behavior:'smooth', block:'start'});
  }
  function open() {
    var page = $('notification');
    if (!page) return;
    document.querySelectorAll('.page.active').forEach(function (p) { p.classList.remove('active'); });
    document.querySelectorAll('.nav-btn.active').forEach(function (b) { b.classList.remove('active'); });
    var nav = document.querySelector('.nav-btn[data-page="notification"]'); if (nav) nav.classList.add('active');
    page.classList.add('active');
    clearForm();
    render();
  }
  function bind() {
    var back = $('notificationBackBtn'); if (back) back.addEventListener('click', function () { var b = document.querySelector('.nav-btn[data-page="dashboard"]'); if (b) b.click(); });
    var form = $('notificationForm'); if (form) form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (!form.checkValidity()) { form.reportValidity(); return; }
      var item = collectForm();
      var idx = records.findIndex(function (r) { return String(r.id) === String(item.id); });
      if (idx >= 0) records[idx] = item; else records.unshift(item);
      clearForm(); render();
    });
    var clear = $('notificationClearBtn'); if (clear) clear.addEventListener('click', clearForm);
    var ic = $('notificationIdIc'); if (ic) ic.addEventListener('input', function () { parseIc(this.value); });
    var discipline = $('notificationDiscipline'); if (discipline) discipline.addEventListener('change', function () { populateTests(); updateRuleAndFlag(); });
    var test = $('notificationTest'); if (test) test.addEventListener('change', updateRuleAndFlag);
    var result = $('notificationResult'); if (result) result.addEventListener('input', updateRuleAndFlag);
    ['notificationSearch','notificationMonthFilter','notificationDisciplineFilter','notificationFlagFilter','notificationStatusFilter'].forEach(function (id) { var el = $(id); if (el) el.addEventListener('input', function () { currentPage = 1; render(); }); });
    var body = $('notificationTableBody'); if (body) body.addEventListener('click', function (e) {
      var view = e.target.closest('[data-notification-view]'); if (view) { var r = records.find(function (x) { return String(x.id) === String(view.dataset.notificationView); }); if (r) showDetail(r); return; }
      var edit = e.target.closest('[data-notification-edit]'); if (edit) editRecord(edit.dataset.notificationEdit);
    });
  }

  window.LabNotification = { open: open, render: render, getRecords: function () { return records.slice(); } };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', bind); else bind();
})(window, document);
