package com.promptmanager.ui

import com.intellij.openapi.project.Project
import com.intellij.openapi.wm.ToolWindow
import com.intellij.openapi.wm.ToolWindowFactory
import com.intellij.ui.components.JBScrollPane
import com.intellij.ui.components.JBTextField
import com.intellij.ui.table.JBTable
import com.intellij.util.ui.JBUI
import com.promptmanager.models.*
import com.promptmanager.services.PromptManagerService
import com.promptmanager.services.PromptStorageService
import javax.swing.*
import javax.swing.table.AbstractTableModel
import java.awt.*
import java.awt.event.ActionEvent
import java.awt.event.MouseAdapter
import java.awt.event.MouseEvent

/**
 * Prompt Manager ToolWindow 工厂类
 */
class PromptManagerToolWindowFactory : ToolWindowFactory {
    
    override fun createToolWindowContent(project: Project, toolWindow: ToolWindow) {
        val contentPanel = PromptManagerPanel(project)
        val content = com.intellij.ui.content.ContentFactory.getInstance()
            .createContent(contentPanel, "Prompt Manager", false)
        toolWindow.contentManager.addContent(content)
    }
}

/**
 * Prompt Manager 主面板
 */
class PromptManagerPanel(private val project: com.intellij.openapi.project.Project) : JPanel(BorderLayout()) {
    
    private val promptManagerService = com.intellij.openapi.application.ApplicationManager.getApplication()
        .getService(PromptManagerService::class.java)
    private val storageService = com.intellij.openapi.application.ApplicationManager.getApplication()
        .getService(PromptStorageService::class.java)
    
    private val searchField = JBTextField().apply {
        placeholderText = "搜索 Prompt..."
        toolTipText = "输入关键词搜索 Prompt 标题、内容、标签等"
    }
    
    private val categoryComboBox = JComboBox<String>().apply {
        addItem("所有分类")
        addItem("未分类")
    }
    
    private val promptTable = JBTable(PromptTableModel()).apply {
        rowHeight = JBUI.scale(40)
        autoCreateRowSorter = true
        setSelectionMode(ListSelectionModel.SINGLE_SELECTION)
        
        // 双击事件
        addMouseListener(object : MouseAdapter() {
            override fun mouseClicked(e: MouseEvent) {
                if (e.clickCount == 2) {
                    val selectedRow = selectedRow
                    if (selectedRow >= 0) {
                        val model = model as PromptTableModel
                        val prompt = model.getPromptAt(selectedRow)
                        promptManagerService.copyPromptToClipboard(prompt.id)
                        JOptionPane.showMessageDialog(
                            this@PromptManagerPanel,
                            "Prompt 已复制到剪贴板",
                            "成功",
                            JOptionPane.INFORMATION_MESSAGE
                        )
                    }
                }
            }
        })
    }
    
    private val tableModel = promptTable.model as PromptTableModel
    
    init {
        initializeUI()
        loadCategories()
        loadPrompts()
        
        // 搜索监听
        searchField.document.addDocumentListener(object : javax.swing.event.DocumentListener {
            override fun changedUpdate(e: javax.swing.event.DocumentEvent?) = filterPrompts()
            override fun insertUpdate(e: javax.swing.event.DocumentEvent?) = filterPrompts()
            override fun removeUpdate(e: javax.swing.event.DocumentEvent?) = filterPrompts()
        })
        
        // 分类选择监听
        categoryComboBox.addActionListener {
            filterPrompts()
        }
    }
    
    private fun initializeUI() {
        // 顶部工具栏
        val toolbarPanel = JPanel(BorderLayout()).apply {
            border = BorderFactory.createEmptyBorder(5, 5, 5, 5)
            
            // 搜索区域
            val searchPanel = JPanel(BorderLayout()).apply {
                add(JLabel("搜索:"), BorderLayout.WEST)
                add(searchField, BorderLayout.CENTER)
            }
            
            // 分类和按钮区域
            val rightPanel = JPanel(FlowLayout(FlowLayout.RIGHT)).apply {
                add(JLabel("分类:"))
                add(categoryComboBox)
                add(Box.createHorizontalStrut(10))
                add(createButton("➕ 添加", ::addAction))
                add(createButton("📝 编辑", ::editAction))
                add(createButton("🗑️ 删除", ::deleteAction))
                add(createButton("📋 复制", ::copyAction))
                add(createButton("🔄 刷新", ::refreshAction))
            }
            
            add(searchPanel, BorderLayout.CENTER)
            add(rightPanel, BorderLayout.EAST)
        }
        
        // 表格区域
        val scrollPane = JBScrollPane(promptTable)
        
        // 底部状态栏
        val statusBar = createStatusBar()
        
        // 布局
        add(toolbarPanel, BorderLayout.NORTH)
        add(scrollPane, BorderLayout.CENTER)
        add(statusBar, BorderLayout.SOUTH)
        
        // 右键菜单
        setupContextMenu()
    }
    
    private fun createButton(text: String, action: (ActionEvent) -> Unit): JButton {
        return JButton(text).apply {
            addActionListener(action)
            margin = JBUI.insets(2, 8, 2, 8)
        }
    }
    
    private fun createStatusBar(): JPanel {
        return JPanel(FlowLayout(FlowLayout.LEFT)).apply {
            border = BorderFactory.createEmptyBorder(2, 5, 2, 5)
            add(JLabel("Ready"))
        }
    }
    
    private fun setupContextMenu() {
        val popupMenu = JPopupMenu().apply {
            add(createMenuItem("复制到剪贴板", ::copyAction))
            add(createMenuItem("编辑", ::editAction))
            add(createMenuItem("删除", ::deleteAction))
            addSeparator()
            add(createMenuItem("导出", ::exportAction))
        }
        
        promptTable.componentPopupMenu = popupMenu
    }
    
