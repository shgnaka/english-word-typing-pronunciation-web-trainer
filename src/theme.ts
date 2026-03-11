import type { ThemeAccent, ThemeColorScheme, ThemeId, ThemePreference } from "./domain/types";

type ThemeLabelKey =
  | "settings.themePresetDusk"
  | "settings.themePresetForest"
  | "settings.themePresetOcean"
  | "settings.themePresetDawn"
  | "settings.themePresetDaylight"
  | "settings.themeAccentAmber"
  | "settings.themeAccentMint"
  | "settings.themeAccentSky"
  | "settings.themeAccentRose";

const themeColorSchemes: Record<ThemeId, ThemeColorScheme> = {
  dusk: "dark",
  forest: "dark",
  ocean: "dark",
  dawn: "dark",
  daylight: "light"
};

export const themeOptions: Array<{ id: ThemeId; labelKey: ThemeLabelKey; colorScheme: ThemeColorScheme }> = [
  { id: "dusk", labelKey: "settings.themePresetDusk", colorScheme: "dark" },
  { id: "forest", labelKey: "settings.themePresetForest", colorScheme: "dark" },
  { id: "ocean", labelKey: "settings.themePresetOcean", colorScheme: "dark" },
  { id: "dawn", labelKey: "settings.themePresetDawn", colorScheme: "dark" },
  { id: "daylight", labelKey: "settings.themePresetDaylight", colorScheme: "light" }
];

export const themeAccentOptions: Array<{ id: ThemeAccent; labelKey: ThemeLabelKey }> = [
  { id: "amber", labelKey: "settings.themeAccentAmber" },
  { id: "mint", labelKey: "settings.themeAccentMint" },
  { id: "sky", labelKey: "settings.themeAccentSky" },
  { id: "rose", labelKey: "settings.themeAccentRose" }
];

const accentPalette: Record<
  ThemeAccent,
  {
    accentRgb: string;
    accentAltRgb: string;
    accentText: string;
  }
> = {
  amber: {
    accentRgb: "255 191 105",
    accentAltRgb: "124 199 144",
    accentText: "#1c2438"
  },
  mint: {
    accentRgb: "124 217 170",
    accentAltRgb: "212 255 181",
    accentText: "#173025"
  },
  sky: {
    accentRgb: "121 192 255",
    accentAltRgb: "133 219 255",
    accentText: "#10253b"
  },
  rose: {
    accentRgb: "255 150 167",
    accentAltRgb: "255 196 143",
    accentText: "#3b1e2c"
  }
};

function clampUnitInterval(value: number): number {
  if (!Number.isFinite(value)) {
    return 0.6;
  }

  return Math.min(1, Math.max(0, value));
}

function formatAlpha(value: number): string {
  return clampUnitInterval(value).toFixed(3);
}

export function sanitizeBackgroundIntensity(value: number): number {
  if (!Number.isFinite(value)) {
    return 60;
  }

  return Math.min(100, Math.max(0, Math.round(value)));
}

export function getThemeColorScheme(themeId: ThemeId): ThemeColorScheme {
  return themeColorSchemes[themeId];
}

export function buildThemeStyleProperties(preference: ThemePreference): Record<string, string> {
  const accent = accentPalette[preference.accent];
  const intensity = sanitizeBackgroundIntensity(preference.backgroundIntensity) / 100;

  return {
    "--theme-accent-rgb": accent.accentRgb,
    "--theme-accent-alt-rgb": accent.accentAltRgb,
    "--theme-text-on-accent": accent.accentText,
    "--theme-background-glow-alpha": formatAlpha(0.12 + intensity * 0.2),
    "--theme-background-secondary-glow-alpha": formatAlpha(0.08 + intensity * 0.16),
    "--theme-surface-alpha": formatAlpha(0.5 + intensity * 0.2),
    "--theme-surface-strong-alpha": formatAlpha(0.58 + intensity * 0.2),
    "--theme-secondary-fill-alpha": formatAlpha(0.06 + intensity * 0.06),
    "--theme-secondary-hover-alpha": formatAlpha(0.08 + intensity * 0.08),
    "--theme-panel-border-alpha": formatAlpha(0.08 + intensity * 0.05),
    "--theme-input-border-alpha": formatAlpha(0.18 + intensity * 0.08),
    "--theme-panel-shadow-alpha": formatAlpha(0.2 + intensity * 0.12),
    "--theme-accent-shadow-alpha": formatAlpha(0.16 + intensity * 0.14),
    "--theme-accent-soft-alpha": formatAlpha(0.12 + intensity * 0.08),
    "--theme-accent-outline-alpha": formatAlpha(0.4 + intensity * 0.22)
  };
}
