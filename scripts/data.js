export const stages = [
      {
        id: "context-intake",
        code: "01",
        title: "Context Intake",
        shortTitle: "企业上下文吸收",
        desc: "吸收企业信息、解析行业与目标、建立咨询上下文。",
        highlights: ["行业与规模识别", "业务痛点抽取", "目标约束建模", "咨询上下文置信度"]
      },
      {
        id: "task-decomposition",
        code: "02",
        title: "Task Decomposition",
        shortTitle: "任务拆解与执行规划",
        desc: "Planner Agent 将咨询目标拆成分析轨道，并分配专业 Agent。",
        highlights: ["目标拆解", "分析轨道生成", "专长 Agent 分配", "报告结构初始化"]
      },
      {
        id: "agent-analysis",
        code: "03",
        title: "Agent Analysis",
        shortTitle: "多 Agent 业务分析",
        desc: "Strategy、Finance、Operations、Risk 等 Agent 并行产出关键判断。",
        highlights: ["业务转型优先级", "价值池估算", "生产与质量瓶颈", "治理与落地风险"]
      },
      {
        id: "knowledge-retrieval",
        code: "04",
        title: "Knowledge Retrieval",
        shortTitle: "知识检索与案例匹配",
        desc: "检索制造业 AI 知识、ROI benchmark、案例库与治理框架。",
        highlights: ["行业知识片段", "案例库匹配", "ROI benchmark", "治理合规参考"]
      },
      {
        id: "report-synthesis",
        code: "05",
        title: "Report Synthesis",
        shortTitle: "报告合成与审阅",
        desc: "Writing、Synthesizer、Review Agent 汇总分析结论并生成叙事结构。",
        highlights: ["执行摘要草拟", "机会地图组装", "90-Day 路线图", "逻辑与风险复核"]
      },
      {
        id: "final-report",
        code: "06",
        title: "Final Report",
        shortTitle: "最终报告输出",
        desc: "输出企业 AI 咨询报告，展示关键建议、价值、风险控制与路线图。",
        highlights: ["Executive Summary", "Strategic Initiatives", "Risk Controls", "BOARD-READY OUTPUT"]
      }
    ];
