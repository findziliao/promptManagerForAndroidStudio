import * as vscode from "vscode";
import { PromptItem, PromptCategory } from "../types";

export class WebViewEditorService {
  private static instance: WebViewEditorService;
  private panel: vscode.WebviewPanel | undefined;

  private constructor() {
    // 私有构造函数，确保单例模式
  }

  static getInstance(): WebViewEditorService {
    if (!WebViewEditorService.instance) {
      WebViewEditorService.instance = new WebViewEditorService();
    }
    return WebViewEditorService.instance;
  }

  /**
   * 显示 WebView 编辑器
   * @param prompt 要编辑的 Prompt，如果为空则创建新的
   * @param context 扩展上下文
   * @returns 编辑后的 Prompt，如果取消则返回 undefined
   */
  async showEditor(
    prompt?: PromptItem,
    context?: vscode.ExtensionContext
  ): Promise<PromptItem | undefined> {
    return new Promise((resolve) => {
      // 如果已经有面板开启，先关闭它
      if (this.panel) {
        this.panel.dispose();
      }

      // 创建新的 WebView 面板
      this.panel = vscode.window.createWebviewPanel(
        "promptEditor",
        prompt ? `编辑 Prompt: ${prompt.title}` : "创建新 Prompt",
        vscode.ViewColumn.One,
        {
          enableScripts: true,
          retainContextWhenHidden: true,
        }
      );

      // 设置 WebView 内容
      this.panel.webview.html = this.getWebViewContent(prompt);

      // 处理来自 WebView 的消息
      this.panel.webview.onDidReceiveMessage(
        async (message) => {
          switch (message.type) {
            case "ready":
              await this.sendInitialData(prompt);
              break;
            case "save":
              const savedPrompt = await this.handleSave(message.data);
              if (savedPrompt) {
                resolve(savedPrompt);
                this.panel?.dispose();
              }
              break;
            case "cancel":
              resolve(undefined);
              this.panel?.dispose();
              break;
            case "requestCategories":
              await this.sendCategories();
              break;
            case "createCategory":
              await this.handleCreateCategory(message.data);
              break;
          }
        },
        undefined,
        context?.subscriptions
      );

      // 监听面板关闭事件
      this.panel.onDidDispose(() => {
        this.panel = undefined;
        resolve(undefined);
      });
    });
  }

  private async sendInitialData(prompt?: PromptItem): Promise<void> {
    if (!this.panel) return;

    const categories = await this.getCategories();
    
    this.panel.webview.postMessage({
      type: "init",
      data: {
        prompt: prompt || null,
        categories: categories,
      },
    });
  }

  private async sendCategories(): Promise<void> {
    if (!this.panel) return;

    const categories = await this.getCategories();
    
    this.panel.webview.postMessage({
      type: "categories",
      data: categories,
    });
  }

  private async getCategories(): Promise<PromptCategory[]> {
    try {
      const { PromptManager } = await import("../models/PromptManager");
      const promptManager = PromptManager.getInstance();
      return await promptManager.getStorageService().getCategories();
    } catch (error) {
      console.error("获取分类数据失败:", error);
      return [];
    }
  }

  private async handleSave(data: any): Promise<PromptItem | undefined> {
    try {
      if (!data.title || !data.content) {
        this.panel?.webview.postMessage({
          type: "error",
          message: "标题和内容不能为空",
        });
        return undefined;
      }

      const prompt: PromptItem = {
        id: data.id || this.generateId(),
        title: data.title.trim(),
        content: data.content.trim(),
        categoryId: data.categoryId || undefined,
        tags: data.tags && data.tags.length > 0 ? data.tags.filter((tag: string) => tag.trim() !== "") : undefined,
        createdAt: data.createdAt ? new Date(data.createdAt) : new Date(),
        usageCount: data.usageCount || 0,
      };

      return prompt;
    } catch (error) {
      console.error("保存 Prompt 失败:", error);
      this.panel?.webview.postMessage({
        type: "error",
        message: "保存失败，请重试",
      });
      return undefined;
    }
  }

