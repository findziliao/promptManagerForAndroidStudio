# Android Studio Prompt Manager

Android Studio 插件，用于高效管理和快速使用 AI Prompt 模板。

## 功能特性

- 📝 **完整的 Prompt 管理** - 创建、编辑、删除、分类组织
- 🔍 **智能搜索** - 支持标题、内容、标签、分类的全文搜索
- 📁 **分类系统** - 灵活的分类管理，支持默认和自定义分类
- 💾 **导入导出** - JSON 格式，支持备份和跨设备同步
- ⚡ **深度集成** - 与 Android Studio 完美集成
- 📊 **统计信息** - 使用统计和热门分类分析

## 快速开始

### 构建插件

```bash
# 克隆项目
git clone <repository-url>
cd android-studio-prompt-manager

# 构建插件
./gradlew buildPlugin

# 运行插件（在测试环境中）
./gradlew runIde
```

### 安装插件

1. 构建完成后，在 `build/distributions/` 目录下找到 `.jar` 文件
2. 在 Android Studio 中：`File` → `Settings` → `Plugins`
3. 点击 ⚙️ → `Install Plugin from Disk...`
4. 选择构建的 `.jar` 文件
5. 重启 Android Studio

## 使用方法

### 基础操作

1. **打开 ToolWindow**
   - 菜单：`View` → `Tool Windows` → `Prompt Manager`
   - 或者使用快捷键：`Shift+P`

2. **管理 Prompt**
   - ➕ **添加**：点击"添加"按钮创建新 Prompt
   - 📝 **编辑**：选择 Prompt 后点击"编辑"按钮
   - 🗑️ **删除**：选择 Prompt 后点击"删除"按钮
   - 📋 **复制**：双击 Prompt 或点击"复制"按钮

3. **搜索和过滤**
   - 在搜索框输入关键词实时搜索
   - 通过分类下拉菜单按分类过滤

### 高级功能

#### 导入导出
- **导出**：点击"导出"按钮将所有 Prompt 导出为 JSON 文件
- **导入**：点击"导入"按钮从 JSON 文件导入 Prompt

#### 分类管理
- 支持默认分类：通用、编程、写作、代码审查、调试、文档
- 可创建自定义分类
- 删除分类时，该分类下的 Prompt 会变为未分类

#### 快捷键
- `Shift+P` - 打开 Prompt 选择器
- 在 ToolWindow 中双击 Prompt 快速复制

## 技术架构

### 核心技术栈
- **Kotlin** - 主要开发语言
- **IntelliJ Platform SDK** - 插件开发框架
- **Swing** - UI 界面
- **Jackson** - JSON 序列化
- **Gradle** - 构建工具

### 架构设计
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   UI Layer      │    │  Service Layer  │    │  Data Layer     │
│                 │    │                 │    │                 │
│ • ToolWindow    │◄──►│ • PromptManager │◄──►│ • Storage       │
│ • Actions       │    │ • Storage       │    │ • Persistent    │
│ • Dialogs       │    │ • Clipboard     │    │ • Default Data  │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### 数据模型
- **PromptItem** - Prompt 数据结构
- **PromptCategory** - 分类数据结构
- **ExportData** - 导入导出数据结构
- **SearchOptions** - 搜索选项

### 服务组件
- **PromptStorageService** - 数据存储服务
- **PromptManagerService** - 业务逻辑服务
- **PersistentDataService** - 持久化服务

## 开发指南

### 项目结构
```
src/main/kotlin/com/promptmanager/
├── actions/          # 动作定义
├── models/          # 数据模型
├── services/        # 服务实现
├── ui/             # UI 组件
└── utils/          # 工具类
```

### 添加新功能

1. **定义数据模型** - 在 `models/` 包中创建数据类
2. **实现服务逻辑** - 在 `services/` 包中实现业务逻辑
3. **创建 UI 组件** - 在 `ui/` 包中创建界面
4. **注册动作** - 在 `actions/` 包中定义动作
5. **更新 plugin.xml** - 注册扩展和动作

### 调试技巧

1. 使用 `./gradlew runIde` 启动测试环境
2. 在 `logcat` 或 `IDEA Log` 中查看日志
3. 使用断点调试代码
4. 检查 `plugin.xml` 配置是否正确

## 常见问题

### Q: 插件无法加载
A: 检查 Android Studio 版本兼容性，确保 `plugin.xml` 中的 `since-build` 和 `until-build` 配置正确。

### Q: 数据丢失
A: 数据存储在 Android Studio 的配置目录中，重装或清理配置会导致数据丢失，建议定期导出备份。

### Q: 性能问题
A: 大量 Prompt 可能影响搜索性能，建议使用分类管理和定期清理不需要的 Prompt。

## 贡献指南

欢迎提交 Issue 和 Pull Request！

1. Fork 本项目
2. 创建功能分支
3. 提交更改
4. 创建 Pull Request

## 许可证

MIT License

## 更新日志

### v1.0.0
- 初始版本发布
- 基础 Prompt 管理功能
- 分类系统
- 搜索和过滤
- 导入导出功能
- ToolWindow 界面