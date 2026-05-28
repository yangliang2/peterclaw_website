---
title: "Prompt Engineering 完整指南：从零基础到实战技巧的系统性教程"
description: "系统讲解 Prompt Engineering 的核心理论与实战方法，覆盖 Zero-shot、Few-shot、Chain-of-Thought、ReAct 四大技术，附代码生成、文章写作、数据分析三大场景的即用模板，以及 Claude / GPT-4o / Gemini 的 prompt 差异对比。"
publishedAt: 2026-05-28
tags:
  - Prompt Engineering
  - 提示词工程
  - AI 技巧
  - LLM
  - 大模型
area: tutorial
draft: false
reviews: []
---

> **目标读者**：希望系统掌握 Prompt Engineering 的开发者、产品经理、内容创作者。无需深度学习背景，只需熟悉主流大模型（ChatGPT、Claude、Gemini）的基本使用。
>
> SEO 关键词：prompt engineering 教程、提示词工程、AI prompt 技巧

---

## 引言：为什么 Prompt Engineering 是一项核心技能

2023 年，Prompt Engineering 被《时代》杂志列为「年度新兴职业」。到 2026 年，它已经从职业变成了所有知识工作者的基础能力——就像 20 年前的搜索引擎使用技巧一样。

但大多数人写 prompt 的方式仍然停留在「随便说说」的阶段。一个模糊的提问，换来一个泛泛的回答，然后抱怨「AI 不够聪明」。事实上，**大模型的表现差距，80% 来自 prompt 的质量差异，而非模型能力本身**。

Prompt Engineering 的本质不是「咒语收集」，而是一门**结构化沟通的工程学科**：理解模型的认知模式，设计信息输入的格式，控制输出的边界与风格，并通过迭代调试逼近最优解。

本文将从基础概念出发，系统覆盖四大核心技术、三大实战场景的模板库、常见误区与调试方法，以及主流模型的 prompt 差异对比。目标是让你读完之后，能立刻写出生产环境级别的 prompt。

---

## 第一节：Prompt Engineering 基础概念

### 1.1 什么是 Prompt Engineering

Prompt Engineering（提示词工程）是指通过**设计、优化和迭代输入文本（prompt）**，引导大语言模型（LLM）生成符合预期的、高质量的、可控的输出内容的技术与实践。

它不是简单的「提问技巧」，而是一个包含以下要素的完整工程流程：

| 要素 | 说明 | 示例 |
|------|------|------|
| **指令（Instruction）** | 明确告诉模型做什么 | "将以下文本翻译成中文" |
| **上下文（Context）** | 提供背景信息，缩小模型的理解空间 | "你是一位资深前端工程师，正在评审代码" |
| **输入数据（Input Data）** | 需要模型处理的具体内容 | 待翻译的英文段落、待分析的代码 |
| **输出格式（Output Format）** | 规定结果的呈现方式 | "用 JSON 返回，包含 summary 和 details 两个字段" |
| **约束条件（Constraints）** | 限制模型的行为边界 | "不要使用专业术语，让非技术人员也能看懂" |

### 1.2 为什么 Prompt Engineering 如此重要

**成本视角**：一个高质量的 prompt 可以让 GPT-4o mini 达到 GPT-4o 的效果。在规模化调用场景下，这意味着数倍的成本节约。

**可靠性视角**：生产环境中的 AI 应用不能靠「运气」输出。Prompt Engineering 通过结构化设计，将模型的随机性控制在可接受范围内。

**可维护视角**：好的 prompt 是文档。当团队成员更换时，一个清晰的 prompt 比一百行后处理代码更容易交接。

> **核心原则**：Prompt Engineering 不是让模型「猜」你想要什么，而是**明确告诉它**你想要什么。

---

## 第二节：四大核心技术详解

### 2.1 Zero-shot Prompting（零样本提示）

**定义**：不给出任何示例，直接通过指令让模型完成任务。

**适用场景**：
- 任务定义明确、边界清晰
- 模型对该任务已有充分的预训练知识
- 追求最少的 token 消耗

**基础模板**：

```markdown
【角色定义】
你是一位 {专业角色}，擅长 {具体能力}。

【任务指令】
{明确、可执行的任务描述}。

【输入数据】
{待处理的内容}

【输出要求】
- 格式：{JSON / Markdown / 纯文本等}
- 风格：{专业 / 通俗 / 幽默等}
- 长度：{字数限制或范围}
- 约束：{禁止做的事}
```

**示例**：

