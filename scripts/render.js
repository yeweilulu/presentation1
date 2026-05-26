import { agents, knowledgeSources, knowledgeTags, metrics, stages } from "./data.js";
import { dom } from "./dom.js";
import { drawAgentConnections, drawWorkflowConnections, updateMetrics } from "./effects.js";
import { state } from "./state.js";

const knowledgeRenderCache = {
  overview: "",
  tags: "",
  log: ""
};

export function stickScrollToBottom(element) {
  if (!element) return;
  const syncToBottom = () => {
    element.scrollTop = element.scrollHeight;
  };
  syncToBottom();
  requestAnimationFrame(() => {
    syncToBottom();
    requestAnimationFrame(syncToBottom);
  });
}

export function renderMetrics() {
  dom.metricsGrid.innerHTML = metrics.map((metric) => `
    <div class="metric-card">
      <div class="metric-label">${metric.label}</div>
      <div class="metric-value" id="metric-${metric.id}">--</div>
      <div class="metric-sub">${metric.sub}</div>
    </div>
  `).join("");
  updateMetrics();
}

export function renderWorkflow() {
  dom.stageTrack.innerHTML = stages.map((stage, index) => {
    const workflowState = state.workflowStates[index];
    const classes = ["stage-node", "unlocked"];
    if (!state.hasContext && index > 0) {
      classes.length = 1;
    }
    if (workflowState === "active") classes.push("active");
    if (workflowState === "completed") classes.push("completed");
    if (state.hasContext || index === 0) classes.push("unlocked");
    return `
      <div class="${classes.join(" ")}" data-index="${index}">
        <div>
          <div class="stage-number">${stage.code}</div>
          <div class="stage-name">
            ${stage.title}
            <small>${stage.shortTitle}</small>
          </div>
        </div>
        <div class="stage-status">${getStageStateLabel(index)}</div>
      </div>
    `;
  }).join("");
  requestAnimationFrame(drawWorkflowConnections);
}

export function renderStageFocus() {
  // if (state.currentStageIndex < 0) {
  //   dom.stageFocusTitle.innerHTML = `等待 <span>Enterprise Context</span> 注入`;
  //   dom.stageFocusDesc.textContent = "发送企业上下文后，系统将自动创建咨询语境并推进到第一个分析阶段。";
  //   dom.stageFocusChips.innerHTML = [
  //     "Company Name",
  //     "Industry",
  //     "Current Challenges",
  //     "Consulting Goal"
  //   ].map((item) => `<div class="chip">${item}</div>`).join("");
  //   dom.stageProgressValue.textContent = state.hasContext ? "14%" : "0%";
  //   return;
  // }

  // const stage = stages[state.currentStageIndex];
  // dom.stageFocusTitle.innerHTML = `${stage.code} <span>${stage.title}</span>`;
  // dom.stageFocusDesc.textContent = stage.desc;
  // dom.stageFocusChips.innerHTML = stage.highlights.map((item) => `<div class="chip">${item}</div>`).join("");
  // dom.stageProgressValue.textContent = `${calculateStageProgress()}%`;
}

export function renderTasks() {
  if (!dom.taskList) {
    return;
  }
  const stageIndex = state.currentStageIndex >= 0 ? state.currentStageIndex : 0;
  const tasks = state.runtimeTasks[stageIndex] || [];
  dom.taskList.innerHTML = tasks.map((task) => `
    <div class="task-item ${task.status}">
      <div class="task-top">
        <div>
          <div class="task-name">${task.label}</div>
          <div class="task-agent">${formatAgentNames(task.agentIds)}</div>
        </div>
        <div class="task-state">${formatTaskStatus(task.status)}</div>
      </div>
      <div class="task-desc">${task.detail}</div>
      <div class="task-result">${task.status === "completed" ? task.result : task.status === "running" ? "正在处理中..." : "等待执行"}</div>
      <div class="task-progress"><span></span></div>
    </div>
  `).join("");
  dom.taskList.scrollTop = dom.taskList.scrollHeight;
  requestAnimationFrame(() => {
    dom.taskList.scrollTop = dom.taskList.scrollHeight;
  });
}

