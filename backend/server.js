const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const connectDB = require('./src/config/db');

const authRoutes = require('./src/routes/authroutes');
const adminRoutes = require('./src/routes/admin');
const teacherRoutes = require('./src/routes/teachers');
const studentRoutes = require('./src/routes/students');
const subjectRoutes = require('./src/routes/subjects');
const attendanceRoutes = require('./src/routes/attendance');
const assignmentRoutes = require('./src/routes/assignments');
const examRoutes = require('./src/routes/exams');
const resultRoutes = require('./src/routes/results');
const noticeRoutes = require('./src/routes/notices');
const feeRoutes = require('./src/routes/fees');

const { notFound, errorHandler } = require('./src/middleware/errorHandler');

const dns = require('dns');
dns.setServers(['8.8.8.8', '8.8.4.4']);

require('dotenv').config();

const app = express();

const PORT = process.env.PORT || 5000;
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173';

app.use(cors({
  origin: CLIENT_URL,
  credentials: true,
}));

// Simple request logger to help debug missing routes from the frontend
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.originalUrl}`);
  next();
});


/* -------------------- MIDDLEWARE -------------------- */
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

/* -------------------- ROUTES -------------------- */
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/teacher', teacherRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/subjects', subjectRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/assignments', assignmentRoutes);
app.use('/api/exams', examRoutes);
app.use('/api/results', resultRoutes);
app.use('/api/notices', noticeRoutes);
app.use('/api/fees', feeRoutes);

/* -------------------- ERROR HANDLERS -------------------- */
app.use(notFound);
app.use(errorHandler);

/* -------------------- SERVER START -------------------- */
const seedAdmin = require('./src/scripts/seedAdmin');

const startServer = async () => {
  try {
    await connectDB();

    try {
      await seedAdmin();
    } catch (err) {
      console.error('Seeding admin failed:', err.message);
    }

    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Error connecting to the database:', error);
    process.exit(1);
  }
};

startServer();