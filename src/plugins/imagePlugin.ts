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

// Image preview state
let previewElement: HTMLElement | null = null;
let previewTimeout: number | null = null;

function getOrCreatePreview(): HTMLElement {
  if (!previewElement) {
    previewElement = document.createElement("div");
    previewElement.className = "image-preview-popup";
    previewElement.innerHTML = `
      <div class="image-preview-content">
        <img class="preview-img" src="" alt="preview" />
        <div class="preview-info">
          <span class="preview-size"></span>
        </div>
      </div>
    `;
    document.body.appendChild(previewElement);
  }
  return previewElement;
}

function showPreview(src: string, x: number, y: number) {
  const preview = getOrCreatePreview();
  const img = preview.querySelector(".preview-img") as HTMLImageElement;
  const sizeInfo = preview.querySelector(".preview-size") as HTMLElement;

  img.onload = () => {
    sizeInfo.textContent = `${img.naturalWidth} × ${img.naturalHeight}`;
  };
  img.src = src;

  // Position preview - ensure it stays within viewport
  const viewportWidth = window.innerWidth;
  const viewportHeight = window.innerHeight;
  const previewWidth = 320;
  const previewHeight = 240;

  let left = x + 10;
  let top = y + 10;

  if (left + previewWidth > viewportWidth) {
    left = x - previewWidth - 10;
  }
  if (top + previewHeight > viewportHeight) {
    top = y - previewHeight - 10;
  }

  preview.style.left = `${Math.max(10, left)}px`;
  preview.style.top = `${Math.max(10, top)}px`;
  preview.style.display = "block";
}

function hidePreview() {
  if (previewElement) {
    previewElement.style.display = "none";
  }
}

// Lightbox state
let lightboxElement: HTMLElement | null = null;

function getOrCreateLightbox(): HTMLElement {
  if (!lightboxElement) {
    lightboxElement = document.createElement("div");
    lightboxElement.className = "image-lightbox-overlay";
    lightboxElement.innerHTML = `
      <button class="image-lightbox-close">
        <svg width="20" height="20" viewBox="0 0 16 16" fill="currentColor">
          <path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708z"/>
        </svg>
      </button>
      <img class="lightbox-img" src="" alt="Full size" />
      <div class="image-lightbox-info"></div>
    `;

    // Close on click
    lightboxElement.addEventListener("click", (e) => {
      if (e.target === lightboxElement || (e.target as HTMLElement).closest(".image-lightbox-close")) {
        closeLightbox();
      }
    });

    // Close on Escape
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && lightboxElement?.classList.contains("visible")) {
        closeLightbox();
      }
    });

    document.body.appendChild(lightboxElement);
  }
  return lightboxElement;
}

function openLightbox(src: string, alt: string = "") {
  const lightbox = getOrCreateLightbox();
  const img = lightbox.querySelector(".lightbox-img") as HTMLImageElement;
  const info = lightbox.querySelector(".image-lightbox-info") as HTMLElement;

  img.src = src;
  img.alt = alt;

  img.onload = () => {
    info.textContent = `${img.naturalWidth} × ${img.naturalHeight}`;
  };

  lightbox.classList.add("visible");
  document.body.style.overflow = "hidden";
}

function closeLightbox() {
  if (lightboxElement) {
    lightboxElement.classList.remove("visible");
    document.body.style.overflow = "";
  }
}

// Create Milkdown image plugin
export const imageUploadPlugin = $prose(() => {
  return new Plugin({
    key: imagePluginKey,

    view(editorView) {
      const handleMouseOver = (event: MouseEvent) => {
        const target = event.target as HTMLElement;
        if (target.tagName === "IMG" && target.closest(".milkdown")) {
          const img = target as HTMLImageElement;
          if (previewTimeout) clearTimeout(previewTimeout);
          previewTimeout = window.setTimeout(() => {
            showPreview(img.src, event.clientX, event.clientY);
          }, 500); // 500ms delay before showing preview
        }
      };

      const handleMouseOut = (event: MouseEvent) => {
        const target = event.target as HTMLElement;
        if (target.tagName === "IMG") {
          if (previewTimeout) {
            clearTimeout(previewTimeout);
            previewTimeout = null;
          }
          hidePreview();
        }
      };

      const handleMouseMove = (event: MouseEvent) => {
        const target = event.target as HTMLElement;
        if (target.tagName !== "IMG" && previewElement?.style.display === "block") {
          hidePreview();
        }
      };

      const handleClick = (event: MouseEvent) => {
        const target = event.target as HTMLElement;
        if (target.tagName === "IMG" && target.closest(".milkdown")) {
          const img = target as HTMLImageElement;
          // Double-click to open lightbox
          if (event.detail === 2) {
            event.preventDefault();
            openLightbox(img.src, img.alt);
          }
        }
      };

      document.addEventListener("mouseover", handleMouseOver);
      document.addEventListener("mouseout", handleMouseOut);
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("click", handleClick);

      return {
        destroy() {
          document.removeEventListener("mouseover", handleMouseOver);
          document.removeEventListener("mouseout", handleMouseOut);
          document.removeEventListener("mousemove", handleMouseMove);
          document.removeEventListener("click", handleClick);
          if (previewElement) {
            previewElement.remove();
            previewElement = null;
          }
          if (lightboxElement) {
            lightboxElement.remove();
            lightboxElement = null;
          }
        },
      };
    },

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
