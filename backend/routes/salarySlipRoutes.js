import express from 'express';
import { createSalarySlip, updateSalarySlip, getSalarySlips, getAllSalarySlips, downloadSalarySlip } from '../controllers/salarySlipController.js';
import { authenticateUser, authorizeAdmin } from '../middleware/authMiddleware.js';

const router = express.Router();

// Admin routes
router.post('/', authenticateUser, authorizeAdmin, createSalarySlip);
router.put('/:id', authenticateUser, authorizeAdmin, updateSalarySlip);
router.get('/', authenticateUser, authorizeAdmin, getAllSalarySlips);

// Employee routes
router.get('/employee/:id', authenticateUser, getSalarySlips);
router.get('/my-slips', authenticateUser, getSalarySlips);

// PDF download route (accessible to both admin and employees)
router.get('/:id/download', authenticateUser, downloadSalarySlip);

export default router;
