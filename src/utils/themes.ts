// Predefined theme definitions
export interface ThemeColors {
  bgPrimary: string;
  bgSecondary: string;
  bgTertiary: string;
  textPrimary: string;
  textSecondary: string;
  border: string;
  accent: string;
  accentHover: string;
  danger: string;
  success: string;
  warning: string;
  // Editor specific
  editorBg: string;
  editorSelection: string;
  editorCursor: string;
  // Code syntax
  codeKeyword: string;
  codeString: string;
  codeComment: string;
  codeFunction: string;
  codeNumber: string;
  codeOperator: string;
}

export interface ThemeDefinition {
  id: string;
  name: string;
  description: string;
  isDark: boolean;
  colors: ThemeColors;
}

// Predefined themes
export const predefinedThemes: ThemeDefinition[] = [
  // Default Light
  {
    id: "default-light",
    name: "Default Light",
    description: "Clean and minimal light theme",
    isDark: false,
    colors: {
      bgPrimary: "#ffffff",
      bgSecondary: "#f5f5f5",
      bgTertiary: "#ebebeb",
      textPrimary: "#1a1a1a",
      textSecondary: "#666666",
      border: "#e5e5e5",
      accent: "#3b82f6",
      accentHover: "#2563eb",
      danger: "#ef4444",
      success: "#22c55e",
      warning: "#f59e0b",
      editorBg: "#ffffff",
      editorSelection: "rgba(59, 130, 246, 0.2)",
      editorCursor: "#3b82f6",
      codeKeyword: "#d73a49",
      codeString: "#22863a",
      codeComment: "#6a737d",
      codeFunction: "#6f42c1",
      codeNumber: "#005cc5",
      codeOperator: "#d73a49",
    },
  },
  // Default Dark
  {
    id: "default-dark",
    name: "Default Dark",
    description: "Clean and minimal dark theme",
    isDark: true,
    colors: {
      bgPrimary: "#1a1a1a",
      bgSecondary: "#2d2d2d",
      bgTertiary: "#3d3d3d",
      textPrimary: "#f5f5f5",
      textSecondary: "#a3a3a3",
      border: "#404040",
      accent: "#60a5fa",
      accentHover: "#3b82f6",
      danger: "#f87171",
      success: "#4ade80",
      warning: "#fbbf24",
      editorBg: "#1a1a1a",
      editorSelection: "rgba(96, 165, 250, 0.3)",
      editorCursor: "#60a5fa",
      codeKeyword: "#ff7b72",
      codeString: "#a5d6ff",
      codeComment: "#8b949e",
      codeFunction: "#d2a8ff",
      codeNumber: "#79c0ff",
      codeOperator: "#ff7b72",
    },
  },
  // Sepia
  {
    id: "sepia",
    name: "Sepia",
    description: "Warm, paper-like theme for comfortable reading",
    isDark: false,
    colors: {
      bgPrimary: "#f4ecd8",
      bgSecondary: "#e8dcc8",
      bgTertiary: "#ddd0b8",
      textPrimary: "#5b4636",
      textSecondary: "#8b7355",
      border: "#d4c4a8",
      accent: "#b5651d",
      accentHover: "#8b4513",
      danger: "#c0392b",
      success: "#27ae60",
      warning: "#d35400",
      editorBg: "#f4ecd8",
      editorSelection: "rgba(181, 101, 29, 0.2)",
      editorCursor: "#b5651d",
      codeKeyword: "#a0522d",
      codeString: "#556b2f",
      codeComment: "#8b7355",
      codeFunction: "#8b4513",
      codeNumber: "#cd853f",
      codeOperator: "#a0522d",
    },
  },
  // Nord
  {
    id: "nord",
    name: "Nord",
    description: "Arctic, north-bluish color palette",
    isDark: true,
    colors: {
      bgPrimary: "#2e3440",
      bgSecondary: "#3b4252",
      bgTertiary: "#434c5e",
      textPrimary: "#eceff4",
      textSecondary: "#d8dee9",
      border: "#4c566a",
      accent: "#88c0d0",
      accentHover: "#81a1c1",
      danger: "#bf616a",
      success: "#a3be8c",
      warning: "#ebcb8b",
      editorBg: "#2e3440",
      editorSelection: "rgba(136, 192, 208, 0.3)",
      editorCursor: "#88c0d0",
      codeKeyword: "#81a1c1",
      codeString: "#a3be8c",
      codeComment: "#616e88",
      codeFunction: "#88c0d0",
      codeNumber: "#b48ead",
      codeOperator: "#81a1c1",
    },
  },
  // GitHub Light
  {
    id: "github-light",
    name: "GitHub Light",
    description: "Inspired by GitHub's light theme",
    isDark: false,
    colors: {
      bgPrimary: "#ffffff",
      bgSecondary: "#f6f8fa",
      bgTertiary: "#eaeef2",
      textPrimary: "#24292f",
      textSecondary: "#57606a",
      border: "#d0d7de",
      accent: "#0969da",
      accentHover: "#0550ae",
      danger: "#cf222e",
      success: "#1a7f37",
      warning: "#9a6700",
      editorBg: "#ffffff",
      editorSelection: "rgba(9, 105, 218, 0.15)",
      editorCursor: "#0969da",
      codeKeyword: "#cf222e",
      codeString: "#0a3069",
      codeComment: "#6e7781",
      codeFunction: "#8250df",
      codeNumber: "#0550ae",
      codeOperator: "#cf222e",
    },
  },
  // GitHub Dark
  {
    id: "github-dark",
    name: "GitHub Dark",
    description: "Inspired by GitHub's dark theme",
    isDark: true,
    colors: {
      bgPrimary: "#0d1117",
      bgSecondary: "#161b22",
      bgTertiary: "#21262d",
      textPrimary: "#c9d1d9",
      textSecondary: "#8b949e",
      border: "#30363d",
      accent: "#58a6ff",
      accentHover: "#1f6feb",
      danger: "#f85149",
      success: "#3fb950",
      warning: "#d29922",
      editorBg: "#0d1117",
      editorSelection: "rgba(88, 166, 255, 0.25)",
      editorCursor: "#58a6ff",
      codeKeyword: "#ff7b72",
      codeString: "#a5d6ff",
      codeComment: "#8b949e",
      codeFunction: "#d2a8ff",
      codeNumber: "#79c0ff",
      codeOperator: "#ff7b72",
    },
  },
  // One Dark
  {
    id: "one-dark",
    name: "One Dark",
    description: "Popular dark theme from Atom editor",
    isDark: true,
    colors: {
      bgPrimary: "#282c34",
      bgSecondary: "#21252b",
      bgTertiary: "#2c313a",
      textPrimary: "#abb2bf",
      textSecondary: "#7f848e",
      border: "#3e4451",
      accent: "#61afef",
      accentHover: "#528bde",
      danger: "#e06c75",
      success: "#98c379",
      warning: "#e5c07b",
      editorBg: "#282c34",
      editorSelection: "rgba(97, 175, 239, 0.3)",
      editorCursor: "#528bff",
      codeKeyword: "#c678dd",
      codeString: "#98c379",
      codeComment: "#5c6370",
      codeFunction: "#61afef",
      codeNumber: "#d19a66",
      codeOperator: "#56b6c2",
    },
  },
  // Dracula
  {
    id: "dracula",
    name: "Dracula",
    description: "Dark theme with vibrant colors",
    isDark: true,
    colors: {
      bgPrimary: "#282a36",
      bgSecondary: "#21222c",
      bgTertiary: "#343746",
      textPrimary: "#f8f8f2",
      textSecondary: "#bfc7d5",
      border: "#44475a",
      accent: "#bd93f9",
      accentHover: "#a66efa",
      danger: "#ff5555",
      success: "#50fa7b",
      warning: "#ffb86c",
      editorBg: "#282a36",
      editorSelection: "rgba(189, 147, 249, 0.3)",
      editorCursor: "#f8f8f2",
      codeKeyword: "#ff79c6",
      codeString: "#f1fa8c",
      codeComment: "#6272a4",
      codeFunction: "#50fa7b",
      codeNumber: "#bd93f9",
      codeOperator: "#ff79c6",
    },
  },
  // Solarized Light
  {
    id: "solarized-light",
    name: "Solarized Light",
    description: "Precision colors for machines and people",
    isDark: false,
    colors: {
      bgPrimary: "#fdf6e3",
      bgSecondary: "#eee8d5",
      bgTertiary: "#e4ddc8",
      textPrimary: "#657b83",
      textSecondary: "#93a1a1",
      border: "#ddd6c1",
      accent: "#268bd2",
      accentHover: "#0d6eb8",
      danger: "#dc322f",
      success: "#859900",
      warning: "#b58900",
      editorBg: "#fdf6e3",
      editorSelection: "rgba(38, 139, 210, 0.2)",
      editorCursor: "#268bd2",
      codeKeyword: "#859900",
      codeString: "#2aa198",
      codeComment: "#93a1a1",
      codeFunction: "#268bd2",
      codeNumber: "#d33682",
      codeOperator: "#859900",
    },
  },
  // Solarized Dark
  {
    id: "solarized-dark",
    name: "Solarized Dark",
    description: "Precision colors for machines and people",
    isDark: true,
    colors: {
      bgPrimary: "#002b36",
      bgSecondary: "#073642",
      bgTertiary: "#094552",
      textPrimary: "#839496",
      textSecondary: "#657b83",
      border: "#0a4a5c",
      accent: "#268bd2",
      accentHover: "#3d9fe0",
      danger: "#dc322f",
      success: "#859900",
      warning: "#b58900",
      editorBg: "#002b36",
      editorSelection: "rgba(38, 139, 210, 0.3)",
      editorCursor: "#268bd2",
      codeKeyword: "#859900",
      codeString: "#2aa198",
      codeComment: "#586e75",
      codeFunction: "#268bd2",
      codeNumber: "#d33682",
      codeOperator: "#859900",
    },
  },
];

