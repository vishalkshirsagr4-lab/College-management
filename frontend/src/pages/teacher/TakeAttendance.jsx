import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  createAttendance,
  getAttendance,
  updateAttendance,
} from '../../api/attendance.api';
import { getClassStudents } from '../../api/teacher.api';
import { getTimetableById } from '../../api/timetable.api';

const TakeAttendance = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [timetable, setTimetable] = useState(null);
  const [students, setStudents] = useState([]);
  const [entries, setEntries] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [attendanceId, setAttendanceId] = useState(null);
  const [date, setDate] = useState(
    new Date().toISOString().slice(0, 10)
  );

  const loadExistingAttendance = async (selectedDate) => {
    try {
      const res = await getAttendance({
        timetableId: id,
        date: selectedDate,
      });

      const existing = res.data.attendance || [];

      if (existing.length > 0) {
        const record = existing[0];
        setAttendanceId(record._id);

        const map = {};
        (record.entries || []).forEach((e) => {
          map[e.studentId?._id || e.studentId] =
            e.status || 'absent';
        });

        setEntries(map);
      } else {
        setAttendanceId(null);
      }
    } catch {
      setAttendanceId(null);
    }
  };

  useEffect(() => {
    const load = async () => {
      try {
        const tRes = await getTimetableById(id);
        const t = tRes.data.timetable;
        setTimetable(t);

        const sRes = await getClassStudents({
          semester: t.semester,
          section: t.section,
        });

        const list = sRes.data.students || [];
        setStudents(list);

        const init = {};
        list.forEach((s) => (init[s._id] = 'present'));
        setEntries(init);

        await loadExistingAttendance(date);
      } catch {
        setStudents([]);
        setTimetable(null);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [id]);

  useEffect(() => {
    if (timetable) {
      loadExistingAttendance(date);
    }
  }, [date]);

  const setStatus = (studentId, status) => {
    setEntries((prev) => ({
      ...prev,
      [studentId]: status,
    }));
  };

  const submit = async () => {
    setSaving(true);
    setError('');

    try {
      const payload = {
        timetableId: id,
        date,
        entries: Object.entries(entries).map(
          ([studentId, status]) => ({
            studentId,
            status,
          })
        ),
      };

      if (attendanceId) {
        await updateAttendance(attendanceId, {
          entries: payload.entries,
        });
      } else {
        await createAttendance(payload);
      }

      navigate('/teacher/attendance');
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          'Unable to submit attendance.'
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-500">
        Loading class roster...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-6 sm:px-6 lg:px-10">

      {/* HEADER */}
      <div className="max-w-6xl mx-auto mb-6">
        <div className="bg-white border rounded-2xl shadow-sm p-5">
          <h1 className="text-2xl font-bold text-gray-900">
            Take Attendance
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            {timetable?.subjectId?.subjectName ||
              'Class Attendance'}
          </p>
        </div>
      </div>

      {/* MAIN CARD */}
      <div className="max-w-6xl mx-auto bg-white border rounded-2xl shadow-sm p-5 space-y-6">

        {/* CLASS INFO */}
        <div className="border rounded-xl p-4 bg-gray-50">
          <h2 className="font-semibold text-gray-800 mb-2">
            Class Details
          </h2>

          {timetable ? (
            <div className="text-sm text-gray-600 space-y-1">
              <p>
                {timetable.subjectId?.subjectCode} •{' '}
                {timetable.subjectId?.subjectName}
              </p>
              <p>
                Semester {timetable.semester} · Section{' '}
                {timetable.section}
              </p>
              <p>
                Period {timetable.period} ·{' '}
                {timetable.startTime} - {timetable.endTime}
              </p>
            </div>
          ) : (
            <p className="text-red-500 text-sm">
              Unable to load timetable
            </p>
          )}
        </div>

        {/* DATE */}
        <div className="grid sm:grid-cols-2 gap-4 items-center">
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="border rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none"
          />

          <div className="text-sm text-gray-500">
            {attendanceId
              ? 'Editing existing attendance'
              : 'New attendance will be created'}
          </div>
        </div>

        {/* ACTIONS */}
        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => {
              const map = {};
              students.forEach(
                (s) => (map[s._id] = 'present')
              );
              setEntries(map);
            }}
            className="px-4 py-2 bg-green-100 text-green-700 rounded-lg text-sm"
          >
            Mark All Present
          </button>

          <button
            onClick={() => {
              const map = {};
              students.forEach(
                (s) => (map[s._id] = 'absent')
              );
              setEntries(map);
            }}
            className="px-4 py-2 bg-red-100 text-red-700 rounded-lg text-sm"
          >
            Mark All Absent
          </button>
        </div>

        {/* ERROR */}
        {error && (
          <div className="text-red-600 text-sm bg-red-50 p-3 rounded-lg">
            {error}
          </div>
        )}

        {/* STUDENTS LIST */}
        <div className="space-y-3">
          {students.length === 0 ? (
            <p className="text-gray-500 text-center py-6">
              No students found
            </p>
          ) : (
            students.map((student) => (
              <div
                key={student._id}
                className="border rounded-xl p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3"
              >
                <div>
                  <p className="font-medium text-gray-900">
                    {student.userId?.name ||
                      student.usn ||
                      'Student'}
                  </p>
                  <p className="text-sm text-gray-500">
                    USN: {student.usn} | Sem{' '}
                    {student.semester} | Sec{' '}
                    {student.section}
                  </p>
                </div>

                <select
                  value={entries[student._id] || 'present'}
                  onChange={(e) =>
                    setStatus(student._id, e.target.value)
                  }
                  className="border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
                >
                  <option value="present">Present</option>
                  <option value="absent">Absent</option>
                  <option value="late">Late</option>
                  <option value="medical">Medical</option>
                  <option value="approved">Approved</option>
                </select>
              </div>
            ))
          )}
        </div>

        {/* SUBMIT */}
        <button
          onClick={submit}
          disabled={saving || students.length === 0}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-semibold"
        >
          {saving
            ? 'Saving...'
            : attendanceId
            ? 'Update Attendance'
            : 'Submit Attendance'}
        </button>
      </div>
    </div>
  );
};

export default TakeAttendance;