import { Routes, Route, Navigate } from 'react-router-dom';
import AppLayout from './layouts/AppLayout';
import Dashboard from './pages/Dashboard';
import Projects from './pages/Projects';
import Teams from './pages/Teams';
import Tasks from './pages/Tasks';
import Messages from './pages/Messages';
import Notifications from './pages/Notifications';
import Profile from './pages/Profile';
import Faculty from './pages/Faculty';
import Admin from './pages/Admin';
import Placeholder from './pages/Placeholder';

export default function App() {
  return <Routes><Route element={<AppLayout />}>
    <Route path="/" element={<Navigate to="/dashboard" replace />} />
    <Route path="/dashboard" element={<Dashboard />} />
    <Route path="/projects" element={<Projects />} />
    <Route path="/teams" element={<Teams />} />
    <Route path="/tasks" element={<Tasks />} />
    <Route path="/messages" element={<Messages />} />
    <Route path="/notifications" element={<Notifications />} />
    <Route path="/profile" element={<Profile />} />
    <Route path="/faculty" element={<Faculty />} />
    <Route path="/admin" element={<Admin />} />
    <Route path="*" element={<Placeholder />} />
  </Route></Routes>;
}
