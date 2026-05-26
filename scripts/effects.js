import { agentConnections } from "./data.js";
import { dom } from "./dom.js";
import { state } from "./state.js";

export function requestFullscreen() {
  if (!document.fullscreenElement) {
    document.documentElement.requestFullscreen?.();
  } else {
    document.exitFullscreen?.();
  }
}

export function startMetricLoop() {
  if (state.metricsIntervalId) {
    clearInterval(state.metricsIntervalId);
  }
  state.metricsIntervalId = setInterval(() => {
    if (state.isStageRunning) {
      state.tokenCount += 6 + Math.round(Math.random() * 12);
    }
    updateMetrics();
  }, 720);
}

export function startParticleBackground() {
  const canvas = dom.particleCanvas;
  const ctx = canvas.getContext("2d");
  let particles = [];
  const count = 78;

  function resizeCanvas() {
    canvas.width = window.innerWidth * window.devicePixelRatio;
    canvas.height = window.innerHeight * window.devicePixelRatio;
    canvas.style.width = `${window.innerWidth}px`;
    canvas.style.height = `${window.innerHeight}px`;
    ctx.setTransform(window.devicePixelRatio, 0, 0, window.devicePixelRatio, 0, 0);
    particles = Array.from({ length: count }, () => createParticle());
  }

  function createParticle() {
    return {
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      vx: (Math.random() - 0.5) * 0.32,
      vy: (Math.random() - 0.5) * 0.32,
      r: Math.random() * 1.8 + 0.6,
      glow: Math.random() * 0.6 + 0.2
    };
  }

  function draw() {
    ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);

    particles.forEach((particle, index) => {
      particle.x += particle.vx;
      particle.y += particle.vy;

      if (particle.x < -20) particle.x = window.innerWidth + 20;
      if (particle.x > window.innerWidth + 20) particle.x = -20;
      if (particle.y < -20) particle.y = window.innerHeight + 20;
      if (particle.y > window.innerHeight + 20) particle.y = -20;

      for (let j = index + 1; j < particles.length; j += 1) {
        const other = particles[j];
        const dx = particle.x - other.x;
        const dy = particle.y - other.y;
        const distance = Math.hypot(dx, dy);
        if (distance < 130) {
          const alpha = (1 - distance / 130) * 0.12;
          ctx.beginPath();
          ctx.moveTo(particle.x, particle.y);
          ctx.lineTo(other.x, other.y);
          ctx.strokeStyle = `rgba(111, 197, 255, ${alpha})`;
          ctx.lineWidth = 1;
          ctx.stroke();
        }
      }

      ctx.beginPath();
      ctx.arc(particle.x, particle.y, particle.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(143, 215, 255, ${particle.glow})`;
      ctx.shadowColor = "rgba(63, 231, 255, 0.22)";
      ctx.shadowBlur = 14;
      ctx.fill();
      ctx.shadowBlur = 0;
    });

    state.particleAnimationId = requestAnimationFrame(draw);
  }

  resizeCanvas();
  draw();

  window.addEventListener("resize", resizeCanvas);
}

export function handleResize() {
  updateLayoutScale();
  drawWorkflowConnections();
  drawAgentConnections();
}

export function updateLayoutScale() {
  if (!dom.appShell) {
    return;
  }

  if (window.innerWidth <= 1200) {
    document.documentElement.style.setProperty("--fit-scale", "1");
    return;
  }

  const designWidth = 1760;
  const designHeight = 920;
  const widthPadding = 24;
  const heightPadding = 20;
  const availableWidth = Math.max(320, window.innerWidth - widthPadding);
  const availableHeight = Math.max(320, window.innerHeight - heightPadding);
  const scale = Math.min(1, availableWidth / designWidth, availableHeight / designHeight);
  document.documentElement.style.setProperty("--fit-scale", scale.toFixed(4));
}

export function drawWorkflowConnections() {
  const svg = dom.workflowSvg;
  if (!svg) return;
  const wrapRect = dom.stageTrackWrap.getBoundingClientRect();
  const nodes = Array.from(dom.stageTrack.querySelectorAll(".stage-node"));
  const lineMarkup = [];

  for (let i = 0; i < nodes.length - 1; i += 1) {
    const currentRect = nodes[i].getBoundingClientRect();
    const nextRect = nodes[i + 1].getBoundingClientRect();
    const x1 = currentRect.left + currentRect.width / 2 - wrapRect.left;
    const y1 = currentRect.top + currentRect.height / 2 - wrapRect.top;
    const x2 = nextRect.left + nextRect.width / 2 - wrapRect.left;
    const y2 = nextRect.top + nextRect.height / 2 - wrapRect.top;
    const c1x = x1 + (x2 - x1) * 0.32;
    const c2x = x1 + (x2 - x1) * 0.68;
    const active = i < state.currentStageIndex || (i === state.currentStageIndex - 1 && state.isStageRunning);

    lineMarkup.push(`<path class="wf-base-line" d="M ${x1} ${y1} C ${c1x} ${y1}, ${c2x} ${y2}, ${x2} ${y2}"></path>`);
    if (active || (state.hasContext && i === 0 && state.currentStageIndex === 0)) {
      lineMarkup.push(`<path class="wf-active-line" d="M ${x1} ${y1} C ${c1x} ${y1}, ${c2x} ${y2}, ${x2} ${y2}"></path>`);
    }
  }

  svg.setAttribute("viewBox", `0 0 ${wrapRect.width} ${wrapRect.height}`);
  svg.innerHTML = `
    <defs>
      <linearGradient id="workflowGradient" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stop-color="#3fe7ff"></stop>
        <stop offset="55%" stop-color="#8fd7ff"></stop>
        <stop offset="100%" stop-color="#f6c46a"></stop>
      </linearGradient>
    </defs>
    ${lineMarkup.join("")}
  `;
}

export function drawAgentConnections() {
  const svg = dom.agentSvg;
  if (!svg) return;
  const mapRect = dom.agentMap.getBoundingClientRect();
  const nodes = {};
  dom.agentMap.querySelectorAll(".agent-node").forEach((node) => {
    nodes[node.dataset.agentId] = node.getBoundingClientRect();
  });

  const lines = agentConnections.map(([from, to]) => {
    const a = nodes[from];
    const b = nodes[to];
    if (!a || !b) return "";
    const x1 = a.left + a.width / 2 - mapRect.left;
    const y1 = a.top + a.height / 2 - mapRect.top;
    const x2 = b.left + b.width / 2 - mapRect.left;
    const y2 = b.top + b.height / 2 - mapRect.top;
    const active = state.activeAgents.includes(from) || state.activeAgents.includes(to);
    return `<line class="agent-line${active ? " active" : ""}" x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}"></line>`;
  }).join("");

  svg.setAttribute("viewBox", `0 0 ${mapRect.width} ${mapRect.height}`);
  svg.innerHTML = lines;
}

