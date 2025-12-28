<script setup lang="ts">
import { ref } from "vue";
import { useFile } from "@/composables/useFile";
import { useFileStore } from "@/stores/file";
import { useWorkspaceStore } from "@/stores/workspace";
import FileTree from "./FileTree.vue";

defineProps<{
  width: number;
}>();

const { newFile, openFile } = useFile();
const fileStore = useFileStore();
const workspaceStore = useWorkspaceStore();

// Clear confirmation popover
const showClearConfirm = ref(false);

function handleClearClick() {
  showClearConfirm.value = true;
}

function confirmClear() {
  fileStore.clearRecentFiles();
  showClearConfirm.value = false;
}

function cancelClear() {
  showClearConfirm.value = false;
}

function removeFile(path: string) {
  fileStore.removeRecentFile(path);
}
</script>

<template>
  <aside class="sidebar" :style="{ width: `${width}px` }">
    <div class="sidebar-header">
      <span class="sidebar-title">Files</span>
    </div>

    <div class="sidebar-content">
      <div class="sidebar-actions">
        <button class="action-btn" @click="newFile" title="New File (Cmd+N)">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
            <path d="M8 2a.5.5 0 0 1 .5.5v5h5a.5.5 0 0 1 0 1h-5v5a.5.5 0 0 1-1 0v-5h-5a.5.5 0 0 1 0-1h5v-5A.5.5 0 0 1 8 2z"/>
          </svg>
          <span>New File</span>
        </button>

        <button class="action-btn" @click="() => openFile()" title="Open File (Cmd+O)">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
            <path d="M.5 3l.04.87a1.99 1.99 0 0 0-.342 1.311l.637 7A2 2 0 0 0 2.826 14H9v-1H2.826a1 1 0 0 1-.995-.91l-.637-7A1 1 0 0 1 2.19 4h11.62a1 1 0 0 1 .996 1.09L14.54 8h1.005l.256-2.819A2 2 0 0 0 13.81 3H9.828a2 2 0 0 1-1.414-.586l-.828-.828A2 2 0 0 0 6.172 1H2.5a2 2 0 0 0-2 2zm5.672-1a1 1 0 0 1 .707.293L7.586 3H2.19c-.24 0-.47.042-.683.12L1.5 2.98a1 1 0 0 1 1-.98h3.672z"/>
          </svg>
          <span>Open File</span>
        </button>

        <button class="action-btn" @click="workspaceStore.openFolder" title="Open Folder">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
            <path d="M9.828 3h3.982a2 2 0 0 1 1.992 2.181l-.637 7A2 2 0 0 1 13.174 14H2.826a2 2 0 0 1-1.991-1.819l-.637-7a1.99 1.99 0 0 1 .342-1.31L.5 3a2 2 0 0 1 2-2h3.672a2 2 0 0 1 1.414.586l.828.828A2 2 0 0 0 9.828 3zm-8.322.12C1.72 3.042 1.95 3 2.19 3h5.396l-.707-.707A1 1 0 0 0 6.172 2H2.5a1 1 0 0 0-1 .981l.006.139z"/>
          </svg>
          <span>Open Folder</span>
        </button>
      </div>

      <!-- File Tree (when workspace is open) -->
      <div v-if="workspaceStore.hasWorkspace && workspaceStore.fileTree" class="file-tree-section">
        <div class="section-header">
          <span class="section-title">{{ workspaceStore.rootName }}</span>
          <button
            class="close-workspace-btn"
            @click="workspaceStore.closeWorkspace"
            title="Close Folder"
          >
            <svg width="12" height="12" viewBox="0 0 16 16" fill="currentColor">
              <path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708z"/>
            </svg>
          </button>
        </div>
        <div class="file-tree-container">
          <FileTree
            v-for="child in workspaceStore.fileTree.children"
            :key="child.path"
            :node="child"
            :depth="0"
          />
        </div>
      </div>

      <div v-if="fileStore.recentFiles.length > 0" class="recent-files">
        <div class="section-header">
          <span class="section-title">Recent Files</span>
          <div class="clear-wrapper">
            <button
              class="clear-btn"
              @click="handleClearClick"
              title="Clear All"
            >
              Clear
            </button>
            <!-- Confirmation popover -->
            <div v-if="showClearConfirm" class="clear-confirm-popover">
              <p>Clear all recent files?</p>
              <div class="popover-actions">
                <button class="popover-btn cancel" @click="cancelClear">Cancel</button>
                <button class="popover-btn confirm" @click="confirmClear">Clear</button>
              </div>
            </div>
          </div>
        </div>
        <div
          v-for="file in fileStore.recentFiles"
          :key="file.path"
          class="recent-file-item"
          @click="openFile(file.path)"
        >
          <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
            <path d="M4 0a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V4.707A1 1 0 0 0 13.707 4L10 .293A1 1 0 0 0 9.293 0H4zm5.5 1.5v2a1 1 0 0 0 1 1h2l-3-3z"/>
          </svg>
          <span class="file-name">{{ file.name }}</span>
          <button
            class="remove-btn"
            @click.stop="removeFile(file.path)"
            title="Remove from list"
          >
            <svg width="12" height="12" viewBox="0 0 16 16" fill="currentColor">
              <path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708z"/>
            </svg>
          </button>
        </div>
      </div>

      <div v-else class="empty-state">
        <p>No recent files</p>
      </div>
    </div>
  </aside>
