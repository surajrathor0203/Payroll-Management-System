import SalarySlip from '../models/salarySlipModel.js';
import User from '../models/userModel.js';
import PDFDocument from 'pdfkit';
import { sendSalarySlipNotificationEmail } from '../utils/emailService.js';

// Create a new salary slip
export const createSalarySlip = async (req, res) => {
  try {
    const { employeeId, month, year, basicSalary, allowances, deductions, netSalary } = req.body;
    
    // Get employee name
    const employee = await User.findById(employeeId);
    if (!employee) {
      return res.status(404).json({
        success: false,
        message: 'Employee not found'
      });
    }
    
    // Create salary slip in MongoDB
    const newSalarySlip = new SalarySlip({
      employeeId,
      month,
      year,
      basicSalary,
      allowances,
      deductions,
      netSalary,
      createdBy: req.user.uid,
      status: 'issued'
    });
    
    const savedSalarySlip = await newSalarySlip.save();
    
    // Format the response to match frontend expectations
    const formattedSlip = {
      id: savedSalarySlip._id,
      employeeId: savedSalarySlip.employeeId,
      employeeName: employee.fullName,
      month: savedSalarySlip.month,
      year: savedSalarySlip.year,
      basicSalary: savedSalarySlip.basicSalary,
      allowances: savedSalarySlip.allowances,
      deductions: savedSalarySlip.deductions,
      netSalary: savedSalarySlip.netSalary,
      status: savedSalarySlip.status
    };
    
    // Send response first
    res.status(201).json(formattedSlip);
    
    // Send email notification to employee after response
    if (employee.email) {
      try {
        await sendSalarySlipNotificationEmail(
          employee.email,
          employee.fullName,
          formattedSlip
        );
        console.log('Salary slip notification email sent successfully');
      } catch (emailError) {
        console.error('Error sending salary slip notification email:', emailError);
      }
    }
    
  } catch (error) {
    console.error('Create salary slip error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create salary slip'
    });
  }
};

// Update a salary slip
export const updateSalarySlip = async (req, res) => {
  try {
    const { id } = req.params;
    const { basicSalary, allowances, deductions, netSalary, status } = req.body;
    
    const salarySlip = await SalarySlip.findById(id);
    
    if (!salarySlip) {
      return res.status(404).json({
        success: false,
        message: 'Salary slip not found'
      });
    }
    
    const updatedSalarySlip = await SalarySlip.findByIdAndUpdate(
      id,
      {
        basicSalary,
        allowances,
        deductions,
        netSalary,
        status,
        updatedAt: new Date(),
        updatedBy: req.user.uid
      },
      { new: true }
    );
    
    // Send the response first
    res.status(200).json({
      success: true,
      message: 'Salary slip updated successfully',
      salarySlip: updatedSalarySlip
    });
    
    // Get employee information to send notification after response
    try {
      const employee = await User.findById(salarySlip.employeeId);
      
      // Only send notification if there are significant changes
      if (employee && employee.email && 
          (basicSalary !== salarySlip.basicSalary || 
           allowances !== salarySlip.allowances || 
           deductions !== salarySlip.deductions || 
           netSalary !== salarySlip.netSalary)) {
        
        const formattedSlip = {
          id: updatedSalarySlip._id,
          employeeId: updatedSalarySlip.employeeId,
          employeeName: employee.fullName,
          month: updatedSalarySlip.month,
          year: updatedSalarySlip.year,
          basicSalary: updatedSalarySlip.basicSalary,
          allowances: updatedSalarySlip.allowances,
          deductions: updatedSalarySlip.deductions,
          netSalary: updatedSalarySlip.netSalary,
          status: updatedSalarySlip.status
        };
        
        await sendSalarySlipNotificationEmail(
          employee.email,
          employee.fullName,
          formattedSlip
        );
        console.log('Salary slip update notification email sent successfully');
      }
    } catch (emailError) {
      console.error('Error sending salary slip update notification email:', emailError);
    }
    
  } catch (error) {
    console.error('Update salary slip error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update salary slip'
    });
  }
};

// Get all salary slips (for admin)
export const getAllSalarySlips = async (req, res) => {
  try {
    const salarySlips = await SalarySlip.find();
    
    // Get employee information to include names
    const slipsWithNames = await Promise.all(salarySlips.map(async (slip) => {
      const employee = await User.findById(slip.employeeId);
      return {
        id: slip._id,
        employeeId: slip.employeeId,
        employeeName: employee ? employee.fullName : 'Unknown Employee',
        month: slip.month,
        year: slip.year,
        basicSalary: slip.basicSalary,
        allowances: slip.allowances,
        deductions: slip.deductions,
        netSalary: slip.netSalary,
        status: slip.status
      };
    }));
    
    res.status(200).json(slipsWithNames);
  } catch (error) {
    console.error('Get all salary slips error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve salary slips'
    });
  }
};

