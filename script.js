const canvas = document.getElementById("cosmic-canvas");
const ctx = canvas.getContext("2d");

const phaseReadout = document.getElementById("phase-readout");
const tempReadout = document.getElementById("temp-readout");
const audioBtn = document.getElementById("audio-btn");
const collapseBtn = document.getElementById("collapse-btn");
const resetBtn = document.getElementById("reset-btn");
const presetButtons = document.querySelectorAll(".preset-btn");
const compSlider = document.getElementById("compression-slider");
const compVal = document.getElementById("comp-val");

const barFe = document.getElementById("bar-fe");
const barAu = document.getElementById("bar-au");
const barPt = document.getElementById("bar-pt");
const barU  = document.getElementById("bar-u");

function resize() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
window.addEventListener("resize", resize);
resize();

// Simulation State
let stellarMass = 18; // Solar masses (M☉)
let compression = 1.0;
let phase = "stable"; // 'stable', 'imploding', 'exploding', 'remnant'
let starRadius = 140;
let targetRadius = 140;
let shockwaveRadius = 0;
let shockwaveOpacity = 0;
let pulsarAngle = 0;

let forgedElements = { fe: 25, au: 0, pt: 0, u: 0 };
let ejectaParticles = [];
let backgroundStars = [];

// Generate Deep Space Ambient Stars
for (let i = 0; i < 280; i++) {
  backgroundStars.push({
    x: Math.random() * window.innerWidth,
    y: Math.random() * window.innerHeight,
    size: Math.random() * 1.5 + 0.4,
    alpha: Math.random() * 0.8 + 0.2
  });
}

// Web Audio API Synthesizer (Cosmic Fusion Rumble & Shockwave Bang)
let audioCtx = null;
let isAudioActive = false;
let rumbleOsc = null;
let rumbleGain = null;

function initAudio() {
  if (audioCtx) return;
  audioCtx = new (window.AudioContext || window.webkitAudioContext)();

  rumbleOsc = audioCtx.createOscillator();
  rumbleOsc.type = "sawtooth";
  rumbleOsc.frequency.setValueAtTime(45, audioCtx.currentTime);

  const filter = audioCtx.createBiquadFilter();
  filter.type = "lowpass";
  filter.frequency.setValueAtTime(110, audioCtx.currentTime);

  rumbleGain = audioCtx.createGain();
  rumbleGain.gain.setValueAtTime(0.02, audioCtx.currentTime);

  rumbleOsc.connect(filter);
  filter.connect(rumbleGain);
  rumbleGain.connect(audioCtx.destination);
  rumbleOsc.start();
}

function playShockwaveAudio() {
  if (!audioCtx || !isAudioActive) return;

  // Explosive white noise blast
  const bufferSize = audioCtx.sampleRate * 2.5;
  const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) {
    data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (audioCtx.sampleRate * 0.5));
  }

  const blast = audioCtx.createBufferSource();
  blast.buffer = buffer;

  const blastGain = audioCtx.createGain();
  blastGain.gain.setValueAtTime(0.28, audioCtx.currentTime);
  blastGain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 2.4);

  blast.connect(blastGain);
  blastGain.connect(audioCtx.destination);
  blast.start();
}

// Particle Class for Explosive Nucleosynthesis Ejecta
class Ejecta {
  constructor(x, y, angle, speed, color, element) {
    this.x = x;
    this.y = y;
    this.vx = Math.cos(angle) * speed;
    this.vy = Math.sin(angle) * speed;
    this.color = color;
    this.element = element;
    this.size = Math.random() * 2.8 + 1.2;
    this.alpha = 1.0;
    this.decay = Math.random() * 0.004 + 0.002;
  }

  update() {
    this.x += this.vx;
    this.y += this.vy;
    this.vx *= 0.992;
    this.vy *= 0.992;
    this.alpha -= this.decay;
    return this.alpha > 0;
  }

