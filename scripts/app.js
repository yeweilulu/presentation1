import { cacheDom, dom } from "./dom.js";
import { drawAgentConnections, drawWorkflowConnections, handleResize, startMetricLoop, startParticleBackground, updateLayoutScale, requestFullscreen } from "./effects.js";
import { renderAgents, renderKnowledge, renderMetrics, renderReport, renderStageFocus, renderTasks, renderWorkflow, updateButtons, updateStaticLabels } from "./render.js";
import { createRuntimeState } from "./state.js";
import { goNextStage, resetDemo, sendEnterpriseContext } from "./workflow.js";

function bindEvents() {
  dom.sendContextBtn.addEventListener("click", sendEnterpriseContext);
  dom.nextStageBtn.addEventListener("click", goNextStage);
  dom.resetDemoBtn.addEventListener("click", resetDemo);
  dom.fullscreenBtn.addEventListener("click", requestFullscreen);
}

function initDemo() {
  cacheDom();
  updateLayoutScale();
  createRuntimeState();
  renderMetrics();
  renderWorkflow();
  renderStageFocus();
  renderTasks();
  renderAgents();
  renderKnowledge();
  renderReport();
  bindEvents();
  updateButtons();
  updateStaticLabels();
  drawWorkflowConnections();
  drawAgentConnections();
  startMetricLoop();
  startParticleBackground();
  window.addEventListener("resize", handleResize);
}

document.addEventListener("DOMContentLoaded", initDemo);
