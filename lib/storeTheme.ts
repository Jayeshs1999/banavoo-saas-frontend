/**
 * storeTheme.ts — Banavoo SaaS Step 3
 *
 * Default theme, template presets, color palettes, CSS-variable helpers.
 * Used by both the customizer (editor) and the public storefront (renderer).
 */

import type {
  StoreTheme,
  StoreTemplate,
  StoreFont,
  ButtonStyle,
  Store,
} from "../types";

// ── Default theme ─────────────────────────────────────────────────────────────

export const DEFAULT_THEME: StoreTheme = {
  template: "classic",
  colors: {
    primary:    "#111827",
    secondary:  "#FFFFFF",
    accent:     "#F59E0B",
    text:       "#111827",
    background: "#FFFFFF",
  },
  typography: {
    headingFont: "Inter",
    bodyFont:    "Inter",
  },
  buttons: {
    style: "rounded",
    size:  "medium",
  },
  layout: {
    containerWidth:  "wide",
    productColumns:  4,
  },
};

// ── Template presets ───────────────────────────────────────────────────────────

export const TEMPLATE_PRESETS: Record<StoreTemplate, StoreTheme> = {
  classic: {
    ...DEFAULT_THEME,
    template: "classic",
    colors: {
      primary:    "#111827",
      secondary:  "#FFFFFF",
      accent:     "#F59E0B",
      text:       "#111827",
      background: "#FFFFFF",
    },
    typography: { headingFont: "Inter", bodyFont: "Inter" },
    buttons:    { style: "rounded", size: "medium" },
    layout:     { containerWidth: "wide", productColumns: 4 },
  },
  minimal: {
    ...DEFAULT_THEME,
    template: "minimal",
    colors: {
      primary:    "#000000",
      secondary:  "#FAFAFA",
      accent:     "#000000",
      text:       "#1A1A1A",
      background: "#FAFAFA",
    },
    typography: { headingFont: "Poppins", bodyFont: "Poppins" },
    buttons:    { style: "square", size: "medium" },
    layout:     { containerWidth: "narrow", productColumns: 3 },
  },
  artisan: {
    ...DEFAULT_THEME,
    template: "artisan",
    colors: {
      primary:    "#78350F",
      secondary:  "#FFFBF5",
      accent:     "#D97706",
      text:       "#44403C",
      background: "#FFFBF5",
    },
    typography: { headingFont: "Playfair Display", bodyFont: "Lora" },
    buttons:    { style: "pill", size: "medium" },
    layout:     { containerWidth: "wide", productColumns: 4 },
  },
};

// ── Curated color palettes for the picker ─────────────────────────────────────

export interface ColorPalette {
  name:       string;
  primary:    string;
  secondary:  string;
  accent:     string;
  text:       string;
  background: string;
}

export const COLOR_PALETTES: ColorPalette[] = [
  {
    name:       "Night & Gold",
    primary:    "#111827",
    secondary:  "#FFFFFF",
    accent:     "#F59E0B",
    text:       "#111827",
    background: "#FFFFFF",
  },
  {
    name:       "Earthy Warmth",
    primary:    "#78350F",
    secondary:  "#FFFBF5",
    accent:     "#D97706",
    text:       "#44403C",
    background: "#FFFBF5",
  },
  {
    name:       "Slate & Rose",
    primary:    "#1E3A5F",
    secondary:  "#FFF0F3",
    accent:     "#E11D48",
    text:       "#1E293B",
    background: "#F8FAFC",
  },
  {
    name:       "Forest Green",
    primary:    "#14532D",
    secondary:  "#F0FDF4",
    accent:     "#16A34A",
    text:       "#1A2E1A",
    background: "#F0FDF4",
  },
  {
    name:       "Midnight Minimal",
    primary:    "#000000",
    secondary:  "#FAFAFA",
    accent:     "#000000",
    text:       "#1A1A1A",
    background: "#FAFAFA",
  },
  {
    name:       "Lavender Craft",
    primary:    "#4C1D95",
    secondary:  "#FAF5FF",
    accent:     "#7C3AED",
    text:       "#2E1065",
    background: "#FAF5FF",
  },
];

