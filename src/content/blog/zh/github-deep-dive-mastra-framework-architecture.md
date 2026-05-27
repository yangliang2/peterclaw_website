---
title: "GitHub 热门项目深潜 Vol.6：Mastra Agent 框架架构深度分析：从 TypeScript-native 原语到生产级编排"
description: "全面拆解 Mastra 的核心架构设计、Agent/Tool/Workflow 三大原语、四层记忆系统，以及与 LangGraph/CrewAI 的架构对比。目标读者：熟悉 TypeScript 的 AI 应用开发者。"
contentType: review
publishedAt: 2026-05-28
ogImage: /og-default.png
tags:
  - GitHub 热门项目
  - AI Agent
  - TypeScript
  - Mastra
  - 工作流引擎
  - 架构设计
difficultyLevel: advanced
prerequisites:
  - 熟悉 TypeScript 类型系统和异步编程
  - 了解 LLM Function Calling 的基本原理
  - 对 Agent 框架（如 LangChain/LangGraph）有初步使用经验
techStack:
  - TypeScript
  - Node.js / Bun
  - Vercel AI SDK
  - Zod
useCases:
  - 评估 TypeScript 生态的 Agent 框架选型
  - 设计生产级 AI Agent 系统架构
  - 构建多步骤确定性工作流
  - 理解 Agent 记忆系统的工程化方案
recommendation: 5
draft: false
faq:
  - question: "Mastra 和 Vercel AI SDK 是什么关系？"
    answer: "Mastra 构建在 Vercel AI SDK 之上，后者负责底层的模型路由、流式传输和结构化输出。Mastra 在其上提供了 Agent、Workflow、Memory、RAG 等更高层的生产级抽象。"
  - question: "Mastra 的 Workflow 和 LangGraph 的图有什么区别？"
    answer: "Mastra Workflow 是『步骤编排』——用 .then()/.branch()/.parallel() 组合有状态步骤，强调确定性和可观测性。LangGraph 是『状态机图』——节点是任意函数，边是条件路由，更灵活但也更复杂。Mastra 更适合需要明确控制流的生产场景。"
  - question: "Mastra 支持哪些部署环境？"
    answer: "任何 Node.js 运行时（包括 Bun 和 Deno），可以嵌入 Next.js/React 应用，也可以打包为独立服务（Hono/Express）。同时支持 Vercel、Cloudflare Workers、Netlify 等无服务器平台。"
  - question: "Observational Memory 会替代 RAG 吗？"
    answer: "不会完全替代。OM 解决的是『Agent 自身经历的记忆』问题，RAG 解决的是『外部知识检索』问题。两者互补：OM 用于会话上下文管理，RAG 用于 grounding 外部文档。"
reviews:
  - reviewer: "gemini-1"
    status: "approved"
    date: "2026-05-28"
  - reviewer: "kimi-1"
    status: "approved"
    date: "2026-05-28"
---

> 24,000+ Stars，Apache 2.0，v1.0 发布于 2026 年 1 月，300K+ 周下载量——Mastra 是 TypeScript 生态中增长最快的 Agent 框架。
>
> 但它真正重要的不是数字，而是定位：当 Python 世界的 LangChain、CrewAI、AutoGen 已经卷到第 N 个版本时，TypeScript 开发者终于拥有了一个从零开始为 JS/TS 生态设计的、生产级的 Agent 框架。
>
> 这篇文章从架构层面拆解 Mastra 的设计哲学、核心原语、记忆系统，以及它与主流框架的差异。

---

## 第一部分：TypeScript 生态的 Agent 框架缺口

2024-2025 年，如果你是一名 TypeScript 开发者，想构建一个生产级 AI Agent，你的选择大致如下：

| 选项 | 问题 |
|------|------|
| **直接调用 OpenAI/Anthropic API** | 没有工具调用循环、没有记忆、没有可观测性，每次从零写 boilerplate |
| **LangChain.js** | Python 框架的移植版，API 设计受限于 Python 原生结构，TypeScript 类型体验差 |
| **Vercel AI SDK** | 优秀的底层模型路由和流式传输，但缺乏 Agent 级别的抽象（工具循环、记忆、工作流） |
| **CrewAI / AutoGen** | Python only，TypeScript 团队无法直接使用 |

