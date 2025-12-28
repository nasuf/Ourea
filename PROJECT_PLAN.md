# Ourea - 跨平台 Markdown 编辑器项目计划

> Ourea: 一款类似 Typora 的所见即所得 Markdown 编辑器，基于 Tauri + Milkdown 构建

---

## 一、项目概述

### 1.1 项目目标

开发一款跨平台（macOS、Windows）的 Markdown 编辑器，具备以下核心特性：
- **所见即所得（WYSIWYG）**：编辑时实时渲染 Markdown
- **轻量高性能**：基于 Tauri，打包体积小，启动速度快
- **原生体验**：接近原生应用的用户体验
- **功能完整**：支持完整的 Markdown 语法和常用扩展

### 1.2 技术栈

| 层级 | 技术 | 说明 |
|------|------|------|
| 桌面框架 | Tauri 2.x | Rust 后端 + WebView 前端 |
| 前端框架 | Vue 3 + TypeScript | 响应式 UI 框架 |
| 编辑器核心 | Milkdown | 基于 ProseMirror + Remark 的 WYSIWYG 编辑器 |
| 构建工具 | Vite | 快速的前端构建工具 |
| 样式方案 | TailwindCSS | 原子化 CSS 框架 |
| 状态管理 | Pinia | Vue 3 官方状态管理 |

### 1.3 目标平台

- macOS (Intel & Apple Silicon)
- Windows 10/11 (x64)
- Linux (可选，后期支持)

---

## 二、项目结构设计

```
ourea/
├── src-tauri/                    # Tauri Rust 后端
│   ├── Cargo.toml
│   ├── tauri.conf.json           # Tauri 配置
│   ├── capabilities/             # 权限配置
│   ├── icons/                    # 应用图标
│   └── src/
│       ├── main.rs               # 入口文件
│       ├── lib.rs                # 库入口
│       ├── commands/             # Tauri 命令
│       │   ├── mod.rs
│       │   ├── file.rs           # 文件操作命令
│       │   ├── export.rs         # 导出命令
│       │   ├── settings.rs       # 设置命令
│       │   └── window.rs         # 窗口命令
│       ├── services/             # 业务服务
│       │   ├── mod.rs
│       │   ├── file_service.rs   # 文件服务
│       │   ├── export_service.rs # 导出服务
│       │   ├── recent_files.rs   # 最近文件
│       │   └── config.rs         # 配置管理
│       ├── utils/                # 工具函数
│       │   ├── mod.rs
│       │   └── path.rs           # 路径处理
│       └── error.rs              # 错误处理
│
├── src/                          # 前端源码
│   ├── main.ts                   # 前端入口
│   ├── App.vue                   # 根组件
│   ├── assets/                   # 静态资源
│   │   ├── styles/
│   │   │   ├── main.css          # 全局样式
│   │   │   ├── editor.css        # 编辑器样式
│   │   │   └── themes/           # 主题文件
│   │   └── fonts/                # 字体文件
│   ├── components/               # Vue 组件
│   │   ├── layout/
│   │   │   ├── TitleBar.vue      # 自定义标题栏
│   │   │   ├── Sidebar.vue       # 侧边栏
│   │   │   ├── StatusBar.vue     # 状态栏
│   │   │   └── MainLayout.vue    # 主布局
│   │   ├── editor/
│   │   │   ├── MilkdownEditor.vue    # 编辑器主组件
│   │   │   ├── EditorToolbar.vue     # 工具栏
│   │   │   ├── TableOfContents.vue   # 目录大纲
│   │   │   └── ImageUploader.vue     # 图片上传
│   │   ├── dialogs/
│   │   │   ├── SettingsDialog.vue    # 设置对话框
│   │   │   ├── ExportDialog.vue      # 导出对话框
│   │   │   ├── AboutDialog.vue       # 关于对话框
│   │   │   └── SearchDialog.vue      # 搜索替换
│   │   └── common/
│   │       ├── Button.vue
│   │       ├── Modal.vue
│   │       └── Dropdown.vue
│   ├── composables/              # Vue 组合式函数
│   │   ├── useEditor.ts          # 编辑器逻辑
│   │   ├── useFile.ts            # 文件操作
│   │   ├── useTheme.ts           # 主题切换
│   │   ├── useShortcuts.ts       # 快捷键
│   │   └── useAutoSave.ts        # 自动保存
│   ├── stores/                   # Pinia 状态
│   │   ├── editor.ts             # 编辑器状态
│   │   ├── file.ts               # 文件状态
│   │   ├── settings.ts           # 设置状态
│   │   └── ui.ts                 # UI 状态
│   ├── plugins/                  # Milkdown 插件
│   │   ├── index.ts
│   │   ├── imagePlugin.ts        # 图片处理插件
│   │   ├── pastePlugin.ts        # 粘贴处理插件
│   │   ├── mathPlugin.ts         # 数学公式插件
│   │   └── customTheme.ts        # 自定义主题
│   ├── utils/                    # 工具函数
│   │   ├── tauri.ts              # Tauri API 封装
│   │   ├── markdown.ts           # Markdown 工具
│   │   └── storage.ts            # 本地存储
│   ├── types/                    # TypeScript 类型
│   │   ├── editor.ts
│   │   ├── file.ts
│   │   └── settings.ts
│   └── locales/                  # 国际化
│       ├── zh-CN.json
│       └── en-US.json
│
├── public/                       # 公共资源
├── index.html                    # HTML 入口
├── package.json
├── vite.config.ts
├── tailwind.config.js
├── tsconfig.json
└── README.md
```

