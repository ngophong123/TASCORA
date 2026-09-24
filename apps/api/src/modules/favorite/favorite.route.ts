import { Router } from 'express';
import { requireAuth } from '../../middlewares/requireAuth';
import { addFavorite, removeFavorite, getMyFavorites } from './favorite.controller';

const router = Router();

// Tất cả route trong Favorites đều yêu cầu đăng nhập
router.use(requireAuth);

router.get('/', getMyFavorites);
router.post('/:serviceId', addFavorite);
router.delete('/:serviceId', removeFavorite);

export default router;
