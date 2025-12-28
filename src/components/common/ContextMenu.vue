<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from "vue";

export interface MenuItem {
  id: string;
  label: string;
  icon?: string;
  disabled?: boolean;
  separator?: boolean;
}

const props = defineProps<{
  items: MenuItem[];
  x: number;
  y: number;
  visible: boolean;
}>();

const emit = defineEmits<{
  (e: "select", id: string): void;
  (e: "close"): void;
}>();

const menuRef = ref<HTMLElement | null>(null);

function handleClick(item: MenuItem) {
  if (item.disabled || item.separator) return;
  emit("select", item.id);
  emit("close");
}

function handleClickOutside(event: MouseEvent) {
  if (menuRef.value && !menuRef.value.contains(event.target as Node)) {
    emit("close");
  }
}

function handleKeyDown(event: KeyboardEvent) {
  if (event.key === "Escape") {
    emit("close");
  }
}

onMounted(() => {
  document.addEventListener("click", handleClickOutside);
  document.addEventListener("keydown", handleKeyDown);
});

onUnmounted(() => {
  document.removeEventListener("click", handleClickOutside);
  document.removeEventListener("keydown", handleKeyDown);
});
</script>

<template>
  <Teleport to="body">
    <div
      v-if="visible"
      ref="menuRef"
      class="context-menu"
      :style="{ left: `${x}px`, top: `${y}px` }"
    >
      <template v-for="item in items" :key="item.id">
        <div v-if="item.separator" class="menu-separator"></div>
        <div
          v-else
          class="menu-item"
          :class="{ disabled: item.disabled }"
          @click="handleClick(item)"
        >
          <span class="menu-label">{{ item.label }}</span>
        </div>
      </template>
    </div>
  </Teleport>
</template>

<style scoped>
.context-menu {
  position: fixed;
  z-index: 10000;
  min-width: 160px;
  background-color: var(--color-bg-primary);
  border: 1px solid var(--color-border);
  border-radius: 8px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
  padding: 4px;
  overflow: hidden;
}

.dark .context-menu {
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.4);
}

.menu-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 13px;
  color: var(--color-text-primary);
  transition: background-color 0.1s ease;
}

.menu-item:hover:not(.disabled) {
  background-color: var(--color-accent);
  color: white;
}

.menu-item.disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.menu-label {
  flex: 1;
}

.menu-separator {
  height: 1px;
  background-color: var(--color-border);
  margin: 4px 8px;
}
</style>
