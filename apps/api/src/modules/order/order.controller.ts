import { Response, NextFunction } from 'express';
import { AuthRequest } from '../../middlewares/requireAuth';
import { OrderService } from './order.service';

export const createOrder = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const buyerId = req.user!.userId;
    const { serviceId, packageId } = req.body;
    const order = await OrderService.createOrder(buyerId, serviceId, packageId);
    res.status(201).json({ success: true, data: order });
  } catch (error) {
    next(error);
  }
};

export const getMyPurchases = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const buyerId = req.user!.userId;
    const orders = await OrderService.getMyPurchases(buyerId);
    res.status(200).json({ success: true, data: orders });
  } catch (error) {
    next(error);
  }
};

export const getMySales = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.userId;
    const orders = await OrderService.getMySales(userId);
    res.status(200).json({ success: true, data: orders });
  } catch (error) {
    next(error);
  }
};

export const updateOrderStatus = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.userId;
    const orderId = req.params.id;
    const { status, message } = req.body;
    const order = await OrderService.updateOrderStatus(userId, orderId, status, message);
    res.status(200).json({ success: true, data: order });
  } catch (error) {
    next(error);
  }
};
