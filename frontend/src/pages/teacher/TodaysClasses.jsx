import { useEffect, useState } from 'react';
import { getTodaysClasses } from '../../api/timetable.api';
import { Link } from 'react-router-dom';

const TodaysClasses = () => {
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await getTodaysClasses();
        setClasses(res.data.classes || []);
      } catch (err) {
        setClasses([]);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) return <div>Loading classes...</div>;

  return (
    <div>
      <div className="page-header">
        <div>
          <h2>Today's Classes</h2>
          <p className="text-muted">Classes for today. Click a class to take attendance.</p>
        </div>
      </div>
      <div className="panel-grid columns-2">
        {classes.map((c) => (
          <div key={c._id} className="section-card">
            <h3>{c.subjectId?.subjectName}</h3>
            <div className="text-muted">Semester {c.semester} — Section {c.section}</div>
            <div>{c.startTime} - {c.endTime}</div>
            <Link to={`/teacher/attendance/take/${c._id}`} className="button button-primary" style={{ marginTop: 12 }}>Take Attendance</Link>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TodaysClasses;
