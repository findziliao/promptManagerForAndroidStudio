import { xaiAniChinesePrompt } from './xai-ani-chinese';
import { xaiAniEnglishPrompt } from './xai-ani-english';

export { xaiAniChinesePrompt, xaiAniEnglishPrompt };

export const llmPrompts = [
  xaiAniChinesePrompt,
  xaiAniEnglishPrompt
] as const;