Mastra 的出现填补了这个空白。它的设计哲学可以概括为一句话：**把 Vercel AI SDK 的模型能力，封装成生产级 Agent 系统所需的全套原语**。

### 1.1 团队背景与战略定位

Mastra 由 Gatsby.js 原班人马（Sam Bhagwat、Abhi Aiyer、Shane Thomas）创立，2024 年 10 月开源，2025 年冬进入 YC W25，获得 $13M 融资，2026 年 1 月发布 v1.0。

Gatsby 团队的核心能力在于**开发者体验（DX）**——他们曾经把一个复杂的静态站点生成器做成了 React 生态的默认选择之一。这种对产品化、脚手架、类型安全的极致追求，在 Mastra 中得到了延续。

### 1.2 与 Vercel AI SDK 的分层关系

理解 Mastra 的最佳方式是理解它与 Vercel AI SDK 的分层：

```
┌─────────────────────────────────────────┐
│  Mastra Layer (High-level Primitives)   │
│  - Agent (autonomous reasoning loop)    │
│  - Workflow (deterministic orchestration)│
│  - Memory (persistent context)          │
│  - RAG (retrieval pipeline)             │
│  - Evals (quality testing)              │
│  - Observability (tracing & metrics)    │
├─────────────────────────────────────────┤
│  Vercel AI SDK Layer (Model Interface)  │
│  - Model routing (OpenAI/Anthropic/...) │
│  - Streaming & generateObject           │
│  - Tool schema generation               │
│  - Provider-agnostic API                │
├─────────────────────────────────────────┤
│  Runtime Layer                          │
│  - Node.js / Bun / Deno                 │
│  - Edge runtimes (Cloudflare/Vercel)    │
└─────────────────────────────────────────┘
```

Mastra 不重复造轮子——模型调用、流式传输、结构化输出全部委托给 AI SDK。它关注的是**如何把这些底层能力组合成可维护、可观测、可扩展的 Agent 系统**。

---

## 第二部分：核心架构与原语设计

Mastra 的 `@mastra/core` 包定义了六个核心原语。理解这些原语的职责边界，是理解整个框架的关键。

### 2.1 六大原语一览

| 原语 | 职责 | 类比 |
|------|------|------|
| **Agent** | 自主决策实体：接收目标 → 推理 → 调用工具 → 迭代直到完成 | 一个可以自主行动的「员工」 |
| **Tool** | 类型化的外部函数，通过 Zod schema 描述输入输出 | 员工可以使用的「工具箱」 |
| **Workflow** | 确定性多步骤编排，支持分支、并行、暂停/恢复 | 一份明确的「标准操作流程（SOP）」 |
| **Memory** | 持久化上下文，支持会话历史、语义检索、观察记忆 | 员工的「笔记本」 |
| **RAG** | 文档分块、嵌入、向量存储、检索的完整流水线 | 企业的「知识库」 |
| **Eval** | 自动化评估 Agent 输出质量的测试框架 | 「绩效考核」 |

这六个原语不是相互独立的——它们可以嵌套和组合。例如：Agent 可以嵌入 Workflow 作为其中一个步骤；Workflow 可以被暴露为 Tool 供 Agent 调用；Memory 可以被多个 Agent 共享。

### 2.2 包架构与模块边界

```
@mastra/
├── core/                 # 六大原语的类型定义与运行时
│   ├── agent/            # Agent 循环、工具调用、结构化输出
│   ├── tools/            # createTool、Zod schema 转换
│   ├── workflows/        # 图状态机、步骤执行器
│   ├── memory/           # 记忆接口与存储抽象
│   ├── rag/              # 文档处理、嵌入、检索
│   └── evals/            # 评估指标与测试框架
├── memory/               # 记忆实现（多种后端适配器）
├── pg/                   # PostgreSQL/pgvector 存储适配器
├── libsql/               # Turso/LibSQL 存储适配器
├── mongodb/              # MongoDB 存储适配器
├── deployer/             # 部署打包工具（Hono/Vercel/Cloudflare）
└── studio/               # 本地开发环境（可视化调试）
```