</template>

<style scoped>
.sidebar {
  display: flex;
  flex-direction: column;
  background-color: var(--color-bg-secondary);
  border-right: 1px solid var(--color-border);
  min-width: 200px;
  max-width: 400px;
}

.sidebar-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  border-bottom: 1px solid var(--color-border);
}

.sidebar-title {
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: var(--color-text-secondary);
}

.sidebar-content {
  flex: 1;
  overflow-y: auto;
  padding: 12px;
}

.sidebar-actions {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 16px;
}

.action-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
  padding: 10px 12px;
  border: 1px solid var(--color-border);
  background: var(--color-bg-primary);
  color: var(--color-text-primary);
  border-radius: 6px;
  cursor: pointer;
  font-size: 13px;
  transition: all 0.15s ease;
}

.action-btn:hover {
  background-color: var(--color-border);
}

.action-btn:active {
  transform: scale(0.98);
}

.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;
}

.file-tree-section {
  margin-bottom: 16px;
}

.file-tree-container {
  max-height: 300px;
  overflow-y: auto;
}

.close-workspace-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  background: none;
  border: none;
  cursor: pointer;
  color: var(--color-text-secondary);
  border-radius: 4px;
  opacity: 0.6;
  transition: all 0.15s ease;
}

.close-workspace-btn:hover {
  opacity: 1;
  color: var(--color-danger);
  background-color: rgba(239, 68, 68, 0.1);
}

.section-title {
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: var(--color-text-secondary);
}

.clear-btn {
  font-size: 11px;
  color: var(--color-text-secondary);
  background: none;
  border: none;
  cursor: pointer;
  padding: 2px 6px;
  border-radius: 4px;
  transition: all 0.15s ease;
}

.clear-btn:hover {
  color: var(--color-danger);
  background-color: rgba(239, 68, 68, 0.1);
}

.clear-wrapper {
  position: relative;
}

.clear-confirm-popover {
  position: absolute;
  top: calc(100% + 8px);
  right: 0;
  background-color: var(--color-bg-primary);
  border: 1px solid var(--color-border);
  border-radius: 8px;
  padding: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  z-index: 100;
  min-width: 180px;
}

.clear-confirm-popover::before {
  content: "";
  position: absolute;
  top: -6px;
  right: 12px;
  width: 10px;
  height: 10px;
  background-color: var(--color-bg-primary);
  border-left: 1px solid var(--color-border);
  border-top: 1px solid var(--color-border);
  transform: rotate(45deg);
}

.clear-confirm-popover p {
  font-size: 13px;
  color: var(--color-text-primary);
  margin-bottom: 12px;
  white-space: nowrap;
}

.popover-actions {
  display: flex;
  gap: 8px;
  justify-content: flex-end;
}

.popover-btn {
  font-size: 12px;
  padding: 6px 12px;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.15s ease;
}

.popover-btn.cancel {
  background: none;
  border: 1px solid var(--color-border);
  color: var(--color-text-secondary);
}

.popover-btn.cancel:hover {
  background-color: var(--color-bg-secondary);
  color: var(--color-text-primary);
}

.popover-btn.confirm {
  background-color: var(--color-danger);
  border: none;
  color: white;
}

.popover-btn.confirm:hover {
  background-color: #dc2626;
}

.recent-files {
  margin-top: 8px;
}

.recent-file-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 10px;
  border-radius: 4px;
  cursor: pointer;
  color: var(--color-text-secondary);
  font-size: 13px;
  transition: all 0.15s ease;
}

.recent-file-item:hover {
  background-color: var(--color-border);
  color: var(--color-text-primary);
}

.recent-file-item .file-name {
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.remove-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  background: none;
  border: none;
  cursor: pointer;
  color: var(--color-text-secondary);
  border-radius: 4px;
  opacity: 0;
  transition: all 0.15s ease;
  flex-shrink: 0;
  position: relative;
  z-index: 10;
}

.recent-file-item:hover .remove-btn {
  opacity: 1;
}

.remove-btn:hover {
  color: var(--color-danger);
  background-color: rgba(239, 68, 68, 0.1);
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100px;
  text-align: center;
  color: var(--color-text-secondary);
}

.empty-state p {
  font-size: 13px;
}
</style>
