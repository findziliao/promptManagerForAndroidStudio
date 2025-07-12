import * as vscode from "vscode";
import { IUIService, PromptItem, PromptCategory, QuickPickPromptItem } from "../types";
import { UI_CONSTANTS, FILE_CONSTANTS, PERFORMANCE_CONSTANTS } from "../utils/constants";
import { WebViewEditorService } from "./WebViewEditorService";

/**
 * 用户界面服务实现
 * 封装VSCode用户界面API，提供统一的UI操作接口
 */
export class UIService implements IUIService {
  private static instance: UIService;

  /**
   * 获取单例实例
   */
  static getInstance(): UIService {
    if (!UIService.instance) {
      UIService.instance = new UIService();
    }
    return UIService.instance;
  }

  private constructor() {
    // 私有构造函数，确保单例模式
  }

  /**
   * 显示Prompt选择列表
   * @param prompts Prompt数组
   * @returns 选中的Prompt，如果取消则返回undefined
   */
  async showPromptPicker(prompts: PromptItem[]): Promise<PromptItem | undefined> {
    if (!prompts || prompts.length === 0) {
      await this.showInfo("没有可用的Prompt");
      return undefined;
    }

    try {
      // 转换为QuickPickItem格式
      const quickPickItems: QuickPickPromptItem[] = prompts
        .slice(0, PERFORMANCE_CONSTANTS.MAX_QUICK_PICK_ITEMS)
        .map((prompt) => ({
          label: `$(symbol-text) ${prompt.title}`,
          description: prompt.description || "",
          detail: this.formatPromptDetail(prompt),
          promptItem: prompt,
          picked: false,
        }));

      // 读取配置中的默认操作
      const config = vscode.workspace.getConfiguration("promptManager");
      const defaultAction = config.get<string>("defaultAction", "copy");
      const actionText = defaultAction === "chat" ? "发送到Chat" : "复制";

      // 创建QuickPick实例
      const quickPick = vscode.window.createQuickPick<QuickPickPromptItem>();
      quickPick.title = "Prompt Manager - 选择Prompt";
      quickPick.placeholder = `搜索Prompt... (Enter=${actionText}, ⚙️按钮=操作菜单)`;
      quickPick.items = quickPickItems;
      quickPick.matchOnDescription = true;
      quickPick.matchOnDetail = true;
      quickPick.canSelectMany = false;

      return new Promise<PromptItem | undefined>((resolve) => {
        let isShowingActionMenu = false;

        // 处理键盘事件
        quickPick.onDidTriggerButton(() => {
          // 可以在这里添加按钮相关的处理
        });

        quickPick.onDidAccept(() => {
          if (!isShowingActionMenu && quickPick.selectedItems.length > 0) {
            const selected = quickPick.selectedItems[0];
            quickPick.hide();
            resolve(selected.promptItem);
          }
        });

        quickPick.onDidHide(() => {
          if (!isShowingActionMenu) {
            quickPick.dispose();
            resolve(undefined);
          }
        });

        // 添加操作按钮
        quickPick.buttons = [
          {
            iconPath: new vscode.ThemeIcon("gear"),
            tooltip: "显示选中Prompt的操作菜单 (编辑、删除等)",
          },
          {
            iconPath: new vscode.ThemeIcon("question"),
            tooltip: "显示使用帮助",
          },
        ];

        quickPick.onDidTriggerButton(async (button) => {
          const buttonIndex = quickPick.buttons.indexOf(button);

          if (buttonIndex === 0) {
            // 齿轮按钮 - 显示操作菜单
            if (quickPick.activeItems.length > 0) {
              isShowingActionMenu = true;
              const selected = quickPick.activeItems[0];
              quickPick.hide();

              setTimeout(async () => {
                const action = await this.showPromptActionMenu(selected.promptItem);

                if (action) {
                  // 导入PromptManager来处理操作
                  const { PromptManager } = await import("../models/PromptManager");
                  const promptManager = PromptManager.getInstance();

                  switch (action) {
                    case "edit":
                      const edited = await this.showPromptEditor(selected.promptItem);
                      if (edited) {
                        await promptManager.updatePrompt(edited);
                        await this.showInfo(`Prompt "${edited.title}" 更新成功`);
                      }
                      resolve(edited);
                      break;

                    case "delete":
                      const confirmed = await this.showConfirmDialog(
                        `确定要删除Prompt "${selected.promptItem.title}" 吗？`
                      );
                      if (confirmed) {
                        await promptManager.deletePrompt(selected.promptItem.id);
                        await this.showInfo(`Prompt "${selected.promptItem.title}" 已删除`);
                      }
                      resolve(undefined);
                      break;
                    default:
                      resolve(undefined);
                  }
                } else {
                  resolve(undefined);
                }
              }, 100);
            } else {
              await this.showInfo("请先选择一个Prompt再点击操作按钮");
            }
          } else if (buttonIndex === 1) {
            // 问号按钮 - 显示帮助
            await this.showInfo(
              `💡 使用提示：\n\n📝 快速操作：\n- Enter键：${actionText}选中的Prompt\n- 点击⚙️按钮：显示选中Prompt的操作菜单\n\n🛠️ 编辑删除Prompt：\n- 使用主菜单中的"编辑/删除Prompt"选项\n- 提供完整的管理界面，支持编辑、删除等\n\n⚡ 操作菜单功能：\n- 复制到剪贴板\n- 编辑Prompt内容\n- 删除Prompt\n\n🔍 搜索技巧：\n- 支持标题、描述、标签的模糊搜索\n\n⚙️ 配置提示：\n- 可在插件设置中修改默认操作（复制/发送到Chat）`
            );
          }
        });

        quickPick.show();
      });
    } catch (error) {
      console.error("显示Prompt选择器失败:", error);
      await this.showError("显示Prompt列表失败");
      return undefined;
    }
  }

