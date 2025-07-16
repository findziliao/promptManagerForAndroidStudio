import { codingPrompts, codeReviewPrompt, codeOptimizationPrompt, codeDebugPrompt } from './coding';
import { writingPrompts, techDocPrompt } from './writing';
import { generalPrompts, problemAnalysisPrompt } from './general';
import { scanPrompts, scanCategories } from './autoLoader';

export {
  // Coding
  codeReviewPrompt,
  codeOptimizationPrompt,
  codeDebugPrompt,
  // Writing
  techDocPrompt,
  // General
  problemAnalysisPrompt,
};

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
] as const;

// 导出自动加载的分类
export const defaultCategories = autoLoadedCategories;