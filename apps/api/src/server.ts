import { allowedOrigins, isProduction, trustProxy } from './lib/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import pino from 'pino';
import { redis } from './lib/redis';
import { prisma } from './lib/prisma';
import authRoutes from './modules/auth/auth.route';
import profileRoutes from './modules/profile/profile.route';
import onboardingRoutes from './modules/onboarding/onboarding.route';
import sessionRoutes from './modules/session/session.route';
import serviceRoutes from './modules/service/service.route';
import orderRoutes from './modules/order/order.route';
import paymentRoutes from './modules/payment/payment.route';
import reviewRoutes from './modules/review/review.route';
import messageRoutes from './modules/message/message.route';
import favoriteRoutes from './modules/favorite/favorite.route';
import analyticsRoutes from './modules/analytics/analytics.route';
import notificationRoutes from './modules/notification/notification.route';
import couponRoutes from './modules/coupon/coupon.route';
import emailRoutes from './modules/email/email.route';
import walletRoutes from './modules/wallet/wallet.route';
import adminRoutes from './modules/admin/admin.route';
import marketplaceRoutes from './modules/marketplace/marketplace.route';
import financialRoutes from './modules/financial/financial.route';
import { handleWebhook } from './modules/payment/payment.controller';
import http from 'http';
import { uploadRouter } from './modules/upload/upload.route';
import { initSocket } from './lib/socket';
import { healthRouter } from './lib/health';


const logger = pino();
const app = express();
const server = http.createServer(app);

// Initializing Socket.io
initSocket(server);

// Scheduled jobs start only in the process entrypoint, never during test imports.

// Security Middlewares
app.use(helmet());

// --- RAW BODY PARSER FOR STRIPE WEBHOOK ---
// Must be mounted before express.json()
app.post('/api/v1/payments/webhook', express.raw({ type: 'application/json', limit: '256kb' }), handleWebhook);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.set('trust proxy', trustProxy);

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  })
);
app.use(express.json());

// Rate Limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: 100, // Limit each IP to 100 requests per window
  standardHeaders: 'draft-7',
  legacyHeaders: false,
});
app.use(limiter);

// Dependency readiness remains genuine; intentional staging payment disablement
// does not stop non-payment flows. Provider configuration is not provider health.
app.use(healthRouter({ database: () => prisma.$queryRaw`SELECT 1`, redis: () => redis.ping() }));

// Routes
app.use('/api/v1/uploads', uploadRouter());
app.use('/api/v1/auth', rateLimit({ windowMs: 15 * 60 * 1000, limit: 30, standardHeaders: 'draft-7', legacyHeaders: false }), authRoutes);
app.use('/api/v1/profile', profileRoutes);
app.use('/api/v1/onboarding', onboardingRoutes);
app.use('/api/v1/sessions', sessionRoutes);
app.use('/api/v1/services', serviceRoutes);
app.use('/api/v1/orders', orderRoutes);
app.use('/api/v1/payments', paymentRoutes);
app.use('/api/v1/reviews', reviewRoutes);
app.use('/api/v1/messages', messageRoutes);
app.use('/api/v1/favorites', favoriteRoutes);
app.use('/api/v1/analytics', analyticsRoutes);
app.use('/api/v1/notifications', notificationRoutes);
app.use('/api/v1/coupons', couponRoutes);
app.use('/api/v1/emails', emailRoutes);
app.use('/api/v1/wallets', walletRoutes);
app.use('/api/v1/admin', adminRoutes);
app.use('/api/v1/marketplace', marketplaceRoutes);
app.use('/api/v1/financial', financialRoutes);

// Centralized error handler
app.use((err: Error & { status?: number; code?: string }, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  logger.error({ type: err.name, status: err.status || 500 }, 'Request failed');
  res.status(err.status || 500).json({
    success: false,
    error: {
      code: err.code || 'INTERNAL_SERVER_ERROR',
      message: isProduction && (err.status || 500) >= 500 ? 'Something went wrong' : err.message || 'Something went wrong',
    },
  });
});

export { app, logger, server };
