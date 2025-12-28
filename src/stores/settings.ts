import { defineStore } from "pinia";
import { ref } from "vue";

export type Theme = "light" | "dark" | "system";

export const useSettingsStore = defineStore("settings", () => {
  // State
  const theme = ref<Theme>("system");
  const fontSize = ref(16);
  const fontFamily = ref("system-ui, -apple-system, sans-serif");
  const lineHeight = ref(1.6);
  const autoSave = ref(true);
  const autoSaveInterval = ref(30000); // 30 seconds
  const spellCheck = ref(false);
  const showLineNumbers = ref(false);

  // UI State
  const sidebarVisible = ref(true);
  const sidebarWidth = ref(250);
  const focusMode = ref(false);
  const typewriterMode = ref(false);
  const paragraphFocus = ref(false);
  const paragraphFocusOpacity = ref(0.3); // Opacity of non-focused paragraphs
  const settingsDialogVisible = ref(false);

  // Actions
  function setTheme(newTheme: Theme) {
    theme.value = newTheme;
    applyTheme(newTheme);
  }

  function applyTheme(themeValue: Theme) {
    const root = document.documentElement;
    const isDark =
      themeValue === "dark" ||
      (themeValue === "system" &&
        window.matchMedia("(prefers-color-scheme: dark)").matches);

    root.classList.toggle("dark", isDark);
  }

  function setFontSize(size: number) {
    fontSize.value = Math.min(Math.max(size, 12), 24);
  }

  function toggleSidebar() {
    sidebarVisible.value = !sidebarVisible.value;
  }

  function toggleFocusMode() {
    focusMode.value = !focusMode.value;
    if (focusMode.value) {
      sidebarVisible.value = false;
    }
  }

  function toggleTypewriterMode() {
    typewriterMode.value = !typewriterMode.value;
  }

  function toggleParagraphFocus() {
    paragraphFocus.value = !paragraphFocus.value;
  }

  function setParagraphFocusOpacity(opacity: number) {
    paragraphFocusOpacity.value = Math.min(Math.max(opacity, 0.1), 0.9);
  }

  // Exit focus mode
  function exitFocusMode() {
    focusMode.value = false;
  }

  // Settings dialog
  function openSettingsDialog() {
    settingsDialogVisible.value = true;
  }

  function closeSettingsDialog() {
    settingsDialogVisible.value = false;
  }

  // Initialize theme on store creation
  function init() {
    applyTheme(theme.value);

    // Listen for system theme changes
    window
      .matchMedia("(prefers-color-scheme: dark)")
      .addEventListener("change", () => {
        if (theme.value === "system") {
          applyTheme("system");
        }
      });
  }

  return {
    // State
    theme,
    fontSize,
    fontFamily,
    lineHeight,
    autoSave,
    autoSaveInterval,
    spellCheck,
    showLineNumbers,
    sidebarVisible,
    sidebarWidth,
    focusMode,
    typewriterMode,
    paragraphFocus,
    paragraphFocusOpacity,
    settingsDialogVisible,
    // Actions
    setTheme,
    setFontSize,
    toggleSidebar,
    toggleFocusMode,
    toggleTypewriterMode,
    toggleParagraphFocus,
    setParagraphFocusOpacity,
    exitFocusMode,
    openSettingsDialog,
    closeSettingsDialog,
    init,
  };
});
