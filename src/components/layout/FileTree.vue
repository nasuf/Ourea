<script setup lang="ts">
import { computed, ref } from "vue";
import { invoke } from "@tauri-apps/api/core";
import { useWorkspaceStore, FileTreeNode } from "@/stores/workspace";
import { useFile } from "@/composables/useFile";
import ContextMenu, { MenuItem } from "@/components/common/ContextMenu.vue";
import InputDialog from "@/components/dialogs/InputDialog.vue";

const workspaceStore = useWorkspaceStore();
const { openFile } = useFile();

const props = defineProps<{
  node: FileTreeNode;
  depth?: number;
}>();

const depth = computed(() => props.depth ?? 0);
const isExpanded = computed(() => workspaceStore.isExpanded(props.node.path));
const isSelected = computed(() => workspaceStore.selectedPath === props.node.path);
const hasChildren = computed(() =>
  props.node.isDir && props.node.children && props.node.children.length > 0
);

// Context menu state
const contextMenuVisible = ref(false);
const contextMenuX = ref(0);
const contextMenuY = ref(0);

// Input dialog state
type DialogType = "new-file" | "new-folder" | "rename" | null;
const dialogType = ref<DialogType>(null);
const dialogTitle = ref("");
const dialogDefaultValue = ref("");
const dialogPlaceholder = ref("");

const contextMenuItems = computed<MenuItem[]>(() => {
  const items: MenuItem[] = [];

  if (props.node.isDir) {
    items.push(
      { id: "new-file", label: "New File" },
      { id: "new-folder", label: "New Folder" },
      { id: "separator-1", label: "", separator: true }
    );
  }

  items.push(
    { id: "rename", label: "Rename" },
    { id: "delete", label: "Delete" },
    { id: "separator-2", label: "", separator: true },
    { id: "reveal", label: "Reveal in Finder" }
  );

  return items;
});

function handleClick() {
  if (props.node.isDir) {
    workspaceStore.toggleExpanded(props.node.path);
  } else {
    workspaceStore.setSelectedPath(props.node.path);
    openFile(props.node.path);
  }
}

function handleDoubleClick() {
  if (!props.node.isDir) {
    openFile(props.node.path);
  }
}

function handleContextMenu(event: MouseEvent) {
  event.preventDefault();
  event.stopPropagation();
  workspaceStore.setSelectedPath(props.node.path);
  contextMenuX.value = event.clientX;
  contextMenuY.value = event.clientY;
  contextMenuVisible.value = true;
}

async function handleContextMenuSelect(id: string) {
  contextMenuVisible.value = false;

  switch (id) {
    case "new-file":
      showNewFileDialog();
      break;
    case "new-folder":
      showNewFolderDialog();
      break;
    case "rename":
      showRenameDialog();
      break;
    case "delete":
      await deleteItem();
      break;
    case "reveal":
      await revealInFinder();
      break;
  }
}

function showNewFileDialog() {
  dialogType.value = "new-file";
  dialogTitle.value = "New File";
  dialogDefaultValue.value = "untitled.md";
  dialogPlaceholder.value = "Enter file name";
}

function showNewFolderDialog() {
  dialogType.value = "new-folder";
  dialogTitle.value = "New Folder";
  dialogDefaultValue.value = "";
  dialogPlaceholder.value = "Enter folder name";
}

function showRenameDialog() {
  dialogType.value = "rename";
  dialogTitle.value = "Rename";
  dialogDefaultValue.value = props.node.name;
  dialogPlaceholder.value = "Enter new name";
}

function closeDialog() {
  dialogType.value = null;
}

async function handleDialogConfirm(value: string) {
  const type = dialogType.value;
  closeDialog();

  switch (type) {
    case "new-file":
      await createNewFile(value);
      break;
    case "new-folder":
      await createNewFolder(value);
      break;
    case "rename":
      await renameItem(value);
      break;
  }
}

async function createNewFile(name: string) {
  const newPath = `${props.node.path}/${name}`;
  try {
    await invoke("create_file", { path: newPath });
    await workspaceStore.refreshDirectory(props.node.path);
  } catch (error) {
    console.error("Failed to create file:", error);
  }
}

async function createNewFolder(name: string) {
  const newPath = `${props.node.path}/${name}`;
  try {
    await invoke("create_directory", { path: newPath });
    await workspaceStore.refreshDirectory(props.node.path);
  } catch (error) {
    console.error("Failed to create folder:", error);
  }
}

async function renameItem(newName: string) {
  if (newName === props.node.name) return;

  const parentPath = props.node.path.substring(0, props.node.path.lastIndexOf("/"));
  const newPath = `${parentPath}/${newName}`;

  try {
    await invoke("rename_path", { old_path: props.node.path, new_path: newPath });
    await workspaceStore.refreshDirectory(parentPath);
  } catch (error) {
    console.error("Failed to rename:", error);
  }
}

