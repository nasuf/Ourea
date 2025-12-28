import { $prose } from "@milkdown/kit/utils";
import { Plugin, PluginKey } from "@milkdown/kit/prose/state";
import { invoke } from "@tauri-apps/api/core";
import { save } from "@tauri-apps/plugin-dialog";
import { join, dirname } from "@tauri-apps/api/path";
import { useTabsStore } from "@/stores/tabs";

const imagePluginKey = new PluginKey("imagePlugin");

export interface ImageUploadResult {
  success: boolean;
  path?: string;
  error?: string;
}

// Save image from base64 data
async function saveImageFromBase64(
  base64Data: string,
  mimeType: string,
  currentFilePath: string | null
): Promise<ImageUploadResult> {
  try {
    // Get the extension from mime type
    const ext = mimeType.split("/")[1] || "png";
    const filename = `image_${Date.now()}.${ext}`;

    // If we have a current file path, save relative to it
    if (currentFilePath) {
      const dir = await dirname(currentFilePath);
      const assetsDir = await join(dir, "assets");
      const imagePath = await join(assetsDir, filename);

      // Create assets directory and save image
      await invoke("save_image", {
        base64_data: base64Data,
        path: imagePath,
      });

      return { success: true, path: `./assets/${filename}` };
    } else {
      // Ask user where to save
      const savePath = await save({
        defaultPath: filename,
        filters: [{ name: "Images", extensions: [ext] }],
      });

      if (savePath) {
        await invoke("save_image", {
          base64_data: base64Data,
          path: savePath,
        });
        return { success: true, path: savePath };
      }

      return { success: false, error: "Save cancelled" };
    }
  } catch (error) {
    console.error("Failed to save image:", error);
    return { success: false, error: String(error) };
  }
}

// Copy external image to local
async function copyImageToLocal(
  sourcePath: string,
  currentFilePath: string | null
): Promise<ImageUploadResult> {
  try {
    const ext = sourcePath.split(".").pop() || "png";
    const filename = `image_${Date.now()}.${ext}`;

    if (currentFilePath) {
      const dir = await dirname(currentFilePath);
      const assetsDir = await join(dir, "assets");
      const imagePath = await join(assetsDir, filename);

      await invoke("copy_image", {
        source: sourcePath,
        destination: imagePath,
      });

      return { success: true, path: `./assets/${filename}` };
    } else {
      // Copy to a default location or ask user
      return { success: false, error: "Please save the file first" };
    }
  } catch (error) {
    console.error("Failed to copy image:", error);
    return { success: false, error: String(error) };
  }
}

// Create Milkdown image plugin
export const imageUploadPlugin = $prose(() => {
  return new Plugin({
    key: imagePluginKey,

    props: {
      handlePaste(view, event) {
        const items = event.clipboardData?.items;
        if (!items) return false;

        for (const item of Array.from(items)) {
          if (item.type.startsWith("image/")) {
            event.preventDefault();

            const file = item.getAsFile();
            if (!file) continue;

            // Read file as base64
            const reader = new FileReader();
            reader.onload = async () => {
              const base64 = (reader.result as string).split(",")[1];
              const tabsStore = useTabsStore();
              const currentPath = tabsStore.activeTab?.filePath || null;

              const result = await saveImageFromBase64(base64, item.type, currentPath);

              if (result.success && result.path) {
                // Insert image markdown
                const { state, dispatch } = view;
                const { $from } = state.selection;

                const imgNode = state.schema.nodes.image?.create({
                  src: result.path,
                  alt: "image",
                });

                if (imgNode) {
                  const tr = state.tr.insert($from.pos, imgNode);
                  dispatch(tr);
                }
              }
            };
            reader.readAsDataURL(file);

            return true;
          }
        }

        return false;
      },

      handleDrop(view, event) {
        const files = event.dataTransfer?.files;
        if (!files || files.length === 0) return false;

        const imageFiles = Array.from(files).filter((f) => f.type.startsWith("image/"));
        if (imageFiles.length === 0) return false;

        event.preventDefault();

        const pos = view.posAtCoords({ left: event.clientX, top: event.clientY });
        if (!pos) return false;

        imageFiles.forEach((file) => {
          const reader = new FileReader();
          reader.onload = async () => {
            const base64 = (reader.result as string).split(",")[1];
            const tabsStore = useTabsStore();
            const currentPath = tabsStore.activeTab?.filePath || null;

            const result = await saveImageFromBase64(base64, file.type, currentPath);

            if (result.success && result.path) {
              const { state, dispatch } = view;

              const imgNode = state.schema.nodes.image?.create({
                src: result.path,
                alt: file.name,
              });

              if (imgNode) {
                const tr = state.tr.insert(pos.pos, imgNode);
                dispatch(tr);
              }
            }
          };
          reader.readAsDataURL(file);
        });

        return true;
      },
    },
  });
});

// Image preview functionality
export function createImagePreview(): HTMLElement {
  const preview = document.createElement("div");
  preview.className = "image-preview-popup";
  preview.style.display = "none";
  document.body.appendChild(preview);
  return preview;
}

export function showImagePreview(previewEl: HTMLElement, src: string, x: number, y: number) {
  previewEl.innerHTML = `<img src="${src}" alt="preview" />`;
  previewEl.style.display = "block";
  previewEl.style.left = `${x}px`;
  previewEl.style.top = `${y}px`;
}

export function hideImagePreview(previewEl: HTMLElement) {
  previewEl.style.display = "none";
}
