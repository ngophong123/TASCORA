# TASKORA

## Production-Grade Freelance Marketplace Platform

Tagline:

> Connect. Work. Deliver.

---

# 0. ROLE

You are acting as a complete senior engineering team:

- Software Architect
- Product Manager
- UX/UI Designer
- Frontend Engineer
- Backend Engineer
- Database Engineer
- Real-time Systems Engineer
- Security Engineer
- DevOps Engineer
- QA Engineer
- Performance Engineer
- Technical Writer

Build TASKORA as a serious production-style freelance marketplace.

This is NOT a simple CRUD project.

This is NOT a UI-only demo.

This is NOT a fake Fiverr landing page.

The goal is to create a realistic marketplace system that demonstrates professional software engineering and can be presented as a flagship portfolio project.

---

# 1. PRODUCT VISION

TASKORA is a marketplace where:

BUYERS:

- discover services
- compare sellers
- purchase packages
- communicate with sellers
- submit requirements
- track orders
- request revisions
- receive deliveries
- complete orders
- leave reviews

SELLERS:

- create services
- configure packages
- manage orders
- communicate with buyers
- deliver work
- handle revisions
- track earnings
- monitor analytics
- build their reputation

ADMINS:

- manage users
- moderate services
- manage categories
- monitor orders
- manage disputes
- manage reports
- configure marketplace settings
- inspect audit logs
- monitor platform health

---

# 2. CORE PRODUCT FLOW

Implement the complete lifecycle:

User registration
↓
Email verification
↓
Profile creation
↓
Seller onboarding
↓
Service creation
↓
Service moderation
↓
Service publishing
↓
Buyer discovery
↓
Search / filter
↓
Service detail
↓
Package selection
↓
Checkout
↓
Mock payment
↓
Order creation
↓
Seller confirmation
↓
Order started
↓
Real-time chat
↓
Requirements
↓
Work in progress
↓
Delivery
↓
Revision if needed
↓
Final delivery
↓
Buyer completion
↓
Review
↓
Seller earnings
↓
Analytics
↓
Admin reporting

Every stage must be connected.

---

# 3. TECHNOLOGY STACK

## Frontend

- Next.js latest stable version
- TypeScript
- React
- App Router
- Tailwind CSS
- shadcn/ui
- TanStack Query
- Zustand
- React Hook Form
- Zod
- dnd-kit
- Socket.IO Client
- Recharts
- Lucide React

Strict TypeScript.

Do not use JavaScript for application code.

---

# 4. BACKEND

Use:

- Node.js
- TypeScript
- Express.js
- Prisma ORM
- PostgreSQL
- Redis
- Socket.IO
- JWT
- bcrypt
- Zod
- Helmet
- CORS
- express-rate-limit
- Pino

Architecture:

Controller
↓
Service
↓
Repository
↓
Prisma
↓
PostgreSQL

Controllers must remain thin.

Business rules must live inside services/domain logic.

---

# 5. MONOREPO

Use pnpm workspaces.

Structure:

taskora/

├── apps/
│ ├── web/
│ ├── api/
│ └── admin/
│
├── packages/
│ ├── ui/
│ ├── types/
│ ├── config/
│ ├── eslint-config/
│ └── tsconfig/
│
├── prisma/
├── docs/
├── tests/
├── docker/
├── scripts/
├── .github/
│ └── workflows/
│
├── docker-compose.yml
├── pnpm-workspace.yaml
├── package.json
├── README.md
└── .env.example

---

# 6. DATABASE DOMAIN MODEL

Design a proper normalized relational database.

Main entities:

User
SellerProfile
BuyerProfile
Category
Service
ServicePackage
ServiceImage
ServiceFAQ
ServiceRequirement
Favorite
Order
OrderItem
OrderRequirement
OrderDelivery
OrderRevision
OrderActivity
Conversation
Message
MessageAttachment
Notification
NotificationPreference
Review
ReviewReply
Payment
Refund
SellerWallet
WalletTransaction
Dispute
Report
AuditLog
PlatformSetting
UserSession
RefreshToken
EmailVerification
PasswordResetToken
SellerVerification
SellerBadge
SellerLevel
Coupon
CouponUsage
AnalyticsEvent

Use UUID/CUID appropriately.

Use timestamps consistently.

Use soft deletion where appropriate.

Use foreign keys.

Use unique constraints.

Use database indexes.

Use transactions.

---

# 7. USER SYSTEM

User roles:

BUYER
SELLER
ADMIN

Account states:

ACTIVE
INACTIVE
SUSPENDED
BANNED
PENDING_VERIFICATION

Implement:

- registration
- login
- logout
- refresh token
- email verification
- forgot password
- reset password
- change password
- profile update
- avatar
- account status

