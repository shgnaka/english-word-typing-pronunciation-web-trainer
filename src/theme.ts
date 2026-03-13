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

type ThemeMode = "dark" | "light";

type Rgb = {
  r: number;
  g: number;
  b: number;
};

type ThemePreset = {
  id: ThemeId;
  labelKey: ThemeLabelKey;
  mode: ThemeMode;
  neutral: {
    canvas: Rgb;
    surface: Rgb;
    surfaceStrong: Rgb;
  };
};

type AccentPalette = {
  base: Rgb;
  soft: Rgb;
};

type ResolvedTheme = {
  colorScheme: ThemeColorScheme;
  cssVariables: Record<string, string>;
};

const themePresets: Record<ThemeId, ThemePreset> = {
  dusk: {
    id: "dusk",
    labelKey: "settings.themePresetDusk",
    mode: "dark",
    neutral: {
      canvas: { r: 16, g: 22, b: 31 },
      surface: { r: 24, g: 31, b: 42 },
      surfaceStrong: { r: 18, g: 24, b: 34 }
    }
  },
  forest: {
    id: "forest",
    labelKey: "settings.themePresetForest",
    mode: "dark",
    neutral: {
      canvas: { r: 15, g: 24, b: 22 },
      surface: { r: 22, g: 35, b: 31 },
      surfaceStrong: { r: 17, g: 28, b: 24 }
    }
  },
  ocean: {
    id: "ocean",
    labelKey: "settings.themePresetOcean",
    mode: "dark",
    neutral: {
      canvas: { r: 12, g: 21, b: 31 },
      surface: { r: 18, g: 31, b: 46 },
      surfaceStrong: { r: 14, g: 24, b: 37 }
    }
  },
  dawn: {
    id: "dawn",
    labelKey: "settings.themePresetDawn",
    mode: "dark",
    neutral: {
      canvas: { r: 26, g: 19, b: 29 },
      surface: { r: 38, g: 28, b: 43 },
      surfaceStrong: { r: 31, g: 22, b: 35 }
    }
  },
  daylight: {
    id: "daylight",
    labelKey: "settings.themePresetDaylight",
    mode: "light",
    neutral: {
      canvas: { r: 244, g: 241, b: 235 },
      surface: { r: 255, g: 255, b: 255 },
      surfaceStrong: { r: 247, g: 243, b: 236 }
    }
  }
};

const accentPalettes: Record<ThemeAccent, AccentPalette> = {
  amber: {
    base: { r: 255, g: 191, b: 105 },
    soft: { r: 222, g: 167, b: 86 }
  },
  mint: {
    base: { r: 124, g: 217, b: 170 },
    soft: { r: 97, g: 184, b: 144 }
  },
  sky: {
    base: { r: 121, g: 192, b: 255 },
    soft: { r: 89, g: 159, b: 220 }
  },
  rose: {
    base: { r: 255, g: 150, b: 167 },
    soft: { r: 219, g: 122, b: 146 }
  }
};

export const themeOptions: Array<{ id: ThemeId; labelKey: ThemeLabelKey; colorScheme: ThemeColorScheme }> = Object.values(themePresets).map((preset) => ({
  id: preset.id,
  labelKey: preset.labelKey,
  colorScheme: preset.mode
}));

export const themeAccentOptions: Array<{ id: ThemeAccent; labelKey: ThemeLabelKey }> = [
  { id: "amber", labelKey: "settings.themeAccentAmber" },
  { id: "mint", labelKey: "settings.themeAccentMint" },
  { id: "sky", labelKey: "settings.themeAccentSky" },
  { id: "rose", labelKey: "settings.themeAccentRose" }
];

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function mixRgb(a: Rgb, b: Rgb, ratio: number): Rgb {
  const t = clamp(ratio, 0, 1);

  return {
    r: Math.round(a.r + (b.r - a.r) * t),
    g: Math.round(a.g + (b.g - a.g) * t),
    b: Math.round(a.b + (b.b - a.b) * t)
  };
}

function toRgbString(color: Rgb): string {
  return `${color.r} ${color.g} ${color.b}`;
}

function toCssRgb(color: Rgb, alpha = 1): string {
  if (alpha >= 1) {
    return `rgb(${toRgbString(color)})`;
  }

  return `rgb(${toRgbString(color)} / ${alpha.toFixed(3)})`;
}

