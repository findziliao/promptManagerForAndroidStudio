package com.promptmanager.services

import com.intellij.openapi.application.ApplicationManager
import com.intellij.openapi.components.Service
import com.intellij.openapi.diagnostic.thisLogger
import com.intellij.openapi.fileChooser.FileChooser
import com.intellij.openapi.fileChooser.FileChooserDescriptor
import com.intellij.openapi.ui.Messages
import com.intellij.openapi.vfs.VirtualFile
import com.fasterxml.jackson.module.kotlin.jacksonObjectMapper
import com.promptmanager.models.*
import com.promptmanager.ui.PromptEditDialog
import java.awt.Component
import java.awt.Toolkit
import java.awt.datatransfer.Clipboard
import java.awt.datatransfer.StringSelection
import java.io.File

/**
 * Prompt 存储服务接口
 */
interface PromptStorageService {
    fun getAllPrompts(): List<PromptItem>
    fun getPrompt(id: String): PromptItem?
    fun savePrompt(prompt: PromptItem): Boolean
    fun deletePrompt(id: String): Boolean
    
    fun getAllCategories(): List<PromptCategory>
    fun getCategory(id: String): PromptCategory?
    fun saveCategory(category: PromptCategory): Boolean
    fun deleteCategory(id: String): Boolean
    
    fun getPromptsByCategory(categoryId: String): List<PromptItem>
    fun searchPrompts(query: String, options: SearchOptions = SearchOptions()): List<PromptItem>
    fun getStats(): PromptStats
    fun clearAllData(): Boolean
}

/**
 * Prompt Manager 服务接口
 */
interface PromptManagerService {
    fun showPromptPicker(parentComponent: java.awt.Component? = null)
    fun addPrompt(parentComponent: java.awt.Component? = null)
    fun editPrompt(promptId: String, parentComponent: java.awt.Component? = null)
    fun deletePrompt(promptId: String, parentComponent: java.awt.Component? = null)
    fun copyPromptToClipboard(promptId: String): Boolean
    fun sendPromptToChat(promptId: String): Boolean
    
    fun addCategory(parentComponent: java.awt.Component? = null)
    fun editCategory(categoryId: String, parentComponent: java.awt.Component? = null)
    fun deleteCategory(categoryId: String, parentComponent: java.awt.Component? = null)
    
    fun exportPromptsToFile(parentComponent: java.awt.Component? = null)
    fun importPromptsFromFile(parentComponent: java.awt.Component? = null)
    fun reinitializeDefaultData(parentComponent: java.awt.Component? = null)
    
    fun getAvailableActions(promptId: String): List<PromptActionType>
    fun executePromptAction(promptId: String, actionType: PromptActionType): PromptActionResult
}

/**
 * 持久化数据服务接口
 */
interface PersistentDataService {
    fun exportData(): ExportData
    fun importData(exportData: ExportData): OperationResult<Unit>
    fun initializeDefaultDataIfNeeded()
}

/**
 * Prompt 存储服务实现
 */
@Service(Service.Level.APP)
class PromptStorageServiceImpl : PromptStorageService {
    
    private val persistentDataService = ApplicationManager.getApplication().getService(PersistentDataServiceImpl::class.java)
    private val logger = thisLogger()
    
    override fun getAllPrompts(): List<PromptItem> = 
        persistentDataService.getAllPrompts()
    
    override fun getPrompt(id: String): PromptItem? = 
        persistentDataService.getPrompt(id)
    
    override fun savePrompt(prompt: PromptItem): Boolean = 
        persistentDataService.savePrompt(prompt)
    
    override fun deletePrompt(id: String): Boolean = 
        persistentDataService.deletePrompt(id)
    
    override fun getAllCategories(): List<PromptCategory> = 
        persistentDataService.getAllCategories()
    
    override fun getCategory(id: String): PromptCategory? = 
        persistentDataService.getCategory(id)
    
    override fun saveCategory(category: PromptCategory): Boolean = 
        persistentDataService.saveCategory(category)
    
    override fun deleteCategory(id: String): Boolean = 
        persistentDataService.deleteCategory(id)
    
