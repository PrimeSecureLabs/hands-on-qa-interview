import { Router } from 'express';
import {
  createUser,
  loginUser,
  getUsers,
  getUserById,
  updateUser,
  deleteUser,
  logoutUser,
  getPendingUsers,
  approveUser
} from '../controllers/userController';
import { authMiddleware, requireAdmin } from '../middlewares/authMiddleware';

const router = Router();

const asyncHandler = (fn: any) => (req: any, res: any, next: any) =>
  Promise.resolve(fn(req, res, next)).catch(next);

router.post('/', asyncHandler(createUser));
router.post('/login', asyncHandler(loginUser));
router.get('/', authMiddleware, asyncHandler(getUsers));
router.get('/pending', authMiddleware, requireAdmin, asyncHandler(getPendingUsers));
router.post('/:id/approve', authMiddleware, requireAdmin, asyncHandler(approveUser));
router.get('/:id', authMiddleware, asyncHandler(getUserById));
router.put('/:id', authMiddleware, asyncHandler(updateUser));
router.delete('/:id', authMiddleware, asyncHandler(deleteUser));
router.post('/logout', authMiddleware, asyncHandler(logoutUser));

export default router;