export const stageTasks = [
      [
        {
          label: "解析企业画像",
          detail: "读取 Company Name、Industry、Company Size、Annual Revenue，建立初始企业轮廓。",
          agentIds: ["planner"],
          result: "识别为 Advanced Manufacturing、860 employees、$128M 年收入规模。",
          tokenDelta: 220,
          confidenceDelta: 1.8
        },
        {
          label: "抽取业务痛点",
          detail: "从 Current Challenges 中识别数据系统、质检、管理报告与预测能力问题。",
          agentIds: ["planner", "operations"],
          result: "核心痛点锁定为数据割裂、人工质检、经营视图迟缓、预测精度不足。",
          tokenDelta: 320,
          confidenceDelta: 1.4
        },
        {
          label: "识别咨询目标",
          detail: "将 Consulting Goal 转译为业务目标、价值目标和交付结构。",
          agentIds: ["planner", "strategy"],
          result: "主目标提炼为成本下降、质量智能化、决策速度提升。",
          tokenDelta: 280,
          confidenceDelta: 1.2
        },
        {
          label: "建立咨询上下文",
          detail: "合并企业画像、痛点与目标，生成统一咨询上下文与置信度。",
          agentIds: ["planner"],
          result: "咨询上下文已建立，Context confidence 提升至 97.4%。",
          tokenDelta: 360,
          confidenceDelta: 2.0
        }
      ],
      [
        {
          label: "拆解咨询目标",
          detail: "将 AI 转型咨询目标拆为业务诊断、ROI、运营效率、风险治理等轨道。",
          agentIds: ["planner"],
          result: "已创建 6 条执行轨道，覆盖战略、财务、运营、治理与输出结构。",
          tokenDelta: 360,
          confidenceDelta: 1.0
        },
        {
          label: "生成分析轨道",
          detail: "定义每条轨道的输入、输出、依赖关系与阶段顺序。",
          agentIds: ["planner", "strategy"],
          result: "分析轨道已成型，优先聚焦质量智能与管理驾驶舱。",
          tokenDelta: 340,
          confidenceDelta: 0.8
        },
        {
          label: "分配专业 Agent",
          detail: "依据任务类型为 Strategy、Finance、Operations、Risk Agent 分配职责。",
          agentIds: ["planner", "strategy", "finance", "operations", "risk"],
          result: "4 个 specialist agents 已分配，协作边界与顺序已确认。",
          tokenDelta: 390,
          confidenceDelta: 0.9
        },
        {
          label: "初始化报告骨架",
          detail: "建立面向管理层的输出结构，准备 executive-ready 报告框架。",
          agentIds: ["planner", "writing"],
          result: "Report sections 已初始化，输出将聚焦路线图、风险与业务价值。",
          tokenDelta: 330,
          confidenceDelta: 0.7
        }
      ],
      [
        {
          label: "Strategy Agent 评估转型优先级",
          detail: "判断业务场景中最具杠杆效应的 AI 机会与执行顺序。",
          agentIds: ["strategy"],
          result: "最高杠杆机会为视觉质检智能化与高层经营驾驶舱。",
          tokenDelta: 420,
          confidenceDelta: 0.9
        },
        {
          label: "Finance Agent 估算价值池",
          detail: "基于成本、质量损失、报告效率与预测误差估算年度价值空间。",
          agentIds: ["finance"],
          result: "预计年度价值区间为 $8.6M - $18.4M。",
          tokenDelta: 460,
          confidenceDelta: 0.8
        },
        {
          label: "Operations Agent 映射生产瓶颈",
          detail: "分析数据孤岛、质检流程与执行节拍造成的运营拖拽点。",
          agentIds: ["operations"],
          result: "瓶颈集中在质检人工依赖、报表链路断裂与生产预测响应慢。",
          tokenDelta: 440,
          confidenceDelta: 0.8
        },
        {
          label: "Risk Agent 识别落地风险",
          detail: "识别数据质量、系统集成、模型治理与组织采纳风险。",
          agentIds: ["risk"],
          result: "主要风险聚焦数据质量、集成复杂度与治理机制不足。",
          tokenDelta: 380,
          confidenceDelta: 0.7
        }
      ],
      [
        {
          label: "检索制造业 AI 知识库",
          detail: "从 Knowledge Base 中拉取制造场景相关知识片段与模式模板。",
          agentIds: ["retrieval"],
          result: "已检索 38 个相关知识片段。",
          tokenDelta: 520,
          confidenceDelta: 0.6,
          knowledgeDelta: 38,
          hits: [
            { title: "Visual Quality Inspection", meta: "制造业视觉质检缺陷识别命中，适配高缺陷成本场景。" },
            { title: "Executive Cockpit", meta: "经营驾驶舱模板命中，适合管理层报表提速。" }
          ]
        },
        {
          label: "检索 Industry Benchmarks",
          detail: "对比制造业 AI 应用 benchmark 与成熟度区间。",
          agentIds: ["retrieval", "finance"],
          result: "已匹配 12 个 benchmark cases，质量与决策类收益最突出。",
          tokenDelta: 480,
          confidenceDelta: 0.5,
          knowledgeDelta: 12,
          hits: [
            { title: "Manufacturing ROI", meta: "ROI benchmark 表明质检自动化与预测优化具备最快回收期。" },
            { title: "Demand Forecasting", meta: "预测场景命中，可显著改善低 forecast accuracy 问题。" }
          ]
        },
        {
          label: "匹配相似转型案例",
          detail: "从 Case Studies 中匹配与收入规模、行业结构相近的案例。",
          agentIds: ["retrieval", "strategy", "operations"],
          result: "已命中 12 个相似转型案例，重点场景与当前企业高度重合。",
          tokenDelta: 500,
          confidenceDelta: 0.5,
          knowledgeDelta: 12,
          hits: [
            { title: "Quality Intelligence", meta: "同规模制造企业通过视觉质检降低返工与误判率。" },
            { title: "Executive Decision Speed", meta: "管理驾驶舱缩短周报到日报决策节奏。" }
          ]
        },
        {
          label: "加载治理与合规参考",
          detail: "从 Governance Frameworks 中加载模型治理、数据治理与风险控制参考。",
          agentIds: ["retrieval", "risk", "review"],
          result: "已加载 4 套治理框架，用于约束数据与模型风险。",
          tokenDelta: 430,
          confidenceDelta: 0.4,
          knowledgeDelta: 4,
          hits: [
            { title: "Data Governance", meta: "数据责任边界与质量标准已关联到实施建议。" },
            { title: "Model Risk Control", meta: "模型风险控制清单将进入最终报告 Risk Controls。" }
          ]
        }
      ],
      [
        {
          label: "草拟 Executive Summary",
          detail: "Writing Agent 将分析结论压缩为高层可快速理解的管理摘要。",
          agentIds: ["writing"],
          result: "Executive Summary 已生成初稿。",
          tokenDelta: 420,
          confidenceDelta: 0.4
        },
        {
          label: "组装机会地图",
          detail: "Synthesizer Agent 汇总战略、财务、运营与风险结论，形成机会地图。",
          agentIds: ["synthesizer", "strategy", "finance", "operations"],
          result: "机会地图已建立，优先级与价值池映射完成。",
          tokenDelta: 470,
          confidenceDelta: 0.4
        },
        {
          label: "生成 90-Day 路线图",
          detail: "根据优先级、依赖关系与治理要求生成 90-Day roadmap。",
          agentIds: ["synthesizer", "operations"],
          result: "90-Day roadmap 已生成，覆盖 pilot、integration、governance 三阶段。",
          tokenDelta: 390,
          confidenceDelta: 0.3
        },
        {
          label: "Review Agent 校验建议",
          detail: "检查逻辑连贯性、风险覆盖与叙事可呈现性。",
          agentIds: ["review", "risk"],
          result: "Recommendations 已通过 Review Agent 校验。",
          tokenDelta: 350,
          confidenceDelta: 0.3
        },
        {
          label: "准备 board-ready 叙事",
          detail: "输出适合发布会与董事会阅读的叙事逻辑与呈现节奏。",
          agentIds: ["writing", "review", "synthesizer"],
          result: "Executive-ready narrative 已准备完成。",
          tokenDelta: 360,
          confidenceDelta: 0.3
        }
      ],
      [
        {
          label: "封装最终报告",
          detail: "聚合各阶段结果，生成最终企业 AI 咨询报告结构。",
          agentIds: ["writing", "synthesizer"],
          result: "AI transformation report 已进入最终封装流程。",
          tokenDelta: 460,
          confidenceDelta: 0.2
        },
        {
          label: "渲染影响指标",
          detail: "将价值池、路线图与风险控制映射为管理层可读指标视图。",
          agentIds: ["finance", "writing"],
          result: "Business impact、风险控制与实施节奏已完成渲染。",
          tokenDelta: 390,
          confidenceDelta: 0.2
        },
        {
          label: "准备 presentation-ready 输出",
          detail: "整理为演示可读的流式报告摘要，并进入最终展示。",
          agentIds: ["writing", "review", "synthesizer"],
          result: "最终流式输出准备完成，即将生成 Board-Ready 报告。",
          tokenDelta: 420,
          confidenceDelta: 0.2
        }
      ]
    ];
