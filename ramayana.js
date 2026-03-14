
/* ═══════════════════════════════════════════════════════
   RAMAYANA — THE DIVINE EPIC
   GSAP Scroll Animation Controller
═══════════════════════════════════════════════════════ */

// ── GSAP PLUGIN REGISTRATION ──
gsap.registerPlugin(ScrollTrigger, TextPlugin);

/* ═══════════════════════════════════
   GOLDEN ARROW CURSOR + BOW FIRE
═══════════════════════════════════ */
const cursor = document.getElementById('cursor');
const cursorGlow = document.getElementById('cursor-glow');
const bowOverlay = document.getElementById('bow-overlay');

let mouseX = 0, mouseY = 0;
let prevX = 0, prevY = 0;

// Track mouse position and rotate arrow to direction of movement
window.addEventListener('mousemove', (e) => {
  mouseX = e.clientX; mouseY = e.clientY;

  // Compute angle of movement
  const dx = mouseX - prevX, dy = mouseY - prevY;
  if (Math.abs(dx) + Math.abs(dy) > 2) {
    const angle = Math.atan2(dy, dx) * 180 / Math.PI;
    gsap.to(cursor, {
      rotation: angle - 45,
      duration: .15,
      ease: 'power2.out',
      transformOrigin: '4px 4px'
    });
  }
  prevX = mouseX; prevY = mouseY;

  gsap.set(cursor, { left: mouseX, top: mouseY });
  gsap.to(cursorGlow, { left: mouseX, top: mouseY, duration: .12, ease: 'power2.out' });
});

// Scale cursor on interactive elements
document.querySelectorAll('a, button, .dot, .char-card').forEach(el => {
  el.addEventListener('mouseenter', () => {
    gsap.to(cursor, { scale: 1.4, duration: .2 });
    gsap.to(cursorGlow, { width: 120, height: 120, opacity: .8, duration: .3 });
  });
  el.addEventListener('mouseleave', () => {
    gsap.to(cursor, { scale: 1, duration: .2 });
    gsap.to(cursorGlow, { width: 80, height: 80, opacity: 1, duration: .3 });
  });
});

// ─── BOW FIRE on click ───
window.addEventListener('click', (e) => {
  fireArrow(e.clientX, e.clientY);
  spawnBowRipple(e.clientX, e.clientY);
});

function fireArrow(originX, originY) {
  if (!bowOverlay) return;

  // Direction the cursor is pointing (based on movement angle)
  const dx = mouseX - prevX, dy = mouseY - prevY;
  let angle = Math.atan2(dy, dx);
  // If nearly stationary, fire to the right by default
  if (Math.abs(dx) + Math.abs(dy) < 1) angle = 0;

  // Calculate travel distance (to edge of screen)
  const screenDist = Math.max(window.innerWidth, window.innerHeight) * 1.5;

  // Create fired arrow SVG element
  const arrowEl = document.createElement('div');
  arrowEl.className = 'fired-arrow';
  arrowEl.style.cssText = `
    left: ${originX}px;
    top: ${originY - 4}px;
    width: 80px;
    height: 8px;
    --ang: ${angle * 180 / Math.PI}deg;
    --dist: ${screenDist}px;
  `;
  arrowEl.innerHTML = `
    <svg viewBox="0 0 80 8" width="80" height="8" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="fag${Date.now()}" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stop-color="#6b3e08" stop-opacity="0"/>
          <stop offset="40%" stop-color="#c47a1e"/>
          <stop offset="100%" stop-color="#fff8d0"/>
        </linearGradient>
      </defs>
      <rect x="0" y="3" width="65" height="2.5" rx="1.2" fill="url(#fag${Date.now()})"/>
      <polygon points="65,1 80,4 65,7" fill="#f5b942"/>
      <rect x="0" y="2" width="8" height="4" rx="2" fill="#c47a1e" opacity=".7"/>
    </svg>
  `;
  bowOverlay.appendChild(arrowEl);

  // Particle burst at origin
  for (let i = 0; i < 12; i++) {
    const p = document.createElement('div');
    const pAngle = (i / 12) * Math.PI * 2;
    const pDist = 20 + Math.random() * 40;
    p.style.cssText = `
      position:fixed; border-radius:50%;
      width:${2+Math.random()*4}px; height:${2+Math.random()*4}px;
      background:#f5b942;
      box-shadow:0 0 6px rgba(245,185,66,.8);
      left:${originX}px; top:${originY}px;
      pointer-events:none; z-index:9996;
    `;
    bowOverlay.appendChild(p);
    gsap.to(p, {
      x: Math.cos(pAngle) * pDist, y: Math.sin(pAngle) * pDist,
      opacity: 0, scale: 0,
      duration: .5 + Math.random() * .3,
      ease: 'power2.out',
      onComplete: () => p.remove()
    });
  }

  // Arrow trail glow
  const trail = document.createElement('div');
  trail.style.cssText = `
    position:fixed;
    left:${originX}px; top:${originY - 2}px;
    width:40px; height:4px; border-radius:2px;
    background:linear-gradient(90deg,transparent,rgba(245,185,66,.6));
    transform-origin: left center;
    transform: rotate(${angle * 180 / Math.PI}deg);
    pointer-events:none; z-index:9993;
  `;
  bowOverlay.appendChild(trail);
  gsap.to(trail, {
    opacity: 0, scaleX: 3,
    duration: .4, ease: 'power2.out',
    onComplete: () => trail.remove()
  });

  setTimeout(() => arrowEl.remove(), 900);
}

function spawnBowRipple(x, y) {
  const ripple = document.createElement('div');
  ripple.className = 'bow-pulse';
  ripple.style.cssText = `left:${x}px; top:${y}px; width:30px; height:30px;`;
  document.body.appendChild(ripple);
  setTimeout(() => ripple.remove(), 600);
}

/* ═══════════════════════════════════
   CHARACTERS SECTION
═══════════════════════════════════ */
(function initCharacters() {
  const section = document.getElementById('characters-section');
  if (!section) return;

  // Star canvas for characters background
  const canvas = document.getElementById('charsStarCanvas');
  if (canvas) {
    const ctx = canvas.getContext('2d');
    function resizeCharCanvas() {
      canvas.width = canvas.offsetWidth || window.innerWidth;
      canvas.height = canvas.offsetHeight || window.innerHeight;
    }
    resizeCharCanvas();
    new ResizeObserver(resizeCharCanvas).observe(canvas);

    const cStars = Array.from({length: 200}, () => ({
      x: Math.random(), y: Math.random(),
      r: Math.random() * 1.5 + .3,
      sp: Math.random() * .001 + .0003,
      ph: Math.random() * Math.PI * 2
    }));
    let ct = 0;
    function drawCharStars() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      cStars.forEach(s => {
        const a = .2 + .8 * Math.abs(Math.sin(ct * s.sp * 1000 + s.ph));
        ctx.beginPath();
        ctx.arc(s.x * canvas.width, s.y * canvas.height, s.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255,248,220,${a * .6})`;
        ctx.fill();
      });
      ct += .016;
      requestAnimationFrame(drawCharStars);
    }
    drawCharStars();
  }

  // Title reveal
  const titleTl = gsap.timeline({
    scrollTrigger: { trigger: '#characters-section', start: 'top 80%', toggleActions: 'play none none reverse' }
  });
  titleTl
    .to('#chars-eyebrow', { opacity: 1, y: 0, duration: .8, ease: 'power3.out' })
    .to('#chars-heading', { opacity: 1, y: 0, duration: 1.2, ease: 'power3.out' }, '-=.4')
    .to('#chars-sub', { opacity: 1, duration: .8 }, '-=.4');

  gsap.set(['#chars-eyebrow', '#chars-sub'], { y: 15 });

  // Staggered card reveals
  const cards = document.querySelectorAll('.char-card');
  cards.forEach((card, i) => {
    ScrollTrigger.create({
      trigger: card,
      start: 'top 88%',
      onEnter: () => {
        gsap.to(card, {
          opacity: 1, y: 0, duration: .9,
          delay: (i % 4) * .12,
          ease: 'power3.out',
          onComplete: () => card.classList.add('revealed')
        });
      }
    });
  });

  // Parallax float on scroll
  ScrollTrigger.create({
    trigger: '#characters-section',
    start: 'top bottom', end: 'bottom top', scrub: 1,
    onUpdate: self => {
      cards.forEach((card, i) => {
        const depth = .5 + (i % 4) * .25;
        gsap.set(card, { y: (self.progress - .5) * -40 * depth });
      });
    }
  });
})();

/* ═══════════════════════════════════
   PROGRESS BAR
═══════════════════════════════════ */
const pb = document.getElementById('progress-bar');
window.addEventListener('scroll', () => {
  const pct = window.scrollY / (document.body.scrollHeight - window.innerHeight) * 100;
  pb.style.width = pct + '%';
});

/* ═══════════════════════════════════
   CHAPTER NAVIGATION
═══════════════════════════════════ */
const navLabel = document.getElementById('nav-chapter-label');
const dots = document.querySelectorAll('.dot');

document.querySelectorAll('.scene').forEach((scene, i) => {
  ScrollTrigger.create({
    trigger: scene,
    start: 'top 60%',
    onEnter: () => {
      navLabel.textContent = scene.dataset.chapter || '';
      dots.forEach(d => d.classList.remove('active'));
      if (dots[i]) dots[i].classList.add('active');
    },
    onEnterBack: () => {
      navLabel.textContent = scene.dataset.chapter || '';
      dots.forEach(d => d.classList.remove('active'));
      if (dots[i]) dots[i].classList.add('active');
    }
  });
});

dots.forEach((dot, i) => {
  dot.addEventListener('click', () => {
    const scenes = document.querySelectorAll('.scene');
    if (scenes[i]) scenes[i].scrollIntoView({ behavior: 'smooth' });
  });
});

/* ═══════════════════════════════════════════════════════
   SCENE 0 — PROLOGUE
   Stars canvas + moon reveal + title stagger
═══════════════════════════════════════════════════════ */
(function initPrologue() {
  // Star canvas
  const canvas = document.getElementById('starCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  resize();
  window.addEventListener('resize', resize);

  const stars = Array.from({ length: 300 }, () => ({
    x: Math.random(), y: Math.random(),
    r: Math.random() * 1.8 + .3,
    speed: Math.random() * .0008 + .0002,
    phase: Math.random() * Math.PI * 2
  }));

  let t = 0;
  function drawStars() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    stars.forEach(s => {
      const alpha = .3 + .7 * Math.abs(Math.sin(t * s.speed * 1000 + s.phase));
      ctx.beginPath();
      ctx.arc(s.x * canvas.width, s.y * canvas.height, s.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255, 248, 220, ${alpha})`;
      ctx.fill();
    });
    t += .016;
    requestAnimationFrame(drawStars);
  }
  drawStars();

  // Hero entrance timeline
  const heroTl = gsap.timeline({ delay: .5 });
  heroTl
    .to('#moon', { opacity: 1, scale: 1, duration: 2, ease: 'power3.out' })
    .to('#moon-ring', { opacity: .4, duration: 1.5 }, '-=1')
    .to('#prologue-shloka', { opacity: 1, y: 0, duration: 1.2, ease: 'power3.out' }, '-=.5')
    .to('#prologue-trans', { opacity: 1, y: 0, duration: 1, ease: 'power3.out' }, '-=.6')
    .to('#prologue-divider', { width: 300, duration: 1.2, ease: 'power4.out' }, '-=.4')
    .to('#main-title', { opacity: 1, duration: .01 }, '-=.2')
    .from('.title-line-1', { y: 80, opacity: 0, duration: 1.4, ease: 'power4.out' }, '-=.1')
    .from('.title-line-2', { y: 30, opacity: 0, duration: 1, ease: 'power3.out' }, '-=.8')
    .to('#prologue-by', { opacity: 1, y: 0, duration: 1, ease: 'power3.out' }, '-=.4')
    .to('#scroll-cta', { opacity: 1, y: 0, duration: 1 }, '-=.3');

  gsap.set(['#prologue-shloka', '#prologue-trans', '#prologue-by', '#scroll-cta'], { y: 20 });
  gsap.set('#moon', { scale: .8 });
})();