  /**
   * 显示Prompt编辑界面
   * @param prompt 要编辑的Prompt，如果为空则创建新的
   * @param editorType 编辑器类型，默认为webview
   * @param context 扩展上下文（用于WebView编辑器）
   * @returns 编辑后的Prompt，如果取消则返回undefined
   */
  async showPromptEditor(
    prompt?: PromptItem,
    editorType?: "webview" | "popup",
    context?: vscode.ExtensionContext
  ): Promise<PromptItem | undefined> {
    try {
      // 确定使用哪种编辑器
      let useWebView = false;
      
      if (editorType !== undefined) {
        // 如果明确指定了编辑器类型
        useWebView = editorType === "webview";
      } else {
        // 从配置中读取用户偏好
        const config = vscode.workspace.getConfiguration("promptManager");
        const configuredType = config.get<string>("editorType", UI_CONSTANTS.EDITOR.DEFAULT_TYPE);
        useWebView = configuredType === "webview";
      }

      if (useWebView) {
        return await this.showWebViewEditor(prompt, context);
      } else {
        return await this.showPopupEditor(prompt);
      }
    } catch (error) {
      console.error("显示Prompt编辑器失败:", error);
      await this.showError("显示编辑界面失败");
      return undefined;
    }
  }

  /**
   * 显示WebView编辑器
   * @param prompt 要编辑的Prompt，如果为空则创建新的
   * @param context 扩展上下文
   * @returns 编辑后的Prompt，如果取消则返回undefined
   */
  async showWebViewEditor(
    prompt?: PromptItem,
    context?: vscode.ExtensionContext
  ): Promise<PromptItem | undefined> {
    try {
      const webViewEditorService = WebViewEditorService.getInstance();
      return await webViewEditorService.showEditor(prompt, context);
    } catch (error) {
      console.error("显示WebView编辑器失败:", error);
      await this.showError("WebView编辑器启动失败，将使用弹窗编辑器");
      return await this.showPopupEditor(prompt);
    }
  }

