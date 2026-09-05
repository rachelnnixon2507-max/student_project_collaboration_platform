import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, GraduationCap, ShieldCheck, LogIn, UserPlus, AlertCircle, CheckCircle2 } from 'lucide-react';
import PageHeader from '../components/PageHeader';
import { loginStudent, loginFaculty, registerStudent, registerFaculty, getUser, fetchAdminStatus } from '../services/adminService';
import '../styles/admin.css';

export default function Login() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('student-login');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [adminExists, setAdminExists] = useState(true);

  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [department, setDepartment] = useState('CSE');
  const [skills, setSkills] = useState('');
  const [designation, setDesignation] = useState('Professor');
  const [specialization, setSpecialization] = useState('');

  const currentUser = getUser();

  useEffect(() => {
    fetchAdminStatus()
      .then((res) => setAdminExists(res.adminExists))
      .catch(() => setAdminExists(true));
  }, []);

  const resetForm = () => {
    setEmail('');
    setPassword('');
    setConfirmPassword('');
    setName('');
    setError('');
    setSuccessMsg('');
  };

  const handleStudentLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccessMsg('');
    try {
      const data = await loginStudent(email, password);
      setSuccessMsg(`Welcome back, ${data.name}! Redirecting...`);
      setTimeout(() => navigate('/dashboard'), 500);
    } catch (err) {
      setError(err.message || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  const handleFacultyLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccessMsg('');
    try {
      const data = await loginFaculty(email, password);
      setSuccessMsg(`Welcome back, ${data.name}! Redirecting...`);
      setTimeout(() => navigate('/faculty'), 500);
    } catch (err) {
      setError(err.message || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterStudent = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    setLoading(true);
    setError('');
    setSuccessMsg('');
    try {
      const data = await registerStudent({ name, email, password, confirmPassword, department, skills });
      setSuccessMsg(`Student account created successfully for ${data.name}! Redirecting...`);
      setTimeout(() => navigate('/dashboard'), 600);
    } catch (err) {
      setError(err.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterFaculty = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    setLoading(true);
    setError('');
    setSuccessMsg('');
    try {
      const data = await registerFaculty({ name, email, password, confirmPassword, department, designation, specialization });
      setSuccessMsg(`Faculty account created successfully for ${data.name}! Redirecting...`);
      setTimeout(() => navigate('/faculty'), 600);
    } catch (err) {
      setError(err.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <PageHeader
        title="Account Portal"
        description="Sign in or create an account for Student Project Collaboration Platform."
      />

      {currentUser && (
        <div style={{ padding: '14px 20px', background: '#ecfdf3', border: '1px solid #abedd0', color: '#16844a', borderRadius: '12px', marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            Logged in as <b>{currentUser.name}</b> ({currentUser.role})
          </div>
          <button
            onClick={() => {
              if (currentUser.role === 'ADMIN') navigate('/admin');
              else if (currentUser.role === 'FACULTY') navigate('/faculty');
              else navigate('/dashboard');
            }}
            className="primary"
            style={{ padding: '6px 14px', fontSize: '13px', background: '#16844a', color: '#fff', border: 0, borderRadius: '8px' }}
          >
            Go to {currentUser.role === 'ADMIN' ? 'Admin Panel' : 'Dashboard'}
          </button>
        </div>
      )}

      <div style={{ maxWidth: '520px', margin: '20px auto', background: '#fff', padding: '32px', borderRadius: '16px', border: '1px solid #e8edf5', boxShadow: '0 12px 32px rgba(0,0,0,0.04)' }}>
        <div className="admin-tabs" style={{ marginBottom: '24px', flexWrap: 'wrap', gap: '6px' }}>
          <button
            className={activeTab === 'student-login' ? 'selected' : ''}
            onClick={() => { setActiveTab('student-login'); resetForm(); }}
          >
            <User size={15} /> Student Login
          </button>
          <button
            className={activeTab === 'faculty-login' ? 'selected' : ''}
            onClick={() => { setActiveTab('faculty-login'); resetForm(); }}
          >
            <GraduationCap size={15} /> Faculty Login
          </button>
          <button
            className={activeTab === 'student-reg' ? 'selected' : ''}
            onClick={() => { setActiveTab('student-reg'); resetForm(); }}
          >
            <UserPlus size={15} /> Student Signup
          </button>
          <button
            className={activeTab === 'faculty-reg' ? 'selected' : ''}
            onClick={() => { setActiveTab('faculty-reg'); resetForm(); }}
          >
            <UserPlus size={15} /> Faculty Signup
          </button>
        </div>

        {error && (
          <div className="alert-banner" style={{ background: '#fff0ef', borderColor: '#f8d7da', color: '#721c24', marginBottom: '16px' }}>
            <AlertCircle size={18} />
            <div><span>{error}</span></div>
          </div>
        )}

        {successMsg && (
          <div className="alert-banner" style={{ background: '#ecfdf3', borderColor: '#abedd0', color: '#16844a', marginBottom: '16px' }}>
            <CheckCircle2 size={18} />
            <div><span>{successMsg}</span></div>
          </div>
        )}

        {activeTab === 'student-login' && (
          <form className="form-grid" onSubmit={handleStudentLogin} style={{ gridTemplateColumns: '1fr' }}>
            <div style={{ textAlign: 'center', marginBottom: '12px' }}>
              <h3 style={{ margin: '0 0 4px', fontSize: '18px' }}>Student Sign In</h3>
              <p style={{ margin: 0, color: '#69758a', fontSize: '13px' }}>Access your projects, teams & tasks</p>
            </div>
            <label>
              Student Email
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="student@gmail.com"
              />
            </label>
            <label>
              Password
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Student@123"
              />
            </label>
            <button className="primary" disabled={loading} style={{ width: '100%', justifyContent: 'center', padding: '12px', marginTop: '8px', background: '#315bea', color: '#fff', border: 0, borderRadius: '9px', fontWeight: 600 }}>
              {loading ? 'Authenticating...' : 'Sign In as Student'}
            </button>
          </form>
        )}

        {activeTab === 'faculty-login' && (
          <form className="form-grid" onSubmit={handleFacultyLogin} style={{ gridTemplateColumns: '1fr' }}>
            <div style={{ textAlign: 'center', marginBottom: '12px' }}>
              <h3 style={{ margin: '0 0 4px', fontSize: '18px' }}>Faculty Sign In</h3>
              <p style={{ margin: 0, color: '#69758a', fontSize: '13px' }}>Evaluate student projects & teams</p>
            </div>
            <label>
              Faculty Email
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="faculty@gmail.com"
              />
            </label>
            <label>
              Password
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Faculty@123"
              />
            </label>
            <button className="primary" disabled={loading} style={{ width: '100%', justifyContent: 'center', padding: '12px', marginTop: '8px', background: '#315bea', color: '#fff', border: 0, borderRadius: '9px', fontWeight: 600 }}>
              {loading ? 'Authenticating...' : 'Sign In as Faculty'}
            </button>
          </form>
        )}

        {activeTab === 'student-reg' && (
          <form className="form-grid" onSubmit={handleRegisterStudent} style={{ gridTemplateColumns: '1fr' }}>
            <div style={{ textAlign: 'center', marginBottom: '12px' }}>
              <h3 style={{ margin: '0 0 4px', fontSize: '18px' }}>Student Registration</h3>
              <p style={{ margin: 0, color: '#69758a', fontSize: '13px' }}>Join the platform as a student member</p>
            </div>
            <label>
              Full Name
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Full Name"
              />
            </label>
            <label>
              Student Email
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="email@example.com"
              />
            </label>
            <label>
              Password
              <input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Minimum 6 characters"
              />
            </label>
            <label>
              Confirm Password
              <input
                type="password"
                required
                minLength={6}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter password"
              />
            </label>
            <label>
              Department
              <select value={department} onChange={(e) => setDepartment(e.target.value)}>
                <option value="CSE">Computer Science (CSE)</option>
                <option value="IT">Information Technology (IT)</option>
                <option value="ECE">Electronics (ECE)</option>
                <option value="EEE">Electrical (EEE)</option>
                <option value="MECH">Mechanical (MECH)</option>
              </select>
            </label>
            <label>
              Technical Skills
              <input
                type="text"
                value={skills}
                onChange={(e) => setSkills(e.target.value)}
                placeholder="e.g. React, Spring Boot, Python"
              />
            </label>
            <button className="primary" disabled={loading} style={{ width: '100%', justifyContent: 'center', padding: '12px', marginTop: '8px', background: '#315bea', color: '#fff', border: 0, borderRadius: '9px', fontWeight: 600 }}>
              {loading ? 'Creating Account...' : 'Register as Student'}
            </button>
          </form>
        )}

        {activeTab === 'faculty-reg' && (
          <form className="form-grid" onSubmit={handleRegisterFaculty} style={{ gridTemplateColumns: '1fr' }}>
            <div style={{ textAlign: 'center', marginBottom: '12px' }}>
              <h3 style={{ margin: '0 0 4px', fontSize: '18px' }}>Faculty Registration</h3>
              <p style={{ margin: 0, color: '#69758a', fontSize: '13px' }}>Join the platform as a faculty mentor</p>
            </div>
            <label>
              Full Name
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Full Name"
              />
            </label>
            <label>
              Faculty Email
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="email@example.com"
              />
            </label>
            <label>
              Password
              <input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Minimum 6 characters"
              />
            </label>
            <label>
              Confirm Password
              <input
                type="password"
                required
                minLength={6}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter password"
              />
            </label>
            <label>
              Department
              <select value={department} onChange={(e) => setDepartment(e.target.value)}>
                <option value="CSE">Computer Science (CSE)</option>
                <option value="IT">Information Technology (IT)</option>
                <option value="ECE">Electronics (ECE)</option>
                <option value="EEE">Electrical (EEE)</option>
                <option value="MECH">Mechanical (MECH)</option>
              </select>
            </label>
            <label>
              Designation
              <input
                type="text"
                value={designation}
                onChange={(e) => setDesignation(e.target.value)}
                placeholder="e.g. Professor / Associate Professor"
              />
            </label>
            <label>
              Specialization
              <input
                type="text"
                value={specialization}
                onChange={(e) => setSpecialization(e.target.value)}
                placeholder="e.g. Artificial Intelligence, Cloud Systems"
              />
            </label>
            <button className="primary" disabled={loading} style={{ width: '100%', justifyContent: 'center', padding: '12px', marginTop: '8px', background: '#315bea', color: '#fff', border: 0, borderRadius: '9px', fontWeight: 600 }}>
              {loading ? 'Creating Account...' : 'Register as Faculty'}
            </button>
          </form>
        )}

        <div style={{ marginTop: '24px', paddingTop: '16px', borderTop: '1px solid #e8edf5', textAlign: 'center', fontSize: '13px' }}>
          <span style={{ color: '#69758a' }}>Administrator? </span>
          <button
            onClick={() => navigate('/admin')}
            style={{ background: 'none', border: 0, color: '#315bea', fontWeight: 600, cursor: 'pointer', padding: 0 }}
          >
            {adminExists ? 'Go to Admin Portal' : 'First-Time Admin Setup'}
          </button>
        </div>
      </div>
    </>
  );
}
