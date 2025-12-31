<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from "vue";
import { useSettingsStore, type ThemeMode } from "@/stores/settings";
import { predefinedThemes, getLightThemes, getDarkThemes, type ThemeDefinition } from "@/utils/themes";

const props = defineProps<{
  visible: boolean;
}>();

const emit = defineEmits<{
  (e: "close"): void;
}>();

const settingsStore = useSettingsStore();

// Active tab
type SettingsTab = "appearance" | "editor" | "files" | "images";
const activeTab = ref<SettingsTab>("appearance");

// Search query
const searchQuery = ref("");

// Tab items with their labels and icons
const tabs = [
  { id: "appearance" as const, label: "Appearance", icon: "palette" },
  { id: "editor" as const, label: "Editor", icon: "edit" },
  { id: "files" as const, label: "Files", icon: "folder" },
  { id: "images" as const, label: "Images", icon: "image" },
];

// Filter tabs based on search query
const filteredTabs = computed(() => {
  if (!searchQuery.value.trim()) return tabs;
  const query = searchQuery.value.toLowerCase();
  return tabs.filter(
    (tab) =>
      tab.label.toLowerCase().includes(query) ||
      getTabSettings(tab.id).some((s) => s.label.toLowerCase().includes(query))
  );
});

// Get settings for a tab (for search filtering)
function getTabSettings(tabId: SettingsTab) {
  switch (tabId) {
    case "appearance":
      return [
        { label: "Theme" },
        { label: "Color Scheme" },
        { label: "Font Size" },
        { label: "Font Family" },
        { label: "Line Height" },
        { label: "Show Line Numbers" },
      ];
    case "editor":
      return [
        { label: "Auto Save" },
        { label: "Auto Save Interval" },
        { label: "Spell Check" },
        { label: "Focus Mode" },
        { label: "Typewriter Mode" },
        { label: "Paragraph Focus" },
      ];
    case "files":
      return [
        { label: "Default Save Location" },
        { label: "File Encoding" },
        { label: "Line Endings" },
      ];
    case "images":
      return [
        { label: "Image Storage Location" },
        { label: "Image Naming Rule" },
        { label: "Assets Folder Name" },
      ];
    default:
      return [];
  }
}

// Theme mode options
const themeModeOptions: { value: ThemeMode; label: string }[] = [
  { value: "light", label: "Light" },
  { value: "dark", label: "Dark" },
  { value: "system", label: "System" },
];

// Get themes grouped by type
const lightThemes = computed(() => getLightThemes());
const darkThemes = computed(() => getDarkThemes());

// Get current theme ID
const currentThemeId = computed(() => settingsStore.currentTheme?.id || "");

// Select a theme
function selectTheme(theme: ThemeDefinition) {
  settingsStore.selectTheme(theme.id);
}

// Font family options
const fontFamilyOptions = [
  { value: "system-ui, -apple-system, sans-serif", label: "System Default" },
  { value: "'Noto Sans SC', sans-serif", label: "Noto Sans SC" },
  { value: "'Source Han Sans SC', sans-serif", label: "Source Han Sans" },
  { value: "Georgia, serif", label: "Georgia" },
  { value: "'Times New Roman', serif", label: "Times New Roman" },
];

// Encoding options
const encodingOptions = [
  { value: "utf-8", label: "UTF-8" },
  { value: "gbk", label: "GBK" },
  { value: "gb2312", label: "GB2312" },
  { value: "big5", label: "Big5" },
];

// Line ending options
const lineEndingOptions = [
  { value: "lf", label: "LF (Unix/macOS)" },
  { value: "crlf", label: "CRLF (Windows)" },
  { value: "auto", label: "Auto Detect" },
];

// Image storage location options
const imageStorageOptions = [
  { value: "relative", label: "Same directory as file" },
  { value: "assets", label: "Assets subfolder" },
  { value: "absolute", label: "Custom absolute path" },
];

// Image naming rule options
const imageNamingOptions = [
  { value: "original", label: "Keep original name" },
  { value: "timestamp", label: "Timestamp (YYYYMMDD_HHmmss)" },
  { value: "uuid", label: "UUID" },
];

// Auto save interval options (in seconds)
const autoSaveIntervalOptions = [
  { value: 10000, label: "10 seconds" },
  { value: 30000, label: "30 seconds" },
  { value: 60000, label: "1 minute" },
  { value: 120000, label: "2 minutes" },
  { value: 300000, label: "5 minutes" },
];

