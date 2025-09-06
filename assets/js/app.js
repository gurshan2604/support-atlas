
/* Support Atlas – basic interactivity for prototype (no backend) */
(function(){
  const html = document.documentElement;
  // Theme toggle
  const themeStored = localStorage.getItem('sa_theme');
  if(themeStored) html.setAttribute('data-theme', themeStored);
  else html.setAttribute('data-theme', 'light');

  // Mode toggle
  const modeStored = localStorage.getItem('sa_mode');
  if(modeStored) html.setAttribute('data-mode', modeStored);
  else html.setAttribute('data-mode', 'advanced');

  function setPressed(el, isPressed){
    if (!el) return;
    el.setAttribute('aria-pressed', String(isPressed));
  }

  function initToggles(){
    const themeBtn = document.querySelector('[data-toggle="theme"]');
    const modeBtn = document.querySelector('[data-toggle="mode"]');
    if (themeBtn){
      const isDark = html.getAttribute('data-theme') === 'dark';
      setPressed(themeBtn, isDark);
      themeBtn.addEventListener('click', () => {
        const dark = html.getAttribute('data-theme') !== 'dark';
        html.setAttribute('data-theme', dark ? 'dark' : 'light');
        localStorage.setItem('sa_theme', dark ? 'dark' : 'light');
        setPressed(themeBtn, dark);
      });
    }
    if (modeBtn){
      const isEasy = html.getAttribute('data-mode') === 'easy';
      setPressed(modeBtn, isEasy);
      modeBtn.addEventListener('click', () => {
        const easy = html.getAttribute('data-mode') !== 'easy';
        html.setAttribute('data-mode', easy ? 'easy' : 'advanced');
        localStorage.setItem('sa_mode', easy ? 'easy' : 'advanced');
        setPressed(modeBtn, easy);
      });
    }
  }

  // Mark current nav item
  function markActiveNav(){
    const path = location.pathname.split('/').pop() || 'index.html';
    document.querySelectorAll('nav a[data-nav]').forEach(a => {
      if (a.getAttribute('href').endsWith(path)) {
        a.setAttribute('aria-current', 'page');
      }
    });
  }

  // Minimal fake chat (UI only)
  function initChat(){
    const input = document.querySelector('.chat-input input');
    const sendBtn = document.querySelector('.chat-input button');
    const body = document.querySelector('.chat-body');
    if(!input || !sendBtn || !body) return;
    function send() {
      const text = input.value.trim();
      if(!text) return;
      const u = document.createElement('div');
      u.className = 'msg user';
      u.textContent = text;
      body.appendChild(u);
      input.value='';
      // fake bot reply
      setTimeout(()=>{
        const b = document.createElement('div');
        b.className = 'msg bot';
        b.textContent = "Thanks for sharing. For demo purposes, results will show on the Services page. Try the quick filter chips below or open All Services.";
        body.appendChild(b);
        body.scrollTop = body.scrollHeight;
      }, 600);
      body.scrollTop = body.scrollHeight;
    }
    sendBtn.addEventListener('click', send);
    input.addEventListener('keydown', (e)=>{
      if (e.key === 'Enter') send();
    });
  }

  document.addEventListener('DOMContentLoaded', () => {
    initToggles();
    markActiveNav();
    initChat();
  });
  /* ---- Chat page enhancements (demo-only) ---- */
(function(){
  // Simulate auth state (demo): set in DevTools:
  //   localStorage.setItem('sa_authed','1')  -> authed
  //   localStorage.removeItem('sa_authed')   -> guest
  function demoAuthState(){
    return !!localStorage.getItem('sa_authed');
  }

  function renderSidebar(){
    const guest = document.querySelector('.sidebar-guest');
    const list  = document.querySelector('.sidebar-list');
    if(!guest || !list) return;

    const authed = demoAuthState();
    guest.hidden = authed;
    list.hidden  = !authed;

    // Inject sample items once when authed
    if(authed && !list.children.length){
      const samples = [
        {title:'GP referral info',   time:'2m'},
        {title:'Low-fee counselling',time:'1h'},
        {title:'Telehealth options', time:'Yesterday'},
      ];
      samples.forEach((s, i)=>{
        const li = document.createElement('li');
        li.className = 'sidebar-item';
        li.setAttribute('role','button');
        if(i===0) li.setAttribute('aria-current','true');
        li.innerHTML = `<span class="dot" aria-hidden="true"></span>
                        <span class="sidebar-title">${s.title}</span>
                        <span class="sidebar-time">${s.time}</span>`;
        list.appendChild(li);
      });
    }
  }

  function wireTools(){
    document.querySelectorAll('.tool').forEach(btn=>{
      btn.addEventListener('click', ()=>{
        const pressed = btn.getAttribute('aria-pressed') === 'true';
        btn.setAttribute('aria-pressed', String(!pressed));

        const body = document.querySelector('.chat-body');
        if(!body) return;

        const note = document.createElement('div');
        note.className = 'msg bot';

        if(btn.dataset.action === 'voice'){
          note.textContent = pressed ? 'Voice input off.' : 'Voice input on (demo).';
        }
        if(btn.dataset.action === 'translate'){
          note.textContent = pressed ? 'Translate off.' : 'Translate on (demo).';
        }
        body.appendChild(note);
        body.scrollTop = body.scrollHeight;
      });
    });
  }

  document.addEventListener('DOMContentLoaded', function(){
    renderSidebar();
    wireTools();
  });
})();
/* ---- About page: reveal-on-scroll ---- */
(function(){
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const els = document.querySelectorAll('.reveal');
  if (!els.length) return;
  if (prefersReduced) {
    els.forEach(el => el.classList.add('in'));
    return;
  }
  const io = new IntersectionObserver((entries)=>{
    entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('in'); });
  }, { threshold: 0.12 });
  els.forEach(el => io.observe(el));
})();

