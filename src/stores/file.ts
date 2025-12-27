import { defineStore } from "pinia";
import { ref, computed } from "vue";

export interface RecentFile {
  path: string;
  name: string;
  lastOpened: number;
}

export const useFileStore = defineStore("file", () => {
  // State
  const currentFilePath = ref<string | null>(null);
  const recentFiles = ref<RecentFile[]>([]);
  const isNewFile = ref(true);
  const isDirty = ref(false);

  // Getters
  const currentFileName = computed(() => {
    if (!currentFilePath.value) return null;
    const parts = currentFilePath.value.split(/[/\\]/);
    return parts[parts.length - 1];
  });

  // Actions
  function setCurrentFile(path: string | null) {
    currentFilePath.value = path;
    isNewFile.value = path === null;

    if (path) {
      addToRecentFiles(path);
    }
  }

  function addToRecentFiles(path: string) {
    const name = path.split(/[/\\]/).pop() || path;
    const existingIndex = recentFiles.value.findIndex((f) => f.path === path);

    if (existingIndex !== -1) {
      recentFiles.value.splice(existingIndex, 1);
    }

    recentFiles.value.unshift({
      path,
      name,
      lastOpened: Date.now(),
    });

    // Keep only last 10 files
    if (recentFiles.value.length > 10) {
      recentFiles.value = recentFiles.value.slice(0, 10);
    }
  }

  function removeRecentFile(path: string) {
    const index = recentFiles.value.findIndex((f) => f.path === path);
    if (index !== -1) {
      recentFiles.value.splice(index, 1);
    }
  }

  function clearRecentFiles() {
    recentFiles.value = [];
  }

  function setDirty(dirty: boolean) {
    isDirty.value = dirty;
  }

  function reset() {
    currentFilePath.value = null;
    isNewFile.value = true;
    isDirty.value = false;
  }

  return {
    // State
    currentFilePath,
    recentFiles,
    isNewFile,
    isDirty,
    // Getters
    currentFileName,
    // Actions
    setCurrentFile,
    addToRecentFiles,
    removeRecentFile,
    clearRecentFiles,
    setDirty,
    reset,
  };
});
