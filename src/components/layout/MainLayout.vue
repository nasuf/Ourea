<script setup lang="ts">
import { ref, computed, provide, onMounted, onUnmounted } from "vue";
import { listen, UnlistenFn } from "@tauri-apps/api/event";
import TitleBar from "./TitleBar.vue";
import Sidebar from "./Sidebar.vue";
import Outline from "./Outline.vue";
import StatusBar from "./StatusBar.vue";
import MilkdownEditor from "../editor/MilkdownEditor.vue";
import EditorToolbar from "../editor/EditorToolbar.vue";
import EmptyState from "../editor/EmptyState.vue";
import SearchDialog from "../dialogs/SearchDialog.vue";
import FormulaDialog from "../dialogs/FormulaDialog.vue";
import ImageManagerDialog from "../dialogs/ImageManagerDialog.vue";
import { useTabsStore } from "@/stores/tabs";
import { useFile } from "@/composables/useFile";
import { useGlobalSearch } from "@/composables/useSearch";

const tabsStore = useTabsStore();
const { openFile } = useFile();
const {
  isSearchOpen,
  closeSearch,
  search,
  nextMatch,
  prevMatch,
  replace,
  replaceAll,
  matchCount,
  currentMatchIndex,
} = useGlobalSearch();

// Search dialog ref
const searchDialogRef = ref<InstanceType<typeof SearchDialog> | null>(null);

// Formula dialog state
const isFormulaDialogVisible = ref(false);

function openFormulaDialog() {
  isFormulaDialogVisible.value = true;
}

function closeFormulaDialog() {
  isFormulaDialogVisible.value = false;
}

function handleInsertFormula(formula: string, isBlock: boolean) {
  if (editorRef.value) {
    // Insert formula as LaTeX math text
    const formulaText = isBlock ? `$$\n${formula}\n$$` : `$${formula}$`;
    editorRef.value.insertText(formulaText);
  }
  closeFormulaDialog();
}

// Image Manager dialog state
const isImageManagerVisible = ref(false);

function openImageManager() {
  isImageManagerVisible.value = true;
}

function closeImageManager() {
  isImageManagerVisible.value = false;
}

// Handle search events
function handleSearch(query: string, options: any) {
  search(query, options);
  // Update match info in dialog
  if (searchDialogRef.value) {
    searchDialogRef.value.updateMatchInfo(
      matchCount.value > 0 ? currentMatchIndex.value + 1 : 0,
      matchCount.value
    );
  }
}

function handleNext() {
  nextMatch();
  if (searchDialogRef.value) {
    searchDialogRef.value.updateMatchInfo(
      matchCount.value > 0 ? currentMatchIndex.value + 1 : 0,
      matchCount.value
    );
  }
}

function handlePrev() {
  prevMatch();
  if (searchDialogRef.value) {
    searchDialogRef.value.updateMatchInfo(
      matchCount.value > 0 ? currentMatchIndex.value + 1 : 0,
      matchCount.value
    );
  }
}

function handleReplace(replacement: string) {
  replace(replacement);
  if (searchDialogRef.value) {
    searchDialogRef.value.updateMatchInfo(
      matchCount.value > 0 ? currentMatchIndex.value + 1 : 0,
      matchCount.value
    );
  }
}

function handleReplaceAll(replacement: string) {
  replaceAll(replacement);
  if (searchDialogRef.value) {
    searchDialogRef.value.updateMatchInfo(0, 0);
  }
}

const sidebarVisible = ref(true);
const sidebarWidth = ref(250);
const outlineVisible = ref(true);
const outlineWidth = ref(400);
const isDragging = ref(false);

const hasOpenTabs = computed(() => tabsStore.tabs.length > 0);

const toggleSidebar = () => {
  sidebarVisible.value = !sidebarVisible.value;
};

const toggleOutline = () => {
  outlineVisible.value = !outlineVisible.value;
};

// Provide outline state to TitleBar
provide("outlineVisible", outlineVisible);
provide("toggleOutline", toggleOutline);

// Editor ref for toolbar commands
const editorRef = ref<InstanceType<typeof MilkdownEditor> | null>(null);

// Handle toolbar commands
function handleToolbarCommand(command: string, payload?: any) {
  // Handle special commands
  if (command === "openFormulaDialog") {
    openFormulaDialog();
    return;
  }

  if (command === "openImageManager") {
    openImageManager();
    return;
  }

  if (editorRef.value) {
    editorRef.value.executeCommand(command, payload);
  }
}

// File drop handling
let unlistenDrop: UnlistenFn | null = null;
let unlistenHover: UnlistenFn | null = null;
let unlistenCancel: UnlistenFn | null = null;

