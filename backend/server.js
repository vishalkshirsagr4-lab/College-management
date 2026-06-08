const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const connectDB = require('./src/config/db');
const seedAdmin = require('./src/scripts/seedAdmin');
const authRoutes = require('./src/routes/authRoutes');
const adminRoutes = require('./src/routes/adminRoute');
require('dotenv').config();

const dns = require('dns');
dns.setServers(['8.8.8.8', '8.8.4.4']); 

const app = express();

app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);

function connections() {
  try {
    connectDB();
    seedAdmin();
    app.listen(process.env.PORT, () => {
    console.log(`Server is running on port ${process.env.PORT}`);
     });
  } catch (error) {
    console.error('Error connecting to the database:', error);
  }
}

connections();