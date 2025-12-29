import { onMounted, onUnmounted } from "vue";
import { listen, UnlistenFn } from "@tauri-apps/api/event";
import { useSettingsStore } from "@/stores/settings";
import { useFile } from "./useFile";
import { useGlobalSearch } from "./useSearch";

export function useMenuEvents() {
  const settingsStore = useSettingsStore();
  const { newFile, openFile, saveFile, saveFileAs, closeActiveTab } = useFile();
  const { openSearch, openSearchReplace } = useGlobalSearch();

  let unlistenMenu: UnlistenFn | null = null;

  async function handleMenuEvent(menuId: string) {
    switch (menuId) {
      case "settings":
        settingsStore.openSettingsDialog();
        break;
      case "new_file":
        newFile();
        break;
      case "open_file":
        await openFile();
        break;
      case "save_file":
        await saveFile();
        break;
      case "save_as":
        await saveFileAs();
        break;
      case "close_tab":
        await closeActiveTab();
        break;
      case "find":
        openSearch();
        break;
      case "replace":
        openSearchReplace();
        break;
      case "toggle_sidebar":
        settingsStore.toggleSidebar();
        break;
      case "toggle_focus":
        settingsStore.toggleFocusMode();
        break;
      // toggle_outline is handled in MainLayout via provide/inject
      default:
        console.log("Unhandled menu event:", menuId);
    }
  }

  onMounted(async () => {
    unlistenMenu = await listen<string>("menu-event", (event) => {
      handleMenuEvent(event.payload);
    });
  });

  onUnmounted(() => {
    if (unlistenMenu) {
      unlistenMenu();
      unlistenMenu = null;
    }
  });

  return {
    handleMenuEvent,
  };
}
