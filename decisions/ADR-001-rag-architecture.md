# ADR-001: AI RAG 站内问答架构选型

**状态**: 已采纳  
**日期**: 2026-05-25  
**作者**: Claude 1号  

---

## 背景

PeterClaw 个人站点（Astro + Vercel 部署）需要一个 AI 问答组件，让访客可以用自然语言询问站点内容，如"你写过哪些 MCP 相关文章"。核心技术挑战：如何在现有 Vercel 静态托管栈上低成本地实现向量检索 + LLM 生成。

---

## 方案对比

### 方案 A：Cloudflare Workers AI + Vectorize + Astro API Route

**描述**：将向量化和推理全部托管在 Cloudflare 平台，利用其原生 AI 能力。

| 项目 | 评估 |
|------|------|
| 嵌入模型 | `@cf/baai/bge-small-en-v1.5`（Workers AI） |
| 向量存储 | Cloudflare Vectorize |
| LLM | `@cf/meta/llama-3-8b-instruct` 或 OpenAI |
| 部署平台要求 | **需迁移至 Cloudflare Pages** |
| 写入成本 | Vectorize 免费额度：100k 向量/月 |
| 查询成本 | Workers AI 免费额度：10k 请求/天 |

**优势**：平台原生集成，延迟低，与 Cloudflare 收购 Astro 后的方向契合。  
**劣势**：**当前站点部署在 Vercel**，迁移成本高，需要重新配置 CI/CD、域名、边缘缓存规则。短期内不可行。

---

### 方案 B：OpenAI Embeddings + Supabase pgvector + Vercel Edge Function

**描述**：使用 OpenAI 生成嵌入，pgvector 持久化存储，Vercel Edge 函数处理查询。

| 项目 | 评估 |
|------|------|
| 嵌入模型 | `text-embedding-3-small`（OpenAI） |
| 向量存储 | Supabase pgvector |
| LLM | OpenAI `gpt-4o-mini` |
| 月均成本估算 | Supabase Free Tier（500MB）+ OpenAI ~$0.50/月 |
| 运维复杂度 | 需维护 Supabase 实例、数据库 schema、连接池 |

**优势**：支持动态更新，向量库独立可扩展，适合内容量大的场景。  
**劣势**：引入外部数据库依赖，个人博客规模下过度设计；Supabase 免费层有休眠风险。

---

### 方案 C：静态预生成嵌入 + 客户端相似度搜索

**描述**：构建时生成嵌入并打包为静态 JSON，完全在浏览器端做相似度计算。

| 项目 | 评估 |
|------|------|
| 嵌入模型 | 构建时一次性调用 OpenAI |
| 向量存储 | 静态 JSON 文件（~200-400KB） |
| LLM | **无**（无法在客户端安全调用） |
| 服务器成本 | **零** |

**优势**：零运营成本，无需 API 密钥在客户端暴露。  
**劣势**：无法生成自然语言答案，只能返回相关文章列表，体验差。JSON 文件全量下载影响首屏。

---

## 决策：方案 B+C 混合（静态嵌入 + Vercel 服务端 RAG）

**核心思路**：在构建时生成嵌入（静态化存储），在运行时由 Vercel Serverless Function 执行向量检索和 LLM 生成。无需外部向量数据库。

```
构建时：
  Markdown 内容 → 分块 → OpenAI Embeddings API → src/data/rag-embeddings.json

运行时：
  用户提问 → /api/ask → 嵌入查询词 → 内存余弦相似度检索 → gpt-4o-mini 生成回答 → 流式输出
```

| 项目 | 方案 |
|------|------|
| 嵌入生成 | 构建时一次性，`text-embedding-3-small` |
| 向量检索 | 运行时内存计算（余弦相似度），无外部 DB |
| LLM | `gpt-4o-mini`（流式），仅在查询时调用 |
| 部署 | Vercel Serverless Function（现有基础设施） |
| 运维复杂度 | 极低，只需设置 `OPENAI_API_KEY` 环境变量 |

**成本估算**（月均，个人博客规模）：
- 嵌入构建：~$0.001（仅在内容更新时运行，约 50 个文本块 × 512 维 = 可忽略不计）
- 查询：$0.15/1M tokens（gpt-4o-mini），预计每月 1000 次问答 ≈ **$0.10**
- **月均总成本：< $0.15**

---

## 后续升级路径

当内容量超过 500 篇或需要实时更新时，可无缝迁移至方案 B（Supabase pgvector），API 接口层不变。当站点迁移至 Cloudflare Pages 时，可升级为方案 A 以降低延迟和成本。

---

## 实现文件清单

| 文件 | 职责 |
|------|------|
| `scripts/generate-embeddings.ts` | 构建时内容分块 + 嵌入生成 |
| `src/data/rag-embeddings.json` | 预生成嵌入存储（构建产物） |
| `src/lib/rag.ts` | 余弦相似度等工具函数 |
| `src/pages/api/ask.ts` | Vercel Serverless RAG 端点 |
| `src/components/AskAI.astro` | 浮动对话框 UI 组件 |