// Get employee's salary slips
export const getSalarySlips = async (req, res) => {
  try {
    // Get employee ID from params or from authenticated user
    const employeeId = req.params.id || req.user.uid;
    
    // console.log('Fetching salary slips for employee ID:', employeeId);
    
    const salarySlips = await SalarySlip.find({ employeeId });
    // console.log('Found salary slips:', salarySlips.length);
    
    // Get employee information to include names
    const employee = await User.findById(employeeId);
    const employeeName = employee ? employee.fullName : 'Unknown Employee';
    
    // Format to match frontend expectations
    const formattedSlips = salarySlips.map(slip => ({
      id: slip._id,
      employeeId: slip.employeeId,
      employeeName: employeeName,
      month: slip.month,
      year: slip.year,
      basicSalary: slip.basicSalary,
      allowances: slip.allowances,
      deductions: slip.deductions,
      netSalary: slip.netSalary,
      status: slip.status
    }));
    
    // Return array directly for consistency
    res.status(200).json(formattedSlips);
  } catch (error) {
    console.error('Get salary slips error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve salary slips'
    });
  }
};

// Download salary slip as PDF
export const downloadSalarySlip = async (req, res) => {
  try {
    const { id } = req.params;
    console.log(`Generating PDF for salary slip ID: ${id}`);
    
    // Find the salary slip by ID
    const salarySlip = await SalarySlip.findById(id);
    
    if (!salarySlip) {
      console.log('Salary slip not found');
      return res.status(404).json({
        success: false,
        message: 'Salary slip not found'
      });
    }
    
    console.log('Salary slip found:', salarySlip._id);
    
    // Get employee information
    const employee = await User.findById(salarySlip.employeeId);
    if (!employee) {
      console.log('Employee not found');
      return res.status(404).json({
        success: false,
        message: 'Employee not found'
      });
    }
    
    console.log('Employee found:', employee._id);
    
    // Set response headers for PDF download
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=salary-slip-${id}.pdf`);
    
    // Create PDF document
    const doc = new PDFDocument({ margin: 50 });
    
    // Pipe PDF to response
    doc.pipe(res);
    
    // Add company logo/header
    doc.fontSize(20).text('Payroll Management System', { align: 'center' });
    doc.moveDown();
    doc.fontSize(16).text('Salary Slip', { align: 'center' });
    doc.moveDown();
    
    // Add horizontal line
    doc.moveTo(50, doc.y)
       .lineTo(550, doc.y)
       .stroke();
    doc.moveDown();
    
    // Employee details - use safe property access with defaults
    const employeeName = employee.fullName || employee.name || 'Employee';
    const department = employee.department || 'N/A';
    
    doc.fontSize(12).text(`Employee: ${employeeName}`, { continued: true });
    doc.text(`Department: ${department}`, { align: 'right' });
    doc.text(`Employee ID: ${employee._id}`, { continued: true });
    doc.text(`Pay Period: ${salarySlip.month} ${salarySlip.year}`, { align: 'right' });
    doc.moveDown(2);
    
    // Earnings table
    doc.fontSize(14).text('Earnings', { underline: true });
    doc.moveDown();
    
    // Ensure numeric values
    const basicSalary = Number(salarySlip.basicSalary) || 0;
    const allowances = Number(salarySlip.allowances) || 0;
    const deductions = Number(salarySlip.deductions) || 0;
    const netSalary = Number(salarySlip.netSalary) || 0;
    
    // Basic salary
    doc.fontSize(12).text('Basic Salary:', { continued: true, width: 300, align: 'left' });
    doc.text(`$${basicSalary.toFixed(2)}`, { align: 'right' });
    
    // Allowances
    if (allowances > 0) {
      doc.text('Allowances:', { continued: true, width: 300, align: 'left' });
      doc.text(`$${allowances.toFixed(2)}`, { align: 'right' });
    }
    
    doc.moveDown();
    
    // Deductions table
    doc.fontSize(14).text('Deductions', { underline: true });
    doc.moveDown();
    
    // Deductions
    if (deductions > 0) {
      doc.fontSize(12).text('Deductions:', { continued: true, width: 300, align: 'left' });
      doc.text(`$${deductions.toFixed(2)}`, { align: 'right' });
    } else {
      doc.fontSize(12).text('No deductions', { align: 'left' });
    }
    
    doc.moveDown(2);
    
    // Total
    doc.moveTo(50, doc.y)
       .lineTo(550, doc.y)
       .stroke();
    doc.moveDown();
    
    doc.fontSize(14).text('Net Salary:', { continued: true, width: 300, align: 'left' });
    doc.text(`$${netSalary.toFixed(2)}`, { align: 'right' });
    
    // Footer
    doc.moveDown(4);
    doc.fontSize(10).text('This is a computer-generated document. No signature is required.', { align: 'center', opacity: 0.7 });
    
    // Issue date
    const issueDate = salarySlip.updatedAt || salarySlip.createdAt || new Date();
    doc.moveDown();
    doc.text(`Generated on: ${new Date(issueDate).toLocaleDateString()}`, { align: 'center', opacity: 0.7 });
    
    // Finalize PDF
    doc.end();
    
    console.log('PDF generation completed');
    
  } catch (error) {
    console.error('Download salary slip error:', error);
    // Send detailed error message for debugging
    res.status(500).json({
      success: false,
      message: 'Failed to generate salary slip PDF',
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};
