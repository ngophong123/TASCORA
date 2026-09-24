import { AccentColor } from "@/lib/gradients"

export interface BentoItem {
  id: string
  badgeKey?: string
  titleKey: string
  descKey: string
  accent: AccentColor
  colSpan: 1 | 2
  iconName: string
}

export const BENTO_ITEMS: BentoItem[] = [
  {
    id: "escrow",
    badgeKey: "card1Badge",
    titleKey: "card1Title",
    descKey: "card1Desc",
    accent: "teal",
    colSpan: 2,
    iconName: "ShieldCheck",
  },
  {
    id: "milestones",
    titleKey: "card2Title",
    descKey: "card2Desc",
    accent: "blue",
    colSpan: 1,
    iconName: "Layers",
  },
  {
    id: "messaging",
    titleKey: "card3Title",
    descKey: "card3Desc",
    accent: "violet",
    colSpan: 1,
    iconName: "MessageSquare",
  },
  {
    id: "talent",
    titleKey: "card4Title",
    descKey: "card4Desc",
    accent: "pink",
    colSpan: 2,
    iconName: "Globe",
  },
  {
    id: "vetted",
    titleKey: "card5Title",
    descKey: "card5Desc",
    accent: "amber",
    colSpan: 1,
    iconName: "Award",
  },
  {
    id: "dispute",
    titleKey: "card6Title",
    descKey: "card6Desc",
    accent: "indigo",
    colSpan: 1,
    iconName: "Headphones",
  },
]