/* ======================= ADMIN UI (demo) ======================= */
(function(){
  // If not on admin page, skip
  const main = document.querySelector('main');
  if (!main || !document.querySelector('.admin-grid')) return;

  // ----- Tabs -----
  document.querySelectorAll('.admin-tab').forEach(btn=>{
    btn.addEventListener('click', ()=>{
      document.querySelectorAll('.admin-tab').forEach(b=>b.classList.remove('is-active'));
      btn.classList.add('is-active');
      const tab = btn.dataset.tab;
      document.querySelectorAll('.admin-panel').forEach(p=>{
        p.hidden = p.dataset.panel !== tab;
      });
    });
  });

  // ----- Demo data -----
  const queueData = (JSON.parse(localStorage.getItem('sa_queue')))||[
    {id:'q-001', name:'Northside Psychology', type:'Psychologist', suburb:'Carlton VIC', fees:'Paid', status:'pending', submitted:'Today 10:12'},
    {id:'q-002', name:'Calm Minds Counselling', type:'Counsellor', suburb:'Parramatta NSW', fees:'Low-fee', status:'pending', submitted:'Yesterday'},
    {id:'q-003', name:'Better GP Clinic (MHCP)', type:'GP', suburb:'Adelaide SA', fees:'Bulk-bill', status:'pending', submitted:'2d ago'}
  ];
  const listingsData = (JSON.parse(localStorage.getItem('sa_listings')))||[
    {id:'s-100', name:'Harbour Psych Clinic', type:'Psychologist', suburb:'Sydney NSW', fees:'Paid', status:'Active'},
    {id:'s-101', name:'Greenleaf GP', type:'GP', suburb:'Fitzroy VIC', fees:'Bulk-bill', status:'Active'},
    {id:'s-102', name:'River Telehealth', type:'Telehealth', suburb:'Online', fees:'Low-fee', status:'Inactive'}
  ];
  const usersData = (JSON.parse(localStorage.getItem('sa_users')))||[
    {id:'u-1', email:'alice@provider.com', role:'Trusted (L3)'},
    {id:'u-2', email:'sam@org.org', role:'User (L2)'},
    {id:'u-3', email:'owner@service.au', role:'Super (L4)'}
  ];
  const auditData = (JSON.parse(localStorage.getItem('sa_audit')))||[];

  // ----- Render helpers -----
  function renderQueue(){
    const root = document.getElementById('queue-table');
    if(!root) return;
    root.innerHTML = '';
    root.appendChild(rowHead(['Service','Type','Suburb','Fees','Status']));
    queueData.forEach(item=>{
      const row = makeRow([item.name, item.type, item.suburb, item.fees,
        `<span class="chip pending">${item.status}</span>`],
        [
          ['View', ()=>openDrawer(item)],
          ['Approve', ()=>approve(item)],
          ['Reject', ()=>reject(item)]
        ]);
      root.appendChild(row);
    });
  }
  function renderListings(){
    const root = document.getElementById('listings-table');
    if(!root) return;
    root.innerHTML = '';
    root.appendChild(rowHead(['Service','Type','Suburb','Fees','Status']));
    listingsData.forEach(item=>{
      const row = makeRow([item.name, item.type, item.suburb, item.fees, item.status],
        [
          ['Edit', ()=>notice('Edit (demo only)')],
          ['Deactivate', ()=>notice('Deactivate (demo only)')]
        ]);
      root.appendChild(row);
    });
  }
  function renderUsers(){
    const root = document.getElementById('users-table');
    if(!root) return;
    root.innerHTML = '';
    root.appendChild(rowHead(['Email','Role','Actions']));
    usersData.forEach(u=>{
      const row = document.createElement('div');
      row.className = 'row';
      row.innerHTML = `<div>${u.email}</div><div>${u.role}</div>`;
      const act = document.createElement('div'); act.className = 'actions';
      [['Make Trusted (L3)', ()=>setRole(u,'Trusted (L3)')],
       ['Make Super (L4)', ()=>setRole(u,'Super (L4)')]]
       .forEach(([label, fn])=>{
         const b = document.createElement('button'); b.className='btn btn-secondary'; b.textContent = label; b.onclick = fn; act.appendChild(b);
       });
      row.appendChild(act);
      root.appendChild(row);
    });
  }
  function renderAudit(){
    const root = document.getElementById('audit-list');
    if(!root) return;
    root.innerHTML = '';
    if(!auditData.length){ root.innerHTML = '<p class="muted">No recent actions.</p>'; return; }
    auditData.slice().reverse().forEach(a=>{
      const p = document.createElement('p');
      p.textContent = `${a.time} — ${a.text}`;
      root.appendChild(p);
    });
  }

  // ----- UI primitives -----
  function rowHead(cols){
    const head = document.createElement('div');
    head.className = 'row head';
    cols.forEach(c=>{
      const d = document.createElement('div'); d.textContent = c; head.appendChild(d);
    });
    const d = document.createElement('div'); d.textContent = 'Actions'; d.className='actions'; head.appendChild(d);
    return head;
  }
  function makeRow(cols, buttons){
    const row = document.createElement('div');
    row.className = 'row';
    cols.forEach(html=>{
      const d = document.createElement('div'); d.innerHTML = html; row.appendChild(d);
    });
    const actions = document.createElement('div'); actions.className = 'actions';
    buttons.forEach(([label, fn])=>{
      const b = document.createElement('button');
      b.textContent = label;
      b.className = label === 'Approve' ? 'btn-approve' : (label === 'Reject' ? 'btn-reject' : 'btn btn-secondary');
      b.onclick = fn; actions.appendChild(b);
    });
    row.appendChild(actions);
    return row;
  }

  // ----- Drawer & actions -----
  function openDrawer(item){
    const d = document.getElementById('queue-drawer'); if(!d) return;
    d.hidden = false;
    d.innerHTML = `
      <h3 class="h3" style="margin-top:0">${item.name}</h3>
      <p class="muted">${item.type} • ${item.suburb} • ${item.fees}</p>
      <hr>
      <p><strong>Description (demo):</strong> ${item.name} provides ${item.type.toLowerCase()} services in ${item.suburb}. Telehealth available.</p>
      <div class="vstack gap-sm">
        <button class="btn-approve">Approve</button>
        <button class="btn-reject">Reject</button>
      </div>`;
    d.querySelector('.btn-approve').onclick = ()=>approve(item);
    d.querySelector('.btn-reject').onclick  = ()=>reject(item);
  }
  function approve(item){
    item.status = 'approved';
    save(queueData,'sa_queue');
    addAudit(`Approved ${item.name}`);
    renderQueue();
    notice('Approved.');
  }
  function reject(item){
    item.status = 'rejected';
    save(queueData,'sa_queue');
    addAudit(`Rejected ${item.name}`);
    renderQueue();
    notice('Rejected.');
  }
  function setRole(user, role){
    user.role = role; save(usersData,'sa_users'); addAudit(`Set ${user.email} → ${role}`); renderUsers(); notice('Role updated.');
  }

  // ----- Persistence & util -----
  function save(data, key){ localStorage.setItem(key, JSON.stringify(data)); }
  function addAudit(text){ auditData.push({time: new Date().toLocaleString(), text}); save(auditData,'sa_audit'); }
  function notice(msg){ console.log('[Admin]', msg); }

  // Search (listings)
  const ls = document.getElementById('listings-search');
  if(ls) ls.addEventListener('input', ()=>{
    const q = ls.value.toLowerCase();
    const filtered = listingsData.filter(x => (x.name+x.type+x.suburb+x.fees+x.status).toLowerCase().includes(q));
    const root = document.getElementById('listings-table');
    root.innerHTML = '';
    root.appendChild(rowHead(['Service','Type','Suburb','Fees','Status']));
    filtered.forEach(item=>{
      const row = makeRow([item.name, item.type, item.suburb, item.fees, item.status],
        [['Edit', ()=>notice('Edit (demo only)')],['Deactivate', ()=>notice('Deactivate (demo only)')]]);
      root.appendChild(row);
    });
  });

  // ----- Initial render -----
  renderQueue(); renderListings(); renderUsers(); renderAudit();
})();