    override fun getPromptsByCategory(categoryId: String): List<PromptItem> = 
        getAllPrompts().filter { it.categoryId == categoryId }
    
    override fun searchPrompts(query: String, options: SearchOptions): List<PromptItem> = 
        persistentDataService.searchPrompts(query, options)
    
    override fun getStats(): PromptStats = 
        persistentDataService.getStats()
    
    override fun clearAllData(): Boolean = 
        persistentDataService.clearAllData()
}

/**
 * Prompt Manager 服务实现
 */
@Service(Service.Level.APP)
class PromptManagerServiceImpl : PromptManagerService {
    
    private val storageService = ApplicationManager.getApplication().getService(PromptStorageServiceImpl::class.java)
    private val persistentDataService = ApplicationManager.getApplication().getService(PersistentDataServiceImpl::class.java)
    private val logger = thisLogger()
    private val mapper = jacksonObjectMapper()
    
    init {
        // 初始化默认数据
        persistentDataService.initializeDefaultDataIfNeeded()
    }
    
    override fun showPromptPicker(parentComponent: java.awt.Component?) {
        val prompts = storageService.getAllPrompts()
        if (prompts.isEmpty()) {
            Messages.showInfoMessage(
                parentComponent,
                "暂无 Prompt，请先添加一些 Prompt 模板。",
                "提示"
            )
            return
        }
        
        // 创建 Prompt 选择对话框
        val promptNames = prompts.map { 
            val categoryName = if (it.categoryId != null) storageService.getCategory(it.categoryId)?.name ?: "未分类" else "未分类"
            "${it.title ?: ""} ($categoryName)" 
        }.toTypedArray()
        val selected = Messages.showChooseDialog(
            "选择要使用的 Prompt：",
            "Prompt 选择器",
            promptNames,
            promptNames.firstOrNull(),
            Messages.getQuestionIcon()
        )
        
        if (selected >= 0) {
            val prompt = prompts[selected]
            copyPromptToClipboard(prompt.id)
        }
    }
    
    override fun addPrompt(parentComponent: java.awt.Component?) {
        val dialog = PromptEditDialog(parentComponent, "添加新 Prompt")
        val newPrompt = dialog.show()
        
        if (newPrompt != null) {
            if (storageService.savePrompt(newPrompt)) {
                Messages.showInfoMessage(parentComponent, "Prompt 添加成功！", "成功")
            } else {
                Messages.showErrorDialog(parentComponent, "添加 Prompt 失败", "错误")
            }
        }
    }
    
    override fun editPrompt(promptId: String, parentComponent: java.awt.Component?) {
        val prompt = storageService.getPrompt(promptId) ?: run {
            Messages.showErrorDialog(parentComponent, "Prompt 不存在", "错误")
            return
        }
        
        val dialog = PromptEditDialog(parentComponent, "编辑 Prompt", prompt)
        val updatedPrompt = dialog.show()
        
        if (updatedPrompt != null) {
            if (storageService.savePrompt(updatedPrompt)) {
                Messages.showInfoMessage(parentComponent, "Prompt 更新成功！", "成功")
            } else {
                Messages.showErrorDialog(parentComponent, "更新 Prompt 失败", "错误")
            }
        }
    }
    
    override fun deletePrompt(promptId: String, parentComponent: java.awt.Component?) {
        val prompt = storageService.getPrompt(promptId) ?: run {
            Messages.showErrorDialog( "Prompt 不存在", "错误")
            return
        }
        
        val result = Messages.showYesNoDialog(
            "确定要删除 Prompt \"${prompt.title}\" 吗？此操作不可恢复。",
            "确认删除",
            Messages.getQuestionIcon()
        )
        
        if (result == Messages.YES) {
            if (storageService.deletePrompt(promptId)) {
                Messages.showInfoMessage(parentComponent, "Prompt 删除成功！", "成功")
            } else {
                Messages.showErrorDialog( "删除 Prompt 失败", "错误")
            }
        }
    }
    
