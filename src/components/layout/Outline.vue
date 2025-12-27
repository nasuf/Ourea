<script setup lang="ts">
import { computed, ref } from "vue";
import { useTabsStore } from "@/stores/tabs";

interface HeadingItem {
  level: number;
  text: string;
  id: string;
}

const props = defineProps<{
  width: number;
}>();

const emit = defineEmits<{
  (e: "update:width", width: number): void;
}>();

const tabsStore = useTabsStore();

// Drag resize logic
const isResizing = ref(false);
const startX = ref(0);
const startWidth = ref(0);

function startResize(event: MouseEvent) {
  isResizing.value = true;
  startX.value = event.clientX;
  startWidth.value = props.width;

  document.addEventListener("mousemove", onMouseMove);
  document.addEventListener("mouseup", stopResize);
  document.body.style.cursor = "col-resize";
  document.body.style.userSelect = "none";
}

function onMouseMove(event: MouseEvent) {
  if (!isResizing.value) return;

  // Resize from left edge, so width increases when mouse moves left
  const delta = startX.value - event.clientX;
  // Limit width: minimum 100px, maximum 50% of viewport width (max 600px)
  const maxWidth = Math.min(window.innerWidth * 0.5, 600);
  const newWidth = Math.max(100, Math.min(maxWidth, startWidth.value + delta));
  emit("update:width", newWidth);
}

function stopResize() {
  isResizing.value = false;
  document.removeEventListener("mousemove", onMouseMove);
  document.removeEventListener("mouseup", stopResize);
  document.body.style.cursor = "";
  document.body.style.userSelect = "";
}

const headings = computed<HeadingItem[]>(() => {
  const content = tabsStore.activeTab?.content || "";
  const lines = content.split("\n");
  const items: HeadingItem[] = [];

  lines.forEach((line, index) => {
    // Match markdown headings (# to ######)
    const match = line.match(/^(#{1,6})\s+(.+)$/);
    if (match) {
      const level = match[1].length;
      const text = match[2].trim();
      items.push({
        level,
        text,
        id: `heading-${index}`,
      });
    }
  });

  return items;
});

function scrollToHeading(text: string) {
  // Find the heading in the editor and scroll to it
  const editorElement = document.querySelector(".milkdown-editor");
  if (!editorElement) return;

  // Find all headings in the rendered content
  const headingElements = editorElement.querySelectorAll("h1, h2, h3, h4, h5, h6");

  for (const el of headingElements) {
    if (el.textContent?.trim() === text) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
      break;
    }
  }
}
</script>

<template>
  <aside class="outline" :style="{ width: `${width}px` }">
    <!-- Resize handle on left edge -->
    <div class="resize-handle" @mousedown="startResize"></div>

    <div class="outline-header">
      <span class="outline-title">Outline</span>
    </div>

    <div class="outline-content">
      <div v-if="headings.length > 0" class="heading-list">
        <div
          v-for="heading in headings"
          :key="heading.id"
          class="heading-item"
          :class="`level-${heading.level}`"
          @click="scrollToHeading(heading.text)"
        >
          {{ heading.text }}
        </div>
      </div>

      <div v-else class="empty-outline">
        <p>No headings</p>
      </div>
    </div>
  </aside>
</template>

<style scoped>
.outline {
  min-width: 100px;
  display: flex;
  flex-direction: column;
  background-color: var(--color-bg-secondary);
  flex-shrink: 0;
  position: relative;
  border: none !important;
  border-left: none !important;
  outline: none !important;
  /* Use negative margin and box-shadow to cover any potential gap/line at the boundary */
  margin-left: -2px;
  padding-left: 2px;
  /* Box shadow extends left to cover any rendering artifact */
  box-shadow: -2px 0 0 0 var(--color-bg-secondary) !important;
}

.resize-handle {
  position: absolute;
  left: -3px;
  top: 0;
  bottom: 0;
  width: 6px;
  cursor: col-resize;
  background: transparent;
  z-index: 10;
  transition: background-color 0.3s ease;
  border: none !important;
  box-shadow: none !important;
  outline: none !important;
}

.resize-handle:hover {
  background-color: rgba(128, 128, 128, 0.15);
}

.resize-handle:focus {
  outline: none !important;
}

.outline-header {
  display: flex;
  align-items: center;
  padding: 12px 16px;
  flex-shrink: 0;
}

.outline-title {
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: var(--color-text-secondary);
}

.outline-content {
  flex: 1;
  overflow-y: auto;
  overflow-x: auto;
  padding: 8px;
}

.heading-list {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.heading-item {
  padding: 6px 8px;
  font-size: 13px;
  color: var(--color-text-secondary);
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.15s ease;
  white-space: nowrap;
}

.heading-item:hover {
  background-color: var(--color-border);
  color: var(--color-text-primary);
}

/* Indentation based on heading level */
.heading-item.level-1 {
  padding-left: 8px;
  font-weight: 600;
}

.heading-item.level-2 {
  padding-left: 16px;
  font-weight: 500;
}

.heading-item.level-3 {
  padding-left: 24px;
}

.heading-item.level-4 {
  padding-left: 32px;
  font-size: 12px;
}

.heading-item.level-5 {
  padding-left: 40px;
  font-size: 12px;
}

.heading-item.level-6 {
  padding-left: 48px;
  font-size: 12px;
}

.empty-outline {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100px;
  text-align: center;
  color: var(--color-text-secondary);
}

.empty-outline p {
  font-size: 13px;
}
</style>
