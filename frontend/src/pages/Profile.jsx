import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  User, Mail, Building, Award, Globe, Link as LinkIcon, Edit3, 
  CheckCircle2, AlertCircle, X, FolderKanban, Users, Clock, Send, ArrowRight
} from 'lucide-react';
import PageHeader from '../components/PageHeader';
import { getUser, isAuthenticated } from '../services/adminService';
import { 
  fetchMyProfile, updateMyProfile, fetchMyCreatedProjects, 
  fetchMyJoinedProjects, fetchMySentJoinRequests 
} from '../services/projectService';
import '../styles/admin.css';
import '../styles/member1.css';

export default function Profile() {
  const navigate = useNavigate();
  const loggedIn = isAuthenticated();
  const user = getUser();

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
      setLoading(false);
      return;
    }
    loadProfileData();
  }, [loggedIn]);

  const loadProfileData = async () => {
    setLoading(true);
    setError('');
    try {
      const [profData, created, joined, reqs] = await Promise.all([
        fetchMyProfile(),
        fetchMyCreatedProjects().catch(() => []),
        fetchMyJoinedProjects().catch(() => []),
        fetchMySentJoinRequests().catch(() => []),
      ]);

      setProfile(profData);
      setCreatedProjects(created || []);
      setJoinedProjects(joined || []);
      setSentRequests(reqs || []);

      setDeptInput(profData.department || '');
      setSkillsInput(profData.skills || '');
      setBioInput(profData.bio || '');
      setGithubInput(profData.githubUrl || '');
      setLinkedinInput(profData.linkedinUrl || '');
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
      setSuccessMsg('Profile updated successfully!');
      setShowEditModal(false);
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      setError(err.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  if (!loggedIn) {
    return (
      <div style={{ textAlign: 'center', padding: '80px 20px' }}>
        <PageHeader title="Student Profile" description="Please log in to manage your profile and team activities." />
        <button onClick={() => navigate('/login')} className="primary" style={{ marginTop: '20px' }}>
          Sign In to Access Profile
        </button>
      </div>
    );
  }

  const skillList = profile?.skills
    ? profile.skills.split(',').map((s) => s.trim()).filter(Boolean)
    : [];

  return (
    <div className="projects-container">
      <div className="page-header">
        <div>
          <h2>Student Profile</h2>
          <p>Showcase your expertise, project portfolio, and collaboration journey.</p>
        </div>
        <button onClick={() => setShowEditModal(true)} className="primary">
          <Edit3 size={16} /> Edit Profile
        </button>
      </div>

      {successMsg && (
        <div style={{ background: '#ecfdf3', border: '1px solid #a6f4c5', color: '#16844a', padding: '12px 18px', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <CheckCircle2 size={18} />
          <span>{successMsg}</span>
        </div>
      )}

      {error && (
        <div style={{ background: '#fff0ef', border: '1px solid #fecdd3', color: '#c94b3d', padding: '12px 18px', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px', color: '#8791a5' }}>
          Loading profile...
        </div>
      ) : (
        <>
          {/* Profile Header Card */}
          <div className="profile-card">
            <div className="profile-header-layout">
              <div className="profile-avatar-large">
                {profile?.name ? profile.name.charAt(0).toUpperCase() : 'S'}
              </div>
              <div className="profile-details" style={{ flex: 1 }}>
                <h2>{profile?.name}</h2>
                <p style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Mail size={14} color="#8791a5" /> {profile?.email}
                  {profile?.department && (
                    <>
                      <span>•</span>
                      <Building size={14} color="#8791a5" /> {profile?.department}
                    </>
                  )}
                  <span>•</span>
                  <span className="pill student">STUDENT</span>
                </p>

                <p style={{ fontSize: '14px', lineHeight: '1.6', color: '#475569', margin: '10px 0 16px', maxWidth: '780px' }}>
                  {profile?.bio || 'No bio provided yet. Click "Edit Profile" to tell teams about your interests and goals!'}
                </p>

                <div className="profile-links">
                  {profile?.githubUrl && (
                    <a href={profile.githubUrl.startsWith('http') ? profile.githubUrl : `https://${profile.githubUrl}`} target="_blank" rel="noreferrer" className="social-link">
                      <Globe size={16} /> GitHub Profile
                    </a>
                  )}
                  {profile?.linkedinUrl && (
                    <a href={profile.linkedinUrl.startsWith('http') ? profile.linkedinUrl : `https://${profile.linkedinUrl}`} target="_blank" rel="noreferrer" className="social-link">
                      <LinkIcon size={16} /> LinkedIn Profile
                    </a>
                  )}
                </div>
              </div>
            </div>

            {/* Skills Badges */}
            <div style={{ marginTop: '24px', borderTop: '1px solid #f1f5f9', paddingTop: '18px' }}>
              <strong style={{ fontSize: '13px', color: '#64748b', textTransform: 'uppercase', display: 'block', marginBottom: '10px' }}>
                Skills & Technologies
              </strong>
              {skillList.length > 0 ? (
                <div className="skills-wrap">
                  {skillList.map((skill, idx) => (
                    <span key={idx} className="skill-tag accent" style={{ fontSize: '13px', padding: '6px 14px' }}>
                      {skill}
                    </span>
                  ))}
                </div>
              ) : (
                <span style={{ color: '#8791a5', fontSize: '13px' }}>No skills listed yet. Add skills so teammates can find you!</span>
              )}
            </div>

            {/* Statistics */}
            <div className="stats-grid-profile">
              <div className="stat-box">
                <span>Projects Posted</span>
                <strong>{createdProjects.length}</strong>
              </div>
              <div className="stat-box">
                <span>Teams Joined</span>
                <strong>{joinedProjects.length}</strong>
              </div>
              <div className="stat-box">
                <span>Join Requests Sent</span>
                <strong>{sentRequests.length}</strong>
              </div>
            </div>
          </div>

          {/* Two column layout for My Projects and My Teams */}
          <div className="admin-two-col">
            {/* My Created Projects */}
            <div className="panel">
              <div className="panel-title">
                <div>
                  <h3>Projects I Created</h3>
                  <p>Projects initiated and led by you.</p>
                </div>
                <span className="pill student">{createdProjects.length}</span>
              </div>

              {createdProjects.length === 0 ? (
                <p style={{ color: '#8791a5', fontSize: '13px', textAlign: 'center', padding: '24px 0' }}>
                  You haven't posted any projects yet.
                </p>
              ) : (
                <div style={{ display: 'grid', gap: '10px' }}>
                  {createdProjects.slice(0, 5).map((p) => (
                    <div key={p.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 14px', background: '#f8fafc', borderRadius: '10px', border: '1px solid #eef2f6' }}>
                      <div>
                        <strong style={{ fontSize: '14px', color: '#172033', display: 'block' }}>{p.title}</strong>
                        <span style={{ fontSize: '11px', color: '#8791a5' }}>
                          {p.memberCount} members • Status: {p.status}
                        </span>
                      </div>
                      <button onClick={() => navigate('/projects')} className="secondary" style={{ padding: '6px 12px', fontSize: '12px' }}>
                        View
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Teams I've Joined */}
            <div className="panel">
              <div className="panel-title">
                <div>
                  <h3>Teams Joined</h3>
                  <p>Collaborative project teams where you are a member.</p>
                </div>
                <span className="pill faculty">{joinedProjects.length}</span>
              </div>

              {joinedProjects.length === 0 ? (
                <p style={{ color: '#8791a5', fontSize: '13px', textAlign: 'center', padding: '24px 0' }}>
                  You haven't joined any external teams yet.
                </p>
              ) : (
                <div style={{ display: 'grid', gap: '10px' }}>
                  {joinedProjects.slice(0, 5).map((p) => (
                    <div key={p.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 14px', background: '#f8fafc', borderRadius: '10px', border: '1px solid #eef2f6' }}>
                      <div>
                        <strong style={{ fontSize: '14px', color: '#172033', display: 'block' }}>{p.title}</strong>
                        <span style={{ fontSize: '11px', color: '#8791a5' }}>
                          Led by {p.creatorName}
                        </span>
                      </div>
                      <button onClick={() => navigate('/teams')} className="secondary" style={{ padding: '6px 12px', fontSize: '12px' }}>
                        View Team
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </>
      )}

      {/* Edit Profile Modal */}
      {showEditModal && (
        <div className="modal-backdrop" onClick={() => setShowEditModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-head">
              <h3>Edit Student Profile</h3>
              <button className="icon-btn" onClick={() => setShowEditModal(false)}>
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleSaveProfile} className="form-grid">
              <label>
                Department / Major
                <input
                  type="text"
                  placeholder="e.g. Computer Science, Information Technology"
                  value={deptInput}
                  onChange={(e) => setDeptInput(e.target.value)}
                />
              </label>

              <label>
                Skills (comma separated)
                <input
                  type="text"
                  placeholder="e.g. React, Java, Spring Boot, MySQL, Figma"
                  value={skillsInput}
                  onChange={(e) => setSkillsInput(e.target.value)}
                />
              </label>

              <label className="full">
                Bio / Personal Pitch
                <textarea
                  rows={3}
                  placeholder="A short introduction about your academic background, passions, and what projects you want to build..."
                  value={bioInput}
                  onChange={(e) => setBioInput(e.target.value)}
                />
              </label>

              <label>
                GitHub Profile URL
                <input
                  type="text"
                  placeholder="e.g. github.com/username"
                  value={githubInput}
                  onChange={(e) => setGithubInput(e.target.value)}
                />
              </label>

              <label>
                LinkedIn Profile URL
                <input
                  type="text"
                  placeholder="e.g. linkedin.com/in/username"
                  value={linkedinInput}
                  onChange={(e) => setLinkedinInput(e.target.value)}
                />
              </label>

              <div className="form-actions">
                <button type="button" onClick={() => setShowEditModal(false)} className="secondary">
                  Cancel
                </button>
                <button type="submit" disabled={saving} className="primary">
                  {saving ? 'Saving...' : 'Save Profile'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
