import { ref } from "vue";
import { open, save, message } from "@tauri-apps/plugin-dialog";
import { readTextFile, writeTextFile } from "@tauri-apps/plugin-fs";
import { useTabsStore } from "@/stores/tabs";
import { useFileStore } from "@/stores/file";
import { useCloseConfirm } from "./useCloseConfirm";

export function useFile() {
  const tabsStore = useTabsStore();
  const fileStore = useFileStore();
  const { showConfirm } = useCloseConfirm();
  const isLoading = ref(false);

  // Extract filename from path
  function getFileName(filePath: string): string {
    return filePath.split("/").pop() || filePath.split("\\").pop() || filePath;
  }

  // Create a new file tab
  function newFile() {
    tabsStore.createTab({
      fileName: "Untitled",
      content: "",
      isNew: true,
      isDirty: true, // New files are dirty by default (need to be saved)
    });
  }

  // Open a file (always creates new tab)
  async function openFile(filePath?: string) {
    try {
      let path = filePath;

      if (!path) {
        const selected = await open({
          multiple: false,
          directory: false,
          filters: [
            {
              name: "Markdown",
              extensions: ["md", "markdown", "txt"],
            },
          ],
        });

        if (!selected) return;
        path = selected as string;
      }

      // Check if file is already open in a tab
      const existingTab = tabsStore.findTabByPath(path);
      if (existingTab) {
        tabsStore.setActiveTab(existingTab.id);
        return;
      }

      isLoading.value = true;

      const content = await readTextFile(path);
      const fileName = getFileName(path);

      // Create new tab with file content
      tabsStore.createTab({
        filePath: path,
        fileName,
        content,
        isNew: false,
        isDirty: false,
      });

      // Add to recent files
      fileStore.addToRecentFiles(path);

      isLoading.value = false;
    } catch (error) {
      isLoading.value = false;
      console.error("Failed to open file:", error);
      await message(`Failed to open file: ${error}`, {
        title: "Error",
        kind: "error",
      });
    }
  }

  // Save current tab
  async function saveFile(): Promise<boolean> {
    const activeTab = tabsStore.activeTab;
    if (!activeTab) return false;

    try {
      if (activeTab.isNew || !activeTab.filePath) {
        return await saveFileAs();
      }

      isLoading.value = true;

      await writeTextFile(activeTab.filePath, activeTab.content);
      tabsStore.markActiveTabAsSaved();

      isLoading.value = false;
      return true;
    } catch (error) {
      isLoading.value = false;
      console.error("Failed to save file:", error);
      await message(`Failed to save file: ${error}`, {
        title: "Error",
        kind: "error",
      });
      return false;
    }
  }

  // Save file as
  async function saveFileAs(): Promise<boolean> {
    const activeTab = tabsStore.activeTab;
    if (!activeTab) return false;

    try {
      const path = await save({
        defaultPath: activeTab.fileName || "untitled.md",
        filters: [
          {
            name: "Markdown",
            extensions: ["md"],
          },
        ],
      });

      if (!path) return false;

      isLoading.value = true;

      await writeTextFile(path, activeTab.content);

      const fileName = getFileName(path);
      tabsStore.markActiveTabAsSaved(path, fileName);
      fileStore.addToRecentFiles(path);

      isLoading.value = false;
      return true;
    } catch (error) {
      isLoading.value = false;
      console.error("Failed to save file:", error);
      await message(`Failed to save file: ${error}`, {
        title: "Error",
        kind: "error",
      });
      return false;
    }
  }

  // Close a specific tab - returns true if closed, false if cancelled
  async function closeTab(tabId: string, skipConfirm: boolean = false): Promise<boolean> {
    const tab = tabsStore.tabs.find((t) => t.id === tabId);
    if (!tab) return true;

    if (tab.isDirty && !skipConfirm) {
      // Show custom dialog with Save, Don't Save, Cancel options
      const result = await showConfirm(tab.fileName);

      if (result === "cancel") {
        return false; // User cancelled - don't close
      }

      if (result === "save") {
        // User chose Save
        const currentActiveId = tabsStore.activeTabId;
        tabsStore.setActiveTab(tabId);
        const saved = await saveFile();
        if (currentActiveId && currentActiveId !== tabId) {
          tabsStore.setActiveTab(currentActiveId);
        }
        if (!saved) return false;
      }
      // If result is "dont-save", proceed to close without saving
    }

    tabsStore.closeTab(tabId);
    return true;
  }

  // Close current active tab
  async function closeActiveTab(): Promise<boolean> {
    if (!tabsStore.activeTabId) return true;
    return await closeTab(tabsStore.activeTabId);
  }

  return {
    isLoading,
    newFile,
    openFile,
    saveFile,
    saveFileAs,
    closeTab,
    closeActiveTab,
  };
}
