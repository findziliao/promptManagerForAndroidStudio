/**
 * 编辑器环境类型枚举
 */
export enum EditorEnvironmentType {
  CURSOR = "cursor",
  VSCODE = "vscode",
  UNKNOWN = "unknown",
}

/**
 * 编辑器环境信息接口
 */
export interface EditorEnvironmentInfo {
  type: EditorEnvironmentType;
  name: string;
  version?: string;
  supportsChatIntegration: boolean;
}

/**
 * 编辑器环境检测器抽象接口
 * 定义编辑器环境检测的统一行为规范
 */
export interface IEditorEnvironmentDetector {
  /**
   * 检测当前编辑器环境类型
   * @returns 编辑器环境类型
   */
  detectEnvironment(): EditorEnvironmentType;

  /**
   * 获取详细的编辑器环境信息
   * @returns 编辑器环境信息
   */
  getEnvironmentInfo(): EditorEnvironmentInfo;

  /**
   * 检查指定环境类型是否匹配当前环境
   * @param type 要检查的环境类型
   * @returns 是否匹配
   */
  isEnvironment(type: EditorEnvironmentType): boolean;

  /**
   * 检查当前环境是否支持Chat集成
   * @returns 是否支持Chat集成
   */
  supportsChatIntegration(): boolean;
}
