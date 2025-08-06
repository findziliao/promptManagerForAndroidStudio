package com.promptmanager.models

/**
 * 默认分类定义
 */
object DefaultCategories {
    val GENERAL = PromptCategory(
        id = "cat_general",
        name = "通用",
        description = "通用用途的 Prompt 模板",
        icon = "general",
        color = "#4CAF50"
    )
    
    val PROGRAMMING = PromptCategory(
        id = "cat_programming", 
        name = "编程",
        description = "编程相关的 Prompt 模板",
        icon = "code",
        color = "#2196F3"
    )
    
    val WRITING = PromptCategory(
        id = "cat_writing",
        name = "写作", 
        description = "写作相关的 Prompt 模板",
        icon = "edit",
        color = "#FF9800"
    )
    
    val CODE_REVIEW = PromptCategory(
        id = "cat_code_review",
        name = "代码审查",
        description = "代码审查相关的 Prompt 模板",
        icon = "inspection",
        color = "#9C27B0"
    )
    
    val DEBUGGING = PromptCategory(
        id = "cat_debugging",
        name = "调试",
        description = "调试相关的 Prompt 模板", 
        icon = "bug",
        color = "#F44336"
    )
    
    val DOCUMENTATION = PromptCategory(
        id = "cat_documentation",
        name = "文档",
        description = "文档编写相关的 Prompt 模板",
        icon = "documentation",
        color = "#607D8B"
    )
    
    fun getAll(): List<PromptCategory> = listOf(
        GENERAL, PROGRAMMING, WRITING, CODE_REVIEW, DEBUGGING, DOCUMENTATION
    )
}

/**
 * 默认 Prompt 模板
 */
object DefaultPrompts {
    val CODE_REVIEW = PromptItem(
        id = "prompt_code_review",
        title = "代码审查",
        content = """请对以下代码进行全面的审查，包括：

1. **代码质量**：代码风格、命名规范、可读性
2. **性能**：潜在的性能问题和优化建议
3. **安全性**：安全漏洞和风险点
4. **最佳实践**：是否符合行业最佳实践
5. **可维护性**：代码的可维护性和扩展性
6. **错误处理**：异常处理和边界情况

代码：
```
{code}
```

请提供具体的改进建议和示例代码。""",
        categoryId = DefaultCategories.CODE_REVIEW.id,
        tags = listOf("代码审查", "质量", "性能", "安全"),
        description = "全面的代码审查模板"
    )
    
    val BUG_FIXING = PromptItem(
        id = "prompt_bug_fixing",
        title = "问题调试",
        content = """我遇到了一个编程问题，请帮我分析和解决：

**问题描述**：
{problem_description}

**相关代码**：
```kotlin
{code}
```

**错误信息**：
{error_message}

**已尝试的解决方案**：
{tried_solutions}

请帮我：
1. 分析问题的根本原因
2. 提供解决方案
3. 给出预防措施""",
        categoryId = DefaultCategories.DEBUGGING.id,
        tags = listOf("调试", "问题解决", "错误处理"),
        description = "系统化的问题调试模板"
    )
    
    val TECH_DOCUMENT = PromptItem(
        id = "prompt_tech_document",
        title = "技术文档",
        content = """请为以下代码/功能编写技术文档：

**功能概述**：
{feature_overview}

**代码**：
```kotlin
{code}
```

**技术栈**：{tech_stack}

文档要求：
1. 功能说明和用途
2. API 接口文档
3. 使用示例
4. 注意事项
5. 相关依赖""",
        categoryId = DefaultCategories.DOCUMENTATION.id,
        tags = listOf("文档", "API", "技术写作"),
        description = "技术文档编写模板"
    )
    
    val CODE_OPTIMIZATION = PromptItem(
        id = "prompt_code_optimization",
        title = "代码优化",
        content = """请分析以下代码的性能优化机会：

**代码功能**：{function_description}

**代码**：
```kotlin
{code}
```

**性能关注点**：{performance_concerns}

请提供：
1. 性能瓶颈分析
2. 优化建议
3. 优化后的代码示例
4. 预期性能提升""",
        categoryId = DefaultCategories.PROGRAMMING.id,
        tags = listOf("性能", "优化", "代码质量"),
        description = "代码性能优化分析模板"
    )
    
    val GENERAL_WRITING = PromptItem(
        id = "prompt_general_writing",
        title = "通用写作",
        content = """请帮我撰写一篇关于 {topic} 的文章。

**要求**：
- 目标受众：{target_audience}
- 文章长度：{word_count} 字左右
- 写作风格：{writing_style}
- 关键要点：{key_points}

请确保内容结构清晰，逻辑性强，易于理解。""",
        categoryId = DefaultCategories.WRITING.id,
        tags = listOf("写作", "文章", "内容创作"),
        description = "通用写作助手模板"
    )
    
    val GENERAL_ASSISTANT = PromptItem(
        id = "prompt_general_assistant",
        title = "通用助手",
        content = """我需要您的帮助：{request}

**背景信息**：
{background}

**具体要求**：
{requirements}

**期望输出格式**：
{expected_format}

请提供详细的回答和建议。""",
        categoryId = DefaultCategories.GENERAL.id,
        tags = listOf("助手", "问答", "通用"),
        description = "通用 AI 助手模板"
    )
    
    fun getAll(): List<PromptItem> = listOf(
        CODE_REVIEW, BUG_FIXING, TECH_DOCUMENT, CODE_OPTIMIZATION, 
        GENERAL_WRITING, GENERAL_ASSISTANT
    )
}