/* ---- Finder: Leaflet map demo ---- */
(function(){
  var mapEl = document.getElementById('sf-map');
  if (!mapEl || typeof L === 'undefined') return;

  // Center on Melbourne CBD
  var map = L.map(mapEl, { scrollWheelZoom: false }).setView([-37.8136, 144.9631], 13);

  // OSM tiles + attribution
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; <a href=\"https://www.openstreetmap.org/copyright\">OpenStreetMap</a> contributors'
  }).addTo(map);

  // Demo markers (name, type, lat, lng)
  var places = [
    { name: 'Greenwood Psychology', type: 'Psychologist', lat: -37.8109, lng: 144.9650, dist: '1.2 km' },
    { name: 'Mindful Counselling',   type: 'Counsellor',   lat: -37.8184, lng: 144.9700, dist: '2.0 km' },
    { name: 'Northern GP Co-Op',     type: 'GP',           lat: -37.8060, lng: 144.9600, dist: '2.8 km' }
  ];

  var group = L.featureGroup();
  places.forEach(function(p){
    var m = L.marker([p.lat, p.lng], { title: p.name });
    m.bindPopup('<strong>'+p.name+'</strong><br>'+p.type+' • '+p.dist+'<br><a href=\"provider.html\">View details</a>');
    m.addTo(group);
  });
  group.addTo(map);
  map.fitBounds(group.getBounds().pad(0.2));

  // Keyboard: focus map and press Enter to open first popup
  mapEl.addEventListener('keydown', function(e){
    if(e.key === 'Enter'){
      var first = group.getLayers()[0];
      if(first){ first.openPopup(); }
    }
  });
})();

})();
