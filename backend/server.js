const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const connectDB = require("./src/config/db");
const seedAdmin = require("./src/scripts/seedAdmin");

const authRoutes = require("./src/routes/authroutes");
const adminRoutes = require("./src/routes/adminRoute");
const facultyRoutes = require("./src/routes/facultyRoute");
const studentRoutes = require("./src/routes/studentRoute");
const notificationRoutes = require("./src/routes/notificationRoute");

require("dotenv").config();


const dns = require("dns");
dns.setServers(["8.8.8.8", "8.8.4.4"]);

const app = express();

// Middleware
app.use(express.json());
app.use(cors());
app.use(cookieParser());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/faculty", facultyRoutes);
app.use("/api/student", studentRoutes);
app.use("/api/notification", notificationRoutes);

const startServer = async () => {
  try {
    // 1. CONNECT DB FIRST
    await connectDB();
    console.log("MongoDB connected successfully");

    // 2. SEED ADMIN AFTER DB CONNECT
    await seedAdmin();

    // 3. START SERVER
    app.listen(process.env.PORT || 5000, () => {
      console.log(
        `Server is running on port ${process.env.PORT || 5000}`
      );
    });
  } catch (error) {
    console.error("Server startup error:", error);
    process.exit(1);
  }
};

startServer();
