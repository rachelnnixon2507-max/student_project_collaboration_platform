import React from 'react';
import { Link } from 'react-router-dom';
import {
  Sparkles,
  Users,
  Kanban,
  GraduationCap,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Layers,
  MessageSquare,
  FileCode,
  Award,
  Zap,
  Cpu,
  Terminal,
  Activity,
  Code2,
  Compass
} from 'lucide-react';

export default function LandingPage() {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-app)', color: 'var(--text-main)', position: 'relative', overflowX: 'hidden' }}>
      
      {/* Top Navigation Bar */}
      <header style={{
        position: 'sticky',
        top: 0,
        zIndex: 50,
        background: 'rgba(6, 11, 24, 0.8)',
        backdropFilter: 'blur(20px) saturate(180%)',
        borderBottom: '1px solid var(--border-default)',
        padding: '16px 36px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        boxShadow: '0 4px 24px rgba(0, 0, 0, 0.5)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div className="brand-logo-badge" style={{ width: 38, height: 38 }}>
            <Cpu size={20} />
          </div>
          <div>
            <h2 style={{ fontFamily: 'var(--font-hud)', fontSize: 18, fontWeight: 900, letterSpacing: '0.08em', color: '#fff' }}>
              COLLAB<span style={{ color: 'var(--neon-cyan)', textShadow: '0 0 12px rgba(0,240,255,0.6)' }}>NEXUS</span>
            </h2>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 28 }}>
          <a href="#matrix" style={{ color: 'var(--text-secondary)', fontSize: 13.5, fontWeight: 600, fontFamily: 'var(--font-subhud)', letterSpacing: '0.05em', transition: 'color 0.2s' }} onMouseEnter={(e) => e.target.style.color = 'var(--neon-cyan)'} onMouseLeave={(e) => e.target.style.color = 'var(--text-secondary)'}>
            // WORKFLOWS
          </a>
          <a href="#features" style={{ color: 'var(--text-secondary)', fontSize: 13.5, fontWeight: 600, fontFamily: 'var(--font-subhud)', letterSpacing: '0.05em', transition: 'color 0.2s' }} onMouseEnter={(e) => e.target.style.color = 'var(--neon-cyan)'} onMouseLeave={(e) => e.target.style.color = 'var(--text-secondary)'}>
            // AI TELEMETRY
          </a>
          <a href="#faculty" style={{ color: 'var(--text-secondary)', fontSize: 13.5, fontWeight: 600, fontFamily: 'var(--font-subhud)', letterSpacing: '0.05em', transition: 'color 0.2s' }} onMouseEnter={(e) => e.target.style.color = 'var(--neon-cyan)'} onMouseLeave={(e) => e.target.style.color = 'var(--text-secondary)'}>
            // FACULTY EVALUATION
          </a>
          <Link to="/login" className="btn btn-secondary btn-sm" style={{ padding: '8px 18px' }}>
            ENTER TERMINAL
          </Link>
          <Link to="/login" className="btn btn-primary btn-sm" style={{ padding: '8px 20px' }}>
            INITIALIZE <ArrowRight size={14} />
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section style={{
        maxWidth: 1200,
        margin: '0 auto',
        padding: '90px 24px 70px',
        textAlign: 'center',
        position: 'relative'
      }}>
        {/* Glow ambient background aura */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: '50%',
          transform: 'translateX(-50%)',
          width: 650,
          height: 350,
          background: 'radial-gradient(circle, rgba(0, 240, 255, 0.18) 0%, rgba(168, 85, 247, 0.1) 40%, transparent 70%)',
          filter: 'blur(40px)',
          zIndex: -1,
          pointerEvents: 'none'
        }} />

        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 10,
          background: 'rgba(0, 240, 255, 0.08)',
          border: '1px solid rgba(0, 240, 255, 0.35)',
          borderRadius: 'var(--radius-pill)',
          padding: '6px 18px',
          fontSize: 12.5,
          fontWeight: 700,
          fontFamily: 'var(--font-mono)',
          color: 'var(--neon-cyan)',
          letterSpacing: '0.04em',
          marginBottom: 28,
          boxShadow: '0 0 16px rgba(0, 240, 255, 0.2)'
        }}>
          <Sparkles size={14} />
          <span>CYBERNETIC STUDENT COLLABORATION & CAPSTONE PLATFORM</span>
        </div>

        <h1 style={{
          fontFamily: 'var(--font-hud)',
          fontSize: 'clamp(32px, 5.5vw, 58px)',
          fontWeight: 900,
          lineHeight: 1.18,
          letterSpacing: '0.02em',
          color: '#ffffff',
          marginBottom: 24,
          textShadow: '0 0 40px rgba(0, 240, 255, 0.2)'
        }}>
          CONNECT STUDENT CREATORS & <br />
          <span style={{
            background: 'linear-gradient(135deg, #00f0ff 0%, #c084fc 60%, #ffffff 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            textShadow: 'none'
          }}>
            LAUNCH AI-POWERED PROJECTS
          </span>
        </h1>

        <p style={{
          maxWidth: 720,
          margin: '0 auto 40px',
          fontSize: 17,
          color: 'var(--text-secondary)',
          lineHeight: 1.7,
          fontWeight: 400
        }}>
          CollabNexus synchronizes visionary campus engineers, designers, and innovators with smart AI skill matchmaking, Kanban sprint telemetry, and academic faculty rubric grading.
        </p>

        <div style={{ display: 'flex', justifyContent: 'center', gap: 18, flexWrap: 'wrap', marginBottom: 64 }}>
          <Link to="/login" className="btn btn-primary btn-lg" style={{ padding: '16px 36px', fontSize: 16 }}>
            ACCESS WITH INSTITUTIONAL ID <ArrowRight size={18} />
          </Link>
          <Link to="/login" className="btn btn-secondary btn-lg" style={{ padding: '16px 32px', fontSize: 16 }}>
            EXPLORE ACTIVE PROJECTS
          </Link>
        </div>

        {/* HUD Metrics Bar */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: 18,
          background: 'rgba(8, 16, 36, 0.75)',
          border: '1px solid var(--border-default)',
          borderRadius: 'var(--radius-md)',
          padding: '24px 32px',
          backdropFilter: 'blur(16px)',
          textAlign: 'left',
          boxShadow: '0 12px 40px rgba(0,0,0,0.6), inset 0 1px 0 rgba(0,240,255,0.1)'
        }}>
          <div>
            <div style={{ fontFamily: 'var(--font-hud)', fontSize: 26, fontWeight: 900, color: 'var(--neon-cyan)', textShadow: '0 0 12px rgba(0,240,255,0.4)' }}>500+</div>
            <div style={{ fontSize: 12.5, color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)', marginTop: 4 }}>PROJECTS DEPLOYED</div>
          </div>
          <div>
            <div style={{ fontFamily: 'var(--font-hud)', fontSize: 26, fontWeight: 900, color: 'var(--neon-emerald)', textShadow: '0 0 12px rgba(0,255,157,0.4)' }}>98.4%</div>
            <div style={{ fontSize: 12.5, color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)', marginTop: 4 }}>TEAM FORMATION RATE</div>
          </div>
          <div>
            <div style={{ fontFamily: 'var(--font-hud)', fontSize: 26, fontWeight: 900, color: 'var(--neon-violet)', textShadow: '0 0 12px rgba(192,132,252,0.4)' }}>REAL-TIME</div>
            <div style={{ fontSize: 12.5, color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)', marginTop: 4 }}>AI SKILL TELEMETRY</div>
          </div>
          <div>
            <div style={{ fontFamily: 'var(--font-hud)', fontSize: 26, fontWeight: 900, color: '#f59e0b', textShadow: '0 0 12px rgba(245,158,11,0.4)' }}>4-RUBRIC</div>
            <div style={{ fontSize: 12.5, color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)', marginTop: 4 }}>FACULTY GRADING MATRIX</div>
          </div>
        </div>
      </section>

      {/* Cyber Feature Matrix Section */}
      <section id="matrix" style={{ maxWidth: 1200, margin: '0 auto', padding: '60px 24px 80px' }}>
        <div style={{ textAlign: 'center', marginBottom: 50 }}>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--neon-cyan)', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 10 }}>
            // ARCHITECTURE & WORKSPACES
          </div>
          <h2 style={{ fontSize: 32, fontWeight: 800, color: '#fff' }}>
            Built for End-to-End Academic Collaboration
          </h2>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 24 }}>
          {/* Card 1 */}
          <div className="card card-hud">
            <div style={{ width: 44, height: 44, borderRadius: 'var(--radius-sm)', background: 'rgba(0, 240, 255, 0.15)', border: '1px solid var(--neon-cyan)', color: 'var(--neon-cyan)', display: 'grid', placeItems: 'center', marginBottom: 18 }}>
              <Users size={22} />
            </div>
            <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 10, color: '#fff' }}>Smart Team Pitch & Recruitment</h3>
            <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.6 }}>
              Student leaders pitch projects with required tech stacks, set seat capacities, and review incoming join requests in real time.
            </p>
          </div>

          {/* Card 2 */}
          <div className="card card-hud">
            <div style={{ width: 44, height: 44, borderRadius: 'var(--radius-sm)', background: 'rgba(168, 85, 247, 0.15)', border: '1px solid var(--neon-violet)', color: 'var(--neon-violet)', display: 'grid', placeItems: 'center', marginBottom: 18 }}>
              <Kanban size={22} />
            </div>
            <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 10, color: '#fff' }}>Kanban Sprint Workspace</h3>
            <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.6 }}>
              Interactive 3-column sprint task management with live velocity recalculation, due-date tracking, and shared document repositories.
            </p>
          </div>

          {/* Card 3 */}
          <div className="card card-hud">
            <div style={{ width: 44, height: 44, borderRadius: 'var(--radius-sm)', background: 'rgba(0, 255, 157, 0.15)', border: '1px solid var(--neon-emerald)', color: 'var(--neon-emerald)', display: 'grid', placeItems: 'center', marginBottom: 18 }}>
              <Award size={22} />
            </div>
            <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 10, color: '#fff' }}>Faculty Rubric Evaluation</h3>
            <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.6 }}>
              Professors score projects across 4 standardized academic criteria (0-25 each, 100 max) with instant letter grade generation (A+, A, B+, B, C, F).
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{
        borderTop: '1px solid var(--border-subtle)',
        background: 'rgba(4, 7, 17, 0.9)',
        padding: '36px 24px',
        textAlign: 'center',
        fontSize: 13,
        color: 'var(--text-muted)',
        fontFamily: 'var(--font-mono)'
      }}>
        COLLABNEXUS // SECURE CAMPUS COLLABORATION FRAMEWORK • ALL RIGHTS RESERVED
      </footer>
    </div>
  );
}