这种模块化设计的一个重要好处是：**你可以只使用你需要的部分**。不需要 RAG？不安装 `@mastra/rag`。只需要 Agent + Tool？`@mastra/core` 就够了。

---

## 第三部分：Agent 与 Tool 的抽象层

### 3.1 Agent 的推理循环

Mastra 的 Agent 本质上是一个**ReAct（Reason + Act）循环**的封装：

```typescript
import { Agent } from '@mastra/core/agent';
import { openai } from '@ai-sdk/openai';

const agent = new Agent({
  id: 'research-agent',
  name: 'Research Assistant',
  instructions: `
    You are a research assistant. When given a topic:
    1. Search for relevant information
    2. Synthesize findings into a structured report
    3. Cite your sources
  `,
  model: openai('gpt-4o'),
  tools: { searchTool, summarizeTool, citeTool },
});

// 完整响应
const result = await agent.generate('Analyze the impact of AI on software engineering');

// 流式响应（适合聊天 UI）
const stream = await agent.stream('Analyze the impact of AI on software engineering');
```

Agent 循环的伪代码逻辑如下：

```
agent.generate(input):
  context = build_context(instructions, memory, tools)
  while not done and iterations < max:
    response = llm.generate(context)
    if response.has_tool_calls:
      results = execute_tools(response.tool_calls)
      context.add_tool_results(results)
    else:
      return response.content
  throw MaxIterationsError
```

这个循环由 Mastra 自动管理，开发者不需要手写 while 循环和工具解析逻辑。框架处理了：
- 工具 schema 到 LLM function calling 格式的转换
- 并行工具调用的执行与结果聚合
- 工具输出过大时的截断与格式化
- 循环终止条件（无工具调用、达到最大迭代次数、用户中断）

### 3.2 Tool 的类型安全设计

Tool 是 Mastra 类型系统的亮点。每一个 Tool 都必须用 Zod 定义输入 schema：

```typescript
import { createTool } from '@mastra/core/tools';
import { z } from 'zod';

const searchTool = createTool({
  id: 'web-search',
  description: 'Search the web for current information on a topic',
  inputSchema: z.object({
    query: z.string().describe('The search query'),
    maxResults: z.number().min(1).max(10).default(5)
      .describe('Maximum number of results to return'),
  }),
  outputSchema: z.object({
    results: z.array(z.object({
      title: z.string(),
      url: z.string(),
      snippet: z.string(),
    })),
  }),
  execute: async ({ context }) => {
    const { query, maxResults } = context.input;
    // 实际搜索逻辑
    const results = await searchAPI(query, maxResults);
    return { results };
  },
});
```

关键设计点：

1. **Zod schema 即契约**：`inputSchema` 同时服务于三个目标——TypeScript 类型推断、运行时输入校验、LLM 的 function calling schema 生成。一份代码，三重用处。
2. **结构化输出**：Agent 可以要求 LLM 返回符合 Zod schema 的对象，而不是自由文本：

```typescript
const report = await agent.generate('Analyze Rust vs Go for systems programming', {
  output: z.object({
    winner: z.enum(['Rust', 'Go', 'Tie']),
    rationale: z.string(),
    performanceScore: z.object({
      rust: z.number().min(0).max(10),
      go: z.number().min(0).max(10),
    }),
    useCases: z.array(z.object({
      scenario: z.string(),
      recommendation: z.enum(['Rust', 'Go']),
    })),
  }),
});
```

3. **MCP 原生支持**：Mastra 把 MCP（Model Context Protocol）服务器当作一等公民。声明一个 MCP 连接后，其暴露的工具会自动被 Agent 发现和调用：