export function renderAgents() {
  dom.agentMap.querySelectorAll(".agent-node").forEach((node) => node.remove());
  agents.forEach((agent) => {
    const node = document.createElement("div");
    node.className = `agent-node${state.activeAgents.includes(agent.id) ? " active" : ""}`;
    node.dataset.agentId = agent.id;
    node.style.left = `${agent.x}%`;
    node.style.top = `${agent.y}%`;
    node.innerHTML = `
      <div class="agent-name">${agent.name}</div>
      <div class="agent-role">${agent.role}</div>
    `;
    dom.agentMap.appendChild(node);
  });
  const stageLabel = state.currentStageIndex >= 0 ? `${stages[state.currentStageIndex].code} ${stages[state.currentStageIndex].shortTitle}` : "等待上下文注入";
  dom.agentAction.innerHTML = `
    <div class="agent-action-head">
      <strong>Current Agent Action</strong>
      <div class="agent-action-stage">${state.activeActionText}</div>
    </div>
    <div class="agent-action-log" id="agentActionLog"></div>
  `;
  const logEl = dom.agentAction.querySelector("#agentActionLog");
  if (state.agentActionLog.length) {
    logEl.innerHTML = state.agentActionLog.map((entry) => `
      <div class="agent-log-item ${entry.status}">
        <div class="agent-log-top">
          <div class="agent-log-title">${entry.title}</div>
          <div class="agent-log-state">${entry.status === "completed" ? "completed" : "running"}</div>
        </div>
        <div class="agent-log-agents">${entry.agentsLabel}</div>
        <div class="agent-log-text">${entry.text}</div>
      </div>
    `).join("");
    stickScrollToBottom(logEl);
  } else {
    logEl.innerHTML = `<div class="agent-log-empty">${stageLabel}<br>当前阶段日志将在任务开始后逐条推入。</div>`;
  }
  // dom.agentCountTag.textContent = `${state.activeAgents.length} ACTIVE`;
  requestAnimationFrame(drawAgentConnections);
}

