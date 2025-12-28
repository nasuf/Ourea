<script setup lang="ts">
import { ref, watch, computed, onMounted, onUnmounted, nextTick } from "vue";

const props = defineProps<{
  visible: boolean;
  initialQuery?: string;
}>();

const emit = defineEmits<{
  (e: "close"): void;
  (e: "search", query: string, options: SearchOptions): void;
  (e: "replace", replacement: string): void;
  (e: "replaceAll", replacement: string): void;
  (e: "next"): void;
  (e: "prev"): void;
}>();

export interface SearchOptions {
  caseSensitive: boolean;
  regex: boolean;
  wholeWord: boolean;
}

const searchQuery = ref(props.initialQuery || "");
const replaceQuery = ref("");
const showReplace = ref(false);
const caseSensitive = ref(false);
const useRegex = ref(false);
const wholeWord = ref(false);
const matchCount = ref(0);
const currentMatch = ref(0);

const searchInputRef = ref<HTMLInputElement | null>(null);

const searchOptions = computed<SearchOptions>(() => ({
  caseSensitive: caseSensitive.value,
  regex: useRegex.value,
  wholeWord: wholeWord.value,
}));

// Focus search input when dialog opens
watch(() => props.visible, (visible) => {
  if (visible) {
    nextTick(() => {
      searchInputRef.value?.focus();
      searchInputRef.value?.select();
    });
  }
});

// Trigger search when query or options change
watch([searchQuery, caseSensitive, useRegex, wholeWord], () => {
  if (searchQuery.value) {
    emit("search", searchQuery.value, searchOptions.value);
  }
}, { immediate: true });

function handleKeyDown(event: KeyboardEvent) {
  if (event.key === "Escape") {
    emit("close");
  } else if (event.key === "Enter") {
    if (event.shiftKey) {
      emit("prev");
    } else {
      emit("next");
    }
  } else if (event.key === "F3") {
    event.preventDefault();
    if (event.shiftKey) {
      emit("prev");
    } else {
      emit("next");
    }
  }
}

function toggleReplace() {
  showReplace.value = !showReplace.value;
}

function handleReplace() {
  if (replaceQuery.value !== undefined) {
    emit("replace", replaceQuery.value);
  }
}

function handleReplaceAll() {
  if (replaceQuery.value !== undefined) {
    emit("replaceAll", replaceQuery.value);
  }
}

function updateMatchInfo(current: number, total: number) {
  currentMatch.value = current;
  matchCount.value = total;
}

defineExpose({
  updateMatchInfo,
});

onMounted(() => {
  window.addEventListener("keydown", handleKeyDown);
});

onUnmounted(() => {
  window.removeEventListener("keydown", handleKeyDown);
});
</script>

