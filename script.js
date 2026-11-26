/* ==========================================================================
   Archa Bayram Invitation - Interactive Logic & Proximity Avoidance
   ========================================================================== */

(function () {
  'use strict';

  // DOM Elements
  const yesBtn = document.getElementById('yes-btn');
  const noBtn = document.getElementById('no-btn');
  const celebrationOverlay = document.getElementById('celebration-overlay');
  const confettiReplayBtn = document.getElementById('confetti-replay-btn');
  const resetBtn = document.getElementById('reset-btn');
  const soundToggleBtn = document.getElementById('sound-toggle');
  const soundIcon = document.getElementById('sound-icon');
  const snowCanvas = document.getElementById('snow-canvas');
  const confettiCanvas = document.getElementById('confetti-canvas');

  // State
  let soundEnabled = true;
  let isEvading = false;
  let audioCtx = null;

  /* --------------------------------------------------------------------------
     1. Web Audio API - Holiday Synth Bells & Whoosh
     -------------------------------------------------------------------------- */
  function getAudioContext() {
    if (!audioCtx) {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (AudioContextClass) {
        audioCtx = new AudioContextClass();
      }
    }
    if (audioCtx && audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
    return audioCtx;
  }

  function playWhooshSound() {
    if (!soundEnabled) return;
    try {
      const ctx = getAudioContext();
      if (!ctx) return;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      const now = ctx.currentTime;
      osc.frequency.setValueAtTime(380, now);
      osc.frequency.exponentialRampToValueAtTime(140, now + 0.14);

      gain.gain.setValueAtTime(0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.14);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.15);
    } catch (e) {
      // Audio autoplay policy fallback
    }
  }

  function playCelebrationTune() {
    if (!soundEnabled) return;
    try {
      const ctx = getAudioContext();
      if (!ctx) return;

      // Jingle Bells opening melody frequencies: E5, E5, E5, E5, E5, E5, E5, G5, C5, D5, E5
      const notes = [
        { f: 659.25, d: 0.22, delay: 0 },       // E5
        { f: 659.25, d: 0.22, delay: 0.24 },    // E5
        { f: 659.25, d: 0.44, delay: 0.48 },    // E5
        { f: 659.25, d: 0.22, delay: 0.98 },    // E5
        { f: 659.25, d: 0.22, delay: 1.22 },    // E5
        { f: 659.25, d: 0.44, delay: 1.46 },    // E5
        { f: 659.25, d: 0.22, delay: 1.96 },    // E5
        { f: 783.99, d: 0.22, delay: 2.20 },    // G5
        { f: 523.25, d: 0.28, delay: 2.44 },    // C5
        { f: 587.33, d: 0.22, delay: 2.74 },    // D5
        { f: 659.25, d: 0.65, delay: 2.98 }     // E5
      ];

      const startTime = ctx.currentTime + 0.05;

      notes.forEach(note => {
        const osc = ctx.createOscillator();
        const overtone = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'triangle';
        osc.frequency.value = note.f;

        // Sweet bell chime overtone (2nd harmonic)
        overtone.type = 'sine';
        overtone.frequency.value = note.f * 2;

        const noteTime = startTime + note.delay;
        gain.gain.setValueAtTime(0, noteTime);
        gain.gain.linearRampToValueAtTime(0.18, noteTime + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, noteTime + note.d);

        osc.connect(gain);
        overtone.connect(gain);
        gain.connect(ctx.destination);

        osc.start(noteTime);
        overtone.start(noteTime);
        osc.stop(noteTime + note.d + 0.05);
        overtone.stop(noteTime + note.d + 0.05);
      });
    } catch (e) {
      // Audio autoplay policy fallback
    }
  }

  // Sound toggle button
  soundToggleBtn.addEventListener('click', () => {
    soundEnabled = !soundEnabled;
    soundToggleBtn.classList.toggle('muted', !soundEnabled);
    soundIcon.textContent = soundEnabled ? '🔔' : '🔕';
    if (soundEnabled) {
      getAudioContext();
    }
  });

  /* --------------------------------------------------------------------------
     2. "No" Button Proximity Avoidance Engine (STRICT WINDOW CONTAINMENT)
     -------------------------------------------------------------------------- */
  const PROXIMITY_THRESHOLD = 130; // distance in pixels to trigger evasion

  function ensureEvadingMode() {
    if (!isEvading) {
      isEvading = true;
      const rect = noBtn.getBoundingClientRect();
      noBtn.classList.add('evading');
      noBtn.style.left = `${Math.round(rect.left)}px`;
      noBtn.style.top = `${Math.round(rect.top)}px`;
    }
  }

  function dodge(pointerX, pointerY) {
    ensureEvadingMode();

    const vpWidth = window.innerWidth;
    const vpHeight = window.innerHeight;

    // Current button size and bounds
    const btnWidth = noBtn.offsetWidth || 140;
    const btnHeight = noBtn.offsetHeight || 56;

    // Safe boundaries: button must never touch/exceed window edges
    const padding = 20;
    const minX = padding;
    const maxX = Math.max(minX, vpWidth - btnWidth - padding);
    const minY = padding;
    const maxY = Math.max(minY, vpHeight - btnHeight - padding);

    const rect = noBtn.getBoundingClientRect();
    const btnCenterX = rect.left + btnWidth / 2;
    const btnCenterY = rect.top + btnHeight / 2;

    // Vector pointing away from cursor
    let vx = btnCenterX - pointerX;
    let vy = btnCenterY - pointerY;
    let dist = Math.hypot(vx, vy);

    if (dist < 1) {
      vx = Math.random() - 0.5;
      vy = Math.random() - 0.5;
      dist = Math.hypot(vx, vy);
    }

    const nx = vx / dist;
    const ny = vy / dist;

    // Push distance
    const pushDist = Math.max(140, (PROXIMITY_THRESHOLD - dist) * 1.5 + 100);

    let targetX = btnCenterX + nx * pushDist - btnWidth / 2;
    let targetY = btnCenterY + ny * pushDist - btnHeight / 2;

    // Check if pushed outside or into a corner
    const hitsEdgeX = targetX < minX || targetX > maxX;
    const hitsEdgeY = targetY < minY || targetY > maxY;

    if (hitsEdgeX) {
      if (pointerX < vpWidth / 2) {
        // Cursor on left half -> jump to right half
        targetX = vpWidth * 0.52 + Math.random() * Math.max(10, maxX - vpWidth * 0.52);
      } else {
        // Cursor on right half -> jump to left half
        targetX = minX + Math.random() * Math.max(10, vpWidth * 0.48 - minX - btnWidth);
      }
    }

    if (hitsEdgeY) {
      if (pointerY < vpHeight / 2) {
        // Cursor on top half -> jump to bottom half
        targetY = vpHeight * 0.52 + Math.random() * Math.max(10, maxY - vpHeight * 0.52);
      } else {
        // Cursor on bottom half -> jump to top half
        targetY = minY + Math.random() * Math.max(10, vpHeight * 0.48 - minY - btnHeight);
      }
    }

    // Ensure we do not overlap the stationary YES button
    const yesRect = yesBtn.getBoundingClientRect();
    const margin = 20;
    const overlapsYes =
      targetX < yesRect.right + margin &&
      targetX + btnWidth > yesRect.left - margin &&
      targetY < yesRect.bottom + margin &&
      targetY + btnHeight > yesRect.top - margin;

    if (overlapsYes) {
      if (targetY > vpHeight / 2) {
        targetY = Math.min(maxY, yesRect.bottom + margin + 20);
      } else {
        targetY = Math.max(minY, yesRect.top - btnHeight - margin - 20);
      }
    }

    // Absolute clamp: GUARANTEE the button remains 100% inside window
    targetX = Math.max(minX, Math.min(maxX, targetX));
    targetY = Math.max(minY, Math.min(maxY, targetY));

    // Apply coordinate
    noBtn.style.left = `${Math.round(targetX)}px`;
    noBtn.style.top = `${Math.round(targetY)}px`;

    // Playful wobble animation
    noBtn.classList.remove('wobble');
    void noBtn.offsetWidth; // trigger reflow
    noBtn.classList.add('wobble');

    // Escape whoosh sound
    playWhooshSound();
  }

  // Pointer movement listener
  function handlePointerMove(e) {
    const clientX = e.clientX;
    const clientY = e.clientY;

    const rect = noBtn.getBoundingClientRect();
    const btnWidth = noBtn.offsetWidth || 140;
    const btnHeight = noBtn.offsetHeight || 56;
    const btnCenterX = rect.left + btnWidth / 2;
    const btnCenterY = rect.top + btnHeight / 2;

    const dist = Math.hypot(clientX - btnCenterX, clientY - btnCenterY);

    if (dist < PROXIMITY_THRESHOLD) {
      dodge(clientX, clientY);
    }
  }

  window.addEventListener('pointermove', handlePointerMove, { passive: true });

  // Safety intercepts: prevent click, hover, touch, keyboard focus
  ['mouseenter', 'pointerdown', 'touchstart', 'focus'].forEach(eventType => {
    noBtn.addEventListener(eventType, (e) => {
      e.preventDefault();
      e.stopPropagation();
      const rect = noBtn.getBoundingClientRect();
      const clientX = e.clientX || rect.left + rect.width / 2;
      const clientY = e.clientY || rect.top + rect.height / 2;
      dodge(clientX, clientY);
      noBtn.blur();
    }, { passive: false });
  });

  noBtn.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    const rect = noBtn.getBoundingClientRect();
    dodge(rect.left + rect.width / 2, rect.top + rect.height / 2);
  });

  /* --------------------------------------------------------------------------
     3. "Yes" Button Action & Celebration Modal
     -------------------------------------------------------------------------- */
  yesBtn.addEventListener('click', () => {
    celebrationOverlay.classList.add('show');
    celebrationOverlay.setAttribute('aria-hidden', 'false');
    playCelebrationTune();
    launchConfetti();
  });

  confettiReplayBtn.addEventListener('click', () => {
    launchConfetti();
    playCelebrationTune();
  });

  resetBtn.addEventListener('click', () => {
    celebrationOverlay.classList.remove('show');
    celebrationOverlay.setAttribute('aria-hidden', 'true');

    // Reset No button back to slot
    isEvading = false;
    noBtn.classList.remove('evading', 'wobble');
    noBtn.style.left = '';
    noBtn.style.top = '';
  });

  /* --------------------------------------------------------------------------
     4. Canvas Snow Simulation
     -------------------------------------------------------------------------- */
  const snowCtx = snowCanvas.getContext('2d');
  let snowWidth = (snowCanvas.width = window.innerWidth);
  let snowHeight = (snowCanvas.height = window.innerHeight);

  const SNOW_FLAKES_COUNT = 90;
  const snowflakes = [];

  class Snowflake {
    constructor() {
      this.reset(true);
    }

    reset(initial = false) {
      this.x = Math.random() * snowWidth;
      this.y = initial ? Math.random() * snowHeight : -10;
      this.radius = Math.random() * 2.8 + 1.2;
      this.speed = Math.random() * 1.2 + 0.6;
      this.wind = Math.random() * 0.8 - 0.4;
      this.swayAngle = Math.random() * Math.PI * 2;
      this.swaySpeed = Math.random() * 0.02 + 0.01;
      this.opacity = Math.random() * 0.5 + 0.35;
    }

    update() {
      this.y += this.speed;
      this.swayAngle += this.swaySpeed;
      this.x += Math.sin(this.swayAngle) * 0.7 + this.wind;

      if (this.y > snowHeight + 10 || this.x < -10 || this.x > snowWidth + 10) {
        this.reset(false);
      }
    }

    draw(ctx) {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255, 255, 255, ${this.opacity})`;
      ctx.shadowColor = 'rgba(255, 255, 255, 0.4)';
      ctx.shadowBlur = 4;
      ctx.fill();
    }
  }

  for (let i = 0; i < SNOW_FLAKES_COUNT; i++) {
    snowflakes.push(new Snowflake());
  }

  function renderSnow() {
    snowCtx.clearRect(0, 0, snowWidth, snowHeight);
    snowflakes.forEach(flake => {
      flake.update();
      flake.draw(snowCtx);
    });
    requestAnimationFrame(renderSnow);
  }

  renderSnow();

  /* --------------------------------------------------------------------------
     5. Canvas Confetti Particle System
     -------------------------------------------------------------------------- */
  const confettiCtx = confettiCanvas.getContext('2d');
  let confettiWidth = (confettiCanvas.width = window.innerWidth);
  let confettiHeight = (confettiCanvas.height = window.innerHeight);

  let confettiParticles = [];
  let confettiAnimationId = null;

  const CONFETTI_COLORS = [
    '#EF4444', '#F59E0B', '#10B981', '#3B82F6',
    '#8B5CF6', '#EC4899', '#FBBF24', '#06B6D4'
  ];

  class ConfettiParticle {
    constructor(x, y) {
      this.x = x;
      this.y = y;
      this.color = CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)];
      this.size = Math.random() * 8 + 6;
      this.speedX = (Math.random() - 0.5) * 18;
      this.speedY = Math.random() * -18 - 8;
      this.gravity = 0.45;
      this.rotation = Math.random() * 360;
      this.rotationSpeed = (Math.random() - 0.5) * 12;
      this.opacity = 1;
      this.decay = Math.random() * 0.008 + 0.005;
      this.shape = Math.random() > 0.3 ? 'rect' : 'circle';
    }

    update() {
      this.speedY += this.gravity;
      this.speedX *= 0.98;
      this.x += this.speedX;
      this.y += this.speedY;
      this.rotation += this.rotationSpeed;
      this.opacity -= this.decay;
    }

    draw(ctx) {
      if (this.opacity <= 0) return;
      ctx.save();
      ctx.translate(this.x, this.y);
      ctx.rotate((this.rotation * Math.PI) / 180);
      ctx.globalAlpha = Math.max(0, this.opacity);
      ctx.fillStyle = this.color;

      if (this.shape === 'rect') {
        ctx.fillRect(-this.size / 2, -this.size / 4, this.size, this.size / 2);
      } else {
        ctx.beginPath();
        ctx.arc(0, 0, this.size / 3, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.restore();
    }
  }

  function launchConfetti() {
    const originX1 = window.innerWidth * 0.25;
    const originX2 = window.innerWidth * 0.75;
    const originY = window.innerHeight * 0.65;

    for (let i = 0; i < 70; i++) {
      confettiParticles.push(new ConfettiParticle(originX1, originY));
      confettiParticles.push(new ConfettiParticle(originX2, originY));
    }

    if (!confettiAnimationId) {
      animateConfetti();
    }
  }

  function animateConfetti() {
    confettiCtx.clearRect(0, 0, confettiWidth, confettiHeight);

    confettiParticles = confettiParticles.filter(p => p.opacity > 0 && p.y < confettiHeight + 50);

    confettiParticles.forEach(p => {
      p.update();
      p.draw(confettiCtx);
    });

    if (confettiParticles.length > 0) {
      confettiAnimationId = requestAnimationFrame(animateConfetti);
    } else {
      confettiCtx.clearRect(0, 0, confettiWidth, confettiHeight);
      confettiAnimationId = null;
    }
  }

  // Handle window resizing & ensure No button is clamped inside new window size
  window.addEventListener('resize', () => {
    snowWidth = snowCanvas.width = window.innerWidth;
    snowHeight = snowCanvas.height = window.innerHeight;
    confettiWidth = confettiCanvas.width = window.innerWidth;
    confettiHeight = confettiCanvas.height = window.innerHeight;

    if (isEvading) {
      const btnWidth = noBtn.offsetWidth || 140;
      const btnHeight = noBtn.offsetHeight || 56;
      const padding = 20;
      const minX = padding;
      const maxX = Math.max(minX, window.innerWidth - btnWidth - padding);
      const minY = padding;
      const maxY = Math.max(minY, window.innerHeight - btnHeight - padding);

      const curLeft = parseFloat(noBtn.style.left) || minX;
      const curTop = parseFloat(noBtn.style.top) || minY;

      const clampedX = Math.max(minX, Math.min(maxX, curLeft));
      const clampedY = Math.max(minY, Math.min(maxY, curTop));

      noBtn.style.left = `${Math.round(clampedX)}px`;
      noBtn.style.top = `${Math.round(clampedY)}px`;
    }
  });

})();
