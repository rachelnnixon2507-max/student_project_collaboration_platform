import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  User,
  Mail,
  Building,
  Award,
  Globe,
  Link2,
  Edit3,
  CheckCircle2,
  AlertCircle,
  FolderGit2,
  Users2,
  Clock,
  Send,
  ArrowRight,
  ShieldCheck,
  GraduationCap
} from 'lucide-react';
import { getUser, isAuthenticated } from '../services/adminService';
import {
  fetchMyProfile,
  updateMyProfile,
  fetchMyCreatedProjects,
  fetchMyJoinedProjects,
  fetchMySentJoinRequests
} from '../services/projectService';

export default function Profile() {
  const navigate = useNavigate();
  const loggedIn = isAuthenticated();
  const currentUser = getUser();

  const [profile, setProfile] = useState(null);
  const [createdProjects, setCreatedProjects] = useState([]);
  const [joinedProjects, setJoinedProjects] = useState([]);
  const [sentRequests, setSentRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Edit Modal State
  const [showEditModal, setShowEditModal] = useState(false);
  const [deptInput, setDeptInput] = useState('');
  const [skillsInput, setSkillsInput] = useState('');
  const [bioInput, setBioInput] = useState('');
  const [githubInput, setGithubInput] = useState('');
  const [linkedinInput, setLinkedinInput] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!loggedIn) {
      navigate('/login');
      return;
    }
    loadProfileData();
  }, [loggedIn, navigate]);

  const loadProfileData = async () => {
    setLoading(true);
    setError('');
    try {
      const [profData, created, joined, reqs] = await Promise.all([
        fetchMyProfile().catch(() => null),
        fetchMyCreatedProjects().catch(() => []),
        fetchMyJoinedProjects().catch(() => []),
        fetchMySentJoinRequests().catch(() => []),
      ]);

      setProfile(profData);
      setCreatedProjects(created || []);
      setJoinedProjects(joined || []);
      setSentRequests(reqs || []);

      if (profData) {
        setDeptInput(profData.department || currentUser?.department || '');
        setSkillsInput(profData.skills || '');
        setBioInput(profData.bio || '');
        setGithubInput(profData.githubUrl || '');
        setLinkedinInput(profData.linkedinUrl || '');
      }
    } catch (err) {
      setError(err.message || 'Failed to load profile details');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      const updated = await updateMyProfile({
        department: deptInput,
        skills: skillsInput,
        bio: bioInput,
        githubUrl: githubInput,
        linkedinUrl: linkedinInput,
      });
      setProfile(updated);
      setSuccessMsg('Portfolio profile updated successfully!');
      setShowEditModal(false);
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      setError(err.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const institutionalId = currentUser?.institutionalId || (currentUser?.role === 'STUDENT' ? 'STU10001' : currentUser?.role === 'FACULTY' ? 'FAC10001' : 'ADM10001');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Alerts */}
      {successMsg && (
        <div style={{ background: 'var(--success-50)', color: 'var(--success-700)', padding: '12px 16px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--success-100)', display: 'flex', alignItems: 'center', gap: 8, fontSize: 13.5 }}>
          <CheckCircle2 size={16} /> {successMsg}
        </div>
      )}

      {error && (
        <div style={{ background: 'var(--danger-50)', color: 'var(--danger-700)', padding: '12px 16px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--danger-100)', display: 'flex', alignItems: 'center', gap: 8, fontSize: 13.5 }}>
          <AlertCircle size={16} /> {error}
        </div>
      )}

      {/* Profile Card Header */}
      <div className="card" style={{ padding: 32 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
            <div style={{
              width: 72,
              height: 72,
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #4f46e5 0%, #818cf8 100%)',
              color: '#ffffff',
              display: 'grid',
              placeItems: 'center',
              fontSize: 28,
              fontWeight: 800,
              boxShadow: 'var(--shadow-md)'
            }}>
              {currentUser?.name ? currentUser.name.charAt(0).toUpperCase() : 'U'}
            </div>

            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
                <h1 style={{ fontSize: 22, fontWeight: 800 }}>{currentUser?.name || 'Student Member'}</h1>
                <span className={`badge ${currentUser?.role === 'ADMIN' ? 'badge-admin' : currentUser?.role === 'FACULTY' ? 'badge-faculty' : 'badge-student'}`}>
                  {currentUser?.role || 'STUDENT'}
                </span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: 13, color: 'var(--text-muted)' }}>
                <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--primary-700)' }}>
                  ID: {institutionalId}
                </span>
                <span>•</span>
                <span>{currentUser?.email}</span>
                <span>•</span>
                <span>{profile?.department || currentUser?.department || 'Department of Computer Science'}</span>
              </div>
            </div>
          </div>

          <button onClick={() => setShowEditModal(true)} className="btn btn-secondary">
            <Edit3 size={15} /> Edit Portfolio
          </button>
        </div>

        {/* Bio & Skills */}
        <div style={{ marginTop: 24, paddingTop: 20, borderTop: '1px solid var(--border-default)', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20 }}>
          <div>
            <h4 style={{ fontSize: 12, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 8, letterSpacing: '0.05em' }}>
              Academic Biography
            </h4>
            <p style={{ fontSize: 13.5, color: 'var(--text-secondary)', lineHeight: 1.6 }}>
              {profile?.bio || 'Undergraduate student enthusiastic about scalable web development, collaborative teamwork, and AI-driven solutions.'}
            </p>
          </div>

          <div>
            <h4 style={{ fontSize: 12, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 8, letterSpacing: '0.05em' }}>
              Verified Skill Radar
            </h4>
            <div className="skills-wrap">
              {(profile?.skills || currentUser?.skills || 'React, Spring Boot, Java, MySQL, Git').split(',').map((s) => (
                <span key={s} className="skill-tag" style={{ padding: '4px 10px', fontSize: 12.5 }}>
                  {s.trim()}
                </span>
              ))}
            </div>

            {(profile?.githubUrl || profile?.linkedinUrl) && (
              <div style={{ display: 'flex', gap: 12, marginTop: 14 }}>
                {profile.githubUrl && (
                  <a href={profile.githubUrl.startsWith('http') ? profile.githubUrl : `https://${profile.githubUrl}`} target="_blank" rel="noreferrer" className="btn btn-ghost btn-sm" style={{ padding: '4px 8px', fontSize: 12 }}>
                    <Link2 size={13} /> GitHub Profile
                  </a>
                )}
                {profile.linkedinUrl && (
                  <a href={profile.linkedinUrl.startsWith('http') ? profile.linkedinUrl : `https://${profile.linkedinUrl}`} target="_blank" rel="noreferrer" className="btn btn-ghost btn-sm" style={{ padding: '4px 8px', fontSize: 12 }}>
                    <Globe size={13} /> LinkedIn Profile
                  </a>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Project Track Record */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 20 }}>
        {/* Projects Led */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
            <h3 style={{ fontSize: 16, fontWeight: 700 }}>Projects I Lead ({createdProjects.length})</h3>
            <button onClick={() => navigate('/projects?create=true')} className="btn btn-ghost btn-sm" style={{ color: 'var(--primary-600)' }}>
              Pitch New
            </button>
          </div>

          {createdProjects.length === 0 ? (
            <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>No projects created yet.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {createdProjects.map((p) => (
                <div key={p.id} style={{ padding: 12, border: '1px solid var(--border-default)', borderRadius: 'var(--radius-sm)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <strong style={{ fontSize: 13.5 }}>{p.title}</strong>
                    <div style={{ fontSize: 11.5, color: 'var(--text-muted)' }}>Capacity: {p.memberCount || 1} / {p.maxMembers || 4} members</div>
                  </div>
                  <span className="badge badge-open">{p.status}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Teams Joined */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
            <h3 style={{ fontSize: 16, fontWeight: 700 }}>Teams Joined ({joinedProjects.length})</h3>
            <button onClick={() => navigate('/projects')} className="btn btn-ghost btn-sm" style={{ color: 'var(--primary-600)' }}>
              Browse
            </button>
          </div>

          {joinedProjects.length === 0 ? (
            <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>No joined teams yet.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {joinedProjects.map((p) => (
                <div key={p.id} style={{ padding: 12, border: '1px solid var(--border-default)', borderRadius: 'var(--radius-sm)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <strong style={{ fontSize: 13.5 }}>{p.title}</strong>
                    <div style={{ fontSize: 11.5, color: 'var(--text-muted)' }}>Lead: {p.creatorName || 'Student'}</div>
                  </div>
                  <button onClick={() => navigate('/tasks')} className="btn btn-outline-primary btn-sm" style={{ padding: '3px 8px', fontSize: 11 }}>
                    Workspace
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Edit Profile Modal */}
      {showEditModal && (
        <div className="modal-backdrop">
          <div className="modal-card" style={{ maxWidth: 540 }}>
            <div className="modal-header">
              <h3 style={{ fontSize: 18, fontWeight: 800 }}>Edit Portfolio Profile</h3>
              <button onClick={() => setShowEditModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 18 }}>✕</button>
            </div>

            <form onSubmit={handleSaveProfile}>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div className="form-group">
                  <label className="form-label">Academic Department</label>
                  <input
                    type="text"
                    className="form-input"
                    value={deptInput}
                    onChange={(e) => setDeptInput(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Skills (comma-separated)</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. React, Spring Boot, MySQL, Python"
                    value={skillsInput}
                    onChange={(e) => setSkillsInput(e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Bio & Interests</label>
                  <textarea
                    className="form-textarea"
                    placeholder="Share your technical passions and academic project interests..."
                    value={bioInput}
                    onChange={(e) => setBioInput(e.target.value)}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div className="form-group">
                    <label className="form-label">GitHub URL</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="github.com/username"
                      value={githubInput}
                      onChange={(e) => setGithubInput(e.target.value)}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">LinkedIn URL</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="linkedin.com/in/username"
                      value={linkedinInput}
                      onChange={(e) => setLinkedinInput(e.target.value)}
                    />
                  </div>
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" onClick={() => setShowEditModal(false)} className="btn btn-secondary">
                  Cancel
                </button>
                <button type="submit" disabled={saving} className="btn btn-primary">
                  {saving ? 'Saving...' : 'Save Portfolio'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
