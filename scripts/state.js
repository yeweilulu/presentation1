import { stageTasks, stages } from "./data.js";

export const state = {
  hasContext: false,
  currentStageIndex: -1,
  currentTaskIndex: -1,
  isStageRunning: false,
  isWorkflowComplete: false,
  tokenCount: 0,
  confidence: 93.2,
  activeAgents: [],
  knowledgeFragments: 0,
  timers: [],
  metricsIntervalId: null,
  particleAnimationId: null,
  sessionStartedAt: Date.now(),
  workflowStates: [],
  runtimeTasks: [],
  knowledgeHits: [],
  activeActionText: "等待上下文输入，所有 Agent 保持待命。",
  taggedKnowledge: new Set(),
  agentActionLog: [],
  agentLogSequence: 0
};

export function createRuntimeState() {
  state.workflowStates = stages.map(() => "pending");
  state.runtimeTasks = stageTasks.map((group) => group.map((task) => ({
    ...task,
    status: "pending"
  })));
  state.knowledgeHits = [];
  state.taggedKnowledge = new Set();
  state.activeAgents = [];
  state.activeActionText = "等待上下文输入，所有 Agent 保持待命。";
  state.agentActionLog = [];
  state.agentLogSequence = 0;
}

export function resetCoreState() {
  state.hasContext = false;
  state.currentStageIndex = -1;
  state.currentTaskIndex = -1;
  state.isStageRunning = false;
  state.isWorkflowComplete = false;
  state.tokenCount = 0;
  state.confidence = 93.2;
  state.activeAgents = [];
  state.knowledgeFragments = 0;
  state.sessionStartedAt = Date.now();
  state.activeActionText = "等待上下文输入，所有 Agent 保持待命。";
  state.taggedKnowledge = new Set();
  state.agentActionLog = [];
  state.agentLogSequence = 0;
}

export function clearTimers() {
  state.timers.forEach((timerId) => clearTimeout(timerId));
  state.timers = [];
  if (state.metricsIntervalId) {
    clearInterval(state.metricsIntervalId);
    state.metricsIntervalId = null;
  }
}
