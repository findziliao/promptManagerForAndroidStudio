import * as vscode from "vscode";
import {
  IChatIntegrationService,
  ChatIntegrationOptions,
  ChatIntegrationStatus,
} from "./interfaces/IChatIntegrationService";
import { EditorEnvironmentDetector } from "./EditorEnvironmentDetector";
import { EditorEnvironmentType } from "./interfaces/IEditorEnvironmentDetector";

/**
 * Cursor集成服务
 * 负责与Cursor编辑器Chat窗口的通信
 * 基于虚假诊断注入技术实现
 */
export class CursorIntegrationService implements IChatIntegrationService {
  private static instance: CursorIntegrationService;
  private readonly DIAGNOSTIC_COLLECTION_NAME = "prompt-manager-cursor";
  private readonly environmentDetector: EditorEnvironmentDetector;

  private constructor() {
    this.environmentDetector = EditorEnvironmentDetector.getInstance();
  }

  public static getInstance(): CursorIntegrationService {
    if (!CursorIntegrationService.instance) {
      CursorIntegrationService.instance = new CursorIntegrationService();
    }
    return CursorIntegrationService.instance;
  }

  /**
   * 检测是否运行在Cursor环境中
   */
  public isCursorEnvironment(): boolean {
    try {
      return vscode.env.appName.toLowerCase().includes("cursor");
    } catch (error) {
      console.error("检测Cursor环境失败:", error);
      return false;
    }
  }

  /**
   * 检测是否运行在支持的编辑器环境中（实现IChatIntegrationService接口）
   */
  public isEditorEnvironment(): boolean {
    return this.environmentDetector.isEnvironment(EditorEnvironmentType.CURSOR);
  }

  /**
   * 发送prompt到Chat窗口（实现IChatIntegrationService接口）
   * @param options Chat集成选项
   * @returns 是否发送成功
   */
  public async sendToChat(options: ChatIntegrationOptions): Promise<boolean> {
    return this.sendToCursorChat(options);
  }

  /**
   * 检查Chat命令是否可用（实现IChatIntegrationService接口）
   * @returns Chat命令可用性
   */
  public async isChatCommandAvailable(): Promise<boolean> {
    return this.isCursorCommandAvailable();
  }

  /**
   * 获取编辑器类型标识（实现IChatIntegrationService接口）
   * @returns 编辑器类型字符串
   */
  public getEditorType(): string {
    return "cursor";
  }

  /**
   * 发送prompt到Cursor Chat窗口
   * @param options Cursor集成选项
   * @returns 是否发送成功
   */
  public async sendToCursorChat(options: ChatIntegrationOptions): Promise<boolean> {
    if (!this.isCursorEnvironment()) {
      console.warn("当前不在Cursor环境中，无法发送到Chat窗口");
      return false;
    }

    try {
      const formattedPrompt = this.formatPromptForCursor(options);
      await this.injectPromptDiagnosticWithCallback({
        prompt: formattedPrompt,
        callback: () => vscode.commands.executeCommand("composer.fixerrormessage") as Promise<any>,
      });
      return true;
    } catch (error) {
      console.error("发送到Cursor Chat失败:", error);
      return false;
    }
  }