  /**
   * 显示弹窗编辑器（原有实现）
   * @param prompt 要编辑的Prompt，如果为空则创建新的
   * @returns 编辑后的Prompt，如果取消则返回undefined
   */
  async showPopupEditor(prompt?: PromptItem): Promise<PromptItem | undefined> {
    try {
      const isEditing = !!prompt;
      const title = isEditing ? `编辑Prompt: ${prompt.title}` : "创建新Prompt";

      // 步骤1: 输入标题
      const promptTitle = await vscode.window.showInputBox({
        title: title,
        prompt: "请输入Prompt标题",
        placeHolder: UI_CONSTANTS.INPUT_BOX.TITLE_PLACEHOLDER,
        value: prompt?.title || "",
        validateInput: (value) => {
          if (!value || value.trim() === "") {
            return "Prompt标题不能为空";
          }
          if (value.length > 100) {
            return "Prompt标题不能超过100个字符";
          }
          return null;
        },
      });

      if (!promptTitle) {
        return undefined;
      }

      // 步骤2: 输入内容
      const promptContent = await vscode.window.showInputBox({
        title: title,
        prompt: "请输入Prompt内容",
        placeHolder: UI_CONSTANTS.INPUT_BOX.CONTENT_PLACEHOLDER,
        value: prompt?.content || "",
        validateInput: (value) => {
          if (!value || value.trim() === "") {
            return "Prompt内容不能为空";
          }
          return null;
        },
      });

      if (!promptContent) {
        return undefined;
      }

      // 步骤3: 输入描述（可选）
      const promptDescription = await vscode.window.showInputBox({
        title: title,
        prompt: "请输入Prompt描述（可选）",
        placeHolder: UI_CONSTANTS.INPUT_BOX.DESCRIPTION_PLACEHOLDER,
        value: prompt?.description || "",
      });

      // 步骤4: 输入标签（可选）
      const tagsInput = await vscode.window.showInputBox({
        title: title,
        prompt: "请输入标签，用逗号分隔（可选）",
        placeHolder: UI_CONSTANTS.INPUT_BOX.TAGS_PLACEHOLDER,
        value: prompt?.tags?.join(", ") || "",
      });

      // 解析标签
      const tags = tagsInput
        ? tagsInput
            .split(/[,，]/)
            .map((tag) => tag.trim())
            .filter((tag) => tag.length > 0)
        : prompt?.tags || [];

      // 步骤5: 选择分类（可选）
      let selectedCategoryId = prompt?.categoryId;

      // 导入PromptManager来获取分类列表（需要后续优化这个依赖关系）
      const { PromptManager } = await import("../models/PromptManager");
      const promptManager = PromptManager.getInstance();
      const categories = await promptManager.getStorageService().getCategories();

      if (categories.length > 0) {
        const categoryOptions = [
          { label: "$(folder-opened) 无分类", description: "不分配到任何分类", categoryId: undefined },
          ...categories.map((cat) => ({
            label: `$(symbol-folder) ${cat.name}`,
            description: cat.description || "",
            categoryId: cat.id,
          })),
          { label: "$(plus) 创建新分类", description: "创建一个新的分类", categoryId: "CREATE_NEW" },
        ];

        const selectedCategory = await vscode.window.showQuickPick(categoryOptions, {
          title: title,
          placeHolder: "选择分类（可选）...",
        });

        if (selectedCategory) {
          if (selectedCategory.categoryId === "CREATE_NEW") {
            // 创建新分类的快捷流程
            const newCategoryName = await vscode.window.showInputBox({
              title: "创建新分类",
              prompt: "请输入新分类名称",
              placeHolder: "输入分类名称",
              validateInput: (value) => {
                if (!value || value.trim() === "") {
                  return "分类名称不能为空";
                }
                return null;
              },
            });

            if (newCategoryName) {
              const newCategoryDesc = await vscode.window.showInputBox({
                title: "创建新分类",
                prompt: "请输入分类描述（可选）",
                placeHolder: "输入分类描述",
              });

              // 创建新分类
              await promptManager.addCategory({
                name: newCategoryName.trim(),
                description: newCategoryDesc?.trim(),
                sortOrder: 0,
              });

              // 获取新创建的分类ID（简化实现：根据名称查找）
              const updatedCategories = await promptManager.getStorageService().getCategories();
              const newCategory = updatedCategories.find((cat) => cat.name === newCategoryName.trim());
              selectedCategoryId = newCategory?.id;
            }
          } else {
            selectedCategoryId = selectedCategory.categoryId;
          }
        }
      }

      // 构建结果
      const result: PromptItem = {
        id: prompt?.id || this.generateId(),
        title: promptTitle.trim(),
        content: promptContent.trim(),
        description: promptDescription?.trim() || undefined,
        categoryId: selectedCategoryId,
        tags: tags.length > 0 ? tags : undefined,
        createdAt: prompt?.createdAt || new Date(),
        updatedAt: new Date(),
        usageCount: prompt?.usageCount || 0,
      };

      return result;
    } catch (error) {
      console.error("显示弹窗编辑器失败:", error);
      await this.showError("显示编辑界面失败");
      return undefined;
    }
  }

