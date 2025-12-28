import * as prettier from "prettier/standalone";
import parserBabel from "prettier/plugins/babel";
import parserHtml from "prettier/plugins/html";
import parserCss from "prettier/plugins/postcss";
import parserMarkdown from "prettier/plugins/markdown";
import parserTypescript from "prettier/plugins/typescript";
import parserEstree from "prettier/plugins/estree";

// Map language names to Prettier parsers
const languageParserMap: Record<string, string> = {
  // JavaScript family
  javascript: "babel",
  js: "babel",
  jsx: "babel",
  typescript: "typescript",
  ts: "typescript",
  tsx: "typescript",

  // Web
  html: "html",
  htm: "html",
  vue: "html",
  svelte: "html",
  xml: "html",

  // Styling
  css: "css",
  scss: "scss",
  less: "less",

  // Data formats
  json: "json",
  json5: "json5",

  // Markdown
  markdown: "markdown",
  md: "markdown",
  mdx: "mdx",

  // YAML (not supported by standalone Prettier)
  // yaml: "yaml",
  // yml: "yaml",
};

// Languages that Prettier can format
const supportedLanguages = new Set(Object.keys(languageParserMap));

export function isFormattableLanguage(language: string): boolean {
  return supportedLanguages.has(language.toLowerCase());
}

export async function formatCode(
  code: string,
  language: string
): Promise<{ formatted: string; error?: string }> {
  const lang = language.toLowerCase();
  const parser = languageParserMap[lang];

  if (!parser) {
    return {
      formatted: code,
      error: `Language "${language}" is not supported for formatting`,
    };
  }

  try {
    const formatted = await prettier.format(code, {
      parser,
      plugins: [parserBabel, parserHtml, parserCss, parserMarkdown, parserTypescript, parserEstree],
      // Common formatting options
      tabWidth: 2,
      useTabs: false,
      semi: true,
      singleQuote: false,
      trailingComma: "es5",
      printWidth: 80,
      bracketSpacing: true,
    });

    return { formatted };
  } catch (e: any) {
    return {
      formatted: code,
      error: e.message || "Failed to format code",
    };
  }
}
