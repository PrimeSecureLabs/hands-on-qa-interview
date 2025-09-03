import { Router, Request, Response, NextFunction } from 'express';
import * as teamController from '../controllers/teamController';
import { authMiddleware } from '../middlewares/authMiddleware';

const router = Router();

const asyncHandler = (fn: (req: Request, res: Response, next: NextFunction) => Promise<any>) =>
  (req: Request, res: Response, next: NextFunction) =>
    Promise.resolve(fn(req, res, next)).catch(next);

router.post('/', authMiddleware, asyncHandler(teamController.createTeam));
router.get('/roles', authMiddleware, asyncHandler(teamController.getAllowedRoles));
router.post('/invite', authMiddleware, asyncHandler(teamController.inviteMember));
router.delete('/member', authMiddleware, asyncHandler(teamController.removeTeamMember));
router.get('/:team_id/members', authMiddleware, asyncHandler(teamController.listTeamMembers));
router.post('/accept-invitation', asyncHandler(teamController.acceptInvitation)); // Não precisa de auth

export default router;
