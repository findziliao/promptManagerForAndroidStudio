import { codeReviewPrompt } from './code-review';
import { codeOptimizationPrompt } from './code-optimization';
import {
  goExpertPrompt,
  pythonExpertPrompt,
  vueExpertPrompt,
  reactExpertPrompt,
  devOpsExpertPrompt
} from './expert-roles';
import { codeDebugPrompt } from './code-debug';

export {
  codeReviewPrompt,
  codeOptimizationPrompt,
  goExpertPrompt,
  pythonExpertPrompt,
  vueExpertPrompt,
  reactExpertPrompt,
  devOpsExpertPrompt,
  codeDebugPrompt
};

export const codingPrompts = [
  codeReviewPrompt,
  codeOptimizationPrompt,
  goExpertPrompt,
  pythonExpertPrompt,
  vueExpertPrompt,
  reactExpertPrompt,
  devOpsExpertPrompt,
  codeDebugPrompt
] as const; 