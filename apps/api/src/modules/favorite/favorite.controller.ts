import { Response, NextFunction } from 'express';
import { AuthRequest } from '../../middlewares/requireAuth';
import { FavoriteService } from './favorite.service';

export const addFavorite = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.userId;
    const serviceId = req.params.serviceId!;
    const favorite = await FavoriteService.addFavorite(userId, serviceId);
    res.status(201).json({ success: true, data: favorite });
  } catch (error) {
    next(error);
  }
};

export const removeFavorite = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.userId;
    const serviceId = req.params.serviceId!;
    await FavoriteService.removeFavorite(userId, serviceId);
    res.status(200).json({ success: true, message: 'Removed from favorites' });
  } catch (error) {
    next(error);
  }
};

export const getMyFavorites = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.userId;
    const favorites = await FavoriteService.getMyFavorites(userId);
    res.status(200).json({ success: true, data: favorites });
  } catch (error) {
    next(error);
  }
};
