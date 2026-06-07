import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { getTodaysClasses } from '../../api/timetable.api';
import { getTeacherSubjects, getTeacherTimetable } from '../../api/teacher.api';

const weekdayOrder = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

const groupByDay = (items) =>
  items.reduce((acc, item) => {
    const day = item.day || 'Other';
    acc[day] = acc[day] || [];
    acc[day].push(item);
    return acc;
  }, {});

const Timetable = () => {
  const [subjects, setSubjects] = useState([]);
  const [todayClasses, setTodayClasses] = useState([]);
  const [weekTimetable, setWeekTimetable] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      setError('');
      setLoading(true);
      try {
        const [subjectsRes, todaysRes, timetableRes] = await Promise.all([
          getTeacherSubjects(),
          getTodaysClasses(),
          getTeacherTimetable(),
        ]);

        setSubjects(subjectsRes.data.subjects || []);
        setTodayClasses(todaysRes.data.classes || []);
        setWeekTimetable(timetableRes.data.timetable || []);
      } catch (err) {
        setError('Unable to load timetable details.');
        setSubjects([]);
        setTodayClasses([]);
        setWeekTimetable([]);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  const grouped = useMemo(() => groupByDay(weekTimetable), [weekTimetable]);
  const orderedDays = weekdayOrder.filter((day) => grouped[day]);
  const sessionsCount = weekTimetable.length;

  return (
    <div className="flex-1 w-full min-h-screen">
      <div className="page-header">
        <div>
          <h2>My Timetable</h2>
          <p className="text-muted">Review your weekly schedule and link each class directly to attendance capture.</p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <Link to="/teacher/attendance/today" className="button button-secondary">
            Today's Attendance
          </Link>
          <Link to="/teacher/subjects" className="button button-secondary">
            My Subjects
          </Link>
        </div>
      </div>

      <div className="section-grid columns-3 gap-6 mb-6">
        <article className="section-panel">
          <h3 className="text-sm uppercase tracking-wide text-slate-500">Assigned Subjects</h3>
          <p className="text-3xl font-semibold text-slate-950">{subjects.length}</p>
          <p className="text-sm text-slate-500">Active subjects assigned to you</p>
        </article>

        <article className="section-panel">
          <h3 className="text-sm uppercase tracking-wide text-slate-500">Today</h3>
          <p className="text-3xl font-semibold text-slate-950">{todayClasses.length}</p>
          <p className="text-sm text-slate-500">Classes scheduled for today</p>
        </article>

        <article className="section-panel">
          <h3 className="text-sm uppercase tracking-wide text-slate-500">Weekly Sessions</h3>
          <p className="text-3xl font-semibold text-slate-950">{sessionsCount}</p>
          <p className="text-sm text-slate-500">Classes in this week&apos;s timetable</p>
        </article>
      </div>

      {loading ? (
        <div className="section-card">Loading timetable...</div>
      ) : error ? (
        <div className="notice-card">{error}</div>
      ) : sessionsCount === 0 ? (
        <div className="notice-card">No timetable entries found for your account. Ask admin to assign your classes.</div>
      ) : (
        <div className="space-y-6">
          <section className="section-card">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <h3 className="text-lg font-semibold text-slate-950">Week at a glance</h3>
                <p className="text-sm text-slate-500">Your complete weekly schedule from the active timetable.</p>
              </div>
              <p className="text-sm text-slate-500">{sessionsCount} total sessions</p>
            </div>

            <div className="mt-6 space-y-6">
              {orderedDays.map((day) => (
                <div key={day} className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
                  <div className="mb-4 flex items-center justify-between gap-4">
                    <h4 className="text-base font-semibold text-slate-900">{day}</h4>
                    <span className="text-sm text-slate-500">{grouped[day].length} class{grouped[day].length !== 1 ? 'es' : ''}</span>
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    {grouped[day].map((item) => (
                      <article key={item._id} className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
                        <div className="flex items-center justify-between gap-3">
                          <div>
                            <h5 className="font-semibold text-slate-950">{item.subjectId?.subjectName || 'Untitled Class'}</h5>
                            <p className="text-sm text-slate-500">{item.subjectId?.subjectCode || 'No code'}</p>
                          </div>
                          <span className="text-sm text-slate-500">Period {item.period}</span>
                        </div>
                        <p className="mt-3 text-sm text-slate-600">Semester {item.semester} · Section {item.section}</p>
                        <p className="mt-2 text-sm text-slate-600">{item.startTime} — {item.endTime}</p>
                        <div className="mt-4 flex flex-wrap gap-2">
                          <Link to={`/teacher/attendance/take/${item._id}`} className="button button-primary">
                            Take Attendance
                          </Link>
                          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs uppercase tracking-wide text-slate-600">
                            {item.roomNumber || 'Room not set'}
                          </span>
                        </div>
                      </article>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      )}
    </div>
  );
};

export default Timetable;