<template>
  <Teleport to="body">
    <div v-if="visible" class="search-dialog" @keydown="handleKeyDown">
      <div class="search-row">
        <div class="search-input-wrapper">
          <input
            ref="searchInputRef"
            v-model="searchQuery"
            type="text"
            class="search-input"
            placeholder="Search..."
            @keydown.stop
          />
          <span v-if="searchQuery" class="match-info">
            {{ matchCount > 0 ? `${currentMatch}/${matchCount}` : 'No results' }}
          </span>
        </div>

        <div class="search-actions">
          <button
            class="search-btn icon-btn"
            :class="{ active: caseSensitive }"
            title="Case Sensitive (Alt+C)"
            @click="caseSensitive = !caseSensitive"
          >
            Aa
          </button>
          <button
            class="search-btn icon-btn"
            :class="{ active: wholeWord }"
            title="Whole Word (Alt+W)"
            @click="wholeWord = !wholeWord"
          >
            <span class="whole-word-icon">ab</span>
          </button>
          <button
            class="search-btn icon-btn"
            :class="{ active: useRegex }"
            title="Use Regular Expression (Alt+R)"
            @click="useRegex = !useRegex"
          >
            .*
          </button>

          <div class="divider"></div>

          <button
            class="search-btn icon-btn"
            title="Previous Match (Shift+Enter)"
            :disabled="matchCount === 0"
            @click="emit('prev')"
          >
            <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
              <path d="M4.646 7.854a.5.5 0 0 0 .708 0L8 5.207l2.646 2.647a.5.5 0 0 0 .708-.708l-3-3a.5.5 0 0 0-.708 0l-3 3a.5.5 0 0 0 0 .708z"/>
              <path d="M4.646 11.854a.5.5 0 0 0 .708 0L8 9.207l2.646 2.647a.5.5 0 0 0 .708-.708l-3-3a.5.5 0 0 0-.708 0l-3 3a.5.5 0 0 0 0 .708z"/>
            </svg>
          </button>
          <button
            class="search-btn icon-btn"
            title="Next Match (Enter)"
            :disabled="matchCount === 0"
            @click="emit('next')"
          >
            <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
              <path d="M11.354 8.146a.5.5 0 0 1 0 .708l-3 3a.5.5 0 0 1-.708 0l-3-3a.5.5 0 1 1 .708-.708L8 10.793l2.646-2.647a.5.5 0 0 1 .708 0z"/>
              <path d="M11.354 4.146a.5.5 0 0 1 0 .708l-3 3a.5.5 0 0 1-.708 0l-3-3a.5.5 0 1 1 .708-.708L8 6.793l2.646-2.647a.5.5 0 0 1 .708 0z"/>
            </svg>
          </button>

          <div class="divider"></div>

          <button
            class="search-btn icon-btn"
            :class="{ active: showReplace }"
            title="Toggle Replace"
            @click="toggleReplace"
          >
            <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
              <path d="M11.534 7h3.932a.25.25 0 0 1 .192.41l-1.966 2.36a.25.25 0 0 1-.384 0l-1.966-2.36a.25.25 0 0 1 .192-.41zm-11 2h3.932a.25.25 0 0 0 .192-.41L2.692 6.23a.25.25 0 0 0-.384 0L.342 8.59A.25.25 0 0 0 .534 9z"/>
              <path d="M8 3c-1.552 0-2.94.707-3.857 1.818a.5.5 0 1 1-.771-.636A6.002 6.002 0 0 1 13.917 7H12.9A5.002 5.002 0 0 0 8 3zM3.1 9a5.002 5.002 0 0 0 8.757 2.182.5.5 0 1 1 .771.636A6.002 6.002 0 0 1 2.083 9H3.1z"/>
            </svg>
          </button>

          <button
            class="search-btn icon-btn close-btn"
            title="Close (Esc)"
            @click="emit('close')"
          >
            <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
              <path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708z"/>
            </svg>
          </button>
        </div>
      </div>

      <div v-if="showReplace" class="replace-row">
        <div class="search-input-wrapper">
          <input
            v-model="replaceQuery"
            type="text"
            class="search-input"
            placeholder="Replace..."
            @keydown.stop
          />
        </div>

        <div class="search-actions">
          <button
            class="search-btn text-btn"
            title="Replace"
            :disabled="matchCount === 0"
            @click="handleReplace"
          >
            Replace
          </button>
          <button
            class="search-btn text-btn"
            title="Replace All"
            :disabled="matchCount === 0"
            @click="handleReplaceAll"
          >
            All
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
.search-dialog {
  position: fixed;
  top: 50px;
  right: 20px;
  background-color: var(--color-bg-primary);
  border: 1px solid var(--color-border);
  border-radius: 8px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
  z-index: 1000;
  padding: 8px;
  min-width: 360px;
}

.search-row,
.replace-row {
  display: flex;
  gap: 8px;
  align-items: center;
}

.replace-row {
  margin-top: 8px;
}

.search-input-wrapper {
  flex: 1;
  position: relative;
  display: flex;
  align-items: center;
}

.search-input {
  width: 100%;
  padding: 6px 10px;
  padding-right: 70px;
  border: 1px solid var(--color-border);
  border-radius: 4px;
  font-size: 13px;
  background-color: var(--color-bg-secondary);
  color: var(--color-text-primary);
  outline: none;
}

.search-input:focus {
  border-color: var(--color-accent);
}

.match-info {
  position: absolute;
  right: 10px;
  font-size: 12px;
  color: var(--color-text-secondary);
  pointer-events: none;
}

.search-actions {
  display: flex;
  gap: 2px;
  align-items: center;
}

.divider {
  width: 1px;
  height: 20px;
  background-color: var(--color-border);
  margin: 0 4px;
}

.search-btn {
  border: none;
  background: none;
  cursor: pointer;
  color: var(--color-text-secondary);
  transition: all 0.15s ease;
}

.icon-btn {
  width: 28px;
  height: 28px;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 600;
}

.text-btn {
  padding: 4px 10px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
}

.search-btn:hover:not(:disabled) {
  background-color: var(--color-bg-secondary);
  color: var(--color-text-primary);
}

.search-btn.active {
  background-color: var(--color-accent);
  color: white;
}

.search-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.close-btn:hover {
  background-color: var(--color-danger);
  color: white;
}

.whole-word-icon {
  border: 1px solid currentColor;
  border-radius: 2px;
  padding: 0 2px;
  font-size: 10px;
}
</style>
