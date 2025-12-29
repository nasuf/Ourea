import { $prose } from "@milkdown/kit/utils";
import { Plugin, PluginKey } from "@milkdown/kit/prose/state";
import { formatCode, isFormattableLanguage } from "@/utils/formatCode";

const codeBlockPluginKey = new PluginKey("codeBlockEnhanced");

// Common programming languages
const LANGUAGES = [
  "text",
  "javascript",
  "typescript",
  "python",
  "rust",
  "go",
  "java",
  "c",
  "cpp",
  "csharp",
  "ruby",
  "php",
  "swift",
  "kotlin",
  "scala",
  "html",
  "css",
  "scss",
  "json",
  "yaml",
  "xml",
  "sql",
  "bash",
  "shell",
  "powershell",
  "markdown",
  "dockerfile",
  "graphql",
];

// Copy text to clipboard
async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    // Fallback for older browsers
    const textarea = document.createElement("textarea");
    textarea.value = text;
    textarea.style.position = "fixed";
    textarea.style.opacity = "0";
    document.body.appendChild(textarea);
    textarea.select();
    try {
      document.execCommand("copy");
      return true;
    } catch {
      return false;
    } finally {
      document.body.removeChild(textarea);
    }
  }
}

// Create the code block toolbar element
function createCodeBlockToolbar(
  language: string,
  onLanguageChange: (lang: string) => void,
  onCopy: () => void,
  onFormat: () => void
): HTMLElement {
  const toolbar = document.createElement("div");
  toolbar.className = "code-block-toolbar";
  toolbar.contentEditable = "false";

  // Language selector
  const langSelect = document.createElement("select");
  langSelect.className = "code-block-lang-select";
  langSelect.title = "Select language";

  LANGUAGES.forEach((lang) => {
    const option = document.createElement("option");
    option.value = lang;
    option.textContent = lang;
    if (lang === language || (lang === "text" && !language)) {
      option.selected = true;
    }
    langSelect.appendChild(option);
  });

  langSelect.addEventListener("change", (e) => {
    e.stopPropagation();
    e.preventDefault();
    const target = e.target as HTMLSelectElement;
    onLanguageChange(target.value);
  });

  langSelect.addEventListener("mousedown", (e) => {
    e.stopPropagation();
  });

  langSelect.addEventListener("click", (e) => {
    e.stopPropagation();
  });

  // Add langSelect first
  toolbar.appendChild(langSelect);

  // Format button (only show for formattable languages)
  const canFormat = isFormattableLanguage(language);
  if (canFormat) {
    const formatBtn = document.createElement("button");
    formatBtn.className = "code-block-format-btn";
    formatBtn.title = "Format code (Prettier)";
    formatBtn.type = "button";
    formatBtn.innerHTML = `
      <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
        <path d="M2 2a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V2zm2-1a1 1 0 0 0-1 1v12a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1V2a1 1 0 0 0-1-1H4z"/>
        <path d="M4.5 4a.5.5 0 0 1 .5-.5h6a.5.5 0 0 1 0 1H5a.5.5 0 0 1-.5-.5zm0 3a.5.5 0 0 1 .5-.5h6a.5.5 0 0 1 0 1H5a.5.5 0 0 1-.5-.5zm0 3a.5.5 0 0 1 .5-.5h4a.5.5 0 0 1 0 1H5a.5.5 0 0 1-.5-.5z"/>
      </svg>
    `;

    formatBtn.addEventListener("mousedown", (e) => {
      e.preventDefault();
      e.stopPropagation();
    });

    formatBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      e.preventDefault();
      onFormat();
      formatBtn.classList.add("formatting");
      setTimeout(() => {
        formatBtn.classList.remove("formatting");
      }, 500);
    });

    toolbar.appendChild(formatBtn);
  }

  // Copy button
  const copyBtn = document.createElement("button");
  copyBtn.className = "code-block-copy-btn";
  copyBtn.title = "Copy code";
  copyBtn.type = "button";
  copyBtn.innerHTML = `
    <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
      <path d="M0 6.75C0 5.784.784 5 1.75 5h1.5a.75.75 0 0 1 0 1.5h-1.5a.25.25 0 0 0-.25.25v7.5c0 .138.112.25.25.25h7.5a.25.25 0 0 0 .25-.25v-1.5a.75.75 0 0 1 1.5 0v1.5A1.75 1.75 0 0 1 9.25 16h-7.5A1.75 1.75 0 0 1 0 14.25Z"/>
      <path d="M5 1.75C5 .784 5.784 0 6.75 0h7.5C15.216 0 16 .784 16 1.75v7.5A1.75 1.75 0 0 1 14.25 11h-7.5A1.75 1.75 0 0 1 5 9.25Zm1.75-.25a.25.25 0 0 0-.25.25v7.5c0 .138.112.25.25.25h7.5a.25.25 0 0 0 .25-.25v-7.5a.25.25 0 0 0-.25-.25Z"/>
    </svg>
  `;

  copyBtn.addEventListener("mousedown", (e) => {
    e.preventDefault();
    e.stopPropagation();
  });

  copyBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    e.preventDefault();
    onCopy();
    copyBtn.classList.add("copied");
    copyBtn.innerHTML = `
      <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
        <path d="M13.78 4.22a.75.75 0 0 1 0 1.06l-7.25 7.25a.75.75 0 0 1-1.06 0L2.22 9.28a.751.751 0 0 1 .018-1.042.751.751 0 0 1 1.042-.018L6 10.94l6.72-6.72a.75.75 0 0 1 1.06 0Z"/>
      </svg>
    `;
    setTimeout(() => {
      copyBtn.classList.remove("copied");
      copyBtn.innerHTML = `
        <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
          <path d="M0 6.75C0 5.784.784 5 1.75 5h1.5a.75.75 0 0 1 0 1.5h-1.5a.25.25 0 0 0-.25.25v7.5c0 .138.112.25.25.25h7.5a.25.25 0 0 0 .25-.25v-1.5a.75.75 0 0 1 1.5 0v1.5A1.75 1.75 0 0 1 9.25 16h-7.5A1.75 1.75 0 0 1 0 14.25Z"/>
          <path d="M5 1.75C5 .784 5.784 0 6.75 0h7.5C15.216 0 16 .784 16 1.75v7.5A1.75 1.75 0 0 1 14.25 11h-7.5A1.75 1.75 0 0 1 5 9.25Zm1.75-.25a.25.25 0 0 0-.25.25v7.5c0 .138.112.25.25.25h7.5a.25.25 0 0 0 .25-.25v-7.5a.25.25 0 0 0-.25-.25Z"/>
        </svg>
      `;
    }, 2000);
  });

  toolbar.appendChild(copyBtn);

  return toolbar;
}

