# Payroll Management System

A comprehensive web application for managing payroll, employee expenses, and salary slips built with MERN stack (MongoDB, Express, React, Node.js).

## Features

### For Administrators

- Dashboard with data visualization
- Employee management
- Salary slip generation and management
- Expense approval system
- Reporting and analytics

### For Employees

- View and download salary slips
- Submit expense requests
- Track expense approval status
- Personal dashboard with financial overview

## Technology Stack

### Frontend

- React.js with hooks
- Material UI for responsive design
- Chart.js for data visualization
- React Router for navigation
- Context API for state management

### Backend

- Node.js with Express
- MongoDB for database
- JWT for authentication
- PDF generation for salary slips

## Installation

### Prerequisites

- Node.js (v14+)
- MongoDB
- npm or yarn

### Backend Setup

1. Navigate to the backend directory:

   ```bash
   cd backend
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Create a `.env` file with the following variables:

   ```bash
   PORT=5001
   FRONTEND_URL=http://localhost:3000
   JWT_SECRET=your_jwt_secret
   MONGO_URI=your_mongodb_connection_string
   ```

4. Start the server:

   ```bash
   npm start
   ```

### Frontend Setup

1. Navigate to the frontend directory:

   ```bash
   cd frontend
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Create a `.env` file with:

   ```bash
   REACT_APP_BACKEND_URL=http://localhost:5001
   ```

4. Start the development server:

   ```bash
   npm start
   ```

## Usage

### Admin Access

- Use admin credentials to log in
- Manage employees from the dashboard
- Generate and view salary slips
- Approve or reject expense requests
- View analytics and reports

### Employee Access

- Log in with employee credentials
- View personal dashboard with salary information
- Download salary slips
- Submit and track expense requests

## API Endpoints

### Authentication

- `POST /api/auth/signup` - Register a new user
- `POST /api/auth/login` - Log in a user
- `GET /api/auth/me` - Get current user information

### Salary Slips

- `GET /api/salary-slip/employee/:id` - Get all salary slips for an employee
- `POST /api/salary-slip` - Create a new salary slip
- `GET /api/salary-slip/:id/download` - Download a salary slip as PDF

### Expenses

- `GET /api/expense/employee/:id` - Get all expenses for an employee
- `POST /api/expense` - Submit a new expense request
- `PUT /api/expense/:id/approve` - Approve an expense
- `PUT /api/expense/:id/reject` - Reject an expense

## License

MIT

## Author

Suraj Rathor
