/**
 * Chat集成选项接口
 */
export interface ChatIntegrationOptions {
  prompt: string;
  title?: string;
  includeTitle?: boolean;
  addContext?: boolean;
}

/**
 * Chat集成状态接口
 */
export interface ChatIntegrationStatus {
  isEditorEnvironment: boolean;
  isCommandAvailable: boolean;
  hasActiveEditor: boolean;
}

/**
 * Chat集成服务抽象接口
 * 定义所有编辑器Chat集成的统一行为规范
 */
export interface IChatIntegrationService {
  /**
   * 检测是否运行在支持的编辑器环境中
   */
  isEditorEnvironment(): boolean;

  /**
   * 发送prompt到编辑器Chat窗口
   * @param options Chat集成选项
   * @returns 是否发送成功
   */
  sendToChat(options: ChatIntegrationOptions): Promise<boolean>;

  /**
   * 检查Chat命令是否可用
   * @returns Chat命令可用性
   */
  isChatCommandAvailable(): Promise<boolean>;

  /**
   * 获取集成状态
   * @returns 当前集成状态信息
   */
  getIntegrationStatus(): Promise<ChatIntegrationStatus>;

  /**
   * 获取编辑器类型标识
   * @returns 编辑器类型字符串
   */
  getEditorType(): string;
}
