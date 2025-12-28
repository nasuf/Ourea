import { $prose } from "@milkdown/kit/utils";
import { Plugin, PluginKey } from "@milkdown/kit/prose/state";
import { Decoration, DecorationSet } from "@milkdown/kit/prose/view";

const searchHighlightKey = new PluginKey("searchHighlight");

export interface SearchHighlightState {
  query: string;
  caseSensitive: boolean;
  regex: boolean;
  wholeWord: boolean;
  currentIndex: number;
}

let currentState: SearchHighlightState | null = null;

// Build regex pattern from search options
function buildSearchPattern(query: string, options: Partial<SearchHighlightState>): RegExp | null {
  if (!query) return null;

  let pattern = query;

  // If not using regex, escape special characters
  if (!options.regex) {
    pattern = pattern.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  }

  // Add whole word boundaries
  if (options.wholeWord) {
    pattern = `\\b${pattern}\\b`;
  }

  const flags = options.caseSensitive ? "g" : "gi";

  try {
    return new RegExp(pattern, flags);
  } catch {
    return null;
  }
}

// Find all matches in document
function findMatches(doc: any, regex: RegExp): Array<{ from: number; to: number }> {
  const matches: Array<{ from: number; to: number }> = [];

  doc.descendants((node: any, pos: number) => {
    if (node.isText) {
      const text = node.text || "";
      let match: RegExpExecArray | null;
      regex.lastIndex = 0;

      while ((match = regex.exec(text)) !== null) {
        matches.push({
          from: pos + match.index,
          to: pos + match.index + match[0].length,
        });

        // Prevent infinite loop for zero-width matches
        if (match[0].length === 0) {
          regex.lastIndex++;
        }
      }
    }
  });

  return matches;
}

// Update search state
export function updateSearchHighlight(state: SearchHighlightState | null) {
  currentState = state;
  // Dispatch custom event to trigger plugin update
  document.dispatchEvent(new CustomEvent("search-highlight-update"));
}

// Get current match count
export function getMatchCount(): number {
  if (!currentState || !currentState.query) return 0;
  // This will be calculated in the plugin
  return 0;
}

// Create search highlight plugin
export const searchHighlightPlugin = $prose(() => {
  return new Plugin({
    key: searchHighlightKey,

    state: {
      init() {
        return DecorationSet.empty;
      },
      apply(tr, oldDecorations, oldState, newState) {
        if (!currentState || !currentState.query) {
          return DecorationSet.empty;
        }

        const regex = buildSearchPattern(currentState.query, currentState);
        if (!regex) {
          return DecorationSet.empty;
        }

        const matches = findMatches(newState.doc, regex);
        const decorations: Decoration[] = [];

        matches.forEach((match, index) => {
          const isCurrentMatch = index === currentState!.currentIndex;
          decorations.push(
            Decoration.inline(match.from, match.to, {
              class: isCurrentMatch ? "search-highlight current" : "search-highlight",
            })
          );
        });

        // Dispatch match count
        document.dispatchEvent(
          new CustomEvent("search-match-count", {
            detail: { count: matches.length, currentIndex: currentState.currentIndex },
          })
        );

        return DecorationSet.create(newState.doc, decorations);
      },
    },

    props: {
      decorations(state) {
        return this.getState(state);
      },
    },

    view(view) {
      const handleUpdate = () => {
        // Force view update to recalculate decorations
        const tr = view.state.tr.setMeta("search-highlight", true);
        view.dispatch(tr);
      };

      document.addEventListener("search-highlight-update", handleUpdate);

      return {
        destroy() {
          document.removeEventListener("search-highlight-update", handleUpdate);
        },
      };
    },
  });
});
