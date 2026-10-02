/**
 * TASCORA Generated Seed & Mock Data: Reviews & Ratings
 *
 * Auto-generated deterministically with seed 42 for QA & Playwright E2E tests.
 * Total Reviews: 214
 * Regenerate with: npm run seed
 */

export interface ReviewAspects {
  communication: number
  qualityOfDelivery: number
  valueForMoney: number
}

export interface ReviewBuyer {
  id: string
  name: string
  avatar: string
  country: string
  company?: string
}

export interface ReviewSellerResponse {
  comment: string
  respondedAt: string
}

export interface Review {
  id: string
  gigId: string
  orderId?: string
  sellerId: string
  buyer: ReviewBuyer
  rating: number
  comment: string
  createdAt: string
  date: string
  dateFormatted: string
  aspectRatings: ReviewAspects
  sellerResponse?: ReviewSellerResponse
  helpfulCount: number
}

/**
 * Known Test Reviews for Playwright assertions and UI edge cases.
 */
export const KNOWN_TEST_REVIEWS = {
  referenceReviews: [
    {
      id: "rev-2",
      gigId: "gig-1",
      orderId: "ORD-EDGE-2",
      sellerId: "f-1",
      buyer: {
        id: "usr-client-2",
        name: "David Sterling",
        avatar:
          "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=120&auto=format&fit=crop&q=80",
        country: "United States",
        company: "Apex Capital Ventures",
      },
      rating: 5,
      comment:
        "Flawless deliverable. Every edge case was accounted for, and the milestone handover was crystal clear.",
      createdAt: "Jan 15, 2026T16:00:00Z",
      date: "NaN years ago",
      dateFormatted: "NaN years ago",
      aspectRatings: {
        communication: 5,
        qualityOfDelivery: 5,
        valueForMoney: 5,
      },
      helpfulCount: 12,
    },
    {
      id: "rev-3",
      gigId: "gig-1",
      orderId: "ORD-EDGE-3",
      sellerId: "f-1",
      buyer: {
        id: "usr-client-4",
        name: "Rachel Adams",
        avatar:
          "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=120&auto=format&fit=crop&q=80",
        country: "United States",
        company: "Horizon Health Technologies",
      },
      rating: 5,
      comment:
        "Fast, reliable, and exceptionally talented. TASCORA escrow milestone system made the entire transaction smooth and secure.",
      createdAt: "Mar 22, 2026T16:00:00Z",
      date: "NaN years ago",
      dateFormatted: "NaN years ago",
      aspectRatings: {
        communication: 5,
        qualityOfDelivery: 5,
        valueForMoney: 5,
      },
      sellerResponse: {
        comment:
          "Thank you Rachel! It was a pleasure collaborating on this Web Development architecture.",
        respondedAt: "Mar 22, 2026T19:30:00Z",
      },
      helpfulCount: 16,
    },
    {
      id: "rev-58",
      gigId: "gig-1",
      orderId: "ORD-8068",
      sellerId: "f-1",
      buyer: {
        id: "usr-18",
        name: "Minh Nguyen",
        avatar:
          "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80",
        country: "United States",
        company: "Enterprise Partner",
      },
      rating: 5,
      comment:
        "Superb execution. The RAG pipeline latency dropped by 65% and evaluation scores improved dramatically. Highly recommended.",
      createdAt: "2026-02-22T16:00:00Z",
      date: "1 month ago",
      dateFormatted: "1 month ago",
      aspectRatings: {
        communication: 5,
        qualityOfDelivery: 5,
        valueForMoney: 5,
      },
      helpfulCount: 2,
    },
  ],
  edgeCritical: {
    id: "rev-edge-critical",
    gigId: "gig-1",
    sellerId: "f-1",
    buyer: {
      id: "usr-client-2",
      name: "David Sterling",
      avatar:
        "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&auto=format&fit=crop&q=80",
      country: "United States",
      company: "Apex Capital Ventures",
    },
    rating: 3,
    comment:
      "Architectural foundation and database schema were top notch. However, we encountered minor friction during initial deployment on AWS ECS Fargate because of missing environment variable templates. Required two iterations to stabilize.",
    createdAt: "2026-02-14T10:15:00Z",
    date: "1 month ago",
    dateFormatted: "1 month ago",
    aspectRatings: {
      communication: 4,
      qualityOfDelivery: 4,
      valueForMoney: 3,
    },
    sellerResponse: {
      comment:
        "Thank you for the balanced feedback, David. I have since updated the ECS Terraform module to automatically validate task definition environment variables at build time to prevent this scenario completely.",
      respondedAt: "2026-02-15T08:30:00Z",
    },
    helpfulCount: 24,
  },
  edgeLong: {
    id: "rev-edge-long",
    gigId: "gig-1",
    sellerId: "f-1",
    buyer: {
      id: "usr-client-1",
      name: "Marcus Thorne",
      avatar:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80",
      country: "United Kingdom",
      company: "Fintech Corp Ltd",
    },
    rating: 5,
    comment:
      "Alexandre delivered what is easily the cleanest, most maintainable Next.js 15 enterprise architecture our engineering team has ever reviewed.\n\nFrom an architectural perspective, the strict boundary between domain entities, server actions, and client boundary components follows Clean Architecture principles to the letter. Database indexing and foreign key constraints on PostgreSQL via Prisma ORM reduced our cold-start latency from 1.2s to under 45ms.\n\nThe automated test coverage provided deserves special recognition. Not only did we receive unit tests with Vitest, but full Playwright end-to-end user journeys were included out of the box, configured seamlessly with GitHub Actions CI/CD workflows.\n\nIf you are evaluating whether to hire Alexandre for mission-critical infrastructure, do not hesitate. He is a premier tier specialist who elevates the technical standard of any platform he touches.",
    createdAt: "2026-03-01T12:00:00Z",
    date: "3 weeks ago",
    dateFormatted: "3 weeks ago",
    aspectRatings: {
      communication: 5,
      qualityOfDelivery: 5,
      valueForMoney: 5,
    },
    sellerResponse: {
      comment:
        "Marcus, thank you for such an in-depth and generous review! Working with the Fintech Corp engineering team was a phenomenal experience.",
      respondedAt: "2026-03-01T15:20:00Z",
    },
    helpfulCount: 47,
  },
  edgeOneStar: {
    id: "rev-edge-1star",
    gigId: "gig-1",
    orderId: "ORD-EDGE-1",
    sellerId: "f-1",
    buyer: {
      id: "usr-client-3",
      name: "Emily Zhang",
      avatar:
        "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80",
      country: "Singapore",
      company: "Nexus AI Ventures",
    },
    rating: 1,
    comment:
      "Disagreed on scope of deliverables for penetration testing phase. Contract cancelled and refunded via escrow.",
    createdAt: "2026-01-29T14:00:00Z",
    date: "2 months ago",
    dateFormatted: "2 months ago",
    aspectRatings: {
      communication: 2,
      qualityOfDelivery: 2,
      valueForMoney: 1,
    },
    sellerResponse: {
      comment:
        "The project brief included static security analysis; live penetration attack simulations required extended scope which client declined to fund. Handled courteously and escrow was refunded promptly.",
      respondedAt: "2026-01-30T09:00:00Z",
    },
    helpfulCount: 5,
  },
}

/**
 * Complete set of all local seed reviews (214 total).
 */
