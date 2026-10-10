"use client"

import * as React from "react"
import { Link } from "@/i18n/routing"
import { useTranslations } from "next-intl"
import {
  Code2,
  Cloud,
  Cpu,
  Sparkles,
  Terminal,
  ScanFace,
  Palette,
  PenTool,
  Layers,
  Film,
  TrendingUp,
  Briefcase,
  ArrowRight,
} from "lucide-react"
import { MegaMenuColumn } from "@/data/navigation"

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  Code2,
  Cloud,
  Cpu,
  Sparkles,
  Terminal,
  ScanFace,
  Palette,
  PenTool,
  Layers,
  Film,
  TrendingUp,
  Briefcase,
}

interface MegaMenuProps {
  columns: MegaMenuColumn[]
  footerLink?: { label: string; href: string }
  onClose?: () => void
}

export function MegaMenu({ columns, footerLink, onClose }: MegaMenuProps) {
  const t = useTranslations("nav")
  return (
    <div
      data-testid="mega-menu-dropdown"
      className="w-[720px] max-w-[calc(100vw-48px)] rounded-xl bg-bg-surface border border-border-default p-6 shadow-lg"
    >
      <div className="grid grid-cols-3 gap-6">
        {columns.map((col, colIdx) => {
          const colTitle =
            col.id && t.has(`megaMenu.columns.${col.id}`)
              ? t(`megaMenu.columns.${col.id}`)
              : col.title

          return (
            <div key={colIdx} className="flex flex-col space-y-3">
              <h4 className="text-xs font-semibold tracking-wider uppercase text-text-muted px-2">
                {colTitle}
              </h4>
              <div className="flex flex-col space-y-1">
                {col.items.map((item, itemIdx) => {
                  const IconComponent = ICON_MAP[item.iconName] || Sparkles
                  const itemTitle =
                    item.id && t.has(`megaMenu.items.${item.id}.title`)
                      ? t(`megaMenu.items.${item.id}.title`)
                      : item.title

                  return (
                    <Link
                      key={itemIdx}
                      href={item.href}
                      onClick={onClose}
                      className="group flex min-h-11 items-start gap-3 p-2.5 rounded-lg hover:bg-bg-subtle border border-transparent hover:border-border-default transition-colors duration-150 motion-reduce:transition-none"
                    >
                      <div className="h-8 w-8 rounded-md bg-primary-subtle flex items-center justify-center text-primary shrink-0 mt-0.5">
                        <IconComponent className="h-4 w-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors">
                            {itemTitle}
                          </span>
                        </div>
                      </div>
                    </Link>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>

      {footerLink && (
        <div className="mt-5 pt-4 border-t border-border-default flex items-center justify-between px-2">
          <Link
            href={footerLink.href}
            onClick={onClose}
            className="inline-flex min-h-11 items-center gap-1 text-sm font-semibold text-primary hover:text-primary transition-colors"
          >
            <span>{footerLink.label}</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      )}
    </div>
  )
}