---

## 三、开发阶段划分

### 阶段一：项目初始化与基础架构（Phase 1）

### 阶段二：核心编辑功能（Phase 2）

### 阶段三：文件系统集成（Phase 3）

### 阶段四：高级编辑功能（Phase 4）

### 阶段五：用户体验优化（Phase 5）

### 阶段六：导出与扩展功能（Phase 6）

### 阶段七：测试与发布（Phase 7）

---

## 四、详细任务列表

### Phase 1: 项目初始化与基础架构

#### 1.1 环境搭建

- [x] **T1.1.1** 安装 Tauri CLI
  ```bash
  cargo install tauri-cli --version "^2.0.0"
  ```

- [x] **T1.1.2** 创建 Tauri + Vue 项目
  ```bash
  npm create tauri-app@latest ourea -- --template vue-ts
  ```

- [x] **T1.1.3** 安装前端依赖
  ```bash
  npm install @milkdown/kit @milkdown/core @milkdown/ctx @milkdown/prose
  npm install @milkdown/preset-commonmark @milkdown/preset-gfm
  npm install @milkdown/plugin-history @milkdown/plugin-clipboard
  npm install @milkdown/plugin-cursor @milkdown/plugin-listener
  npm install @milkdown/plugin-indent @milkdown/plugin-upload
  npm install @milkdown/plugin-block @milkdown/plugin-tooltip
  npm install @milkdown/plugin-slash @milkdown/plugin-prism
  npm install pinia vue-router @vueuse/core
  npm install -D tailwindcss postcss autoprefixer
  ```

- [x] **T1.1.4** 配置 TailwindCSS
  - 创建 `tailwind.config.js`
  - 配置 `postcss.config.js`
  - 在 `main.css` 中引入 Tailwind 指令

- [x] **T1.1.5** 配置 TypeScript
  - 更新 `tsconfig.json` 路径别名
  - 配置严格模式

#### 1.2 Tauri 配置

- [x] **T1.2.1** 配置 `tauri.conf.json`
  - 设置应用名称、版本、标识符
  - 配置窗口属性（大小、标题、装饰）
  - 配置安全策略（CSP）

- [x] **T1.2.2** 配置应用权限 `capabilities/`
  - 文件系统读写权限
  - 对话框权限
  - Shell 权限
  - 剪贴板权限

- [x] **T1.2.3** 设计应用图标
  - 创建 1024x1024 源图标
  - 使用 `tauri icon` 生成各平台图标

- [x] **T1.2.4** 配置 Rust 依赖 `Cargo.toml`
  ```toml
  [dependencies]
  tauri = { version = "2", features = ["devtools"] }
  tauri-plugin-dialog = "2"
  tauri-plugin-fs = "2"
  tauri-plugin-shell = "2"
  tauri-plugin-clipboard-manager = "2"
  tauri-plugin-process = "2"
  tauri-plugin-os = "2"
  serde = { version = "1", features = ["derive"] }
  serde_json = "1"
  tokio = { version = "1", features = ["full"] }
  thiserror = "1"
  dirs = "5"
  notify = "6"           # 文件监听
  pulldown-cmark = "0.10" # Markdown 解析
  ```

#### 1.3 基础布局实现

