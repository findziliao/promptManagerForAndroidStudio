plugins {
    id("java")
    id("org.jetbrains.kotlin.jvm") version "1.7.20"
    id("org.jetbrains.intellij") version "1.10.0"
}

group = "com.promptmanager"
version = "1.0.0"

repositories {
    mavenCentral()
}

dependencies {
    // Kotlin
    implementation("org.jetbrains.kotlin:kotlin-stdlib-jdk8")
    
    // JSON 序列化
    implementation("com.fasterxml.jackson.core:jackson-databind:2.13.4")
    implementation("com.fasterxml.jackson.module:jackson-module-kotlin:2.13.4")
    
    // 日志
    implementation("org.slf4j:slf4j-api:2.0.7")
    
    // 测试
    testImplementation("junit:junit:4.13.2")
    testImplementation("org.jetbrains.kotlin:kotlin-test-junit")
}

intellij {
    version.set("2022.3.2")
    type.set("IC") // IntelliJ IDEA Community Edition
    plugins.set(listOf("java"))
}

tasks {
    compileKotlin {
        kotlinOptions.jvmTarget = "17"
    }
    
    compileTestKotlin {
        kotlinOptions.jvmTarget = "17"
    }
    
    patchPluginXml {
        sinceBuild.set("223")
        untilBuild.set("251.*")
    }
    
    signPlugin {
        certificateChain.set(System.getenv("CERTIFICATE_CHAIN"))
        privateKey.set(System.getenv("PRIVATE_KEY"))
        password.set(System.getenv("PRIVATE_KEY_PASSWORD"))
    }
    
    publishPlugin {
        token.set(System.getenv("PUBLISH_TOKEN"))
    }
}