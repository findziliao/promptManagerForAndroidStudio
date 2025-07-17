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
import { codeDrawInfraPrompt } from "./code-draw-infra";

export {
  codeReviewPrompt,
  codeOptimizationPrompt,
  goExpertPrompt,
  pythonExpertPrompt,
  vueExpertPrompt,
  reactExpertPrompt,
  devOpsExpertPrompt,
  codeDebugPrompt,
  codeDrawInfraPrompt
};

export const codingPrompts = [
  codeReviewPrompt,
  codeOptimizationPrompt,
  goExpertPrompt,
  pythonExpertPrompt,
  vueExpertPrompt,
  reactExpertPrompt,
  devOpsExpertPrompt,
  codeDebugPrompt,
  codeDrawInfraPrompt
] as const; 