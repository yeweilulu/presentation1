import { finalReportSections, stages } from "./data.js";
import { dom } from "./dom.js";
import { launchTransferBurst, startMetricLoop, triggerStageBurst, updateMetrics } from "./effects.js";
import { renderAgents, renderKnowledge, renderReport, renderStageFocus, renderTasks, renderWorkflow, updateButtons, updateStaticLabels, formatAgentNames } from "./render.js";
import { clearTimers, createRuntimeState, resetCoreState, state } from "./state.js";

const STEP_TIME_SCALE = 0.5;

function scaledDelay(ms) {
  return Math.max(0, Math.round(ms * STEP_TIME_SCALE));
}

export function sendEnterpriseContext() {
  if (state.hasContext || state.isStageRunning) {
    return;
  }
  state.hasContext = true;
  state.sessionStartedAt = Date.now();
  setContextReadOnly(true);
  dom.appShell.classList.add("injecting");
  dom.contextStatusCard.classList.add("visible");
  dom.contextStatusText.textContent = `${dom.companyName.value} / ${dom.industry.value} / 目标已注入工作流`;
  launchTransferBurst(dom.contextForm, getStageNode(0), 18);
  updateStaticLabels();
  renderWorkflow();
  renderStageFocus();
  updateButtons();
  const timeoutId = setTimeout(() => {
    dom.appShell.classList.remove("injecting");
    startStage(0);
  }, scaledDelay(860));
  state.timers.push(timeoutId);
}

export function startStage(index) {
  if (!state.hasContext || state.isStageRunning || index < 0 || index >= stages.length) {
    return;
  }

  state.currentStageIndex = index;
  dom.appShell.classList.toggle("final-report-active", index >= 5);
  state.currentTaskIndex = -1;
  state.isStageRunning = true;
  state.workflowStates = state.workflowStates.map((workflowState, stageIndex) => {
    if (stageIndex < index) return "completed";
    if (stageIndex === index) return "active";
    return "pending";
  });
  resetAgentActionLog();
  setActiveAgents([], `当前阶段：${stages[index].shortTitle}。该区会按执行顺序逐条推入本阶段 Agent 动作。`);

  triggerStageBurst();
  renderWorkflow();
  renderStageFocus();
  renderTasks();
  updateStaticLabels();
  updateButtons();

  if (index > 0) {
    launchTransferBurst(getStageNode(index - 1), getStageNode(index), 10);
  }

  const timeoutId = setTimeout(() => runStageTask(0), scaledDelay(420));
  state.timers.push(timeoutId);
}

export function runStageTask(taskIndex) {
  if (!state.isStageRunning || state.currentStageIndex < 0) {
    return;
  }

  const tasks = state.runtimeTasks[state.currentStageIndex];
  if (!tasks) {
    completeStage();
    return;
  }

  if (taskIndex >= tasks.length) {
    if (state.currentStageIndex === stages.length - 1) {
      startFinalReportStreaming();
    } else {
      completeStage();
    }
    return;
  }

  state.currentTaskIndex = taskIndex;
  tasks.forEach((task, index) => {
    if (index > taskIndex && task.status !== "completed") {
      task.status = "pending";
    }
  });

  const task = tasks[taskIndex];
  task.status = "running";
  setActiveAgents(task.agentIds, task.detail, {
    pushLog: true,
    logTitle: task.label,
    logText: task.detail
  });
  renderTasks();
  updateStaticLabels();
  renderAgents();
  renderKnowledge();

  const duration = scaledDelay(1050 + Math.round(Math.random() * 420));
  const timeoutId = setTimeout(() => {
    task.status = "completed";
    markLatestAgentLogCompleted(task.result);
    state.tokenCount += task.tokenDelta || 180;
    state.confidence = Math.min(99.6, state.confidence + (task.confidenceDelta || 0.2));
    if (task.knowledgeDelta) {
      state.knowledgeFragments += task.knowledgeDelta;
    }
    if (task.hits) {
      task.hits.forEach((hit) => addKnowledgeHit(hit));
    }
    renderTasks();
    renderKnowledge();
    renderStageFocus();
    updateMetrics();
    const nextTimeout = setTimeout(() => runStageTask(taskIndex + 1), scaledDelay(340));
    state.timers.push(nextTimeout);
  }, duration);
  state.timers.push(timeoutId);
}

export function completeStage() {
  if (state.currentStageIndex < 0) {
    return;
  }

  state.workflowStates[state.currentStageIndex] = "completed";
  state.isStageRunning = false;
  state.currentTaskIndex = -1;
  setActiveAgents([], `阶段完成：${stages[state.currentStageIndex].shortTitle}`);
  renderWorkflow();
  renderStageFocus();
  renderTasks();
  renderAgents();
  renderKnowledge();
  updateStaticLabels();

  if (state.currentStageIndex === stages.length - 1) {
    state.isWorkflowComplete = true;
    dom.body.classList.add("workflow-complete");
    const timeoutId = setTimeout(() => {
      dom.body.classList.remove("workflow-complete");
    }, scaledDelay(1300));
    state.timers.push(timeoutId);
  }

  updateButtons();
}