```markdown
你是一位技术文档工程师，擅长将复杂概念转化为通俗易懂的说明。

任务：为以下函数编写 docstring，要求包含参数说明、返回值说明和一个使用示例。

输入：
```python
def calculate_moving_average(data: list[float], window: int) -> list[float]:
    if window > len(data):
        raise ValueError("窗口大小不能超过数据长度")
    return [sum(data[i:i+window])/window for i in range(len(data)-window+1)]
```

输出要求：
- 使用 Google Style 格式
- 中文撰写
- 使用示例必须包含具体数值
```

**Zero-shot 的关键**：指令的精确度决定了输出的质量。如果模型表现不佳，通常不是因为它「不懂」，而是因为你的指令存在歧义。

---

### 2.2 Few-shot Prompting（少样本提示）

**定义**：在 prompt 中提供 1-5 个输入-输出示例，让模型通过「模仿」理解任务模式。

**适用场景**：
- 任务难以用纯文字精确描述
- 需要特定的输出风格或格式
- Zero-shot 效果不达标

**基础模板**：

```markdown
【任务说明】
{简短描述任务目标}

【示例】
输入：{示例1输入}
输出：{示例1输出}

输入：{示例2输入}
输出：{示例2输出}

【待处理】
输入：{实际输入}
输出：
```

**示例（情感分类）**：

```markdown
请判断以下商品评价的情感倾向（正面 / 负面 / 中性），并给出理由。

示例 1：
输入："发货速度超快，包装也很用心，手机壳手感特别好，会回购！"
输出：正面。理由：用户明确表达了满意（"超快"、"用心"、"特别好"、"会回购"）。

示例 2：
输入："等了五天还没到，客服回复也很慢。"
输出：负面。理由：用户抱怨物流慢和客服响应慢。

示例 3：
输入："东西收到了，和描述基本一致。"
输出：中性。理由：用户陈述事实，没有明显的情绪倾向。

待处理：
输入："这个价格能买到这样的质量已经很满意了，虽然颜色比图片深一点。"
输出：
```

**Few-shot 的设计要点**：

1. **示例要覆盖边界情况**：不要只给「理想情况」的示例，要包含歧义、异常、多义词等复杂 case。
2. **示例顺序有讲究**：把最清晰、最典型的示例放在前面，复杂示例放在后面。
3. **示例数量不是越多越好**：超过 5 个示例通常收益递减，且会消耗大量上下文窗口。优先保证示例质量。

---

### 2.3 Chain-of-Thought（思维链提示）

**定义**：在 prompt 中引导模型「一步步思考」，显式输出推理过程，而非直接给出答案。

**适用场景**：
- 数学计算、逻辑推理
- 复杂决策（多条件权衡）
- 需要可追溯性的场景（医疗、法律、金融）
- 模型直接回答时准确率不高的问题

**两种实现方式**：

**方式一：Zero-shot CoT**

在指令末尾添加一句魔法短语：

```markdown
{任务描述}

请一步步思考，然后给出答案。
```

或英文版（对某些模型效果更好）：

```markdownn{task_description}

Let's think step by step.
```

**方式二：Few-shot CoT**

在示例中显式展示推理过程：

```markdown
问题：一个农场有鸡和兔共 35 只，脚共 94 只。鸡和兔各有多少只？

思考过程：
1. 设鸡有 x 只，兔有 y 只。
2. 根据题意列出方程组：
   x + y = 35
   2x + 4y = 94
3. 由第一式得 x = 35 - y，代入第二式：
   2(35 - y) + 4y = 94
   70 - 2y + 4y = 94
   2y = 24
   y = 12
4. 所以 x = 35 - 12 = 23。

答案：鸡 23 只，兔 12 只。
```

**CoT 的进阶技巧**：

| 技巧 | 说明 | 效果 |
|------|------|------|
| **Self-Consistency** | 让模型对同一问题生成多条推理链，投票选出最一致的答案 | 数学问题准确率提升 10-20% |
| **Tree of Thoughts** | 在关键决策点分叉探索多条推理路径，评估后选择最优 | 复杂规划任务效果显著 |
| **验证链（CoVe）** | 生成答案后，让模型验证每个事实的正确性，再修正 | 减少事实幻觉 |

---

### 2.4 ReAct（推理 + 行动）

**定义**：将 Chain-of-Thought 与工具调用结合，让模型在「思考」和「行动」之间循环，直到完成任务。

**适用场景**：
- 需要实时信息的问答
- 需要执行外部操作的任务
- 多步骤、需要动态调整策略的复杂任务