- [x] **T1.3.1** 创建自定义标题栏 `TitleBar.vue`
  - 实现窗口拖拽区域
  - ~~实现最小化/最大化/关闭按钮~~ (使用系统原生按钮)
  - ~~macOS 红绿灯按钮适配~~ (使用系统原生按钮)
  - 显示当前文件名（通过标签页）

- [x] **T1.3.2** 创建主布局 `MainLayout.vue`
  - 三栏布局：侧边栏 + 编辑区 + 大纲区
  - 响应式布局适配
  - ~~布局状态持久化~~ (待实现)

- [x] **T1.3.3** 创建侧边栏 `Sidebar.vue` (部分完成)
  - ~~文件树组件~~ (待实现)
  - ~~文件夹展开/折叠~~ (待实现)
  - ~~文件拖拽排序~~ (待实现)
  - ~~右键菜单~~ (待实现)
  - [x] 最近文件列表
  - [x] 新建/打开文件按钮

- [x] **T1.3.4** 创建状态栏 `StatusBar.vue` (部分完成)
  - [x] 字数统计
  - [x] 行数/列数显示
  - [x] 编码显示
  - ~~保存状态~~ (待实现)

#### 1.4 状态管理设置

- [x] **T1.4.1** 创建 Pinia Store - `editor.ts`
  ```typescript
  - editorContent: string      // 当前内容
  - isDirty: boolean           // 是否有未保存更改
  - wordCount: number          // 字数
  - charCount: number          // 字符数
  - cursorPosition: Position   // 光标位置
  ```

- [x] **T1.4.2** 创建 Pinia Store - `file.ts`
  ```typescript
  - currentFilePath: string    // 当前文件路径
  - currentFileName: string    // 当前文件名
  - recentFiles: FileInfo[]    // 最近文件列表
  - isNewFile: boolean         // 是否为新建文件
  ```

- [x] **T1.4.3** 创建 Pinia Store - `settings.ts`
  ```typescript
  - theme: 'light' | 'dark' | 'system'
  - fontSize: number
  - fontFamily: string
  - lineHeight: number
  - autoSave: boolean
  - autoSaveInterval: number
  - spellCheck: boolean
  - showLineNumbers: boolean
  ```

- [x] **T1.4.4** 创建 Pinia Store - `ui.ts` (合并到 settings.ts)
  ```typescript
  - sidebarVisible: boolean
  - sidebarWidth: number
  - focusMode: boolean
  - typewriterMode: boolean
  ```

- [x] **T1.4.5** 创建 Pinia Store - `tabs.ts` (额外实现)
  ```typescript
  - tabs: Tab[]                // 标签页列表
  - activeTabId: string        // 当前激活的标签页
  - isDirty: boolean           // 每个标签页的脏状态
  ```

---

### Phase 2: 核心编辑功能

#### 2.1 Milkdown 编辑器集成

- [x] **T2.1.1** 创建基础编辑器组件 `MilkdownEditor.vue`
  - 初始化 Milkdown Editor 实例
  - 配置基础插件
  - 处理编辑器生命周期

- [x] **T2.1.2** 集成 CommonMark 预设
  ```typescript
  import { commonmark } from '@milkdown/preset-commonmark'
  // 支持：标题、段落、列表、引用、代码块、链接、图片、加粗、斜体
  ```

- [x] **T2.1.3** 集成 GFM 预设
  ```typescript
  import { gfm } from '@milkdown/preset-gfm'
  // 支持：表格、任务列表、删除线、自动链接
  ```

- [x] **T2.1.4** 集成历史记录插件
  ```typescript
  import { history } from '@milkdown/plugin-history'
  // 支持：撤销 (Cmd/Ctrl+Z)、重做 (Cmd/Ctrl+Shift+Z)
  ```

- [x] **T2.1.5** 集成剪贴板插件
  ```typescript
  import { clipboard } from '@milkdown/plugin-clipboard'
  // 支持：Markdown 格式复制粘贴
  ```

- [x] **T2.1.6** 集成光标插件
  ```typescript
  import { cursor } from '@milkdown/plugin-cursor'
  // 支持：拖放光标、间隙光标
  ```

- [x] **T2.1.7** 集成监听器插件
  ```typescript
  import { listener, listenerCtx } from '@milkdown/plugin-listener'
  // 用于监听内容变化、更新状态
  ```

#### 2.2 编辑器增强功能

- [x] **T2.2.1** 集成缩进插件
  ```typescript
  import { indent } from '@milkdown/plugin-indent'
  // 支持：Tab 缩进、Shift+Tab 反缩进
  ```

