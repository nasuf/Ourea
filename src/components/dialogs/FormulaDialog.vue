<script setup lang="ts">
import { ref, watch, computed, onMounted, onUnmounted, nextTick } from "vue";
import katex from "katex";

const props = defineProps<{
  visible: boolean;
  initialFormula?: string;
  isBlock?: boolean;
}>();

const emit = defineEmits<{
  (e: "close"): void;
  (e: "insert", formula: string, isBlock: boolean): void;
}>();

const formula = ref(props.initialFormula || "");
const isBlockMode = ref(props.isBlock ?? false);
const preview = ref("");
const error = ref("");
const inputRef = ref<HTMLTextAreaElement | null>(null);

// Common LaTeX symbols
const symbolGroups = [
  {
    name: "Greek",
    symbols: [
      { label: "α", latex: "\\alpha" },
      { label: "β", latex: "\\beta" },
      { label: "γ", latex: "\\gamma" },
      { label: "δ", latex: "\\delta" },
      { label: "ε", latex: "\\epsilon" },
      { label: "θ", latex: "\\theta" },
      { label: "λ", latex: "\\lambda" },
      { label: "μ", latex: "\\mu" },
      { label: "π", latex: "\\pi" },
      { label: "σ", latex: "\\sigma" },
      { label: "φ", latex: "\\phi" },
      { label: "ω", latex: "\\omega" },
    ],
  },
  {
    name: "Operators",
    symbols: [
      { label: "±", latex: "\\pm" },
      { label: "×", latex: "\\times" },
      { label: "÷", latex: "\\div" },
      { label: "≠", latex: "\\neq" },
      { label: "≤", latex: "\\leq" },
      { label: "≥", latex: "\\geq" },
      { label: "≈", latex: "\\approx" },
      { label: "∈", latex: "\\in" },
      { label: "⊂", latex: "\\subset" },
      { label: "∪", latex: "\\cup" },
      { label: "∩", latex: "\\cap" },
      { label: "∞", latex: "\\infty" },
    ],
  },
  {
    name: "Functions",
    symbols: [
      { label: "√", latex: "\\sqrt{}" },
      { label: "∑", latex: "\\sum_{i=1}^{n}" },
      { label: "∏", latex: "\\prod_{i=1}^{n}" },
      { label: "∫", latex: "\\int_{a}^{b}" },
      { label: "lim", latex: "\\lim_{x \\to \\infty}" },
      { label: "frac", latex: "\\frac{a}{b}" },
      { label: "^", latex: "^{n}" },
      { label: "_", latex: "_{n}" },
      { label: "sin", latex: "\\sin" },
      { label: "cos", latex: "\\cos" },
      { label: "log", latex: "\\log" },
      { label: "ln", latex: "\\ln" },
    ],
  },
  {
    name: "Brackets",
    symbols: [
      { label: "()", latex: "\\left( \\right)" },
      { label: "[]", latex: "\\left[ \\right]" },
      { label: "{}", latex: "\\left\\{ \\right\\}" },
      { label: "||", latex: "\\left| \\right|" },
      { label: "⌈⌉", latex: "\\lceil \\rceil" },
      { label: "⌊⌋", latex: "\\lfloor \\rfloor" },
    ],
  },
];

// Update preview when formula changes
watch(formula, (newFormula) => {
  if (!newFormula) {
    preview.value = "";
    error.value = "";
    return;
  }

  try {
    preview.value = katex.renderToString(newFormula, {
      displayMode: isBlockMode.value,
      throwOnError: true,
      output: "html",
    });
    error.value = "";
  } catch (e: any) {
    error.value = e.message || "Invalid formula";
    preview.value = "";
  }
});

watch(isBlockMode, () => {
  // Re-render preview when mode changes
  if (formula.value) {
    try {
      preview.value = katex.renderToString(formula.value, {
        displayMode: isBlockMode.value,
        throwOnError: true,
        output: "html",
      });
      error.value = "";
    } catch (e: any) {
      error.value = e.message || "Invalid formula";
    }
  }
});

// Focus input when dialog opens
watch(() => props.visible, (visible) => {
  if (visible) {
    nextTick(() => {
      inputRef.value?.focus();
    });
  }
});

function insertSymbol(latex: string) {
  const input = inputRef.value;
  if (!input) return;

  const start = input.selectionStart;
  const end = input.selectionEnd;
  const newValue = formula.value.substring(0, start) + latex + formula.value.substring(end);
  formula.value = newValue;

  // Set cursor position after inserted text
  nextTick(() => {
    input.focus();
    const newPos = start + latex.length;
    input.setSelectionRange(newPos, newPos);
  });
}

function handleInsert() {
  if (formula.value && !error.value) {
    emit("insert", formula.value, isBlockMode.value);
    formula.value = "";
    emit("close");
  }
}

