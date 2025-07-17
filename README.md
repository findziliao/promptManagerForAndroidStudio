**English** | [中文](README.zh-CN.md)

# Prompt Manager

<div align="center">
  <img src="https://raw.githubusercontent.com/cursor-project/prompt-manager/main/resources/prompt-manager-logo-2.png" alt="Prompt Manager Logo" width="120" height="120">
  
  **Efficient management and quick access to AI Prompt templates for Cursor/VSCode**
  
  [![Version](https://img.shields.io/badge/version-0.0.1-blue.svg)](https://github.com/cursor-project/prompt-manager)
  [![VSCode](https://img.shields.io/badge/VSCode-1.60.0+-green.svg)](https://code.visualstudio.com/)
  [![License](https://img.shields.io/badge/license-MIT-yellow.svg)](https://mit-license.org/)

  ## Authors
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
    </tr>
  </table>
</div>

## 📋 Table of Contents

- [Features](#-features)
- [Quick Start](#-quick-start)
- [Core Features](#-core-features)
- [User Interface](#-user-interface)
- [Usage Guide](#-usage-guide)
- [Keyboard Shortcuts](#-keyboard-shortcuts)
- [Configuration](#-configuration)
- [Import/Export](#-importexport)
- [Editor Integration](#-editor-integration)
- [Technical Architecture](#-technical-architecture)
- [FAQ](#-faq)
- [Support & Feedback](#-support--feedback)

## ✨ Features

### 🎯 Core Highlights
- **📝 Complete Prompt Lifecycle Management** - Create, edit, delete, and organize with categories
- **🔍 Smart Search** - Full-text search across titles, content, tags, and categories
- **📁 Hierarchical Category System** - Flexible category management with unlimited levels
- **💾 Data Import/Export** - JSON format supporting backup and cross-device sync
- **🔗 Multi-Editor Integration** - Perfect compatibility with Cursor, VSCode and other mainstream editors
- **💬 Chat Integration** - One-click send prompts to chat interface
- **📊 Usage Statistics** - Automatic usage tracking with intelligent sorting recommendations
- **⚡ Performance Optimization** - Debounced search, lazy loading, smooth experience

### 🚀 Technical Advantages
- **Full TypeScript Stack** - Complete type system with excellent development experience
- **Event-Driven Architecture** - Reactive UI updates with real-time synchronization
- **Singleton Pattern Design** - Efficient resource utilization and clear state management
- **Factory Pattern Integration** - Automatic adaptation to multiple editor environments
- **Async Operation Optimization** - Non-blocking UI with smooth operations

## 🚀 Quick Start

### Installation

1. **Install from VSCode Marketplace**
   ```
   Press Ctrl+Shift+X in VSCode to open Extensions panel
   Search for "Prompt Manager"
   Click Install
   ```

2. **Local Installation**
   ```bash
   # After downloading the .vsix file
   code --install-extension prompt-manager-0.0.1.vsix
   ```

### First Use

1. **Activate Extension** - Automatically activated after installation, find Prompt Manager icon in Activity Bar
2. **Browse Default Templates** - Extension comes with pre-built templates for code review, technical documentation, problem analysis, etc.
3. **Add Custom Prompts** - Click the ➕ button or use shortcut `Ctrl+Shift+Q`
4. **Start Using** - Select a prompt, automatically copied to clipboard or double-click to send to Chat

## 🛠 Core Features

### Prompt Management
- **Create Prompts** - Support for title, content, description, tags, and categories
- **Edit Prompts** - Modify anytime with automatic save of modification time
- **Delete Prompts** - Support for individual deletion and batch cleanup
- **Simple Management** - Easy organization with category-based structure

### Category System
- **Default Categories** - Three basic categories: General, Programming, Writing
- **Custom Categories** - Create personalized category structures
- **Category Operations** - Support for editing, deleting, and exporting entire categories
- **Uncategorized Management** - Automatically collect uncategorized prompts

### Search & Filtering
- **Real-time Search** - Search as you type, supports both Chinese and English
- **Multi-field Search** - Search across titles, content, descriptions, tags, and category names
- **Search Highlighting** - Clear display of matching results
- **Search History** - Remember commonly used search terms

## 🎨 User Interface

### Activity Bar View
- **Prompt Tree List** - Display all prompts organized by category hierarchy
- **Context Menu** - Quick access to edit, delete, copy and other operations
- **Search Box** - Real-time filtering of displayed results
- **Toolbar Buttons** - Common functions like add, refresh, settings

### Quick Picker
- **Smart Sorting** - Based on usage frequency and update time
- **Preview Information** - Display prompt content preview
- **Category Indicators** - Clear display of category membership
- **Operation Hints** - Show available operation methods

## 📖 Usage Guide

### Basic Operations

#### 1. Creating Prompts
```
Method 1: Activity Bar → Click ➕ button
Method 2: Command Palette → "Prompt Manager: Add New Prompt"
Method 3: Shortcut Ctrl+Shift+Q → Select "Add New Prompt"
```

#### 2. Using Prompts
```
Method 1: Activity Bar → Double-click prompt item
Method 2: Shortcut Ctrl+Shift+Q → Select prompt
Method 3: Right-click menu → "Copy to Clipboard" or "Send to Chat"
```

#### 3. Managing Categories
```
Create Category: Right-click empty area in Activity Bar → "Add Category"
Edit Category: Right-click category → "Edit Category"
Delete Category: Right-click category → "Delete Category"
```

### Advanced Features

#### Smart Search
```
// Search syntax examples
code          # Search all content containing "code"
react hooks   # Search React Hooks related content
@programming  # Search content in programming category
#bug         # Search prompts containing bug tag
```

#### Batch Operations
```
Export All: Command Palette → "Prompt Manager: Export Prompts"
Export Category: Right-click category → "Export Category"
Import Data: Command Palette → "Prompt Manager: Import Prompts"
```

## ⌨️ Keyboard Shortcuts

| Shortcut | Function | Description |
|----------|----------|-------------|
| `Ctrl+Shift+Q` | Show Prompt List | Quick picker |
| `Ctrl+K Ctrl+S` | Search Prompts | Search in TreeView |
| `F2` | Edit Selected Item | Rename in TreeView |
| `Delete` | Delete Selected Item | Delete in TreeView |
| `Ctrl+C` | Copy Prompt | Copy in TreeView |

> 💡 Tip: Keyboard shortcuts can be customized in settings

## ⚙️ Configuration

### Default Action Mode
```json
{
  "promptManager.defaultAction": "copy" // or "chat"
}
```
- `copy` - Copy to clipboard when selecting a prompt
- `chat` - Send to chat interface when selecting a prompt

### Custom Configuration File Location
```
Windows: %APPDATA%\Code\User\settings.json
macOS: ~/Library/Application Support/Code/User/settings.json
Linux: ~/.config/Code/User/settings.json
```

## 💾 Import/Export

### Supported Formats
- **JSON Format** - Standard data exchange format
- **Version Compatibility** - Supports backward-compatible version upgrades
- **Integrity Verification** - Automatic data format validation during import

### Export Data Structure
```json
{
  "version": "1.0.0",
  "exportedAt": "2024-01-01T00:00:00.000Z",
  "prompts": [
    {
      "id": "unique-id",
      "title": "Prompt Title",
      "content": "Prompt Content",
      "description": "Description Information",
      "categoryId": "Category ID",
      "tags": ["Tag1", "Tag2"],
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z",
      "usageCount": 0
    }
  ],
  "categories": [
    {
      "id": "category-id",
      "name": "Category Name",
      "description": "Category Description",
      "icon": "Icon Name",
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

### Import Notes
- **Conflict Handling** - Prompts with the same ID will be overwritten
- **Category Creation** - Non-existent categories will be automatically created
- **Data Validation** - Invalid data will be filtered but won't affect import

## 🔗 Editor Integration

### Cursor Integration
- **Environment Detection** - Automatically recognize Cursor environment
- **Chat Commands** - Send directly to Cursor Chat
- **Quick Operations** - Support right-click menu sending

### VSCode Integration
- **Native Support** - Perfect compatibility with VSCode environment
- **Command Palette** - All features accessible through command palette
- **Settings Sync** - Support VSCode settings synchronization

### Universal Features
- **Clipboard Integration** - One-click copy prompt content
- **Editor Insertion** - Direct insertion at current editor position
- **Smart Recognition** - Automatically select optimal integration method based on environment

## 🏗 Technical Architecture

### Core Design Patterns
- **Singleton Pattern** - PromptManager and various Service instances
- **Factory Pattern** - ChatIntegrationFactory automatically selects integration services
- **Strategy Pattern** - PromptActionStrategies handle different operations
- **Event-Driven** - Reactive UI update mechanism

### Service Layer Architecture
```
PromptManager (Core Business Logic)
├── StorageService (Data Persistence)
├── UIService (User Interface)
├── ClipboardService (Clipboard Operations)
├── ImportExportService (Import/Export)
├── ChatIntegrationFactory (Chat Integration)
│   ├── CursorIntegrationService
│   └── VSCodeIntegrationService
└── EditorEnvironmentDetector (Environment Detection)
```

### Data Flow
```
UI Operations → PromptManager → Service Layer → Storage Layer
                             ↓
                   Event Notifications → UI Updates
```

## ❓ FAQ

### Q: How much storage space does the extension use?
A: The extension itself is about 2MB, with prompt data stored in VSCode's globalState, typically ranging from a few KB to several MB.

### Q: Is the data secure? Will it be lost?
A: Data is stored in VSCode's official storage mechanism, with the same security level as VSCode settings. Regular export backups are recommended.

### Q: Does it support team sharing?
A: Team sharing can be achieved through export/import functionality. Cloud sync features may be considered in future versions.

### Q: Why isn't Chat integration working?
A: Please check: 1) Whether you're in a supported editor 2) Editor version compatibility 3) Whether there's an active editor window

### Q: Can I modify the default example prompts?
A: Yes, all prompts (including examples) can be freely edited or deleted.

### Q: Does it support Markdown format?
A: Prompt content supports any plain text format, including Markdown, code, etc.

## 🆘 Support & Feedback

### Issue Reporting
- **GitHub Issues** - [Submit Issues](https://github.com/cursor-project/prompt-manager/issues)
- **Feature Requests** - [Feature Requests](https://github.com/cursor-project/prompt-manager/issues/new?template=feature_request.md)

### Contributing
- **Code Contributions** - Pull requests are welcome
- **Documentation Improvements** - Help improve documentation and examples
- **Bug Reports** - Detailed error reproduction steps

### Version History
- **v0.0.1** - Initial version with core features

### Acknowledgments
Thanks to all users for their feedback and suggestions that make this extension better!

---

<div align="center">
  <strong>Made with ❤️ for productivity</strong>
  <br>
  <sub>If this extension helps you, please consider giving it a ⭐️</sub>
</div>
