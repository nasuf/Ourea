import { ref, computed } from "vue";
import { useTabsStore } from "@/stores/tabs";

export interface SearchOptions {
  caseSensitive: boolean;
  regex: boolean;
  wholeWord: boolean;
}

export interface SearchMatch {
  index: number;
  start: number;
  end: number;
  text: string;
}

export function useSearch() {
  const tabsStore = useTabsStore();

  const isSearchOpen = ref(false);
  const searchQuery = ref("");
  const searchOptions = ref<SearchOptions>({
    caseSensitive: false,
    regex: false,
    wholeWord: false,
  });

  const matches = ref<SearchMatch[]>([]);
  const currentMatchIndex = ref(0);

  const currentMatch = computed(() => {
    if (matches.value.length === 0) return null;
    return matches.value[currentMatchIndex.value];
  });

  const matchCount = computed(() => matches.value.length);

  function openSearch(initialQuery?: string) {
    isSearchOpen.value = true;
    if (initialQuery) {
      searchQuery.value = initialQuery;
    }
  }

  function closeSearch() {
    isSearchOpen.value = false;
    matches.value = [];
    currentMatchIndex.value = 0;
  }

  function buildSearchPattern(query: string, options: SearchOptions): RegExp | null {
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

  function search(query: string, options: SearchOptions) {
    searchQuery.value = query;
    searchOptions.value = options;

    const content = tabsStore.activeTab?.content || "";
    if (!content || !query) {
      matches.value = [];
      currentMatchIndex.value = 0;
      return;
    }

    const regex = buildSearchPattern(query, options);
    if (!regex) {
      matches.value = [];
      currentMatchIndex.value = 0;
      return;
    }

    const foundMatches: SearchMatch[] = [];
    let match: RegExpExecArray | null;
    let index = 0;

    while ((match = regex.exec(content)) !== null) {
      foundMatches.push({
        index,
        start: match.index,
        end: match.index + match[0].length,
        text: match[0],
      });
      index++;

      // Prevent infinite loop for zero-width matches
      if (match[0].length === 0) {
        regex.lastIndex++;
      }
    }

    matches.value = foundMatches;

    // Reset to first match if we have matches
    if (foundMatches.length > 0) {
      currentMatchIndex.value = 0;
    }
  }

  function nextMatch() {
    if (matches.value.length === 0) return;
    currentMatchIndex.value = (currentMatchIndex.value + 1) % matches.value.length;
  }

  function prevMatch() {
    if (matches.value.length === 0) return;
    currentMatchIndex.value =
      (currentMatchIndex.value - 1 + matches.value.length) % matches.value.length;
  }

  function replace(replacement: string): boolean {
    if (!currentMatch.value) return false;

    const content = tabsStore.activeTab?.content || "";
    const match = currentMatch.value;

    const newContent =
      content.substring(0, match.start) + replacement + content.substring(match.end);

    tabsStore.updateActiveTabContent(newContent);

    // Re-search to update matches
    search(searchQuery.value, searchOptions.value);

    return true;
  }

  function replaceAll(replacement: string): number {
    if (matches.value.length === 0) return 0;

    const content = tabsStore.activeTab?.content || "";
    const regex = buildSearchPattern(searchQuery.value, searchOptions.value);

    if (!regex) return 0;

    const count = matches.value.length;
    const newContent = content.replace(regex, replacement);

    tabsStore.updateActiveTabContent(newContent);

    // Clear matches after replace all
    matches.value = [];
    currentMatchIndex.value = 0;

    return count;
  }

  // Get selected text from editor (for initializing search)
  function getSelectedText(): string {
    // This will be called from the editor component
    // For now return empty, can be enhanced later
    return "";
  }

  return {
    // State
    isSearchOpen,
    searchQuery,
    searchOptions,
    matches,
    currentMatchIndex,
    currentMatch,
    matchCount,

    // Methods
    openSearch,
    closeSearch,
    search,
    nextMatch,
    prevMatch,
    replace,
    replaceAll,
    getSelectedText,
  };
}

// Create a singleton instance for global search state
let searchInstance: ReturnType<typeof useSearch> | null = null;

export function useGlobalSearch() {
  if (!searchInstance) {
    searchInstance = useSearch();
  }
  return searchInstance;
}