```typescript
import { MCPClient } from '@mastra/mcp';

const mcp = new MCPClient({
  servers: {
    github: {
      command: 'npx',
      args: ['-y', '@modelcontextprotocol/server-github'],
      env: { GITHUB_PERSONAL_ACCESS_TOKEN: process.env.GITHUB_TOKEN },
    },
  },
});

// Agent 自动获得 github_search_issues, github_create_issue 等工具
const agent = new Agent({
  name: 'GitHub Agent',
  tools: await mcp.getTools(),
});
```

---

## 第四部分：Workflow 引擎——确定性编排的核心

如果说 Agent 处理的是**开放性问题**（「帮我研究这个主题」），Workflow 处理的就是**确定性流程**（「先 A，再 B，如果 C 则 D，否则 E」）。

### 4.1 图状态机架构

Mastra Workflow 的核心是一个**有向图状态机**。每个节点是一个 `Step`，边是控制流关系：

```
         [Trigger Data]
              │
              ▼
        ┌──────────┐
        │  Step 1  │
        │ fetchData│
        └────┬─────┘
             │
      ┌──────┴──────┐
      ▼             ▼
┌──────────┐  ┌──────────┐
│ Step 2A  │  │ Step 2B  │
│ validate │  │ enrich   │
│  (并行)   │  │  (并行)   │
└────┬─────┘  └────┬─────┘
     │             │
     └──────┬──────┘
            ▼
      ┌──────────┐
      │  Step 3  │
      │  branch  │
      └────┬─────┘
    ┌──────┴──────┐
    ▼             ▼
┌────────┐   ┌────────┐
│success │   │failure │
│ step   │   │ step   │
└────────┘   └────────┘
```

代码表达：

```typescript
import { createWorkflow, createStep } from '@mastra/core/workflows';
import { z } from 'zod';

const fetchData = createStep({
  id: 'fetch-data',
  inputSchema: z.object({ query: z.string() }),
  outputSchema: z.object({ rawData: z.string() }),
  execute: async ({ inputData }) => {
    const data = await fetchExternalAPI(inputData.query);
    return { rawData: data };
  },
});

const validateData = createStep({
  id: 'validate-data',
  inputSchema: z.object({ rawData: z.string() }),
  outputSchema: z.object({ isValid: z.boolean() }),
  execute: async ({ inputData }) => {
    return { isValid: inputData.rawData.length > 0 };
  },
});

const enrichData = createStep({
  id: 'enrich-data',
  inputSchema: z.object({ rawData: z.string() }),
  outputSchema: z.object({ enriched: z.string() }),
  execute: async ({ inputData }) => {
    return { enriched: `Enriched: ${inputData.rawData}` };
  },
});

const processSuccess = createStep({
  id: 'process-success',
  inputSchema: z.object({ enriched: z.string() }),
  outputSchema: z.object({ result: z.string() }),
  execute: async ({ inputData }) => {
    return { result: `Done: ${inputData.enriched}` };
  },
});

const handleFailure = createStep({
  id: 'handle-failure',
  inputSchema: z.object({ rawData: z.string() }),
  outputSchema: z.object({ result: z.string() }),
  execute: async () => ({ result: 'Failed validation' }),
});

export const dataPipeline = createWorkflow({
  id: 'data-pipeline',
  inputSchema: z.object({ query: z.string() }),
  outputSchema: z.object({ result: z.string() }),
})
  .then(fetchData)
  .parallel([validateData, enrichData])
  .branch([
    [
      async ({ inputData }) => inputData['validate-data']?.isValid === true,
      processSuccess,
    ],
    [async () => true, handleFailure],
  ])
  .commit();
```

### 4.2 控制流原语

Mastra vNext Workflow（0.9.1+）提供了六种控制流方法：

| 方法 | 语义 | 适用场景 |
|------|------|----------|
| `.then(step)` | 顺序执行 | 线性流水线 |
| `.parallel([stepA, stepB])` | 并行执行 | 独立任务同时跑 |
| `.branch([[cond, step], ...])` | 条件分支 | 根据状态路由 |
| `.map(fn)` | 数据转换 | 步骤间数据格式适配 |
| `.dountil(step, cond)` / `.dowhile(step, cond)` | 循环 | 重试、轮询 |
| 嵌套 Workflow | 子工作流 | 复杂逻辑模块化 |