  draw() {
    ctx.save();
    ctx.globalAlpha = Math.max(0, this.alpha);
    ctx.fillStyle = this.color;
    ctx.shadowColor = this.color;
    ctx.shadowBlur = 8;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
}

// Trigger Core Collapse Sequence
function triggerCollapse() {
  if (phase !== "stable") return;
  phase = "imploding";
  phaseReadout.textContent = "Gravitational Implosion";
  tempReadout.textContent = "1.8 × 10⁸ K";

  if (rumbleOsc && isAudioActive) {
    rumbleOsc.frequency.exponentialRampToValueAtTime(140, audioCtx.currentTime + 0.8);
    rumbleGain.gain.linearRampToValueAtTime(0.08, audioCtx.currentTime + 0.8);
  }
}

// Spawn Ejecta across Nucleosynthesis R-Process
function explodeStar(cx, cy) {
  phase = "exploding";
  phaseReadout.textContent = "R-Process Core Detonation";
  tempReadout.textContent = "3.2 × 10⁹ K";
  shockwaveRadius = 10;
  shockwaveOpacity = 1.0;
  playShockwaveAudio();

  const colors = [
    { color: "#60a5fa", el: "fe" },
    { color: "#facc15", el: "au" },
    { color: "#a78bfa", el: "pt" },
    { color: "#34d399", el: "u" }
  ];

  for (let i = 0; i < 900; i++) {
    const angle = Math.random() * Math.PI * 2;
    const speed = (Math.random() * 14 + 3) * compression;
    const item = colors[Math.floor(Math.random() * colors.length)];
    ejectaParticles.push(new Ejecta(cx, cy, angle, speed, item.color, item.el));
  }

  // Nucleosynthesis element generation
  forgedElements.fe = 70;
  forgedElements.au = Math.min(100, Math.floor(compression * 65));
  forgedElements.pt = Math.min(100, Math.floor(compression * 55));
  forgedElements.u  = Math.min(100, Math.floor(compression * 42));

  barFe.style.width = `${forgedElements.fe}%`;
  barAu.style.width = `${forgedElements.au}%`;
  barPt.style.width = `${forgedElements.pt}%`;
  barU.style.width  = `${forgedElements.u}%`;
}

// Reset Entire Progenitor
function resetSystem() {
  phase = "stable";
  starRadius = 140;
  targetRadius = 140;
  shockwaveRadius = 0;
  shockwaveOpacity = 0;
  ejectaParticles = [];

  forgedElements = { fe: 25, au: 0, pt: 0, u: 0 };
  barFe.style.width = "25%";
  barAu.style.width = "0%";
  barPt.style.width = "0%";
  barU.style.width  = "0%";

  phaseReadout.textContent = stellarMass > 40 ? "Wolf-Rayet Star" : "Blue Supergiant";
  tempReadout.textContent = "28,000 K";

  if (rumbleOsc && isAudioActive) {
    rumbleOsc.frequency.setValueAtTime(45, audioCtx.currentTime);
    rumbleGain.gain.setValueAtTime(0.02, audioCtx.currentTime);
  }
}

// Main Canvas Render Loop
function animate() {
  ctx.fillStyle = "rgba(2, 2, 5, 0.35)";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  const cx = canvas.width / 2;
  const cy = canvas.height / 2;

  // 1. Background Starfield
  for (let s of backgroundStars) {
    ctx.fillStyle = `rgba(255, 255, 255, ${s.alpha})`;
    ctx.fillRect(s.x, s.y, s.size, s.size);
  }

  // 2. Physics & Phase Transitions
  if (phase === "stable") {
    // Gentle convective breathing of stellar atmosphere
    starRadius = targetRadius + Math.sin(Date.now() * 0.003) * 4;

    // Draw Blue Supergiant Star
    const grad = ctx.createRadialGradient(cx, cy, starRadius * 0.1, cx, cy, starRadius);
    grad.addColorStop(0, "#ffffff");
    grad.addColorStop(0.3, "#60a5fa");
    grad.addColorStop(0.7, "#3b82f6");
    grad.addColorStop(1, "rgba(59, 130, 246, 0)");

    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(cx, cy, starRadius, 0, Math.PI * 2);
    ctx.fill();

    // Dense Iron Core
    ctx.fillStyle = "#93c5fd";
    ctx.shadowColor = "#60a5fa";
    ctx.shadowBlur = 18;
    ctx.beginPath();
    ctx.arc(cx, cy, 22, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;
  }
  else if (phase === "imploding") {
    starRadius -= 6.5 * compression;

    const grad = ctx.createRadialGradient(cx, cy, 2, cx, cy, Math.max(10, starRadius));
    grad.addColorStop(0, "#ffffff");
    grad.addColorStop(0.4, "#f97316");
    grad.addColorStop(1, "rgba(239, 68, 68, 0)");

    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(cx, cy, Math.max(8, starRadius), 0, Math.PI * 2);
    ctx.fill();

    if (starRadius <= 8) {
      explodeStar(cx, cy);
    }
  }
  else if (phase === "exploding" || phase === "remnant") {
    // Expanding Relativistic Shockwave
    if (shockwaveOpacity > 0.01) {
      shockwaveRadius += 12 * compression;
      shockwaveOpacity *= 0.978;

      ctx.save();
      ctx.strokeStyle = `rgba(255, 255, 255, ${shockwaveOpacity})`;
      ctx.lineWidth = 4;
      ctx.shadowColor = "#38bdf8";
      ctx.shadowBlur = 24;
      ctx.beginPath();
      ctx.arc(cx, cy, shockwaveRadius, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    } else if (phase === "exploding") {
      phase = "remnant";
      phaseReadout.textContent = stellarMass > 30 ? "Stellar Mass Black Hole" : "Rapidly Spinning Pulsar";
      tempReadout.textContent = stellarMass > 30 ? "1.2 × 10⁶ K" : "8.5 × 10⁵ K";
    }

    // High-Energy Remnant Core
    if (stellarMass <= 30) {
      // Spinning Pulsar with Lighthouse Beams
      pulsarAngle += 0.08;
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(pulsarAngle);

      // Relativistic emission beams
      const beamGrad = ctx.createLinearGradient(-350, 0, 350, 0);
      beamGrad.addColorStop(0, "rgba(56, 189, 248, 0)");
      beamGrad.addColorStop(0.48, "rgba(56, 189, 248, 0.7)");
      beamGrad.addColorStop(0.5, "#ffffff");
      beamGrad.addColorStop(0.52, "rgba(56, 189, 248, 0.7)");
      beamGrad.addColorStop(1, "rgba(56, 189, 248, 0)");

      ctx.fillStyle = beamGrad;
      ctx.fillRect(-350, -4, 700, 8);

      // Neutron core
      ctx.fillStyle = "#ffffff";
      ctx.shadowColor = "#38bdf8";
      ctx.shadowBlur = 18;
      ctx.beginPath();
      ctx.arc(0, 0, 9, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    } else {
      // Black Hole Event Horizon Remnant
      ctx.save();
      ctx.fillStyle = "#000000";
      ctx.strokeStyle = "rgba(56, 189, 248, 0.6)";
      ctx.lineWidth = 3;
      ctx.shadowColor = "#38bdf8";
      ctx.shadowBlur = 20;
      ctx.beginPath();
      ctx.arc(cx, cy, 18, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.restore();
    }
  }

  // 3. Update & Draw Ejecta Debris
  for (let i = ejectaParticles.length - 1; i >= 0; i--) {
    const p = ejectaParticles[i];
    if (!p.update()) {
      ejectaParticles.splice(i, 1);
    } else {
      p.draw();
    }
  }

  requestAnimationFrame(animate);
}
animate();

// UI Event Listeners
collapseBtn.addEventListener("click", triggerCollapse);
resetBtn.addEventListener("click", resetSystem);

presetButtons.forEach(btn => {
  btn.addEventListener("click", () => {
    presetButtons.forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    stellarMass = parseInt(btn.dataset.mass);
    resetSystem();
  });
});

compSlider.addEventListener("input", (e) => {
  compression = parseFloat(e.target.value);
  compVal.textContent = `${compression.toFixed(1)}x`;
});

audioBtn.addEventListener("click", () => {
  initAudio();
  if (audioCtx.state === "suspended") audioCtx.resume();

  isAudioActive = !isAudioActive;
  audioBtn.textContent = isAudioActive ? "🔊 Audio: ON" : "🔇 Audio: OFF";
  audioBtn.classList.toggle("active-audio", isAudioActive);

  if (!isAudioActive && rumbleGain) {
    rumbleGain.gain.setValueAtTime(0, audioCtx.currentTime);
  } else if (rumbleGain) {
    rumbleGain.gain.setValueAtTime(0.02, audioCtx.currentTime);
  }
});