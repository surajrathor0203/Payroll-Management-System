import express from 'express';
import { signup, login, getCurrentUser, getAllEmployees, updateEmployee } from '../controllers/authController.js';
import { authenticateUser, authorizeAdmin } from '../middleware/authMiddleware.js';

const router = express.Router();

// Authentication routes
router.post('/signup', signup);
router.post('/login', login);
router.get('/me', authenticateUser, getCurrentUser);

// Admin routes
router.get('/employees', authenticateUser, authorizeAdmin, getAllEmployees);
// Add both routes to support both frontend calls
router.put('/employee/:employeeId', authenticateUser, authorizeAdmin, updateEmployee);
router.put('/employees/:employeeId', authenticateUser, authorizeAdmin, updateEmployee);

export default router;
