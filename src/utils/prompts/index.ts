import { codingPrompts, codeReviewPrompt, codeOptimizationPrompt } from './coding';
import { writingPrompts, techDocPrompt } from './writing';
import { generalPrompts, problemAnalysisPrompt } from './general';
import { scanPrompts } from './autoLoader';

export {
  // Coding
  codeReviewPrompt,
  codeOptimizationPrompt,
  // Writing
  techDocPrompt,
  // General
  problemAnalysisPrompt,
};

// 自动扫描并加载所有 prompts
const autoLoadedPrompts = scanPrompts(__dirname);

// 合并自动加载的 prompts 和显式导入的 prompts
export const defaultPrompts = [
  ...autoLoadedPrompts,
  // 为了确保关键 prompts 一定存在，显式包含它们
  ...codingPrompts,
  ...writingPrompts,
  ...generalPrompts,
] as const;