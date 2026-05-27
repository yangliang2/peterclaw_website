# Newsletter 欢迎邮件序列（Buttondown）

本文档说明 PeterClaw Newsletter 的 3 封自动化欢迎邮件序列的实现方式与配置步骤。

---

## 邮件内容

所有邮件文案已预写在仓库中，支持中英文两套：

```
newsletter/welcome-sequence/
├── zh/
│   ├── email-01-welcome.md          # 第 1 封（即时）：欢迎 + 3 篇必读
│   ├── email-02-tool-reviews.md     # 第 2 封（第 3 天）：AI 工具评测系列介绍
│   └── email-03-author-story.md     # 第 3 封（第 7 天）：作者故事 + 订阅者福利预告
└── en/
    ├── email-01-welcome.md
    ├── email-02-tool-reviews.md
    └── email-03-author-story.md
```

每份 Markdown 文件头部包含 `subject` 和 `send_delay`，可直接复制到 Buttondown 的 Sequence/Automation 编辑器中使用。

---

## 技术实现

### 1. 订阅 API (`/api/subscribe`)

当读者在网站提交邮箱时，`POST /api/subscribe` 会：

- 校验邮箱格式
- 记录订阅者的 `locale`（`zh` 或 `en`）和 `source`（`email-signup` / `footer`）
- 通过 Buttondown API 创建订阅者，并打上标签：
  - `locale:zh` / `locale:en`
  - `source:email-signup` / `source:footer`
- 在 `metadata` 中写入 `subscribed_from` 和 `locale`

### 2. Webhook 接收端 (`/api/buttondown-webhook`)

Buttondown 在订阅者发生关键事件时，会向 `POST /api/buttondown-webhook` 推送通知：

| 事件 | 用途 |
|------|------|
| `subscriber.created` | 记录新订阅者的语言与来源，可用于后续 CRM/分析对接 |
| `subscriber.unsubscribed` | 记录退订 |
| `email.opened` / `email.clicked` | 邮件互动追踪 |

可选：在 Vercel 环境变量中配置 `BUTTONDOWN_WEBHOOK_SECRET`，并在 Buttondown Webhook 设置里的 `x-webhook-secret` Header 填入相同值，以验证请求来源。

---

## Buttondown 后台配置步骤

### 步骤 1：创建 Sequence（自动化序列）

1. 登录 [Buttondown](https://buttondown.com)
2. 进入 **Automations → Sequences**
3. 创建新 Sequence，命名为 `Welcome Sequence - zh`
4. 添加 3 封邮件，分别从 `newsletter/welcome-sequence/zh/` 复制主题与正文
   - 第 1 封：Delay = `Immediate`
   - 第 2 封：Delay = `3 days`
   - 第 3 封：Delay = `7 days`
5. 重复上述步骤创建 `Welcome Sequence - en`

### 步骤 2：设置触发条件

Buttondown 目前不支持直接按标签触发不同 Sequence。推荐方案：

**方案 A（推荐）：使用两个 Newsletter**
- 在 Buttondown 创建两个 Newsletter：`PeterClaw (中文)` 和 `PeterClaw (English)`
- 在每个 Newsletter 下分别绑定对应的 Welcome Sequence
- 在网站端根据用户选择的语言，调用对应 Newsletter 的 API Key 订阅（需配置两个 `BUTTONDOWN_API_KEY`）

**方案 B：单一 Newsletter + 手动分流**
- 使用一个 Newsletter，但创建两个 Sequence
- 通过 Webhook 接收 `subscriber.created` 事件，根据 `locale` 标签手动调用 Buttondown API 将订阅者加入对应 Sequence
- 需要额外实现一个自动化服务（如 Vercel Cron + Edge Function）

**方案 C：单一 Sequence + 条件内容**
- 在 Buttondown 中只创建一个 Sequence
- 在邮件正文中使用条件逻辑（Buttondown 支持简单的 `{% if %}` 条件）来展示不同语言内容
- 维护成本较低，但灵活性受限

> **当前项目采用方案 A 作为长期推荐**：网站已支持向 Buttondown 传递 `locale` 标签，只需在 Vercel 环境变量中配置对应语言的 API Key 即可实现完全自动化。

### 步骤 3：配置 Webhook

1. 进入 **Settings → Webhooks**
2. 添加 Webhook URL：`https://peterclaw.com/api/buttondown-webhook`
3. 选择事件：`subscriber.created`, `subscriber.unsubscribed`, `email.opened`, `email.clicked`
4.（可选）在 **Custom Headers** 中添加：
   - `x-webhook-secret`: `<你的 WEBHOOK_SECRET>`
5. 在 Vercel 环境变量中添加 `BUTTONDOWN_WEBHOOK_SECRET`（与上一步一致）

---

## 环境变量清单

| 变量名 | 说明 | 必填 |
|--------|------|------|
| `BUTTONDOWN_API_KEY` | Buttondown API Token | 是 |
| `BUTTONDOWN_WEBHOOK_SECRET` | Webhook 验证密钥 | 否 |

---

## 验收标准

- [x] 三封邮件文案（中英文各一套）已写入仓库
- [x] 订阅 API 自动传递 `locale` 和 `source` 标签
- [x] Webhook 接收端已部署并可接收 Buttondown 事件
- [x] 可通过 Buttondown 后台测试发送每封邮件
