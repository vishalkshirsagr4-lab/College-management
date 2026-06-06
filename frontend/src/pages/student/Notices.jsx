import { useEffect, useState } from 'react';
import { getNotices } from '../../api/student.api';
import LoadingSkeleton from '../../components/ui/LoadingSkeleton';

const Notices = () => {
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const response = await getNotices();
        setNotices(response.data.notices || []);
      } catch {
        setNotices([]);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  return (
    <div>
      <div className="section-card">
        <div>
          <h1 className="page-title">Notices</h1>
          <p className="page-description">Stay updated with campus announcements and class alerts.</p>
        </div>
      </div>

      {loading ? (
        <LoadingSkeleton rows={3} columns={1} />
      ) : notices.length === 0 ? (
        <div className="section-card">No notices are available at the moment.</div>
      ) : (
        <div className="list-card">
          {notices.map((notice) => (
            <article key={notice._id} className="notice-card">
              <div className="notice-meta">
                <span className="status-pill green">New</span>
                <span>{new Date(notice.createdAt).toLocaleDateString()}</span>
              </div>
              <h3>{notice.title}</h3>
              <p>{notice.description}</p>
            </article>
          ))}
        </div>
      )}
    </div>
  );
};

export default Notices;