### 4.3 持久化与 Suspend/Resume

Workflow 最重要的生产特性之一是**状态持久化**。任何步骤都可以 `suspend`，将完整状态序列化到存储后端，稍后通过外部事件 `resume`：

```typescript
const approvalStep = createStep({
  id: 'await-approval',
  inputSchema: z.object({ proposal: z.string() }),
  outputSchema: z.object({ approved: z.boolean() }),
  execute: async ({ inputData, suspend }) => {
    // 如果需要人工审批，暂停工作流
    if (needsHumanReview(inputData.proposal)) {
      await suspend({
        message: 'Waiting for manager approval',
        proposal: inputData.proposal,
      });
      // suspend 后不会立即返回；resume 时会重新进入此步骤
    }
    return { approved: true };
  },
});

// 稍后恢复
const run = workflow.createRun();
await run.start({ triggerData: { proposal: 'Q3 budget' } });
// ... 工作流暂停 ...
await run.resume({ stepId: 'await-approval', context: { approved: true } });
```

这个设计让 Mastra Workflow 可以构建真正可靠的审批流、人机协作流程、异步事件驱动的处理管线。

---

## 第五部分：四层记忆系统的设计与实现

Mastra 的记忆系统不是单一组件，而是**四个互补机制的叠层**。在 Vol.3 中我们已经深入分析了 Observational Memory，这里从架构全局视角回顾整个记忆体系。

### 5.1 记忆系统总览

```
┌─────────────────────────────────────────────┐
│ Layer 4: Observational Memory (观察记忆)     │
│ - Observer + Reflector 双代理压缩             │
│ - 纯文本、无需向量数据库                      │
│ - 3-6x 文本压缩，5-40x 工具输出压缩           │
│ - LongMemEval 94.87% (SoTA)                  │
├─────────────────────────────────────────────┤
│ Layer 3: Semantic Recall (语义回忆)          │
│ - 基于嵌入的相似性搜索                        │
│ - 需要向量数据库（pgvector/Pinecone/Qdrant）  │
│ - 适用于跨会话的语义关联检索                  │
├─────────────────────────────────────────────┤
│ Layer 2: Working Memory (工作记忆)           │
│ - 结构化 Markdown 块，注入系统提示             │
│ - 存储用户偏好、事实、进行中的上下文            │
│ - Agent 可主动更新                            │
├─────────────────────────────────────────────┤
│ Layer 1: Conversation History (会话历史)      │
│ - 原始消息序列                                │
│ - 最简单的形式，但消耗上下文窗口最快            │
│ - 默认保留最近 N 条消息                       │
└─────────────────────────────────────────────┘
```

**读取优先级**（从高到低）：
1. 系统提示 + Working Memory（固定注入）
2. 当前会话的 Conversation History（最近消息）
3. Observational Memory 的压缩观察（长期记忆）
4. Semantic Recall 的检索结果（按需检索）

### 5.2 各层的设计取舍

| 记忆层 | 存储形式 | 查询方式 | 延迟 | 成本 | 适用场景 |
|--------|----------|----------|------|------|----------|
| Conversation | 原始消息 | 直接拼接 | 零 | 高（占上下文窗口） | 当前会话 |
| Working Memory | Markdown 块 | 直接注入 | 零 | 中 | 用户偏好、结构化事实 |
| Semantic Recall | 向量嵌入 | 相似性搜索 | 中（需向量查询） | 中 | 跨会话语义关联 |
| Observational Memory | 压缩文本 | 直接注入 | 低（文本加载） | 低（支持 prompt caching） | 长期对话压缩 |

关键洞察：**没有单一记忆机制能覆盖所有场景**。Mastra 的四层设计让开发者可以根据场景组合使用——对于需要精确时间线的客服场景，保留更多 Conversation History；对于需要长期记忆的个人助手，开启 Observational Memory；对于知识库问答，配合 Semantic Recall 和 RAG。

