<script setup lang="ts">
import { onMounted } from "vue";
import MainLayout from "./components/layout/MainLayout.vue";
import CloseConfirmDialog from "./components/dialogs/CloseConfirmDialog.vue";
import { useShortcuts } from "./composables/useShortcuts";
import { useAutoSave } from "./composables/useAutoSave";
import { useCloseConfirm } from "./composables/useCloseConfirm";
import { useSettingsStore } from "./stores/settings";

// Initialize shortcuts
useShortcuts();

// Initialize auto-save
useAutoSave();

// Initialize settings
const settingsStore = useSettingsStore();

// Initialize close confirm dialog
const { isOpen, dialogState, handleResult } = useCloseConfirm();

onMounted(() => {
  settingsStore.init();
});
</script>

<template>
  <MainLayout />

  <!-- Global close confirm dialog -->
  <CloseConfirmDialog
    v-if="isOpen && dialogState"
    :file-name="dialogState.fileName"
    @save="handleResult('save')"
    @dont-save="handleResult('dont-save')"
    @cancel="handleResult('cancel')"
  />
</template>

<style>
:root {
  /* Light theme (default) */
  --color-bg-primary: #ffffff;
  --color-bg-secondary: #f5f5f5;
  --color-text-primary: #1a1a1a;
  --color-text-secondary: #666666;
  --color-border: #e5e5e5;
  --color-accent: #3b82f6;
  --color-warning: #f59e0b;
  --color-danger: #ef4444;

  --font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI",
    Roboto, sans-serif;
  --font-size: 16px;
  --line-height: 1.6;

  font-family: var(--font-family);
  font-size: var(--font-size);
  line-height: var(--line-height);
  font-weight: 400;

  color: var(--color-text-primary);
  background-color: var(--color-bg-primary);

  font-synthesis: none;
  text-rendering: optimizeLegibility;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  -webkit-text-size-adjust: 100%;
}

/* Dark theme */
.dark {
  --color-bg-primary: #1a1a1a;
  --color-bg-secondary: #2d2d2d;
  --color-text-primary: #f5f5f5;
  --color-text-secondary: #a3a3a3;
  --color-border: #404040;
  --color-accent: #60a5fa;
  --color-warning: #fbbf24;
  --color-danger: #f87171;
}

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

/* Remove all default borders from semantic elements */
aside, main, section, article, nav, header, footer {
  border: none;
  outline: none;
  box-shadow: none;
}

html,
body,
#app {
  height: 100%;
  width: 100%;
  overflow: hidden;
}

/* Scrollbar styling - completely transparent track, no borders */
::-webkit-scrollbar {
  width: 8px;
  height: 8px;
  background: transparent !important;
  border: none !important;
  box-shadow: none !important;
}

::-webkit-scrollbar-track {
  background: transparent !important;
  border: none !important;
  box-shadow: none !important;
}

::-webkit-scrollbar-track-piece {
  background: transparent !important;
  border: none !important;
}

::-webkit-scrollbar-thumb {
  background-color: rgba(128, 128, 128, 0.3);
  border-radius: 4px;
  border: none !important;
}

::-webkit-scrollbar-thumb:hover {
  background-color: rgba(128, 128, 128, 0.5);
}

::-webkit-scrollbar-corner {
  background: transparent !important;
  border: none !important;
}

::-webkit-scrollbar-button {
  display: none;
}

/* Selection */
::selection {
  background-color: var(--color-accent);
  color: white;
}

/* Focus outline */
:focus-visible {
  outline: 2px solid var(--color-accent);
  outline-offset: 2px;
}

/* Transition for theme changes */
body {
  transition: background-color 0.2s ease, color 0.2s ease;
}
</style>
