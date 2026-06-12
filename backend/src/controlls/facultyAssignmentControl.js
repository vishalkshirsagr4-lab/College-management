const Faculty = require("../models/faculty");
const Assignment = require("../models/assignment");

const createAssignment = async (req, res) => {
  try {
    // Faculty role is enforced by route middleware (roleMiddleware("faculty"))
    const faculty = await Faculty.findOne({ userID: req.user.id });
    if (!faculty) {
      return res.status(404).json({
        success: false,
        message: "Faculty not found",
      });
    }

    const {
      title,
      description,
      subject,
      department,
      semester,
      section,
      dueDate,
      fileUrl,
    } = req.body;


    if (!title || !description || !subject || !department || !semester || !section || !dueDate) {

      return res.status(400).json({
        success: false,
        message:
          "title, description, subject, department, semester, section, dueDate are required",
      });
    }

    // If file was uploaded via multipart/form-data, prefer it over fileUrl from body.
    // Note: fileUrl in the frontend is not sent; multer will populate req.file.
    let resolvedFileUrl = fileUrl || "";
    let resolvedFileKey = "";

    // multer-s3 attaches S3 metadata.
    if (req.file) {
      // multer-s3 puts URL and key on the file object.
      // Depending on version, it can be: req.file.location, req.file.key, etc.
      resolvedFileKey = req.file.key || "";
      resolvedFileUrl = req.file.location || req.file.url || fileUrl || "";
    }



    // ✅ Faculty restriction: check teachingAssignments match exactly
    const normalizedDepartment = String(department).trim();
    const normalizedSection = String(section).trim();
    const normalizedSubject = String(subject).trim();
    const normalizedSemester = Number(semester);

    const isAllowed = faculty.teachingAssignments.some((ta) => {
      const taDepartment = String(ta.department).trim();
      const taSection = String(ta.section).trim();
      const taSemester = Number(ta.semester);
      const taSubjects = (ta.subjects || []).map((s) => String(s).trim());

      return (
        taDepartment === normalizedDepartment &&
        taSemester === normalizedSemester &&
        taSection === normalizedSection &&
        taSubjects.includes(normalizedSubject)
      );
    });

    if (!isAllowed) {
      return res.status(403).json({
        success: false,
        message: "Access denied: faculty not assigned to this subject/class/semester/section",
      });
    }

    const assignment = await Assignment.create({
      title: String(title).trim(),
      description,
      subject: normalizedSubject,
      department: normalizedDepartment,
      semester: normalizedSemester,
      section: normalizedSection,
      facultyId: faculty._id,
      dueDate,
      fileUrl: resolvedFileUrl || "",
      fileKey: resolvedFileKey || "",
    });



    return res.status(201).json({
      success: true,
      message: "Assignment created",
      data: assignment,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  createAssignment,
};

