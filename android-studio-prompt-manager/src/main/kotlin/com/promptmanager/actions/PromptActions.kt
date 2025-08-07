package com.promptmanager.actions

import com.intellij.openapi.actionSystem.AnAction
import com.intellij.openapi.actionSystem.AnActionEvent
import com.intellij.openapi.project.Project
import com.intellij.openapi.ui.Messages
import com.promptmanager.services.PromptManagerService
import javax.swing.SwingUtilities

/**
 * 显示 Prompt 选择器动作
 */
class ShowPromptPickerAction : AnAction() {
    
    override fun actionPerformed(e: AnActionEvent) {
        val project = e.project ?: return
        val promptManagerService = com.intellij.openapi.application.ApplicationManager.getApplication().getService(PromptManagerService::class.java)
        
        SwingUtilities.invokeLater {
            promptManagerService.showPromptPicker(null)
        }
    }
}

/**
 * 添加 Prompt 动作
 */
class AddPromptAction : AnAction() {
    
    override fun actionPerformed(e: AnActionEvent) {
        val project = e.project ?: return
        val promptManagerService = com.intellij.openapi.application.ApplicationManager.getApplication().getService(PromptManagerService::class.java)
        
        SwingUtilities.invokeLater {
            promptManagerService.addPrompt(null)
        }
    }
}

/**
 * 编辑 Prompt 动作
 */
class EditPromptAction : AnAction() {
    
    override fun actionPerformed(e: AnActionEvent) {
        val project = e.project ?: return
        val promptManagerService = com.intellij.openapi.application.ApplicationManager.getApplication().getService(PromptManagerService::class.java)
        
        // 这里需要从上下文中获取选中的 Prompt ID
        // 为了简化，我们先显示一个消息
        SwingUtilities.invokeLater {
            Messages.showInfoMessage(
                "请在 ToolWindow 中选择要编辑的 Prompt",
                "编辑 Prompt"
            )
        }
    }
}

/**
 * 删除 Prompt 动作
 */
class DeletePromptAction : AnAction() {
    
    override fun actionPerformed(e: AnActionEvent) {
        val project = e.project ?: return
        val promptManagerService = com.intellij.openapi.application.ApplicationManager.getApplication().getService(PromptManagerService::class.java)
        
        SwingUtilities.invokeLater {
            Messages.showInfoMessage(
                "请在 ToolWindow 中选择要删除的 Prompt",
                "删除 Prompt"
            )
        }
    }
}

/**
 * 复制 Prompt 动作
 */
class CopyPromptAction : AnAction() {
    
    override fun actionPerformed(e: AnActionEvent) {
        val project = e.project ?: return
        val promptManagerService = com.intellij.openapi.application.ApplicationManager.getApplication().getService(PromptManagerService::class.java)
        
        SwingUtilities.invokeLater {
            Messages.showInfoMessage(
                "请在 ToolWindow 中选择要复制的 Prompt",
                "复制 Prompt"
            )
        }
    }
}

/**
 * 导出 Prompts 动作
 */
class ExportPromptsAction : AnAction() {
    
    override fun actionPerformed(e: AnActionEvent) {
        val project = e.project ?: return
        val promptManagerService = com.intellij.openapi.application.ApplicationManager.getApplication().getService(PromptManagerService::class.java)
        
        SwingUtilities.invokeLater {
            promptManagerService.exportPromptsToFile(null)
        }
    }
}

/**
 * 导入 Prompts 动作
 */
class ImportPromptsAction : AnAction() {
    
    override fun actionPerformed(e: AnActionEvent) {
        val project = e.project ?: return
        val promptManagerService = com.intellij.openapi.application.ApplicationManager.getApplication().getService(PromptManagerService::class.java)
        
        SwingUtilities.invokeLater {
            promptManagerService.importPromptsFromFile(null)
        }
    }
}

/**
 * 设置动作
 */
class SettingsAction : AnAction() {
    
    override fun actionPerformed(e: AnActionEvent) {
        SwingUtilities.invokeLater {
            Messages.showInfoMessage(
                "设置功能正在开发中...",
                "设置"
            )
        }
    }
}