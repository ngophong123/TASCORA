import { Response, NextFunction } from 'express';
import { AuthRequest } from '../../middlewares/requireAuth';
import { ServiceService } from './service.service';
import { RecommendationService } from './recommendation.service';

export const createService = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.userId;
    const service = await ServiceService.createService(userId, req.body);
    res.status(201).json({ success: true, data: service });
  } catch (error) {
    next(error);
  }
};

export const getMyServices = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.userId;
    const services = await ServiceService.getMyServices(userId);
    res.status(200).json({ success: true, data: services });
  } catch (error) {
    next(error);
  }
};

export const updateService = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.userId;
    const serviceId = req.params.id!;
    const service = await ServiceService.updateService(userId, serviceId, req.body);
    res.status(200).json({ success: true, data: service });
  } catch (error) {
    next(error);
  }
};

export const addPackage = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.userId;
    const serviceId = req.params.id!;
    const pkg = await ServiceService.addPackage(userId, serviceId, req.body);
    res.status(200).json({ success: true, data: pkg });
  } catch (error) {
    next(error);
  }
};

export const searchServices = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const result = await ServiceService.searchServices(req.query);
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

export const getServiceById = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const service = await ServiceService.getServiceById(req.params.id!);
    res.status(200).json({ success: true, data: service });
  } catch (error) {
    next(error);
  }
};

export const getRecommendations = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const categoryId = req.query.categoryId as string | undefined;
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;
    
    const recommendations = await RecommendationService.getRecommendations({ categoryId, limit });
    res.status(200).json({ success: true, data: recommendations });
  } catch (error) {
    next(error);
  }
};
