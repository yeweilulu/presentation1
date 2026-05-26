# Native Module Split Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 将当前单文件 `index.html` 拆分为原生 `HTML + CSS + JS` 多文件模块，保持页面行为不变。

**Architecture:** 保留现有 DOM 结构与视觉表现，将样式迁移到 `styles/main.css`，将静态数据、运行时状态、DOM 缓存、渲染逻辑、视觉特效、工作流调度分别迁移到 `scripts/` 下的 ES Module 文件，再由 `scripts/app.js` 统一装配初始化。实现以“迁移而非重写”为原则，最大限度保留原有函数与调用顺序。

**Tech Stack:** 原生 HTML、CSS、JavaScript、ES Module

---

### Task 1: 拆出独立样式文件

**Files:**
- Create: `styles/main.css`
- Modify: `index.html`

- [ ] **Step 1: 从 `index.html` 提取完整内联 CSS 到 `styles/main.css`**

```css
/* 将原 <style> ... </style> 内全部样式原样迁移 */
```

- [ ] **Step 2: 在 `index.html` 头部改为外链样式**

```html
<link rel="stylesheet" href="./styles/main.css">
```

- [ ] **Step 3: 验证页面基础样式未丢失**

Run: `python3 -m http.server 4173`
Expected: 浏览器访问 `http://127.0.0.1:4173` 后页面布局、背景、面板、按钮样式与拆分前保持一致

### Task 2: 提取静态数据与共享状态

**Files:**
- Create: `scripts/data.js`
- Create: `scripts/state.js`
- Modify: `index.html`

- [ ] **Step 1: 创建 `scripts/data.js` 并迁移静态常量**

```js
export const stages = [...];
export const stageTasks = [...];
export const agents = [...];
export const agentConnections = [...];
export const knowledgeSources = [...];
export const knowledgeTags = [...];
export const metrics = [...];
export const finalReportSections = [...];
```

- [ ] **Step 2: 创建 `scripts/state.js` 并集中运行时状态**

```js
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
```

- [ ] **Step 3: 提供初始化与清理辅助函数**

```js
export function createRuntimeState() {
  // 基于 stageTasks 生成 workflowStates 和 runtimeTasks
}

export function clearTimers() {
  // 清理 timeout / interval / animationFrame
}
```

- [ ] **Step 4: 验证数据与状态模块可被单独导入**

Run: `node --input-type=module -e "import('./scripts/data.js').then(m=>console.log(m.stages.length)); import('./scripts/state.js').then(m=>console.log(typeof m.state.hasContext))"`
Expected: 输出 stage 数量与 `boolean`

### Task 3: 提取 DOM 缓存与渲染逻辑

**Files:**
- Create: `scripts/dom.js`
- Create: `scripts/render.js`

- [ ] **Step 1: 创建 `scripts/dom.js` 并集中 DOM 引用缓存**

```js
export const dom = {};

export function cacheDom() {
  dom.body = document.body;
  dom.appShell = document.getElementById("appShell");
  // ...其余现有 DOM 节点缓存
}
```

- [ ] **Step 2: 创建 `scripts/render.js` 并迁移所有 UI 渲染函数**

```js
export function renderMetrics() {}
export function renderWorkflow() {}
export function renderStageFocus() {}
export function renderTasks() {}
export function renderAgents() {}
export function renderKnowledge() {}
export function renderReport() {}
export function updateStaticLabels() {}
export function updateButtons() {}
```

- [ ] **Step 3: 保留原函数逻辑，仅改为从 `state`、`dom`、`data` 读取依赖**

```js
import { dom } from "./dom.js";
import { state } from "./state.js";
import { stages, metrics } from "./data.js";
```

- [ ] **Step 4: 验证初始渲染无报错**

Run: `node --check scripts/render.js`
Expected: 无语法错误输出

### Task 4: 提取视觉特效与流程调度

**Files:**
- Create: `scripts/effects.js`
- Create: `scripts/workflow.js`

- [ ] **Step 1: 创建 `scripts/effects.js` 并迁移视觉副作用函数**

```js
export function startParticleBackground() {}
export function handleResize() {}
export function updateLayoutScale() {}
export function drawWorkflowConnections() {}
export function drawAgentConnections() {}
export function launchTransferBurst() {}
export function triggerStageBurst() {}
export function requestFullscreen() {}
```

- [ ] **Step 2: 创建 `scripts/workflow.js` 并迁移工作流推进函数**

```js
export function sendEnterpriseContext() {}
export function startStage() {}
export function runStageTask() {}
export function completeStage() {}
export function goNextStage() {}
export function resetDemo() {}
export function startFinalReportStreaming() {}
```

- [ ] **Step 3: 保持原有 timeout 顺序、状态更新顺序、渲染调用顺序**

```js
const timeoutId = setTimeout(() => runStageTask(0), 420);
state.timers.push(timeoutId);
```

- [ ] **Step 4: 验证模块语法与依赖关系**

Run: `node --check scripts/effects.js && node --check scripts/workflow.js`
Expected: 无语法错误输出

### Task 5: 装配入口并替换原内联脚本

**Files:**
- Create: `scripts/app.js`
- Modify: `index.html`

- [ ] **Step 1: 创建 `scripts/app.js` 作为唯一入口**

```js
import { cacheDom } from "./dom.js";
import { createRuntimeState } from "./state.js";
import { renderMetrics, renderWorkflow, renderStageFocus, renderTasks, renderAgents, renderKnowledge, renderReport, updateStaticLabels, updateButtons } from "./render.js";
import { sendEnterpriseContext, goNextStage, resetDemo } from "./workflow.js";
import { requestFullscreen, startParticleBackground, startMetricLoop, handleResize } from "./effects.js";

function bindEvents() {
  // 绑定现有四个按钮
}

function initDemo() {
  // 按原顺序完成初始化
}

document.addEventListener("DOMContentLoaded", initDemo);
```

- [ ] **Step 2: 在 `index.html` 中移除内联脚本并接入模块入口**

```html
<script type="module" src="./scripts/app.js"></script>
```

- [ ] **Step 3: 验证入口模块可正常加载**

Run: `node --check scripts/app.js`
Expected: 无语法错误输出

### Task 6: 联调与回归验证

**Files:**
- Modify: `index.html`
- Modify: `scripts/*.js`
- Modify: `styles/main.css`

- [ ] **Step 1: 启动本地静态服务进行浏览器联调**

Run: `python3 -m http.server 4173`
Expected: 本地服务启动成功，终端输出 `Serving HTTP on`

- [ ] **Step 2: 手动验证核心交互**

Run: `open http://127.0.0.1:4173`
Expected: 页面正常打开，以下行为通过：
- `发送 Enterprise Context` 可触发第一阶段
- `Next Stage` 可顺序推进
- `Reset Demo` 可完整复位
- `Fullscreen` 可正常调用
- 粒子背景、workflow 连线、agent 连线、knowledge 更新、report 打字机输出正常

- [ ] **Step 3: 修正联调中发现的初始化或模块依赖问题**

```js
// 仅做最小修正，不改变原有业务行为
```

- [ ] **Step 4: 最终检查目录结构**

Run: `find . -maxdepth 2 | sort`
Expected: 包含 `styles/main.css`、`scripts/app.js`、`scripts/data.js`、`scripts/state.js`、`scripts/dom.js`、`scripts/render.js`、`scripts/effects.js`、`scripts/workflow.js`
