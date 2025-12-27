<script setup lang="ts">
import { ref, onMounted, watch, nextTick } from "vue";
import { useMilkdown } from "@/composables/useMilkdown";
import { useTabsStore } from "@/stores/tabs";

const tabsStore = useTabsStore();
const editorRef = ref<HTMLDivElement | null>(null);
const { isReady, createEditor, setContent, setTabSwitching } = useMilkdown(editorRef);

// Track which tab's content is currently loaded
const loadedTabId = ref<string | null>(null);

// Watch for active tab changes
watch(
  () => tabsStore.activeTabId,
  (newTabId, oldTabId) => {
    if (!newTabId || newTabId === loadedTabId.value) return;

    if (isReady.value) {
      // Enable tab switching mode BEFORE any content changes
      setTabSwitching(true);

      // Use nextTick to ensure DOM is ready, then load content
      nextTick(() => {
        // Re-fetch active tab inside nextTick to get latest data
        const currentTab = tabsStore.activeTab;
        if (!currentTab) {
          setTabSwitching(false);
          return;
        }

        const content = currentTab.content || "";
        setContent(content, false); // false = don't mark as change
        loadedTabId.value = newTabId;

        // Disable tab switching mode after content is fully processed
        // Use longer timeout to ensure Milkdown has finished all async updates
        setTimeout(() => {
          setTabSwitching(false);
        }, 300);
      });
    }
  },
  { immediate: true }
);

onMounted(async () => {
  // Wait for the DOM element to be available
  await new Promise(resolve => setTimeout(resolve, 0));

  if (editorRef.value) {
    const activeTab = tabsStore.activeTab;

    // Get initial content - empty string for new files
    const initialContent = activeTab?.content || "";

    await createEditor(initialContent);

    if (activeTab) {
      loadedTabId.value = activeTab.id;
      // New files should stay dirty - no need to reset
    }
  }
});
</script>

<template>
  <div class="editor-wrapper">
    <div v-if="!isReady" class="editor-loading">
      <div class="loading-spinner"></div>
      <span>Loading editor...</span>
    </div>
    <div ref="editorRef" class="milkdown-editor"></div>
  </div>
</template>

<style scoped>
.editor-wrapper {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow-y: overlay;
  overflow-x: hidden;
  background-color: var(--color-bg-primary);
  position: relative;
  border: none !important;
  border-right: none !important;
  box-shadow: none !important;
  outline: none !important;
}

/* Fallback for browsers that don't support overlay */
@supports not (overflow: overlay) {
  .editor-wrapper {
    overflow-y: auto;
  }
}

.editor-loading {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  color: var(--color-text-secondary);
  z-index: 10;
}

.loading-spinner {
  width: 24px;
  height: 24px;
  border: 2px solid var(--color-border);
  border-top-color: var(--color-accent);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.milkdown-editor {
  padding: 40px;
  max-width: 800px;
  margin: 0 auto;
  width: 100%;
  min-height: 100%;
  border: none !important;
  box-shadow: none !important;
  outline: none !important;
}
</style>

<style>
/* Milkdown editor global styles */
.milkdown {
  font-family: var(--font-family, system-ui, -apple-system, sans-serif);
  font-size: var(--font-size, 16px);
  line-height: var(--line-height, 1.6);
  color: var(--color-text-primary);
  min-height: 200px;
  height: 100%;
}

.milkdown .editor,
.milkdown .ProseMirror {
  outline: none !important;
  border: none !important;
  box-shadow: none !important;
  min-height: 200px;
  height: 100%;
}

/* Headings */
.milkdown h1 {
  font-size: 2em;
  font-weight: 700;
  margin: 1em 0 0.5em;
  padding-bottom: 0.3em;
  border-bottom: 1px solid var(--color-border);
}

.milkdown h2 {
  font-size: 1.5em;
  font-weight: 600;
  margin: 1em 0 0.5em;
  padding-bottom: 0.3em;
  border-bottom: 1px solid var(--color-border);
}

.milkdown h3 {
  font-size: 1.25em;
  font-weight: 600;
  margin: 1em 0 0.5em;
}

.milkdown h4,
.milkdown h5,
.milkdown h6 {
  font-size: 1em;
  font-weight: 600;
  margin: 1em 0 0.5em;
}

/* Paragraphs */
.milkdown p {
  margin: 0.5em 0;
}

/* Links */
.milkdown a {
  color: var(--color-accent);
  text-decoration: none;
}

.milkdown a:hover {
  text-decoration: underline;
}

/* Bold and Italic */
.milkdown strong {
  font-weight: 600;
}

.milkdown em {
  font-style: italic;
}

/* Code */
.milkdown code {
  font-family: "JetBrains Mono", "Fira Code", monospace;
  font-size: 0.9em;
  background-color: var(--color-bg-secondary);
  padding: 0.2em 0.4em;
  border-radius: 4px;
}

.milkdown pre {
  background-color: var(--color-bg-secondary);
  border-radius: 8px;
  padding: 16px;
  overflow-x: auto;
  margin: 1em 0;
}

.milkdown pre code {
  background: none;
  padding: 0;
  font-size: 0.875em;
  line-height: 1.5;
}

/* Blockquotes */
.milkdown blockquote {
  border-left: 4px solid var(--color-accent);
  margin: 1em 0;
  padding: 0.5em 1em;
  background-color: var(--color-bg-secondary);
  border-radius: 0 8px 8px 0;
}

.milkdown blockquote p {
  margin: 0;
}

/* Lists */
.milkdown ul,
.milkdown ol {
  margin: 0.5em 0;
  padding-left: 2em;
}

.milkdown li {
  margin: 0.25em 0;
}

/* Task lists */
.milkdown li[data-task-list-item] {
  list-style: none;
  margin-left: -1.5em;
}

.milkdown li[data-task-list-item] input[type="checkbox"] {
  margin-right: 0.5em;
  width: 16px;
  height: 16px;
  accent-color: var(--color-accent);
}

/* Tables */
.milkdown table {
  border-collapse: collapse;
  width: 100%;
  margin: 1em 0;
}

.milkdown th,
.milkdown td {
  border: 1px solid var(--color-border);
  padding: 8px 12px;
  text-align: left;
}

.milkdown th {
  background-color: var(--color-bg-secondary);
  font-weight: 600;
}

.milkdown tr:nth-child(even) {
  background-color: var(--color-bg-secondary);
}

/* Horizontal Rule */
.milkdown hr {
  border: none;
  border-top: 1px solid var(--color-border);
  margin: 2em 0;
}

/* Images */
.milkdown img {
  max-width: 100%;
  height: auto;
  border-radius: 8px;
  margin: 1em 0;
}

/* Selection */
.milkdown .ProseMirror-selectednode {
  outline: 2px solid var(--color-accent);
  outline-offset: 2px;
}

/* Placeholder */
.milkdown .ProseMirror p.is-editor-empty:first-child::before {
  content: "Start writing...";
  color: var(--color-text-secondary);
  pointer-events: none;
  float: left;
  height: 0;
}
</style>