// Get code content from a pre element
function getCodeFromPre(preElement: HTMLElement): string {
  const codeElement = preElement.querySelector("code");
  return codeElement?.textContent || preElement.textContent || "";
}

// Get language from a pre element's class
function getLanguageFromPre(preElement: HTMLElement): string {
  // Check the pre element classes
  const preClasses = preElement.className.split(" ");
  for (const cls of preClasses) {
    if (cls.startsWith("language-")) {
      return cls.replace("language-", "");
    }
  }

  // Check the code element classes
  const codeElement = preElement.querySelector("code");
  if (codeElement) {
    const codeClasses = codeElement.className.split(" ");
    for (const cls of codeClasses) {
      if (cls.startsWith("language-")) {
        return cls.replace("language-", "");
      }
    }
  }

  return "text";
}

// Inject toolbar into a pre element
function injectToolbar(preElement: HTMLElement, editorView: any) {
  // Skip if already has toolbar
  if (preElement.querySelector(".code-block-toolbar")) {
    return;
  }

  const language = getLanguageFromPre(preElement);

  const toolbar = createCodeBlockToolbar(
    language,
    (newLang) => {
      // Find the position of this code block in the document
      const pos = findCodeBlockPos(preElement, editorView);
      if (pos !== null) {
        const event = new CustomEvent("code-block-lang-change", {
          detail: { pos, language: newLang },
        });
        document.dispatchEvent(event);
      }
    },
    async () => {
      const code = getCodeFromPre(preElement);
      await copyToClipboard(code);
    },
    async () => {
      const pos = findCodeBlockPos(preElement, editorView);
      if (pos !== null) {
        const code = getCodeFromPre(preElement);
        const event = new CustomEvent("code-block-format", {
          detail: { pos, code, language },
        });
        document.dispatchEvent(event);
      }
    }
  );

  // Add class to indicate toolbar is present
  preElement.classList.add("has-toolbar");

  // Insert toolbar at the beginning
  preElement.insertBefore(toolbar, preElement.firstChild);
}

