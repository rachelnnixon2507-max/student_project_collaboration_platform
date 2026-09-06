import { useState, useEffect } from 'react';
import PageHeader from '../components/PageHeader';
import '../styles/collaboration.css';
import {
  fetchMatchingCandidatesForProject,
  fetchMatchingProjectsForStudent,
  matchCustomSkills
} from '../services/collaborationService';
import { fetchProjects, getUser } from '../services/adminService';

export default function Teams() {
  const [activeTab, setActiveTab] = useState('projectMatch'); // 'projectMatch' | 'studentMatch' | 'customMatch'
  const [projects, setProjects] = useState([]);
  const [selectedProjectId, setSelectedProjectId] = useState(1);

  const [candidates, setCandidates] = useState([]);
  const [recommendedProjects, setRecommendedProjects] = useState([]);
  const [customCandidates, setCustomCandidates] = useState([]);

  // Custom match form
  const [customSkillsInput, setCustomSkillsInput] = useState('Java, Spring Boot, React');
  const [customDeptInput, setCustomDeptInput] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const currentUser = getUser();

  useEffect(() => {
    async function loadProjects() {
      try {
        const res = await fetchProjects();
        if (res && res.content && res.content.length > 0) {
          setProjects(res.content);
          setSelectedProjectId(res.content[0].id);
        } else {
          setProjects([
            { id: 1, title: 'Campus Smart Parking', requiredSkills: 'Java, Spring Boot, React' },
            { id: 2, title: 'AI Study Planner', requiredSkills: 'Python, React, FastApi' },
            { id: 3, title: 'IoT Lab Monitor', requiredSkills: 'C++, Microcontrollers, MQTT' },
            { id: 4, title: 'Student Event Hub', requiredSkills: 'Java, MySQL, React' },
          ]);
        }
      } catch (err) {
        setProjects([
          { id: 1, title: 'Campus Smart Parking', requiredSkills: 'Java, Spring Boot, React' },
          { id: 2, title: 'AI Study Planner', requiredSkills: 'Python, React, FastApi' },
          { id: 3, title: 'IoT Lab Monitor', requiredSkills: 'C++, Microcontrollers, MQTT' },
          { id: 4, title: 'Student Event Hub', requiredSkills: 'Java, MySQL, React' },
        ]);
      }
    }
    loadProjects();
  }, []);

  useEffect(() => {
    if (activeTab === 'projectMatch' && selectedProjectId) {
      loadProjectCandidates(selectedProjectId);
    } else if (activeTab === 'studentMatch') {
      loadStudentProjects();
    }
  }, [activeTab, selectedProjectId]);

  async function loadProjectCandidates(pid) {
    setLoading(true);
    setError('');
    try {
      const res = await fetchMatchingCandidatesForProject(pid, 10);
      setCandidates(res || []);
    } catch (err) {
      setError(err.message || 'Failed to fetch AI candidate matches');
    } finally {
      setLoading(false);
    }
  }

  async function loadStudentProjects() {
    setLoading(true);
    setError('');
    try {
      const studentId = currentUser?.id || 1;
      const res = await fetchMatchingProjectsForStudent(studentId, 10);
      setRecommendedProjects(res || []);
    } catch (err) {
      setError(err.message || 'Failed to fetch recommended projects');
    } finally {
      setLoading(false);
    }
  }

  async function handleCustomSearch(e) {
    e.preventDefault();
    if (!customSkillsInput.trim()) return;
    setLoading(true);
    setError('');
    try {
      const res = await matchCustomSkills(customSkillsInput, customDeptInput, 10);
      setCustomCandidates(res || []);
    } catch (err) {
      setError(err.message || 'Custom match search failed');
    } finally {
      setLoading(false);
    }
  }

  const selectedProj = projects.find(p => p.id === Number(selectedProjectId));

  return (
    <div className="collab-container">
      <div className="page-header">
        <div>
          <h2>AI Smart Team Matching</h2>
          <p>Intelligent multi-factor teammate discovery, skill gap analysis, and team formation.</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="collab-tabs">
        <button
          className={`collab-tab-btn ${activeTab === 'projectMatch' ? 'active' : ''}`}
          onClick={() => setActiveTab('projectMatch')}
        >
          🎯 Find Candidates for Project
        </button>
        <button
          className={`collab-tab-btn ${activeTab === 'studentMatch' ? 'active' : ''}`}
          onClick={() => setActiveTab('studentMatch')}
        >
          🔍 Discover Projects for Me
        </button>
        <button
          className={`collab-tab-btn ${activeTab === 'customMatch' ? 'active' : ''}`}
          onClick={() => setActiveTab('customMatch')}
        >
          ⚡ Custom Skill Search
        </button>
      </div>

      {error && (
        <div style={{ padding: '12px 16px', background: '#fee2e2', color: '#b91c1c', borderRadius: '8px' }}>
          {error}
        </div>
      )}

      {/* Tab 1: Project Candidate Matching */}
      {activeTab === 'projectMatch' && (
        <div>
          <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '16px 20px', marginBottom: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', color: '#64748b', fontWeight: 600, marginBottom: '4px' }}>
                  Target Project
                </label>
                <select
                  value={selectedProjectId}
                  onChange={(e) => setSelectedProjectId(Number(e.target.value))}
                  style={{ padding: '8px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', fontWeight: 600 }}
                >
                  {projects.map(p => (
                    <option key={p.id} value={p.id}>{p.title}</option>
                  ))}
                </select>
              </div>
              {selectedProj && (
                <div>
                  <span style={{ fontSize: '12px', color: '#64748b', display: 'block', marginBottom: '4px' }}>Required Skills</span>
                  <div className="skills-wrap">
                    {(selectedProj.requiredSkills || '').split(',').map((s, idx) => (
                      <span key={idx} className="skill-tag skill-matched">
                        {s.trim()}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {loading ? (
            <p>Analyzing candidate profiles with AI...</p>
          ) : candidates.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">👥</div>
              <h3>No candidates found</h3>
              <p>All available students are already team members, or no registered students match criteria.</p>
            </div>
          ) : (
            <div className="ai-match-grid">
              {candidates.map(c => {
                const scoreClass = c.matchScore >= 80 ? 'match-score-high' : c.matchScore >= 50 ? 'match-score-med' : 'match-score-low';
                return (
                  <div key={c.studentId} className="ai-match-card">
                    <span className={`match-score-badge ${scoreClass}`}>
                      {c.matchScore}%
                    </span>

                    <div className="candidate-header">
                      <h4 className="candidate-name">{c.name}</h4>
                      <p className="candidate-sub">{c.department} Dept • {c.email}</p>
                    </div>

                    {c.bio && <p style={{ fontSize: '12px', color: '#475569', margin: 0 }}>"{c.bio}"</p>}

                    <div>
                      <span style={{ fontSize: '11px', fontWeight: 700, color: '#64748b', display: 'block', marginBottom: '4px' }}>
                        MATCHED SKILLS
                      </span>
                      <div className="skills-wrap">
                        {c.matchedSkills.length > 0 ? (
                          c.matchedSkills.map((s, idx) => (
                            <span key={idx} className="skill-tag skill-matched">✓ {s}</span>
                          ))
                        ) : (
                          <span style={{ fontSize: '11px', color: '#94a3b8' }}>None</span>
                        )}
                        {c.missingSkills.map((s, idx) => (
                          <span key={idx} className="skill-tag skill-missing">{s}</span>
                        ))}
                      </div>
                    </div>

                    <div className="ai-rationale-box">
                      <b>AI Recommendation:</b> {c.recommendationRationale}
                    </div>

                    <div style={{ display: 'flex', gap: '8px', marginTop: 'auto' }}>
                      <a
                        href={`/messages`}
                        style={{
                          flex: 1,
                          textAlign: 'center',
                          padding: '8px',
                          background: '#eef2ff',
                          color: '#315bea',
                          borderRadius: '6px',
                          fontSize: '12px',
                          fontWeight: 600,
                          textDecoration: 'none'
                        }}
                      >
                        Direct Message
                      </a>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Discover Projects for Current Student */}
      {activeTab === 'studentMatch' && (
        <div>
          {loading ? (
            <p>Finding matching open projects for your profile...</p>
          ) : recommendedProjects.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">🚀</div>
              <h3>No projects available to match</h3>
              <p>You have already joined all active projects or no open projects are currently recruiting.</p>
            </div>
          ) : (
            <div className="ai-match-grid">
              {recommendedProjects.map(p => {
                const scoreClass = p.matchScore >= 80 ? 'match-score-high' : p.matchScore >= 50 ? 'match-score-med' : 'match-score-low';
                return (
                  <div key={p.projectId} className="ai-match-card">
                    <span className={`match-score-badge ${scoreClass}`}>
                      {p.matchScore}%
                    </span>

                    <div className="candidate-header">
                      <h4 className="candidate-name">{p.projectTitle}</h4>
                      <p className="candidate-sub">Led by {p.leaderName} • Status: {p.projectStatus}</p>
                    </div>

                    <p style={{ fontSize: '13px', color: '#475569', margin: 0 }}>{p.description}</p>

                    <div>
                      <span style={{ fontSize: '11px', fontWeight: 700, color: '#64748b', display: 'block', marginBottom: '4px' }}>
                        MATCHED SKILLS
                      </span>
                      <div className="skills-wrap">
                        {p.matchedSkills.map((s, idx) => (
                          <span key={idx} className="skill-tag skill-matched">✓ {s}</span>
                        ))}
                        {p.missingSkills.map((s, idx) => (
                          <span key={idx} className="skill-tag skill-missing">{s}</span>
                        ))}
                      </div>
                    </div>

                    <div className="ai-rationale-box">
                      <b>AI Match:</b> {p.recommendationRationale}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Tab 3: Custom Skill Search */}
      {activeTab === 'customMatch' && (
        <div>
          <form
            onSubmit={handleCustomSearch}
            style={{
              background: '#fff',
              border: '1px solid #e2e8f0',
              borderRadius: '12px',
              padding: '20px',
              marginBottom: '24px',
              display: 'flex',
              gap: '16px',
              flexWrap: 'wrap',
              alignItems: 'flex-end'
            }}
          >
            <div style={{ flex: 2, minWidth: '240px' }}>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#475569', marginBottom: '6px' }}>
                Required Skills (comma-separated) *
              </label>
              <input
                type="text"
                required
                value={customSkillsInput}
                onChange={(e) => setCustomSkillsInput(e.target.value)}
                placeholder="e.g. Python, Docker, PyTorch"
                style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
              />
            </div>
            <div style={{ flex: 1, minWidth: '150px' }}>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#475569', marginBottom: '6px' }}>
                Department (optional)
              </label>
              <input
                type="text"
                value={customDeptInput}
                onChange={(e) => setCustomDeptInput(e.target.value)}
                placeholder="e.g. CSE, ECE, IT"
                style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
              />
            </div>
            <button type="submit" className="primary" style={{ padding: '10px 24px' }}>
              Run AI Match
            </button>
          </form>

          {customCandidates.length > 0 && (
            <div className="ai-match-grid">
              {customCandidates.map(c => (
                <div key={c.studentId} className="ai-match-card">
                  <span className={`match-score-badge ${c.matchScore >= 80 ? 'match-score-high' : 'match-score-med'}`}>
                    {c.matchScore}%
                  </span>
                  <div className="candidate-header">
                    <h4 className="candidate-name">{c.name}</h4>
                    <p className="candidate-sub">{c.department} • {c.email}</p>
                  </div>
                  <div className="skills-wrap">
                    {c.matchedSkills.map((s, idx) => (
                      <span key={idx} className="skill-tag skill-matched">✓ {s}</span>
                    ))}
                  </div>
                  <div className="ai-rationale-box">
                    {c.recommendationRationale}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
