import * as vscode from "vscode";
import { IStorageService, PromptItem, PromptCategory, OperationResult } from "../types";
import { STORAGE_KEYS, DEFAULT_CATEGORIES, DEFAULT_PROMPTS } from "../utils/constants";

/**
 * 存储服务实现
 * 封装VSCode存储API，提供数据持久化功能
 */
export class StorageService implements IStorageService {
  private context: vscode.ExtensionContext;
  private initialized = false;

  constructor(context: vscode.ExtensionContext) {
    this.context = context;
  }

  /**
   * 初始化存储服务
   * 如果是首次使用，会创建默认数据
   */
  async initialize(): Promise<void> {
    if (this.initialized) {
      return;
    }

    try {
      // 检查是否已有数据
      const existingPrompts = await this.getPrompts();
      const existingCategories = await this.getCategories();

      // 如果没有数据，创建默认数据
      if (existingPrompts.length === 0) {
        console.log("首次使用，创建默认Prompt数据");
        for (const prompt of DEFAULT_PROMPTS) {
          // 类型转换以解决readonly兼容性问题
          const promptItem: PromptItem = {
            ...prompt,
            tags: prompt.tags ? [...prompt.tags] : undefined,
          };
          await this.savePrompt(promptItem);
        }
      }

      if (existingCategories.length === 0) {
        console.log("首次使用，创建默认分类数据");
        for (const category of Object.values(DEFAULT_CATEGORIES)) {
          await this.saveCategory(category);
        }
      }

      this.initialized = true;
      console.log("StorageService初始化完成");
    } catch (error) {
      console.error("StorageService初始化失败:", error);
      throw error;
    }
  }

  /**
   * 获取所有Prompt
   */
  async getPrompts(): Promise<PromptItem[]> {
    try {
      const stored = this.context.globalState.get<PromptItem[]>(STORAGE_KEYS.PROMPTS, []);

      // 确保日期对象正确反序列化
      return stored.map((prompt) => ({
        ...prompt,
        createdAt: prompt.createdAt ? new Date(prompt.createdAt) : undefined,
        updatedAt: prompt.updatedAt ? new Date(prompt.updatedAt) : undefined,
      }));
    } catch (error) {
      console.error("获取Prompts失败:", error);
      return [];
    }
  }

  /**
   * 根据ID获取特定Prompt
   */
  async getPrompt(id: string): Promise<PromptItem | undefined> {
    try {
      const prompts = await this.getPrompts();
      return prompts.find((prompt) => prompt.id === id);
    } catch (error) {
      console.error("获取Prompt失败:", error);
      return undefined;
    }
  }

  /**
   * 保存Prompt（新增或更新）
   */
  async savePrompt(prompt: PromptItem): Promise<void> {
    try {
      const prompts = await this.getPrompts();
      const existingIndex = prompts.findIndex((p) => p.id === prompt.id);

      if (existingIndex >= 0) {
        // 更新现有Prompt
        prompts[existingIndex] = {
          ...prompt,
        };
      } else {
        // 添加新Prompt
        prompts.push({
          ...prompt,
        });
      }

      await this.context.globalState.update(STORAGE_KEYS.PROMPTS, prompts);
      console.log(`Prompt保存成功: ${prompt.title}`);
    } catch (error) {
      console.error("保存Prompt失败:", error);
      throw error;
    }
  }

  /**
   * 删除Prompt
   */
  async deletePrompt(id: string): Promise<void> {
    try {
      const prompts = await this.getPrompts();
      const filteredPrompts = prompts.filter((prompt) => prompt.id !== id);

      if (filteredPrompts.length === prompts.length) {
        throw new Error(`未找到ID为 ${id} 的Prompt`);
      }

      await this.context.globalState.update(STORAGE_KEYS.PROMPTS, filteredPrompts);
      console.log(`Prompt删除成功: ${id}`);
    } catch (error) {
      console.error("删除Prompt失败:", error);
      throw error;
    }
  }