/* ═══════════════════════════════════════════════════════
   SCENE 1 — AYODHYA
   Sunrise rays + golden particles + content reveal
═══════════════════════════════════════════════════════ */
(function initAyodhya() {
  const scene = document.getElementById('scene-1');
  if (!scene) return;

  // Parallax layers
  ScrollTrigger.create({
    trigger: scene,
    start: 'top bottom', end: 'bottom top', scrub: 1,
    onUpdate: self => {
      const p = self.progress;
      gsap.set('#s1-sky',        { y: p * -60 });
      gsap.set('#s1-sun',        { y: p * -100 });
      gsap.set('#s1-mountains',  { y: p * -40 });
      gsap.set('#s1-palace',     { y: p * -20 });
      gsap.set('#s1-fg',         { y: p * 20 });
    }
  });

  // Sunrise light animation
  const tl = gsap.timeline({
    scrollTrigger: { trigger: scene, start: 'top 80%', end: 'top 20%', toggleActions: 'play none none reverse' }
  });
  tl
    .from('.sun-orb', { scale: 0, opacity: 0, duration: 2, ease: 'power3.out' })
    .from('.sun-rays', { opacity: 0, scale: .5, duration: 2, ease: 'power3.out' }, '-=1.5')
    .from('#palace-glow', { opacity: 0, scale: .5, duration: 1.5 }, '-=1')
    .to('#s1-content .scene-title', { opacity: 1, y: 0, duration: 1.2, ease: 'power3.out' }, '-=.5')
    .to('#s1-content .scene-divider', { opacity: 1, width: 60, duration: .8 }, '-=.6')
    .to('#s1-content .scene-body', { opacity: 1, y: 0, duration: 1, stagger: .25, ease: 'power3.out' }, '-=.4')
    .to('#s1-content .scene-characters', { opacity: 1, y: 0, duration: .8 }, '-=.3');

  // Golden particle system
  function spawnParticle() {
    const container = document.getElementById('s1-particles');
    if (!container) return;
    const p = document.createElement('div');
    p.style.cssText = `
      position:absolute;
      width:${2+Math.random()*4}px;
      height:${2+Math.random()*4}px;
      border-radius:50%;
      background:rgba(245,185,66,${.3+Math.random()*.6});
      box-shadow:0 0 ${4+Math.random()*8}px rgba(245,185,66,.4);
      left:${Math.random()*100}%;
      top:${40+Math.random()*40}%;
    `;
    container.appendChild(p);
    gsap.to(p, {
      y: -(80 + Math.random() * 150),
      x: (Math.random() - .5) * 60,
      opacity: 0,
      duration: 3 + Math.random() * 3,
      ease: 'power1.out',
      onComplete: () => p.remove()
    });
  }

  ScrollTrigger.create({
    trigger: scene,
    start: 'top 70%', end: 'bottom top',
    onEnter: () => {
      const interval = setInterval(() => {
        if (!document.getElementById('scene-1')) { clearInterval(interval); return; }
        spawnParticle();
      }, 150);
      scene._particleInterval = interval;
    },
    onLeave: () => clearInterval(scene._particleInterval)
  });
})();

/* ═══════════════════════════════════════════════════════
   SCENE 2 — SWAYAMVARA
   Bow glow + petal rain + content reveal
═══════════════════════════════════════════════════════ */
(function initSwayamvara() {
  const scene = document.getElementById('scene-2');
  if (!scene) return;

  const tl = gsap.timeline({
    scrollTrigger: { trigger: scene, start: 'top 80%', toggleActions: 'play none none reverse' }
  });
  tl
    .to('#bow-glow', { opacity: 1, scale: 1.5, duration: 1.5, ease: 'power3.out' })
    .to('#bow-glow-svg', { attr: { rx: 120, ry: 60 }, fill: '#f5b94240', duration: 1 }, '-=1')
    .from('#shiva-bow', { scale: 0, opacity: 0, transformOrigin: 'center', duration: 1.5, ease: 'elastic.out(1,.5)' }, '-=.5')
    .to('#s2-content .scene-title', { opacity: 1, y: 0, duration: 1.2, ease: 'power3.out' }, '-=.8')
    .to('#s2-content .scene-divider', { opacity: 1, width: 60, duration: .8 }, '-=.6')
    .to('#s2-content .scene-body', { opacity: 1, y: 0, duration: 1, stagger: .25 }, '-=.4')
    .to('#s2-content .scene-characters', { opacity: 1, duration: .8 }, '-=.2');

  // Bow breaking effect
  ScrollTrigger.create({
    trigger: scene,
    start: 'top 40%',
    once: true,
    onEnter: () => {
      // Bow snaps
      gsap.to('#shiva-bow', {
        scaleX: 1.5, scaleY: .5, opacity: 0,
        duration: .5, ease: 'power4.in',
        transformOrigin: 'center',
        onComplete: () => {
          gsap.from('#bow-glow', { scale: 3, opacity: 0, duration: 1, ease: 'power3.out' });
        }
      });
      // Arrow shoots out dynamically
      gsap.to('#shiva-arrow', {
        x: 800, y: -200, opacity: 0, scale: 2,
        duration: 0.8, ease: 'power2.in',
      });
    }
  });

  // Petal rain
  function createPetal() {
    const container = document.getElementById('petals');
    if (!container) return;
    const petal = document.createElement('div');
    const colors = ['#ff6b8a', '#ffb3c6', '#ffc8d8', '#ff9db5', '#ffd6e3'];
    petal.className = 'petal';
    petal.style.cssText = `
      left:${Math.random()*100}%;
      top:-20px;
      background:${colors[Math.floor(Math.random()*colors.length)]};
      transform:rotate(${Math.random()*360}deg);
      animation-duration:${5+Math.random()*5}s;
      animation-delay:${Math.random()*2}s;
    `;
    container.appendChild(petal);
    setTimeout(() => petal.remove(), 10000);
  }

  ScrollTrigger.create({
    trigger: scene,
    start: 'top 70%', end: 'bottom top',
    onEnter: () => {
      scene._petalInterval = setInterval(createPetal, 200);
    },
    onLeave: () => clearInterval(scene._petalInterval)
  });
})();

/* ═══════════════════════════════════════════════════════
   SCENE 3 — EXILE
   Palace fade, forest emerge, figures walking
═══════════════════════════════════════════════════════ */
(function initExile() {
  const scene = document.getElementById('scene-3');
  if (!scene) return;

  const tl = gsap.timeline({
    scrollTrigger: { trigger: scene, start: 'top 80%', end: 'center 30%', toggleActions: 'play none none reverse' }
  });
  tl
    .to('#exile-palace', { opacity: 0, duration: 2, ease: 'power2.inOut' })
    .to('#exile-sky', {
      background: 'linear-gradient(180deg, #060a02 0%, #0a1505 40%, #050804 100%)',
      duration: 2
    }, '-=2')
    .to('#forest-emerge', { opacity: 1, duration: 2, ease: 'power2.inOut' }, '-=1.5')
    .to('#exile-road', { opacity: 1, duration: 1 }, '-=.5')
    .to('#s3-content .scene-title', { opacity: 1, y: 0, duration: 1.2, ease: 'power3.out' }, '-=.8')
    .to('#s3-content .scene-divider', { opacity: 1, width: 60, duration: .8 }, '-=.6')
    .to('#s3-content .scene-body', { opacity: 1, y: 0, duration: 1, stagger: .25 }, '-=.4')
    .to('#s3-content .scene-characters', { opacity: 1, duration: .8 }, '-=.2');

  // Walking figures scroll-driven
  ScrollTrigger.create({
    trigger: scene,
    start: 'top bottom', end: 'bottom top', scrub: 1,
    onUpdate: self => {
      const p = self.progress;
      gsap.set('#exile-figures', { x: p * 200 });
    }
  });
})();

