import { $prose } from "@milkdown/kit/utils";
import { Plugin, PluginKey } from "@milkdown/kit/prose/state";
import { Decoration, DecorationSet } from "@milkdown/kit/prose/view";
import {
  CellSelection,
  TableMap,
  addColumnAfter,
  addColumnBefore,
  addRowAfter,
  addRowBefore,
  deleteColumn,
  deleteRow,
  deleteTable,
} from "@milkdown/kit/prose/tables";

const tablePluginKey = new PluginKey("tablePlugin");

// Create table toolbar element
function createTableToolbar(
  onAddRowBefore: () => void,
  onAddRowAfter: () => void,
  onAddColBefore: () => void,
  onAddColAfter: () => void,
  onDeleteRow: () => void,
  onDeleteCol: () => void,
  onDeleteTable: () => void
): HTMLElement {
  const toolbar = document.createElement("div");
  toolbar.className = "table-toolbar";
  toolbar.contentEditable = "false";

  const buttons = [
    {
      title: "Insert row above",
      icon: `<svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
        <path d="M1.5 3a.5.5 0 0 0-.5.5v2a.5.5 0 0 0 .5.5h13a.5.5 0 0 0 .5-.5v-2a.5.5 0 0 0-.5-.5h-13zm0 4a.5.5 0 0 0-.5.5v2a.5.5 0 0 0 .5.5h13a.5.5 0 0 0 .5-.5v-2a.5.5 0 0 0-.5-.5h-13z"/>
        <path d="M8 3a.5.5 0 0 1 .5.5v2a.5.5 0 0 1-1 0v-2A.5.5 0 0 1 8 3z"/>
      </svg>`,
      action: onAddRowBefore,
    },
    {
      title: "Insert row below",
      icon: `<svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
        <path d="M1.5 6a.5.5 0 0 0-.5.5v2a.5.5 0 0 0 .5.5h13a.5.5 0 0 0 .5-.5v-2a.5.5 0 0 0-.5-.5h-13zm0 4a.5.5 0 0 0-.5.5v2a.5.5 0 0 0 .5.5h13a.5.5 0 0 0 .5-.5v-2a.5.5 0 0 0-.5-.5h-13z"/>
        <path d="M8 10a.5.5 0 0 1 .5.5v2a.5.5 0 0 1-1 0v-2a.5.5 0 0 1 .5-.5z"/>
      </svg>`,
      action: onAddRowAfter,
    },
    {
      title: "Insert column left",
      icon: `<svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
        <path d="M3 1.5a.5.5 0 0 1 .5-.5h2a.5.5 0 0 1 .5.5v13a.5.5 0 0 1-.5.5h-2a.5.5 0 0 1-.5-.5v-13zm4 0a.5.5 0 0 1 .5-.5h2a.5.5 0 0 1 .5.5v13a.5.5 0 0 1-.5.5h-2a.5.5 0 0 1-.5-.5v-13z"/>
        <path d="M3 8a.5.5 0 0 1 .5-.5h2a.5.5 0 0 1 0 1h-2A.5.5 0 0 1 3 8z"/>
      </svg>`,
      action: onAddColBefore,
    },
    {
      title: "Insert column right",
      icon: `<svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
        <path d="M6 1.5a.5.5 0 0 1 .5-.5h2a.5.5 0 0 1 .5.5v13a.5.5 0 0 1-.5.5h-2a.5.5 0 0 1-.5-.5v-13zm4 0a.5.5 0 0 1 .5-.5h2a.5.5 0 0 1 .5.5v13a.5.5 0 0 1-.5.5h-2a.5.5 0 0 1-.5-.5v-13z"/>
        <path d="M10 8a.5.5 0 0 1 .5-.5h2a.5.5 0 0 1 0 1h-2a.5.5 0 0 1-.5-.5z"/>
      </svg>`,
      action: onAddColAfter,
    },
    { type: "divider" },
    {
      title: "Delete row",
      icon: `<svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
        <path d="M1.5 4a.5.5 0 0 0-.5.5v2a.5.5 0 0 0 .5.5h13a.5.5 0 0 0 .5-.5v-2a.5.5 0 0 0-.5-.5h-13zm0 4a.5.5 0 0 0-.5.5v2a.5.5 0 0 0 .5.5h13a.5.5 0 0 0 .5-.5v-2a.5.5 0 0 0-.5-.5h-13z"/>
        <path d="M5.5 5.5A.5.5 0 0 1 6 5h4a.5.5 0 0 1 0 1H6a.5.5 0 0 1-.5-.5z"/>
      </svg>`,
      action: onDeleteRow,
      danger: true,
    },
    {
      title: "Delete column",
      icon: `<svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
        <path d="M4 1.5a.5.5 0 0 1 .5-.5h2a.5.5 0 0 1 .5.5v13a.5.5 0 0 1-.5.5h-2a.5.5 0 0 1-.5-.5v-13zm5 0a.5.5 0 0 1 .5-.5h2a.5.5 0 0 1 .5.5v13a.5.5 0 0 1-.5.5h-2a.5.5 0 0 1-.5-.5v-13z"/>
        <path d="M5 5.5a.5.5 0 0 1 .5-.5h5a.5.5 0 0 1 0 1h-5a.5.5 0 0 1-.5-.5z"/>
      </svg>`,
      action: onDeleteCol,
      danger: true,
    },
    {
      title: "Delete table",
      icon: `<svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
        <path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0V6z"/>
        <path fill-rule="evenodd" d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1v1zM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4H4.118zM2.5 3V2h11v1h-11z"/>
      </svg>`,
      action: onDeleteTable,
      danger: true,
    },
  ];

  buttons.forEach((btn) => {
    if ((btn as any).type === "divider") {
      const divider = document.createElement("div");
      divider.className = "table-toolbar-divider";
      toolbar.appendChild(divider);
    } else {
      const button = document.createElement("button");
      button.className = `table-toolbar-btn${(btn as any).danger ? " danger" : ""}`;
      button.title = (btn as any).title;
      button.innerHTML = (btn as any).icon;
      button.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        (btn as any).action?.();
      });
      toolbar.appendChild(button);
    }
  });

  return toolbar;
}