---

# 8. SESSION MANAGEMENT

Create secure session management.

Track:

- session ID
- user ID
- refresh token hash
- device information
- IP where appropriate
- created time
- last activity
- expiration
- revoked state

Allow users to:

- view active sessions
- revoke a session
- logout from all devices

---

# 9. SELLER ONBOARDING

Seller registration should not immediately create a fully active seller.

Create onboarding:

Step 1:
Personal information

Step 2:
Professional title

Step 3:
Bio

Step 4:
Skills

Step 5:
Languages

Step 6:
Experience

Step 7:
Hourly rate

Step 8:
Availability

Step 9:
Profile image

Step 10:
Submit for review

Seller status:

DRAFT
PENDING_REVIEW
APPROVED
REJECTED
SUSPENDED

---

# 10. SELLER VERIFICATION

Create a verification architecture.

Do not require real government documents for the demo.

Implement verification states:

NOT_SUBMITTED
PENDING
VERIFIED
REJECTED

Admin can approve/reject seller verification.

Keep sensitive verification data separated from normal user profile data.

---

# 11. SELLER REPUTATION

Implement:

- rating
- review count
- completed orders
- completion rate
- cancellation rate
- response rate
- average response time
- on-time delivery rate

Create seller levels:

NEW
LEVEL_1
LEVEL_2
TOP_SELLER

Create badges:

FAST_RESPONDER
TOP_RATED
ON_TIME
HIGHLY_RECOMMENDED

Badge logic should be implemented as reusable services.

---

# 12. CATEGORY SYSTEM

Support:

Category
└── Subcategory

Admin can:

- create
- update
- delete
- activate
- deactivate
- reorder

Use slugs.

Prevent deletion when category has active services unless explicitly handled.

---

# 13. SERVICE SYSTEM

Seller can:

- create
- edit
- save draft
- publish
- pause
- archive
- duplicate

Service lifecycle:

DRAFT
↓
PENDING_REVIEW
↓
APPROVED
↓
ACTIVE

Possible:

ACTIVE
→ PAUSED
→ ACTIVE

ACTIVE
→ ARCHIVED

REJECTED
→ DRAFT

Admin moderation is required before publishing if configured.

---

# 14. SERVICE PACKAGES

Every service supports:

Basic
Standard
Premium

Each package:

- title
- description
- price
- delivery days
- revisions
- features

Allow seller to customize package names.

---

# 15. SERVICE CONTENT

Support:

- title
- description
- images
- category
- tags
- packages
- FAQs
- requirements
- delivery information

Use rich text safely.

Sanitize user-generated content.

---

# 16. SERVICE SEARCH

Implement:

- keyword search
- category
- subcategory
- price range
- rating
- delivery time
- seller level
- language
- online/available
- package type

Sort:

- recommended
- popular
- newest
- rating
- price low-high
- price high-low

Implement:

- pagination
- cursor pagination where useful
- debounced search
- database indexes

Prepare architecture for Elasticsearch/OpenSearch later.

---

# 17. RECOMMENDATION ENGINE

Implement a basic recommendation system.

Initially use deterministic scoring.

Factors:

- category match
- keyword match
- rating
- review count
- order count
- seller level
- recent activity
- service popularity

Create:

RecommendationService

Do not use machine learning initially.

Architecture must allow ML recommendation later.

---

# 18. FAVORITES

Users can:

- favorite services
- unfavorite
- view favorites

Prevent duplicate favorites.

---

# 19. SHOPPING CART

Implement cart support.

Buyer can:

- add service package
- remove item
- update quantity where applicable
- view cart

For services that should only have quantity 1, enforce this business rule.

Cart should survive page refresh.

---

# 20. CHECKOUT

Checkout steps:

1. Review package
2. Requirements
3. Coupon
4. Price calculation
5. Platform fee
6. Payment
7. Confirmation

Never trust frontend prices.

Backend recalculates:

subtotal +
platform fee
------------

# discount

total

---

# 21. COUPON SYSTEM

Implement:

Coupon

Fields:

- code
- type
- value
- minimum order
- maximum discount
- usage limit
- per-user limit
- start date
- expiry date
- active

Types:

PERCENTAGE
FIXED_AMOUNT

Validate coupons entirely on backend.

Prevent race conditions when usage limits are reached.

---

# 22. PAYMENT ARCHITECTURE

Do NOT process real money.

Implement payment abstraction:

PaymentProvider

Methods:

createPayment()
verifyPayment()
refundPayment()
getPaymentStatus()

Implement:

MockPaymentProvider

Payment states:

PENDING
PROCESSING
SUCCEEDED
FAILED
REFUNDED

