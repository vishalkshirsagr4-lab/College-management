const express = require("express");
const router = express.Router();

const { createFaculty , updateFacultySemester ,deleteSemester } = require("../controlls/adminfacultyControl");
const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");
const { createStudent, updateStudent, deleteStudent } = require("../controlls/adminstudentControl");

router.post(
  "/faculty",
  authMiddleware,
  roleMiddleware("admin"),
  createFaculty
);
  
router.put(
  "/faculty/subjects",
  authMiddleware,
  roleMiddleware("admin"),
  updateFacultySemester
);

router.delete(
  "/faculty/subjects",
  authMiddleware,
  roleMiddleware("admin"),
  deleteSemester
);

router.post(
  "/student",
  authMiddleware,
  roleMiddleware("admin"),
  createStudent
);

router.put(
  "/student/:studentId",
  authMiddleware,
  roleMiddleware("admin"),
  updateStudent
);

router.delete(
  "/student/:studentId",
  authMiddleware,
  roleMiddleware("admin"),
  deleteStudent
);

module.exports = router;