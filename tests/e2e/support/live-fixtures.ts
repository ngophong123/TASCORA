// Explicit test-only API fixture. Production frontend never imports fixture data.
import { test as base, expect } from '@playwright/test';
import { MOCK_GIGS } from '../../../apps/web/src/data/gigs';
import { FILTER_CATEGORIES } from '../../../apps/web/src/data/serviceFilterOptions';
import type { Service, Order, Profile } from '../../../apps/web/src/lib/marketplace';
import { Prisma } from '@prisma/client';
const cuid = (n: number) => `c${String(n).padStart(24, '0')}`;
function createStore() {
  const categories = FILTER_CATEGORIES.map((c,n) => ({ id: cuid(100+n), name: c.name, slug: c.slug, parentId: null, _count: { services: 0 } }));
  const buyerProfile: Profile = { id: cuid(200), firstName: 'Test', lastName: 'Customer', avatar: '/favicon.svg', bio: 'Test customer profile' };
  const sellerProfile: Profile = { id: cuid(201), firstName: 'Alexandre', lastName: 'Moreau', avatar: '/favicon.svg', bio: 'A professional seller profile', professionalTitle: 'Software engineer', status: 'APPROVED', level: 'TOP_RATED', ratingAverage: 4.99, ratingCount: 42, languages: ['English'], skills: ['TypeScript'], createdAt: '2026-01-10' };
  const services: Service[] = MOCK_GIGS.map((g,n) => ({ id: cuid(n+1), title: g.title, description: g.description, status: 'PUBLISHED', category: categories.find(c => c.slug === g.categorySlug) || categories[0]!, seller: g.seller.id === MOCK_GIGS[0]!.seller.id ? sellerProfile : { ...sellerProfile, id: cuid(500+n), firstName: g.seller.name.split(' ')[0], lastName: g.seller.name.split(' ').slice(1).join(' '), country: g.seller.country, languages: g.seller.languages, level: g.seller.level === 'NEW' ? 'NEW_SELLER' : g.seller.level }, ratingAverage: g.rating, ratingCount: g.reviewsCount, createdAt: g.createdAt, images: g.gallery.map(i => ({ url: i.url })), packages: g.packages.map((p,k) => ({ ...p, id: cuid(10000+n*3+k), title: p.name, revisions: typeof p.revisions === 'number' ? p.revisions : 99 })), faqs: g.faqs.map(f => ({ question: f.q, answer: f.a })), reviews: [], tags: g.tags.map(name => ({ tag: { name } })), _count: { orders: 0 } }));
  for (const category of categories) category._count.services = services.filter(s => s.category.id === category.id).length;
  const orders: Order[] = ['IN_PROGRESS','COMPLETED','DELIVERED'].map((status,n) => ({ id: cuid(20000+n), buyerId: 'buyer', status, amount: String(services[n]!.packages[0]!.price), createdAt: '2026-10-01', deliveryDate: '2026-10-09', service: services[n]!, package: services[n]!.packages[0]!, seller: services[n]!.seller, buyer: { id: 'buyer', email: 'buyer@example.test', buyerProfile }, review: null, activities: [], deliveries: [] }));
  const users = [
    { id: 'buyer', email: 'buyer@example.test', role: 'BUYER', buyerProfile, sellerProfile: null as Profile | null },
    { id: 'seller', email: 'seller@example.test', role: 'SELLER', buyerProfile, sellerProfile },
    { id: 'admin', email: 'admin@example.test', role: 'ADMIN', buyerProfile, sellerProfile: null as Profile | null },
  ];
  const messages = [{ id: cuid(30001), senderId: 'seller', content: 'Hello from the seller', createdAt: '2026-10-01T10:00:00Z', isRead: false, attachmentUrl: null as string | null }];
  const conversation = { id: cuid(30000), participant1Id: 'buyer', participant2Id: 'seller', participant1: { id: 'buyer', buyerProfile, sellerProfile: null }, participant2: { id: 'seller', buyerProfile: null, sellerProfile }, order: orders[0], unreadCount1: 1, unreadCount2: 0, messages };
  return { categories, services, orders, users, messages, conversation, funded: new Set<string>(), checkouts: new Map<string, Order>(), payouts: [] as { id: string; amount: string; status: string; failureReason: null; escrow: { orderId: string } }[], refundRequests: [] as { id: string; orderId: string; amount: string; status: string; reason: string }[], favorites: new Set<string>(), uploads: new Map<string, Buffer>(), notifications: [] as { id: string; title: string; message: string; isRead: boolean; createdAt: string; type: string }[] };
}
export const test = base.extend<{ marketplace: ReturnType<typeof createStore> }>({
  marketplace: async ({}, use) => { await use(createStore()); },
  page: async ({ page, marketplace: state }, use) => {
    await page.addInitScript(() => { if (!localStorage.getItem('user')) { localStorage.setItem('user', JSON.stringify({ id: 'buyer', email: 'buyer@example.test', role: 'BUYER' })); localStorage.setItem('token', 'e2e-buyer') } });
    await page.addInitScript(() => {
      let clientSecret = '';
      const stripe = { _registerWrapper: () => {}, elements: (options: { clientSecret: string }) => { clientSecret = options.clientSecret; return { create: () => ({ mount: (node: HTMLElement) => { node.textContent = 'Test provider payment form'; }, destroy: () => {} }) }; }, confirmPayment: async () => { await fetch('https://api.tascora.test/api/v1/test-provider/confirm', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ clientSecret }) }); return { paymentIntent: { status: 'succeeded' } }; } };
      Object.assign(window, { Stripe: () => stripe });
    });
    await page.route('https://js.stripe.com/**', route => route.fulfill({ body: '', contentType: 'application/javascript' }));
    await page.route('**/socket.io/**', route => route.abort())
    await page.route('**/api/v1/**', async route => {
      const req = route.request(), url = new URL(req.url()), path = url.pathname.replace('/api/v1', ''), method = req.method();
      const headers = { 'Access-Control-Allow-Origin': req.headers().origin || 'http://localhost:3000', 'Access-Control-Allow-Credentials': 'true', 'Access-Control-Allow-Headers': 'Authorization,Content-Type,X-CSRF-Protection', 'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS' };
      const send = (data: unknown, status = 200) => route.fulfill({ status, headers, json: { success: status < 400, data, ...(status >= 400 ? { error: 'Fixture request rejected' } : {}) } });
      if (method === 'OPTIONS') { await route.fulfill({ status: 204, headers }); return; }
      const actor = req.headers().authorization?.replace('Bearer e2e-', '') || 'buyer';
      const me = state.users.find(user => user.id === actor) || state.users[0]!;
      const body = ['POST','PUT'].includes(method) && req.headers()['content-type']?.includes('application/json') ? req.postDataJSON() || {} : {};
      const lookup = (id: string) => state.services.find(s => s.id === id) || (id === 'srv-1' || id === 'gig-1' ? state.services[0] : undefined);
      if (path === '/profile/me') { await send(me); return; }
      if (path === '/profile/buyer' || path === '/profile/seller' || path.startsWith('/onboarding/seller/step/')) {
        const seller = path !== '/profile/buyer'; const profile = seller ? me.sellerProfile : me.buyerProfile;
        if (body.hourlyRate !== undefined) body.hourlyRate = String(body.hourlyRate); if (profile) Object.assign(profile, body); await send(profile); return;
      }
      if (path === '/onboarding/seller/submit') { if (me.sellerProfile) me.sellerProfile.status = 'PENDING_REVIEW'; await send(me.sellerProfile); return; }
      if (path === '/marketplace/categories') { await send(state.categories); return; }
      if (path === '/uploads' && method === 'POST') { const file = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa.png'; state.uploads.set(`${me.id}/${file}`, req.postDataBuffer()!); await send({ id: file, reference: `upload:${me.id}/${file}` },201); return; }
      if (path.startsWith('/uploads/shared/') || path.startsWith('/uploads/public/')) { const key = path.split('/').slice(3).join('/'), file = state.uploads.get(key); if (file) { await route.fulfill({ status: 200, headers: { ...headers, 'Content-Type': 'image/png' }, body: file }); return; } await send(null,404); return; }
      if (path === '/marketplace/sellers') { await send([state.users[1]!.sellerProfile]); return; }
      if (path.startsWith('/marketplace/sellers/')) { await send({ ...state.users[1]!.sellerProfile, services: state.services.slice(0,3), reviews: [], _count: { orders: 1 } }); return; }
      if (path === '/services' && method === 'GET') { const limit = Number(url.searchParams.get('limit') || 10), page = Number(url.searchParams.get('page') || 1); const published = state.services.filter(s => s.status === 'PUBLISHED'); await send({ services: published.slice((page-1)*limit,page*limit), total: published.length, totalPages: Math.ceil(published.length/limit), page, limit }); return; }
      if (path === '/services/seller/me') { if (!me.sellerProfile) { await send(null,403); return; } await send(state.services.filter(s => s.seller.id === me.sellerProfile!.id)); return; }
      if (path === '/services' && method === 'POST') {
        if (!me.sellerProfile) { await send(null,403); return; }
        if (body.title?.length < 5 || body.description?.length < 20 || !body.categoryId) { await send(null,400); return; }
        const service: Service = { id: cuid(40000+state.services.length), ...body, status: 'DRAFT', seller: state.users[1]!.sellerProfile!, category: state.categories.find(c => c.id === body.categoryId)!, images: [], packages: [], ratingAverage: 0, ratingCount: 0, createdAt: new Date().toISOString() };
        state.services.push(service); await send(service,201); return;
      }
      if (path.startsWith('/marketplace/services/') && path.endsWith('/content')) { const service = lookup(path.split('/')[3]!); if (!service) { await send(null,404); return; } Object.assign(service, body, { status: 'DRAFT', category: state.categories.find(c => c.id === body.categoryId), images: body.images.map((url: string) => ({ url })), packages: body.packages.map((p: object,n: number) => ({ ...p, id: cuid(50000+n) })) }); await send(service); return; }
      if (path.startsWith('/services/')) { const service = lookup(path.split('/')[2]!); await send(service, service && service.status === 'PUBLISHED' ? 200 : 404); return; }
      if (path === '/orders' && method === 'POST') { const service = lookup(body.serviceId), pkg = service?.packages.find(p => p.id === body.packageId); if (!service || !pkg || !body.idempotencyKey) { await send(null,400); return; } const key = `${me.id}:${body.idempotencyKey}`; const previous = state.checkouts.get(key); if (previous) { await send(previous); return; } const order: Order = { id: cuid(60000+state.orders.length), buyerId: me.id, status: 'PENDING', amount: String(pkg.price), currency: 'usd', platformFeeBps: 1000, purchaseSnapshot: { serviceTitle: service.title, packageTitle: pkg.title, packageType: pkg.type, sellerName: 'Test seller', revisions: pkg.revisions }, createdAt: new Date().toISOString(), deliveryDate: null, service, package: pkg, seller: service.seller, buyer: { ...me, buyerProfile: me.buyerProfile }, review: null, deliveries: [], activities: [], revisions: [], refunds: [] }; state.orders.unshift(order); state.checkouts.set(key, order); await send(order,201); return; }
      if (path === '/payments/create-intent') { const order = state.orders.find(o => o.id === body.orderId && o.buyerId === me.id); await send({ clientSecret: `mock_secret_${order?.id}` }, order ? 200 : 404); return; }
      if (path === '/test-provider/confirm') { const order = state.orders.find(o => `mock_secret_${o.id}` === body.clientSecret); if (order) { order.status = 'PAID'; state.funded.add(order.id); } await send({}); return; }
      if (path.includes('/operations/')) { const order = state.orders.find(o => o.id === path.split('/')[2]); const operation = path.split('/')[4]; if (!order) { await send(null,404); return; } if (operation === 'revision') { (order.revisions ||= []).push({ id: cuid(95000), message: body.message }); order.status = 'IN_REVISION'; } else order.status = operation === 'start' ? 'IN_PROGRESS' : operation === 'accept' ? 'COMPLETED' : 'CANCELLED'; await send(order); return; }
      if (path.startsWith('/orders/') && path.endsWith('/delivery')) { const order = state.orders.find(o => o.id === path.split('/')[2]); if (!order || !body.idempotencyKey) { await send(null,400); return; } (order.deliveries ||= []).push({ id: cuid(96000+order.deliveries!.length), message: body.message, files: body.files }); order.status = 'DELIVERED'; await send(order); return; }
      if (path === '/financial/earnings') {
        if (!me.sellerProfile) { await send(null,403); return; }
        let pending = new Prisma.Decimal(0), available = new Prisma.Decimal(0), requested = new Prisma.Decimal(0);
        const earned = state.orders.filter(o => state.funded.has(o.id) && o.seller?.id === me.sellerProfile?.id && o.status !== 'REFUNDED');
        for (const order of earned) { const gross = new Prisma.Decimal(order.amount), net = gross.sub(gross.mul('0.1').toDecimalPlaces(2)); if (state.payouts.some(p => p.escrow.orderId === order.id)) requested = requested.add(net); else if (order.status === 'COMPLETED') available = available.add(net); else pending = pending.add(net); }
        await send({ currency: 'usd', pending: pending.toFixed(2), available: available.toFixed(2), requested: requested.toFixed(2), paid: '0.00', payouts: state.payouts, availableOrders: earned.filter(o => o.status === 'COMPLETED' && !state.payouts.some(p => p.escrow.orderId === o.id)).map(o => ({ id: o.id })), providerAvailable: false }); return;
      }
      if (path.startsWith('/financial/orders/') && path.endsWith('/payouts')) { const order = state.orders.find(o => o.id === path.split('/')[3]); if (!order || order.status !== 'COMPLETED') { await send(null,409); return; } const gross = new Prisma.Decimal(order.amount); const payout = { id: cuid(97000), amount: gross.sub(gross.mul('0.1').toDecimalPlaces(2)).toFixed(2), status: 'PENDING', failureReason: null, escrow: { orderId: order.id } }; state.payouts.push(payout); await send(payout,201); return; }
      if (path.startsWith('/financial/orders/') && path.endsWith('/disputes')) { const order = state.orders.find(o => o.id === path.split('/')[3]); if (!order) { await send(null,404); return; } order.dispute = { id: cuid(98000), status: 'OPEN', description: body.description }; order.status = 'DISPUTED'; await send(order.dispute,201); return; }
      if (path.startsWith('/financial/orders/') && path.endsWith('/refunds')) { const order = state.orders.find(o => o.id === path.split('/')[3]); if (!order) { await send(null,404); return; } const refund = { id: cuid(99000+state.refundRequests.length), orderId: order.id, amount: body.amount, status: 'PENDING', reason: body.reason }; state.refundRequests.push(refund); (order.refunds ||= []).push(refund); await send(refund,201); return; }
      if (path === '/financial/admin/queue') { await send({ disputes: state.orders.filter(o => o.dispute?.status === 'OPEN').map(o => ({ ...o.dispute, orderId: o.id })), refunds: state.refundRequests.filter(r => r.status === 'PENDING'), payouts: state.payouts }); return; }
      if (path.startsWith('/financial/admin/orders/') && path.endsWith('/resolve')) { const order = state.orders.find(o => o.id === path.split('/')[4]); if (!order?.dispute) { await send(null,404); return; } order.dispute.status = body.outcome === 'SELLER' ? 'RESOLVED_SELLER' : 'UNDER_REVIEW'; if (body.outcome === 'SELLER') order.status = 'COMPLETED'; else { const refund = { id: cuid(99000+state.refundRequests.length), orderId: order.id, amount: order.amount, status: 'PENDING', reason: body.reason }; state.refundRequests.push(refund); (order.refunds ||= []).push(refund); } await send(order.dispute); return; }
      if (path.startsWith('/financial/admin/refunds/') && path.endsWith('/process')) { const refund = state.refundRequests.find(r => r.id === path.split('/')[4]); if (!refund) { await send(null,404); return; } refund.status = 'SUCCEEDED'; const order = state.orders.find(o => o.id === refund.orderId)!; order.status = 'REFUNDED'; if (order.dispute) order.dispute.status = 'RESOLVED_BUYER'; await send(refund); return; }
      if (path === '/orders/my-purchases') { await send(state.orders.filter(o => o.buyerId === me.id)); return; }
      if (path === '/orders/my-sales') { await send(state.orders.filter(o => o.seller?.id === me.sellerProfile?.id)); return; }
      if (path === '/reviews' && method === 'POST') { const order = state.orders.find(o => o.id === body.orderId); if (!order || order.status !== 'COMPLETED' || order.review) { await send(null,409); return; } const review = { id: cuid(80000), rating: (body.communication+body.serviceQuality+body.recommend)/3, comment: body.comment, createdAt: new Date().toISOString(), buyer: { buyerProfile: me.buyerProfile } }; order.review = review; order.service.reviews = [...order.service.reviews || [], review]; await send(review,201); return; }
      if (path.startsWith('/orders/') && path.endsWith('/status')) { const order = state.orders.find(o => o.id === path.split('/')[2]); if (order) order.status = body.status; await send(order); return; }
      if (path === '/favorites') { await send(state.services.filter(s => state.favorites.has(s.id))); return; }
      if (path.startsWith('/favorites/')) { const id = path.split('/')[2]!; if (method === 'DELETE') state.favorites.delete(id); else state.favorites.add(id); await send({}); return; }
      if (path === '/notifications') { await send(state.notifications); return; }
      if (path.startsWith('/notifications/')) { for (const n of state.notifications) if (path.includes(n.id) || path.includes('read-all')) n.isRead = true; await send({}); return; }
      if (path === '/messages/conversations') { await send([{ ...state.conversation, messages: state.messages.slice(-1) }]); return; }
      if (path.startsWith('/messages/') && method === 'GET') { await send(state.messages.slice(Number(url.searchParams.get('skip') || 0),Number(url.searchParams.get('skip') || 0)+Number(url.searchParams.get('take') || 50))); return; }
      if (path === '/messages' && method === 'POST') { const message = { id: cuid(70000+state.messages.length), senderId: me.id, content: body.content, createdAt: new Date().toISOString(), isRead: false, attachmentUrl: body.attachmentUrl || null }; state.messages.push(message); await send(message,201); return; }
      if (path === '/marketplace/conversations') { await send(state.conversation,201); return; }
      if (path.includes('/conversations/') && path.endsWith('/read')) { const ids = body.messageIds as string[]; for (const message of state.messages) if (message.senderId !== me.id && ids.includes(message.id)) message.isRead = true; state.conversation.unreadCount1 = state.messages.filter(message => message.senderId !== me.id && !message.isRead).length; await send({}); return; }
      if (path === '/admin/review-queue') { await send({ sellers: state.users.filter(u => u.sellerProfile?.status === 'PENDING_REVIEW').map(u => u.sellerProfile), services: state.services.filter(s => s.status === 'DRAFT') }); return; }
      if (path.startsWith('/admin/services/') && path.endsWith('/approve')) { const service = lookup(path.split('/')[3]!); if (service) service.status = 'PUBLISHED'; await send(service); return; }
      if (path.startsWith('/admin/sellers/') && path.endsWith('/review')) { state.users[1]!.sellerProfile!.status = body.status; await send({}); return; }
      if (path === '/auth/login') { const user = state.users.find(u => u.email === body.email); if (!user) { await send(null,401); return; } await send({ user, accessToken: `e2e-${user.id}` }); return; }
      if (path === '/auth/logout') { await send({}); return; }
      if (path === '/auth/register' || path === '/auth/verify-email' || path === '/auth/resend-verification') { await send({ status: 'PENDING_VERIFICATION' },201); return; }
      await send(null,404);
    });
    await use(page);
  },
});
export { expect };
