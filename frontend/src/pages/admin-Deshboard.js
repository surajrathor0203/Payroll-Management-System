import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import {
  Box,
  Typography,
  AppBar,
  Toolbar,
  IconButton,
  Button,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Paper,
  Grid,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  TextField,
  MenuItem,
  Tab,
  Tabs,
  CircularProgress,
  Alert,
  FormControl,
  InputLabel,
  Select,
  InputAdornment,
  Snackbar
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import DashboardIcon from '@mui/icons-material/Dashboard';
import PeopleIcon from '@mui/icons-material/People';
import ReceiptIcon from '@mui/icons-material/Receipt';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import LogoutIcon from '@mui/icons-material/Logout';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DownloadIcon from '@mui/icons-material/Download';
import SearchIcon from '@mui/icons-material/Search';
import BarChartIcon from '@mui/icons-material/BarChart';
// Import Chart.js components
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement
} from 'chart.js';
import { Bar, Pie, Line } from 'react-chartjs-2';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement
);

// Define API_URL constant - this was missing and causing the errors
const API_URL = `${process.env.REACT_APP_BACKEND_URL || 'http://localhost:5001'}/api`;

// Custom TabPanel component
function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

const AdminDashboard = () => {
  const { user, logout } = useAuth();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [tabValue, setTabValue] = useState(0);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editEmployeeDialog, setEditEmployeeDialog] = useState(false);
  const [editSalarySlipDialog, setEditSalarySlipDialog] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [employees, setEmployees] = useState([]);
  const [salarySlips, setSalarySlips] = useState([]);
  const [expenses, setExpenses] = useState([]);
  
  // Add search state variables
  const [employeeSearch, setEmployeeSearch] = useState('');
  const [salarySlipSearch, setSalarySlipSearch] = useState('');
  const [expenseSearch, setExpenseSearch] = useState('');
  
  const [salarySlipForm, setSalarySlipForm] = useState({
    employeeId: '',
    month: '',
    year: new Date().getFullYear(),
    basicSalary: '',
    allowances: '',
    deductions: '',
    netSalary: ''
  });
  
  const [editEmployeeForm, setEditEmployeeForm] = useState({
    id: '',
    name: '',
    email: '',
    department: '',
    salary: 0
  });

  const [editSalarySlipForm, setEditSalarySlipForm] = useState({
    id: '',
    employeeId: '',
    employeeName: '',
    month: '',
    year: new Date().getFullYear(),
    basicSalary: '',
    allowances: '',
    deductions: '',
    netSalary: ''
  });

  // Add filter state variables
  const [salarySlipMonthFilter, setSalarySlipMonthFilter] = useState('');
  const [salarySlipYearFilter, setSalarySlipYearFilter] = useState('');

  // Add notification state
  const [notification, setNotification] = useState({
    open: false,
    message: '',
    severity: 'success'
  });
  
  // Add confirmation dialog state
  const [confirmDialog, setConfirmDialog] = useState({
    open: false,
    title: '',
    message: '',
    onConfirm: null
  });

  useEffect(() => {
    // Fetch data
    fetchEmployees();
    fetchSalarySlips();
    fetchExpenses();
  }, []);

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/auth/employees`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch employees');
      }
      
      const data = await response.json();
      setEmployees(data);
    } catch (error) {
      setError('Failed to load employees');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const fetchSalarySlips = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/salary-slip`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
          
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch salary slips');
      }
      
      const data = await response.json();
      // Check for the correct structure and ensure it's an array
      if (data && data.salarySlips && Array.isArray(data.salarySlips)) {
        setSalarySlips(data.salarySlips);
      } else if (Array.isArray(data)) {
        // Handle case where API returns direct array
        setSalarySlips(data);
        // console.log('Fetched salary slips:', data);
      } else {
        console.error('Unexpected API response format:', data);
        setSalarySlips([]);
      }
    } catch (error) {
      setError('Failed to load salary slips');
      console.error(error);
      setSalarySlips([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchExpenses = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/expense`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch expenses');
      }
      
      const data = await response.json();
      // Ensure that data is an array
      setExpenses(Array.isArray(data) ? data : []);
    } catch (error) {
      setError('Failed to load expenses');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    window.location.href = '/login';
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleDialogOpen = () => {
    setDialogOpen(true);
  };

  const handleDialogClose = () => {
    setDialogOpen(false);
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    
    // If the employee is selected, auto-fill the basic salary
    if (name === 'employeeId') {
      const selectedEmployee = employees.find(emp => emp.id === value);
      
      setSalarySlipForm(prev => ({
        ...prev,
        [name]: value,
        // Auto-fill the basic salary with the employee's current salary
        basicSalary: selectedEmployee ? selectedEmployee.salary.toString() : ''
      }));
    } else {
      setSalarySlipForm(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const calculateNetSalary = () => {
    const basic = parseFloat(salarySlipForm.basicSalary) || 0;
    const allowances = parseFloat(salarySlipForm.allowances) || 0;
    const deductions = parseFloat(salarySlipForm.deductions) || 0;
    return (basic + allowances - deductions).toFixed(2);
  };

  const createSalarySlip = async () => {
    // Open confirmation dialog
    setConfirmDialog({
      open: true,
      title: 'Create Salary Slip',
      message: 'Are you sure you want to create this salary slip? An email notification will be sent to the employee.',
      onConfirm: async () => {
        try {
          setLoading(true);
          
          // Calculate net salary if not already set
          const netSalary = salarySlipForm.netSalary || calculateNetSalary();
          
          const response = await fetch(`${API_URL}/salary-slip`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify({
              ...salarySlipForm,
              netSalary
            })
          });
          
          if (!response.ok) {
            throw new Error('Failed to create salary slip');
          }
          
          const data = await response.json();
          
          // Add the new salary slip to the list
          setSalarySlips([data, ...salarySlips]);
          
          // Reset form
          setSalarySlipForm({
            employeeId: '',
            month: '',
            year: new Date().getFullYear(),
            basicSalary: '',
            allowances: '',
            deductions: '',
            netSalary: ''
          });
          
          // Close dialog
          setDialogOpen(false);
          
          // Show success notification
          setNotification({
            open: true,
            message: 'Salary slip created successfully! Email notification sent to employee.',
            severity: 'success'
          });
        } catch (error) {
          console.error('Error creating salary slip:', error);
          setNotification({
            open: true,
            message: 'Failed to create salary slip: ' + error.message,
            severity: 'error'
          });
        } finally {
          setLoading(false);
        }
      }
    });
  };
  
  const approveExpense = async (id) => {
    // Open confirmation dialog
    setConfirmDialog({
      open: true,
      title: 'Approve Expense',
      message: 'Are you sure you want to approve this expense?',
      onConfirm: async () => {
        try {
          setLoading(true);
          
          const response = await fetch(`${API_URL}/expense/${id}/approve`, {
            method: 'PUT',
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
          });
          
          if (!response.ok) {
            throw new Error('Failed to approve expense');
          }
          
          const updatedExpense = await response.json();
          
          // Update the expense in the list
          setExpenses(expenses.map(exp => 
            exp.id === id ? updatedExpense : exp
          ));
          
          // Show success notification
          setNotification({
            open: true,
            message: 'Expense approved successfully! Email notification sent.',
            severity: 'success'
          });
        } catch (error) {
          console.error('Error approving expense:', error);
          setNotification({
            open: true,
            message: 'Failed to approve expense: ' + error.message,
            severity: 'error'
          });
        } finally {
          setLoading(false);
        }
      }
    });
  };

  const rejectExpense = async (id) => {
    // Open confirmation dialog
    setConfirmDialog({
      open: true,
      title: 'Reject Expense',
      message: 'Are you sure you want to reject this expense?',
      onConfirm: async () => {
        try {
          setLoading(true);
          
          const response = await fetch(`${API_URL}/expense/${id}/reject`, {
            method: 'PUT',
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
          });
          
          if (!response.ok) {
            throw new Error('Failed to reject expense');
          }
          
          const updatedExpense = await response.json();
          
          // Update the expense in the list
          setExpenses(expenses.map(exp => 
            exp.id === id ? updatedExpense : exp
          ));
          
          // Show success notification
          setNotification({
            open: true,
            message: 'Expense rejected successfully! Email notification sent.',
            severity: 'success'
          });
        } catch (error) {
          console.error('Error rejecting expense:', error);
          setNotification({
            open: true,
            message: 'Failed to reject expense: ' + error.message,
            severity: 'error'
          });
        } finally {
          setLoading(false);
        }
      }
    });
  };

  const handleEditEmployeeDialogOpen = (employee) => {
    // Ensure we have a valid employee object
    if (!employee || !employee.id) {
      console.error('Invalid employee data:', employee);
      setNotification({
        open: true,
        message: 'Cannot edit employee: Invalid data',
        severity: 'error'
      });
      return;
    }
    
    console.log('Opening edit dialog for employee:', employee);
    setEditEmployeeForm({
      id: employee.id,
      name: employee.name,
      email: employee.email,
      department: employee.department || 'Not assigned',
      salary: employee.salary || 0
    });
    setEditEmployeeDialog(true);
  };

  const handleEditEmployeeDialogClose = () => {
    setEditEmployeeDialog(false);
  };

  const handleEditEmployeeFormChange = (e) => {
    const { name, value } = e.target;
    setEditEmployeeForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const updateEmployee = async () => {
    // Open confirmation dialog
    setConfirmDialog({
      open: true,
      title: 'Update Employee',
      message: 'Are you sure you want to update this employee information?',
      onConfirm: async () => {
        try {
          setLoading(true);
          
          console.log('Making API request to:', `${API_URL}/auth/employees/${editEmployeeForm.id}`);
          console.log('Request payload:', {
            department: editEmployeeForm.department,
            salary: Number(editEmployeeForm.salary)
          });
          
          const response = await fetch(`${API_URL}/auth/employees/${editEmployeeForm.id}`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify({
              department: editEmployeeForm.department,
              salary: Number(editEmployeeForm.salary)
            })
          });
          
          if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            const errorMessage = errorData.message || `Failed to update employee (Status: ${response.status})`;
            throw new Error(errorMessage);
          }
          
          const data = await response.json();
          
          // Update employee in the list
          setEmployees(employees.map(emp => 
            emp.id === editEmployeeForm.id ? data.employee : emp
          ));
          
          // Close dialog
          setEditEmployeeDialog(false);
          
          // Show success notification
          setNotification({
            open: true,
            message: 'Employee updated successfully! Email notification sent.',
            severity: 'success'
          });
        } catch (error) {
          console.error('Error updating employee:', error);
          setNotification({
            open: true,
            message: 'Failed to update employee: ' + (error.message || 'Unknown error'),
            severity: 'error'
          });
        } finally {
          setLoading(false);
        }
      }
    });
  };

  // Handle opening the edit salary slip dialog
  const handleEditSalarySlipDialogOpen = (slip) => {
    setEditSalarySlipForm({
      id: slip._id || slip.id,
      employeeId: slip.employeeId,
      employeeName: slip.employeeName,
      month: slip.month,
      year: slip.year,
      basicSalary: slip.basicSalary,
      allowances: slip.allowances,
      deductions: slip.deductions,
      netSalary: slip.netSalary
    });
    setEditSalarySlipDialog(true);
  };

  const handleEditSalarySlipDialogClose = () => {
    setEditSalarySlipDialog(false);
  };

  const handleEditSalarySlipFormChange = (e) => {
    const { name, value } = e.target;
    setEditSalarySlipForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const calculateEditNetSalary = () => {
    const basic = parseFloat(editSalarySlipForm.basicSalary) || 0;
    const allowances = parseFloat(editSalarySlipForm.allowances) || 0;
    const deductions = parseFloat(editSalarySlipForm.deductions) || 0;
    return (basic + allowances - deductions).toFixed(2);
  };

  const updateSalarySlip = async () => {
    // Open confirmation dialog
    setConfirmDialog({
      open: true,
      title: 'Update Salary Slip',
      message: 'Are you sure you want to update this salary slip? An email notification will be sent to the employee if the amounts change.',
      onConfirm: async () => {
        try {
          setLoading(true);
          
          // Calculate net salary if not already set
          const netSalary = editSalarySlipForm.netSalary || calculateEditNetSalary();
          
          const response = await fetch(`${API_URL}/salary-slip/${editSalarySlipForm.id}`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify({
              basicSalary: editSalarySlipForm.basicSalary,
              allowances: editSalarySlipForm.allowances,
              deductions: editSalarySlipForm.deductions,
              netSalary,
              status: 'issued'
            })
          });
          
          if (!response.ok) {
            throw new Error('Failed to update salary slip');
          }
          
          const data = await response.json();
          
          // Update the salary slip in the list
          setSalarySlips(salarySlips.map(slip => 
            slip.id === editSalarySlipForm.id ? data.salarySlip : slip
          ));
          
          // Close dialog
          setEditSalarySlipDialog(false);
          
          // Show success notification
          setNotification({
            open: true,
            message: 'Salary slip updated successfully! Email notification sent if amounts changed.',
            severity: 'success'
          });
        } catch (error) {
          console.error('Error updating salary slip:', error);
          setNotification({
            open: true,
            message: 'Failed to update salary slip: ' + error.message,
            severity: 'error'
          });
        } finally {
          setLoading(false);
        }
      }
    });
  };

  // Add downloadSalarySlip function
  const downloadSalarySlip = async (id) => {
    try {
      setLoading(true);
      
      const response = await fetch(`${API_URL}/salary-slip/${id}/download`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (!response.ok) {
        throw new Error(`Failed to download salary slip: ${response.status} ${response.statusText}`);
      }
      
      // Create a blob from the PDF stream
      const blob = await response.blob();
      
      // Create a download link and trigger the download
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = `salary-slip-${id}.pdf`;
      
      // Append to the document and trigger the download
      document.body.appendChild(a);
      a.click();
      
      // Clean up
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      // Show success notification
      setNotification({
        open: true,
        message: 'Salary slip downloaded successfully',
        severity: 'success'
      });
    } catch (error) {
      console.error('Error downloading salary slip:', error);
      setNotification({
        open: true,
        message: 'Failed to download salary slip: ' + error.message,
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  // Chart data processing functions
  const getDepartmentSalaries = () => {
    if (!employees || employees.length === 0) return { labels: [], datasets: [] };
    
    // Group employees by department
    const departments = {};
    employees.forEach(emp => {
      const dept = emp.department || 'Unassigned';
      if (!departments[dept]) {
        departments[dept] = {
          count: 0,
          totalSalary: 0
        };
      }
      departments[dept].count += 1;
      departments[dept].totalSalary += parseFloat(emp.salary) || 0;
    });
    
    // Calculate average salary by department
    const deptNames = Object.keys(departments);
    const avgSalaries = deptNames.map(dept => 
      departments[dept].totalSalary / departments[dept].count
    );
    
    return {
      labels: deptNames,
      datasets: [
        {
          label: 'Average Salary by Department',
          data: avgSalaries,
          backgroundColor: [
            'rgba(255, 99, 132, 0.6)',
            'rgba(54, 162, 235, 0.6)',
            'rgba(255, 206, 86, 0.6)',
            'rgba(75, 192, 192, 0.6)',
            'rgba(153, 102, 255, 0.6)',
          ],
          borderColor: [
            'rgba(255, 99, 132, 1)',
            'rgba(54, 162, 235, 1)',
            'rgba(255, 206, 86, 1)',
            'rgba(75, 192, 192, 1)',
            'rgba(153, 102, 255, 1)',
          ],
          borderWidth: 1,
        },
      ],
    };
  };
  
  const getSalaryDistribution = () => {
    if (!employees || employees.length === 0) return { labels: [], datasets: [] };
    
    // Define salary ranges
    const ranges = [
      { label: '$0-1000', min: 0, max: 1000 },
      { label: '$1001-2000', min: 1001, max: 2000 },
      { label: '$2001-3000', min: 2001, max: 3000 },
      { label: '$3001-4000', min: 3001, max: 4000 },
      { label: '$4001+', min: 4001, max: Infinity }
    ];
    
    // Count employees in each salary range
    const distribution = ranges.map(range => {
      return employees.filter(emp => {
        const salary = parseFloat(emp.salary) || 0;
        return salary >= range.min && salary <= range.max;
      }).length;
    });
    
    return {
      labels: ranges.map(r => r.label),
      datasets: [
        {
          label: 'Employees',
          data: distribution,
          backgroundColor: 'rgba(54, 162, 235, 0.6)',
          borderColor: 'rgba(54, 162, 235, 1)',
          borderWidth: 1,
        },
      ],
    };
  };
  
  const getMonthlySalaryTotals = () => {
    if (!salarySlips || salarySlips.length === 0) return { labels: [], datasets: [] };
    
    const currentYear = new Date().getFullYear().toString();
    
    // Filter salary slips for current year
    const thisYearSlips = salarySlips.filter(slip => slip.year.toString() === currentYear);
    
    // Define all months
    const months = [
      'January', 'February', 'March', 'April', 'May', 'June', 
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    
    // Calculate total salary paid for each month
    const monthlySalaries = months.map(month => {
      const monthSlips = thisYearSlips.filter(slip => slip.month === month);
      return monthSlips.reduce((sum, slip) => sum + parseFloat(slip.netSalary || 0), 0);
    });
    
    return {
      labels: months,
      datasets: [
        {
          label: `Salary Expenditure (${currentYear})`,
          data: monthlySalaries,
          fill: false,
          borderColor: 'rgb(75, 192, 192)',
          tension: 0.1,
          backgroundColor: 'rgba(75, 192, 192, 0.2)',
        },
      ],
    };
  };
  
  // Add expense chart data processing functions
  const getExpenseStatusDistribution = () => {
    if (!expenses || expenses.length === 0) return { labels: [], datasets: [] };
    
    // Count expenses by status
    const statusCounts = {
      pending: 0,
      approved: 0,
      rejected: 0
    };
    
    expenses.forEach(expense => {
      const status = expense.status?.toLowerCase() || 'pending';
      if (statusCounts.hasOwnProperty(status)) {
        statusCounts[status]++;
      }
    });
    
    return {
      labels: Object.keys(statusCounts).map(s => s.charAt(0).toUpperCase() + s.slice(1)),
      datasets: [
        {
          label: 'Expenses by Status',
          data: Object.values(statusCounts),
          backgroundColor: [
            'rgba(255, 206, 86, 0.6)', // pending - yellow
            'rgba(75, 192, 192, 0.6)', // approved - green
            'rgba(255, 99, 132, 0.6)'  // rejected - red
          ],
          borderColor: [
            'rgba(255, 206, 86, 1)',
            'rgba(75, 192, 192, 1)',
            'rgba(255, 99, 132, 1)'
          ],
          borderWidth: 1,
        },
      ],
    };
  };

  const getExpensesByCategory = () => {
    if (!expenses || expenses.length === 0) return { labels: [], datasets: [] };
    
    // Group expenses by category
    const categories = {};
    expenses.forEach(expense => {
      const category = expense.category || 'Other';
      if (!categories[category]) {
        categories[category] = 0;
      }
      categories[category] += parseFloat(expense.amount) || 0;
    });
    
    return {
      labels: Object.keys(categories),
      datasets: [
        {
          label: 'Expense Amount by Category',
          data: Object.values(categories),
          backgroundColor: [
            'rgba(54, 162, 235, 0.6)',
            'rgba(255, 99, 132, 0.6)',
            'rgba(255, 206, 86, 0.6)',
            'rgba(75, 192, 192, 0.6)',
            'rgba(153, 102, 255, 0.6)',
            'rgba(255, 159, 64, 0.6)'
          ],
          borderWidth: 1,
        },
      ],
    };
  };
  
  const getMonthlyExpenseTrends = () => {
    if (!expenses || expenses.length === 0) return { labels: [], datasets: [] };
    
    const currentYear = new Date().getFullYear().toString();
    
    // Define all months
    const months = [
      'January', 'February', 'March', 'April', 'May', 'June', 
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    
    // Initialize monthly totals
    const monthlyTotals = Array(12).fill(0);
    const approvedTotals = Array(12).fill(0);
    
    // Calculate expenses for each month
    expenses.forEach(expense => {
      try {
        const expenseDate = new Date(expense.date);
        if (!isNaN(expenseDate.getTime()) && expenseDate.getFullYear().toString() === currentYear) {
          const month = expenseDate.getMonth();
          const amount = parseFloat(expense.amount) || 0;
          
          monthlyTotals[month] += amount;
          
          if (expense.status === 'approved') {
            approvedTotals[month] += amount;
          }
        }
      } catch (e) {
        console.error('Error parsing expense date:', e);
      }
    });
    
    return {
      labels: months,
      datasets: [
        {
          label: 'Total Expenses',
          data: monthlyTotals,
          borderColor: 'rgb(255, 99, 132)',
          backgroundColor: 'rgba(255, 99, 132, 0.2)',
          fill: false,
          tension: 0.1
        },
        {
          label: 'Approved Expenses',
          data: approvedTotals,
          borderColor: 'rgb(75, 192, 192)',
          backgroundColor: 'rgba(75, 192, 192, 0.2)',
          fill: false,
          tension: 0.1
        }
      ],
    };
  };

  // Helper to calculate total expenses
  const calculateTotalExpenses = (status = null) => {
    return expenses.reduce((total, expense) => {
      if (status === null || expense.status === status) {
        return total + (parseFloat(expense.amount) || 0);
      }
      return total;
    }, 0).toFixed(2);
  };

  // Drawer content
  const drawerContent = (
    <Box sx={{ width: 250 }} role="presentation">
      <Box sx={{ p: 2 }}>
        <Typography variant="h6" component="div">
          Admin Panel
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {user?.name || 'Admin User'}
        </Typography>
      </Box>
      <Divider />
      <List>
        <ListItem button onClick={() => setTabValue(0)}>
          <ListItemIcon>
            <DashboardIcon />
          </ListItemIcon>
          <ListItemText primary="Dashboard" />
        </ListItem>
        <ListItem button onClick={() => setTabValue(1)}>
          <ListItemIcon>
            <PeopleIcon />
          </ListItemIcon>
          <ListItemText primary="Employees" />
        </ListItem>
        <ListItem button onClick={() => setTabValue(2)}>
          <ListItemIcon>
            <ReceiptIcon />
          </ListItemIcon>
          <ListItemText primary="Salary Slips" />
        </ListItem>
        <ListItem button onClick={() => setTabValue(3)}>
          <ListItemIcon>
            {/* <ReceiptIcon /> */}
            <AccountBalanceWalletIcon />
          </ListItemIcon>
          <ListItemText primary="Expenses" />
        </ListItem>
        <ListItem button onClick={() => setTabValue(4)}>
          <ListItemIcon>
            <BarChartIcon />
          </ListItemIcon>
          <ListItemText primary="Charts" />
        </ListItem>
      </List>
      <Divider />
      <List>
        <ListItem button onClick={handleLogout}>
          <ListItemIcon>
            <LogoutIcon />
          </ListItemIcon>
          <ListItemText primary="Logout" />
        </ListItem>
      </List>
    </Box>
  );

  // Get unique years from salary slips for the filter dropdown
  const getUniqueYears = () => {
    if (!Array.isArray(salarySlips)) return [];
    
    const years = salarySlips.map(slip => slip.year).filter(Boolean);
    return [...new Set(years)].sort((a, b) => b - a); // Sort in descending order
  };
  
  // Reset salary slip filters
  const resetSalarySlipFilters = () => {
    setSalarySlipSearch('');
    setSalarySlipMonthFilter('');
    setSalarySlipYearFilter('');
  };

  // Filtered data functions
  const filteredEmployees = employees.filter(employee => 
    employee.name.toLowerCase().includes(employeeSearch.toLowerCase()) ||
    employee.email.toLowerCase().includes(employeeSearch.toLowerCase()) ||
    (employee.department && employee.department.toLowerCase().includes(employeeSearch.toLowerCase()))
  );

  // Update the filtered salary slips to include month and year filters
  const filteredSalarySlips = Array.isArray(salarySlips) ? salarySlips.filter(slip => {
    // First apply search filter
    const matchesSearch = 
      !salarySlipSearch || 
      (slip.employeeName && slip.employeeName.toLowerCase().includes(salarySlipSearch.toLowerCase())) ||
      (slip.month && slip.month.toLowerCase().includes(salarySlipSearch.toLowerCase())) ||
      (slip.year && slip.year.toString().includes(salarySlipSearch));
    
    // Then apply month filter if set
    const matchesMonth = 
      !salarySlipMonthFilter || 
      (slip.month === salarySlipMonthFilter);
    
    // Then apply year filter if set
    const matchesYear = 
      !salarySlipYearFilter || 
      (slip.year && slip.year.toString() === salarySlipYearFilter);
    
    // Return true only if all conditions are met
    return matchesSearch && matchesMonth && matchesYear;
  }) : [];

  const filteredExpenses = Array.isArray(expenses) ? expenses.filter(expense => 
    (expense.employeeName && expense.employeeName.toLowerCase().includes(expenseSearch.toLowerCase())) ||
    (expense.title && expense.title.toLowerCase().includes(expenseSearch.toLowerCase())) ||
    (expense.category && expense.category.toLowerCase().includes(expenseSearch.toLowerCase())) ||
    (expense.status && expense.status.toLowerCase().includes(expenseSearch.toLowerCase())) ||
    (expense.date && expense.date.includes(expenseSearch))
  ) : [];

  // Add a helper function to format dates
  const formatDate = (dateString) => {
    if (!dateString) return '';
    
    // Try parsing the date string to ensure it's valid
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString; // Return original if invalid
    
    // Format as DD/MM/YYYY
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0'); // Months are 0-indexed
    const year = date.getFullYear();
    
    return `${day}/${month}/${year}`;
  };
  
  const handleCloseNotification = () => {
    setNotification({
      ...notification,
      open: false
    });
  };

  const handleConfirmDialogClose = () => {
    setConfirmDialog({
      ...confirmDialog,
      open: false
    });
  };

  const handleConfirmAction = () => {
    if (confirmDialog.onConfirm) {
      confirmDialog.onConfirm();
    }
    handleConfirmDialogClose();
  };

  return (
    <Box sx={{ display: 'flex' }}>
      <AppBar position="fixed">
        <Toolbar>
          <IconButton
            color="inherit"
            edge="start"
            onClick={() => setDrawerOpen(true)}
            sx={{ mr: 2 }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Payroll Management System
          </Typography>
          <Button color="inherit" onClick={handleLogout}>
            Logout
          </Button>
        </Toolbar>
      </AppBar>
      
      <Drawer
        anchor="left"
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
      >
        {drawerContent}
      </Drawer>
      
      <Box
        component="main"
        sx={{ 
          flexGrow: 1, 
          p: 3, 
          width: '100%',
          mt: 8,
          bgcolor: 'background.default',
          minHeight: '100vh'
        }}
      >
        <Tabs 
          value={tabValue} 
          onChange={handleTabChange}
          variant="scrollable"
          scrollButtons="auto"
          sx={{ mb: 3, borderBottom: 1, borderColor: 'divider' }}
        >
          <Tab label="Dashboard" />
          <Tab label="Employees" />
          <Tab label="Salary Slips" />
          <Tab label="Expenses" />
          <Tab label="Charts" />
        </Tabs>
        
        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
            {error}
          </Alert>
        )}
        
        {/* Dashboard Tab */}
        <TabPanel value={tabValue} index={0}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={4}>
              <Card>
                <CardContent>
                  <Typography color="textSecondary" gutterBottom>
                    Total Employees
                  </Typography>
                  <Typography variant="h3">
                    {employees.length}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={4}>
              <Card>
                <CardContent>
                  <Typography color="textSecondary" gutterBottom>
                    Salary Slips (Current Month)
                  </Typography>
                  <Typography variant="h3">
                    {salarySlips.length}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={4}>
              <Card>
                <CardContent>
                  <Typography color="textSecondary" gutterBottom>
                    Pending Expenses
                  </Typography>
                  <Typography variant="h3">
                    {Array.isArray(expenses) ? expenses.filter(e => e.status === 'pending').length : 0}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </TabPanel>
        
        {/* Employees Tab */}
        <TabPanel value={tabValue} index={1}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
            <Typography variant="h5">Employee List</Typography>
          </Box>
          
          {/* Add search field */}
          <TextField
            fullWidth
            variant="outlined"
            placeholder="Search employees..."
            value={employeeSearch}
            onChange={(e) => setEmployeeSearch(e.target.value)}
            sx={{ mb: 2 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
          />
          
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Name</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell>Department</TableCell>
                  <TableCell>Salary</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredEmployees.map(employee => (
                  <TableRow key={employee.id}>
                    <TableCell>{employee.name}</TableCell>
                    <TableCell>{employee.email}</TableCell>
                    <TableCell>{employee.department}</TableCell>
                    <TableCell>${employee.salary}</TableCell>
                    <TableCell>
                      <IconButton size="small" onClick={() => handleEditEmployeeDialogOpen(employee)}>
                        <EditIcon fontSize="small" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
                {filteredEmployees.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} align="center">
                      No employees found matching your search
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </TabPanel>
        
        {/* Salary Slips Tab */}
        <TabPanel value={tabValue} index={2}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
            <Typography variant="h5">Salary Slips</Typography>
            <Button 
              variant="contained" 
              startIcon={<AddIcon />}
              onClick={handleDialogOpen}
            >
              Create New
            </Button>
          </Box>
          
          {/* Search and filter controls */}
          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid item xs={12} md={5}>
              <TextField
                fullWidth
                variant="outlined"
                placeholder="Search salary slips by employee, month, or year..."
                value={salarySlipSearch}
                onChange={(e) => setSalarySlipSearch(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={6} md={2}>
              <TextField
                select
                fullWidth
                label="Month"
                value={salarySlipMonthFilter}
                onChange={(e) => setSalarySlipMonthFilter(e.target.value)}
                variant="outlined"
              >
                <MenuItem value="">All Months</MenuItem>
                {['January', 'February', 'March', 'April', 'May', 'June', 
                  'July', 'August', 'September', 'October', 'November', 'December'].map(month => (
                  <MenuItem key={month} value={month}>
                    {month}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={6} md={2}>
              <TextField
                select
                fullWidth
                label="Year"
                value={salarySlipYearFilter}
                onChange={(e) => setSalarySlipYearFilter(e.target.value)}
                variant="outlined"
              >
                <MenuItem value="">All Years</MenuItem>
                {getUniqueYears().map(year => (
                  <MenuItem key={year} value={year.toString()}>
                    {year}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12} md={3} sx={{ display: 'flex', alignItems: 'center' }}>
              <Button 
                variant="outlined" 
                onClick={resetSalarySlipFilters}
                sx={{ ml: { md: 2 } }}
                fullWidth
              >
                Reset Filters
              </Button>
            </Grid>
          </Grid>
          
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
              <CircularProgress />
            </Box>
          ) : (
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Employee</TableCell>
                    <TableCell>Month/Year</TableCell>
                    <TableCell>Basic Salary</TableCell>
                    <TableCell>Allowances</TableCell>
                    <TableCell>Deductions</TableCell>
                    <TableCell>Net Salary</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredSalarySlips.length > 0 ? (
                    filteredSalarySlips.map(slip => (
                      <TableRow key={slip._id || slip.id}>
                        <TableCell>{slip.employeeName}</TableCell>
                        <TableCell>{`${slip.month}/${slip.year}`}</TableCell>
                        <TableCell>${slip.basicSalary}</TableCell>
                        <TableCell>${slip.allowances}</TableCell>
                        <TableCell>${slip.deductions}</TableCell>
                        <TableCell>${slip.netSalary}</TableCell>
                        <TableCell>
                          <IconButton size="small" onClick={() => handleEditSalarySlipDialogOpen(slip)}>
                            <EditIcon fontSize="small" />
                          </IconButton>
                          <IconButton 
                            size="small" 
                            color="primary"
                            onClick={() => downloadSalarySlip(slip._id || slip.id)}
                            sx={{ ml: 1 }}
                          >
                            <DownloadIcon fontSize="small" />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={7} align="center">
                        {salarySlipSearch ? 'No salary slips found matching your search' : 'No salary slips found'}
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </TabPanel>
        
        {/* Expenses Tab */}
        <TabPanel value={tabValue} index={3}>
          <Typography variant="h5" sx={{ mb: 2 }}>
            Expense Approvals
          </Typography>
          
          {/* Add search field */}
          <TextField
            fullWidth
            variant="outlined"
            placeholder="Search expenses by employee, title, status..."
            value={expenseSearch}
            onChange={(e) => setExpenseSearch(e.target.value)}
            sx={{ mb: 2 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
          />
          
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Employee</TableCell>
                  <TableCell>Title</TableCell>
                  <TableCell>Amount</TableCell>
                  <TableCell>Date</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredExpenses.length > 0 ? (
                  filteredExpenses.map(expense => (
                    <TableRow key={expense.id}>
                      <TableCell>{expense.employeeName}</TableCell>
                      <TableCell>{expense.title}</TableCell>
                      <TableCell>${expense.amount}</TableCell>
                      <TableCell>{formatDate(expense.date)}</TableCell>
                      <TableCell>
                        <Box sx={{
                          display: 'inline-block',
                          px: 1,
                          py: 0.5,
                          borderRadius: 1,
                          bgcolor: 
                            expense.status === 'approved' ? 'success.light' :
                            expense.status === 'rejected' ? 'error.light' : 
                            'warning.light',
                          color: 'white'
                        }}>
                          {expense.status}
                        </Box>
                      </TableCell>
                      <TableCell>
                        {expense.status === 'pending' && (
                          <>
                            <Button 
                              size="small" 
                              color="success" 
                              onClick={() => approveExpense(expense.id)}
                              sx={{ mr: 1 }}
                            >
                              Approve
                            </Button>
                            <Button 
                              size="small" 
                              color="error" 
                              onClick={() => rejectExpense(expense.id)}
                            >
                              Reject
                            </Button>
                          </>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} align="center">
                      {expenseSearch ? 'No expenses found matching your search' : 'No expenses found'}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </TabPanel>
        
        {/* Charts Tab */}
        <TabPanel value={tabValue} index={4}>
          <Typography variant="h5" gutterBottom>
            Salary Analytics
          </Typography>
          
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
              <CircularProgress />
            </Box>
          ) : (
            <>
              <Grid container spacing={3}>
                {/* Department Salary Chart */}
                <Grid item xs={12} md={6}>
                  <Paper sx={{ p: 3 }}>
                    <Typography variant="h6" gutterBottom>
                      Average Salary by Department
                    </Typography>
                    <Box sx={{ height: 300 }}>
                      <Bar 
                        data={getDepartmentSalaries()}
                        options={{
                          responsive: true,
                          maintainAspectRatio: false,
                          plugins: {
                            legend: {
                              position: 'top',
                            },
                            title: {
                              display: false,
                            },
                          },
                        }}
                      />
                    </Box>
                  </Paper>
                </Grid>
                
                {/* Salary Distribution Chart */}
                <Grid item xs={12} md={6}>
                  <Paper sx={{ p: 3 }}>
                    <Typography variant="h6" gutterBottom>
                      Salary Distribution
                    </Typography>
                    <Box sx={{ height: 300, display: 'flex', justifyContent: 'center' }}>
                      <Pie 
                        data={getSalaryDistribution()}
                        options={{
                          responsive: true,
                          maintainAspectRatio: false,
                          plugins: {
                            legend: {
                              position: 'right',
                            },
                            title: {
                              display: false,
                            },
                          },
                        }}
                      />
                    </Box>
                  </Paper>
                </Grid>
                
                {/* Monthly Salary Expenses Chart */}
                <Grid item xs={12}>
                  <Paper sx={{ p: 3 }}>
                    <Typography variant="h6" gutterBottom>
                      Monthly Salary Expenditure
                    </Typography>
                    <Box sx={{ height: 300 }}>
                      <Line 
                        data={getMonthlySalaryTotals()}
                        options={{
                          responsive: true,
                          maintainAspectRatio: false,
                          plugins: {
                            legend: {
                              position: 'top',
                            },
                            title: {
                              display: false,
                            },
                          },
                          scales: {
                            y: {
                              beginAtZero: true,
                              title: {
                                display: true,
                                text: 'Amount ($)'
                            }
                          }
                        }
                      }}
                    />
                  </Box>
                </Paper>
              </Grid>
              
              {/* Monthly Expenses Expenditure Chart */}
              {/* <Grid item xs={12}>
                <Paper sx={{ p: 3 }}>
                  <Typography variant="h6" gutterBottom>
                    Monthly Expenses Expenditure
                  </Typography>
                  <Box sx={{ height: 300 }}>
                    <Line 
                      data={getMonthlyExpenseTrends()}
                      options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                          legend: {
                            position: 'top',
                          },
                          title: {
                            display: false,
                          },
                        },
                        scales: {
                          y: {
                            beginAtZero: true,
                            title: {
                              display: true,
                              text: 'Amount ($)'
                            }
                          }
                        }
                      }}
                    />
                  </Box>
                </Paper>
              </Grid> */}
              
              {/* Summary Stats */}
              <Grid item xs={12} md={4}>
                <Card>
                  <CardContent>
                    <Typography color="textSecondary" gutterBottom>
                      Average Salary
                    </Typography>
                    <Typography variant="h4">
                      ${employees.length > 0 
                        ? (employees.reduce((sum, emp) => sum + (parseFloat(emp.salary) || 0), 0) / employees.length).toFixed(2) 
                        : '0.00'}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              
              <Grid item xs={12} md={4}>
                <Card>
                  <CardContent>
                    <Typography color="textSecondary" gutterBottom>
                      Highest Salary
                    </Typography>
                    <Typography variant="h4">
                      ${employees.length > 0 
                        ? Math.max(...employees.map(emp => parseFloat(emp.salary) || 0)).toFixed(2) 
                        : '0.00'}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              
              <Grid item xs={12} md={4}>
                <Card>
                  <CardContent>
                    <Typography color="textSecondary" gutterBottom>
                      Total Monthly Payroll
                    </Typography>
                    <Typography variant="h4">
                      ${employees.reduce((sum, emp) => sum + (parseFloat(emp.salary) || 0), 0).toFixed(2)}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
            
            {/* Expense Analytics Section */}
            <Typography variant="h5" gutterBottom sx={{ mt: 5 }}>
              Expense Analytics
            </Typography>
            
            <Grid container spacing={3}>
              {/* Expense Status Distribution Chart */}
              <Grid item xs={12} md={6}>
                <Paper sx={{ p: 3 }}>
                  <Typography variant="h6" gutterBottom>
                    Expense Status Distribution
                  </Typography>
                  <Box sx={{ height: 300, display: 'flex', justifyContent: 'center' }}>
                    <Pie 
                      data={getExpenseStatusDistribution()}
                      options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                          legend: {
                            position: 'right',
                          },
                          title: {
                            display: false,
                          },
                        },
                      }}
                    />
                  </Box>
                </Paper>
              </Grid>
              
              {/* Expense Category Chart */}
              <Grid item xs={12} md={6}>
                <Paper sx={{ p: 3 }}>
                  <Typography variant="h6" gutterBottom>
                    Expenses by Category
                  </Typography>
                  <Box sx={{ height: 300 }}>
                    <Bar 
                      data={getExpensesByCategory()}
                      options={{
                        // responsive:
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                          legend: {
                            position: 'top',
                          },
                          title: {
                            display: false,
                          },
                        },
                        scales: {
                          y: {
                            beginAtZero: true,
                            title: {
                              display: true,
                              text: 'Amount ($)'
                            }
                          }
                        }
                      }}
                    />
                  </Box>
                </Paper>
              </Grid>

              {/* Monthly Expenses Expenditure Chart */}
              <Grid item xs={12}>
                <Paper sx={{ p: 3 }}>
                  <Typography variant="h6" gutterBottom>
                    Monthly Expenses Expenditure
                  </Typography>
                  <Box sx={{ height: 300 }}>
                    <Line 
                      data={getMonthlyExpenseTrends()}
                      options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                          legend: {
                            position: 'top',
                          },
                          title: {
                            display: false,
                          },
                        },
                        scales: {
                          y: {
                            beginAtZero: true,
                            title: {
                              display: true,
                              text: 'Amount ($)'
                            }
                          }
                        }
                      }}
                    />
                  </Box>
                </Paper>
              </Grid>
              
              {/* Expense Summary Stats */}
              <Grid item xs={12} md={4}>
                <Card>
                  <CardContent>
                    <Typography color="textSecondary" gutterBottom>
                      Total Expenses
                    </Typography>
                    <Typography variant="h4">
                      ${calculateTotalExpenses()}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              
              <Grid item xs={12} md={4}>
                <Card>
                  <CardContent>
                    <Typography color="textSecondary" gutterBottom>
                      Approved Expenses
                    </Typography>
                    <Typography variant="h4">
                      ${calculateTotalExpenses('approved')}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              
              <Grid item xs={12} md={4}>
                <Card>
                  <CardContent>
                    <Typography color="textSecondary" gutterBottom>
                      Pending Approval
                    </Typography>
                    <Typography variant="h4">
                      ${calculateTotalExpenses('pending')}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
              </>
          )}
        </TabPanel>
        
        {/* Edit Employee Dialog */}
        <Dialog open={editEmployeeDialog} onClose={handleEditEmployeeDialogClose}>
          <DialogTitle>Edit Employee</DialogTitle>
          <DialogContent>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12}>
                <TextField
                  label="Name"
                  value={editEmployeeForm.name}
                  fullWidth
                  disabled
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  label="Email"
                  value={editEmployeeForm.email}
                  fullWidth
                  disabled
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  label="Department"
                  name="department"
                  value={editEmployeeForm.department}
                  onChange={handleEditEmployeeFormChange}
                  fullWidth
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  label="Salary"
                  name="salary"
                  type="number"
                  value={editEmployeeForm.salary}
                  onChange={handleEditEmployeeFormChange}
                  fullWidth
                  InputProps={{
                    startAdornment: '$'
                  }}
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleEditEmployeeDialogClose}>Cancel</Button>
            <Button 
              onClick={updateEmployee} 
              variant="contained" 
              disabled={loading}
            >
              {loading ? <CircularProgress size={24} /> : 'Update'}
            </Button>
          </DialogActions>
        </Dialog>
        
        {/* Create Salary Slip Dialog */}
        <Dialog open={dialogOpen} onClose={handleDialogClose} maxWidth="md" fullWidth>
          <DialogTitle>Create New Salary Slip</DialogTitle>
          <DialogContent>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12} md={6}>
                <TextField
                  select
                  label="Employee"
                  name="employeeId"
                  value={salarySlipForm.employeeId}
                  onChange={handleFormChange}
                  fullWidth
                  required
                >
                  {employees.map(employee => (
                    <MenuItem key={employee.id} value={employee.id}>
                      {employee.name} - {employee.department} 
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid item xs={12} md={3}>
                <TextField
                  select
                  label="Month"
                  name="month"
                  value={salarySlipForm.month}
                  onChange={handleFormChange}
                  fullWidth
                  required
                >
                  {['January', 'February', 'March', 'April', 'May', 'June', 
                    'July', 'August', 'September', 'October', 'November', 'December'].map(month => (
                    <MenuItem key={month} value={month}>
                      {month}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid item xs={12} md={3}>
                <TextField
                  label="Year"
                  name="year"
                  type="number"
                  value={salarySlipForm.year}
                  onChange={handleFormChange}
                  fullWidth
                  required
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  label="Basic Salary"
                  name="basicSalary"
                  type="number"
                  value={salarySlipForm.basicSalary}
                  onChange={handleFormChange}
                  fullWidth
                  required
                  InputProps={{
                    startAdornment: '$'
                  }}
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  label="Allowances"
                  name="allowances"
                  type="number"
                  value={salarySlipForm.allowances}
                  onChange={handleFormChange}
                  fullWidth
                  InputProps={{
                    startAdornment: '$'
                  }}
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  label="Deductions"
                  name="deductions"
                  type="number"
                  value={salarySlipForm.deductions}
                  onChange={handleFormChange}
                  fullWidth
                  InputProps={{
                    startAdornment: '$'
                  }}
                />
              </Grid>
              <Grid item xs={12}>
                <Paper sx={{ p: 2, bgcolor: 'background.default' }}>
                  <Typography variant="subtitle1">
                    Net Salary: ${calculateNetSalary()}
                  </Typography>
                </Paper>
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleDialogClose}>Cancel</Button>
            <Button 
              onClick={createSalarySlip} 
              variant="contained" 
              disabled={loading || !salarySlipForm.employeeId || !salarySlipForm.month || !salarySlipForm.basicSalary}
            >
              {loading ? <CircularProgress size={24} /> : 'Create'}
            </Button>
          </DialogActions>
        </Dialog>
        
        {/* Edit Salary Slip Dialog */}
        <Dialog open={editSalarySlipDialog} onClose={handleEditSalarySlipDialogClose} maxWidth="md" fullWidth>
          <DialogTitle>Edit Salary Slip</DialogTitle>
          <DialogContent>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12} md={6}>
                <TextField
                  label="Employee"
                  value={editSalarySlipForm.employeeName}
                  fullWidth
                  disabled
                />
              </Grid>
              <Grid item xs={12} md={3}>
                <TextField
                  select
                  label="Month"
                  name="month"
                  value={editSalarySlipForm.month}
                  onChange={handleEditSalarySlipFormChange}
                  fullWidth
                  required
                >
                  {['January', 'February', 'March', 'April', 'May', 'June', 
                    'July', 'August', 'September', 'October', 'November', 'December'].map(month => (
                    <MenuItem key={month} value={month}>
                      {month}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid item xs={12} md={3}>
                <TextField
                  label="Year"
                  name="year"
                  type="number"
                  value={editSalarySlipForm.year}
                  onChange={handleEditSalarySlipFormChange}
                  fullWidth
                  required
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  label="Basic Salary"
                  name="basicSalary"
                  type="number"
                  value={editSalarySlipForm.basicSalary}
                  onChange={handleEditSalarySlipFormChange}
                  fullWidth
                  required
                  InputProps={{
                    startAdornment: '$'
                  }}
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  label="Allowances"
                  name="allowances"
                  type="number"
                  value={editSalarySlipForm.allowances}
                  onChange={handleEditSalarySlipFormChange}
                  fullWidth
                  InputProps={{
                    startAdornment: '$'
                  }}
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  label="Deductions"
                  name="deductions"
                  type="number"
                  value={editSalarySlipForm.deductions}
                  onChange={handleEditSalarySlipFormChange}
                  fullWidth
                  InputProps={{
                    startAdornment: '$'
                  }}
                />
              </Grid>
              <Grid item xs={12}>
                <Paper sx={{ p: 2, bgcolor: 'background.default' }}>
                  <Typography variant="subtitle1">
                    Net Salary: ${calculateEditNetSalary()}
                  </Typography>
                </Paper>
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleEditSalarySlipDialogClose}>Cancel</Button>
            <Button 
              onClick={updateSalarySlip} 
              variant="contained" 
              disabled={loading}
            >
              {loading ? <CircularProgress size={24} /> : 'Update'}
            </Button>
          </DialogActions>
        </Dialog>
        
        {/* Confirmation Dialog */}
        <Dialog
          open={confirmDialog.open}
          onClose={handleConfirmDialogClose}
        >
          <DialogTitle>{confirmDialog.title}</DialogTitle>
          <DialogContent>
            <DialogContentText>
              {confirmDialog.message}
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleConfirmDialogClose}>Cancel</Button>
            <Button onClick={handleConfirmAction} variant="contained" color="primary">
              Confirm
            </Button>
          </DialogActions>
        </Dialog>
        
        {/* Notification Snackbar */}
        <Snackbar
          open={notification.open}
          autoHideDuration={6000}
          onClose={handleCloseNotification}
          anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        >
          <Alert onClose={handleCloseNotification} severity={notification.severity} sx={{ width: '100%' }}>
            {notification.message}
          </Alert>
        </Snackbar>
      </Box>
    </Box>
  );
};

export default AdminDashboard;

