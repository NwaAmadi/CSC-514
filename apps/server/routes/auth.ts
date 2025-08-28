
import { Router } from 'express';
import { registerAdmin, loginAdmin, registerCashier, loginCashier } from '../controllers/authController';

const router = Router();

router.post('/register/admin', registerAdmin);
router.post('/login/admin', loginAdmin);
router.post('/register/cashier', registerCashier);
router.post('/login/cashier', loginCashier);

export default router;
