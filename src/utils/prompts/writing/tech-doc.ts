export const techDocPrompt = {
  id: "sample-2",
  title: "技术文档写作",
  content: `请帮我写一份关于 [主题] 的技术文档，包括：
1. 概述和目标
2. 技术架构说明
3. 实现细节
4. 使用示例
5. 注意事项和最佳实践

请确保文档清晰易懂，适合技术人员阅读。`,
  description: "技术文档写作",
  categoryId: "writing",
  tags: ["文档", "技术", "写作"],
  createdAt: new Date(),
  updatedAt: new Date(),
  usageCount: 0,
} as const; 