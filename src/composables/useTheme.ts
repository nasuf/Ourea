import { ref, watch, onMounted } from "vue";
import { useSettingsStore } from "@/stores/settings";

export type ThemeMode = "light" | "dark" | "system";

export function useTheme() {
  const settingsStore = useSettingsStore();
  const isDark = ref(false);

  // Get system preference
  function getSystemTheme(): "light" | "dark" {
    if (typeof window !== "undefined" && window.matchMedia) {
      return window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light";
    }
    return "light";
  }

  // Apply theme to document
  function applyTheme(dark: boolean) {
    isDark.value = dark;
    if (typeof document !== "undefined") {
      document.documentElement.classList.toggle("dark", dark);
    }
  }

  // Update theme based on mode
  function updateTheme() {
    const mode = settingsStore.theme;
    if (mode === "system") {
      applyTheme(getSystemTheme() === "dark");
    } else {
      applyTheme(mode === "dark");
    }
  }

  // Set theme mode
  function setTheme(mode: ThemeMode) {
    settingsStore.setTheme(mode);
    updateTheme();
  }

  // Toggle between light and dark
  function toggleTheme() {
    if (settingsStore.theme === "system") {
      // If system, switch to opposite of current
      setTheme(isDark.value ? "light" : "dark");
    } else {
      setTheme(settingsStore.theme === "dark" ? "light" : "dark");
    }
  }

  // Simple toggle between light and dark
  function cycleTheme() {
    // Toggle based on current appearance, not mode
    setTheme(isDark.value ? "light" : "dark");
  }

  // Initialize
  onMounted(() => {
    updateTheme();

    // Listen for system theme changes
    if (typeof window !== "undefined" && window.matchMedia) {
      const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
      const handler = () => {
        if (settingsStore.theme === "system") {
          updateTheme();
        }
      };
      mediaQuery.addEventListener("change", handler);
    }
  });

  // Watch for settings changes
  watch(() => settingsStore.theme, updateTheme);

  return {
    isDark,
    theme: settingsStore.theme,
    setTheme,
    toggleTheme,
    cycleTheme,
  };
}