  /**
   * 获取所有分类
   */
  async getCategories(): Promise<PromptCategory[]> {
    try {
      const stored = this.context.globalState.get<PromptCategory[]>(STORAGE_KEYS.CATEGORIES, []);

      // 确保日期对象正确反序列化
      return stored.map((category) => ({
        ...category,
        createdAt: category.createdAt ? new Date(category.createdAt) : undefined,
      }));
    } catch (error) {
      console.error("获取分类失败:", error);
      return [];
    }
  }

  /**
   * 保存分类（新增或更新）
   */
  async saveCategory(category: PromptCategory): Promise<void> {
    try {
      const categories = await this.getCategories();
      const existingIndex = categories.findIndex((c) => c.id === category.id);

      if (existingIndex >= 0) {
        // 更新现有分类
        categories[existingIndex] = category;
      } else {
        // 添加新分类
        categories.push({
          ...category,
          createdAt: category.createdAt || new Date(),
          sortOrder: category.sortOrder ?? categories.length,
        });
      }

      await this.context.globalState.update(STORAGE_KEYS.CATEGORIES, categories);
      console.log(`分类保存成功: ${category.name}`);
    } catch (error) {
      console.error("保存分类失败:", error);
      throw error;
    }
  }

  /**
   * 删除分类
   */
  async deleteCategory(id: string): Promise<void> {
    try {
      const categories = await this.getCategories();
      const filteredCategories = categories.filter((category) => category.id !== id);

      if (filteredCategories.length === categories.length) {
        throw new Error(`未找到ID为 ${id} 的分类`);
      }

      // 同时清除相关Prompt的分类引用
      const prompts = await this.getPrompts();
      const updatedPrompts = prompts.map((prompt) =>
        prompt.categoryId === id ? { ...prompt, categoryId: undefined } : prompt
      );

      await Promise.all([
        this.context.globalState.update(STORAGE_KEYS.CATEGORIES, filteredCategories),
        this.context.globalState.update(STORAGE_KEYS.PROMPTS, updatedPrompts),
      ]);

      console.log(`分类删除成功: ${id}`);
    } catch (error) {
      console.error("删除分类失败:", error);
      throw error;
    }
  }

  /**
   * 更新分类
   */
  async updateCategory(category: PromptCategory): Promise<void> {
    try {
      const categories = await this.getCategories();
      const existingIndex = categories.findIndex((c) => c.id === category.id);

      if (existingIndex < 0) {
        throw new Error(`未找到ID为 ${category.id} 的分类`);
      }

      // 更新现有分类
      categories[existingIndex] = category;

      await this.context.globalState.update(STORAGE_KEYS.CATEGORIES, categories);
      console.log(`分类更新成功: ${category.name}`);
    } catch (error) {
      console.error("更新分类失败:", error);
      throw error;
    }
  }

  /**
   * 清空所有数据
   */
  async clearAll(): Promise<void> {
    try {
      await Promise.all([
        this.context.globalState.update(STORAGE_KEYS.PROMPTS, []),
        this.context.globalState.update(STORAGE_KEYS.CATEGORIES, []),
        this.context.globalState.update(STORAGE_KEYS.SETTINGS, {}),
      ]);

      console.log("所有数据已清空");
    } catch (error) {
      console.error("清空数据失败:", error);
      throw error;
    }
  }

  /**
   * 批量保存Prompts
   */
  async savePrompts(prompts: PromptItem[]): Promise<OperationResult> {
    try {
      const existingPrompts = await this.getPrompts();
      const mergedPrompts = [...existingPrompts];

      for (const prompt of prompts) {
        const existingIndex = mergedPrompts.findIndex((p) => p.id === prompt.id);
        if (existingIndex >= 0) {
          mergedPrompts[existingIndex] = {
            ...prompt,
          };
        } else {
          mergedPrompts.push({
            ...prompt,
          });
        }
      }

      await this.context.globalState.update(STORAGE_KEYS.PROMPTS, mergedPrompts);

      return {
        success: true,
        data: prompts.length,
      };
    } catch (error) {
      console.error("批量保存Prompts失败:", error);
      return {
        success: false,
        error: "批量保存失败",
        errorCode: "BATCH_SAVE_FAILED",
      };
    }
  }

