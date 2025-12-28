import { ref } from "vue";

// Global editor command handler type
type EditorCommandHandler = (command: string, payload?: any) => boolean;

// Singleton reference to the active editor's command handler
const activeEditorCommandHandler = ref<EditorCommandHandler | null>(null);

/**
 * Register the active editor's command handler
 * Should be called by MilkdownEditor when it becomes active
 */
export function registerEditorCommandHandler(handler: EditorCommandHandler) {
  activeEditorCommandHandler.value = handler;
}

/**
 * Unregister the editor command handler
 * Should be called when editor is destroyed
 */
export function unregisterEditorCommandHandler() {
  activeEditorCommandHandler.value = null;
}

/**
 * Execute a command on the active editor
 */
export function executeEditorCommand(command: string, payload?: any): boolean {
  if (activeEditorCommandHandler.value) {
    return activeEditorCommandHandler.value(command, payload);
  }
  return false;
}

/**
 * Check if there's an active editor that can receive commands
 */
export function hasActiveEditor(): boolean {
  return activeEditorCommandHandler.value !== null;
}

// Composable for components that need to execute editor commands
export function useEditorCommands() {
  return {
    executeCommand: executeEditorCommand,
    hasActiveEditor,
    registerHandler: registerEditorCommandHandler,
    unregisterHandler: unregisterEditorCommandHandler,
  };
}
