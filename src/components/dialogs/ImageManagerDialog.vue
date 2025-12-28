<script setup lang="ts">
import { ref, computed, watch, onMounted } from "vue";
import { useTabsStore } from "@/stores/tabs";
import { invoke } from "@tauri-apps/api/core";
import { open, save } from "@tauri-apps/plugin-dialog";

const props = defineProps<{
  visible: boolean;
}>();

const emit = defineEmits<{
  (e: "close"): void;
  (e: "replace-image", oldSrc: string, newSrc: string): void;
}>();

interface ImageInfo {
  src: string;
  alt: string;
  isLocal: boolean;
  exists: boolean;
  fileName: string;
}

const tabsStore = useTabsStore();
const images = ref<ImageInfo[]>([]);
const loading = ref(false);
const selectedImage = ref<ImageInfo | null>(null);

// Extract images from markdown content
async function extractImages() {
  loading.value = true;
  const content = tabsStore.activeTab?.content || "";

  // Match markdown images: ![alt](src)
  const imageRegex = /!\[([^\]]*)\]\(([^)]+)\)/g;
  const foundImages: ImageInfo[] = [];
  let match;

  while ((match = imageRegex.exec(content)) !== null) {
    const alt = match[1];
    const src = match[2];
    const isLocal = !src.startsWith("http://") && !src.startsWith("https://");
    const fileName = src.split("/").pop() || src;

    let exists = true;
    if (isLocal) {
      try {
        exists = await invoke<boolean>("file_exists", { path: src });
      } catch {
        exists = false;
      }
    }

    foundImages.push({
      src,
      alt,
      isLocal,
      exists,
      fileName,
    });
  }

  images.value = foundImages;
  loading.value = false;
}

// Replace image in content
function replaceImageInContent(oldSrc: string, newSrc: string, newAlt?: string) {
  const content = tabsStore.activeTab?.content || "";
  const escapedOldSrc = oldSrc.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const regex = new RegExp(`!\\[([^\\]]*)\\]\\(${escapedOldSrc}\\)`, "g");

  const newContent = content.replace(regex, (match, alt) => {
    const finalAlt = newAlt !== undefined ? newAlt : alt;
    return `![${finalAlt}](${newSrc})`;
  });

  tabsStore.updateActiveTabContent(newContent);
  emit("replace-image", oldSrc, newSrc);
}

// Delete image reference from content
function deleteImage(image: ImageInfo) {
  const content = tabsStore.activeTab?.content || "";
  const escapedSrc = image.src.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const regex = new RegExp(`!\\[[^\\]]*\\]\\(${escapedSrc}\\)\\s*`, "g");

  const newContent = content.replace(regex, "");
  tabsStore.updateActiveTabContent(newContent);
  extractImages();
}

// Replace image with new file
async function replaceImageFile(image: ImageInfo) {
  try {
    const selected = await open({
      multiple: false,
      filters: [
        {
          name: "Images",
          extensions: ["png", "jpg", "jpeg", "gif", "svg", "webp"],
        },
      ],
    });

    if (selected) {
      const newPath = selected as string;
      replaceImageInContent(image.src, newPath);
      extractImages();
    }
  } catch (e) {
    console.error("Failed to select image:", e);
  }
}

// Update alt text
function updateAltText(image: ImageInfo, newAlt: string) {
  replaceImageInContent(image.src, image.src, newAlt);
  extractImages();
}

// Copy image path to clipboard
async function copyPath(image: ImageInfo) {
  try {
    await navigator.clipboard.writeText(image.src);
  } catch (e) {
    console.error("Failed to copy:", e);
  }
}

// Open image in system viewer
async function openInViewer(image: ImageInfo) {
  if (image.isLocal) {
    try {
      await invoke("open_in_system", { path: image.src });
    } catch (e) {
      console.error("Failed to open image:", e);
    }
  } else {
    window.open(image.src, "_blank");
  }
}

watch(() => props.visible, (visible) => {
  if (visible) {
    extractImages();
    selectedImage.value = null;
  }
});

const localImages = computed(() => images.value.filter((img) => img.isLocal));
const remoteImages = computed(() => images.value.filter((img) => !img.isLocal));
const missingImages = computed(() => images.value.filter((img) => img.isLocal && !img.exists));
</script>

