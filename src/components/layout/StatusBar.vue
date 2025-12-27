<script setup lang="ts">
import { computed } from "vue";
import { useTabsStore } from "@/stores/tabs";

const tabsStore = useTabsStore();

const wordCount = computed(() => {
  const content = tabsStore.activeTab?.content || "";
  if (!content.trim()) return 0;
  // Count Chinese characters and English words
  const chineseChars = (content.match(/[\u4e00-\u9fa5]/g) || []).length;
  const englishWords = content
    .replace(/[\u4e00-\u9fa5]/g, " ")
    .split(/\s+/)
    .filter((word) => word.length > 0).length;
  return chineseChars + englishWords;
});

const charCount = computed(() => {
  return tabsStore.activeTab?.content?.length || 0;
});
</script>

<template>
  <footer class="statusbar">
    <div class="status-left">
      <span class="status-item">
        {{ wordCount }} words
      </span>
      <span class="status-divider">|</span>
      <span class="status-item">
        {{ charCount }} characters
      </span>
    </div>

    <div class="status-right">
      <span class="status-item">UTF-8</span>
      <span class="status-divider">|</span>
      <span class="status-item">Markdown</span>
    </div>
  </footer>
</template>

<style scoped>
.statusbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 24px;
  padding: 0 12px;
  background-color: var(--color-bg-secondary);
  border-top: 1px solid var(--color-border);
  font-size: 12px;
  color: var(--color-text-secondary);
}

.status-left,
.status-right {
  display: flex;
  align-items: center;
  gap: 8px;
}

.status-item {
  white-space: nowrap;
}

.status-divider {
  color: var(--color-border);
}
</style>
