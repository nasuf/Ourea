import { onMounted, onUnmounted } from "vue";
import { getCurrentWindow } from "@tauri-apps/api/window";
import { useFile } from "./useFile";
import { useSettingsStore } from "@/stores/settings";
import { useGlobalSearch } from "./useSearch";
import { executeEditorCommand, hasActiveEditor } from "./useEditorCommands";

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
  const { openSearch, isSearchOpen, closeSearch } = useGlobalSearch();

  // Detect platform
  const isMac = navigator.platform.toLowerCase().includes("mac");

  // Toggle fullscreen
  async function toggleFullscreen() {
    const window = getCurrentWindow();
    const isFullscreen = await window.isFullscreen();
    await window.setFullscreen(!isFullscreen);
  }

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
      key: "o",
      meta: isMac,
      ctrl: !isMac,
      shift: true,
      handler: () => settingsStore.toggleOutline(),
      description: "Toggle Outline",
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
    // Fullscreen: F11 on Windows/Linux, Cmd+Ctrl+F on macOS
    ...(isMac
      ? [
          {
            key: "f",
            meta: true,
            ctrl: true,
            handler: () => toggleFullscreen(),
            description: "Toggle Fullscreen",
          },
        ]
      : [
          {
            key: "F11",
            handler: () => toggleFullscreen(),
            description: "Toggle Fullscreen",
          },
        ]),

    // Search
    {
      key: "f",
      meta: isMac,
      ctrl: !isMac,
      handler: () => {
        if (isSearchOpen.value) {
          closeSearch();
        } else {
          openSearch();
        }
      },
      description: "Find",
    },
    {
      key: "h",
      meta: isMac,
      ctrl: !isMac,
      handler: () => {
        openSearch();
      },
      description: "Find and Replace",
    },

    // Formatting shortcuts
    {
      key: "b",
      meta: isMac,
      ctrl: !isMac,
      handler: () => executeEditorCommand("toggleBold"),
      description: "Bold",
    },
    {
      key: "i",
      meta: isMac,
      ctrl: !isMac,
      handler: () => executeEditorCommand("toggleItalic"),
      description: "Italic",
    },
    {
      key: "k",
      meta: isMac,
      ctrl: !isMac,
      handler: () => executeEditorCommand("toggleLink"),
      description: "Insert Link",
    },
    {
      key: "k",
      meta: isMac,
      ctrl: !isMac,
      shift: true,
      handler: () => executeEditorCommand("createCodeBlock"),
      description: "Insert Code Block",
    },
    {
      key: "`",
      meta: isMac,
      ctrl: !isMac,
      handler: () => executeEditorCommand("toggleInlineCode"),
      description: "Inline Code",
    },

    // Heading shortcuts (Cmd/Ctrl + 1-6)
    {
      key: "1",
      meta: isMac,
      ctrl: !isMac,
      handler: () => executeEditorCommand("wrapInHeading", 1),
      description: "Heading 1",
    },
    {
      key: "2",
      meta: isMac,
      ctrl: !isMac,
      handler: () => executeEditorCommand("wrapInHeading", 2),
      description: "Heading 2",
    },
    {
      key: "3",
      meta: isMac,
      ctrl: !isMac,
      handler: () => executeEditorCommand("wrapInHeading", 3),
      description: "Heading 3",
    },
    {
      key: "4",
      meta: isMac,
      ctrl: !isMac,
      handler: () => executeEditorCommand("wrapInHeading", 4),
      description: "Heading 4",
    },
    {
      key: "5",
      meta: isMac,
      ctrl: !isMac,
      handler: () => executeEditorCommand("wrapInHeading", 5),
      description: "Heading 5",
    },
    {
      key: "6",
      meta: isMac,
      ctrl: !isMac,
      handler: () => executeEditorCommand("wrapInHeading", 6),
      description: "Heading 6",
    },

    // Focus mode
    {
      key: "Enter",
      meta: isMac,
      ctrl: !isMac,
      shift: true,
      handler: () => settingsStore.toggleFocusMode(),
      description: "Toggle Focus Mode",
    },
    // Typewriter mode
    {
      key: "t",
      meta: isMac,
      ctrl: !isMac,
      shift: true,
      handler: () => settingsStore.toggleTypewriterMode(),
      description: "Toggle Typewriter Mode",
    },
    // Paragraph focus
    {
      key: "p",
      meta: isMac,
      ctrl: !isMac,
      shift: true,
      handler: () => settingsStore.toggleParagraphFocus(),
      description: "Toggle Paragraph Focus",
    },
    // Exit focus mode with ESC
    {
      key: "Escape",
      handler: () => {
        if (settingsStore.focusMode) {
          settingsStore.exitFocusMode();
        }
      },
      description: "Exit Focus Mode",
    },
    // Settings
    {
      key: ",",
      meta: isMac,
      ctrl: !isMac,
      handler: () => settingsStore.openSettingsDialog(),
      description: "Open Settings",
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
