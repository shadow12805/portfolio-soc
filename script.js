/* ============================================================
   CONFIGURACIÓN DEL ADMIN
   Cambia esta contraseña por la que tú quieras usar.
   ============================================================ */
const ADMIN_PASSWORD = "Camilo2026!";

/* ============================================================
   AÑO EN FOOTER
   ============================================================ */
document.getElementById('year').textContent = new Date().getFullYear();

/* ============================================================
   MENÚ MÓVIL
   ============================================================ */
const navToggle = document.getElementById('navToggle');
const navLinks = document.getElementById('navLinks');
navToggle.addEventListener('click', () => {
  const isOpen = navLinks.classList.toggle('open');
  navToggle.setAttribute('aria-expanded', isOpen);
});
navLinks.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => {
    navLinks.classList.remove('open');
    navToggle.setAttribute('aria-expanded', 'false');
  });
});

/* ============================================================
   CONTADORES ANIMADOS
   ============================================================ */
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const statEls = document.querySelectorAll('.stat-num');
function animateCount(el){
  const target = parseInt(el.dataset.count, 10);
  if (reduceMotion) { el.textContent = target; return; }
  let current = 0;
  const step = Math.max(1, Math.round(target / 30));
  const timer = setInterval(() => {
    current += step;
    if (current >= target) { current = target; clearInterval(timer); }
    el.textContent = current;
  }, 35);
}
const statObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      animateCount(entry.target);
      statObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.5 });
statEls.forEach(el => statObserver.observe(el));

/* ============================================================
   FORMULARIO DE CONTACTO (Formspree AJAX)
   ============================================================ */
const contactForm = document.getElementById('contactForm');
const formNote = document.getElementById('formNote');
contactForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  formNote.textContent = 'Enviando...';
  try {
    const response = await fetch(contactForm.action, {
      method: 'POST',
      body: new FormData(contactForm),
      headers: { 'Accept': 'application/json' },
    });
    if (response.ok) {
      formNote.textContent = '¡Mensaje enviado! Te responderé pronto.';
      contactForm.reset();
    } else {
      formNote.textContent = 'No se pudo enviar. Intenta de nuevo o escríbeme directo al correo.';
    }
  } catch (err) {
    formNote.textContent = 'No se pudo enviar. Revisa tu conexión e intenta de nuevo.';
  }
});

/* ============================================================
   CANVAS FONDO ANIMADO (estrellas + nodos de red)
   ============================================================ */
const canvas = document.getElementById('network-bg');
const ctx = canvas.getContext('2d');
let width, height, stars, nodes;

function resize(){
  width = canvas.width = window.innerWidth;
  height = canvas.height = document.documentElement.scrollHeight;
}

function initField(){
  const starCount = Math.floor((width * height) / 9000);
  stars = Array.from({ length: Math.min(starCount, 220) }, () => ({
    x: Math.random() * width,
    y: Math.random() * height,
    r: Math.random() * 1.2 + 0.2,
    phase: Math.random() * Math.PI * 2,
  }));

  const nodeCount = Math.floor((width * height) / 55000);
  nodes = Array.from({ length: Math.min(Math.max(nodeCount, 14), 34) }, () => ({
    x: Math.random() * width,
    y: Math.random() * height,
    vx: (Math.random() - 0.5) * 0.15,
    vy: (Math.random() - 0.5) * 0.15,
  }));
}

function draw(t){
  ctx.clearRect(0, 0, width, height);

  ctx.fillStyle = 'rgba(255,255,255,0.8)';
  stars.forEach(s => {
    const twinkle = reduceMotion ? 1 : (Math.sin(t / 900 + s.phase) + 1) / 2;
    ctx.globalAlpha = 0.15 + twinkle * 0.5;
    ctx.beginPath();
    ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
    ctx.fill();
  });
  ctx.globalAlpha = 1;

  if (!reduceMotion) {
    nodes.forEach(n => {
      n.x += n.vx; n.y += n.vy;
      if (n.x < 0 || n.x > width) n.vx *= -1;
      if (n.y < 0 || n.y > height) n.vy *= -1;
    });
  }

  for (let i = 0; i < nodes.length; i++) {
    for (let j = i + 1; j < nodes.length; j++) {
      const a = nodes[i], b = nodes[j];
      const dx = a.x - b.x, dy = a.y - b.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const maxDist = 190;
      if (dist < maxDist) {
        const alpha = (1 - dist / maxDist) * 0.16;
        ctx.strokeStyle = `rgba(139,107,242,${alpha})`;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(b.x, b.y);
        ctx.stroke();
      }
    }
  }

  nodes.forEach(n => {
    ctx.fillStyle = 'rgba(35,211,238,0.55)';
    ctx.beginPath();
    ctx.arc(n.x, n.y, 1.8, 0, Math.PI * 2);
    ctx.fill();
  });

  if (!reduceMotion) requestAnimationFrame(draw);
}

