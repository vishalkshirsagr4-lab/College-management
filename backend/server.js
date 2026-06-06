const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const connectDB = require('./src/config/db');
require('dotenv').config();

const dns = require('dns');
dns.setServers(['8.8.8.8', '8.8.4.4']); 

const authRoutes = require('./src/routes/authroutes');
const adminRoutes = require('./src/routes/admin');
const teacherRoutes = require('./src/routes/teachers');
const studentRoutes = require('./src/routes/students');
const subjectRoutes = require('./src/routes/subjects');
const attendanceRoutes = require('./src/routes/attendance');
const timetableRoutes = require('./src/routes/timetable');
const assignmentRoutes = require('./src/routes/assignments');
const examRoutes = require('./src/routes/exams');
const resultRoutes = require('./src/routes/results');
const noticeRoutes = require('./src/routes/notices');
const holidayRoutes = require('./src/routes/holidays');
const leavesRoutes = require('./src/routes/leaves');
const feeRoutes = require('./src/routes/fees');
const studentDashboardRoutes = require('./src/routes/studentDashboard');

const { notFound, errorHandler } = require('./src/middleware/errorHandler');
const seedAdmin = require('./src/scripts/seedAdmin');


const app = express();

const PORT = process.env.PORT || 5000;
const CLIENT_URL = (process.env.CLIENT_URL || 'http://localhost:5173').replace(/\/$/, '');

const corsOptions = {
  origin: CLIENT_URL,
  credentials: true,
  methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};

app.use(cors(corsOptions));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

/* -------------------- REQUEST LOGGER -------------------- */

app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.originalUrl}`);
  next();
});

/* -------------------- ROUTES -------------------- */

app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/teacher', teacherRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/subjects', subjectRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/timetable', timetableRoutes);
app.use('/api/assignments', assignmentRoutes);
app.use('/api/exams', examRoutes);
app.use('/api/results', resultRoutes);
app.use('/api/notices', noticeRoutes);
app.use('/api/holidays', holidayRoutes);
app.use('/api/leaves', leavesRoutes);
app.use('/api', studentDashboardRoutes);
app.use('/api/fees', feeRoutes);


/* -------------------- ERROR HANDLERS -------------------- */

app.use(notFound);
app.use(errorHandler);

/* -------------------- SERVER START -------------------- */

const startServer = async () => {
  try {
    await connectDB();
    console.log('✅ MongoDB connected');

    try {
      await seedAdmin();
      console.log('✅ Admin seeded (if needed)');
    } catch (err) {
      console.error('⚠️ Seeding admin failed:', err.message);
    }

    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });

  } catch (error) {
    console.error('❌ DB connection error:', error.message);
    process.exit(1);
  }
};

startServer();