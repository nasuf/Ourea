<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch, nextTick } from "vue";

const props = defineProps<{
  title: string;
  message?: string;
  defaultValue?: string;
  placeholder?: string;
  confirmText?: string;
  cancelText?: string;
}>();

const emit = defineEmits<{
  (e: "confirm", value: string): void;
  (e: "cancel"): void;
}>();

const inputValue = ref(props.defaultValue || "");
const inputRef = ref<HTMLInputElement | null>(null);

function handleConfirm() {
  if (inputValue.value.trim()) {
    emit("confirm", inputValue.value.trim());
  }
}

function handleKeyDown(event: KeyboardEvent) {
  if (event.key === "Escape") {
    emit("cancel");
  } else if (event.key === "Enter") {
    handleConfirm();
  }
}

onMounted(() => {
  window.addEventListener("keydown", handleKeyDown);
  // Focus and select input text
  nextTick(() => {
    if (inputRef.value) {
      inputRef.value.focus();
      inputRef.value.select();
    }
  });
});

onUnmounted(() => {
  window.removeEventListener("keydown", handleKeyDown);
});

watch(() => props.defaultValue, (newVal) => {
  inputValue.value = newVal || "";
});
</script>

<template>
  <Teleport to="body">
    <div class="dialog-overlay" @click.self="emit('cancel')">
      <div class="dialog">
        <h2 class="dialog-title">{{ title }}</h2>

        <p v-if="message" class="dialog-message">{{ message }}</p>

        <input
          ref="inputRef"
          v-model="inputValue"
          type="text"
          class="dialog-input"
          :placeholder="placeholder"
          @keydown.stop
        />

        <div class="dialog-buttons">
          <button class="btn btn-cancel" @click="emit('cancel')">
            {{ cancelText || 'Cancel' }}
          </button>
          <button
            class="btn btn-confirm"
            :disabled="!inputValue.trim()"
            @click="handleConfirm"
          >
            {{ confirmText || 'Confirm' }}
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
.dialog-overlay {
  position: fixed;
  inset: 0;
  background-color: rgba(0, 0, 0, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10000;
  backdrop-filter: blur(2px);
}

.dialog {
  background-color: var(--color-bg-primary);
  border-radius: 12px;
  padding: 20px 24px;
  width: 320px;
  max-width: 90vw;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
}

.dialog-title {
  font-size: 15px;
  font-weight: 600;
  color: var(--color-text-primary);
  margin: 0 0 8px;
}

.dialog-message {
  font-size: 13px;
  color: var(--color-text-secondary);
  margin: 0 0 16px;
  line-height: 1.4;
}

.dialog-input {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid var(--color-border);
  border-radius: 8px;
  font-size: 14px;
  background-color: var(--color-bg-secondary);
  color: var(--color-text-primary);
  margin-bottom: 16px;
  outline: none;
  transition: border-color 0.15s ease;
}

.dialog-input:focus {
  border-color: var(--color-accent);
}

.dialog-input::placeholder {
  color: var(--color-text-secondary);
  opacity: 0.6;
}

.dialog-buttons {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}

.btn {
  padding: 8px 16px;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  border: none;
  transition: all 0.1s ease;
  min-width: 72px;
}

.btn:active {
  transform: scale(0.98);
}

.btn-cancel {
  background-color: var(--color-bg-secondary);
  color: var(--color-text-primary);
  border: 1px solid var(--color-border);
}

.btn-cancel:hover {
  background-color: var(--color-border);
}

.btn-confirm {
  background-color: var(--color-accent);
  color: white;
}

.btn-confirm:hover:not(:disabled) {
  filter: brightness(1.1);
}

.btn-confirm:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>
