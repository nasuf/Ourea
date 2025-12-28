import { $prose, $remark } from "@milkdown/kit/utils";
import { Plugin, PluginKey } from "@milkdown/kit/prose/state";
import { Decoration, DecorationSet } from "@milkdown/kit/prose/view";
import katex from "katex";

const mathPluginKey = new PluginKey("mathPlugin");

// Regex patterns for math
const INLINE_MATH_REGEX = /\$([^$\n]+?)\$/g;
const BLOCK_MATH_REGEX = /\$\$([^$]+?)\$\$/gs;

// Render LaTeX using KaTeX
function renderMath(latex: string, displayMode: boolean = false): string {
  try {
    return katex.renderToString(latex, {
      displayMode,
      throwOnError: false,
      output: "html",
      trust: true,
      strict: false,
    });
  } catch (error) {
    console.error("KaTeX render error:", error);
    return `<span class="math-error">${latex}</span>`;
  }
}

// Create math preview element
function createMathPreview(latex: string, isBlock: boolean): HTMLElement {
  const container = document.createElement(isBlock ? "div" : "span");
  container.className = isBlock ? "math-block-preview" : "math-inline-preview";
  container.innerHTML = renderMath(latex, isBlock);
  return container;
}

// Create the math plugin
export const mathPlugin = $prose(() => {
  return new Plugin({
    key: mathPluginKey,

    props: {
      decorations(state) {
        const decorations: Decoration[] = [];
        const doc = state.doc;

        doc.descendants((node, pos) => {
          // Only process text nodes and paragraphs
          if (node.isText || node.type.name === "paragraph") {
            const text = node.textContent;

            // Find block math ($$...$$)
            let match: RegExpExecArray | null;
            BLOCK_MATH_REGEX.lastIndex = 0;
            while ((match = BLOCK_MATH_REGEX.exec(text)) !== null) {
              const latex = match[1].trim();
              const from = pos + match.index;
              const to = from + match[0].length;

              // Add decoration to hide the raw text and show rendered math
              const widget = Decoration.widget(
                to,
                () => createMathPreview(latex, true),
                { side: 1, key: `math-block-${from}` }
              );

              decorations.push(widget);

              // Mark the original text with a class
              decorations.push(
                Decoration.inline(from, to, {
                  class: "math-source math-block-source",
                })
              );
            }

            // Find inline math ($...$) - but not $$
            INLINE_MATH_REGEX.lastIndex = 0;
            while ((match = INLINE_MATH_REGEX.exec(text)) !== null) {
              // Skip if part of block math
              const idx = match.index;
              if (idx > 0 && text[idx - 1] === "$") continue;
              if (idx + match[0].length < text.length && text[idx + match[0].length] === "$") continue;

              const latex = match[1].trim();
              const from = pos + match.index;
              const to = from + match[0].length;

              const widget = Decoration.widget(
                to,
                () => createMathPreview(latex, false),
                { side: 1, key: `math-inline-${from}` }
              );

              decorations.push(widget);

              decorations.push(
                Decoration.inline(from, to, {
                  class: "math-source math-inline-source",
                })
              );
            }
          }
        });

        return DecorationSet.create(doc, decorations);
      },
    },
  });
});
