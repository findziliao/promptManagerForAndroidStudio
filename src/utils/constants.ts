/**
 * Prompt Manager 常量定义
 */

/** 插件命令常量 */
export const COMMANDS = {
  SHOW_PROMPTS: "prompt-manager.showPrompts",
  ADD_PROMPT: "prompt-manager.addPrompt",
  MANAGE_PROMPTS: "prompt-manager.managePrompts",
  EXPORT_PROMPTS: "prompt-manager.exportPrompts",
  IMPORT_PROMPTS: "prompt-manager.importPrompts",
  // TreeView相关命令
  REFRESH_TREE: "prompt-manager.refreshTree",
  ADD_PROMPT_FROM_TREE: "prompt-manager.addPromptFromTree",
  EDIT_PROMPT_FROM_TREE: "prompt-manager.editPromptFromTree",
  DELETE_PROMPT_FROM_TREE: "prompt-manager.deletePromptFromTree",
  COPY_PROMPT_FROM_TREE: "prompt-manager.copyPromptFromTree",
  // 搜索相关命令
  SEARCH_PROMPTS: "prompt-manager.searchPrompts",
  CLEAR_SEARCH: "prompt-manager.clearSearch",
  // 分类操作相关命令
  EDIT_CATEGORY_FROM_TREE: "prompt-manager.editCategoryFromTree",
  ADD_PROMPT_TO_CATEGORY_FROM_TREE: "prompt-manager.addPromptToCategoryFromTree",
  EXPORT_CATEGORY_FROM_TREE: "prompt-manager.exportCategoryFromTree",
  DELETE_CATEGORY_FROM_TREE: "prompt-manager.deleteCategoryFromTree",
  // 空白区域右键菜单命令
  ADD_CATEGORY_FROM_TREE: "prompt-manager.addCategoryFromTree",
  // Chat集成相关命令
  SEND_TO_CHAT: "prompt-manager.sendToChat",
  SEND_TO_CHAT_FROM_TREE: "prompt-manager.sendToChatFromTree",
  // 设置相关命令
  OPEN_SETTINGS: "prompt-manager.openSettings",
  // 数据管理相关命令
  REINITIALIZE_DEFAULT_DATA: "prompt-manager.reinitializeDefaultData",
} as const;

/** 存储键常量 */
export const STORAGE_KEYS = {
  PROMPTS: "prompt-manager.prompts",
  CATEGORIES: "prompt-manager.categories",
  SETTINGS: "prompt-manager.settings",
} as const;

/** 默认分类 */
export const DEFAULT_CATEGORIES = {
  GENERAL: {
    id: "general",
    name: "通用",
    description: "通用Prompt模板",
    icon: "symbol-misc",
    sortOrder: 0,
    createdAt: new Date(),
  },
  CODING: {
    id: "coding",
    name: "编程",
    description: "编程相关Prompt模板",
    icon: "code",
    sortOrder: 1,
    createdAt: new Date(),
  },
  WRITING: {
    id: "writing",
    name: "写作",
    description: "写作相关Prompt模板",
    icon: "book",
    sortOrder: 2,
    createdAt: new Date(),
  },
  DEBUG: {
    id: "debug",
    name: "调试",
    description: "调试相关Prompt模板",
    icon: "bug",
    sortOrder: 3,
    createdAt: new Date(),
  },
} as const;

/** 默认示例Prompt */
export const DEFAULT_PROMPTS = [
  {
    id: "sample-1",
    title: "代码审查",
    content:
      "请审查以下代码，重点关注：\n1. 代码质量和可读性\n2. 潜在的bug和性能问题\n3. 最佳实践的遵循情况\n4. 安全性考虑\n\n代码：\n```\n[在此处粘贴代码]\n```",
    description: "用于代码审查的标准模板",
    categoryId: "coding",
    tags: ["代码", "审查", "质量"],
    createdAt: new Date(),
    updatedAt: new Date(),
    usageCount: 0,
  },
  {
    id: "sample-2",
    title: "技术文档写作",
    content:
      "请帮我写一份关于 [主题] 的技术文档，包括：\n1. 概述和目标\n2. 技术架构说明\n3. 实现细节\n4. 使用示例\n5. 注意事项和最佳实践\n\n请确保文档清晰易懂，适合技术人员阅读。",
    description: "技术文档写作模板",
    categoryId: "writing",
    tags: ["文档", "技术", "写作"],
    createdAt: new Date(),
    updatedAt: new Date(),
    usageCount: 0,
  },
  {
    id: "sample-3",
    title: "问题分析",
    content:
      "请帮我分析以下问题：\n\n问题描述：[描述问题]\n\n请从以下角度进行分析：\n1. 问题的根本原因\n2. 可能的解决方案\n3. 每个方案的优缺点\n4. 推荐的最佳解决方案\n5. 实施建议和注意事项",
    description: "问题分析的标准框架",
    categoryId: "general",
    tags: ["分析", "问题", "解决方案"],
    createdAt: new Date(),
    updatedAt: new Date(),
    usageCount: 0,
  },
  {
    id: "sample-4",
    title: "代码优化",
    content: "请优化以下代码，重点关注：\n1. 代码质量和可读性\n2. 潜在的bug和性能问题\n3. 最佳实践的遵循情况\n4. 安全性考虑\n\n代码：\n```\n[在此处粘贴代码]\n```",
    description: "用于代码优化的标准模板",
    categoryId: "coding",
    tags: ["分析", "问题", "解决方案"],
    createdAt: new Date(),
    updatedAt: new Date(),
    usageCount: 0,
  },
  {
    id: "sample-5",
    categoryId: "debug",
    title: "调试",
    content: "请帮我调试以下代码：\n\n代码：\n```\n[在此处粘贴代码]\n```",
    description: "用于调试的标准模板",
    tags: ["分析", "问题", "解决方案"],
    createdAt: new Date(),
    updatedAt: new Date(),
    usageCount: 0,
  },
] as const;