  /**
   * 显示分类选择列表
   * @param categories 分类数组
   * @returns 选中的分类，如果取消则返回undefined
   */
  async showCategoryPicker(categories: PromptCategory[]): Promise<PromptCategory | undefined> {
    if (!categories || categories.length === 0) {
      await this.showInfo("没有可用的分类");
      return undefined;
    }

    try {
      const items = categories.map((category) => ({
        label: `$(symbol-folder) ${category.name}`,
        description: category.description || "",
        detail: `创建于 ${category.createdAt.toLocaleDateString()}`,
        category: category,
      }));

      const selected = await vscode.window.showQuickPick(items, {
        title: "Prompt Manager - 选择分类",
        placeHolder: "搜索并选择分类...",
        matchOnDescription: true,
        matchOnDetail: true,
      });

      return (selected as any)?.category;
    } catch (error) {
      console.error("显示分类选择器失败:", error);
      await this.showError("显示分类列表失败");
      return undefined;
    }
  }

  /**
   * 显示确认对话框
   * @param message 确认消息
   * @returns 是否确认
   */
  async showConfirmDialog(message: string): Promise<boolean> {
    try {
      const selection = await vscode.window.showWarningMessage(message, { modal: true }, "确定", "取消");
      return selection === "确定";
    } catch (error) {
      console.error("显示确认对话框失败:", error);
      return false;
    }
  }

  /**
   * 显示信息提示
   * @param message 信息内容
   */
  async showInfo(message: string): Promise<void> {
    try {
      await vscode.window.showInformationMessage(message);
    } catch (error) {
      console.error("显示信息提示失败:", error);
    }
  }

  /**
   * 显示错误提示
   * @param message 错误信息
   */
  async showError(message: string): Promise<void> {
    try {
      await vscode.window.showErrorMessage(message);
    } catch (error) {
      console.error("显示错误提示失败:", error);
    }
  }

  /**
   * 显示文件保存对话框
   * @param defaultName 默认文件名
   * @returns 保存路径，如果取消则返回undefined
   */
  async showSaveDialog(defaultName?: string): Promise<string | undefined> {
    try {
      const uri = await vscode.window.showSaveDialog({
        defaultUri: defaultName
          ? vscode.Uri.file(defaultName + FILE_CONSTANTS.EXPORT_EXTENSION)
          : vscode.Uri.file(FILE_CONSTANTS.DEFAULT_EXPORT_NAME + FILE_CONSTANTS.EXPORT_EXTENSION),
        filters: { JSON文件: ["json"] },
        saveLabel: "导出",
      });

      return uri?.fsPath;
    } catch (error) {
      console.error("显示保存对话框失败:", error);
      await this.showError("显示保存对话框失败");
      return undefined;
    }
  }

  /**
   * 显示文件打开对话框
   * @returns 文件路径，如果取消则返回undefined
   */
  async showOpenDialog(): Promise<string | undefined> {
    try {
      const uris = await vscode.window.showOpenDialog({
        canSelectFiles: true,
        canSelectFolders: false,
        canSelectMany: false,
        filters: { JSON文件: ["json"] },
        openLabel: "导入",
      });

      return uris && uris.length > 0 ? uris[0].fsPath : undefined;
    } catch (error) {
      console.error("显示打开对话框失败:", error);
      await this.showError("显示打开对话框失败");
      return undefined;
    }
  }

