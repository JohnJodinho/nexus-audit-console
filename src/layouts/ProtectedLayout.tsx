import { useState } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../auth';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';

export function ProtectedLayout() {
  const { token, signOut } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(true);
  if (!token) return <Navigate to="/login" replace />;
  return <div className={darkMode ? 'app-shell theme-dark' : 'app-shell theme-light'}><Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} onSignOut={signOut} /><div className="app-content"><Topbar darkMode={darkMode} onMenu={() => setSidebarOpen(true)} onToggleTheme={() => setDarkMode((value) => !value)} onSignOut={signOut} /><main className="main-content"><Outlet /></main></div></div>;
}
