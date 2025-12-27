<script setup lang="ts">
import { computed, inject, type Ref } from "vue";
import { useTabsStore } from "@/stores/tabs";
import { useTheme } from "@/composables/useTheme";
import { useFile } from "@/composables/useFile";

const emit = defineEmits<{
  (e: "toggle-sidebar"): void;
}>();

const tabsStore = useTabsStore();
const { isDark, cycleTheme } = useTheme();
const { closeTab, newFile } = useFile();

// Inject outline controls from MainLayout
const outlineVisible = inject<Ref<boolean>>("outlineVisible");
const toggleOutline = inject<() => void>("toggleOutline");

const tabs = computed(() => tabsStore.tabs);
const activeTabId = computed(() => tabsStore.activeTabId);

function handleTabClick(tabId: string) {
  tabsStore.setActiveTab(tabId);
}

async function handleTabClose(event: MouseEvent, tabId: string) {
  event.stopPropagation();
  await closeTab(tabId);
}

function handleNewTab() {
  newFile();
}
</script>

<template>
  <div class="title-bar" data-tauri-drag-region>
    <!-- Left: Toggle button -->
    <div class="title-bar-left">
      <button
        class="icon-btn"
        @click="emit('toggle-sidebar')"
        title="Toggle Sidebar (Cmd+\)"
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
          <path d="M2 3h12v1.5H2V3zm0 4.25h12v1.5H2v-1.5zm0 4.25h12V13H2v-1.5z"/>
        </svg>
      </button>
    </div>

    <!-- Center: Tabs (left-aligned) -->
    <div class="title-bar-center" data-tauri-drag-region>
      <div class="tabs-container">
        <div
          v-for="tab in tabs"
          :key="tab.id"
          class="tab"
          :class="{ active: tab.id === activeTabId }"
          @click="handleTabClick(tab.id)"
        >
          <span v-if="tab.isDirty" class="dirty-dot"></span>
          <span class="tab-name">{{ tab.fileName }}</span>
          <button
            class="tab-close"
            @click="(e) => handleTabClose(e, tab.id)"
            title="Close"
          >
            <svg width="10" height="10" viewBox="0 0 16 16" fill="currentColor">
              <path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708z"/>
            </svg>
          </button>
        </div>

        <!-- New tab button -->
        <button class="new-tab-btn" @click="handleNewTab" title="New Tab">
          <svg width="12" height="12" viewBox="0 0 16 16" fill="currentColor">
            <path d="M8 2a.5.5 0 0 1 .5.5v5h5a.5.5 0 0 1 0 1h-5v5a.5.5 0 0 1-1 0v-5h-5a.5.5 0 0 1 0-1h5v-5A.5.5 0 0 1 8 2z"/>
          </svg>
        </button>
      </div>
    </div>

    <!-- Right: Theme toggle + Outline toggle -->
    <div class="title-bar-right">
      <button
        class="icon-btn"
        @click="cycleTheme"
        :title="isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'"
      >
        <!-- Moon icon (shown in light mode - click to go dark) -->
        <svg v-if="!isDark" width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
          <path d="M6 .278a.768.768 0 0 1 .08.858 7.208 7.208 0 0 0-.878 3.46c0 4.021 3.278 7.277 7.318 7.277.527 0 1.04-.055 1.533-.16a.787.787 0 0 1 .81.316.733.733 0 0 1-.031.893A8.349 8.349 0 0 1 8.344 16C3.734 16 0 12.286 0 7.71 0 4.266 2.114 1.312 5.124.06A.752.752 0 0 1 6 .278z"/>
        </svg>
        <!-- Sun icon (shown in dark mode - click to go light) -->
        <svg v-else width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
          <path d="M8 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM8 0a.5.5 0 0 1 .5.5v2a.5.5 0 0 1-1 0v-2A.5.5 0 0 1 8 0zm0 13a.5.5 0 0 1 .5.5v2a.5.5 0 0 1-1 0v-2A.5.5 0 0 1 8 13zm8-5a.5.5 0 0 1-.5.5h-2a.5.5 0 0 1 0-1h2a.5.5 0 0 1 .5.5zM3 8a.5.5 0 0 1-.5.5h-2a.5.5 0 0 1 0-1h2A.5.5 0 0 1 3 8zm10.657-5.657a.5.5 0 0 1 0 .707l-1.414 1.415a.5.5 0 1 1-.707-.708l1.414-1.414a.5.5 0 0 1 .707 0zm-9.193 9.193a.5.5 0 0 1 0 .707L3.05 13.657a.5.5 0 0 1-.707-.707l1.414-1.414a.5.5 0 0 1 .707 0zm9.193 2.121a.5.5 0 0 1-.707 0l-1.414-1.414a.5.5 0 0 1 .707-.707l1.414 1.414a.5.5 0 0 1 0 .707zM4.464 4.465a.5.5 0 0 1-.707 0L2.343 3.05a.5.5 0 1 1 .707-.707l1.414 1.414a.5.5 0 0 1 0 .708z"/>
        </svg>
      </button>

      <!-- Outline toggle button -->
      <button
        class="icon-btn"
        @click="toggleOutline"
        :title="outlineVisible ? 'Hide Outline' : 'Show Outline'"
      >
        <!-- Outline/list icon -->
        <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" :style="{ opacity: outlineVisible ? 1 : 0.5 }">
          <path d="M2 4a1 1 0 1 0 0-2 1 1 0 0 0 0 2zm3.5-1.5a.5.5 0 0 0 0 1h9a.5.5 0 0 0 0-1h-9zm0 5a.5.5 0 0 0 0 1h9a.5.5 0 0 0 0-1h-9zm0 5a.5.5 0 0 0 0 1h9a.5.5 0 0 0 0-1h-9zM2 9a1 1 0 1 0 0-2 1 1 0 0 0 0 2zm0 5a1 1 0 1 0 0-2 1 1 0 0 0 0 2z"/>
        </svg>
      </button>
    </div>
  </div>