- [x] **T2.2.2** 集成块拖拽插件
  ```typescript
  import { block } from '@milkdown/plugin-block'
  // 支持：拖拽手柄、块级元素重排
  ```

- [x] **T2.2.3** 集成工具提示插件 (自定义 DOM 实现)
  ```typescript
  // 使用自定义 DOM 实现替代 @milkdown/plugin-tooltip
  // 支持：选中文字工具栏（加粗、斜体、删除线、代码、链接）
  // 支持：ESC 键隐藏、选区消失自动隐藏
  ```

- [x] **T2.2.5** 集成代码高亮插件
  ```typescript
  import { prism } from '@milkdown/plugin-prism'
  import { refractor } from 'refractor/all'
  // 支持：代码块语法高亮
  ```

- [x] **T2.2.6** 配置支持的编程语言 (使用 refractor/all 支持全部语言)
  - JavaScript/TypeScript
  - Python
  - Rust
  - Go
  - Java
  - C/C++
  - HTML/CSS
  - JSON/YAML
  - Markdown
  - Shell/Bash

#### 2.3 内容同步与状态

- [x] **T2.3.1** 实现内容变化监听
  - 监听 Milkdown 内容变化事件
  - 同步到 Pinia store
  - 更新 dirty 状态

- [x] **T2.3.2** 实现字数统计 (部分完成)
  - [x] 实时统计字数
  - [x] 统计字符数（含/不含空格）
  - ~~统计段落数~~ (待实现)
  - ~~统计阅读时间~~ (待实现)

- [x] **T2.3.3** 实现光标位置追踪
  - 获取当前行号
  - 获取当前列号
  - 更新状态栏显示

- [x] **T2.3.4** 实现内容获取/设置
  ```typescript
  // 获取 Markdown 内容
  function getMarkdown(): string

  // 设置 Markdown 内容
  function setMarkdown(content: string): void
  ```

#### 2.4 编辑器工具栏

- [x] **T2.4.1** 创建工具栏组件 `EditorToolbar.vue`
  - 固定模式（位于编辑区顶部）
  - 响应式按钮布局

- [x] **T2.4.2** 实现格式化按钮
  - 加粗 (Cmd/Ctrl+B)
  - 斜体 (Cmd/Ctrl+I)
  - 删除线
  - 行内代码
  - 链接 (Cmd/Ctrl+K)

- [x] **T2.4.3** 实现标题按钮
  - H1 - H3 标题选择
  - 标题级别切换

- [x] **T2.4.4** 实现列表按钮
  - 无序列表
  - 有序列表
  - 任务列表

- [x] **T2.4.5** 实现插入按钮
  - ~~插入表格~~ (待实现)
  - 插入代码块
  - 插入引用
  - 插入分割线
  - 插入图片
  - 插入链接

---

### Phase 3: 文件系统集成

#### 3.1 Rust 文件服务

- [x] **T3.1.1** 创建文件操作命令 `commands/file.rs`
  ```rust
  #[tauri::command]
  async fn read_file(path: &str) -> Result<String, Error>

  #[tauri::command]
  async fn write_file(path: &str, content: &str) -> Result<(), Error>

  #[tauri::command]
  async fn file_exists(path: &str) -> bool

  #[tauri::command]
  async fn get_file_info(path: &str) -> Result<FileInfo, Error>
  ```

- [x] **T3.1.2** 实现文件对话框命令 (使用 Tauri 前端插件实现)
  ```rust
  // 使用 @tauri-apps/plugin-dialog 前端 API
  // open(), save() 等
  ```

- [x] **T3.1.3** 实现最近文件管理 (在前端 file.ts store 中实现)
  ```typescript
  // 在 Pinia store 中管理最近文件
  addToRecentFiles(path: string)
  removeRecentFile(path: string)
  clearRecentFiles()
  ```

- [x] **T3.1.4** 实现文件监听服务
  ```rust
  // 使用 notify crate 监听文件变化
  // 当外部修改文件时通知前端
  // commands/watcher.rs: start_watching, stop_watching, stop_all_watching
  // composables/useFileWatcher.ts: 前端 composable
  ```

#### 3.2 前端文件操作

- [x] **T3.2.1** 创建文件操作 composable `useFile.ts`
  ```typescript
  function newFile()           // 新建文件
  function openFile()          // 打开文件
  function saveFile()          // 保存文件
  function saveFileAs()        // 另存为
  function closeFile()         // 关闭文件
  ```