// ── Allowed fonts ─────────────────────────────────────────────────────────────

export const ALLOWED_FONTS: { label: string; value: StoreFont }[] = [
  { label: "Inter (Modern)",          value: "Inter"            },
  { label: "Poppins (Clean)",         value: "Poppins"          },
  { label: "Playfair Display (Serif)",value: "Playfair Display" },
  { label: "Lora (Warm Serif)",       value: "Lora"             },
  { label: "Roboto (Neutral)",        value: "Roboto"           },
  { label: "Montserrat (Bold)",       value: "Montserrat"       },
];

export const ALLOWED_BUTTON_STYLES: { label: string; value: ButtonStyle }[] = [
  { label: "Rounded",  value: "rounded" },
  { label: "Square",   value: "square"  },
  { label: "Pill",     value: "pill"    },
];

// ── CSS variable mapper ────────────────────────────────────────────────────────

/**
 * Convert a StoreTheme to a flat CSS custom properties object.
 * Apply this to the storefront root element's `style` prop.
 *
 * Example usage:
 *   <div style={themeToCssVars(theme) as React.CSSProperties}>
 */
export function themeToCssVars(theme: StoreTheme): Record<string, string> {
  return {
    "--color-primary":    theme.colors.primary,
    "--color-secondary":  theme.colors.secondary,
    "--color-accent":     theme.colors.accent,
    "--color-text":       theme.colors.text,
    "--color-background": theme.colors.background,
    "--font-heading":     `"${theme.typography.headingFont}", sans-serif`,
    "--font-body":        `"${theme.typography.bodyFont}", sans-serif`,
    "--btn-radius":
      theme.buttons.style === "pill"   ? "9999px" :
      theme.buttons.style === "square" ? "0px"    : "8px",
    "--container-max-width":
      theme.layout.containerWidth === "narrow" ? "900px"  :
      theme.layout.containerWidth === "full"   ? "100%"   : "1280px",
  };
}

/**
 * Get the effective theme for a store — falls back to DEFAULT_THEME if any
 * field is missing (handles stores created before Step 3 migration).
 */
export function getEffectiveTheme(store: Store | null | undefined): StoreTheme {
  if (!store?.theme) return DEFAULT_THEME;
  return {
    template: store.theme.template ?? DEFAULT_THEME.template,
    colors: {
      primary:    store.theme.colors?.primary    ?? DEFAULT_THEME.colors.primary,
      secondary:  store.theme.colors?.secondary  ?? DEFAULT_THEME.colors.secondary,
      accent:     store.theme.colors?.accent     ?? DEFAULT_THEME.colors.accent,
      text:       store.theme.colors?.text       ?? DEFAULT_THEME.colors.text,
      background: store.theme.colors?.background ?? DEFAULT_THEME.colors.background,
    },
    typography: {
      headingFont: store.theme.typography?.headingFont ?? DEFAULT_THEME.typography.headingFont,
      bodyFont:    store.theme.typography?.bodyFont    ?? DEFAULT_THEME.typography.bodyFont,
    },
    buttons: {
      style: store.theme.buttons?.style ?? DEFAULT_THEME.buttons.style,
      size:  store.theme.buttons?.size  ?? DEFAULT_THEME.buttons.size,
    },
    layout: {
      containerWidth:  store.theme.layout?.containerWidth  ?? DEFAULT_THEME.layout.containerWidth,
      productColumns:  store.theme.layout?.productColumns  ?? DEFAULT_THEME.layout.productColumns,
    },
  };
}

/**
 * Google Fonts URL for the heading + body fonts in a given theme.
 * Insert into a <link> in <head> for the storefront.
 */
export function googleFontsUrl(theme: StoreTheme): string {
  const fonts = new Set([theme.typography.headingFont, theme.typography.bodyFont]);
  const families = Array.from(fonts)
    .map((f) => `family=${encodeURIComponent(f)}:wght@400;500;600;700`)
    .join("&");
  return `https://fonts.googleapis.com/css2?${families}&display=swap`;
}
