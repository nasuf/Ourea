import { ref, onUnmounted } from "vue";
import { Editor, rootCtx, defaultValueCtx, editorViewCtx, commandsCtx } from "@milkdown/kit/core";
import {
  commonmark,
  toggleStrongCommand,
  toggleEmphasisCommand,
  toggleInlineCodeCommand,
  toggleLinkCommand,
  wrapInHeadingCommand,
  wrapInBlockquoteCommand,
  wrapInBulletListCommand,
  wrapInOrderedListCommand,
  createCodeBlockCommand,
  insertHrCommand,
  insertImageCommand,
} from "@milkdown/kit/preset/commonmark";
import { gfm, toggleStrikethroughCommand } from "@milkdown/kit/preset/gfm";
import { history } from "@milkdown/kit/plugin/history";
import { clipboard } from "@milkdown/kit/plugin/clipboard";
import { cursor } from "@milkdown/kit/plugin/cursor";
import { listener, listenerCtx } from "@milkdown/kit/plugin/listener";
import { indent } from "@milkdown/kit/plugin/indent";
import { replaceAll } from "@milkdown/kit/utils";
// import { block } from "@milkdown/plugin-block";
import { prism, prismConfig } from "@milkdown/plugin-prism";
import { refractor } from "refractor/all";
import { useTabsStore } from "@/stores/tabs";
import { useEditorStore } from "@/stores/editor";
import { imageUploadPlugin } from "@/plugins/imagePlugin";
// import { codeBlockEnhancedPlugin } from "@/plugins/codeBlockPlugin";
import { mathPlugin } from "@/plugins/mathPlugin";
import { tableEnhancedPlugin } from "@/plugins/tablePlugin";
import { searchHighlightPlugin } from "@/plugins/searchHighlightPlugin";