    override fun copyPromptToClipboard(promptId: String): Boolean {
        return try {
            val prompt = storageService.getPrompt(promptId) ?: return false
            
            val clipboard = Toolkit.getDefaultToolkit().getSystemClipboard()
            val selection = StringSelection(prompt.content)
            clipboard.setContents(selection, null)
            
            // 增加使用计数
            val updatedPrompt = prompt.incrementUsage()
            storageService.savePrompt(updatedPrompt)
            
            true
        } catch (e: Exception) {
            logger.error("Failed to copy prompt to clipboard", e)
            false
        }
    }
    
    override fun sendPromptToChat(promptId: String): Boolean {
        // Android Studio 中暂时没有直接的 Chat 集成
        // 这里可以实现与外部 AI 工具的集成
        return copyPromptToClipboard(promptId)
    }
    
    override fun addCategory(parentComponent: java.awt.Component?) {
        val name = Messages.showInputDialog(
            "输入分类名称：",
            "添加新分类",
            Messages.getQuestionIcon()
        ) ?: return
        
        val description = Messages.showInputDialog(
            "输入分类描述（可选）：",
            "添加新分类",
            Messages.getQuestionIcon()
        )
        
        val newCategory = PromptCategory(
            name = name,
            description = description
        )
        
        if (storageService.saveCategory(newCategory)) {
            Messages.showInfoMessage(parentComponent, "分类添加成功！", "成功")
        } else {
            Messages.showErrorDialog( "添加分类失败", "错误")
        }
    }
    
    override fun editCategory(categoryId: String, parentComponent: java.awt.Component?) {
        val category = storageService.getCategory(categoryId) ?: run {
            Messages.showErrorDialog( "分类不存在", "错误")
            return
        }
        
        val newName = Messages.showInputDialog(
            "编辑分类名称：",
            "编辑分类",
            Messages.getQuestionIcon(),
            category.name,
            null
        ) ?: return
        
        val newDescription = Messages.showInputDialog(
            "编辑分类描述：",
            "编辑分类",
            Messages.getQuestionIcon(),
            category.description,
            null
        )
        
        val updatedCategory = category.copyWithUpdates(name = newName, description = newDescription)
        
        if (storageService.saveCategory(updatedCategory)) {
            Messages.showInfoMessage(parentComponent, "分类更新成功！", "成功")
        } else {
            Messages.showErrorDialog( "更新分类失败", "错误")
        }
    }
    
    override fun deleteCategory(categoryId: String, parentComponent: java.awt.Component?) {
        val category = storageService.getCategory(categoryId) ?: run {
            Messages.showErrorDialog( "分类不存在", "错误")
            return
        }
        
        val categoryPrompts = storageService.getPromptsByCategory(categoryId)
        val message = if (categoryPrompts.isNotEmpty()) {
            "确定要删除分类 \"${category.name}\" 吗？该分类下有 ${categoryPrompts.size} 个 Prompt，它们将变为未分类状态。"
        } else {
            "确定要删除分类 \"${category.name}\" 吗？"
        }
        
        val result = Messages.showYesNoDialog(
            message,
            "确认删除",
            Messages.getQuestionIcon()
        )
        
        if (result == Messages.YES) {
            if (storageService.deleteCategory(categoryId)) {
                Messages.showInfoMessage("分类删除成功！", "成功")
            } else {
                Messages.showErrorDialog( "删除分类失败", "错误")
            }
        }
    }
    
    override fun exportPromptsToFile(parentComponent: java.awt.Component?) {
        try {
            val descriptor = FileChooserDescriptor(
                true, false, false, false, false, false
            ).withTitle("选择导出位置").withDescription("选择 JSON 文件保存位置")
            
            val file = FileChooser.chooseFile(descriptor, null, null, null) ?: return
            
            val exportData = persistentDataService.exportData()
            val json = mapper.writerWithDefaultPrettyPrinter().writeValueAsString(exportData)
            
            file.getOutputStream(null).bufferedWriter().use { writer ->
                writer.write(json)
            }
            
            Messages.showInfoMessage(
                parentComponent,
                "导出成功！共导出 ${exportData.prompts.size} 个 Prompt 和 ${exportData.categories.size} 个分类。",
                "成功"
            )
        } catch (e: Exception) {
            logger.error("Failed to export prompts", e)
            Messages.showErrorDialog( "导出失败: ${e.message}", "错误")
        }
    }
    
