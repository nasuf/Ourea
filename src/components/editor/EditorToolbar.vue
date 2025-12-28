<script setup lang="ts">
import { computed } from "vue";
import { useTabsStore } from "@/stores/tabs";

const tabsStore = useTabsStore();

const hasActiveTab = computed(() => !!tabsStore.activeTab);

// Emit commands to parent
const emit = defineEmits<{
  (e: "command", command: string, payload?: any): void;
}>();

function executeCommand(command: string, payload?: any) {
  if (!hasActiveTab.value) return;
  emit("command", command, payload);
}

interface ToolbarItem {
  id: string;
  icon: string;
  title: string;
  command: string;
  payload?: any;
}

interface ToolbarGroup {
  items: ToolbarItem[];
}

const toolbarGroups: ToolbarGroup[] = [
  {
    items: [
      { id: "bold", icon: "B", title: "Bold (Cmd+B)", command: "toggleBold" },
      { id: "italic", icon: "I", title: "Italic (Cmd+I)", command: "toggleItalic" },
      { id: "strike", icon: "S", title: "Strikethrough", command: "toggleStrikethrough" },
      { id: "code", icon: "</>", title: "Inline Code", command: "toggleInlineCode" },
    ],
  },
  {
    items: [
      { id: "h1", icon: "H1", title: "Heading 1", command: "wrapInHeading", payload: 1 },
      { id: "h2", icon: "H2", title: "Heading 2", command: "wrapInHeading", payload: 2 },
      { id: "h3", icon: "H3", title: "Heading 3", command: "wrapInHeading", payload: 3 },
    ],
  },
  {
    items: [
      { id: "bullet", icon: "list", title: "Bullet List", command: "wrapInBulletList" },
      { id: "ordered", icon: "list-ol", title: "Ordered List", command: "wrapInOrderedList" },
      { id: "tasklist", icon: "tasklist", title: "Task List", command: "insertTaskList" },
    ],
  },
  {
    items: [
      { id: "quote", icon: "quote", title: "Blockquote", command: "wrapInBlockquote" },
      { id: "codeblock", icon: "code", title: "Code Block", command: "createCodeBlock" },
      { id: "hr", icon: "hr", title: "Horizontal Rule", command: "insertHr" },
    ],
  },
  {
    items: [
      { id: "link", icon: "link", title: "Link (Cmd+K)", command: "toggleLink" },
      { id: "image", icon: "image", title: "Image", command: "insertImage" },
    ],
  },
];
</script>

