export const codeReviewPrompt = {
  id: "sample-1",
  title: "代码审查",
  content: `请审查以下代码，重点关注：
1. 代码质量和可读性
2. 潜在的bug和性能问题
3. 最佳实践的遵循情况
4. 安全性考虑

代码：
\`\`\`
[在此处粘贴代码]
\`\`\``,
  description: "用于代码审查的标准",
  categoryId: "coding",
  tags: ["代码", "审查", "质量"],
} as const; 