function handleKeyDown(event: KeyboardEvent) {
  if (event.key === "Escape") {
    emit("close");
  } else if (event.key === "Enter" && (event.metaKey || event.ctrlKey)) {
    handleInsert();
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
    <div v-if="visible" class="formula-dialog-overlay" @click.self="emit('close')">
      <div class="formula-dialog">
        <div class="formula-header">
          <h3>Insert Formula</h3>
          <button class="close-btn" @click="emit('close')">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
              <path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708z"/>
            </svg>
          </button>
        </div>

        <div class="formula-body">
          <!-- Mode toggle -->
          <div class="mode-toggle">
            <label class="mode-option">
              <input type="radio" :value="false" v-model="isBlockMode" />
              <span>Inline ($...$)</span>
            </label>
            <label class="mode-option">
              <input type="radio" :value="true" v-model="isBlockMode" />
              <span>Block ($$...$$)</span>
            </label>
          </div>

          <!-- Input -->
          <div class="formula-input-section">
            <label>LaTeX Formula</label>
            <textarea
              ref="inputRef"
              v-model="formula"
              class="formula-input"
              placeholder="Enter LaTeX formula, e.g., \frac{1}{2}"
              rows="3"
              @keydown.stop
            ></textarea>
          </div>

          <!-- Preview -->
          <div class="formula-preview-section">
            <label>Preview</label>
            <div class="formula-preview" :class="{ 'has-error': error }">
              <div v-if="preview" v-html="preview" class="preview-content"></div>
              <div v-else-if="error" class="preview-error">{{ error }}</div>
              <div v-else class="preview-placeholder">Formula preview will appear here</div>
            </div>
          </div>

          <!-- Symbol palette -->
          <div class="symbol-palette">
            <div v-for="group in symbolGroups" :key="group.name" class="symbol-group">
              <span class="group-name">{{ group.name }}</span>
              <div class="symbol-buttons">
                <button
                  v-for="sym in group.symbols"
                  :key="sym.latex"
                  class="symbol-btn"
                  :title="sym.latex"
                  @click="insertSymbol(sym.latex)"
                >
                  {{ sym.label }}
                </button>
              </div>
            </div>
          </div>
        </div>

        <div class="formula-footer">
          <button class="btn secondary" @click="emit('close')">Cancel</button>
          <button class="btn primary" :disabled="!formula || !!error" @click="handleInsert">
            Insert ({{ isBlockMode ? "$$...$$" : "$...$" }})
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
.formula-dialog-overlay {
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

.formula-dialog {
  background: var(--color-bg-primary);
  border-radius: 12px;
  box-shadow: 0 16px 48px rgba(0, 0, 0, 0.2);
  width: 90%;
  max-width: 600px;
  max-height: 90vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.formula-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  border-bottom: 1px solid var(--color-border);
}

.formula-header h3 {
  font-size: 16px;
  font-weight: 600;
  margin: 0;
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
  transition: all 0.15s ease;
}

.close-btn:hover {
  background: var(--color-bg-secondary);
  color: var(--color-text-primary);
}

.formula-body {
  padding: 20px;
  overflow-y: auto;
  flex: 1;
}

.mode-toggle {
  display: flex;
  gap: 16px;
  margin-bottom: 16px;
}

.mode-option {
  display: flex;
  align-items: center;
  gap: 6px;
  cursor: pointer;
  font-size: 13px;
  color: var(--color-text-secondary);
}

.mode-option input {
  accent-color: var(--color-accent);
}

.formula-input-section,
.formula-preview-section {
  margin-bottom: 16px;
}

.formula-input-section label,
.formula-preview-section label {
  display: block;
  font-size: 12px;
  font-weight: 500;
  color: var(--color-text-secondary);
  margin-bottom: 6px;
}

.formula-input {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid var(--color-border);
  border-radius: 6px;
  background: var(--color-bg-secondary);
  color: var(--color-text-primary);
  font-family: "JetBrains Mono", monospace;
  font-size: 14px;
  resize: vertical;
  outline: none;
}

.formula-input:focus {
  border-color: var(--color-accent);
}

.formula-preview {
  min-height: 60px;
  padding: 16px;
  background: var(--color-bg-secondary);
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.formula-preview.has-error {
  border: 1px solid var(--color-danger);
}

.preview-content {
  text-align: center;
}

.preview-error {
  color: var(--color-danger);
  font-size: 12px;
}

.preview-placeholder {
  color: var(--color-text-secondary);
  font-size: 13px;
}

.symbol-palette {
  border-top: 1px solid var(--color-border);
  padding-top: 16px;
}

.symbol-group {
  margin-bottom: 12px;
}

.group-name {
  display: block;
  font-size: 11px;
  font-weight: 500;
  color: var(--color-text-secondary);
  margin-bottom: 6px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.symbol-buttons {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}

.symbol-btn {
  width: 32px;
  height: 32px;
  border: 1px solid var(--color-border);
  border-radius: 4px;
  background: var(--color-bg-primary);
  color: var(--color-text-primary);
  font-size: 14px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.15s ease;
}

.symbol-btn:hover {
  border-color: var(--color-accent);
  background: var(--color-bg-secondary);
}

.formula-footer {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  padding: 16px 20px;
  border-top: 1px solid var(--color-border);
}

.btn {
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

.btn.primary:hover:not(:disabled) {
  filter: brightness(1.1);
}

.btn.primary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
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
