<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted, nextTick } from "vue";
import { codeToHtml } from "shiki";

const props = defineProps<{
  modelValue: string;
  language: string;
  readonly?: boolean;
}>();

const emit = defineEmits<{
  (e: "update:modelValue", value: string): void;
}>();

const textareaRef = ref<HTMLTextAreaElement | null>(null);
const highlightedCode = ref("");
const isLoading = ref(true);
const isDarkMode = ref(false);

// Map file extensions to Shiki language names
const languageMap: Record<string, string> = {
  js: "javascript",
  jsx: "jsx",
  ts: "typescript",
  tsx: "tsx",
  vue: "vue",
  svelte: "svelte",
  html: "html",
  htm: "html",
  xml: "xml",
  svg: "xml",
  css: "css",
  scss: "scss",
  sass: "sass",
  less: "less",
  json: "json",
  yaml: "yaml",
  yml: "yaml",
  toml: "toml",
  rs: "rust",
  go: "go",
  py: "python",
  rb: "ruby",
  php: "php",
  java: "java",
  kt: "kotlin",
  scala: "scala",
  swift: "swift",
  c: "c",
  cpp: "cpp",
  h: "c",
  hpp: "cpp",
  cs: "csharp",
  fs: "fsharp",
  sh: "bash",
  bash: "bash",
  zsh: "bash",
  fish: "shellscript",
  ps1: "powershell",
  bat: "bat",
  cmd: "bat",
  sql: "sql",
  graphql: "graphql",
  gql: "graphql",
  md: "markdown",
  markdown: "markdown",
  txt: "text",
  text: "text",
  log: "log",
  ini: "ini",
  conf: "ini",
  cfg: "ini",
  env: "shellscript",
  dockerfile: "dockerfile",
  makefile: "makefile",
};

const shikiLanguage = computed(() => {
  const ext = props.language?.toLowerCase() || "txt";
  return languageMap[ext] || "javascript"; // Default to javascript for better highlighting
});

const displayLanguage = computed(() => {
  return props.language?.toUpperCase() || "TXT";
});

// Detect dark mode
function checkDarkMode() {
  isDarkMode.value = document.documentElement.classList.contains("dark");
}

// MutationObserver to watch for theme changes
let observer: MutationObserver | null = null;

async function highlightCode() {
  if (!props.modelValue) {
    highlightedCode.value = "";
    isLoading.value = false;
    return;
  }

  isLoading.value = true;

  try {
    const theme = isDarkMode.value ? "github-dark" : "github-light";
    const html = await codeToHtml(props.modelValue, {
      lang: shikiLanguage.value,
      theme: theme,
    });
    highlightedCode.value = html;
  } catch (error) {
    console.error("Failed to highlight code:", error);
    // Fallback to plain text with basic styling
    highlightedCode.value = `<pre style="margin:0;"><code>${escapeHtml(props.modelValue)}</code></pre>`;
  } finally {
    isLoading.value = false;
  }
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function handleInput(event: Event) {
  const target = event.target as HTMLTextAreaElement;
  emit("update:modelValue", target.value);
}

function handleKeyDown(event: KeyboardEvent) {
  // Handle Tab key for indentation
  if (event.key === "Tab") {
    event.preventDefault();
    const target = event.target as HTMLTextAreaElement;
    const start = target.selectionStart;
    const end = target.selectionEnd;

    const newValue = props.modelValue.substring(0, start) + "  " + props.modelValue.substring(end);
    emit("update:modelValue", newValue);

    // Restore cursor position
    nextTick(() => {
      target.selectionStart = target.selectionEnd = start + 2;
    });
  }
}

function syncScroll(event: Event) {
  const target = event.target as HTMLElement;
  const codeDisplay = document.querySelector(".code-display") as HTMLElement;
  if (codeDisplay) {
    codeDisplay.scrollTop = target.scrollTop;
    codeDisplay.scrollLeft = target.scrollLeft;
  }
}

// Watch for content changes - debounce to avoid too many re-renders
let highlightTimeout: number | null = null;
function debouncedHighlight() {
  if (highlightTimeout) clearTimeout(highlightTimeout);
  highlightTimeout = window.setTimeout(() => {
    highlightCode();
  }, 100);
}

watch(() => props.modelValue, debouncedHighlight, { immediate: true });
watch(() => props.language, highlightCode);
watch(isDarkMode, highlightCode);

onMounted(() => {
  // Check initial dark mode
  checkDarkMode();

  // Watch for theme changes via MutationObserver
  observer = new MutationObserver(() => {
    checkDarkMode();
  });

  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["class"],
  });

  highlightCode();
});

onUnmounted(() => {
  if (observer) {
    observer.disconnect();
    observer = null;
  }
  if (highlightTimeout) {
    clearTimeout(highlightTimeout);
  }
});
</script>

<template>
  <div class="code-editor">
    <div class="code-editor-header">
      <span class="file-type-badge">{{ displayLanguage }}</span>
      <span class="mode-hint">Code Editor</span>
    </div>

    <div class="code-editor-body">
      <!-- Highlighted code display (background layer) -->
      <div
        class="code-display"
        :class="{ loading: isLoading }"
        v-html="highlightedCode"
      ></div>

      <!-- Editable textarea (foreground layer) -->
      <textarea
        ref="textareaRef"
        class="code-input"
        :value="modelValue"
        :readonly="readonly"
        @input="handleInput"
        @keydown="handleKeyDown"
        @scroll="syncScroll"
        spellcheck="false"
        autocomplete="off"
        autocorrect="off"
        autocapitalize="off"
      ></textarea>
    </div>
  </div>
</template>

<style scoped>
.code-editor {
  display: flex;
  flex-direction: column;
  height: 100%;
  width: 100%;
  background-color: var(--color-bg-primary);
}

.code-editor-header {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px 16px;
  background-color: var(--color-bg-secondary);
  border-bottom: 1px solid var(--color-border);
  flex-shrink: 0;
}

.file-type-badge {
  font-size: 11px;
  font-weight: 600;
  padding: 2px 8px;
  border-radius: 4px;
  background-color: var(--color-accent);
  color: white;
}

.mode-hint {
  font-size: 12px;
  color: var(--color-text-secondary);
}

.code-editor-body {
  flex: 1;
  position: relative;
  overflow: hidden;
}

.code-display,
.code-input {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  padding: 16px;
  font-family: "JetBrains Mono", "Fira Code", "SF Mono", Consolas, monospace;
  font-size: 14px;
  line-height: 1.6;
  tab-size: 2;
  white-space: pre;
  overflow: auto;
}

.code-display {
  pointer-events: none;
  z-index: 1;
}

.code-display.loading {
  opacity: 0.5;
}

/* Override Shiki styles */
.code-display :deep(pre) {
  margin: 0;
  padding: 0;
  background: transparent !important;
  font-family: inherit;
  font-size: inherit;
  line-height: inherit;
}

.code-display :deep(code) {
  font-family: inherit;
  font-size: inherit;
  line-height: inherit;
  background: transparent !important;
}

.code-display :deep(.shiki) {
  background: transparent !important;
}

.code-input {
  z-index: 2;
  color: transparent;
  background: transparent;
  caret-color: var(--color-text-primary);
  border: none;
  outline: none;
  resize: none;
}

.code-input::selection {
  background-color: rgba(59, 130, 246, 0.3);
}

.code-input:focus {
  outline: none;
}
</style>