// Get theme by ID
export function getThemeById(id: string): ThemeDefinition | undefined {
  return predefinedThemes.find((t) => t.id === id);
}

// Get default theme based on system preference
export function getDefaultTheme(prefersDark: boolean): ThemeDefinition {
  return prefersDark
    ? predefinedThemes.find((t) => t.id === "default-dark")!
    : predefinedThemes.find((t) => t.id === "default-light")!;
}

// Apply theme to document
export function applyTheme(theme: ThemeDefinition) {
  const root = document.documentElement;
  const { colors } = theme;

  // Set CSS variables
  root.style.setProperty("--color-bg-primary", colors.bgPrimary);
  root.style.setProperty("--color-bg-secondary", colors.bgSecondary);
  root.style.setProperty("--color-bg-tertiary", colors.bgTertiary);
  root.style.setProperty("--color-text-primary", colors.textPrimary);
  root.style.setProperty("--color-text-secondary", colors.textSecondary);
  root.style.setProperty("--color-border", colors.border);
  root.style.setProperty("--color-accent", colors.accent);
  root.style.setProperty("--color-accent-hover", colors.accentHover);
  root.style.setProperty("--color-danger", colors.danger);
  root.style.setProperty("--color-success", colors.success);
  root.style.setProperty("--color-warning", colors.warning);
  root.style.setProperty("--color-editor-bg", colors.editorBg);
  root.style.setProperty("--color-editor-selection", colors.editorSelection);
  root.style.setProperty("--color-editor-cursor", colors.editorCursor);
  root.style.setProperty("--color-code-keyword", colors.codeKeyword);
  root.style.setProperty("--color-code-string", colors.codeString);
  root.style.setProperty("--color-code-comment", colors.codeComment);
  root.style.setProperty("--color-code-function", colors.codeFunction);
  root.style.setProperty("--color-code-number", colors.codeNumber);
  root.style.setProperty("--color-code-operator", colors.codeOperator);

  // Toggle dark class for Tailwind and other dark mode styles
  root.classList.toggle("dark", theme.isDark);

  // Store current theme data attribute for CSS targeting
  root.dataset.theme = theme.id;
}

// Get light themes
export function getLightThemes(): ThemeDefinition[] {
  return predefinedThemes.filter((t) => !t.isDark);
}

// Get dark themes
export function getDarkThemes(): ThemeDefinition[] {
  return predefinedThemes.filter((t) => t.isDark);
}
