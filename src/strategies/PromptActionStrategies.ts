import * as vscode from "vscode";
import {
  PromptItem,
  PromptActionResult,
  PromptActionType,
  IPromptActionStrategy,
  IChatIntegrationService,
  ChatIntegrationOptions,
} from "../types";
import { ClipboardService } from "../services/ClipboardService";
import { ChatIntegrationFactory } from "../services/ChatIntegrationFactory";
import { UIService } from "../services/UIService";

/**
 * 抽象策略基类
 */
abstract class PromptActionStrategy implements IPromptActionStrategy {
  protected clipboardService: ClipboardService;
  protected chatIntegrationFactory: ChatIntegrationFactory;
  protected uiService: UIService;

  constructor() {
    this.clipboardService = ClipboardService.getInstance();
    this.chatIntegrationFactory = ChatIntegrationFactory.getInstance();
    this.uiService = UIService.getInstance();
  }

  abstract readonly actionType: PromptActionType;
  abstract isAvailable(): Promise<boolean>;
  abstract execute(prompt: PromptItem, options?: any): Promise<PromptActionResult>;
  abstract getDescription(): string;

  /**
   * 获取用户配置
   */
  protected getConfig(): vscode.WorkspaceConfiguration {
    return vscode.workspace.getConfiguration("promptManager");
  }

  /**
   * 创建成功结果
   */
  protected createSuccessResult(actions: string[]): PromptActionResult {
    return {
      success: true,
      actions,
      errors: [],
    };
  }

  /**
   * 创建失败结果
   */
  protected createFailureResult(errors: string[]): PromptActionResult {
    return {
      success: false,
      actions: [],
      errors,
    };
  }
}

/**
 * 复制到剪贴板策略
 */
export class CopyToClipboardStrategy extends PromptActionStrategy {
  readonly actionType = PromptActionType.COPY_TO_CLIPBOARD;

  async isAvailable(): Promise<boolean> {
    return true; // 剪贴板功能总是可用
  }

  async execute(prompt: PromptItem): Promise<PromptActionResult> {
    try {
      await this.clipboardService.copyText(prompt.content);
      await this.uiService.showInfo(`Prompt "${prompt.title}" 已复制到剪贴板`);
      return this.createSuccessResult(["复制到剪贴板"]);
    } catch (error) {
      console.error("复制到剪贴板失败:", error);
      await this.uiService.showError("复制到剪贴板失败");
      return this.createFailureResult(["复制到剪贴板失败"]);
    }
  }

  getDescription(): string {
    return "将Prompt内容复制到系统剪贴板";
  }
}

/**
 * 发送到Chat策略（支持多编辑器）
 */
export class SendToChatStrategy extends PromptActionStrategy {
  readonly actionType = PromptActionType.SEND_TO_CHAT;

  async isAvailable(): Promise<boolean> {
    try {
      // Chat集成功能默认启用
      return await this.chatIntegrationFactory.isCurrentEnvironmentSupported();
    } catch (error) {
      console.error("检查Chat集成可用性失败:", error);
      return false;
    }
  }

  async execute(prompt: PromptItem): Promise<PromptActionResult> {
    try {
      // Chat集成功能默认启用
      if (!(await this.isAvailable())) {
        const error = "当前环境不支持Chat集成";
        await this.uiService.showInfo(error);
        return this.createFailureResult([error]);
      }

      const currentService = this.chatIntegrationFactory.getCurrentChatService();
      if (!currentService) {
        const error = "无法获取当前环境的Chat集成服务";
        await this.uiService.showError(error);
        return this.createFailureResult([error]);
      }

      const chatOptions: ChatIntegrationOptions = {
        prompt: prompt.content,
        title: prompt.title,
        includeTitle: false, // 默认不包含标题
        addContext: false, // 默认不添加上下文
      };

      const success = await currentService.sendToChat(chatOptions);

      if (success) {
        const editorType = currentService.getEditorType();
        await this.uiService.showInfo(`Prompt "${prompt.title}" 已发送到Chat窗口`);
        return this.createSuccessResult([`发送到${editorType.toUpperCase()} Chat窗口`]);
      } else {
        await this.uiService.showError("发送到Chat失败");
        return this.createFailureResult(["发送到Chat失败"]);
      }
    } catch (error) {
      console.error("发送到Chat失败:", error);
      await this.uiService.showError("发送到Chat失败");
      return this.createFailureResult(["发送到Chat失败"]);
    }
  }

  getDescription(): string {
    return "将Prompt发送到当前编辑器的Chat窗口";
  }
}

/**
 * 智能使用策略
 */
export class IntelligentUseStrategy extends PromptActionStrategy {
  readonly actionType = PromptActionType.INTELLIGENT_USE;

  async isAvailable(): Promise<boolean> {
    return true; // 智能使用总是可用，会根据环境选择最佳方式
  }