// Supported text file extensions
const TEXT_EXTENSIONS = new Set([
  // Markdown
  "md", "markdown",
  // Plain text
  "txt", "text",
  // Code files
  "js", "ts", "jsx", "tsx",
  "vue", "svelte",
  "html", "htm", "xml", "svg",
  "css", "scss", "sass", "less",
  "json", "yaml", "yml", "toml",
  "rs", "go", "py", "rb", "php",
  "java", "kt", "scala", "swift",
  "c", "cpp", "h", "hpp",
  "cs", "fs",
  "sh", "bash", "zsh", "fish",
  "ps1", "bat", "cmd",
  "sql", "graphql", "gql",
  // Config files
  "env", "ini", "conf", "cfg",
  "gitignore", "dockerignore", "editorconfig",
  // Documentation
  "rst", "adoc", "org", "tex",
  // Data files
  "csv", "tsv", "log",
]);

function isTextFile(path: string): boolean {
  const ext = path.split(".").pop()?.toLowerCase();
  return ext ? TEXT_EXTENSIONS.has(ext) : false;
}

onMounted(async () => {
  // Listen for file drop events
  unlistenDrop = await listen<{ paths: string[] }>("tauri://drag-drop", async (event) => {
    isDragging.value = false;
    const paths = event.payload.paths;

    for (const path of paths) {
      // Open supported text files
      if (isTextFile(path)) {
        await openFile(path);
      }
    }
  });

  // Listen for drag hover
  unlistenHover = await listen("tauri://drag-enter", () => {
    isDragging.value = true;
  });

  // Listen for drag cancel/leave
  unlistenCancel = await listen("tauri://drag-leave", () => {
    isDragging.value = false;
  });
});

onUnmounted(() => {
  if (unlistenDrop) unlistenDrop();
  if (unlistenHover) unlistenHover();
  if (unlistenCancel) unlistenCancel();
});
</script>

<template>
  <div class="main-layout" :class="{ 'is-dragging': isDragging }">
    <TitleBar @toggle-sidebar="toggleSidebar" />

    <div class="content-area">
      <Sidebar v-show="sidebarVisible" :width="sidebarWidth" />

      <main class="editor-area">
        <EditorToolbar v-if="hasOpenTabs" @command="handleToolbarCommand" />
        <MilkdownEditor v-if="hasOpenTabs" ref="editorRef" />
        <EmptyState v-else />
      </main>

      <Outline
        v-if="hasOpenTabs && outlineVisible"
        v-model:width="outlineWidth"
      />
    </div>

    <StatusBar v-if="hasOpenTabs" />

    <!-- Drop overlay -->
    <div v-if="isDragging" class="drop-overlay">
      <div class="drop-indicator">
        <svg width="48" height="48" viewBox="0 0 16 16" fill="currentColor">
          <path d="M4 0a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V4.707A1 1 0 0 0 13.707 4L10 .293A1 1 0 0 0 9.293 0H4zm5.5 1.5v2a1 1 0 0 0 1 1h2l-3-3z"/>
        </svg>
        <span>Drop file to open</span>
      </div>
    </div>

    <!-- Search Dialog -->
    <SearchDialog
      ref="searchDialogRef"
      :visible="isSearchOpen && hasOpenTabs"
      @close="closeSearch"
      @search="handleSearch"
      @replace="handleReplace"
      @replace-all="handleReplaceAll"
      @next="handleNext"
      @prev="handlePrev"
    />

    <!-- Formula Dialog -->
    <FormulaDialog
      :visible="isFormulaDialogVisible && hasOpenTabs"
      @close="closeFormulaDialog"
      @insert="handleInsertFormula"
    />

    <!-- Image Manager Dialog -->
    <ImageManagerDialog
      :visible="isImageManagerVisible && hasOpenTabs"
      @close="closeImageManager"
    />
  </div>
</template>

<style scoped>
.main-layout {
  display: flex;
  flex-direction: column;
  height: 100%;
  width: 100%;
}

.content-area {
  display: flex;
  flex: 1;
  overflow: hidden;
  border: none !important;
  box-shadow: none !important;
  outline: none !important;
  /* Ensure no gaps between flex children */
  gap: 0;
}

.editor-area {
  flex: 1;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  border: none !important;
  border-right: none !important;
  box-shadow: none !important;
  outline: none !important;
}

/* Drop overlay */
.drop-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(59, 130, 246, 0.1);
  border: 3px dashed var(--color-accent);
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
  pointer-events: none;
}

.drop-indicator {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  padding: 32px 48px;
  background-color: var(--color-bg-primary);
  border-radius: 16px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
  color: var(--color-accent);
}

.drop-indicator span {
  font-size: 18px;
  font-weight: 500;
  color: var(--color-text-primary);
}

.main-layout.is-dragging {
  pointer-events: none;
}
</style>