<template>
  <div class="editor-toolbar" :class="{ disabled: !hasActiveTab }">
    <div v-for="(group, groupIndex) in toolbarGroups" :key="groupIndex" class="toolbar-group">
      <button
        v-for="item in group.items"
        :key="item.id"
        class="toolbar-btn"
        :class="item.id"
        :title="item.title"
        :disabled="!hasActiveTab"
        @click="executeCommand(item.command, item.payload)"
      >
        <span v-if="item.id === 'bold'" class="icon-bold">B</span>
        <span v-else-if="item.id === 'italic'" class="icon-italic">I</span>
        <span v-else-if="item.id === 'strike'" class="icon-strike">S</span>
        <span v-else-if="item.id === 'code'">
          <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
            <path d="M5.854 4.854a.5.5 0 1 0-.708-.708l-3.5 3.5a.5.5 0 0 0 0 .708l3.5 3.5a.5.5 0 0 0 .708-.708L2.707 8l3.147-3.146zm4.292 0a.5.5 0 0 1 .708-.708l3.5 3.5a.5.5 0 0 1 0 .708l-3.5 3.5a.5.5 0 0 1-.708-.708L13.293 8l-3.147-3.146z"/>
          </svg>
        </span>
        <span v-else-if="item.id.startsWith('h')">{{ item.icon }}</span>
        <span v-else-if="item.id === 'bullet'">
          <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
            <path fill-rule="evenodd" d="M5 11.5a.5.5 0 0 1 .5-.5h9a.5.5 0 0 1 0 1h-9a.5.5 0 0 1-.5-.5zm0-4a.5.5 0 0 1 .5-.5h9a.5.5 0 0 1 0 1h-9a.5.5 0 0 1-.5-.5zm0-4a.5.5 0 0 1 .5-.5h9a.5.5 0 0 1 0 1h-9a.5.5 0 0 1-.5-.5zm-3 1a1 1 0 1 0 0-2 1 1 0 0 0 0 2zm0 4a1 1 0 1 0 0-2 1 1 0 0 0 0 2zm0 4a1 1 0 1 0 0-2 1 1 0 0 0 0 2z"/>
          </svg>
        </span>
        <span v-else-if="item.id === 'ordered'">
          <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
            <path fill-rule="evenodd" d="M5 11.5a.5.5 0 0 1 .5-.5h9a.5.5 0 0 1 0 1h-9a.5.5 0 0 1-.5-.5zm0-4a.5.5 0 0 1 .5-.5h9a.5.5 0 0 1 0 1h-9a.5.5 0 0 1-.5-.5zm0-4a.5.5 0 0 1 .5-.5h9a.5.5 0 0 1 0 1h-9a.5.5 0 0 1-.5-.5z"/>
            <path d="M1.713 11.865v-.474H2c.217 0 .363-.137.363-.317 0-.185-.158-.31-.361-.31-.223 0-.367.152-.373.31h-.59c.016-.467.373-.787.986-.787.588-.002.954.291.957.703a.595.595 0 0 1-.492.594v.033a.615.615 0 0 1 .569.631c.003.533-.502.8-1.051.8-.656 0-1-.37-1.008-.794h.582c.008.178.186.306.422.309.254 0 .424-.145.422-.35-.002-.195-.155-.348-.414-.348h-.3zm-.004-4.699h-.604v-.035c0-.408.295-.844.958-.844.583 0 .96.326.96.756 0 .389-.257.617-.476.848l-.537.572v.03h1.054V9H1.143v-.395l.957-.99c.138-.142.293-.304.293-.508 0-.18-.147-.32-.342-.32a.33.33 0 0 0-.342.338v.041zM2.564 5h-.635V2.924h-.031l-.598.42v-.567l.629-.443h.635V5z"/>
          </svg>
        </span>
        <span v-else-if="item.id === 'tasklist'">
          <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
            <path d="M14 1a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H2a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1h12zM2 0a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2H2z"/>
            <path d="M10.97 4.97a.75.75 0 0 1 1.071 1.05l-3.992 4.99a.75.75 0 0 1-1.08.02L4.324 8.384a.75.75 0 1 1 1.06-1.06l2.094 2.093 3.473-4.425a.235.235 0 0 1 .02-.022z"/>
          </svg>
        </span>
        <span v-else-if="item.id === 'quote'">
          <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
            <path d="M12 12a1 1 0 0 0 1-1V8.558a1 1 0 0 0-1-1h-1.388c0-.351.021-.703.062-1.054.062-.372.166-.703.31-.992.145-.29.331-.517.559-.683.227-.186.516-.279.868-.279V3c-.579 0-1.085.124-1.52.372a3.322 3.322 0 0 0-1.085.992 4.92 4.92 0 0 0-.62 1.458A7.712 7.712 0 0 0 9 7.558V11a1 1 0 0 0 1 1h2Zm-6 0a1 1 0 0 0 1-1V8.558a1 1 0 0 0-1-1H4.612c0-.351.021-.703.062-1.054.062-.372.166-.703.31-.992.145-.29.331-.517.559-.683.227-.186.516-.279.868-.279V3c-.579 0-1.085.124-1.52.372a3.322 3.322 0 0 0-1.085.992 4.92 4.92 0 0 0-.62 1.458A7.712 7.712 0 0 0 3 7.558V11a1 1 0 0 0 1 1h2Z"/>
          </svg>
        </span>
        <span v-else-if="item.id === 'codeblock'">
          <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
            <path d="M14 1a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H2a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1h12zM2 0a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2H2z"/>
            <path d="M6.854 4.646a.5.5 0 0 1 0 .708L4.207 8l2.647 2.646a.5.5 0 0 1-.708.708l-3-3a.5.5 0 0 1 0-.708l3-3a.5.5 0 0 1 .708 0zm2.292 0a.5.5 0 0 0 0 .708L11.793 8l-2.647 2.646a.5.5 0 0 0 .708.708l3-3a.5.5 0 0 0 0-.708l-3-3a.5.5 0 0 0-.708 0z"/>
          </svg>
        </span>
        <span v-else-if="item.id === 'hr'">
          <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
            <path fill-rule="evenodd" d="M0 8a.5.5 0 0 1 .5-.5h15a.5.5 0 0 1 0 1H.5A.5.5 0 0 1 0 8z"/>
          </svg>
        </span>
        <span v-else-if="item.id === 'link'">
          <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
            <path d="M4.715 6.542 3.343 7.914a3 3 0 1 0 4.243 4.243l1.828-1.829A3 3 0 0 0 8.586 5.5L8 6.086a1.002 1.002 0 0 0-.154.199 2 2 0 0 1 .861 3.337L6.88 11.45a2 2 0 1 1-2.83-2.83l.793-.792a4.018 4.018 0 0 1-.128-1.287z"/>
            <path d="M6.586 4.672A3 3 0 0 0 7.414 9.5l.775-.776a2 2 0 0 1-.896-3.346L9.12 3.55a2 2 0 1 1 2.83 2.83l-.793.792c.112.42.155.855.128 1.287l1.372-1.372a3 3 0 1 0-4.243-4.243L6.586 4.672z"/>
          </svg>
        </span>
        <span v-else-if="item.id === 'image'">
          <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
            <path d="M6.002 5.5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0z"/>
            <path d="M2.002 1a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V3a2 2 0 0 0-2-2h-12zm12 1a1 1 0 0 1 1 1v6.5l-3.777-1.947a.5.5 0 0 0-.577.093l-3.71 3.71-2.66-1.772a.5.5 0 0 0-.63.062L1.002 12V3a1 1 0 0 1 1-1h12z"/>
          </svg>
        </span>
      </button>
      <div v-if="groupIndex < toolbarGroups.length - 1" class="toolbar-divider"></div>
    </div>
  </div>
