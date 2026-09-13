import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  GraduationCap,
  ArrowRight,
  CheckCircle2,
  Copy,
  Check,
  AlertCircle,
  Eye,
  EyeOff,
  UserPlus,
  Users,
  Briefcase,
  Cpu,
  Lock,
  Terminal,
  ShieldCheck
} from 'lucide-react';
import {
  loginUser,
  registerStudent,
  registerFaculty,
  getUser
} from '../services/adminService';

export default function Login() {
  const navigate = useNavigate();
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [regType, setRegType] = useState('STUDENT'); // 'STUDENT' | 'FACULTY'

  // Form states
  const [emailOrId, setEmailOrId] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Register Form State
  const [regForm, setRegForm] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    department: 'Computer Science & Engineering',
    skills: '',
    designation: 'Assistant Professor',
    specialization: 'Computer Science & Engineering',
  });
  const [regSuccessUser, setRegSuccessUser] = useState(null);
  const [copiedId, setCopiedId] = useState(false);

  useEffect(() => {
    // If already logged in, redirect based on role
    const user = getUser();
    if (user) {
      if (user.role === 'ADMIN') navigate('/admin');
      else if (user.role === 'FACULTY') navigate('/faculty');
      else navigate('/dashboard');
    }
  }, [navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!emailOrId.trim() || !password.trim()) {
      setError('Please enter your ID and Password.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const loggedUser = await loginUser(emailOrId.trim(), password);
      if (loggedUser.role === 'ADMIN') {
        navigate('/admin');
      } else if (loggedUser.role === 'FACULTY') {
        navigate('/faculty');
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      setError(err.message || 'Invalid ID or Password.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    if (regForm.password !== regForm.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      let created;
      if (regType === 'STUDENT') {
        created = await registerStudent({
          name: regForm.name.trim(),
          email: regForm.email.trim(),
          password: regForm.password,
          department: regForm.department,
          skills: regForm.skills.trim(),
        });
      } else {
        created = await registerFaculty({
          name: regForm.name.trim(),
          email: regForm.email.trim(),
          password: regForm.password,
          department: regForm.department,
          designation: regForm.designation.trim(),
          specialization: regForm.specialization.trim(),
        });
      }
      setRegSuccessUser(created);
    } catch (err) {
      setError(err.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  const copyInstitutionalId = (id) => {
    if (!id) return;
    navigator.clipboard.writeText(id);
    setCopiedId(true);
    setTimeout(() => setCopiedId(false), 2000);
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--bg-app)',
      display: 'grid',
      placeItems: 'center',
      padding: '30px 16px',
      position: 'relative'
    }}>
      {/* Background cyber ambient spot */}
      <div style={{
        position: 'absolute',
        width: 500,
        height: 350,
        background: 'radial-gradient(circle, rgba(0, 240, 255, 0.15) 0%, rgba(168, 85, 247, 0.08) 50%, transparent 70%)',
        filter: 'blur(50px)',
        zIndex: 0,
        pointerEvents: 'none'
      }} />

      <div className="card card-hud" style={{
        width: 'min(450px, 100%)',
        background: 'rgba(8, 16, 36, 0.88)',
        border: '1px solid var(--border-strong)',
        borderRadius: 'var(--radius-lg)',
        padding: '42px 34px',
        boxShadow: '0 20px 60px rgba(0, 0, 0, 0.85), 0 0 30px rgba(0, 240, 255, 0.2)',
        backdropFilter: 'blur(20px)',
        zIndex: 1
      }}>
        {/* Brand Header */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{
            width: 54,
            height: 54,
            borderRadius: 14,
            background: 'linear-gradient(135deg, rgba(0, 240, 255, 0.25), rgba(168, 85, 247, 0.35))',
            border: '1px solid var(--neon-cyan)',
            color: 'var(--neon-cyan)',
            display: 'grid',
            placeItems: 'center',
            margin: '0 auto 16px',
            boxShadow: '0 0 20px rgba(0, 240, 255, 0.4)'
          }}>
            <Cpu size={30} />
          </div>
          <h1 style={{ fontFamily: 'var(--font-hud)', fontSize: 24, fontWeight: 900, color: '#fff', letterSpacing: '0.06em' }}>
            COLLAB<span style={{ color: 'var(--neon-cyan)', textShadow: '0 0 12px rgba(0,240,255,0.6)' }}>NEXUS</span>
          </h1>
          <p style={{ fontFamily: 'var(--font-mono)', fontSize: 11.5, color: 'var(--text-secondary)', marginTop: 6, letterSpacing: '0.04em' }}>
            // SECURE GATEWAY AUTHENTICATION
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div style={{
            background: 'rgba(255, 0, 85, 0.12)',
            border: '1px solid rgba(255, 0, 85, 0.45)',
            borderRadius: 'var(--radius-sm)',
            padding: '12px 14px',
            fontSize: 13,
            color: '#ff809b',
            marginBottom: 20,
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            boxShadow: '0 0 12px rgba(255, 0, 85, 0.25)'
          }}>
            <AlertCircle size={16} style={{ flexShrink: 0 }} />
            <span>{error}</span>
          </div>
        )}

        {/* Single Universal Login Form */}
        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          <div className="form-group">
            <label className="form-label">
              ID
            </label>
            <input
              type="text"
              className="form-input"
              placeholder="ID"
              value={emailOrId}
              onChange={(e) => setEmailOrId(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">
              Password
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type={showPassword ? 'text' : 'password'}
                className="form-input"
                style={{ paddingRight: 40 }}
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute',
                  right: 12,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  color: 'var(--text-muted)',
                  cursor: 'pointer'
                }}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary"
            style={{ padding: '13px', fontSize: 14.5, fontWeight: 700, marginTop: 8 }}
          >
            {loading ? 'AUTHENTICATING...' : 'ACCESS WORKSPACE'}
            <ArrowRight size={16} />
          </button>
        </form>

        {/* Registration Trigger */}
        <div style={{ marginTop: 24, paddingTop: 20, borderTop: '1px solid var(--border-subtle)', textAlign: 'center' }}>
          <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>
            Need an Institutional ID?{' '}
            <button
              type="button"
              onClick={() => {
                setShowRegisterModal(true);
                setError('');
              }}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--neon-cyan)',
                fontWeight: 700,
                cursor: 'pointer',
                textDecoration: 'underline'
              }}
            >
              Register Account
            </button>
          </p>
        </div>
      </div>

      {/* Registration Modal */}
      {showRegisterModal && (
        <div className="modal-backdrop">
          <div className="modal-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 36, height: 36, borderRadius: 'var(--radius-sm)', background: 'rgba(0, 240, 255, 0.15)', border: '1px solid var(--neon-cyan)', color: 'var(--neon-cyan)', display: 'grid', placeItems: 'center' }}>
                  <UserPlus size={18} />
                </div>
                <div>
                  <h3 style={{ fontSize: 17, fontWeight: 800, color: '#fff' }}>
                    {regSuccessUser ? 'Registration Completed!' : 'Create Institutional Account'}
                  </h3>
                  <p style={{ fontSize: 12, color: 'var(--text-muted)', margin: 0 }}>
                    {regSuccessUser ? 'Your official Institutional ID is ready' : 'Select role and fill your information'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  setShowRegisterModal(false);
                  setRegSuccessUser(null);
                }}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', fontSize: 20 }}
              >
                ✕
              </button>
            </div>

            {regSuccessUser ? (
              <div style={{ textAlign: 'center', padding: '16px 0' }}>
                <div style={{
                  width: 60,
                  height: 60,
                  borderRadius: '50%',
                  background: 'rgba(0, 255, 157, 0.15)',
                  border: '1px solid var(--neon-emerald)',
                  color: 'var(--neon-emerald)',
                  display: 'grid',
                  placeItems: 'center',
                  margin: '0 auto 16px',
                  boxShadow: '0 0 20px rgba(0, 255, 157, 0.35)'
                }}>
                  <CheckCircle2 size={36} />
                </div>

                <h3 style={{ fontSize: 20, fontWeight: 800, marginBottom: 8, color: '#fff' }}>
                  Welcome, {regSuccessUser.name}!
                </h3>
                <p style={{ fontSize: 13, color: 'var(--text-secondary)', maxWidth: 400, margin: '0 auto 20px' }}>
                  Your account has been registered. Use your generated Institutional ID to sign in.
                </p>

                <div style={{
                  background: 'rgba(6, 12, 28, 0.8)',
                  border: '1px dashed var(--neon-cyan)',
                  borderRadius: 'var(--radius-md)',
                  padding: '20px',
                  marginBottom: 24,
                  display: 'inline-flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 8,
                  boxShadow: '0 0 20px rgba(0, 240, 255, 0.15)'
                }}>
                  <span style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', letterSpacing: '0.05em' }}>
                    YOUR INSTITUTIONAL ID
                  </span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span style={{ fontSize: 28, fontWeight: 800, fontFamily: 'var(--font-mono)', color: 'var(--neon-cyan)', letterSpacing: '0.05em', textShadow: '0 0 10px rgba(0,240,255,0.5)' }}>
                      {regSuccessUser.institutionalId || (regSuccessUser.role === 'STUDENT' ? 'STU10001' : 'FAC10001')}
                    </span>
                    <button
                      onClick={() => copyInstitutionalId(regSuccessUser.institutionalId)}
                      className="btn btn-secondary btn-sm"
                      style={{ padding: '6px 10px' }}
                    >
                      {copiedId ? <Check size={14} color="#00ff9d" /> : <Copy size={14} />}
                    </button>
                  </div>
                </div>

                <div>
                  <button
                    onClick={() => {
                      setShowRegisterModal(false);
                      setRegSuccessUser(null);
                      if (regSuccessUser.role === 'FACULTY') navigate('/faculty');
                      else if (regSuccessUser.role === 'ADMIN') navigate('/admin');
                      else navigate('/dashboard');
                    }}
                    className="btn btn-primary btn-lg"
                    style={{ width: '100%' }}
                  >
                    ENTER WORKSPACE <ArrowRight size={16} />
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {/* Role Selector */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, background: 'rgba(5, 11, 26, 0.8)', padding: 4, borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
                  <button
                    type="button"
                    onClick={() => setRegType('STUDENT')}
                    style={{
                      padding: '8px 12px',
                      borderRadius: 6,
                      border: 'none',
                      background: regType === 'STUDENT' ? 'rgba(0, 240, 255, 0.15)' : 'transparent',
                      color: regType === 'STUDENT' ? 'var(--neon-cyan)' : 'var(--text-muted)',
                      fontWeight: 700,
                      fontSize: 13,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 6
                    }}
                  >
                    <Users size={15} /> Student
                  </button>
                  <button
                    type="button"
                    onClick={() => setRegType('FACULTY')}
                    style={{
                      padding: '8px 12px',
                      borderRadius: 6,
                      border: 'none',
                      background: regType === 'FACULTY' ? 'rgba(168, 85, 247, 0.2)' : 'transparent',
                      color: regType === 'FACULTY' ? 'var(--neon-violet)' : 'var(--text-muted)',
                      fontWeight: 700,
                      fontSize: 13,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 6
                    }}
                  >
                    <Briefcase size={15} /> Faculty Member
                  </button>
                </div>

                <div className="form-group">
                  <label className="form-label">Full Name</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. John Doe"
                    value={regForm.name}
                    onChange={(e) => setRegForm({ ...regForm, name: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Email</label>
                  <input
                    type="email"
                    className="form-input"
                    placeholder="user@college.edu"
                    value={regForm.email}
                    onChange={(e) => setRegForm({ ...regForm, email: e.target.value })}
                    required
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div className="form-group">
                    <label className="form-label">Password</label>
                    <input
                      type="password"
                      className="form-input"
                      placeholder="••••••••"
                      value={regForm.password}
                      onChange={(e) => setRegForm({ ...regForm, password: e.target.value })}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Confirm Password</label>
                    <input
                      type="password"
                      className="form-input"
                      placeholder="••••••••"
                      value={regForm.confirmPassword}
                      onChange={(e) => setRegForm({ ...regForm, confirmPassword: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Department</label>
                  <select
                    className="form-select"
                    value={regForm.department}
                    onChange={(e) => setRegForm({ ...regForm, department: e.target.value })}
                  >
                    <option value="Computer Science & Engineering">Computer Science & Engineering</option>
                    <option value="Electronics & Communication">Electronics & Communication</option>
                    <option value="Information Technology">Information Technology</option>
                    <option value="Artificial Intelligence & Data Science">Artificial Intelligence & Data Science</option>
                    <option value="Mechanical Engineering">Mechanical Engineering</option>
                  </select>
                </div>

                {regType === 'STUDENT' ? (
                  <div className="form-group">
                    <label className="form-label">Technical Skills</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="e.g. React, Java, Python, Docker"
                      value={regForm.skills}
                      onChange={(e) => setRegForm({ ...regForm, skills: e.target.value })}
                    />
                  </div>
                ) : (
                  <>
                    <div className="form-group">
                      <label className="form-label">Academic Designation</label>
                      <input
                        type="text"
                        className="form-input"
                        placeholder="e.g. Professor & HOD"
                        value={regForm.designation}
                        onChange={(e) => setRegForm({ ...regForm, designation: e.target.value })}
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Research Specialization</label>
                      <input
                        type="text"
                        className="form-input"
                        placeholder="e.g. Machine Learning, Cloud Systems"
                        value={regForm.specialization}
                        onChange={(e) => setRegForm({ ...regForm, specialization: e.target.value })}
                      />
                    </div>
                  </>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="btn btn-primary"
                  style={{ padding: '13px', marginTop: 10 }}
                >
                  {loading ? 'REGISTERING...' : 'REGISTER & GET INSTITUTIONAL ID'}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
