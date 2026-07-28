document.getElementById('year').textContent = new Date().getFullYear();

// Menú móvil
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

// Contadores animados en el hero
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

// Formulario de contacto — envío real vía Formspree (AJAX, sin recargar la página)
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

// Fondo animado: estrellas + red de nodos (constelación tipo topología de red)
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

  // estrellas parpadeantes
  ctx.fillStyle = 'rgba(255,255,255,0.8)';
  stars.forEach(s => {
    const twinkle = reduceMotion ? 1 : (Math.sin(t / 900 + s.phase) + 1) / 2;
    ctx.globalAlpha = 0.15 + twinkle * 0.5;
    ctx.beginPath();
    ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
    ctx.fill();
  });
  ctx.globalAlpha = 1;

  // nodos de red (topología) con líneas de conexión, como paquetes viajando
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