  /**
   * 核心的虚假诊断注入机制
   * 参考stagewise的inject-prompt-diagnostic-with-callback实现
   * @param params 注入参数
   */
  private async injectPromptDiagnosticWithCallback(params: {
    prompt: string;
    callback: () => Promise<any>;
  }): Promise<void> {
    let editor = vscode.window.activeTextEditor;

    // 如果没有活跃编辑器，尝试打开工作区中的第一个文件
    if (!editor) {
      try {
        const files = await vscode.workspace.findFiles("**/*", "**/node_modules/**");

        if (files.length === 0) {
          vscode.window.showErrorMessage("工作区中没有找到文件可以打开");
          return;
        }

        const document = await vscode.workspace.openTextDocument(files[0]);
        editor = await vscode.window.showTextDocument(document);
      } catch (error) {
        vscode.window.showErrorMessage("无法打开文件进行prompt注入");
        return;
      }
      // 等待150ms确保编辑器准备就绪
      await new Promise((resolve) => setTimeout(resolve, 150));
    }

    const document = editor.document;

    // 创建诊断集合
    const fakeDiagCollection = vscode.languages.createDiagnosticCollection(this.DIAGNOSTIC_COLLECTION_NAME);

    try {
      // 使用当前选择或当前行
      const selectionOrCurrentLine = editor.selection.isEmpty
        ? document.lineAt(editor.selection.active.line).range
        : editor.selection;

      // 创建虚假诊断对象
      const fakeDiagnostic = new vscode.Diagnostic(
        selectionOrCurrentLine,
        params.prompt,
        vscode.DiagnosticSeverity.Error
      );
      fakeDiagnostic.source = this.DIAGNOSTIC_COLLECTION_NAME;

      // 设置诊断
      fakeDiagCollection.set(document.uri, [fakeDiagnostic]);

      // 确保光标位于诊断范围内
      editor.selection = new vscode.Selection(selectionOrCurrentLine.start, selectionOrCurrentLine.start);

      // 短暂延迟确保诊断设置完成
      await new Promise((resolve) => setTimeout(resolve, 10));

      // 执行回调命令
      await params.callback();
    } catch (error) {
      vscode.window.showErrorMessage(`注入Prompt失败: ${error}`);
    } finally {
      // 确保资源清理
      if (document) {
        fakeDiagCollection.delete(document.uri);
      } else {
        fakeDiagCollection.clear();
      }
      fakeDiagCollection.dispose();
    }
  }

  /**
   * 格式化prompt用于Cursor处理
   * @param options 格式化选项
   * @returns 格式化后的prompt内容
   */
  private formatPromptForCursor(options: ChatIntegrationOptions): string {
    const prefix = `\`\`\`
用户通过Prompt Manager提交了请求，这不是代码错误。请处理以下内容：
\`\`\``;

    let content = options.prompt;

    // 如果需要包含标题
    if (options.includeTitle && options.title) {
      content = `# ${options.title}\n\n${content}`;
    }

    // 不再添加上下文信息（功能已移除）
    // 保持原有的prompt内容

    return `${prefix}\n\n${content}`;
  }

  /**
   * 生成当前编辑器的上下文信息
   * @returns 上下文信息字符串
   */
  private generateEditorContext(): string | null {
    try {
      const editor = vscode.window.activeTextEditor;
      if (!editor) {
        return null;
      }

      const document = editor.document;
      const selection = editor.selection;

      let contextInfo = `\n--- 当前上下文信息 ---\n`;
      contextInfo += `文件: ${document.fileName}\n`;
      contextInfo += `语言: ${document.languageId}\n`;

      if (!selection.isEmpty) {
        const selectedText = document.getText(selection);
        contextInfo += `选中文本:\n\`\`\`${document.languageId}\n${selectedText}\n\`\`\`\n`;
      }

      return contextInfo;
    } catch (error) {
      console.error("生成上下文信息失败:", error);
      return null;
    }
  }

  /**
   * 确保有活跃的编辑器
   * @returns 活跃的编辑器实例或null
   */
  private async ensureActiveEditor(): Promise<vscode.TextEditor | null> {
    if (vscode.window.activeTextEditor) {
      return vscode.window.activeTextEditor;
    }

    try {
      const files = await vscode.workspace.findFiles("**/*", "**/node_modules/**");
      if (files.length === 0) {
        return null;
      }

      const document = await vscode.workspace.openTextDocument(files[0]);
      return await vscode.window.showTextDocument(document);
    } catch (error) {
      console.error("确保活跃编辑器失败:", error);
      return null;
    }
  }

  /**
   * 检查Cursor命令是否可用
   * @returns 是否可用
   */
  public async isCursorCommandAvailable(): Promise<boolean> {
    try {
      const commands = await vscode.commands.getCommands();
      return commands.includes("composer.fixerrormessage");
    } catch (error) {
      console.error("检查Cursor命令可用性失败:", error);
      return false;
    }
  }

  /**
   * 获取Cursor集成状态信息
   * @returns 状态信息对象
   */
  public async getIntegrationStatus(): Promise<ChatIntegrationStatus> {
    return {
      isEditorEnvironment: this.isEditorEnvironment(),
      isCommandAvailable: await this.isChatCommandAvailable(),
      hasActiveEditor: !!vscode.window.activeTextEditor,
    };
  }
}