export function launchTransferBurst(fromEl, toEl, particleCount = 12) {
  if (!fromEl || !toEl) return;
  const fromRect = fromEl.getBoundingClientRect();
  const toRect = toEl.getBoundingClientRect();
  const startX = fromRect.left + fromRect.width / 2;
  const startY = fromRect.top + fromRect.height / 2;
  const endX = toRect.left + toRect.width / 2;
  const endY = toRect.top + toRect.height / 2;
  const dx = endX - startX;
  const dy = endY - startY;
  const length = Math.hypot(dx, dy);
  const angle = Math.atan2(dy, dx) * 180 / Math.PI;

  const beam = document.createElement("div");
  beam.className = "stage-energy-beam";
  beam.style.left = `${startX}px`;
  beam.style.top = `${startY}px`;
  beam.style.width = `${length}px`;
  beam.style.transform = `rotate(${angle}deg)`;
  document.body.appendChild(beam);

  for (let i = 0; i < particleCount; i += 1) {
    const particle = document.createElement("div");
    particle.className = "data-particle";
    particle.style.left = `${startX + (Math.random() - 0.5) * 36}px`;
    particle.style.top = `${startY + (Math.random() - 0.5) * 36}px`;
    particle.style.setProperty("--dx", `${dx + (Math.random() - 0.5) * 40}px`);
    particle.style.setProperty("--dy", `${dy + (Math.random() - 0.5) * 40}px`);
    particle.style.setProperty("--delay", `${i * 0.03}s`);
    document.body.appendChild(particle);

    const timeoutId = setTimeout(() => particle.remove(), 1300);
    state.timers.push(timeoutId);
  }

  const beamTimeout = setTimeout(() => beam.remove(), 1200);
  state.timers.push(beamTimeout);
}

export function triggerStageBurst() {
  dom.body.classList.remove("stage-burst");
  void dom.body.offsetWidth;
  dom.body.classList.add("stage-burst");
  const timeoutId = setTimeout(() => dom.body.classList.remove("stage-burst"), 900);
  state.timers.push(timeoutId);
}

export function formatTimecode() {
  const elapsed = Math.max(0, Math.floor((Date.now() - state.sessionStartedAt) / 1000));
  const mins = String(Math.floor(elapsed / 60)).padStart(2, "0");
  const secs = String(elapsed % 60).padStart(2, "0");
  return `${mins}:${secs}`;
}

export function updateMetrics() {
  const metricTime = document.getElementById("metric-timecode");
  const metricTokens = document.getElementById("metric-tokens");
  const metricAgents = document.getElementById("metric-agents");
  const metricConfidence = document.getElementById("metric-confidence");
  const metricFragments = document.getElementById("metric-fragments");

  if (metricTime) metricTime.textContent = formatTimecode();
  if (metricTokens) metricTokens.textContent = state.tokenCount.toLocaleString("en-US");
  if (metricAgents) metricAgents.textContent = String(state.activeAgents.length);
  if (metricConfidence) metricConfidence.textContent = `${state.confidence.toFixed(1)}%`;
  if (metricFragments) metricFragments.textContent = state.knowledgeFragments.toLocaleString("en-US");
}
