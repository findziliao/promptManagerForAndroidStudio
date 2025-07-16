import { codeReviewPrompt } from './code-review';
import { codeOptimizationPrompt } from './code-optimization';
import {
  goExpertPrompt,
  pythonExpertPrompt,
  vueExpertPrompt,
  reactExpertPrompt,
  devOpsExpertPrompt
} from './expert-roles';

export {
  codeReviewPrompt,
  codeOptimizationPrompt,
  goExpertPrompt,
  pythonExpertPrompt,
  vueExpertPrompt,
  reactExpertPrompt,
  devOpsExpertPrompt
};

export const codingPrompts = [
  codeReviewPrompt,
  codeOptimizationPrompt,
  goExpertPrompt,
  pythonExpertPrompt,
  vueExpertPrompt,
  reactExpertPrompt,
  devOpsExpertPrompt
] as const; 