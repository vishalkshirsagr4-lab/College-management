import { useEffect, useMemo, useState } from 'react';
import { getTeachers, getSubjects } from '../../api/admin.api';
import { createTimetable, deleteTimetable, getTimetable, updateTimetable } from '../../api/timetable.api';

const weekdays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

const defaultForm = {
  teacherId: '',
  subjectId: '',
  course: '',
  semester: 1,
  section: '',
  day: 'Monday',
  period: 1,
  startTime: '09:00',
  endTime: '10:00',
  roomNumber: '',
};

const TimetableManagement = () => {
  const [teachers, setTeachers] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [entries, setEntries] = useState([]);
  const [form, setForm] = useState(defaultForm);
  const [editingId, setEditingId] = useState(null);
  const [filters, setFilters] = useState({ teacherId: '', subjectId: '', section: '' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const [teachersRes, subjectsRes, timetableRes] = await Promise.all([
          getTeachers(),
          getSubjects(),
          getTimetable(),
        ]);

        setTeachers(teachersRes.data.teachers || []);
        setSubjects(subjectsRes.data.subjects || []);
        setEntries(timetableRes.data.timetable || []);
      } catch (err) {
        setError('Unable to load timetable resources.');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const resetForm = () => {
    setForm(defaultForm);
    setEditingId(null);
    setError('');
  };

  const filteredEntries = useMemo(() => {
    return entries.filter((entry) => {
      if (filters.teacherId && entry.teacherId?._id !== filters.teacherId) return false;
      if (filters.subjectId && entry.subjectId?._id !== filters.subjectId) return false;
      if (filters.section && entry.section?.toLowerCase().indexOf(filters.section.toLowerCase()) === -1) return false;
      return true;
    });
  }, [entries, filters]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError('');

    try {
      const payload = {
        teacherId: form.teacherId,
        subjectId: form.subjectId,
        course: form.course,
        semester: Number(form.semester),
        section: form.section,
        day: form.day,
        period: Number(form.period),
        startTime: form.startTime,
        endTime: form.endTime,
        roomNumber: form.roomNumber,
      };

      if (editingId) {
        await updateTimetable(editingId, payload);
      } else {
        await createTimetable(payload);
      }

      const res = await getTimetable();
      setEntries(res.data.timetable || []);
      resetForm();
    } catch (err) {
      setError(err?.response?.data?.message || 'Unable to save timetable entry.');
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (entry) => {
    setForm({
      teacherId: entry.teacherId?._id || '',
      subjectId: entry.subjectId?._id || '',
      course: entry.course || '',
      semester: entry.semester || 1,
      section: entry.section || '',
      day: entry.day || 'Monday',
      period: entry.period || 1,
      startTime: entry.startTime || '09:00',
      endTime: entry.endTime || '10:00',
      roomNumber: entry.roomNumber || '',
    });
    setEditingId(entry._id);
    setError('');
  };

  const handleDelete = async (id) => {
    try {
      await deleteTimetable(id);
      setEntries((prev) => prev.filter((entry) => entry._id !== id));
    } catch (err) {
      setError(err?.response?.data?.message || 'Unable to delete timetable entry.');
    }
  };

  const groupedByDay = useMemo(() => {
    return filteredEntries.reduce((acc, entry) => {
      const day = entry.day || 'Other';
      acc[day] = acc[day] || [];
      acc[day].push(entry);
      return acc;
    }, {});
  }, [filteredEntries]);

  return (
    <div className="flex-1 w-full min-h-screen">
      <div className="page-header">
        <div>
          <h2>Timetable Management</h2>
          <p className="text-muted">Assign classes, subjects and teachers centrally from the admin console.</p>
        </div>
      </div>

      <div className="section-grid columns-3 gap-6 mb-6">
        <article className="section-panel">
          <h3 className="text-sm uppercase tracking-wide text-slate-500">Teachers</h3>
          <p className="text-3xl font-semibold text-slate-950">{teachers.length}</p>
          <p className="text-sm text-slate-500">Available teacher profiles</p>
        </article>
        <article className="section-panel">
          <h3 className="text-sm uppercase tracking-wide text-slate-500">Subjects</h3>
          <p className="text-3xl font-semibold text-slate-950">{subjects.length}</p>
          <p className="text-sm text-slate-500">Courses ready for assignment</p>
        </article>
        <article className="section-panel">
          <h3 className="text-sm uppercase tracking-wide text-slate-500">Timetable</h3>
          <p className="text-3xl font-semibold text-slate-950">{entries.length}</p>
          <p className="text-sm text-slate-500">Total scheduled entries</p>
        </article>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.2fr_1.8fr]">
        <section className="section-panel">
          <h3 className="text-lg font-semibold text-slate-950">{editingId ? 'Edit Timetable Entry' : 'Add Timetable Entry'}</h3>
          <form onSubmit={handleSubmit} className="space-y-4 mt-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block">
                <span className="text-sm text-slate-700">Teacher</span>
                <select
                  className="form-control mt-2"
                  value={form.teacherId}
                  onChange={(e) => setForm((prev) => ({ ...prev, teacherId: e.target.value }))}
                  required
                >
                  <option value="">Select teacher</option>
                  {teachers.map((teacher) => (
                    <option key={teacher._id} value={teacher._id}>
                      {teacher.userId?.name || teacher.userId?.email}
                    </option>
                  ))}
                </select>
              </label>

              <label className="block">
                <span className="text-sm text-slate-700">Subject</span>
                <select
                  className="form-control mt-2"
                  value={form.subjectId}
                  onChange={(e) => setForm((prev) => ({ ...prev, subjectId: e.target.value }))}
                  required
                >
                  <option value="">Select subject</option>
                  {subjects.map((subject) => (
                    <option key={subject._id} value={subject._id}>
                      {subject.subjectName} ({subject.subjectCode})
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block">
                <span className="text-sm text-slate-700">Course / Class</span>
                <input
                  className="form-control mt-2"
                  type="text"
                  placeholder="e.g. CSE"
                  value={form.course}
                  onChange={(e) => setForm((prev) => ({ ...prev, course: e.target.value }))}
                  required
                />
              </label>
              <label className="block">
                <span className="text-sm text-slate-700">Section</span>
                <input
                  className="form-control mt-2"
                  type="text"
                  placeholder="A"
                  value={form.section}
                  onChange={(e) => setForm((prev) => ({ ...prev, section: e.target.value }))}
                  required
                />
              </label>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block">
                <span className="text-sm text-slate-700">Day</span>
                <select
                  className="form-control mt-2"
                  value={form.day}
                  onChange={(e) => setForm((prev) => ({ ...prev, day: e.target.value }))}
                >
                  {weekdays.map((day) => (
                    <option key={day} value={day}>
                      {day}
                    </option>
                  ))}
                </select>
              </label>
              <label className="block">
                <span className="text-sm text-slate-700">Period</span>
                <input
                  className="form-control mt-2"
                  type="number"
                  min="1"
                  value={form.period}
                  onChange={(e) => setForm((prev) => ({ ...prev, period: Number(e.target.value) }))}
                  required
                />
              </label>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block">
                <span className="text-sm text-slate-700">Start time</span>
                <input
                  className="form-control mt-2"
                  type="time"
                  value={form.startTime}
                  onChange={(e) => setForm((prev) => ({ ...prev, startTime: e.target.value }))}
                  required
                />
              </label>
              <label className="block">
                <span className="text-sm text-slate-700">End time</span>
                <input
                  className="form-control mt-2"
                  type="time"
                  value={form.endTime}
                  onChange={(e) => setForm((prev) => ({ ...prev, endTime: e.target.value }))}
                  required
                />
              </label>
            </div>

            <label className="block">
              <span className="text-sm text-slate-700">Room</span>
              <input
                className="form-control mt-2"
                type="text"
                placeholder="e.g. 101"
                value={form.roomNumber}
                onChange={(e) => setForm((prev) => ({ ...prev, roomNumber: e.target.value }))}
              />
            </label>

            {error && <div className="alert-error">{error}</div>}

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <button type="submit" className="button button-primary" disabled={saving}>
                {saving ? 'Saving...' : editingId ? 'Update entry' : 'Create entry'}
              </button>
              <button type="button" className="button button-secondary" onClick={resetForm}>
                Reset form
              </button>
            </div>
          </form>
        </section>

        <section className="section-panel">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h3 className="text-lg font-semibold text-slate-950">Weekly Schedule</h3>
              <p className="text-sm text-slate-500">Filter by teacher, subject or section.</p>
            </div>
            <div className="grid gap-3 sm:grid-cols-3">
              <select
                className="form-control"
                value={filters.teacherId}
                onChange={(e) => setFilters((prev) => ({ ...prev, teacherId: e.target.value }))}
              >
                <option value="">All teachers</option>
                {teachers.map((teacher) => (
                  <option key={teacher._id} value={teacher._id}>
                    {teacher.userId?.name || teacher.userId?.email}
                  </option>
                ))}
              </select>

              <select
                className="form-control"
                value={filters.subjectId}
                onChange={(e) => setFilters((prev) => ({ ...prev, subjectId: e.target.value }))}
              >
                <option value="">All subjects</option>
                {subjects.map((subject) => (
                  <option key={subject._id} value={subject._id}>
                    {subject.subjectName}
                  </option>
                ))}
              </select>

              <input
                className="form-control"
                type="text"
                placeholder="Section filter"
                value={filters.section}
                onChange={(e) => setFilters((prev) => ({ ...prev, section: e.target.value }))}
              />
            </div>
          </div>

          {loading ? (
            <div className="notice-card mt-6">Loading timetable...</div>
          ) : filteredEntries.length === 0 ? (
            <div className="notice-card mt-6">No timetable entries match the selected filters.</div>
          ) : (
            <div className="space-y-5 mt-6">
              {Object.entries(groupedByDay).map(([day, items]) => (
                <div key={day} className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
                  <div className="mb-4 flex items-center justify-between gap-4">
                    <div>
                      <h4 className="text-base font-semibold text-slate-950">{day}</h4>
                      <p className="text-sm text-slate-500">{items.length} scheduled class{items.length !== 1 ? 'es' : ''}</p>
                    </div>
                  </div>
                  <div className="space-y-4">
                    {items.map((item) => (
                      <div key={item._id} className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                          <div>
                            <div className="font-semibold text-slate-950">{item.subjectId?.subjectName}</div>
                            <div className="text-sm text-slate-500">{item.subjectId?.subjectCode} · Semester {item.semester} · {item.course || 'Class'}-{item.section}</div>
                          </div>
                          <div className="text-sm text-slate-500">{item.startTime} - {item.endTime} · Room {item.roomNumber || 'TBD'}</div>
                        </div>
                        <div className="mt-3 flex flex-wrap gap-2 text-sm">
                          <span className="rounded-full bg-slate-100 px-3 py-1 text-slate-600">Teacher: {item.teacherId?.userId?.name || 'Unassigned'}</span>
                          <span className="rounded-full bg-slate-100 px-3 py-1 text-slate-600">Period {item.period}</span>
                          <button className="button button-secondary" type="button" onClick={() => handleEdit(item)}>
                            Edit
                          </button>
                          <button className="button button-secondary" type="button" onClick={() => handleDelete(item._id)}>
                            Delete
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default TimetableManagement;
