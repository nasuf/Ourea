<script setup lang="ts">
import { onMounted, ref } from "vue";
import MainLayout from "./components/layout/MainLayout.vue";
import CloseConfirmDialog from "./components/dialogs/CloseConfirmDialog.vue";
import { useShortcuts } from "./composables/useShortcuts";
import { useAutoSave } from "./composables/useAutoSave";
import { useCloseConfirm } from "./composables/useCloseConfirm";
import { useRecovery } from "./composables/useRecovery";
import { useMenuEvents } from "./composables/useMenuEvents";
import { useSettingsStore } from "./stores/settings";

// Initialize shortcuts
useShortcuts();

// Initialize auto-save
useAutoSave();

// Initialize menu event handlers
useMenuEvents();

// Initialize settings
const settingsStore = useSettingsStore();

// Initialize close confirm dialog
const { isOpen, dialogState, handleResult } = useCloseConfirm();

// Initialize recovery
const {
  hasRecoveryData,
  checkRecoveryData,
  recoverTabs,
  clearRecoveryData,
  startAutoRecovery,
} = useRecovery();

const showRecoveryDialog = ref(false);

onMounted(async () => {
  settingsStore.init();

  // Check for recovery data
  const hasData = await checkRecoveryData();
  if (hasData) {
    showRecoveryDialog.value = true;
  } else {
    // Start auto-recovery if no data to recover
    startAutoRecovery();
  }
});

async function handleRecovery() {
  await recoverTabs();
  showRecoveryDialog.value = false;
  startAutoRecovery();
}

async function handleDiscardRecovery() {
  await clearRecoveryData();
  showRecoveryDialog.value = false;
  startAutoRecovery();
}
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

  <!-- Recovery dialog -->
  <Teleport to="body">
    <div v-if="showRecoveryDialog" class="recovery-dialog-overlay">
      <div class="recovery-dialog">
        <div class="recovery-icon">
          <svg width="48" height="48" viewBox="0 0 16 16" fill="currentColor">
            <path d="M11.534 7h3.932a.25.25 0 0 1 .192.41l-1.966 2.36a.25.25 0 0 1-.384 0l-1.966-2.36a.25.25 0 0 1 .192-.41zm-11 2h3.932a.25.25 0 0 0 .192-.41L2.692 6.23a.25.25 0 0 0-.384 0L.342 8.59A.25.25 0 0 0 .534 9z"/>
            <path fill-rule="evenodd" d="M8 3c-1.552 0-2.94.707-3.857 1.818a.5.5 0 1 1-.771-.636A6.002 6.002 0 0 1 13.917 7H12.9A5.002 5.002 0 0 0 8 3zM3.1 9a5.002 5.002 0 0 0 8.757 2.182.5.5 0 1 1 .771.636A6.002 6.002 0 0 1 2.083 9H3.1z"/>
          </svg>
        </div>
        <h2>Recover Unsaved Work?</h2>
        <p>We found unsaved changes from a previous session. Would you like to recover them?</p>
        <div class="recovery-actions">
          <button class="recovery-btn secondary" @click="handleDiscardRecovery">
            Discard
          </button>
          <button class="recovery-btn primary" @click="handleRecovery">
            Recover
          </button>
        </div>
      </div>
    </div>
  </Teleport>
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

/* Recovery dialog */
.recovery-dialog-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10000;
}

.recovery-dialog {
  background-color: var(--color-bg-primary);
  border-radius: 16px;
  padding: 32px;
  max-width: 400px;
  text-align: center;
  box-shadow: 0 16px 48px rgba(0, 0, 0, 0.3);
}

.recovery-icon {
  color: var(--color-accent);
  margin-bottom: 16px;
}

.recovery-dialog h2 {
  font-size: 20px;
  font-weight: 600;
  color: var(--color-text-primary);
  margin-bottom: 8px;
}

.recovery-dialog p {
  font-size: 14px;
  color: var(--color-text-secondary);
  margin-bottom: 24px;
  line-height: 1.5;
}

.recovery-actions {
  display: flex;
  gap: 12px;
  justify-content: center;
}

.recovery-btn {
  padding: 10px 24px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.15s ease;
}

.recovery-btn.primary {
  background-color: var(--color-accent);
  border: none;
  color: white;
}

.recovery-btn.primary:hover {
  filter: brightness(1.1);
}

.recovery-btn.secondary {
  background: none;
  border: 1px solid var(--color-border);
  color: var(--color-text-secondary);
}

.recovery-btn.secondary:hover {
  background-color: var(--color-bg-secondary);
  color: var(--color-text-primary);
}
</style>