<template>
  <Teleport to="body">
    <div v-if="visible" class="image-manager-overlay" @click.self="emit('close')">
      <div class="image-manager-dialog">
        <div class="manager-header">
          <h3>Image Manager</h3>
          <div class="header-stats">
            <span class="stat">{{ images.length }} images</span>
            <span v-if="missingImages.length" class="stat missing">
              {{ missingImages.length }} missing
            </span>
          </div>
          <button class="close-btn" @click="emit('close')">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
              <path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708z"/>
            </svg>
          </button>
        </div>

        <div class="manager-body">
          <div v-if="loading" class="loading-state">
            <div class="loading-spinner"></div>
            <span>Scanning images...</span>
          </div>

          <div v-else-if="images.length === 0" class="empty-state">
            <svg width="48" height="48" viewBox="0 0 16 16" fill="currentColor" opacity="0.3">
              <path d="M6.002 5.5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0z"/>
              <path d="M2.002 1a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V3a2 2 0 0 0-2-2h-12zm12 1a1 1 0 0 1 1 1v6.5l-3.777-1.947a.5.5 0 0 0-.577.093l-3.71 3.71-2.66-1.772a.5.5 0 0 0-.63.062L1.002 12V3a1 1 0 0 1 1-1h12z"/>
            </svg>
            <span>No images in this document</span>
          </div>

          <template v-else>
            <!-- Missing Images Warning -->
            <div v-if="missingImages.length" class="section missing-section">
              <h4 class="section-title">
                <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
                  <path d="M8.982 1.566a1.13 1.13 0 0 0-1.96 0L.165 13.233c-.457.778.091 1.767.98 1.767h13.713c.889 0 1.438-.99.98-1.767L8.982 1.566zM8 5c.535 0 .954.462.9.995l-.35 3.507a.552.552 0 0 1-1.1 0L7.1 5.995A.905.905 0 0 1 8 5zm.002 6a1 1 0 1 1 0 2 1 1 0 0 1 0-2z"/>
                </svg>
                Missing Images
              </h4>
              <div class="image-list">
                <div
                  v-for="img in missingImages"
                  :key="img.src"
                  class="image-item missing"
                >
                  <div class="image-preview missing-preview">
                    <svg width="24" height="24" viewBox="0 0 16 16" fill="currentColor">
                      <path d="M6.002 5.5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0z"/>
                      <path d="M1.5 2A1.5 1.5 0 0 0 0 3.5v9A1.5 1.5 0 0 0 1.5 14h13a1.5 1.5 0 0 0 1.5-1.5v-9A1.5 1.5 0 0 0 14.5 2h-13zm13 1a.5.5 0 0 1 .5.5v6l-3.775-1.947a.5.5 0 0 0-.577.093l-3.71 3.71-2.66-1.772a.5.5 0 0 0-.63.062L1.002 12v.54A.505.505 0 0 1 1 12.5v-9a.5.5 0 0 1 .5-.5h13z"/>
                    </svg>
                  </div>
                  <div class="image-info">
                    <span class="image-name">{{ img.fileName }}</span>
                    <span class="image-path">{{ img.src }}</span>
                  </div>
                  <div class="image-actions">
                    <button class="action-btn" title="Replace" @click="replaceImageFile(img)">
                      <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
                        <path d="M12.854.146a.5.5 0 0 0-.707 0L10.5 1.793 14.207 5.5l1.647-1.646a.5.5 0 0 0 0-.708l-3-3zm.646 6.061L9.793 2.5 3.293 9H3.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.207l6.5-6.5zm-7.468 7.468A.5.5 0 0 1 6 13.5V13h-.5a.5.5 0 0 1-.5-.5V12h-.5a.5.5 0 0 1-.5-.5V11h-.5a.5.5 0 0 1-.5-.5V10h-.5a.499.499 0 0 1-.175-.032l-.179.178a.5.5 0 0 0-.11.168l-2 5a.5.5 0 0 0 .65.65l5-2a.5.5 0 0 0 .168-.11l.178-.178z"/>
                      </svg>
                    </button>
                    <button class="action-btn danger" title="Remove" @click="deleteImage(img)">
                      <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
                        <path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0V6z"/>
                        <path fill-rule="evenodd" d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1v1zM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4H4.118zM2.5 3V2h11v1h-11z"/>
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <!-- Local Images -->
            <div v-if="localImages.filter(i => i.exists).length" class="section">
              <h4 class="section-title">Local Images</h4>
              <div class="image-list">
                <div
                  v-for="img in localImages.filter(i => i.exists)"
                  :key="img.src"
                  class="image-item"
                  @click="selectedImage = img"
                >
                  <div class="image-preview">
                    <img :src="img.src" :alt="img.alt" />
                  </div>
                  <div class="image-info">
                    <span class="image-name">{{ img.fileName }}</span>
                    <span class="image-alt" v-if="img.alt">{{ img.alt }}</span>
                  </div>
                  <div class="image-actions">
                    <button class="action-btn" title="Copy path" @click.stop="copyPath(img)">
                      <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
                        <path d="M4 1.5H3a2 2 0 0 0-2 2V14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V3.5a2 2 0 0 0-2-2h-1v1h1a1 1 0 0 1 1 1V14a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V3.5a1 1 0 0 1 1-1h1v-1z"/>
                        <path d="M9.5 1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-3a.5.5 0 0 1-.5-.5v-1a.5.5 0 0 1 .5-.5h3zm-3-1A1.5 1.5 0 0 0 5 1.5v1A1.5 1.5 0 0 0 6.5 4h3A1.5 1.5 0 0 0 11 2.5v-1A1.5 1.5 0 0 0 9.5 0h-3z"/>
                      </svg>
                    </button>
                    <button class="action-btn" title="Open" @click.stop="openInViewer(img)">
                      <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
                        <path d="M8.636 3.5a.5.5 0 0 0-.5-.5H1.5A1.5 1.5 0 0 0 0 4.5v10A1.5 1.5 0 0 0 1.5 16h10a1.5 1.5 0 0 0 1.5-1.5V7.864a.5.5 0 0 0-1 0V14.5a.5.5 0 0 1-.5.5h-10a.5.5 0 0 1-.5-.5v-10a.5.5 0 0 1 .5-.5h6.636a.5.5 0 0 0 .5-.5z"/>
                        <path d="M16 .5a.5.5 0 0 0-.5-.5h-5a.5.5 0 0 0 0 1h3.793L6.146 9.146a.5.5 0 1 0 .708.708L15 1.707V5.5a.5.5 0 0 0 1 0v-5z"/>
                      </svg>
                    </button>
                    <button class="action-btn" title="Replace" @click.stop="replaceImageFile(img)">
                      <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
                        <path d="M12.854.146a.5.5 0 0 0-.707 0L10.5 1.793 14.207 5.5l1.647-1.646a.5.5 0 0 0 0-.708l-3-3z"/>
                        <path d="M11.146 6.354a.5.5 0 0 0-.146.354v.792l-7.5 7.5H3a.5.5 0 0 0-.5.5v.5H2a.5.5 0 0 0-.5.5v.5h-.5a.5.5 0 0 0-.354.854l2 2A.5.5 0 0 0 3 16h12a.5.5 0 0 0 .5-.5v-5a.5.5 0 0 0-.146-.354l-4.208-4.208z"/>
                      </svg>
                    </button>
                    <button class="action-btn danger" title="Remove" @click.stop="deleteImage(img)">
                      <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
                        <path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0V6z"/>
                        <path fill-rule="evenodd" d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1v1zM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4H4.118zM2.5 3V2h11v1h-11z"/>
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <!-- Remote Images -->
            <div v-if="remoteImages.length" class="section">
              <h4 class="section-title">Remote Images</h4>
              <div class="image-list">
                <div
                  v-for="img in remoteImages"
                  :key="img.src"
                  class="image-item"
                  @click="selectedImage = img"
                >
                  <div class="image-preview">
                    <img :src="img.src" :alt="img.alt" />
                  </div>
                  <div class="image-info">
                    <span class="image-name">{{ img.fileName }}</span>
                    <span class="image-alt" v-if="img.alt">{{ img.alt }}</span>
                  </div>
                  <div class="image-actions">
                    <button class="action-btn" title="Copy URL" @click.stop="copyPath(img)">
                      <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
                        <path d="M4 1.5H3a2 2 0 0 0-2 2V14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V3.5a2 2 0 0 0-2-2h-1v1h1a1 1 0 0 1 1 1V14a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V3.5a1 1 0 0 1 1-1h1v-1z"/>
                        <path d="M9.5 1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-3a.5.5 0 0 1-.5-.5v-1a.5.5 0 0 1 .5-.5h3zm-3-1A1.5 1.5 0 0 0 5 1.5v1A1.5 1.5 0 0 0 6.5 4h3A1.5 1.5 0 0 0 11 2.5v-1A1.5 1.5 0 0 0 9.5 0h-3z"/>
                      </svg>
                    </button>
                    <button class="action-btn" title="Open in browser" @click.stop="openInViewer(img)">
                      <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
                        <path d="M8.636 3.5a.5.5 0 0 0-.5-.5H1.5A1.5 1.5 0 0 0 0 4.5v10A1.5 1.5 0 0 0 1.5 16h10a1.5 1.5 0 0 0 1.5-1.5V7.864a.5.5 0 0 0-1 0V14.5a.5.5 0 0 1-.5.5h-10a.5.5 0 0 1-.5-.5v-10a.5.5 0 0 1 .5-.5h6.636a.5.5 0 0 0 .5-.5z"/>
                        <path d="M16 .5a.5.5 0 0 0-.5-.5h-5a.5.5 0 0 0 0 1h3.793L6.146 9.146a.5.5 0 1 0 .708.708L15 1.707V5.5a.5.5 0 0 0 1 0v-5z"/>
                      </svg>
                    </button>
                    <button class="action-btn danger" title="Remove" @click.stop="deleteImage(img)">
                      <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
                        <path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0V6z"/>
                        <path fill-rule="evenodd" d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1v1zM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4H4.118zM2.5 3V2h11v1h-11z"/>
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </template>
        </div>

        <div class="manager-footer">
          <button class="btn secondary" @click="extractImages">
            <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
              <path fill-rule="evenodd" d="M8 3a5 5 0 1 0 4.546 2.914.5.5 0 0 1 .908-.417A6 6 0 1 1 8 2v1z"/>
              <path d="M8 4.466V.534a.25.25 0 0 1 .41-.192l2.36 1.966c.12.1.12.284 0 .384L8.41 4.658A.25.25 0 0 1 8 4.466z"/>
            </svg>
            Refresh
          </button>
          <button class="btn primary" @click="emit('close')">Done</button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
