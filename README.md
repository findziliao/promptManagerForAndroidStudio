**中文** | [English](README.en.md)

# Prompt Manager

<div align="center">
  <img src="https://raw.githubusercontent.com/cursor-project/prompt-manager/main/resources/prompt-manager-logo-2.png" alt="Prompt Manager Logo" width="120" height="120">
  
  **高效管理和快速使用AI Prompt模板的Cursor/VSCode扩展**
  
  [![Version](https://img.shields.io/badge/version-0.0.1-blue.svg)](https://github.com/cursor-project/prompt-manager)
  [![VSCode](https://img.shields.io/badge/VSCode-1.60.0+-green.svg)](https://code.visualstudio.com/)
  [![License](https://img.shields.io/badge/license-MIT-yellow.svg)](https://mit-license.org/)

  ## 作者
  <table align="center" cellpadding="20">
    <tr>
      <td align="center">
        <a href="https://github.com/yuki-node">
          <img src="resources/Yuki.png" width="100" height="100" alt="Yuki">
          <br>
          <strong>Yuki</strong>
        </a>
      </td>
      <td align="center">
        <a href="https://github.com/blackwingss">
          <img src="resources/Jinhui.JPG" width="100" height="100" alt="Jinhui">
          <br>
          <strong>Jinhui</strong>
        </a>
      </td>
      <td align="center">
        <a href="https://cursor.com/">
          <img src="resources/cursor.png" width="100" height="100" alt="Cursor">
          <br>
          <strong>Cursor</strong>
        </a>
      </td>
      <td align="center">
        <a href="https://www.anthropic.com/">
          <img src="resources/claude-color.png" width="100" height="100" alt="Claude">
          <br>
          <strong>Claude</strong>
        </a>
      </td>
    </tr>
  </table>
</div>

## 📋 目录

- [功能特色](#-功能特色)
- [快速开始](#-快速开始)
- [演示](#-演示)
- [核心功能](#-核心功能)
- [界面介绍](#-界面介绍)
- [使用指南](#-使用指南)
- [快捷键](#-快捷键)
- [配置选项](#-配置选项)
- [导入导出](#-导入导出)
- [编辑器集成](#-编辑器集成)
- [技术架构](#-技术架构)
- [常见问题](#-常见问题)
- [支持与反馈](#-支持与反馈)

## ✨ 功能特色

### 🎯 核心亮点
- **📝 完整的Prompt生命周期管理** - 创建、编辑、删除、分类组织
- **🔍 智能搜索** - 支持标题、内容、标签、分类的全文搜索
- **📁 分层分类系统** - 灵活的分类管理，支持无限层级
- **💾 数据导入导出** - JSON格式，支持备份和跨设备同步
- **🔗 多编辑器集成** - 完美适配Cursor、VSCode等主流编辑器
- **💬 Chat集成** - 一键发送Prompt到聊天界面
- **📊 简单管理** - 基于分类的简洁组织结构
- **⚡ 性能优化** - 防抖搜索、懒加载，流畅体验

### 🚀 技术优势
- **TypeScript全栈** - 完整类型系统，开发体验佳
- **事件驱动架构** - 响应式UI更新，实时同步
- **单例模式设计** - 资源高效利用，状态管理清晰
- **工厂模式集成** - 支持多种编辑器环境自动适配
- **异步操作优化** - 非阻塞UI，操作流畅

## 🚀 快速开始

### 安装

1. **从VSCode扩展商店安装**
   ```
   在VSCode中按 Ctrl+Shift+X 打开扩展面板
   搜索 "Prompt Manager"
   点击安装
   ```

2. **本地安装**
   ```bash
   # 下载.vsix文件后
   code --install-extension prompt-manager-0.0.1.vsix
   ```

### 首次使用

1. **激活插件** - 安装后会自动激活，在Activity Bar中看到Prompt Manager图标
2. **浏览默认模板** - 插件预置了代码审查、技术文档、问题分析等常用模板
3. **添加自定义Prompt** - 点击➕按钮或使用快捷键 `Shift+P`
4. **开始使用** - 选择Prompt，自动复制到剪贴板或双击发送到Chat

## 🎥 演示

https://github.com/user-attachments/assets/d56490ff-c262-4ed4-b88c-989afb54ea5d

## 🛠 核心功能

### Prompt管理
- **创建Prompt** - 支持标题、内容、描述、标签、分类
- **编辑Prompt** - 随时修改，自动保存修改时间
- **删除Prompt** - 支持单个删除和批量清理
- **分类管理** - 按分类组织，便于查找和管理

### 分类系统
- **默认分类** - 通用、编程、写作三大基础分类
- **自定义分类** - 创建个性化分类体系
- **分类操作** - 支持编辑、删除、导出整个分类
- **未分类管理** - 自动收集未分类的Prompt

### 搜索与过滤
- **实时搜索** - 输入即搜，支持中英文
- **多字段搜索** - 标题、内容、描述、标签、分类名称
- **搜索高亮** - 清晰显示匹配结果
- **搜索历史** - 记住常用搜索词

## 🎨 界面介绍

### Activity Bar视图
- **Prompt树状列表** - 按分类层次展示所有Prompt
- **右键菜单** - 快速访问编辑、删除、复制等操作
- **搜索框** - 实时过滤显示结果
- **工具按钮** - 添加、刷新、设置等常用功能

### 快速选择器
- **智能排序** - 基于使用频率和更新时间
- **预览信息** - 显示Prompt内容预览
- **分类标识** - 清晰显示所属分类
- **操作提示** - 显示可用的操作方式

## 📖 使用指南

### 基础操作

#### 1. 创建Prompt
```
方式1: Activity Bar → 点击 ➕ 按钮
方式2: 命令面板 → "Prompt Manager: 添加新Prompt"
方式3: 快捷键 Shift+P → 选择"添加新Prompt"
```

#### 2. 使用Prompt
```
方式1: Activity Bar → 双击Prompt项目
方式2: 快捷键 Shift+P → 选择Prompt
方式3: 右键菜单 → "复制到剪贴板" 或 "发送到Chat"
```

#### 3. 管理分类
```
创建分类: Activity Bar空白处右键 → "新增分类"
编辑分类: 分类右键 → "编辑分类"
删除分类: 分类右键 → "删除分类"
```

### 高级功能

#### 智能搜索
```
// 搜索语法示例
代码          # 搜索包含"代码"的所有内容
react hooks   # 搜索React Hooks相关
@编程         # 搜索编程分类下的内容
#bug         # 搜索包含bug标签的Prompt
```

#### 批量操作
```
导出全部: 命令面板 → "Prompt Manager: 导出Prompts"
导出分类: 分类右键 → "导出分类"
导入数据: 命令面板 → "Prompt Manager: 导入Prompts"
```

## ⌨️ 快捷键

| 快捷键 | 功能 | 说明 |
|--------|------|------|
| `Shift+P` | 显示Prompt列表 | 快速选择器 |
| `Ctrl+K Ctrl+S` | 搜索Prompts | 在TreeView中搜索 |
| `F2` | 编辑选中项 | 在TreeView中重命名 |
| `Delete` | 删除选中项 | 在TreeView中删除 |
| `Ctrl+C` | 复制Prompt | 在TreeView中复制 |

> 💡 提示：可在设置中自定义快捷键

## ⚙️ 配置选项

### 默认操作方式
```json
{
  "promptManager.defaultAction": "copy" // 或 "chat"
}
```
- `copy` - 选择Prompt时复制到剪贴板
- `chat` - 选择Prompt时发送到Chat界面

### 自定义配置文件位置
```
Windows: %APPDATA%\Code\User\settings.json
macOS: ~/Library/Application Support/Code/User/settings.json
Linux: ~/.config/Code/User/settings.json
```

## 💾 导入导出

### 支持格式
- **JSON格式** - 标准的数据交换格式
- **版本兼容** - 支持向后兼容的版本升级
- **完整性校验** - 导入时自动验证数据格式

### 导出数据结构
```json
{
  "version": "1.0.0",
  "exportedAt": "2024-01-01T00:00:00.000Z",
  "prompts": [
    {
      "id": "unique-id",
      "title": "Prompt标题",
      "content": "Prompt内容",
      "description": "描述信息",
      "categoryId": "分类ID",
      "tags": ["标签1", "标签2"],
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z",
      "usageCount": 0
    }
  ],
  "categories": [
    {
      "id": "category-id",
      "name": "分类名称",
      "description": "分类描述",
      "icon": "图标名称",
      "sortOrder": 0,
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  ],
  "metadata": {
    "totalCount": 1,
    "categoryCount": 1,
    "exportedBy": "Prompt Manager"
  }
}
```

### 导入注意事项
- **冲突处理** - 相同ID的Prompt会被覆盖
- **分类创建** - 不存在的分类会自动创建
- **数据验证** - 无效数据会被过滤但不影响导入

## 🔗 编辑器集成

### Cursor集成
- **环境检测** - 自动识别Cursor环境
- **Chat命令** - 直接发送到Cursor Chat
- **快捷操作** - 支持右键菜单发送

### VSCode集成
- **原生支持** - 完美适配VSCode环境
- **命令面板** - 所有功能均可通过命令面板访问
- **设置同步** - 支持VSCode设置同步

### 通用特性
- **剪贴板集成** - 一键复制Prompt内容
- **编辑器插入** - 直接插入到当前编辑器位置
- **智能识别** - 根据环境自动选择最佳集成方式

## 🏗 技术架构

### 核心设计模式
- **单例模式** - PromptManager、各种Service实例
- **工厂模式** - ChatIntegrationFactory自动选择集成服务
- **策略模式** - PromptActionStrategies处理不同操作
- **事件驱动** - 响应式UI更新机制

### 服务层架构
```
PromptManager (核心业务逻辑)
├── StorageService (数据持久化)
├── UIService (用户界面)
├── ClipboardService (剪贴板操作)
├── ImportExportService (导入导出)
├── ChatIntegrationFactory (Chat集成)
│   ├── CursorIntegrationService
│   └── VSCodeIntegrationService
└── EditorEnvironmentDetector (环境检测)
```

### 数据流
```
UI操作 → PromptManager → Service层 → 存储层
                      ↓
               事件通知 → UI更新
```

## ❓ 常见问题

### Q: 插件占用多少存储空间？
A: 插件本身约2MB，Prompt数据存储在VSCode的globalState中，通常几KB到几MB不等。

### Q: 数据安全吗？会丢失吗？
A: 数据存储在VSCode的官方存储机制中，与VSCode设置同级别安全。建议定期导出备份。

### Q: 支持团队共享吗？
A: 可通过导出/导入功能实现团队共享，未来版本会考虑云同步功能。

### Q: 为什么Chat集成不工作？
A: 请检查：1) 是否在支持的编辑器中 2) 编辑器版本是否兼容 3) 是否有活动的编辑器窗口

### Q: 可以修改默认的示例Prompt吗？
A: 可以，所有Prompt（包括示例）都可以自由编辑或删除。

### Q: 支持Markdown格式吗？
A: Prompt内容支持任何纯文本格式，包括Markdown、代码等。

## 🆘 支持与反馈

### 问题反馈
- **GitHub Issues** - [提交问题](https://github.com/cursor-project/prompt-manager/issues)
- **功能建议** - [功能请求](https://github.com/cursor-project/prompt-manager/issues/new?template=feature_request.md)

### 贡献指南
- **代码贡献** - 欢迎提交Pull Request
- **文档改进** - 帮助完善文档和示例
- **Bug报告** - 详细的错误重现步骤

### 版本历史
- **v0.0.1** - 初始版本，包含核心功能

### 致谢
感谢所有用户的反馈和建议，让这个插件变得更好！

---

<div align="center">
  <strong>Made with ❤️ for productivity</strong>
  <br>
  <sub>如果这个插件对你有帮助，请考虑给个⭐️</sub>
</div> 