export function renderKnowledge() {
  if (!dom.knowledgePanel || !dom.knowledgeOverview || !dom.knowledgeTags || !dom.knowledgeLog) {
    return;
  }

  const retrievalActive = state.currentStageIndex === 3 && state.isStageRunning;
  const activeSourceCount = knowledgeSources.filter((source) => isSourceActive(source.id)).length;
  const feedStateLabel = retrievalActive
    ? `${state.knowledgeHits.length || 0} LIVE HITS`
    : state.knowledgeHits.length
      ? `${state.knowledgeHits.length} CACHED`
      : "FEED IDLE";

  dom.knowledgePanel.classList.toggle("active-panel", retrievalActive);

  const overviewMarkup = `
    <div class="knowledge-side-shell">
      <div class="knowledge-side-head">
        <div>
          <strong>Source Status</strong>
          <span>当前检索源在线状态与命中准备度</span>
        </div>
        <div class="knowledge-side-metric">${activeSourceCount}/${knowledgeSources.length}</div>
      </div>
      <div class="knowledge-source-grid">
        ${knowledgeSources.map((source) => `
          <div class="source-card ${isSourceActive(source.id) ? "active" : ""}">
            <div class="source-card-top">
              <div class="source-card-main">
                <strong>${source.name}</strong>
                <span class="source-card-copy">${source.subtitle}</span>
              </div>
              <span class="source-state">${getKnowledgeSourceState(source.id, retrievalActive)}</span>
            </div>
          </div>
        `).join("")}
      </div>
    </div>
  `;

  const tagsMarkup = `
    <div class="knowledge-side-shell knowledge-tags-shell">
      <div class="knowledge-side-head">
        <div>
          <strong>Active Tags</strong>
          <span>当前阶段命中主题与案例标签</span>
        </div>
      </div>
      <div class="knowledge-tag-list">
        ${knowledgeTags.map((tag) => `
          <div class="chip ${state.taggedKnowledge.has(tag) || retrievalActive ? "active" : ""}">${tag}</div>
        `).join("")}
      </div>
    </div>
  `;

  const logMarkup = `
    <div class="knowledge-feed-shell ${retrievalActive ? "live" : ""}">
      <div class="knowledge-feed-head">
        <div>
          <strong>Live Retrieval Feed</strong>
          <span>Knowledge Retrieval 阶段会在这里实时滚动命中条目与案例摘要</span>
        </div>
        <div class="knowledge-feed-badge">${feedStateLabel}</div>
      </div>
      <div class="knowledge-feed-list">
        ${state.knowledgeHits.length
          ? state.knowledgeHits.map((hit, index) => `
              <div class="log-item">
                <div class="log-top">
                  <div class="log-title">${hit.title}</div>
                  <div class="log-seq">HIT ${String(index + 1).padStart(2, "0")}</div>
                </div>
                <div class="log-meta">${hit.meta}</div>
              </div>
            `).join("")
          : `<div class="knowledge-feed-empty">
              <div class="knowledge-feed-empty-title">Knowledge feed idle</div>
              <div class="knowledge-feed-empty-copy">进入 Knowledge Retrieval 阶段后，这里会滚动显示命中条目、benchmark 匹配与治理参考摘要。</div>
            </div>`
        }
      </div>
    </div>
  `;

  if (knowledgeRenderCache.overview !== overviewMarkup) {
    dom.knowledgeOverview.innerHTML = overviewMarkup;
    knowledgeRenderCache.overview = overviewMarkup;
  }

  if (knowledgeRenderCache.tags !== tagsMarkup) {
    dom.knowledgeTags.innerHTML = tagsMarkup;
    knowledgeRenderCache.tags = tagsMarkup;
  }

  const prevFeedList = dom.knowledgeLog.querySelector(".knowledge-feed-list");
  const wasNearBottom = prevFeedList
    ? prevFeedList.scrollHeight - prevFeedList.scrollTop - prevFeedList.clientHeight < 32
    : true;

  if (knowledgeRenderCache.log !== logMarkup) {
    dom.knowledgeLog.innerHTML = logMarkup;
    knowledgeRenderCache.log = logMarkup;
  }

  const nextFeedList = dom.knowledgeLog.querySelector(".knowledge-feed-list");
  if (nextFeedList && (wasNearBottom || retrievalActive)) {
    nextFeedList.scrollTop = nextFeedList.scrollHeight;
    requestAnimationFrame(() => {
      nextFeedList.scrollTop = nextFeedList.scrollHeight;
    });
  }
}

export function renderReport() {
  if (!dom.reportStream) return;
  const hasContent = dom.reportStream.querySelector(".report-section");
  const scrollContainer = dom.reportStream.parentElement;
  if (!hasContent && !state.isWorkflowComplete && state.currentStageIndex < 5) {
    dom.reportPlaceholder.style.display = "grid";
  }
  if (hasContent && scrollContainer) {
    stickScrollToBottom(scrollContainer);
  }
  dom.reportFinalBadge.classList.toggle("visible", state.isWorkflowComplete);
}

