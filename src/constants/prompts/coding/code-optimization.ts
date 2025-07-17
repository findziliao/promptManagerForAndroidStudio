export const codeOptimizationPrompt = {
  id: "sample-4",
  title: "代码优化",
  content: `请优化以下代码，重点关注：
1. 代码质量和可读性
2. 潜在的bug和性能问题
3. 最佳实践的遵循情况
4. 安全性考虑

代码：
\`\`\`
[在此处粘贴代码]
\`\`\``,
  description: "用于代码优化的标准",
  categoryId: "coding",
  tags: ["分析", "问题", "解决方案"],
} as const; 