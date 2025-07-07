import { IChatIntegrationService } from "./interfaces/IChatIntegrationService";
import { IEditorEnvironmentDetector, EditorEnvironmentType } from "./interfaces/IEditorEnvironmentDetector";
import { EditorEnvironmentDetector } from "./EditorEnvironmentDetector";
import { CursorIntegrationService } from "./CursorIntegrationService";
import { VSCodeIntegrationService } from "./VSCodeIntegrationService";

/**
 * Chat集成工厂服务
 * 负责根据当前编辑器环境创建相应的Chat集成服务实例
 */
export class ChatIntegrationFactory {
  private static instance: ChatIntegrationFactory;
  private readonly environmentDetector: IEditorEnvironmentDetector;
  private readonly services: Map<EditorEnvironmentType, IChatIntegrationService>;

  private constructor() {
    this.environmentDetector = EditorEnvironmentDetector.getInstance();
    this.services = new Map();
    this.initializeServices();
  }

  public static getInstance(): ChatIntegrationFactory {
    if (!ChatIntegrationFactory.instance) {
      ChatIntegrationFactory.instance = new ChatIntegrationFactory();
    }
    return ChatIntegrationFactory.instance;
  }

  /**
   * 获取当前环境的Chat集成服务
   * @returns Chat集成服务实例，如果当前环境不支持则返回null
   */
  public getCurrentChatService(): IChatIntegrationService | null {
    const currentType = this.environmentDetector.detectEnvironment();
    return this.getChatService(currentType);
  }

  /**
   * 获取指定环境类型的Chat集成服务
   * @param type 编辑器环境类型
   * @returns Chat集成服务实例，如果不支持则返回null
   */
  public getChatService(type: EditorEnvironmentType): IChatIntegrationService | null {
    return this.services.get(type) || null;
  }

  /**
   * 获取所有可用的Chat集成服务
   * @returns Chat集成服务数组
   */
  public getAllChatServices(): IChatIntegrationService[] {
    return Array.from(this.services.values());
  }

  /**
   * 获取当前环境支持的Chat集成服务列表
   * @returns 支持的Chat集成服务数组
   */
  public async getAvailableChatServices(): Promise<IChatIntegrationService[]> {
    const availableServices: IChatIntegrationService[] = [];

    for (const service of this.services.values()) {
      if (service.isEditorEnvironment()) {
        try {
          const status = await service.getIntegrationStatus();
          if (status.isEditorEnvironment) {
            availableServices.push(service);
          }
        } catch (error) {
          console.warn(`检查服务可用性失败: ${service.getEditorType()}`, error);
        }
      }
    }

    return availableServices;
  }

  /**
   * 检查当前环境是否支持Chat集成
   * @returns 是否支持Chat集成
   */
  public async isCurrentEnvironmentSupported(): Promise<boolean> {
    const currentService = this.getCurrentChatService();
    if (!currentService) {
      return false;
    }

    try {
      const status = await currentService.getIntegrationStatus();
      return status.isEditorEnvironment;
    } catch (error) {
      console.error("检查当前环境支持失败:", error);
      return false;
    }
  }

  /**
   * 注册新的Chat集成服务
   * @param type 编辑器环境类型
   * @param service Chat集成服务实例
   */
  public registerChatService(type: EditorEnvironmentType, service: IChatIntegrationService): void {
    this.services.set(type, service);
  }

  /**
   * 移除Chat集成服务
   * @param type 编辑器环境类型
   */
  public unregisterChatService(type: EditorEnvironmentType): void {
    this.services.delete(type);
  }

  /**
   * 获取环境检测器实例
   * @returns 环境检测器实例
   */
  public getEnvironmentDetector(): IEditorEnvironmentDetector {
    return this.environmentDetector;
  }

  /**
   * 初始化默认的Chat集成服务
   */
  private initializeServices(): void {
    // 注册Cursor集成服务
    this.services.set(EditorEnvironmentType.CURSOR, CursorIntegrationService.getInstance());

    // 注册VSCode集成服务
    this.services.set(EditorEnvironmentType.VSCODE, VSCodeIntegrationService.getInstance());
  }
}