.image-manager-overlay {
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

.image-manager-dialog {
  background: var(--color-bg-primary);
  border-radius: 12px;
  box-shadow: 0 16px 48px rgba(0, 0, 0, 0.2);
  width: 90%;
  max-width: 700px;
  max-height: 80vh;
  display: flex;
  flex-direction: column;
}

.manager-header {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px 20px;
  border-bottom: 1px solid var(--color-border);
}

.manager-header h3 {
  font-size: 16px;
  font-weight: 600;
  margin: 0;
}

.header-stats {
  display: flex;
  gap: 8px;
  margin-left: auto;
  margin-right: 8px;
}

.stat {
  font-size: 12px;
  color: var(--color-text-secondary);
  padding: 2px 8px;
  background: var(--color-bg-secondary);
  border-radius: 10px;
}

.stat.missing {
  background: rgba(239, 68, 68, 0.1);
  color: var(--color-danger);
}

.close-btn {
  width: 32px;
  height: 32px;
  border: none;
  border-radius: 6px;
  background: transparent;
  color: var(--color-text-secondary);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}

.close-btn:hover {
  background: var(--color-bg-secondary);
  color: var(--color-text-primary);
}

.manager-body {
  flex: 1;
  overflow-y: auto;
  padding: 16px 20px;
}

.loading-state,
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 48px 20px;
  color: var(--color-text-secondary);
  gap: 12px;
}

