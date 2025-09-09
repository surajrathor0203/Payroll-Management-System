import express from 'express';
import { 
  submitExpense, 
  getAllExpenses, 
  getEmployeeExpenses,
  approveExpense,
  rejectExpense
} from '../controllers/expenseController.js';
import { authenticateUser, authorizeAdmin } from '../middleware/authMiddleware.js';

const router = express.Router();

// Employee routes
router.post('/', authenticateUser, submitExpense);
router.get('/employee/:id', authenticateUser, getEmployeeExpenses);

// Admin routes
router.get('/', authenticateUser, authorizeAdmin, getAllExpenses);
router.put('/:id/approve', authenticateUser, authorizeAdmin, approveExpense);
router.put('/:id/reject', authenticateUser, authorizeAdmin, rejectExpense);

export default router;
