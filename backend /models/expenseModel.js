import mongoose from 'mongoose';

const expenseSchema = new mongoose.Schema({
  employeeId: {
    type: String,
    required: true,
    ref: 'User'
  },
  employeeName: {
    type: String,
    required: true
  },
  title: {
    type: String,
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  category: {
    type: String,
    required: true
  },
  description: {
    type: String
  },
  receiptUrl: {
    type: String
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  submittedAt: {
    type: Date,
    default: Date.now
  }
});

const Expense = mongoose.model('Expense', expenseSchema);

export default Expense;