  async execute(prompt: PromptItem): Promise<PromptActionResult> {
    try {
      let successActions: string[] = [];
      let errors: string[] = [];
      let warnings: string[] = [];

      // 1. 尝试Chat集成（使用新的通用策略）
      const chatStrategy = new SendToChatStrategy();
      if (await chatStrategy.isAvailable()) {
        const chatResult = await chatStrategy.execute(prompt);
        if (chatResult.success) {
          successActions.push(...chatResult.actions);
        } else {
          errors.push(...chatResult.errors);
          warnings.push("Chat发送失败，已回退到剪贴板模式");
        }
      }

      // 2. 总是复制到剪贴板（默认行为或作为回退）
      const clipboardStrategy = new CopyToClipboardStrategy();
      const clipboardResult = await clipboardStrategy.execute(prompt);
      if (clipboardResult.success) {
        successActions.push(...clipboardResult.actions);
      } else {
        errors.push(...clipboardResult.errors);
      }

      // 3. 返回综合结果
      const result: PromptActionResult = {
        success: successActions.length > 0,
        actions: successActions,
        errors: errors,
        warnings: warnings,
      };

      if (result.success && warnings.length > 0) {
        await this.uiService.showInfo(`操作完成，但有${warnings.length}个警告`);
      }

      return result;
    } catch (error) {
      console.error("智能使用策略执行失败:", error);
      await this.uiService.showError("智能使用失败");
      return this.createFailureResult(["智能使用失败"]);
    }
  }

  getDescription(): string {
    return "根据当前环境自动选择最佳的操作方式（支持Chat的环境优先发送到Chat，其他环境复制到剪贴板）";
  }
}

/**
 * 插入到编辑器策略
 */
export class InsertToEditorStrategy extends PromptActionStrategy {
  readonly actionType = PromptActionType.INSERT_TO_EDITOR;

  async isAvailable(): Promise<boolean> {
    return !!vscode.window.activeTextEditor;
  }

  async execute(prompt: PromptItem): Promise<PromptActionResult> {
    try {
      const editor = vscode.window.activeTextEditor;
      if (!editor) {
        const error = "没有活跃的编辑器窗口";
        await this.uiService.showError(error);
        return this.createFailureResult([error]);
      }

      const position = editor.selection.active;
      await editor.edit((editBuilder) => {
        editBuilder.insert(position, prompt.content);
      });

      await this.uiService.showInfo(`Prompt "${prompt.title}" 已插入到编辑器`);
      return this.createSuccessResult(["插入到编辑器"]);
    } catch (error) {
      console.error("插入到编辑器失败:", error);
      await this.uiService.showError("插入到编辑器失败");
      return this.createFailureResult(["插入到编辑器失败"]);
    }
  }

  getDescription(): string {
    return "将Prompt内容插入到当前编辑器的光标位置";
  }
}

/**
 * 插入到编辑器并复制到剪贴板策略
 */
export class InsertAndCopyStrategy extends PromptActionStrategy {
  readonly actionType = PromptActionType.INSERT_AND_COPY;

  async isAvailable(): Promise<boolean> {
    return !!vscode.window.activeTextEditor;
  }

  async execute(prompt: PromptItem): Promise<PromptActionResult> {
    try {
      let successActions: string[] = [];
      let errors: string[] = [];

      // 1. 插入到编辑器
      const insertStrategy = new InsertToEditorStrategy();
      const insertResult = await insertStrategy.execute(prompt);
      if (insertResult.success) {
        successActions.push(...insertResult.actions);
      } else {
        errors.push(...insertResult.errors);
      }

      // 2. 复制到剪贴板
      const clipboardStrategy = new CopyToClipboardStrategy();
      const clipboardResult = await clipboardStrategy.execute(prompt);
      if (clipboardResult.success) {
        successActions.push(...clipboardResult.actions);
      } else {
        errors.push(...clipboardResult.errors);
      }

      if (successActions.length > 0) {
        await this.uiService.showInfo(`Prompt "${prompt.title}" 已插入到编辑器并复制到剪贴板`);
        return this.createSuccessResult(successActions);
      } else {
        return this.createFailureResult(errors);
      }
    } catch (error) {
      console.error("插入并复制失败:", error);
      await this.uiService.showError("插入并复制失败");
      return this.createFailureResult(["插入并复制失败"]);
    }
  }

  getDescription(): string {
    return "将Prompt内容插入到编辑器并同时复制到剪贴板";
  }
}

/**
 * 策略工厂类
 */
export class PromptActionStrategyFactory {
  private static strategies: Map<PromptActionType, IPromptActionStrategy> = new Map();

  /**
   * 注册策略
   */
  static registerStrategy(strategy: IPromptActionStrategy): void {
    this.strategies.set(strategy.actionType, strategy);
  }

  /**
   * 获取策略实例
   */
  static getStrategy(actionType: PromptActionType): IPromptActionStrategy | undefined {
    return this.strategies.get(actionType);
  }

  /**
   * 获取所有已注册的策略
   */
  static getAllStrategies(): IPromptActionStrategy[] {
    return Array.from(this.strategies.values());
  }

  /**
   * 获取可用的策略（根据当前环境）
   */
  static async getAvailableStrategies(): Promise<IPromptActionStrategy[]> {
    const allStrategies = this.getAllStrategies();
    const availableStrategies: IPromptActionStrategy[] = [];

    for (const strategy of allStrategies) {
      if (await strategy.isAvailable()) {
        availableStrategies.push(strategy);
      }
    }

    return availableStrategies;
  }

  /**
   * 初始化默认策略
   */
  static initializeDefaultStrategies(): void {
    this.registerStrategy(new CopyToClipboardStrategy());
    this.registerStrategy(new SendToChatStrategy());
    this.registerStrategy(new IntelligentUseStrategy());
    this.registerStrategy(new InsertToEditorStrategy());
    this.registerStrategy(new InsertAndCopyStrategy());
  }
}

// 初始化默认策略
PromptActionStrategyFactory.initializeDefaultStrategies();