/** UI 相关常量 */
export const UI_CONSTANTS = {
  QUICK_PICK: {
    PLACEHOLDER: "搜索并选择Prompt模板...",
    NO_ITEMS_LABEL: "没有找到匹配的Prompt",
    LOADING_LABEL: "正在加载...",
  },
  INPUT_BOX: {
    TITLE_PLACEHOLDER: "输入Prompt标题",
    CONTENT_PLACEHOLDER: "输入Prompt内容",
    DESCRIPTION_PLACEHOLDER: "输入描述（可选）",
    TAGS_PLACEHOLDER: "输入标签，用逗号分隔（可选）",
  },
  EDITOR: {
    DEFAULT_TYPE: "webview", // 默认使用 WebView 编辑器
    TYPES: {
      WEBVIEW: "webview",
      POPUP: "popup",
    },
  },
  MESSAGES: {
    COPY_SUCCESS: "Prompt已复制到剪贴板",
    SAVE_SUCCESS: "Prompt保存成功",
    DELETE_SUCCESS: "Prompt删除成功",
    EXPORT_SUCCESS: "导出成功",
    IMPORT_SUCCESS: "导入成功",
    OPERATION_CANCELLED: "操作已取消",
    CONFIRM_DELETE: "确定要删除这个Prompt吗？",
    CONFIRM_CLEAR_ALL: "确定要清空所有数据吗？此操作不可恢复！",
  },
  ERRORS: {
    GENERIC: "操作失败，请重试",
    INVALID_INPUT: "输入无效",
    FILE_NOT_FOUND: "文件未找到",
    INVALID_FILE_FORMAT: "文件格式无效",
    SAVE_FAILED: "保存失败",
    LOAD_FAILED: "加载失败",
    EXPORT_FAILED: "导出失败",
    IMPORT_FAILED: "导入失败",
    CLIPBOARD_FAILED: "剪贴板操作失败",
  },
} as const;

/** 文件相关常量 */
export const FILE_CONSTANTS = {
  EXPORT_EXTENSION: ".json",
  EXPORT_FILTER: {
    JSON文件: ["json"],
  },
  DEFAULT_EXPORT_NAME: "prompt-manager-export",
  SUPPORTED_VERSIONS: ["1.0.0"],
  CURRENT_VERSION: "1.0.0",
} as const;

/** 性能相关常量 */
export const PERFORMANCE_CONSTANTS = {
  /** 搜索防抖延迟（毫秒） */
  SEARCH_DEBOUNCE_DELAY: 300,
  /** 最大显示项目数 */
  MAX_QUICK_PICK_ITEMS: 100,
  /** 批量操作的分页大小 */
  BATCH_SIZE: 50,
} as const;

/** TreeView相关常量 */
export const TREE_VIEW = {
  /** 视图容器ID */
  CONTAINER_ID: "prompt-manager",
  /** TreeView视图ID */
  VIEW_ID: "prompt-manager.promptTree",
  /** 视图名称 */
  VIEW_NAME: "Prompts",
} as const;

/** TreeView上下文值常量 */
export const TREE_CONTEXT_VALUES = {
  /** Prompt项目 */
  PROMPT_ITEM: "promptItem",
  /** 分类项目 */
  CATEGORY_ITEM: "categoryItem",
} as const;

/** TreeView图标常量 */
export const TREE_ICONS = {
  /** 分类图标 */
  CATEGORY: "folder",
  /** Prompt项目图标 */
  PROMPT: "file",
  /** 刷新图标 */
  REFRESH: "refresh",
  /** 添加图标 */
  ADD: "add",
  /** 编辑图标 */
  EDIT: "edit",
  /** 删除图标 */
  DELETE: "trash",
  /** 复制图标 */
  COPY: "copy",
} as const;

/** TreeView特殊分类ID */
export const TREE_SPECIAL_CATEGORIES = {
  /** 未分类ID */
  UNCATEGORIZED: "__uncategorized__",
} as const;