resize();
initField();
window.addEventListener('resize', () => { resize(); initField(); });
requestAnimationFrame(draw);
if (reduceMotion) draw(0);

/* ============================================================
   PROYECTOS DINÁMICOS (localStorage)
   ============================================================ */
const PROJECTS_KEY = 'crc_portfolio_projects';
const ADMIN_SESSION_KEY = 'crc_admin_session';

const defaultProjects = [
  {
    id: 'default-1',
    title: 'Análisis de tráfico con Wireshark',
    description: 'Comprender protocolos y patrones de red para soportar investigación de incidentes.',
    status: 'practice',
    link: '',
    createdAt: Date.now()
  },
  {
    id: 'default-2',
    title: 'OSINT con herramientas populares',
    description: 'Recopilar y analizar información pública para construir y validar hipótesis.',
    status: 'practice',
    link: '',
    createdAt: Date.now() - 1000
  },
  {
    id: 'default-3',
    title: 'Forense digital con Autopsy',
    description: 'Examen de evidencia digital y documentación de hallazgos en entornos de aprendizaje.',
    status: 'completado',
    link: 'https://shadow12805.github.io/informe-forense-canon2/',
    createdAt: Date.now() - 2000
  },
  {
    id: 'default-4',
    title: 'SIEM en labs',
    description: 'Monitoreo, triage y análisis guiado de eventos de seguridad.',
    status: 'progress',
    link: '',
    createdAt: Date.now() - 3000
  }
];

function getProjects(){
  try {
    const raw = localStorage.getItem(PROJECTS_KEY);
    if (!raw) return [...defaultProjects];
    return JSON.parse(raw);
  } catch (e) {
    return [...defaultProjects];
  }
}

function saveProjects(list){
  localStorage.setItem(PROJECTS_KEY, JSON.stringify(list));
}

function statusLabel(status){
  if (status === 'practice') return 'en práctica';
  if (status === 'progress') return 'en curso';
  if (status === 'done') return 'completado';
  return status;
}

function statusClass(status){
  if (status === 'practice') return 'status-practice';
  if (status === 'progress') return 'status-progress';
  if (status === 'done') return 'status-done';
  return 'status-progress';
}

function renderProjects(){
  const grid = document.getElementById('projectsGrid');
  const projects = getProjects();

  if (projects.length === 0) {
    grid.innerHTML = '<p style="color:var(--text-muted);font-family:var(--font-mono);font-size:0.85rem;">Aún no hay labs publicados. Usa el panel de administración para agregar tu primer proyecto.</p>';
    return;
  }

  grid.innerHTML = projects.map(p => {
    const hasLink = p.link && p.link.trim().length > 0;
    const linkHtml = hasLink
      ? `<a href="${p.link}" target="_blank" rel="noopener" class="card-link">repo ↗</a>`
      : `<span class="card-link-disabled">Documentación en proceso</span>`;

    return `
      <article class="card" data-id="${p.id}">
        <div class="card-head">
          <h3>${escapeHtml(p.title)}</h3>
          <span class="status ${statusClass(p.status)}">${statusLabel(p.status)}</span>
        </div>
        <p>${escapeHtml(p.description)}</p>
        ${linkHtml}
      </article>
    `;
  }).join('');
}

