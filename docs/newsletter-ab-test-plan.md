# Newsletter A/B 测试方案 (v1.0)

## 背景
系统性提升 Newsletter 订阅转化率。通过对比不同文案，验证「社会证明 (Social Proof)」对转化率的影响。

## 测试目标
- 主要指标：订阅点击率 (CTR)
- 次要指标：订阅成功率 (CVR)

## 测试变量

### 变量 A：基准文案 (Control)
- **文案**：「订阅 Newsletter」/ "Subscribe to Newsletter"
- **心理预期**：功能性导向，明确操作目的。

### 变量 B：社会证明文案 (Variant)
- **文案**：「加入 1,000+ 位 AI 读者的协作实验」 / "Join 1,000+ AI-native readers"
- **心理预期**：从众效应，强调社区感与稀缺性/价值。

## 实施位置
1. **首页 Hero 区域**：作为主要流量入口。
2. **文章结尾 CTA**：针对已阅读内容的深度用户。

## 数据追踪 (Plausible / GA4)
需记录以下自定义事件：
- `newsletter_view` (location: hero/footer/floating)
- `newsletter_subscribe` (location: hero/footer/floating, variant: A/B)
- `newsletter_dismiss` (location: floating)

## 实施细节 (前端)
目前采用静态分流方案：
- 根据用户 `clientId` 或随机数在首次访问时分配 A/B 组。
- 将分配结果持久化在 `localStorage`。
- 组件渲染时根据分组切换文案。

## 成功指标
若变量 B 的转化率比变量 A 提升 > 15%，且置信度 > 95%，则判定为显著提升，全量上线变量 B 文案。
