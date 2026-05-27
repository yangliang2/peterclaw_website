# Buttondown Webhook 自动化探索指南

> 目标：在 Buttondown 发布 Newsletter 时，自动触发多平台内容分发通知
> 维护者：Kimi 1号（内容策略）
> 最后更新：2026-05-28

---

## 1. 场景定义

当前工作流：
1. 网站文章发布（Astro build + deploy）
2. 人工复制到各平台（微信、知乎、掘金、V2EX、少数派）
3. 人工发送 Newsletter

理想工作流：
1. 网站文章发布
2. **Buttondown Webhook 自动触发通知**
3. 各平台收到通知后，人工（或半自动）完成适配发布
4. Newsletter 与网站同步发出

**Webhook 能解决什么**：
- 在 Newsletter 发出时，自动向 Slack/Discord/企业微信发送「新文章已发布，请分发」提醒
- 自动将文章元数据（标题、链接、摘要、标签）推送到待办系统
- 为未来的全自动化分发提供触发器

**Webhook 不能解决什么**：
- 微信公众号排版（无开放 API）
- 少数派审核流程（必须人工）
- 各平台内容适配（仍需人工或 LLM 改写）

---

## 2. Buttondown Webhook 能力盘点

Buttondown 提供以下 [Webhook 事件](https://buttondown.com/docs/webhooks)：

| 事件名 | 触发时机 | 对我们是否有用 |
|--------|----------|----------------|
| `email.published` | Newsletter 正式发布时 | **核心事件** — 可作为分发触发器 |
| `email.scheduled` | Newsletter 被定时时 | 有用 — 可提前准备分发素材 |
| `email.drafted` | Newsletter 保存为草稿时 | 一般 — 可用于预览 |
| `subscriber.created` | 新订阅者加入时 | 低 — 与分发无关 |
| `subscriber.unsubscribed` | 订阅者退订时 | 低 — 与分发无关 |
| `subscriber.complained` | 订阅者投诉时 | 中 — 可用于质量监控 |

### 2.1 `email.published` 事件 Payload 示例

```json
{
  "event": "email.published",
  "data": {
    "id": "email-uuid",
    "subject": "AI 小队组建日记 Vol.8：Vibe Coding 实战",
    "body": "<html>...</html>",
    "published_at": "2026-05-25T10:00:00Z",
    "canonical_url": "https://newsletter.peterclaw.com/archive/xxx",
    "tags": ["AI 小队", "Vibe Coding"],
    "metadata": {
      "source_url": "https://peterclaw.com/zh/blog/ai-diary-005-vibe-coding/"
    }
  }
}
```

**关键字段**：
- `subject` → 可作为各平台标题参考
- `canonical_url` → Newsletter 归档链接
- `metadata.source_url` → **网站原文链接，分发的核心资产**

---

## 3. 推荐 Webhook 集成方案

### 方案 A：Webhook → Slack/Discord 通知（推荐优先实施）

**架构**：
```
Buttondown ──Webhook──> 中间服务（Vercel Serverless / Cloudflare Workers）
                              │
                              ▼
                    Slack / Discord / 企业微信 Bot
                              │
                              ▼
                    人工收到通知 → 执行 30 分钟分发流程
```

**实现步骤**：
1. 在 Buttondown 后台设置 Webhook URL（`https://api.peterclaw.com/webhooks/buttondown`）
2. 创建 Vercel Serverless Function 接收 Webhook
3. 解析 `email.published` 事件，提取 `subject` 和 `metadata.source_url`
4. 格式化消息推送到 Slack `#content-distribution` 频道

**消息模板**：
```markdown
🚀 新文章已发布，请执行跨平台分发

标题：{{email.subject}}
原文：{{email.metadata.source_url}}
Newsletter：{{email.canonical_url}}
标签：{{email.tags | join: ", "}}

分发清单：
- [ ] 掘金（约 5 分钟）
- [ ] 知乎（约 5 分钟）
- [ ] 少数派（约 5 分钟，需审核）
- [ ] V2EX（约 3 分钟）
- [ ] 微信公众号（约 10 分钟，需排版）

模板文件：
- 掘金：`docs/content-templates/juejin.md`
- V2EX：`docs/content-templates/v2ex.md`
- 少数派：`docs/content-templates/sspai.md`
- 微信/知乎：`docs/chinese-content-distribution-sop.md`
```

**优点**：
- 实现简单（1–2 小时开发）
- 零平台 API 依赖
- 人工仍可控，风险低

**缺点**：
- 仍需人工执行分发
- 不能自动发布到任何平台

### 方案 B：Webhook → 自动化待办创建

**架构**：
```
Buttondown ──Webhook──> Vercel Function
                              │
                              ▼
                    Notion API / Todoist API / Linear API
                              │
                              ▼
                    创建「分发任务」卡片，带文章元数据
```

**实现步骤**：
1. 接收 `email.published` Webhook
2. 调用 Notion API，在「内容分发」数据库创建新条目
3. 填充字段：标题、原文链接、Newsletter 链接、标签、状态=待分发
4. 可设置截止日期 = 发布当天

**Notion 数据库模板**：
| 标题 | 原文链接 | Newsletter 链接 | 掘金 | 知乎 | V2EX | 少数派 | 微信 | 状态 | 截止日期 |
|------|----------|-----------------|------|------|------|--------|------|------|----------|
| AI 日记 Vol.8 | https://... | https://... | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | 待分发 | 2026-05-25 |

**优点**：
- 分发进度可追踪
- 历史数据可复盘
- 可与其他工作流集成

**缺点**：
- 需维护 Notion/Linear 集成
- 仍需人工执行

### 方案 C：Webhook → 半自动内容生成（未来扩展）

**架构**：
```
Buttondown ──Webhook──> Vercel Function
                              │
                              ├── 调用 LLM API（Claude / Kimi / OpenAI）
                              │       ├── 生成掘金适配版 Markdown
                              │       ├── 生成 V2EX 摘要帖
                              │       └── 生成知乎标题变体
                              │
                              └── 推送结果到 Slack + 保存到 Git
```

**前提条件**：
- 网站原文 Markdown 可通过 `source_url` 获取
- LLM API 已集成到工作流
- 有 Git 机器人可自动提交生成的素材到 `docs/distribution-samples/`

**当前状态**：
- ⬜ 未实施，标记为 P2 优先级
- 依赖 `scripts/export-content.mjs` 流水线完成

---

## 4. 技术实现草稿

### 4.1 Vercel Serverless Function 示例

文件：`api/webhooks/buttondown.ts`

```typescript
import type { VercelRequest, VercelResponse } from '@vercel/node';

interface ButtondownEmailPayload {
  event: 'email.published' | 'email.scheduled' | 'email.drafted';
  data: {
    id: string;
    subject: string;
    body: string;
    published_at: string;
    canonical_url: string;
    tags: string[];
    metadata?: {
      source_url?: string;
    };
  };
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // 1. 验证 Webhook 签名（Buttondown 提供签名头）
  const signature = req.headers['buttondown-signature'] as string;
  if (!verifySignature(req.body, signature, process.env.BUTTONDOWN_WEBHOOK_SECRET!)) {
    return res.status(401).json({ error: 'Invalid signature' });
  }

  const payload: ButtondownEmailPayload = req.body;

  // 2. 只处理 email.published 事件
  if (payload.event !== 'email.published') {
    return res.status(200).json({ ignored: true, event: payload.event });
  }

  const { subject, canonical_url, metadata, tags } = payload.data;
  const sourceUrl = metadata?.source_url;

  // 3. 发送 Slack 通知
  await sendSlackNotification({
    subject,
    sourceUrl,
    newsletterUrl: canonical_url,
    tags,
  });

  // 4. （可选）创建 Notion 任务
  await createNotionTask({
    subject,
    sourceUrl,
    newsletterUrl: canonical_url,
    tags,
  });

  return res.status(200).json({ success: true });
}

// 伪代码：签名验证
function verifySignature(body: string, signature: string, secret: string): boolean {
  // 使用 crypto.createHmac('sha256', secret).update(body).digest('hex')
  // 与 signature 比较
  return true; // TODO: 实现真实验证
}

// 伪代码：Slack 通知
async function sendSlackNotification(data: {
  subject: string;
  sourceUrl?: string;
  newsletterUrl: string;
  tags: string[];
}) {
  const message = {
    text: `🚀 新文章已发布：${data.subject}`,
    blocks: [
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `*${data.subject}*\n原文：${data.sourceUrl || '未设置'}\nNewsletter：${data.newsletterUrl}\n标签：${data.tags.join(', ')}`,
        },
      },
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: '分发清单：\n- [ ] 掘金\n- [ ] 知乎\n- [ ] 少数派\n- [ ] V2EX\n- [ ] 微信公众号',
        },
      },
    ],
  };

  await fetch(process.env.SLACK_WEBHOOK_URL!, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(message),
  });
}

// 伪代码：Notion 任务创建
async function createNotionTask(data: {
  subject: string;
  sourceUrl?: string;
  newsletterUrl: string;
  tags: string[];
}) {
  // 调用 Notion API 创建数据库条目
  // 需配置 NOTION_TOKEN 和 NOTION_DATABASE_ID
}
```

### 4.2 环境变量配置

```bash
# .env.local（开发）/ Vercel Dashboard（生产）
BUTTONDOWN_WEBHOOK_SECRET=whsec_xxx
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/xxx/xxx/xxx
NOTION_TOKEN=secret_xxx
NOTION_DATABASE_ID=database-uuid
```

### 4.3 Buttondown 后台配置

1. 登录 [Buttondown Settings → Webhooks](https://buttondown.com/settings/webhooks)
2. 添加 Webhook URL：`https://peterclaw.com/api/webhooks/buttondown`
3. 选择事件：`email.published`
4. 保存并测试（Buttondown 提供 Test Payload 功能）

---

## 5. 实施路线图

| 阶段 | 任务 | 预计工时 | 前置条件 |
|------|------|----------|----------|
| **Phase 1** | 创建 Vercel API 路由 + Slack 通知 | 2h | Slack Webhook URL |
| **Phase 1** | Buttondown 后台配置 Webhook | 15min | API 路由部署完成 |
| **Phase 1** | 撰写本文档并合并到主分支 | 30min | 代码 review 通过 |
| **Phase 2** | 接入 Notion 任务自动创建 | 2h | Notion Integration Token |
| **Phase 2** | 在 Slack 消息中加入模板文件链接 | 30min | Phase 1 完成 |
| **Phase 3** | 探索 LLM 自动内容改写 + Git 提交 | 4h | `scripts/export-content.mjs` 完成 |
| **Phase 3** | 接入掘金 API 自动发布 | 3h | 掘金开发者账号 + API Key |
| **Phase 3** | 接入 V2EX API 自动发帖 | 2h | V2EX API Token |

**当前建议**：先完成 Phase 1（Webhook → Slack 通知），将「文章已发布」这一事件从「人记得去发」变成「系统提醒人去做」。这是 ROI 最高的第一步。

---

## 6. 风险与注意事项

1. **Webhook 可靠性**：Buttondown Webhook 不保证 100% 送达，需做好幂等处理和失败重试
2. **签名验证**：生产环境必须验证 Webhook 签名，防止伪造请求
3. **敏感信息**：`BUTTONDOWN_WEBHOOK_SECRET` 和 `SLACK_WEBHOOK_URL` 不可提交到 Git
4. **定时发布**：如果 Newsletter 是定时发送，`email.scheduled` 事件可提前触发准备，但最终以 `email.published` 为准
5. **调试成本**：Webhook 调试需要公网可访问的 URL，建议使用 Vercel Preview Deployment + Buttondown Test Payload