- [x] **T3.2.2** 实现新建文件功能
  - ~~检查当前文件是否需要保存~~ (多标签页模式)
  - 创建新标签页
  - 重置文件状态

- [x] **T3.2.3** 实现打开文件功能
  - 弹出文件选择对话框
  - 过滤 .md/.markdown 文件
  - 读取文件内容
  - 加载到编辑器（新标签页）
  - 更新文件状态
  - 添加到最近文件

- [x] **T3.2.4** 实现保存文件功能
  - 获取编辑器内容
  - 如果是新文件，弹出保存对话框
  - 写入文件
  - 更新保存状态

- [x] **T3.2.5** 实现另存为功能
  - 弹出保存对话框
  - 保存到新路径
  - 更新当前文件路径

- [x] **T3.2.6** 实现关闭文件确认
  - 检查未保存更改
  - 弹出确认对话框 (CloseConfirmDialog.vue)
  - 保存/不保存/取消选项

#### 3.3 文件树功能

- [x] **T3.3.1** 实现文件夹打开
  - 选择工作目录 (openFolder)
  - 递归读取目录结构 (read_directory_recursive)
  - 构建文件树数据 (useWorkspaceStore)

- [x] **T3.3.2** 实现文件树组件
  - 展示文件夹和文件 (FileTree.vue)
  - 图标区分文件类型
  - 展开/折叠文件夹
  - 单击选中，双击打开

- [x] **T3.3.3** 实现文件树右键菜单
  - 新建文件 (create_file)
  - 新建文件夹 (create_directory)
  - 重命名 (rename_path) - 使用 InputDialog 组件
  - 删除 (delete_path)
  - 在 Finder/Explorer 中显示 (reveal_in_finder)

