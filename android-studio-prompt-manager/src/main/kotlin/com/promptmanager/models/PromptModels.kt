package com.promptmanager.models

import java.util.*

/**
 * Prompt 项目数据类
 */
data class PromptItem(
    val id: String = generateId(),
    val title: String,
    val content: String,
    val categoryId: String? = null,
    val tags: List<String> = emptyList(),
    val description: String? = null,
    val createdAt: Date = Date(),
    val updatedAt: Date = Date(),
    val usageCount: Int = 0
) {
    companion object {
        fun generateId(): String = "pm_${System.currentTimeMillis()}_${(0..1000).random()}"
    }
    
    fun copyWithUpdates(
        title: String = this.title,
        content: String = this.content,
        categoryId: String? = this.categoryId,
        tags: List<String> = this.tags,
        description: String? = this.description
    ): PromptItem {
        return this.copy(
            title = title,
            content = content,
            categoryId = categoryId,
            tags = tags,
            description = description,
            updatedAt = Date()
        )
    }
    
    fun incrementUsage(): PromptItem {
        return this.copy(usageCount = this.usageCount + 1, updatedAt = Date())
    }
}

/**
 * Prompt 分类数据类
 */
data class PromptCategory(
    val id: String = generateId(),
    val name: String,
    val description: String? = null,
    val icon: String? = null,
    val sortOrder: Int = 0,
    val createdAt: Date = Date(),
    val color: String? = null // 新增颜色字段，用于 UI 显示
) {
    companion object {
        fun generateId(): String = "cat_${System.currentTimeMillis()}_${(0..1000).random()}"
    }
    
    fun copyWithUpdates(
        name: String = this.name,
        description: String? = this.description,
        icon: String? = this.icon,
        color: String? = this.color
    ): PromptCategory {
        return this.copy(
            name = name,
            description = description,
            icon = icon,
            color = color
        )
    }
}

/**
 * 导入导出数据结构
 */
data class ExportData(
    val version: String = "1.0.0",
    val exportedAt: Date = Date(),
    val prompts: List<PromptItem> = emptyList(),
    val categories: List<PromptCategory> = emptyList(),
    val metadata: Metadata = Metadata()
) {
    data class Metadata(
        val totalCount: Int = 0,
        val categoryCount: Int = 0,
        val exportedBy: String = "Prompt Manager for Android Studio",
        val platform: String = "Android Studio"
    )
}

/**
 * 搜索选项
 */
data class SearchOptions(
    val query: String = "",
    val categoryId: String? = null,
    val tags: List<String> = emptyList(),
    val includeContent: Boolean = true,
    val includeDescription: Boolean = true,
    val includeTags: Boolean = true,
    val sortBy: SortBy = SortBy.TITLE,
    val sortDirection: SortDirection = SortDirection.ASC
) {
    enum class SortBy { TITLE, CREATED_AT, UPDATED_AT, USAGE_COUNT }
    enum class SortDirection { ASC, DESC }
}

/**
 * 统计信息
 */
data class PromptStats(
    val totalPrompts: Int = 0,
    val totalCategories: Int = 0,
    val topCategories: List<CategoryStats> = emptyList(),
    val totalUsageCount: Int = 0
) {
    data class CategoryStats(
        val categoryId: String,
        val categoryName: String,
        val promptCount: Int,
        val usageCount: Int
    )
}

/**
 * 操作结果
 */
data class OperationResult<T>(
    val success: Boolean,
    val data: T? = null,
    val error: String? = null,
    val errorCode: String? = null
) {
    companion object {
        fun <T> success(data: T? = null): OperationResult<T> = OperationResult(true, data)
        fun <T> failure(error: String, errorCode: String? = null): OperationResult<T> = 
            OperationResult(false, null, error, errorCode)
    }
}

/**
 * Prompt 操作类型
 */
enum class PromptActionType {
    COPY_TO_CLIPBOARD,
    SEND_TO_CHAT,
    EDIT,
    DELETE,
    EXPORT
}

/**
 * Prompt 操作结果
 */
data class PromptActionResult(
    val success: Boolean,
    val actions: List<String> = emptyList(),
    val errors: List<String> = emptyList(),
    val warnings: List<String> = emptyList()
)