**核心循环**：

```
思考（Thought）→ 行动（Action）→ 观察（Observation）→ 思考（Thought）→ ...
```

**基础模板**：

```markdown
你是一位能使用工具的 AI 助手。按以下格式工作：

思考：{分析当前情况，决定下一步做什么}
行动：{工具名称} {参数}
观察：{工具返回的结果}

可用工具：
- search: 搜索网络信息，参数为查询关键词
- calculator: 进行数学计算，参数为算式
- code_runner: 执行 Python 代码，参数为代码字符串

任务：{具体任务描述}

开始：
思考：
```

**示例**：

```markdown
任务：2025 年诺贝尔物理学奖得主是谁？他的主要贡献是什么？

思考：我需要搜索 2025 年诺贝尔物理学奖的信息。
行动：search 2025年诺贝尔物理学奖得主
观察：2025 年诺贝尔物理学奖授予 John J. Hopfield 和 Geoffrey E. Hinton，以表彰他们在人工神经网络和机器学习领域的奠基性贡献。

思考：我得到了基本信息。现在我需要进一步了解他们的具体贡献，以便给出完整的回答。
行动：search John Hopfield Geoffrey Hinton 主要贡献 神经网络
观察：Hopfield 提出了 Hopfield 网络（一种递归神经网络），用于模拟记忆存储和检索。Hinton 发明了反向传播算法、玻尔兹曼机，并推动了深度学习的复兴。

思考：我已经获得了足够的信息，可以给出完整回答。

答案：2025 年诺贝尔物理学奖授予 John J. Hopfield 和 Geoffrey E. Hinton...
```

**ReAct 的关键设计**：

1. **工具描述必须精确**：模型根据工具描述决定何时调用。模糊的描述会导致该调用时不调用，或传错参数。
2. **终止条件要明确**：告诉模型什么情况下应该停止循环、输出最终答案。
3. **错误处理要设计**：工具调用失败时，模型应该如何应对？需要在系统提示中说明。

---

## 第三节：实战模板库

### 3.1 场景一：代码生成

**模板：结构化代码生成**

```markdown
你是一位资深 {语言} 工程师，擅长 {领域}。

【任务】
{功能需求的详细描述，包括输入、输出、边界条件}

【技术约束】
- 语言：{编程语言及版本}
- 框架：{允许使用的库 / 框架}
- 限制：{禁止使用的特性或做法}
- 风格：{遵循的代码规范}

【输出格式】
1. 代码实现（带详细注释）
2. 复杂度分析（时间 + 空间）
3. 测试用例（覆盖正常 / 边界 / 异常情况）

【待实现功能】
{具体的功能描述}
```

**示例**：

```markdown
你是一位资深 Python 工程师，擅长数据处理与 API 设计。

【任务】
实现一个带有速率限制（Rate Limiting）的装饰器，基于 Redis 实现滑动窗口算法。

【技术约束】
- 语言：Python 3.11+
- 框架：redis-py，typing
- 限制：不使用第三方限流库（如 flask-limiter）
- 风格：PEP 8，类型注解完整

【输出格式】
1. 代码实现（带详细注释）
2. 复杂度分析
3. 单元测试（pytest 风格）
```

**代码生成 Prompt 的要点**：

- **边界条件要显式列出**：模型不会自动考虑所有 edge case，你需要在 prompt 中提醒它
- **要求输出测试用例**：这能倒逼模型考虑异常情况
- **指定代码风格**：不同团队有不同的规范，提前说明减少后期调整

---

### 3.2 场景二：文章写作

**模板：SEO 友好的技术文章**

```markdown
你是一位 {领域} 的技术写作者，文章风格 {专业但易懂 / 深入浅出 / 幽默风趣}。

【文章要求】
- 标题：{主标题，含目标关键词}
- 字数：{目标字数}
- 受众：{目标读者画像}
- 语气：{正式 / 亲切 / 权威}

【SEO 要求】
- 目标关键词：{关键词1}、{关键词2}、{关键词3}
- 关键词密度：自然分布，不要堆砌
- 结构要求：H2/H3 层级清晰，便于搜索引擎抓取

【内容大纲】
1. {第一节标题及要点}
2. {第二节标题及要点}
3. {第三节标题及要点}
...

【输出格式】
- Markdown 格式
- 每段 3-5 句话
- 关键概念首次出现时加粗
- 适当使用列表和表格提升可读性
```

**示例**：

