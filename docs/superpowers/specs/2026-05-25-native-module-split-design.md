# Native Module Split Design

**日期：** 2026-05-25  
**目标：** 在不引入构建工具、不切换框架、不改变现有页面行为的前提下，将当前单文件 `index.html` 拆分为原生 `HTML + CSS + JS` 多文件模块结构，降低维护成本并保持可直接打开运行。

## 1. 当前问题

当前项目只有一个入口文件 `index.html`，其中同时包含：

- 页面 DOM 结构
- 全量样式定义
- 静态演示数据
- 运行时状态变量
- DOM 缓存逻辑
- UI 渲染函数
- 工作流调度函数
- 动画与粒子特效
- 事件绑定与初始化入口

这导致以下问题：

- 任意改动都需要在一个大文件中来回跳转，定位成本高
- 状态管理、流程推进、UI 渲染耦合严重，后续改动容易引入回归
- 粒子背景、连线绘制、报告打字机流式输出等特效逻辑难以独立维护
- 后续增加 stage、agent、metrics 或 knowledge 数据时，文件只会继续膨胀

## 2. 本次拆分范围

本次只做最小风险的模块化拆分，不做架构迁移。

明确包含：

- 将内联 `style` 拆到独立 CSS 文件
- 将内联 `script` 拆为多个原生 ES Module 文件
- 收口全局变量，改为模块内共享状态对象
- 保持现有页面结构、交互流程、文案、样式表现基本不变
- 保持 `index.html` 仍然可以作为直接打开的入口

明确不包含：

- 不引入 `Vite`、`Vue`、`TypeScript`
- 不改成组件化框架架构
- 不改 UI 视觉风格
- 不重写业务流程
- 不新增复杂抽象层

## 3. 目标目录结构

项目拆分后的目标结构如下：

```text
presentation/
├── index.html
├── styles/
│   └── main.css
└── scripts/
    ├── app.js
    ├── data.js
    ├── state.js
    ├── dom.js
    ├── render.js
    ├── effects.js
    └── workflow.js
```

如果实现中发现某个文件职责仍然过大，可以只在必要时增加一个辅助模块，但默认以上结构优先。

## 4. 模块职责设计

### 4.1 `index.html`

职责：

- 保留页面骨架 DOM
- 删除内联 `style`
- 删除内联大段 `script`
- 通过 `<link rel="stylesheet">` 引入 `styles/main.css`
- 通过 `<script type="module" src="./scripts/app.js"></script>` 作为唯一脚本入口

约束：

- 不改现有主要 DOM id/class 命名，避免渲染逻辑和样式选择器失效

### 4.2 `styles/main.css`

职责：

- 原样承接当前 `index.html` 内所有 CSS
- 保持现有变量、动效、布局、主题色和响应式缩放逻辑配套样式

约束：

- 不做视觉重构
- 不修改选择器命名，除非实现拆分时存在明显冲突

### 4.3 `scripts/data.js`

职责：

- 承载纯静态配置数据：
  - `stages`
  - `stageTasks`
  - `agents`
  - `agentConnections`
  - `knowledgeSources`
  - `knowledgeTags`
  - `metrics`
  - `finalReportSections`

约束：

- 只放静态数据，不写 DOM 和状态逻辑

### 4.4 `scripts/state.js`

职责：

- 管理运行时共享状态
- 提供初始化/重置状态方法
- 管理 `timers`、`metricsIntervalId`、`particleAnimationId` 等运行时句柄

建议状态字段：

- `hasContext`
- `currentStageIndex`
- `currentTaskIndex`
- `isStageRunning`
- `isWorkflowComplete`
- `tokenCount`
- `confidence`
- `activeAgents`
- `knowledgeFragments`
- `sessionStartedAt`
- `workflowStates`
- `runtimeTasks`
- `knowledgeHits`
- `activeActionText`
- `taggedKnowledge`
- `agentActionLog`
- `agentLogSequence`
- 各类 timer / animation 句柄

约束：

- 以单一共享 `state` 对象为核心，避免重新散落回多个文件级变量

### 4.5 `scripts/dom.js`

职责：

- 缓存页面元素引用
- 提供 `cacheDom()` 及需要复用的 DOM 获取能力

约束：

- 只做 DOM 引用管理，不掺杂流程逻辑

### 4.6 `scripts/render.js`

职责：

- 集中所有基于当前状态的 UI 渲染函数
- 包括 metrics、workflow、stage focus、tasks、agents、knowledge、report、static labels、buttons 等更新逻辑

典型函数：

- `renderMetrics()`
- `renderWorkflow()`
- `renderStageFocus()`
- `renderTasks()`
- `renderAgents()`
- `renderKnowledge()`
- `renderReport()`
- `updateStaticLabels()`
- `updateButtons()`

约束：

