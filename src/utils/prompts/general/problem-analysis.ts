export const problemAnalysisPrompt = {
  id: "sample-3",
  title: "问题分析",
  content: `请帮我分析以下问题：

问题描述：[描述问题]

请从以下角度进行分析：
1. 问题的根本原因
2. 可能的解决方案
3. 每个方案的优缺点
4. 推荐的最佳解决方案
5. 实施建议和注意事项`,
  description: "问题分析的标准",
  categoryId: "general",
  tags: ["分析", "问题", "解决方案"],
} as const; 