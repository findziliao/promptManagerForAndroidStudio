package com.promptmanager.services

import com.fasterxml.jackson.module.kotlin.jacksonObjectMapper
import com.fasterxml.jackson.module.kotlin.readValue
import com.intellij.openapi.components.*
import com.intellij.openapi.diagnostic.thisLogger
import com.promptmanager.models.*

/**
 * 持久化数据服务 - 使用 IntelliJ 的 PersistentStateComponent
 */
@State(
    name = "PromptManagerData",
    storages = [Storage("promptManagerData.xml")]
)
@Service(Service.Level.APP)
class PersistentDataServiceImpl : PersistentStateComponent<PersistentDataServiceImpl.State> {
    
    private val logger = thisLogger()
    private val mapper = jacksonObjectMapper()
    
    data class State(
        var prompts: List<PromptItem> = emptyList(),
        var categories: List<PromptCategory> = emptyList(),
        var version: String = "1.0.0",
        var lastMigration: String? = null
    )
    
    private var state = State()
    
    override fun getState(): State = state
    
    override fun loadState(state: State) {
        this.state = state
        logger.info("Loaded Prompt Manager data: ${state.prompts.size} prompts, ${state.categories.size} categories")
    }
    
    // Prompt 操作
    fun getAllPrompts(): List<PromptItem> = state.prompts
    
    fun getPrompt(id: String): PromptItem? = state.prompts.find { it.id == id }
    
    fun savePrompt(prompt: PromptItem): Boolean {
        return try {
            val existingIndex = state.prompts.indexOfFirst { it.id == prompt.id }
            state.prompts = if (existingIndex >= 0) {
                state.prompts.toMutableList().apply { set(existingIndex, prompt) }
            } else {
                state.prompts + prompt
            }
            true
        } catch (e: Exception) {
            logger.error("Failed to save prompt: ${prompt.id}", e)
            false
        }
    }
    
    fun deletePrompt(id: String): Boolean {
        return try {
            state.prompts = state.prompts.filter { it.id != id }
            true
        } catch (e: Exception) {
            logger.error("Failed to delete prompt: $id", e)
            false
        }
    }
    
    // Category 操作
    fun getAllCategories(): List<PromptCategory> = state.categories
    
    fun getCategory(id: String): PromptCategory? = state.categories.find { it.id == id }
    
    fun saveCategory(category: PromptCategory): Boolean {
        return try {
            val existingIndex = state.categories.indexOfFirst { it.id == category.id }
            state.categories = if (existingIndex >= 0) {
                state.categories.toMutableList().apply { set(existingIndex, category) }
            } else {
                state.categories + category
            }
            true
        } catch (e: Exception) {
            logger.error("Failed to save category: ${category.id}", e)
            false
        }
    }
    
    fun deleteCategory(id: String): Boolean {
        return try {
            state.categories = state.categories.filter { it.id != id }
            // 将该分类下的 Prompt 设为未分类
            state.prompts = state.prompts.map { prompt ->
                if (prompt.categoryId == id) prompt.copy(categoryId = null) else prompt
            }
            true
        } catch (e: Exception) {
            logger.error("Failed to delete category: $id", e)
            false
        }
    }
    
    // 批量操作
    fun clearAllData(): Boolean {
        return try {
            state = State()
            true
        } catch (e: Exception) {
            logger.error("Failed to clear all data", e)
            false
        }
    }
    
    // 导入导出
    fun exportData(): ExportData {
        return ExportData(
            prompts = state.prompts,
            categories = state.categories,
            metadata = ExportData.Metadata(
                totalCount = state.prompts.size,
                categoryCount = state.categories.size
            )
        )
    }
    
    fun importData(exportData: ExportData): OperationResult<Unit> {
        return try {
            // 合并分类（避免重复）
            val existingCategoryIds = state.categories.map { it.id }.toSet()
            val newCategories = exportData.categories.filter { it.id !in existingCategoryIds }
            state.categories = state.categories + newCategories
            
            // 合并 Prompt（覆盖同 ID 的）
            val existingPromptIds = state.prompts.map { it.id }.toSet()
            val newPrompts = exportData.prompts.filter { it.id !in existingPromptIds }
            val updatedPrompts = exportData.prompts.filter { it.id in existingPromptIds }
            
            state.prompts = state.prompts
                .filter { it.id !in updatedPrompts.map { p -> p.id } }
                .plus(updatedPrompts)
                .plus(newPrompts)
            
            OperationResult.success()
        } catch (e: Exception) {
            logger.error("Failed to import data", e)
            OperationResult.failure("导入失败: ${e.message}")
        }
    }
    