### 5.3 记忆配置实战

```typescript
import { Memory } from '@mastra/memory';
import { Agent } from '@mastra/core/agent';

const memory = new Memory({
  storage: new PostgresStore({ connectionString: process.env.DATABASE_URL }),
  vector: new PgVector({ connectionString: process.env.DATABASE_URL }),
  options: {
    // 会话历史：保留最近 20 条消息
    lastMessages: 20,
    
    // 语义回忆：检索 top-3 相关历史
    semanticRecall: {
      topK: 3,
      messageRange: { before: 2, after: 2 },
    },
    
    // 观察记忆：自动压缩，阈值可调
    observationalMemory: {
      model: 'openai/gpt-4o-mini',
      observation: { messageTokens: 30_000 },
      reflection: { observationTokens: 40_000 },
    },
    
    // 工作记忆：开启结构化记忆块
    workingMemory: { enabled: true },
  },
});

const agent = new Agent({
  name: 'personal-assistant',
  instructions: 'You are a helpful personal assistant.',
  model: openai('gpt-4o'),
  memory,
});
```

---

## 第六部分：与 LangGraph 和 CrewAI 的架构对比

### 6.1 三框架定位差异

| 维度 | Mastra | LangGraph | CrewAI |
|------|--------|-----------|--------|
| **原生语言** | TypeScript | Python | Python |
| **架构哲学** | 分层原语，组合优先 | 状态机图，灵活优先 | 角色扮演，协作优先 |
| **Agent 抽象** | ReAct 循环封装 | 任意节点函数 | 角色 + 任务 + 工具 |
| **工作流** | 确定性步骤编排 | 条件图（任意循环） | 流程 + 委托（hierarchical） |
| **记忆** | 四层叠层（OM 为特色） | 检查点 + 状态持久化 | 短期记忆 + 长期记忆（RAG） |
| **类型安全** | Zod 全程类型化 | Pydantic（Python 侧） | Pydantic |
| **部署** | Node/Edge/Serverless | LangChain Cloud / 自建 | 本地 / 容器 |
| **生态规模** | 快速增长，50+ 集成 | 1000+ 集成，最大生态 | 中等，专注多 Agent 协作 |

### 6.2 LangGraph 对比：图 vs 步骤

LangGraph 的核心抽象是**状态机图（State Machine Graph）**：

```python
# LangGraph 风格：节点是函数，边是条件
builder = StateGraph(State)
builder.add_node("agent", agent_node)
builder.add_node("tools", tool_node)
builder.add_conditional_edges("agent", should_continue, {
    "continue": "tools",
    "end": END,
})
builder.add_edge("tools", "agent")
graph = builder.compile()
```

LangGraph 的图是**通用计算图**——节点可以是任意函数，边可以是任意条件。这带来了极大的灵活性，但也增加了认知负担：你需要手动管理状态流转、循环检测、并行合并。

Mastra Workflow 是**领域特定语言（DSL）**：

```typescript
// Mastra 风格：控制流是显式原语
workflow
  .then(step1)
  .parallel([step2a, step2b])
  .branch([
    [conditionA, step3],
    [conditionB, step4],
  ])
  .commit();
```

Mastra 牺牲了部分灵活性（例如不容易表达任意循环），换取了**更强的可预测性和可观测性**。每个步骤的输入输出都有 Zod schema，执行路径在 `.commit()` 时就已确定，调试时可以精确追踪「哪一步发生了什么」。

**选型建议**：
- 需要**任意复杂的控制流**（嵌套循环、动态图结构）→ LangGraph
- 需要**确定性生产流水线**（审批流、ETL、数据管道）→ Mastra Workflow
- TypeScript 团队 → Mastra（LangGraph 的 TS SDK 功能和文档均滞后于 Python 版）

### 6.3 CrewAI 对比：协作模式

CrewAI 的核心理念是**角色扮演（Role-Playing）**：

