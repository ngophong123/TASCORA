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
  ChevronRight,
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
    <div className="w-[780px] rounded-2xl bg-white/98 backdrop-blur-2xl border border-[rgba(15,15,30,0.1)] p-6 shadow-[0_24px_60px_rgba(15,15,30,0.12),0_4px_20px_rgba(37,99,235,0.08)] animate-in fade-in slide-in-from-top-2 duration-200">
      <div className="grid grid-cols-3 gap-6">
        {columns.map((col, colIdx) => (
          <div key={colIdx} className="flex flex-col space-y-3">
            <h4 className="text-[11px] font-semibold tracking-wider uppercase text-[#6B6B7B] px-2">
              {col.title}
            </h4>
            <div className="flex flex-col space-y-1">
              {col.items.map((item, itemIdx) => {
                const IconComponent = ICON_MAP[item.iconName] || Sparkles
                return (
                  <Link
                    key={itemIdx}
                    href={item.href}
                    onClick={onClose}
                    className="group flex items-start gap-3 p-2.5 rounded-xl hover:bg-[#F4F4F8] border border-transparent hover:border-[rgba(15,15,30,0.08)] transition-all duration-200"
                  >
                    <div className="h-8 w-8 rounded-lg bg-[#F4F4F8] border border-[rgba(15,15,30,0.08)] flex items-center justify-center text-blue-700 group-hover:text-white group-hover:bg-blue-600 group-hover:scale-105 transition-all shrink-0 mt-0.5">
                      <IconComponent className="h-4 w-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-semibold text-[#0B0B14] group-hover:text-blue-950 group-hover:translate-x-0.5 transition-all">
                          {item.title}
                        </span>
                        {item.badge && (
                          <Badge variant="gradient" size="sm" className="px-1.5 py-0 text-[9px] uppercase tracking-wider">
                            {item.badge}
                          </Badge>
                        )}
                      </div>
                      <p className="text-[11px] text-[#4B4B5C] line-clamp-2 mt-0.5 leading-relaxed group-hover:text-[#0B0B14]">
                        {item.description}
                      </p>
                    </div>
                  </Link>
                )
              })}
            </div>
          </div>
        ))}
      </div>

      {footerLink && (
        <div className="mt-5 pt-4 border-t border-[rgba(15,15,30,0.08)] flex items-center justify-between px-2">
          <span className="text-xs text-[#6B6B7B]">
            {t("megaMenuFooterNote")}
          </span>
          <Link
            href={footerLink.href}
            onClick={onClose}
            className="inline-flex items-center gap-1 text-xs font-semibold text-blue-700 hover:text-blue-900 transition-colors"
          >
            <span>{footerLink.label}</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      )}
    </div>
  )
}
