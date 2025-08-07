package com.promptmanager.ui

import com.intellij.openapi.ui.Messages
import com.intellij.ui.components.JBScrollPane
import com.intellij.ui.components.JBTextArea
import com.intellij.util.ui.JBUI
import com.promptmanager.models.PromptItem
import java.awt.*
import javax.swing.*
import javax.swing.border.Border

/**
 * Prompt 编辑对话框
 */
class PromptEditDialog(
    private val parentComponent: Component?,
    private val title: String,
    private val prompt: PromptItem? = null
) {
    
    private val titleField = JTextField(prompt?.title ?: "", 30)
    private val contentArea = JBTextArea(prompt?.content ?: "", 15, 40).apply {
        lineWrap = true
        wrapStyleWord = true
        tabSize = 2
    }
    private val tagsField = JTextField(prompt?.tags?.joinToString(", ") ?: "", 30)
    
    private var categoryComboBox: JComboBox<String>? = null
    
    fun show(): PromptItem? {
        // 创建主面板
        val panel = JPanel(GridBagLayout())
        panel.border = JBUI.Borders.empty(10)
        panel.preferredSize = Dimension(600, 450)
        
        val gbc = GridBagConstraints()
        gbc.insets = JBUI.insets(5)
        gbc.anchor = GridBagConstraints.WEST
        gbc.fill = GridBagConstraints.HORIZONTAL
        
        // 标题字段
        gbc.gridx = 0
        gbc.gridy = 0
        gbc.weightx = 0.0
        panel.add(JLabel("标题:"), gbc)
        
        gbc.gridx = 1
        gbc.gridy = 0
        gbc.weightx = 1.0
        panel.add(titleField, gbc)
        
        // 分类选择
        gbc.gridx = 0
        gbc.gridy = 1
        gbc.weightx = 0.0
        panel.add(JLabel("分类:"), gbc)
        
        gbc.gridx = 1
        gbc.gridy = 1
        gbc.weightx = 1.0
        categoryComboBox = createCategoryComboBox()
        panel.add(categoryComboBox!!, gbc)
        
        // 标签字段
        gbc.gridx = 0
        gbc.gridy = 2
        gbc.weightx = 0.0
        panel.add(JLabel("标签:"), gbc)
        
        gbc.gridx = 1
        gbc.gridy = 2
        gbc.weightx = 1.0
        panel.add(tagsField, gbc)
        
        // 内容区域
        gbc.gridx = 0
        gbc.gridy = 3
        gbc.weightx = 0.0
        gbc.anchor = GridBagConstraints.NORTHWEST
        panel.add(JLabel("内容:"), gbc)
        
        gbc.gridx = 1
        gbc.gridy = 3
        gbc.weightx = 1.0
        gbc.weighty = 1.0
        gbc.fill = GridBagConstraints.BOTH
        val scrollPane = JBScrollPane(contentArea)
        scrollPane.verticalScrollBarPolicy = JScrollPane.VERTICAL_SCROLLBAR_AS_NEEDED
        scrollPane.horizontalScrollBarPolicy = JScrollPane.HORIZONTAL_SCROLLBAR_AS_NEEDED
        panel.add(scrollPane, gbc)
        
        // 显示对话框
        val option = JOptionPane.showConfirmDialog(
            parentComponent,
            panel,
            title,
            JOptionPane.OK_CANCEL_OPTION,
            JOptionPane.PLAIN_MESSAGE
        )
        
        return if (option == JOptionPane.OK_OPTION) {
            validateAndCreatePrompt()
        } else {
            null
        }
    }
    
    private fun createCategoryComboBox(): JComboBox<String> {
        // 这里应该从服务中获取分类列表
        // 为了简化，我们提供一些默认分类
        val categories = arrayOf("未分类", "代码生成", "代码优化", "调试", "文档", "其他")
        val comboBox = JComboBox(categories)
        
        // 设置当前选中的分类
        prompt?.categoryId?.let { categoryId ->
            // 这里应该根据 categoryId 查找分类名称
            // 为了简化，我们使用默认值
            comboBox.selectedItem = "未分类"
        }
        
        return comboBox
    }
    
    private fun validateAndCreatePrompt(): PromptItem? {
        val title = titleField.text.trim()
        val content = contentArea.text.trim()
        val tagsText = tagsField.text.trim()
        
        if (title.isEmpty()) {
            Messages.showErrorDialog(parentComponent, "标题不能为空", "输入错误")
            return null
        }
        
        if (content.isEmpty()) {
            Messages.showErrorDialog(parentComponent, "内容不能为空", "输入错误")
            return null
        }
        
        val tags = tagsText.split(",")
            .map { it.trim() }
            .filter { it.isNotEmpty() }
            .takeIf { it.isNotEmpty() } ?: emptyList()
        
        return if (prompt != null) {
            prompt.copyWithUpdates(
                title = title,
                content = content,
                tags = tags
            )
        } else {
            PromptItem(
                title = title,
                content = content,
                tags = tags
            )
        }
    }
}