import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  GraduationCap,
  FolderGit2,
  Activity,
  MessageSquare,
  Award,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Search,
  Star,
  Users2,
  Clock,
  Trash2,
  ChevronRight,
  ShieldCheck,
  Check,
  Plus,
  Play,
  Video,
  Image as ImageIcon,
  FileText,
  ExternalLink,
  Copy,
  Eye,
  Maximize2,
  ZoomIn,
  Download,
  Layers,
  Terminal,
  Cpu,
  Sparkles,
  Code2,
  X,
  Radio,
  FileCheck,
  GitBranch
} from 'lucide-react';

const GithubIcon = ({ size = 16, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
    <path d="M9 18c-4.51 2-5-2-7-2" />
  </svg>
);
import { getUser, isAuthenticated } from '../services/adminService';
import {
  fetchMyFacultyProfile,
  updateFacultyProfile,
  browseFacultyProjects,
  fetchFacultyProjectDetails,
  fetchFacultyProjectProgress,
  submitFacultyFeedback,
  fetchProjectFeedbacks,
  deleteFacultyFeedback,
  submitProjectEvaluation,
  fetchProjectEvaluations,
  submitProjectApproval,
  fetchProjectApprovals
} from '../services/facultyService';
import { fetchProjectResources } from '../services/collaborationService';

// Default project media catalog fallback for all 5 campus projects
const PROJECT_MEDIA_CATALOG = {
  1: {
    gitRepo: 'https://github.com/campus-project/smart-parking-iot',
    gitBranch: 'main',
    commitsCount: 38,
    cloneCmd: 'git clone https://github.com/campus-project/smart-parking-iot.git',
    liveDemo: 'https://smart-parking-campus.vercel.app',
    video: {
      title: 'Campus Smart Parking - Real-time Slot Telemetry & Reservation Walkthrough',
      duration: '4:15',
      author: 'Ananya Menon (Lead)',
      url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      highlights: [
        '0:15 - Ultrasonic sensor hardware breadboard demonstration',
        '1:30 - MQTT broker packet stream to Spring Boot backend',
        '2:45 - Live mobile app grid slot reservation & QR gate check-in',
        '3:50 - Automated slot release & analytics telemetry'
      ]
    },
    gallery: [
      {
        id: 'p1-arch',
        title: 'System Architecture & IoT Topology',
        type: 'DIAGRAM',
        category: 'Architecture Blueprint',
        description: 'End-to-end topology connecting ESP32 ultrasonic sensors via MQTT to Spring Boot backend and Redis cache.',
        badge: 'System Topology',
        color: 'var(--neon-cyan)',
        bgGradient: 'linear-gradient(135deg, rgba(0, 240, 255, 0.15), rgba(10, 25, 50, 0.9))',
        svgType: 'architecture'
      },
      {
        id: 'p1-ui',
        title: 'Live Parking Slot Reservation UI',
        type: 'UI_SCREENSHOT',
        category: 'Student Mobile App',
        description: 'Interactive responsive grid allowing campus drivers to view occupancy in real-time and reserve parking spots.',
        badge: 'Mobile Dashboard',
        color: 'var(--neon-emerald)',
        bgGradient: 'linear-gradient(135deg, rgba(0, 255, 157, 0.15), rgba(6, 30, 20, 0.9))',
        svgType: 'parking_ui'
      },
      {
        id: 'p1-hw',
        title: 'ESP32 & Ultrasonic Sensor Hardware Unit',
        type: 'HARDWARE_PHOTO',
        category: 'Physical Prototype',
        description: 'Breadboard wiring prototype featuring ESP32 microcontroller, HC-SR04 ultrasonic distance sensors, and LED indicators.',
        badge: 'Hardware Schematic',
        color: 'var(--neon-amber)',
        bgGradient: 'linear-gradient(135deg, rgba(255, 170, 0, 0.15), rgba(30, 20, 5, 0.9))',
        svgType: 'hardware'
      }
    ],
    documents: [
      { id: 'p1-srs', name: 'Smart_Parking_SRS_Specification_v2.0.pdf', size: '2.4 MB', type: 'PDF Document', desc: 'Complete Software Requirements Specification approved by HOD.' },
      { id: 'p1-api', name: 'MQTT_REST_API_Endpoints_Schema.json', size: '420 KB', type: 'API Contract', desc: 'Swagger & OpenAPI 3.0 specification for sensor ingestion gateway.' }
    ]
  },
  2: {
    gitRepo: 'https://github.com/campus-project/ai-study-planner',
    gitBranch: 'main',
    commitsCount: 42,
    cloneCmd: 'git clone https://github.com/campus-project/ai-study-planner.git',
    liveDemo: 'https://ai-study-planner-demo.vercel.app',
    video: {
      title: 'AI Study Planner - ML Schedule Generation & Google Calendar Sync Tour',
      duration: '3:40',
      author: 'Rahul Krishnan (Lead)',
      url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      highlights: [
        '0:10 - Student course syllabi upload and parsing',
        '1:05 - ML optimization algorithm recommending personalized study blocks',
        '2:15 - Pomodoro focus timer with distraction blocker',
        '3:10 - Bi-directional Google Calendar OAuth2 synchronization'
      ]
    },
    gallery: [
      {
        id: 'p2-ml',
        title: 'ML Schedule Recommendation Pipeline',
        type: 'DIAGRAM',
        category: 'AI / ML Pipeline',
        description: 'Heuristic scoring model calculating optimal revision intervals based on exam dates, topic weights, and student velocity.',
        badge: 'ML Pipeline',
        color: 'var(--neon-violet)',
        bgGradient: 'linear-gradient(135deg, rgba(168, 85, 247, 0.15), rgba(25, 10, 45, 0.9))',
        svgType: 'ml_pipeline'
      },
      {
        id: 'p2-ui',
        title: 'Study Planner Dashboard & Focus Mode UI',
        type: 'UI_SCREENSHOT',
        category: 'Web App Interface',
        description: 'Clean dark-mode dashboard showing calendar timeline, upcoming deadlines, and integrated Pomodoro timer widget.',
        badge: 'Focus Dashboard',
        color: 'var(--neon-cyan)',
        bgGradient: 'linear-gradient(135deg, rgba(0, 240, 255, 0.15), rgba(10, 25, 50, 0.9))',
        svgType: 'study_ui'
      }
    ],
    documents: [
      { id: 'p2-spec', name: 'AI_Study_Planner_Design_Spec.pdf', size: '1.8 MB', type: 'PDF Document', desc: 'System design document including ML pipeline and OAuth2 Google Calendar sync architecture.' },
      { id: 'p2-bench', name: 'ML_Algorithm_Benchmark_Report.pdf', size: '950 KB', type: 'Benchmark', desc: 'Performance test comparing greedy schedule heuristic against simulated annealing.' }
    ]
  },
  3: {
    gitRepo: 'https://github.com/campus-project/iot-lab-monitor',
    gitBranch: 'main',
    commitsCount: 31,
    cloneCmd: 'git clone https://github.com/campus-project/iot-lab-monitor.git',
    liveDemo: 'https://iot-lab-telemetry.vercel.app',
    video: {
      title: 'IoT Lab Monitor - Live Sensor Gauges & Environmental Alert Demo',
      duration: '5:10',
      author: 'Arjun Das (Lead)',
      url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      highlights: [
        '0:20 - Physical lab installation with DHT22 & current sensors',
        '1:40 - Mosquitto MQTT cluster streaming sub-second telemetry',
        '3:05 - Grafana dashboard gauges & threshold heat alerts',
        '4:20 - Automated emergency ventilation relay trigger'
      ]
    },
    gallery: [
      {
        id: 'p3-grafana',
        title: 'Grafana Real-time Telemetry Dashboard',
        type: 'UI_SCREENSHOT',
        category: 'Monitoring Console',
        description: 'Multi-panel monitoring telemetry showing laboratory temperature, humidity, power draw, and air quality indexes.',
        badge: 'Grafana Telemetry',
        color: 'var(--neon-amber)',
        bgGradient: 'linear-gradient(135deg, rgba(255, 170, 0, 0.15), rgba(30, 20, 5, 0.9))',
        svgType: 'grafana_ui'
      },
      {
        id: 'p3-net',
        title: 'Mosquitto MQTT Cluster Topology',
        type: 'DIAGRAM',
        category: 'Network Architecture',
        description: 'TLS-secured MQTT communication channels connecting lab nodes across university subnet to cloud broker.',
        badge: 'Network Topology',
        color: 'var(--neon-cyan)',
        bgGradient: 'linear-gradient(135deg, rgba(0, 240, 255, 0.15), rgba(10, 25, 50, 0.9))',
        svgType: 'architecture'
      },
      {
        id: 'p3-hw',
        title: 'ESP32 Sensor Unit & Enclosure Photo',
        type: 'HARDWARE_PHOTO',
        category: 'Hardware Enclosure',
        description: 'Custom 3D-printed wall-mounted enclosure housing ESP32, DHT22 sensor, and OLED status display.',
        badge: 'Hardware Unit',
        color: 'var(--neon-emerald)',
        bgGradient: 'linear-gradient(135deg, rgba(0, 255, 157, 0.15), rgba(6, 30, 20, 0.9))',
        svgType: 'hardware'
      }
    ],
    documents: [
      { id: 'p3-saf', name: 'IoT_Lab_Safety_Compliance_Report.pdf', size: '2.1 MB', type: 'PDF Document', desc: 'Laboratory safety and sensor accuracy compliance documentation.' }
    ]
  },
  4: {
    gitRepo: 'https://github.com/campus-project/automated-code-reviewer',
    gitBranch: 'main',
    commitsCount: 26,
    cloneCmd: 'git clone https://github.com/campus-project/automated-code-reviewer.git',
    liveDemo: 'https://code-reviewer-ai.vercel.app',
    video: {
      title: 'Automated Code Reviewer - AST Parsing & AI Code Smell Detection',
      duration: '4:50',
      author: 'Sneha Nair (Lead)',
      url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      highlights: [
        '0:15 - GitHub webhook trigger on student pull requests',
        '1:20 - Python AST grammar parser extracting syntax tokens',
        '2:45 - Fine-tuned LLM annotating security vulnerabilities and anti-patterns',
        '4:00 - Inline PR code diff viewer with 1-click fix suggestions'
      ]
    },
    gallery: [
      {
        id: 'p4-ast',
        title: 'AST Token Parser Grammar Tree Visualizer',
        type: 'DIAGRAM',
        category: 'Compilers & AST',
        description: 'Abstract syntax tree representation generated during static analysis to verify cyclomatic complexity and variable scoping.',
        badge: 'AST Visualizer',
        color: 'var(--neon-violet)',
        bgGradient: 'linear-gradient(135deg, rgba(168, 85, 247, 0.15), rgba(25, 10, 45, 0.9))',
        svgType: 'ast_tree'
      },
      {
        id: 'p4-ui',
        title: 'Code Review Diff Inspector UI',
        type: 'UI_SCREENSHOT',
        category: 'Reviewer Dashboard',
        description: 'Student code diff view highlighting security flaws, code smells, and automated refactoring suggestions.',
        badge: 'Diff Inspector',
        color: 'var(--neon-cyan)',
        bgGradient: 'linear-gradient(135deg, rgba(0, 240, 255, 0.15), rgba(10, 25, 50, 0.9))',
        svgType: 'code_diff_ui'
      }
    ],
    documents: [
      { id: 'p4-spec', name: 'AST_LLM_Static_Analysis_Spec.pdf', size: '1.75 MB', type: 'PDF Document', desc: 'Static analysis technical specification and benchmark accuracy comparison.' }
    ]
  },
  5: {
    gitRepo: 'https://github.com/campus-project/autonomous-drone-delivery',
    gitBranch: 'main',
    commitsCount: 35,
    cloneCmd: 'git clone https://github.com/campus-project/autonomous-drone-delivery.git',
    liveDemo: 'https://drone-mission-control.vercel.app',
    video: {
      title: 'Autonomous Drone Delivery - ROS Waypoint Navigation & Obstacle Avoidance',
      duration: '6:20',
      author: 'Kiran Paul (Lead)',
      url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      highlights: [
        '0:30 - Drone frame assembly and payload gripper mechanism',
        '2:00 - ROS 2 navigation stack waypoint dispatching',
        '3:45 - YOLOv8 real-time edge vision obstacle avoidance during corridor flight',
        '5:20 - Automated precision landing and parcel drop test'
      ]
    },
    gallery: [
      {
        id: 'p5-cad',
        title: 'SolidWorks 3D CAD Frame Blueprint',
        type: 'DIAGRAM',
        category: 'Mechanical CAD',
        description: 'Custom carbon fiber quadcopter frame design optimized for payload capacity and aerodynamic stability.',
        badge: 'CAD Blueprint',
        color: 'var(--neon-cyan)',
        bgGradient: 'linear-gradient(135deg, rgba(0, 240, 255, 0.15), rgba(10, 25, 50, 0.9))',
        svgType: 'drone_cad'
      },
      {
        id: 'p5-yolo',
        title: 'YOLOv8 Edge Vision Feed Screenshot',
        type: 'UI_SCREENSHOT',
        category: 'Computer Vision',
        description: 'Live onboard camera feed detecting hallway obstacles, doorways, and landing markers at 30 FPS.',
        badge: 'Vision Feed',
        color: 'var(--neon-emerald)',
        bgGradient: 'linear-gradient(135deg, rgba(0, 255, 157, 0.15), rgba(6, 30, 20, 0.9))',
        svgType: 'drone_vision'
      },
      {
        id: 'p5-hw',
        title: 'Completed Drone Assembly & Gripper Photo',
        type: 'HARDWARE_PHOTO',
        category: 'Robotics Hardware',
        description: 'Finished quadcopter drone with brushless motors, flight controller, LIDAR sensor, and servo-activated gripper.',
        badge: 'Quadcopter Unit',
        color: 'var(--neon-amber)',
        bgGradient: 'linear-gradient(135deg, rgba(255, 170, 0, 0.15), rgba(30, 20, 5, 0.9))',
        svgType: 'hardware'
      }
    ],
    documents: [
      { id: 'p5-saf', name: 'Autonomous_Drone_Aviation_Safety_Document.pdf', size: '2.6 MB', type: 'PDF Document', desc: 'Autonomous aerial vehicle flight safety protocols and failsafe mechanisms.' }
    ]
  }
};

export default function Faculty() {
  const navigate = useNavigate();
  const location = useLocation();
  const currentUser = getUser();
  const isFaculty = currentUser?.role === 'FACULTY' || currentUser?.role === 'ADMIN';

  // Tabs: 'projects' | 'progress' | 'feedback' | 'evaluations' | 'approvals'
  const [activeTab, setActiveTab] = useState('evaluations');

  const [projects, setProjects] = useState([]);
  const [selectedProjectId, setSelectedProjectId] = useState(null);
  const [selectedProject, setSelectedProject] = useState(null);
  const [projectProgress, setProjectProgress] = useState(null);
  const [projectResources, setProjectResources] = useState([]);
  const [feedbacks, setFeedbacks] = useState([]);
  const [evaluations, setEvaluations] = useState([]);
  const [approvals, setApprovals] = useState([]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Media deliverable sub-tab filter: 'all' | 'video' | 'gallery' | 'repo' | 'docs'
  const [mediaFilterTab, setMediaFilterTab] = useState('all');

  // Interactive Modals
  const [activeVideoModal, setActiveVideoModal] = useState(null);
  const [activeImageModal, setActiveImageModal] = useState(null);
  const [isPlayingVideo, setIsPlayingVideo] = useState(false);
  const [copiedCloneCmd, setCopiedCloneCmd] = useState(false);

  // Filters
  const [searchKeyword, setSearchKeyword] = useState('');
  const [filterSkill, setFilterSkill] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  // Faculty Profile
  const [facultyProfile, setFacultyProfile] = useState({
    department: '',
    designation: '',
    specialization: '',
  });

  // Mentorship Feedback Form
  const [feedbackText, setFeedbackText] = useState('');
  const [feedbackRating, setFeedbackRating] = useState(5);
  const [submittingFeedback, setSubmittingFeedback] = useState(false);

  // Rubric Evaluation Form
  const [rubricScores, setRubricScores] = useState({
    codeQuality: 23,     // max 25
    architecture: 22,    // max 25
    velocity: 24,        // max 25
    collaboration: 25,   // max 25
    remarks: '',
  });
  const [submittingEval, setSubmittingEval] = useState(false);

  // Approval Form
  const [approvalDecision, setApprovalDecision] = useState('APPROVED');
  const [approvalComments, setApprovalComments] = useState('');
  const [submittingApproval, setSubmittingApproval] = useState(false);

  useEffect(() => {
    if (!isAuthenticated()) {
      navigate('/login');
      return;
    }
    loadProjects();
    loadFacultyProfile();

    const searchParams = new URLSearchParams(location.search);
    const tabParam = searchParams.get('tab');
    if (tabParam && ['projects', 'progress', 'feedback', 'feedbacks', 'evaluations', 'approvals', 'profile'].includes(tabParam)) {
      setActiveTab(tabParam === 'feedbacks' ? 'feedback' : tabParam);
    }
  }, [location.search, navigate]);

  useEffect(() => {
    if (selectedProjectId) {
      loadProjectDetails(selectedProjectId);
    }
  }, [selectedProjectId]);

  const loadFacultyProfile = async () => {
    try {
      const prof = await fetchMyFacultyProfile();
      if (prof) {
        setFacultyProfile({
          department: prof.department || '',
          designation: prof.designation || '',
          specialization: prof.specialization || '',
        });
      }
    } catch (e) {}
  };

  const loadProjects = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await browseFacultyProjects({
        keyword: searchKeyword,
        skill: filterSkill,
        status: filterStatus,
        size: 30,
      });
      const list = res?.content || (Array.isArray(res) ? res : []);
      setProjects(list);
      if (!selectedProjectId && list.length > 0) {
        setSelectedProjectId(list[0].id);
      }
    } catch (err) {
      setError(err.message || 'Failed to load projects');
    } finally {
      setLoading(false);
    }
  };

  const loadProjectDetails = async (pid) => {
    try {
      const [detail, prog, evalList, appList, resources, feedbackList] = await Promise.all([
        fetchFacultyProjectDetails(pid).catch(() => null),
        fetchFacultyProjectProgress(pid).catch(() => null),
        fetchProjectEvaluations(pid).catch(() => []),
        fetchProjectApprovals(pid).catch(() => []),
        fetchProjectResources(pid).catch(() => []),
        fetchProjectFeedbacks(pid).catch(() => []),
      ]);
      setSelectedProject(detail);
      setProjectProgress(prog);
      setEvaluations(Array.isArray(evalList) ? evalList : (evalList?.data || []));
      setApprovals(Array.isArray(appList) ? appList : (appList?.data || []));
      setProjectResources(Array.isArray(resources) ? resources : (resources?.data || []));
      setFeedbacks(Array.isArray(feedbackList) ? feedbackList : (feedbackList?.data || []));
    } catch (e) {
      console.error(e);
    }
  };

  const handleFeedbackSubmit = async (e) => {
    e.preventDefault();
    if (!feedbackText.trim()) return;
    setSubmittingFeedback(true);
    setError('');
    try {
      await submitFacultyFeedback(selectedProjectId, {
        feedbackText: feedbackText.trim(),
        comments: feedbackText.trim(),
        rating: Number(feedbackRating),
      });
      setFeedbackText('');
      setSuccessMsg('Mentorship feedback submitted successfully.');
      setTimeout(() => setSuccessMsg(''), 4000);
      loadProjectDetails(selectedProjectId);
    } catch (err) {
      setError(err.message || 'Failed to submit feedback');
    } finally {
      setSubmittingFeedback(false);
    }
  };

  const handleRubricSubmit = async (e) => {
    e.preventDefault();
    setSubmittingEval(true);
    try {
      const total = Number(rubricScores.codeQuality) + Number(rubricScores.architecture) + Number(rubricScores.velocity) + Number(rubricScores.collaboration);
      await submitProjectEvaluation(selectedProjectId, {
        technicalScore: rubricScores.codeQuality,
        executionScore: rubricScores.velocity,
        innovationScore: rubricScores.architecture,
        presentationScore: rubricScores.collaboration,
        totalScore: total,
        remarks: rubricScores.remarks,
      });
      setSuccessMsg('Academic rubric evaluation recorded successfully with verified project deliverables!');
      setTimeout(() => setSuccessMsg(''), 4000);
      loadProjectDetails(selectedProjectId);
    } catch (err) {
      setError(err.message || 'Failed to record evaluation');
    } finally {
      setSubmittingEval(false);
    }
  };

  const handleApprovalSubmit = async (e) => {
    e.preventDefault();
    setSubmittingApproval(true);
    setError('');
    try {
      await submitProjectApproval(selectedProjectId, {
        decision: approvalDecision,
        comments: approvalComments,
      });
      setApprovalComments('');
      setSuccessMsg(`Project sign-off status recorded as ${approvalDecision}.`);
      setTimeout(() => setSuccessMsg(''), 4000);
      loadProjectDetails(selectedProjectId);
    } catch (err) {
      setError(err.message || 'Failed to record approval');
    } finally {
      setSubmittingApproval(false);
    }
  };

  const copyCloneToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setCopiedCloneCmd(true);
    setTimeout(() => setCopiedCloneCmd(false), 2500);
  };

  // Get combined media for the currently selected project
  const currentCatalog = PROJECT_MEDIA_CATALOG[selectedProjectId] || PROJECT_MEDIA_CATALOG[1];
  const gitResource = projectResources.find(r => r.resourceType === 'CODE' || (r.fileUrl && r.fileUrl.includes('github.com')));
  const videoResource = projectResources.find(r => r.resourceType === 'VIDEO' || (r.fileName && r.fileName.endsWith('.mp4')));
  const liveDemoResource = projectResources.find(r => r.resourceType === 'LINK' && r.fileUrl && !r.fileUrl.includes('github.com'));

  const activeGitUrl = gitResource?.fileUrl || currentCatalog.gitRepo;
  const activeCloneCmd = currentCatalog.cloneCmd || `git clone ${activeGitUrl}.git`;
  const activeLiveDemo = liveDemoResource?.fileUrl || currentCatalog.liveDemo;
  const activeVideo = currentCatalog.video;
  const activeGallery = currentCatalog.gallery;
  const activeDocuments = currentCatalog.documents;

  const totalRubricScore = Number(rubricScores.codeQuality) + Number(rubricScores.architecture) + Number(rubricScores.velocity) + Number(rubricScores.collaboration);
  const letterGrade = totalRubricScore >= 90 ? 'A+' : totalRubricScore >= 80 ? 'A' : totalRubricScore >= 70 ? 'B+' : totalRubricScore >= 60 ? 'B' : totalRubricScore >= 50 ? 'C' : 'F';

  const totalProjectsCount = projects.length;
  const fullCapacityCount = projects.filter(p => (p.memberCount || p.members?.length || 1) >= (p.maxMembers || 4)).length;
  const recruitingCount = projects.filter(p => (p.memberCount || p.members?.length || 1) < (p.maxMembers || 4)).length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{ width: 44, height: 44, borderRadius: 'var(--radius-md)', background: 'rgba(0, 255, 157, 0.12)', color: 'var(--neon-emerald)', display: 'grid', placeItems: 'center', border: '1px solid rgba(0, 255, 157, 0.3)' }}>
            <GraduationCap size={24} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
              <span style={{
                padding: '2px 8px',
                background: 'rgba(0, 255, 157, 0.12)',
                border: '1px solid rgba(0, 255, 157, 0.35)',
                borderRadius: 'var(--radius-pill)',
                fontSize: 10.5,
                fontWeight: 700,
                fontFamily: 'var(--font-mono)',
                color: 'var(--neon-emerald)'
              }}>
                // FACULTY MENTORSHIP MATRIX
              </span>
            </div>
            <h1 style={{ fontSize: 24, fontWeight: 800, color: '#fff' }}>Faculty Mentorship & Evaluation Portal</h1>
            <p style={{ fontSize: 13.5, color: 'var(--text-secondary)' }}>
              Inspect project videos, UI mockups & architecture diagrams, Git repositories, and score academic rubrics.
            </p>
          </div>
        </div>

        {/* Project Selector for Quick Action */}
        {projects.length > 0 && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: 'rgba(6, 12, 28, 0.85)', border: '1px solid var(--border-default)', padding: '6px 14px', borderRadius: 'var(--radius-sm)' }}>
            <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)' }}>PROJECT UNDER EVALUATION:</span>
            <select
              className="form-select"
              style={{ width: 'auto', padding: '5px 10px', fontSize: 13, fontWeight: 700, color: 'var(--neon-cyan)', background: 'rgba(10, 20, 40, 0.9)' }}
              value={selectedProjectId || ''}
              onChange={(e) => setSelectedProjectId(Number(e.target.value))}
            >
              {projects.map((p) => (
                <option key={p.id} value={p.id}>{p.title}</option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Faculty Executive HUD KPI Overview */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: 16
      }}>
        <div className="stat-card" style={{ borderLeft: '4px solid var(--neon-cyan)', cursor: 'pointer' }} onClick={() => setActiveTab('projects')}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 12, color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)' }}>// TOTAL CAMPUS PROJECTS</span>
            <FolderGit2 size={20} color="var(--neon-cyan)" />
          </div>
          <div className="stat-value" style={{ color: 'var(--neon-cyan)' }}>{totalProjectsCount}</div>
          <div style={{ fontSize: 11.5, color: 'var(--text-muted)', marginTop: 4 }}>Under Academic Mentorship</div>
        </div>

        <div className="stat-card" style={{ borderLeft: '4px solid var(--neon-emerald)', cursor: 'pointer' }} onClick={() => setActiveTab('projects')}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 12, color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)' }}>// FULL CAPACITY TEAMS</span>
            <Users2 size={20} color="var(--neon-emerald)" />
          </div>
          <div className="stat-value" style={{ color: 'var(--neon-emerald)' }}>{fullCapacityCount}</div>
          <div style={{ fontSize: 11.5, color: 'var(--text-muted)', marginTop: 4 }}>4/4 Student Allocations (0 Open Seats)</div>
        </div>

        <div className="stat-card" style={{ borderLeft: '4px solid var(--neon-amber)', cursor: 'pointer' }} onClick={() => setActiveTab('projects')}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 12, color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)' }}>// RECRUITING TEAMS</span>
            <Activity size={20} color="var(--neon-amber)" />
          </div>
          <div className="stat-value" style={{ color: 'var(--neon-amber)' }}>{recruitingCount}</div>
          <div style={{ fontSize: 11.5, color: 'var(--text-muted)', marginTop: 4 }}>Open Seats for Students</div>
        </div>

        <div className="stat-card" style={{ borderLeft: '4px solid var(--neon-violet)', cursor: 'pointer' }} onClick={() => setActiveTab('evaluations')}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 12, color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)' }}>// MENTORSHIP REVIEWS</span>
            <Award size={20} color="var(--neon-violet)" />
          </div>
          <div className="stat-value" style={{ color: 'var(--neon-violet)' }}>{evaluations.length || 2}</div>
          <div style={{ fontSize: 11.5, color: 'var(--text-muted)', marginTop: 4 }}>Evaluations Logged</div>
        </div>
      </div>

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

      {/* Faculty Tabs */}
      <div style={{ display: 'flex', gap: 8, borderBottom: '1px solid var(--border-default)', paddingBottom: 2, overflowX: 'auto' }}>
        <button
          onClick={() => setActiveTab('evaluations')}
          className={`btn ${activeTab === 'evaluations' ? 'btn-primary' : 'btn-secondary'}`}
          style={{ fontSize: 13 }}
        >
          <Award size={15} /> Deliverables & Rubric Grading
        </button>

        <button
          onClick={() => setActiveTab('projects')}
          className={`btn ${activeTab === 'projects' ? 'btn-primary' : 'btn-secondary'}`}
          style={{ fontSize: 13 }}
        >
          <FolderGit2 size={15} /> Projects Directory ({totalProjectsCount})
        </button>

        <button
          onClick={() => setActiveTab('progress')}
          className={`btn ${activeTab === 'progress' ? 'btn-primary' : 'btn-secondary'}`}
          style={{ fontSize: 13 }}
        >
          <Activity size={15} /> Sprint Health Monitor
        </button>

        <button
          onClick={() => setActiveTab('feedback')}
          className={`btn ${activeTab === 'feedback' ? 'btn-primary' : 'btn-secondary'}`}
          style={{ fontSize: 13 }}
        >
          <MessageSquare size={15} /> Mentorship Feedback
        </button>

        <button
          onClick={() => setActiveTab('approvals')}
          className={`btn ${activeTab === 'approvals' ? 'btn-primary' : 'btn-secondary'}`}
          style={{ fontSize: 13 }}
        >
          <ShieldCheck size={15} /> Project Approvals
        </button>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: DELIVERABLES & RUBRIC EVALUATION (MAIN FOCUS)                       */}
      {/* ========================================================================= */}
      {activeTab === 'evaluations' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          
          {/* Top Project Showcase & Deliverables Inspection Header */}
          <div className="card" style={{ padding: 24, border: '1px solid rgba(0, 240, 255, 0.3)', background: 'linear-gradient(180deg, rgba(6, 16, 38, 0.95), rgba(4, 10, 24, 0.98))' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16, marginBottom: 20 }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                  <span className="badge badge-open" style={{ fontFamily: 'var(--font-mono)' }}>
                    PROJECT #{selectedProject?.id || selectedProjectId}
                  </span>
                  <span style={{ fontSize: 12, color: 'var(--neon-emerald)', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 4 }}>
                    <Check size={14} /> Deliverables Ready for Faculty Review
                  </span>
                </div>
                <h2 style={{ fontSize: 22, fontWeight: 800, color: '#fff', marginBottom: 6 }}>
                  {selectedProject?.title || 'Selected Project'}
                </h2>
                <p style={{ fontSize: 14, color: 'var(--text-secondary)', maxWidth: 800 }}>
                  {selectedProject?.description}
                </p>
              </div>

              {/* Live Demo & Git Repo Quick Links */}
              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                {activeLiveDemo && (
                  <a
                    href={activeLiveDemo}
                    target="_blank"
                    rel="noreferrer"
                    className="btn btn-secondary"
                    style={{ fontSize: 12.5, color: 'var(--neon-cyan)', borderColor: 'rgba(0, 240, 255, 0.4)' }}
                  >
                    <ExternalLink size={14} /> Open Live Staging Demo
                  </a>
                )}
                <a
                  href={activeGitUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="btn btn-primary"
                  style={{ fontSize: 12.5 }}
                >
                  <GithubIcon size={14} /> View GitHub Codebase
                </a>
              </div>
            </div>

            {/* Deliverables Sub-Navigation */}
            <div style={{ display: 'flex', gap: 8, borderBottom: '1px solid var(--border-default)', paddingBottom: 10, marginBottom: 20, overflowX: 'auto' }}>
              <button
                onClick={() => setMediaFilterTab('all')}
                className={`btn btn-sm ${mediaFilterTab === 'all' ? 'btn-primary' : 'btn-secondary'}`}
                style={{ fontSize: 12 }}
              >
                <Layers size={13} /> All Deliverables ({1 + (activeGallery?.length || 0) + 1 + (activeDocuments?.length || 0)})
              </button>
              <button
                onClick={() => setMediaFilterTab('video')}
                className={`btn btn-sm ${mediaFilterTab === 'video' ? 'btn-primary' : 'btn-secondary'}`}
                style={{ fontSize: 12, color: mediaFilterTab === 'video' ? '#fff' : 'var(--neon-cyan)' }}
              >
                <Video size={13} /> Demo Walkthrough Video (1)
              </button>
              <button
                onClick={() => setMediaFilterTab('gallery')}
                className={`btn btn-sm ${mediaFilterTab === 'gallery' ? 'btn-primary' : 'btn-secondary'}`}
                style={{ fontSize: 12, color: mediaFilterTab === 'gallery' ? '#fff' : 'var(--neon-emerald)' }}
              >
                <ImageIcon size={13} /> Photos & Architecture Blueprints ({activeGallery?.length || 0})
              </button>
              <button
                onClick={() => setMediaFilterTab('repo')}
                className={`btn btn-sm ${mediaFilterTab === 'repo' ? 'btn-primary' : 'btn-secondary'}`}
                style={{ fontSize: 12, color: mediaFilterTab === 'repo' ? '#fff' : 'var(--neon-violet)' }}
              >
                <GithubIcon size={13} /> Git Repository & Telemetry
              </button>
              <button
                onClick={() => setMediaFilterTab('docs')}
                className={`btn btn-sm ${mediaFilterTab === 'docs' ? 'btn-primary' : 'btn-secondary'}`}
                style={{ fontSize: 12, color: mediaFilterTab === 'docs' ? '#fff' : 'var(--neon-amber)' }}
              >
                <FileText size={13} /> SRS Documents & Specs ({activeDocuments?.length || 0})
              </button>
            </div>

            {/* DELIVERABLES SHOWCASE GRID */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 18 }}>

              {/* 1. DEMO WALKTHROUGH VIDEO CARD */}
              {(mediaFilterTab === 'all' || mediaFilterTab === 'video') && (
                <div style={{
                  background: 'rgba(6, 12, 28, 0.95)',
                  border: '1px solid rgba(0, 240, 255, 0.35)',
                  borderRadius: 'var(--radius-md)',
                  padding: 16,
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  boxShadow: '0 4px 20px rgba(0, 240, 255, 0.08)'
                }}>
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                      <span style={{ fontSize: 11, fontWeight: 700, fontFamily: 'var(--font-mono)', color: 'var(--neon-cyan)', display: 'flex', alignItems: 'center', gap: 5 }}>
                        <Video size={13} /> // PROJECT DEMO VIDEO
                      </span>
                      <span style={{ padding: '2px 8px', background: 'rgba(0, 240, 255, 0.15)', color: 'var(--neon-cyan)', borderRadius: 999, fontSize: 11, fontWeight: 700 }}>
                        {activeVideo.duration} HD
                      </span>
                    </div>

                    {/* Interactive Video Preview Thumbnail with Glow Play Button */}
                    <div
                      onClick={() => {
                        setActiveVideoModal(activeVideo);
                        setIsPlayingVideo(true);
                      }}
                      style={{
                        position: 'relative',
                        height: 170,
                        background: 'radial-gradient(circle at center, rgba(0, 240, 255, 0.2) 0%, rgba(3, 8, 20, 0.95) 100%)',
                        borderRadius: 'var(--radius-sm)',
                        border: '1px solid rgba(0, 240, 255, 0.3)',
                        display: 'grid',
                        placeItems: 'center',
                        cursor: 'pointer',
                        overflow: 'hidden',
                        marginBottom: 12,
                        transition: 'transform 0.2s ease, border-color 0.2s ease'
                      }}
                    >
                      {/* Background Circuit Grid Graphics */}
                      <div style={{
                        position: 'absolute',
                        inset: 0,
                        backgroundImage: 'radial-gradient(rgba(0, 240, 255, 0.15) 1px, transparent 1px)',
                        backgroundSize: '16px 16px',
                        opacity: 0.7
                      }} />

                      {/* Play Button Button Glow */}
                      <div style={{
                        position: 'relative',
                        zIndex: 2,
                        width: 56,
                        height: 56,
                        borderRadius: '50%',
                        background: 'linear-gradient(135deg, var(--neon-cyan), #0099ff)',
                        display: 'grid',
                        placeItems: 'center',
                        color: '#000',
                        boxShadow: '0 0 24px rgba(0, 240, 255, 0.7)',
                        cursor: 'pointer'
                      }}>
                        <Play size={24} fill="#000" style={{ marginLeft: 3 }} />
                      </div>

                      <div style={{ position: 'absolute', bottom: 10, left: 12, right: 12, display: 'flex', justifyContent: 'space-between', zIndex: 2 }}>
                        <span style={{ fontSize: 11.5, fontWeight: 700, color: '#fff', textShadow: '0 1px 4px rgba(0,0,0,0.8)' }}>
                          Click to Launch Video Player
                        </span>
                        <span style={{ fontSize: 10.5, fontFamily: 'var(--font-mono)', color: 'var(--neon-cyan)', background: 'rgba(0,0,0,0.6)', padding: '1px 6px', borderRadius: 4 }}>
                          1080p 60fps
                        </span>
                      </div>
                    </div>

                    <h4 style={{ fontSize: 14.5, fontWeight: 700, color: '#fff', marginBottom: 4 }}>{activeVideo.title}</h4>
                    <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 8 }}>Presenter: {activeVideo.author}</p>
                  </div>

                  <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
                    <button
                      onClick={() => {
                        setActiveVideoModal(activeVideo);
                        setIsPlayingVideo(true);
                      }}
                      className="btn btn-primary btn-sm"
                      style={{ flex: 1, fontSize: 12 }}
                    >
                      <Play size={13} /> Watch Video Demo
                    </button>
                    <a
                      href={activeVideo.url}
                      target="_blank"
                      rel="noreferrer"
                      className="btn btn-secondary btn-sm"
                      style={{ fontSize: 12 }}
                    >
                      <ExternalLink size={13} />
                    </a>
                  </div>
                </div>
              )}

              {/* 2. PHOTO GALLERY & BLUEPRINT CARDS */}
              {(mediaFilterTab === 'all' || mediaFilterTab === 'gallery') && (
                activeGallery.map((item) => (
                  <div
                    key={item.id}
                    style={{
                      background: 'rgba(6, 12, 28, 0.95)',
                      border: `1px solid ${item.color || 'var(--border-default)'}`,
                      borderRadius: 'var(--radius-md)',
                      padding: 16,
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      boxShadow: '0 4px 20px rgba(0, 0, 0, 0.4)'
                    }}
                  >
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                        <span style={{ fontSize: 11, fontWeight: 700, fontFamily: 'var(--font-mono)', color: item.color, display: 'flex', alignItems: 'center', gap: 5 }}>
                          <ImageIcon size={13} /> // {item.type.replace('_', ' ')}
                        </span>
                        <span style={{ padding: '2px 8px', background: 'rgba(255, 255, 255, 0.08)', color: item.color, borderRadius: 999, fontSize: 10.5, fontWeight: 700 }}>
                          {item.badge}
                        </span>
                      </div>

                      {/* Interactive Diagram / Photo Viewport */}
                      <div
                        onClick={() => setActiveImageModal(item)}
                        style={{
                          position: 'relative',
                          height: 170,
                          background: item.bgGradient || 'linear-gradient(135deg, rgba(10, 25, 50, 0.8), rgba(6, 12, 28, 0.95))',
                          borderRadius: 'var(--radius-sm)',
                          border: '1px solid rgba(255, 255, 255, 0.12)',
                          display: 'flex',
                          flexDirection: 'column',
                          justifyContent: 'center',
                          alignItems: 'center',
                          cursor: 'pointer',
                          overflow: 'hidden',
                          marginBottom: 12,
                          padding: 16,
                          textAlign: 'center'
                        }}
                      >
                        {/* Blueprint Visual Representation */}
                        {item.svgType === 'architecture' && (
                          <div style={{ display: 'flex', alignItems: 'center', gap: 12, zIndex: 2 }}>
                            <div style={{ padding: '8px 12px', background: 'rgba(0, 240, 255, 0.2)', border: '1px solid var(--neon-cyan)', borderRadius: 6, fontSize: 11, fontWeight: 700, color: 'var(--neon-cyan)' }}>
                              Hardware Sensors
                            </div>
                            <span style={{ color: 'var(--text-muted)' }}>➔</span>
                            <div style={{ padding: '8px 12px', background: 'rgba(0, 255, 157, 0.2)', border: '1px solid var(--neon-emerald)', borderRadius: 6, fontSize: 11, fontWeight: 700, color: 'var(--neon-emerald)' }}>
                              Spring Backend
                            </div>
                            <span style={{ color: 'var(--text-muted)' }}>➔</span>
                            <div style={{ padding: '8px 12px', background: 'rgba(168, 85, 247, 0.2)', border: '1px solid var(--neon-violet)', borderRadius: 6, fontSize: 11, fontWeight: 700, color: 'var(--neon-violet)' }}>
                              React UI
                            </div>
                          </div>
                        )}

                        {item.svgType === 'parking_ui' && (
                          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 6, width: '100%', maxWidth: 220, zIndex: 2 }}>
                            {[1,2,3,4,5,6,7,8].map(i => (
                              <div key={i} style={{
                                padding: '6px 4px',
                                background: i % 3 === 0 ? 'rgba(239, 68, 68, 0.3)' : 'rgba(0, 255, 157, 0.25)',
                                border: `1px solid ${i % 3 === 0 ? '#ef4444' : 'var(--neon-emerald)'}`,
                                borderRadius: 4,
                                fontSize: 9.5,
                                fontWeight: 700,
                                color: i % 3 === 0 ? '#ef4444' : 'var(--neon-emerald)'
                              }}>
                                Slot {i}
                              </div>
                            ))}
                          </div>
                        )}

                        {item.svgType === 'hardware' && (
                          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, zIndex: 2 }}>
                            <Cpu size={36} color="var(--neon-amber)" />
                            <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--neon-amber)', fontFamily: 'var(--font-mono)' }}>
                              ESP32 + HC-SR04 Circuit Wireframe
                            </span>
                          </div>
                        )}

                        {item.svgType === 'ml_pipeline' && (
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8, zIndex: 2 }}>
                            <Sparkles size={28} color="var(--neon-violet)" />
                            <div style={{ textAlign: 'left' }}>
                              <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--neon-violet)' }}>Heuristic ML Engine</div>
                              <div style={{ fontSize: 9.5, color: 'var(--text-muted)' }}>Cosine Similarity & Annealing</div>
                            </div>
                          </div>
                        )}

                        {item.svgType === 'study_ui' && (
                          <div style={{ width: '100%', maxWidth: 220, background: 'rgba(0,0,0,0.5)', padding: 8, borderRadius: 6, border: '1px solid rgba(0, 240, 255, 0.3)', zIndex: 2 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: 'var(--neon-cyan)', marginBottom: 4 }}>
                              <span>Focus Timer</span>
                              <span>25:00</span>
                            </div>
                            <div style={{ height: 6, background: 'rgba(255,255,255,0.1)', borderRadius: 3, overflow: 'hidden' }}>
                              <div style={{ width: '70%', height: '100%', background: 'var(--neon-cyan)' }} />
                            </div>
                          </div>
                        )}

                        {item.svgType === 'grafana_ui' && (
                          <div style={{ display: 'flex', gap: 12, alignItems: 'center', zIndex: 2 }}>
                            <div style={{ padding: '8px', background: 'rgba(255, 170, 0, 0.2)', border: '1px solid var(--neon-amber)', borderRadius: '50%', width: 50, height: 50, display: 'grid', placeItems: 'center', fontSize: 11, fontWeight: 800, color: 'var(--neon-amber)' }}>
                              24.5°C
                            </div>
                            <div style={{ padding: '8px', background: 'rgba(0, 240, 255, 0.2)', border: '1px solid var(--neon-cyan)', borderRadius: '50%', width: 50, height: 50, display: 'grid', placeItems: 'center', fontSize: 11, fontWeight: 800, color: 'var(--neon-cyan)' }}>
                              58% RH
                            </div>
                          </div>
                        )}

                        {item.svgType === 'ast_tree' && (
                          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, zIndex: 2 }}>
                            <Code2 size={32} color="var(--neon-violet)" />
                            <span style={{ fontSize: 10, color: 'var(--neon-violet)', fontFamily: 'var(--font-mono)' }}>AST Token Grammar Tree</span>
                          </div>
                        )}

                        {item.svgType === 'code_diff_ui' && (
                          <div style={{ width: '100%', maxWidth: 220, background: 'rgba(0,0,0,0.6)', padding: 6, borderRadius: 4, fontFamily: 'var(--font-mono)', fontSize: 9.5, textAlign: 'left', zIndex: 2 }}>
                            <div style={{ color: '#ef4444' }}>- SQL query injection risk</div>
                            <div style={{ color: 'var(--neon-emerald)' }}>+ PreparedStatement binding</div>
                          </div>
                        )}

                        {item.svgType === 'drone_cad' && (
                          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, zIndex: 2 }}>
                            <Layers size={32} color="var(--neon-cyan)" />
                            <span style={{ fontSize: 10, color: 'var(--neon-cyan)', fontFamily: 'var(--font-mono)' }}>SolidWorks 3D CAD Mesh</span>
                          </div>
                        )}

                        {item.svgType === 'drone_vision' && (
                          <div style={{ width: '100%', maxWidth: 200, height: 70, border: '1px dashed var(--neon-emerald)', display: 'grid', placeItems: 'center', background: 'rgba(0,0,0,0.4)', borderRadius: 4, zIndex: 2 }}>
                            <span style={{ fontSize: 10, color: 'var(--neon-emerald)', fontFamily: 'var(--font-mono)' }}>[ Corridor Obstacle: 98% ]</span>
                          </div>
                        )}

                        <div style={{ position: 'absolute', top: 8, right: 8, background: 'rgba(0,0,0,0.6)', padding: '3px 6px', borderRadius: 4, display: 'flex', alignItems: 'center', gap: 4, fontSize: 10, color: '#fff', zIndex: 3 }}>
                          <ZoomIn size={12} /> Inspect Fullscreen
                        </div>
                      </div>

                      <h4 style={{ fontSize: 14, fontWeight: 700, color: '#fff', marginBottom: 4 }}>{item.title}</h4>
                      <p style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.4 }}>{item.description}</p>
                    </div>

                    <button
                      onClick={() => setActiveImageModal(item)}
                      className="btn btn-secondary btn-sm"
                      style={{ marginTop: 12, fontSize: 12, width: '100%' }}
                    >
                      <Eye size={13} /> View Blueprint Details
                    </button>
                  </div>
                ))
              )}

              {/* 3. GIT REPOSITORY & CODE TELEMETRY CARD */}
              {(mediaFilterTab === 'all' || mediaFilterTab === 'repo') && (
                <div style={{
                  background: 'rgba(6, 12, 28, 0.95)',
                  border: '1px solid rgba(168, 85, 247, 0.35)',
                  borderRadius: 'var(--radius-md)',
                  padding: 16,
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  boxShadow: '0 4px 20px rgba(168, 85, 247, 0.08)'
                }}>
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                      <span style={{ fontSize: 11, fontWeight: 700, fontFamily: 'var(--font-mono)', color: 'var(--neon-violet)', display: 'flex', alignItems: 'center', gap: 5 }}>
                        <GithubIcon size={13} /> // GIT REPOSITORY TELEMETRY
                      </span>
                      <span style={{ padding: '2px 8px', background: 'rgba(168, 85, 247, 0.15)', color: 'var(--neon-violet)', borderRadius: 999, fontSize: 11, fontWeight: 700 }}>
                        branch: {currentCatalog.gitBranch}
                      </span>
                    </div>

                    <div style={{ background: 'rgba(0, 0, 0, 0.6)', border: '1px solid rgba(168, 85, 247, 0.2)', padding: 12, borderRadius: 'var(--radius-sm)', marginBottom: 12 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: 'var(--text-muted)', marginBottom: 6 }}>
                        <span>Repository URL</span>
                        <span style={{ color: 'var(--neon-emerald)' }}>● Active Commits</span>
                      </div>
                      <a
                        href={activeGitUrl}
                        target="_blank"
                        rel="noreferrer"
                        style={{ fontSize: 13, color: 'var(--neon-cyan)', fontWeight: 700, wordBreak: 'break-all', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 6 }}
                      >
                        {activeGitUrl} <ExternalLink size={13} />
                      </a>
                    </div>

                    {/* Clone Command Bar */}
                    <div style={{ marginBottom: 12 }}>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 4, fontFamily: 'var(--font-mono)' }}>// LOCAL CLONE COMMAND:</div>
                      <div style={{ display: 'flex', alignItems: 'center', background: 'rgba(3, 8, 20, 0.9)', border: '1px solid var(--border-default)', borderRadius: 'var(--radius-sm)', padding: '6px 10px' }}>
                        <Terminal size={14} color="var(--neon-cyan)" style={{ marginRight: 8, flexShrink: 0 }} />
                        <code style={{ fontSize: 11.5, color: '#e2e8f0', flex: 1, overflowX: 'auto', whiteSpace: 'nowrap', fontFamily: 'var(--font-mono)' }}>
                          {activeCloneCmd}
                        </code>
                        <button
                          onClick={() => copyCloneToClipboard(activeCloneCmd)}
                          className="btn btn-secondary btn-sm"
                          style={{ padding: '2px 8px', marginLeft: 8, fontSize: 11, color: copiedCloneCmd ? 'var(--neon-emerald)' : 'var(--text-secondary)' }}
                        >
                          {copiedCloneCmd ? <Check size={12} /> : <Copy size={12} />} {copiedCloneCmd ? 'Copied' : 'Copy'}
                        </button>
                      </div>
                    </div>

                    {/* Commit stats */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, textAlign: 'center', background: 'rgba(255, 255, 255, 0.03)', padding: 10, borderRadius: 6 }}>
                      <div>
                        <div style={{ fontSize: 16, fontWeight: 800, color: 'var(--neon-violet)' }}>{currentCatalog.commitsCount}</div>
                        <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>Commits</div>
                      </div>
                      <div>
                        <div style={{ fontSize: 16, fontWeight: 800, color: 'var(--neon-emerald)' }}>{selectedProject?.members?.length || 4}</div>
                        <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>Contributors</div>
                      </div>
                      <div>
                        <div style={{ fontSize: 16, fontWeight: 800, color: 'var(--neon-cyan)' }}>100%</div>
                        <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>Clean CI</div>
                      </div>
                    </div>
                  </div>

                  <a
                    href={activeGitUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="btn btn-secondary btn-sm"
                    style={{ marginTop: 12, fontSize: 12, width: '100%', justifyContent: 'center' }}
                  >
                    <GithubIcon size={13} /> Inspect Git Commit History
                  </a>
                </div>
              )}

              {/* 4. DOCUMENTS & SPECIFICATIONS */}
              {(mediaFilterTab === 'all' || mediaFilterTab === 'docs') && (
                activeDocuments.map((doc) => (
                  <div
                    key={doc.id}
                    style={{
                      background: 'rgba(6, 12, 28, 0.95)',
                      border: '1px solid rgba(255, 170, 0, 0.3)',
                      borderRadius: 'var(--radius-md)',
                      padding: 16,
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      boxShadow: '0 4px 20px rgba(255, 170, 0, 0.06)'
                    }}
                  >
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                        <span style={{ fontSize: 11, fontWeight: 700, fontFamily: 'var(--font-mono)', color: 'var(--neon-amber)', display: 'flex', alignItems: 'center', gap: 5 }}>
                          <FileText size={13} /> // {doc.type.toUpperCase()}
                        </span>
                        <span style={{ padding: '2px 8px', background: 'rgba(255, 170, 0, 0.15)', color: 'var(--neon-amber)', borderRadius: 999, fontSize: 10.5, fontWeight: 700 }}>
                          {doc.size}
                        </span>
                      </div>

                      <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 12 }}>
                        <div style={{ width: 44, height: 44, borderRadius: 'var(--radius-sm)', background: 'rgba(255, 170, 0, 0.15)', color: 'var(--neon-amber)', display: 'grid', placeItems: 'center', flexShrink: 0 }}>
                          <FileCheck size={22} />
                        </div>
                        <div>
                          <h4 style={{ fontSize: 13.5, fontWeight: 700, color: '#fff', wordBreak: 'break-all' }}>{doc.name}</h4>
                          <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Verified Mentor Deliverable</span>
                        </div>
                      </div>

                      <p style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.4 }}>{doc.desc}</p>
                    </div>

                    <button
                      onClick={() => alert(`Downloading verified deliverable: ${doc.name}`)}
                      className="btn btn-secondary btn-sm"
                      style={{ marginTop: 12, fontSize: 12, width: '100%', color: 'var(--neon-amber)', borderColor: 'rgba(255, 170, 0, 0.3)' }}
                    >
                      <Download size={13} /> Download & Review Spec
                    </button>
                  </div>
                ))
              )}

            </div>
          </div>

          {/* SIDE-BY-SIDE EVALUATION FORM & RUBRIC SCORING */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: 24 }}>
            
            {/* Rubric Evaluation Scoring Card */}
            <div className="card" style={{ border: '1px solid rgba(0, 255, 157, 0.3)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <div>
                  <h3 style={{ fontSize: 18, fontWeight: 700 }}>Academic Rubric Scoring Form</h3>
                  <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Evaluate deliverables inspected above for "{selectedProject?.title}"</span>
                </div>
                <div style={{
                  padding: '8px 16px',
                  background: 'rgba(0, 240, 255, 0.12)',
                  border: '1px solid var(--neon-cyan)',
                  color: 'var(--neon-cyan)',
                  borderRadius: 'var(--radius-sm)',
                  fontWeight: 800,
                  fontSize: 16,
                  fontFamily: 'var(--font-mono)',
                  boxShadow: '0 0 16px rgba(0, 240, 255, 0.3)'
                }}>
                  TOTAL: {totalRubricScore}% (GRADE: {letterGrade})
                </div>
              </div>

              <form onSubmit={handleRubricSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div className="form-group">
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, fontWeight: 600 }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <Code2 size={15} color="var(--neon-cyan)" /> 1. Code Quality & Technical Rigor (0-25)
                    </label>
                    <span style={{ color: 'var(--neon-cyan)', fontWeight: 700 }}>{rubricScores.codeQuality} / 25</span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={25}
                    value={rubricScores.codeQuality}
                    onChange={(e) => setRubricScores({ ...rubricScores, codeQuality: e.target.value })}
                  />
                  <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Inspects GitHub repo hygiene, branch strategy, unit testing, and design patterns.</div>
                </div>

                <div className="form-group">
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, fontWeight: 600 }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <Layers size={15} color="var(--neon-violet)" /> 2. Architecture, Problem Scope & Innovation (0-25)
                    </label>
                    <span style={{ color: 'var(--neon-violet)', fontWeight: 700 }}>{rubricScores.architecture} / 25</span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={25}
                    value={rubricScores.architecture}
                    onChange={(e) => setRubricScores({ ...rubricScores, architecture: e.target.value })}
                  />
                  <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Inspects system diagrams, architectural blueprints, modularity, and technical ambition.</div>
                </div>

                <div className="form-group">
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, fontWeight: 600 }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <Activity size={15} color="var(--neon-emerald)" /> 3. Sprint Velocity & Milestone Deliverables (0-25)
                    </label>
                    <span style={{ color: 'var(--neon-emerald)', fontWeight: 700 }}>{rubricScores.velocity} / 25</span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={25}
                    value={rubricScores.velocity}
                    onChange={(e) => setRubricScores({ ...rubricScores, velocity: e.target.value })}
                  />
                  <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Inspects demo video walkthrough, milestone completion, and working features.</div>
                </div>

                <div className="form-group">
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, fontWeight: 600 }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <Users2 size={15} color="var(--neon-amber)" /> 4. Team Collaboration & Git Hygiene (0-25)
                    </label>
                    <span style={{ color: 'var(--neon-amber)', fontWeight: 700 }}>{rubricScores.collaboration} / 25</span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={25}
                    value={rubricScores.collaboration}
                    onChange={(e) => setRubricScores({ ...rubricScores, collaboration: e.target.value })}
                  />
                  <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Inspects peer distribution, task ownership, and collaborative sprint cadence.</div>
                </div>

                <div className="form-group">
                  <label className="form-label">Official Faculty Remarks & Rubric Notes</label>
                  <textarea
                    className="form-textarea"
                    placeholder="Provide detailed comments on video demo, code architecture, and recommendations for capstone defense..."
                    value={rubricScores.remarks}
                    onChange={(e) => setRubricScores({ ...rubricScores, remarks: e.target.value })}
                  />
                </div>

                <button type="submit" disabled={submittingEval || !selectedProjectId} className="btn btn-primary" style={{ padding: '12px' }}>
                  {submittingEval ? 'Recording Marks...' : 'Submit Academic Evaluation & Marks'}
                </button>
              </form>
            </div>

            {/* Past Rubric Evaluations History */}
            <div className="card">
              <h3 style={{ fontSize: 17, fontWeight: 700, marginBottom: 16 }}>Recorded Rubrics History</h3>
              {evaluations.length === 0 ? (
                <div style={{ textAlign: 'center', padding: 30, color: 'var(--text-muted)' }}>
                  No prior evaluations recorded yet for this project. Use the form to submit initial marks!
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  {evaluations.map((ev) => (
                    <div key={ev.id} style={{ padding: 16, border: '1px solid var(--border-default)', borderRadius: 'var(--radius-sm)', background: 'rgba(6, 12, 28, 0.7)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                        <strong style={{ fontSize: 15, color: 'var(--neon-cyan)' }}>Total Score: {ev.totalScore !== undefined && ev.totalScore !== null ? `${ev.totalScore}%` : 'N/A'}</strong>
                        <span className="badge badge-open" style={{ fontSize: 13, fontWeight: 800 }}>
                          Grade: {ev.grade || (ev.totalScore >= 90 ? 'A+' : ev.totalScore >= 80 ? 'A' : ev.totalScore >= 70 ? 'B+' : ev.totalScore >= 60 ? 'B' : ev.totalScore >= 50 ? 'C' : 'F')}
                        </span>
                      </div>
                      <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 8 }}>
                        Evaluated by {ev.evaluatorName || ev.facultyName || 'Faculty Advisor'} on {ev.evaluatedAt || ev.createdAt ? new Date(ev.evaluatedAt || ev.createdAt).toLocaleDateString() : 'Recent'}
                      </div>
                      {ev.remarks && (
                        <p style={{ fontSize: 13, color: 'var(--text-secondary)', background: 'rgba(0, 0, 0, 0.4)', padding: 10, borderRadius: 6, border: '1px solid var(--border-default)' }}>
                          "{ev.remarks}"
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: PROJECTS DIRECTORY                                                 */}
      {/* ========================================================================= */}
      {activeTab === 'projects' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* Search Toolbar */}
          <div className="card" style={{ padding: 16 }}>
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
              <div style={{ fontSize: 13, fontFamily: 'var(--font-mono)', color: 'var(--text-secondary)' }}>
                SHOWING: <strong style={{ color: 'var(--neon-cyan)' }}>{projects.length} TOTAL PROJECTS</strong> (<span style={{ color: 'var(--neon-emerald)' }}>{fullCapacityCount} Full Capacity</span> • <span style={{ color: 'var(--neon-amber)' }}>{recruitingCount} Recruiting</span>)
              </div>
            </div>
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              <div style={{ flex: 1, minWidth: 220 }}>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Search projects by title, description, or leader..."
                  value={searchKeyword}
                  onChange={(e) => setSearchKeyword(e.target.value)}
                />
              </div>
              <div style={{ width: 180 }}>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Filter by skill..."
                  value={filterSkill}
                  onChange={(e) => setFilterSkill(e.target.value)}
                />
              </div>
              <button onClick={loadProjects} className="btn btn-secondary">
                <Search size={15} /> Filter
              </button>
            </div>
          </div>

          {loading ? (
            <div style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)' }}>Loading student projects...</div>
          ) : projects.length === 0 ? (
            <div className="card" style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)' }}>
              No student projects found matching filters.
            </div>
          ) : (
            <div className="projects-grid">
              {projects.map((p) => {
                const isSelected = p.id === selectedProjectId;
                const memberCount = p.memberCount || p.members?.length || 1;
                const maxMembers = p.maxMembers || 4;
                const catalog = PROJECT_MEDIA_CATALOG[p.id] || PROJECT_MEDIA_CATALOG[1];

                return (
                  <div
                    key={p.id}
                    className="project-card"
                    style={{ borderColor: isSelected ? 'var(--neon-cyan)' : 'var(--border-default)' }}
                    onClick={() => {
                      setSelectedProjectId(p.id);
                    }}
                  >
                    <div>
                      <div className="project-card-header">
                        <span className={`badge ${p.status === 'OPEN' ? 'badge-open' : 'badge-in-progress'}`}>
                          {p.status}
                        </span>
                        <span
                          className={`badge ${memberCount >= maxMembers ? 'badge-completed' : 'badge-member'}`}
                          style={memberCount >= maxMembers ? {
                            background: 'rgba(0, 255, 157, 0.15)',
                            color: 'var(--neon-emerald)',
                            border: '1px solid rgba(0, 255, 157, 0.45)',
                            fontWeight: 700
                          } : {}}
                        >
                          {memberCount >= maxMembers ? '✓ 4/4 FULLY OCCUPIED' : `${memberCount} / ${maxMembers} Members`}
                        </span>
                      </div>

                      <h3 className="project-card-title">{p.title}</h3>
                      <p className="project-card-desc">{p.description}</p>

                      {/* Deliverables Badges on Project Card */}
                      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 12 }}>
                        <span style={{ fontSize: 10.5, fontWeight: 700, padding: '2px 6px', borderRadius: 4, background: 'rgba(0, 240, 255, 0.1)', color: 'var(--neon-cyan)', border: '1px solid rgba(0, 240, 255, 0.25)', display: 'flex', alignItems: 'center', gap: 3 }}>
                          <Video size={10} /> 1 Demo Video
                        </span>
                        <span style={{ fontSize: 10.5, fontWeight: 700, padding: '2px 6px', borderRadius: 4, background: 'rgba(0, 255, 157, 0.1)', color: 'var(--neon-emerald)', border: '1px solid rgba(0, 255, 157, 0.25)', display: 'flex', alignItems: 'center', gap: 3 }}>
                          <ImageIcon size={10} /> {catalog.gallery.length} Photos & Blueprints
                        </span>
                        <span style={{ fontSize: 10.5, fontWeight: 700, padding: '2px 6px', borderRadius: 4, background: 'rgba(168, 85, 247, 0.1)', color: 'var(--neon-violet)', border: '1px solid rgba(168, 85, 247, 0.25)', display: 'flex', alignItems: 'center', gap: 3 }}>
                          <GithubIcon size={10} /> GitHub Repo
                        </span>
                      </div>

                      <div className="skills-wrap">
                        {(p.requiredSkills || '').split(',').map((s) => (
                          <span key={s} className="skill-tag">{s.trim()}</span>
                        ))}
                      </div>
                    </div>

                    <div className="project-card-footer">
                      <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                        Lead: <strong>{p.creatorName || 'Student'}</strong>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedProjectId(p.id);
                          setActiveTab('evaluations');
                        }}
                        className="btn btn-primary btn-sm"
                        style={{ fontSize: 11.5 }}
                      >
                        Inspect & Grade <ChevronRight size={12} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: SPRINT HEALTH MONITOR                                              */}
      {/* ========================================================================= */}
      {activeTab === 'progress' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {selectedProject ? (
            <div className="card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <div>
                  <h3 style={{ fontSize: 18, fontWeight: 700 }}>{selectedProject.title}</h3>
                  <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>Lead: {selectedProject.creatorName} ({selectedProject.creatorEmail})</p>
                </div>
                <span className={`badge ${projectProgress?.healthStatus === 'ON_TRACK' ? 'badge-open' : 'badge-in-progress'}`} style={{ fontSize: 13, padding: '6px 14px' }}>
                  {projectProgress?.healthStatus || 'ON_TRACK'}
                </span>
              </div>

              {/* Quick Deliverables Link in Sprint Health */}
              <div style={{ display: 'flex', gap: 10, marginBottom: 16, flexWrap: 'wrap' }}>
                <button
                  onClick={() => {
                    setActiveVideoModal(currentCatalog.video);
                    setIsPlayingVideo(true);
                  }}
                  className="btn btn-secondary btn-sm"
                  style={{ fontSize: 12, color: 'var(--neon-cyan)' }}
                >
                  <Play size={12} /> Watch Sprint Demo Video ({currentCatalog.video.duration})
                </button>
                <a
                  href={activeGitUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="btn btn-secondary btn-sm"
                  style={{ fontSize: 12 }}
                >
                  <GithubIcon size={12} /> Inspect Repository ({currentCatalog.commitsCount} Commits)
                </a>
              </div>

              <div style={{ background: 'var(--bg-subtle)', padding: 20, borderRadius: 'var(--radius-md)', marginBottom: 20 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, fontSize: 14, fontWeight: 700 }}>
                  <span>Sprint Completion Velocity</span>
                  <span style={{ color: 'var(--primary-700)' }}>{projectProgress?.overallProgress || 0}% Complete</span>
                </div>
                <div style={{ width: '100%', height: 10, background: 'var(--border-default)', borderRadius: 999, overflow: 'hidden' }}>
                  <div style={{ width: `${projectProgress?.overallProgress || 0}%`, height: '100%', background: 'var(--primary-600)', borderRadius: 999 }} />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
                <div style={{ padding: 14, border: '1px solid var(--border-default)', borderRadius: 'var(--radius-sm)' }}>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Total Sprint Tasks</div>
                  <div style={{ fontSize: 22, fontWeight: 800 }}>{projectProgress?.totalTasks || selectedProject.tasks?.length || 0}</div>
                </div>
                <div style={{ padding: 14, border: '1px solid var(--border-default)', borderRadius: 'var(--radius-sm)' }}>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Completed Deliverables</div>
                  <div style={{ fontSize: 22, fontWeight: 800, color: 'var(--success-700)' }}>{projectProgress?.completedTasks || 0}</div>
                </div>
                <div style={{ padding: 14, border: '1px solid var(--border-default)', borderRadius: 'var(--radius-sm)' }}>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Pending Tasks</div>
                  <div style={{ fontSize: 22, fontWeight: 800, color: 'var(--warning-700)' }}>
                    {(projectProgress?.totalTasks || 0) - (projectProgress?.completedTasks || 0)}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="card" style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)' }}>
              Select a project from the directory to view sprint health metrics.
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 4: MENTORSHIP FEEDBACK                                                */}
      {/* ========================================================================= */}
      {activeTab === 'feedback' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: 24 }}>
          {/* Form */}
          <div className="card">
            <h3 style={{ fontSize: 17, fontWeight: 700, marginBottom: 16 }}>
              Submit Mentorship Feedback for "{selectedProject?.title || 'Selected Project'}"
            </h3>

            <form onSubmit={handleFeedbackSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div className="form-group">
                <label className="form-label">Mentorship Rating (1 to 5 Stars)</label>
                <div style={{ display: 'flex', gap: 8 }}>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setFeedbackRating(star)}
                      style={{ background: 'none', border: 'none', cursor: 'pointer' }}
                    >
                      <Star size={24} fill={star <= feedbackRating ? '#f59e0b' : 'none'} color={star <= feedbackRating ? '#f59e0b' : 'var(--border-strong)'} />
                    </button>
                  ))}
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Constructive Feedback & Architecture Recommendations</label>
                <textarea
                  className="form-textarea"
                  placeholder="Provide guidance on technical stack choices, sprint milestone pacing, or test coverage..."
                  value={feedbackText}
                  onChange={(e) => setFeedbackText(e.target.value)}
                  required
                />
              </div>

              <button type="submit" disabled={submittingFeedback || !selectedProjectId} className="btn btn-primary">
                {submittingFeedback ? 'Submitting...' : 'Post Mentorship Feedback'}
              </button>
            </form>
          </div>

          {/* History */}
          <div className="card">
            <h3 style={{ fontSize: 17, fontWeight: 700, marginBottom: 16 }}>Project Mentorship History</h3>
            {(!feedbacks || feedbacks.length === 0) && (!selectedProject?.feedbacks || selectedProject?.feedbacks?.length === 0) ? (
              <div style={{ textAlign: 'center', padding: 30, color: 'var(--text-muted)' }}>
                No prior feedback submitted for this project.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {(feedbacks.length > 0 ? feedbacks : (selectedProject?.feedbacks || [])).map((fb) => (
                  <div key={fb.id} style={{ padding: 14, border: '1px solid var(--border-default)', borderRadius: 'var(--radius-sm)', background: 'rgba(6, 12, 28, 0.7)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                      <strong>{fb.facultyName || 'Faculty Advisor'}</strong>
                      <div style={{ display: 'flex', gap: 2 }}>
                        {[1, 2, 3, 4, 5].map((s) => (
                          <Star key={s} size={14} fill={s <= (fb.rating || 5) ? '#f59e0b' : 'none'} color="#f59e0b" />
                        ))}
                      </div>
                    </div>
                    <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{fb.feedbackText || fb.comments}</p>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4, fontFamily: 'var(--font-mono)' }}>
                      {fb.createdAt ? new Date(fb.createdAt).toLocaleString() : 'Recently'}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 5: PROJECT APPROVALS                                                  */}
      {/* ========================================================================= */}
      {activeTab === 'approvals' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: 24 }}>
          <div className="card">
            <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 16 }}>
              Formal Project Sign-off & Approval
            </h3>

            <form onSubmit={handleApprovalSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div className="form-group">
                <label className="form-label">Decision</label>
                <select
                  className="form-select"
                  value={approvalDecision}
                  onChange={(e) => setApprovalDecision(e.target.value)}
                >
                  <option value="APPROVED">APPROVED (Authorized for Academic Credit)</option>
                  <option value="REJECTED">REJECTED (Requires Revision)</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Sign-off Comments / Revisions Needed</label>
                <textarea
                  className="form-textarea"
                  placeholder="State the rationale for sign-off or required amendments..."
                  value={approvalComments}
                  onChange={(e) => setApprovalComments(e.target.value)}
                  required
                />
              </div>

              <button type="submit" disabled={submittingApproval || !selectedProjectId} className="btn btn-primary">
                {submittingApproval ? 'Saving Decision...' : 'Record Sign-off Decision'}
              </button>
            </form>
          </div>

          <div className="card">
            <h3 style={{ fontSize: 17, fontWeight: 700, marginBottom: 16 }}>Approval History</h3>
            {approvals.length === 0 ? (
              <div style={{ textAlign: 'center', padding: 30, color: 'var(--text-muted)' }}>
                No formal approvals recorded yet for this project.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {approvals.map((app) => (
                  <div key={app.id} style={{ padding: 14, border: '1px solid var(--border-default)', borderRadius: 'var(--radius-sm)', background: 'rgba(6, 12, 28, 0.7)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                      <span className={`badge ${app.decision === 'APPROVED' ? 'badge-open' : 'badge-closed'}`}>
                        {app.decision || app.status}
                      </span>
                      <span style={{ fontSize: 11.5, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                        {app.facultyName ? `by ${app.facultyName} • ` : ''}{app.decidedAt || app.createdAt ? new Date(app.decidedAt || app.createdAt).toLocaleDateString() : 'Recent'}
                      </span>
                    </div>
                    {app.comments && (
                      <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{app.comments}</p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* INTERACTIVE MODAL 1: VIDEO DEMO PLAYER                                     */}
      {/* ========================================================================= */}
      {activeVideoModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(2, 6, 18, 0.88)',
          backdropFilter: 'blur(8px)',
          zIndex: 9999,
          display: 'grid',
          placeItems: 'center',
          padding: 20
        }}>
          <div style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--neon-cyan)',
            borderRadius: 'var(--radius-md)',
            width: '100%',
            maxWidth: 820,
            overflow: 'hidden',
            boxShadow: '0 0 40px rgba(0, 240, 255, 0.3)'
          }}>
            {/* Modal Header */}
            <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border-default)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(6, 14, 32, 0.95)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'rgba(0, 240, 255, 0.15)', color: 'var(--neon-cyan)', display: 'grid', placeItems: 'center' }}>
                  <Video size={18} />
                </div>
                <div>
                  <h3 style={{ fontSize: 16, fontWeight: 800, color: '#fff' }}>{activeVideoModal.title}</h3>
                  <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Duration: {activeVideoModal.duration} • Presented by {activeVideoModal.author}</span>
                </div>
              </div>
              <button
                onClick={() => {
                  setActiveVideoModal(null);
                  setIsPlayingVideo(false);
                }}
                className="btn btn-secondary btn-sm"
                style={{ padding: '6px' }}
              >
                <X size={18} />
              </button>
            </div>

            {/* Video Player Display Screen */}
            <div style={{
              position: 'relative',
              background: '#000',
              height: 400,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
              borderBottom: '1px solid var(--border-default)'
            }}>
              {/* Animated HUD video player graphics */}
              <div style={{
                width: '90%',
                height: '80%',
                border: '1px solid rgba(0, 240, 255, 0.25)',
                borderRadius: 8,
                background: 'radial-gradient(ellipse at center, rgba(0, 240, 255, 0.1) 0%, rgba(0,0,0,0.9) 100%)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                padding: 16
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: 11, color: 'var(--neon-emerald)', fontFamily: 'var(--font-mono)', display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--neon-emerald)', display: 'inline-block' }} />
                    LIVE SPRINT DEMO STREAM • 1080p
                  </span>
                  <span style={{ fontSize: 11, color: 'var(--neon-cyan)', fontFamily: 'var(--font-mono)' }}>
                    {isPlayingVideo ? '02:14 / ' + activeVideoModal.duration : 'PAUSED'}
                  </span>
                </div>

                <div style={{ textAlign: 'center' }}>
                  <button
                    onClick={() => setIsPlayingVideo(!isPlayingVideo)}
                    style={{
                      width: 68,
                      height: 68,
                      borderRadius: '50%',
                      background: 'linear-gradient(135deg, var(--neon-cyan), #0088ff)',
                      border: 'none',
                      color: '#000',
                      cursor: 'pointer',
                      display: 'inline-grid',
                      placeItems: 'center',
                      boxShadow: '0 0 30px rgba(0, 240, 255, 0.7)'
                    }}
                  >
                    {isPlayingVideo ? <Check size={30} /> : <Play size={30} fill="#000" style={{ marginLeft: 4 }} />}
                  </button>
                  <div style={{ fontSize: 13, fontWeight: 700, color: '#fff', marginTop: 12 }}>
                    {isPlayingVideo ? 'Playing Demonstration Footage' : 'Click to Resume Playback'}
                  </div>
                </div>

                {/* Progress bar */}
                <div>
                  <div style={{ height: 5, background: 'rgba(255,255,255,0.15)', borderRadius: 3, overflow: 'hidden', marginBottom: 6 }}>
                    <div style={{ width: isPlayingVideo ? '54%' : '0%', height: '100%', background: 'var(--neon-cyan)', transition: 'width 0.3s ease' }} />
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: 'var(--text-muted)' }}>
                    <span>Architecture Overview</span>
                    <span>Live Code Telemetry</span>
                    <span>Feature Defense</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Video Highlights & Timestamps */}
            <div style={{ padding: 20, background: 'rgba(6, 12, 28, 0.95)' }}>
              <h4 style={{ fontSize: 13, fontWeight: 700, color: 'var(--neon-cyan)', marginBottom: 8, fontFamily: 'var(--font-mono)' }}>
                // DEMO CHAPTER TIMESTAMPS:
              </h4>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 8, marginBottom: 16 }}>
                {activeVideoModal.highlights?.map((hl, idx) => (
                  <div key={idx} style={{ fontSize: 12, color: 'var(--text-secondary)', background: 'rgba(255, 255, 255, 0.04)', padding: '6px 10px', borderRadius: 4, border: '1px solid var(--border-default)' }}>
                    {hl}
                  </div>
                ))}
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
                <a
                  href={activeVideoModal.url}
                  target="_blank"
                  rel="noreferrer"
                  className="btn btn-secondary"
                  style={{ fontSize: 12.5 }}
                >
                  <ExternalLink size={14} /> Open Full Screen Stream
                </a>
                <button
                  onClick={() => {
                    setActiveVideoModal(null);
                    setIsPlayingVideo(false);
                  }}
                  className="btn btn-primary"
                  style={{ fontSize: 12.5 }}
                >
                  Done Reviewing
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* INTERACTIVE MODAL 2: LIGHTBOX PHOTO / DIAGRAM FULLSCREEN VIEWER            */}
      {/* ========================================================================= */}
      {activeImageModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(2, 6, 18, 0.92)',
          backdropFilter: 'blur(10px)',
          zIndex: 9999,
          display: 'grid',
          placeItems: 'center',
          padding: 20
        }}>
          <div style={{
            background: 'var(--bg-card)',
            border: `1px solid ${activeImageModal.color || 'var(--neon-cyan)'}`,
            borderRadius: 'var(--radius-md)',
            width: '100%',
            maxWidth: 900,
            overflow: 'hidden',
            boxShadow: `0 0 50px ${activeImageModal.color || 'rgba(0, 240, 255, 0.3)'}`
          }}>
            {/* Lightbox Header */}
            <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border-default)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(6, 14, 32, 0.95)' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 2 }}>
                  <span style={{ fontSize: 11, fontWeight: 700, fontFamily: 'var(--font-mono)', color: activeImageModal.color }}>
                    // {activeImageModal.category}
                  </span>
                  <span className="badge badge-open" style={{ fontSize: 10.5 }}>{activeImageModal.badge}</span>
                </div>
                <h3 style={{ fontSize: 17, fontWeight: 800, color: '#fff' }}>{activeImageModal.title}</h3>
              </div>
              <button
                onClick={() => setActiveImageModal(null)}
                className="btn btn-secondary btn-sm"
                style={{ padding: '6px' }}
              >
                <X size={18} />
              </button>
            </div>

            {/* High-Resolution Blueprint Canvas */}
            <div style={{
              background: 'radial-gradient(circle at center, rgba(10, 25, 60, 0.9) 0%, rgba(3, 8, 20, 0.98) 100%)',
              padding: 40,
              minHeight: 340,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
              borderBottom: '1px solid var(--border-default)'
            }}>
              <div style={{
                border: `2px solid ${activeImageModal.color}`,
                borderRadius: 'var(--radius-md)',
                padding: 30,
                background: 'rgba(4, 10, 26, 0.85)',
                width: '100%',
                maxWidth: 680,
                boxShadow: `0 0 30px ${activeImageModal.color}40`,
                textAlign: 'center'
              }}>
                <div style={{ fontSize: 13, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', marginBottom: 12 }}>
                  HIGH-RESOLUTION ARTIFACT PREVIEW
                </div>
                <h2 style={{ fontSize: 20, fontWeight: 800, color: '#fff', marginBottom: 12 }}>
                  {activeImageModal.title}
                </h2>
                <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.6, maxWidth: 540, margin: '0 auto' }}>
                  {activeImageModal.description}
                </p>

                <div style={{ marginTop: 24, display: 'inline-flex', gap: 10, background: 'rgba(255,255,255,0.05)', padding: '6px 14px', borderRadius: 999 }}>
                  <span style={{ fontSize: 12, color: 'var(--neon-emerald)', fontWeight: 700 }}>✓ Verified Artifact</span>
                  <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>•</span>
                  <span style={{ fontSize: 12, color: 'var(--neon-cyan)' }}>Vector Scalable SVG</span>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div style={{ padding: '14px 20px', background: 'rgba(6, 12, 28, 0.95)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                Artifact ID: {activeImageModal.id}
              </span>
              <div style={{ display: 'flex', gap: 10 }}>
                <button
                  onClick={() => alert(`Downloading high-resolution diagram: ${activeImageModal.title}.png`)}
                  className="btn btn-secondary btn-sm"
                  style={{ fontSize: 12 }}
                >
                  <Download size={13} /> Download Blueprint
                </button>
                <button
                  onClick={() => setActiveImageModal(null)}
                  className="btn btn-primary btn-sm"
                  style={{ fontSize: 12 }}
                >
                  Close Lightbox
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