/* ═══════════════════════════════════════════════════════
   SCENE 4 — FOREST LIFE
   Fog, fireflies, birds
═══════════════════════════════════════════════════════ */
(function initForest() {
  const scene = document.getElementById('scene-4');
  if (!scene) return;

  const tl = gsap.timeline({
    scrollTrigger: { trigger: scene, start: 'top 80%', toggleActions: 'play none none reverse' }
  });
  tl
    .from('#forest-bg', { opacity: .3, duration: 2 })
    .to('#s4-content .scene-title', { opacity: 1, y: 0, duration: 1.2, ease: 'power3.out' }, '-=1')
    .to('#s4-content .scene-divider', { opacity: 1, width: 60, duration: .8 }, '-=.6')
    .to('#s4-content .scene-body', { opacity: 1, y: 0, duration: 1, stagger: .25 }, '-=.4')
    .to('#s4-content .scene-characters', { opacity: 1, duration: .8 }, '-=.2');

  // Fog parallax
  ScrollTrigger.create({
    trigger: scene,
    start: 'top bottom', end: 'bottom top', scrub: 1,
    onUpdate: self => {
      const p = self.progress;
      gsap.set('#fog1', { x: p * 80 });
      gsap.set('#fog2', { x: p * -60 });
    }
  });

  // Fireflies
  function spawnFirefly() {
    const container = document.getElementById('fireflies');
    if (!container) return;
    const f = document.createElement('div');
    f.className = 'firefly';
    const dx = (Math.random() - .5) * 100;
    const dy = -(50 + Math.random() * 100);
    f.style.setProperty('--dx', dx + 'px');
    f.style.setProperty('--dy', dy + 'px');
    f.style.left = Math.random() * 100 + '%';
    f.style.top = (40 + Math.random() * 40) + '%';
    const dur = 4 + Math.random() * 6;
    f.style.animationDuration = dur + 's';
    f.style.animationDelay = Math.random() * 2 + 's';
    container.appendChild(f);
    setTimeout(() => f.remove(), (dur + 2) * 1000);
  }

  // Birds
  function spawnBird() {
    const container = document.getElementById('birds');
    if (!container) return;
    const b = document.createElement('div');
    b.className = 'bird';
    b.style.top = (15 + Math.random() * 35) + '%';
    b.style.left = '-30px';
    const dur = 6 + Math.random() * 6;
    b.style.animationDuration = dur + 's';
    b.style.animationDelay = Math.random() + 's';
    container.appendChild(b);
    setTimeout(() => b.remove(), (dur + 2) * 1000);
  }

  ScrollTrigger.create({
    trigger: scene,
    start: 'top 60%', end: 'bottom top',
    onEnter: () => {
      scene._ffInterval = setInterval(spawnFirefly, 500);
      scene._birdInterval = setInterval(spawnBird, 3000);
      spawnFirefly(); spawnBird();
    },
    onLeave: () => {
      clearInterval(scene._ffInterval);
      clearInterval(scene._birdInterval);
    }
  });
})();

