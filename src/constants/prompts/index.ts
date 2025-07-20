import { codingPrompts } from './coding';
import { writingPrompts } from './writing';
import { generalPrompts } from './general';
import { uidesignPrompts } from './uidesign';
import { llmPrompts } from './llm';
import { otherPrompts } from './other';
import { scanPrompts, scanCategories } from './autoLoader';

// 自动扫描并加载所有 prompts 和分类
const autoLoadedPrompts = scanPrompts(__dirname);
const autoLoadedCategories = scanCategories(__dirname);

// 合并自动加载的 prompts 和显式导入的 prompts
export const defaultPrompts = [
  ...autoLoadedPrompts,
  // 为了确保关键 prompts 一定存在，显式包含它们
  ...codingPrompts,
  ...writingPrompts,
  ...generalPrompts,
  ...uidesignPrompts,
  ...llmPrompts,
  ...otherPrompts,
] as const;

// 导出自动加载的分类
export const defaultCategories = autoLoadedCategories;