.loading-spinner {
  width: 24px;
  height: 24px;
  border: 2px solid var(--color-border);
  border-top-color: var(--color-accent);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.section {
  margin-bottom: 20px;
}

.section-title {
  font-size: 12px;
  font-weight: 600;
  color: var(--color-text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin: 0 0 12px 0;
  display: flex;
  align-items: center;
  gap: 6px;
}

.missing-section .section-title {
  color: var(--color-danger);
}

.image-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.image-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 12px;
  background: var(--color-bg-secondary);
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.15s ease;
}

.image-item:hover {
  background: var(--color-border);
}

.image-item.missing {
  border: 1px dashed var(--color-danger);
  background: rgba(239, 68, 68, 0.05);
}

.image-preview {
  width: 48px;
  height: 48px;
  border-radius: 6px;
  overflow: hidden;
  background: var(--color-bg-primary);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.image-preview img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.missing-preview {
  color: var(--color-text-secondary);
}

.image-info {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.image-name {
  font-size: 13px;
  font-weight: 500;
  color: var(--color-text-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.image-path,
.image-alt {
  font-size: 11px;
  color: var(--color-text-secondary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.image-actions {
  display: flex;
  gap: 4px;
  opacity: 0;
  transition: opacity 0.15s ease;
}

.image-item:hover .image-actions {
  opacity: 1;
}

.action-btn {
  width: 28px;
  height: 28px;
  border: none;
  border-radius: 4px;
  background: var(--color-bg-primary);
  color: var(--color-text-secondary);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.15s ease;
}

.action-btn:hover {
  background: var(--color-accent);
  color: white;
}

.action-btn.danger:hover {
  background: var(--color-danger);
}

.manager-footer {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  padding: 16px 20px;
  border-top: 1px solid var(--color-border);
}

.btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.15s ease;
}

.btn.primary {
  background: var(--color-accent);
  border: none;
  color: white;
}

.btn.primary:hover {
  filter: brightness(1.1);
}

.btn.secondary {
  background: transparent;
  border: 1px solid var(--color-border);
  color: var(--color-text-secondary);
}

.btn.secondary:hover {
  background: var(--color-bg-secondary);
  color: var(--color-text-primary);
}
</style>