</template>

<style scoped>
.title-bar {
  display: flex;
  align-items: center;
  height: 40px;
  padding: 0 12px;
  background-color: var(--color-bg-secondary);
  border-bottom: 1px solid var(--color-border);
  -webkit-app-region: drag;
  user-select: none;
}

.title-bar-left {
  width: 40px;
  display: flex;
  align-items: center;
  -webkit-app-region: no-drag;
  flex-shrink: 0;
}

.title-bar-right {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 4px;
  -webkit-app-region: no-drag;
  flex-shrink: 0;
}

.title-bar-center {
  flex: 1;
  display: flex;
  align-items: center;
  overflow: hidden;
  -webkit-app-region: no-drag;
}

.tabs-container {
  display: flex;
  align-items: center;
  gap: 2px;
  overflow-x: auto;
  padding: 4px 0;
}

.tabs-container::-webkit-scrollbar {
  height: 3px;
}

.tabs-container::-webkit-scrollbar-thumb {
  background-color: var(--color-border);
  border-radius: 3px;
}

.icon-btn {
  padding: 6px;
  border: none;
  background: transparent;
  color: var(--color-text-secondary);
  cursor: pointer;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.15s ease;
}

.icon-btn:hover {
  background-color: var(--color-border);
  color: var(--color-text-primary);
}

.icon-btn:active {
  transform: scale(0.95);
}

/* Tab styles */
.tab {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 5px 8px;
  background-color: transparent;
  border-radius: 6px;
  font-size: 13px;
  color: var(--color-text-secondary);
  cursor: pointer;
  transition: all 0.15s ease;
  white-space: nowrap;
  max-width: 180px;
  flex-shrink: 0;
}

.tab:hover {
  background-color: var(--color-bg-tertiary, rgba(128, 128, 128, 0.1));
  color: var(--color-text-primary);
}

.tab.active {
  background-color: var(--color-bg-primary);
  color: var(--color-text-primary);
}

.dirty-dot {
  width: 8px;
  height: 8px;
  background-color: var(--color-accent);
  border-radius: 50%;
  flex-shrink: 0;
}

.tab-name {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.tab-close {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 16px;
  height: 16px;
  padding: 0;
  border: none;
  background: transparent;
  color: var(--color-text-secondary);
  border-radius: 4px;
  cursor: pointer;
  opacity: 0;
  transition: all 0.15s ease;
  flex-shrink: 0;
}

.tab:hover .tab-close {
  opacity: 1;
}

.tab-close:hover {
  background-color: var(--color-border);
  color: var(--color-text-primary);
}

.new-tab-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  padding: 0;
  border: none;
  background: transparent;
  color: var(--color-text-secondary);
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.15s ease;
  flex-shrink: 0;
  margin-left: 4px;
}

.new-tab-btn:hover {
  background-color: var(--color-border);
  color: var(--color-text-primary);
}
</style>
