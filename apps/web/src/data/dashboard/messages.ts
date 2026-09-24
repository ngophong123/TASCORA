export interface MessageAttachment {
  id: string
  name: string
  size: string
  type: "code" | "pdf" | "zip" | "figma" | "image"
  url?: string
}

export interface ChatMessage {
  id: string
  senderId: "me" | string
  senderName: string
  content: string
  time: string
  date: string
  read: boolean
  attachments?: MessageAttachment[]
}

export interface ConversationPartner {
  id: string
  name: string
  title: string
  avatar: string
  online: boolean
  lastSeen?: string
  rating: number
  reviewsCount: number
  responseTime: string
  level?: "TOP_RATED" | "LEVEL_2" | "LEVEL_1"
}

export interface ConversationOrderContext {
  id: string
  title: string
  category: string
  tier: "BASIC" | "STANDARD" | "PREMIUM"
  amount: string
  escrowAmount: string
  status: "active" | "delivered" | "completed" | "cancelled"
  dueDate: string
  milestoneSummary: {
    total: number
    completed: number
    currentTitle: string
    currentAmount: string
  }
  sharedFiles: MessageAttachment[]
}

export interface Conversation {
  id: string
  partner: ConversationPartner
  order: ConversationOrderContext
  lastMessage: string
  lastMessageTime: string
  unreadCount: number
  archived?: boolean
  messages: ChatMessage[]
}