// Find the position of a code block in the document
function findCodeBlockPos(preElement: HTMLElement, editorView: any): number | null {
  try {
    const doc = editorView.state.doc;
    let foundPos: number | null = null;

    doc.descendants((node: any, pos: number) => {
      if (foundPos !== null) return false;

      if (node.type.name === "code_block") {
        const domNode = editorView.nodeDOM(pos);
        if (domNode === preElement || domNode?.contains(preElement) || preElement.contains(domNode)) {
          foundPos = pos;
          return false;
        }
      }
      return true;
    });

    return foundPos;
  } catch {
    return null;
  }
}

// Create enhanced code block plugin
export const codeBlockEnhancedPlugin = $prose(() => {
  return new Plugin({
    key: codeBlockPluginKey,

    view(view) {
      let observer: MutationObserver | null = null;

      // Function to process all code blocks
      const processCodeBlocks = () => {
        const container = view.dom;
        const preElements = container.querySelectorAll("pre");

        preElements.forEach((pre) => {
          if (pre instanceof HTMLElement) {
            injectToolbar(pre, view);
          }
        });
      };

      // Initial processing with delay to ensure DOM is ready
      setTimeout(processCodeBlocks, 100);
      setTimeout(processCodeBlocks, 500);

      // Set up MutationObserver to watch for new code blocks
      observer = new MutationObserver((mutations) => {
        let shouldProcess = false;

        for (const mutation of mutations) {
          if (mutation.type === "childList") {
            // Check if any added nodes are or contain pre elements
            mutation.addedNodes.forEach((node) => {
              if (node instanceof HTMLElement) {
                if (node.tagName === "PRE" || node.querySelector("pre")) {
                  shouldProcess = true;
                }
              }
            });
          }
        }

        if (shouldProcess) {
          setTimeout(processCodeBlocks, 50);
        }
      });

      observer.observe(view.dom, {
        childList: true,
        subtree: true,
      });

      // Listen for language change events
      const handleLangChange = (e: Event) => {
        const { pos, language } = (e as CustomEvent).detail;
        try {
          const tr = view.state.tr.setNodeAttribute(pos, "language", language);
          view.dispatch(tr);
        } catch (err) {
          console.error("Failed to change language:", err);
        }
      };

      // Listen for format events
      const handleFormat = async (e: Event) => {
        const { pos, code, language } = (e as CustomEvent).detail;
        const result = await formatCode(code, language);

        if (!result.error) {
          try {
            const node = view.state.doc.nodeAt(pos);
            if (node && node.type.name === "code_block") {
              const schema = view.state.schema;
              const textNode = schema.text(result.formatted.trim());
              const newCodeBlock = node.type.create(node.attrs, textNode);

              const tr = view.state.tr.replaceWith(pos, pos + node.nodeSize, newCodeBlock);
              view.dispatch(tr);
            }
          } catch (err) {
            console.error("Failed to format code:", err);
          }
        }
      };

      document.addEventListener("code-block-lang-change", handleLangChange);
      document.addEventListener("code-block-format", handleFormat);

      return {
        update() {
          // Process code blocks on any update
          setTimeout(processCodeBlocks, 50);
        },
        destroy() {
          if (observer) {
            observer.disconnect();
          }
          document.removeEventListener("code-block-lang-change", handleLangChange);
          document.removeEventListener("code-block-format", handleFormat);
        },
      };
    },
  });
});
