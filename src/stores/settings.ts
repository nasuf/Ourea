import { defineStore } from "pinia";
import { ref, watch } from "vue";
import {
  predefinedThemes,
  getThemeById,
  getDefaultTheme,
  applyTheme,
  type ThemeDefinition,
} from "@/utils/themes";

export type ThemeMode = "light" | "dark" | "system";

export const useSettingsStore = defineStore("settings", () => {
  // State
  const themeMode = ref<ThemeMode>("system");
  const selectedThemeId = ref<string>(""); // Empty means auto-select based on mode
  const currentTheme = ref<ThemeDefinition | null>(null);
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
  function setThemeMode(newMode: ThemeMode) {
    themeMode.value = newMode;
    updateCurrentTheme();
  }

  function setTheme(newTheme: ThemeMode) {
    // Backward compatibility
    setThemeMode(newTheme);
  }

  function selectTheme(themeId: string) {
    selectedThemeId.value = themeId;
    updateCurrentTheme();
  }

  function updateCurrentTheme() {
    let theme: ThemeDefinition | undefined;

    if (selectedThemeId.value) {
      // User has explicitly selected a theme
      theme = getThemeById(selectedThemeId.value);
    }

    if (!theme) {
      // Auto-select based on mode
      const prefersDark =
        themeMode.value === "dark" ||
        (themeMode.value === "system" &&
          window.matchMedia("(prefers-color-scheme: dark)").matches);
      theme = getDefaultTheme(prefersDark);
    }

    if (theme) {
      currentTheme.value = theme;
      applyTheme(theme);
    }
  }

  // Get available themes based on current mode preference
  function getAvailableThemes(): ThemeDefinition[] {
    return predefinedThemes;
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
    updateCurrentTheme();

    // Listen for system theme changes
    window
      .matchMedia("(prefers-color-scheme: dark)")
      .addEventListener("change", () => {
        if (themeMode.value === "system") {
          updateCurrentTheme();
        }
      });
  }

  return {
    // State
    themeMode,
    selectedThemeId,
    currentTheme,
    // Backward compatibility
    get theme() {
      return themeMode.value;
    },
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
    setThemeMode,
    selectTheme,
    getAvailableThemes,
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