export const MOCK_CONVERSATIONS: Conversation[] = [
  {
    id: "conv-1",
    partner: {
      id: "usr-alexandre",
      name: "Alexandre Moreau",
      title: "Senior Full-Stack Architect",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
      online: true,
      lastSeen: "Active now",
      rating: 4.9,
      reviewsCount: 48,
      responseTime: "< 30 mins",
      level: "TOP_RATED",
    },
    order: {
      id: "ORD-9481",
      title: "Next.js 15 & Node.js Production Architecture with Clean Code",
      category: "Web Development",
      tier: "STANDARD",
      amount: "$450.00",
      escrowAmount: "$450.00",
      status: "active",
      dueDate: "Tomorrow, 18:00",
      milestoneSummary: {
        total: 3,
        completed: 2,
        currentTitle: "Database Schemas & Auth Scaffolding",
        currentAmount: "$150.00",
      },
      sharedFiles: [
        {
          id: "f-1",
          name: "schema-v2.prisma",
          size: "18.4 KB",
          type: "code",
        },
        {
          id: "f-2",
          name: "docker-compose.production.yml",
          size: "4.2 KB",
          type: "code",
        },
        {
          id: "f-3",
          name: "architecture-spec-v1.pdf",
          size: "2.4 MB",
          type: "pdf",
        },
      ],
    },
    lastMessage: "I've pushed the architecture documentation. We're on schedule for tomorrow's deploy.",
    lastMessageTime: "10m ago",
    unreadCount: 1,
    messages: [
      {
        id: "m-101",
        senderId: "usr-alexandre",
        senderName: "Alexandre Moreau",
        content: "Hi Marcus, thank you for accepting the proposal! I have begun provisioning the Next.js 15 App Router boilerplate with strict TypeScript and Docker configs.",
        time: "14:20",
        date: "Today",
        read: true,
      },
      {
        id: "m-102",
        senderId: "me",
        senderName: "Marcus Thorne",
        content: "Awesome Alexandre! Please make sure JWT token rotation logic is configured with httpOnly secure cookies and proper CSRF headers.",
        time: "14:35",
        date: "Today",
        read: true,
      },
      {
        id: "m-103",
        senderId: "usr-alexandre",
        senderName: "Alexandre Moreau",
        content: "Understood. The auth cookies are configured with SameSite=Lax and httpOnly flags. Here is the updated Prisma migration schema for review.",
        time: "15:02",
        date: "Today",
        read: true,
        attachments: [
          {
            id: "att-1",
            name: "schema-v2.prisma",
            size: "18.4 KB",
            type: "code",
          },
        ],
      },
      {
        id: "m-104",
        senderId: "me",
        senderName: "Marcus Thorne",
        content: "The relation models and indexes look crisp. Approved the milestone 2 payout from escrow!",
        time: "15:20",
        date: "Today",
        read: true,
      },
      {
        id: "m-105",
        senderId: "usr-alexandre",
        senderName: "Alexandre Moreau",
        content: "I've pushed the architecture documentation. We're on schedule for tomorrow's deploy.",
        time: "15:45",
        date: "Today",
        read: false,
        attachments: [
          {
            id: "att-2",
            name: "architecture-spec-v1.pdf",
            size: "2.4 MB",
            type: "pdf",
          },
        ],
      },
    ],
  },
  {
    id: "conv-2",
    partner: {
      id: "usr-sophia",
      name: "Sophia Rodriguez",
      title: "AI & Machine Learning Engineer",
      avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80",
      online: true,
      lastSeen: "Active now",
      rating: 5.0,
      reviewsCount: 34,
      responseTime: "< 1 hour",
      level: "TOP_RATED",
    },
    order: {
      id: "ORD-8923",
      title: "Autonomous AI Agents & LLM RAG Pipeline Development",
      category: "Artificial Intelligence",
      tier: "PREMIUM",
      amount: "$850.00",
      escrowAmount: "$850.00",
      status: "active",
      dueDate: "In 3 days",
      milestoneSummary: {
        total: 4,
        completed: 2,
        currentTitle: "Vector Embedding Index & Chunking Pipeline",
        currentAmount: "$300.00",
      },
      sharedFiles: [
        {
          id: "f-4",
          name: "vector-pipeline-benchmarks.pdf",
          size: "3.8 MB",
          type: "pdf",
        },
        {
          id: "f-5",
          name: "rag-prompts-production.json",
          size: "62.1 KB",
          type: "code",
        },
      ],
    },
    lastMessage: "The LangChain vector agent deliverable is ready for your sign-off.",
    lastMessageTime: "2h ago",
    unreadCount: 0,
    messages: [
      {
        id: "m-201",
        senderId: "usr-sophia",
        senderName: "Sophia Rodriguez",
        content: "Hello Marcus! The hybrid search pipeline with pgvector and Cohere reranker is performing beyond expectations.",
        time: "11:15",
        date: "Today",
        read: true,
      },
      {
        id: "m-202",
        senderId: "usr-sophia",
        senderName: "Sophia Rodriguez",
        content: "The LangChain vector agent deliverable is ready for your sign-off.",
        time: "12:15",
        date: "Today",
        read: true,
        attachments: [
          {
            id: "att-3",
            name: "vector-pipeline-benchmarks.pdf",
            size: "3.8 MB",
            type: "pdf",
          },
        ],
      },
    ],
  },
  {
    id: "conv-3",
    partner: {
      id: "usr-david",
      name: "David Kael",
      title: "Lead Brand & Product Designer",
      avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80",
      online: false,
      lastSeen: "2 hours ago",
      rating: 4.8,
      reviewsCount: 52,
      responseTime: "< 2 hours",
      level: "LEVEL_2",
    },
    order: {
      id: "ORD-7712",
      title: "Fintech Brand Identity, 3D Assets & Design System",
      category: "UI/UX Design",
      tier: "PREMIUM",
      amount: "$1,200.00",
      escrowAmount: "$1,200.00",
      status: "active",
      dueDate: "In 5 days",
      milestoneSummary: {
        total: 3,
        completed: 1,
        currentTitle: "Interactive 3D Glassmorphism Assets & Icons",
        currentAmount: "$450.00",
      },
      sharedFiles: [
        {
          id: "f-6",
          name: "tascora-design-tokens.fig",
          size: "18.4 MB",
          type: "figma",
        },
        {
          id: "f-7",
          name: "3d-fintech-assets.zip",
          size: "42.0 MB",
          type: "zip",
        },
      ],
    },
    lastMessage: "Attached the exported tokens and 3D card asset renders for the marketing hero section.",
    lastMessageTime: "Yesterday",
    unreadCount: 0,
    messages: [
      {
        id: "m-301",
        senderId: "usr-david",
        senderName: "David Kael",
        content: "Attached the exported tokens and 3D card asset renders for the marketing hero section.",
        time: "16:40",
        date: "Yesterday",
        read: true,
        attachments: [
          {
            id: "att-4",
            name: "tascora-design-tokens.fig",
            size: "18.4 MB",
            type: "figma",
          },
        ],
      },
    ],
  },
  {
    id: "conv-4",
    partner: {
      id: "usr-elena",
      name: "Elena Rostova",
      title: "Senior Frontend & WebGL Specialist",
      avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80",
      online: false,
      lastSeen: "Yesterday",
      rating: 4.95,
      reviewsCount: 67,
      responseTime: "< 45 mins",
      level: "TOP_RATED",
    },
    order: {
      id: "ORD-6540",
      title: "High-converting SaaS Landing Page with Smooth 3D Canvas",
      category: "Web Development",
      tier: "STANDARD",
      amount: "$600.00",
      escrowAmount: "$600.00",
      status: "completed",
      dueDate: "Completed",
      milestoneSummary: {
        total: 2,
        completed: 2,
        currentTitle: "Final Production Deployment & Speed Audit",
        currentAmount: "$300.00",
      },
      sharedFiles: [
        {
          id: "f-8",
          name: "threejs-shader-bundle.zip",
          size: "12.2 MB",
          type: "zip",
        },
      ],
    },
    lastMessage: "Client sign-off confirmed and payment released. Thank you for the great collaboration!",
    lastMessageTime: "3d ago",
    unreadCount: 0,
    archived: true,
    messages: [
      {
        id: "m-401",
        senderId: "usr-elena",
        senderName: "Elena Rostova",
        content: "Client sign-off confirmed and payment released. Thank you for the great collaboration!",
        time: "09:30",
        date: "Sep 18",
        read: true,
      },
    ],
  },
]
