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
      await vscode.window.showWarningMessage(
        "当前不在Cursor环境中，无法发送到Chat窗口。请在Cursor编辑器中使用此功能。"
      );
      return false;
    }

    try {
      // 检查是否有必要的命令
      const isCommandAvailable = await this.isCursorCommandAvailable();
      if (!isCommandAvailable) {
        await vscode.window.showWarningMessage(
          "Cursor Chat命令不可用。请确保您使用的是最新版本的Cursor编辑器。"
        );
        return false;
      }

      const formattedPrompt = this.formatPromptForCursor(options);
      await this.injectPromptDiagnosticWithCallback({
        prompt: formattedPrompt,
        callback: () => vscode.commands.executeCommand("composer.fixerrormessage") as Promise<any>,
      });

      // 成功提示（可选，用户可能不需要）
      // await vscode.window.showInformationMessage("Prompt已发送到Cursor Chat", { modal: false });
      
      return true;
    } catch (error) {
      console.error("发送到Cursor Chat失败:", error);
      await vscode.window.showErrorMessage(
        `发送到Cursor Chat失败: ${error instanceof Error ? error.message : "未知错误"}`
      );
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

    // 如果没有活跃编辑器，尝试创建或打开一个文件
    if (!editor) {
      try {
        editor = await this.ensureActiveEditorForPromptInjection();
        if (!editor) {
          const action = await vscode.window.showWarningMessage(
            "需要打开一个文件才能发送Prompt到Chat。请打开任意文件后重试，或者创建一个新文件。", 
            "创建新文件", 
            "取消"
          );
          
          if (action === "创建新文件") {
            try {
              const newDocument = await vscode.workspace.openTextDocument({
                content: "// 临时文件，用于Prompt注入\n",
                language: "javascript"
              });
              editor = await vscode.window.showTextDocument(newDocument);
              // 等待编辑器准备就绪
              await new Promise((resolve) => setTimeout(resolve, 200));
            } catch (error) {
              vscode.window.showErrorMessage("创建临时文件失败，请手动打开一个文件后重试");
              return;
            }
          } else {
            return;
          }
        }
      } catch (error) {
        console.error("准备编辑器失败:", error);
        vscode.window.showErrorMessage("无法准备编辑器进行Prompt注入，请确保有可访问的文件");
        return;
      }
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
Ah, sorry, it wasn't an error. The user has submitted a prompt request. Here is the request, please implement it:
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
   * 为Prompt注入确保有活跃的编辑器（改进版）
   * @returns 活跃的编辑器实例或undefined
   */
  private async ensureActiveEditorForPromptInjection(): Promise<vscode.TextEditor | undefined> {
    if (vscode.window.activeTextEditor) {
      return vscode.window.activeTextEditor;
    }

    try {
      // 尝试查找合适的文件，排除更多不需要的文件类型
      const files = await vscode.workspace.findFiles(
        "**/*.{js,ts,jsx,tsx,py,java,cpp,c,cs,php,rb,go,rs,swift,kt,dart,vue,html,css,scss,less,json,md,txt}",
        "**/node_modules/**"
      );

      if (files.length > 0) {
        // 优先选择文本类型的文件
        const preferredFile = files.find(file => {
          const fileName = file.path.toLowerCase();
          return fileName.endsWith('.md') || 
                 fileName.endsWith('.txt') || 
                 fileName.endsWith('.js') || 
                 fileName.endsWith('.ts');
        }) || files[0];

        const document = await vscode.workspace.openTextDocument(preferredFile);
        const editor = await vscode.window.showTextDocument(document);
        
        // 等待编辑器准备就绪
        await new Promise((resolve) => setTimeout(resolve, 150));
        return editor;
      }

      // 如果没有找到合适的文件，返回undefined让调用者处理
      return undefined;
    } catch (error) {
      console.error("为Prompt注入准备编辑器失败:", error);
      return undefined;
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