function toHex(color: Rgb): string {
  return `#${[color.r, color.g, color.b]
    .map((channel) => channel.toString(16).padStart(2, "0"))
    .join("")}`;
}

function srgbToLinear(channel: number): number {
  const value = channel / 255;
  return value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
}

function getLuminance(color: Rgb): number {
  return 0.2126 * srgbToLinear(color.r) + 0.7152 * srgbToLinear(color.g) + 0.0722 * srgbToLinear(color.b);
}

function getContrastRatio(a: Rgb, b: Rgb): number {
  const lighter = Math.max(getLuminance(a), getLuminance(b));
  const darker = Math.min(getLuminance(a), getLuminance(b));
  return (lighter + 0.05) / (darker + 0.05);
}

function pickReadableText(background: Rgb, mode: ThemeMode): Rgb {
  const darkText = { r: 20, g: 24, b: 32 };
  const lightText = { r: 249, g: 250, b: 251 };
  const preferred = mode === "dark" ? darkText : lightText;
  const fallback = mode === "dark" ? lightText : darkText;

  return getContrastRatio(preferred, background) >= 4.5 ? preferred : fallback;
}

function ensureContrast(foreground: Rgb, background: Rgb, minimumRatio: number, mode: ThemeMode): Rgb {
  if (getContrastRatio(foreground, background) >= minimumRatio) {
    return foreground;
  }

  const target = mode === "dark" ? { r: 255, g: 255, b: 255 } : { r: 0, g: 0, b: 0 };
  let adjusted = foreground;

  for (let step = 1; step <= 12; step += 1) {
    adjusted = mixRgb(foreground, target, step / 12);
    if (getContrastRatio(adjusted, background) >= minimumRatio) {
      return adjusted;
    }
  }

  return adjusted;
}

function clampUnitInterval(value: number): number {
  if (!Number.isFinite(value)) {
    return 0.6;
  }

  return clamp(value, 0, 1);
}

function formatAlpha(value: number): string {
  return clampUnitInterval(value).toFixed(3);
}

export function sanitizeBackgroundIntensity(value: number): number {
  if (!Number.isFinite(value)) {
    return 60;
  }

  return clamp(Math.round(value), 0, 100);
}