    // 统计信息
    fun getStats(): PromptStats {
        val categoryStats = state.categories.map { category ->
            val categoryPrompts = state.prompts.filter { it.categoryId == category.id }
            PromptStats.CategoryStats(
                categoryId = category.id,
                categoryName = category.name,
                promptCount = categoryPrompts.size,
                usageCount = categoryPrompts.sumOf { it.usageCount }
            )
        }.sortedByDescending { it.promptCount }
        
        return PromptStats(
            totalPrompts = state.prompts.size,
            totalCategories = state.categories.size,
            topCategories = categoryStats.take(5),
            totalUsageCount = state.prompts.sumOf { it.usageCount }
        )
    }
    
    // 搜索功能
    fun searchPrompts(query: String, options: SearchOptions = SearchOptions()): List<PromptItem> {
        if (query.isBlank()) return state.prompts
        
        val searchTerm = query.lowercase().trim()
        val results = mutableSetOf<PromptItem>()
        
        state.prompts.forEach { prompt ->
            var matches = false
            
            // 搜索标题
            if (prompt.title.lowercase().contains(searchTerm)) {
                matches = true
            }
            
            // 搜索内容
            if (!matches && options.includeContent && 
                prompt.content.lowercase().contains(searchTerm)) {
                matches = true
            }
            
            // 搜索描述
            if (!matches && options.includeDescription && 
                prompt.description?.lowercase()?.contains(searchTerm) == true) {
                matches = true
            }
            
            // 搜索标签
            if (!matches && options.includeTags && 
                prompt.tags.any { it.lowercase().contains(searchTerm) }) {
                matches = true
            }
            
            if (matches) {
                results.add(prompt)
            }
        }
        
        // 搜索分类名称
        state.categories.forEach { category ->
            if (category.name.lowercase().contains(searchTerm) ||
                category.description?.lowercase()?.contains(searchTerm) == true) {
                state.prompts.filter { it.categoryId == category.id }.forEach { prompt ->
                    results.add(prompt)
                }
            }
        }
        
        // 应用过滤和排序
        return applyFiltersAndSort(results.toList(), options)
    }
    
    private fun applyFiltersAndSort(prompts: List<PromptItem>, options: SearchOptions): List<PromptItem> {
        var filtered = prompts
        
        // 按分类过滤
        options.categoryId?.let { categoryId ->
            filtered = filtered.filter { it.categoryId == categoryId }
        }
        
        // 按标签过滤
        if (options.tags.isNotEmpty()) {
            filtered = filtered.filter { prompt ->
                options.tags.any { tag -> prompt.tags.contains(tag) }
            }
        }
        
        // 排序
        filtered = when (options.sortBy) {
            SearchOptions.SortBy.TITLE -> 
                if (options.sortDirection == SearchOptions.SortDirection.ASC) 
                    filtered.sortedBy { it.title.lowercase() }
                else 
                    filtered.sortedByDescending { it.title.lowercase() }
            
            SearchOptions.SortBy.CREATED_AT -> 
                if (options.sortDirection == SearchOptions.SortDirection.ASC) 
                    filtered.sortedBy { it.createdAt }
                else 
                    filtered.sortedByDescending { it.createdAt }
            
            SearchOptions.SortBy.UPDATED_AT -> 
                if (options.sortDirection == SearchOptions.SortDirection.ASC) 
                    filtered.sortedBy { it.updatedAt }
                else 
                    filtered.sortedByDescending { it.updatedAt }
            
            SearchOptions.SortBy.USAGE_COUNT -> 
                if (options.sortDirection == SearchOptions.SortDirection.ASC) 
                    filtered.sortedBy { it.usageCount }
                else 
                    filtered.sortedByDescending { it.usageCount }
        }
        
        return filtered
    }
    
    // 初始化默认数据
    fun initializeDefaultDataIfNeeded() {
        if (state.prompts.isEmpty() && state.categories.isEmpty()) {
            logger.info("Initializing default data...")
            state.categories = DefaultCategories.getAll()
            state.prompts = DefaultPrompts.getAll()
            logger.info("Initialized ${state.categories.size} categories and ${state.prompts.size} prompts")
        }
    }
}