</template>

<style scoped>
.editor-toolbar {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 6px 12px;
  background-color: var(--color-bg-secondary);
  border-bottom: 1px solid var(--color-border);
  flex-shrink: 0;
}

.editor-toolbar.disabled {
  opacity: 0.5;
  pointer-events: none;
}

.toolbar-group {
  display: flex;
  align-items: center;
  gap: 2px;
}

.toolbar-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border: none;
  background: transparent;
  color: var(--color-text-secondary);
  cursor: pointer;
  border-radius: 4px;
  font-size: 13px;
  transition: all 0.15s ease;
}

.toolbar-btn:hover:not(:disabled) {
  background-color: var(--color-border);
  color: var(--color-text-primary);
}

.toolbar-btn:active:not(:disabled) {
  transform: scale(0.95);
}

.toolbar-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.toolbar-btn .icon-bold {
  font-weight: 700;
}

.toolbar-btn .icon-italic {
  font-style: italic;
  font-family: serif;
}

.toolbar-btn .icon-strike {
  text-decoration: line-through;
}

.toolbar-btn.h1,
.toolbar-btn.h2,
.toolbar-btn.h3 {
  font-weight: 600;
  font-size: 11px;
}

.toolbar-divider {
  width: 1px;
  height: 20px;
  background-color: var(--color-border);
  margin: 0 6px;
}
</style>