// Local state for editing
const localFontSize = ref(settingsStore.fontSize);
const localLineHeight = ref(settingsStore.lineHeight);
const localAutoSaveInterval = ref(settingsStore.autoSaveInterval);
const localParagraphFocusOpacity = ref(settingsStore.paragraphFocusOpacity);

// Sync local state with store
watch(
  () => props.visible,
  (visible) => {
    if (visible) {
      localFontSize.value = settingsStore.fontSize;
      localLineHeight.value = settingsStore.lineHeight;
      localAutoSaveInterval.value = settingsStore.autoSaveInterval;
      localParagraphFocusOpacity.value = settingsStore.paragraphFocusOpacity;
    }
  }
);

// Update settings
function updateFontSize(size: number) {
  localFontSize.value = size;
  settingsStore.setFontSize(size);
}

function updateLineHeight(height: number) {
  localLineHeight.value = height;
  settingsStore.lineHeight = height;
}

function updateAutoSaveInterval(interval: number) {
  localAutoSaveInterval.value = interval;
  settingsStore.autoSaveInterval = interval;
}

function updateParagraphFocusOpacity(opacity: number) {
  localParagraphFocusOpacity.value = opacity;
  settingsStore.setParagraphFocusOpacity(opacity);
}

// Reset to defaults
function resetToDefaults() {
  settingsStore.setThemeMode("system");
  settingsStore.selectedThemeId = ""; // Reset to auto theme
  settingsStore.setFontSize(16);
  settingsStore.lineHeight = 1.6;
  settingsStore.fontFamily = "system-ui, -apple-system, sans-serif";
  settingsStore.autoSave = true;
  settingsStore.autoSaveInterval = 30000;
  settingsStore.spellCheck = false;
  settingsStore.showLineNumbers = false;
  settingsStore.focusMode = false;
  settingsStore.typewriterMode = false;
  settingsStore.paragraphFocus = false;
  settingsStore.paragraphFocusOpacity = 0.3;
  // Image settings
  settingsStore.imageStorageLocation = "relative";
  settingsStore.imageNamingRule = "timestamp";
  settingsStore.imageAssetsFolder = "assets";

  // Sync local state
  localFontSize.value = 16;
  localLineHeight.value = 1.6;
  localAutoSaveInterval.value = 30000;
  localParagraphFocusOpacity.value = 0.3;
}

// Keyboard handler
function handleKeyDown(event: KeyboardEvent) {
  if (event.key === "Escape") {
    emit("close");
  }
}

onMounted(() => {
  window.addEventListener("keydown", handleKeyDown);
});

onUnmounted(() => {
  window.removeEventListener("keydown", handleKeyDown);
});
</script>

