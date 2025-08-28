
import { Router } from 'express';
import { getAllCashiers, deleteCashier } from '../controllers/cashierController';

const router = Router();

router.get('/', getAllCashiers);
router.delete('/:id', deleteCashier);

export default router;
