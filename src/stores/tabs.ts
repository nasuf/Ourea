import { defineStore } from "pinia";
import { ref, computed } from "vue";

export interface Tab {
  id: string;
  filePath: string | null;
  fileName: string;
  content: string;
  originalContent: string; // Content when file was opened/saved
  isDirty: boolean;
  isNew: boolean;
}

export const useTabsStore = defineStore("tabs", () => {
  // State
  const tabs = ref<Tab[]>([]);
  const activeTabId = ref<string | null>(null);

  // Getters
  const activeTab = computed(() => {
    return tabs.value.find((tab) => tab.id === activeTabId.value) || null;
  });

  const tabCount = computed(() => tabs.value.length);

  // Actions
  function generateTabId(): string {
    return `tab-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  function createTab(options: Partial<Tab> = {}): Tab {
    const id = generateTabId();
    const content = options.content || "";
    const newTab: Tab = {
      id,
      filePath: options.filePath || null,
      fileName: options.fileName || "Untitled",
      content: content,
      originalContent: content, // Store original content
      isDirty: options.isDirty || false,
      isNew: options.isNew !== undefined ? options.isNew : true,
    };

    tabs.value.push(newTab);
    activeTabId.value = id;

    return newTab;
  }

  function closeTab(tabId: string) {
    const index = tabs.value.findIndex((tab) => tab.id === tabId);
    if (index === -1) return;

    tabs.value.splice(index, 1);

    // If closed tab was active, activate another tab
    if (activeTabId.value === tabId) {
      if (tabs.value.length > 0) {
        // Activate the tab at the same index, or the previous one
        const newIndex = Math.min(index, tabs.value.length - 1);
        activeTabId.value = tabs.value[newIndex].id;
      } else {
        activeTabId.value = null;
      }
    }
  }

  function setActiveTab(tabId: string) {
    const tab = tabs.value.find((t) => t.id === tabId);
    if (tab) {
      activeTabId.value = tabId;
    }
  }

  function updateTabContent(tabId: string, content: string) {
    const tab = tabs.value.find((t) => t.id === tabId);
    if (tab) {
      tab.content = content;
      // Only mark dirty if content differs from original
      tab.isDirty = content !== tab.originalContent;
    }
  }

  function updateActiveTabContent(content: string) {
    if (activeTabId.value) {
      updateTabContent(activeTabId.value, content);
    }
  }

  function markTabAsSaved(tabId: string, filePath?: string, fileName?: string) {
    const tab = tabs.value.find((t) => t.id === tabId);
    if (tab) {
      tab.isDirty = false;
      tab.isNew = false;
      tab.originalContent = tab.content; // Update original content on save
      if (filePath) tab.filePath = filePath;
      if (fileName) tab.fileName = fileName;
    }
  }

  function markActiveTabAsSaved(filePath?: string, fileName?: string) {
    if (activeTabId.value) {
      markTabAsSaved(activeTabId.value, filePath, fileName);
    }
  }

  function setTabContent(tabId: string, content: string, markDirty: boolean = false) {
    const tab = tabs.value.find((t) => t.id === tabId);
    if (tab) {
      tab.content = content;
      tab.isDirty = markDirty;
    }
  }

  function resetTabDirty(tabId: string) {
    const tab = tabs.value.find((t) => t.id === tabId);
    if (tab) {
      tab.isDirty = false;
    }
  }

  function findTabByPath(filePath: string): Tab | undefined {
    return tabs.value.find((tab) => tab.filePath === filePath);
  }

  function reset() {
    tabs.value = [];
    activeTabId.value = null;
  }

  return {
    // State
    tabs,
    activeTabId,
    // Getters
    activeTab,
    tabCount,
    // Actions
    createTab,
    closeTab,
    setActiveTab,
    updateTabContent,
    updateActiveTabContent,
    markTabAsSaved,
    markActiveTabAsSaved,
    setTabContent,
    resetTabDirty,
    findTabByPath,
    reset,
  };
});
