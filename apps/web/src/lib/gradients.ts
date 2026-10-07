/**
 * TASCORA Multi-Color Gradient & Accent Design System
 *
 * Provides typed palettes, contrast-safe gradient utilities, and component styling tokens.
 * Indigo-violet is the primary brand anchor (#635BFF), while secondary accents (violet, pink, teal, amber, blue)
 * provide visual rhythm across sections and components.
 */

export type AccentColor = "blue" | "violet" | "pink" | "teal" | "amber" | "indigo"

export interface AccentTheme {
  name: AccentColor
  label: string
  // Color stops
  primary: string // Base vibrant accent (e.g. #2563EB)
  dark: string // Dark stop for high contrast WCAG AA on white (e.g. #1D4ED8)
  light: string // Highlight stop for gradient ends (e.g. #38BDF8)

  // Tailwind utility classes
  textGradientClass: string // Class with background-clip: text (e.g. "text-gradient-blue")
  bgGradientSoftClass: string // Class with soft ambient gradient (e.g. "bg-gradient-blue-soft")

  // Icon container styles
  iconBoxClass: string // Background + border + text for card icons
  iconHoverGradientClass: string // Gradient stops for hovered icon tiles

  // SpotlightCard colors
  spotlightSurface: string // Subtly tinted cursor radial glow (e.g. "rgba(37, 99, 235, 0.08)")
  spotlightBorder: string // Focused border sweep glow (e.g. "rgba(37, 99, 235, 0.25)")

  // Card hover interaction classes
  hoverBorderClass: string
  hoverShadowClass: string
  hoverTextClass: string

  // Badge styles
  badgeClass: string

  // Avatar gradient (for featured freelancers / author badges)
  avatarGradientClass: string

  // Decorative ambient blob color (rgba string for background lights)
  blobRgba: string
}

