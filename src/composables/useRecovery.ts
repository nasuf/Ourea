import { ref, onUnmounted } from "vue";
import { invoke } from "@tauri-apps/api/core";
import { appDataDir } from "@tauri-apps/api/path";
import { useTabsStore } from "@/stores/tabs";

const RECOVERY_INTERVAL = 30000; // 30 seconds
const RECOVERY_FILE_NAME = "recovery.json";

interface RecoveryData {
  timestamp: number;
  tabs: {
    id: string;
    fileName: string;
    filePath: string | null;
    content: string;
    isDirty: boolean;
    fileType?: "markdown" | "text";
    extension?: string | null;
  }[];
  activeTabId: string | null;
}

export function useRecovery() {
  const tabsStore = useTabsStore();
  const hasRecoveryData = ref(false);
  const recoveryData = ref<RecoveryData | null>(null);
  let recoveryInterval: number | null = null;
  let recoveryFilePath: string | null = null;

  async function getRecoveryFilePath(): Promise<string> {
    if (recoveryFilePath) return recoveryFilePath;

    const dataDir = await appDataDir();
    recoveryFilePath = `${dataDir}${RECOVERY_FILE_NAME}`;
    return recoveryFilePath;
  }

  async function saveRecoveryData(): Promise<void> {
    const tabs = tabsStore.tabs;

    // Only save if there are dirty tabs
    const hasDirtyTabs = tabs.some((tab) => tab.isDirty);
    if (!hasDirtyTabs) return;

    const data: RecoveryData = {
      timestamp: Date.now(),
      tabs: tabs.map((tab) => ({
        id: tab.id,
        fileName: tab.fileName,
        filePath: tab.filePath,
        content: tab.content,
        isDirty: tab.isDirty,
        fileType: tab.fileType,
        extension: tab.extension,
      })),
      activeTabId: tabsStore.activeTabId,
    };

    try {
      const filePath = await getRecoveryFilePath();
      await invoke("write_file", {
        path: filePath,
        content: JSON.stringify(data, null, 2),
      });
    } catch (error) {
      console.error("Failed to save recovery data:", error);
    }
  }

  async function checkRecoveryData(): Promise<boolean> {
    try {
      const filePath = await getRecoveryFilePath();
      const exists = await invoke<boolean>("file_exists", { path: filePath });

      if (!exists) {
        hasRecoveryData.value = false;
        return false;
      }

      const content = await invoke<string>("read_file", { path: filePath });
      const data = JSON.parse(content) as RecoveryData;

      // Check if data is not too old (24 hours)
      const maxAge = 24 * 60 * 60 * 1000;
      if (Date.now() - data.timestamp > maxAge) {
        await clearRecoveryData();
        hasRecoveryData.value = false;
        return false;
      }

      // Check if there are dirty tabs to recover
      const hasDirtyTabs = data.tabs.some((tab) => tab.isDirty);
      if (!hasDirtyTabs) {
        await clearRecoveryData();
        hasRecoveryData.value = false;
        return false;
      }

      recoveryData.value = data;
      hasRecoveryData.value = true;
      return true;
    } catch (error) {
      console.error("Failed to check recovery data:", error);
      hasRecoveryData.value = false;
      return false;
    }
  }

  async function recoverTabs(): Promise<void> {
    if (!recoveryData.value) return;

    const data = recoveryData.value;

    for (const tabData of data.tabs) {
      // Only recover dirty tabs (unsaved changes)
      if (tabData.isDirty) {
        tabsStore.createTab({
          fileName: tabData.fileName,
          filePath: tabData.filePath,
          content: tabData.content,
          isDirty: true,
          isNew: !tabData.filePath,
          fileType: tabData.fileType,
        });
      }
    }

    await clearRecoveryData();
    recoveryData.value = null;
    hasRecoveryData.value = false;
  }

  async function clearRecoveryData(): Promise<void> {
    try {
      const filePath = await getRecoveryFilePath();
      const exists = await invoke<boolean>("file_exists", { path: filePath });
      if (exists) {
        await invoke("delete_path", { path: filePath });
      }
    } catch (error) {
      console.error("Failed to clear recovery data:", error);
    }
    recoveryData.value = null;
    hasRecoveryData.value = false;
  }

  function startAutoRecovery(): void {
    if (recoveryInterval) return;

    recoveryInterval = window.setInterval(saveRecoveryData, RECOVERY_INTERVAL);

    // Also save on visibility change (user leaving the page)
    document.addEventListener("visibilitychange", handleVisibilityChange);
  }

  function stopAutoRecovery(): void {
    if (recoveryInterval) {
      window.clearInterval(recoveryInterval);
      recoveryInterval = null;
    }
    document.removeEventListener("visibilitychange", handleVisibilityChange);
  }

  function handleVisibilityChange(): void {
    if (document.hidden) {
      saveRecoveryData();
    }
  }

  onUnmounted(() => {
    stopAutoRecovery();
  });

  return {
    hasRecoveryData,
    recoveryData,
    checkRecoveryData,
    recoverTabs,
    clearRecoveryData,
    startAutoRecovery,
    stopAutoRecovery,
    saveRecoveryData,
  };
}