async function deleteItem() {
  const confirmed = confirm(`Are you sure you want to delete "${props.node.name}"?`);
  if (!confirmed) return;

  const parentPath = props.node.path.substring(0, props.node.path.lastIndexOf("/"));

  try {
    await invoke("delete_path", { path: props.node.path });
    await workspaceStore.refreshDirectory(parentPath);
  } catch (error) {
    console.error("Failed to delete:", error);
    alert(`Failed to delete: ${error}`);
  }
}

async function revealInFinder() {
  try {
    await invoke("reveal_in_finder", { path: props.node.path });
  } catch (error) {
    console.error("Failed to reveal in Finder:", error);
  }
}
</script>

<template>
  <div class="file-tree-node">
    <div
      class="node-item"
      :class="{ selected: isSelected, 'is-dir': node.isDir }"
      :style="{ paddingLeft: `${depth * 16 + 8}px` }"
      @click="handleClick"
      @dblclick="handleDoubleClick"
      @contextmenu="handleContextMenu"
    >
      <!-- Expand/Collapse icon for directories -->
      <span v-if="node.isDir" class="expand-icon" :class="{ expanded: isExpanded }">
        <svg width="12" height="12" viewBox="0 0 16 16" fill="currentColor">
          <path d="M4.646 1.646a.5.5 0 0 1 .708 0l6 6a.5.5 0 0 1 0 .708l-6 6a.5.5 0 0 1-.708-.708L10.293 8 4.646 2.354a.5.5 0 0 1 0-.708z"/>
        </svg>
      </span>
      <span v-else class="expand-icon placeholder"></span>

      <!-- File/Folder icon -->
      <span class="node-icon">
        <svg v-if="node.isDir" width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
          <path d="M.5 3l.04.87a1.99 1.99 0 0 0-.342 1.311l.637 7A2 2 0 0 0 2.826 14H13.174a2 2 0 0 0 1.991-1.819l.637-7A2 2 0 0 0 13.81 3H9.828a2 2 0 0 1-1.414-.586l-.828-.828A2 2 0 0 0 6.172 1H2.5a2 2 0 0 0-2 2zm.694 0a1 1 0 0 1 1-.98h3.672a1 1 0 0 1 .707.293L7.586 3H13.81a1 1 0 0 1 .996 1.09l-.637 7a1 1 0 0 1-.996.91H2.826a1 1 0 0 1-.995-.91l-.637-7A1 1 0 0 1 1.194 3z"/>
        </svg>
        <svg v-else width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
          <path d="M4 0a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V4.707A1 1 0 0 0 13.707 4L10 .293A1 1 0 0 0 9.293 0H4zm5.5 1.5v2a1 1 0 0 0 1 1h2l-3-3zM4.5 8a.5.5 0 0 1 0-1h7a.5.5 0 0 1 0 1h-7zM4 10.5a.5.5 0 0 1 .5-.5h7a.5.5 0 0 1 0 1h-7a.5.5 0 0 1-.5-.5zm0 2a.5.5 0 0 1 .5-.5h4a.5.5 0 0 1 0 1h-4a.5.5 0 0 1-.5-.5z"/>
        </svg>
      </span>

      <!-- Node name -->
      <span class="node-name">{{ node.name }}</span>
    </div>

    <!-- Children (if directory is expanded) -->
    <div v-if="node.isDir && isExpanded && node.children" class="node-children">
      <FileTree
        v-for="child in node.children"
        :key="child.path"
        :node="child"
        :depth="depth + 1"
      />
    </div>

    <!-- Context Menu -->
    <ContextMenu
      :items="contextMenuItems"
      :x="contextMenuX"
      :y="contextMenuY"
      :visible="contextMenuVisible"
      @select="handleContextMenuSelect"
      @close="contextMenuVisible = false"
    />

    <!-- Input Dialog -->
    <InputDialog
      v-if="dialogType"
      :title="dialogTitle"
      :default-value="dialogDefaultValue"
      :placeholder="dialogPlaceholder"
      confirm-text="OK"
      @confirm="handleDialogConfirm"
      @cancel="closeDialog"
    />
  </div>
</template>

<style scoped>
.file-tree-node {
  user-select: none;
}

.node-item {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 4px 8px;
  border-radius: 4px;
  cursor: pointer;
  color: var(--color-text-secondary);
  font-size: 13px;
  transition: all 0.1s ease;
}

.node-item:hover {
  background-color: var(--color-border);
  color: var(--color-text-primary);
}

.node-item.selected {
  background-color: var(--color-accent);
  color: white;
}

.expand-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 16px;
  height: 16px;
  flex-shrink: 0;
  transition: transform 0.15s ease;
}

.expand-icon.expanded {
  transform: rotate(90deg);
}

.expand-icon.placeholder {
  visibility: hidden;
}

.node-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 16px;
  height: 16px;
  flex-shrink: 0;
  opacity: 0.7;
}

.node-item:hover .node-icon,
.node-item.selected .node-icon {
  opacity: 1;
}

.node-name {
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.node-children {
  /* No additional styling needed, children handle their own padding */
}
</style>