  private async handleCreateCategory(data: any): Promise<void> {
    try {
      if (!data.name || !data.name.trim()) {
        this.panel?.webview.postMessage({
          type: "error",
          message: "分类名称不能为空",
        });
        return;
      }

      const category: PromptCategory = {
        id: this.generateId(),
        name: data.name.trim(),
        description: data.description?.trim() || undefined,
        icon: data.icon || "folder",
        sortOrder: 0,
      };

      const { PromptManager } = await import("../models/PromptManager");
      const promptManager = PromptManager.getInstance();
      await promptManager.getStorageService().saveCategory(category);
      await this.sendCategories();

      this.panel?.webview.postMessage({
        type: "categoryCreated",
        data: category,
      });
    } catch (error) {
      console.error("创建分类失败:", error);
      this.panel?.webview.postMessage({
        type: "error",
        message: "创建分类失败，请重试",
      });
    }
  }

  private getWebViewContent(prompt?: PromptItem): string {
    return `
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${prompt ? "编辑 Prompt" : "创建新 Prompt"}</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
            background-color: var(--vscode-editor-background);
            color: var(--vscode-editor-foreground);
            padding: 20px;
            line-height: 1.6;
        }

        .container {
            max-width: 1200px;
            margin: 0 auto;
        }

        .header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 30px;
            padding-bottom: 20px;
            border-bottom: 1px solid var(--vscode-widget-border);
        }

        .title {
            font-size: 24px;
            font-weight: 600;
            color: var(--vscode-titleBar-activeForeground);
        }

        .actions {
            display: flex;
            gap: 10px;
        }

        .btn {
            padding: 8px 16px;
            border: none;
            border-radius: 4px;
            cursor: pointer;
            font-size: 14px;
            font-weight: 500;
            transition: all 0.2s;
        }

        .btn-primary {
            background-color: var(--vscode-button-background);
            color: var(--vscode-button-foreground);
        }

        .btn-primary:hover {
            background-color: var(--vscode-button-hoverBackground);
        }

        .btn-secondary {
            background-color: var(--vscode-button-secondaryBackground);
            color: var(--vscode-button-secondaryForeground);
        }

        .btn-secondary:hover {
            background-color: var(--vscode-button-secondaryHoverBackground);
        }

        .form-group {
            margin-bottom: 20px;
        }

        .form-label {
            display: block;
            margin-bottom: 8px;
            font-weight: 500;
            color: var(--vscode-foreground);
        }

        .form-input {
            width: 100%;
            padding: 10px;
            border: 1px solid var(--vscode-input-border);
            border-radius: 4px;
            background-color: var(--vscode-input-background);
            color: var(--vscode-input-foreground);
            font-size: 14px;
            font-family: inherit;
        }

        .form-input:focus {
            outline: none;
            border-color: var(--vscode-focusBorder);
        }

        .form-textarea {
            min-height: 200px;
            resize: vertical;
            font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
            line-height: 1.5;
        }

        .form-select {
            width: 100%;
            padding: 10px;
            border: 1px solid var(--vscode-input-border);
            border-radius: 4px;
            background-color: var(--vscode-dropdown-background);
            color: var(--vscode-dropdown-foreground);
            font-size: 14px;
            cursor: pointer;
        }

        .form-select:focus {
            outline: none;
            border-color: var(--vscode-focusBorder);
        }

        .tags-container {
            display: flex;
            flex-wrap: wrap;
            gap: 8px;
            margin-top: 10px;
        }

        .tag {
            padding: 4px 8px;
            background-color: var(--vscode-badge-background);
            color: var(--vscode-badge-foreground);
            border-radius: 12px;
            font-size: 12px;
            display: flex;
            align-items: center;
            gap: 4px;
        }

        .tag-remove {
            cursor: pointer;
            color: var(--vscode-badge-foreground);
            font-weight: bold;
        }

        .tag-remove:hover {
            color: var(--vscode-errorForeground);
        }

        .two-column {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 20px;
        }

        .category-actions {
            display: flex;
            gap: 10px;
            margin-top: 10px;
        }

        .btn-small {
            padding: 4px 8px;
            font-size: 12px;
        }

        .error-message {
            color: var(--vscode-errorForeground);
            background-color: var(--vscode-inputValidation-errorBackground);
            border: 1px solid var(--vscode-inputValidation-errorBorder);
            padding: 10px;
            border-radius: 4px;
            margin-bottom: 20px;
        }

        .success-message {
            color: var(--vscode-notificationsInfoIcon-foreground);
            background-color: var(--vscode-inputValidation-infoBackground);
            border: 1px solid var(--vscode-inputValidation-infoBorder);
            padding: 10px;
            border-radius: 4px;
            margin-bottom: 20px;
        }

        .preview-container {
            margin-top: 20px;
            padding: 20px;
            border: 1px solid var(--vscode-widget-border);
            border-radius: 4px;
            background-color: var(--vscode-editor-background);
        }

        .preview-header {
            font-weight: 600;
            margin-bottom: 10px;
            color: var(--vscode-titleBar-activeForeground);
        }

        .preview-content {
            white-space: pre-wrap;
            font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
            line-height: 1.5;
        }

        @media (max-width: 768px) {
            .two-column {
                grid-template-columns: 1fr;
            }
            
            .header {
                flex-direction: column;
                gap: 15px;
                align-items: flex-start;
            }
            
            .actions {
                width: 100%;
                justify-content: flex-end;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1 class="title">${prompt ? "编辑 Prompt" : "创建新 Prompt"}</h1>
            <div class="actions">
                <button class="btn btn-secondary" onclick="cancel()">取消</button>
                <button class="btn btn-primary" onclick="save()">保存</button>
            </div>
        </div>

        <div id="error-message" class="error-message" style="display: none;"></div>
        <div id="success-message" class="success-message" style="display: none;"></div>

        <div class="form-group">
            <label class="form-label" for="title">标题 *</label>
            <input type="text" id="title" class="form-input" placeholder="输入 Prompt 标题" required>
        </div>

        <div class="form-group">
            <label class="form-label" for="content">内容 *</label>
            <textarea id="content" class="form-input form-textarea" placeholder="输入 Prompt 内容" required></textarea>
        </div>

        <div class="form-group">
            <label class="form-label" for="category">分类</label>
            <select id="category" class="form-select">
                <option value="">无分类</option>
            </select>
            <div class="category-actions">
                <button class="btn btn-secondary btn-small" onclick="createCategory()">创建新分类</button>
                <button class="btn btn-secondary btn-small" onclick="refreshCategories()">刷新分类</button>
            </div>
        </div>

        <div class="form-group">
            <label class="form-label" for="tags">标签</label>
            <input type="text" id="tags" class="form-input" placeholder="输入标签，按 Enter 添加">
            <div id="tags-container" class="tags-container"></div>
        </div>

        <div class="preview-container">
            <div class="preview-header">内容预览</div>
            <div id="preview-content" class="preview-content"></div>
        </div>
    </div>

    <script>
        let promptData = null;
        let categories = [];
        let currentTags = [];

        const vscode = acquireVsCodeApi();

        window.addEventListener('DOMContentLoaded', () => {
            vscode.postMessage({ type: 'ready' });
        });

        window.addEventListener('message', event => {
            const message = event.data;
            
            switch (message.type) {
                case 'init':
                    handleInit(message.data);
                    break;
                case 'categories':
                    handleCategories(message.data);
                    break;
                case 'error':
                    showError(message.message);
                    break;
                case 'categoryCreated':
                    handleCategoryCreated(message.data);
                    break;
            }
        });

        function handleInit(data) {
            promptData = data.prompt;
            categories = data.categories;
            
            if (promptData) {
                document.getElementById('title').value = promptData.title || '';
                document.getElementById('content').value = promptData.content || '';
                
                if (promptData.tags) {
                    currentTags = [...promptData.tags];
                    updateTagsDisplay();
                }
            }
            
            updateCategorySelect();
            updatePreview();
        }

        function handleCategories(data) {
            categories = data;
            updateCategorySelect();
        }

        function updateCategorySelect() {
            const categorySelect = document.getElementById('category');
            categorySelect.innerHTML = '<option value="">无分类</option>';
            
            categories.forEach(category => {
                const option = document.createElement('option');
                option.value = category.id;
                option.textContent = category.name;
                if (promptData && promptData.categoryId === category.id) {
                    option.selected = true;
                }
                categorySelect.appendChild(option);
            });
        }

        document.getElementById('tags').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                const input = e.target;
                const tag = input.value.trim();
                
                if (tag && !currentTags.includes(tag)) {
                    currentTags.push(tag);
                    updateTagsDisplay();
                    input.value = '';
                }
            }
        });

        function updateTagsDisplay() {
            const container = document.getElementById('tags-container');
            container.innerHTML = '';
            
            currentTags.forEach((tag, index) => {
                const tagElement = document.createElement('div');
                tagElement.className = 'tag';
                tagElement.innerHTML = tag + '<span class="tag-remove" onclick="removeTag(' + index + ')">×</span>';
                container.appendChild(tagElement);
            });
        }

        function removeTag(index) {
            currentTags.splice(index, 1);
            updateTagsDisplay();
        }

        document.getElementById('content').addEventListener('input', updatePreview);

        function updatePreview() {
            const content = document.getElementById('content').value;
            const previewContent = document.getElementById('preview-content');
            previewContent.textContent = content || '（内容预览将在这里显示）';
        }

        function save() {
            const title = document.getElementById('title').value.trim();
            const content = document.getElementById('content').value.trim();
            const categoryId = document.getElementById('category').value;
            
            if (!title || !content) {
                showError('标题和内容不能为空');
                return;
            }
            
            const data = {
                id: promptData ? promptData.id : null,
                title: title,
                content: content,
                categoryId: categoryId || undefined,
                tags: currentTags.length > 0 ? currentTags : undefined,
                createdAt: promptData ? promptData.createdAt : null,
                usageCount: promptData ? promptData.usageCount : 0
            };
            
            vscode.postMessage({
                type: 'save',
                data: data
            });
        }

        function cancel() {
            vscode.postMessage({ type: 'cancel' });
        }

        function createCategory() {
            const name = prompt('输入分类名称：');
            if (name && name.trim()) {
                const description = prompt('输入分类描述（可选）：');
                
                vscode.postMessage({
                    type: 'createCategory',
                    data: {
                        name: name.trim(),
                        description: description ? description.trim() : undefined,
                        icon: 'folder'
                    }
                });
            }
        }

        function refreshCategories() {
            vscode.postMessage({ type: 'requestCategories' });
        }

        function handleCategoryCreated(category) {
            showSuccess('分类 "' + category.name + '" 创建成功');
            
            const categorySelect = document.getElementById('category');
            categorySelect.value = category.id;
        }

        function showError(message) {
            const errorDiv = document.getElementById('error-message');
            errorDiv.textContent = message;
            errorDiv.style.display = 'block';
            
            setTimeout(() => {
                errorDiv.style.display = 'none';
            }, 5000);
        }

        function showSuccess(message) {
            const successDiv = document.getElementById('success-message');
            successDiv.textContent = message;
            successDiv.style.display = 'block';
            
            setTimeout(() => {
                successDiv.style.display = 'none';
            }, 3000);
        }
    </script>
</body>
</html>
    `;
  }

  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  dispose(): void {
    if (this.panel) {
      this.panel.dispose();
      this.panel = undefined;
    }
  }
} 