```markdown
你是一位前端技术写作者，文章风格深入浅出。

【文章要求】
- 标题：React Server Components 完全指南：从原理到实战
- 字数：2500-3000 字
- 受众：有 React 基础、想了解 RSC 的中级开发者
- 语气：专业但亲切

【SEO 要求】
- 目标关键词：React Server Components、RSC 教程、Next.js App Router
- 关键词密度：自然分布
- 结构要求：H2/H3 层级清晰

【内容大纲】
1. 引言：CSR 的问题与 RSC 的提出背景
2. RSC 的核心原理：服务端渲染 vs 客户端渲染的边界
3. 实战：在 Next.js App Router 中使用 RSC
4. 常见误区与最佳实践
5. 总结与展望
```

---

### 3.3 场景三：数据分析

**模板：自动化数据分析报告**

```markdown
你是一位数据分析师，擅长从数据中提取洞察并以清晰的方式呈现。

【数据集说明】
- 来源：{数据背景}
- 字段说明：
  - {字段1}：{类型，含义}
  - {字段2}：{类型，含义}
- 数据样本：
```
{前 5 行数据}
```

【分析目标】
{需要回答的业务问题}

【输出要求】
1. 数据概览（行数、字段统计、缺失值情况）
2. 描述性统计（各字段分布、相关性分析）
3. 核心发现（至少 3 个有价值的洞察）
4. 可视化建议（推荐用什么图表展示哪些维度）
5. 行动建议（基于数据的具体业务建议）

【约束】
- 所有统计结论必须标注置信度或样本量
- 不做超出数据范围的推断
- 发现数据质量问题时要明确指出
```

**示例**：

```markdown
你是一位电商数据分析师。

【数据集说明】
- 来源：某电商平台 2026 年 Q1 销售数据
- 字段说明：
  - order_id：订单编号（字符串）
  - product_category：商品分类（字符串）
  - amount：订单金额（数值，人民币）
  - order_date：下单日期（YYYY-MM-DD）
  - user_type：用户类型（新客 / 老客）
  - channel：购买渠道（APP / 小程序 / H5）
- 数据样本：
```
order_id,product_category,amount,order_date,user_type,channel
A001,电子产品,1299,2026-01-15,新客,APP
A002,家居用品,359,2026-01-16,老客,小程序
A003,电子产品,5699,2026-01-17,老客,APP
```

【分析目标】
1. 各品类的销售额占比及趋势
2. 新客 vs 老客的消费行为差异
3. 不同渠道的效率对比

【输出要求】
（同上模板）
```

---

## 第四节：常见误区与调试方法

### 4.1 五大常见误区

| 误区 | 典型表现 | 正确做法 |
|------|----------|----------|
| **指令模糊** | "帮我写个好看点的文案" | 明确「好看」的标准：目标受众、调性、字数、必须包含的卖点 |
| **角色定义空洞** | "你是一位专家" | 具体到领域、经验年限、工作场景："你是一位有 10 年经验的 SaaS 产品经理" |
| **示例与任务不一致** | 示例是正式风格，实际想要轻松风格 | 确保示例的风格、格式、粒度与期望输出完全一致 |
| **过度约束** | 同时要求「简短」「详细」「幽默」「严肃」 | 约束之间要自洽；冲突时按优先级排列，明确告诉模型哪个更重要 |
| **期望模型有「常识」** | 假设模型知道你的业务背景 | 提供必要的上下文，不要假设模型知道你的行业术语或内部逻辑 |

### 4.2 Prompt 调试方法论

当输出不符合预期时，按以下顺序排查：

**第一步：明确问题类型**

- **理解错误**：模型误解了任务（输出方向错了）
- **格式错误**：理解对了，但输出格式不对
- **质量不足**：方向对、格式对，但内容深度/准确度不够
- **边界遗漏**：遗漏了 edge case 或特殊条件

**第二步：针对性修复**

| 问题类型 | 修复策略 |
|----------|----------|
| 理解错误 | 重写指令，使用更精确的动词；增加上下文说明 |
| 格式错误 | 在示例中展示目标格式；使用 Few-shot |
| 质量不足 | 提升角色定义的专业度；增加约束条件（"至少包含 3 个案例"）|
| 边界遗漏 | 显式列出边界条件和异常情况的处理要求 |

**第三步：A/B 测试**

不要一次性改太多。每次只改一个变量，对比效果。记录不同版本的 prompt 和对应的输出质量，建立团队的「Prompt 资产库」。

