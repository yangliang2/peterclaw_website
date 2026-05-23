---
title: 内容架构：博客与知识库双轨
description: PeterClaw 网站的内容系统以博客承载叙事，以知识库沉淀可复用方法。
locale: zh
publishedAt: 2026-05-23
tags:
  - 内容架构
  - i18n
  - Astro
area: architecture
draft: false
---

PeterClaw 的内容分为两条轨道：

- 博客：发布观点、项目进展、AI 小队组建日记和阶段复盘。
- 知识库：沉淀稳定方法、协作协议、技术决策和可复用模板。

每篇内容都必须声明 `locale`、`publishedAt`、`description` 和 `tags`，以便后续接入 SEO、RSS、站内检索和多平台分发。