<template>
  <Teleport to="body">
    <div v-if="visible" class="settings-overlay" @click.self="emit('close')">
      <div class="settings-dialog">
        <!-- Header -->
        <div class="settings-header">
          <h2 class="settings-title">Settings</h2>
          <button class="close-btn" @click="emit('close')">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
              <path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708z"/>
            </svg>
          </button>
        </div>

        <!-- Search -->
        <div class="settings-search">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" class="search-icon">
            <path d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001c.03.04.062.078.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1.007 1.007 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0z"/>
          </svg>
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Search settings..."
            class="search-input"
            @keydown.stop
          />
        </div>

        <div class="settings-content">
          <!-- Tabs -->
          <nav class="settings-tabs">
            <button
              v-for="tab in filteredTabs"
              :key="tab.id"
              class="tab-btn"
              :class="{ active: activeTab === tab.id }"
              @click="activeTab = tab.id"
            >
              {{ tab.label }}
            </button>
          </nav>

          <!-- Tab Content -->
          <div class="settings-panel">
            <!-- Appearance Tab -->
            <div v-if="activeTab === 'appearance'" class="settings-section">
              <div class="setting-group">
                <label class="setting-label">Theme Mode</label>
                <div class="setting-control">
                  <select
                    :value="settingsStore.themeMode"
                    class="setting-select"
                    @change="settingsStore.setThemeMode(($event.target as HTMLSelectElement).value as ThemeMode)"
                  >
                    <option v-for="opt in themeModeOptions" :key="opt.value" :value="opt.value">
                      {{ opt.label }}
                    </option>
                  </select>
                </div>
                <p class="setting-description">Choose light, dark, or follow system preference</p>
              </div>

              <div class="setting-divider"></div>

              <h3 class="setting-section-title">Light Themes</h3>
              <div class="theme-gallery">
                <button
                  v-for="theme in lightThemes"
                  :key="theme.id"
                  class="theme-card"
                  :class="{ active: currentThemeId === theme.id }"
                  @click="selectTheme(theme)"
                >
                  <div
                    class="theme-preview"
                    :style="{
                      '--preview-bg': theme.colors.bgPrimary,
                      '--preview-bg-secondary': theme.colors.bgSecondary,
                      '--preview-text': theme.colors.textPrimary,
                      '--preview-accent': theme.colors.accent,
                      '--preview-border': theme.colors.border,
                    }"
                  >
                    <div class="preview-sidebar"></div>
                    <div class="preview-content">
                      <div class="preview-title"></div>
                      <div class="preview-line"></div>
                      <div class="preview-line short"></div>
                    </div>
                  </div>
                  <div class="theme-info">
                    <span class="theme-name">{{ theme.name }}</span>
                    <span v-if="currentThemeId === theme.id" class="theme-active">Active</span>
                  </div>
                </button>
              </div>

              <h3 class="setting-section-title">Dark Themes</h3>
              <div class="theme-gallery">
                <button
                  v-for="theme in darkThemes"
                  :key="theme.id"
                  class="theme-card"
                  :class="{ active: currentThemeId === theme.id }"
                  @click="selectTheme(theme)"
                >
                  <div
                    class="theme-preview"
                    :style="{
                      '--preview-bg': theme.colors.bgPrimary,
                      '--preview-bg-secondary': theme.colors.bgSecondary,
                      '--preview-text': theme.colors.textPrimary,
                      '--preview-accent': theme.colors.accent,
                      '--preview-border': theme.colors.border,
                    }"
                  >
                    <div class="preview-sidebar"></div>
                    <div class="preview-content">
                      <div class="preview-title"></div>
                      <div class="preview-line"></div>
                      <div class="preview-line short"></div>
                    </div>
                  </div>
                  <div class="theme-info">
                    <span class="theme-name">{{ theme.name }}</span>
                    <span v-if="currentThemeId === theme.id" class="theme-active">Active</span>
                  </div>
                </button>
              </div>

              <div class="setting-divider"></div>

              <div class="setting-group">
                <label class="setting-label">Font Size</label>
                <div class="setting-control range-control">
                  <input
                    type="range"
                    :value="localFontSize"
                    min="12"
                    max="24"
                    step="1"
                    class="setting-range"
                    @input="updateFontSize(Number(($event.target as HTMLInputElement).value))"
                  />
                  <span class="range-value">{{ localFontSize }}px</span>
                </div>
              </div>

              <div class="setting-group">
                <label class="setting-label">Font Family</label>
                <div class="setting-control">
                  <select
                    :value="settingsStore.fontFamily"
                    class="setting-select"
                    @change="settingsStore.fontFamily = ($event.target as HTMLSelectElement).value"
                  >
                    <option v-for="opt in fontFamilyOptions" :key="opt.value" :value="opt.value">
                      {{ opt.label }}
                    </option>
                  </select>
                </div>
              </div>

              <div class="setting-group">
                <label class="setting-label">Line Height</label>
                <div class="setting-control range-control">
                  <input
                    type="range"
                    :value="localLineHeight"
                    min="1.2"
                    max="2.0"
                    step="0.1"
                    class="setting-range"
                    @input="updateLineHeight(Number(($event.target as HTMLInputElement).value))"
                  />
                  <span class="range-value">{{ localLineHeight.toFixed(1) }}</span>
                </div>
              </div>

              <div class="setting-group">
                <label class="setting-label">Show Line Numbers</label>
                <div class="setting-control">
                  <label class="toggle">
                    <input
                      type="checkbox"
                      :checked="settingsStore.showLineNumbers"
                      @change="settingsStore.showLineNumbers = ($event.target as HTMLInputElement).checked"
                    />
                    <span class="toggle-slider"></span>
                  </label>
                </div>
              </div>
            </div>

            <!-- Editor Tab -->
            <div v-if="activeTab === 'editor'" class="settings-section">
              <div class="setting-group">
                <label class="setting-label">Auto Save</label>
                <div class="setting-control">
                  <label class="toggle">
                    <input
                      type="checkbox"
                      :checked="settingsStore.autoSave"
                      @change="settingsStore.autoSave = ($event.target as HTMLInputElement).checked"
                    />
                    <span class="toggle-slider"></span>
                  </label>
                </div>
              </div>

              <div v-if="settingsStore.autoSave" class="setting-group">
                <label class="setting-label">Auto Save Interval</label>
                <div class="setting-control">
                  <select
                    :value="localAutoSaveInterval"
                    class="setting-select"
                    @change="updateAutoSaveInterval(Number(($event.target as HTMLSelectElement).value))"
                  >
                    <option v-for="opt in autoSaveIntervalOptions" :key="opt.value" :value="opt.value">
                      {{ opt.label }}
                    </option>
                  </select>
                </div>
              </div>

              <div class="setting-group">
                <label class="setting-label">Spell Check</label>
                <div class="setting-control">
                  <label class="toggle">
                    <input
                      type="checkbox"
                      :checked="settingsStore.spellCheck"
                      @change="settingsStore.spellCheck = ($event.target as HTMLInputElement).checked"
                    />
                    <span class="toggle-slider"></span>
                  </label>
                </div>
              </div>

              <div class="setting-divider"></div>

              <h3 class="setting-section-title">Focus Settings</h3>

              <div class="setting-group">
                <label class="setting-label">Focus Mode</label>
                <div class="setting-control">
                  <label class="toggle">
                    <input
                      type="checkbox"
                      :checked="settingsStore.focusMode"
                      @change="settingsStore.focusMode = ($event.target as HTMLInputElement).checked"
                    />
                    <span class="toggle-slider"></span>
                  </label>
                </div>
                <p class="setting-description">Hide UI elements for distraction-free writing</p>
              </div>

              <div class="setting-group">
                <label class="setting-label">Typewriter Mode</label>
                <div class="setting-control">
                  <label class="toggle">
                    <input
                      type="checkbox"
                      :checked="settingsStore.typewriterMode"
                      @change="settingsStore.typewriterMode = ($event.target as HTMLInputElement).checked"
                    />
                    <span class="toggle-slider"></span>
                  </label>
                </div>
                <p class="setting-description">Keep the cursor line centered vertically</p>
              </div>

              <div class="setting-group">
                <label class="setting-label">Paragraph Focus</label>
                <div class="setting-control">
                  <label class="toggle">
                    <input
                      type="checkbox"
                      :checked="settingsStore.paragraphFocus"
                      @change="settingsStore.paragraphFocus = ($event.target as HTMLInputElement).checked"
                    />
                    <span class="toggle-slider"></span>
                  </label>
                </div>
                <p class="setting-description">Fade non-focused paragraphs</p>
              </div>

              <div v-if="settingsStore.paragraphFocus" class="setting-group">
                <label class="setting-label">Non-focused Opacity</label>
                <div class="setting-control range-control">
                  <input
                    type="range"
                    :value="localParagraphFocusOpacity"
                    min="0.1"
                    max="0.9"
                    step="0.1"
                    class="setting-range"
                    @input="updateParagraphFocusOpacity(Number(($event.target as HTMLInputElement).value))"
                  />
                  <span class="range-value">{{ (localParagraphFocusOpacity * 100).toFixed(0) }}%</span>
                </div>
              </div>
            </div>

            <!-- Files Tab -->
            <div v-if="activeTab === 'files'" class="settings-section">
              <div class="setting-group">
                <label class="setting-label">Default Encoding</label>
                <div class="setting-control">
                  <select class="setting-select" disabled>
                    <option v-for="opt in encodingOptions" :key="opt.value" :value="opt.value">
                      {{ opt.label }}
                    </option>
                  </select>
                </div>
                <p class="setting-description">Currently using UTF-8 (not configurable yet)</p>
              </div>

              <div class="setting-group">
                <label class="setting-label">Line Endings</label>
                <div class="setting-control">
                  <select class="setting-select" disabled>
                    <option v-for="opt in lineEndingOptions" :key="opt.value" :value="opt.value">
                      {{ opt.label }}
                    </option>
                  </select>
                </div>
                <p class="setting-description">Auto-detected based on file content</p>
              </div>
            </div>

            <!-- Images Tab -->
            <div v-if="activeTab === 'images'" class="settings-section">
              <div class="setting-group">
                <label class="setting-label">Image Storage Location</label>
                <div class="setting-control">
                  <select
                    :value="settingsStore.imageStorageLocation"
                    class="setting-select"
                    @change="settingsStore.imageStorageLocation = ($event.target as HTMLSelectElement).value as 'relative' | 'assets' | 'absolute'"
                  >
                    <option v-for="opt in imageStorageOptions" :key="opt.value" :value="opt.value">
                      {{ opt.label }}
                    </option>
                  </select>
                </div>
                <p class="setting-description">Where to save pasted or dragged images</p>
              </div>

              <div v-if="settingsStore.imageStorageLocation === 'assets'" class="setting-group">
                <label class="setting-label">Assets Folder Name</label>
                <div class="setting-control">
                  <input
                    type="text"
                    :value="settingsStore.imageAssetsFolder"
                    class="setting-input"
                    placeholder="assets"
                    @input="settingsStore.imageAssetsFolder = ($event.target as HTMLInputElement).value"
                    @keydown.stop
                  />
                </div>
                <p class="setting-description">Subfolder name for storing images (relative to file)</p>
              </div>

              <div class="setting-group">
                <label class="setting-label">Image Naming Rule</label>
                <div class="setting-control">
                  <select
                    :value="settingsStore.imageNamingRule"
                    class="setting-select"
                    @change="settingsStore.imageNamingRule = ($event.target as HTMLSelectElement).value as 'original' | 'timestamp' | 'uuid'"
                  >
                    <option v-for="opt in imageNamingOptions" :key="opt.value" :value="opt.value">
                      {{ opt.label }}
                    </option>
                  </select>
                </div>
                <p class="setting-description">How to name saved images</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Footer -->
        <div class="settings-footer">
          <button class="btn btn-reset" @click="resetToDefaults">
            Reset to Defaults
          </button>
          <button class="btn btn-close" @click="emit('close')">
            Done
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
.settings-overlay {
  position: fixed;
  inset: 0;
  background-color: rgba(0, 0, 0, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10000;
  backdrop-filter: blur(2px);
}

.settings-dialog {
  background-color: var(--color-bg-primary);
  border-radius: 12px;
  width: 640px;
  max-width: 90vw;
  max-height: 85vh;
  display: flex;
  flex-direction: column;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
}

.settings-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  border-bottom: 1px solid var(--color-border);
}