Use idempotency keys.

Prevent duplicate payments.

Prepare architecture for future Stripe integration.

---

# 23. ORDER SYSTEM

Order contains:

- order number
- buyer
- seller
- service
- package
- price snapshot
- requirements
- deadline
- platform fee
- discount
- total
- status
- payment status

Important:

When an order is created, store price/package information as a snapshot.

Changing a service price later must NOT modify an existing order.

---

# 24. ORDER STATE MACHINE

Valid transitions only.

Example:

PENDING
→ CONFIRMED

CONFIRMED
→ IN_PROGRESS
→ CANCELLED

IN_PROGRESS
→ DELIVERED
→ CANCELLED

DELIVERED
→ REVISION_REQUESTED
→ COMPLETED

REVISION_REQUESTED
→ IN_PROGRESS

COMPLETED
→ FINAL

Never allow arbitrary status updates.

Create:

OrderStateMachine

Backend must validate every transition.

---

# 25. ORDER DEADLINES

Calculate delivery deadline from:

order creation +
package deliveryDays

Track:

- deadline
- remaining time
- overdue state

Create background jobs for:

- deadline reminders
- overdue orders
- abandoned orders

---

# 26. ORDER TIMELINE

Each order must have an activity timeline.

Examples:

Order created
Payment completed
Seller accepted order
Seller started work
Requirement submitted
Delivery uploaded
Revision requested
Order completed

Store activity in database.

---

# 27. ORDER REQUIREMENTS

Buyer submits requirements after purchase.

Support:

- text
- structured fields
- attachments

Seller can:

- view requirements
- request clarification

Buyer can update requirements only when allowed by order state.

---

# 28. ORDER DELIVERY

Seller can deliver work.

Delivery contains:

- message
- attachments
- createdAt

Support multiple deliveries.

Buyer can:

- accept delivery
- request revision

---

# 29. REVISION SYSTEM

Package has revision limit.

Track:

- allowed revisions
- used revisions

Prevent unlimited revisions.

If revision limit is exceeded:

- require seller agreement
- or create dispute

---

# 30. KANBAN

Seller dashboard:

Pending
Confirmed
In Progress
Delivered
Revision
Completed
Cancelled

Use dnd-kit.

Drag:

Frontend
→ API
→ validation
→ database
→ transaction
→ Socket.IO
→ notification

Optimistic update with rollback.

---

# 31. REAL-TIME CHAT

Socket.IO.

Every order has its own conversation.

Features:

- send message
- receive message
- typing
- online status
- offline status
- read receipts
- unread count
- pagination
- attachments
- system messages
- message timestamps

Rooms:

order:{orderId}

Only buyer and seller associated with order can join.

Admins may access through controlled moderation routes.

---

# 32. MESSAGE SECURITY

Prevent:

- unauthorized room joining
- message spoofing
- cross-order message access
- malicious payloads

Validate every Socket.IO event server-side.

Do not trust user IDs sent from client.

Extract authenticated user from socket session/token.

---

# 33. MESSAGE PAGINATION

Do not load thousands of messages.

Implement cursor-based pagination.

Example:

GET /orders/:id/messages?cursor=...

Load newest messages first.

Allow loading older messages.

---

# 34. MESSAGE SEARCH

Allow participants to search their order conversation.

Search:

- message content
- sender

Use database search initially.

---

# 35. NOTIFICATIONS

Types:

NEW_ORDER
ORDER_ACCEPTED
ORDER_STARTED
ORDER_DELIVERED
REVISION_REQUESTED
ORDER_COMPLETED
ORDER_CANCELLED
NEW_MESSAGE
NEW_REVIEW
PAYMENT_SUCCESS
PAYMENT_FAILED
DISPUTE_CREATED
DISPUTE_UPDATED
SELLER_APPROVED
SYSTEM

Support:

- realtime
- persistent
- unread counter
- mark read
- mark all read
- notification preferences

---

# 36. EMAIL SYSTEM

Create EmailService abstraction.

Methods:

sendVerificationEmail()
sendPasswordResetEmail()
sendOrderCreatedEmail()
sendOrderAcceptedEmail()
sendDeliveryEmail()
sendRevisionEmail()
sendCompletionEmail()
sendReviewReminder()

Development:

Console/mock provider.

Production:

SMTP/provider abstraction.

Never put email credentials in source code.

---

# 37. BACKGROUND JOBS

Use Redis + BullMQ or equivalent job queue.

Jobs:

- emails
- notifications
- order reminders
- overdue orders
- review reminders
- analytics processing
- cleanup expired tokens
- abandoned checkout cleanup

Create workers separately from API process.

---

# 38. SELLER WALLET

