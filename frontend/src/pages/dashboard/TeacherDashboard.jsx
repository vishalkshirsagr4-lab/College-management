import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  getTeacherSubjects,
  getTeacherTimetable,
} from '../../api/teacher.api';
import { getTodaysClasses } from '../../api/timetable.api';

const StatCard = ({ title, value, subtitle }) => {
  return (
    <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm hover:shadow-md transition">
      <h3 className="text-sm text-gray-500 uppercase tracking-wide">
        {title}
      </h3>
      <p className="text-3xl font-bold text-gray-900 mt-2">{value}</p>
      <p className="text-sm text-gray-500 mt-1">{subtitle}</p>
    </div>
  );
};

const TeacherDashboard = () => {
  const [subjects, setSubjects] = useState([]);
  const [todayClasses, setTodayClasses] = useState([]);
  const [weekTimetable, setWeekTimetable] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [subjectsRes, classesRes, timetableRes] = await Promise.all([
          getTeacherSubjects(),
          getTodaysClasses(),
          getTeacherTimetable(),
        ]);

        setSubjects(subjectsRes?.data?.subjects || []);
        setTodayClasses(classesRes?.data?.classes || []);
        setWeekTimetable(timetableRes?.data?.timetable || []);
      } catch (error) {
        setSubjects([]);
        setTodayClasses([]);
        setWeekTimetable([]);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  return (
    <div className="min-h-screen w-full bg-gray-50 p-4 sm:p-6 lg:p-8 space-y-6">

      {/* HEADER */}
      <div className="bg-white border border-gray-100 rounded-3xl p-6 sm:p-8">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
          Teacher Dashboard
        </h2>
        <p className="text-gray-500 mt-2 text-sm sm:text-base">
          Manage your subjects, classes, and attendance workflow efficiently.
        </p>
      </div>

      {/* STATS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <StatCard
          title="Subjects"
          value={subjects.length}
          subtitle="Assigned courses"
        />
        <StatCard
          title="Today Classes"
          value={todayClasses.length}
          subtitle="Scheduled sessions"
        />
        <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="text-sm text-gray-500 uppercase tracking-wide">
              Timetable
            </h3>
            <p className="text-3xl font-bold text-gray-900 mt-2">
              {weekTimetable.length}
            </p>
            <p className="text-sm text-gray-500 mt-1">
              Weekly schedule entries
            </p>
          </div>

          <Link
            to="/teacher/timetable"
            className="mt-4 w-full text-center bg-blue-600 text-white py-2 rounded-xl hover:bg-blue-700 transition"
          >
            View Timetable
          </Link>
        </div>
      </div>

      {/* SUBJECTS SECTION */}
      <div className="bg-white border border-gray-100 rounded-3xl p-6 sm:p-8">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-lg font-semibold text-gray-900">
            My Subjects
          </h3>
        </div>

        {loading ? (
          <div className="text-gray-500">Loading subjects...</div>
        ) : subjects.length === 0 ? (
          <div className="text-gray-500">No subjects assigned yet.</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {subjects.map((subject) => (
              <div
                key={subject._id}
                className="p-5 border border-gray-100 rounded-2xl bg-gray-50 hover:bg-white hover:shadow-md transition"
              >
                <h4 className="text-lg font-semibold text-gray-900">
                  {subject.subjectName}
                </h4>
                <p className="text-gray-600 text-sm mt-1">
                  {subject.subjectCode}
                </p>
                <p className="text-gray-500 text-sm mt-2">
                  Semester {subject.semester}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* TODAY CLASSES */}
      <div className="bg-white border border-gray-100 rounded-3xl p-6 sm:p-8">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Today’s Classes
        </h3>

        {loading ? (
          <div className="text-gray-500">Loading classes...</div>
        ) : todayClasses.length === 0 ? (
          <div className="text-gray-500">No classes scheduled today.</div>
        ) : (
          <div className="space-y-3">
            {todayClasses.map((cls) => (
              <div
                key={cls._id}
                className="flex flex-col sm:flex-row sm:justify-between sm:items-center p-4 bg-gray-50 border border-gray-100 rounded-2xl"
              >
                <div>
                  <p className="font-semibold text-gray-900">
                    {cls.subjectName || 'Class'}
                  </p>
                  <p className="text-sm text-gray-500">
                    {cls.section || 'Section'}
                  </p>
                </div>

                <span className="text-sm text-gray-600 mt-2 sm:mt-0">
                  {cls.startTime} - {cls.endTime}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
};

export default TeacherDashboard;