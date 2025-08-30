import React from 'react';

function Dashboard({ navigateTo }) {
  const [active, setActive] = React.useState('dashboard');

  React.useEffect(() => {
    const email = localStorage.getItem('currentUserEmail');
    if (!email) {
      navigateTo('login');
    }
  }, [navigateTo]);

  // Services
  const DEFAULT_SERVICES = React.useMemo(() => ({
    'Consultation': 100,
    'Medical Certificate': 25,
    'Medical Clearance': 75
  }), []);

  function getServices() {
    const email = localStorage.getItem('currentUserEmail') || 'guest';
    const key = 'services:' + email;
    const raw = localStorage.getItem(key);
    if (!raw) return { ...DEFAULT_SERVICES };
    try { return { ...DEFAULT_SERVICES, ...JSON.parse(raw) }; } catch { return { ...DEFAULT_SERVICES }; }
  }

  const [services, setServices] = React.useState(getServices);
  const [editModal, setEditModal] = React.useState({ open: false, name: '', fee: 0 });

  function openEditServiceModal(name, fee) {
    setEditModal({ open: true, name, fee });
  }
  function closeModal() { setEditModal({ open: false, name: '', fee: 0 }); }
  function updateServiceFee() {
    const serviceName = editModal.name;
    const newFee = Number(editModal.fee);
    if (Number.isNaN(newFee) || newFee < 0) { alert('Please enter a valid fee.'); return; }
    const email = localStorage.getItem('currentUserEmail') || 'guest';
    const key = 'services:' + email;
    const existing = JSON.parse(localStorage.getItem(key) || '{}');
    existing[serviceName] = newFee;
    localStorage.setItem(key, JSON.stringify(existing));
    setServices(getServices());
    closeModal();
  }

  // Tickets
  const TICKETS_KEY = 'specialistTickets';
  function monthName(idx) {
    return ['January','February','March','April','May','June','July','August','September','October','November','December'][idx];
  }
  function formatDateLabel(dt, timeLabel) {
    return `${monthName(dt.getMonth())} ${dt.getDate()}, ${dt.getFullYear()} - ${timeLabel}`;
  }
  function generateDefaultTickets() {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const plusDays = (n) => new Date(today.getFullYear(), today.getMonth(), today.getDate() + n);
    return [
      { id: 'TKT-001', patient: 'John Doe', service: 'Consultation', when: formatDateLabel(plusDays(0), '10:30 AM'), status: 'Confirmed' },
      { id: 'TKT-002', patient: 'Jane Smith', service: 'Medical Certificate', when: formatDateLabel(plusDays(1), '2:15 PM'), status: 'Pending' },
      { id: 'TKT-003', patient: 'Robert Johnson', service: 'Medical Clearance', when: formatDateLabel(plusDays(2), '9:00 AM'), status: 'Confirmed' }
    ];
  }
  function getTickets() {
    const raw = localStorage.getItem(TICKETS_KEY);
    if (!raw) {
      const defaults = generateDefaultTickets();
      localStorage.setItem(TICKETS_KEY, JSON.stringify(defaults));
      return [...defaults];
    }
    try { return JSON.parse(raw); } catch { return generateDefaultTickets(); }
  }
  const [ticketFilter, setTicketFilter] = React.useState('All');
  const [tickets, setTickets] = React.useState(getTickets);
  const filteredTickets = React.useMemo(() => ticketFilter === 'All' ? tickets : tickets.filter(t => t.status.toLowerCase() === ticketFilter.toLowerCase()), [tickets, ticketFilter]);

  // --- Sync tickets into schedules ---
  function ticketYmdAndTime(ticket) {
    // Parse strings like "May 15, 2023 - 10:30 AM"
    const m = /^([A-Za-z]+\s+\d{1,2},\s+\d{4})\s+-\s+(.+)$/.exec(ticket.when || '');
    if (!m) return null;
    try {
      const dateOnly = new Date(m[1]);
      if (Number.isNaN(dateOnly.getTime())) return null;
      const yyyy = dateOnly.getFullYear();
      const mm = (dateOnly.getMonth() + 1).toString().padStart(2, '0');
      const dd = dateOnly.getDate().toString().padStart(2, '0');
      return { ymd: `${yyyy}-${mm}-${dd}`, time: m[2] };
    } catch { return null; }
  }
  function syncTicketsToSchedules(tix) {
    const all = getSchedules();
    let changed = false;
    (tix || []).forEach(t => {
      const parsed = ticketYmdAndTime(t);
      if (!parsed) return;
      const title = `Ticket ${t.id} - ${t.service}`;
      const time = parsed.time;
      const dateKey = parsed.ymd;
      all[dateKey] = all[dateKey] || [];
      const exists = all[dateKey].some(it => it.title === title && it.time === time);
      if (!exists) {
        all[dateKey].push({ title, time });
        changed = true;
      }
    });
    if (changed) {
      setSchedules(all);
      setSchedulesState({ ...all });
    }
  }
  // On first mount, ensure current tickets are synced
  React.useEffect(() => { syncTicketsToSchedules(getTickets()); }, []);

  function statusBadgeClass(status) {
    const s = (status || '').toLowerCase();
    if (s === 'confirmed' || s === 'processing') return 'status-confirmed';
    if (s === 'pending') return 'status-pending';
    if (s === 'completed') return 'status-confirmed';
    return 'status-pending';
  }

  const [ticketModal, setTicketModal] = React.useState({ open: false, ticket: null });
  function viewTicket(id) {
    const t = getTickets().find(x => x.id === id);
    if (!t) return;
    setTicketModal({ open: true, ticket: t });
  }
  function updateTicketStatus(newStatus) {
    const id = ticketModal.ticket?.id;
    if (!id) return;
    const all = getTickets();
    const idx = all.findIndex(t => t.id === id);
    if (idx >= 0) {
      all[idx].status = newStatus;
      localStorage.setItem(TICKETS_KEY, JSON.stringify(all));
      setTickets(all);
      // keep schedules in sync
      syncTicketsToSchedules(all);
      setTicketModal(m => ({ ...m, ticket: { ...m.ticket, status: newStatus } }));
    }
  }

  // Profile
  const [userName, setUserName] = React.useState('Dr. Specialist Name');
  const [avatarInitials, setAvatarInitials] = React.useState('DR');

  React.useEffect(() => {
    const email = localStorage.getItem('currentUserEmail');
    if (!email) return;
    const user = JSON.parse(localStorage.getItem(email) || '{}');
    const full = 'Dr. ' + (user.fName || 'Specialist') + ' ' + (user.lName || 'Name');
    setUserName(full);
    const initials = ((user.fName || 'D')[0] + (user.lName || 'R')[0]).toUpperCase();
    setAvatarInitials(initials);
    // If profile image is saved, render into avatar
    try {
      const profile = JSON.parse(localStorage.getItem('profile:'+email) || '{}');
      if (profile && profile.profileImage) {
        const avatarEl = document.getElementById('userAvatar');
        if (avatarEl) avatarEl.innerHTML = `<img src="${profile.profileImage}" alt="Profile Image" />`;
        const imgEl = document.getElementById('profileImage');
        if (imgEl) imgEl.src = profile.profileImage;
      }
    } catch(e) { /* ignore */ }
    // Populate Personal Data form fields from storage
    try {
      const firstNameEl = document.getElementById('firstName');
      const lastNameEl = document.getElementById('lastName');
      const emailEl = document.getElementById('email');
      if (firstNameEl) firstNameEl.value = user.fName || firstNameEl.value;
      if (lastNameEl) lastNameEl.value = user.lName || lastNameEl.value;
      if (emailEl) emailEl.value = email;
      const profile = JSON.parse(localStorage.getItem('profile:'+email) || '{}');
      if (profile) {
        const phoneEl = document.getElementById('phone');
        const prcEl = document.getElementById('prcNumber');
        const specEl = document.getElementById('specialization');
        const subEl = document.getElementById('subSpecialization');
        const bioEl = document.getElementById('bio');
        const prcImg = document.getElementById('prcPreview');
        if (phoneEl && profile.phone) phoneEl.value = profile.phone;
        if (prcEl && profile.prcNumber) prcEl.value = profile.prcNumber;
        if (prcImg && profile.prcImage) prcImg.src = profile.prcImage;
        if (specEl && profile.specialization) specEl.value = profile.specialization;
        // Rebuild sub specialization options and assign value
        if (specEl && subEl) {
          const SUB_SPECIALIZATIONS = {
            'Cardiology': ['Interventional Cardiology','Electrophysiology','Heart Failure','Pediatric Cardiology'],
            'Dermatology': ['Cosmetic Dermatology','Mohs Surgery','Pediatric Dermatology','Dermatopathology'],
            'Orthopedics': ['Sports Medicine','Spine Surgery','Hand Surgery','Joint Replacement'],
            'Pediatrics': ['Neonatology','Pediatric Neurology','Pediatric Cardiology','Pediatric Endocrinology'],
            'Internal Medicine': ['Endocrinology','Gastroenterology','Pulmonology','Nephrology','Rheumatology','Infectious Disease'],
            'Neurology': ['Stroke','Epilepsy','Movement Disorders','Neuromuscular'],
            'Ophthalmology': ['Glaucoma','Retina','Cornea','Pediatric Ophthalmology'],
            'Obstetrics & Gynecology': ['Maternal-Fetal Medicine','Reproductive Endocrinology','Gynecologic Oncology','Urogynecology'],
            'Otolaryngology (ENT)': ['Rhinology','Laryngology','Otology','Head & Neck Surgery'],
            'Psychiatry': ['Child & Adolescent','Addiction','Geriatric','Consultation-Liaison'],
            'Urology': ['Endourology','Urologic Oncology','Pediatric Urology','Female Urology']
          };
          const options = SUB_SPECIALIZATIONS[specEl.value] || [];
          subEl.innerHTML = '<option value="">Select sub specialization</option>' + options.map(o => `<option value="${o}">${o}</option>`).join('');
          if (profile.subSpecialization) subEl.value = profile.subSpecialization;
        }
        if (bioEl && profile.bio) bioEl.value = profile.bio;
      }
    } catch(e) { /* ignore */ }
  }, []);

  // Schedule
  const SCHEDULE_KEY_PREFIX = 'schedule:';
  const [currentYear, setCurrentYear] = React.useState(new Date().getFullYear());
  const [currentMonth, setCurrentMonth] = React.useState(new Date().getMonth());
  function getScheduleStoreKey() {
    const email = localStorage.getItem('currentUserEmail') || 'guest';
    return SCHEDULE_KEY_PREFIX + email;
  }
  function getSchedules() {
    const raw = localStorage.getItem(getScheduleStoreKey());
    if (!raw) return {};
    try { return JSON.parse(raw); } catch { return {}; }
  }
  function setSchedules(data) {
    localStorage.setItem(getScheduleStoreKey(), JSON.stringify(data));
  }
  function monthLabel(y, m) {
    return new Date(y, m, 1).toLocaleString(undefined, { month: 'long', year: 'numeric' });
  }
  function ymd(y, m, d) {
    const mm = (m + 1).toString().padStart(2, '0');
    const dd = d.toString().padStart(2, '0');
    return `${y}-${mm}-${dd}`;
  }

  const [schedules, setSchedulesState] = React.useState(getSchedules);
  React.useEffect(() => { setSchedulesState(getSchedules()); }, [currentYear, currentMonth]);

  const [newSched, setNewSched] = React.useState({ open: false, date: '', title: '', time: '' });
  const timeOptions = React.useMemo(() => {
    const results = [];
    const toLabel = (h, m) => {
      const period = h >= 12 ? 'PM' : 'AM';
      const hour12 = ((h + 11) % 12) + 1;
      const mm = m.toString().padStart(2, '0');
      return `${hour12}:${mm} ${period}`;
    };
    for (let h = 6; h <= 20; h++) { // 6:00 AM to 8:00 PM
      for (let m = 0; m < 60; m += 30) {
        results.push(toLabel(h, m));
      }
    }
    return results;
  }, []);
  function openDay(dateStr) {
    setNewSched({ open: true, date: dateStr, title: '', time: '' });
  }
  function openNewScheduleModal(prefillDate) {
    setNewSched({ open: true, date: prefillDate, title: '', time: '' });
  }
  function saveNewSchedule() {
    const date = newSched.date;
    const title = (newSched.title || '').trim();
    const time = (newSched.time || '').trim();
    if (!date || !title || !time) { alert('Please enter date, title, and time.'); return; }
    const all = getSchedules();
    all[date] = all[date] || [];
    all[date].push({ title, time });
    setSchedules(all);
    setSchedulesState(all);
    setNewSched({ open: false, date: '', title: '', time: '' });
  }
  function removeSchedule(date, index) {
    const all = getSchedules();
    const items = all[date] || [];
    items.splice(index, 1);
    all[date] = items;
    setSchedules(all);
    setSchedulesState({ ...all });
  }

  function logout() {
    if (!window.confirm('Are you sure you want to logout?')) return;
    localStorage.removeItem('currentUserEmail');
    navigateTo('login');
  }

  return (
    <div>
      <style>{`
        :root { --primary:#4AA7ED; --secondary:#BFESF9; --navy:#0B5388; --accent:#0AADEF; --light-bg:#F5F0F0; --dark:#000000; --white:#FFFFFF; --offwhite:#FFFFFB; --gray:#7A7A7A; --light-gray:#E5E5E5; --success:#4CAF50; --warning:#FF9800; --danger:#F44336; }
        * { margin:0; padding:0; box-sizing:border-box; font-family:'Poppins', sans-serif; }
        body { background:#BFE5F9; }
        .sidebar { width:260px; background:var(--navy); color:var(--white); height:100vh; position:fixed; overflow-y:auto; }
        .logo-container { padding:1.5rem 1rem; border-bottom:1px solid rgba(255,255,255,0.1); }
        .logo { font-size:1.5rem; font-weight:700; display:flex; align-items:center; gap:10px; }
        .nav-menu { padding:1.5rem 0; }
        .nav-item { padding:0.9rem 1.5rem; display:flex; align-items:center; gap:12px; cursor:pointer; transition:all 0.3s; }
        .nav-item:hover, .nav-item.active { background:rgba(255,255,255,0.1); }
        .nav-item i { font-size:1.2rem; }
        .main-content { min-height:100vh; background:#BFE5F9; margin-left:260px; padding:1.5rem 2rem; display:block; }
        .main-content .container { max-width:1200px !important; margin:0 auto; padding-left:16px; padding-right:16px; }
        .header { display:flex; justify-content:space-between; align-items:center; margin-bottom:1.5rem; padding-bottom:1rem; border-bottom:1px solid var(--light-gray); }
        .page-title { font-size:1.8rem; color:var(--navy); }
        .user-menu { display:flex; align-items:center; gap:15px; }
        .user-profile { display:flex; align-items:center; gap:10px; }
        .avatar { width:40px; height:40px; border-radius:50%; background:var(--primary); display:flex; align-items:center; justify-content:center; color:white; font-weight:600; overflow:hidden; }
        .avatar img { width:100%; height:100%; object-fit:cover; border-radius:50%; display:block; }
        .dashboard-content { display:none; }
        .dashboard-content.active { display:block; }
        .filters { display:flex; gap:15px; margin-bottom:1.5rem; flex-wrap:wrap; }
        .filter-item { padding:0.6rem 1rem; background:var(--white); border-radius:8px; border:1px solid var(--light-gray); cursor:pointer; }
        .filter-item.active { background:var(--primary); color:var(--white); }
        .ticket-list { background:var(--white); border-radius:12px; overflow:hidden; box-shadow:0 4px 12px rgba(0,0,0,0.05); }
        .table-header { display:grid; grid-template-columns:1fr 1fr 1fr 1fr 0.7fr; padding:1rem; background:var(--light-bg); font-weight:600; }
        .ticket-row { display:grid; grid-template-columns:1fr 1fr 1fr 1fr 0.7fr; padding:1rem; border-bottom:1px solid var(--light-gray); align-items:center; }
        .ticket-row:last-child { border-bottom:none; }
        .status-badge { padding:0.3rem 0.8rem; border-radius:20px; font-size:0.8rem; display:inline-block; }
        .status-confirmed { background:#E8F5E9; color:var(--success); }
        .status-pending { background:#FFF8E1; color:var(--warning); }
        .status-cancelled { background:#FFEBEE; color:var(--danger); }
        .action-btn { padding:0.5rem 1rem; border:none; border-radius:6px; cursor:pointer; background:var(--primary); color:white; }
        .profile-section { background:var(--white); border-radius:12px; padding:1.5rem; box-shadow:0 4px 12px rgba(0,0,0,0.05); }
        .section-title { font-size:1.4rem; margin-bottom:1.5rem; color:var(--navy); padding-bottom:0.5rem; border-bottom:1px solid var(--light-gray); }
        .form-grid { display:grid; grid-template-columns:1fr 1fr; gap:1.5rem; }
        .input-group { margin-bottom:1rem; }
        .input-group label { display:block; margin-bottom:0.5rem; font-weight:500; }
        .input-group input, .input-group select, .input-group textarea { width:100%; padding:0.8rem; border:1px solid var(--light-gray); border-radius:8px; font-size:1rem; }
        .full-width { grid-column:1 / -1; }
        .profile-image-upload { display:flex; align-items:center; gap:1rem; }
        .profile-img { width:100px; height:100px; border-radius:50%; object-fit:cover; border:2px solid var(--primary); }
        .upload-btn { padding:0.7rem 1.5rem; background:var(--light-bg); border:1px dashed var(--gray); border-radius:8px; cursor:pointer; }
        .btn-primary { padding:0.8rem 1.5rem; background:var(--primary); color:white; border:none; border-radius:8px; cursor:pointer; font-weight:500; }
        .calendar-container { background:var(--white); border-radius:12px; padding:1.5rem; box-shadow:0 4px 12px rgba(0,0,0,0.05); }
        .calendar-header { display:flex; justify-content:space-between; align-items:center; margin-bottom:1.5rem; }
        .calendar-nav { display:flex; gap:10px; align-items:center; }
        .current-month { font-size:1.4rem; font-weight:600; }
        .calendar-grid { display:grid; grid-template-columns:repeat(7, 1fr); gap:5px; }
        .calendar-day { height:100px; border:1px solid var(--light-gray); padding:0.5rem; overflow-y:auto; }
        .day-header { text-align:center; padding:0.5rem; font-weight:600; background:var(--light-bg); }
        .other-month { color:var(--gray); background:#f9f9f9; }
        .has-appointment { background:#E3F2FD; cursor:pointer; }
        .appointment-badge { font-size:0.8rem; padding:0.2rem 0.4rem; background:var(--primary); color:white; border-radius:4px; margin-bottom:0.3rem; }
        .services-container { background:var(--white); border-radius:12px; padding:1.5rem; box-shadow:0 4px 12px rgba(0,0,0,0.05); }
        .service-item { display:grid; grid-template-columns:minmax(0,1fr) auto auto; column-gap:16px; align-items:center; padding:1rem; border-bottom:1px solid var(--light-gray); }
        .service-item:last-child { border-bottom:none; }
        .service-info { display:flex; flex-direction:column; text-align:left; }
        .service-name { font-weight:600; }
        .service-fee { color:var(--gray); text-align:right; min-width:120px; }
        .edit-btn { padding:0.5rem 1rem; background:transparent; border:1px solid var(--primary); color:var(--primary); border-radius:6px; cursor:pointer; }
        .transactions-table { width:100%; border-collapse:collapse; margin-top:1rem; }
        .transactions-table th, .transactions-table td { padding:1rem; text-align:left; border-bottom:1px solid var(--light-gray); }
        .transactions-table th { background:var(--light-bg); font-weight:600; }
        .clear-btn { padding:0.5rem 1rem; background:transparent; border:1px solid var(--success); color:var(--success); border-radius:6px; cursor:pointer; }
        @media (max-width: 992px) { .sidebar { width:80px;} .sidebar .nav-text { display:none;} .main-content { margin-left:80px;} }
        @media (max-width: 768px) { .form-grid { grid-template-columns:1fr;} .table-header, .ticket-row { grid-template-columns:1fr; gap:0.5rem;} .filters { flex-direction:column;} }
        @media (max-width: 480px) { .sidebar { width:64px;} .main-content { margin-left:64px; padding:1rem;} .page-title { font-size:1.3rem;} .user-menu { gap:10px;} .avatar { width:32px; height:32px; font-size:0.85rem;} .btn-primary { padding:0.6rem 1rem; font-size:0.9rem;} .edit-btn { padding:0.4rem 0.8rem; font-size:0.9rem;} .profile-img { width:80px; height:80px;} .upload-btn { padding:0.5rem 1rem;} .calendar-day { height:72px; padding:0.4rem;} .appointment-badge { font-size:0.7rem;} .table-header, .ticket-row { font-size:0.95rem;} .ticket-row > div { word-break:break-word;} }
      `}</style>
      <div className="sidebar">
        <div className="logo-container">
          <div className="logo">
            <i className="fas fa-hospital-heart"></i>
            <span className="nav-text">Okiedoc+</span>
          </div>
        </div>
        <div className="nav-menu">
          {[
            { key: 'dashboard', icon: 'fas fa-th-large', text: 'Dashboard' },
            { key: 'profile', icon: 'fas fa-user', text: 'Personal Data' },
            { key: 'schedule', icon: 'fas fa-calendar-alt', text: 'Schedules' },
            { key: 'services', icon: 'fas fa-first-aid', text: 'Services & Fees' },
            { key: 'transactions', icon: 'fas fa-money-bill-wave', text: 'Transactions' }
          ].map(item => (
            <div key={item.key} className={`nav-item ${active === item.key ? 'active' : ''}`} onClick={() => setActive(item.key)}>
              <i className={item.icon}></i>
              <span className="nav-text">{item.text}</span>
            </div>
          ))}
          <div className="nav-item" onClick={logout}>
            <i className="fas fa-sign-out-alt"></i>
            <span className="nav-text">Logout</span>
          </div>
        </div>
      </div>

      <div className="main-content" id="app">
        <div className="header container">
          <h1 className="page-title" id="pageTitle">{({
            dashboard: 'Dashboard',
            profile: 'Personal Data',
            schedule: 'Schedules',
            services: 'Services & Fees',
            transactions: 'Transactions'
          })[active]}</h1>
          <div className="user-menu">
            <div className="user-profile">
              <div className="avatar" id="userAvatar">
                <span id="avatarInitials">{avatarInitials}</span>
              </div>
              <div className="user-info">
                <div className="user-name" id="userName">{userName}</div>
                <div className="user-role">Specialist</div>
              </div>
            </div>
          </div>
        </div>

        <div className={`dashboard-content ${active === 'dashboard' ? 'active' : ''} container`} id="dashboard">
          <div className="filters">
            {['All Tickets','Confirmed','Pending','Completed'].map(label => (
              <div key={label} className={`filter-item ${ticketFilter === (label === 'All Tickets' ? 'All' : label) ? 'active' : ''}`} onClick={() => setTicketFilter(label === 'All Tickets' ? 'All' : label)}>{label}</div>
            ))}
          </div>
          <div className="ticket-list">
            <div className="table-header">
              <div>Patient Name</div>
              <div>Service Type</div>
              <div>Date & Time</div>
              <div>Status</div>
              <div>Action</div>
            </div>
            <div id="ticketRows">
              {filteredTickets.length === 0 ? (
                <div style={{ padding: '1rem', color: '#7A7A7A' }}>No tickets found.</div>
              ) : (
                filteredTickets.map(t => (
                  <div key={t.id} className="ticket-row" data-id={t.id}>
                    <div>{t.patient}</div>
                    <div>{t.service}</div>
                    <div>{t.when}</div>
                    <div><span className={`status-badge ${statusBadgeClass(t.status)}`}>{t.status}</span></div>
                    <div><button className="action-btn" onClick={() => viewTicket(t.id)}>View</button></div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        <div className={`dashboard-content ${active === 'profile' ? 'active' : ''} container`} id="profile">
          <div className="profile-section">
            <h2 className="section-title">Personal Information</h2>
            <div className="profile-image-upload">
              <img src="" alt="Profile Image" className="profile-img" id="profileImage" />
              <div>
                <div className="upload-btn" onClick={() => document.getElementById('fileUpload').click()}>
                  <i className="fas fa-upload"></i> Upload Photo
                </div>
                <input type="file" id="fileUpload" style={{ display: 'none' }} accept="image/*" onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    const reader = new FileReader();
                    reader.onload = function(ev) {
                      const imgEl = document.getElementById('profileImage');
                      const avatarEl = document.getElementById('userAvatar');
                      if (imgEl) imgEl.src = ev.target.result;
                      if (avatarEl) avatarEl.innerHTML = `<img src="${ev.target.result}" alt="Profile Image" />`;
                      const email = localStorage.getItem('currentUserEmail');
                      if (email) {
                        const profile = JSON.parse(localStorage.getItem('profile:'+email) || '{}');
                        profile.profileImage = ev.target.result;
                        localStorage.setItem('profile:'+email, JSON.stringify(profile));
                      }
                    };
                    reader.readAsDataURL(e.target.files[0]);
                  }
                }} />
              </div>
            </div>
            <form className="form-grid">
              <div className="input-group"><label htmlFor="firstName">First Name</label><input type="text" id="firstName" defaultValue="John" /></div>
              <div className="input-group"><label htmlFor="lastName">Last Name</label><input type="text" id="lastName" defaultValue="Doe" /></div>
              <div className="input-group"><label htmlFor="email">Email</label><input type="email" id="email" defaultValue="john.doe@example.com" /></div>
              <div className="input-group"><label htmlFor="phone">Phone Number</label><input type="tel" id="phone" defaultValue="+63 " /></div>
              <div className="input-group"><label htmlFor="prcNumber">PRC License Number</label><input type="text" id="prcNumber" placeholder="e.g., 1234567" /></div>
              <div className="profile-image-upload">
                <img src="" alt="PRC License" className="profile-img" id="prcPreview" />
                <div>
                  <div className="upload-btn" onClick={() => document.getElementById('prcUpload').click()}>
                    <i className="fas fa-upload"></i> Upload PRC License Photo
                  </div>
                  <input type="file" id="prcUpload" style={{ display: 'none' }} accept="image/*" onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      const reader = new FileReader();
                      reader.onload = function(ev) {
                        const prcImg = document.getElementById('prcPreview');
                        if (prcImg) prcImg.src = ev.target.result;
                        const email = localStorage.getItem('currentUserEmail');
                        if (email) {
                          const profile = JSON.parse(localStorage.getItem('profile:'+email) || '{}');
                          profile.prcImage = ev.target.result;
                          localStorage.setItem('profile:'+email, JSON.stringify(profile));
                        }
                      };
                      reader.readAsDataURL(e.target.files[0]);
                    }
                  }} />
                </div>
              </div>
              <div className="input-group full-width">
                <label htmlFor="specialization">Specialization</label>
                <select id="specialization" onChange={() => {
                  const specEl = document.getElementById('specialization');
                  const subEl = document.getElementById('subSpecialization');
                  const SUB_SPECIALIZATIONS = {
                    'Cardiology': ['Interventional Cardiology','Electrophysiology','Heart Failure','Pediatric Cardiology'],
                    'Dermatology': ['Cosmetic Dermatology','Mohs Surgery','Pediatric Dermatology','Dermatopathology'],
                    'Orthopedics': ['Sports Medicine','Spine Surgery','Hand Surgery','Joint Replacement'],
                    'Pediatrics': ['Neonatology','Pediatric Neurology','Pediatric Cardiology','Pediatric Endocrinology'],
                    'Internal Medicine': ['Endocrinology','Gastroenterology','Pulmonology','Nephrology','Rheumatology','Infectious Disease'],
                    'Neurology': ['Stroke','Epilepsy','Movement Disorders','Neuromuscular'],
                    'Ophthalmology': ['Glaucoma','Retina','Cornea','Pediatric Ophthalmology'],
                    'Obstetrics & Gynecology': ['Maternal-Fetal Medicine','Reproductive Endocrinology','Gynecologic Oncology','Urogynecology'],
                    'Otolaryngology (ENT)': ['Rhinology','Laryngology','Otology','Head & Neck Surgery'],
                    'Psychiatry': ['Child & Adolescent','Addiction','Geriatric','Consultation-Liaison'],
                    'Urology': ['Endourology','Urologic Oncology','Pediatric Urology','Female Urology']
                  };
                  const options = SUB_SPECIALIZATIONS[specEl.value] || [];
                  subEl.innerHTML = '<option value="">Select sub specialization</option>' + options.map(o => `<option value="${o}">${o}</option>`).join('');
                }}>
                  <option value="">Select specialization</option>
                  {['Cardiology','Dermatology','Orthopedics','Pediatrics','Internal Medicine','Neurology','Ophthalmology','Obstetrics & Gynecology','Otolaryngology (ENT)','Psychiatry','Urology'].map(v => <option key={v} value={v}>{v}</option>)}
                </select>
              </div>
              <div className="input-group full-width">
                <label htmlFor="subSpecialization">Sub Specialization</label>
                <select id="subSpecialization"><option value="">Select sub specialization</option></select>
              </div>
              <div className="input-group full-width">
                <label htmlFor="bio">Bio</label>
                <textarea id="bio" rows="4" defaultValue="Board-certified cardiologist with 10 years of experience."></textarea>
              </div>
              <div className="full-width">
                <button type="button" className="btn-primary" onClick={() => {
                  const email = localStorage.getItem('currentUserEmail');
                  if (!email) { navigateTo('login'); return; }
                  const fName = document.getElementById('firstName').value.trim();
                  const lName = document.getElementById('lastName').value.trim();
                  const phone = document.getElementById('phone').value.trim();
                  const prcNumber = document.getElementById('prcNumber').value.trim();
                  const specialization = document.getElementById('specialization').value;
                  const subSpecialization = document.getElementById('subSpecialization').value;
                  const bio = document.getElementById('bio').value.trim();
                  const user = JSON.parse(localStorage.getItem(email) || '{}');
                  user.fName = fName || user.fName;
                  user.lName = lName || user.lName;
                  localStorage.setItem(email, JSON.stringify(user));
                  const existing = JSON.parse(localStorage.getItem('profile:'+email) || '{}');
                  const profile = Object.assign(existing, { phone, prcNumber, specialization, subSpecialization, bio });
                  localStorage.setItem('profile:'+email, JSON.stringify(profile));
                  setUserName('Dr. ' + (user.fName || 'Specialist') + ' ' + (user.lName || 'Name'));
                  setAvatarInitials(((user.fName || 'D')[0] + (user.lName || 'R')[0]).toUpperCase());
                  alert('Profile saved successfully.');
                }}>Save Changes</button>
              </div>
            </form>
          </div>

          <div className="profile-section" style={{ marginTop: '2rem' }}>
            <h2 className="section-title">Change Password</h2>
            <form className="form-grid">
              <div className="input-group"><label htmlFor="currentPassword">Current Password</label><input type="password" id="currentPassword" /></div>
              <div className="input-group"><label htmlFor="newPassword">New Password</label><input type="password" id="newPassword" /></div>
              <div className="input-group"><label htmlFor="confirmPassword">Confirm New Password</label><input type="password" id="confirmPassword" /></div>
              <div className="full-width"><button type="button" className="btn-primary" onClick={() => {
                const email = localStorage.getItem('currentUserEmail');
                if (!email) { navigateTo('login'); return; }
                const current = document.getElementById('currentPassword').value;
                const next = document.getElementById('newPassword').value;
                const confirmNext = document.getElementById('confirmPassword').value;
                if (!current || !next || !confirmNext) { alert('Please fill in all password fields.'); return; }
                if (next.length < 3) { alert('New password must be at least 3 characters.'); return; }
                if (next !== confirmNext) { alert('New passwords do not match.'); return; }
                const user = JSON.parse(localStorage.getItem(email) || '{}');
                if (!user || user.password !== current) { alert('Current password is incorrect.'); return; }
                user.password = next; localStorage.setItem(email, JSON.stringify(user));
                document.getElementById('currentPassword').value = '';
                document.getElementById('newPassword').value = '';
                document.getElementById('confirmPassword').value = '';
                alert('Password updated successfully.');
              }}>Update Password</button></div>
            </form>
          </div>
        </div>

        <div className={`dashboard-content ${active === 'schedule' ? 'active' : ''} container`} id="schedule">
          <div className="calendar-container">
            <div className="calendar-header">
              <div className="current-month" id="currentMonthLabel">{new Date(currentYear, currentMonth, 1).toLocaleString(undefined, { month: 'long', year: 'numeric' })}</div>
              <div className="calendar-nav">
                <button className="edit-btn" onClick={() => { const m = currentMonth - 1; if (m < 0) { setCurrentMonth(11); setCurrentYear(y => y - 1);} else setCurrentMonth(m); }}>
                  <i className="fas fa-chevron-left"></i>
                </button>
                <button className="btn-primary" onClick={() => { const now = new Date(); setCurrentYear(now.getFullYear()); setCurrentMonth(now.getMonth()); }}>Today</button>
                <button className="edit-btn" onClick={() => { const m = currentMonth + 1; if (m > 11) { setCurrentMonth(0); setCurrentYear(y => y + 1);} else setCurrentMonth(m); }}>
                  <i className="fas fa-chevron-right"></i>
                </button>
                <button className="btn-primary" onClick={() => { const now = new Date(); const yyyy = currentYear; const mm = currentMonth; const dd = now.getDate(); const date = `${yyyy}-${(mm+1).toString().padStart(2,'0')}-${dd.toString().padStart(2,'0')}`; openNewScheduleModal(date); }}>
                  <i className="fas fa-plus"></i> New Schedule
                </button>
              </div>
            </div>
            <div className="calendar-grid" id="calendarGrid">
              {['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].map(d => <div key={d} className="day-header">{d}</div>)}
              {(() => {
                const firstDay = new Date(currentYear, currentMonth, 1);
                const startWeekday = firstDay.getDay();
                const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
                const prevDays = new Date(currentYear, currentMonth, 0).getDate();
                const cells = [];
                for (let i = 0; i < startWeekday; i++) {
                  const dayNum = prevDays - startWeekday + 1 + i;
                  cells.push(<div key={'p'+i} className="calendar-day other-month">{dayNum}</div>);
                }
                const all = schedules;
                for (let d = 1; d <= daysInMonth; d++) {
                  const mm = (currentMonth + 1).toString().padStart(2, '0');
                  const dd = d.toString().padStart(2, '0');
                  const cellDate = `${currentYear}-${mm}-${dd}`;
                  const items = all[cellDate] || [];
                  cells.push(
                    <div key={cellDate} className={`calendar-day ${items.length > 0 ? 'has-appointment' : ''}`} data-date={cellDate} onClick={() => openDay(cellDate)}>
                      {d}
                      {items.slice(0,2).map((it, idx) => <div key={idx} className="appointment-badge">{`${it.time} - ${it.title}`}</div>)}
                      {items.length > 2 && <div className="appointment-badge">+{items.length - 2} more</div>}
                    </div>
                  );
                }
                const totalCells = 7 + cells.length; // headers are 7
                const remainder = totalCells % 7;
                if (remainder !== 0) {
                  const toAdd = 7 - remainder;
                  for (let i = 1; i <= toAdd; i++) {
                    cells.push(<div key={'n'+i} className="calendar-day other-month">{i}</div>);
                  }
                }
                return cells;
              })()}
            </div>
          </div>
        </div>

        <div className={`dashboard-content ${active === 'services' ? 'active' : ''} container`} id="services">
          <div className="services-container">
            <h2 className="section-title">Professional Fees</h2>
            <div id="servicesList">
              {Object.keys(services).map(name => (
                <div key={name} className="service-item">
                  <div className="service-info">
                    <div className="service-name">{name}</div>
                  </div>
                  <div className="service-fee">₱{Number(services[name]).toFixed(2)}</div>
                  <button className="edit-btn" onClick={() => openEditServiceModal(name, services[name])}>Edit</button>
                </div>
              ))}
            </div>
          </div>
          <div className="services-container" style={{ marginTop: '2rem' }}>
            <h2 className="section-title">Disbursement Account</h2>
            <div className="form-grid">
              <div className="input-group"><label>Account Type</label>
                <select id="accountType" onChange={(e) => {
                  const type = e.target.value;
                  document.getElementById('bankAccountName').style.display = type === 'bank' ? 'block' : 'none';
                  document.getElementById('bankAccountNumber').style.display = type === 'bank' ? 'block' : 'none';
                  document.getElementById('gcashPhone').style.display = type === 'gcash' ? 'block' : 'none';
                  const qrBlock = document.getElementById('gcashQrBlock');
                  if (qrBlock) qrBlock.style.display = type === 'gcash' ? 'block' : 'none';
                }}>
                  <option value="bank">Bank Account</option>
                  <option value="gcash">GCash</option>
                </select>
              </div>
              <div className="input-group" id="bankAccountName"><label htmlFor="accountName">Account Name</label><input type="text" id="accountName" defaultValue="John Doe" /></div>
              <div className="input-group" id="bankAccountNumber"><label htmlFor="accountNumber">Account Number</label><input type="text" id="accountNumber" defaultValue="XXXX-XXXX-XXXX-1234" /></div>
              <div className="input-group" id="gcashPhone" style={{ display: 'none' }}><label htmlFor="gcashNumber">Phone Number</label><input type="tel" id="gcashNumber" defaultValue="+63 " /></div>
            </div>
            <div id="gcashQrBlock" style={{ display: 'none', marginTop: '1rem' }}>
              <div className="profile-image-upload">
                <img src="" alt="GCash QR" className="profile-img" id="gcashQrPreview" />
                <div>
                  <div className="upload-btn" onClick={() => document.getElementById('gcashQrUpload').click()}>
                    <i className="fas fa-upload"></i> Upload GCash QR
                  </div>
                  <input type="file" id="gcashQrUpload" style={{ display: 'none' }} accept="image/*" onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      const reader = new FileReader();
                      reader.onload = function(ev) {
                        const qrImg = document.getElementById('gcashQrPreview');
                        if (qrImg) qrImg.src = ev.target.result;
                      };
                      reader.readAsDataURL(e.target.files[0]);
                    }
                  }} />
                </div>
              </div>
            </div>
            <div style={{ marginTop: '1rem' }}>
              <button className="btn-primary" onClick={() => {
                const email = localStorage.getItem('currentUserEmail') || 'guest';
                const key = 'account:' + email;
                const accountType = document.getElementById('accountType').value;
                const accountName = (document.getElementById('accountName').value || '').trim();
                const accountNumber = (document.getElementById('accountNumber').value || '').trim();
                const gcashNumber = (document.getElementById('gcashNumber').value || '').trim();
                const payload = { accountType, accountName, accountNumber, gcashNumber };
                const qrImg = document.getElementById('gcashQrPreview');
                if (qrImg && qrImg.src) payload.gcashQr = qrImg.src;
                localStorage.setItem(key, JSON.stringify(payload));
                alert('Account details saved.');
              }}>Save Account Details</button>
            </div>
          </div>
        </div>

        <div className={`dashboard-content ${active === 'transactions' ? 'active' : ''} container`} id="transactions">
          <div className="services-container">
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
              <h2 className="section-title" style={{ marginBottom:0 }}>Payments to be Disbursed</h2>
              <button className="clear-btn" onClick={() => {
                if (!window.confirm('Clear all pending/processing payments?')) return;
                const tbody = document.querySelector('#paymentsTable tbody');
                if (tbody) tbody.innerHTML = '';
              }}>Clear</button>
            </div>
            <table id="paymentsTable" className="transactions-table"><thead><tr><th>Ticket #</th><th>Patient</th><th>Service</th><th>Amount</th><th>Status</th></tr></thead><tbody>
              <tr><td>TKT-001</td><td>John Doe</td><td>Consultation</td><td>₱100.00</td><td><span className="status-badge status-pending">Pending</span></td></tr>
              <tr><td>TKT-003</td><td>Robert Johnson</td><td>Medical Clearance</td><td>₱75.00</td><td><span className="status-badge status-confirmed">Processing</span></td></tr>
            </tbody></table>
          </div>
          <div className="services-container" style={{ marginTop: '2rem' }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
              <h2 className="section-title" style={{ marginBottom:0 }}>HMO Transactions</h2>
              <button className="clear-btn" onClick={() => {
                if (!window.confirm('Clear all HMO transactions?')) return;
                const tbody = document.querySelector('#hmoTable tbody');
                if (tbody) tbody.innerHTML = '';
              }}>Clear</button>
            </div>
            <table id="hmoTable" className="transactions-table"><thead><tr><th>Ticket #</th><th>Patient</th><th>Service</th><th>HMO Provider</th><th>Status</th></tr></thead><tbody>
              <tr><td>TKT-002</td><td>Jane Smith</td><td>Medical Certificate</td><td>Maxicare</td><td><span className="status-badge status-pending">Verification</span></td></tr>
            </tbody></table>
          </div>
        </div>
      </div>

      {editModal.open && (
        <div className="modal" style={{ display: 'flex', position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }} onClick={(e) => { if (e.target.classList.contains('modal')) closeModal(); }}>
          <div className="modal-content" style={{ background: '#fff', padding: '2rem', borderRadius: '12px', width: '90%', maxWidth: '500px', maxHeight: '90vh', overflowY: 'auto' }}>
            <div className="modal-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h2>Edit Service Fee</h2>
              <span className="close-modal" style={{ fontSize: '1.5rem', cursor: 'pointer' }} onClick={closeModal}>&times;</span>
            </div>
            <div className="input-group"><label htmlFor="serviceName">Service Name</label><input id="serviceName" value={editModal.name} readOnly /></div>
            <div className="input-group"><label htmlFor="serviceFee">Professional Fee ($)</label><input id="serviceFee" type="number" min="0" step="0.01" value={editModal.fee} onChange={(e) => setEditModal(m => ({ ...m, fee: e.target.value }))} /></div>
            <div style={{ marginTop: '1.5rem' }}><button className="btn-primary" onClick={updateServiceFee}>Update Fee</button></div>
          </div>
        </div>
      )}

      {ticketModal.open && (
        <div className="modal" style={{ display: 'flex', position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }} onClick={(e) => { if (e.target.classList.contains('modal')) setTicketModal({ open: false, ticket: null }); }}>
          <div className="modal-content" style={{ background: '#fff', padding: '2rem', borderRadius: '12px', width: '90%', maxWidth: '520px', maxHeight: '90vh', overflowY: 'auto' }}>
            <div className="modal-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h2>Ticket Details</h2>
              <span className="close-modal" style={{ fontSize: '1.5rem', cursor: 'pointer' }} onClick={() => setTicketModal({ open: false, ticket: null })}>&times;</span>
            </div>
            <div className="input-group"><label>Ticket #</label><input readOnly value={ticketModal.ticket?.id || ''} /></div>
            <div className="input-group"><label>Patient</label><input readOnly value={ticketModal.ticket?.patient || ''} /></div>
            <div className="input-group"><label>Service</label><input readOnly value={ticketModal.ticket?.service || ''} /></div>
            <div className="input-group"><label>Date & Time</label><input readOnly value={ticketModal.ticket?.when || ''} /></div>
            <div className="input-group"><label>Status</label><input readOnly value={ticketModal.ticket?.status || ''} /></div>
            <div style={{ marginTop: '1.2rem', display: 'flex', gap: '10px' }}>
              <button className="btn-primary" onClick={() => updateTicketStatus('Confirmed')}>Mark Confirmed</button>
              <button className="edit-btn" onClick={() => updateTicketStatus('Completed')}>Mark Completed</button>
            </div>
          </div>
        </div>
      )}

      {newSched.open && (
        <div className="modal" style={{ display: 'flex', position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }} onClick={(e) => { if (e.target.classList.contains('modal')) setNewSched({ open: false, date: '', title: '', time: '' }); }}>
          <div className="modal-content" style={{ background: '#fff', padding: '2rem', borderRadius: '12px', width: '90%', maxWidth: '520px', maxHeight: '90vh', overflowY: 'auto' }}>
            <div className="modal-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h2>New Schedule</h2>
              <span className="close-modal" style={{ fontSize: '1.5rem', cursor: 'pointer' }} onClick={() => setNewSched({ open: false, date: '', title: '', time: '' })}>&times;</span>
            </div>
            <div className="input-group"><label>Date (YYYY-MM-DD)</label><input value={newSched.date} onChange={(e) => setNewSched(s => ({ ...s, date: e.target.value }))} /></div>
            <div className="input-group"><label>Title</label><input value={newSched.title} onChange={(e) => setNewSched(s => ({ ...s, title: e.target.value }))} placeholder="Clinic, Rounds, Meeting" /></div>
            <div className="input-group"><label>Time</label>
              <select value={newSched.time} onChange={(e) => setNewSched(s => ({ ...s, time: e.target.value }))}>
                <option value="">Select time</option>
                {timeOptions.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div style={{ marginTop: '1.2rem', display: 'flex', gap: '10px' }}>
              <button className="btn-primary" onClick={saveNewSchedule}>Save</button>
              <button className="edit-btn" onClick={() => setNewSched({ open: false, date: '', title: '', time: '' })}>Cancel</button>
            </div>
            <div style={{ marginTop: '1.2rem' }}>
              <h3 style={{ marginBottom: '0.6rem' }}>Existing schedules for {newSched.date}</h3>
              {(schedules[newSched.date] || []).length === 0 ? (
                <div style={{ color: '#7A7A7A' }}>None</div>
              ) : (
                (schedules[newSched.date] || []).map((it, idx) => (
                  <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.5rem 0', borderBottom: '1px solid #eee' }}>
                    <div>{it.time} - {it.title}</div>
                    <button className="edit-btn" onClick={() => removeSchedule(newSched.date, idx)}>Remove</button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Dashboard;


