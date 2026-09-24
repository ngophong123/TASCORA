export interface StatItem {
  id: string
  value: number
  prefix?: string
  suffix: string
  label: string
}

export const STATS_DATA: StatItem[] = [
  {
    id: "freelancers",
    value: 50,
    suffix: "K+",
    label: "Vetted Freelancers",
  },
  {
    id: "projects",
    value: 120,
    suffix: "K+",
    label: "Milestones Delivered",
  },
  {
    id: "satisfaction",
    value: 98,
    suffix: "%",
    label: "Client Satisfaction",
  },
  {
    id: "payouts",
    value: 40,
    prefix: "$",
    suffix: "M+",
    label: "Paid Out in Escrow",
  },
]
