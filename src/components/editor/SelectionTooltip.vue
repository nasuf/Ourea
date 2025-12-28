<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from "vue";
import { TooltipProvider } from "@milkdown/plugin-tooltip";
import type { EditorView } from "@milkdown/prose/view";
import type { EditorState } from "@milkdown/prose/state";

const props = defineProps<{
  editorView: EditorView | null;
}>();

const emit = defineEmits<{
  (e: "command", command: string, payload?: any): void;
}>();

const tooltipRef = ref<HTMLDivElement | null>(null);
const isVisible = ref(false);
let provider: TooltipProvider | null = null;

const tooltipItems = [
  { id: "bold", icon: "B", title: "Bold", command: "toggleBold" },
  { id: "italic", icon: "I", title: "Italic", command: "toggleItalic" },
  { id: "strike", icon: "S", title: "Strikethrough", command: "toggleStrikethrough" },
  { id: "code", icon: "code", title: "Code", command: "toggleInlineCode" },
  { id: "link", icon: "link", title: "Link", command: "toggleLink" },
];

function shouldShow(view: EditorView, prevState?: EditorState): boolean {
  const { state } = view;
  const { selection } = state;
  const { empty, from, to } = selection;

  // Don't show for empty selections or if the selection contains nodes
  if (empty) return false;

  // Only show for text selections (not node selections)
  const isTextSelection = selection.$from.parent.isTextblock;
  if (!isTextSelection) return false;

  // Check if selection crosses multiple blocks (don't show for multi-block selections)
  const $from = state.doc.resolve(from);
  const $to = state.doc.resolve(to);
  if ($from.parent !== $to.parent) return false;

  return true;
}

function handleCommand(command: string) {
  emit("command", command);
  // Keep tooltip visible after command
}

onMounted(() => {
  if (tooltipRef.value && props.editorView) {
    provider = new TooltipProvider({
      content: tooltipRef.value,
      shouldShow,
      debounce: 50,
      offset: { mainAxis: 8 },
    });

    provider.onShow = () => {
      isVisible.value = true;
    };

    provider.onHide = () => {
      isVisible.value = false;
    };
  }
});

onUnmounted(() => {
  if (provider) {
    provider.destroy();
    provider = null;
  }
});

// Update provider when editor view changes
function updateProvider(view: EditorView, prevState?: EditorState) {
  if (provider) {
    provider.update(view, prevState);
  }
}

defineExpose({
  updateProvider,
});
</script>

<template>
  <div
    ref="tooltipRef"
    class="selection-tooltip"
    :class="{ visible: isVisible }"
  >
    <button
      v-for="item in tooltipItems"
      :key="item.id"
      class="tooltip-btn"
      :class="item.id"
      :title="item.title"
      @mousedown.prevent="handleCommand(item.command)"
    >
      <span v-if="item.id === 'bold'" class="icon-bold">B</span>
      <span v-else-if="item.id === 'italic'" class="icon-italic">I</span>
      <span v-else-if="item.id === 'strike'" class="icon-strike">S</span>
      <span v-else-if="item.id === 'code'">
        <svg width="12" height="12" viewBox="0 0 16 16" fill="currentColor">
          <path d="M5.854 4.854a.5.5 0 1 0-.708-.708l-3.5 3.5a.5.5 0 0 0 0 .708l3.5 3.5a.5.5 0 0 0 .708-.708L2.707 8l3.147-3.146zm4.292 0a.5.5 0 0 1 .708-.708l3.5 3.5a.5.5 0 0 1 0 .708l-3.5 3.5a.5.5 0 0 1-.708-.708L13.293 8l-3.147-3.146z"/>
        </svg>
      </span>
      <span v-else-if="item.id === 'link'">
        <svg width="12" height="12" viewBox="0 0 16 16" fill="currentColor">
          <path d="M4.715 6.542 3.343 7.914a3 3 0 1 0 4.243 4.243l1.828-1.829A3 3 0 0 0 8.586 5.5L8 6.086a1.002 1.002 0 0 0-.154.199 2 2 0 0 1 .861 3.337L6.88 11.45a2 2 0 1 1-2.83-2.83l.793-.792a4.018 4.018 0 0 1-.128-1.287z"/>
          <path d="M6.586 4.672A3 3 0 0 0 7.414 9.5l.775-.776a2 2 0 0 1-.896-3.346L9.12 3.55a2 2 0 1 1 2.83 2.83l-.793.792c.112.42.155.855.128 1.287l1.372-1.372a3 3 0 1 0-4.243-4.243L6.586 4.672z"/>
        </svg>
      </span>
    </button>
  </div>
</template>

<style scoped>
.selection-tooltip {
  position: absolute;
  z-index: 1000;
  display: flex;
  gap: 2px;
  padding: 4px;
  background-color: var(--color-bg-primary);
  border: 1px solid var(--color-border);
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  opacity: 0;
  visibility: hidden;
  transition: opacity 0.15s ease, visibility 0.15s ease;
}

.selection-tooltip.visible {
  opacity: 1;
  visibility: visible;
}

.tooltip-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border: none;
  background: transparent;
  color: var(--color-text-primary);
  cursor: pointer;
  border-radius: 4px;
  font-size: 13px;
  transition: background-color 0.15s ease;
}

.tooltip-btn:hover {
  background-color: var(--color-bg-secondary);
}

.tooltip-btn:active {
  transform: scale(0.95);
}

.tooltip-btn .icon-bold {
  font-weight: 700;
}

.tooltip-btn .icon-italic {
  font-style: italic;
  font-family: serif;
}

.tooltip-btn .icon-strike {
  text-decoration: line-through;
}
</style>
