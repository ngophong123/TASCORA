"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

export interface LogoProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * Predefined sizes or custom height in pixels
   * - "xs": 18px height (compact toolbars)
   * - "sm": 22px height (table cells, mobile bars)
   * - "md": 26px height (standard navbar, default)
   * - "lg": 34px height (dashboard headers, modals)
   * - "xl": 44px height (auth pages, hero displays)
   */
  size?: "xs" | "sm" | "md" | "lg" | "xl" | number
  /**
   * Display mode:
   * - "full": Glyph + "TASCORA" wordmark
   * - "mark": Just the geometric glyph
   * - "wordmark": Just the text wordmark
   */
  variant?: "full" | "mark" | "wordmark"
  /**
   * Theme mode:
   * - "light": Dark navy text (#0A0A23) for light backgrounds (default)
   * - "dark": White text (#FFFFFF) for dark backgrounds
   * - "monochrome": Uses currentColor for everything
   */
  theme?: "light" | "dark" | "monochrome"
  /**
   * Optional badge / subtitle below or beside the wordmark
   */
  subtitle?: string
}

const SIZE_CONFIGS = {
  xs: {
    height: 18,
    glyphSize: 18,
    textClass: "text-sm",
    gap: "gap-1.5",
    letterSpacing: "-0.035em",
  },
  sm: {
    height: 22,
    glyphSize: 22,
    textClass: "text-base",
    gap: "gap-2",
    letterSpacing: "-0.035em",
  },
  md: {
    height: 26,
    glyphSize: 26,
    textClass: "text-lg",
    gap: "gap-2.5",
    letterSpacing: "-0.035em",
  },
  lg: {
    height: 34,
    glyphSize: 34,
    textClass: "text-2xl",
    gap: "gap-3",
    letterSpacing: "-0.04em",
  },
  xl: {
    height: 44,
    glyphSize: 44,
    textClass: "text-3xl",
    gap: "gap-3.5",
    letterSpacing: "-0.045em",
  },
}

/**
 * TASCORA Architectural Keystone Mark
 *
 * A solid, authoritative geometric emblem representing milestone escrow and verified talent:
 * Precision structural lintel and pillar anchored by a central maritime cobalt keystone node.
 * Zero pastel gradients, zero blurry drop shadows.
 */
export function LogoMark({
  size = 26,
  className,
  theme = "light",
}: {
  size?: number
  className?: string
  theme?: "light" | "dark" | "monochrome"
}) {
  if (theme === "monochrome") {
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 32 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={cn("shrink-0", className)}
        aria-hidden="true"
      >
        <rect x="2" y="2" width="28" height="28" rx="7" fill="currentColor" fillOpacity="0.12" />
        <path
          d="M8 9.5C8 9.22386 8.22386 9 8.5 9H23.5C23.7761 9 24 9.22386 24 9.5V12.5C24 12.7761 23.7761 13 23.5 13H18.5V22.5C18.5 22.7761 18.2761 23 18 23H14C13.7239 23 13.5 22.7761 13.5 22.5V13H8.5C8.22386 13 8 12.7761 8 12.5V9.5Z"
          fill="currentColor"
        />
      </svg>
    )
  }

  const bgFill = theme === "dark" ? "#1E293B" : "#0F172A"

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("shrink-0", className)}
      aria-hidden="true"
    >
      {/* Precision architectural foundation container */}
      <rect x="2.5" y="2.5" width="27" height="27" rx="7" fill={bgFill} />

      {/* Structural T Lintel (Top Crossbar) */}
      <path
        d="M8 9.5C8 9.22386 8.22386 9 8.5 9H23.5C23.7761 9 24 9.22386 24 9.5V12.5C24 12.7761 23.7761 13 23.5 13H8.5C8.22386 13 8 12.7761 8 12.5V9.5Z"
        fill="#FFFFFF"
      />

      {/* Structural Pillar (Vertical Stem) */}
      <path
        d="M13.75 13H18.25V22.25C18.25 22.6642 17.9142 23 17.5 23H14.5C14.0858 23 13.75 22.6642 13.75 22.25V13Z"
        fill="#FFFFFF"
      />

      {/* Central Keystone Anchor / Milestone Escrow Node in Indigo-Violet */}
      <rect x="13.75" y="9" width="4.5" height="4" fill="var(--primary, #5046a5)" />
    </svg>
  )
}

/**
 * TASCORA Logo Component
 *
 * Primary brand identifier: confident, authoritative wordmark set in bold geometric sans
 * with tight tracking and architectural keystone mark.
 */
export function Logo({
  size = "md",
  variant = "full",
  theme = "light",
  subtitle,
  className,
  ...props
}: LogoProps) {
  const isPresetSize = typeof size === "string" && size in SIZE_CONFIGS
  const config = isPresetSize ? SIZE_CONFIGS[size as keyof typeof SIZE_CONFIGS] : null
  const numericHeight = typeof size === "number" ? size : (config?.height ?? 26)
  const glyphSize = typeof size === "number" ? Math.round(size * 0.95) : (config?.glyphSize ?? 26)

  const textColorClass =
    theme === "dark" ? "text-white" : theme === "monochrome" ? "text-current" : "text-[#0F172A]"

  return (
    <div
      data-testid="tascora-logo"
      className={cn(
        "inline-flex items-center select-none font-sans",
        config?.gap ?? "gap-2.5",
        className
      )}
      style={{ height: numericHeight }}
      {...props}
    >
      {/* 1. Geometric Mark (if variant is full or mark) */}
      {variant !== "wordmark" && <LogoMark size={glyphSize} theme={theme} />}

      {/* 2. Typography Wordmark (if variant is full or wordmark) */}
      {variant !== "mark" && (
        <div className="flex flex-col justify-center leading-none">
          <span
            className={cn(
              "font-bold tracking-[-0.035em] transition-colors",
              config?.textClass ?? "text-lg",
              textColorClass
            )}
            style={{
              fontFeatureSettings: '"cv02", "cv03", "cv04", "cv11"',
            }}
          >
            TASCORA
          </span>

          {subtitle && (
            <span className="text-[10px] font-medium tracking-wider uppercase text-[#64748B] mt-0.5">
              {subtitle}
            </span>
          )}
        </div>
      )}
    </div>
  )
}
