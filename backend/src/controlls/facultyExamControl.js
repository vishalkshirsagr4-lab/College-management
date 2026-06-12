// 📑 Correct your model declarations at the top of the file:
const Exam = require("../models/Adminexam");
const Marks = require("../models/marks"); 
const Student = require("../models/student");
const Faculty = require("../models/faculty");
const ExamSubject = require("../models/facultyexam"); //  FIXED: Pointing to the actual ExamSubject Schema

// ✅ Fixed Controller Method
// ✅ UPDATED BACKEND CONTROLLER METHOD
const addSubjectToExam = async (req, res) => {
  try {
    const { examId, subject, syllabus } = req.body;

    console.log("=== BACKEND INCOMING PAYLOAD ===");
    console.log("req.body:", req.body);
    console.log("Authenticated User ID:", req.user?.id);

    // 1. Validation check for incoming fields
    if (!examId || !subject || !syllabus) {
      return res.status(400).json({ 
        success: false, 
        message: "Missing parameters: examId, subject, and syllabus are required." 
      });
    }

    // 2. ⚡ FIX: Fetch the actual Faculty document matching the logged-in User ID
    const facultyProfile = await Faculty.findOne({ userID: req.user.id });
    
    if (!facultyProfile) {
      return res.status(404).json({
        success: false,
        message: "Access Denied: No matching Faculty profiling record found for this account."
      });
    }

    // 3. Normalize syllabus text string to schema array shape
    let normalizedSyllabus = syllabus;
    if (typeof syllabus === "string") {
      normalizedSyllabus = [
        {
          unit: "Syllabus Structure",
          chapters: syllabus.trim() ? [syllabus.trim()] : [],
        },
      ];
    }

    // 4. Create the document using the freshly retrieved facultyProfile._id
    const data = await ExamSubject.create({
      examId,
      facultyId: facultyProfile._id, // 🔥 Dynamically injected safely on backend
      subject: subject.trim(),
      syllabus: normalizedSyllabus,
    });

    res.status(201).json({
      success: true,
      message: "Subject added to exam blueprint successfully.",
      data,
    });
  } catch (err) {
    console.error("CRITICAL BACKEND FAILURE:", err.message);
    res.status(500).json({ success: false, message: err.message });
  }
};
// Existing: Log student marks structural profile
// ✅ UPDATED MARKS ENTRY CONTROLLER METHOD
const addMarks = async (req, res) => {
  try {
    const { examId, subject, studentId, marksObtained } = req.body;

    // 1. Validation check for core body parameters
    if (!examId || !subject || !studentId || marksObtained === undefined || marksObtained === "") {
      return res.status(400).json({
        success: false,
        message: "Missing parameters: examId, subject, studentId, and marksObtained are required."
      });
    }

    // 2. ⚡ FIX: Fetch the actual Faculty document matching the logged-in User ID
    const facultyProfile = await Faculty.findOne({ userID: req.user.id });
    
    if (!facultyProfile) {
      return res.status(404).json({
        success: false,
        message: "Access Denied: No matching Faculty profiling record found for this account."
      });
    }

    // 3. Create the document using the freshly retrieved facultyProfile._id
    const marks = await Marks.create({
      examId,
      subject,
      studentId,
      facultyId: facultyProfile._id, // 🔥 Dynamically injected safely on backend
      marksObtained: Number(marksObtained),
    });

    res.status(201).json({
      success: true,
      message: "Student academic grades registered efficiently!",
      data: marks,
    });
  } catch (err) {
    console.error("CRITICAL GRADING ENGINE FAILURE:", err.message);
    res.status(500).json({ 
      success: false, 
      message: err.message 
    });
  }
};

// Fetch subjects matching a faculty's custom assigned profiles
const getMySubjects = async (req, res) => {
  try {
    const faculty = await Faculty.findOne({ userID: req.user.id });
    if (!faculty) {
      return res.status(404).json({ success: false, message: "Faculty document not found." });
    }

    const uniqueSubjectsMap = new Map();
    
    faculty.teachingAssignments.forEach((assignment) => {
      if (assignment && assignment.subjects) {
        assignment.subjects.forEach((sub) => {
          if (sub && sub.trim()) {
            const normalizedKey = `${assignment.semester}-${sub.trim().toLowerCase()}`;
            uniqueSubjectsMap.set(normalizedKey, {
              semester: assignment.semester,
              subject: sub.trim(),
            });
          }
        });
      }
    });

    res.status(200).json({
      success: true,
      subjects: Array.from(uniqueSubjectsMap.values()),
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Cascade fetch available students meeting exam bounds and faculty constraints
const getStudentsForGrading = async (req, res) => {
  try {
    const { examId, subject } = req.query;

    if (!examId || !subject) {
      return res.status(400).json({ success: false, message: "Parameters examId and subject are required." });
    }

    const exam = await Exam.findById(examId);
    if (!exam) {
      return res.status(404).json({ success: false, message: "Target exam blueprint does not exist." });
    }

    const faculty = await Faculty.findOne({ userID: req.user.id });
    if (!faculty) {
      return res.status(404).json({ success: false, message: "Faculty profiling record missing." });
    }

    const targetSections = faculty.teachingAssignments
      .filter((assignment) => 
        Number(assignment.semester) === Number(exam.semester) &&
        assignment.subjects.some((s) => s.toLowerCase() === subject.toLowerCase())
      )
      .map((assignment) => assignment.section);

    if (targetSections.length === 0) {
      return res.status(200).json({ success: true, students: [] });
    }

    const students = await Student.find({
      department: exam.department,
      semester: exam.semester,
      section: { $in: targetSections },
      isActive: true,
    })
    .populate("userID", "name")
    .select("_id rollNo section");

    const formattedStudents = students.map((st) => ({
      _id: st._id,
      name: st.userID?.name || "Unknown Identity",
      rollNumber: st.rollNo || "N/A",
      section: st.section,
    }));

    res.status(200).json({
      success: true,
      students: formattedStudents,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// FIXED: Querying the correct base Exam schema & added to exports
const getAllExams = async (req, res) => {
  try {
    const exams = await Exam.find({}).select("examName department semester _id");
    
    res.status(200).json({
      success: true,
      exams
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { 
  addSubjectToExam, 
  addMarks, 
  getMySubjects, 
  getStudentsForGrading,
  getAllExams // <-- Added export
};