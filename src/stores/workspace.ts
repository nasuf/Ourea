import { defineStore } from "pinia";
import { ref, computed } from "vue";
import { invoke } from "@tauri-apps/api/core";
import { open } from "@tauri-apps/plugin-dialog";

export interface FileTreeNode {
  name: string;
  path: string;
  isDir: boolean;
  extension: string | null;
  children: FileTreeNode[] | null;
  expanded?: boolean;
}

export const useWorkspaceStore = defineStore("workspace", () => {
  const rootPath = ref<string | null>(null);
  const rootName = ref<string>("");
  const fileTree = ref<FileTreeNode | null>(null);
  const expandedPaths = ref<Set<string>>(new Set());
  const selectedPath = ref<string | null>(null);
  const isLoading = ref(false);

  const hasWorkspace = computed(() => rootPath.value !== null);

  async function openFolder(): Promise<boolean> {
    try {
      const selected = await open({
        directory: true,
        multiple: false,
        title: "选择工作文件夹",
      });

      if (selected && typeof selected === "string") {
        return await loadWorkspace(selected);
      }

      return false;
    } catch (error) {
      console.error("Failed to open folder:", error);
      return false;
    }
  }

  async function loadWorkspace(path: string): Promise<boolean> {
    isLoading.value = true;

    try {
      const tree = await invoke<FileTreeNode>("read_directory_recursive", {
        path,
        maxDepth: 5,
      });

      // Convert snake_case to camelCase
      const convertNode = (node: any): FileTreeNode => ({
        name: node.name,
        path: node.path,
        isDir: node.is_dir,
        extension: node.extension,
        children: node.children?.map(convertNode) ?? null,
        expanded: false,
      });

      rootPath.value = path;
      rootName.value = tree.name;
      fileTree.value = convertNode(tree);
      expandedPaths.value = new Set([path]); // Root is expanded by default

      return true;
    } catch (error) {
      console.error("Failed to load workspace:", error);
      return false;
    } finally {
      isLoading.value = false;
    }
  }

  async function refreshDirectory(path: string): Promise<void> {
    if (!fileTree.value) return;

    try {
      const children = await invoke<any[]>("read_directory", { path });

      const convertNode = (node: any): FileTreeNode => ({
        name: node.name,
        path: node.path,
        isDir: node.is_dir,
        extension: node.extension,
        children: node.is_dir ? [] : null,
        expanded: false,
      });

      // Find and update the node
      const updateNode = (node: FileTreeNode): boolean => {
        if (node.path === path) {
          node.children = children
            .filter((child: any) => child.is_dir || ["md", "markdown"].includes(child.extension || ""))
            .map(convertNode);
          return true;
        }

        if (node.children) {
          for (const child of node.children) {
            if (updateNode(child)) return true;
          }
        }

        return false;
      };

      updateNode(fileTree.value);
    } catch (error) {
      console.error("Failed to refresh directory:", error);
    }
  }

  function toggleExpanded(path: string): void {
    if (expandedPaths.value.has(path)) {
      expandedPaths.value.delete(path);
    } else {
      expandedPaths.value.add(path);
    }
    // Trigger reactivity
    expandedPaths.value = new Set(expandedPaths.value);
  }

  function isExpanded(path: string): boolean {
    return expandedPaths.value.has(path);
  }

  function setSelectedPath(path: string | null): void {
    selectedPath.value = path;
  }

  function closeWorkspace(): void {
    rootPath.value = null;
    rootName.value = "";
    fileTree.value = null;
    expandedPaths.value = new Set();
    selectedPath.value = null;
  }

  return {
    rootPath,
    rootName,
    fileTree,
    expandedPaths,
    selectedPath,
    isLoading,
    hasWorkspace,
    openFolder,
    loadWorkspace,
    refreshDirectory,
    toggleExpanded,
    isExpanded,
    setSelectedPath,
    closeWorkspace,
  };
});