  /**
   * 显示多选Prompt列表
   * @param prompts Prompt数组
   * @returns 选中的Prompt数组，如果取消则返回undefined
   */
  async showMultiPromptPicker(prompts: PromptItem[]): Promise<PromptItem[] | undefined> {
    if (!prompts || prompts.length === 0) {
      await this.showInfo("没有可用的Prompt");
      return undefined;
    }

    try {
      const quickPickItems: QuickPickPromptItem[] = prompts
        .slice(0, PERFORMANCE_CONSTANTS.MAX_QUICK_PICK_ITEMS)
        .map((prompt) => ({
          label: `$(symbol-text) ${prompt.title}`,
          description: prompt.description || "",
          detail: this.formatPromptDetail(prompt),
          promptItem: prompt,
          picked: false,
        }));

      const quickPick = vscode.window.createQuickPick<QuickPickPromptItem>();
      quickPick.title = "Prompt Manager - 选择多个Prompt";
      quickPick.placeholder = "搜索并选择Prompt（可多选）...";
      quickPick.items = quickPickItems;
      quickPick.canSelectMany = true;
      quickPick.matchOnDescription = true;
      quickPick.matchOnDetail = true;

      return new Promise<PromptItem[] | undefined>((resolve) => {
        quickPick.onDidAccept(() => {
          const selected = quickPick.selectedItems.map((item) => item.promptItem);
          quickPick.hide();
          resolve(selected);
        });

        quickPick.onDidHide(() => {
          quickPick.dispose();
          resolve(undefined);
        });

        quickPick.show();
      });
    } catch (error) {
      console.error("显示多选Prompt列表失败:", error);
      await this.showError("显示Prompt列表失败");
      return undefined;
    }
  }

  /**
   * 显示操作菜单
   * @param promptItem 目标Prompt
   * @returns 选中的操作
   */
  async showPromptActionMenu(promptItem: PromptItem): Promise<string | undefined> {
    try {
      const actions = [
        {
          label: "$(edit) 编辑",
          description: "编辑Prompt内容",
          action: "edit",
        },

        {
          label: "$(trash) 删除",
          description: "删除这个Prompt",
          action: "delete",
        },
      ];

      const selected = await vscode.window.showQuickPick(actions, {
        title: `操作: ${promptItem.title}`,
        placeHolder: "选择要执行的操作...",
      });

      return selected?.action;
    } catch (error) {
      console.error("显示操作菜单失败:", error);
      return undefined;
    }
  }