export const agents = [
      { id: "planner", name: "Planner Agent", role: "规划与任务分解", x: 18, y: 20 },
      { id: "strategy", name: "Strategy Agent", role: "战略与优先级判断", x: 50, y: 14 },
      { id: "finance", name: "Finance Agent", role: "价值池与 ROI 估算", x: 81, y: 24 },
      { id: "operations", name: "Operations Agent", role: "生产与质量分析", x: 20, y: 52 },
      { id: "risk", name: "Risk Agent", role: "治理与落地风险", x: 82, y: 54 },
      { id: "retrieval", name: "Retrieval Agent", role: "知识检索与案例匹配", x: 50, y: 44 },
      { id: "writing", name: "Writing Agent", role: "报告写作与表达", x: 18, y: 82 },
      { id: "review", name: "Review Agent", role: "逻辑与风险复核", x: 50, y: 78 },
      { id: "synthesizer", name: "Synthesizer Agent", role: "结论汇总与叙事组装", x: 82, y: 84 }
    ];
export const agentConnections = [
      ["planner", "strategy"],
      ["planner", "operations"],
      ["planner", "retrieval"],
      ["strategy", "finance"],
      ["strategy", "retrieval"],
      ["operations", "retrieval"],
      ["retrieval", "risk"],
      ["retrieval", "review"],
      ["finance", "synthesizer"],
      ["operations", "synthesizer"],
      ["writing", "review"],
      ["review", "synthesizer"],
      ["writing", "synthesizer"]
    ];
