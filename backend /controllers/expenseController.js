import Expense from '../models/expenseModel.js';
import User from '../models/userModel.js';
import { 
  sendExpenseSubmissionAdminEmail, 
  sendExpenseSubmissionEmployeeEmail,
  sendExpenseApprovalEmail,
  sendExpenseRejectionEmail 
} from '../utils/emailService.js';

// Submit a new expense
export const submitExpense = async (req, res) => {
  try {
    const { title, amount, date, category, description, receiptUrl } = req.body;
    
    // Get employee name
    const employee = await User.findById(req.user.uid);
    const employeeName = employee ? employee.fullName : 'Unknown Employee';
    const employeeEmail = employee ? employee.email : '';
    
    // Create expense in MongoDB
    const newExpense = new Expense({
      employeeId: req.user.uid,
      employeeName: employeeName,
      title,
      amount,
      date,
      category,
      description,
      receiptUrl,
      status: 'pending'
    });
    
    const savedExpense = await newExpense.save();
    
    // Format for frontend
    const formattedExpense = {
      id: savedExpense._id,
      employeeId: savedExpense.employeeId,
      employeeName: savedExpense.employeeName,
      title: savedExpense.title,
      amount: savedExpense.amount,
      date: savedExpense.date,
      category: savedExpense.category,
      description: savedExpense.description,
      status: savedExpense.status
    };
    
    // Send the response before sending emails
    res.status(201).json(formattedExpense);
    
    // Find admin email to send notification
    const admins = await User.find({ role: 'admin' });
    
    // Send email notifications asynchronously after response
    if (admins.length > 0) {
      // Send to the first admin found
      try {
        await sendExpenseSubmissionAdminEmail(
          admins[0].email,
          employeeName,
          formattedExpense
        );
        console.log('Admin notification email sent successfully');
      } catch (emailError) {
        console.error('Error sending admin notification email:', emailError);
      }
    }
    
    // Send confirmation to the employee
    if (employeeEmail) {
      try {
        await sendExpenseSubmissionEmployeeEmail(
          employeeEmail,
          employeeName,
          formattedExpense
        );
        console.log('Employee confirmation email sent successfully');
      } catch (emailError) {
        console.error('Error sending employee confirmation email:', emailError);
      }
    }
    
  } catch (error) {
    console.error('Submit expense error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to submit expense'
    });
  }
};

// Get all expenses (for admin)
export const getAllExpenses = async (req, res) => {
  try {
    const expenses = await Expense.find().sort({ submittedAt: -1 });
    
    // Format for frontend
    const formattedExpenses = expenses.map(exp => ({
      id: exp._id,
      employeeId: exp.employeeId,
      employeeName: exp.employeeName,
      title: exp.title,
      amount: exp.amount,
      date: exp.date,
      category: exp.category,
      description: exp.description,
      status: exp.status
    }));
    
    res.status(200).json(formattedExpenses);
  } catch (error) {
    console.error('Get all expenses error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve expenses'
    });
  }
};

// Get employee's expenses
export const getEmployeeExpenses = async (req, res) => {
  try {
    const employeeId = req.params.id || req.user.uid;
    
    const expenses = await Expense.find({ employeeId }).sort({ submittedAt: -1 });
    
    // Format for frontend
    const formattedExpenses = expenses.map(exp => ({
      id: exp._id,
      title: exp.title,
      amount: exp.amount,
      date: exp.date,
      category: exp.category,
      description: exp.description,
      status: exp.status
    }));
    
    res.status(200).json(formattedExpenses);
  } catch (error) {
    console.error('Get employee expenses error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve expenses'
    });
  }
};

// Approve expense
export const approveExpense = async (req, res) => {
  try {
    const { id } = req.params;
    
    const expense = await Expense.findByIdAndUpdate(
      id,
      { status: 'approved' },
      { new: true }
    );
    
    if (!expense) {
      return res.status(404).json({
        success: false,
        message: 'Expense not found'
      });
    }
    
    // Format for frontend
    const formattedExpense = {
      id: expense._id,
      employeeId: expense.employeeId,
      employeeName: expense.employeeName,
      title: expense.title,
      amount: expense.amount,
      date: expense.date,
      category: expense.category,
      description: expense.description,
      status: expense.status
    };

    // Send response before email
    res.status(200).json(formattedExpense);

    // Send email notification to employee about approval
    try {
      const employee = await User.findById(expense.employeeId);
      if (employee && employee.email) {
        await sendExpenseApprovalEmail(
          employee.email,
          expense.employeeName,
          formattedExpense
        );
        console.log('Expense approval email sent successfully');
      }
    } catch (emailError) {
      console.error('Error sending expense approval email:', emailError);
    }
    
  } catch (error) {
    console.error('Approve expense error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to approve expense'
    });
  }
};

// Reject expense
export const rejectExpense = async (req, res) => {
  try {
    const { id } = req.params;
    
    const expense = await Expense.findByIdAndUpdate(
      id,
      { status: 'rejected' },
      { new: true }
    );
    
    if (!expense) {
      return res.status(404).json({
        success: false,
        message: 'Expense not found'
      });
    }
    
    // Format for frontend
    const formattedExpense = {
      id: expense._id,
      employeeId: expense.employeeId,
      employeeName: expense.employeeName,
      title: expense.title,
      amount: expense.amount,
      date: expense.date,
      category: expense.category,
      description: expense.description,
      status: expense.status
    };
    
    // Send response before email
    res.status(200).json(formattedExpense);
    
    // Send email notification to employee about rejection
    try {
      const employee = await User.findById(expense.employeeId);
      if (employee && employee.email) {
        await sendExpenseRejectionEmail(
          employee.email,
          expense.employeeName,
          formattedExpense
        );
        console.log('Expense rejection email sent successfully');
      }
    } catch (emailError) {
      console.error('Error sending expense rejection email:', emailError);
    }
    
  } catch (error) {
    console.error('Reject expense error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to reject expense'
    });
  }
};