- [x] **T3.3.4** 实现文件拖拽
  - 拖拽文件到编辑器打开 (tauri://drag-drop)
  - 支持多种文本文件格式 (不仅限于 .md)
  - ~~拖拽文件重新排序~~ (不需要)
  - ~~拖拽移动到文件夹~~ (不需要)

- [x] **T3.3.5** 支持非 Markdown 文本文件
  - 支持打开 40+ 种文本文件类型
  - CodeEditor 组件 (Shiki 语法高亮)
  - Tab 增加 fileType 和 extension 字段
  - 自动检测文件类型并切换编辑模式

#### 3.4 自动保存

- [x] **T3.4.1** 创建自动保存 composable `useAutoSave.ts`
  - 可配置的保存间隔
  - 仅在有更改时保存
  - ~~保存状态指示~~ (待实现)

- [x] **T3.4.2** 实现定时自动保存
  ```typescript
  // 默认每 30 秒检查并保存
  // 用户可在设置中调整间隔
  ```

- [x] **T3.4.3** 实现失焦自动保存
  - 窗口失去焦点时保存
  - ~~切换文件时保存~~ (多标签页模式不需要)

- [x] **T3.4.4** 实现崩溃恢复
  - 定期保存到临时文件 (useRecovery.ts, 每30秒)
  - 启动时检查恢复文件
  - 提示用户恢复 (RecoveryDialog)

---

### Phase 4: 高级编辑功能

#### 4.1 图片处理

- [ ] **T4.1.1** 创建图片上传插件 `imagePlugin.ts`
  - 拦截图片粘贴
  - 拦截图片拖拽
  - 处理图片上传

- [ ] **T4.1.2** 实现图片本地存储
  - 复制图片到项目目录
  - 生成相对路径引用
  - 可配置存储位置

- [ ] **T4.1.3** 实现图片复制粘贴
  - 从剪贴板读取图片
  - 保存到本地
  - 插入 Markdown 图片语法

- [ ] **T4.1.4** 实现图片拖拽上传
  - 拖拽图片文件
  - 拖拽网页图片
  - 显示上传进度

- [ ] **T4.1.5** 实现图片预览
  - 悬停预览大图
  - 点击查看原图
  - 图片缩放控制

- [ ] **T4.1.6** 实现图片管理
  - 图片重命名
  - 图片替换
  - 删除未使用图片

#### 4.2 表格编辑增强

- [ ] **T4.2.1** 实现可视化表格编辑
  - 表格创建向导
  - 拖拽调整列宽
  - 拖拽调整行高

- [ ] **T4.2.2** 实现表格操作
  - 插入/删除行
  - 插入/删除列
  - 合并单元格（扩展）
  - 表格对齐设置

- [ ] **T4.2.3** 实现表格右键菜单
  - 快速插入行列
  - 删除行列
  - 复制表格

#### 4.3 代码块增强

- [x] **T4.3.1** 实现代码块语法高亮 (Prism + Shiki)
  - Markdown 代码块使用 Prism 语法高亮
  - 非 Markdown 文件使用 Shiki 语法高亮
  - 支持 40+ 编程语言
  - 亮色/暗色主题自动切换

- [ ] **T4.3.2** 实现语言选择器 (待实现)
  - 下拉选择编程语言
  - 自动检测语言
  - 记住常用语言

- [ ] **T4.3.3** 实现代码块操作 (待实现)
  - 一键复制代码
  - 代码折叠
  - 行号显示切换

- [ ] **T4.3.4** 实现代码格式化（可选）
  - 集成 Prettier
  - 支持常用语言格式化

#### 4.4 数学公式支持

- [ ] **T4.4.1** 集成 KaTeX 支持
  ```bash
  npm install @milkdown/plugin-math katex
  ```

- [ ] **T4.4.2** 实现行内公式
  - 语法：`$formula$`
  - 实时渲染

- [ ] **T4.4.3** 实现块级公式
  - 语法：`$$formula$$`
  - 居中显示
  - 公式编号（可选）

- [ ] **T4.4.4** 实现公式编辑器
  - 可视化公式输入
  - 常用符号面板
  - 公式预览

#### 4.5 搜索与替换

- [ ] **T4.5.1** 创建搜索对话框 `SearchDialog.vue`
  - 快捷键 Cmd/Ctrl+F 打开
  - 浮动搜索栏

- [ ] **T4.5.2** 实现搜索功能
  - 实时搜索高亮
  - 匹配计数显示
  - 上/下一个匹配
  - 大小写敏感选项
  - 正则表达式选项

- [ ] **T4.5.3** 实现替换功能
  - 快捷键 Cmd/Ctrl+H 打开
  - 替换当前匹配
  - 替换全部
  - 替换确认

#### 4.6 目录大纲

- [x] **T4.6.1** 创建目录组件 `Outline.vue` (原计划名为 TableOfContents.vue)
  - 自动提取标题
  - 层级缩进显示
  - 实时更新

- [x] **T4.6.2** 实现目录导航
  - 点击跳转到标题
  - ~~当前位置高亮~~ (待实现)
  - 平滑滚动

- [x] **T4.6.3** 实现目录面板
  - 可折叠面板（通过 TitleBar 切换按钮）
  - 可调整宽度（拖拽调整）
  - ~~可拖拽排序~~ (不需要)

---

### Phase 5: 用户体验优化

#### 5.1 主题系统

- [x] **T5.1.1** 创建主题 composable `useTheme.ts`
  - 亮色/暗色/跟随系统
  - 主题切换动画
  - ~~主题持久化~~ (待实现)

- [x] **T5.1.2** 设计亮色主题
  - 编辑器样式
  - 侧边栏样式
  - [x] 工具栏样式 (EditorToolbar)
  - 对话框样式
  - [x] 代码高亮亮色配色 (Prism)

- [x] **T5.1.3** 设计暗色主题
  - 编辑器暗色样式
  - [x] 代码高亮暗色配色 (Prism + VS Code Dark 配色)
  - 统一色彩系统

- [x] **T5.1.4** 实现系统主题跟随
  - 监听系统主题变化
  - 自动切换主题

- [ ] **T5.1.5** 实现自定义主题（可选）
  - 主题编辑器
  - 导入/导出主题
  - 主题预设

#### 5.2 快捷键系统

- [x] **T5.2.1** 创建快捷键 composable `useShortcuts.ts`
  - 快捷键注册
  - ~~快捷键冲突处理~~ (待实现)
  - 平台适配（Mac/Windows）

- [x] **T5.2.2** 实现文件快捷键
  ```
  Cmd/Ctrl + N    新建文件
  Cmd/Ctrl + O    打开文件
  Cmd/Ctrl + S    保存文件
  Cmd/Ctrl + Shift + S    另存为
  Cmd/Ctrl + W    关闭文件
  ```

- [x] **T5.2.3** 实现编辑快捷键 (由 Milkdown 提供)
  ```
  Cmd/Ctrl + Z    撤销
  Cmd/Ctrl + Shift + Z    重做
  Cmd/Ctrl + X    剪切
  Cmd/Ctrl + C    复制
  Cmd/Ctrl + V    粘贴
  Cmd/Ctrl + A    全选
  ```

- [ ] **T5.2.4** 实现格式快捷键
  ```
  Cmd/Ctrl + B    加粗
  Cmd/Ctrl + I    斜体
  Cmd/Ctrl + K    插入链接
  Cmd/Ctrl + Shift + K    插入代码块
  Cmd/Ctrl + 1-6    标题 1-6
  ```

- [x] **T5.2.5** 实现视图快捷键 (部分完成)
  ```
  Cmd/Ctrl + \    切换侧边栏
  ~~Cmd/Ctrl + Shift + L    切换目录~~ (待实现)
  Cmd/Ctrl + +    放大字体
  Cmd/Ctrl + -    缩小字体
  Cmd/Ctrl + 0    重置字体
  ~~F11    全屏~~ (待实现)
  ```

- [ ] **T5.2.6** 实现快捷键自定义（可选）
  - 快捷键设置面板
  - 自定义绑定
  - 重置默认

#### 5.3 专注模式

- [ ] **T5.3.1** 实现专注模式
  - 隐藏侧边栏
  - 隐藏工具栏
  - 隐藏状态栏
  - 全屏编辑

- [ ] **T5.3.2** 实现打字机模式
  - 当前行保持屏幕中央
  - 平滑滚动
  - 可配置位置

- [ ] **T5.3.3** 实现段落聚焦
  - 当前段落高亮
  - 其他段落淡化
  - 可调节淡化程度

#### 5.4 设置面板

- [ ] **T5.4.1** 创建设置对话框 `SettingsDialog.vue`
  - 分类标签页
  - 设置项搜索
  - 重置默认

- [ ] **T5.4.2** 实现外观设置
  - 主题选择
  - 字体设置（大小、字体族、行高）
  - 编辑器宽度
  - 显示行号

- [ ] **T5.4.3** 实现编辑器设置
  - 自动保存开关及间隔
  - 拼写检查
  - 自动配对（括号、引号）
  - 智能缩进

- [ ] **T5.4.4** 实现图片设置
  - 图片存储位置
  - 图片命名规则
  - 图片压缩选项

- [ ] **T5.4.5** 实现文件设置
  - 默认保存路径
  - 文件编码
  - 换行符类型

- [ ] **T5.4.6** 实现 Rust 配置持久化
  ```rust
  // 使用 serde 序列化配置
  // 存储到用户数据目录
  // ~/.config/ourea/settings.json (macOS/Linux)
  // %APPDATA%/ourea/settings.json (Windows)
  ```

---

### Phase 6: 导出与扩展功能

#### 6.1 导出功能

- [ ] **T6.1.1** 创建导出服务 `services/export_service.rs`
  - 统一导出接口
  - 导出进度回调
  - 错误处理

- [ ] **T6.1.2** 实现导出 HTML
  - 使用 pulldown-cmark 转换
  - 内联样式选项
  - 包含/不包含样式

- [ ] **T6.1.3** 实现导出 PDF
  - 方案 A: 使用 wkhtmltopdf
  - 方案 B: 使用 printpdf crate
  - 方案 C: 使用系统打印功能
  - 页面设置（大小、边距）
  - 页眉页脚

- [ ] **T6.1.4** 实现导出图片（可选）
  - 导出为 PNG
  - 长图模式
  - 分页模式

- [ ] **T6.1.5** 创建导出对话框 `ExportDialog.vue`
  - 格式选择
  - 导出设置
  - 预览功能

#### 6.2 打印功能

- [ ] **T6.2.1** 实现打印预览
  - 打印样式表
  - 分页预览

- [ ] **T6.2.2** 实现打印设置
  - 纸张大小
  - 页边距
  - 页眉页脚

- [ ] **T6.2.3** 调用系统打印
  - 使用 Tauri shell 插件
  - 跨平台适配

#### 6.3 国际化

- [ ] **T6.3.1** 设置 i18n 框架
  ```bash
  npm install vue-i18n
  ```

- [ ] **T6.3.2** 创建语言文件
  - `zh-CN.json` 简体中文
  - `en-US.json` 英文

- [ ] **T6.3.3** 实现语言切换
  - 设置中切换
  - 跟随系统语言
  - 语言持久化

#### 6.4 应用菜单

- [ ] **T6.4.1** 配置 macOS 应用菜单
  - 文件菜单
  - 编辑菜单
  - 格式菜单
  - 视图菜单
  - 帮助菜单

- [ ] **T6.4.2** 配置 Windows 应用菜单
  - 菜单栏
  - 右键菜单

- [ ] **T6.4.3** 实现菜单命令绑定
  - 连接菜单项与功能
  - 快捷键显示
  - 菜单状态（启用/禁用/选中）

---

### Phase 7: 测试与发布

#### 7.1 单元测试

- [ ] **T7.1.1** 配置 Rust 测试
  ```rust
  #[cfg(test)]
  mod tests {
      // 文件操作测试
      // 配置管理测试
      // 导出功能测试
  }
  ```

- [ ] **T7.1.2** 配置前端测试
  ```bash
  npm install -D vitest @vue/test-utils
  ```

- [ ] **T7.1.3** 编写组件测试
  - 编辑器组件测试
  - 文件操作测试
  - 设置功能测试

#### 7.2 E2E 测试

- [ ] **T7.2.1** 配置 E2E 测试框架
  ```bash
  npm install -D @playwright/test
  ```

- [ ] **T7.2.2** 编写 E2E 测试用例
  - 文件创建/打开/保存流程
  - 编辑器基本操作
  - 导出功能
  - 设置功能

#### 7.3 性能优化

- [ ] **T7.3.1** 优化启动速度
  - 懒加载非必要模块
  - 预加载关键资源
  - 减少初始化操作

- [ ] **T7.3.2** 优化编辑性能
  - 大文件虚拟滚动
  - 防抖节流优化
  - 减少不必要渲染

- [ ] **T7.3.3** 优化内存使用
  - 及时清理资源
  - 图片懒加载
  - 限制历史记录大小

#### 7.4 打包发布

- [ ] **T7.4.1** 配置 macOS 打包
  - 代码签名
  - 公证（Notarization）
  - DMG 安装包
  - 自动更新配置

- [ ] **T7.4.2** 配置 Windows 打包
  - 代码签名
  - NSIS/MSI 安装包
  - 便携版
  - 自动更新配置

- [ ] **T7.4.3** 配置 CI/CD
  ```yaml
  # GitHub Actions
  - 自动构建
  - 自动测试
  - 自动发布
  ```

- [ ] **T7.4.4** 配置自动更新
  - 使用 Tauri updater 插件
  - 更新服务器配置
  - 版本检查逻辑

- [ ] **T7.4.5** 发布准备
  - 编写 README
  - 编写 CHANGELOG
  - 准备截图和演示
  - 创建官网（可选）

---

## 五、里程碑

| 里程碑 | 阶段 | 关键交付物 |
|--------|------|-----------|
| M1 | Phase 1 完成 | 可运行的空壳应用，基础布局 |
| M2 | Phase 2 完成 | 可用的 Markdown 编辑器 |
| M3 | Phase 3 完成 | 完整的文件管理功能 |
| M4 | Phase 4 完成 | 高级编辑功能（图片、表格、公式） |
| M5 | Phase 5 完成 | 完善的用户体验 |
| M6 | Phase 6 完成 | 导出功能和国际化 |
| M7 | Phase 7 完成 | 测试完成，准备发布 |
| **Release 1.0** | 全部完成 | 正式版本发布 |

---

## 六、技术风险与对策

| 风险 | 影响 | 对策 |
|------|------|------|
| Milkdown 复杂度高 | 学习曲线陡峭 | 从官方示例入手，渐进式集成 |
| 跨平台兼容性 | 样式/功能差异 | 早期多平台测试，使用平台适配层 |
| 大文件性能 | 编辑卡顿 | 虚拟滚动，延迟渲染 |
| PDF 导出质量 | 排版不一致 | 多方案评估，选择最优 |
| macOS 签名公证 | 发布受阻 | 提前申请开发者账号 |

---

## 七、参考资源

### 官方文档
- [Tauri 官方文档](https://tauri.app/v2/guides/)
- [Milkdown 官方文档](https://milkdown.dev/docs/guide/why-milkdown)
- [Vue 3 文档](https://vuejs.org/)
- [ProseMirror 文档](https://prosemirror.net/docs/)

### 参考项目
- [Typora](https://typora.io/) - 目标参考
- [Mark Text](https://github.com/marktext/marktext) - 开源 Markdown 编辑器
- [Zettlr](https://github.com/Zettlr/Zettlr) - 学术写作 Markdown 编辑器

### 设计资源
- [Tauri + Vue 模板](https://github.com/tauri-apps/tauri/tree/dev/examples)
- [Milkdown 示例](https://github.com/Milkdown/milkdown/tree/main/packages)
