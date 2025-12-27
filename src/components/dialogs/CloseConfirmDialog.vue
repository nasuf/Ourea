<script setup lang="ts">
import { ref, onMounted, onUnmounted } from "vue";

const props = defineProps<{
  fileName: string;
}>();

const emit = defineEmits<{
  (e: "save"): void;
  (e: "dont-save"): void;
  (e: "cancel"): void;
}>();

const dialogRef = ref<HTMLDivElement | null>(null);

function handleKeyDown(event: KeyboardEvent) {
  if (event.key === "Escape") {
    emit("cancel");
  } else if (event.key === "Enter") {
    emit("save");
  }
}

onMounted(() => {
  window.addEventListener("keydown", handleKeyDown);
  dialogRef.value?.focus();
});

onUnmounted(() => {
  window.removeEventListener("keydown", handleKeyDown);
});
</script>

<template>
  <div class="dialog-overlay" @click.self="emit('cancel')">
    <div ref="dialogRef" class="dialog" tabindex="-1">
      <div class="dialog-icon">
        <svg width="64" height="64" viewBox="0 0 64 64" fill="none">
          <rect x="12" y="8" width="40" height="48" rx="4" fill="#E8E8E8" stroke="#CCCCCC" stroke-width="2"/>
          <path d="M20 20h24M20 28h24M20 36h16" stroke="#999999" stroke-width="2" stroke-linecap="round"/>
          <circle cx="48" cy="48" r="12" fill="#FFB800"/>
          <path d="M48 40v10M48 54v2" stroke="white" stroke-width="3" stroke-linecap="round"/>
        </svg>
      </div>

      <h2 class="dialog-title">
        Do you want to save "{{ fileName }}"?
      </h2>

      <p class="dialog-message">
        Your changes will be lost if you don't save them.
      </p>

      <div class="dialog-buttons">
        <button class="btn btn-delete" @click="emit('dont-save')">
          Don't Save
        </button>
        <div class="btn-group">
          <button class="btn btn-cancel" @click="emit('cancel')">
            Cancel
          </button>
          <button class="btn btn-save" @click="emit('save')">
            Save
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.dialog-overlay {
  position: fixed;
  inset: 0;
  background-color: rgba(0, 0, 0, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  backdrop-filter: blur(2px);
}

.dialog {
  background-color: #f6f6f6;
  border-radius: 12px;
  padding: 20px 24px 16px;
  width: 360px;
  max-width: 90vw;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
  text-align: center;
  outline: none;
}

.dark .dialog {
  background-color: #3d3d3d;
}

.dialog-icon {
  margin-bottom: 12px;
}

.dialog-title {
  font-size: 13px;
  font-weight: 700;
  color: var(--color-text-primary);
  margin: 0 0 6px;
  line-height: 1.4;
}

.dialog-message {
  font-size: 11px;
  color: var(--color-text-secondary);
  margin: 0 0 20px;
  line-height: 1.4;
}

.dialog-buttons {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.btn-group {
  display: flex;
  gap: 8px;
}

.btn {
  padding: 6px 16px;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 400;
  cursor: pointer;
  border: none;
  transition: all 0.1s ease;
  min-width: 64px;
}

.btn:active {
  transform: scale(0.98);
}

.btn-delete {
  background-color: transparent;
  color: #ff3b30;
  border: 1px solid #ff3b30;
}

.btn-delete:hover {
  background-color: #ff3b30;
  color: white;
}

.btn-cancel {
  background-color: #e5e5e5;
  color: #333;
}

.dark .btn-cancel {
  background-color: #555;
  color: #fff;
}

.btn-cancel:hover {
  background-color: #d5d5d5;
}

.dark .btn-cancel:hover {
  background-color: #666;
}

.btn-save {
  background-color: #007aff;
  color: white;
}

.btn-save:hover {
  background-color: #0066d6;
}
</style>
