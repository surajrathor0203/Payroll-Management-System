import nodemailer from 'nodemailer';
import dotenv from 'dotenv';


dotenv.config();

// Create transporter using Gmail SMTP
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.gmail_id,
    pass: process.env.gmail_app_password
  }
});

// Send registration success email to employee
export const sendRegistrationEmail = async (employeeEmail, employeeName) => {
  try {
    const mailOptions = {
      from: {
        name: 'Payroll Management System',
        address: process.env.gmail_id
      },
      to: employeeEmail,
      subject: 'Welcome to Payroll Management System - Registration Successful',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f5f5f5;">
          <div style="background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
            <div style="text-align: center; margin-bottom: 30px;">
              <h1 style="color: #1976d2; margin: 0;">Payroll Management System</h1>
              <div style="width: 100%; height: 3px; background: linear-gradient(90deg, #1976d2, #42a5f5); margin: 10px 0;"></div>
            </div>
            
            <h2 style="color: #333; margin-bottom: 20px;">Welcome ${employeeName}!</h2>
            
            <p style="color: #555; font-size: 16px; line-height: 1.6;">
              Congratulations! Your employee account has been successfully registered in our Payroll Management System.
            </p>
            
            <div style="background-color: #e3f2fd; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #1976d2;">
              <h3 style="color: #1976d2; margin-top: 0;">Important Notice:</h3>
              <p style="color: #555; margin-bottom: 0;">
                Please wait while our admin team assigns you to a department and sets up your salary details. 
                You will be notified once your profile is complete and you can access all features of the system.
              </p>
            </div>
            
            <div style="margin: 30px 0;">
              <h3 style="color: #333;">Your Account Details:</h3>
              <ul style="color: #555; line-height: 1.8;">
                <li><strong>Name:</strong> ${employeeName}</li>
                <li><strong>Email:</strong> ${employeeEmail}</li>
                <li><strong>Role:</strong> Employee</li>
                <li><strong>Status:</strong> Pending Department Assignment</li>
              </ul>
            </div>
            
            <div style="background-color: #fff3e0; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #ff9800;">
              <h3 style="color: #f57c00; margin-top: 0;">Next Steps:</h3>
              <ol style="color: #555; line-height: 1.8;">
                <li>Wait for admin to assign your department</li>
                <li>Admin will set up your salary details</li>
                <li>You'll receive another email when setup is complete</li>
                <li>You can then access all payroll features</li>
              </ol>
            </div>
            
            <div style="text-align: center; margin: 30px 0; padding: 20px; background-color: #f8f9fa; border-radius: 8px;">
              <p style="color: #666; margin: 0; font-size: 14px;">
                If you have any questions, please contact your HR department or system administrator.
              </p>
            </div>
            
            <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 2px solid #eee;">
              <p style="color: #999; font-size: 12px; margin: 0;">
                This is an automated email from Payroll Management System. Please do not reply to this email.
              </p>
              <p style="color: #999; font-size: 12px; margin: 5px 0 0 0;">
                © 2024 Payroll Management System. All rights reserved.
              </p>
            </div>
          </div>
        </div>
      `
    };

    const result = await transporter.sendMail(mailOptions);
    console.log('Registration email sent successfully:', result.messageId);
    return { success: true, messageId: result.messageId };
  } catch (error) {
    console.error('Error sending registration email:', error);
    return { success: false, error: error.message };
  }
};

// Send department assignment notification email
export const sendDepartmentAssignmentEmail = async (employeeEmail, employeeName, department, salary) => {
  try {
    const mailOptions = {
      from: {
        name: 'Payroll Management System',
        address: process.env.gmail_id
      },
      to: employeeEmail,
      subject: 'Department Assignment Complete - Payroll Management System',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f5f5f5;">
          <div style="background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
            <div style="text-align: center; margin-bottom: 30px;">
              <h1 style="color: #1976d2; margin: 0;">Payroll Management System</h1>
              <div style="width: 100%; height: 3px; background: linear-gradient(90deg, #1976d2, #42a5f5); margin: 10px 0;"></div>
            </div>
            
            <h2 style="color: #333; margin-bottom: 20px;">Profile Setup Complete!</h2>
            
            <p style="color: #555; font-size: 16px; line-height: 1.6;">
              Great news ${employeeName}! Your department has been assigned and your profile setup is now complete.
            </p>
            
            <div style="background-color: #e8f5e8; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #4caf50;">
              <h3 style="color: #388e3c; margin-top: 0;">Updated Profile Information:</h3>
              <ul style="color: #555; line-height: 1.8;">
                <li><strong>Department:</strong> ${department}</li>
                <li><strong>Salary:</strong> $${salary}</li>
              </ul>
            </div>
            
            <div style="background-color: #e3f2fd; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #1976d2;">
              <h3 style="color: #1976d2; margin-top: 0;">You Can Now Access:</h3>
              <ul style="color: #555; line-height: 1.8;">
                <li>Your complete employee dashboard</li>
                <li>Salary slip generation and download</li>
                <li>Expense submission and tracking</li>
                <li>All payroll management features</li>
              </ul>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="http://localhost:3000/login" style="background-color: #1976d2; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">
                Login to Your Account
              </a>
            </div>
            
            <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 2px solid #eee;">
              <p style="color: #999; font-size: 12px; margin: 0;">
                This is an automated email from Payroll Management System. Please do not reply to this email.
              </p>
            </div>
          </div>
        </div>
      `
    };

    const result = await transporter.sendMail(mailOptions);
    console.log('Department assignment email sent successfully:', result.messageId);
    return { success: true, messageId: result.messageId };
  } catch (error) {
    console.error('Error sending department assignment email:', error);
    return { success: false, error: error.message };
  }
};

