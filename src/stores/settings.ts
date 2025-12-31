import { defineStore } from "pinia";
import { ref, watch } from "vue";
import { invoke } from "@tauri-apps/api/core";
import {
  predefinedThemes,
  getThemeById,
  getDefaultTheme,
  applyTheme,
  type ThemeDefinition,
} from "@/utils/themes";

export type ThemeMode = "light" | "dark" | "system";

// Settings interface for persistence
interface AppSettings {
  themeMode: string;
  selectedThemeId: string;
  fontSize: number;
  fontFamily: string;
  lineHeight: number;
  autoSave: boolean;
  autoSaveInterval: number;
  spellCheck: boolean;
  showLineNumbers: boolean;
  sidebarVisible: boolean;
  sidebarWidth: number;
  outlineVisible: boolean;
  outlineWidth: number;
  focusMode: boolean;
  typewriterMode: boolean;
  paragraphFocus: boolean;
  paragraphFocusOpacity: number;
  imageStorageLocation: string;
  imageNamingRule: string;
  imageAssetsFolder: string;
}

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
  const outlineVisible = ref(true);
  const outlineWidth = ref(200);
  const focusMode = ref(false);
  const typewriterMode = ref(false);
  const paragraphFocus = ref(false);
  const paragraphFocusOpacity = ref(0.3); // Opacity of non-focused paragraphs
  const settingsDialogVisible = ref(false);

  // Image settings
  const imageStorageLocation = ref<"relative" | "assets" | "absolute">("relative");
  const imageNamingRule = ref<"original" | "timestamp" | "uuid">("timestamp");
  const imageAssetsFolder = ref("assets");

  // Loading state
  const isLoading = ref(true);
  let saveTimeout: ReturnType<typeof setTimeout> | null = null;

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

  function toggleOutline() {
    outlineVisible.value = !outlineVisible.value;
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

  // Save settings to file (debounced)
  function saveSettings() {
    // Debounce saves to avoid too many writes
    if (saveTimeout) {
      clearTimeout(saveTimeout);
    }
    saveTimeout = setTimeout(async () => {
      try {
        const settings: AppSettings = {
          themeMode: themeMode.value,
          selectedThemeId: selectedThemeId.value,
          fontSize: fontSize.value,
          fontFamily: fontFamily.value,
          lineHeight: lineHeight.value,
          autoSave: autoSave.value,
          autoSaveInterval: autoSaveInterval.value,
          spellCheck: spellCheck.value,
          showLineNumbers: showLineNumbers.value,
          sidebarVisible: sidebarVisible.value,
          sidebarWidth: sidebarWidth.value,
          outlineVisible: outlineVisible.value,
          outlineWidth: outlineWidth.value,
          focusMode: focusMode.value,
          typewriterMode: typewriterMode.value,
          paragraphFocus: paragraphFocus.value,
          paragraphFocusOpacity: paragraphFocusOpacity.value,
          imageStorageLocation: imageStorageLocation.value,
          imageNamingRule: imageNamingRule.value,
          imageAssetsFolder: imageAssetsFolder.value,
        };
        await invoke("save_settings", { settings });
      } catch (error) {
        console.error("Failed to save settings:", error);
      }
    }, 500);
  }

  // Load settings from file
  async function loadSettings() {
    try {
      isLoading.value = true;
      const settings = await invoke<AppSettings>("load_settings");

      // Apply loaded settings
      themeMode.value = settings.themeMode as ThemeMode;
      selectedThemeId.value = settings.selectedThemeId;
      fontSize.value = settings.fontSize;
      fontFamily.value = settings.fontFamily;
      lineHeight.value = settings.lineHeight;
      autoSave.value = settings.autoSave;
      autoSaveInterval.value = settings.autoSaveInterval;
      spellCheck.value = settings.spellCheck;
      showLineNumbers.value = settings.showLineNumbers;
      sidebarVisible.value = settings.sidebarVisible;
      sidebarWidth.value = settings.sidebarWidth;
      outlineVisible.value = settings.outlineVisible;
      outlineWidth.value = settings.outlineWidth;
      focusMode.value = settings.focusMode;
      typewriterMode.value = settings.typewriterMode;
      paragraphFocus.value = settings.paragraphFocus;
      paragraphFocusOpacity.value = settings.paragraphFocusOpacity;
      imageStorageLocation.value = settings.imageStorageLocation as "relative" | "assets" | "absolute";
      imageNamingRule.value = settings.imageNamingRule as "original" | "timestamp" | "uuid";
      imageAssetsFolder.value = settings.imageAssetsFolder;
    } catch (error) {
      console.error("Failed to load settings:", error);
    } finally {
      isLoading.value = false;
    }
  }

  // Setup watchers for auto-save
  function setupAutoSave() {
    // Watch all settings and save on change
    watch(
      [
        themeMode,
        selectedThemeId,
        fontSize,
        fontFamily,
        lineHeight,
        autoSave,
        autoSaveInterval,
        spellCheck,
        showLineNumbers,
        sidebarVisible,
        sidebarWidth,
        outlineVisible,
        outlineWidth,
        focusMode,
        typewriterMode,
        paragraphFocus,
        paragraphFocusOpacity,
        imageStorageLocation,
        imageNamingRule,
        imageAssetsFolder,
      ],
      () => {
        if (!isLoading.value) {
          saveSettings();
        }
      }
    );
  }

  // Initialize theme on store creation
  async function init() {
    // Load settings from file
    await loadSettings();

    // Apply theme after loading
    updateCurrentTheme();

    // Setup auto-save watchers
    setupAutoSave();

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
    outlineVisible,
    outlineWidth,
    focusMode,
    typewriterMode,
    paragraphFocus,
    paragraphFocusOpacity,
    settingsDialogVisible,
    // Image settings
    imageStorageLocation,
    imageNamingRule,
    imageAssetsFolder,
    // Actions
    setTheme,
    setThemeMode,
    selectTheme,
    getAvailableThemes,
    setFontSize,
    toggleSidebar,
    toggleOutline,
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