function escapeHtml(text){
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

/* ============================================================
   PANEL DE ADMINISTRACIÓN
   ============================================================ */
const adminOverlay = document.getElementById('admin-overlay');
const adminTrigger = document.getElementById('adminTrigger');
const adminClose = document.getElementById('adminClose');
const adminLogin = document.getElementById('admin-login');
const adminDashboard = document.getElementById('admin-dashboard');
const adminPassInput = document.getElementById('adminPass');
const adminLoginBtn = document.getElementById('adminLoginBtn');
const adminLoginError = document.getElementById('adminLoginError');
const projectForm = document.getElementById('projectForm');
const adminProjectList = document.getElementById('adminProjectList');
const logoutBtns = [document.getElementById('logoutBtn'), document.getElementById('logoutBtn2')];

let editingId = null;

function openAdmin(){
  adminOverlay.classList.add('active');
  adminOverlay.setAttribute('aria-hidden', 'false');
  adminPassInput.value = '';
  adminLoginError.textContent = '';

  // Si ya hay sesión activa, mostrar dashboard
  if (localStorage.getItem(ADMIN_SESSION_KEY) === '1') {
    showDashboard();
  } else {
    showLogin();
  }
}

function closeAdmin(){
  adminOverlay.classList.remove('active');
  adminOverlay.setAttribute('aria-hidden', 'true');
  editingId = null;
  resetForm();
}

function showLogin(){
  adminLogin.style.display = 'block';
  adminDashboard.style.display = 'none';
}

function showDashboard(){
  adminLogin.style.display = 'none';
  adminDashboard.style.display = 'block';
  renderAdminList();
  switchTab('add');
}

function attemptLogin(){
  if (adminPassInput.value === ADMIN_PASSWORD) {
    localStorage.setItem(ADMIN_SESSION_KEY, '1');
    adminLoginError.textContent = '';
    showDashboard();
  } else {
    adminLoginError.textContent = 'Contraseña incorrecta.';
  }
}

function logout(){
  localStorage.removeItem(ADMIN_SESSION_KEY);
  showLogin();
}

// Tabs
const tabs = document.querySelectorAll('.admin-tab');
const tabContents = document.querySelectorAll('.admin-tab-content');

tabs.forEach(tab => {
  tab.addEventListener('click', () => {
    const target = tab.dataset.tab;
    switchTab(target);
  });
});

function switchTab(name){
  tabs.forEach(t => t.classList.toggle('active', t.dataset.tab === name));
  tabContents.forEach(c => {
    c.style.display = c.id === 'tab-' + name ? 'block' : 'none';
  });
  if (name === 'list') renderAdminList();
}

// Formulario CRUD
projectForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const title = document.getElementById('pTitle').value.trim();
  const desc = document.getElementById('pDesc').value.trim();
  const status = document.getElementById('pStatus').value;
  const link = document.getElementById('pLink').value.trim();

  if (!title || !desc) return;

  let projects = getProjects();

  if (editingId) {
    // Editar existente
    const idx = projects.findIndex(p => p.id === editingId);
    if (idx !== -1) {
      projects[idx] = { ...projects[idx], title, description: desc, status, link };
    }
    editingId = null;
  } else {
    // Crear nuevo
    const newProject = {
      id: 'proj-' + Date.now(),
      title,
      description: desc,
      status,
      link,
      createdAt: Date.now()
    };
    projects.unshift(newProject);
  }

  saveProjects(projects);
  renderProjects();
  resetForm();
  switchTab('list');
});

function resetForm(){
  projectForm.reset();
  editingId = null;
}

function renderAdminList(){
  const projects = getProjects();
  if (projects.length === 0) {
    adminProjectList.innerHTML = '<p style="color:var(--text-muted);font-size:0.85rem;">No hay proyectos aún.</p>';
    return;
  }

  adminProjectList.innerHTML = projects.map(p => `
    <div class="admin-item">
      <div class="admin-item-info">
        <p class="admin-item-title">${escapeHtml(p.title)}</p>
        <p class="admin-item-meta">${statusLabel(p.status)}${p.link ? ' · con link' : ''}</p>
      </div>
      <div class="admin-item-actions">
        <button class="admin-btn-sm" onclick="editProject('${p.id}')">Editar</button>
        <button class="admin-btn-sm danger" onclick="deleteProject('${p.id}')">Eliminar</button>
      </div>
    </div>
  `).join('');
}

// Exponer funciones globales para los onclick inline
window.editProject = function(id){
  const projects = getProjects();
  const p = projects.find(x => x.id === id);
  if (!p) return;

  document.getElementById('pTitle').value = p.title;
  document.getElementById('pDesc').value = p.description;
  document.getElementById('pStatus').value = p.status;
  document.getElementById('pLink').value = p.link;
  editingId = id;
  switchTab('add');
};

window.deleteProject = function(id){
  if (!confirm('¿Seguro que quieres eliminar este proyecto?')) return;
  let projects = getProjects();
  projects = projects.filter(p => p.id !== id);
  saveProjects(projects);
  renderProjects();
  renderAdminList();
};

// Event listeners admin
adminTrigger.addEventListener('click', openAdmin);
adminClose.addEventListener('click', closeAdmin);
adminOverlay.addEventListener('click', (e) => {
  if (e.target === adminOverlay) closeAdmin();
});
adminLoginBtn.addEventListener('click', attemptLogin);
adminPassInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') attemptLogin();
});
logoutBtns.forEach(btn => {
  if (btn) btn.addEventListener('click', logout);
});

/* ============================================================
   INICIALIZAR
   ============================================================ */
renderProjects();
