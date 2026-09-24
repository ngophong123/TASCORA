export interface TestimonialItem {
  id: string
  quote: string
  name: string
  role: string
  company: string
  avatarInitials: string
  rating: number
}

export const TESTIMONIALS_DATA: TestimonialItem[] = [
  {
    id: "t-1",
    quote: "TASCORA completely changed how we hire specialists. Having milestone-based escrow payments gives our finance team total peace of mind.",
    name: "Julian Thorne",
    role: "VP of Engineering",
    company: "Apex Fintech",
    avatarInitials: "JT",
    rating: 5,
  },
  {
    id: "t-2",
    quote: "As an independent architect, TASCORA delivers the highest-caliber clients I've ever collaborated with. No race to the bottom, just pure appreciation for craft.",
    name: "Helena Rostova",
    role: "Design Lead",
    company: "Independent Studio",
    avatarInitials: "HR",
    rating: 5,
  },
  {
    id: "t-3",
    quote: "The speed and polish of the talent we discovered here allowed us to ship our AI copilot 3 months ahead of our Series A roadmap.",
    name: "David Chen",
    role: "Co-Founder & CTO",
    company: "Synapse Labs",
    avatarInitials: "DC",
    rating: 5,
  },
]