export const ACCENT_THEMES: Record<AccentColor, AccentTheme> = {
  blue: {
    name: "blue",
    label: "Blue (Primary)",
    primary: "#2563EB",
    dark: "#1D4ED8",
    light: "#38BDF8",
    textGradientClass: "text-gradient-blue",
    bgGradientSoftClass: "bg-gradient-blue-soft",
    iconBoxClass: "bg-blue-50 border-blue-200 text-blue-700",
    iconHoverGradientClass: "group-hover:from-blue-600 group-hover:to-sky-400",
    spotlightSurface: "rgba(37, 99, 235, 0.08)",
    spotlightBorder: "rgba(37, 99, 235, 0.25)",
    hoverBorderClass: "hover:border-blue-300",
    hoverShadowClass: "hover:shadow-[0_20px_40px_-12px_rgba(37,99,235,0.18)]",
    hoverTextClass: "group-hover:text-blue-700",
    badgeClass: "bg-blue-50 text-blue-800 border-blue-200",
    avatarGradientClass: "from-blue-600 to-sky-500",
    blobRgba: "rgba(37, 99, 235, 0.16)",
  },
  violet: {
    name: "violet",
    label: "Violet",
    primary: "#7C3AED",
    dark: "#6D28D9",
    light: "#C084FC",
    textGradientClass: "text-gradient-violet",
    bgGradientSoftClass: "bg-gradient-violet-soft",
    iconBoxClass: "bg-purple-50 border-purple-200 text-purple-700",
    iconHoverGradientClass: "group-hover:from-purple-600 group-hover:to-violet-400",
    spotlightSurface: "rgba(124, 58, 237, 0.08)",
    spotlightBorder: "rgba(124, 58, 237, 0.25)",
    hoverBorderClass: "hover:border-purple-300",
    hoverShadowClass: "hover:shadow-[0_20px_40px_-12px_rgba(124,58,237,0.18)]",
    hoverTextClass: "group-hover:text-purple-700",
    badgeClass: "bg-purple-50 text-purple-800 border-purple-200",
    avatarGradientClass: "from-purple-600 to-violet-500",
    blobRgba: "rgba(124, 58, 237, 0.16)",
  },
  pink: {
    name: "pink",
    label: "Pink / Rose",
    primary: "#DB2777",
    dark: "#BE185D",
    light: "#F9A8D4",
    textGradientClass: "text-gradient-pink",
    bgGradientSoftClass: "bg-gradient-pink-soft",
    iconBoxClass: "bg-pink-50 border-pink-200 text-pink-700",
    iconHoverGradientClass: "group-hover:from-pink-600 group-hover:to-rose-400",
    spotlightSurface: "rgba(219, 39, 119, 0.08)",
    spotlightBorder: "rgba(219, 39, 119, 0.25)",
    hoverBorderClass: "hover:border-pink-300",
    hoverShadowClass: "hover:shadow-[0_20px_40px_-12px_rgba(219,39,119,0.18)]",
    hoverTextClass: "group-hover:text-pink-700",
    badgeClass: "bg-pink-50 text-pink-800 border-pink-200",
    avatarGradientClass: "from-pink-600 to-rose-500",
    blobRgba: "rgba(219, 39, 119, 0.16)",
  },
  teal: {
    name: "teal",
    label: "Teal / Emerald",
    primary: "#0D9488",
    dark: "#0F766E",
    light: "#5EEAD4",
    textGradientClass: "text-gradient-teal",
    bgGradientSoftClass: "bg-gradient-teal-soft",
    iconBoxClass: "bg-teal-50 border-teal-200 text-teal-700",
    iconHoverGradientClass: "group-hover:from-teal-600 group-hover:to-emerald-400",
    spotlightSurface: "rgba(13, 148, 136, 0.08)",
    spotlightBorder: "rgba(13, 148, 136, 0.25)",
    hoverBorderClass: "hover:border-teal-300",
    hoverShadowClass: "hover:shadow-[0_20px_40px_-12px_rgba(13,148,136,0.18)]",
    hoverTextClass: "group-hover:text-teal-700",
    badgeClass: "bg-teal-50 text-teal-800 border-teal-200",
    avatarGradientClass: "from-teal-600 to-emerald-500",
    blobRgba: "rgba(13, 148, 136, 0.16)",
  },
  amber: {
    name: "amber",
    label: "Amber / Orange",
    primary: "#D97706",
    dark: "#B45309",
    light: "#FCD34D",
    textGradientClass: "text-gradient-amber",
    bgGradientSoftClass: "bg-gradient-amber-soft",
    iconBoxClass: "bg-amber-50 border-amber-200 text-amber-800",
    iconHoverGradientClass: "group-hover:from-amber-600 group-hover:to-yellow-400",
    spotlightSurface: "rgba(217, 119, 6, 0.08)",
    spotlightBorder: "rgba(217, 119, 6, 0.25)",
    hoverBorderClass: "hover:border-amber-300",
    hoverShadowClass: "hover:shadow-[0_20px_40px_-12px_rgba(217,119,6,0.18)]",
    hoverTextClass: "group-hover:text-amber-800",
    badgeClass: "bg-amber-50 text-amber-800 border-amber-200",
    avatarGradientClass: "from-amber-600 to-orange-500",
    blobRgba: "rgba(217, 119, 6, 0.16)",
  },
  indigo: {
    name: "indigo",
    label: "Indigo (Primary)",
    primary: "#635BFF",
    dark: "#4F46E5",
    light: "#818CF8",
    textGradientClass: "text-gradient-indigo",
    bgGradientSoftClass: "bg-gradient-indigo-soft",
    iconBoxClass: "bg-[#635BFF]/10 border-[#635BFF]/20 text-[#635BFF]",
    iconHoverGradientClass: "group-hover:from-[#635BFF] group-hover:to-indigo-400",
    spotlightSurface: "rgba(99, 91, 255, 0.08)",
    spotlightBorder: "rgba(99, 91, 255, 0.25)",
    hoverBorderClass: "hover:border-[#635BFF]/40",
    hoverShadowClass: "hover:shadow-[0_20px_40px_-12px_rgba(99,91,255,0.18)]",
    hoverTextClass: "group-hover:text-[#635BFF]",
    badgeClass: "bg-[#635BFF]/10 text-[#635BFF] border-[#635BFF]/25",
    avatarGradientClass: "from-[#635BFF] to-indigo-500",
    blobRgba: "rgba(99, 91, 255, 0.16)",
  },
}

/**
 * Safe accessor for accent theme with fallback to primary indigo.
 */
export function getAccentTheme(accent?: AccentColor | string): AccentTheme {
  if (accent && accent in ACCENT_THEMES) {
    return ACCENT_THEMES[accent as AccentColor]
  }
  return ACCENT_THEMES.indigo
}
