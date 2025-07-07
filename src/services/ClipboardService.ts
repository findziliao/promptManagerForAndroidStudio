import * as vscode from "vscode";
import { IClipboardService } from "../types";
import { UI_CONSTANTS } from "../utils/constants";

/**
 * 剪贴板服务实现
 * 封装VSCode剪贴板API，提供跨平台剪贴板操作功能
 */
export class ClipboardService implements IClipboardService {
  private static instance: ClipboardService;

  /**
   * 获取单例实例
   */
  static getInstance(): ClipboardService {
    if (!ClipboardService.instance) {
      ClipboardService.instance = new ClipboardService();
    }
    return ClipboardService.instance;
  }

  private constructor() {
    // 私有构造函数，确保单例模式
  }

  /**
   * 复制文本到剪贴板
   * @param text 要复制的文本内容
   */
  async copyText(text: string): Promise<void> {
    if (!text || text.trim() === "") {
      throw new Error("复制内容不能为空");
    }

    try {
      await vscode.env.clipboard.writeText(text);
      console.log("文本复制到剪贴板成功:", text.substring(0, 50) + (text.length > 50 ? "..." : ""));
    } catch (error) {
      console.error("复制到剪贴板失败:", error);

      // 显示错误提示
      vscode.window.showErrorMessage(UI_CONSTANTS.ERRORS.CLIPBOARD_FAILED);

      throw new Error(`复制到剪贴板失败: ${error instanceof Error ? error.message : "未知错误"}`);
    }
  }

  /**
   * 从剪贴板读取文本
   * @returns 剪贴板中的文本内容
   */
  async readText(): Promise<string> {
    try {
      const text = await vscode.env.clipboard.readText();
      console.log("从剪贴板读取文本成功:", text.substring(0, 50) + (text.length > 50 ? "..." : ""));
      return text;
    } catch (error) {
      console.error("从剪贴板读取失败:", error);

      // 显示错误提示
      vscode.window.showErrorMessage(UI_CONSTANTS.ERRORS.CLIPBOARD_FAILED);

      throw new Error(`从剪贴板读取失败: ${error instanceof Error ? error.message : "未知错误"}`);
    }
  }

  /**
   * 复制Prompt内容到剪贴板（带格式化）
   * @param title Prompt标题
   * @param content Prompt内容
   * @param includeTitle 是否包含标题
   */
  async copyPrompt(title: string, content: string, includeTitle: boolean = false): Promise<void> {
    if (!content || content.trim() === "") {
      throw new Error("Prompt内容不能为空");
    }

    try {
      let textToCopy = content;

      if (includeTitle && title && title.trim() !== "") {
        textToCopy = `# ${title}\n\n${content}`;
      }

      await this.copyText(textToCopy);
      console.log(`Prompt复制成功: ${title}`);
    } catch (error) {
      console.error("复制Prompt失败:", error);
      throw error;
    }
  }

  /**
   * 复制多个Prompt到剪贴板（批量操作）
   * @param prompts Prompt数组，包含title和content
   * @param separator 分隔符
   */
  async copyMultiplePrompts(
    prompts: Array<{ title: string; content: string }>,
    separator: string = "\n\n---\n\n"
  ): Promise<void> {
    if (!prompts || prompts.length === 0) {
      throw new Error("没有Prompt可以复制");
    }

    try {
      const combinedText = prompts
        .filter((prompt) => prompt.content && prompt.content.trim() !== "")
        .map((prompt) => {
          if (prompt.title && prompt.title.trim() !== "") {
            return `# ${prompt.title}\n\n${prompt.content}`;
          }
          return prompt.content;
        })
        .join(separator);

      if (combinedText.trim() === "") {
        throw new Error("所有Prompt内容都为空");
      }

      await this.copyText(combinedText);
      console.log(`批量复制${prompts.length}个Prompt成功`);

      // 显示批量复制成功提示
      vscode.window.showInformationMessage(`已复制${prompts.length}个Prompt到剪贴板`);
    } catch (error) {
      console.error("批量复制Prompt失败:", error);
      throw error;
    }
  }

  /**
   * 检查剪贴板是否包含文本内容
   * @returns 是否包含文本内容
   */
  async hasText(): Promise<boolean> {
    try {
      const text = await vscode.env.clipboard.readText();
      return !!(text && text.trim().length > 0);
    } catch (error) {
      console.error("检查剪贴板内容失败:", error);
      return false;
    }
  }

  /**
   * 清空剪贴板（通过复制空字符串实现）
   */
  async clear(): Promise<void> {
    try {
      await vscode.env.clipboard.writeText("");
      console.log("剪贴板已清空");
    } catch (error) {
      console.error("清空剪贴板失败:", error);
      throw new Error(`清空剪贴板失败: ${error instanceof Error ? error.message : "未知错误"}`);
    }
  }

  /**
   * 获取剪贴板内容的摘要信息
   * @param maxLength 最大长度
   * @returns 剪贴板内容摘要
   */
  async getTextSummary(maxLength: number = 100): Promise<string> {
    try {
      const text = await this.readText();
      if (!text || text.trim() === "") {
        return "剪贴板为空";
      }

      const summary = text.trim();
      if (summary.length <= maxLength) {
        return summary;
      }

      return summary.substring(0, maxLength) + "...";
    } catch (error) {
      console.error("获取剪贴板摘要失败:", error);
      return "无法读取剪贴板内容";
    }
  }

  /**
   * 复制带时间戳的内容
   * @param text 要复制的文本
   * @param includeTimestamp 是否包含时间戳
   */
  async copyWithTimestamp(text: string, includeTimestamp: boolean = true): Promise<void> {
    if (!text || text.trim() === "") {
      throw new Error("复制内容不能为空");
    }

    try {
      let textToCopy = text;

      if (includeTimestamp) {
        const timestamp = new Date().toLocaleString("zh-CN");
        textToCopy = `${text}\n\n---\n复制时间: ${timestamp}`;
      }

      await this.copyText(textToCopy);
      console.log("带时间戳复制成功");
    } catch (error) {
      console.error("带时间戳复制失败:", error);
      throw error;
    }
  }
}