```python
# CrewAI 风格：Agent 有角色，通过 Task 协作
researcher = Agent(role='Researcher', goal='Gather data', ...)
writer = Agent(role='Writer', goal='Draft report', ...)

task1 = Task(description='Research AI trends', agent=researcher)
task2 = Task(description='Write summary', agent=writer, context=[task1])

crew = Crew(agents=[researcher, writer], tasks=[task1, task2])
result = crew.kickoff()
```

CrewAI 适合**模拟人类团队协作**的场景：研究员写报告、作家润色、编辑审核。它的优势在于概念直观，非技术人员也能理解。

Mastra 没有内置「角色」抽象，但可以通过**Supervisor 模式**实现类似效果：

```typescript
// Mastra 的 Supervisor 模式
const supervisor = new Agent({
  name: 'coordinator',
  instructions: 'Delegate tasks to specialized agents.',
  tools: {
    delegateToResearcher: createTool({
      execute: async ({ context }) => {
        return researcher.generate(context.input);
      },
    }),
    delegateToWriter: createTool({
      execute: async ({ context }) => {
        return writer.generate(context.input);
      },
    }),
  },
});
```

**选型建议**：
- 需要**模拟人类团队协作流程**（研究→写作→编辑）→ CrewAI
- 需要**类型安全、可观测、可嵌入现有 TS 代码库** → Mastra
- Python 团队 → CrewAI 或 LangGraph

---

## 第七部分：生产生态——RAG、Evals、可观测性与部署

一个框架是否能用于生产，不仅取决于核心原语，还取决于周边的**可观测性、测试、部署**工具链。

### 7.1 RAG 流水线

Mastra 的 RAG 不是「调用外部向量库」那么简单，而是提供了一整套**文档处理 → 分块 → 嵌入 → 存储 → 检索 → 重排序**的流水线：

```typescript
import { Mastra } from '@mastra/core';
import { PgVector } from '@mastra/pg';

const rag = mastra.rag;

// 1. 文档处理与分块
const chunks = await rag.chunkDocument({
  document: await fetchDocument('https://example.com/docs'),
  strategy: 'recursive',  // 递归分块、语义分块、固定长度分块
  chunkSize: 512,
  overlap: 50,
});

// 2. 生成嵌入并存储
await rag.embedAndStore({
  chunks,
  embeddingModel: openai.embedding('text-embedding-3-small'),
  vectorStore: new PgVector({ connectionString: process.env.DATABASE_URL }),
  indexName: 'docs-index',
});

// 3. 检索（Agent 自动调用）
const agent = new Agent({
  name: 'docs-assistant',
  instructions: 'Answer questions based on the documentation.',
  model: openai('gpt-4o'),
  memory,
  // RAG 上下文自动注入到每次 generate()
});
```

支持的向量数据库：PostgreSQL/pgvector、Pinecone、Qdrant、ChromaDB、MongoDB、LibSQL、Cloudflare Vectorize、Elasticsearch 等。

### 7.2 Evals 框架

Mastra 内置了自动化评估框架，支持三种评估方式：

```typescript
import { judgeModel } from '@mastra/core/evals';

// 1. 模型评分（LLM-as-a-Judge）
const relevance = await judgeModel({
  metric: 'relevance',
  input: 'What is Mastra?',
  output: 'Mastra is a TypeScript agent framework...',
});

// 2. 规则评分
const factual = await judgeModel({
  metric: 'factuality',
  output: result.text,
  context: sourceDocuments,
});

// 3. 统计评分（不需要 LLM）
const toxicity = await judgeModel({
  metric: 'toxicity',
  output: result.text,
});
```

评估可以在 CI 中运行，作为 Agent 质量的回归测试。这对于生产系统至关重要——LLM 的输出会随模型版本、温度参数、提示词变化而漂移，自动化 evals 是捕捉这种漂移的唯一可靠方式。

### 7.3 可观测性

Mastra 原生集成了 OpenTelemetry 追踪，每一步 Agent 循环、Workflow 步骤、Tool 调用都会被记录：