export const MOCK_REVIEWS: Review[] = [
  {
    id: "rev-1",
    gigId: "gig-3",
    orderId: "ORD-9412",
    sellerId: "f-3",
    buyer: {
      id: "usr-client-2",
      name: "David Sterling",
      avatar:
        "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=120&auto=format&fit=crop&q=80",
      country: "United States",
      company: "Apex Capital Ventures",
    },
    rating: 5,
    comment:
      "World-class craft. The design tokens and components were structured with extreme attention to detail and easily integrated into our codebase.",
    createdAt: "Mar 10, 2026T16:00:00Z",
    date: "NaN years ago",
    dateFormatted: "NaN years ago",
    aspectRatings: {
      communication: 5,
      qualityOfDelivery: 5,
      valueForMoney: 5,
    },
    helpfulCount: 8,
  },
  {
    id: "rev-2",
    gigId: "gig-1",
    orderId: "ORD-EDGE-2",
    sellerId: "f-1",
    buyer: {
      id: "usr-client-2",
      name: "David Sterling",
      avatar:
        "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=120&auto=format&fit=crop&q=80",
      country: "United States",
      company: "Apex Capital Ventures",
    },
    rating: 5,
    comment:
      "Flawless deliverable. Every edge case was accounted for, and the milestone handover was crystal clear.",
    createdAt: "Jan 15, 2026T16:00:00Z",
    date: "NaN years ago",
    dateFormatted: "NaN years ago",
    aspectRatings: {
      communication: 5,
      qualityOfDelivery: 5,
      valueForMoney: 5,
    },
    helpfulCount: 12,
  },
  {
    id: "rev-3",
    gigId: "gig-1",
    orderId: "ORD-EDGE-3",
    sellerId: "f-1",
    buyer: {
      id: "usr-client-4",
      name: "Rachel Adams",
      avatar:
        "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=120&auto=format&fit=crop&q=80",
      country: "United States",
      company: "Horizon Health Technologies",
    },
    rating: 5,
    comment:
      "Fast, reliable, and exceptionally talented. TASCORA escrow milestone system made the entire transaction smooth and secure.",
    createdAt: "Mar 22, 2026T16:00:00Z",
    date: "NaN years ago",
    dateFormatted: "NaN years ago",
    aspectRatings: {
      communication: 5,
      qualityOfDelivery: 5,
      valueForMoney: 5,
    },
    sellerResponse: {
      comment:
        "Thank you Rachel! It was a pleasure collaborating on this Web Development architecture.",
      respondedAt: "Mar 22, 2026T19:30:00Z",
    },
    helpfulCount: 16,
  },
  {
    id: "rev-4",
    gigId: "gig-2",
    orderId: "ORD-8001",
    sellerId: "f-3",
    buyer: {
      id: "usr-client-4",
      name: "Rachel Adams",
      avatar:
        "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80",
      country: "United States",
      company: "Horizon Health Technologies",
    },
    rating: 5,
    comment:
      "One of the best specialists I have hired on any platform. The architecture handles high concurrency effortlessly and was documented thoroughly.",
    createdAt: "2026-03-10T16:00:00Z",
    date: "2 weeks ago",
    dateFormatted: "2 weeks ago",
    aspectRatings: {
      communication: 5,
      qualityOfDelivery: 5,
      valueForMoney: 5,
    },
    helpfulCount: 2,
  },
  {
    id: "rev-5",
    gigId: "gig-3",
    orderId: "ORD-8002",
    sellerId: "f-4",
    buyer: {
      id: "usr-12",
      name: "Priscilla Mertz",
      avatar:
        "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80",
      country: "United States",
      company: "Enterprise Partner",
    },
    rating: 5,
    comment:
      "Incredible turnaround and profound technical depth. Saved our core product team at least a month of engineering time.",
    createdAt: "2026-02-17T16:00:00Z",
    date: "1 month ago",
    dateFormatted: "1 month ago",
    aspectRatings: {
      communication: 5,
      qualityOfDelivery: 5,
      valueForMoney: 5,
    },
    helpfulCount: 6,
  },
  {
    id: "rev-6",
    gigId: "gig-4",
    orderId: "ORD-8003",
    sellerId: "usr-edge-overflow",
    buyer: {
      id: "usr-15",
      name: "Robin Christiansen",
      avatar:
        "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80",
      country: "United States",
      company: "Enterprise Partner",
    },
    rating: 5,
    comment:
      "Exceeded all expectations. The code review and documentation made onboarding our internal engineers seamless.",
    createdAt: "2026-01-24T16:00:00Z",
    date: "1 month ago",
    dateFormatted: "1 month ago",
    aspectRatings: {
      communication: 5,
      qualityOfDelivery: 5,
      valueForMoney: 5,
    },
    helpfulCount: 10,
  },
  {
    id: "rev-7",
    gigId: "gig-5",
    orderId: "ORD-8004",
    sellerId: "usr-edge-brandnew",
    buyer: {
      id: "usr-18",
      name: "Minh Nguyen",
      avatar:
        "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80",
      country: "United States",
      company: "Enterprise Partner",
    },
    rating: 5,
    comment:
      "Outstanding collaboration from day one. Deep domain expertise, prompt communication, and zero friction during milestone sign-offs.",
    createdAt: "2026-03-28T16:00:00Z",
    date: "1 day ago",
    dateFormatted: "1 day ago",
    aspectRatings: {
      communication: 5,
      qualityOfDelivery: 5,
      valueForMoney: 5,
    },
    sellerResponse: {
      comment:
        "Thank you Minh! It was a pleasure collaborating on this Web Development architecture.",
      respondedAt: "2026-03-28T19:30:00Z",
    },
    helpfulCount: 14,
  },
  {
    id: "rev-8",
    gigId: "gig-7",
    orderId: "ORD-8006",
    sellerId: "usr-edge-slow-response",
    buyer: {
      id: "usr-client-3",
      name: "Emily Zhang",
      avatar:
        "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80",
      country: "United States",
      company: "Nexus AI Ventures",
    },
    rating: 5,
    comment:
      "Superb execution. The RAG pipeline latency dropped by 65% and evaluation scores improved dramatically. Highly recommended.",
    createdAt: "2026-01-12T16:00:00Z",
    date: "2 months ago",
    dateFormatted: "2 months ago",
    aspectRatings: {
      communication: 5,
      qualityOfDelivery: 5,
      valueForMoney: 5,
    },
    helpfulCount: 0,
  },
  {
    id: "rev-9",
    gigId: "gig-8",
    orderId: "ORD-8007",
    sellerId: "usr-edge-suspended",
    buyer: {
      id: "usr-11",
      name: "Gregory Bayer",
      avatar:
        "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80",
      country: "United States",
      company: "Enterprise Partner",
    },
    rating: 5,
    comment:
      "True senior specialist. Communication was proactive, thoughtful, and pragmatic. Milestone delivered with zero defects.",
    createdAt: "2026-03-19T16:00:00Z",
    date: "5 days ago",
    dateFormatted: "5 days ago",
    aspectRatings: {
      communication: 5,
      qualityOfDelivery: 5,
      valueForMoney: 5,
    },
    helpfulCount: 4,
  },
  {
    id: "rev-10",
    gigId: "gig-9",
    orderId: "ORD-8008",
    sellerId: "usr-11",
    buyer: {
      id: "usr-14",
      name: "Sandra Zieme-Luettgen",
      avatar:
        "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80",
      country: "United States",
      company: "Enterprise Partner",
    },
    rating: 5,
    comment:
      "Exceptional engineering quality. Delivered ahead of schedule with clean modular code and extensive test coverage. Will definitely work together again.",
    createdAt: "2026-02-20T16:00:00Z",
    date: "1 month ago",
    dateFormatted: "1 month ago",
    aspectRatings: {
      communication: 5,
      qualityOfDelivery: 5,
      valueForMoney: 5,
    },
    helpfulCount: 8,
  },
  {
    id: "rev-11",
    gigId: "gig-10",
    orderId: "ORD-8009",
    sellerId: "usr-12",
    buyer: {
      id: "usr-17",
      name: "Katrina Stehr",
      avatar:
        "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80",
      country: "United States",
      company: "Enterprise Partner",
    },
    rating: 5,
    comment:
      "World-class craft. The design tokens and components were structured with extreme attention to detail and easily integrated into our codebase.",
    createdAt: "2026-01-28T16:00:00Z",
    date: "1 month ago",
    dateFormatted: "1 month ago",
    aspectRatings: {
      communication: 5,
      qualityOfDelivery: 5,
      valueForMoney: 5,
    },
    sellerResponse: {
      comment:
        "Thank you Katrina! It was a pleasure collaborating on this Web Development architecture.",
      respondedAt: "2026-01-28T19:30:00Z",
    },
    helpfulCount: 12,
  },
  {
    id: "rev-12",
    gigId: "gig-12",
    orderId: "ORD-8011",
    sellerId: "usr-14",
    buyer: {
      id: "usr-client-2",
      name: "David Sterling",
      avatar:
        "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80",
      country: "United States",
      company: "Apex Capital Ventures",
    },
    rating: 5,
    comment:
      "Flawless deliverable. Every edge case was accounted for, and the milestone handover was crystal clear.",
    createdAt: "2026-02-07T16:00:00Z",
    date: "1 month ago",
    dateFormatted: "1 month ago",
    aspectRatings: {
      communication: 5,
      qualityOfDelivery: 5,
      valueForMoney: 5,
    },
    helpfulCount: 16,
  },
  {
    id: "rev-13",
    gigId: "gig-13",
    orderId: "ORD-8012",
    sellerId: "usr-15",
    buyer: {
      id: "usr-client-5",
      name: "Liam O'Connor",
      avatar:
        "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80",
      country: "United States",
      company: "Nova Dynamics AI",
    },
    rating: 5,
    comment:
      "Fast, reliable, and exceptionally talented. TASCORA escrow milestone system made the entire transaction smooth and secure.",
    createdAt: "2026-01-11T16:00:00Z",
    date: "2 months ago",
    dateFormatted: "2 months ago",
    aspectRatings: {
      communication: 5,
      qualityOfDelivery: 5,
      valueForMoney: 5,
    },
    helpfulCount: 2,
  },
  {
    id: "rev-14",
    gigId: "gig-14",
    orderId: "ORD-8013",
    sellerId: "usr-16",
    buyer: {
      id: "usr-13",
      name: "River Johns",
      avatar:
        "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80",
      country: "United States",
      company: "Enterprise Partner",
    },
    rating: 5,
    comment:
      "One of the best specialists I have hired on any platform. The architecture handles high concurrency effortlessly and was documented thoroughly.",
    createdAt: "2026-03-17T16:00:00Z",
    date: "1 week ago",
    dateFormatted: "1 week ago",
    aspectRatings: {
      communication: 5,
      qualityOfDelivery: 5,
      valueForMoney: 5,
    },
    helpfulCount: 6,
  },
  {
    id: "rev-15",
    gigId: "gig-15",
    orderId: "ORD-8014",
    sellerId: "usr-17",
    buyer: {
      id: "usr-16",
      name: "David Herzog",
      avatar:
        "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80",
      country: "United States",
      company: "Enterprise Partner",
    },
    rating: 5,
    comment:
      "Incredible turnaround and profound technical depth. Saved our core product team at least a month of engineering time.",
    createdAt: "2026-02-28T16:00:00Z",
    date: "3 weeks ago",
    dateFormatted: "3 weeks ago",
    aspectRatings: {
      communication: 5,
      qualityOfDelivery: 5,
      valueForMoney: 5,
    },
    sellerResponse: {
      comment:
        "Thank you David! It was a pleasure collaborating on this UI/UX & Product Design architecture.",
      respondedAt: "2026-02-28T19:30:00Z",
    },
    helpfulCount: 10,
  },
  {
    id: "rev-16",
    gigId: "gig-17",
    orderId: "ORD-8016",
    sellerId: "usr-19",
    buyer: {
      id: "usr-client-1",
      name: "Marcus Thorne",
      avatar:
        "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80",
      country: "United States",
      company: "Fintech Corp Ltd",
    },
    rating: 5,
    comment:
      "Exceeded all expectations. The code review and documentation made onboarding our internal engineers seamless.",
    createdAt: "2026-03-28T16:00:00Z",
    date: "1 day ago",
    dateFormatted: "1 day ago",
    aspectRatings: {
      communication: 5,
      qualityOfDelivery: 5,
      valueForMoney: 5,
    },
    helpfulCount: 14,
  },
  {
    id: "rev-17",
    gigId: "gig-18",
    orderId: "ORD-8017",
    sellerId: "usr-20",
    buyer: {
      id: "usr-client-4",
      name: "Rachel Adams",
      avatar:
        "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80",
      country: "United States",
      company: "Horizon Health Technologies",
    },
    rating: 5,
    comment:
      "Outstanding collaboration from day one. Deep domain expertise, prompt communication, and zero friction during milestone sign-offs.",
    createdAt: "2026-02-10T16:00:00Z",
    date: "1 month ago",
    dateFormatted: "1 month ago",
    aspectRatings: {
      communication: 5,
      qualityOfDelivery: 5,
      valueForMoney: 5,
    },
    helpfulCount: 0,
  },
  {
    id: "rev-18",
    gigId: "gig-19",
    orderId: "ORD-8018",
    sellerId: "usr-21",
    buyer: {
      id: "usr-12",
      name: "Priscilla Mertz",
      avatar:
        "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80",
      country: "United States",
      company: "Enterprise Partner",
    },
    rating: 5,
    comment:
      "Superb execution. The RAG pipeline latency dropped by 65% and evaluation scores improved dramatically. Highly recommended.",
    createdAt: "2026-01-15T16:00:00Z",
    date: "2 months ago",
    dateFormatted: "2 months ago",
    aspectRatings: {
      communication: 5,
      qualityOfDelivery: 5,
      valueForMoney: 5,
    },
    helpfulCount: 4,
  },
  {
    id: "rev-19",
    gigId: "gig-20",
    orderId: "ORD-8019",
    sellerId: "usr-22",
    buyer: {
      id: "usr-15",
      name: "Robin Christiansen",
      avatar:
        "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80",
      country: "United States",
      company: "Enterprise Partner",
    },
    rating: 5,
    comment:
      "True senior specialist. Communication was proactive, thoughtful, and pragmatic. Milestone delivered with zero defects.",
    createdAt: "2026-03-23T16:00:00Z",
    date: "1 day ago",
    dateFormatted: "1 day ago",
    aspectRatings: {
      communication: 5,
      qualityOfDelivery: 5,
      valueForMoney: 5,
    },
    sellerResponse: {
      comment:
        "Thank you Robin! It was a pleasure collaborating on this UI/UX & Product Design architecture.",
      respondedAt: "2026-03-23T19:30:00Z",
    },
    helpfulCount: 8,
  },
  {
    id: "rev-20",
    gigId: "gig-22",
    orderId: "ORD-8021",
    sellerId: "usr-24",
    buyer: {
      id: "f-1",
      name: "Alexandre Moreau",
      avatar:
        "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
      country: "United States",
      company: "Enterprise Partner",
    },
    rating: 5,
    comment:
      "Exceptional engineering quality. Delivered ahead of schedule with clean modular code and extensive test coverage. Will definitely work together again.",
    createdAt: "2026-01-28T16:00:00Z",
    date: "1 month ago",
    dateFormatted: "1 month ago",
    aspectRatings: {
      communication: 5,
      qualityOfDelivery: 5,
      valueForMoney: 5,
    },
    helpfulCount: 12,
  },
  {
    id: "rev-21",
    gigId: "gig-23",
    orderId: "ORD-8022",
    sellerId: "usr-25",
    buyer: {
      id: "usr-client-3",
      name: "Emily Zhang",
      avatar:
        "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80",
      country: "United States",
      company: "Nexus AI Ventures",
    },
    rating: 5,
    comment:
      "World-class craft. The design tokens and components were structured with extreme attention to detail and easily integrated into our codebase.",
    createdAt: "2026-03-10T16:00:00Z",
    date: "2 weeks ago",
    dateFormatted: "2 weeks ago",
    aspectRatings: {
      communication: 5,
      qualityOfDelivery: 5,
      valueForMoney: 5,
    },
    helpfulCount: 16,
  },
  {
    id: "rev-22",
    gigId: "gig-24",
    orderId: "ORD-8023",
    sellerId: "usr-26",
    buyer: {
      id: "usr-11",
      name: "Gregory Bayer",
      avatar:
        "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80",
      country: "United States",
      company: "Enterprise Partner",
    },
    rating: 5,
    comment:
      "Flawless deliverable. Every edge case was accounted for, and the milestone handover was crystal clear.",
    createdAt: "2026-02-17T16:00:00Z",
    date: "1 month ago",
    dateFormatted: "1 month ago",
    aspectRatings: {
      communication: 5,
      qualityOfDelivery: 5,
      valueForMoney: 5,
    },
    helpfulCount: 2,
  },
  {
    id: "rev-23",
    gigId: "gig-25",
    orderId: "ORD-8024",
    sellerId: "usr-27",
    buyer: {
      id: "usr-14",
      name: "Sandra Zieme-Luettgen",
      avatar:
        "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80",
      country: "United States",
      company: "Enterprise Partner",
    },
    rating: 5,
    comment:
      "Fast, reliable, and exceptionally talented. TASCORA escrow milestone system made the entire transaction smooth and secure.",
    createdAt: "2026-01-28T16:00:00Z",
    date: "1 month ago",
    dateFormatted: "1 month ago",
    aspectRatings: {
      communication: 5,
      qualityOfDelivery: 5,
      valueForMoney: 5,
    },
    sellerResponse: {
      comment:
        "Thank you Sandra! It was a pleasure collaborating on this AI & Automation architecture.",
      respondedAt: "2026-01-28T19:30:00Z",
    },
    helpfulCount: 6,
  },
  {
    id: "rev-24",
    gigId: "gig-27",
    orderId: "ORD-8026",
    sellerId: "usr-29",
    buyer: {
      id: "usr-20",
      name: "Mitchell Ankunding",
      avatar:
        "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80",
      country: "United States",
      company: "Enterprise Partner",
    },
    rating: 5,
    comment:
      "One of the best specialists I have hired on any platform. The architecture handles high concurrency effortlessly and was documented thoroughly.",
    createdAt: "2026-02-28T16:00:00Z",
    date: "3 weeks ago",
    dateFormatted: "3 weeks ago",
    aspectRatings: {
      communication: 5,
      qualityOfDelivery: 5,
      valueForMoney: 5,
    },
    helpfulCount: 10,
  },
  {
    id: "rev-25",
    gigId: "gig-28",
    orderId: "ORD-8027",
    sellerId: "usr-30",
    buyer: {
      id: "usr-client-2",
      name: "David Sterling",
      avatar:
        "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80",
      country: "United States",
      company: "Apex Capital Ventures",
    },
    rating: 5,
    comment:
      "Incredible turnaround and profound technical depth. Saved our core product team at least a month of engineering time.",
    createdAt: "2026-01-09T16:00:00Z",
    date: "2 months ago",
    dateFormatted: "2 months ago",
    aspectRatings: {
      communication: 5,
      qualityOfDelivery: 5,
      valueForMoney: 5,
    },
    helpfulCount: 14,
  },
  {
    id: "rev-26",
    gigId: "gig-29",
    orderId: "ORD-8028",
    sellerId: "usr-31",
    buyer: {
      id: "usr-client-5",
      name: "Liam O'Connor",
      avatar:
        "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80",
      country: "United States",
      company: "Nova Dynamics AI",
    },
    rating: 5,
    comment:
      "Exceeded all expectations. The code review and documentation made onboarding our internal engineers seamless.",
    createdAt: "2026-03-13T16:00:00Z",
    date: "1 week ago",
    dateFormatted: "1 week ago",
    aspectRatings: {
      communication: 5,
      qualityOfDelivery: 5,
      valueForMoney: 5,
    },
    helpfulCount: 0,
  },
  {
    id: "rev-27",
    gigId: "gig-30",
    orderId: "ORD-8029",
    sellerId: "usr-32",
    buyer: {
      id: "usr-13",
      name: "River Johns",
      avatar:
        "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80",
      country: "United States",
      company: "Enterprise Partner",
    },
    rating: 5,
    comment:
      "Outstanding collaboration from day one. Deep domain expertise, prompt communication, and zero friction during milestone sign-offs.",
    createdAt: "2026-02-22T16:00:00Z",
    date: "1 month ago",
    dateFormatted: "1 month ago",
    aspectRatings: {
      communication: 5,
      qualityOfDelivery: 5,
      valueForMoney: 5,
    },
    sellerResponse: {
      comment:
        "Thank you River! It was a pleasure collaborating on this AI & Automation architecture.",
      respondedAt: "2026-02-22T19:30:00Z",
    },
    helpfulCount: 4,
  },
  {
    id: "rev-28",
    gigId: "gig-32",
    orderId: "ORD-8031",
    sellerId: "usr-34",
    buyer: {
      id: "usr-19",
      name: "Sherwood Barrows",
      avatar:
        "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80",
      country: "United States",
      company: "Enterprise Partner",
    },
    rating: 5,
    comment:
      "Superb execution. The RAG pipeline latency dropped by 65% and evaluation scores improved dramatically. Highly recommended.",
    createdAt: "2026-03-27T16:00:00Z",
    date: "1 day ago",
    dateFormatted: "1 day ago",
    aspectRatings: {
      communication: 5,
      qualityOfDelivery: 5,
      valueForMoney: 5,
    },
    helpfulCount: 8,
  },
  {
    id: "rev-29",
    gigId: "gig-33",
    orderId: "ORD-8032",
    sellerId: "usr-35",
    buyer: {
      id: "usr-client-1",
      name: "Marcus Thorne",
      avatar:
        "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80",
      country: "United States",
      company: "Fintech Corp Ltd",
    },
    rating: 5,
    comment:
      "True senior specialist. Communication was proactive, thoughtful, and pragmatic. Milestone delivered with zero defects.",
    createdAt: "2026-02-28T16:00:00Z",
    date: "3 weeks ago",
    dateFormatted: "3 weeks ago",
    aspectRatings: {
      communication: 5,
      qualityOfDelivery: 5,
      valueForMoney: 5,
    },
    helpfulCount: 12,
  },
  {
    id: "rev-30",
    gigId: "gig-34",
    orderId: "ORD-8033",
    sellerId: "usr-36",
    buyer: {
      id: "usr-client-4",
      name: "Rachel Adams",
      avatar:
        "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80",
      country: "United States",
      company: "Horizon Health Technologies",
    },
    rating: 5,
    comment:
      "Exceptional engineering quality. Delivered ahead of schedule with clean modular code and extensive test coverage. Will definitely work together again.",
    createdAt: "2026-01-11T16:00:00Z",
    date: "2 months ago",
    dateFormatted: "2 months ago",
    aspectRatings: {
      communication: 5,
      qualityOfDelivery: 5,
      valueForMoney: 5,
    },
    helpfulCount: 16,
  },
  {
    id: "rev-31",
    gigId: "gig-35",
    orderId: "ORD-8034",
    sellerId: "usr-37",
    buyer: {
      id: "usr-12",
      name: "Priscilla Mertz",
      avatar:
        "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80",
      country: "United States",
      company: "Enterprise Partner",
    },
    rating: 5,
    comment:
      "World-class craft. The design tokens and components were structured with extreme attention to detail and easily integrated into our codebase.",
    createdAt: "2026-03-20T16:00:00Z",
    date: "4 days ago",
    dateFormatted: "4 days ago",
    aspectRatings: {
      communication: 5,
      qualityOfDelivery: 5,
      valueForMoney: 5,
    },
    sellerResponse: {
      comment:
        "Thank you Priscilla! It was a pleasure collaborating on this AI & Automation architecture.",
      respondedAt: "2026-03-20T19:30:00Z",
    },
    helpfulCount: 2,
  },
  {
    id: "rev-32",
    gigId: "gig-37",
    orderId: "ORD-8036",
    sellerId: "usr-39",
    buyer: {
      id: "usr-18",
      name: "Minh Nguyen",
      avatar:
        "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80",
      country: "United States",
      company: "Enterprise Partner",
    },
    rating: 5,
    comment:
      "Flawless deliverable. Every edge case was accounted for, and the milestone handover was crystal clear.",
    createdAt: "2026-01-23T16:00:00Z",
    date: "2 months ago",
    dateFormatted: "2 months ago",
    aspectRatings: {
      communication: 5,
      qualityOfDelivery: 5,
      valueForMoney: 5,
    },
    helpfulCount: 6,
  },
  {
    id: "rev-33",
    gigId: "gig-38",
    orderId: "ORD-8037",
    sellerId: "usr-40",
    buyer: {
      id: "f-1",
      name: "Alexandre Moreau",
      avatar:
        "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
      country: "United States",
      company: "Enterprise Partner",
    },
    rating: 5,
    comment:
      "Fast, reliable, and exceptionally talented. TASCORA escrow milestone system made the entire transaction smooth and secure.",
    createdAt: "2026-03-28T16:00:00Z",
    date: "1 day ago",
    dateFormatted: "1 day ago",
    aspectRatings: {
      communication: 5,
      qualityOfDelivery: 5,
      valueForMoney: 5,
    },
    helpfulCount: 10,
  },
  {
    id: "rev-34",
    gigId: "gig-39",
    orderId: "ORD-8038",
    sellerId: "usr-41",
    buyer: {
      id: "usr-client-3",
      name: "Emily Zhang",
      avatar:
        "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80",
      country: "United States",
      company: "Nexus AI Ventures",
    },
    rating: 5,
    comment:
      "One of the best specialists I have hired on any platform. The architecture handles high concurrency effortlessly and was documented thoroughly.",
    createdAt: "2026-02-06T16:00:00Z",
    date: "1 month ago",
    dateFormatted: "1 month ago",
    aspectRatings: {
      communication: 5,
      qualityOfDelivery: 5,
      valueForMoney: 5,
    },
    helpfulCount: 14,
  },
  {
    id: "rev-35",
    gigId: "gig-40",
    orderId: "ORD-8039",
    sellerId: "f-1",
    buyer: {
      id: "usr-11",
      name: "Gregory Bayer",
      avatar:
        "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80",
      country: "United States",
      company: "Enterprise Partner",
    },
    rating: 5,
    comment:
      "Incredible turnaround and profound technical depth. Saved our core product team at least a month of engineering time.",
    createdAt: "2026-01-16T16:00:00Z",
    date: "2 months ago",
    dateFormatted: "2 months ago",
    aspectRatings: {
      communication: 5,
      qualityOfDelivery: 5,
      valueForMoney: 5,
    },
    sellerResponse: {
      comment:
        "Thank you Gregory! It was a pleasure collaborating on this Technical SEO & Growth architecture.",
      respondedAt: "2026-01-16T19:30:00Z",
    },
    helpfulCount: 0,
  },
  {
    id: "rev-36",
    gigId: "gig-42",
    orderId: "ORD-8041",
    sellerId: "f-3",
    buyer: {
      id: "usr-17",
      name: "Katrina Stehr",
      avatar:
        "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80",
      country: "United States",
      company: "Enterprise Partner",
    },
    rating: 5,
    comment:
      "Exceeded all expectations. The code review and documentation made onboarding our internal engineers seamless.",
    createdAt: "2026-02-22T16:00:00Z",
    date: "1 month ago",
    dateFormatted: "1 month ago",
    aspectRatings: {
      communication: 5,
      qualityOfDelivery: 5,
      valueForMoney: 5,
    },
    helpfulCount: 4,
  },
  {
    id: "rev-37",
    gigId: "gig-43",
    orderId: "ORD-8042",
    sellerId: "f-4",
    buyer: {
      id: "usr-20",
      name: "Mitchell Ankunding",
      avatar:
        "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80",
      country: "United States",
      company: "Enterprise Partner",
    },
    rating: 5,
    comment:
      "Outstanding collaboration from day one. Deep domain expertise, prompt communication, and zero friction during milestone sign-offs.",
    createdAt: "2026-01-26T16:00:00Z",
    date: "1 month ago",
    dateFormatted: "1 month ago",
    aspectRatings: {
      communication: 5,
      qualityOfDelivery: 5,
      valueForMoney: 5,
    },
    helpfulCount: 8,
  },
  {
    id: "rev-38",
    gigId: "gig-44",
    orderId: "ORD-8043",
    sellerId: "usr-edge-overflow",
    buyer: {
      id: "usr-client-2",
      name: "David Sterling",
      avatar:
        "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80",
      country: "United States",
      company: "Apex Capital Ventures",
    },
    rating: 5,
    comment:
      "Superb execution. The RAG pipeline latency dropped by 65% and evaluation scores improved dramatically. Highly recommended.",
    createdAt: "2026-03-28T16:00:00Z",
    date: "1 day ago",
    dateFormatted: "1 day ago",
    aspectRatings: {
      communication: 5,
      qualityOfDelivery: 5,
      valueForMoney: 5,
    },
    helpfulCount: 12,
  },
  {
    id: "rev-39",
    gigId: "gig-45",
    orderId: "ORD-8044",
    sellerId: "usr-edge-brandnew",
    buyer: {
      id: "usr-client-5",
      name: "Liam O'Connor",
      avatar:
        "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80",
      country: "United States",
      company: "Nova Dynamics AI",
    },
    rating: 5,
    comment:
      "True senior specialist. Communication was proactive, thoughtful, and pragmatic. Milestone delivered with zero defects.",
    createdAt: "2026-02-12T16:00:00Z",
    date: "1 month ago",
    dateFormatted: "1 month ago",
    aspectRatings: {
      communication: 5,
      qualityOfDelivery: 5,
      valueForMoney: 5,
    },
    sellerResponse: {
      comment:
        "Thank you Liam! It was a pleasure collaborating on this Technical Writing architecture.",
      respondedAt: "2026-02-12T19:30:00Z",
    },
    helpfulCount: 16,
  },
  {
    id: "rev-40",
    gigId: "gig-47",
    orderId: "ORD-8046",
    sellerId: "usr-edge-slow-response",
    buyer: {
      id: "usr-16",
      name: "David Herzog",
      avatar:
        "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80",
      country: "United States",
      company: "Enterprise Partner",
    },
    rating: 5,
    comment:
      "Exceptional engineering quality. Delivered ahead of schedule with clean modular code and extensive test coverage. Will definitely work together again.",
    createdAt: "2026-03-19T16:00:00Z",
    date: "5 days ago",
    dateFormatted: "5 days ago",
    aspectRatings: {
      communication: 5,
      qualityOfDelivery: 5,
      valueForMoney: 5,
    },
    helpfulCount: 2,
  },
  {
    id: "rev-41",
    gigId: "gig-48",
    orderId: "ORD-8047",
    sellerId: "usr-edge-suspended",
    buyer: {
      id: "usr-19",
      name: "Sherwood Barrows",
      avatar:
        "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80",
      country: "United States",
      company: "Enterprise Partner",
    },
    rating: 5,
    comment:
      "World-class craft. The design tokens and components were structured with extreme attention to detail and easily integrated into our codebase.",
    createdAt: "2026-02-27T16:00:00Z",
    date: "3 weeks ago",
    dateFormatted: "3 weeks ago",
    aspectRatings: {
      communication: 5,
      qualityOfDelivery: 5,
      valueForMoney: 5,
    },
    helpfulCount: 6,
  },
  {
    id: "rev-42",
    gigId: "gig-49",
    orderId: "ORD-8048",
    sellerId: "usr-11",
    buyer: {
      id: "usr-client-1",
      name: "Marcus Thorne",
      avatar:
        "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80",
      country: "United States",
      company: "Fintech Corp Ltd",
    },
    rating: 5,
    comment:
      "Flawless deliverable. Every edge case was accounted for, and the milestone handover was crystal clear.",
    createdAt: "2026-01-28T16:00:00Z",
    date: "1 month ago",
    dateFormatted: "1 month ago",
    aspectRatings: {
      communication: 5,
      qualityOfDelivery: 5,
      valueForMoney: 5,
    },
    helpfulCount: 10,
  },
  {
    id: "rev-43",
    gigId: "gig-50",
    orderId: "ORD-8049",
    sellerId: "usr-12",
    buyer: {
      id: "usr-client-4",
      name: "Rachel Adams",
      avatar:
        "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80",
      country: "United States",
      company: "Horizon Health Technologies",
    },
    rating: 5,
    comment:
      "Fast, reliable, and exceptionally talented. TASCORA escrow milestone system made the entire transaction smooth and secure.",
    createdAt: "2026-03-15T16:00:00Z",
    date: "1 week ago",
    dateFormatted: "1 week ago",
    aspectRatings: {
      communication: 5,
      qualityOfDelivery: 5,
      valueForMoney: 5,
    },
    sellerResponse: {
      comment:
        "Thank you Rachel! It was a pleasure collaborating on this UI/UX & Product Design architecture.",
      respondedAt: "2026-03-15T19:30:00Z",
    },
    helpfulCount: 14,
  },
  {
    id: "rev-44",
    gigId: "gig-52",
    orderId: "ORD-8051",
    sellerId: "usr-14",
    buyer: {
      id: "usr-15",
      name: "Robin Christiansen",
      avatar:
        "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80",
      country: "United States",
      company: "Enterprise Partner",
    },
    rating: 5,
    comment:
      "One of the best specialists I have hired on any platform. The architecture handles high concurrency effortlessly and was documented thoroughly.",
    createdAt: "2026-01-17T16:00:00Z",
    date: "2 months ago",
    dateFormatted: "2 months ago",
    aspectRatings: {
      communication: 5,
      qualityOfDelivery: 5,
      valueForMoney: 5,
    },
    helpfulCount: 0,
  },
  {
    id: "rev-45",
    gigId: "gig-53",
    orderId: "ORD-8052",
    sellerId: "usr-15",
    buyer: {
      id: "usr-18",
      name: "Minh Nguyen",
      avatar:
        "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80",
      country: "United States",
      company: "Enterprise Partner",
    },
    rating: 5,
    comment:
      "Incredible turnaround and profound technical depth. Saved our core product team at least a month of engineering time.",
    createdAt: "2026-03-24T16:00:00Z",
    date: "1 day ago",
    dateFormatted: "1 day ago",
    aspectRatings: {
      communication: 5,
      qualityOfDelivery: 5,
      valueForMoney: 5,
    },
    helpfulCount: 4,
  },
  {
    id: "rev-46",
    gigId: "gig-54",
    orderId: "ORD-8053",
    sellerId: "usr-16",
    buyer: {
      id: "f-1",
      name: "Alexandre Moreau",
      avatar:
        "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
      country: "United States",
      company: "Enterprise Partner",
    },
    rating: 5,
    comment:
      "Exceeded all expectations. The code review and documentation made onboarding our internal engineers seamless.",
    createdAt: "2026-02-28T16:00:00Z",
    date: "3 weeks ago",
    dateFormatted: "3 weeks ago",
    aspectRatings: {
      communication: 5,
      qualityOfDelivery: 5,
      valueForMoney: 5,
    },
    helpfulCount: 8,
  },
  {
    id: "rev-47",
    gigId: "gig-55",
    orderId: "ORD-8054",
    sellerId: "usr-17",
    buyer: {
      id: "usr-client-3",
      name: "Emily Zhang",
      avatar:
        "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80",
      country: "United States",
      company: "Nexus AI Ventures",
    },
    rating: 5,
    comment:
      "Outstanding collaboration from day one. Deep domain expertise, prompt communication, and zero friction during milestone sign-offs.",
    createdAt: "2026-01-09T16:00:00Z",
    date: "2 months ago",
    dateFormatted: "2 months ago",
    aspectRatings: {
      communication: 5,
      qualityOfDelivery: 5,
      valueForMoney: 5,
    },
    sellerResponse: {
      comment:
        "Thank you Emily! It was a pleasure collaborating on this Web Development architecture.",
      respondedAt: "2026-01-09T19:30:00Z",
    },
    helpfulCount: 12,
  },
  {
    id: "rev-48",
    gigId: "gig-57",
    orderId: "ORD-8056",
    sellerId: "usr-19",
    buyer: {
      id: "usr-14",
      name: "Sandra Zieme-Luettgen",
      avatar:
        "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80",
      country: "United States",
      company: "Enterprise Partner",
    },
    rating: 5,
    comment:
      "Superb execution. The RAG pipeline latency dropped by 65% and evaluation scores improved dramatically. Highly recommended.",
    createdAt: "2026-02-17T16:00:00Z",
    date: "1 month ago",
    dateFormatted: "1 month ago",
    aspectRatings: {
      communication: 5,
      qualityOfDelivery: 5,
      valueForMoney: 5,
    },
    helpfulCount: 16,
  },
  {
    id: "rev-49",
    gigId: "gig-58",
    orderId: "ORD-8057",
    sellerId: "usr-20",
    buyer: {
      id: "usr-17",
      name: "Katrina Stehr",
      avatar:
        "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80",
      country: "United States",
      company: "Enterprise Partner",
    },
    rating: 5,
    comment:
      "True senior specialist. Communication was proactive, thoughtful, and pragmatic. Milestone delivered with zero defects.",
    createdAt: "2026-01-23T16:00:00Z",
    date: "2 months ago",
    dateFormatted: "2 months ago",
    aspectRatings: {
      communication: 5,
      qualityOfDelivery: 5,
      valueForMoney: 5,
    },
    helpfulCount: 2,
  },
  {
    id: "rev-50",
    gigId: "gig-59",
    orderId: "ORD-8058",
    sellerId: "usr-21",
    buyer: {
      id: "usr-20",
      name: "Mitchell Ankunding",
      avatar:
        "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80",
      country: "United States",
      company: "Enterprise Partner",
    },
    rating: 5,
    comment:
      "Exceptional engineering quality. Delivered ahead of schedule with clean modular code and extensive test coverage. Will definitely work together again.",
    createdAt: "2026-03-27T16:00:00Z",
    date: "1 day ago",
    dateFormatted: "1 day ago",
    aspectRatings: {
      communication: 5,
      qualityOfDelivery: 5,
      valueForMoney: 5,
    },
    helpfulCount: 6,
  },
  {
    id: "rev-51",
    gigId: "gig-60",
    orderId: "ORD-8059",
    sellerId: "usr-22",
    buyer: {
      id: "usr-client-2",
      name: "David Sterling",
      avatar:
        "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80",
      country: "United States",
      company: "Apex Capital Ventures",
    },
    rating: 5,
    comment:
      "World-class craft. The design tokens and components were structured with extreme attention to detail and easily integrated into our codebase.",
    createdAt: "2026-02-28T16:00:00Z",
    date: "3 weeks ago",
    dateFormatted: "3 weeks ago",
    aspectRatings: {
      communication: 5,
      qualityOfDelivery: 5,
      valueForMoney: 5,
    },
    sellerResponse: {
      comment:
        "Thank you David! It was a pleasure collaborating on this Web Development architecture.",
      respondedAt: "2026-02-28T19:30:00Z",
    },
    helpfulCount: 10,
  },
  {
    id: "rev-52",
    gigId: "gig-62",
    orderId: "ORD-8061",
    sellerId: "usr-24",
    buyer: {
      id: "usr-13",
      name: "River Johns",
      avatar:
        "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80",
      country: "United States",
      company: "Enterprise Partner",
    },
    rating: 5,
    comment:
      "Flawless deliverable. Every edge case was accounted for, and the milestone handover was crystal clear.",
    createdAt: "2026-03-16T16:00:00Z",
    date: "1 week ago",
    dateFormatted: "1 week ago",
    aspectRatings: {
      communication: 5,
      qualityOfDelivery: 5,
      valueForMoney: 5,
    },
    helpfulCount: 14,
  },
  {
    id: "rev-53",
    gigId: "gig-63",
    orderId: "ORD-8062",
    sellerId: "usr-25",
    buyer: {
      id: "usr-16",
      name: "David Herzog",
      avatar:
        "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80",
      country: "United States",
      company: "Enterprise Partner",
    },
    rating: 5,
    comment:
      "Fast, reliable, and exceptionally talented. TASCORA escrow milestone system made the entire transaction smooth and secure.",
    createdAt: "2026-02-18T16:00:00Z",
    date: "1 month ago",
    dateFormatted: "1 month ago",
    aspectRatings: {
      communication: 5,
      qualityOfDelivery: 5,
      valueForMoney: 5,
    },
    helpfulCount: 0,
  },
  {
    id: "rev-54",
    gigId: "gig-edge-single-tier",
    orderId: "ORD-8063",
    sellerId: "f-1",
    buyer: {
      id: "usr-19",
      name: "Sherwood Barrows",
      avatar:
        "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80",
      country: "United States",
      company: "Enterprise Partner",
    },
    rating: 5,
    comment:
      "One of the best specialists I have hired on any platform. The architecture handles high concurrency effortlessly and was documented thoroughly.",
    createdAt: "2026-01-21T16:00:00Z",
    date: "2 months ago",
    dateFormatted: "2 months ago",
    aspectRatings: {
      communication: 5,
      qualityOfDelivery: 5,
      valueForMoney: 5,
    },
    helpfulCount: 4,
  },
  {
    id: "rev-55",
    gigId: "gig-edge-overflow-title",
    orderId: "ORD-8064",
    sellerId: "usr-edge-overflow",
    buyer: {
      id: "usr-client-1",
      name: "Marcus Thorne",
      avatar:
        "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80",
      country: "United States",
      company: "Fintech Corp Ltd",
    },
    rating: 5,
    comment:
      "Incredible turnaround and profound technical depth. Saved our core product team at least a month of engineering time.",
    createdAt: "2026-03-28T16:00:00Z",
    date: "1 day ago",
    dateFormatted: "1 day ago",
    aspectRatings: {
      communication: 5,
      qualityOfDelivery: 5,
      valueForMoney: 5,
    },
    sellerResponse: {
      comment:
        "Thank you Marcus! It was a pleasure collaborating on this Web Development architecture.",
      respondedAt: "2026-03-28T19:30:00Z",
    },
    helpfulCount: 8,
  },
  {
    id: "rev-56",
    gigId: "gig-edge-draft",
    orderId: "ORD-8066",
    sellerId: "f-3",
    buyer: {
      id: "usr-12",
      name: "Priscilla Mertz",
      avatar:
        "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80",
      country: "United States",
      company: "Enterprise Partner",
    },
    rating: 5,
    comment:
      "Exceeded all expectations. The code review and documentation made onboarding our internal engineers seamless.",
    createdAt: "2026-01-12T16:00:00Z",
    date: "2 months ago",
    dateFormatted: "2 months ago",
    aspectRatings: {
      communication: 5,
      qualityOfDelivery: 5,
      valueForMoney: 5,
    },
    helpfulCount: 12,
  },
  {
    id: "rev-57",
    gigId: "gig-edge-max-addons",
    orderId: "ORD-8067",
    sellerId: "f-1",
    buyer: {
      id: "usr-15",
      name: "Robin Christiansen",
      avatar:
        "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80",
      country: "United States",
      company: "Enterprise Partner",
    },
    rating: 5,
    comment:
      "Outstanding collaboration from day one. Deep domain expertise, prompt communication, and zero friction during milestone sign-offs.",
    createdAt: "2026-03-17T16:00:00Z",
    date: "1 week ago",
    dateFormatted: "1 week ago",
    aspectRatings: {
      communication: 5,
      qualityOfDelivery: 5,
      valueForMoney: 5,
    },
    helpfulCount: 16,
  },
  {
    id: "rev-58",
    gigId: "gig-1",
    orderId: "ORD-8068",
    sellerId: "f-1",
    buyer: {
      id: "usr-18",
      name: "Minh Nguyen",
      avatar:
        "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80",
      country: "United States",
      company: "Enterprise Partner",
    },
    rating: 5,
    comment:
      "Superb execution. The RAG pipeline latency dropped by 65% and evaluation scores improved dramatically. Highly recommended.",
    createdAt: "2026-02-22T16:00:00Z",
    date: "1 month ago",
    dateFormatted: "1 month ago",
    aspectRatings: {
      communication: 5,
      qualityOfDelivery: 5,
      valueForMoney: 5,
    },
    helpfulCount: 2,
  },
  {
    id: "rev-59",
    gigId: "gig-2",
    orderId: "ORD-8069",
    sellerId: "f-3",
    buyer: {
      id: "f-1",
      name: "Alexandre Moreau",
      avatar:
        "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
      country: "United States",
      company: "Enterprise Partner",
    },
    rating: 5,
    comment:
      "True senior specialist. Communication was proactive, thoughtful, and pragmatic. Milestone delivered with zero defects.",
    createdAt: "2026-01-28T16:00:00Z",
    date: "1 month ago",
    dateFormatted: "1 month ago",
    aspectRatings: {
      communication: 5,
      qualityOfDelivery: 5,
      valueForMoney: 5,
    },
    sellerResponse: {
      comment:
        "Thank you Alexandre! It was a pleasure collaborating on this Web Development architecture.",
      respondedAt: "2026-01-28T19:30:00Z",
    },
    helpfulCount: 6,
  },
  {
    id: "rev-60",
    gigId: "gig-4",
    orderId: "ORD-8071",
    sellerId: "usr-edge-overflow",
    buyer: {
      id: "usr-11",
      name: "Gregory Bayer",
      avatar:
        "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80",
      country: "United States",
      company: "Enterprise Partner",
    },
    rating: 5,
    comment:
      "Exceptional engineering quality. Delivered ahead of schedule with clean modular code and extensive test coverage. Will definitely work together again.",
    createdAt: "2026-02-13T16:00:00Z",
    date: "1 month ago",
    dateFormatted: "1 month ago",
    aspectRatings: {
      communication: 5,
      qualityOfDelivery: 5,
      valueForMoney: 5,
    },
    helpfulCount: 10,
  },
  {
    id: "rev-61",
    gigId: "gig-5",
    orderId: "ORD-8072",
    sellerId: "usr-edge-brandnew",
    buyer: {
      id: "usr-14",
      name: "Sandra Zieme-Luettgen",
      avatar:
        "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80",
      country: "United States",
      company: "Enterprise Partner",
    },
    rating: 5,
    comment:
      "World-class craft. The design tokens and components were structured with extreme attention to detail and easily integrated into our codebase.",
    createdAt: "2026-01-16T16:00:00Z",
    date: "2 months ago",
    dateFormatted: "2 months ago",
    aspectRatings: {
      communication: 5,
      qualityOfDelivery: 5,
      valueForMoney: 5,
    },
    helpfulCount: 14,
  },
  {
    id: "rev-62",
    gigId: "gig-6",
    orderId: "ORD-8073",
    sellerId: "usr-edge-fast-response",
    buyer: {
      id: "usr-17",
      name: "Katrina Stehr",
      avatar:
        "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80",
      country: "United States",
      company: "Enterprise Partner",
    },
    rating: 5,
    comment:
      "Flawless deliverable. Every edge case was accounted for, and the milestone handover was crystal clear.",
    createdAt: "2026-03-24T16:00:00Z",
    date: "1 day ago",
    dateFormatted: "1 day ago",
    aspectRatings: {
      communication: 5,
      qualityOfDelivery: 5,
      valueForMoney: 5,
    },
    helpfulCount: 0,
  },
  {
    id: "rev-63",
    gigId: "gig-7",
    orderId: "ORD-8074",
    sellerId: "usr-edge-slow-response",
    buyer: {
      id: "usr-20",
      name: "Mitchell Ankunding",
      avatar:
        "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80",
      country: "United States",
      company: "Enterprise Partner",
    },
    rating: 5,
    comment:
      "Fast, reliable, and exceptionally talented. TASCORA escrow milestone system made the entire transaction smooth and secure.",
    createdAt: "2026-02-28T16:00:00Z",
    date: "3 weeks ago",
    dateFormatted: "3 weeks ago",
    aspectRatings: {
      communication: 5,
      qualityOfDelivery: 5,
      valueForMoney: 5,
    },
    sellerResponse: {
      comment:
        "Thank you Mitchell! It was a pleasure collaborating on this Web Development architecture.",
      respondedAt: "2026-02-28T19:30:00Z",
    },
    helpfulCount: 4,
  },
  {
    id: "rev-edge-critical",
    gigId: "gig-1",
    sellerId: "f-1",
    buyer: {
      id: "usr-client-2",
      name: "David Sterling",
      avatar:
        "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&auto=format&fit=crop&q=80",
      country: "United States",
      company: "Apex Capital Ventures",
    },
    rating: 3,
    comment:
      "Architectural foundation and database schema were top notch. However, we encountered minor friction during initial deployment on AWS ECS Fargate because of missing environment variable templates. Required two iterations to stabilize.",
    createdAt: "2026-02-14T10:15:00Z",
    date: "1 month ago",
    dateFormatted: "1 month ago",
    aspectRatings: {
      communication: 4,
      qualityOfDelivery: 4,
      valueForMoney: 3,
    },
    sellerResponse: {
      comment:
        "Thank you for the balanced feedback, David. I have since updated the ECS Terraform module to automatically validate task definition environment variables at build time to prevent this scenario completely.",
      respondedAt: "2026-02-15T08:30:00Z",
    },
    helpfulCount: 24,
  },
  {
    id: "rev-edge-long",
    gigId: "gig-1",
    sellerId: "f-1",
    buyer: {
      id: "usr-client-1",
      name: "Marcus Thorne",
      avatar:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80",
      country: "United Kingdom",
      company: "Fintech Corp Ltd",
    },
    rating: 5,
    comment:
      "Alexandre delivered what is easily the cleanest, most maintainable Next.js 15 enterprise architecture our engineering team has ever reviewed.\n\nFrom an architectural perspective, the strict boundary between domain entities, server actions, and client boundary components follows Clean Architecture principles to the letter. Database indexing and foreign key constraints on PostgreSQL via Prisma ORM reduced our cold-start latency from 1.2s to under 45ms.\n\nThe automated test coverage provided deserves special recognition. Not only did we receive unit tests with Vitest, but full Playwright end-to-end user journeys were included out of the box, configured seamlessly with GitHub Actions CI/CD workflows.\n\nIf you are evaluating whether to hire Alexandre for mission-critical infrastructure, do not hesitate. He is a premier tier specialist who elevates the technical standard of any platform he touches.",
    createdAt: "2026-03-01T12:00:00Z",
    date: "3 weeks ago",
    dateFormatted: "3 weeks ago",
    aspectRatings: {
      communication: 5,
      qualityOfDelivery: 5,
      valueForMoney: 5,
    },
    sellerResponse: {
      comment:
        "Marcus, thank you for such an in-depth and generous review! Working with the Fintech Corp engineering team was a phenomenal experience.",
      respondedAt: "2026-03-01T15:20:00Z",
    },
    helpfulCount: 47,
  },
  {
    id: "rev-edge-1star",
    gigId: "gig-1",
    orderId: "ORD-EDGE-1",
    sellerId: "f-1",
    buyer: {
      id: "usr-client-3",
      name: "Emily Zhang",
      avatar:
        "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80",
      country: "Singapore",
      company: "Nexus AI Ventures",
    },
    rating: 1,
    comment:
      "Disagreed on scope of deliverables for penetration testing phase. Contract cancelled and refunded via escrow.",
    createdAt: "2026-01-29T14:00:00Z",
    date: "2 months ago",
    dateFormatted: "2 months ago",
    aspectRatings: {
      communication: 2,
      qualityOfDelivery: 2,
      valueForMoney: 1,
    },
    sellerResponse: {
      comment:
        "The project brief included static security analysis; live penetration attack simulations required extended scope which client declined to fund. Handled courteously and escrow was refunded promptly.",
      respondedAt: "2026-01-30T09:00:00Z",
    },
    helpfulCount: 5,
  },
  {
    id: "rev-64",
    gigId: "gig-1",
    sellerId: "f-1",
    buyer: {
      id: "usr-client-3",
      name: "Emily Zhang",
      avatar:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80",
      country: "Singapore",
      company: "Nexus AI Ventures",
    },
    rating: 4,
    comment:
      "Very solid deliverable and strong technical foundation. Minor delay on the final milestone review, but overall excellent code quality.",
    createdAt: "2026-01-01T10:00:00Z",
    date: "2 months ago",
    dateFormatted: "2 months ago",
    aspectRatings: {
      communication: 5,
      qualityOfDelivery: 4,
      valueForMoney: 5,
    },
    helpfulCount: 0,
  },
  {
    id: "rev-65",
    gigId: "gig-1",
    sellerId: "f-1",
    buyer: {
      id: "usr-15",
      name: "Robin Christiansen",
      avatar:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80",
      country: "Japan",
    },
    rating: 5,
    comment:
      "Incredible turnaround and profound technical depth. Saved our core product team at least a month of engineering time.",
    createdAt: "2026-02-04T10:00:00Z",
    date: "1 month ago",
    dateFormatted: "1 month ago",
    aspectRatings: {
      communication: 5,
      qualityOfDelivery: 5,
      valueForMoney: 5,
    },
    helpfulCount: 2,
  },
  {
    id: "rev-66",
    gigId: "gig-1",
    sellerId: "f-1",
    buyer: {
      id: "usr-client-1",
      name: "Marcus Thorne",
      avatar:
        "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80",
      country: "United Kingdom",
      company: "Fintech Corp Ltd",
    },
    rating: 5,
    comment:
      "Exceptional engineering quality. Delivered ahead of schedule with clean modular code and extensive test coverage. Will definitely work together again.",
    createdAt: "2026-03-07T10:00:00Z",
    date: "2 weeks ago",
    dateFormatted: "2 weeks ago",
    aspectRatings: {
      communication: 5,
      qualityOfDelivery: 5,
      valueForMoney: 5,
    },
    helpfulCount: 4,
  },
  {
    id: "rev-67",
    gigId: "gig-1",
    sellerId: "f-1",
    buyer: {
      id: "usr-13",
      name: "River Johns",
      avatar:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80",
      country: "Germany",
    },
    rating: 5,
    comment:
      "Incredible turnaround and profound technical depth. Saved our core product team at least a month of engineering time.",
    createdAt: "2026-04-10T10:00:00Z",
    date: "1 day ago",
    dateFormatted: "1 day ago",
    aspectRatings: {
      communication: 5,
      qualityOfDelivery: 5,
      valueForMoney: 5,
    },
    helpfulCount: 6,
  },
  {
    id: "rev-68",
    gigId: "gig-1",
    sellerId: "f-1",
    buyer: {
      id: "usr-20",
      name: "Mitchell Ankunding",
      avatar:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80",
      country: "Australia",
    },
    rating: 5,
    comment:
      "Exceptional engineering quality. Delivered ahead of schedule with clean modular code and extensive test coverage. Will definitely work together again.",
    createdAt: "2026-01-13T10:00:00Z",
    date: "2 months ago",
    dateFormatted: "2 months ago",
    aspectRatings: {
      communication: 5,
      qualityOfDelivery: 5,
      valueForMoney: 5,
    },
    helpfulCount: 8,
  },
  {
    id: "rev-69",
    gigId: "gig-1",
    sellerId: "f-1",
    buyer: {
      id: "usr-11",
      name: "Gregory Bayer",
      avatar:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80",
      country: "United States",
    },
    rating: 5,
    comment:
      "Incredible turnaround and profound technical depth. Saved our core product team at least a month of engineering time.",
    createdAt: "2026-02-16T10:00:00Z",
    date: "1 month ago",
    dateFormatted: "1 month ago",
    aspectRatings: {
      communication: 5,
      qualityOfDelivery: 5,
      valueForMoney: 5,
    },
    helpfulCount: 10,
  },
  {
    id: "rev-70",
    gigId: "gig-1",
    sellerId: "f-1",
    buyer: {
      id: "usr-18",
      name: "Minh Nguyen",
      avatar:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80",
      country: "Vietnam",
    },
    rating: 5,
    comment:
      "Exceptional engineering quality. Delivered ahead of schedule with clean modular code and extensive test coverage. Will definitely work together again.",
    createdAt: "2026-03-19T10:00:00Z",
    date: "6 days ago",
    dateFormatted: "6 days ago",
    aspectRatings: {
      communication: 5,
      qualityOfDelivery: 5,
      valueForMoney: 5,
    },
    helpfulCount: 12,
  },
  {
    id: "rev-71",
    gigId: "gig-1",
    sellerId: "f-1",
    buyer: {
      id: "usr-client-4",
      name: "Rachel Adams",
      avatar:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80",
      country: "Canada",
      company: "Horizon Health Technologies",
    },
    rating: 5,
    comment:
      "Incredible turnaround and profound technical depth. Saved our core product team at least a month of engineering time.",
    createdAt: "2026-04-22T10:00:00Z",
    date: "1 day ago",
    dateFormatted: "1 day ago",
    aspectRatings: {
      communication: 5,
      qualityOfDelivery: 5,
      valueForMoney: 5,
    },
    helpfulCount: 14,
  },
  {
    id: "rev-72",
    gigId: "gig-1",
    sellerId: "f-1",
    buyer: {
      id: "usr-16",
      name: "David Herzog",
      avatar:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80",
      country: "Canada",
    },
    rating: 5,
    comment:
      "Exceptional engineering quality. Delivered ahead of schedule with clean modular code and extensive test coverage. Will definitely work together again.",
    createdAt: "2026-01-25T10:00:00Z",
    date: "1 month ago",
    dateFormatted: "1 month ago",
    aspectRatings: {
      communication: 5,
      qualityOfDelivery: 5,
      valueForMoney: 5,
    },
    helpfulCount: 1,
  },
  {
    id: "rev-73",
    gigId: "gig-1",
    sellerId: "f-1",
    buyer: {
      id: "usr-client-2",
      name: "David Sterling",
      avatar:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80",
      country: "United States",
      company: "Apex Capital Ventures",
    },
    rating: 5,
    comment:
      "Incredible turnaround and profound technical depth. Saved our core product team at least a month of engineering time.",
    createdAt: "2026-02-03T10:00:00Z",
    date: "1 month ago",
    dateFormatted: "1 month ago",
    aspectRatings: {
      communication: 5,
      qualityOfDelivery: 5,
      valueForMoney: 5,
    },
    helpfulCount: 3,
  },
  {
    id: "rev-74",
    gigId: "gig-1",
    sellerId: "f-1",
    buyer: {
      id: "usr-14",
      name: "Sandra Zieme-Luettgen",
      avatar:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80",
      country: "United Kingdom",
    },
    rating: 5,
    comment:
      "Exceptional engineering quality. Delivered ahead of schedule with clean modular code and extensive test coverage. Will definitely work together again.",
    createdAt: "2026-03-06T10:00:00Z",
    date: "2 weeks ago",
    dateFormatted: "2 weeks ago",
    aspectRatings: {
      communication: 5,
      qualityOfDelivery: 5,
      valueForMoney: 5,
    },
    helpfulCount: 5,
  },
  {
    id: "rev-75",
    gigId: "gig-1",
    sellerId: "f-1",
    buyer: {
      id: "f-1",
      name: "Alexandre Moreau",
      avatar:
        "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
      country: "France",
    },
    rating: 5,
    comment:
      "Incredible turnaround and profound technical depth. Saved our core product team at least a month of engineering time.",
    createdAt: "2026-04-09T10:00:00Z",
    date: "1 day ago",
    dateFormatted: "1 day ago",
    aspectRatings: {
      communication: 5,
      qualityOfDelivery: 5,
      valueForMoney: 5,
    },
    helpfulCount: 7,
  },
  {
    id: "rev-76",
    gigId: "gig-1",
    sellerId: "f-1",
    buyer: {
      id: "usr-12",
      name: "Priscilla Mertz",
      avatar:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80",
      country: "Vietnam",
    },
    rating: 5,
    comment:
      "Exceptional engineering quality. Delivered ahead of schedule with clean modular code and extensive test coverage. Will definitely work together again.",
    createdAt: "2026-01-12T10:00:00Z",
    date: "2 months ago",
    dateFormatted: "2 months ago",
    aspectRatings: {
      communication: 5,
      qualityOfDelivery: 5,
      valueForMoney: 5,
    },
    helpfulCount: 9,
  },
  {
    id: "rev-77",
    gigId: "gig-1",
    sellerId: "f-1",
    buyer: {
      id: "usr-19",
      name: "Sherwood Barrows",
      avatar:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80",
      country: "France",
    },
    rating: 5,
    comment:
      "Incredible turnaround and profound technical depth. Saved our core product team at least a month of engineering time.",
    createdAt: "2026-02-15T10:00:00Z",
    date: "1 month ago",
    dateFormatted: "1 month ago",
    aspectRatings: {
      communication: 5,
      qualityOfDelivery: 5,
      valueForMoney: 5,
    },
    helpfulCount: 11,
  },
  {
    id: "rev-78",
    gigId: "gig-1",
    sellerId: "f-1",
    buyer: {
      id: "usr-client-5",
      name: "Liam O'Connor",
      avatar:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80",
      country: "Ireland",
      company: "Nova Dynamics AI",
    },
    rating: 5,
    comment:
      "Exceptional engineering quality. Delivered ahead of schedule with clean modular code and extensive test coverage. Will definitely work together again.",
    createdAt: "2026-03-18T10:00:00Z",
    date: "1 week ago",
    dateFormatted: "1 week ago",
    aspectRatings: {
      communication: 5,
      qualityOfDelivery: 5,
      valueForMoney: 5,
    },
    helpfulCount: 13,
  },
  {
    id: "rev-79",
    gigId: "gig-1",
    sellerId: "f-1",
    buyer: {
      id: "usr-17",
      name: "Katrina Stehr",
      avatar:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80",
      country: "Singapore",
    },
    rating: 4,
    comment:
      "Good execution and reliable communication throughout. Resolved all feedback promptly during the revision cycle.",
    createdAt: "2026-04-21T10:00:00Z",
    date: "1 day ago",
    dateFormatted: "1 day ago",
    aspectRatings: {
      communication: 5,
      qualityOfDelivery: 4,
      valueForMoney: 5,
    },
    helpfulCount: 0,
  },
  {
    id: "rev-80",
    gigId: "gig-1",
    sellerId: "f-1",
    buyer: {
      id: "usr-client-3",
      name: "Emily Zhang",
      avatar:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80",
      country: "Singapore",
      company: "Nexus AI Ventures",
    },
    rating: 5,
    comment:
      "Exceptional engineering quality. Delivered ahead of schedule with clean modular code and extensive test coverage. Will definitely work together again.",
    createdAt: "2026-01-24T10:00:00Z",
    date: "2 months ago",
    dateFormatted: "2 months ago",
    aspectRatings: {
      communication: 5,
      qualityOfDelivery: 5,
      valueForMoney: 5,
    },
    helpfulCount: 2,
  },
  {
    id: "rev-81",
    gigId: "gig-1",
    sellerId: "f-1",
    buyer: {
      id: "usr-15",
      name: "Robin Christiansen",
      avatar:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80",
      country: "Japan",
    },
    rating: 5,
    comment:
      "Incredible turnaround and profound technical depth. Saved our core product team at least a month of engineering time.",
    createdAt: "2026-02-02T10:00:00Z",
    date: "1 month ago",
    dateFormatted: "1 month ago",
    aspectRatings: {
      communication: 5,
      qualityOfDelivery: 5,
      valueForMoney: 5,
    },
    helpfulCount: 4,
  },
  {
    id: "rev-82",
    gigId: "gig-1",
    sellerId: "f-1",
    buyer: {
      id: "usr-client-1",
      name: "Marcus Thorne",
      avatar:
        "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80",
      country: "United Kingdom",
      company: "Fintech Corp Ltd",
    },
    rating: 5,
    comment:
      "Exceptional engineering quality. Delivered ahead of schedule with clean modular code and extensive test coverage. Will definitely work together again.",
    createdAt: "2026-03-05T10:00:00Z",
    date: "2 weeks ago",
    dateFormatted: "2 weeks ago",
    aspectRatings: {
      communication: 5,
      qualityOfDelivery: 5,
      valueForMoney: 5,
    },
    helpfulCount: 6,
  },
  {
    id: "rev-83",
    gigId: "gig-1",
    sellerId: "f-1",
    buyer: {
      id: "usr-13",
      name: "River Johns",
      avatar:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80",
      country: "Germany",
    },
    rating: 5,
    comment:
      "Incredible turnaround and profound technical depth. Saved our core product team at least a month of engineering time.",
    createdAt: "2026-04-08T10:00:00Z",
    date: "1 day ago",
    dateFormatted: "1 day ago",
    aspectRatings: {
      communication: 5,
      qualityOfDelivery: 5,
      valueForMoney: 5,
    },
    helpfulCount: 8,
  },
  {
    id: "rev-84",
    gigId: "gig-1",
    sellerId: "f-1",
    buyer: {
      id: "usr-20",
      name: "Mitchell Ankunding",
      avatar:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80",
      country: "Australia",
    },
    rating: 5,
    comment:
      "Exceptional engineering quality. Delivered ahead of schedule with clean modular code and extensive test coverage. Will definitely work together again.",
    createdAt: "2026-01-11T10:00:00Z",
    date: "2 months ago",
    dateFormatted: "2 months ago",
    aspectRatings: {
      communication: 5,
      qualityOfDelivery: 5,
      valueForMoney: 5,
    },
    helpfulCount: 10,
  },
  {
    id: "rev-85",
    gigId: "gig-1",
    sellerId: "f-1",
    buyer: {
      id: "usr-11",
      name: "Gregory Bayer",
      avatar:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80",
      country: "United States",
    },
    rating: 5,
    comment:
      "Incredible turnaround and profound technical depth. Saved our core product team at least a month of engineering time.",
    createdAt: "2026-02-14T10:00:00Z",
    date: "1 month ago",
    dateFormatted: "1 month ago",
    aspectRatings: {
      communication: 5,
      qualityOfDelivery: 5,
      valueForMoney: 5,
    },
    helpfulCount: 12,
  },
  {
    id: "rev-86",
    gigId: "gig-1",
    sellerId: "f-1",
    buyer: {
      id: "usr-18",
      name: "Minh Nguyen",
      avatar:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80",
      country: "Vietnam",
    },
    rating: 5,
    comment:
      "Exceptional engineering quality. Delivered ahead of schedule with clean modular code and extensive test coverage. Will definitely work together again.",
    createdAt: "2026-03-17T10:00:00Z",
    date: "1 week ago",
    dateFormatted: "1 week ago",
    aspectRatings: {
      communication: 5,
      qualityOfDelivery: 5,
      valueForMoney: 5,
    },
    helpfulCount: 14,
  },
  {
    id: "rev-87",
    gigId: "gig-1",
    sellerId: "f-1",
    buyer: {
      id: "usr-client-4",
      name: "Rachel Adams",
      avatar:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80",
      country: "Canada",
      company: "Horizon Health Technologies",
    },
    rating: 5,
    comment:
      "Incredible turnaround and profound technical depth. Saved our core product team at least a month of engineering time.",
    createdAt: "2026-04-20T10:00:00Z",
    date: "1 day ago",
    dateFormatted: "1 day ago",
    aspectRatings: {
      communication: 5,
      qualityOfDelivery: 5,
      valueForMoney: 5,
    },
    helpfulCount: 1,
  },
  {
    id: "rev-88",
    gigId: "gig-1",
    sellerId: "f-1",
    buyer: {
      id: "usr-16",
      name: "David Herzog",
      avatar:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80",
      country: "Canada",
    },
    rating: 5,
    comment:
      "Exceptional engineering quality. Delivered ahead of schedule with clean modular code and extensive test coverage. Will definitely work together again.",
    createdAt: "2026-01-23T10:00:00Z",
    date: "2 months ago",
    dateFormatted: "2 months ago",
    aspectRatings: {
      communication: 5,
      qualityOfDelivery: 5,
      valueForMoney: 5,
    },
    helpfulCount: 3,
  },
  {
    id: "rev-89",
    gigId: "gig-1",
    sellerId: "f-1",
    buyer: {
      id: "usr-client-2",
      name: "David Sterling",
      avatar:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80",
      country: "United States",
      company: "Apex Capital Ventures",
    },
    rating: 5,
    comment:
      "Incredible turnaround and profound technical depth. Saved our core product team at least a month of engineering time.",
    createdAt: "2026-02-01T10:00:00Z",
    date: "1 month ago",
    dateFormatted: "1 month ago",
    aspectRatings: {
      communication: 5,
      qualityOfDelivery: 5,
      valueForMoney: 5,
    },
    helpfulCount: 5,
  },
  {
    id: "rev-90",
    gigId: "gig-1",
    sellerId: "f-1",
    buyer: {
      id: "usr-14",
      name: "Sandra Zieme-Luettgen",
      avatar:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80",
      country: "United Kingdom",
    },
    rating: 5,
    comment:
      "Exceptional engineering quality. Delivered ahead of schedule with clean modular code and extensive test coverage. Will definitely work together again.",
    createdAt: "2026-03-04T10:00:00Z",
    date: "3 weeks ago",
    dateFormatted: "3 weeks ago",
    aspectRatings: {
      communication: 5,
      qualityOfDelivery: 5,
      valueForMoney: 5,
    },
    helpfulCount: 7,
  },
  {
    id: "rev-91",
    gigId: "gig-1",
    sellerId: "f-1",
    buyer: {
      id: "f-1",
      name: "Alexandre Moreau",
      avatar:
        "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
      country: "France",
    },
    rating: 5,
    comment:
      "Incredible turnaround and profound technical depth. Saved our core product team at least a month of engineering time.",
    createdAt: "2026-04-07T10:00:00Z",
    date: "1 day ago",
    dateFormatted: "1 day ago",
    aspectRatings: {
      communication: 5,
      qualityOfDelivery: 5,
      valueForMoney: 5,
    },
    helpfulCount: 9,
  },
  {
    id: "rev-92",
    gigId: "gig-1",
    sellerId: "f-1",
    buyer: {
      id: "usr-12",
      name: "Priscilla Mertz",
      avatar:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80",
      country: "Vietnam",
    },
    rating: 5,
    comment:
      "Exceptional engineering quality. Delivered ahead of schedule with clean modular code and extensive test coverage. Will definitely work together again.",
    createdAt: "2026-01-10T10:00:00Z",
    date: "2 months ago",
    dateFormatted: "2 months ago",
    aspectRatings: {
      communication: 5,
      qualityOfDelivery: 5,
      valueForMoney: 5,
    },
    helpfulCount: 11,
  },
  {
    id: "rev-93",
    gigId: "gig-1",
    sellerId: "f-1",
    buyer: {
      id: "usr-19",
      name: "Sherwood Barrows",
      avatar:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80",
      country: "France",
    },
    rating: 5,
    comment:
      "Incredible turnaround and profound technical depth. Saved our core product team at least a month of engineering time.",
    createdAt: "2026-02-13T10:00:00Z",
    date: "1 month ago",
    dateFormatted: "1 month ago",
    aspectRatings: {
      communication: 5,
      qualityOfDelivery: 5,
      valueForMoney: 5,
    },
    helpfulCount: 13,
  },
  {
    id: "rev-94",
    gigId: "gig-1",
    sellerId: "f-1",
    buyer: {
      id: "usr-client-5",
      name: "Liam O'Connor",
      avatar:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80",
      country: "Ireland",
      company: "Nova Dynamics AI",
    },
    rating: 4,
    comment:
      "Great specialist who knows their craft. The deliverables matched our Figma designs accurately and performed well in QA.",
    createdAt: "2026-03-16T10:00:00Z",
    date: "1 week ago",
    dateFormatted: "1 week ago",
    aspectRatings: {
      communication: 5,
      qualityOfDelivery: 4,
      valueForMoney: 5,
    },
    helpfulCount: 0,
  },
  {
    id: "rev-95",
    gigId: "gig-1",
    sellerId: "f-1",
    buyer: {
      id: "usr-17",
      name: "Katrina Stehr",
      avatar:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80",
      country: "Singapore",
    },
    rating: 5,
    comment:
      "Incredible turnaround and profound technical depth. Saved our core product team at least a month of engineering time.",
    createdAt: "2026-04-19T10:00:00Z",
    date: "1 day ago",
    dateFormatted: "1 day ago",
    aspectRatings: {
      communication: 5,
      qualityOfDelivery: 5,
      valueForMoney: 5,
    },
    helpfulCount: 2,
  },
  {
    id: "rev-96",
    gigId: "gig-1",
    sellerId: "f-1",
    buyer: {
      id: "usr-client-3",
      name: "Emily Zhang",
      avatar:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80",
      country: "Singapore",
      company: "Nexus AI Ventures",
    },
    rating: 5,
    comment:
      "Exceptional engineering quality. Delivered ahead of schedule with clean modular code and extensive test coverage. Will definitely work together again.",
    createdAt: "2026-01-22T10:00:00Z",
    date: "2 months ago",
    dateFormatted: "2 months ago",
    aspectRatings: {
      communication: 5,
      qualityOfDelivery: 5,
      valueForMoney: 5,
    },
    helpfulCount: 4,
  },
  {
    id: "rev-97",
    gigId: "gig-1",
    sellerId: "f-1",
    buyer: {
      id: "usr-15",
      name: "Robin Christiansen",
      avatar:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80",
      country: "Japan",
    },
    rating: 5,
    comment:
      "Incredible turnaround and profound technical depth. Saved our core product team at least a month of engineering time.",
    createdAt: "2026-02-25T10:00:00Z",
    date: "4 weeks ago",
    dateFormatted: "4 weeks ago",
    aspectRatings: {
      communication: 5,
      qualityOfDelivery: 5,
      valueForMoney: 5,
    },
    helpfulCount: 6,
  },
  {
    id: "rev-98",
    gigId: "gig-1",
    sellerId: "f-1",
    buyer: {
      id: "usr-client-1",
      name: "Marcus Thorne",
      avatar:
        "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80",
      country: "United Kingdom",
      company: "Fintech Corp Ltd",
    },
    rating: 5,
    comment:
      "Exceptional engineering quality. Delivered ahead of schedule with clean modular code and extensive test coverage. Will definitely work together again.",
    createdAt: "2026-03-03T10:00:00Z",
    date: "3 weeks ago",
    dateFormatted: "3 weeks ago",
    aspectRatings: {
      communication: 5,
      qualityOfDelivery: 5,
      valueForMoney: 5,
    },
    helpfulCount: 8,
  },
  {
    id: "rev-99",
    gigId: "gig-1",
    sellerId: "f-1",
    buyer: {
      id: "usr-13",
      name: "River Johns",
      avatar:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80",
      country: "Germany",
    },
    rating: 5,
    comment:
      "Incredible turnaround and profound technical depth. Saved our core product team at least a month of engineering time.",
    createdAt: "2026-04-06T10:00:00Z",
    date: "1 day ago",
    dateFormatted: "1 day ago",
    aspectRatings: {
      communication: 5,
      qualityOfDelivery: 5,
      valueForMoney: 5,
    },
    helpfulCount: 10,
  },
  {
    id: "rev-100",
    gigId: "gig-2",
    sellerId: "f-3",
    buyer: {
      id: "usr-client-3",
      name: "Emily Zhang",
      avatar:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80",
      country: "Singapore",
      company: "Nexus AI Ventures",
    },
    rating: 4,
    comment:
      "Very solid deliverable and strong technical foundation. Minor delay on the final milestone review, but overall excellent code quality.",
    createdAt: "2026-01-01T10:00:00Z",
    date: "2 months ago",
    dateFormatted: "2 months ago",
    aspectRatings: {
      communication: 5,
      qualityOfDelivery: 4,
      valueForMoney: 5,
    },
    helpfulCount: 0,
  },
  {
    id: "rev-101",
    gigId: "gig-2",
    sellerId: "f-3",
    buyer: {
      id: "usr-15",
      name: "Robin Christiansen",
      avatar:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80",
      country: "Japan",
    },
    rating: 5,
    comment:
      "Incredible turnaround and profound technical depth. Saved our core product team at least a month of engineering time.",
    createdAt: "2026-02-04T10:00:00Z",
    date: "1 month ago",
    dateFormatted: "1 month ago",
    aspectRatings: {
      communication: 5,
      qualityOfDelivery: 5,
      valueForMoney: 5,
    },
    helpfulCount: 2,
  },
  {
    id: "rev-102",
    gigId: "gig-2",
    sellerId: "f-3",
    buyer: {
      id: "usr-client-1",
      name: "Marcus Thorne",
      avatar:
        "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80",
      country: "United Kingdom",
      company: "Fintech Corp Ltd",
    },
    rating: 5,
    comment:
      "Exceptional engineering quality. Delivered ahead of schedule with clean modular code and extensive test coverage. Will definitely work together again.",
    createdAt: "2026-03-07T10:00:00Z",
    date: "2 weeks ago",
    dateFormatted: "2 weeks ago",
    aspectRatings: {
      communication: 5,
      qualityOfDelivery: 5,
      valueForMoney: 5,
    },
    helpfulCount: 4,
  },
  {
    id: "rev-103",
    gigId: "gig-2",
    sellerId: "f-3",
    buyer: {
      id: "usr-13",
      name: "River Johns",
      avatar:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80",
      country: "Germany",
    },
    rating: 5,
    comment:
      "Incredible turnaround and profound technical depth. Saved our core product team at least a month of engineering time.",
    createdAt: "2026-04-10T10:00:00Z",
    date: "1 day ago",
    dateFormatted: "1 day ago",
    aspectRatings: {
      communication: 5,
      qualityOfDelivery: 5,
      valueForMoney: 5,
    },
    helpfulCount: 6,
  },
  {
    id: "rev-104",
    gigId: "gig-2",
    sellerId: "f-3",
    buyer: {
      id: "usr-20",
      name: "Mitchell Ankunding",
      avatar:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80",
      country: "Australia",
    },
    rating: 5,
    comment:
      "Exceptional engineering quality. Delivered ahead of schedule with clean modular code and extensive test coverage. Will definitely work together again.",
    createdAt: "2026-01-13T10:00:00Z",
    date: "2 months ago",
    dateFormatted: "2 months ago",
    aspectRatings: {
      communication: 5,
      qualityOfDelivery: 5,
      valueForMoney: 5,
    },
    helpfulCount: 8,
  },
  {
    id: "rev-105",
    gigId: "gig-2",
    sellerId: "f-3",
    buyer: {
      id: "usr-11",
      name: "Gregory Bayer",
      avatar:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80",
      country: "United States",
    },
    rating: 5,
    comment:
      "Incredible turnaround and profound technical depth. Saved our core product team at least a month of engineering time.",
    createdAt: "2026-02-16T10:00:00Z",
    date: "1 month ago",
    dateFormatted: "1 month ago",
    aspectRatings: {
      communication: 5,
      qualityOfDelivery: 5,
      valueForMoney: 5,
    },
    helpfulCount: 10,
  },
  {
    id: "rev-106",
    gigId: "gig-2",
    sellerId: "f-3",
    buyer: {
      id: "usr-18",
      name: "Minh Nguyen",
      avatar:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80",
      country: "Vietnam",
    },
    rating: 5,
    comment:
      "Exceptional engineering quality. Delivered ahead of schedule with clean modular code and extensive test coverage. Will definitely work together again.",
    createdAt: "2026-03-19T10:00:00Z",
    date: "6 days ago",
    dateFormatted: "6 days ago",
    aspectRatings: {
      communication: 5,
      qualityOfDelivery: 5,
      valueForMoney: 5,
    },
    helpfulCount: 12,
  },
  {
    id: "rev-107",
    gigId: "gig-2",
    sellerId: "f-3",
    buyer: {
      id: "usr-client-4",
      name: "Rachel Adams",
      avatar:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80",
      country: "Canada",
      company: "Horizon Health Technologies",
    },
    rating: 5,
    comment:
      "Incredible turnaround and profound technical depth. Saved our core product team at least a month of engineering time.",
    createdAt: "2026-04-22T10:00:00Z",
    date: "1 day ago",
    dateFormatted: "1 day ago",
    aspectRatings: {
      communication: 5,
      qualityOfDelivery: 5,
      valueForMoney: 5,
    },
    helpfulCount: 14,
  },
  {
    id: "rev-108",
    gigId: "gig-2",
    sellerId: "f-3",
    buyer: {
      id: "usr-16",
      name: "David Herzog",
      avatar:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80",
      country: "Canada",
    },
    rating: 5,
    comment:
      "Exceptional engineering quality. Delivered ahead of schedule with clean modular code and extensive test coverage. Will definitely work together again.",
    createdAt: "2026-01-25T10:00:00Z",
    date: "1 month ago",
    dateFormatted: "1 month ago",
    aspectRatings: {
      communication: 5,
      qualityOfDelivery: 5,
      valueForMoney: 5,
    },
    helpfulCount: 1,
  },
  {
    id: "rev-109",
    gigId: "gig-2",
    sellerId: "f-3",
    buyer: {
      id: "usr-client-2",
      name: "David Sterling",
      avatar:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80",
      country: "United States",
      company: "Apex Capital Ventures",
    },
    rating: 5,
    comment:
      "Incredible turnaround and profound technical depth. Saved our core product team at least a month of engineering time.",
    createdAt: "2026-02-03T10:00:00Z",
    date: "1 month ago",
    dateFormatted: "1 month ago",
    aspectRatings: {
      communication: 5,
      qualityOfDelivery: 5,
      valueForMoney: 5,
    },
    helpfulCount: 3,
  },
  {
    id: "rev-110",
    gigId: "gig-2",
    sellerId: "f-3",
    buyer: {
      id: "usr-14",
      name: "Sandra Zieme-Luettgen",
      avatar:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80",
      country: "United Kingdom",
    },
    rating: 5,
    comment:
      "Exceptional engineering quality. Delivered ahead of schedule with clean modular code and extensive test coverage. Will definitely work together again.",
    createdAt: "2026-03-06T10:00:00Z",
    date: "2 weeks ago",
    dateFormatted: "2 weeks ago",
    aspectRatings: {
      communication: 5,
      qualityOfDelivery: 5,
      valueForMoney: 5,
    },
    helpfulCount: 5,
  },
  {
    id: "rev-111",
    gigId: "gig-2",
    sellerId: "f-3",
    buyer: {
      id: "f-1",
      name: "Alexandre Moreau",
      avatar:
        "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
      country: "France",
    },
    rating: 5,
    comment:
      "Incredible turnaround and profound technical depth. Saved our core product team at least a month of engineering time.",
    createdAt: "2026-04-09T10:00:00Z",
    date: "1 day ago",
    dateFormatted: "1 day ago",
    aspectRatings: {
      communication: 5,
      qualityOfDelivery: 5,
      valueForMoney: 5,
    },
    helpfulCount: 7,
  },
  {
    id: "rev-112",
    gigId: "gig-2",
    sellerId: "f-3",
    buyer: {
      id: "usr-12",
      name: "Priscilla Mertz",
      avatar:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80",
      country: "Vietnam",
    },
    rating: 5,
    comment:
      "Exceptional engineering quality. Delivered ahead of schedule with clean modular code and extensive test coverage. Will definitely work together again.",
    createdAt: "2026-01-12T10:00:00Z",
    date: "2 months ago",
    dateFormatted: "2 months ago",
    aspectRatings: {
      communication: 5,
      qualityOfDelivery: 5,
      valueForMoney: 5,
    },
    helpfulCount: 9,
  },
  {
    id: "rev-113",
    gigId: "gig-2",
    sellerId: "f-3",
    buyer: {
      id: "usr-19",
      name: "Sherwood Barrows",
      avatar:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80",
      country: "France",
    },
    rating: 5,
    comment:
      "Incredible turnaround and profound technical depth. Saved our core product team at least a month of engineering time.",
    createdAt: "2026-02-15T10:00:00Z",
    date: "1 month ago",
    dateFormatted: "1 month ago",
    aspectRatings: {
      communication: 5,
      qualityOfDelivery: 5,
      valueForMoney: 5,
    },
    helpfulCount: 11,
  },
  {
    id: "rev-114",
    gigId: "gig-2",
    sellerId: "f-3",
    buyer: {
      id: "usr-client-5",
      name: "Liam O'Connor",
      avatar:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80",
      country: "Ireland",
      company: "Nova Dynamics AI",
    },
    rating: 5,
    comment:
      "Exceptional engineering quality. Delivered ahead of schedule with clean modular code and extensive test coverage. Will definitely work together again.",
    createdAt: "2026-03-18T10:00:00Z",
    date: "1 week ago",
    dateFormatted: "1 week ago",
    aspectRatings: {
      communication: 5,
      qualityOfDelivery: 5,
      valueForMoney: 5,
    },
    helpfulCount: 13,
  },
  {
    id: "rev-115",
    gigId: "gig-2",
    sellerId: "f-3",
    buyer: {
      id: "usr-17",
      name: "Katrina Stehr",
      avatar:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80",
      country: "Singapore",
    },
    rating: 4,
    comment:
      "Good execution and reliable communication throughout. Resolved all feedback promptly during the revision cycle.",
    createdAt: "2026-04-21T10:00:00Z",
    date: "1 day ago",
    dateFormatted: "1 day ago",
    aspectRatings: {
      communication: 5,
      qualityOfDelivery: 4,
      valueForMoney: 5,
    },
    helpfulCount: 0,
  },
  {
    id: "rev-116",
    gigId: "gig-2",
    sellerId: "f-3",
    buyer: {
      id: "usr-client-3",
      name: "Emily Zhang",
      avatar:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80",
      country: "Singapore",
      company: "Nexus AI Ventures",
    },
    rating: 5,
    comment:
      "Exceptional engineering quality. Delivered ahead of schedule with clean modular code and extensive test coverage. Will definitely work together again.",
    createdAt: "2026-01-24T10:00:00Z",
    date: "2 months ago",
    dateFormatted: "2 months ago",
    aspectRatings: {
      communication: 5,
      qualityOfDelivery: 5,
      valueForMoney: 5,
    },
    helpfulCount: 2,
  },
  {
    id: "rev-117",
    gigId: "gig-2",
    sellerId: "f-3",
    buyer: {
      id: "usr-15",
      name: "Robin Christiansen",
      avatar:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80",
      country: "Japan",
    },
    rating: 5,
    comment:
      "Incredible turnaround and profound technical depth. Saved our core product team at least a month of engineering time.",
    createdAt: "2026-02-02T10:00:00Z",
    date: "1 month ago",
    dateFormatted: "1 month ago",
    aspectRatings: {
      communication: 5,
      qualityOfDelivery: 5,
      valueForMoney: 5,
    },
    helpfulCount: 4,
  },
  {
    id: "rev-118",
    gigId: "gig-2",
    sellerId: "f-3",
    buyer: {
      id: "usr-client-1",
      name: "Marcus Thorne",
      avatar:
        "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80",
      country: "United Kingdom",
      company: "Fintech Corp Ltd",
    },
    rating: 5,
    comment:
      "Exceptional engineering quality. Delivered ahead of schedule with clean modular code and extensive test coverage. Will definitely work together again.",
    createdAt: "2026-03-05T10:00:00Z",
    date: "2 weeks ago",
    dateFormatted: "2 weeks ago",
    aspectRatings: {
      communication: 5,
      qualityOfDelivery: 5,
      valueForMoney: 5,
    },
    helpfulCount: 6,
  },
  {
    id: "rev-119",
    gigId: "gig-2",
    sellerId: "f-3",
    buyer: {
      id: "usr-13",
      name: "River Johns",
      avatar:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80",
      country: "Germany",
    },
    rating: 5,
    comment:
      "Incredible turnaround and profound technical depth. Saved our core product team at least a month of engineering time.",
    createdAt: "2026-04-08T10:00:00Z",
    date: "1 day ago",
    dateFormatted: "1 day ago",
    aspectRatings: {
      communication: 5,
      qualityOfDelivery: 5,
      valueForMoney: 5,
    },
    helpfulCount: 8,
  },
  {
    id: "rev-120",
    gigId: "gig-2",
    sellerId: "f-3",
    buyer: {
      id: "usr-20",
      name: "Mitchell Ankunding",
      avatar:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80",
      country: "Australia",
    },
    rating: 5,
    comment:
      "Exceptional engineering quality. Delivered ahead of schedule with clean modular code and extensive test coverage. Will definitely work together again.",
    createdAt: "2026-01-11T10:00:00Z",
    date: "2 months ago",
    dateFormatted: "2 months ago",
    aspectRatings: {
      communication: 5,
      qualityOfDelivery: 5,
      valueForMoney: 5,
    },
    helpfulCount: 10,
  },
  {
    id: "rev-121",
    gigId: "gig-2",
    sellerId: "f-3",
    buyer: {
      id: "usr-11",
      name: "Gregory Bayer",
      avatar:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80",
      country: "United States",
    },
    rating: 5,
    comment:
      "Incredible turnaround and profound technical depth. Saved our core product team at least a month of engineering time.",
    createdAt: "2026-02-14T10:00:00Z",
    date: "1 month ago",
    dateFormatted: "1 month ago",
    aspectRatings: {
      communication: 5,
      qualityOfDelivery: 5,
      valueForMoney: 5,
    },
    helpfulCount: 12,
  },
  {
    id: "rev-122",
    gigId: "gig-2",
    sellerId: "f-3",
    buyer: {
      id: "usr-18",
      name: "Minh Nguyen",
      avatar:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80",
      country: "Vietnam",
    },
    rating: 5,
    comment:
      "Exceptional engineering quality. Delivered ahead of schedule with clean modular code and extensive test coverage. Will definitely work together again.",
    createdAt: "2026-03-17T10:00:00Z",
    date: "1 week ago",
    dateFormatted: "1 week ago",
    aspectRatings: {
      communication: 5,
      qualityOfDelivery: 5,
      valueForMoney: 5,
    },
    helpfulCount: 14,
  },
  {
    id: "rev-123",
    gigId: "gig-2",
    sellerId: "f-3",
    buyer: {
      id: "usr-client-4",
      name: "Rachel Adams",
      avatar:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80",
      country: "Canada",
      company: "Horizon Health Technologies",
    },
    rating: 5,
    comment:
      "Incredible turnaround and profound technical depth. Saved our core product team at least a month of engineering time.",
    createdAt: "2026-04-20T10:00:00Z",
    date: "1 day ago",
    dateFormatted: "1 day ago",
    aspectRatings: {
      communication: 5,
      qualityOfDelivery: 5,
      valueForMoney: 5,
    },
    helpfulCount: 1,
  },
  {
    id: "rev-124",
    gigId: "gig-2",
    sellerId: "f-3",
    buyer: {
      id: "usr-16",
      name: "David Herzog",
      avatar:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80",
      country: "Canada",
    },
    rating: 5,
    comment:
      "Exceptional engineering quality. Delivered ahead of schedule with clean modular code and extensive test coverage. Will definitely work together again.",
    createdAt: "2026-01-23T10:00:00Z",
    date: "2 months ago",
    dateFormatted: "2 months ago",
    aspectRatings: {
      communication: 5,
      qualityOfDelivery: 5,
      valueForMoney: 5,
    },
    helpfulCount: 3,
  },
  {
    id: "rev-125",
    gigId: "gig-2",
    sellerId: "f-3",
    buyer: {
      id: "usr-client-2",
      name: "David Sterling",
      avatar:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80",
      country: "United States",
      company: "Apex Capital Ventures",
    },
    rating: 5,
    comment:
      "Incredible turnaround and profound technical depth. Saved our core product team at least a month of engineering time.",
    createdAt: "2026-02-01T10:00:00Z",
    date: "1 month ago",
    dateFormatted: "1 month ago",
    aspectRatings: {
      communication: 5,
      qualityOfDelivery: 5,
      valueForMoney: 5,
    },
    helpfulCount: 5,
  },
  {
    id: "rev-126",
    gigId: "gig-2",
    sellerId: "f-3",
    buyer: {
      id: "usr-14",
      name: "Sandra Zieme-Luettgen",
      avatar:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80",
      country: "United Kingdom",
    },
    rating: 5,
    comment:
      "Exceptional engineering quality. Delivered ahead of schedule with clean modular code and extensive test coverage. Will definitely work together again.",
    createdAt: "2026-03-04T10:00:00Z",
    date: "3 weeks ago",
    dateFormatted: "3 weeks ago",
    aspectRatings: {
      communication: 5,
      qualityOfDelivery: 5,
      valueForMoney: 5,
    },
    helpfulCount: 7,
  },
  {
    id: "rev-127",
    gigId: "gig-2",
    sellerId: "f-3",
    buyer: {
      id: "f-1",
      name: "Alexandre Moreau",
      avatar:
        "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
      country: "France",
    },
    rating: 5,
    comment:
      "Incredible turnaround and profound technical depth. Saved our core product team at least a month of engineering time.",
    createdAt: "2026-04-07T10:00:00Z",
    date: "1 day ago",
    dateFormatted: "1 day ago",
    aspectRatings: {
      communication: 5,
      qualityOfDelivery: 5,
      valueForMoney: 5,
    },
    helpfulCount: 9,
  },
  {
    id: "rev-128",
    gigId: "gig-2",
    sellerId: "f-3",
    buyer: {
      id: "usr-12",
      name: "Priscilla Mertz",
      avatar:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80",
      country: "Vietnam",
    },
    rating: 5,
    comment:
      "Exceptional engineering quality. Delivered ahead of schedule with clean modular code and extensive test coverage. Will definitely work together again.",
    createdAt: "2026-01-10T10:00:00Z",
    date: "2 months ago",
    dateFormatted: "2 months ago",
    aspectRatings: {
      communication: 5,
      qualityOfDelivery: 5,
      valueForMoney: 5,
    },
    helpfulCount: 11,
  },
  {
    id: "rev-129",
    gigId: "gig-2",
    sellerId: "f-3",
    buyer: {
      id: "usr-19",
      name: "Sherwood Barrows",
      avatar:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80",
      country: "France",
    },
    rating: 5,
    comment:
      "Incredible turnaround and profound technical depth. Saved our core product team at least a month of engineering time.",
    createdAt: "2026-02-13T10:00:00Z",
    date: "1 month ago",
    dateFormatted: "1 month ago",
    aspectRatings: {
      communication: 5,
      qualityOfDelivery: 5,
      valueForMoney: 5,
    },
    helpfulCount: 13,
  },
  {
    id: "rev-130",
    gigId: "gig-2",
    sellerId: "f-3",
    buyer: {
      id: "usr-client-5",
      name: "Liam O'Connor",
      avatar:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80",
      country: "Ireland",
      company: "Nova Dynamics AI",
    },
    rating: 4,
    comment:
      "Great specialist who knows their craft. The deliverables matched our Figma designs accurately and performed well in QA.",
    createdAt: "2026-03-16T10:00:00Z",
    date: "1 week ago",
    dateFormatted: "1 week ago",
    aspectRatings: {
      communication: 5,
      qualityOfDelivery: 4,
      valueForMoney: 5,
    },
    helpfulCount: 0,
  },
  {
    id: "rev-131",
    gigId: "gig-2",
    sellerId: "f-3",
    buyer: {
      id: "usr-17",
      name: "Katrina Stehr",
      avatar:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80",
      country: "Singapore",
    },
    rating: 5,
    comment:
      "Incredible turnaround and profound technical depth. Saved our core product team at least a month of engineering time.",
    createdAt: "2026-04-19T10:00:00Z",
    date: "1 day ago",
    dateFormatted: "1 day ago",
    aspectRatings: {
      communication: 5,
      qualityOfDelivery: 5,
      valueForMoney: 5,
    },
    helpfulCount: 2,
  },
  {
    id: "rev-132",
    gigId: "gig-2",
    sellerId: "f-3",
    buyer: {
      id: "usr-client-3",
      name: "Emily Zhang",
      avatar:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80",
      country: "Singapore",
      company: "Nexus AI Ventures",
    },
    rating: 5,
    comment:
      "Exceptional engineering quality. Delivered ahead of schedule with clean modular code and extensive test coverage. Will definitely work together again.",
    createdAt: "2026-01-22T10:00:00Z",
    date: "2 months ago",
    dateFormatted: "2 months ago",
    aspectRatings: {
      communication: 5,
      qualityOfDelivery: 5,
      valueForMoney: 5,
    },
    helpfulCount: 4,
  },
  {
    id: "rev-133",
    gigId: "gig-2",
    sellerId: "f-3",
    buyer: {
      id: "usr-15",
      name: "Robin Christiansen",
      avatar:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80",
      country: "Japan",
    },
    rating: 5,
    comment:
      "Incredible turnaround and profound technical depth. Saved our core product team at least a month of engineering time.",
    createdAt: "2026-02-25T10:00:00Z",
    date: "4 weeks ago",
    dateFormatted: "4 weeks ago",
    aspectRatings: {
      communication: 5,
      qualityOfDelivery: 5,
      valueForMoney: 5,
    },
    helpfulCount: 6,
  },
  {
    id: "rev-134",
    gigId: "gig-2",
    sellerId: "f-3",
    buyer: {
      id: "usr-client-1",
      name: "Marcus Thorne",
      avatar:
        "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80",
      country: "United Kingdom",
      company: "Fintech Corp Ltd",
    },
    rating: 5,
    comment:
      "Exceptional engineering quality. Delivered ahead of schedule with clean modular code and extensive test coverage. Will definitely work together again.",
    createdAt: "2026-03-03T10:00:00Z",
    date: "3 weeks ago",
    dateFormatted: "3 weeks ago",
    aspectRatings: {
      communication: 5,
      qualityOfDelivery: 5,
      valueForMoney: 5,
    },
    helpfulCount: 8,
  },
  {
    id: "rev-135",
    gigId: "gig-2",
    sellerId: "f-3",
    buyer: {
      id: "usr-13",
      name: "River Johns",
      avatar:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80",
      country: "Germany",
    },
    rating: 5,
    comment:
      "Incredible turnaround and profound technical depth. Saved our core product team at least a month of engineering time.",
    createdAt: "2026-04-06T10:00:00Z",
    date: "1 day ago",
    dateFormatted: "1 day ago",
    aspectRatings: {
      communication: 5,
      qualityOfDelivery: 5,
      valueForMoney: 5,
    },
    helpfulCount: 10,
  },
  {
    id: "rev-136",
    gigId: "gig-3",
    sellerId: "f-4",
    buyer: {
      id: "usr-client-3",
      name: "Emily Zhang",
      avatar:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80",
      country: "Singapore",
      company: "Nexus AI Ventures",
    },
    rating: 4,
    comment:
      "Very solid deliverable and strong technical foundation. Minor delay on the final milestone review, but overall excellent code quality.",
    createdAt: "2026-01-01T10:00:00Z",
    date: "2 months ago",
    dateFormatted: "2 months ago",
    aspectRatings: {
      communication: 5,
      qualityOfDelivery: 4,
      valueForMoney: 5,
    },
    helpfulCount: 0,
  },
  {
    id: "rev-137",
    gigId: "gig-3",
    sellerId: "f-4",
    buyer: {
      id: "usr-15",
      name: "Robin Christiansen",
      avatar:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80",
      country: "Japan",
    },
    rating: 5,
    comment:
      "Incredible turnaround and profound technical depth. Saved our core product team at least a month of engineering time.",
    createdAt: "2026-02-04T10:00:00Z",
    date: "1 month ago",
    dateFormatted: "1 month ago",
    aspectRatings: {
      communication: 5,
      qualityOfDelivery: 5,
      valueForMoney: 5,
    },
    helpfulCount: 2,
  },
  {
    id: "rev-138",
    gigId: "gig-3",
    sellerId: "f-4",
    buyer: {
      id: "usr-client-1",
      name: "Marcus Thorne",
      avatar:
        "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80",
      country: "United Kingdom",
      company: "Fintech Corp Ltd",
    },
    rating: 5,
    comment:
      "Exceptional engineering quality. Delivered ahead of schedule with clean modular code and extensive test coverage. Will definitely work together again.",
    createdAt: "2026-03-07T10:00:00Z",
    date: "2 weeks ago",
    dateFormatted: "2 weeks ago",
    aspectRatings: {
      communication: 5,
      qualityOfDelivery: 5,
      valueForMoney: 5,
    },
    helpfulCount: 4,
  },
  {
    id: "rev-139",
    gigId: "gig-3",
    sellerId: "f-4",
    buyer: {
      id: "usr-13",
      name: "River Johns",
      avatar:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80",
      country: "Germany",
    },
    rating: 5,
    comment:
      "Incredible turnaround and profound technical depth. Saved our core product team at least a month of engineering time.",
    createdAt: "2026-04-10T10:00:00Z",
    date: "1 day ago",
    dateFormatted: "1 day ago",
    aspectRatings: {
      communication: 5,
      qualityOfDelivery: 5,
      valueForMoney: 5,
    },
    helpfulCount: 6,
  },
  {
    id: "rev-140",
    gigId: "gig-3",
    sellerId: "f-4",
    buyer: {
      id: "usr-20",
      name: "Mitchell Ankunding",
      avatar:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80",
      country: "Australia",
    },
    rating: 5,
    comment:
      "Exceptional engineering quality. Delivered ahead of schedule with clean modular code and extensive test coverage. Will definitely work together again.",
    createdAt: "2026-01-13T10:00:00Z",
    date: "2 months ago",
    dateFormatted: "2 months ago",
    aspectRatings: {
      communication: 5,
      qualityOfDelivery: 5,
      valueForMoney: 5,
    },
    helpfulCount: 8,
  },
  {
    id: "rev-141",
    gigId: "gig-3",
    sellerId: "f-4",
    buyer: {
      id: "usr-11",
      name: "Gregory Bayer",
      avatar:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80",
      country: "United States",
    },
    rating: 5,
    comment:
      "Incredible turnaround and profound technical depth. Saved our core product team at least a month of engineering time.",
    createdAt: "2026-02-16T10:00:00Z",
    date: "1 month ago",
    dateFormatted: "1 month ago",
    aspectRatings: {
      communication: 5,
      qualityOfDelivery: 5,
      valueForMoney: 5,
    },
    helpfulCount: 10,
  },
  {
    id: "rev-142",
    gigId: "gig-3",
    sellerId: "f-4",
    buyer: {
      id: "usr-18",
      name: "Minh Nguyen",
      avatar:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80",
      country: "Vietnam",
    },
    rating: 5,
    comment:
      "Exceptional engineering quality. Delivered ahead of schedule with clean modular code and extensive test coverage. Will definitely work together again.",
    createdAt: "2026-03-19T10:00:00Z",
    date: "6 days ago",
    dateFormatted: "6 days ago",
    aspectRatings: {
      communication: 5,
      qualityOfDelivery: 5,
      valueForMoney: 5,
    },
    helpfulCount: 12,
  },
  {
    id: "rev-143",
    gigId: "gig-3",
    sellerId: "f-4",
    buyer: {
      id: "usr-client-4",
      name: "Rachel Adams",
      avatar:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80",
      country: "Canada",
      company: "Horizon Health Technologies",
    },
    rating: 5,
    comment:
      "Incredible turnaround and profound technical depth. Saved our core product team at least a month of engineering time.",
    createdAt: "2026-04-22T10:00:00Z",
    date: "1 day ago",
    dateFormatted: "1 day ago",
    aspectRatings: {
      communication: 5,
      qualityOfDelivery: 5,
      valueForMoney: 5,
    },
    helpfulCount: 14,
  },
  {
    id: "rev-144",
    gigId: "gig-3",
    sellerId: "f-4",
    buyer: {
      id: "usr-16",
      name: "David Herzog",
      avatar:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80",
      country: "Canada",
    },
    rating: 5,
    comment:
      "Exceptional engineering quality. Delivered ahead of schedule with clean modular code and extensive test coverage. Will definitely work together again.",
    createdAt: "2026-01-25T10:00:00Z",
    date: "1 month ago",
    dateFormatted: "1 month ago",
    aspectRatings: {
      communication: 5,
      qualityOfDelivery: 5,
      valueForMoney: 5,
    },
    helpfulCount: 1,
  },
  {
    id: "rev-145",
    gigId: "gig-3",
    sellerId: "f-4",
    buyer: {
      id: "usr-client-2",
      name: "David Sterling",
      avatar:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80",
      country: "United States",
      company: "Apex Capital Ventures",
    },
    rating: 5,
    comment:
      "Incredible turnaround and profound technical depth. Saved our core product team at least a month of engineering time.",
    createdAt: "2026-02-03T10:00:00Z",
    date: "1 month ago",
    dateFormatted: "1 month ago",
    aspectRatings: {
      communication: 5,
      qualityOfDelivery: 5,
      valueForMoney: 5,
    },
    helpfulCount: 3,
  },
  {
    id: "rev-146",
    gigId: "gig-3",
    sellerId: "f-4",
    buyer: {
      id: "usr-14",
      name: "Sandra Zieme-Luettgen",
      avatar:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80",
      country: "United Kingdom",
    },
    rating: 5,
    comment:
      "Exceptional engineering quality. Delivered ahead of schedule with clean modular code and extensive test coverage. Will definitely work together again.",
    createdAt: "2026-03-06T10:00:00Z",
    date: "2 weeks ago",
    dateFormatted: "2 weeks ago",
    aspectRatings: {
      communication: 5,
      qualityOfDelivery: 5,
      valueForMoney: 5,
    },
    helpfulCount: 5,
  },
  {
    id: "rev-147",
    gigId: "gig-3",
    sellerId: "f-4",
    buyer: {
      id: "f-1",
      name: "Alexandre Moreau",
      avatar:
        "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
      country: "France",
    },
    rating: 5,
    comment:
      "Incredible turnaround and profound technical depth. Saved our core product team at least a month of engineering time.",
    createdAt: "2026-04-09T10:00:00Z",
    date: "1 day ago",
    dateFormatted: "1 day ago",
    aspectRatings: {
      communication: 5,
      qualityOfDelivery: 5,
      valueForMoney: 5,
    },
    helpfulCount: 7,
  },
  {
    id: "rev-148",
    gigId: "gig-3",
    sellerId: "f-4",
    buyer: {
      id: "usr-12",
      name: "Priscilla Mertz",
      avatar:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80",
      country: "Vietnam",
    },
    rating: 5,
    comment:
      "Exceptional engineering quality. Delivered ahead of schedule with clean modular code and extensive test coverage. Will definitely work together again.",
    createdAt: "2026-01-12T10:00:00Z",
    date: "2 months ago",
    dateFormatted: "2 months ago",
    aspectRatings: {
      communication: 5,
      qualityOfDelivery: 5,
      valueForMoney: 5,
    },
    helpfulCount: 9,
  },
  {
    id: "rev-149",
    gigId: "gig-3",
    sellerId: "f-4",
    buyer: {
      id: "usr-19",
      name: "Sherwood Barrows",
      avatar:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80",
      country: "France",
    },
    rating: 5,
    comment:
      "Incredible turnaround and profound technical depth. Saved our core product team at least a month of engineering time.",
    createdAt: "2026-02-15T10:00:00Z",
    date: "1 month ago",
    dateFormatted: "1 month ago",
    aspectRatings: {
      communication: 5,
      qualityOfDelivery: 5,
      valueForMoney: 5,
    },
    helpfulCount: 11,
  },
  {
    id: "rev-150",
    gigId: "gig-3",
    sellerId: "f-4",
    buyer: {
      id: "usr-client-5",
      name: "Liam O'Connor",
      avatar:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80",
      country: "Ireland",
      company: "Nova Dynamics AI",
    },
    rating: 5,
    comment:
      "Exceptional engineering quality. Delivered ahead of schedule with clean modular code and extensive test coverage. Will definitely work together again.",
    createdAt: "2026-03-18T10:00:00Z",
    date: "1 week ago",
    dateFormatted: "1 week ago",
    aspectRatings: {
      communication: 5,
      qualityOfDelivery: 5,
      valueForMoney: 5,
    },
    helpfulCount: 13,
  },
  {
    id: "rev-151",
    gigId: "gig-3",
    sellerId: "f-4",
    buyer: {
      id: "usr-17",
      name: "Katrina Stehr",
      avatar:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80",
      country: "Singapore",
    },
    rating: 4,
    comment:
      "Good execution and reliable communication throughout. Resolved all feedback promptly during the revision cycle.",
    createdAt: "2026-04-21T10:00:00Z",
    date: "1 day ago",
    dateFormatted: "1 day ago",
    aspectRatings: {
      communication: 5,
      qualityOfDelivery: 4,
      valueForMoney: 5,
    },
    helpfulCount: 0,
  },
  {
    id: "rev-152",
    gigId: "gig-3",
    sellerId: "f-4",
    buyer: {
      id: "usr-client-3",
      name: "Emily Zhang",
      avatar:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80",
      country: "Singapore",
      company: "Nexus AI Ventures",
    },
    rating: 5,
    comment:
      "Exceptional engineering quality. Delivered ahead of schedule with clean modular code and extensive test coverage. Will definitely work together again.",
    createdAt: "2026-01-24T10:00:00Z",
    date: "2 months ago",
    dateFormatted: "2 months ago",
    aspectRatings: {
      communication: 5,
      qualityOfDelivery: 5,
      valueForMoney: 5,
    },
    helpfulCount: 2,
  },
  {
    id: "rev-153",
    gigId: "gig-3",
    sellerId: "f-4",
    buyer: {
      id: "usr-15",
      name: "Robin Christiansen",
      avatar:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80",
      country: "Japan",
    },
    rating: 5,
    comment:
      "Incredible turnaround and profound technical depth. Saved our core product team at least a month of engineering time.",
    createdAt: "2026-02-02T10:00:00Z",
    date: "1 month ago",
    dateFormatted: "1 month ago",
    aspectRatings: {
      communication: 5,
      qualityOfDelivery: 5,
      valueForMoney: 5,
    },
    helpfulCount: 4,
  },
  {
    id: "rev-154",
    gigId: "gig-3",
    sellerId: "f-4",
    buyer: {
      id: "usr-client-1",
      name: "Marcus Thorne",
      avatar:
        "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80",
      country: "United Kingdom",
      company: "Fintech Corp Ltd",
    },
    rating: 5,
    comment:
      "Exceptional engineering quality. Delivered ahead of schedule with clean modular code and extensive test coverage. Will definitely work together again.",
    createdAt: "2026-03-05T10:00:00Z",
    date: "2 weeks ago",
    dateFormatted: "2 weeks ago",
    aspectRatings: {
      communication: 5,
      qualityOfDelivery: 5,
      valueForMoney: 5,
    },
    helpfulCount: 6,
  },
  {
    id: "rev-155",
    gigId: "gig-3",
    sellerId: "f-4",
    buyer: {
      id: "usr-13",
      name: "River Johns",
      avatar:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80",
      country: "Germany",
    },
    rating: 5,
    comment:
      "Incredible turnaround and profound technical depth. Saved our core product team at least a month of engineering time.",
    createdAt: "2026-04-08T10:00:00Z",
    date: "1 day ago",
    dateFormatted: "1 day ago",
    aspectRatings: {
      communication: 5,
      qualityOfDelivery: 5,
      valueForMoney: 5,
    },
    helpfulCount: 8,
  },
  {
    id: "rev-156",
    gigId: "gig-3",
    sellerId: "f-4",
    buyer: {
      id: "usr-20",
      name: "Mitchell Ankunding",
      avatar:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80",
      country: "Australia",
    },
    rating: 5,
    comment:
      "Exceptional engineering quality. Delivered ahead of schedule with clean modular code and extensive test coverage. Will definitely work together again.",
    createdAt: "2026-01-11T10:00:00Z",
    date: "2 months ago",
    dateFormatted: "2 months ago",
    aspectRatings: {
      communication: 5,
      qualityOfDelivery: 5,
      valueForMoney: 5,
    },
    helpfulCount: 10,
  },
  {
    id: "rev-157",
    gigId: "gig-3",
    sellerId: "f-4",
    buyer: {
      id: "usr-11",
      name: "Gregory Bayer",
      avatar:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80",
      country: "United States",
    },
    rating: 5,
    comment:
      "Incredible turnaround and profound technical depth. Saved our core product team at least a month of engineering time.",
    createdAt: "2026-02-14T10:00:00Z",
    date: "1 month ago",
    dateFormatted: "1 month ago",
    aspectRatings: {
      communication: 5,
      qualityOfDelivery: 5,
      valueForMoney: 5,
    },
    helpfulCount: 12,
  },
  {
    id: "rev-158",
    gigId: "gig-3",
    sellerId: "f-4",
    buyer: {
      id: "usr-18",
      name: "Minh Nguyen",
      avatar:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80",
      country: "Vietnam",
    },
    rating: 5,
    comment:
      "Exceptional engineering quality. Delivered ahead of schedule with clean modular code and extensive test coverage. Will definitely work together again.",
    createdAt: "2026-03-17T10:00:00Z",
    date: "1 week ago",
    dateFormatted: "1 week ago",
    aspectRatings: {
      communication: 5,
      qualityOfDelivery: 5,
      valueForMoney: 5,
    },
    helpfulCount: 14,
  },
  {
    id: "rev-159",
    gigId: "gig-3",
    sellerId: "f-4",
    buyer: {
      id: "usr-client-4",
      name: "Rachel Adams",
      avatar:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80",
      country: "Canada",
      company: "Horizon Health Technologies",
    },
    rating: 5,
    comment:
      "Incredible turnaround and profound technical depth. Saved our core product team at least a month of engineering time.",
    createdAt: "2026-04-20T10:00:00Z",
    date: "1 day ago",
    dateFormatted: "1 day ago",
    aspectRatings: {
      communication: 5,
      qualityOfDelivery: 5,
      valueForMoney: 5,
    },
    helpfulCount: 1,
  },
  {
    id: "rev-160",
    gigId: "gig-3",
    sellerId: "f-4",
    buyer: {
      id: "usr-16",
      name: "David Herzog",
      avatar:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80",
      country: "Canada",
    },
    rating: 5,
    comment:
      "Exceptional engineering quality. Delivered ahead of schedule with clean modular code and extensive test coverage. Will definitely work together again.",
    createdAt: "2026-01-23T10:00:00Z",
    date: "2 months ago",
    dateFormatted: "2 months ago",
    aspectRatings: {
      communication: 5,
      qualityOfDelivery: 5,
      valueForMoney: 5,
    },
    helpfulCount: 3,
  },
  {
    id: "rev-161",
    gigId: "gig-3",
    sellerId: "f-4",
    buyer: {
      id: "usr-client-2",
      name: "David Sterling",
      avatar:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80",
      country: "United States",
      company: "Apex Capital Ventures",
    },
    rating: 5,
    comment:
      "Incredible turnaround and profound technical depth. Saved our core product team at least a month of engineering time.",
    createdAt: "2026-02-01T10:00:00Z",
    date: "1 month ago",
    dateFormatted: "1 month ago",
    aspectRatings: {
      communication: 5,
      qualityOfDelivery: 5,
      valueForMoney: 5,
    },
    helpfulCount: 5,
  },
  {
    id: "rev-162",
    gigId: "gig-3",
    sellerId: "f-4",
    buyer: {
      id: "usr-14",
      name: "Sandra Zieme-Luettgen",
      avatar:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80",
      country: "United Kingdom",
    },
    rating: 5,
    comment:
      "Exceptional engineering quality. Delivered ahead of schedule with clean modular code and extensive test coverage. Will definitely work together again.",
    createdAt: "2026-03-04T10:00:00Z",
    date: "3 weeks ago",
    dateFormatted: "3 weeks ago",
    aspectRatings: {
      communication: 5,
      qualityOfDelivery: 5,
      valueForMoney: 5,
    },
    helpfulCount: 7,
  },
  {
    id: "rev-163",
    gigId: "gig-4",
    sellerId: "usr-edge-overflow",
    buyer: {
      id: "usr-client-3",
      name: "Emily Zhang",
      avatar:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80",
      country: "Singapore",
      company: "Nexus AI Ventures",
    },
    rating: 4,
    comment:
      "Very solid deliverable and strong technical foundation. Minor delay on the final milestone review, but overall excellent code quality.",
    createdAt: "2026-01-01T10:00:00Z",
    date: "2 months ago",
    dateFormatted: "2 months ago",
    aspectRatings: {
      communication: 5,
      qualityOfDelivery: 4,
      valueForMoney: 5,
    },
    helpfulCount: 0,
  },
  {
    id: "rev-164",
    gigId: "gig-4",
    sellerId: "usr-edge-overflow",
    buyer: {
      id: "usr-15",
      name: "Robin Christiansen",
      avatar:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80",
      country: "Japan",
    },
    rating: 5,
    comment:
      "Incredible turnaround and profound technical depth. Saved our core product team at least a month of engineering time.",
    createdAt: "2026-02-04T10:00:00Z",
    date: "1 month ago",
    dateFormatted: "1 month ago",
    aspectRatings: {
      communication: 5,
      qualityOfDelivery: 5,
      valueForMoney: 5,
    },
    helpfulCount: 2,
  },
  {
    id: "rev-165",
    gigId: "gig-4",
    sellerId: "usr-edge-overflow",
    buyer: {
      id: "usr-client-1",
      name: "Marcus Thorne",
      avatar:
        "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80",
      country: "United Kingdom",
      company: "Fintech Corp Ltd",
    },
    rating: 5,
    comment:
      "Exceptional engineering quality. Delivered ahead of schedule with clean modular code and extensive test coverage. Will definitely work together again.",
    createdAt: "2026-03-07T10:00:00Z",
    date: "2 weeks ago",
    dateFormatted: "2 weeks ago",
    aspectRatings: {
      communication: 5,
      qualityOfDelivery: 5,
      valueForMoney: 5,
    },
    helpfulCount: 4,
  },
  {
    id: "rev-166",
    gigId: "gig-4",
    sellerId: "usr-edge-overflow",
    buyer: {
      id: "usr-13",
      name: "River Johns",
      avatar:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80",
      country: "Germany",
    },
    rating: 5,
    comment:
      "Incredible turnaround and profound technical depth. Saved our core product team at least a month of engineering time.",
    createdAt: "2026-04-10T10:00:00Z",
    date: "1 day ago",
    dateFormatted: "1 day ago",
    aspectRatings: {
      communication: 5,
      qualityOfDelivery: 5,
      valueForMoney: 5,
    },
    helpfulCount: 6,
  },
  {
    id: "rev-167",
    gigId: "gig-4",
    sellerId: "usr-edge-overflow",
    buyer: {
      id: "usr-20",
      name: "Mitchell Ankunding",
      avatar:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80",
      country: "Australia",
    },
    rating: 5,
    comment:
      "Exceptional engineering quality. Delivered ahead of schedule with clean modular code and extensive test coverage. Will definitely work together again.",
    createdAt: "2026-01-13T10:00:00Z",
    date: "2 months ago",
    dateFormatted: "2 months ago",
    aspectRatings: {
      communication: 5,
      qualityOfDelivery: 5,
      valueForMoney: 5,
    },
    helpfulCount: 8,
  },
  {
    id: "rev-168",
    gigId: "gig-4",
    sellerId: "usr-edge-overflow",
    buyer: {
      id: "usr-11",
      name: "Gregory Bayer",
      avatar:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80",
      country: "United States",
    },
    rating: 5,
    comment:
      "Incredible turnaround and profound technical depth. Saved our core product team at least a month of engineering time.",
    createdAt: "2026-02-16T10:00:00Z",
    date: "1 month ago",
    dateFormatted: "1 month ago",
    aspectRatings: {
      communication: 5,
      qualityOfDelivery: 5,
      valueForMoney: 5,
    },
    helpfulCount: 10,
  },
  {
    id: "rev-169",
    gigId: "gig-4",
    sellerId: "usr-edge-overflow",
    buyer: {
      id: "usr-18",
      name: "Minh Nguyen",
      avatar:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80",
      country: "Vietnam",
    },
    rating: 5,
    comment:
      "Exceptional engineering quality. Delivered ahead of schedule with clean modular code and extensive test coverage. Will definitely work together again.",
    createdAt: "2026-03-19T10:00:00Z",
    date: "6 days ago",
    dateFormatted: "6 days ago",
    aspectRatings: {
      communication: 5,
      qualityOfDelivery: 5,
      valueForMoney: 5,
    },
    helpfulCount: 12,
  },
  {
    id: "rev-170",
    gigId: "gig-4",
    sellerId: "usr-edge-overflow",
    buyer: {
      id: "usr-client-4",
      name: "Rachel Adams",
      avatar:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80",
      country: "Canada",
      company: "Horizon Health Technologies",
    },
    rating: 5,
    comment:
      "Incredible turnaround and profound technical depth. Saved our core product team at least a month of engineering time.",
    createdAt: "2026-04-22T10:00:00Z",
    date: "1 day ago",
    dateFormatted: "1 day ago",
    aspectRatings: {
      communication: 5,
      qualityOfDelivery: 5,
      valueForMoney: 5,
    },
    helpfulCount: 14,
  },
  {
    id: "rev-171",
    gigId: "gig-4",
    sellerId: "usr-edge-overflow",
    buyer: {
      id: "usr-16",
      name: "David Herzog",
      avatar:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80",
      country: "Canada",
    },
    rating: 5,
    comment:
      "Exceptional engineering quality. Delivered ahead of schedule with clean modular code and extensive test coverage. Will definitely work together again.",
    createdAt: "2026-01-25T10:00:00Z",
    date: "1 month ago",
    dateFormatted: "1 month ago",
    aspectRatings: {
      communication: 5,
      qualityOfDelivery: 5,
      valueForMoney: 5,
    },
    helpfulCount: 1,
  },
  {
    id: "rev-172",
    gigId: "gig-4",
    sellerId: "usr-edge-overflow",
    buyer: {
      id: "usr-client-2",
      name: "David Sterling",
      avatar:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80",
      country: "United States",
      company: "Apex Capital Ventures",
    },
    rating: 5,
    comment:
      "Incredible turnaround and profound technical depth. Saved our core product team at least a month of engineering time.",
    createdAt: "2026-02-03T10:00:00Z",
    date: "1 month ago",
    dateFormatted: "1 month ago",
    aspectRatings: {
      communication: 5,
      qualityOfDelivery: 5,
      valueForMoney: 5,
    },
    helpfulCount: 3,
  },
  {
    id: "rev-173",
    gigId: "gig-4",
    sellerId: "usr-edge-overflow",
    buyer: {
      id: "usr-14",
      name: "Sandra Zieme-Luettgen",
      avatar:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80",
      country: "United Kingdom",
    },
    rating: 5,
    comment:
      "Exceptional engineering quality. Delivered ahead of schedule with clean modular code and extensive test coverage. Will definitely work together again.",
    createdAt: "2026-03-06T10:00:00Z",
    date: "2 weeks ago",
    dateFormatted: "2 weeks ago",
    aspectRatings: {
      communication: 5,
      qualityOfDelivery: 5,
      valueForMoney: 5,
    },
    helpfulCount: 5,
  },
  {
    id: "rev-174",
    gigId: "gig-4",
    sellerId: "usr-edge-overflow",
    buyer: {
      id: "f-1",
      name: "Alexandre Moreau",
      avatar:
        "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
      country: "France",
    },
    rating: 5,
    comment:
      "Incredible turnaround and profound technical depth. Saved our core product team at least a month of engineering time.",
    createdAt: "2026-04-09T10:00:00Z",
    date: "1 day ago",
    dateFormatted: "1 day ago",
    aspectRatings: {
      communication: 5,
      qualityOfDelivery: 5,
      valueForMoney: 5,
    },
    helpfulCount: 7,
  },
  {
    id: "rev-175",
    gigId: "gig-4",
    sellerId: "usr-edge-overflow",
    buyer: {
      id: "usr-12",
      name: "Priscilla Mertz",
      avatar:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80",
      country: "Vietnam",
    },
    rating: 5,
    comment:
      "Exceptional engineering quality. Delivered ahead of schedule with clean modular code and extensive test coverage. Will definitely work together again.",
    createdAt: "2026-01-12T10:00:00Z",
    date: "2 months ago",
    dateFormatted: "2 months ago",
    aspectRatings: {
      communication: 5,
      qualityOfDelivery: 5,
      valueForMoney: 5,
    },
    helpfulCount: 9,
  },
  {
    id: "rev-176",
    gigId: "gig-4",
    sellerId: "usr-edge-overflow",
    buyer: {
      id: "usr-19",
      name: "Sherwood Barrows",
      avatar:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80",
      country: "France",
    },
    rating: 5,
    comment:
      "Incredible turnaround and profound technical depth. Saved our core product team at least a month of engineering time.",
    createdAt: "2026-02-15T10:00:00Z",
    date: "1 month ago",
    dateFormatted: "1 month ago",
    aspectRatings: {
      communication: 5,
      qualityOfDelivery: 5,
      valueForMoney: 5,
    },
    helpfulCount: 11,
  },
  {
    id: "rev-177",
    gigId: "gig-4",
    sellerId: "usr-edge-overflow",
    buyer: {
      id: "usr-client-5",
      name: "Liam O'Connor",
      avatar:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80",
      country: "Ireland",
      company: "Nova Dynamics AI",
    },
    rating: 5,
    comment:
      "Exceptional engineering quality. Delivered ahead of schedule with clean modular code and extensive test coverage. Will definitely work together again.",
    createdAt: "2026-03-18T10:00:00Z",
    date: "1 week ago",
    dateFormatted: "1 week ago",
    aspectRatings: {
      communication: 5,
      qualityOfDelivery: 5,
      valueForMoney: 5,
    },
    helpfulCount: 13,
  },
  {
    id: "rev-178",
    gigId: "gig-4",
    sellerId: "usr-edge-overflow",
    buyer: {
      id: "usr-17",
      name: "Katrina Stehr",
      avatar:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80",
      country: "Singapore",
    },
    rating: 4,
    comment:
      "Good execution and reliable communication throughout. Resolved all feedback promptly during the revision cycle.",
    createdAt: "2026-04-21T10:00:00Z",
    date: "1 day ago",
    dateFormatted: "1 day ago",
    aspectRatings: {
      communication: 5,
      qualityOfDelivery: 4,
      valueForMoney: 5,
    },
    helpfulCount: 0,
  },
  {
    id: "rev-179",
    gigId: "gig-4",
    sellerId: "usr-edge-overflow",
    buyer: {
      id: "usr-client-3",
      name: "Emily Zhang",
      avatar:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80",
      country: "Singapore",
      company: "Nexus AI Ventures",
    },
    rating: 5,
    comment:
      "Exceptional engineering quality. Delivered ahead of schedule with clean modular code and extensive test coverage. Will definitely work together again.",
    createdAt: "2026-01-24T10:00:00Z",
    date: "2 months ago",
    dateFormatted: "2 months ago",
    aspectRatings: {
      communication: 5,
      qualityOfDelivery: 5,
      valueForMoney: 5,
    },
    helpfulCount: 2,
  },
  {
    id: "rev-180",
    gigId: "gig-4",
    sellerId: "usr-edge-overflow",
    buyer: {
      id: "usr-15",
      name: "Robin Christiansen",
      avatar:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80",
      country: "Japan",
    },
    rating: 5,
    comment:
      "Incredible turnaround and profound technical depth. Saved our core product team at least a month of engineering time.",
    createdAt: "2026-02-02T10:00:00Z",
    date: "1 month ago",
    dateFormatted: "1 month ago",
    aspectRatings: {
      communication: 5,
      qualityOfDelivery: 5,
      valueForMoney: 5,
    },
    helpfulCount: 4,
  },
  {
    id: "rev-181",
    gigId: "gig-4",
    sellerId: "usr-edge-overflow",
    buyer: {
      id: "usr-client-1",
      name: "Marcus Thorne",
      avatar:
        "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80",
      country: "United Kingdom",
      company: "Fintech Corp Ltd",
    },
    rating: 5,
    comment:
      "Exceptional engineering quality. Delivered ahead of schedule with clean modular code and extensive test coverage. Will definitely work together again.",
    createdAt: "2026-03-05T10:00:00Z",
    date: "2 weeks ago",
    dateFormatted: "2 weeks ago",
    aspectRatings: {
      communication: 5,
      qualityOfDelivery: 5,
      valueForMoney: 5,
    },
    helpfulCount: 6,
  },
  {
    id: "rev-182",
    gigId: "gig-4",
    sellerId: "usr-edge-overflow",
    buyer: {
      id: "usr-13",
      name: "River Johns",
      avatar:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80",
      country: "Germany",
    },
    rating: 5,
    comment:
      "Incredible turnaround and profound technical depth. Saved our core product team at least a month of engineering time.",
    createdAt: "2026-04-08T10:00:00Z",
    date: "1 day ago",
    dateFormatted: "1 day ago",
    aspectRatings: {
      communication: 5,
      qualityOfDelivery: 5,
      valueForMoney: 5,
    },
    helpfulCount: 8,
  },
  {
    id: "rev-183",
    gigId: "gig-4",
    sellerId: "usr-edge-overflow",
    buyer: {
      id: "usr-20",
      name: "Mitchell Ankunding",
      avatar:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80",
      country: "Australia",
    },
    rating: 5,
    comment:
      "Exceptional engineering quality. Delivered ahead of schedule with clean modular code and extensive test coverage. Will definitely work together again.",
    createdAt: "2026-01-11T10:00:00Z",
    date: "2 months ago",
    dateFormatted: "2 months ago",
    aspectRatings: {
      communication: 5,
      qualityOfDelivery: 5,
      valueForMoney: 5,
    },
    helpfulCount: 10,
  },
  {
    id: "rev-184",
    gigId: "gig-4",
    sellerId: "usr-edge-overflow",
    buyer: {
      id: "usr-11",
      name: "Gregory Bayer",
      avatar:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80",
      country: "United States",
    },
    rating: 5,
    comment:
      "Incredible turnaround and profound technical depth. Saved our core product team at least a month of engineering time.",
    createdAt: "2026-02-14T10:00:00Z",
    date: "1 month ago",
    dateFormatted: "1 month ago",
    aspectRatings: {
      communication: 5,
      qualityOfDelivery: 5,
      valueForMoney: 5,
    },
    helpfulCount: 12,
  },
  {
    id: "rev-185",
    gigId: "gig-4",
    sellerId: "usr-edge-overflow",
    buyer: {
      id: "usr-18",
      name: "Minh Nguyen",
      avatar:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80",
      country: "Vietnam",
    },
    rating: 5,
    comment:
      "Exceptional engineering quality. Delivered ahead of schedule with clean modular code and extensive test coverage. Will definitely work together again.",
    createdAt: "2026-03-17T10:00:00Z",
    date: "1 week ago",
    dateFormatted: "1 week ago",
    aspectRatings: {
      communication: 5,
      qualityOfDelivery: 5,
      valueForMoney: 5,
    },
    helpfulCount: 14,
  },
  {
    id: "rev-186",
    gigId: "gig-4",
    sellerId: "usr-edge-overflow",
    buyer: {
      id: "usr-client-4",
      name: "Rachel Adams",
      avatar:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80",
      country: "Canada",
      company: "Horizon Health Technologies",
    },
    rating: 5,
    comment:
      "Incredible turnaround and profound technical depth. Saved our core product team at least a month of engineering time.",
    createdAt: "2026-04-20T10:00:00Z",
    date: "1 day ago",
    dateFormatted: "1 day ago",
    aspectRatings: {
      communication: 5,
      qualityOfDelivery: 5,
      valueForMoney: 5,
    },
    helpfulCount: 1,
  },
  {
    id: "rev-187",
    gigId: "gig-4",
    sellerId: "usr-edge-overflow",
    buyer: {
      id: "usr-16",
      name: "David Herzog",
      avatar:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80",
      country: "Canada",
    },
    rating: 5,
    comment:
      "Exceptional engineering quality. Delivered ahead of schedule with clean modular code and extensive test coverage. Will definitely work together again.",
    createdAt: "2026-01-23T10:00:00Z",
    date: "2 months ago",
    dateFormatted: "2 months ago",
    aspectRatings: {
      communication: 5,
      qualityOfDelivery: 5,
      valueForMoney: 5,
    },
    helpfulCount: 3,
  },
  {
    id: "rev-188",
    gigId: "gig-4",
    sellerId: "usr-edge-overflow",
    buyer: {
      id: "usr-client-2",
      name: "David Sterling",
      avatar:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80",
      country: "United States",
      company: "Apex Capital Ventures",
    },
    rating: 5,
    comment:
      "Incredible turnaround and profound technical depth. Saved our core product team at least a month of engineering time.",
    createdAt: "2026-02-01T10:00:00Z",
    date: "1 month ago",
    dateFormatted: "1 month ago",
    aspectRatings: {
      communication: 5,
      qualityOfDelivery: 5,
      valueForMoney: 5,
    },
    helpfulCount: 5,
  },
  {
    id: "rev-189",
    gigId: "gig-4",
    sellerId: "usr-edge-overflow",
    buyer: {
      id: "usr-14",
      name: "Sandra Zieme-Luettgen",
      avatar:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80",
      country: "United Kingdom",
    },
    rating: 5,
    comment:
      "Exceptional engineering quality. Delivered ahead of schedule with clean modular code and extensive test coverage. Will definitely work together again.",
    createdAt: "2026-03-04T10:00:00Z",
    date: "3 weeks ago",
    dateFormatted: "3 weeks ago",
    aspectRatings: {
      communication: 5,
      qualityOfDelivery: 5,
      valueForMoney: 5,
    },
    helpfulCount: 7,
  },
  {
    id: "rev-190",
    gigId: "gig-4",
    sellerId: "usr-edge-overflow",
    buyer: {
      id: "f-1",
      name: "Alexandre Moreau",
      avatar:
        "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
      country: "France",
    },
    rating: 5,
    comment:
      "Incredible turnaround and profound technical depth. Saved our core product team at least a month of engineering time.",
    createdAt: "2026-04-07T10:00:00Z",
    date: "1 day ago",
    dateFormatted: "1 day ago",
    aspectRatings: {
      communication: 5,
      qualityOfDelivery: 5,
      valueForMoney: 5,
    },
    helpfulCount: 9,
  },
  {
    id: "rev-191",
    gigId: "gig-4",
    sellerId: "usr-edge-overflow",
    buyer: {
      id: "usr-12",
      name: "Priscilla Mertz",
      avatar:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80",
      country: "Vietnam",
    },
    rating: 5,
    comment:
      "Exceptional engineering quality. Delivered ahead of schedule with clean modular code and extensive test coverage. Will definitely work together again.",
    createdAt: "2026-01-10T10:00:00Z",
    date: "2 months ago",
    dateFormatted: "2 months ago",
    aspectRatings: {
      communication: 5,
      qualityOfDelivery: 5,
      valueForMoney: 5,
    },
    helpfulCount: 11,
  },
  {
    id: "rev-192",
    gigId: "gig-4",
    sellerId: "usr-edge-overflow",
    buyer: {
      id: "usr-19",
      name: "Sherwood Barrows",
      avatar:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80",
      country: "France",
    },
    rating: 5,
    comment:
      "Incredible turnaround and profound technical depth. Saved our core product team at least a month of engineering time.",
    createdAt: "2026-02-13T10:00:00Z",
    date: "1 month ago",
    dateFormatted: "1 month ago",
    aspectRatings: {
      communication: 5,
      qualityOfDelivery: 5,
      valueForMoney: 5,
    },
    helpfulCount: 13,
  },
  {
    id: "rev-193",
    gigId: "gig-4",
    sellerId: "usr-edge-overflow",
    buyer: {
      id: "usr-client-5",
      name: "Liam O'Connor",
      avatar:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80",
      country: "Ireland",
      company: "Nova Dynamics AI",
    },
    rating: 4,
    comment:
      "Great specialist who knows their craft. The deliverables matched our Figma designs accurately and performed well in QA.",
    createdAt: "2026-03-16T10:00:00Z",
    date: "1 week ago",
    dateFormatted: "1 week ago",
    aspectRatings: {
      communication: 5,
      qualityOfDelivery: 4,
      valueForMoney: 5,
    },
    helpfulCount: 0,
  },
  {
    id: "rev-194",
    gigId: "gig-4",
    sellerId: "usr-edge-overflow",
    buyer: {
      id: "usr-17",
      name: "Katrina Stehr",
      avatar:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80",
      country: "Singapore",
    },
    rating: 5,
    comment:
      "Incredible turnaround and profound technical depth. Saved our core product team at least a month of engineering time.",
    createdAt: "2026-04-19T10:00:00Z",
    date: "1 day ago",
    dateFormatted: "1 day ago",
    aspectRatings: {
      communication: 5,
      qualityOfDelivery: 5,
      valueForMoney: 5,
    },
    helpfulCount: 2,
  },
  {
    id: "rev-195",
    gigId: "gig-4",
    sellerId: "usr-edge-overflow",
    buyer: {
      id: "usr-client-3",
      name: "Emily Zhang",
      avatar:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80",
      country: "Singapore",
      company: "Nexus AI Ventures",
    },
    rating: 5,
    comment:
      "Exceptional engineering quality. Delivered ahead of schedule with clean modular code and extensive test coverage. Will definitely work together again.",
    createdAt: "2026-01-22T10:00:00Z",
    date: "2 months ago",
    dateFormatted: "2 months ago",
    aspectRatings: {
      communication: 5,
      qualityOfDelivery: 5,
      valueForMoney: 5,
    },
    helpfulCount: 4,
  },
  {
    id: "rev-196",
    gigId: "gig-4",
    sellerId: "usr-edge-overflow",
    buyer: {
      id: "usr-15",
      name: "Robin Christiansen",
      avatar:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80",
      country: "Japan",
    },
    rating: 5,
    comment:
      "Incredible turnaround and profound technical depth. Saved our core product team at least a month of engineering time.",
    createdAt: "2026-02-25T10:00:00Z",
    date: "4 weeks ago",
    dateFormatted: "4 weeks ago",
    aspectRatings: {
      communication: 5,
      qualityOfDelivery: 5,
      valueForMoney: 5,
    },
    helpfulCount: 6,
  },
  {
    id: "rev-197",
    gigId: "gig-4",
    sellerId: "usr-edge-overflow",
    buyer: {
      id: "usr-client-1",
      name: "Marcus Thorne",
      avatar:
        "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80",
      country: "United Kingdom",
      company: "Fintech Corp Ltd",
    },
    rating: 5,
    comment:
      "Exceptional engineering quality. Delivered ahead of schedule with clean modular code and extensive test coverage. Will definitely work together again.",
    createdAt: "2026-03-03T10:00:00Z",
    date: "3 weeks ago",
    dateFormatted: "3 weeks ago",
    aspectRatings: {
      communication: 5,
      qualityOfDelivery: 5,
      valueForMoney: 5,
    },
    helpfulCount: 8,
  },
  {
    id: "rev-198",
    gigId: "gig-4",
    sellerId: "usr-edge-overflow",
    buyer: {
      id: "usr-13",
      name: "River Johns",
      avatar:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80",
      country: "Germany",
    },
    rating: 5,
    comment:
      "Incredible turnaround and profound technical depth. Saved our core product team at least a month of engineering time.",
    createdAt: "2026-04-06T10:00:00Z",
    date: "1 day ago",
    dateFormatted: "1 day ago",
    aspectRatings: {
      communication: 5,
      qualityOfDelivery: 5,
      valueForMoney: 5,
    },
    helpfulCount: 10,
  },
  {
    id: "rev-199",
    gigId: "gig-4",
    sellerId: "usr-edge-overflow",
    buyer: {
      id: "usr-20",
      name: "Mitchell Ankunding",
      avatar:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80",
      country: "Australia",
    },
    rating: 5,
    comment:
      "Exceptional engineering quality. Delivered ahead of schedule with clean modular code and extensive test coverage. Will definitely work together again.",
    createdAt: "2026-01-09T10:00:00Z",
    date: "2 months ago",
    dateFormatted: "2 months ago",
    aspectRatings: {
      communication: 5,
      qualityOfDelivery: 5,
      valueForMoney: 5,
    },
    helpfulCount: 12,
  },
  {
    id: "rev-200",
    gigId: "gig-4",
    sellerId: "usr-edge-overflow",
    buyer: {
      id: "usr-11",
      name: "Gregory Bayer",
      avatar:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80",
      country: "United States",
    },
    rating: 5,
    comment:
      "Incredible turnaround and profound technical depth. Saved our core product team at least a month of engineering time.",
    createdAt: "2026-02-12T10:00:00Z",
    date: "1 month ago",
    dateFormatted: "1 month ago",
    aspectRatings: {
      communication: 5,
      qualityOfDelivery: 5,
      valueForMoney: 5,
    },
    helpfulCount: 14,
  },
  {
    id: "rev-201",
    gigId: "gig-4",
    sellerId: "usr-edge-overflow",
    buyer: {
      id: "usr-18",
      name: "Minh Nguyen",
      avatar:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80",
      country: "Vietnam",
    },
    rating: 5,
    comment:
      "Exceptional engineering quality. Delivered ahead of schedule with clean modular code and extensive test coverage. Will definitely work together again.",
    createdAt: "2026-03-15T10:00:00Z",
    date: "1 week ago",
    dateFormatted: "1 week ago",
    aspectRatings: {
      communication: 5,
      qualityOfDelivery: 5,
      valueForMoney: 5,
    },
    helpfulCount: 1,
  },
  {
    id: "rev-202",
    gigId: "gig-4",
    sellerId: "usr-edge-overflow",
    buyer: {
      id: "usr-client-4",
      name: "Rachel Adams",
      avatar:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80",
      country: "Canada",
      company: "Horizon Health Technologies",
    },
    rating: 5,
    comment:
      "Incredible turnaround and profound technical depth. Saved our core product team at least a month of engineering time.",
    createdAt: "2026-04-18T10:00:00Z",
    date: "1 day ago",
    dateFormatted: "1 day ago",
    aspectRatings: {
      communication: 5,
      qualityOfDelivery: 5,
      valueForMoney: 5,
    },
    helpfulCount: 3,
  },
  {
    id: "rev-203",
    gigId: "gig-4",
    sellerId: "usr-edge-overflow",
    buyer: {
      id: "usr-16",
      name: "David Herzog",
      avatar:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80",
      country: "Canada",
    },
    rating: 5,
    comment:
      "Exceptional engineering quality. Delivered ahead of schedule with clean modular code and extensive test coverage. Will definitely work together again.",
    createdAt: "2026-01-21T10:00:00Z",
    date: "2 months ago",
    dateFormatted: "2 months ago",
    aspectRatings: {
      communication: 5,
      qualityOfDelivery: 5,
      valueForMoney: 5,
    },
    helpfulCount: 5,
  },
  {
    id: "rev-204",
    gigId: "gig-4",
    sellerId: "usr-edge-overflow",
    buyer: {
      id: "usr-client-2",
      name: "David Sterling",
      avatar:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80",
      country: "United States",
      company: "Apex Capital Ventures",
    },
    rating: 5,
    comment:
      "Incredible turnaround and profound technical depth. Saved our core product team at least a month of engineering time.",
    createdAt: "2026-02-24T10:00:00Z",
    date: "4 weeks ago",
    dateFormatted: "4 weeks ago",
    aspectRatings: {
      communication: 5,
      qualityOfDelivery: 5,
      valueForMoney: 5,
    },
    helpfulCount: 7,
  },
  {
    id: "rev-205",
    gigId: "gig-4",
    sellerId: "usr-edge-overflow",
    buyer: {
      id: "usr-14",
      name: "Sandra Zieme-Luettgen",
      avatar:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80",
      country: "United Kingdom",
    },
    rating: 5,
    comment:
      "Exceptional engineering quality. Delivered ahead of schedule with clean modular code and extensive test coverage. Will definitely work together again.",
    createdAt: "2026-03-02T10:00:00Z",
    date: "3 weeks ago",
    dateFormatted: "3 weeks ago",
    aspectRatings: {
      communication: 5,
      qualityOfDelivery: 5,
      valueForMoney: 5,
    },
    helpfulCount: 9,
  },
  {
    id: "rev-206",
    gigId: "gig-4",
    sellerId: "usr-edge-overflow",
    buyer: {
      id: "f-1",
      name: "Alexandre Moreau",
      avatar:
        "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
      country: "France",
    },
    rating: 5,
    comment:
      "Incredible turnaround and profound technical depth. Saved our core product team at least a month of engineering time.",
    createdAt: "2026-04-05T10:00:00Z",
    date: "1 day ago",
    dateFormatted: "1 day ago",
    aspectRatings: {
      communication: 5,
      qualityOfDelivery: 5,
      valueForMoney: 5,
    },
    helpfulCount: 11,
  },
  {
    id: "rev-207",
    gigId: "gig-4",
    sellerId: "usr-edge-overflow",
    buyer: {
      id: "usr-12",
      name: "Priscilla Mertz",
      avatar:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80",
      country: "Vietnam",
    },
    rating: 5,
    comment:
      "Exceptional engineering quality. Delivered ahead of schedule with clean modular code and extensive test coverage. Will definitely work together again.",
    createdAt: "2026-01-08T10:00:00Z",
    date: "2 months ago",
    dateFormatted: "2 months ago",
    aspectRatings: {
      communication: 5,
      qualityOfDelivery: 5,
      valueForMoney: 5,
    },
    helpfulCount: 13,
  },
  {
    id: "rev-208",
    gigId: "gig-4",
    sellerId: "usr-edge-overflow",
    buyer: {
      id: "usr-19",
      name: "Sherwood Barrows",
      avatar:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80",
      country: "France",
    },
    rating: 4,
    comment:
      "High quality work and prompt responses. Would have liked slightly more inline comments, but the architecture is rock solid.",
    createdAt: "2026-02-11T10:00:00Z",
    date: "1 month ago",
    dateFormatted: "1 month ago",
    aspectRatings: {
      communication: 5,
      qualityOfDelivery: 4,
      valueForMoney: 5,
    },
    helpfulCount: 0,
  },
  {
    id: "rev-209",
    gigId: "gig-4",
    sellerId: "usr-edge-overflow",
    buyer: {
      id: "usr-client-5",
      name: "Liam O'Connor",
      avatar:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80",
      country: "Ireland",
      company: "Nova Dynamics AI",
    },
    rating: 5,
    comment:
      "Exceptional engineering quality. Delivered ahead of schedule with clean modular code and extensive test coverage. Will definitely work together again.",
    createdAt: "2026-03-14T10:00:00Z",
    date: "1 week ago",
    dateFormatted: "1 week ago",
    aspectRatings: {
      communication: 5,
      qualityOfDelivery: 5,
      valueForMoney: 5,
    },
    helpfulCount: 2,
  },
  {
    id: "rev-210",
    gigId: "gig-4",
    sellerId: "usr-edge-overflow",
    buyer: {
      id: "usr-17",
      name: "Katrina Stehr",
      avatar:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80",
      country: "Singapore",
    },
    rating: 5,
    comment:
      "Incredible turnaround and profound technical depth. Saved our core product team at least a month of engineering time.",
    createdAt: "2026-04-17T10:00:00Z",
    date: "1 day ago",
    dateFormatted: "1 day ago",
    aspectRatings: {
      communication: 5,
      qualityOfDelivery: 5,
      valueForMoney: 5,
    },
    helpfulCount: 4,
  },
  {
    id: "rev-211",
    gigId: "gig-4",
    sellerId: "usr-edge-overflow",
    buyer: {
      id: "usr-client-3",
      name: "Emily Zhang",
      avatar:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80",
      country: "Singapore",
      company: "Nexus AI Ventures",
    },
    rating: 5,
    comment:
      "Exceptional engineering quality. Delivered ahead of schedule with clean modular code and extensive test coverage. Will definitely work together again.",
    createdAt: "2026-01-20T10:00:00Z",
    date: "2 months ago",
    dateFormatted: "2 months ago",
    aspectRatings: {
      communication: 5,
      qualityOfDelivery: 5,
      valueForMoney: 5,
    },
    helpfulCount: 6,
  },
]

export function getReviewById(id: string): Review | undefined {
  return MOCK_REVIEWS.find((r) => r.id === id)
}

export function getReviewsByGigId(gigId: string): Review[] {
  if (gigId === "srv-1") return MOCK_REVIEWS.filter((r) => r.gigId === "gig-1")
  return MOCK_REVIEWS.filter((r) => r.gigId === gigId)
}

export function getReviewsBySellerId(sellerId: string): Review[] {
  return MOCK_REVIEWS.filter((r) => r.sellerId === sellerId)
}

export function getReviewsByBuyerId(buyerId: string): Review[] {
  return MOCK_REVIEWS.filter((r) => r.buyer.id === buyerId)
}

export function getAverageRatingForGig(gigId: string): { rating: number; count: number } {
  const reviews = getReviewsByGigId(gigId)
  if (reviews.length === 0) return { rating: 5.0, count: 0 }
  const sum = reviews.reduce((acc, r) => acc + r.rating, 0)
  return {
    rating: Math.round((sum / reviews.length) * 100) / 100,
    count: reviews.length,
  }
}
