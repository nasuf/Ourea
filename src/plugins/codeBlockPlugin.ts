import { $prose } from "@milkdown/kit/utils";
import { Plugin, PluginKey } from "@milkdown/kit/prose/state";
import { Decoration, DecorationSet } from "@milkdown/kit/prose/view";
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
    if (lang === language) {
      option.selected = true;
    }
    langSelect.appendChild(option);
  });

  langSelect.addEventListener("change", (e) => {
    const target = e.target as HTMLSelectElement;
    onLanguageChange(target.value);
  });

  // Format button (only show for formattable languages)
  const canFormat = isFormattableLanguage(language);
  if (canFormat) {
    const formatBtn = document.createElement("button");
    formatBtn.className = "code-block-format-btn";
    formatBtn.title = "Format code (Prettier)";
    formatBtn.innerHTML = `
      <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
        <path d="M2 2a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V2zm2-1a1 1 0 0 0-1 1v12a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1V2a1 1 0 0 0-1-1H4z"/>
        <path d="M4.5 4a.5.5 0 0 1 .5-.5h6a.5.5 0 0 1 0 1H5a.5.5 0 0 1-.5-.5zm0 3a.5.5 0 0 1 .5-.5h6a.5.5 0 0 1 0 1H5a.5.5 0 0 1-.5-.5zm0 3a.5.5 0 0 1 .5-.5h4a.5.5 0 0 1 0 1H5a.5.5 0 0 1-.5-.5z"/>
      </svg>
    `;

    formatBtn.addEventListener("click", () => {
      onFormat();
      // Show formatting feedback
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
  copyBtn.innerHTML = `
    <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
      <path d="M0 6.75C0 5.784.784 5 1.75 5h1.5a.75.75 0 0 1 0 1.5h-1.5a.25.25 0 0 0-.25.25v7.5c0 .138.112.25.25.25h7.5a.25.25 0 0 0 .25-.25v-1.5a.75.75 0 0 1 1.5 0v1.5A1.75 1.75 0 0 1 9.25 16h-7.5A1.75 1.75 0 0 1 0 14.25Z"/>
      <path d="M5 1.75C5 .784 5.784 0 6.75 0h7.5C15.216 0 16 .784 16 1.75v7.5A1.75 1.75 0 0 1 14.25 11h-7.5A1.75 1.75 0 0 1 5 9.25Zm1.75-.25a.25.25 0 0 0-.25.25v7.5c0 .138.112.25.25.25h7.5a.25.25 0 0 0 .25-.25v-7.5a.25.25 0 0 0-.25-.25Z"/>
    </svg>
  `;

  copyBtn.addEventListener("click", () => {
    onCopy();
    // Show copied feedback
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

  toolbar.appendChild(langSelect);
  toolbar.appendChild(copyBtn);

  return toolbar;
}

// Create enhanced code block plugin
export const codeBlockEnhancedPlugin = $prose(() => {
  return new Plugin({
    key: codeBlockPluginKey,

    props: {
      decorations(state) {
        const decorations: Decoration[] = [];
        const doc = state.doc;

        doc.descendants((node, pos) => {
          if (node.type.name === "code_block") {
            // Get the language attribute
            const language = node.attrs.language || "text";

            // Create widget decoration for toolbar
            const widget = Decoration.widget(
              pos,
              () => {
                const getCodeContent = () => {
                  return node.textContent;
                };

                return createCodeBlockToolbar(
                  language,
                  (newLang) => {
                    // This would update the node attribute
                    // We'll handle this via transaction
                    const event = new CustomEvent("code-block-lang-change", {
                      detail: { pos, language: newLang },
                    });
                    document.dispatchEvent(event);
                  },
                  async () => {
                    await copyToClipboard(getCodeContent());
                  },
                  async () => {
                    // Format code
                    const code = getCodeContent();
                    const event = new CustomEvent("code-block-format", {
                      detail: { pos, code, language },
                    });
                    document.dispatchEvent(event);
                  }
                );
              },
              { side: -1, key: `code-toolbar-${pos}` }
            );

            decorations.push(widget);
          }
        });

        return DecorationSet.create(doc, decorations);
      },
    },

    view(view) {
      // Listen for language change events
      const handleLangChange = (e: Event) => {
        const { pos, language } = (e as CustomEvent).detail;
        const tr = view.state.tr.setNodeAttribute(pos, "language", language);
        view.dispatch(tr);
      };

      // Listen for format events
      const handleFormat = async (e: Event) => {
        const { pos, code, language } = (e as CustomEvent).detail;
        const result = await formatCode(code, language);

        if (!result.error) {
          // Get the current node at the position
          const node = view.state.doc.nodeAt(pos);
          if (node && node.type.name === "code_block") {
            // Replace the node content with formatted code
            const schema = view.state.schema;
            const textNode = schema.text(result.formatted.trim());
            const newCodeBlock = node.type.create(node.attrs, textNode);

            const tr = view.state.tr.replaceWith(pos, pos + node.nodeSize, newCodeBlock);
            view.dispatch(tr);
          }
        }
      };

      document.addEventListener("code-block-lang-change", handleLangChange);
      document.addEventListener("code-block-format", handleFormat);

      return {
        destroy() {
          document.removeEventListener("code-block-lang-change", handleLangChange);
          document.removeEventListener("code-block-format", handleFormat);
        },
      };
    },
  });
});
