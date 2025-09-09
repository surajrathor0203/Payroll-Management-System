// server.js
import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import connectDB from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import salarySlipRoutes from "./routes/salarySlipRoutes.js";
import expenseRoutes from "./routes/expenseRoutes.js";


// Load environment variables early
dotenv.config();

// Verify critical environment variables
if (!process.env.JWT_SECRET) {
  console.error('CRITICAL ERROR: JWT_SECRET is not defined in environment variables');
  console.error('Please check your .env file and make sure JWT_SECRET is set');
}

if (!process.env.MONGO_URI) {
  console.error('CRITICAL ERROR: MONGO_URI is not defined in environment variables');
  console.error('Please check your .env file and make sure MONGO_URI is set');
}

// Connect to MongoDB
connectDB();

const app = express();
const PORT = process.env.PORT || 5001;

// Middleware
app.use(express.json());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));

// Routes
app.get("/", (req, res) => {
  res.send("Payroll Management System API 🚀");
});

// API routes
app.use("/api/auth", authRoutes);
app.use("/api/salary-slip", salarySlipRoutes);
app.use("/api/expense", expenseRoutes);

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
  // Keep the process running despite the error
});

// Start server
const server = app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
  console.log('Press Ctrl+C to stop the server');
});

// Handle server errors
server.on('error', (error) => {
  console.error('Server error:', error);
});
