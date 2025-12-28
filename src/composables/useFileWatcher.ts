import { ref, onUnmounted } from "vue";
import { invoke } from "@tauri-apps/api/core";
import { listen, UnlistenFn } from "@tauri-apps/api/event";

export interface FileChangeEvent {
  path: string;
  kind: "create" | "modify" | "remove" | "access" | "other" | "unknown";
}

export function useFileWatcher() {
  const watchedPaths = ref<Set<string>>(new Set());
  const isWatching = ref(false);
  let unlistenFn: UnlistenFn | null = null;
  const callbacks: Map<string, ((event: FileChangeEvent) => void)[]> = new Map();

  async function setupListener() {
    if (unlistenFn) return;

    unlistenFn = await listen<FileChangeEvent>("file-changed", (event) => {
      const { path, kind } = event.payload;

      // Call all registered callbacks for this path
      const pathCallbacks = callbacks.get(path);
      if (pathCallbacks) {
        pathCallbacks.forEach((cb) => cb({ path, kind }));
      }

      // Also call callbacks registered for "all" paths
      const allCallbacks = callbacks.get("*");
      if (allCallbacks) {
        allCallbacks.forEach((cb) => cb({ path, kind }));
      }
    });
  }

  async function startWatching(
    path: string,
    callback?: (event: FileChangeEvent) => void
  ): Promise<boolean> {
    try {
      await setupListener();
      await invoke("start_watching", { path });

      watchedPaths.value.add(path);
      isWatching.value = true;

      if (callback) {
        const existing = callbacks.get(path) || [];
        existing.push(callback);
        callbacks.set(path, existing);
      }

      return true;
    } catch (error) {
      console.error("Failed to start watching:", error);
      return false;
    }
  }

  async function stopWatching(path: string): Promise<boolean> {
    try {
      await invoke("stop_watching", { path });

      watchedPaths.value.delete(path);
      callbacks.delete(path);

      if (watchedPaths.value.size === 0) {
        isWatching.value = false;
      }

      return true;
    } catch (error) {
      console.error("Failed to stop watching:", error);
      return false;
    }
  }

  async function stopAllWatching(): Promise<boolean> {
    try {
      await invoke("stop_all_watching");

      watchedPaths.value.clear();
      callbacks.clear();
      isWatching.value = false;

      return true;
    } catch (error) {
      console.error("Failed to stop all watching:", error);
      return false;
    }
  }

  function onFileChange(
    pathOrCallback: string | ((event: FileChangeEvent) => void),
    callback?: (event: FileChangeEvent) => void
  ) {
    const path = typeof pathOrCallback === "string" ? pathOrCallback : "*";
    const cb = typeof pathOrCallback === "function" ? pathOrCallback : callback!;

    const existing = callbacks.get(path) || [];
    existing.push(cb);
    callbacks.set(path, existing);

    // Return unsubscribe function
    return () => {
      const cbs = callbacks.get(path);
      if (cbs) {
        const index = cbs.indexOf(cb);
        if (index > -1) {
          cbs.splice(index, 1);
        }
        if (cbs.length === 0) {
          callbacks.delete(path);
        }
      }
    };
  }

  onUnmounted(() => {
    if (unlistenFn) {
      unlistenFn();
      unlistenFn = null;
    }
  });

  return {
    watchedPaths,
    isWatching,
    startWatching,
    stopWatching,
    stopAllWatching,
    onFileChange,
  };
}