- 以“读 state、写 DOM”为原则
- 不直接负责阶段推进调度

### 4.7 `scripts/effects.js`

职责：

- 处理纯视觉效果与布局计算
- 包括：
  - 粒子背景动画
  - workflow 连线绘制
  - agent 连线绘制
  - transfer burst 动效
  - stage burst 动效
  - fullscreen
  - resize / layout scale

约束：

- 视觉副作用集中管理，避免散落在 workflow 和 render 中

### 4.8 `scripts/workflow.js`

职责：

- 管理演示流程推进
- 负责 enterprise context 注入、stage 启动、task 顺序执行、stage 完成、next stage 推进、最终 report streaming

典型函数：

- `sendEnterpriseContext()`
- `startStage()`
- `runStageTask()`
- `completeStage()`
- `goNextStage()`
- `resetDemo()`
- `startFinalReportStreaming()`

约束：

- 负责“状态流转”和“调用渲染”
- 可以调用 effects 中的视觉反馈函数
- 不重复定义静态数据

### 4.9 `scripts/app.js`

职责：

- 作为统一入口
- 初始化 state、DOM、初始渲染
- 绑定按钮事件
- 启动 metric loop、particle background、resize listener

典型职责：

- `initDemo()`
- `bindEvents()`
- `DOMContentLoaded` 监听

约束：

- 只做装配层，不承载大段业务逻辑

## 5. 模块依赖关系

模块依赖遵循以下方向：

```text
data.js
  ├─> state.js
  ├─> render.js
  └─> workflow.js

dom.js
  ├─> render.js
  ├─> effects.js
  ├─> workflow.js
  └─> app.js

state.js
  ├─> render.js
  ├─> effects.js
  ├─> workflow.js
  └─> app.js

effects.js
  ├─> workflow.js
  └─> app.js

render.js
  ├─> workflow.js
  └─> app.js

workflow.js
  └─> app.js
```

边界原则：

- `app.js` 只做装配
- `workflow.js` 负责流程推进
- `render.js` 负责 UI 输出
- `effects.js` 负责视觉副作用
- `state.js` 负责共享运行状态

## 6. 兼容性策略

为了保证最小改动，本次实现采用以下兼容策略：

- 保持原有 DOM id/class 不变
- 保持 CSS 内容基本原样迁移
- 保持函数命名尽量贴近原实现，降低迁移时出错概率
- 保持页面初始化顺序一致
- 保持计时器与动画行为一致
- 保持按钮行为和阶段推进节奏一致

这样可以避免“模块化拆分”演变成“行为重写”。

## 7. 风险点与控制方式

### 风险 1：模块拆分后函数相互依赖导致循环引用

控制方式：

- 共享状态与共享 DOM 分别收口到 `state.js` 和 `dom.js`
- 公共格式化/查询函数优先归入 `render.js` 或 `workflow.js` 的最小必要范围
- 如果出现强循环依赖，只增加最小公共辅助函数，不做大规模重构

### 风险 2：拆分后初始化顺序变化导致页面空白或按钮失效

控制方式：

- 保留单一 `app.js` 入口
- 在 `DOMContentLoaded` 后统一执行 `cacheDom()`、初始渲染、事件绑定、动画启动

### 风险 3：定时器与动画句柄分散，reset 后残留副作用

控制方式：

- 所有 timeout / interval / animationFrame 句柄统一纳入共享 state 管理
- `resetDemo()` 统一清理

### 风险 4：直接打开 `file://` 场景下模块加载失败

控制方式：

- 默认按照标准 ES Module 路径写法实现
- 如本地浏览器对 `file://` 模块限制较严，提供本地静态服务器运行方式作为验证方案

## 8. 验收标准

拆分完成后应满足：

- 页面能正常打开并显示完整 UI
- `Send Enterprise Context` 按钮可正常触发
- `Next Stage` 能按顺序推进
- `Reset Demo` 能恢复初始状态
- `Fullscreen` 可正常调用
- workflow 连线、agent 连线、粒子背景、burst 动效正常
- knowledge retrieval 与 final report streaming 表现不回退
- 代码结构从单文件改为多文件模块，且各文件职责清晰

## 9. 实施策略

实施采用“迁移而非重写”原则：

1. 先复制 CSS 到独立文件并接入
2. 再提取静态数据到 `data.js`
3. 再提取 state / dom
4. 再搬运 render / effects / workflow 函数
5. 最后用 `app.js` 装配初始化
6. 完成后做一次完整联调，确认行为一致

## 10. 结论

本次最适合的方案是：

- 保持原生 `HTML + CSS + JS`
- 引入原生 ES Module
- 通过多文件拆分降低单文件耦合
- 保持现有页面功能和视觉表现基本不变

这是一种最低风险、最符合当前项目体量的模块化拆分方式，也为后续继续迁移到更完整的工程化结构预留了空间。
