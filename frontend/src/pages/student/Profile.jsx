import { useEffect, useState } from 'react';
import { getStudentProfile, updateStudentProfile, getSubjects, updateStudentSubjects } from '../../api/student.api';
import LoadingSkeleton from '../../components/ui/LoadingSkeleton';
import { toast } from 'react-toastify';

const Profile = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ usn: '', semester: '', section: '', phone: '', photo: null });
  const [saving, setSaving] = useState(false);
  const [subjects, setSubjects] = useState([]);
  const [selectedSubjects, setSelectedSubjects] = useState([]);
  const [savingSubjects, setSavingSubjects] = useState(false);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const response = await getStudentProfile();
        const student = response.data.student || null;
        setProfile(student);
        setSelectedSubjects((student?.subjects || []).map((s) => s._id));
        setForm({
          usn: student?.usn || '',
          semester: student?.semester || '',
          section: student?.section || '',
          phone: student?.phone || '',
          photo: null,
        });
      } catch {
        setProfile(null);
      } finally {
        setLoading(false);
      }
    };
    const loadSubjects = async () => {
      try {
        const res = await getSubjects();
        setSubjects(res.data.subjects || []);
      } catch {
        setSubjects([]);
      }
    };
    loadProfile();
    loadSubjects();
  }, []);

  const handleChange = (key) => (event) => {
    const value = key === 'photo' ? event.target.files[0] : event.target.value;
    setForm({ ...form, [key]: value });
  };

  const handleSave = async (event) => {
    event.preventDefault();
    if (!profile?._id) {
      toast.error('No student profile available to update.');
      return;
    }

    setSaving(true);
    try {
      const formData = new FormData();
      formData.append('usn', form.usn);
      formData.append('semester', form.semester);
      formData.append('section', form.section);
      formData.append('phone', form.phone);
      if (form.photo) {
        formData.append('photo', form.photo);
      }
      const response = await updateStudentProfile(profile._id, formData);
      setProfile(response.data.student);
      toast.success('Profile updated successfully.');
      setForm((prev) => ({ ...prev, photo: null }));
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Unable to update profile.');
    } finally {
      setSaving(false);
    }
  };

  const toggleSubject = (subjectId) => {
    setSelectedSubjects((prev) => (prev.includes(subjectId) ? prev.filter((s) => s !== subjectId) : [...prev, subjectId]));
  };

  const saveSubjects = async () => {
    if (!profile?._id) return;
    setSavingSubjects(true);
    try {
      const res = await updateStudentSubjects(profile._id, selectedSubjects);
      setProfile(res.data.student);
      toast.success('Subjects updated');
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Unable to update subjects');
    } finally {
      setSavingSubjects(false);
    }
  };

  if (loading) {
    return <LoadingSkeleton rows={2} columns={1} />;
  }

  if (!profile) {
    return <div className="section-card">Unable to load profile information.</div>;
  }

  return (
    <div>
      <div className="section-card">
        <div>
          <h1 className="page-title">Profile</h1>
          <p className="page-description">View and manage your student profile details quickly.</p>
        </div>
      </div>

      <div className="section-grid columns-2">
        <article className="profile-card">
          <div className="profile-card-top">
            <h2>{profile.userId?.name || 'Student Name'}</h2>
            <span className="status-pill green">{profile.userId?.role || 'student'}</span>
          </div>
          {profile.photo?.url ? (
            <img className="avatar-large" src={profile.photo.url} alt="Student" />
          ) : (
            <div className="avatar-placeholder">No photo</div>
          )}
          <p>{profile.userId?.email}</p>
          <div className="profile-detail-grid">
            <div>
              <span className="text-muted">USN</span>
              <p>{profile.usn}</p>
            </div>
            <div>
              <span className="text-muted">Semester</span>
              <p>{profile.semester}</p>
            </div>
            <div>
              <span className="text-muted">Section</span>
              <p>{profile.section}</p>
            </div>
            <div>
              <span className="text-muted">Phone</span>
              <p>{profile.phone}</p>
            </div>
          </div>
        </article>

        <article className="profile-card">
          <h2>Update Profile</h2>
          <form className="form-grid" onSubmit={handleSave}>
            <label>USN</label>
            <input value={form.usn} onChange={handleChange('usn')} required />
            <label>Semester</label>
            <input type="number" value={form.semester} onChange={handleChange('semester')} required />
            <label>Section</label>
            <input value={form.section} onChange={handleChange('section')} required />
            <label>Phone</label>
            <input value={form.phone} onChange={handleChange('phone')} required />
            <label>Upload photo</label>
            <input type="file" accept="image/*" onChange={handleChange('photo')} />
            <button type="submit" className="button button-primary" disabled={saving}>
              {saving ? 'Updating...' : 'Update Profile'}
            </button>
          </form>
          <div style={{ marginTop: 16 }}>
            <h3>Select Subjects</h3>
            <div className="checkbox-grid">
              {subjects.map((sub) => (
                <label key={sub._id} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <input type="checkbox" checked={selectedSubjects.includes(sub._id)} onChange={() => toggleSubject(sub._id)} />
                  <span>{sub.subjectName} ({sub.subjectCode})</span>
                </label>
              ))}
            </div>
            <button className="button button-primary" onClick={saveSubjects} disabled={savingSubjects} style={{ marginTop: 12 }}>
              {savingSubjects ? 'Saving...' : 'Save Subjects'}
            </button>
          </div>
        </article>
      </div>
    </div>
  );
};

export default Profile;