  /**
   * 显示分类编辑界面
   * @param category 要编辑的分类，如果为空则创建新的
   * @returns 编辑后的分类，如果取消则返回undefined
   */
  async showCategoryEditor(category?: PromptCategory): Promise<PromptCategory | undefined> {
    try {
      const isEditing = !!category;
      const title = isEditing ? `编辑分类: ${category.name}` : "创建新分类";

      // 步骤1: 输入分类名称
      const categoryName = await vscode.window.showInputBox({
        title: title,
        prompt: "请输入分类名称",
        placeHolder: "输入分类名称",
        value: category?.name || "",
        validateInput: (value) => {
          if (!value || value.trim() === "") {
            return "分类名称不能为空";
          }
          if (value.length > 50) {
            return "分类名称不能超过50个字符";
          }
          return null;
        },
      });

      if (!categoryName) {
        return undefined;
      }

      // 步骤2: 输入分类描述
      const categoryDescription = await vscode.window.showInputBox({
        title: title,
        prompt: "请输入分类描述（可选）",
        placeHolder: "输入分类描述",
        value: category?.description || "",
      });

      if (categoryDescription === undefined) {
        return undefined;
      }

      // 步骤3: 选择图标
      const iconOptions = [
        // 基础分类图标
        { label: "📁 folder", description: "标准文件夹图标", icon: "folder" },
        { label: "📂 folder-opened", description: "打开的文件夹", icon: "folder-opened" },
        { label: "🗂️ folder-library", description: "资源库文件夹", icon: "folder-library" },

        // 功能性图标
        { label: "🔧 tools", description: "工具相关", icon: "tools" },
        { label: "📝 edit", description: "编辑相关", icon: "edit" },
        { label: "⚙️ gear", description: "设置配置", icon: "gear" },
        { label: "🎯 target", description: "目标导向", icon: "target" },
        { label: "💡 lightbulb", description: "创意灵感", icon: "lightbulb" },

        // 开发相关图标
        { label: "💻 code", description: "编程开发", icon: "code" },
        { label: "🐛 debug", description: "调试相关", icon: "debug" },
        { label: "🔍 search", description: "搜索查找", icon: "search" },
        { label: "🔗 link", description: "关联链接", icon: "link" },

        // 文档相关图标
        { label: "📄 file-text", description: "文本文档", icon: "file-text" },
        { label: "📊 graph", description: "图表数据", icon: "graph" },
        { label: "📚 book", description: "知识文档", icon: "book" },
        { label: "📋 checklist", description: "任务清单", icon: "checklist" },

        // 特殊用途图标
        { label: "⭐ star", description: "重要收藏", icon: "star" },
        { label: "🚀 rocket", description: "快速启动", icon: "rocket" },
        { label: "🏷️ tag", description: "标签分类", icon: "tag" },
        { label: "🎨 paintbrush", description: "创作设计", icon: "paintbrush" },
      ];

      const selectedIcon = await vscode.window.showQuickPick(iconOptions, {
        title: title,
        placeHolder: "选择分类图标",
      });

      const icon = selectedIcon?.icon || category?.icon || "folder";

      // 构建结果
      const result: PromptCategory = {
        id: category?.id || this.generateId(),
        name: categoryName.trim(),
        description: categoryDescription.trim() || undefined,
        icon: icon,
        sortOrder: category?.sortOrder || 0,
        createdAt: category?.createdAt || new Date(),
      };

      return result;
    } catch (error) {
      console.error("显示分类编辑器失败:", error);
      await this.showError("显示分类编辑界面失败");
      return undefined;
    }
  }

  /**
   * 显示分类操作菜单
   * @param category 分类对象
   * @returns 选中的操作，如果取消则返回undefined
   */
  async showCategoryActionMenu(category: PromptCategory): Promise<string | undefined> {
    try {
      const actions = [
        {
          label: "$(edit) 编辑分类信息",
          description: "修改分类名称、描述和图标",
          action: "edit",
        },
        {
          label: "$(symbol-text) 重命名分类",
          description: "快速重命名分类",
          action: "rename",
        },
        {
          label: "$(export) 导出分类",
          description: "导出该分类下的所有Prompt",
          action: "export",
        },
        {
          label: "$(trash) 删除分类",
          description: "删除分类（其下的Prompt将变为未分类）",
          action: "delete",
        },
      ];

      const selected = await vscode.window.showQuickPick(actions, {
        title: `分类操作: ${category.name}`,
        placeHolder: "选择要执行的操作...",
      });

      return selected?.action;
    } catch (error) {
      console.error("显示分类操作菜单失败:", error);
      await this.showError("显示操作菜单失败");
      return undefined;
    }
  }

  // 私有方法

  /**
   * 格式化Prompt详情显示
   */
  private formatPromptDetail(prompt: PromptItem): string {
    const parts: string[] = [];

    if (prompt.categoryId) {
      parts.push(`📁 ${prompt.categoryId}`);
    } else {
      parts.push(`📁 无分类`);
    }

    if (prompt.tags && prompt.tags.length > 0) {
      parts.push(`🏷️ ${prompt.tags.join(", ")}`);
    }

    if (prompt.usageCount && prompt.usageCount > 0) {
      parts.push(`🚀 ${prompt.usageCount}次`);
    }

    parts.push(`🕒 ${prompt.updatedAt.toLocaleDateString()}`);

    return parts.join(" | ");
  }

  /**
   * 生成唯一ID
   */
  private generateId(): string {
    return "prompt_" + Date.now().toString(36) + Math.random().toString(36).substr(2);
  }
}