export function useMilkdown(containerRef: ReturnType<typeof ref<HTMLElement | null>>) {
  const tabsStore = useTabsStore();
  const editorStore = useEditorStore();
  const editor = ref<Editor | null>(null);
  const isReady = ref(false);
  const isUpdatingFromExternal = ref(false);
  const isSwitchingTabs = ref(false);

  // Custom tooltip state
  let tooltipElement: HTMLElement | null = null;
  let isTooltipVisible = false;
  let cleanupFn: (() => void) | null = null;

  // Create and setup custom tooltip
  function createCustomTooltip() {
    tooltipElement = document.createElement("div");
    tooltipElement.className = "milkdown-selection-tooltip";
    tooltipElement.style.display = "none";

    const buttons = [
      { id: "bold", label: "B", title: "Bold", command: "toggleBold" },
      { id: "italic", label: "I", title: "Italic", command: "toggleItalic" },
      { id: "strike", label: "S", title: "Strikethrough", command: "toggleStrikethrough" },
      { id: "code", label: "</>" , title: "Code", command: "toggleInlineCode" },
      { id: "link", label: "Link", title: "Link", command: "toggleLink" },
    ];

    buttons.forEach(({ id, label, title, command }) => {
      const btn = document.createElement("button");
      btn.className = `tooltip-btn tooltip-btn-${id}`;
      btn.title = title;
      btn.dataset.command = command;
      btn.textContent = label;
      btn.addEventListener("mousedown", (e) => {
        e.preventDefault();
        e.stopPropagation();
        executeCommand(command);
      });
      tooltipElement!.appendChild(btn);
    });

    document.body.appendChild(tooltipElement);
  }

  function showTooltip(x: number, y: number) {
    if (!tooltipElement) return;
    tooltipElement.style.display = "flex";
    tooltipElement.style.left = `${x}px`;
    tooltipElement.style.top = `${y}px`;
    isTooltipVisible = true;
  }

  function hideTooltip() {
    if (!tooltipElement) return;
    tooltipElement.style.display = "none";
    isTooltipVisible = false;
  }

  function destroyTooltip() {
    if (tooltipElement) {
      tooltipElement.remove();
      tooltipElement = null;
    }
  }

  // Update tooltip position based on selection
  function updateTooltipPosition() {
    if (!editor.value) return;

    try {
      editor.value.action((ctx) => {
        const view = ctx.get(editorViewCtx);
        const { selection } = view.state;
        const { empty, from, to } = selection;

        // Hide if no selection
        if (empty) {
          hideTooltip();
          return;
        }

        // Check if it's a text selection
        const isTextSelection = selection.$from.parent.isTextblock;
        if (!isTextSelection) {
          hideTooltip();
          return;
        }

        // Get selection coordinates
        const start = view.coordsAtPos(from);
        const end = view.coordsAtPos(to);

        // Position tooltip above the selection
        const x = (start.left + end.left) / 2;
        const y = start.top - 40; // 40px above selection

        showTooltip(x, y);
      });
    } catch {
      hideTooltip();
    }
  }

  async function createEditor(initialContent: string = "") {
    if (!containerRef.value) return;

    // Destroy existing editor if any
    if (editor.value) {
      editor.value.destroy();
    }

    // Create custom tooltip - disabled for debugging
    // createCustomTooltip();

    // Setup keyboard handler for ESC
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isTooltipVisible) {
        hideTooltip();
      }
    };
    document.addEventListener("keydown", handleKeyDown);

    // Setup mouseup handler to update tooltip
    const handleMouseUp = () => {
      // Small delay to let selection settle
      setTimeout(updateTooltipPosition, 10);
    };

    // Setup selection change handler
    const handleSelectionChange = () => {
      updateTooltipPosition();
    };

    try {
      const content = initialContent || "\n";

      editor.value = await Editor.make()
        .config((ctx) => {
          ctx.set(rootCtx, containerRef.value!);
          ctx.set(defaultValueCtx, content);

          // Prism config disabled since prism plugin is disabled
          // ctx.set(prismConfig.key, {
          //   configureRefractor: () => refractor,
          // });

          const listenerCtxValue = ctx.get(listenerCtx);

          listenerCtxValue.markdownUpdated((_, markdown, prevMarkdown) => {
            if (!isUpdatingFromExternal.value && !isSwitchingTabs.value && markdown !== prevMarkdown) {
              tabsStore.updateActiveTabContent(markdown);
            }
          });

          // Simplified listener - removed complex document traversal to debug rendering
          listenerCtxValue.updated(() => {
            // Disabled for debugging
          });
        })
        .use(commonmark)
        .use(gfm)
        .use(history)
        .use(clipboard)
        .use(cursor)
        .use(listener)
        .use(indent)
        // .use(block) // Temporarily disabled - may cause rendering issues
        // .use(prism) // Temporarily disabled to debug rendering
        // Temporarily disabled ALL custom plugins to debug rendering issue
        // .use(imageUploadPlugin)
        // .use(codeBlockEnhancedPlugin)
        // .use(mathPlugin)
        // .use(tableEnhancedPlugin)
        // .use(searchHighlightPlugin)
        .create();

      // Add event listeners to editor container - temporarily disabled to debug
      // containerRef.value?.addEventListener("mouseup", handleMouseUp);
      // document.addEventListener("selectionchange", handleSelectionChange);

      // Store cleanup function reference for destroyEditor
      cleanupFn = () => {
        document.removeEventListener("keydown", handleKeyDown);
        containerRef.value?.removeEventListener("mouseup", handleMouseUp);
        document.removeEventListener("selectionchange", handleSelectionChange);
        destroyTooltip();
      };

      isReady.value = true;
    } catch (error) {
      console.error("Failed to create Milkdown editor:", error);
    }
  }

  function destroyEditor() {
    // Run cleanup first
    if (cleanupFn) {
      cleanupFn();
      cleanupFn = null;
    }
    if (editor.value) {
      editor.value.destroy();
      editor.value = null;
      isReady.value = false;
    }
    // Clear the container DOM to ensure clean state for next editor
    if (containerRef.value) {
      containerRef.value.innerHTML = "";
    }
  }

  function setContent(content: string, markAsChange: boolean = true) {
    if (!editor.value) {
      console.warn("setContent called but editor is not ready");
      return;
    }

    if (!markAsChange) {
      isUpdatingFromExternal.value = true;
    }

    try {
      // Ensure content is a valid string with at least a newline
      const safeContent = content || "\n";

      // Use replaceAll to replace the entire document content
      const success = editor.value.action(replaceAll(safeContent));

      if (!success) {
        console.warn("replaceAll returned false, trying alternative method");
        // Alternative: use editor action to get view and replace content directly
        editor.value.action((ctx) => {
          try {
            const view = ctx.get(editorViewCtx);
            if (view) {
              // Parse the markdown content to ProseMirror document
              const { state } = view;
              const { tr } = state;

              // Delete all content and insert new
              tr.delete(0, state.doc.content.size);
              view.dispatch(tr);

              // Now use replaceAll again after clearing
              editor.value?.action(replaceAll(safeContent));
            }
          } catch (err) {
            console.error("Alternative content replacement failed:", err);
          }
        });
      }

      // Force a view update to ensure the content is rendered
      editor.value.action((ctx) => {
        try {
          const view = ctx.get(editorViewCtx);
          if (view) {
            // Focus the editor to ensure it's updated
            view.focus();
          }
        } catch {
          // Ignore focus errors
        }
      });
    } catch (e) {
      console.error("Failed to set content:", e);
    } finally {
      if (!markAsChange) {
        // Use a slightly longer timeout to ensure content is fully updated
        setTimeout(() => {
          isUpdatingFromExternal.value = false;
        }, 200);
      }
    }
  }

  function setTabSwitching(switching: boolean) {
    isSwitchingTabs.value = switching;
  }

  function getEditorContent(): string {
    return tabsStore.activeTab?.content || "";
  }

  const commandMap: Record<string, { cmd: any; payload?: any }> = {
    toggleBold: { cmd: toggleStrongCommand },
    toggleItalic: { cmd: toggleEmphasisCommand },
    toggleStrikethrough: { cmd: toggleStrikethroughCommand },
    toggleInlineCode: { cmd: toggleInlineCodeCommand },
    toggleLink: { cmd: toggleLinkCommand, payload: { href: "" } },
    wrapInHeading: { cmd: wrapInHeadingCommand },
    wrapInBlockquote: { cmd: wrapInBlockquoteCommand },
    wrapInBulletList: { cmd: wrapInBulletListCommand },
    wrapInOrderedList: { cmd: wrapInOrderedListCommand },
    createCodeBlock: { cmd: createCodeBlockCommand },
    insertHr: { cmd: insertHrCommand },
    insertImage: { cmd: insertImageCommand, payload: { src: "", alt: "" } },
  };

  function executeCommand(command: string, payload?: any) {
    if (!editor.value) return false;

    if (command === "insertTaskList") {
      return insertTaskList();
    }

    try {
      return editor.value.action((ctx) => {
        const commands = ctx.get(commandsCtx);
        const cmdConfig = commandMap[command];

        if (!cmdConfig) {
          console.warn(`Unknown command: ${command}`);
          return false;
        }

        const cmdPayload = payload !== undefined ? payload : cmdConfig.payload;

        if (cmdPayload !== undefined) {
          return commands.call(cmdConfig.cmd.key, cmdPayload);
        } else {
          return commands.call(cmdConfig.cmd.key);
        }
      });
    } catch (e) {
      console.error(`Failed to execute command ${command}:`, e);
      return false;
    }
  }

  function insertTaskList(): boolean {
    if (!editor.value) return false;

    try {
      return editor.value.action((ctx) => {
        const view = ctx.get(editorViewCtx);
        const { state, dispatch } = view;
        const { selection } = state;
        const { $from } = selection;

        const lineStart = $from.start();
        const textToInsert = "- [ ] ";

        const tr = state.tr.insertText(textToInsert, lineStart);
        dispatch(tr);
        return true;
      });
    } catch (e) {
      console.error("Failed to insert task list:", e);
      return false;
    }
  }

  function insertText(text: string): boolean {
    if (!editor.value) return false;

    try {
      return editor.value.action((ctx) => {
        const view = ctx.get(editorViewCtx);
        const { state, dispatch } = view;
        const { selection } = state;

        // Insert text at current cursor position
        const tr = state.tr.insertText(text, selection.from, selection.to);
        dispatch(tr);
        return true;
      });
    } catch (e) {
      console.error("Failed to insert text:", e);
      return false;
    }
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
    executeCommand,
    insertText,
  };
}
