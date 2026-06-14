import React, { useState, useEffect } from "react";
import { BookOpen, Calendar, AlertCircle, Loader2, FileText, Download } from "lucide-react";
import api from "../../utils/api";

const MyAssignments = () => {
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchAssignments = async () => {
      try {
        setLoading(true);
        setError(""); 

        const res = await api.get("/api/student/assignment/my");

        // Safely extract data whether your 'api' instance uses an interceptor or raw axios response
        const responseData = res.data ? res.data : res;

        if (responseData && responseData.success) {
          setAssignments(responseData.data || []);
        } else {
          setError(responseData?.message || "Failed to fetch assignments.");
        }
      } catch (err) {
        console.error("Error fetching assignments:", err);
        const errMsg = err.response?.data?.message || "Something went wrong. Please try again later.";
        setError(errMsg);
      } finally {
        setLoading(false);
      }
    };

    fetchAssignments();
  }, []);

  // Format ISO date string to readable text
  const formatDate = (dateString) => {
    const options = { year: "numeric", month: "short", day: "numeric" };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Flag if an assignment is past its due date
  const isOverdue = (dueDate) => {
    return new Date(dueDate) < new Date();
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <Loader2 className="w-10 h-10 animate-spin text-blue-600" />
        <p className="text-gray-500 font-medium">Loading your assignments...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-xl mx-auto mt-10 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
        <div>
          <h3 className="text-red-800 font-semibold">Error</h3>
          <p className="text-red-700 text-sm mt-1">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Header Section */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
          <BookOpen className="w-8 h-8 text-blue-600" />
          My Assignments
        </h1>
        <p className="text-gray-500 mt-2">
          View your course tasks and download attached documents provided by your faculty.
        </p>
      </div>

      {/* Main Content Grid */}
      {assignments.length === 0 ? (
        <div className="text-center py-16 bg-gray-50 border-2 border-dashed border-gray-200 rounded-2xl">
          <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-600 font-medium text-lg">No assignments found!</p>
          <p className="text-gray-400 text-sm">You are completely caught up.</p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {assignments.map((assignment) => {
            const overdue = isOverdue(assignment.dueDate);
            return (
              <div 
                key={assignment._id} 
                className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 flex flex-col justify-between hover:shadow-md transition-shadow duration-200"
              >
                <div>
                  {/* Top Tags */}
                  <div className="flex items-center justify-between mb-3">
                    <span className="px-3 py-1 text-xs font-semibold uppercase tracking-wider text-blue-700 bg-blue-50 rounded-full">
                      {assignment.subject}
                    </span>
                    {overdue && (
                      <span className="text-xs font-medium text-red-600 bg-red-50 px-2 py-0.5 rounded border border-red-100">
                        Overdue
                      </span>
                    )}
                  </div>

                  {/* Title */}
                  <h3 className="text-xl font-bold text-gray-800 mb-2 line-clamp-1">
                    {assignment.title}
                  </h3>

                  {/* Description */}
                  <p className="text-gray-600 text-sm line-clamp-3 mb-4 leading-relaxed">
                    {assignment.description || "No description provided."}
                  </p>

                  {/* Dynamic File/Attachment Link */}
                  {assignment.fileUrl && (
                    <div className="mb-4">
                      <a 
                        href={assignment.fileUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 p-2 w-full text-xs font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg hover:bg-emerald-100 transition-colors"
                      >
                        <FileText className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                        <span className="truncate flex-1 text-left">View Resource Attachment</span>
                        <Download className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                      </a>
                    </div>
                  )}
                </div>

                {/* Card Footer */}
                <div className="pt-4 border-t border-gray-100 flex items-center justify-between mt-auto">
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <Calendar className={`w-4 h-4 ${overdue ? "text-red-500" : "text-gray-400"}`} />
                    <span className={overdue ? "text-red-600 font-medium" : ""}>
                      Due: {formatDate(assignment.dueDate)}
                    </span>
                  </div>
                  
                  <button className="text-xs font-semibold bg-gray-800 hover:bg-gray-700 text-white px-3 py-2 rounded-lg transition-colors">
                    Submit Task
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default MyAssignments;