**第四步：迭代收敛**

好的 prompt 是迭代出来的，不是一次写成的。遵循这个循环：

```
写初版 → 测试 3-5 个 case → 识别失败模式 → 针对性修复 → 再次测试 → 直到稳定
```

### 4.3 调试检查清单

在提交 prompt 到生产环境前，逐一确认：

- [ ] 指令是否包含明确的动作动词（分析、总结、对比、翻译、生成）？
- [ ] 角色定义是否具体到足以影响输出风格？
- [ ] 是否提供了足够的上下文（背景、约束、目标受众）？
- [ ] 输出格式是否通过示例或 schema 明确说明？
- [ ] 是否列出了明确的禁止事项（negative constraints）？
- [ ] 是否在 3 个以上不同输入上测试过？
- [ ] 边界情况是否都有覆盖？
- [ ] Token 消耗是否在可接受范围内？

---

## 第五节：主流模型 Prompt 差异对比

### 5.1 Claude（Anthropic）

**模型特性**：
- 上下文窗口大（最高 200K tokens）
- 对角色扮演和风格控制响应精准
- 输出通常更结构化、更「听话」

**Prompt 优化要点**：

| 维度 | 建议 |
|------|------|
| **角色定义** | Claude 对角色非常敏感，详细的角色描述效果显著 |
| **XML 标签** | Claude 对 XML 标签（`<instructions>`、`<example>`）响应极好，强烈推荐使用 |
| **负面约束** | 使用 "Do not..." 或 XML `<forbidden>` 明确禁止的行为 |
| **长上下文** | 200K 窗口适合一次性放入长文档 + 复杂指令，但要注意信息密度 |

**Claude 推荐格式**：

```xml
<role>
你是一位资深技术编辑，擅长将复杂的技术概念转化为通俗易懂的解释。
</role>

<task>
为以下代码编写注释，要求每行代码都有对应的解释。
</task>

<code>
def fibonacci(n):
    if n <= 1:
        return n
    return fibonacci(n-1) + fibonacci(n-2)
</code>

<constraints>
- 注释使用中文
- 解释要适合编程初学者理解
- 不要修改代码本身
</constraints>
```

---

### 5.2 GPT-4o（OpenAI）

**模型特性**：
- 综合能力最强，泛化能力好
- 对 Few-shot 示例的学习能力强
- 支持多模态（文本 + 图像）

**Prompt 优化要点**：

| 维度 | 建议 |
|------|------|
| **Few-shot** | GPT-4o 对示例非常敏感，2-3 个高质量示例通常比长指令更有效 |
| **结构化输出** | 配合 `response_format: { "type": "json_object" }` 使用，可靠性高 |
| **系统提示** | 将角色和全局约束放在 system message 中，任务放在 user message 中 |
| **分步指令** | 复杂任务拆成多步，每步一个 user message，效果优于单条长 prompt |

**GPT-4o 推荐格式**：

```markdown
System:
你是一位数据分析师。所有回答必须用 JSON 格式，包含 "analysis"、
"findings"、"recommendations" 三个字段。

User:
请分析以下销售数据，找出增长最快的品类。

{数据}
```

---

### 5.3 Gemini（Google）

**模型特性**：
- 长上下文领先（最高 1M+ tokens）
- 对代码和数学任务表现优秀
- 多语言能力强，中文理解良好

**Prompt 优化要点**：

| 维度 | 建议 |
|------|------|
| **直接指令** | Gemini 偏好简洁直接的指令，过度修饰可能降低效果 |
| **Markdown 格式** | 使用清晰的 Markdown 标题和列表组织 prompt |
| **长文档处理** | 1M+ 上下文适合一次性分析整本书、整个代码库 |
| **代码任务** | 在代码生成和数学推理上，Gemini 对明确的输入/输出示例响应好 |

**Gemini 推荐格式**：

```markdown
## 任务
将以下 Python 函数改写为异步版本。

## 输入代码
```python
def fetch_data(url):
    import requests
    return requests.get(url).json()
```

## 要求
1. 使用 `aiohttp` 替代 `requests`
2. 添加类型注解
3. 处理网络超时异常
4. 返回原始数据结构不变
```

### 5.4 差异速查表

