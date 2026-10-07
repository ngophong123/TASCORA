import { expect, it, vi } from "vitest"
import { OrderStatus } from "@prisma/client"

const mocks = vi.hoisted(() => ({ findUnique: vi.fn(), update: vi.fn(), packageFind: vi.fn() }))
vi.mock("../../apps/api/src/lib/prisma", () => {
  const client = { $queryRaw: vi.fn(), servicePackage: { findUnique: mocks.packageFind }, order: { findUnique: mocks.findUnique, update: mocks.update } };
  return { prisma: { ...client, $transaction: async (fn: (tx: typeof client) => Promise<unknown>) => fn(client) } };
})
import { OrderService } from "../../apps/api/src/modules/order/order.service"
import { createPackageSchema } from "../../apps/api/src/modules/service/service.schema"

it("rejects a seller purchasing their own published service", async () => {
  mocks.packageFind.mockResolvedValue({ serviceId: "service", service: { status: "PUBLISHED", seller: { status: "APPROVED", userId: "seller" } } });
  await expect(OrderService.createOrder("seller", "service", "package")).rejects.toThrow("own services");
})

it.each([0.001, 10.255, 100000000, Infinity, 0, -1])("rejects invalid package price %s", price => {
  expect(createPackageSchema.shape.body.safeParse({ type: "BASIC", title: "Basic package", description: "Test", price, deliveryDays: 1, revisions: 0, features: [] }).success).toBe(false);
})

it.each([0.01, 0.29, 10.25, 99999999.99])("accepts exact package price %s", price => {
  expect(createPackageSchema.shape.body.safeParse({ type: "BASIC", title: "Basic package", description: "Test", price, deliveryDays: 1, revisions: 0, features: [] }).success).toBe(true);
})

it("does not let an order participant mark an unpaid order as paid", async () => {
  mocks.findUnique.mockResolvedValue({ buyerId: "buyer", seller: { userId: "seller" }, status: "PENDING" })
  await expect(OrderService.updateOrderStatus("buyer", "order", OrderStatus.PAID)).rejects.toThrow("verified payment webhook")
  expect(mocks.update).not.toHaveBeenCalled()
})

it("rejects buyer delivery and seller acceptance", async () => {
  mocks.update.mockClear();
  mocks.findUnique.mockResolvedValue({ buyerId: "buyer", seller: { userId: "seller" }, status: "IN_PROGRESS" });
  await expect(OrderService.updateOrderStatus("buyer", "order", OrderStatus.DELIVERED)).rejects.toThrow("Only the seller");
  mocks.findUnique.mockResolvedValue({ buyerId: "buyer", seller: { userId: "seller" }, status: "DELIVERED" });
  await expect(OrderService.updateOrderStatus("seller", "order", OrderStatus.COMPLETED)).rejects.toThrow("Only the buyer");
  expect(mocks.update).not.toHaveBeenCalled();
})

it("does not create orders for services from unapproved sellers", async () => {
  mocks.packageFind.mockResolvedValue({ serviceId: "service", service: { status: "PUBLISHED", seller: { status: "DRAFT" } } });
  await expect(OrderService.createOrder("buyer", "service", "package")).rejects.toThrow("not published");
})