    override fun importPromptsFromFile(parentComponent: java.awt.Component?) {
        try {
            val descriptor = FileChooserDescriptor(
                false, true, false, false, false, false
            ).withTitle("选择导入文件").withDescription("选择 JSON 格式的 Prompt 数据文件")
            
            val file = FileChooser.chooseFile(descriptor, null, null, null) ?: return
            
            val json = file.inputStream.bufferedReader().use { it.readText() }
            val importData = mapper.readValue(json, ExportData::class.java)
            
            val result = persistentDataService.importData(importData)
            if (result.success) {
                Messages.showInfoMessage(
                    parentComponent,
                    "导入成功！共导入 ${importData.prompts.size} 个 Prompt 和 ${importData.categories.size} 个分类。",
                    "成功"
                )
            } else {
                Messages.showErrorDialog( result.error, "导入失败")
            }
        } catch (e: Exception) {
            logger.error("Failed to import prompts", e)
            Messages.showErrorDialog( "导入失败: ${e.message}", "错误")
        }
    }
    
    override fun reinitializeDefaultData(parentComponent: java.awt.Component?) {
        val result = Messages.showYesNoDialog(
            "确定要重新初始化默认数据吗？这将删除所有现有的 Prompt 和分类，并重新创建默认模板。此操作不可恢复！",
            "确认重新初始化",
            Messages.getWarningIcon()
        )
        
        if (result == Messages.YES) {
            if (storageService.clearAllData()) {
                persistentDataService.initializeDefaultDataIfNeeded()
                Messages.showInfoMessage(parentComponent, "默认数据重新初始化成功！", "成功")
            } else {
                Messages.showErrorDialog( "重新初始化失败", "错误")
            }
        }
    }
    
    override fun getAvailableActions(promptId: String): List<PromptActionType> {
        val prompt = storageService.getPrompt(promptId) ?: return emptyList()
        
        return listOf(
            PromptActionType.COPY_TO_CLIPBOARD,
            PromptActionType.SEND_TO_CHAT,
            PromptActionType.EDIT,
            PromptActionType.DELETE,
            PromptActionType.EXPORT
        )
    }
    
    override fun executePromptAction(promptId: String, actionType: PromptActionType): PromptActionResult {
        return try {
            val prompt = storageService.getPrompt(promptId) ?: return PromptActionResult(
                success = false,
                errors = listOf("Prompt 不存在")
            )
            
            val actions = mutableListOf<String>()
            val errors = mutableListOf<String>()
            
            when (actionType) {
                PromptActionType.COPY_TO_CLIPBOARD -> {
                    if (copyPromptToClipboard(promptId)) {
                        actions.add("复制到剪贴板")
                    } else {
                        errors.add("复制失败")
                    }
                }
                
                PromptActionType.SEND_TO_CHAT -> {
                    if (sendPromptToChat(promptId)) {
                        actions.add("发送到 Chat")
                    } else {
                        errors.add("发送失败")
                    }
                }
                
                PromptActionType.EDIT -> {
                    // 编辑需要在 UI 线程中执行
                    errors.add("编辑操作需要在 UI 中执行")
                }
                
                PromptActionType.DELETE -> {
                    // 删除需要在 UI 线程中执行
                    errors.add("删除操作需要在 UI 中执行")
                }
                
                PromptActionType.EXPORT -> {
                    // 导出需要在 UI 线程中执行
                    errors.add("导出操作需要在 UI 中执行")
                }
            }
            
            PromptActionResult(
                success = errors.isEmpty(),
                actions = actions,
                errors = errors
            )
        } catch (e: Exception) {
            logger.error("Failed to execute prompt action", e)
            PromptActionResult(
                success = false,
                errors = listOf("操作失败: ${e.message}")
            )
        }
    }
}