export function goNextStage() {
  if (!state.hasContext || state.isStageRunning || state.isWorkflowComplete) {
    return;
  }
  const nextIndex = state.currentStageIndex + 1;
  if (nextIndex >= stages.length) {
    return;
  }
  startStage(nextIndex);
}

export function resetDemo() {
  clearTimers();
  resetCoreState();
  createRuntimeState();
  setContextReadOnly(false);
  dom.body.classList.remove("workflow-complete", "stage-burst");
  dom.appShell.classList.remove("injecting", "context-sent", "final-report-active");
  dom.reportStream.innerHTML = `<div class="report-placeholder" id="reportPlaceholder">最终报告尚未开始生成。<br>当流程推进到 Final Report 阶段时，这里会以打字机方式流式生成 Board-Ready 输出。</div>`;
  dom.reportPlaceholder = document.getElementById("reportPlaceholder");
  dom.reportFinalBadge.classList.remove("visible");
  renderWorkflow();
  renderStageFocus();
  renderTasks();
  renderAgents();
  renderKnowledge();
  renderReport();
  updateStaticLabels();
  updateButtons();
  updateMetrics();
  startMetricLoop();
}

export function startFinalReportStreaming() {
  dom.reportPlaceholder = document.getElementById("reportPlaceholder");
  if (dom.reportPlaceholder) {
    dom.reportPlaceholder.style.display = "none";
  }
  dom.reportStream.innerHTML = "";
  let sectionIndex = 0;

  const streamNextSection = () => {
    if (sectionIndex >= finalReportSections.length) {
      completeStage();
      dom.reportFinalBadge.classList.add("visible");
      updateStaticLabels();
      return;
    }

    const section = finalReportSections[sectionIndex];
    const sectionEl = document.createElement("div");
    sectionEl.className = "report-section active";
    sectionEl.innerHTML = `
      <div class="report-title">
        <strong>${section.title}</strong>
        <span>Streaming</span>
      </div>
      <div class="report-content typing"></div>
    `;
    dom.reportStream.appendChild(sectionEl);
    dom.reportStream.scrollTop = dom.reportStream.scrollHeight;

    const contentEl = sectionEl.querySelector(".report-content");
    const chars = Array.from(section.content);
    let charIndex = 0;
    setActiveAgents(["writing", "synthesizer", "review"], `正在生成 ${section.title}`, {
      pushLog: true,
      logTitle: section.title,
      logText: `开始流式生成 ${section.title} 内容。`
    });
    updateStaticLabels();
    renderAgents();

    const type = () => {
      if (charIndex < chars.length) {
        contentEl.textContent += chars[charIndex];
        charIndex += 1;
        state.tokenCount += 4;
        state.confidence = Math.min(99.8, state.confidence + 0.01);
        updateMetrics();
        dom.reportStream.scrollTop = dom.reportStream.scrollHeight;
        const timeoutId = setTimeout(type, scaledDelay(18 + Math.random() * 22));
        state.timers.push(timeoutId);
        return;
      }

      contentEl.classList.remove("typing");
      sectionEl.classList.remove("active");
      sectionEl.classList.add("completed");
      sectionEl.querySelector(".report-title span").textContent = "Completed";
      markLatestAgentLogCompleted(`${section.title} 已生成完成。`);
      sectionIndex += 1;
      const timeoutId = setTimeout(streamNextSection, scaledDelay(180));
      state.timers.push(timeoutId);
    };

    type();
  };

  streamNextSection();
}

export function setActiveAgents(agentIds, actionText = "等待下一步指令。", options = {}) {
  state.activeAgents = Array.from(new Set(agentIds));
  state.activeActionText = actionText;
  if (options.pushLog) {
    pushAgentActionLog({
      title: options.logTitle || "Agent Action",
      text: options.logText || actionText,
      agentIds
    });
  }
  renderAgents();
  updateMetrics();
}

export function resetAgentActionLog() {
  state.agentActionLog = [];
  state.agentLogSequence = 0;
}

export function pushAgentActionLog({ title, text, agentIds }) {
  state.agentLogSequence += 1;
  state.agentActionLog.push({
    id: state.agentLogSequence,
    title,
    text,
    agentIds: [...agentIds],
    agentsLabel: formatAgentNames(agentIds),
    status: "running"
  });
}

export function markLatestAgentLogCompleted(text) {
  if (!state.agentActionLog.length) {
    return;
  }
  const lastEntry = state.agentActionLog[state.agentActionLog.length - 1];
  lastEntry.status = "completed";
  if (text) {
    lastEntry.text = text;
  }
  renderAgents();
}

export function addKnowledgeHit(hit) {
  state.knowledgeHits.push(hit);
  if (hit.title) {
    state.taggedKnowledge.add(hit.title);
  }
}

export function getStageNode(index) {
  return dom.stageTrack.querySelector(`.stage-node[data-index="${index}"]`);
}

export function setContextReadOnly(readOnly) {
  [
    dom.companyName,
    dom.industry,
    dom.companySize,
    dom.annualRevenue,
    dom.currentChallenges,
    dom.consultingGoal
  ].forEach((field) => {
    field.readOnly = readOnly;
  });
}