export const knowledgeSources = [
      { id: "kb", name: "Knowledge Base", subtitle: "制造业场景模式、流程范式、诊断模板。" },
      { id: "benchmarks", name: "Industry Benchmarks", subtitle: "行业效率、质量、ROI benchmark 对比。" },
      { id: "cases", name: "Case Studies", subtitle: "同类企业 AI 转型案例与路径。" },
      { id: "governance", name: "Governance Frameworks", subtitle: "数据治理、模型治理与合规框架。" },
      { id: "roi", name: "ROI Models", subtitle: "价值池估算模型与落地回收期逻辑。" }
    ];
export const knowledgeTags = [
      "Visual Quality Inspection",
      "Demand Forecasting",
      "Executive Cockpit",
      "Data Governance",
      "Manufacturing ROI",
      "Model Risk Control",
      "Quality Intelligence",
      "Board Strategy",
      "Integration Blueprint",
      "Executive Reporting"
    ];
export const metrics = [
      { id: "timecode", label: "Timecode", sub: "演示计时" },
      { id: "tokens", label: "Tokens", sub: "模拟推理消耗" },
      { id: "agents", label: "Active Agents", sub: "当前活跃 Agent" },
      { id: "confidence", label: "Confidence", sub: "上下文与结论置信度" },
      { id: "fragments", label: "Knowledge Fragments", sub: "知识检索命中数" }
    ];
export const finalReportSections = [
      {
        title: "Executive Summary",
        content: "NovaTech Manufacturing Group 当前最优 AI 转型切入点集中在质量智能化与经营驾驶舱。建议以数据整合 + 视觉质检 pilot 为前导场景，在 90 天内完成高价值、低阻力的首轮落地，形成组织信心与可量化回报。"
      },
      {
        title: "Strategic Initiatives",
        content: "1. 以 Visual Quality Inspection 替代高成本人工复检。\n2. 建立 Executive Cockpit，缩短经营数据汇总链路。\n3. 将 Demand Forecasting 引入供应与产能决策。\n4. 同步推进 Data Governance 与 Model Risk Control 基线。"
      },
      {
        title: "90-Day Roadmap",
        content: "Day 1-30：统一关键数据口径，选取单条产线做视觉质检 pilot。\nDay 31-60：接入管理驾驶舱，联通生产、质量、经营报表。\nDay 61-90：上线预测能力试点，建立治理机制与扩展标准。"
      },
      {
        title: "Risk Controls",
        content: "建立数据质量 owner、模型上线审批、业务回滚预案与人工复核阈值。优先控制数据缺失、系统对接复杂度和组织采纳阻力，确保 AI 能力与生产节奏兼容。"
      },
      {
        title: "Expected Business Impact",
        content: "预计年度价值区间可达 $8.6M - $18.4M。主要收益来自缺陷识别提效、返工减少、报表响应提速和预测准确率改善，同时将管理层决策周期从周级压缩到日级。"
      }
    ];
