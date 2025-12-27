import { onMounted, onUnmounted } from "vue";
import { useFile } from "./useFile";
import { useSettingsStore } from "@/stores/settings";

interface ShortcutHandler {
  key: string;
  ctrl?: boolean;
  meta?: boolean;
  shift?: boolean;
  alt?: boolean;
  handler: () => void;
  description: string;
}

export function useShortcuts() {
  const { newFile, openFile, saveFile, saveFileAs, closeActiveTab } = useFile();
  const settingsStore = useSettingsStore();

  // Detect platform
  const isMac = navigator.platform.toLowerCase().includes("mac");

  // Define shortcuts
  const shortcuts: ShortcutHandler[] = [
    // File operations
    {
      key: "n",
      meta: isMac,
      ctrl: !isMac,
      handler: newFile,
      description: "New File",
    },
    {
      key: "o",
      meta: isMac,
      ctrl: !isMac,
      handler: () => openFile(),
      description: "Open File",
    },
    {
      key: "s",
      meta: isMac,
      ctrl: !isMac,
      handler: saveFile,
      description: "Save File",
    },
    {
      key: "s",
      meta: isMac,
      ctrl: !isMac,
      shift: true,
      handler: saveFileAs,
      description: "Save File As",
    },
    {
      key: "w",
      meta: isMac,
      ctrl: !isMac,
      handler: closeActiveTab,
      description: "Close Tab",
    },

    // View operations
    {
      key: "\\",
      meta: isMac,
      ctrl: !isMac,
      handler: () => settingsStore.toggleSidebar(),
      description: "Toggle Sidebar",
    },
    {
      key: "=",
      meta: isMac,
      ctrl: !isMac,
      handler: () => settingsStore.setFontSize(settingsStore.fontSize + 1),
      description: "Increase Font Size",
    },
    {
      key: "-",
      meta: isMac,
      ctrl: !isMac,
      handler: () => settingsStore.setFontSize(settingsStore.fontSize - 1),
      description: "Decrease Font Size",
    },
    {
      key: "0",
      meta: isMac,
      ctrl: !isMac,
      handler: () => settingsStore.setFontSize(16),
      description: "Reset Font Size",
    },
  ];

  function handleKeyDown(event: KeyboardEvent) {
    for (const shortcut of shortcuts) {
      const metaMatch = shortcut.meta ? event.metaKey : !event.metaKey;
      const ctrlMatch = shortcut.ctrl ? event.ctrlKey : !event.ctrlKey;
      const shiftMatch = shortcut.shift ? event.shiftKey : !event.shiftKey;
      const altMatch = shortcut.alt ? event.altKey : !event.altKey;
      const keyMatch = event.key.toLowerCase() === shortcut.key.toLowerCase();

      if (keyMatch && metaMatch && ctrlMatch && shiftMatch && altMatch) {
        event.preventDefault();
        shortcut.handler();
        return;
      }
    }
  }

  onMounted(() => {
    window.addEventListener("keydown", handleKeyDown);
  });

  onUnmounted(() => {
    window.removeEventListener("keydown", handleKeyDown);
  });

  return {
    shortcuts,
  };
}