Create virtual wallet.

Fields:

- available balance
- pending balance
- total earnings

Wallet transactions:

EARNING
PENDING
RELEASED
REFUND
ADJUSTMENT
WITHDRAWAL

Do NOT perform real financial transfers.

---

# 39. EARNING RELEASE

When order completes:

money enters pending balance.

After configured settlement period:

pending
→ available

Use background job.

Admin can configure settlement period.

---

# 40. WITHDRAWAL SIMULATION

Seller can request withdrawal.

States:

PENDING
APPROVED
PROCESSING
COMPLETED
REJECTED

No real bank transfer.

Admin can process simulated withdrawals.

---

# 41. REVIEW SYSTEM

Buyer can review completed orders.

Rating:

1–5

Review:

- rating
- comment

Rules:

- completed order only
- one review per order
- buyer must own order
- seller cannot review own service as buyer
- cancelled orders cannot be reviewed

---

# 42. REVIEW MODERATION

Admin can:

- inspect review
- hide review
- restore review
- delete review where policy allows

Keep moderation history in AuditLog.

---

# 43. DISPUTE SYSTEM

Buyer or seller can open dispute.

Dispute:

- order
- openedBy
- reason
- description
- evidence
- status
- admin notes
- resolution

Statuses:

OPEN
UNDER_REVIEW
WAITING_FOR_RESPONSE
RESOLVED
REJECTED

Admin can resolve.

---

# 44. REPORT SYSTEM

Users can report:

- service
- user
- review
- message

Create report queue for admins.

Priorities:

LOW
MEDIUM
HIGH
CRITICAL

---

# 45. ADMIN DASHBOARD

Create a professional admin panel.

Pages:

/admin
/admin/users
/admin/sellers
/admin/services
/admin/categories
/admin/orders
/admin/payments
/admin/wallets
/admin/reviews
/admin/reports
/admin/disputes
/admin/coupons
/admin/notifications
/admin/settings
/admin/audit-logs
/admin/system-health

---

# 46. ADMIN ANALYTICS

Show:

- GMV
- platform revenue
- seller earnings
- orders
- completed orders
- cancelled orders
- active users
- new users
- active sellers
- service growth
- conversion rate

Charts:

- daily revenue
- monthly revenue
- orders
- users
- seller growth

---

# 47. PLATFORM SETTINGS

Create database-driven settings.

Examples:

platformName
platformFeePercentage
currency
minimumOrderAmount
sellerSettlementDays
maxFileSize
maintenanceMode
allowRegistration
requireSellerApproval
requireServiceApproval
enableReviews
enableCoupons
enableChat
enableWithdrawals

Admin can update settings.

Cache settings with Redis where appropriate.

---

# 48. FEATURE FLAGS

Implement simple feature flags.

Example:

FEATURE_CHAT
FEATURE_COUPONS
FEATURE_SELLER_VERIFICATION
FEATURE_WITHDRAWALS
FEATURE_REVIEWS

Allow admins/developers to enable/disable selected features.

---

# 49. ADMIN AUDIT LOG

Record sensitive actions.

Examples:

ADMIN_LOGIN
USER_SUSPENDED
USER_BANNED
SERVICE_APPROVED
SERVICE_REJECTED
ORDER_MODIFIED
DISPUTE_RESOLVED
PAYMENT_REFUNDED
SETTING_UPDATED
COUPON_CREATED

Include:

actor
action
target
metadata
timestamp

---

# 50. SECURITY ARCHITECTURE

Implement:

- Helmet
- CORS
- CSP where practical
- secure cookies
- rate limiting
- authentication
- authorization
- ownership checks
- input validation
- output sanitization
- file validation
- MIME validation
- upload size limits
- request body limits
- brute-force protection
- refresh token rotation
- token revocation
- password hashing
- security headers

Never expose:

password hashes
refresh tokens
JWT secrets
database credentials
internal errors

---

# 51. AUTHORIZATION MATRIX

Create explicit permissions.

Example:

BUYER:

read services
create orders
send order messages
request revision
complete order
review completed orders

SELLER:

create services
manage own services
manage own orders
deliver work
send order messages
view own earnings

ADMIN:

manage users
moderate services
manage disputes
manage reports
manage platform settings
view audit logs

Every sensitive API endpoint must have authorization checks.

---

# 52. API DESIGN

Use versioned API:

/api/v1/...

Create modules:

auth
users
sellers
categories
services
favorites
cart
orders
messages
notifications
reviews
payments
wallet
coupons
disputes
reports
analytics
admin

---

# 53. API RESPONSE STANDARD

Success:

{
"success": true,
"data": {},
"meta": {}
}

Error:

