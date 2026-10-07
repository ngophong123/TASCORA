import type { DashboardOrder } from "@/data/dashboard/orders"
import type { Order } from "./marketplace"
import { imageUrl, profileName } from "./marketplace"
export function dashboardOrder(order: Order, seller: boolean): DashboardOrder {
  const delivered = order.status === "DELIVERED",
    complete = order.status === "COMPLETED"
  return {
    id: order.id,
    serverStatus: order.status,
    title: order.purchaseSnapshot?.serviceTitle || order.service.title,
    category: order.service.category?.name || "",
    tier: order.purchaseSnapshot?.packageType || order.package.type,
    gigId: order.service.id,
    totalAmount: Number(order.amount),
    status: complete
      ? "completed"
      : delivered
        ? "delivered"
        : order.status === "CANCELLED"
          ? "cancelled"
          : "active",
    createdAt: new Date(order.createdAt).toLocaleDateString(),
    deliveryDate: order.deliveryDate
      ? new Date(order.deliveryDate).toLocaleDateString()
      : "Not scheduled",
    role: seller ? "FREELANCER" : "CLIENT",
    client: {
      id: order.buyerId,
      name: profileName(order.buyer?.buyerProfile),
      email: order.buyer?.email || "",
      avatar: imageUrl(order.buyer?.buyerProfile?.avatar),
      company: "",
    },
    freelancer: {
      id: order.seller?.id || "",
      name: profileName(order.seller),
      title: order.seller?.professionalTitle || "",
      avatar: imageUrl(order.seller?.avatar),
      rating: order.seller?.ratingAverage || 0,
      level: (order.seller?.level as "LEVEL_1") || "LEVEL_1",
    },
    requirements: "",
    milestones: [
      {
        id: order.id,
        title: order.purchaseSnapshot?.packageTitle || order.package.title,
        amount: Number(order.amount),
        status: complete
          ? "completed"
          : delivered
            ? "in_review"
            : ["PENDING", "PAID"].includes(order.status)
              ? "pending"
              : "in_progress",
        dueDate: order.deliveryDate || "Not scheduled",
      },
    ],
    deliveries: (order.deliveries || []).map((d) => ({
      id: d.id,
      milestoneId: order.id,
      note: d.message,
      submittedAt: "",
      files: d.files.map((url) => ({
        url,
        name: url.split("/").pop() || "Attachment",
        size: "Size not recorded",
        type: url.endsWith(".pdf") ? "pdf" : "image",
      })),
    })),
    revisions: [],
  }
}
