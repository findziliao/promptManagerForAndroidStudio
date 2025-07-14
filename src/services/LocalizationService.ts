import * as vscode from "vscode";

/**
 * 多语言管理服务接口
 */
export interface ILocalizationService {
  /**
   * 获取本地化文本
   * @param key 本地化键
   * @param args 参数
   * @returns 本地化文本
   */
  t(key: string, ...args: any[]): string;
}

/**
 * 多语言管理服务实现
 * 基于 VS Code 原生 l10n API
 */
export class LocalizationService implements ILocalizationService {
  private static instance: LocalizationService;

  private constructor() {}

  /**
   * 获取单例实例
   */
  static getInstance(): LocalizationService {
    if (!LocalizationService.instance) {
      LocalizationService.instance = new LocalizationService();
    }
    return LocalizationService.instance;
  }

  /**
   * 获取本地化文本
   * @param key 本地化键
   * @param args 参数
   * @returns 本地化文本
   */
  t(key: string, ...args: any[]): string {
    try {
      // 直接使用 VS Code 原生 l10n API
      return vscode.l10n.t(key, ...args);
    } catch (error) {
      console.error(`Failed to get localized string for key: ${key}`, error);
      return key;
    }
  }
}

/**
 * 全局本地化服务实例
 */
export const localizationService = LocalizationService.getInstance();

/**
 * 便捷的本地化函数
 * @param key 本地化键
 * @param args 参数
 * @returns 本地化文本
 */
export function t(key: string, ...args: any[]): string {
  return localizationService.t(key, ...args);
}
