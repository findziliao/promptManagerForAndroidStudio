import * as vscode from "vscode";
import {
  IEditorEnvironmentDetector,
  EditorEnvironmentType,
  EditorEnvironmentInfo,
} from "./interfaces/IEditorEnvironmentDetector";

/**
 * 编辑器环境检测服务
 * 负责检测当前运行的编辑器环境类型
 */
export class EditorEnvironmentDetector implements IEditorEnvironmentDetector {
  private static instance: EditorEnvironmentDetector;

  private constructor() {}

  public static getInstance(): EditorEnvironmentDetector {
    if (!EditorEnvironmentDetector.instance) {
      EditorEnvironmentDetector.instance = new EditorEnvironmentDetector();
    }
    return EditorEnvironmentDetector.instance;
  }

  /**
   * 检测当前编辑器环境类型
   * @returns 编辑器环境类型
   */
  public detectEnvironment(): EditorEnvironmentType {
    try {
      const appName = vscode.env.appName.toLowerCase();

      if (appName.includes("cursor")) {
        return EditorEnvironmentType.CURSOR;
      } else if (appName.includes("visual studio code") || appName.includes("vscode")) {
        return EditorEnvironmentType.VSCODE;
      }

      return EditorEnvironmentType.UNKNOWN;
    } catch (error) {
      console.error("检测编辑器环境失败:", error);
      return EditorEnvironmentType.UNKNOWN;
    }
  }

  /**
   * 获取详细的编辑器环境信息
   * @returns 编辑器环境信息
   */
  public getEnvironmentInfo(): EditorEnvironmentInfo {
    const type = this.detectEnvironment();

    try {
      const appName = vscode.env.appName;
      const version = vscode.version;

      return {
        type,
        name: appName,
        version,
        supportsChatIntegration: this.getSupportsChatIntegration(type),
      };
    } catch (error) {
      console.error("获取环境信息失败:", error);
      return {
        type,
        name: "未知编辑器",
        supportsChatIntegration: false,
      };
    }
  }

  /**
   * 检查指定环境类型是否匹配当前环境
   * @param type 要检查的环境类型
   * @returns 是否匹配
   */
  public isEnvironment(type: EditorEnvironmentType): boolean {
    return this.detectEnvironment() === type;
  }

  /**
   * 检查当前环境是否支持Chat集成
   * @returns 是否支持Chat集成
   */
  public supportsChatIntegration(): boolean {
    const currentType = this.detectEnvironment();
    return this.getSupportsChatIntegration(currentType);
  }

  /**
   * 根据环境类型判断是否支持Chat集成
   * @param type 环境类型
   * @returns 是否支持Chat集成
   */
  private getSupportsChatIntegration(type: EditorEnvironmentType): boolean {
    switch (type) {
      case EditorEnvironmentType.CURSOR:
        return true; // Cursor支持通过诊断注入方式
      case EditorEnvironmentType.VSCODE:
        return true; // VSCode支持通过Copilot Chat API或剪贴板方式
      default:
        return false;
    }
  }
}