// Find the table node that contains the selection
function findTable(state: any) {
  const { $from } = state.selection;
  for (let d = $from.depth; d > 0; d--) {
    const node = $from.node(d);
    if (node.type.name === "table") {
      return { node, pos: $from.before(d), depth: d };
    }
  }
  return null;
}

// Create enhanced table plugin
export const tableEnhancedPlugin = $prose(() => {
  let currentToolbar: HTMLElement | null = null;

  return new Plugin({
    key: tablePluginKey,

    view(view) {
      // Create toolbar container
      const container = document.createElement("div");
      container.className = "table-toolbar-container";
      container.style.display = "none";
      document.body.appendChild(container);

      const updateToolbar = () => {
        const { state } = view;
        const tableInfo = findTable(state);

        if (!tableInfo) {
          container.style.display = "none";
          return;
        }

        // Get table element position
        const tableNode = view.nodeDOM(tableInfo.pos);
        if (!tableNode || !(tableNode instanceof HTMLElement)) {
          container.style.display = "none";
          return;
        }

        const rect = tableNode.getBoundingClientRect();
        container.style.display = "block";
        container.style.position = "fixed";
        container.style.left = `${rect.left}px`;
        container.style.top = `${rect.top - 40}px`;
        container.style.zIndex = "1000";

        // Update toolbar content
        container.innerHTML = "";
        const toolbar = createTableToolbar(
          () => addRowBefore(state, view.dispatch),
          () => addRowAfter(state, view.dispatch),
          () => addColumnBefore(state, view.dispatch),
          () => addColumnAfter(state, view.dispatch),
          () => deleteRow(state, view.dispatch),
          () => deleteColumn(state, view.dispatch),
          () => deleteTable(state, view.dispatch)
        );
        container.appendChild(toolbar);
      };

      // Update on selection change
      return {
        update(view, prevState) {
          if (view.state.selection !== prevState?.selection) {
            updateToolbar();
          }
        },
        destroy() {
          container.remove();
        },
      };
    },
  });
});
