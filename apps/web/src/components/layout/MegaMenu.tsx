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
import { Badge } from "@/components/ui/badge"

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
      className="w-[780px] rounded-xl bg-white border border-[#E2E8F0] p-6 shadow-[0_12px_32px_rgba(15,23,42,0.08)]"
    >
      <div className="grid grid-cols-3 gap-6">
        {columns.map((col, colIdx) => {
          const colTitle =
            col.id && t.has(`megaMenu.columns.${col.id}`)
              ? t(`megaMenu.columns.${col.id}`)
              : col.title

          return (
            <div key={colIdx} className="flex flex-col space-y-3">
              <h4 className="text-[11px] font-semibold tracking-wider uppercase text-[#64748B] px-2">
                {colTitle}
              </h4>
              <div className="flex flex-col space-y-1">
                {col.items.map((item, itemIdx) => {
                  const IconComponent = ICON_MAP[item.iconName] || Sparkles
                  const itemTitle =
                    item.id && t.has(`megaMenu.items.${item.id}.title`)
                      ? t(`megaMenu.items.${item.id}.title`)
                      : item.title
                  const itemDescription =
                    item.id && t.has(`megaMenu.items.${item.id}.description`)
                      ? t(`megaMenu.items.${item.id}.description`)
                      : item.description
                  const itemBadge =
                    item.badge === "Hot" && t.has("badgeHot") ? t("badgeHot") : item.badge

                  return (
                    <Link
                      key={itemIdx}
                      href={item.href}
                      onClick={onClose}
                      className="group flex items-start gap-3 p-2.5 rounded-lg hover:bg-[#F8FAFC] border border-transparent hover:border-[#E2E8F0] transition-colors duration-150"
                    >
                      <div className="h-8 w-8 rounded-md bg-[#635BFF]/10 border border-[#635BFF]/20 flex items-center justify-center text-[#635BFF] group-hover:text-white group-hover:bg-[#635BFF] transition-colors shrink-0 mt-0.5">
                        <IconComponent className="h-4 w-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-semibold text-[#0F172A] group-hover:text-[#635BFF] transition-colors">
                            {itemTitle}
                          </span>
                          {itemBadge && (
                            <Badge
                              variant="default"
                              size="sm"
                              className="px-1.5 py-0 text-[9px] uppercase tracking-wider"
                            >
                              {itemBadge}
                            </Badge>
                          )}
                        </div>
                        <p className="text-[11px] text-[#64748B] line-clamp-2 mt-0.5 leading-relaxed group-hover:text-[#334155]">
                          {itemDescription}
                        </p>
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
        <div className="mt-5 pt-4 border-t border-[#E2E8F0] flex items-center justify-between px-2">
          <span className="text-xs text-[#64748B]">{t("megaMenuFooterNote")}</span>
          <Link
            href={footerLink.href}
            onClick={onClose}
            className="inline-flex items-center gap-1 text-xs font-semibold text-[#635BFF] hover:text-[#4F46E5] transition-colors"
          >
            <span>{footerLink.label}</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      )}
    </div>
  )
}
