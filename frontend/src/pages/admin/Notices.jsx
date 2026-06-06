import { useEffect, useState } from 'react';
import { createNotice, deleteNotice, getNotices } from '../../api/notices.api';
import LoadingSkeleton from '../../components/ui/LoadingSkeleton';
import { toast } from 'react-toastify';

const Notices = () => {
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [form, setForm] = useState({ title: '', description: '', attachment: null, targetSemester: '' });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const response = await getNotices();
        setNotices(response.data.notices || []);
      } catch (error) {
        toast.error('Unable to load notices.');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handleChange = (key) => (event) => {
    const value = key === 'attachment' ? event.target.files[0] : event.target.value;
    setForm({ ...form, [key]: value });
  };

  const handleCreate = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('title', form.title);
      formData.append('description', form.description);
      if (form.targetSemester) formData.append('targetSemester', form.targetSemester);
      if (form.attachment) {
        formData.append('attachment', form.attachment);
      }

      const { data } = await createNotice(formData);
      setNotices((prev) => [data.notice, ...prev]);
      setForm({ title: '', description: '', attachment: null });
      toast.success('Notice created successfully.');
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Unable to create notice.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteNotice(id);
      setNotices((prev) => prev.filter((notice) => notice._id !== id));
      toast.success('Notice deleted.');
    } catch {
      toast.error('Could not delete notice.');
    }
  };

  const filtered = notices.filter((notice) => {
    const query = search.toLowerCase();
    return (
      notice.title?.toLowerCase().includes(query) ||
      notice.description?.toLowerCase().includes(query)
    );
  });

  return (
    <div>
      <div className="section-card section-header">
        <div>
          <h1 className="page-title">Notice Board</h1>
          <p className="page-description">Create announcements and upload attachments for users.</p>
        </div>
      </div>

      <article className="section-panel">
        <h2>Create new notice</h2>
        <form className="form-grid" onSubmit={handleCreate}>
          <label>Title</label>
          <input value={form.title} onChange={handleChange('title')} required />
          <label>Description</label>
          <textarea value={form.description} onChange={handleChange('description')} required />
          <label>Target semester (optional)</label>
          <input type="number" min="1" value={form.targetSemester} onChange={handleChange('targetSemester')} placeholder="e.g. 3" />
          <label>Attachment</label>
          <input type="file" onChange={handleChange('attachment')} />
          <button type="submit" className="button button-primary" disabled={submitting}>
            {submitting ? 'Saving...' : 'Create Notice'}
          </button>
        </form>
      </article>

      <article className="section-panel">
        <input
          type="search"
          placeholder="Search notices by title or content"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="form-control"
        />
        {loading ? (
          <LoadingSkeleton rows={4} columns={1} />
        ) : filtered.length === 0 ? (
          <div className="notice-card">No notices available.</div>
        ) : (
          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Description</th>
                  <th>Date</th>
                  <th>Attachment</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((notice) => (
                  <tr key={notice._id}>
                    <td>{notice.title}</td>
                    <td>{notice.description}</td>
                    <td>{new Date(notice.createdAt).toLocaleDateString()}</td>
                    <td>
                      {notice.attachment?.url ? (
                        <a className="button button-secondary" href={notice.attachment.url} target="_blank" rel="noreferrer">
                          Open
                        </a>
                      ) : (
                        '—'
                      )}
                    </td>
                    <td>
                      <button className="button button-secondary" onClick={() => handleDelete(notice._id)}>
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </article>
    </div>
  );
};

export default Notices;
