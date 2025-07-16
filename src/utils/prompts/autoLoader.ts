import { readdirSync, statSync } from 'fs';
import { join } from 'path';
import { PromptItem } from '../../types';

/**
 * 自动扫描并加载指定目录下的所有 prompt 文件
 * @param dir 要扫描的目录路径
 * @returns PromptItem 数组
 */
export function scanPrompts(dir: string): PromptItem[] {
  const prompts: PromptItem[] = [];
  
  try {
    const items = readdirSync(dir);
    
    for (const item of items) {
      const fullPath = join(dir, item);
      const stat = statSync(fullPath);
      
      if (stat.isDirectory()) {
        // 如果是目录，递归扫描
        const subPrompts = scanPrompts(fullPath);
        prompts.push(...subPrompts);
      } else if (
        stat.isFile() && 
        item.endsWith('.ts') && 
        !item.endsWith('.d.ts') && 
        !item.endsWith('index.ts') &&
        !item.endsWith('autoLoader.ts')
      ) {
        // 如果是 TypeScript 文件，尝试导入
        try {
          // eslint-disable-next-line @typescript-eslint/no-var-requires
          const module = require(fullPath);
          Object.values(module).forEach((value: any) => {
            if (
              value && 
              typeof value === 'object' && 
              'title' in value &&
              'content' in value &&
              'id' in value
            ) {
              prompts.push(value as PromptItem);
            }
          });
        } catch (error) {
          console.error(`Error loading prompt file ${fullPath}:`, error);
        }
      }
    }
  } catch (error) {
    console.error(`Error scanning directory ${dir}:`, error);
  }
  
  return prompts;
} 