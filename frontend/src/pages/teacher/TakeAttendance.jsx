import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getAttendance } from '../../api/attendance.api';
import { getStudents } from '../../api/admin.api';
import { createAttendance } from '../../api/attendance.api';

const TakeAttendance = () => {
  const { id } = useParams(); // timetableId
  const navigate = useNavigate();
  const [students, setStudents] = useState([]);
  const [entries, setEntries] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        // fetch students in related section via admin students endpoint
        const res = await getStudents();
        const all = res.data.students || [];
        // filter by section later on client if needed
        setStudents(all);
        const initial = {};
        all.forEach((s) => { initial[s._id] = 'present'; });
        setEntries(initial);
      } catch (err) {
        setStudents([]);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  const setStatus = (studentId, status) => setEntries((p) => ({ ...p, [studentId]: status }));

  const submit = async () => {
    setSaving(true);
    try {
      const payload = {
        timetableId: id,
        date: new Date().toISOString(),
        entries: Object.entries(entries).map(([studentId, status]) => ({ studentId, status: status.toLowerCase() })),
      };
      await createAttendance(payload);
      navigate('/teacher/attendance');
    } catch (err) {
      // TODO: show error
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div>Loading students...</div>;

  return (
    <div>
      <div className="page-header">
        <div>
          <h2>Take Attendance</h2>
          <p className="text-muted">Mark student attendance for this period.</p>
        </div>
      </div>
      <div className="section-card">
        <div style={{ display: 'grid', gap: 8 }}>
          <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
            <button className="button" onClick={() => { const all = {}; students.forEach(s=> all[s._id]='present'); setEntries(all); }}>Mark All Present</button>
            <button className="button" onClick={() => { const all = {}; students.forEach(s=> all[s._id]='absent'); setEntries(all); }}>Mark All Absent</button>
          </div>
          <div style={{ display: 'grid', gap: 6 }}>
            {students.map((s) => (
              <div key={s._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>{s.usn || s.userId?.name || s._id}</div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <select value={entries[s._id] || 'present'} onChange={(e) => setStatus(s._id, e.target.value)}>
                    <option value="present">Present</option>
                    <option value="absent">Absent</option>
                    <option value="late">Late</option>
                    <option value="medical">Medical</option>
                    <option value="approved">Approved</option>
                  </select>
                </div>
              </div>
            ))}
          </div>
          <div style={{ marginTop: 12 }}>
            <button className="button button-primary" onClick={submit} disabled={saving}>{saving ? 'Saving...' : 'Submit Attendance'}</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TakeAttendance;
