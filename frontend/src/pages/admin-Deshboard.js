import React, { useState, useEffect } from 'react';
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
  DialogTitle,
  TextField,
  MenuItem,
  Tab,
  Tabs,
  CircularProgress,
  Alert
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import DashboardIcon from '@mui/icons-material/Dashboard';
import PeopleIcon from '@mui/icons-material/People';
import ReceiptIcon from '@mui/icons-material/Receipt';
import LogoutIcon from '@mui/icons-material/Logout';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DownloadIcon from '@mui/icons-material/Download';

const API_URL = 'http://localhost:5001/api';

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
    setLoading(true);
    setError('');
    
    try {
      const netSalary = calculateNetSalary();
      
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
      
      // Close the dialog first to improve UX
      setDialogOpen(false);
      
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
      
      // Refresh salary slips data after creation
      await fetchSalarySlips();
      
      // Show success message
      setError('');
    } catch (error) {
      setError('Failed to create salary slip: ' + error.message);
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const approveExpense = async (id) => {
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
      
      // Refresh expenses data after approval
      await fetchExpenses();
      
      // Show success message
      setError('');
    } catch (error) {
      setError('Failed to approve expense');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const rejectExpense = async (id) => {
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
      
      // Refresh expenses data after rejection
      await fetchExpenses();
      
      // Show success message
      setError('');
    } catch (error) {
      setError('Failed to reject expense');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleEditEmployeeDialogOpen = (employee) => {
    setEditEmployeeForm({
      id: employee.id,
      name: employee.name,
      email: employee.email,
      department: employee.department || '',
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
    setLoading(true);
    setError('');
    
    try {
      const response = await fetch(`${API_URL}/auth/employees/${editEmployeeForm.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          department: editEmployeeForm.department,
          salary: parseFloat(editEmployeeForm.salary)
        })
      });
      
      if (!response.ok) {
        throw new Error('Failed to update employee');
      }
      
      // Close the dialog first to improve UX
      setEditEmployeeDialog(false);
      
      // Refresh all data after update
      await fetchEmployees();
      
      // Show success message
      setError('');
    } catch (error) {
      setError('Failed to update employee: ' + error.message);
      console.error(error);
    } finally {
      setLoading(false);
    }
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
    setLoading(true);
    setError('');
    
    try {
      const netSalary = calculateEditNetSalary();
      
      const response = await fetch(`${API_URL}/salary-slip/${editSalarySlipForm.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          ...editSalarySlipForm,
          netSalary
        })
      });
      
      if (!response.ok) {
        throw new Error('Failed to update salary slip');
      }
      
      // Close the dialog first to improve UX
      setEditSalarySlipDialog(false);
      
      // Refresh salary slips data after update
      await fetchSalarySlips();
      
      // Show success message
      setError('');
    } catch (error) {
      setError('Failed to update salary slip: ' + error.message);
      console.error(error);
    } finally {
      setLoading(false);
    }
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
      
      setError('');
    } catch (error) {
      console.error('Error downloading salary slip:', error);
      setError('Failed to download salary slip: ' + error.message);
    } finally {
      setLoading(false);
    }
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
            <ReceiptIcon />
          </ListItemIcon>
          <ListItemText primary="Expenses" />
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
                {employees.map(employee => (
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
                  {Array.isArray(salarySlips) && salarySlips.length > 0 ? (
                    salarySlips.map(slip => (
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
                        No salary slips found
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
                {Array.isArray(expenses) && expenses.map(expense => (
                  <TableRow key={expense.id}>
                    <TableCell>{expense.employeeName}</TableCell>
                    <TableCell>{expense.title}</TableCell>
                    <TableCell>${expense.amount}</TableCell>
                    <TableCell>{expense.date}</TableCell>
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
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </TabPanel>
      </Box>
      
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
    </Box>
  );
};

export default AdminDashboard;

