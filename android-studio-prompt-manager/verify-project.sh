#!/bin/bash

echo "🚀 Android Studio Prompt Manager 项目结构验证"
echo "================================================"

# 检查核心文件
echo "📁 检查核心文件..."
files=(
    "build.gradle.kts"
    "settings.gradle.kts" 
    "gradle.properties"
    "src/main/resources/META-INF/plugin.xml"
    "src/main/kotlin/com/promptmanager/models/PromptModels.kt"
    "src/main/kotlin/com/promptmanager/models/DefaultData.kt"
    "src/main/kotlin/com/promptmanager/services/PersistentDataServiceImpl.kt"
    "src/main/kotlin/com/promptmanager/services/PromptManagerServiceImpl.kt"
    "src/main/kotlin/com/promptmanager/ui/PromptManagerToolWindow.kt"
    "src/main/kotlin/com/promptmanager/actions/PromptActions.kt"
)

missing_files=()
for file in "${files[@]}"; do
    if [ -f "$file" ]; then
        echo "✅ $file"
    else
        echo "❌ $file"
        missing_files+=("$file")
    fi
done

echo ""
echo "📊 统计信息..."
echo "📝 Kotlin 文件数量: $(find src/main/kotlin -name "*.kt" | wc -l)"
echo "📋 总文件数量: $(find src -type f | wc -l)"

echo ""
echo "🏗️ 项目结构..."
tree src/ 2>/dev/null || find src -type f | sort

if [ ${#missing_files[@]} -eq 0 ]; then
    echo ""
    echo "🎉 所有核心文件都已创建！"
    echo ""
    echo "📋 下一步操作："
    echo "1. 安装 Java 17+ 和 Kotlin"
    echo "2. 安装 IntelliJ IDEA 或 Android Studio"
    echo "3. 在 IDE 中打开此项目"
    echo "4. 运行 './gradlew buildPlugin' 构建插件"
    echo "5. 运行 './gradlew runIde' 测试插件"
else
    echo ""
    echo "⚠️  发现缺失的文件: ${missing_files[*]}"
fi