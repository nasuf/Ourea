import { ref, onUnmounted } from "vue";
import { Editor, rootCtx, defaultValueCtx } from "@milkdown/kit/core";
import { commonmark } from "@milkdown/kit/preset/commonmark";
import { gfm } from "@milkdown/kit/preset/gfm";
import { history } from "@milkdown/kit/plugin/history";
import { clipboard } from "@milkdown/kit/plugin/clipboard";
import { cursor } from "@milkdown/kit/plugin/cursor";
import { listener, listenerCtx } from "@milkdown/kit/plugin/listener";
import { indent } from "@milkdown/kit/plugin/indent";
import { replaceAll } from "@milkdown/kit/utils";
import { useTabsStore } from "@/stores/tabs";

export function useMilkdown(containerRef: ReturnType<typeof ref<HTMLElement | null>>) {
  const tabsStore = useTabsStore();
  const editor = ref<Editor | null>(null);
  const isReady = ref(false);
  const isUpdatingFromExternal = ref(false);
  const isSwitchingTabs = ref(false); // Flag to prevent dirty during tab switch

  async function createEditor(initialContent: string = "") {
    if (!containerRef.value) return;

    // Destroy existing editor if any
    if (editor.value) {
      editor.value.destroy();
    }

    try {
      // Ensure we have at least a newline for proper editor initialization
      const content = initialContent || "\n";

      editor.value = await Editor.make()
        .config((ctx) => {
          ctx.set(rootCtx, containerRef.value!);
          ctx.set(defaultValueCtx, content);

          // Setup listener for content changes
          ctx.get(listenerCtx)
            .markdownUpdated((_, markdown, prevMarkdown) => {
              // Only update store if change is from user editing, not external update or tab switch
              if (!isUpdatingFromExternal.value && !isSwitchingTabs.value && markdown !== prevMarkdown) {
                tabsStore.updateActiveTabContent(markdown);
              }
            });
        })
        .use(commonmark)
        .use(gfm)
        .use(history)
        .use(clipboard)
        .use(cursor)
        .use(listener)
        .use(indent)
        .create();

      isReady.value = true;
    } catch (error) {
      console.error("Failed to create Milkdown editor:", error);
    }
  }

  function destroyEditor() {
    if (editor.value) {
      editor.value.destroy();
      editor.value = null;
      isReady.value = false;
    }
  }

  // Set content from external source (like opening a file or switching tabs)
  // markAsChange: if false, won't trigger dirty state
  function setContent(content: string, markAsChange: boolean = true) {
    if (!editor.value) return;

    if (!markAsChange) {
      isUpdatingFromExternal.value = true;
    }

    try {
      // Ensure we have at least a newline for proper editor display
      const safeContent = content || "\n";
      editor.value.action(replaceAll(safeContent));
    } catch (e) {
      console.error("Failed to set content:", e);
    } finally {
      if (!markAsChange) {
        // Use longer timeout to ensure the Milkdown listener has fully processed
        // before resetting the flag (Milkdown may fire events asynchronously)
        setTimeout(() => {
          isUpdatingFromExternal.value = false;
        }, 300);
      }
    }
  }

  // Set tab switching mode to prevent dirty updates during tab switch
  function setTabSwitching(switching: boolean) {
    isSwitchingTabs.value = switching;
  }

  function getEditorContent(): string {
    return tabsStore.activeTab?.content || "";
  }

  onUnmounted(() => {
    destroyEditor();
  });

  return {
    editor,
    isReady,
    createEditor,
    destroyEditor,
    setContent,
    setTabSwitching,
    getEditorContent,
  };
}
