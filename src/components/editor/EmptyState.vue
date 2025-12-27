<script setup lang="ts">
import { useFile } from "@/composables/useFile";

const { newFile, openFile } = useFile();

// Detect platform for keyboard shortcuts display
const isMac = navigator.platform.toLowerCase().includes("mac");
const cmdKey = isMac ? "⌘" : "Ctrl";
</script>

<template>
  <div class="empty-state">
    <div class="empty-content">
      <div class="logo">
        <svg width="80" height="80" viewBox="0 0 80 80" fill="none">
          <rect x="10" y="5" width="60" height="70" rx="8" fill="var(--color-bg-secondary)" stroke="var(--color-border)" stroke-width="2"/>
          <path d="M25 25h30M25 35h30M25 45h20" stroke="var(--color-text-secondary)" stroke-width="2" stroke-linecap="round"/>
          <circle cx="60" cy="60" r="15" fill="var(--color-accent)"/>
          <path d="M60 52v16M52 60h16" stroke="white" stroke-width="3" stroke-linecap="round"/>
        </svg>
      </div>

      <h1 class="title">Ourea</h1>
      <p class="subtitle">A simple and elegant Markdown editor</p>

      <div class="actions">
        <button class="action-btn primary" @click="newFile">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
            <path d="M8 2a.5.5 0 0 1 .5.5v5h5a.5.5 0 0 1 0 1h-5v5a.5.5 0 0 1-1 0v-5h-5a.5.5 0 0 1 0-1h5v-5A.5.5 0 0 1 8 2z"/>
          </svg>
          New File
        </button>
        <button class="action-btn" @click="() => openFile()">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
            <path d="M.5 3l.04.87a1.99 1.99 0 0 0-.342 1.311l.637 7A2 2 0 0 0 2.826 14H9v-1H2.826a1 1 0 0 1-.995-.91l-.637-7A1 1 0 0 1 2.19 4h11.62a1 1 0 0 1 .996 1.09L14.54 8h1.005l.256-2.819A2 2 0 0 0 13.81 3H9.828a2 2 0 0 1-1.414-.586l-.828-.828A2 2 0 0 0 6.172 1H2.5a2 2 0 0 0-2 2zm5.672-1a1 1 0 0 1 .707.293L7.586 3H2.19c-.24 0-.47.042-.683.12L1.5 2.98a1 1 0 0 1 1-.98h3.672z"/>
          </svg>
          Open File
        </button>
      </div>

      <div class="shortcuts">
        <h3 class="shortcuts-title">Keyboard Shortcuts</h3>
        <div class="shortcut-list">
          <div class="shortcut-item">
            <span class="shortcut-key">{{ cmdKey }} + N</span>
            <span class="shortcut-desc">New File</span>
          </div>
          <div class="shortcut-item">
            <span class="shortcut-key">{{ cmdKey }} + O</span>
            <span class="shortcut-desc">Open File</span>
          </div>
          <div class="shortcut-item">
            <span class="shortcut-key">{{ cmdKey }} + S</span>
            <span class="shortcut-desc">Save File</span>
          </div>
          <div class="shortcut-item">
            <span class="shortcut-key">{{ cmdKey }} + W</span>
            <span class="shortcut-desc">Close Tab</span>
          </div>
          <div class="shortcut-item">
            <span class="shortcut-key">{{ cmdKey }} + \</span>
            <span class="shortcut-desc">Toggle Sidebar</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.empty-state {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: var(--color-bg-primary);
  padding: 40px;
}

.empty-content {
  text-align: center;
  max-width: 400px;
}

.logo {
  margin-bottom: 24px;
}

.title {
  font-size: 32px;
  font-weight: 700;
  color: var(--color-text-primary);
  margin: 0 0 8px;
}

.subtitle {
  font-size: 14px;
  color: var(--color-text-secondary);
  margin: 0 0 32px;
}

.actions {
  display: flex;
  gap: 12px;
  justify-content: center;
  margin-bottom: 40px;
}

.action-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
  border: 1px solid var(--color-border);
  background: var(--color-bg-secondary);
  color: var(--color-text-primary);
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.15s ease;
}

.action-btn:hover {
  background-color: var(--color-border);
}

.action-btn.primary {
  background-color: var(--color-accent);
  border-color: var(--color-accent);
  color: white;
}

.action-btn.primary:hover {
  opacity: 0.9;
}

.shortcuts {
  text-align: left;
  background-color: var(--color-bg-secondary);
  border-radius: 12px;
  padding: 20px;
}

.shortcuts-title {
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: var(--color-text-secondary);
  margin: 0 0 16px;
}

.shortcut-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.shortcut-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.shortcut-key {
  font-family: "SF Mono", "JetBrains Mono", monospace;
  font-size: 12px;
  background-color: var(--color-bg-primary);
  padding: 4px 8px;
  border-radius: 4px;
  color: var(--color-text-primary);
}

.shortcut-desc {
  font-size: 13px;
  color: var(--color-text-secondary);
}
</style>
