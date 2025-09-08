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
  InputAdornment
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import DashboardIcon from '@mui/icons-material/Dashboard';
import ReceiptIcon from '@mui/icons-material/Receipt';
import LogoutIcon from '@mui/icons-material/Logout';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import AddIcon from '@mui/icons-material/Add';
import DownloadIcon from '@mui/icons-material/Download';
import SearchIcon from '@mui/icons-material/Search';

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

const EmployeeDashboard = () => {
  const { user, logout } = useAuth();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [tabValue, setTabValue] = useState(0);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [salarySlips, setSalarySlips] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [employeeProfile, setEmployeeProfile] = useState({
    salary: 0,
    department: 'Not assigned'
  });
  // Add search state variables
  const [salarySlipSearch, setSalarySlipSearch] = useState('');
  const [expenseSearch, setExpenseSearch] = useState('');
  // Add missing expenseForm state
  const [expenseForm, setExpenseForm] = useState({
    title: '',
    amount: '',
    date: new Date().toISOString().split('T')[0],
    category: '',
    description: ''
  });

  // Use useCallback to memoize fetch functions
  const fetchSalarySlips = useCallback(async () => {
    try {
      setLoading(true);
      // console.log('User object:', user); // Debug log to see user structure
      
      // First check if user ID exists - use uid instead of id
      if (!user?.uid) {
        console.error('Cannot fetch salary slips: User ID is missing');
        setSalarySlips([]);
        return;
      }
      
      const response = await fetch(`${API_URL}/salary-slip/employee/${user.uid}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (!response.ok) {
        throw new Error(`Failed to fetch salary slips: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      // console.log('Salary slip API response:', data);
      
      // Handle the response properly
      if (Array.isArray(data)) {
        // console.log('Setting salary slips array from API:', data);
        setSalarySlips(data);
      } else if (data && data.salarySlips && Array.isArray(data.salarySlips)) {
        // console.log('Setting salary slips from nested property:', data.salarySlips);
        setSalarySlips(data.salarySlips);
      } else {
        console.error('Unexpected API response format:', data);
        setSalarySlips([]);
      }
    } catch (error) {
      console.error('Error fetching salary slips:', error);
      setError('Failed to load salary slips: ' + error.message);
      setSalarySlips([]);
    } finally {
      setLoading(false);
    }
  }, [user]);  // Change dependency from user?.id to user

  const fetchExpenses = useCallback(async () => {
    try {
      setLoading(true);
      
      // Use uid instead of id
      if (!user?.uid) {
        console.error('Cannot fetch expenses: User ID is missing');
        setExpenses([]);
        return;
      }
      
      const response = await fetch(`${API_URL}/expense/employee/${user.uid}`, {
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
      console.error('Error fetching expenses:', error);
      setError('Failed to load expenses');
    } finally {
      setLoading(false);
    }
  }, [user]);  // Change dependency from user?.id to user

  // Add fetchEmployeeProfile with useCallback
  const fetchEmployeeProfile = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/auth/me`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch profile');
      }
      
      const data = await response.json();
      
      if (data && data.success) {
        // Get department and salary directly from user data
        setEmployeeProfile({
          salary: data.user.salary || 0,
          department: data.user.department || 'Not assigned'
        });
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      setError('Failed to load profile information');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // Fetch data
    fetchSalarySlips();
    fetchExpenses();
    fetchEmployeeProfile();
  }, [fetchSalarySlips, fetchExpenses, fetchEmployeeProfile]); // Add dependencies

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
    setExpenseForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const submitExpense = async () => {
    setLoading(true);
    setError('');
    
    try {
      const response = await fetch(`${API_URL}/expense`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          ...expenseForm,
          employeeId: user?.uid  // Use uid instead of id
        })
      });
      
      if (!response.ok) {
        throw new Error('Failed to submit expense');
      }
      
      const newExpense = await response.json();
      setExpenses(prev => [...prev, newExpense]);
      setDialogOpen(false);
      setExpenseForm({
        title: '',
        amount: '',
        date: new Date().toISOString().split('T')[0],
        category: '',
        description: ''
      });
    } catch (error) {
      setError('Failed to submit expense: ' + error.message);
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const downloadSalarySlip = async (id) => {
    try {
      setLoading(true);
      console.log('Downloading salary slip:', id);
      
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

  // Find the latest salary slip for dashboard display
  const getLatestSalarySlip = () => {
    if (!Array.isArray(salarySlips) || salarySlips.length === 0) {
      return null;
    }
    
    // Sort by year and month (convert month to number for sorting)
    const monthToNumber = {
      'January': 1, 'February': 2, 'March': 3, 'April': 4, 'May': 5, 'June': 6,
      'July': 7, 'August': 8, 'September': 9, 'October': 10, 'November': 11, 'December': 12
    };
    
    return [...salarySlips].sort((a, b) => {
      // Sort by year first
      if (a.year !== b.year) {
        return b.year - a.year;
      }
      // If same year, sort by month
      return monthToNumber[b.month] - monthToNumber[a.month];
    })[0];
  };

  const latestSalarySlip = getLatestSalarySlip();
  
  // Drawer content
  const drawerContent = (
    <Box sx={{ width: 250 }} role="presentation">
      <Box sx={{ p: 2 }}>
        <Typography variant="h6" component="div">
          Employee Portal
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {user?.name || 'Employee User'}
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
            <ReceiptIcon />
          </ListItemIcon>
          <ListItemText primary="Salary Slips" />
        </ListItem>
        <ListItem button onClick={() => setTabValue(2)}>
          <ListItemIcon>
            <AccountBalanceWalletIcon />
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

  // Filtered data functions
  const filteredSalarySlips = Array.isArray(salarySlips) ? salarySlips.filter(slip => 
    (slip.month && slip.month.toLowerCase().includes(salarySlipSearch.toLowerCase())) ||
    (slip.year && slip.year.toString().includes(salarySlipSearch)) ||
    (slip.netSalary && slip.netSalary.toString().includes(salarySlipSearch))
  ) : [];

  const filteredExpenses = Array.isArray(expenses) ? expenses.filter(expense => 
    (expense.title && expense.title.toLowerCase().includes(expenseSearch.toLowerCase())) ||
    (expense.category && expense.category.toLowerCase().includes(expenseSearch.toLowerCase())) ||
    (expense.amount && expense.amount.toString().includes(expenseSearch)) ||
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
          <Tab label="Salary Slips" />
          <Tab label="Expenses" />
        </Tabs>
        
        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
            {error}
          </Alert>
        )}
        
        {/* Salary Slips Tab */}
        <TabPanel value={tabValue} index={1}>
          <Typography variant="h5" gutterBottom>
            Your Salary History
          </Typography>
          
          {/* Add search field */}
          <TextField
            fullWidth
            variant="outlined"
            placeholder="Search by month, year, or amount..."
            value={salarySlipSearch}
            onChange={(e) => setSalarySlipSearch(e.target.value)}
            sx={{ mb: 2 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
          />
          
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
              <CircularProgress />
            </Box>
          ) : (
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Month/Year</TableCell>
                    <TableCell>Basic Salary</TableCell>
                    <TableCell>Allowances</TableCell>
                    <TableCell>Deductions</TableCell>
                    <TableCell>Net Salary</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredSalarySlips.length > 0 ? (
                    filteredSalarySlips.map(slip => (
                      <TableRow key={slip._id || slip.id}>
                        <TableCell>{`${slip.month}/${slip.year}`}</TableCell>
                        <TableCell>${slip.basicSalary}</TableCell>
                        <TableCell>${slip.allowances}</TableCell>
                        <TableCell>${slip.deductions}</TableCell>
                        <TableCell>${slip.netSalary}</TableCell>
                        <TableCell>
                          <Box sx={{
                            display: 'inline-block',
                            px: 1,
                            py: 0.5,
                            borderRadius: 1,
                            bgcolor: 'success.light',
                            color: 'white'
                          }}>
                            {slip.status || 'Processed'}
                          </Box>
                        </TableCell>
                        <TableCell>
                          <IconButton 
                            size="small" 
                            color="primary"
                            onClick={() => downloadSalarySlip(slip._id || slip.id)}
                          >
                            <DownloadIcon />
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
        
        {/* Dashboard Tab */}
        <TabPanel value={tabValue} index={0}>
          <Typography variant="h4" gutterBottom>
            Welcome, {user?.name || 'Employee'}
          </Typography>
          
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography color="textSecondary" gutterBottom>
                    Employee Information
                  </Typography>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography variant="h6">Department:</Typography>
                    <Typography variant="h6" color="primary">
                      {employeeProfile.department}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="h6">Current Salary:</Typography>
                    <Typography variant="h6" color="primary">
                      ${employeeProfile.salary}
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            
            {latestSalarySlip && (
              <Grid item xs={12} md={6}>
                <Card>
                  <CardContent>
                    <Typography color="textSecondary" gutterBottom>
                      Latest Salary Slip
                    </Typography>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body1">Period:</Typography>
                      <Typography variant="body1" fontWeight="medium">
                        {latestSalarySlip.month} {latestSalarySlip.year}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body1">Basic:</Typography>
                      <Typography variant="body1" fontWeight="medium">
                        ${latestSalarySlip.basicSalary}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body1">Net Salary:</Typography>
                      <Typography variant="body1" fontWeight="medium" color="primary.main">
                        ${latestSalarySlip.netSalary}
                      </Typography>
                    </Box>
                    <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
                      <Button 
                        variant="outlined" 
                        size="small"
                        startIcon={<DownloadIcon />}
                        onClick={() => downloadSalarySlip(latestSalarySlip._id || latestSalarySlip.id)}
                      >
                        Download
                      </Button>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            )}
            
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography color="textSecondary" gutterBottom>
                    Expense Requests
                  </Typography>
                  <Typography variant="h3">
                    {expenses.length}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {Array.isArray(expenses) ? expenses.filter(e => e.status === 'pending').length : 0} pending approval
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </TabPanel>
        
        {/* Expenses Tab */}
        <TabPanel value={tabValue} index={2}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
            <Typography variant="h5">Your Expenses</Typography>
            <Button 
              variant="contained" 
              startIcon={<AddIcon />}
              onClick={handleDialogOpen}
            >
              Submit New
            </Button>
          </Box>
          
          {/* Add search field */}
          <TextField
            fullWidth
            variant="outlined"
            placeholder="Search expenses by title, category, date or status..."
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
                  <TableCell>Title</TableCell>
                  <TableCell>Amount</TableCell>
                  <TableCell>Date</TableCell>
                  <TableCell>Category</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Description</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredExpenses.length > 0 ? (
                  filteredExpenses.map(expense => (
                    <TableRow key={expense.id}>
                      <TableCell>{expense.title}</TableCell>
                      <TableCell>${expense.amount}</TableCell>
                      <TableCell>{formatDate(expense.date)}</TableCell>
                      <TableCell>{expense.category}</TableCell>
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
                      <TableCell>{expense.description}</TableCell>
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
      </Box>
      
      {/* Submit Expense Dialog */}
      <Dialog open={dialogOpen} onClose={handleDialogClose} maxWidth="sm" fullWidth>
        <DialogTitle>Submit New Expense</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                label="Title"
                name="title"
                value={expenseForm.title}
                onChange={handleFormChange}
                fullWidth
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                label="Amount"
                name="amount"
                type="number"
                value={expenseForm.amount}
                onChange={handleFormChange}
                fullWidth
                required
                InputProps={{
                  startAdornment: '$'
                }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                label="Date"
                name="date"
                type="date"
                value={expenseForm.date}
                onChange={handleFormChange}
                fullWidth
                required
                InputLabelProps={{
                  shrink: true,
                }}
              />
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Category</InputLabel>
                <Select
                  name="category"
                  value={expenseForm.category}
                  onChange={handleFormChange}
                  label="Category"
                >
                  <MenuItem value="Office">Office Supplies</MenuItem>
                  <MenuItem value="Travel">Travel</MenuItem>
                  <MenuItem value="Meals">Meals & Entertainment</MenuItem>
                  <MenuItem value="Software">Software</MenuItem>
                  <MenuItem value="Training">Training</MenuItem>
                  <MenuItem value="Other">Other</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Description"
                name="description"
                value={expenseForm.description}
                onChange={handleFormChange}
                fullWidth
                multiline
                rows={3}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDialogClose}>Cancel</Button>
          <Button 
            onClick={submitExpense} 
            variant="contained" 
            disabled={loading || !expenseForm.title || !expenseForm.amount || !expenseForm.date || !expenseForm.category}
          >
            {loading ? <CircularProgress size={24} /> : 'Submit'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default EmployeeDashboard;
