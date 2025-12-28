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
import { block } from "@milkdown/plugin-block";
import { prism, prismConfig } from "@milkdown/plugin-prism";
import { refractor } from "refractor/all";
import { useTabsStore } from "@/stores/tabs";
import { useEditorStore } from "@/stores/editor";

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

    // Create custom tooltip
    createCustomTooltip();

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

          ctx.set(prismConfig.key, {
            configureRefractor: () => refractor,
          });

          const listenerCtxValue = ctx.get(listenerCtx);

          listenerCtxValue.markdownUpdated((_, markdown, prevMarkdown) => {
            if (!isUpdatingFromExternal.value && !isSwitchingTabs.value && markdown !== prevMarkdown) {
              tabsStore.updateActiveTabContent(markdown);
            }
          });

          listenerCtxValue.updated((ctx, doc) => {
            // Update tooltip on any editor update
            updateTooltipPosition();

            try {
              const view = ctx.get(editorViewCtx);
              if (view && view.state) {
                const { from } = view.state.selection;
                let line = 1;
                let column = 1;
                let pos = 0;

                doc.descendants((node, nodePos) => {
                  if (nodePos >= from) return false;
                  if (node.isBlock && nodePos > 0) {
                    line++;
                    column = 1;
                  }
                  if (node.isText) {
                    const textLen = node.text?.length || 0;
                    if (nodePos + textLen >= from) {
                      column = from - nodePos + 1;
                      return false;
                    }
                    column += textLen;
                  }
                  pos = nodePos + node.nodeSize;
                  return true;
                });

                editorStore.setCursorPosition(Math.max(1, line), Math.max(1, column));
              }
            } catch {
              // Ignore errors
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
        .use(block)
        .use(prism)
        .create();

      // Add event listeners to editor container
      containerRef.value?.addEventListener("mouseup", handleMouseUp);
      document.addEventListener("selectionchange", handleSelectionChange);

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
  }

  function setContent(content: string, markAsChange: boolean = true) {
    if (!editor.value) return;

    if (!markAsChange) {
      isUpdatingFromExternal.value = true;
    }

    try {
      const safeContent = content || "\n";
      editor.value.action(replaceAll(safeContent));
    } catch (e) {
      console.error("Failed to set content:", e);
    } finally {
      if (!markAsChange) {
        setTimeout(() => {
          isUpdatingFromExternal.value = false;
        }, 300);
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
  };
}
