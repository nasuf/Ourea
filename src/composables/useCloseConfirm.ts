import { ref, shallowRef } from "vue";

export type CloseConfirmResult = "save" | "dont-save" | "cancel";

interface DialogState {
  fileName: string;
  resolve: (result: CloseConfirmResult) => void;
}

const isOpen = ref(false);
const dialogState = shallowRef<DialogState | null>(null);

export function useCloseConfirm() {
  function showConfirm(fileName: string): Promise<CloseConfirmResult> {
    return new Promise((resolve) => {
      dialogState.value = { fileName, resolve };
      isOpen.value = true;
    });
  }

  function handleResult(result: CloseConfirmResult) {
    if (dialogState.value) {
      dialogState.value.resolve(result);
      dialogState.value = null;
    }
    isOpen.value = false;
  }

  return {
    isOpen,
    dialogState,
    showConfirm,
    handleResult,
  };
}