  /**
   * 批量保存分类
   */
  async saveCategories(categories: PromptCategory[]): Promise<OperationResult> {
    try {
      const existingCategories = await this.getCategories();
      const mergedCategories = [...existingCategories];

      for (const category of categories) {
        const existingIndex = mergedCategories.findIndex((c) => c.id === category.id);
        if (existingIndex >= 0) {
          mergedCategories[existingIndex] = category;
        } else {
          mergedCategories.push({
            ...category,
            createdAt: category.createdAt || new Date(),
            sortOrder: category.sortOrder ?? mergedCategories.length,
          });
        }
      }

      await this.context.globalState.update(STORAGE_KEYS.CATEGORIES, mergedCategories);

      return {
        success: true,
        data: categories.length,
      };
    } catch (error) {
      console.error("批量保存分类失败:", error);
      return {
        success: false,
        error: "批量保存失败",
        errorCode: "BATCH_SAVE_FAILED",
      };
    }
  }

  /**
   * 获取存储统计信息
   */
  async getStorageStats(): Promise<{
    promptCount: number;
    categoryCount: number;
    totalUsage: number;
  }> {
    try {
      const prompts = await this.getPrompts();
      const categories = await this.getCategories();

      return {
        promptCount: prompts.length,
        categoryCount: categories.length,
        totalUsage: prompts.reduce((sum, p) => sum + (p.usageCount || 0), 0),
      };
    } catch (error) {
      console.error("获取存储统计失败:", error);
      return {
        promptCount: 0,
        categoryCount: 0,
        totalUsage: 0,
      };
    }
  }

  /**
   * 增加Prompt使用次数
   */
  async incrementPromptUsage(id: string): Promise<void> {
    try {
      const prompt = await this.getPrompt(id);
      if (prompt) {
        prompt.usageCount = (prompt.usageCount || 0) + 1;
        prompt.updatedAt = new Date();
        await this.savePrompt(prompt);
      }
    } catch (error) {
      console.error("增加使用次数失败:", error);
      // 不抛出错误，避免影响主要功能
    }
  }

  /**
   * 获取详细统计信息（为PromptManager兼容）
   */
  async getStats(): Promise<any> {
    try {
      const prompts = await this.getPrompts();
      const categories = await this.getCategories();

      const totalUsage = prompts.reduce((sum, prompt) => sum + (prompt.usageCount || 0), 0);

      // 最近使用的Prompt（按使用次数和更新时间排序）
      const recentlyUsed = prompts
        .filter((p) => (p.usageCount || 0) > 0)
        .sort((a, b) => {
          const usageA = a.usageCount || 0;
          const usageB = b.usageCount || 0;
          if (usageA !== usageB) {
            return usageB - usageA;
          }
          return new Date(b.updatedAt || 0).getTime() - new Date(a.updatedAt || 0).getTime();
        })
        .slice(0, 10);

      // 热门分类
      const categoryUsage = new Map<string, number>();
      prompts.forEach((prompt) => {
        if (prompt.categoryId) {
          const current = categoryUsage.get(prompt.categoryId) || 0;
          categoryUsage.set(prompt.categoryId, current + (prompt.usageCount || 0));
        }
      });

      const topCategories = Array.from(categoryUsage.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([categoryId]) => categoryId);

      return {
        totalPrompts: prompts.length,
        totalCategories: categories.length,
        totalUsage,
        recentlyUsed,
        topCategories,
      };
    } catch (error) {
      console.error("获取统计信息失败:", error);
      return {
        totalPrompts: 0,
        totalCategories: 0,
        totalUsage: 0,
        recentlyUsed: [],
        topCategories: [],
      };
    }
  }

  /**
   * 更新Prompt（与savePrompt功能相同，为兼容接口）
   */
  async updatePrompt(prompt: PromptItem): Promise<void> {
    return this.savePrompt(prompt);
  }
}
