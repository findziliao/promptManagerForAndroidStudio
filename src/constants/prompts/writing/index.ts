import { techDocPrompt } from './tech-doc';
import { englishToChinesePrompt, chineseToEnglishPrompt } from './translation';

export { techDocPrompt, englishToChinesePrompt, chineseToEnglishPrompt };

export const writingPrompts = [
  techDocPrompt,
  englishToChinesePrompt,
  chineseToEnglishPrompt,
] as const;