function resolveTheme(preference: ThemePreference): ResolvedTheme {
  const preset = themePresets[preference.themeId];
  const accentPalette = accentPalettes[preference.accent];
  const colorScheme = preset.mode;
  const intensity = sanitizeBackgroundIntensity(preference.backgroundIntensity) / 100;
  const isDark = colorScheme === "dark";
  const surface = isDark
    ? mixRgb(preset.neutral.surface, preset.neutral.canvas, 0.1 * (1 - intensity))
    : mixRgb(preset.neutral.surface, preset.neutral.canvas, 0.02 * intensity);
  const surfaceStrong = isDark
    ? mixRgb(preset.neutral.surfaceStrong, preset.neutral.canvas, 0.12 * (1 - intensity))
    : mixRgb(preset.neutral.surfaceStrong, preset.neutral.canvas, 0.01 * intensity);
  const raised = isDark
    ? mixRgb(surface, accentPalette.base, 0.04)
    : mixRgb(surfaceStrong, preset.neutral.canvas, 0.16);
  const subtle = isDark
    ? mixRgb(surface, preset.neutral.canvas, 0.18)
    : mixRgb(surfaceStrong, preset.neutral.canvas, 0.22);
  const muted = isDark
    ? mixRgb(subtle, preset.neutral.canvas, 0.25)
    : mixRgb(subtle, preset.neutral.canvas, 0.18);
  const overlay = isDark
    ? mixRgb(surfaceStrong, preset.neutral.canvas, 0.26)
    : mixRgb(surfaceStrong, preset.neutral.canvas, 0.14);

  const baseText = isDark ? { r: 245, g: 247, b: 250 } : { r: 33, g: 43, b: 58 };
  const primaryText = ensureContrast(baseText, surfaceStrong, 7, colorScheme);
  const secondaryText = ensureContrast(mixRgb(primaryText, surfaceStrong, 0.2), surfaceStrong, 4.5, colorScheme);
  const mutedText = ensureContrast(mixRgb(primaryText, surfaceStrong, 0.38), surfaceStrong, 3.2, colorScheme);
  const faintText = ensureContrast(mixRgb(primaryText, surfaceStrong, 0.52), surfaceStrong, 2.2, colorScheme);

  const accentBase = accentPalette.base;
  const accentSoft = mixRgb(accentPalette.base, preset.neutral.surface, isDark ? 0.22 : 0.14);
  const accentText = pickReadableText(accentBase, colorScheme);

  const successBase = isDark ? { r: 96, g: 184, b: 129 } : { r: 78, g: 157, b: 110 };
  const warningBase = isDark ? accentBase : mixRgb(accentBase, { r: 194, g: 130, b: 42 }, 0.28);
  const infoBase = isDark ? { r: 108, g: 173, b: 235 } : { r: 84, g: 138, b: 197 };
  const dangerBase = isDark ? { r: 229, g: 111, b: 111 } : { r: 196, g: 88, b: 88 };

  return {
    colorScheme,
    cssVariables: {
      "--theme-text-primary-rgb": toRgbString(primaryText),
      "--theme-text-on-accent": toHex(accentText),
      "--theme-surface-rgb": toRgbString(surface),
      "--theme-surface-strong-rgb": toRgbString(surfaceStrong),
      "--theme-bg-glow-1-rgb": toRgbString(preset.neutral.canvas),
      "--theme-bg-glow-2-rgb": toRgbString(preset.neutral.canvas),
      "--theme-bg-start": toHex(preset.neutral.canvas),
      "--theme-bg-mid": toHex(preset.neutral.canvas),
      "--theme-bg-end": toHex(preset.neutral.canvas),
      "--theme-accent-rgb": toRgbString(accentBase),
      "--theme-accent-alt-rgb": toRgbString(accentPalette.soft),
      "--theme-background-glow-alpha": "0.000",
      "--theme-background-secondary-glow-alpha": "0.000",
      "--theme-surface-alpha": "1.000",
      "--theme-surface-strong-alpha": "1.000",
      "--theme-secondary-fill-alpha": formatAlpha(isDark ? 0.12 : 0.08),
      "--theme-secondary-hover-alpha": formatAlpha(isDark ? 0.18 : 0.14),
      "--theme-panel-border-alpha": formatAlpha(isDark ? 0.22 : 0.22),
      "--theme-input-border-alpha": formatAlpha(isDark ? 0.28 : 0.32),
      "--theme-panel-shadow-alpha": formatAlpha(isDark ? 0.18 : 0.08),
      "--theme-accent-shadow-alpha": formatAlpha(isDark ? 0.18 : 0.1),
      "--theme-accent-soft-alpha": formatAlpha(isDark ? 0.16 : 0.12),
      "--theme-accent-outline-alpha": formatAlpha(isDark ? 0.42 : 0.32),

      "--color-text-primary": toCssRgb(primaryText),
      "--color-text-on-accent": toHex(accentText),
      "--color-text-on-danger": isDark ? "#fff7f7" : "#fff7f7",
      "--color-text-muted": toCssRgb(mutedText),
      "--color-text-subtle": toCssRgb(mixRgb(primaryText, surfaceStrong, 0.28)),
      "--color-text-faint": toCssRgb(faintText),
      "--color-panel-border-soft": toCssRgb(mixRgb(primaryText, surfaceStrong, isDark ? 0.72 : 0.64), isDark ? 0.24 : 0.2),
      "--color-surface-dark": toCssRgb(surface),
      "--color-surface-dark-strong": toCssRgb(surfaceStrong),
      "--color-accent-fill-start": toCssRgb(accentBase),
      "--color-accent-fill-end": toCssRgb(accentSoft),
      "--color-accent-shadow": toCssRgb(accentBase, isDark ? 0.16 : 0.1),
      "--color-accent-outline": toCssRgb(accentBase),
      "--color-accent-outline-soft": toCssRgb(accentBase, isDark ? 0.35 : 0.22),
      "--color-danger-fill-start": toCssRgb(dangerBase),
      "--color-danger-fill-end": toCssRgb(mixRgb(dangerBase, isDark ? { r: 255, g: 255, b: 255 } : { r: 255, g: 244, b: 244 }, 0.15)),
      "--color-danger-shadow": toCssRgb(dangerBase, isDark ? 0.24 : 0.12),
      "--color-danger-banner-bg": toCssRgb(dangerBase, isDark ? 0.16 : 0.12),
      "--color-danger-banner-border": toCssRgb(dangerBase, isDark ? 0.28 : 0.2),
      "--color-danger-banner-text": toCssRgb(ensureContrast(primaryText, mixRgb(dangerBase, surfaceStrong, 0.7), 4.5, colorScheme)),
      "--color-danger-banner-strong": toCssRgb(ensureContrast(primaryText, mixRgb(dangerBase, surfaceStrong, 0.6), 5, colorScheme)),
      "--color-finger-shadow-base": "rgba(0, 0, 0, 0)",
      "--color-secondary-fill": toCssRgb(raised),
      "--color-secondary-fill-strong": toCssRgb(mixRgb(raised, accentBase, 0.12)),
      "--color-input-border": toCssRgb(mixRgb(primaryText, surfaceStrong, isDark ? 0.7 : 0.54), isDark ? 0.32 : 0.34),
      "--color-panel-shadow": toCssRgb({ r: 0, g: 0, b: 0 }, isDark ? 0.14 : 0.08),
      "--color-surface-raised": toCssRgb(raised),
      "--color-surface-subtle": toCssRgb(subtle),
      "--color-surface-muted": toCssRgb(muted),
      "--color-surface-overlay": toCssRgb(overlay),
      "--color-border-strong": toCssRgb(mixRgb(primaryText, surfaceStrong, isDark ? 0.58 : 0.5), isDark ? 0.42 : 0.26),
      "--color-border-contrast": toCssRgb(mixRgb(primaryText, surfaceStrong, isDark ? 0.44 : 0.36), isDark ? 0.54 : 0.34),
      "--color-text-secondary": toCssRgb(secondaryText),
      "--color-chip-text": toCssRgb(secondaryText),
      "--color-chip-count-text": toCssRgb(mutedText),
      "--color-chip-hover-text": toCssRgb(primaryText),
      "--color-status-success-bg": toCssRgb(successBase, isDark ? 0.18 : 0.12),
      "--color-status-success-border": toCssRgb(successBase, isDark ? 0.28 : 0.18),
      "--color-status-success-text": toCssRgb(primaryText),
      "--color-status-warning-bg": toCssRgb(warningBase, isDark ? 0.18 : 0.12),
      "--color-status-warning-border": toCssRgb(warningBase, isDark ? 0.28 : 0.2),
      "--color-status-warning-text": toCssRgb(primaryText),
      "--color-status-error-bg": toCssRgb(dangerBase, isDark ? 0.16 : 0.1),
      "--color-status-error-border": toCssRgb(dangerBase, isDark ? 0.3 : 0.2),
      "--color-status-error-text": toCssRgb(primaryText),
      "--color-status-info-bg": toCssRgb(infoBase, isDark ? 0.16 : 0.1),
      "--color-status-info-border": toCssRgb(infoBase, isDark ? 0.28 : 0.18),
      "--color-status-info-text": toCssRgb(primaryText),
      "--color-success-chip-bg": toCssRgb(successBase, isDark ? 0.14 : 0.1),
      "--color-success-chip-border": toCssRgb(successBase, isDark ? 0.24 : 0.16),
      "--color-success-chip-text": toCssRgb(primaryText),
      "--color-warning-chip-bg": toCssRgb(warningBase, isDark ? 0.14 : 0.1),
      "--color-warning-chip-border": toCssRgb(warningBase, isDark ? 0.24 : 0.16),
      "--color-warning-chip-text": toCssRgb(primaryText),
      "--color-neutral-chip-bg": toCssRgb(muted),
      "--color-neutral-chip-border": toCssRgb(mixRgb(primaryText, surfaceStrong, 0.74), isDark ? 0.18 : 0.14),
      "--color-neutral-chip-text": toCssRgb(secondaryText)
    }
  };
}

export function getThemeColorScheme(themeId: ThemeId): ThemeColorScheme {
  return themePresets[themeId].mode;
}

export function buildThemeStyleProperties(preference: ThemePreference): Record<string, string> {
  return resolveTheme(preference).cssVariables;
}