    private fun createMenuItem(text: String, action: (ActionEvent) -> Unit): JMenuItem {
        return JMenuItem(text).apply {
            addActionListener(action)
        }
    }
    
    private fun loadCategories() {
        val categories = storageService.getAllCategories()
        categoryComboBox.removeAllItems()
        categoryComboBox.addItem("所有分类")
        categoryComboBox.addItem("未分类")
        
        categories.forEach { category ->
            categoryComboBox.addItem(category.name)
        }
    }
    
    private fun loadPrompts() {
        val prompts = storageService.getAllPrompts()
        tableModel.setPrompts(prompts)
        updateStatusBar(prompts.size)
    }
    
    private fun filterPrompts() {
        val searchText = searchField.text.trim()
        val selectedCategory = categoryComboBox.selectedItem as String
        
        var prompts = storageService.getAllPrompts()
        
        // 按分类过滤
        if (selectedCategory != "所有分类") {
            if (selectedCategory == "未分类") {
                prompts = prompts.filter { it.categoryId == null }
            } else {
                val category = storageService.getAllCategories()
                    .find { it.name == selectedCategory }
                if (category != null) {
                    prompts = prompts.filter { it.categoryId == category.id }
                }
            }
        }
        
        // 按搜索词过滤
        if (searchText.isNotEmpty()) {
            val searchOptions = SearchOptions(
                query = searchText,
                includeContent = true,
                includeDescription = true,
                includeTags = true
            )
            prompts = storageService.searchPrompts(searchText, searchOptions)
        }
        
        tableModel.setPrompts(prompts)
        updateStatusBar(prompts.size)
    }
    
    private fun updateStatusBar(count: Int) {
        val statusBar = getComponent(2) as JPanel
        statusBar.removeAll()
        statusBar.add(JLabel("共 $count 个 Prompt"))
        statusBar.revalidate()
        statusBar.repaint()
    }
    
    private fun getSelectedPrompt(): PromptItem? {
        val selectedRow = promptTable.selectedRow
        if (selectedRow < 0) return null
        
        val modelRow = promptTable.convertRowIndexToModel(selectedRow)
        return tableModel.getPromptAt(modelRow)
    }
    
    // Action 方法
    private fun addAction(e: ActionEvent) {
        promptManagerService.addPrompt(this)
        loadPrompts()
    }
    
    private fun editAction(e: ActionEvent) {
        val prompt = getSelectedPrompt()
        if (prompt != null) {
            promptManagerService.editPrompt(prompt.id, this)
            loadPrompts()
        } else {
            JOptionPane.showMessageDialog(
                this,
                "请先选择要编辑的 Prompt",
                "提示",
                JOptionPane.WARNING_MESSAGE
            )
        }
    }
    
    private fun deleteAction(e: ActionEvent) {
        val prompt = getSelectedPrompt()
        if (prompt != null) {
            promptManagerService.deletePrompt(prompt.id, this)
            loadPrompts()
        } else {
            JOptionPane.showMessageDialog(
                this,
                "请先选择要删除的 Prompt",
                "提示",
                JOptionPane.WARNING_MESSAGE
            )
        }
    }
    
    private fun copyAction(e: ActionEvent) {
        val prompt = getSelectedPrompt()
        if (prompt != null) {
            if (promptManagerService.copyPromptToClipboard(prompt.id)) {
                JOptionPane.showMessageDialog(
                    this,
                    "Prompt 已复制到剪贴板",
                    "成功",
                    JOptionPane.INFORMATION_MESSAGE
                )
            } else {
                JOptionPane.showMessageDialog(
                    this,
                    "复制失败",
                    "错误",
                    JOptionPane.ERROR_MESSAGE
                )
            }
        } else {
            JOptionPane.showMessageDialog(
                this,
                "请先选择要复制的 Prompt",
                "提示",
                JOptionPane.WARNING_MESSAGE
            )
        }
    }
    
    private fun exportAction(e: ActionEvent) {
        promptManagerService.exportPromptsToFile(this)
    }
    
    private fun refreshAction(e: ActionEvent) {
        loadCategories()
        loadPrompts()
    }
}

/**
 * Prompt 表格模型
 */
class PromptTableModel : AbstractTableModel() {
    
    private val prompts = mutableListOf<PromptItem>()
    private val columnNames = arrayOf("标题", "分类", "标签", "使用次数", "更新时间")
    
    fun setPrompts(newPrompts: List<PromptItem>) {
        prompts.clear()
        prompts.addAll(newPrompts)
        fireTableDataChanged()
    }
    
    fun getPromptAt(row: Int): PromptItem = prompts[row]
    
    override fun getRowCount(): Int = prompts.size
    
    override fun getColumnCount(): Int = columnNames.size
    
    override fun getColumnName(column: Int): String = columnNames[column]
    
    override fun getColumnClass(columnIndex: Int): Class<*> {
        return when (columnIndex) {
            3 -> Int::class.java
            else -> String::class.java
        }
    }
    
    override fun getValueAt(rowIndex: Int, columnIndex: Int): Any {
        val prompt = prompts[rowIndex]
        return when (columnIndex) {
            0 -> prompt.title
            1 -> prompt.categoryId?.let { "分类" } ?: "未分类"
            2 -> prompt.tags.takeIf { it.isNotEmpty() }?.joinToString(", ") ?: ""
            3 -> prompt.usageCount
            4 -> java.text.SimpleDateFormat("yyyy-MM-dd HH:mm").format(prompt.updatedAt)
            else -> ""
        }
    }
}