```
Trace: workflow-run-abc123
├── span: step-1 (fetchData)
│   ├── input: { query: "AI trends" }
│   ├── output: { rawData: "..." }
│   └── duration: 1.2s
├── span: step-2a (validateData)
│   └── duration: 0.05s
├── span: step-2b (enrichData)
│   └── duration: 0.8s
└── span: step-3 (branch)
    └── condition: true → processSuccess
```

追踪数据可以导出到：LangSmith、Langfuse、Braintrust、Datadog、New Relic，或任何兼容 OpenTelemetry 的后端。

### 7.4 部署模型

```
部署选项矩阵：
┌─────────────────┬──────────────┬──────────────┬─────────────────┐
│ 部署模式         │ 适合场景      │ 运行时要求    │ 复杂度          │
├─────────────────┼──────────────┼──────────────┼─────────────────┤
│ 嵌入 Next.js    │ 全栈 TS 应用  │ Node.js      │ 低              │
│ 独立 Hono 服务  │ 微服务/后端   │ Node.js/Bun  │ 中              │
│ Vercel Functions│ 无服务器      │ Edge/Node    │ 低              │
│ Cloudflare      │ 边缘计算      │ Workers      │ 中              │
│ Mastra Cloud    │ 托管平台      │ 托管         │ 最低            │
└─────────────────┴──────────────┴──────────────┴─────────────────┘
```

---

## 第八部分：架构设计的关键启示

回顾 Mastra 的整体架构，有四个设计决策特别值得 AI 系统工程师借鉴：

### 8.1 分层组合优于全能单体

Mastra 没有试图成为一个「什么都做」的框架。它明确分层：Vercel AI SDK 处理模型交互，Mastra 处理 Agent 系统架构。这种边界清晰的分层让每个层都可以独立演进。

### 8.2 类型安全不是可选品

从 Tool 的 Zod schema 到 Workflow 的步骤输入输出，类型安全贯穿始终。这不是「锦上添花」，而是**生产系统的必要基础设施**——它让 IDE 自动补全、编译时错误检查、运行时输入校验成为同一份代码的自然产物。

### 8.3 确定性与概率性的分离

Mastra 明确区分了 Agent（概率性、自主决策）和 Workflow（确定性、明确控制流）。这种分离比把它们混在一个「图」中更贴近工程实际：**有些流程必须按预期执行，不能交给 LLM 临场发挥**。

### 8.4 记忆是系统问题，不是模型问题

Mastra 的四层记忆系统传达了一个重要观点：**上下文管理不应该只是「往 prompt 里塞更多 token」**。通过压缩、索引、结构化存储的分层设计，可以在有限上下文窗口内实现远超窗口大小的有效记忆。

---

## 结论

Mastra 不是又一个 Agent 框架。它是 TypeScript 生态中第一个从底层就为生产环境设计的、拥有完整工具链的 Agent 基础设施。

它的价值可以用三个关键词概括：

1. **Native**：不是 Python 框架的移植，每处 API 都为 TypeScript 开发者自然设计
2. **Opinionated**：提供了明确的架构 guidance——什么时候用 Agent，什么时候用 Workflow，记忆怎么分层
3. **Production-Ready**：可观测性、评估、持久化工作流、MCP 集成，这些都是生产系统的刚需，而非演示代码的可选项

对于已经在使用 TypeScript 全栈的团队，Mastra 提供了一个比 CrewAI 更自然、比 LangGraph.js 更成熟的路径。而对于所有 AI 系统工程师，它的架构设计——尤其是类型安全的 Tool 抽象、确定性的 Workflow 引擎、分层的记忆系统——都值得作为参考范式。

> **延伸阅读**
> - [Mastra 官方文档](https://mastra.ai/docs)
> - [Mastra GitHub](https://github.com/mastra-ai/mastra)
> - [本系列 Vol.3：Mastra Observational Memory 深度解析](/zh/blog/github-deep-dive-mastra-agent-memory/)
> - [Vercel AI SDK 文档](https://sdk.vercel.ai/docs)