| 特性 | Claude | GPT-4o | Gemini |
|------|--------|--------|--------|
| **最优 prompt 风格** | XML 标签 + 详细角色 | Few-shot + system message | 简洁 Markdown + 直接指令 |
| **上下文窗口** | 200K | 128K | 1M+ |
| **对角色定义敏感度** | 极高 | 高 | 中 |
| **Few-shot 效果** | 好 | 极好 | 好 |
| **结构化输出可靠性** | 高 | 极高（配合 JSON mode）| 高 |
| **负面约束响应** | 极好 | 好 | 好 |
| **中文表现** | 优秀 | 优秀 | 优秀 |

> **实战建议**：为关键任务准备「模型适配版 prompt」。核心内容一致，但格式和表达方式针对各模型优化。不要期望同一个 prompt 在所有模型上表现相同。

---

## 第六节：Prompt Engineering 的进阶方向

### 6.1 从手写到程序化

当 prompt 需要频繁调整或 A/B 测试时，手写效率太低。推荐将 prompt 模板化：

```python
from string import Template

prompt_template = Template("""
你是一位 $role，擅长 $skill。

任务：$task

输入：
$input

约束：
$constraints

输出格式：
$output_format
""")

prompt = prompt_template.substitute(
    role="前端工程师",
    skill="React 性能优化",
    task="分析以下组件的渲染性能问题",
    input=component_code,
    constraints="- 只关注渲染性能，不讨论代码风格\n- 给出具体的优化代码",
    output_format="1. 问题描述\n2. 优化方案（带代码）\n3. 预期效果"
)
```

### 6.2 Prompt 版本管理

将 prompt 视为代码，纳入版本控制：

- 每个 prompt 一个文件
- 变更需要 code review
- 记录每个版本的测试用例和通过率
- 建立 prompt 的「回归测试集」

### 6.3 自动优化

使用「元 prompt」让模型帮你优化 prompt：

```markdown
你是一位 Prompt Engineering 专家。

以下是我写的 prompt，但输出质量不稳定。请分析存在的问题，并给出优化后的版本。

要求：
1. 指出原 prompt 的 3 个以上具体问题
2. 重写后的 prompt 必须包含：角色定义、任务指令、输出格式、约束条件
3. 优化后的 prompt 应该适用于 {目标模型}

原 prompt：
{prompt}

测试输入（输出不好的 case）：
{test_input}
```

---

## 总结：Prompt Engineering 速查清单

**核心原则**：
1. 明确优于模糊——具体告诉模型做什么、不做什么
2. 示例优于描述——Few-shot 比长篇指令更高效
3. 结构化优于自由文本——用标签、列表、代码块组织信息
4. 迭代优于一次性——测试 → 修复 → 再测试

**技术选型**：

| 任务类型 | 推荐技术 |
|----------|----------|
| 简单问答 / 翻译 / 摘要 | Zero-shot + 清晰指令 |
| 风格控制 / 格式转换 | Few-shot（2-3 个示例）|
| 数学 / 逻辑推理 | Chain-of-Thought |
| 需要外部信息的任务 | ReAct + 工具调用 |
| 复杂多步骤任务 | Plan-and-Solve（先规划再执行）|

**模型适配**：

- **Claude**：用 XML 标签，详细角色定义，善用负面约束
- **GPT-4o**：用 system message + Few-shot，配合 JSON mode
- **Gemini**：用简洁 Markdown，直接指令，发挥长上下文优势

---

## 相关阅读

- [AI Agent 核心设计模式：RAG、Function Calling 与工具调用实战指南](/zh/knowledge/ai-agent-core-design-patterns/) —— 将 Prompt Engineering 升级为 Agent 系统的进阶指南
- [AI Agent 工作流设计模式](/zh/knowledge/ai-agent-workflow-patterns/) —— 多 Agent 协作场景下的 prompt 设计原则
- [当七个 AI 组成一家公司——多智能体协作的真实体验](/zh/blog/ai-diary-005-multi-agent-collaboration/) —— 大规模 prompt 工程的团队协作实践

---

**English Abstract**

This article provides a comprehensive guide to Prompt Engineering, covering foundational concepts through advanced techniques. It systematically explains four core methodologies — Zero-shot Prompting, Few-shot Prompting, Chain-of-Thought (CoT), and ReAct (Reasoning + Acting) — with practical templates for code generation, article writing, and data analysis scenarios. The guide also includes a detailed comparison of prompt optimization strategies across Claude, GPT-4o, and Gemini, highlighting each model's unique characteristics and recommended formatting styles. A dedicated section on debugging methodology provides a step-by-step troubleshooting framework and a production-ready checklist. Targeting both beginners and practitioners, this guide aims to transform prompt writing from "casual conversation" into a structured engineering discipline.
