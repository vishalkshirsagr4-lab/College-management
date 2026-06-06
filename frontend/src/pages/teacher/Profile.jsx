import { useEffect, useState } from 'react';
import { getTeacherProfile, updateTeacherProfile } from '../../api/teacher.api';
import LoadingSkeleton from '../../components/ui/LoadingSkeleton';
import { toast } from 'react-toastify';

const TeacherProfile = () => {
  const [profile, setProfile] = useState(null);
  const [form, setForm] = useState({ department: '', photo: null });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const response = await getTeacherProfile();
        const teacher = response.data.teacher || response.data.user || null;
        setProfile(teacher);
        setForm({ department: teacher?.department || '', photo: null });
      } catch (error) {
        toast.error('Unable to load profile.');
      } finally {
        setLoading(false);
      }
    };
    loadProfile();
  }, []);

  const handleChange = (key) => (event) => {
    const value = key === 'photo' ? event.target.files[0] : event.target.value;
    setForm({ ...form, [key]: value });
  };

  const handleSave = async (event) => {
    event.preventDefault();
    setSaving(true);
    try {
      const formData = new FormData();
      formData.append('department', form.department);
      if (form.photo) {
        formData.append('photo', form.photo);
      }
      const response = await updateTeacherProfile(formData);
      setProfile(response.data.teacher || profile);
      toast.success('Profile updated successfully.');
      setForm((prev) => ({ ...prev, photo: null }));
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Unable to update profile.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <LoadingSkeleton rows={3} columns={1} />;
  }

  if (!profile) {
    return <div className="notice-card">Teacher profile not available.</div>;
  }

  return (
    <div>
      <div className="section-card section-header">
        <div>
          <h1 className="page-title">Teacher Profile</h1>
          <p className="page-description">Your account details and teaching information.</p>
        </div>
      </div>
      <article className="section-panel">
        <div className="profile-grid">
          <div>
            <h3>Profile Photo</h3>
            {profile.photo?.url || profile.userId?.profileImage?.url ? (
              <img src={profile.photo?.url || profile.userId?.profileImage?.url} alt="Profile" className="avatar-large" />
            ) : (
              <div className="avatar-placeholder">No photo</div>
            )}
          </div>
          <div>
            <h3>Name</h3>
            <p>{profile.name || profile.userId?.name}</p>
          </div>
          <div>
            <h3>Email</h3>
            <p>{profile.email || profile.userId?.email}</p>
          </div>
          <div>
            <h3>Department</h3>
            <p>{profile.department || 'N/A'}</p>
          </div>
          <div>
            <h3>Assigned Subjects</h3>
            <p>{Array.isArray(profile.subjects) ? profile.subjects.map((subject) => subject.subjectName).join(', ') : profile.subjects || 'Not assigned'}</p>
          </div>
        </div>
      </article>

      <article className="section-panel">
        <h2>Update profile</h2>
        <form className="form-grid" onSubmit={handleSave}>
          <label>Department</label>
          <input value={form.department} onChange={handleChange('department')} placeholder="Department" />
          <label>Upload new photo</label>
          <input type="file" accept="image/*" onChange={handleChange('photo')} />
          <button type="submit" className="button button-primary" disabled={saving}>
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </form>
      </article>
    </div>
  );
};

export default TeacherProfile;