{
"success": false,
"error": {
"code": "ORDER_INVALID_STATE",
"message": "..."
}
}

Use consistent HTTP status codes.

---

# 54. IDEMPOTENCY

Implement idempotency for:

- payment creation
- order creation where appropriate
- webhook-like operations
- wallet operations

Prevent duplicate operations caused by retries.

---

# 55. DATABASE TRANSACTIONS

Use Prisma transactions for:

Order creation
Payment creation
Wallet operations
Refunds
Coupon usage
Order completion
Earning release

Financial-like operations must be atomic.

---

# 56. MONEY HANDLING

Never use JavaScript floating-point numbers for financial calculations.

Use:

Decimal

or integer minor units.

All calculations must happen server-side.

---

# 57. FILE STORAGE

Create StorageService abstraction.

Methods:

upload
delete
getUrl

Development:

local storage

Production:

S3-compatible object storage.

Validate:

- MIME
- extension
- size
- filename

Generate safe filenames.

---

# 58. IMAGE PROCESSING

For service images:

- validate
- resize
- optimize
- generate thumbnails where practical

Do not serve huge original images unnecessarily.

---

# 59. FRONTEND ARCHITECTURE

Use feature-oriented architecture.

Example:

features/

auth/
services/
orders/
chat/
notifications/
reviews/
wallet/
seller/
admin/

Use:

components/
hooks/
lib/
services/
stores/
types/
schemas/
utils/

Avoid giant components.

---

# 60. SERVER STATE

Use TanStack Query.

Server state:

- services
- orders
- messages
- notifications
- reviews
- analytics
- users

Client state:

Zustand:

- sidebar
- theme
- temporary checkout
- UI state

Do not use Zustand as a replacement for server state.

---

# 61. DESIGN SYSTEM

Create reusable Taskora UI system.

Components:

Button
Input
Textarea
Select
Modal
Dialog
Drawer
Dropdown
Tooltip
Badge
Card
Tabs
Table
Pagination
Avatar
Toast
Skeleton
EmptyState
ErrorState
ConfirmDialog
FileUploader
DataTable
ChartCard
StatCard

---

# 62. BRANDING

Brand:

TASKORA

Style:

- premium
- modern
- clean
- trustworthy
- professional
- startup/SaaS

Avoid copying Fiverr or Upwork.

Create unique Taskora identity.

Logo concept:

stylized "T"

Use consistent spacing, typography and visual hierarchy.

---

# 63. RESPONSIVE DESIGN

Support:

- desktop
- laptop
- tablet
- mobile

Seller Kanban must have a usable mobile representation.

Admin tables must have responsive alternatives.

Chat must work properly on mobile.

---

# 64. DARK MODE

Support:

light
dark
system

Persist preference.

---

# 65. ACCESSIBILITY

Implement:

- semantic HTML
- keyboard navigation
- focus states
- accessible forms
- aria labels
- screen reader support
- sufficient contrast

---

# 66. SEO

Implement:

- metadata
- dynamic service metadata
- canonical URLs
- sitemap
- robots.txt
- Open Graph
- structured data where appropriate

Use SEO-friendly slugs.

---

# 67. INTERNATIONALIZATION

Prepare architecture for:

English
Vietnamese

Do not scatter hardcoded UI strings everywhere.

---

# 68. ANALYTICS EVENT SYSTEM

Create AnalyticsEvent.

Track:

SERVICE_VIEW
SERVICE_FAVORITED
SEARCH
CHECKOUT_STARTED
ORDER_CREATED
PAYMENT_SUCCESS
ORDER_COMPLETED
REVIEW_CREATED
PROFILE_VIEW
MESSAGE_SENT

Do not collect unnecessary sensitive information.

---

# 69. SELLER ANALYTICS

Show:

- impressions
- views
- favorites
- orders
- revenue
- conversion
- rating
- response rate

Date filters:

7 days
30 days
90 days
12 months
custom

---

# 70. BUYER DASHBOARD

Show:

- total orders
- active orders
- completed orders
- total spending
- recent orders
- favorite services
- recent messages

---

# 71. SELLER DASHBOARD

Show:

- revenue
- pending balance
- active orders
- completed orders
- rating
- response rate
- conversion
- recent activity

---

# 72. ADMIN DATA TABLES

All admin tables should support:

- search
- filtering
- sorting
- pagination
- bulk selection where appropriate
- bulk actions where safe
- column visibility where useful

---

# 73. ERROR SYSTEM

Create:

404
403
401
429
500

Frontend must have polished error pages.

Backend must use centralized error middleware.

Never return raw stack traces.

---

# 74. OBSERVABILITY

Implement:

- structured logging
- request IDs
- health endpoint
- readiness endpoint
- database health
- Redis health
- Socket.IO health where practical

Endpoints:

/health
/ready

---

# 75. PERFORMANCE

Optimize:

- database queries
- indexes
- pagination
- caching
- images
- bundle size
- rendering
- API payload size

Use Redis for:

- platform settings
- frequently accessed categories
- selected service cache
- rate limiting where appropriate

Never cache private user data incorrectly.

---

# 76. DATABASE PERFORMANCE

Analyze common queries.

Add indexes for:

users
services
orders
messages
notifications
reviews
payments

Avoid N+1 queries.

Use Prisma select/include carefully.

---

# 77. CACHING STRATEGY

Cache public data:

categories
popular services
platform configuration

Invalidate cache after mutations.

Do not cache sensitive data without a clear strategy.

---

# 78. TESTING STRATEGY

Unit tests:

- auth service
- order state machine
- pricing service
- coupon service
- review rules
- wallet service
- permission checks

Integration tests:

- registration
- login
- service creation
- order creation
- payment
- review
- dispute

E2E:

Complete buyer/seller workflow.

---

# 79. E2E MAIN FLOW

Playwright:

Register buyer
→ login
→ browse
→ search
→ open service
→ select package
→ checkout
→ mock payment
→ order created
→ seller login
→ seller sees order
→ seller confirms
→ Kanban update
→ buyer receives realtime notification
→ buyer/seller chat
→ seller delivers
→ buyer requests revision
→ seller redelivers
→ buyer completes
→ buyer reviews
→ seller sees earnings

This flow must work from beginning to end.

---

# 80. SOCKET TESTING

Test:

- connection
- authentication
- room authorization
- send message
- receive message
- typing
- read receipt
- order status event
- notification event

Ensure unauthorized users cannot join private rooms.

---

# 81. DOCKER

Create Docker setup.

Services:

frontend
backend
postgres
redis
worker

Development:

docker compose up

Production images should use multi-stage builds.

Avoid running containers as root where practical.

---

# 82. CI/CD

GitHub Actions:

Pull Request:

install
→ lint
→ typecheck
→ test
→ build

Main:

lint
→ typecheck
→ test
→ build
→ deploy

Do not deploy if critical checks fail.

---

# 83. DATABASE MIGRATIONS

Never manually alter production database schema.

Use Prisma migrations.

Document:

migration creation
migration deployment
seed process
rollback strategy

---

# 84. BACKUP STRATEGY

Document database backup strategy.

Production documentation should explain:

- automated backups
- retention
- restoration
- disaster recovery

---

# 85. ENVIRONMENT CONFIGURATION

Create:

.env.example

Variables:

DATABASE_URL
REDIS_URL
JWT_ACCESS_SECRET
JWT_REFRESH_SECRET
COOKIE_SECRET
NEXT_PUBLIC_API_URL
NEXT_PUBLIC_SOCKET_URL
STORAGE_ENDPOINT
STORAGE_BUCKET
STORAGE_ACCESS_KEY
STORAGE_SECRET_KEY
SMTP_HOST
SMTP_PORT
SMTP_USER
SMTP_PASSWORD

Never commit secrets.

---

# 86. SEED DATA

Create realistic data.

Users:

Admin
Seller
Buyer

Categories:

Programming
Design
Marketing
Writing
Video
Translation
Business
AI

Services:

realistic titles
realistic descriptions
realistic packages

Create realistic orders, reviews, messages and notifications.

Do not use lorem ipsum.

---

# 87. DEMO ACCOUNTS

Create local-only demo accounts.

Admin
Seller
Buyer

Document them in README.

Never use production credentials.

---

# 88. API DOCUMENTATION

Use OpenAPI/Swagger.

Document:

- authentication
- request bodies
- responses
- errors
- permissions

Swagger should be accessible only in appropriate environments if desired.

---

# 89. SECURITY DOCUMENTATION

Create:

docs/security.md

Explain:

- authentication
- authorization
- token management
- rate limiting
- validation
- file security
- Socket.IO authorization
- secret management

---

# 90. ARCHITECTURE DOCUMENTATION

Create:

docs/architecture.md

Include diagrams for:

Frontend
Backend
Database
Redis
Socket.IO
Worker
Storage

---

# 91. DATABASE DOCUMENTATION

Create:

docs/database.md

Explain:

- entities
- relationships
- indexes
- important constraints
- transactions
- state machines

---

# 92. REALTIME DOCUMENTATION

Create:

docs/realtime.md

Document:

- Socket.IO connection
- authentication
- rooms
- events
- message persistence
- notifications
- authorization

---

# 93. DEPLOYMENT

Prepare:

Frontend:

Vercel

Backend:

Railway / Render / equivalent

Database:

PostgreSQL managed service

Redis:

managed Redis

Storage:

S3-compatible storage

Document complete deployment steps.

---

# 94. PRODUCTION CHECKLIST

Before declaring the project complete:

Security
[ ] Secrets removed
[ ] Rate limiting
[ ] Auth secure
[ ] Authorization tested
[ ] Upload validation
[ ] Input validation
[ ] Error sanitization

Database
[ ] Migrations
[ ] Indexes
[ ] Constraints
[ ] Transactions
[ ] Backup documentation

Frontend
[ ] Responsive
[ ] Accessibility
[ ] Loading states
[ ] Error states
[ ] Empty states
[ ] SEO
[ ] Dark mode

Backend
[ ] Validation
[ ] Logging
[ ] Health checks
[ ] API documentation

Realtime
[ ] Socket auth
[ ] Room authorization
[ ] Persistence
[ ] Reconnect handling

Testing
[ ] Unit
[ ] Integration
[ ] E2E
[ ] Socket tests

DevOps
[ ] Docker
[ ] CI/CD
[ ] Environment config

Documentation
[ ] README
[ ] Architecture
[ ] Database
[ ] API
[ ] Security
[ ] Deployment

---

# 95. DEVELOPMENT METHOD

Do NOT generate the entire application in one operation.

Work phase by phase.

Before each phase:

1. Inspect repository.
2. Inspect existing code.
3. Identify dependencies.
4. Identify risks.
5. Create implementation plan.
6. Implement.
7. Run tests.
8. Run lint.
9. Run typecheck.
10. Fix errors.
11. Verify integration.
12. Update documentation.

Never blindly overwrite working code.

---

# 96. DEVELOPMENT PHASES

PHASE 0
Product specification

PHASE 1
Monorepo foundation

PHASE 2
Docker infrastructure

PHASE 3
PostgreSQL + Prisma

PHASE 4
Redis

PHASE 5
Authentication

PHASE 6
User profiles

PHASE 7
Seller onboarding

PHASE 8
Categories

PHASE 9
Services

PHASE 10
Packages

PHASE 11
Search/filter

PHASE 12
Favorites

PHASE 13
Cart

PHASE 14
Checkout

PHASE 15
Mock payment

PHASE 16
Orders

PHASE 17
Order state machine

PHASE 18
Requirements

PHASE 19
Delivery

PHASE 20
Revision

PHASE 21
Kanban

PHASE 22
Socket.IO

PHASE 23
Chat

PHASE 24
Notifications

PHASE 25
Email

PHASE 26
Background workers

PHASE 27
Reviews

PHASE 28
Seller reputation

PHASE 29
Wallet

PHASE 30
Settlement

PHASE 31
Withdrawal simulation

PHASE 32
Coupons

PHASE 33
Disputes

PHASE 34
Reports

PHASE 35
Admin

PHASE 36
Admin settings

PHASE 37
Audit logs

PHASE 38
Analytics

PHASE 39
Recommendation engine

PHASE 40
Security hardening

PHASE 41
Performance

PHASE 42
Testing

PHASE 43
E2E

PHASE 44
CI/CD

PHASE 45
SEO

PHASE 46
Accessibility

PHASE 47
Documentation

PHASE 48
Production deployment

PHASE 49
Final audit

---

# 97. FINAL SYSTEM ARCHITECTURE

The final architecture should resemble:

```
                ┌─────────────────────┐
                │      TASKORA        │
                │    Marketplace      │
                └──────────┬──────────┘
                           │
                ┌──────────▼──────────┐
                │     Next.js Web     │
                └──────────┬──────────┘
                           │
                 REST API + Socket.IO
                           │
          ┌────────────────▼────────────────┐
          │       Node.js / Express        │
          │                                │
          │ Auth / Services / Orders       │
          │ Chat / Payments / Reviews      │
          │ Wallet / Admin / Analytics     │
          └───────────────┬────────────────┘
                          │
         ┌────────────────┼────────────────┐
         │                │                │
   ┌─────▼─────┐    ┌─────▼─────┐   ┌────▼─────┐
   │ PostgreSQL│    │   Redis    │   │  Worker  │
   │  Prisma   │    │ Cache/Queue│   │ BullMQ   │
   └───────────┘    └────────────┘   └──────────┘
                          │
                   ┌──────▼──────┐
                   │   Storage   │
                   │ S3 / Local  │
                   └─────────────┘
```

---

# 98. FINAL QUALITY BAR

Do not consider Taskora finished simply because the application starts.

Taskora is finished only when:

- architecture is clean
- database is consistent
- APIs are documented
- authentication is secure
- authorization is enforced
- realtime communication works
- orders follow valid state transitions
- payments are idempotent
- wallet calculations are correct
- reviews follow business rules
- admin controls work
- background jobs work
- tests pass
- Docker works
- CI passes
- UI is responsive
- accessibility is reasonable
- documentation is complete
- production configuration is documented

---

# 99. IMPORTANT VIBE CODING RULE

When you encounter an implementation decision, do not choose the easiest solution automatically.

Choose the solution that is:

1. secure
2. maintainable
3. testable
4. scalable
5. understandable
6. appropriate for the project's current scope

Do not over-engineer with unnecessary microservices.

Keep the backend as a modular monolith initially.

Design boundaries so services can be extracted later if necessary.

---

# 100. START

First inspect the existing repository.

Do NOT immediately create hundreds of files.

Report:

1. Current architecture
2. Current dependencies
3. Existing files
4. Existing functionality
5. Missing functionality
6. Architecture risks
7. Recommended implementation order

Then implement PHASE 1 only.

After completing PHASE 1:

- run lint
- run typecheck
- run tests
- verify build
- report changed files
- report commands
- report remaining work

Then wait for the next phase.

# TASKORA

## Connect. Work. Deliver.

---

# 101. QUALITY & TESTING TOOLCHAIN

TASKORA employs an enterprise-grade automated quality assurance toolchain to prevent regressions across code quality, types, user journeys, accessibility, and web vitals performance.

### 1. Code Quality & Formatting

```bash
# Run strict TypeScript typecheck (zero tolerance for type errors or any leaks)
pnpm typecheck

# Run strict ESLint validation (zero warnings, zero errors)
pnpm lint:strict

# Automatically format all staged files using Prettier
pnpm exec prettier --write "apps/web/src/**/*.{ts,tsx}"
```

### 2. End-to-End (E2E) Testing with Playwright

Playwright tests user flows against an active or automatically spawned local server:

```bash
# Run all E2E tests headless on Chromium
pnpm test:e2e --project=chromium

# Run all E2E tests across both desktop and mobile viewports
pnpm test:e2e

# Run tests in interactive UI mode with time-travel debugger
pnpm test:e2e:ui

# Run tests in headed browser mode
pnpm exec playwright test --headed

# Open the HTML test report
pnpm test:e2e:report
```

#### Test Suite Structure:

- `tests/e2e/navigation.spec.ts`: Page loads, desktop mega menu interaction, mobile hamburger drawer, and footer links.
- `tests/e2e/search-and-filter.spec.ts`: Hero search redirect, category/rating filtering, clear filters, and pagination.
- `tests/e2e/gig-detail-and-order.spec.ts`: Service detail view, package tier switching, dynamic add-ons calculation, and escrow checkout modal.
- `tests/e2e/dashboard-flows.spec.ts`: Metric stat cards, order status filter tabs, order detail drawer, chat messaging, and gig creation wizard.
- `tests/e2e/language-switch.spec.ts`: Seamless EN/VI locale switching, keyboard dismiss, and route path persistence.
- `tests/e2e/accessibility.spec.ts`: Automated WCAG 2.1 AA audits via `@axe-core/playwright` ensuring 0 critical or serious violations.
- `tests/e2e/responsive.spec.ts`: Cross-device verification across mobile (375x667), tablet (768x1024), and desktop (1280x800) with zero horizontal overflow.

### 3. Lighthouse CI Performance & Audits

Lighthouse CI validates performance, SEO, accessibility, and best practices:

```bash
# First build the Next.js production bundle
pnpm build

# Run mobile audits (default LHCI profile)
pnpm lhci:mobile

# Run desktop audits
pnpm lhci:desktop
```

#### Enforced Quality Thresholds (`lighthouserc.js`):

- **Accessibility**: $\ge 90\%$ (Fail on error)
- **Best Practices**: $\ge 85\%$ (Fail on error)
- **SEO**: $\ge 90\%$ (Fail on error)
- **Performance**: $\ge 80\%$ (Warning threshold), $\ge 65\%$ (Minimum threshold)

### 4. Git Pre-Commit Hooks & Continuous Integration

- **Husky & lint-staged**: Automatically executes on `git commit`, running `eslint --fix` and `prettier --write` only on staged files before allowing commits.
- **GitHub Actions (`.github/workflows/quality.yml`)**:
  1. `lint-and-typecheck`: Validates strict typing and linting rules on push and pull requests to `main`.
  2. `e2e-tests`: Automatically spins up Next.js server and executes all 26 Playwright test flows on Chromium.
  3. `lighthouse`: Builds production assets and audits Core Web Vitals, generating artifact summaries.
