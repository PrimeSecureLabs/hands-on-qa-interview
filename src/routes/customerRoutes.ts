import { Router } from 'express';
import { customerAuthMiddleware } from '../middlewares/customerAuthMiddleware';
import {
  createCustomer,
  loginCustomer,
  updateCustomer,
  deleteCustomer,
  getAllCustomers,
  getCustomerById,
  validateAffiliateLink,
  getCorretorInfoForCustomer
} from '../controllers/customerController';

const asyncHandler = (fn: any) => (req: any, res: any, next: any) =>
  Promise.resolve(fn(req, res, next)).catch(next);

const router = Router();

router.post('/', asyncHandler(createCustomer));
router.post('/login', asyncHandler(loginCustomer));
router.get('/validate-affiliate/:link', asyncHandler(validateAffiliateLink));
router.put('/:id', customerAuthMiddleware, asyncHandler(updateCustomer));
router.delete('/:id', customerAuthMiddleware, asyncHandler(deleteCustomer));
router.get('/', customerAuthMiddleware, asyncHandler(getAllCustomers));
router.get('/:id', customerAuthMiddleware, asyncHandler(getCustomerById));
router.get('/:id/corretor', customerAuthMiddleware, asyncHandler(getCorretorInfoForCustomer));

export default router;
