import express from 'express';
import { signup, login, getCurrentUser, getAllEmployees, updateEmployee } from '../controllers/authController.js';
import { authenticateUser, authorizeAdmin } from '../middleware/authMiddleware.js';

const router = express.Router();

// Authentication routes
router.post('/signup', signup);
router.post('/login', login);
router.get('/me', authenticateUser, getCurrentUser);

// Admin routes - add new endpoint
router.get('/employees', authenticateUser, authorizeAdmin, getAllEmployees);
router.put('/employees/:employeeId', authenticateUser, authorizeAdmin, updateEmployee);

export default router;