/* ═══════════════════════════════════════════════════════
   SCENE 5 — GOLDEN DEER
   Canvas-drawn animated deer + sparkles
═══════════════════════════════════════════════════════ */
(function initGoldenDeer() {
  const scene = document.getElementById('scene-5');
  const canvas = document.getElementById('deerCanvas');
  if (!scene || !canvas) return;
  const ctx = canvas.getContext('2d');

  function resize() { canvas.width = canvas.offsetWidth; canvas.height = canvas.offsetHeight; }
  resize();
  new ResizeObserver(resize).observe(canvas);

  let deerX = canvas.width * .65;
  let visible = false;
  let t = 0;

  function drawDeer() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    if (!visible) { requestAnimationFrame(drawDeer); return; }

    const w = canvas.width, h = canvas.height;
    const runOffset = Math.sin(t * 4) * 8;
    const glowPulse = .6 + .4 * Math.sin(t * 2);

    // Ambient light in forest
    const bgGrad = ctx.createRadialGradient(deerX, h * .5, 0, deerX, h * .5, 250);
    bgGrad.addColorStop(0, `rgba(180,130,20,${.15 * glowPulse})`);
    bgGrad.addColorStop(1, 'transparent');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, w, h);

    // Deer body
    ctx.save();
    ctx.translate(deerX, h * .45 + runOffset);

    // Glow aura
    const deerGlow = ctx.createRadialGradient(0, 0, 0, 0, 0, 80);
    deerGlow.addColorStop(0, `rgba(255,215,0,${.3 * glowPulse})`);
    deerGlow.addColorStop(.5, `rgba(245,185,66,${.15 * glowPulse})`);
    deerGlow.addColorStop(1, 'transparent');
    ctx.fillStyle = deerGlow;
    ctx.fillRect(-80, -80, 160, 160);

    // Scale up the entire deer
    ctx.scale(1.8, 1.8);

    // Body gradient
    const bodyGrad = ctx.createLinearGradient(-40, -30, 40, 30);
    bodyGrad.addColorStop(0, `rgba(255,230,100,${glowPulse})`);
    bodyGrad.addColorStop(.5, `rgba(245,185,66,${glowPulse})`);
    bodyGrad.addColorStop(1, `rgba(200,130,20,${glowPulse * .8})`);

    ctx.shadowColor = '#f5b942';
    ctx.shadowBlur = 20;
    ctx.fillStyle = bodyGrad;

    // Majestic slender body
    ctx.beginPath();
    ctx.moveTo(-35, -5); // Rump
    ctx.bezierCurveTo(-30, -25, 10, -25, 30, -10); // Back
    ctx.bezierCurveTo(45, -25, 50, -35, 55, -45); // Neck up
    ctx.bezierCurveTo(58, -35, 52, -15, 35, 5); // Neck down
    ctx.bezierCurveTo(15, 20, -10, 20, -35, 10); // Belly
    ctx.closePath();
    ctx.fill();

    // Head
    ctx.beginPath();
    ctx.ellipse(58, -48, 12, 7, -0.4, 0, Math.PI * 2); 
    ctx.fill();

    // Snout
    ctx.beginPath();
    ctx.moveTo(68, -52);
    ctx.quadraticCurveTo(75, -53, 72, -45);
    ctx.lineTo(60, -45);
    ctx.fill();

    // Eye
    ctx.beginPath();
    ctx.arc(61, -50, 1.5, 0, Math.PI * 2);
    ctx.fillStyle = '#1a0a00';
    ctx.fill();

    // Elegant Antlers
    ctx.strokeStyle = `rgba(255,215,0,${glowPulse})`;
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.shadowBlur = 10;
    
    // Antler 1
    ctx.beginPath();
    ctx.moveTo(56, -53);
    ctx.quadraticCurveTo(50, -70, 40, -80);
    ctx.moveTo(52, -65);
    ctx.quadraticCurveTo(55, -75, 50, -85);
    ctx.moveTo(45, -75);
    ctx.lineTo(35, -70);
    ctx.stroke();

    // Antler 2 (Background)
    ctx.lineWidth = 1.5;
    ctx.strokeStyle = `rgba(200,150,0,${glowPulse * 0.8})`;
    ctx.beginPath();
    ctx.moveTo(60, -52);
    ctx.quadraticCurveTo(58, -65, 48, -75);
    ctx.moveTo(54, -62);
    ctx.lineTo(60, -70);
    ctx.stroke();

    // Slender Legs (animated)
    const legSwing = Math.sin(t * 6) * 15;
    ctx.fillStyle = bodyGrad;
    ctx.shadowBlur = 5;

    function drawSlenderLeg(x, y, swing, isBackLeg) {
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(swing * Math.PI / 180);
      
      if (isBackLeg) {
        ctx.fillStyle = `rgba(180,120,15,${glowPulse * 0.9})`; // Darker for depth
      }

      ctx.beginPath();
      ctx.moveTo(-4, 0); // Thigh top
      ctx.quadraticCurveTo(-6, 15, -2, 25); // Knee curve
      ctx.lineTo(-3, 40); // Hoof
      ctx.lineTo(1, 40);
      ctx.lineTo(2, 25);
      ctx.quadraticCurveTo(4, 15, 2, 0);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    }

    // Hind legs
    drawSlenderLeg(-25, 2, legSwing, true); // Back
    drawSlenderLeg(-18, 5, -legSwing, false); // Front
    
    // Front legs
    drawSlenderLeg(20, 0, legSwing * 1.2, true); // Back
    drawSlenderLeg(28, 2, -legSwing * 1.2, false); // Front

    // Elegant Tail
    ctx.beginPath();
    ctx.moveTo(-35, -5);
    ctx.quadraticCurveTo(-45, -10, -42, 5);
    ctx.fillStyle = `rgba(245,185,66,${glowPulse})`;
    ctx.fill();

    // Revert scale 
    ctx.scale(1/1.8, 1/1.8);

    ctx.restore();

    // Sparkle trail
    for (let i = 0; i < 3; i++) {
      const sx = deerX - 40 - Math.random() * 80;
      const sy = h * .45 + (Math.random() - .5) * 40;
      const sr = Math.random() * 3 + 1;
      ctx.beginPath();
      ctx.arc(sx, sy, sr, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255,215,0,${Math.random() * .6 * glowPulse})`;
      ctx.shadowColor = '#f5b942';
      ctx.shadowBlur = 8;
      ctx.fill();
    }

    // Move deer
    deerX -= .8;
    if (deerX < -100) deerX = canvas.width + 100;

    t += .016;
    requestAnimationFrame(drawDeer);
  }
  requestAnimationFrame(drawDeer);

  const tl = gsap.timeline({
    scrollTrigger: { trigger: scene, start: 'top 80%', toggleActions: 'play none none reverse' }
  });
  tl
    .add(() => { visible = true; })
    .to('#s5-content .scene-title', { opacity: 1, y: 0, duration: 1.2, ease: 'power3.out' })
    .to('#s5-content .scene-divider', { opacity: 1, width: 60, duration: .8 }, '-=.6')
    .to('#s5-content .scene-body', { opacity: 1, y: 0, duration: 1, stagger: .25 }, '-=.4')
    .to('#s5-content .scene-characters', { opacity: 1, duration: .8 }, '-=.2');

  // DOM sparkles
  function spawnSparkle() {
    const container = document.getElementById('deer-sparkles');
    if (!container) return;
    const s = document.createElement('div');
    s.className = 'sparkle';
    const sx = (Math.random() - .5) * 100;
    const sy = (Math.random() - .5) * 100;
    s.style.setProperty('--sx', sx + 'px');
    s.style.setProperty('--sy', sy + 'px');
    s.style.left = (50 + Math.random() * 30) + '%';
    s.style.top = (25 + Math.random() * 40) + '%';
    s.style.animationDuration = (1.5 + Math.random()) + 's';
    container.appendChild(s);
    setTimeout(() => s.remove(), 3000);
  }

  ScrollTrigger.create({
    trigger: scene,
    start: 'top 60%', end: 'bottom top',
    onEnter: () => { scene._sparkleInterval = setInterval(spawnSparkle, 300); },
    onLeave: () => clearInterval(scene._sparkleInterval)
  });
})();

/* ═══════════════════════════════════════════════════════
   SCENE 6 — ABDUCTION
   Lightning canvas + Ravana chariot fly + Jatayu
═══════════════════════════════════════════════════════ */
(function initAbduction() {
  const scene = document.getElementById('scene-6');
  const canvas = document.getElementById('lightningCanvas');
  if (!scene || !canvas) return;
  const ctx = canvas.getContext('2d');

  function resize() { canvas.width = window.innerWidth; canvas.height = window.innerHeight; }
  resize();
  window.addEventListener('resize', resize);

  let lightningActive = false;

  function drawLightning(x1, y1, x2, y2, branchLevel) {
    if (branchLevel <= 0) return;
    const mx = (x1 + x2) / 2 + (Math.random() - .5) * 100;
    const my = (y1 + y2) / 2 + (Math.random() - .5) * 50;
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(mx, my);
    ctx.lineTo(x2, y2);
    ctx.strokeStyle = `rgba(200, 100, 255, ${.5 + Math.random() * .5})`;
    ctx.lineWidth = branchLevel;
    ctx.shadowColor = '#cc66ff';
    ctx.shadowBlur = 15;
    ctx.stroke();
    if (Math.random() > .4) {
      drawLightning(mx, my, mx + (Math.random() - .5) * 200, my + 100 + Math.random() * 100, branchLevel - 1);
    }
  }

  function flashLightning() {
    if (!lightningActive) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    if (Math.random() > .6) {
      const x = Math.random() * canvas.width;
      drawLightning(x, 0, x + (Math.random() - .5) * 300, canvas.height * .7, 3);
      // Flash sky
      gsap.to('#storm-sky', {
        background: 'linear-gradient(180deg, #3a0040 0%, #2a0025 40%, #0a0004 100%)',
        duration: .1,
        yoyo: true, repeat: 1
      });
    }
    setTimeout(flashLightning, 400 + Math.random() * 800);
  }

  const tl = gsap.timeline({
    scrollTrigger: { trigger: scene, start: 'top 80%', toggleActions: 'play none none reverse' }
  });
  tl
    .add(() => { lightningActive = true; flashLightning(); })
    .from('#dark-clouds .cloud', { opacity: 0, scale: .5, duration: 1.5, stagger: .3 })
    
    // 1. Chariot swoops down towards Sita
    .to('#ravana-chariot', {
      x: () => -(window.innerWidth * 0.45), y: 150,
      duration: 2, ease: 'power2.out'
    }, '0')
    
    // 2. Sita struggles and gets pulled into the chariot
    .to('#sita-ground', { y: -80, scale: 0.2, opacity: 0, duration: 0.8, ease: 'back.in(1)' }, '1.2')
    .to('#captured-sita', { opacity: 1, duration: 0.3 }, '1.8')
    
    // 3. Jatayu flies in forcefully
    .fromTo('#jatayu', 
      { opacity: 0, x: -300, y: -200, rotation: 15 },
      { opacity: 1, x: 0, y: 0, rotation: 0, duration: 1, ease: 'power2.out' }, '1.5')
      
    // 4. Chariot speeds away violently
    .to('#ravana-chariot', {
      x: () => -(window.innerWidth + 500), y: -50,
      duration: 2.5, ease: 'power2.in'
    }, '2.5')
    
    // 5. Jatayu is struck and plummets
    .to('#jatayu', { opacity: 0, y: 400, x: -150, rotation: -90, duration: 1.5, ease: 'power2.in' }, '2.5')
    
    // 6. Text reveals
    .to('#s6-content .scene-title', { opacity: 1, y: 0, duration: 1.2, ease: 'power3.out' }, '3')
    .to('#s6-content .scene-divider', { opacity: 1, width: 60, duration: .8 }, '3.4')
    .to('#s6-content .scene-body', { opacity: 1, y: 0, duration: 1, stagger: .25 }, '3.6')
    .to('#s6-content .scene-characters', { opacity: 1, duration: .8 }, '3.8');

  // Reset animations properly on reverse/leave
  gsap.set('#ravana-chariot', { x: 0, y: 0 });
  gsap.set('#sita-ground', { opacity: 1, scale: 1, y: 0 });
  gsap.set('#captured-sita', { opacity: 0 });
})();

/* ═══════════════════════════════════════════════════════
   SCENE 7 — HANUMAN MEETS RAMA
   Mountain reveal + divine glow + Hanuman bow
═══════════════════════════════════════════════════════ */
(function initHanuman() {
  const scene = document.getElementById('scene-7');
  if (!scene) return;

  // Parallax mountains
  ScrollTrigger.create({
    trigger: scene,
    start: 'top bottom', end: 'bottom top', scrub: 1,
    onUpdate: self => {
      gsap.set('#mountain-bg', { y: self.progress * -80 });
    }
  });

  const tl = gsap.timeline({
    scrollTrigger: { trigger: scene, start: 'top 75%', toggleActions: 'play none none reverse' }
  });
  tl
    .from('#mountain-bg', { opacity: 0, scale: 1.1, duration: 2, ease: 'power3.out' })
    .from('#divine-glow-7', { opacity: 0, scale: .5, duration: 2 }, '-=1.5')
    .to('#hanuman-fig', {
      opacity: 1, x: 0, duration: 1.2, ease: 'power3.out',
      onStart: () => gsap.from('#hanuman-fig', { x: -60, duration: 1.2 })
    }, '-=.8')
    .to('#s7-content .scene-title', { opacity: 1, y: 0, duration: 1.2, ease: 'power3.out' }, '-=.6')
    .to('#s7-content .scene-divider', { opacity: 1, width: 60, duration: .8 }, '-=.6')
    .to('#s7-content .scene-body', { opacity: 1, y: 0, duration: 1, stagger: .25 }, '-=.4')
    .to('#s7-content .scene-characters', { opacity: 1, duration: .8 }, '-=.2');

  // Hanuman bow / devotion pulse
  gsap.to('#hanuman-fig', {
    y: -10, duration: 2.5, ease: 'sine.inOut', repeat: -1, yoyo: true
  });
})();

/* ═══════════════════════════════════════════════════════
   SCENE 8 — THE LEAP
   Ocean canvas waves + Hanuman flying across
═══════════════════════════════════════════════════════ */
(function initLeap() {
  const scene = document.getElementById('scene-8');
  const canvas = document.getElementById('oceanCanvas');
  if (!scene || !canvas) return;
  const ctx = canvas.getContext('2d');

  function resize() { canvas.width = window.innerWidth; canvas.height = window.innerHeight; }
  resize();
  window.addEventListener('resize', resize);

  let leapActive = false;
  let waveT = 0;

  function drawOcean() {
    const w = canvas.width, h = canvas.height;
    ctx.clearRect(0, 0, w, h);

    if (!leapActive) { requestAnimationFrame(drawOcean); return; }

    // Deep ocean gradient
    const oceanGrad = ctx.createLinearGradient(0, h * .5, 0, h);
    oceanGrad.addColorStop(0, '#040b25');
    oceanGrad.addColorStop(.5, '#050e30');
    oceanGrad.addColorStop(1, '#020815');
    ctx.fillStyle = oceanGrad;
    ctx.fillRect(0, h * .55, w, h * .45);

    // Moon reflection
    const moonReflect = ctx.createLinearGradient(w * .8, h * .55, w * .8, h);
    moonReflect.addColorStop(0, 'rgba(250,240,215,.15)');
    moonReflect.addColorStop(1, 'transparent');
    ctx.fillStyle = moonReflect;
    ctx.fillRect(w * .75, h * .55, w * .1, h * .45);

    // Waves
    for (let layer = 0; layer < 4; layer++) {
      const yBase = h * (.6 + layer * .06);
      const amplitude = 8 - layer * 1.5;
      const speed = 1 - layer * .2;
      const alpha = .3 + layer * .15;

      ctx.beginPath();
      for (let x = 0; x <= w; x += 2) {
        const y = yBase + Math.sin((x * .008 + waveT * speed) * Math.PI * 2) * amplitude
                        + Math.sin((x * .015 + waveT * speed * .7) * Math.PI * 2) * amplitude * .5;
        x === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
      }
      ctx.lineTo(w, h);
      ctx.lineTo(0, h);
      ctx.closePath();

      const waveColor = layer === 0
        ? `rgba(5,20,60,${alpha})`
        : `rgba(8,25,70,${alpha})`;
      ctx.fillStyle = waveColor;
      ctx.fill();

      // Wave crests
      ctx.strokeStyle = `rgba(100,150,255,${.1 + layer * .03})`;
      ctx.lineWidth = 1;
      ctx.stroke();
    }

    waveT += .008;
    requestAnimationFrame(drawOcean);
  }
  requestAnimationFrame(drawOcean);

  const tl = gsap.timeline({
    scrollTrigger: { trigger: scene, start: 'top 80%', toggleActions: 'play none none reverse' }
  });
  tl
    .add(() => { leapActive = true; })
    .from('#leap-sky', { opacity: 0, duration: 1.5 })
    .to('#hanuman-leap', {
      x: window.innerWidth + 200,
      y: -100,
      duration: 4,
      ease: 'power1.inOut'
    })
    .to('#s8-content .scene-title', { opacity: 1, y: 0, duration: 1.2, ease: 'power3.out' }, '-=3')
    .to('#s8-content .scene-divider', { opacity: 1, width: 60, duration: .8 }, '-=.6')
    .to('#s8-content .scene-body', { opacity: 1, y: 0, duration: 1, stagger: .25 }, '-=.4')
    .to('#s8-content .scene-characters', { opacity: 1, duration: .8 }, '-=.2');

  // Hanuman leaping scale effect and Majestic Background growth
  ScrollTrigger.create({
    trigger: scene,
    start: 'top bottom', end: 'bottom top', scrub: 1,
    onUpdate: self => {
      // Leap effect
      const scale = 1 + self.progress * 1.5;
      gsap.set('#hanuman-leap', { scale });

      // Growing background effect: scale up from 0.3 to 2.5
      const bgScale = 0.3 + self.progress * 2.2;
      // Fade in smoothly and fade out at the very end
      let bgOp = self.progress < 0.15 ? self.progress / 0.15 : (self.progress > 0.85 ? (1 - self.progress) / 0.15 : 1);
      gsap.set('#hanuman-grow-bg', { 
        scale: bgScale, 
        opacity: bgOp * 0.85 // Make him glow intensely but not block content 
      });
    }
  });
})();

/* ═══════════════════════════════════════════════════════
   SCENE 9 — BURNING OF LANKA
   Particle fire canvas + embers
═══════════════════════════════════════════════════════ */
(function initFire() {
  const scene = document.getElementById('scene-9');
  const canvas = document.getElementById('fireCanvas');
  if (!scene || !canvas) return;
  const ctx = canvas.getContext('2d');

  function resize() { canvas.width = window.innerWidth; canvas.height = window.innerHeight; }
  resize();
  window.addEventListener('resize', resize);

  const particles = [];
  let fireActive = false;

  class Particle {
    constructor(x) {
      this.x = x + (Math.random() - .5) * 120; // Wilder spread
      this.y = canvas.height * .95; // Start slightly lower
      this.vx = (Math.random() - .5) * 3;
      this.vy = -(2 + Math.random() * 6); // Faster rise
      this.life = 1;
      this.decay = .003 + Math.random() * .01; // Slower decay = higher flames
      this.size = 15 + Math.random() * 45; // Much larger particles for texture blob
      this.type = Math.random() > .7 ? 'ember' : 'flame';
    }
    update() {
      this.x += this.vx + Math.sin(this.y * .01) * 1.5;
      this.y += this.vy;
      this.vy *= .99;
      this.life -= this.decay;
      this.size *= .99; // Shrink slightly
    }
    draw(ctx) {
      if (this.type === 'flame') {
        const grad = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, this.size);
        grad.addColorStop(0, `rgba(255, 230, 100, ${this.life})`);
        grad.addColorStop(.2, `rgba(255, 120, 20, ${this.life * 0.9})`);
        grad.addColorStop(.6, `rgba(200, 30, 10, ${this.life * 0.5})`);
        grad.addColorStop(1, 'transparent');
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
      } else {
        ctx.fillStyle = `rgba(255, 180, 50, ${this.life})`;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size * .15, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }

  // More clustered fire sources
  const fireSources = [];
  for (let i = 0; i < 15; i++) fireSources.push(i * 100);

  function drawFire() {
    const w = canvas.width, h = canvas.height;
    ctx.clearRect(0, 0, w, h);

    if (!fireActive) { requestAnimationFrame(drawFire); return; }

    ctx.globalCompositeOperation = 'lighter'; // This merges the alpha elegantly for fire

    // Dark red sky glow
    const skyGlow = ctx.createRadialGradient(w / 2, h, 0, w / 2, h, w);
    skyGlow.addColorStop(0, 'rgba(180,20,5,.6)');
    skyGlow.addColorStop(.5, 'rgba(80,10,2,.3)');
    skyGlow.addColorStop(1, 'transparent');
    ctx.fillStyle = skyGlow;
    ctx.fillRect(0, 0, w, h);

    // Spawn more massive particles
    fireSources.forEach(srcX => {
      const scaledX = (srcX / 1440) * w;
      if (Math.random() > 0.2) {
        for (let i = 0; i < 4; i++) particles.push(new Particle(scaledX));
      }
    });

    // Update and draw
    for (let i = particles.length - 1; i >= 0; i--) {
      particles[i].update();
      particles[i].draw(ctx);
      if (particles[i].life <= 0) particles.splice(i, 1);
    }

    ctx.globalCompositeOperation = 'source-over'; // Reset for background drawing

    // City glow at bottom
    const buildingGlow = ctx.createLinearGradient(0, h * .75, 0, h);
    buildingGlow.addColorStop(0, 'rgba(255,100,20,.2)');
    buildingGlow.addColorStop(1, 'rgba(200,30,0,.5)');
    ctx.fillStyle = buildingGlow;
    ctx.fillRect(0, h * .75, w, h * .25);

    if (particles.length > 2500) particles.splice(0, 50); // Performance cap

    requestAnimationFrame(drawFire);
  }
  requestAnimationFrame(drawFire);

  const tl = gsap.timeline({
    scrollTrigger: { trigger: scene, start: 'top 80%', toggleActions: 'play none none reverse' }
  });
  tl
    .add(() => { fireActive = true; })
    .to('#s9-content .scene-title', { opacity: 1, y: 0, duration: 1.2, ease: 'power3.out' }, .5)
    .to('#s9-content .scene-divider', { opacity: 1, width: 60, duration: .8 }, '-=.6')
    .to('#s9-content .scene-body', { opacity: 1, y: 0, duration: 1, stagger: .25 }, '-=.4')
    .to('#s9-content .scene-characters', { opacity: 1, duration: .8 }, '-=.2');

  // DOM Embers
  function spawnEmber() {
    const container = document.getElementById('embers');
    if (!container) return;
    const e = document.createElement('div');
    e.className = 'ember';
    const ex = (Math.random() - .5) * 150;
    const ey = -(100 + Math.random() * 300);
    e.style.setProperty('--ex', ex + 'px');
    e.style.setProperty('--ey', ey + 'px');
    e.style.left = (10 + Math.random() * 80) + '%';
    e.style.bottom = '20%';
    const dur = 2 + Math.random() * 3;
    e.style.animationDuration = dur + 's';
    container.appendChild(e);
    setTimeout(() => e.remove(), dur * 1000 + 500);
  }

  ScrollTrigger.create({
    trigger: scene,
    start: 'top 60%', end: 'bottom top',
    onEnter: () => { scene._emberInterval = setInterval(spawnEmber, 100); },
    onLeave: () => clearInterval(scene._emberInterval)
  });
})();

/* ═══════════════════════════════════════════════════════
   SCENE 10 — THE GREAT BATTLE
   Battle canvas + arrows
═══════════════════════════════════════════════════════ */
(function initBattle() {
  const scene = document.getElementById('scene-10');
  const canvas = document.getElementById('battleCanvas');
  if (!scene || !canvas) return;
  const ctx = canvas.getContext('2d');

  function resize() { canvas.width = window.innerWidth; canvas.height = window.innerHeight; }
  resize();
  window.addEventListener('resize', resize);

  let battleActive = false;
  let bt = 0;

  function drawBattle() {
    if (!battleActive) { requestAnimationFrame(drawBattle); return; }
    const w = canvas.width, h = canvas.height;
    ctx.clearRect(0, 0, w, h);

    // Energy pulses
    for (let i = 0; i < 5; i++) {
      const px = w * (.2 + i * .15);
      const py = h * (.5 + Math.sin(bt * .5 + i) * .1);
      const r = 30 + Math.sin(bt + i * .7) * 20;
      const grad = ctx.createRadialGradient(px, py, 0, px, py, r);
      const isRed = i % 2 === 0;
      grad.addColorStop(0, isRed ? 'rgba(200,20,10,.4)' : 'rgba(245,185,66,.3)');
      grad.addColorStop(1, 'transparent');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(px, py, r, 0, Math.PI * 2);
      ctx.fill();
    }

    // Ground dust
    const dustGrad = ctx.createRadialGradient(w / 2, h * .85, 0, w / 2, h * .85, w * .5);
    dustGrad.addColorStop(0, 'rgba(60,10,10,.3)');
    dustGrad.addColorStop(1, 'transparent');
    ctx.fillStyle = dustGrad;
    ctx.fillRect(0, h * .7, w, h * .3);

    bt += .016;
    requestAnimationFrame(drawBattle);
  }
  requestAnimationFrame(drawBattle);

  const tl = gsap.timeline({
    scrollTrigger: { trigger: scene, start: 'top 80%', toggleActions: 'play none none reverse' }
  });
  tl
    .add(() => { battleActive = true; })
    .from('#battle-silhouette-group', { opacity: 0, scale: .9, duration: 1.5, ease: 'power3.out' })
    .to('#s10-content .scene-title', { opacity: 1, y: 0, duration: 1.2, ease: 'power3.out' }, '-=.8')
    .to('#s10-content .scene-divider', { opacity: 1, width: 60, duration: .8 }, '-=.6')
    .to('#s10-content .scene-body', { opacity: 1, y: 0, duration: 1, stagger: .25 }, '-=.4')
    .to('#s10-content .scene-characters', { opacity: 1, duration: .8 }, '-=.2');

  // Arrows flying across scene
  function spawnArrow() {
    const container = document.getElementById('battle-arrows');
    if (!container) return;
    const a = document.createElement('div');
    a.className = 'arrow';
    a.style.top = (20 + Math.random() * 60) + '%';
    a.style.width = (80 + Math.random() * 120) + 'px';
    a.style.animationDuration = (.5 + Math.random() * .8) + 's';
    container.appendChild(a);
    setTimeout(() => a.remove(), 2000);
  }

  ScrollTrigger.create({
    trigger: scene,
    start: 'top 60%', end: 'bottom top',
    onEnter: () => { scene._arrowInterval = setInterval(spawnArrow, 200); },
    onLeave: () => clearInterval(scene._arrowInterval)
  });
})();

/* ═══════════════════════════════════════════════════════
   SCENE 11 — RAVANA'S DEFEAT
   Brahmastra arrow + Ravana falls + light burst
═══════════════════════════════════════════════════════ */
(function initVictory() {
  const scene = document.getElementById('scene-11');
  if (!scene) return;

  const tl = gsap.timeline({
    scrollTrigger: { trigger: scene, start: 'top 80%', toggleActions: 'play none none reverse' }
  });
  tl
    .from('#victory-sky', { opacity: 0, duration: 1.5 })
    .to('#brahmastra', {
      x: window.innerWidth + 200,
      duration: 1.5,
      ease: 'power2.in'
    })
    .to('#victory-light', {
      height: '100vh',
      opacity: 1,
      duration: .8,
      ease: 'power3.out'
    }, '-=.3')
    .to('#ravana-fall', {
      opacity: 1, duration: .5
    })
    .to('#ravana-fall-body', {
      rotation: 85,
      transformOrigin: 'center bottom',
      duration: 2,
      ease: 'power2.in'
    })
    .to('#victory-light', { opacity: .3, width: '100vw', height: '100vh', duration: 1.5, ease: 'power2.out' }, '-=.5')
    .to('#s11-content .scene-title', { opacity: 1, y: 0, duration: 1.2, ease: 'power3.out' }, '-=1')
    .to('#s11-content .scene-divider', { opacity: 1, width: 60, duration: .8 }, '-=.6')
    .to('#s11-content .scene-body', { opacity: 1, y: 0, duration: 1, stagger: .25 }, '-=.4')
    .to('#s11-content .scene-characters', { opacity: 1, duration: .8 }, '-=.2');

  // Victory particles
  function spawnVictoryParticle() {
    const container = document.getElementById('victory-particles');
    if (!container) return;
    const p = document.createElement('div');
    p.className = 'victory-particle';
    const angle = Math.random() * Math.PI * 2;
    const dist = 100 + Math.random() * 300;
    p.style.setProperty('--vx', Math.cos(angle) * dist + 'px');
    p.style.setProperty('--vy', Math.sin(angle) * dist + 'px');
    const size = 2 + Math.random() * 6;
    p.style.width = size + 'px';
    p.style.height = size + 'px';
    p.style.left = (30 + Math.random() * 40) + '%';
    p.style.top = (30 + Math.random() * 40) + '%';
    p.style.animationDuration = (1 + Math.random() * 2) + 's';
    container.appendChild(p);
    setTimeout(() => p.remove(), 4000);
  }

  ScrollTrigger.create({
    trigger: scene,
    start: 'top 50%',
    once: true,
    onEnter: () => {
      for (let i = 0; i < 5; i++) {
        setTimeout(() => {
          for (let j = 0; j < 20; j++) spawnVictoryParticle();
        }, i * 300);
      }
    }
  });
})();

/* ═══════════════════════════════════════════════════════
   SCENE 12 — RETURN / DIWALI
   Diwali lamp canvas + vimana float + lamps
═══════════════════════════════════════════════════════ */
(function initReturn() {
  const scene = document.getElementById('scene-12');
  const canvas = document.getElementById('diwaliCanvas');
  if (!scene || !canvas) return;
  const ctx = canvas.getContext('2d');

  function resize() { canvas.width = window.innerWidth; canvas.height = window.innerHeight; }
  resize();
  window.addEventListener('resize', resize);

  let diwaliActive = false;
  const lampParticles = [];

  class LampParticle {
    constructor() {
      this.x = Math.random() * canvas.width;
      this.y = canvas.height * (.5 + Math.random() * .5);
      this.vx = (Math.random() - .5) * .5;
      this.vy = -(Math.random() * 1.5 + .3);
      this.life = 1;
      this.decay = .003 + Math.random() * .006;
      this.size = 1 + Math.random() * 3;
      this.hue = 30 + Math.random() * 30; // gold range
    }
    update() {
      this.x += this.vx;
      this.y += this.vy;
      this.life -= this.decay;
    }
    draw(ctx) {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fillStyle = `hsla(${this.hue}, 100%, 70%, ${this.life})`;
      ctx.shadowColor = `hsla(${this.hue}, 100%, 60%, .5)`;
      ctx.shadowBlur = 10;
      ctx.fill();
      ctx.shadowBlur = 0;
    }
  }

  function drawDiwali() {
    if (!diwaliActive) { requestAnimationFrame(drawDiwali); return; }
    const w = canvas.width, h = canvas.height;
    ctx.clearRect(0, 0, w, h);

    // Sky: deep blue to purple-gold horizon
    const sky = ctx.createLinearGradient(0, 0, 0, h);
    sky.addColorStop(0, '#020015');
    sky.addColorStop(.6, '#080a30');
    sky.addColorStop(1, '#1a0d05');
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, w, h);

    // Golden glow at horizon
    const horizonGlow = ctx.createLinearGradient(0, h * .7, 0, h);
    horizonGlow.addColorStop(0, 'transparent');
    horizonGlow.addColorStop(.5, 'rgba(245,185,66,.08)');
    horizonGlow.addColorStop(1, 'rgba(245,185,66,.15)');
    ctx.fillStyle = horizonGlow;
    ctx.fillRect(0, h * .7, w, h * .3);

    // Spawn lamp particles
    for (let i = 0; i < 5; i++) lampParticles.push(new LampParticle());

    // Draw fireworks
    for (let i = 0; i < 3; i++) {
      if (Math.random() > .97) {
        const fx = Math.random() * w;
        const fy = Math.random() * h * .4;
        const fColors = ['#f5b942', '#ff6b8a', '#a0e0ff', '#fff9e0', '#ffb347'];
        const fColor = fColors[Math.floor(Math.random() * fColors.length)];
        for (let j = 0; j < 30; j++) {
          const angle = (j / 30) * Math.PI * 2;
          const dist = 20 + Math.random() * 60;
          const bx = fx + Math.cos(angle) * dist;
          const by = fy + Math.sin(angle) * dist;
          ctx.beginPath();
          ctx.arc(bx, by, 2, 0, Math.PI * 2);
          ctx.fillStyle = fColor;
          ctx.shadowColor = fColor;
          ctx.shadowBlur = 8;
          ctx.fill();
          ctx.shadowBlur = 0;
        }
        // Center burst
        const burst = ctx.createRadialGradient(fx, fy, 0, fx, fy, 40);
        burst.addColorStop(0, fColor + '60');
        burst.addColorStop(1, 'transparent');
        ctx.fillStyle = burst;
        ctx.beginPath(); ctx.arc(fx, fy, 40, 0, Math.PI * 2); ctx.fill();
      }
    }

    // Update lamp particles
    for (let i = lampParticles.length - 1; i >= 0; i--) {
      lampParticles[i].update();
      lampParticles[i].draw(ctx);
      if (lampParticles[i].life <= 0) lampParticles.splice(i, 1);
    }
    if (lampParticles.length > 1500) lampParticles.splice(0, 200);

    requestAnimationFrame(drawDiwali);
  }
  requestAnimationFrame(drawDiwali);

  const tl = gsap.timeline({
    scrollTrigger: { trigger: scene, start: 'top 80%', toggleActions: 'play none none reverse' }
  });
  tl
    .add(() => { diwaliActive = true; })
    .to('#pushpaka', { opacity: 1, duration: 2, ease: 'power3.out' })
    .to('#s12-content .scene-title', { opacity: 1, y: 0, duration: 1.2, ease: 'power3.out' }, '-=1')
    .to('#s12-content .scene-divider', { opacity: 1, width: 60, duration: .8 }, '-=.6')
    .to('#s12-content .scene-body', { opacity: 1, y: 0, duration: 1, stagger: .25 }, '-=.4')
    .to('#s12-content .scene-characters', { opacity: 1, duration: .8 }, '-=.2');

  // DOM Lamps grid
  ScrollTrigger.create({
    trigger: scene,
    start: 'top 60%',
    once: true,
    onEnter: () => {
      const container = document.getElementById('lamps');
      for (let i = 0; i < 200; i++) {
        const lamp = document.createElement('div');
        lamp.className = 'lamp';
        lamp.style.left = (Math.random() * 100) + '%';
        lamp.style.top = (60 + Math.random() * 35) + '%';
        lamp.style.animationDelay = (Math.random() * 3) + 's';
        lamp.style.animationDuration = (1.5 + Math.random() * 2) + 's';
        container.appendChild(lamp);
        // Stagger reveal
        gsap.from(lamp, { scale: 0, opacity: 0, duration: .5, delay: .01 * i, ease: 'back.out' });
      }
    }
  });
})();

/* ═══════════════════════════════════════════════════════
   EPILOGUE — FINAL QUOTE
   Stars canvas + lotus + text reveal
═══════════════════════════════════════════════════════ */
(function initEpilogue() {
  const scene = document.getElementById('epilogue');
  const canvas = document.getElementById('epilogueCanvas');
  if (!scene || !canvas) return;
  const ctx = canvas.getContext('2d');

  function resize() { canvas.width = window.innerWidth; canvas.height = window.innerHeight; }
  resize();
  window.addEventListener('resize', resize);

  let epilogueActive = false;
  let et = 0;

  const cosmicStars = Array.from({ length: 500 }, () => ({
    x: Math.random(), y: Math.random(),
    r: Math.random() * 2 + .3,
    twinkle: Math.random() * Math.PI * 2,
    speed: Math.random() * .5 + .1
  }));

  function drawEpilogue() {
    const w = canvas.width, h = canvas.height;
    ctx.clearRect(0, 0, w, h);

    if (!epilogueActive) { requestAnimationFrame(drawEpilogue); return; }

    // Void background
    ctx.fillStyle = '#030108';
    ctx.fillRect(0, 0, w, h);

    // Divine vortex
    const vortexGrad = ctx.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, Math.min(w, h) * .5);
    vortexGrad.addColorStop(0, 'rgba(245,185,66,.08)');
    vortexGrad.addColorStop(.4, 'rgba(180,100,20,.04)');
    vortexGrad.addColorStop(1, 'transparent');
    ctx.fillStyle = vortexGrad;
    ctx.fillRect(0, 0, w, h);

    // Stars
    cosmicStars.forEach(s => {
      const twinkle = .4 + .6 * Math.abs(Math.sin(et * s.speed + s.twinkle));
      const r = s.r * (.6 + .4 * twinkle);
      ctx.beginPath();
      ctx.arc(s.x * w, s.y * h, r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255,248,220,${twinkle * .8})`;
      ctx.shadowColor = '#f5b942';
      ctx.shadowBlur = r > 1.5 ? 6 : 0;
      ctx.fill();
      ctx.shadowBlur = 0;
    });

    // Golden ring slowly expanding
    for (let ring = 0; ring < 3; ring++) {
      const ringRadius = ((et * 30 + ring * 100) % 300) + 50;
      const ringAlpha = Math.max(0, 1 - (ringRadius / 350));
      ctx.beginPath();
      ctx.arc(w / 2, h / 2, ringRadius, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(245,185,66,${ringAlpha * .15})`;
      ctx.lineWidth = 1;
      ctx.stroke();
    }

    et += .016;
    requestAnimationFrame(drawEpilogue);
  }
  requestAnimationFrame(drawEpilogue);

  const tl = gsap.timeline({
    scrollTrigger: { trigger: scene, start: 'top 80%', toggleActions: 'play none none reverse' }
  });
  tl
    .add(() => { epilogueActive = true; })
    .to('#lotus', {
      opacity: 1, rotation: 360, scale: 1,
      duration: 2, ease: 'power3.out',
      transformOrigin: 'center'
    })
    .to('#epilogue-div', { width: 400, duration: 1.5, ease: 'power4.out' }, '-=.5')
    .to('#quote-dev', { opacity: 1, y: 0, duration: 1.2, ease: 'power3.out' }, '-=.5')
    .to(['#q1', '#q2', '#q3'], {
      opacity: 1, y: 0, duration: 1.2,
      stagger: .4, ease: 'power3.out'
    }, '-=.3')
    .to('#q4', { opacity: 1, y: 0, duration: 1, ease: 'power3.out' }, '-=.3')
    .to('#epilogue-attr', { opacity: 1, y: 0, duration: 1 }, '-=.3')
    .to('#epilogue-close', {
      opacity: 1, scale: 1, duration: 1.5,
      ease: 'elastic.out(1,.5)',
      transformOrigin: 'center'
    }, '-=.3');

  gsap.set(['#quote-dev', '#q1', '#q2', '#q3', '#q4', '#epilogue-attr', '#epilogue-close'], { y: 30 });
  gsap.set('#lotus', { scale: .3 });
  gsap.set('#epilogue-close', { scale: .5 });

  // Epilogue particle system
  function spawnEpilogueParticle() {
    const container = document.getElementById('epilogue-p');
    if (!container) return;
    const p = document.createElement('div');
    p.style.cssText = `
      position:absolute;
      width:${1+Math.random()*3}px;
      height:${1+Math.random()*3}px;
      border-radius:50%;
      background:rgba(245,185,66,${.3+Math.random()*.6});
      box-shadow:0 0 6px rgba(245,185,66,.4);
      left:${Math.random()*100}%;
      top:${Math.random()*100}%;
    `;
    container.appendChild(p);
    gsap.to(p, {
      y: -(50+Math.random()*150),
      x: (Math.random()-.5)*60,
      opacity: 0,
      duration: 4+Math.random()*4,
      ease: 'power1.out',
      onComplete: () => p.remove()
    });
  }

  ScrollTrigger.create({
    trigger: scene,
    start: 'top 60%', end: 'bottom top',
    onEnter: () => { scene._epiInterval = setInterval(spawnEpilogueParticle, 200); },
    onLeave: () => clearInterval(scene._epiInterval)
  });
})();

/* ═══════════════════════════════════
   PERFORMANCE: Kill off-screen canvases
═══════════════════════════════════ */
// Only draw when section is near viewport
const canvasMap = {
  'scene-9':  'fireCanvas',
  'scene-8':  'oceanCanvas',
  'scene-10': 'battleCanvas',
  'scene-12': 'diwaliCanvas',
};
// Already handled by active flags inside each IIFE

/* ═══════════════════════════════════
   SMOOTH SCROLL REFRESH
═══════════════════════════════════ */
window.addEventListener('load', () => {
  ScrollTrigger.refresh();
});

window.addEventListener('resize', () => {
  ScrollTrigger.refresh();
});

/* ═══════════════════════════════════
   REDUCED MOTION
═══════════════════════════════════ */
if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
  gsap.globalTimeline.timeScale(0.1);
}

/* ═══════════════════════════════════
   SCENE TRANSITION OVERLAPS
   Subtle scene separators
═══════════════════════════════════ */
document.querySelectorAll('.scene').forEach(scene => {
  // Fade scene title on scroll away
  const content = scene.querySelector('.scene-content');
  if (!content) return;
  ScrollTrigger.create({
    trigger: scene,
    start: 'bottom 30%',
    end: 'bottom top',
    scrub: 1,
    onUpdate: self => {
      gsap.set(content, { opacity: 1 - self.progress * .4 });
    }
  });
});


/* ═══════════════════════════════════════════════════════
   NARRATION SYSTEM
   Web Speech API — Hindi & English scene narration
   3-way toggle: Hindi | No Audio | English
═══════════════════════════════════════════════════════ */
(function initNarration() {

  /* ── Scene narration texts ── */
  const NARRATION = {
    en: [
      // Scene 0 - Prologue
      "Lead me from darkness to light. Welcome to the Ramayana — the eternal epic composed by the sage Valmiki. A story of righteousness, devotion, and the triumph of good over evil.",
      // Scene 1 - Ayodhya
      "In the fertile valley of the sacred river Sarayu stood the magnificent city of Ayodhya — the unconquerable. Ruled by the noble King Dasharatha of the Solar dynasty, four princes blessed the royal household. Of them all, Rama shone like the sun — gentle as the moon, fierce as fire, deep as the ocean.",
      // Scene 2 - Swayamvara
      "In the kingdom of Mithila, King Janaka declared: only he who could lift and string the mighty bow of Lord Shiva would win the hand of his daughter Sita, born of the sacred earth itself. A hundred kings tried and failed. Then Rama, with effortless grace, lifted the bow, strung it, and broke it — and heaven itself rejoiced.",
      // Scene 3 - Exile
      "Queen Kaikeyi, consumed by jealousy, called upon two ancient boons. Her demands were cruel — exile Rama to the forest for fourteen years, and crown her son Bharata as king. Without a word of resentment, Rama accepted his fate. Sita and Lakshmana refused to be parted from him. Together they walked into the wilderness.",
      // Scene 4 - Forest Life
      "In the Dandaka forest, amid towering trees and sacred rivers, the three found a strange peace. They met sages, learned from their wisdom. But dark forces stirred in the shadows. The demoness Shurpanakha encountered them — and the seeds of catastrophe were sown.",
      // Scene 5 - Golden Deer
      "Ravana enlisted the demon Maricha to take the form of a magical golden deer — a creature of impossible beauty, its hide shimmering like molten starlight. Sita, enchanted, asked Rama to capture it. Mortally wounded, Maricha cried out in Rama's voice. The trap was set. The forest grew dark.",
      // Scene 6 - Abduction
      "With both brothers away, Ravana approached in the guise of a sage, and seized Sita, dragging her into his flying chariot. Sita cried out for Rama across the three worlds. The noble vulture Jatayu attacked Ravana valiantly — but the demon severed his wings. The darkest chapter had begun.",
      // Scene 7 - Hanuman Meets Rama
      "On the Rishyamukha mountain, the mighty Hanuman — son of the Wind God — recognized the divine light in Rama's eyes. In that meeting of devotee and deity, a friendship was forged that would shake the cosmos. Sugriva and Rama made a sacred alliance.",
      // Scene 8 - The Leap
      "The ocean stretched one hundred yojanas to Lanka — an impossible distance. But Hanuman was the son of Vayu, the Wind God. Recalling his divine power, he grew to the size of a mountain, compressed the earth with his feet, and hurled himself across the sky like a thunderbolt from heaven.",
      // Scene 9 - Burning of Lanka
      "Hanuman found Sita in the Ashoka grove, a prisoner but unbroken. Ravana's forces captured him and set his tail ablaze — not knowing the tail of the Wind God's son is infinite. Hanuman let them, then broke free, and using his own burning tail as a torch, turned Lanka's golden city to cinders.",
      // Scene 10 - Great Battle
      "Rama built a bridge of rocks across the ocean — each stone inscribed with his name, floating by the power of devotion. The battle shook the three worlds for days and nights. When Lakshmana fell, Hanuman flew to the Himalayas and carried back an entire mountain bearing the life-restoring herb Sanjeevani.",
      // Scene 11 - Ravana's Defeat
      "Finally Rama and Ravana stood face to face. Every time Rama severed Ravana's head, a new one grew back. Then the sage Agastya revealed the secret. Rama took the divine Brahmastra arrow, chanted the sacred mantras, and released it. The ten-headed demon who had terrorized the three worlds for millennia fell — and light returned to the cosmos.",
      // Scene 12 - Return
      "Fourteen years of exile ended. Rama, Sita, and Lakshmana returned to Ayodhya in the divine flying chariot Pushpaka Vimana. The people lit oil lamps in every doorway, on every rooftop — ten thousand points of light driving away fourteen years of darkness. This was the first Diwali — the Festival of Lights.",
    ],
    hi: [
      // Scene 0 - Prologue
      "तमसो मा ज्योतिर्गमय। रामायण में आपका स्वागत है — ऋषि वाल्मीकि रचित अमर महाकाव्य। यह धर्म, भक्ति और अधर्म पर धर्म की शाश्वत विजय की कहानी है।",
      // Scene 1 - Ayodhya
      "पवित्र सरयू नदी की उपजाऊ घाटी में अयोध्या नगरी स्थित थी — वह नगरी जिसे कोई जीत नहीं सकता। सूर्यवंशी राजा दशरथ के राज्य में चार राजकुमारों ने राजघराने को धन्य किया। इनमें राम सूर्य के समान तेजस्वी थे — चंद्रमा की तरह कोमल, अग्नि की तरह तीव्र और समुद्र की तरह गंभीर।",
      // Scene 2 - Swayamvara
      "मिथिला के राजा जनक ने घोषणा की कि जो भी शिवजी के महाधनुष को उठाकर उस पर प्रत्यंचा चढ़ाएगा, वही उनकी पुत्री सीता से विवाह कर सकेगा। सीता पृथ्वी से प्रकट हुई थीं। सैकड़ों राजाओं ने प्रयास किया और असफल रहे। फिर राम ने सहज भाव से उस धनुष को उठाया, प्रत्यंचा चढ़ाई, और तोड़ दिया — और तीनों लोकों में आनंद छा गया।",
      // Scene 3 - Exile
      "रानी कैकेयी ने ईर्ष्या में आकर राजा दशरथ से दो वरदान मांगे — राम को चौदह वर्ष का वनवास और भरत को राजगद्दी। बिना किसी शिकायत के राम ने अपना भाग्य स्वीकार किया। सीता और लक्ष्मण ने उनका साथ देने से मना कर दिया। तीनों वन की ओर चल पड़े।",
      // Scene 4 - Forest Life
      "दंडकारण्य वन में विशाल वृक्षों और पवित्र नदियों के बीच तीनों को एक अजीब शांति मिली। ऋषियों से ज्ञान प्राप्त हुआ। लेकिन छाया में अंधेरे बल हलचल मचा रहे थे। राक्षसी शूर्पणखा उनसे मिली — और विनाश के बीज बो दिए गए।",
      // Scene 5 - Golden Deer
      "रावण ने अपने मायावी दानव मारीच को सोने के एक जादुई हिरण का रूप धारण करवाया — असंभव सुंदरता का प्राणी, जिसकी चमक पिघले सोने जैसी थी। सीता मोहित हो गईं। घायल मारीच ने राम की आवाज में पुकारा। जाल बिछ गया। वन में अंधेरा छा गया।",
      // Scene 6 - Abduction
      "दोनों भाइयों के जाने के बाद रावण एक ऋषि के वेश में आया और सीता को पकड़कर अपने उड़ते रथ में ले गया। सीता तीनों लोकों में राम को पुकारती रहीं। महान गृध्र जटायु ने वीरता से रावण पर आक्रमण किया — लेकिन राक्षस ने उनके पंख काट दिए। सबसे काला अध्याय शुरू हो चुका था।",
      // Scene 7 - Hanuman Meets Rama
      "ऋष्यमूक पर्वत पर पवन देव के पुत्र हनुमान ने राम की आंखों में दिव्य ज्योति पहचानी। भक्त और भगवान की उस मुलाकात में एक मित्रता बनी जिसने पूरे ब्रह्मांड को हिला दिया। सुग्रीव और राम ने पवित्र मैत्री की।",
      // Scene 8 - The Leap
      "लंका तक का समुद्र सौ योजन चौड़ा था — असंभव दूरी। लेकिन हनुमान पवन देव के पुत्र थे। अपनी दिव्य शक्ति स्मरण करते हुए वे पर्वत के समान विशाल हो गए, पृथ्वी को पैरों से दबाया, और स्वर्गीय वज्र की तरह आकाश में छलांग लगा दी।",
      // Scene 9 - Burning of Lanka
      "हनुमान ने अशोक वाटिका में सीता को पाया — बंधी हुई, लेकिन अटूट। रावण की सेना ने उन्हें पकड़कर उनकी पूंछ में आग लगाई — यह नहीं जानते थे कि पवन पुत्र की पूंछ अनंत है। हनुमान ने छलांग लगाई और अपनी जलती पूंछ से लंका के सोने के महल राख कर दिए।",
      // Scene 10 - Great Battle
      "राम ने समुद्र पर पत्थरों का सेतु बनाया — हर पत्थर पर राम का नाम था, भक्ति की शक्ति से तैरते थे। युद्ध दिन-रात तीनों लोकों में गूंजता रहा। जब लक्ष्मण घायल हुए, हनुमान पूरा हिमाचल पर्वत उठाकर ले आए जिस पर संजीवनी बूटी थी।",
      // Scene 11 - Ravana's Defeat
      "अंत में राम और रावण आमने-सामने आए। जब भी राम रावण का सिर काटते, नया सिर उग आता। तब ऋषि अगस्त्य ने रहस्य बताया। राम ने ब्रह्मास्त्र उठाया, पवित्र मंत्र पढ़े और छोड़ा। सहस्रों वर्षों से तीनों लोकों पर आतंक मचाने वाला दस सिर वाला राक्षस गिर पड़ा — और जगत में प्रकाश लौट आया।",
      // Scene 12 - Return
      "चौदह वर्षों का वनवास समाप्त हुआ। राम, सीता और लक्ष्मण पुष्पक विमान से अयोध्या लौटे। नगरवासियों ने हर द्वार पर, हर छत पर दीप जलाए — दस हजार प्रकाश बिंदुओं ने चौदह वर्षों के अंधकार को मिटा दिया। यही पहली दीपावली थी — प्रकाश का महापर्व।",
    ]
  };

  /* ── State ── */
  let currentLang = 'hi'; // default selection in overlay
  let narrationEnabled = true;
  let lastNarratedScene = -1;
  let userHasInteracted = false;

  /* ── Speech Synthesis helper ── */
  const synth = window.speechSynthesis;

  function getVoice(lang) {
    const voices = synth.getVoices();
    const code = lang === 'hi' ? 'hi' : 'en';
    // Prefer exact match, then language-only match
    return (
      voices.find(v => v.lang === (lang === 'hi' ? 'hi-IN' : 'en-US')) ||
      voices.find(v => v.lang.startsWith(code)) ||
      voices[0]
    );
  }

  function narrateText(text, lang) {
    if (!narrationEnabled || !text) return;
    synth.cancel();
    const utt = new SpeechSynthesisUtterance(text);
    utt.lang = lang === 'hi' ? 'hi-IN' : 'en-US';
    utt.rate = lang === 'hi' ? 0.88 : 0.92;
    utt.pitch = 0.95;
    utt.volume = 1;
    // Try to assign a voice after voices load
    const voice = getVoice(lang);
    if (voice) utt.voice = voice;
    utt.onstart = () => showSubtitle(text, true);
    utt.onend   = () => showSubtitle('', false);
    utt.onerror = () => showSubtitle('', false);
    synth.speak(utt);
  }

  /* ── Subtitle bar ── */
  const subtitleBar  = document.getElementById('narr-subtitle-bar');
  const subtitleText = document.getElementById('narr-subtitle-text');

  function showSubtitle(text, playing) {
    if (!subtitleText) return;
    if (!text) {
      subtitleBar.classList.remove('visible');
      subtitleText.innerHTML = '';
      return;
    }
    const wave = playing
      ? '<span class="narr-wave"><span></span><span></span><span></span><span></span></span>'
      : '';
    subtitleText.innerHTML = wave + text;
    subtitleBar.classList.add('visible');
  }

  /* ── Overlay + toggle logic ── */
  const overlay    = document.getElementById('narration-overlay');
  const narToggle  = document.getElementById('narr-toggle');
  const beginBtn   = document.getElementById('narr-begin');
  const pill       = document.getElementById('narr-pill');

  const overlayBtns = document.querySelectorAll('.narr-btn');
  const pillBtns    = document.querySelectorAll('.pill-btn');

  function setActiveLang(lang) {
    currentLang = lang;
    narrationEnabled = (lang !== 'none');
    // Update overlay toggle
    overlayBtns.forEach(b => b.classList.toggle('active', b.dataset.lang === lang));
    narToggle.dataset.active = lang;
    // Update pill
    pillBtns.forEach(b => b.classList.toggle('pill-active', b.dataset.lang === lang));
    // Stop speech if muted
    if (!narrationEnabled) {
      synth.cancel();
      showSubtitle('', false);
    }
  }

  // Wire overlay buttons
  overlayBtns.forEach(btn => {
    btn.addEventListener('click', () => setActiveLang(btn.dataset.lang));
  });

  // Wire pill buttons
  pillBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      setActiveLang(btn.dataset.lang);
      // Re-narrate current scene if switching to audio
      if (btn.dataset.lang !== 'none' && lastNarratedScene >= 0) {
        const texts = NARRATION[btn.dataset.lang];
        if (texts && texts[lastNarratedScene]) {
          narrateText(texts[lastNarratedScene], btn.dataset.lang);
        }
      }
    });
  });

  // Initialize with default selection
  setActiveLang('hi');

  // Begin button dismisses overlay
  beginBtn.addEventListener('click', () => {
    userHasInteracted = true;
    
    // Unlock speech synthesis on first user interaction
    const unlockUtt = new SpeechSynthesisUtterance('');
    unlockUtt.volume = 0;
    synth.speak(unlockUtt);

    overlay.classList.add('hidden');
    setTimeout(() => { overlay.style.display = 'none'; }, 500);
    pill.classList.add('visible');
    // Voices may load asynchronously in some browsers
    synth.onvoiceschanged = () => {}; // ensure loaded
    
    // Explicitly narrate the first scene if not already done, 
    // to ensure we play audio right after user interaction.
    if (narrationEnabled && lastNarratedScene <= 0) {
      lastNarratedScene = 0;
      setTimeout(() => narrateText(NARRATION[currentLang][0], currentLang), 800);
    }
  });

  /* ── Scroll-triggered scene narration ── */
  // We use a simple IntersectionObserver approach over GSAP so
  // narration works independently of GSAP scroll state.
  document.querySelectorAll('.scene').forEach((scene, index) => {
    const sceneObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting && entry.intersectionRatio > 0.3) {
          if (lastNarratedScene === index) return; // already narrated
          if (!userHasInteracted) return; // prevent speaking without user activation
          
          lastNarratedScene = index;
          if (!narrationEnabled) return;
          const texts = NARRATION[currentLang];
          if (texts && texts[index]) {
            // Small delay so visual animation leads audio
            setTimeout(() => narrateText(texts[index], currentLang), 800);
          }
        }
      });
    }, { threshold: 0.3 });
    sceneObserver.observe(scene);
  });

  // Stop narration when tab is hidden
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) synth.pause();
    else if (narrationEnabled) synth.resume();
  });

  // Keyboard shortcut: M = mute/unmute, H = Hindi, E = English
  window.addEventListener('keydown', (e) => {
    if (e.target.tagName === 'INPUT') return;
    if (e.key === 'm' || e.key === 'M') {
      setActiveLang(narrationEnabled ? 'none' : currentLang === 'none' ? 'en' : currentLang);
    }
    if (e.key === 'h' || e.key === 'H') setActiveLang('hi');
    if (e.key === 'e' || e.key === 'E') setActiveLang('en');
  });

})();
