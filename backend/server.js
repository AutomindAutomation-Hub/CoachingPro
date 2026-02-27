const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');

dotenv.config();

const app = express();
app.use(express.json());
app.use(cors());

// Init DB
connectDB();

const path = require('path');

// Serve static files from uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/students', require('./routes/studentRoutes'));
app.use('/api/teachers', require('./routes/teacherRoutes'));
app.use('/api/batches', require('./routes/batchRoutes'));
app.use('/api/attendance', require('./routes/attendanceRoutes'));
app.use('/api/materials', require('./routes/materialRoutes'));
app.use('/api/tests', require('./routes/testRoutes'));
app.use('/api/fees', require('./routes/feeRoutes'));
app.use('/api/quizzes', require('./routes/quizRoutes'));
app.use('/api/analytics', require('./routes/analyticsRoutes'));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
