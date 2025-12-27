import { defineStore } from "pinia";
import { ref, computed } from "vue";

export interface CursorPosition {
  line: number;
  column: number;
}

export const useEditorStore = defineStore("editor", () => {
  // State
  const content = ref("");
  const isDirty = ref(false);
  const cursorPosition = ref<CursorPosition>({ line: 1, column: 1 });
  const pendingContent = ref<string | null>(null);

  // Getters
  const wordCount = computed(() => {
    if (!content.value.trim()) return 0;
    // Count Chinese characters and English words
    const chineseChars = (content.value.match(/[\u4e00-\u9fa5]/g) || []).length;
    const englishWords = content.value
      .replace(/[\u4e00-\u9fa5]/g, " ")
      .split(/\s+/)
      .filter((word) => word.length > 0).length;
    return chineseChars + englishWords;
  });

  const charCount = computed(() => {
    return content.value.length;
  });

  // Actions
  function setContent(newContent: string) {
    content.value = newContent;
    isDirty.value = true;
  }

  function setPendingContent(newContent: string) {
    pendingContent.value = newContent;
  }

  function clearPendingContent() {
    pendingContent.value = null;
  }

  function setCursorPosition(line: number, column: number) {
    cursorPosition.value = { line, column };
  }

  function markAsSaved() {
    isDirty.value = false;
  }

  function reset() {
    content.value = "";
    isDirty.value = false;
    cursorPosition.value = { line: 1, column: 1 };
    pendingContent.value = null;
  }

  return {
    // State
    content,
    isDirty,
    cursorPosition,
    pendingContent,
    // Getters
    wordCount,
    charCount,
    // Actions
    setContent,
    setPendingContent,
    clearPendingContent,
    setCursorPosition,
    markAsSaved,
    reset,
  };
});
