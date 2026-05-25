---
title: 从零用 Claude API 搭建真实应用
description: 手把手教你从 API 认证开始，搭建一个生产可用的 AI 摘要工具，涵盖流式输出、工具调用、错误处理和 Vercel 部署全流程。
contentType: tutorial
publishedAt: 2026-05-25
tags:
  - Claude API
  - AI 开发
  - 教程
  - Python
draft: true
ogImage: /og-default.png
difficultyLevel: intermediate
prerequisites:
  - 基础 Python 编程
  - 了解 HTTP/REST API 概念
  - 有 Anthropic 账号（免费注册）
stepCount: 6
toolchain:
  - Python 3.11+
  - anthropic SDK
  - FastAPI
  - Vercel
---

> 本文从零开始，带你用 Claude API 搭建一个真实可用的 **智能摘要服务**。你会看到完整的代码，以及为什么要这样写。

---

## 第一步：环境准备与 API 认证

### 安装依赖

```bash
pip install anthropic fastapi uvicorn python-dotenv
```

### 配置 API Key

前往 [console.anthropic.com](https://console.anthropic.com) 创建 API Key，然后在项目根目录创建 `.env` 文件：

```bash
ANTHROPIC_API_KEY=sk-ant-api03-xxxxxxxx
```

> **安全提示**：永远不要把 API Key 硬编码在代码里或提交到 Git。把 `.env` 加入 `.gitignore`。

### 第一个 API 调用

先写最简单的调用，验证连通性：

```python
# test_connection.py
import anthropic
from dotenv import load_dotenv

load_dotenv()

client = anthropic.Anthropic()  # 自动读取 ANTHROPIC_API_KEY 环境变量

message = client.messages.create(
    model="claude-opus-4-7",
    max_tokens=1024,
    messages=[
        {"role": "user", "content": "用一句话解释什么是大语言模型。"}
    ]
)

print(message.content[0].text)
```

运行：

```bash
python test_connection.py
# 输出类似：大语言模型是一种通过海量文本数据训练的 AI 系统，能够理解和生成自然语言。
```

### 模型选择

Anthropic 提供三个层级的模型，根据任务复杂度和成本权衡选择：

| 模型 | 适用场景 | 速度 | 成本 |
|------|---------|------|------|
| `claude-haiku-4-5` | 分类、摘要、简单问答 | 最快 | 最低 |
| `claude-sonnet-4-6` | 代码生成、复杂推理 | 中等 | 中等 |
| `claude-opus-4-7` | 深度分析、创意写作 | 最慢 | 最高 |

对于摘要服务，`claude-haiku-4-5` 通常够用，成本比 Opus 低 20 倍以上。

---

## 第二步：搭建摘要服务的核心逻辑

### 设计 System Prompt

好的 System Prompt 决定输出质量的上限。我们给摘要助手设计一个清晰的角色定义：

```python
SUMMARIZER_SYSTEM_PROMPT = """你是一个专业的内容摘要助手。
你的任务是将用户提供的文章或文本，压缩成清晰、准确的摘要。

规则：
1. 摘要长度约为原文的 10%–20%，最多 300 字
2. 保留关键数据、核心论点和重要结论
3. 使用原文的语言（中文原文→中文摘要，英文原文→英文摘要）
4. 不添加原文没有的信息，不发表主观评价
5. 使用简洁的要点格式输出"""
```

### 摘要函数

```python
# summarizer.py
import anthropic
from dotenv import load_dotenv

load_dotenv()

client = anthropic.Anthropic()

SUMMARIZER_SYSTEM_PROMPT = """你是一个专业的内容摘要助手。
你的任务是将用户提供的文章或文本，压缩成清晰、准确的摘要。

规则：
1. 摘要长度约为原文的 10%–20%，最多 300 字
2. 保留关键数据、核心论点和重要结论
3. 使用原文的语言
4. 不添加原文没有的信息
5. 使用简洁的要点格式输出"""


def summarize(text: str, model: str = "claude-haiku-4-5") -> str:
    """对输入文本生成摘要，返回摘要字符串。"""
    if len(text.strip()) < 100:
        raise ValueError("输入文本过短，至少需要 100 个字符")

    message = client.messages.create(
        model=model,
        max_tokens=512,
        system=SUMMARIZER_SYSTEM_PROMPT,
        messages=[
            {"role": "user", "content": f"请为以下内容生成摘要：\n\n{text}"}
        ]
    )
    return message.content[0].text
```

---

## 第三步：流式输出（Streaming）

对于较长的摘要，用户等待时间可能超过 5 秒。流式输出让内容像打字一样逐字呈现，显著提升体验：

```python
# streaming_summarizer.py
import anthropic
from typing import Iterator

client = anthropic.Anthropic()


def summarize_stream(text: str) -> Iterator[str]:
    """流式生成摘要，逐块 yield 文本片段。"""
    with client.messages.stream(
        model="claude-haiku-4-5",
        max_tokens=512,
        system=SUMMARIZER_SYSTEM_PROMPT,
        messages=[
            {"role": "user", "content": f"请为以下内容生成摘要：\n\n{text}"}
        ]
    ) as stream:
        for text_chunk in stream.text_stream:
            yield text_chunk


# 命令行测试
if __name__ == "__main__":
    sample = """
    人工智能在 2024 年迎来了多项重要突破。大型语言模型的能力持续提升，
    不仅能够处理复杂的推理任务，还展现出跨模态理解能力。与此同时，
    模型的运行成本大幅下降，使得 AI 应用的商业化变得更加可行。
    开发者生态也在快速扩张，各类 AI 框架和工具层出不穷，
    降低了构建智能应用的技术门槛。
    """
    for chunk in summarize_stream(sample):
        print(chunk, end="", flush=True)
    print()
```

---

## 第四步：工具调用（Tool Use）

工具调用让 Claude 能够在需要时主动调用你定义的函数，实现「思考→行动→再思考」的循环。下面我们为摘要服务加上**自动提取关键词**的能力：

```python
# tool_use_summarizer.py
import anthropic
import json

client = anthropic.Anthropic()

# 定义工具
tools = [
    {
        "name": "extract_keywords",
        "description": "从文本中提取最重要的关键词，用于 SEO 和标签生成",
        "input_schema": {
            "type": "object",
            "properties": {
                "keywords": {
                    "type": "array",
                    "items": {"type": "string"},
                    "description": "关键词列表，3-8 个"
                },
                "category": {
                    "type": "string",
                    "description": "文章主要分类，如「技术」「金融」「健康」"
                }
            },
            "required": ["keywords", "category"]
        }
    }
]


def analyze_content(text: str) -> dict:
    """
    分析文本，返回摘要 + 关键词 + 分类。
    使用工具调用让 Claude 在生成摘要的同时提取结构化信息。
    """
    messages = [
        {
            "role": "user",
            "content": f"""请完成两件事：
1. 为以下文章生成简洁摘要（100-200字）
2. 使用 extract_keywords 工具提取关键词和分类

文章内容：
{text}"""
        }
    ]

    extracted_data = {}
    summary = ""

    # 第一轮：让 Claude 生成摘要并决定是否调用工具
    response = client.messages.create(
        model="claude-haiku-4-5",
        max_tokens=1024,
        tools=tools,
        messages=messages
    )

    # 处理响应：可能包含文本和工具调用
    for block in response.content:
        if block.type == "text":
            summary = block.text
        elif block.type == "tool_use" and block.name == "extract_keywords":
            extracted_data = block.input

    # 如果 Claude 请求使用工具，返回工具结果并继续对话
    if response.stop_reason == "tool_use":
        messages.append({"role": "assistant", "content": response.content})
        messages.append({
            "role": "user",
            "content": [
                {
                    "type": "tool_result",
                    "tool_use_id": next(
                        b.id for b in response.content if b.type == "tool_use"
                    ),
                    "content": json.dumps(extracted_data, ensure_ascii=False)
                }
            ]
        })

        # 第二轮：让 Claude 完成剩余任务
        final_response = client.messages.create(
            model="claude-haiku-4-5",
            max_tokens=512,
            tools=tools,
            messages=messages
        )
        for block in final_response.content:
            if block.type == "text":
                summary = block.text

    return {
        "summary": summary,
        "keywords": extracted_data.get("keywords", []),
        "category": extracted_data.get("category", "未分类")
    }
```

---

## 第五步：错误处理与生产加固

API 调用不可能永远成功。下面是生产环境必须处理的几类错误：

```python
# robust_client.py
import anthropic
import time
import logging
from typing import Optional

logger = logging.getLogger(__name__)

client = anthropic.Anthropic()


def summarize_with_retry(
    text: str,
    max_retries: int = 3,
    model: str = "claude-haiku-4-5"
) -> Optional[str]:
    """
    带重试逻辑的摘要函数。
    - RateLimitError：等待后重试（指数退避）
    - APIStatusError：区分 4xx（不重试）和 5xx（重试）
    - APIConnectionError：网络问题，直接重试
    """
    for attempt in range(max_retries):
        try:
            message = client.messages.create(
                model=model,
                max_tokens=512,
                system=SUMMARIZER_SYSTEM_PROMPT,
                messages=[
                    {"role": "user", "content": f"请摘要：\n\n{text}"}
                ]
            )
            return message.content[0].text

        except anthropic.RateLimitError as e:
            wait_time = (2 ** attempt) * 5  # 5s, 10s, 20s
            logger.warning(f"Rate limit hit, retrying in {wait_time}s... (attempt {attempt + 1})")
            time.sleep(wait_time)

        except anthropic.APIStatusError as e:
            if e.status_code >= 500:
                # 服务端错误，值得重试
                logger.error(f"Server error {e.status_code}, retrying...")
                time.sleep(2 ** attempt)
            else:
                # 客户端错误（400、401、404 等），不重试
                logger.error(f"Client error {e.status_code}: {e.message}")
                raise

        except anthropic.APIConnectionError as e:
            logger.warning(f"Connection error, retrying... ({e})")
            time.sleep(1)

    logger.error(f"All {max_retries} retries exhausted")
    return None
```

### 输入长度限制

Claude 的上下文窗口有限（claude-haiku-4-5 支持 200K token，约 15 万汉字）。对于超长文档，先分段处理：

```python
def chunk_and_summarize(text: str, chunk_size: int = 3000) -> str:
    """将长文本切分后分别摘要，再合并成最终摘要。"""
    # 按句子边界切分，避免截断语义
    sentences = text.split("。")
    chunks, current = [], ""

    for sentence in sentences:
        if len(current) + len(sentence) > chunk_size:
            if current:
                chunks.append(current)
            current = sentence + "。"
        else:
            current += sentence + "。"
    if current:
        chunks.append(current)

    # 对每个块生成摘要
    chunk_summaries = [summarize_with_retry(chunk) for chunk in chunks if chunk.strip()]

    # 如果只有一个块，直接返回
    if len(chunk_summaries) == 1:
        return chunk_summaries[0]

    # 否则对摘要集合再次摘要
    combined = "\n\n".join(
        f"第 {i+1} 部分摘要：{s}" for i, s in enumerate(chunk_summaries) if s
    )
    return summarize_with_retry(f"请将以下分段摘要整合成一篇连贯的总结：\n\n{combined}")
```

---

## 第六步：用 FastAPI 包装成服务并部署到 Vercel

### FastAPI 应用

```python
# main.py
from fastapi import FastAPI, HTTPException
from fastapi.responses import StreamingResponse
from pydantic import BaseModel, field_validator
from summarizer import summarize_with_retry, summarize_stream

app = FastAPI(title="AI 摘要服务", version="1.0.0")


class SummarizeRequest(BaseModel):
    text: str
    model: str = "claude-haiku-4-5"
    stream: bool = False

    @field_validator("text")
    @classmethod
    def text_must_be_long_enough(cls, v: str) -> str:
        if len(v.strip()) < 100:
            raise ValueError("文本至少需要 100 个字符")
        return v


@app.post("/summarize")
async def summarize_endpoint(req: SummarizeRequest):
    if req.stream:
        # 流式响应
        def generate():
            for chunk in summarize_stream(req.text):
                yield chunk
        return StreamingResponse(generate(), media_type="text/plain; charset=utf-8")

    # 普通响应
    result = summarize_with_retry(req.text, model=req.model)
    if result is None:
        raise HTTPException(status_code=503, detail="摘要服务暂时不可用，请稍后重试")
    return {"summary": result}


@app.get("/health")
async def health():
    return {"status": "ok"}
```

本地运行：

```bash
uvicorn main:app --reload
# 访问 http://localhost:8000/docs 查看交互式 API 文档
```

测试：

```bash
curl -X POST http://localhost:8000/summarize \
  -H "Content-Type: application/json" \
  -d '{"text": "（粘贴你的长文本）"}'
```

### 部署到 Vercel

1. 在项目根目录创建 `vercel.json`：

```json
{
  "builds": [{ "src": "main.py", "use": "@vercel/python" }],
  "routes": [{ "src": "/(.*)", "dest": "main.py" }]
}
```

2. 在 `requirements.txt` 中列出依赖：

```
anthropic>=0.40.0
fastapi>=0.115.0
uvicorn>=0.32.0
python-dotenv>=1.0.0
```

3. 部署：

```bash
vercel --prod
```

4. 在 Vercel Dashboard 的 **Settings → Environment Variables** 中添加 `ANTHROPIC_API_KEY`。

---

## 总结

通过这篇教程，你已经从零构建了一个生产级 AI 摘要服务，掌握了以下核心技能：

| 能力 | 关键点 |
|------|--------|
| **API 认证** | 环境变量管理 Key，避免泄露 |
| **模型选择** | Haiku 做轻量任务，Opus 做复杂分析 |
| **流式输出** | `client.messages.stream()` 提升用户体验 |
| **工具调用** | 定义 schema，处理两轮对话循环 |
| **错误处理** | 区分 4xx/5xx，指数退避重试 |
| **长文档处理** | 分块摘要再聚合 |
| **服务化部署** | FastAPI + Vercel 快速上线 |

**下一步建议**：
- 加入 **Prompt Caching**（`cache_control` 参数），对固定 System Prompt 节省 90% Token 消耗
- 接入数据库（如 Supabase）持久化摘要历史
- 用 `claude-opus-4-7` 替换摘要模型，处理需要深度理解的专业文档

完整代码已开源，可在 GitHub 搜索 `peterclaw-claude-api-tutorial` 获取。
