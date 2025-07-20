import { PromptItem } from '../../../types';
import { emperorPrompt } from './emperor';

// 其他类型的示例提示
export const otherPrompts: PromptItem[] = [
  emperorPrompt,
  {
    id: "2",
    title: "生活建议",
    content: "请给我提供关于{主题}的生活建议，包括实用技巧、注意事项和可能的解决方案。",
    categoryId: "other",
    tags: ["生活", "建议", "日常"]
  },
  {
    id: "3",
    title: "旅行计划助手",
    content: "我计划去{目的地}旅行{天数}天，请帮我制定一份详细的旅行计划，包括必去景点、美食推荐、交通建议和注意事项。",
    categoryId: "other",
    tags: ["旅行", "计划", "旅游"]
  },
  {
    id: "4",
    title: "健康饮食建议",
    content: "我想改善我的饮食习惯，请根据{目标}（如减重、增肌、均衡营养等）给我提供一周的健康饮食计划和建议。",
    categoryId: "other",
    tags: ["健康", "饮食", "营养"]
  }
]; 