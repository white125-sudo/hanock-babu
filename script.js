// ============ Nav scroll state + active link + mobile menu ============
const navbar = document.getElementById('navbar');
const navBurger = document.getElementById('navBurger');
const navMobile = document.getElementById('navMobile');

window.addEventListener('scroll', () => {
  navbar.classList.toggle('scrolled', window.scrollY > 20);
}, { passive: true });

navBurger.addEventListener('click', () => {
  navMobile.classList.toggle('open');
  navBurger.classList.toggle('open');
});
navMobile.querySelectorAll('a').forEach(a => a.addEventListener('click', () => navMobile.classList.remove('open')));

const sections = document.querySelectorAll('main section[id], header#top');
const navLinks = document.querySelectorAll('[data-nav]');
const navObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const id = entry.target.getAttribute('id');
      navLinks.forEach(l => l.classList.toggle('active', l.getAttribute('href') === '#' + id));
    }
  });
}, { rootMargin: '-45% 0px -45% 0px' });
sections.forEach(s => navObserver.observe(s));

// ============ Cursor glow ============
const glow = document.getElementById('cursorGlow');
window.addEventListener('mousemove', (e) => {
  glow.style.left = e.clientX + 'px';
  glow.style.top = e.clientY + 'px';
}, { passive: true });

// ============ Reveal on scroll ============
const revealEls = document.querySelectorAll('.reveal');
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('in');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.15 });
revealEls.forEach(el => revealObserver.observe(el));

// ============ Typing effect ============
const roles = [
  'Healthcare Systems',
  'NPHIES & HL7 Integrations',
  'AI-Powered Products',
  'Mission-Critical HIS Platforms'
];
const typedEl = document.getElementById('typedRole');
let roleIdx = 0, charIdx = 0, deleting = false;

function typeLoop() {
  const current = roles[roleIdx];
  if (!deleting) {
    charIdx++;
    typedEl.textContent = current.slice(0, charIdx);
    if (charIdx === current.length) {
      deleting = true;
      setTimeout(typeLoop, 1600);
      return;
    }
  } else {
    charIdx--;
    typedEl.textContent = current.slice(0, charIdx);
    if (charIdx === 0) {
      deleting = false;
      roleIdx = (roleIdx + 1) % roles.length;
    }
  }
  setTimeout(typeLoop, deleting ? 35 : 65);
}
typeLoop();

// ============ Stat counters ============
const statNums = document.querySelectorAll('.stat-num');
const statObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      animateCount(entry.target);
      statObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.6 });
statNums.forEach(el => statObserver.observe(el));

function animateCount(el) {
  const target = parseInt(el.getAttribute('data-count'), 10);
  const duration = 1400;
  const start = performance.now();
  function tick(now) {
    const p = Math.min((now - start) / duration, 1);
    const eased = 1 - Math.pow(1 - p, 3);
    el.textContent = Math.round(eased * target).toLocaleString();
    if (p < 1) requestAnimationFrame(tick);
    else el.textContent = target.toLocaleString();
  }
  requestAnimationFrame(tick);
}

