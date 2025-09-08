import mongoose from 'mongoose';

const salarySlipSchema = new mongoose.Schema({
  employeeId: {
    type: String,
    required: true,
    ref: 'User'
  },
  month: {
    type: String,  // Changed from Number to String to handle month names
    required: true
  },
  year: {
    type: Number,
    required: true
  },
  basicSalary: {
    type: Number,
    required: true
  },
  allowances: {
    type: Number,
    default: 0
  },
  deductions: {
    type: Number,
    default: 0
  },
  netSalary: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    enum: ['issued', 'paid', 'cancelled'],
    default: 'issued'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  createdBy: {
    type: String,
    required: true
  },
  updatedAt: {
    type: Date
  },
  updatedBy: {
    type: String
  }
});

const SalarySlip = mongoose.model('SalarySlip', salarySlipSchema);

export default SalarySlip;
