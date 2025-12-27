import { ref, watch, onMounted, onUnmounted } from "vue";
import { useSettingsStore } from "@/stores/settings";
import { useEditorStore } from "@/stores/editor";
import { useFileStore } from "@/stores/file";
import { useFile } from "./useFile";

export function useAutoSave() {
  const settingsStore = useSettingsStore();
  const editorStore = useEditorStore();
  const fileStore = useFileStore();
  const { saveFile } = useFile();

  const lastSaveTime = ref<number | null>(null);
  let autoSaveTimer: ReturnType<typeof setInterval> | null = null;

  // Auto-save function
  async function performAutoSave() {
    // Only auto-save if:
    // 1. Auto-save is enabled
    // 2. There are unsaved changes
    // 3. File has been saved before (not a new file)
    if (
      settingsStore.autoSave &&
      editorStore.isDirty &&
      !fileStore.isNewFile &&
      fileStore.currentFilePath
    ) {
      const success = await saveFile();
      if (success) {
        lastSaveTime.value = Date.now();
      }
    }
  }

  // Start auto-save timer
  function startAutoSave() {
    stopAutoSave();

    if (settingsStore.autoSave) {
      autoSaveTimer = setInterval(() => {
        performAutoSave();
      }, settingsStore.autoSaveInterval);
    }
  }

  // Stop auto-save timer
  function stopAutoSave() {
    if (autoSaveTimer) {
      clearInterval(autoSaveTimer);
      autoSaveTimer = null;
    }
  }

  // Handle window blur (save when losing focus)
  function handleWindowBlur() {
    if (settingsStore.autoSave) {
      performAutoSave();
    }
  }

  // Handle before unload
  function handleBeforeUnload(event: BeforeUnloadEvent) {
    if (editorStore.isDirty) {
      event.preventDefault();
      event.returnValue = "";
    }
  }

  // Watch for settings changes
  watch(
    () => settingsStore.autoSave,
    (enabled) => {
      if (enabled) {
        startAutoSave();
      } else {
        stopAutoSave();
      }
    }
  );

  watch(
    () => settingsStore.autoSaveInterval,
    () => {
      if (settingsStore.autoSave) {
        startAutoSave();
      }
    }
  );

  onMounted(() => {
    startAutoSave();
    window.addEventListener("blur", handleWindowBlur);
    window.addEventListener("beforeunload", handleBeforeUnload);
  });

  onUnmounted(() => {
    stopAutoSave();
    window.removeEventListener("blur", handleWindowBlur);
    window.removeEventListener("beforeunload", handleBeforeUnload);
  });

  return {
    lastSaveTime,
    performAutoSave,
  };
}
