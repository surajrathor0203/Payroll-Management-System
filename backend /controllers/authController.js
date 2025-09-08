import jwt from 'jsonwebtoken';
import User from '../models/userModel.js';

// Generate JWT token
const generateToken = (user) => {
  return jwt.sign(
    { 
      uid: user._id,
      email: user.email,
      role: user.role,
      name: user.fullName
    }, 
    process.env.JWT_SECRET,
    { expiresIn: '24h' }
  );
};

// Sign up new users
export const signup = async (req, res) => {
  try {
    const { email, password, fullName, role } = req.body;
    
    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'Email is already in use'
      });
    }
    
    // Create new user
    const newUser = new User({
      email,
      password, // Will be hashed by pre-save hook
      fullName,
      role: role || 'employee'
    });
    
    await newUser.save();
    
    // Create user data for token
    const userData = {
      _id: newUser._id,
      email: newUser.email,
      fullName: newUser.fullName,
      role: newUser.role
    };
    
    // Generate token
    const token = generateToken(userData);
    
    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      token,
      user: {
        uid: newUser._id,
        email: newUser.email,
        name: newUser.fullName,
        role: newUser.role
      }
    });
  } catch (error) {
    console.error('Signup error:', error);
    
    let errorMessage = 'Registration failed';
    
    if (error.code === 11000) { // MongoDB duplicate key error
      errorMessage = 'Email is already in use';
    }
    
    res.status(400).json({
      success: false,
      message: errorMessage
    });
  }
};

// Login existing users
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Find user by email
    const user = await User.findOne({ email });
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }
    
    // Check if password matches
    const isMatch = await user.comparePassword(password);
    
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }
    
    // Generate token
    const token = generateToken(user);
    
    res.status(200).json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        uid: user._id,
        email: user.email,
        name: user.fullName,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Login failed. Please try again.'
    });
  }
};

// Get current user profile
export const getCurrentUser = async (req, res) => {
  try {
    // Get user ID from authenticated request
    const userId = req.user.uid;
    
    // Find user in database
    const user = await User.findById(userId).select('-password');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    res.status(200).json({
      success: true,
      user: {
        uid: user._id,
        email: user.email,
        name: user.fullName,
        role: user.role,
        department: user.department || 'Not assigned',
        salary: user.salary || 0
      }
    });
  } catch (error) {
    console.error('Get current user error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve user profile'
    });
  }
};

// Get all employees (for admin)
export const getAllEmployees = async (req, res) => {
  try {
    // Only fetch employees (exclude admins)
    const employees = await User.find({ role: 'employee' }).select('-password');
    
    // Format the data to match frontend expectations
    const formattedEmployees = employees.map(emp => ({
      id: emp._id,
      name: emp.fullName,
      email: emp.email,
      department: emp.department || 'Not assigned',
      salary: emp.salary || 0
    }));
    
    res.status(200).json(formattedEmployees);
  } catch (error) {
    console.error('Get all employees error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve employees'
    });
  }
};

// Update employee information
export const updateEmployee = async (req, res) => {
  try {
    const { employeeId } = req.params;
    const { department, salary } = req.body;
    
    // Validate input
    if (!department && salary === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Please provide department or salary to update'
      });
    }
    
    // Find and update employee
    const updatedEmployee = await User.findByIdAndUpdate(
      employeeId,
      { 
        ...(department && { department }),
        ...(salary !== undefined && { salary })
      },
      { new: true }
    ).select('-password');
    
    if (!updatedEmployee) {
      return res.status(404).json({
        success: false,
        message: 'Employee not found'
      });
    }
    
    // Format response to match frontend expectations
    const formattedEmployee = {
      id: updatedEmployee._id,
      name: updatedEmployee.fullName,
      email: updatedEmployee.email,
      department: updatedEmployee.department || 'Not assigned',
      salary: updatedEmployee.salary || 0
    };
    
    res.status(200).json({
      success: true,
      message: 'Employee updated successfully',
      employee: formattedEmployee
    });
  } catch (error) {
    console.error('Update employee error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update employee'
    });
  }
};