export function updateStaticLabels() {
  dom.currentStageLabel.textContent = getCurrentStageName();
  dom.contextStatusTag.textContent = state.hasContext ? "INJECTED" : "WAITING";

  dom.contextStatusCard.classList.toggle("visible", state.hasContext);
  dom.contextStatusText.textContent = state.hasContext
    ? `${dom.companyName.value} / ${dom.industry.value} / 目标已注入工作流`
    : "上下文待发送";
  dom.workflowStateTag.textContent = state.isWorkflowComplete ? "WORKFLOW COMPLETE" : state.isStageRunning ? "STAGE RUNNING" : state.hasContext ? "READY FOR NEXT STAGE" : "PIPELINE STANDBY";
  if (dom.stageRunTag) {
    dom.stageRunTag.textContent = state.isStageRunning ? "RUNNING" : state.hasContext ? "STAGE READY" : "IDLE";
  }
  if (dom.knowledgeStateTag) {
    dom.knowledgeStateTag.textContent = state.currentStageIndex === 3
      ? (state.isStageRunning ? "RETRIEVAL ACTIVE" : "RETRIEVAL COMPLETE")
      : state.knowledgeFragments > 0 ? "RETRIEVAL CACHED" : "RETRIEVAL IDLE";
  }
  dom.reportStateTag.textContent = state.isWorkflowComplete ? "REPORT COMPLETED" : state.currentStageIndex === 5 ? (state.isStageRunning ? "REPORT STREAMING" : "FINALIZED") : "AWAITING FINAL STAGE";
}

export function getCurrentStageName() {
  if (state.isWorkflowComplete) {
    return "Final Report / 已完成";
  }
  if (state.currentStageIndex < 0) {
    return "等待上下文注入";
  }
  const stage = stages[state.currentStageIndex];
  return `${stage.code} ${stage.title}`;
}

export function calculateStageProgress() {
  if (state.currentStageIndex < 0) {
    return 0;
  }
  const completedStages = state.workflowStates.filter((workflowState) => workflowState === "completed").length;
  const currentTasks = state.runtimeTasks[state.currentStageIndex] || [];
  const completedTasks = currentTasks.filter((task) => task.status === "completed").length;
  const stagePart = currentTasks.length ? completedTasks / currentTasks.length : 0;
  const percentage = ((completedStages + stagePart) / stages.length) * 100;
  return Math.min(100, Math.round(percentage));
}

export function getStageStateLabel(index) {
  if (!state.hasContext) {
    return index === 0 ? "standby" : "locked";
  }
  const workflowState = state.workflowStates[index];
  if (workflowState === "active") return "running";
  if (workflowState === "completed") return "completed";
  if (index > state.currentStageIndex + 1) return "queued";
  return "ready";
}

export function formatTaskStatus(status) {
  if (status === "running") return "running";
  if (status === "completed") return "completed";
  return "pending";
}

export function formatAgentNames(agentIds) {
  return agentIds.map((id) => {
    const agent = agents.find((item) => item.id === id);
    return agent ? agent.name : id;
  }).join(" / ");
}

export function isSourceActive(sourceId) {
  if (state.currentStageIndex === 3 && state.isStageRunning) {
    return true;
  }
  if (sourceId === "roi" && state.currentStageIndex >= 2) return true;
  if (sourceId === "governance" && state.currentStageIndex >= 3) return true;
  return state.knowledgeFragments > 0 && ["kb", "benchmarks", "cases"].includes(sourceId);
}

export function getKnowledgeSourceState(sourceId, retrievalActive) {
  if (retrievalActive) {
    if (sourceId === "benchmarks") return "syncing";
    if (sourceId === "cases") return "matching";
    return "live";
  }
  if (sourceId === "roi" && state.currentStageIndex >= 2) return "primed";
  if (sourceId === "governance" && state.currentStageIndex >= 3) return "ready";
  if (state.knowledgeFragments > 0 && ["kb", "benchmarks", "cases"].includes(sourceId)) return "cached";
  return "idle";
}

export function updateButtons() {
  dom.sendContextBtn.disabled = state.hasContext || state.isStageRunning;
  dom.nextStageBtn.disabled = !state.hasContext || state.isStageRunning || state.isWorkflowComplete || state.currentStageIndex >= stages.length - 1 && state.workflowStates[stages.length - 1] === "completed";
  dom.nextStageBtn.textContent = state.isWorkflowComplete ? "Workflow Complete" : "Next Stage";
}