.settings-title {
  font-size: 16px;
  font-weight: 600;
  color: var(--color-text-primary);
  margin: 0;
}

.close-btn {
  background: none;
  border: none;
  color: var(--color-text-secondary);
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.close-btn:hover {
  background-color: var(--color-bg-secondary);
  color: var(--color-text-primary);
}

.settings-search {
  position: relative;
  padding: 12px 20px;
  border-bottom: 1px solid var(--color-border);
}

.search-icon {
  position: absolute;
  left: 32px;
  top: 50%;
  transform: translateY(-50%);
  color: var(--color-text-secondary);
}

.search-input {
  width: 100%;
  padding: 8px 12px 8px 36px;
  border: 1px solid var(--color-border);
  border-radius: 6px;
  font-size: 13px;
  background-color: var(--color-bg-secondary);
  color: var(--color-text-primary);
  outline: none;
}

.search-input:focus {
  border-color: var(--color-accent);
}

.search-input::placeholder {
  color: var(--color-text-secondary);
  opacity: 0.6;
}

.settings-content {
  display: flex;
  flex: 1;
  overflow: hidden;
}

.settings-tabs {
  width: 140px;
  padding: 12px;
  border-right: 1px solid var(--color-border);
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.tab-btn {
  padding: 8px 12px;
  border: none;
  background: none;
  color: var(--color-text-secondary);
  font-size: 13px;
  text-align: left;
  cursor: pointer;
  border-radius: 6px;
  transition: all 0.15s ease;
}

.tab-btn:hover {
  background-color: var(--color-bg-secondary);
  color: var(--color-text-primary);
}

.tab-btn.active {
  background-color: var(--color-accent);
  color: white;
}

.settings-panel {
  flex: 1;
  padding: 16px 20px;
  overflow-y: auto;
}

.settings-section {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.setting-section-title {
  font-size: 12px;
  font-weight: 600;
  color: var(--color-text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin: 0;
}

.setting-divider {
  height: 1px;
  background-color: var(--color-border);
  margin: 8px 0;
}

.setting-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.setting-label {
  font-size: 13px;
  font-weight: 500;
  color: var(--color-text-primary);
}

.setting-description {
  font-size: 12px;
  color: var(--color-text-secondary);
  margin: 0;
}

.setting-control {
  display: flex;
  align-items: center;
}

.setting-select {
  padding: 8px 12px;
  border: 1px solid var(--color-border);
  border-radius: 6px;
  font-size: 13px;
  background-color: var(--color-bg-secondary);
  color: var(--color-text-primary);
  min-width: 180px;
  cursor: pointer;
}

.setting-select:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.setting-input {
  padding: 8px 12px;
  border: 1px solid var(--color-border);
  border-radius: 6px;
  font-size: 13px;
  background-color: var(--color-bg-secondary);
  color: var(--color-text-primary);
  min-width: 180px;
  outline: none;
}

.setting-input:focus {
  border-color: var(--color-accent);
}

.setting-input::placeholder {
  color: var(--color-text-secondary);
  opacity: 0.6;
}

.range-control {
  gap: 12px;
}

.setting-range {
  flex: 1;
  height: 4px;
  -webkit-appearance: none;
  appearance: none;
  background-color: var(--color-border);
  border-radius: 2px;
  cursor: pointer;
}

.setting-range::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 16px;
  height: 16px;
  background-color: var(--color-accent);
  border-radius: 50%;
  cursor: pointer;
}

.range-value {
  font-size: 12px;
  color: var(--color-text-secondary);
  min-width: 50px;
  text-align: right;
}

/* Toggle Switch */
.toggle {
  position: relative;
  display: inline-block;
  width: 40px;
  height: 22px;
}

.toggle input {
  opacity: 0;
  width: 0;
  height: 0;
}

.toggle-slider {
  position: absolute;
  cursor: pointer;
  inset: 0;
  background-color: var(--color-border);
  border-radius: 22px;
  transition: 0.2s;
}

.toggle-slider::before {
  position: absolute;
  content: "";
  height: 18px;
  width: 18px;
  left: 2px;
  bottom: 2px;
  background-color: white;
  border-radius: 50%;
  transition: 0.2s;
}

.toggle input:checked + .toggle-slider {
  background-color: var(--color-accent);
}

.toggle input:checked + .toggle-slider::before {
  transform: translateX(18px);
}

.settings-footer {
  display: flex;
  justify-content: space-between;
  padding: 16px 20px;
  border-top: 1px solid var(--color-border);
}

.btn {
  padding: 8px 16px;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  border: none;
  transition: all 0.1s ease;
}

.btn:active {
  transform: scale(0.98);
}

.btn-reset {
  background-color: transparent;
  color: var(--color-text-secondary);
  border: 1px solid var(--color-border);
}

.btn-reset:hover {
  background-color: var(--color-bg-secondary);
  color: var(--color-text-primary);
}

.btn-close {
  background-color: var(--color-accent);
  color: white;
}

.btn-close:hover {
  filter: brightness(1.1);
}

/* Theme Gallery */
.theme-gallery {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
  margin-bottom: 16px;
}

.theme-card {
  background: none;
  border: 2px solid var(--color-border);
  border-radius: 8px;
  padding: 8px;
  cursor: pointer;
  transition: all 0.15s ease;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.theme-card:hover {
  border-color: var(--color-accent);
}

.theme-card.active {
  border-color: var(--color-accent);
  background-color: var(--color-bg-secondary);
}

.theme-preview {
  height: 60px;
  border-radius: 4px;
  display: flex;
  overflow: hidden;
  background-color: var(--preview-bg);
  border: 1px solid var(--preview-border);
}

.preview-sidebar {
  width: 20%;
  background-color: var(--preview-bg-secondary);
  border-right: 1px solid var(--preview-border);
}

.preview-content {
  flex: 1;
  padding: 8px;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.preview-title {
  height: 8px;
  width: 60%;
  background-color: var(--preview-text);
  border-radius: 2px;
  opacity: 0.8;
}

.preview-line {
  height: 4px;
  width: 100%;
  background-color: var(--preview-text);
  border-radius: 2px;
  opacity: 0.3;
}

.preview-line.short {
  width: 70%;
}

.theme-info {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 4px;
}

.theme-name {
  font-size: 12px;
  font-weight: 500;
  color: var(--color-text-primary);
}

.theme-active {
  font-size: 10px;
  color: var(--color-accent);
  background-color: rgba(59, 130, 246, 0.1);
  padding: 2px 6px;
  border-radius: 4px;
  font-weight: 500;
}
</style>