// ============ Hero network canvas ============
// Represents the Saudi healthcare integration ecosystem: a central HIS core
// wired into the national systems it exchanges data with, drifting in a field
// of ambient particles.
(function () {
  const canvas = document.getElementById('netCanvas');
  const ctx = canvas.getContext('2d');
  const hero = document.querySelector('.hero');
  let w, h, dpr;
  let particles = [];
  let nodes = [];
  let mouse = { x: null, y: null };

  const NODE_LABELS = ['NPHIES', 'Sehhaty', 'Wasfaty', 'Mawid', 'Ayenati', 'Yakeen', 'National Vaccination Registry', 'Care Team'];
  let labelFontPx = 11;

  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    w = hero.offsetWidth;
    h = hero.offsetHeight;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    canvas.style.width = w + 'px';
    canvas.style.height = h + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    initScene();
  }

  function initScene() {
    const count = Math.max(28, Math.min(60, Math.floor((w * h) / 26000)));
    particles = Array.from({ length: count }, () => ({
      x: Math.random() * w,
      y: Math.random() * h,
      vx: (Math.random() - 0.5) * 0.25,
      vy: (Math.random() - 0.5) * 0.25,
      r: Math.random() * 1.6 + 0.6
    }));

    // Keep the diagram clear of the actual headline/text block instead of
    // guessing a fixed percentage — measure it and lay the nodes out as a
    // wide, staggered two-row band above (or below, on short viewports) it,
    // so long labels get real horizontal room instead of crowding a small orbit.
    const heroRect = hero.getBoundingClientRect();
    const contentEl = hero.querySelector('.hero-content');
    const contentRect = contentEl.getBoundingClientRect();
    const contentTop = contentRect.top - heroRect.top;
    const contentBottom = contentRect.bottom - heroRect.top;
    const bottomClearance = 70; // leave room for the scroll cue

    const navClearance = 80; // fixed navbar overlays the canvas up to roughly here
    const topSpace = contentTop;
    const bottomSpace = h - contentBottom - bottomClearance;
    const preferTop = (topSpace - navClearance) >= 90 || (topSpace - navClearance) >= bottomSpace;

    const cx = w / 2;
    const radiusX = Math.min(w * 0.44, 440);

    // Size rows from actual measured label widths so items never crowd,
    // no matter how many long integration names get added later.
    labelFontPx = w < 480 ? 9 : 11;
    ctx.font = labelFontPx + 'px "JetBrains Mono", monospace';
    const maxLabelWidth = Math.max(...NODE_LABELS.map(l => ctx.measureText(l).width));
    const minItemSpacing = maxLabelWidth + 26;
    let itemsPerRow = Math.max(1, Math.min(NODE_LABELS.length, Math.floor((radiusX * 2) / minItemSpacing) + 1));
    let rowCount = Math.max(1, Math.ceil(NODE_LABELS.length / itemsPerRow));
    itemsPerRow = Math.ceil(NODE_LABELS.length / rowCount);

    // The band always sits between the fixed navbar/bottom-clearance edge and
    // the content block — never guessed as a fraction of hero height, so a
    // fixed nav bar (or a short viewport) can never eat one of the rows.
    const direction = preferTop ? -1 : 1;
    const cy = preferTop
      ? Math.max(topSpace - 24, navClearance + 20)
      : Math.min(contentBottom + 24, h - bottomClearance - 20);
    const bandFar = preferTop ? navClearance : h - bottomClearance;
    const bandHeight = Math.max(Math.abs(cy - bandFar), 40);
    const rowSpacing = Math.min(26, Math.max(12, bandHeight / (rowCount + 0.5)));

    nodes = [{ x: cx, y: cy, label: 'Raqeem HIS', core: true, away: direction }];

    const rows = Array.from({ length: rowCount }, () => []);
    NODE_LABELS.forEach((label, i) => rows[i % rowCount].push(label));

    rows.forEach((rowLabels, rowIdx) => {
      const m = rowLabels.length;
      const spacing = m > 1 ? (radiusX * 2) / (m - 1) : 0;
      const rowY = cy + direction * rowSpacing * (rowIdx + 1);
      rowLabels.forEach((label, j) => {
        const baseX = cx + (j - (m - 1) / 2) * spacing;
        nodes.push({
          baseX, baseY: rowY,
          phase: Math.random() * Math.PI * 2,
          bobAmp: 3 + Math.random() * 3,
          speed: 0.0006 * (0.7 + Math.random() * 0.6) * (rowIdx % 2 === 0 ? 1 : -1),
          away: direction,
          label,
          core: false
        });
      });
    });
  }

  function step(node) {
    if (node.core) return;
    node.phase += node.speed;
    node.x = node.baseX + Math.sin(node.phase) * 5;
    node.y = node.baseY + Math.sin(node.phase * 1.6) * node.bobAmp;
  }

  function draw() {
    ctx.clearRect(0, 0, w, h);

    // ambient particles drift
    particles.forEach(p => {
      p.x += p.vx; p.y += p.vy;
      if (p.x < 0 || p.x > w) p.vx *= -1;
      if (p.y < 0 || p.y > h) p.vy *= -1;
    });

    // connect nearby ambient particles faintly
    ctx.lineWidth = 1;
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const a = particles[i], b = particles[j];
        const d = Math.hypot(a.x - b.x, a.y - b.y);
        if (d < 110) {
          ctx.strokeStyle = `rgba(138,148,168,${0.10 * (1 - d / 110)})`;
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.stroke();
        }
      }
    }
    ctx.fillStyle = 'rgba(138,148,168,0.5)';
    particles.forEach(p => {
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fill();
    });

    // orbit nodes + connections to core
    const core = nodes[0];
    nodes.forEach(step);

    nodes.slice(1).forEach(n => {
      const grad = ctx.createLinearGradient(core.x, core.y, n.x, n.y);
      grad.addColorStop(0, 'rgba(45,212,191,0.45)');
      grad.addColorStop(1, 'rgba(167,139,250,0.12)');
      ctx.strokeStyle = grad;
      ctx.lineWidth = 1.1;
      ctx.beginPath();
      ctx.moveTo(core.x, core.y);
      ctx.lineTo(n.x, n.y);
      ctx.stroke();
    });

    // satellite nodes
    nodes.slice(1).forEach(n => {
      ctx.beginPath();
      ctx.arc(n.x, n.y, 3.4, 0, Math.PI * 2);
      ctx.fillStyle = '#a78bfa';
      ctx.shadowColor = 'rgba(167,139,250,0.8)';
      ctx.shadowBlur = 8;
      ctx.fill();
      ctx.shadowBlur = 0;

      ctx.font = labelFontPx + 'px "JetBrains Mono", monospace';
      const textWidth = ctx.measureText(n.label).width;
      let lx = n.x;
      if (n.x - textWidth / 2 < 10) { ctx.textAlign = 'left'; lx = 10; }
      else if (n.x + textWidth / 2 > w - 10) { ctx.textAlign = 'right'; lx = w - 10; }
      else { ctx.textAlign = 'center'; }
      const ly = n.y + n.away * 10;
      ctx.lineWidth = 3;
      ctx.strokeStyle = 'rgba(5,8,15,0.85)';
      ctx.strokeText(n.label, lx, ly);
      ctx.fillStyle = 'rgba(231,236,245,0.85)';
      ctx.fillText(n.label, lx, ly);
    });

    // core node
    ctx.beginPath();
    ctx.arc(core.x, core.y, 6, 0, Math.PI * 2);
    ctx.fillStyle = '#2dd4bf';
    ctx.shadowColor = 'rgba(45,212,191,0.9)';
    ctx.shadowBlur = 16;
    ctx.fill();
    ctx.shadowBlur = 0;
    ctx.beginPath();
    ctx.arc(core.x, core.y, 12, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(45,212,191,0.35)';
    ctx.lineWidth = 1;
    ctx.stroke();
    ctx.font = '600 12px "JetBrains Mono", monospace';
    ctx.textAlign = 'center';
    ctx.lineWidth = 3.5;
    ctx.strokeStyle = 'rgba(5,8,15,0.9)';
    const coreLy = core.y + core.away * 18;
    ctx.strokeText(core.label, core.x, coreLy);
    ctx.fillStyle = '#5eead4';
    ctx.fillText(core.label, core.x, coreLy);

    requestAnimationFrame(draw);
  }

  window.addEventListener('resize', resize, { passive: true });
  resize();
  requestAnimationFrame(draw);
})();
