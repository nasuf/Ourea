# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Ourea is a cross-platform WYSIWYG Markdown editor built with Tauri 2.x + Vue 3 + Milkdown.

## Tech Stack

- **Desktop Framework**: Tauri 2.x (Rust backend + WebView frontend)
- **Frontend**: Vue 3 + TypeScript + Vite
- **Editor**: Milkdown (ProseMirror + Remark based)
- **Styling**: TailwindCSS
- **State Management**: Pinia

## Build Commands

```bash
# Install dependencies
npm install

# Development (frontend only)
npm run dev

# Development (with Tauri)
npm run tauri:dev

# Build for production
npm run tauri:build

# Type check
npx vue-tsc --noEmit

# Rust check
cd src-tauri && cargo check
```

## Project Structure

```
ourea/
├── src/                    # Frontend Vue source
│   ├── components/         # Vue components
│   │   ├── layout/         # Layout components (TitleBar, Sidebar, StatusBar)
│   │   ├── editor/         # Editor components (MilkdownEditor)
│   │   └── dialogs/        # Dialog components
│   ├── stores/             # Pinia stores (editor, file, settings)
│   ├── composables/        # Vue composables
│   └── assets/styles/      # CSS and themes
├── src-tauri/              # Tauri Rust backend
│   ├── src/
│   │   ├── lib.rs          # Main app entry
│   │   └── commands/       # Tauri commands (file operations)
│   ├── Cargo.toml          # Rust dependencies
│   └── tauri.conf.json     # Tauri configuration
└── PROJECT_PLAN.md         # Detailed implementation plan
```

## Key Files

- `src-tauri/tauri.conf.json`: Tauri app configuration
- `src-tauri/capabilities/default.json`: Permission configuration
- `src/components/editor/MilkdownEditor.vue`: Main editor component
- `src/stores/`: Pinia state management stores