// Send new employee registration notification to admin
export const sendAdminNotificationEmail = async (adminEmail, employeeName, employeeEmail) => {
  try {
    const mailOptions = {
      from: {
        name: 'Payroll Management System',
        address: process.env.gmail_id
      },
      to: adminEmail,
      subject: 'New Employee Registration - Action Required',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f5f5f5;">
          <div style="background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
            <div style="text-align: center; margin-bottom: 30px;">
              <h1 style="color: #1976d2; margin: 0;">Payroll Management System</h1>
              <div style="width: 100%; height: 3px; background: linear-gradient(90deg, #1976d2, #42a5f5); margin: 10px 0;"></div>
            </div>
            
            <h2 style="color: #333; margin-bottom: 20px;">New Employee Registration</h2>
            
            <p style="color: #555; font-size: 16px; line-height: 1.6;">
              A new employee has registered in the Payroll Management System and requires department assignment.
            </p>
            
            <div style="background-color: #fff3e0; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #ff9800;">
              <h3 style="color: #f57c00; margin-top: 0;">Employee Details:</h3>
              <ul style="color: #555; line-height: 1.8;">
                <li><strong>Name:</strong> ${employeeName}</li>
                <li><strong>Email:</strong> ${employeeEmail}</li>
                <li><strong>Role:</strong> Employee</li>
                <li><strong>Status:</strong> Pending Department Assignment</li>
                <li><strong>Registration Date:</strong> ${new Date().toLocaleDateString('en-US', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}</li>
              </ul>
            </div>
            
            <div style="background-color: #e3f2fd; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #1976d2;">
              <h3 style="color: #1976d2; margin-top: 0;">Action Required:</h3>
              <ul style="color: #555; line-height: 1.8;">
                <li>Assign the employee to a department</li>
                <li>Set up their salary details</li>
                <li>The employee will be notified automatically once setup is complete</li>
              </ul>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="http://localhost:3000/admin" style="background-color: #1976d2; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">
                Go to Admin Dashboard
              </a>
            </div>
            
            <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <p style="color: #666; margin: 0; font-size: 14px; text-align: center;">
                <strong>Note:</strong> The employee has been notified about the registration and is waiting for department assignment.
              </p>
            </div>
            
            <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 2px solid #eee;">
              <p style="color: #999; font-size: 12px; margin: 0;">
                This is an automated notification from Payroll Management System.
              </p>
              <p style="color: #999; font-size: 12px; margin: 5px 0 0 0;">
                © 2024 Payroll Management System. All rights reserved.
              </p>
            </div>
          </div>
        </div>
      `
    };

    const result = await transporter.sendMail(mailOptions);
    console.log('Admin notification email sent successfully:', result.messageId);
    return { success: true, messageId: result.messageId };
  } catch (error) {
    console.error('Error sending admin notification email:', error);
    return { success: false, error: error.message };
  }
};

// Send expense submission notification to admin
export const sendExpenseSubmissionAdminEmail = async (adminEmail, employeeName, expenseDetails) => {
  try {
    const mailOptions = {
      from: {
        name: 'Payroll Management System',
        address: process.env.gmail_id
      },
      to: adminEmail,
      subject: 'New Expense Submission - Action Required',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f5f5f5;">
          <div style="background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
            <div style="text-align: center; margin-bottom: 30px;">
              <h1 style="color: #1976d2; margin: 0;">Payroll Management System</h1>
              <div style="width: 100%; height: 3px; background: linear-gradient(90deg, #1976d2, #42a5f5); margin: 10px 0;"></div>
            </div>
            
            <h2 style="color: #333; margin-bottom: 20px;">New Expense Submission</h2>
            
            <p style="color: #555; font-size: 16px; line-height: 1.6;">
              Employee ${employeeName} has submitted a new expense that requires your review.
            </p>
            
            <div style="background-color: #fff3e0; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #ff9800;">
              <h3 style="color: #f57c00; margin-top: 0;">Expense Details:</h3>
              <ul style="color: #555; line-height: 1.8;">
                <li><strong>Title:</strong> ${expenseDetails.title}</li>
                <li><strong>Amount:</strong> $${expenseDetails.amount}</li>
                <li><strong>Category:</strong> ${expenseDetails.category}</li>
                <li><strong>Date:</strong> ${new Date(expenseDetails.date).toLocaleDateString()}</li>
                <li><strong>Description:</strong> ${expenseDetails.description || 'No description provided'}</li>
                <li><strong>Status:</strong> Pending Review</li>
                <li><strong>Submission Date:</strong> ${new Date().toLocaleDateString('en-US', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}</li>
              </ul>
            </div>
            
            <div style="background-color: #e3f2fd; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #1976d2;">
              <h3 style="color: #1976d2; margin-top: 0;">Action Required:</h3>
              <ul style="color: #555; line-height: 1.8;">
                <li>Review the expense details</li>
                <li>Approve or reject the expense</li>
                <li>The employee will be notified once you take action</li>
              </ul>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="http://localhost:3000/admin" style="background-color: #1976d2; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">
                Go to Admin Dashboard
              </a>
            </div>
            
            <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 2px solid #eee;">
              <p style="color: #999; font-size: 12px; margin: 0;">
                This is an automated notification from Payroll Management System.
              </p>
              <p style="color: #999; font-size: 12px; margin: 5px 0 0 0;">
                © 2024 Payroll Management System. All rights reserved.
              </p>
            </div>
          </div>
        </div>
      `
    };

    const result = await transporter.sendMail(mailOptions);
    console.log('Admin expense notification email sent successfully:', result.messageId);
    return { success: true, messageId: result.messageId };
  } catch (error) {
    console.error('Error sending admin expense notification email:', error);
    return { success: false, error: error.message };
  }
};

// Send expense submission confirmation to employee
export const sendExpenseSubmissionEmployeeEmail = async (employeeEmail, employeeName, expenseDetails) => {
  try {
    const mailOptions = {
      from: {
        name: 'Payroll Management System',
        address: process.env.gmail_id
      },
      to: employeeEmail,
      subject: 'Expense Submission Confirmation',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f5f5f5;">
          <div style="background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
            <div style="text-align: center; margin-bottom: 30px;">
              <h1 style="color: #1976d2; margin: 0;">Payroll Management System</h1>
              <div style="width: 100%; height: 3px; background: linear-gradient(90deg, #1976d2, #42a5f5); margin: 10px 0;"></div>
            </div>
            
            <h2 style="color: #333; margin-bottom: 20px;">Expense Submission Confirmation</h2>
            
            <p style="color: #555; font-size: 16px; line-height: 1.6;">
              Hello ${employeeName}, your expense has been successfully submitted for review.
            </p>
            
            <div style="background-color: #e8f5e8; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #4caf50;">
              <h3 style="color: #388e3c; margin-top: 0;">Expense Details:</h3>
              <ul style="color: #555; line-height: 1.8;">
                <li><strong>Title:</strong> ${expenseDetails.title}</li>
                <li><strong>Amount:</strong> $${expenseDetails.amount}</li>
                <li><strong>Category:</strong> ${expenseDetails.category}</li>
                <li><strong>Date:</strong> ${new Date(expenseDetails.date).toLocaleDateString()}</li>
                <li><strong>Description:</strong> ${expenseDetails.description || 'No description provided'}</li>
                <li><strong>Status:</strong> Pending Review</li>
                <li><strong>Submission Date:</strong> ${new Date().toLocaleDateString()}</li>
              </ul>
            </div>
            
            <div style="background-color: #e3f2fd; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #1976d2;">
              <h3 style="color: #1976d2; margin-top: 0;">Next Steps:</h3>
              <ul style="color: #555; line-height: 1.8;">
                <li>Your expense is now pending review by the admin</li>
                <li>You will be notified when your expense is approved or rejected</li>
                <li>You can track the status of your expense in your dashboard</li>
              </ul>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="http://localhost:3000/employee" style="background-color: #1976d2; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">
                Go to Employee Dashboard
              </a>
            </div>
            
            <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 2px solid #eee;">
              <p style="color: #999; font-size: 12px; margin: 0;">
                This is an automated confirmation from Payroll Management System. Please do not reply to this email.
              </p>
              <p style="color: #999; font-size: 12px; margin: 5px 0 0 0;">
                © 2024 Payroll Management System. All rights reserved.
              </p>
            </div>
          </div>
        </div>
      `
    };

    const result = await transporter.sendMail(mailOptions);
    console.log('Employee expense confirmation email sent successfully:', result.messageId);
    return { success: true, messageId: result.messageId };
  } catch (error) {
    console.error('Error sending employee expense confirmation email:', error);
    return { success: false, error: error.message };
  }
};

// Send expense approval notification to employee
export const sendExpenseApprovalEmail = async (employeeEmail, employeeName, expenseDetails) => {
  try {
    const mailOptions = {
      from: {
        name: 'Payroll Management System',
        address: process.env.gmail_id
      },
      to: employeeEmail,
      subject: 'Expense Approved - Payroll Management System',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f5f5f5;">
          <div style="background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
            <div style="text-align: center; margin-bottom: 30px;">
              <h1 style="color: #1976d2; margin: 0;">Payroll Management System</h1>
              <div style="width: 100%; height: 3px; background: linear-gradient(90deg, #1976d2, #42a5f5); margin: 10px 0;"></div>
            </div>
            
            <h2 style="color: #333; margin-bottom: 20px;">Expense Approved</h2>
            
            <p style="color: #555; font-size: 16px; line-height: 1.6;">
              Good news, ${employeeName}! Your expense request has been reviewed and approved.
            </p>
            
            <div style="background-color: #e8f5e8; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #4caf50;">
              <h3 style="color: #388e3c; margin-top: 0;">Approved Expense Details:</h3>
              <ul style="color: #555; line-height: 1.8;">
                <li><strong>Title:</strong> ${expenseDetails.title}</li>
                <li><strong>Amount:</strong> $${expenseDetails.amount}</li>
                <li><strong>Category:</strong> ${expenseDetails.category}</li>
                <li><strong>Date:</strong> ${new Date(expenseDetails.date).toLocaleDateString()}</li>
                <li><strong>Description:</strong> ${expenseDetails.description || 'No description provided'}</li>
                <li><strong>Status:</strong> Approved ✓</li>
                <li><strong>Approval Date:</strong> ${new Date().toLocaleDateString('en-US', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric'
                })}</li>
              </ul>
            </div>
            
            <div style="background-color: #e3f2fd; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #1976d2;">
              <h3 style="color: #1976d2; margin-top: 0;">What's Next:</h3>
              <ul style="color: #555; line-height: 1.8;">
                <li>Your expense has been recorded in the system</li>
                <li>The finance department will process the reimbursement</li>
                <li>You can view all your approved expenses in your dashboard</li>
              </ul>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="http://localhost:3000/employee" style="background-color: #1976d2; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">
                Go to Employee Dashboard
              </a>
            </div>
            
            <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 2px solid #eee;">
              <p style="color: #999; font-size: 12px; margin: 0;">
                This is an automated notification from Payroll Management System. Please do not reply to this email.
              </p>
              <p style="color: #999; font-size: 12px; margin: 5px 0 0 0;">
                © 2024 Payroll Management System. All rights reserved.
              </p>
            </div>
          </div>
        </div>
      `
    };

    const result = await transporter.sendMail(mailOptions);
    console.log('Expense approval email sent successfully:', result.messageId);
    return { success: true, messageId: result.messageId };
  } catch (error) {
    console.error('Error sending expense approval email:', error);
    return { success: false, error: error.message };
  }
};

// Send expense rejection notification to employee
export const sendExpenseRejectionEmail = async (employeeEmail, employeeName, expenseDetails) => {
  try {
    const mailOptions = {
      from: {
        name: 'Payroll Management System',
        address: process.env.gmail_id
      },
      to: employeeEmail,
      subject: 'Expense Rejected - Payroll Management System',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f5f5f5;">
          <div style="background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
            <div style="text-align: center; margin-bottom: 30px;">
              <h1 style="color: #1976d2; margin: 0;">Payroll Management System</h1>
              <div style="width: 100%; height: 3px; background: linear-gradient(90deg, #1976d2, #42a5f5); margin: 10px 0;"></div>
            </div>
            
            <h2 style="color: #333; margin-bottom: 20px;">Expense Rejected</h2>
            
            <p style="color: #555; font-size: 16px; line-height: 1.6;">
              Hello ${employeeName}, your expense request has been reviewed and could not be approved at this time.
            </p>
            
            <div style="background-color: #ffebee; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #f44336;">
              <h3 style="color: #d32f2f; margin-top: 0;">Expense Details:</h3>
              <ul style="color: #555; line-height: 1.8;">
                <li><strong>Title:</strong> ${expenseDetails.title}</li>
                <li><strong>Amount:</strong> $${expenseDetails.amount}</li>
                <li><strong>Category:</strong> ${expenseDetails.category}</li>
                <li><strong>Date:</strong> ${new Date(expenseDetails.date).toLocaleDateString()}</li>
                <li><strong>Description:</strong> ${expenseDetails.description || 'No description provided'}</li>
                <li><strong>Status:</strong> Rejected</li>
                <li><strong>Decision Date:</strong> ${new Date().toLocaleDateString('en-US', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric'
                })}</li>
              </ul>
            </div>
            
            <div style="background-color: #e3f2fd; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #1976d2;">
              <h3 style="color: #1976d2; margin-top: 0;">What's Next:</h3>
              <ul style="color: #555; line-height: 1.8;">
                <li>You may contact your supervisor for more details about this decision</li>
                <li>Consider resubmitting with additional documentation if applicable</li>
                <li>Check the company expense policy for guidance on eligible expenses</li>
              </ul>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="http://localhost:3000/employee" style="background-color: #1976d2; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">
                Go to Employee Dashboard
              </a>
            </div>
            
            <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 2px solid #eee;">
              <p style="color: #999; font-size: 12px; margin: 0;">
                This is an automated notification from Payroll Management System. Please do not reply to this email.
              </p>
              <p style="color: #999; font-size: 12px; margin: 5px 0 0 0;">
                © 2024 Payroll Management System. All rights reserved.
              </p>
            </div>
          </div>
        </div>
      `
    };

    const result = await transporter.sendMail(mailOptions);
    console.log('Expense rejection email sent successfully:', result.messageId);
    return { success: true, messageId: result.messageId };
  } catch (error) {
    console.error('Error sending expense rejection email:', error);
    return { success: false, error: error.message };
  }
};

// Send salary slip generation notification to employee
export const sendSalarySlipNotificationEmail = async (employeeEmail, employeeName, salarySlipDetails) => {
  try {
    const mailOptions = {
      from: {
        name: 'Payroll Management System',
        address: process.env.gmail_id
      },
      to: employeeEmail,
      subject: 'New Salary Slip Generated - Payroll Management System',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f5f5f5;">
          <div style="background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
            <div style="text-align: center; margin-bottom: 30px;">
              <h1 style="color: #1976d2; margin: 0;">Payroll Management System</h1>
              <div style="width: 100%; height: 3px; background: linear-gradient(90deg, #1976d2, #42a5f5); margin: 10px 0;"></div>
            </div>
            
            <h2 style="color: #333; margin-bottom: 20px;">New Salary Slip Generated</h2>
            
            <p style="color: #555; font-size: 16px; line-height: 1.6;">
              Hello ${employeeName}, your salary slip for ${salarySlipDetails.month} ${salarySlipDetails.year} has been generated.
            </p>
            
            <div style="background-color: #e8f5e8; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #4caf50;">
              <h3 style="color: #388e3c; margin-top: 0;">Salary Details:</h3>
              <ul style="color: #555; line-height: 1.8;">
                <li><strong>Month/Year:</strong> ${salarySlipDetails.month} ${salarySlipDetails.year}</li>
                <li><strong>Basic Salary:</strong> $${salarySlipDetails.basicSalary}</li>
                <li><strong>Allowances:</strong> $${salarySlipDetails.allowances}</li>
                <li><strong>Deductions:</strong> $${salarySlipDetails.deductions}</li>
                <li><strong>Net Salary:</strong> $${salarySlipDetails.netSalary}</li>
                <li><strong>Status:</strong> ${salarySlipDetails.status}</li>
              </ul>
            </div>
            
            <div style="background-color: #e3f2fd; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #1976d2;">
              <h3 style="color: #1976d2; margin-top: 0;">Actions Available:</h3>
              <ul style="color: #555; line-height: 1.8;">
                <li>View your salary slip details in the employee dashboard</li>
                <li>Download a PDF copy of your salary slip</li>
                <li>Review your salary history</li>
              </ul>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="http://localhost:3000/employee" style="background-color: #1976d2; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">
                Go to Employee Dashboard
              </a>
            </div>
            
            <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 2px solid #eee;">
              <p style="color: #999; font-size: 12px; margin: 0;">
                This is an automated notification from Payroll Management System. Please do not reply to this email.
              </p>
              <p style="color: #999; font-size: 12px; margin: 5px 0 0 0;">
                © 2024 Payroll Management System. All rights reserved.
              </p>
            </div>
          </div>
        </div>
      `
    };

    const result = await transporter.sendMail(mailOptions);
    console.log('Salary slip notification email sent successfully:', result.messageId);
    return { success: true, messageId: result.messageId };
  } catch (error) {
    console.error('Error sending salary slip notification email:', error);
    return { success: false, error: error.message };
  }
};

export default { 
  sendRegistrationEmail, 
  sendDepartmentAssignmentEmail, 
  sendAdminNotificationEmail,
  sendExpenseSubmissionAdminEmail,
  sendExpenseSubmissionEmployeeEmail,
  sendExpenseApprovalEmail,
  sendExpenseRejectionEmail,
  sendSalarySlipNotificationEmail
};