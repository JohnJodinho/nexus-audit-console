import { useState } from 'react';
import { LoaderCircle, LockKeyhole } from 'lucide-react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { LogoMark } from '../components/brand/LogoMark';
import { useAuth } from '../auth';

export function LoginPage() {
  const { token, signIn, loginError, isSigningIn } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  if (token) return <Navigate to={(location.state as { from?: string } | null)?.from ?? '/crawls'} replace />;
  async function submit(event: React.FormEvent) {
    event.preventDefault();
    if (await signIn(username.trim(), password)) navigate('/crawls', { replace: true });
  }
  return <div className="login-page"><div className="login-panel">
    <div className="login-brand"><LogoMark /><div><strong>Nexus</strong><span>Audit Console</span></div></div>
    <div className="eyebrow">Operator access</div><h1>Sign in</h1><p className="login-copy">Secure access to crawl operations and audit findings.</p>
    <form onSubmit={submit} className="login-form">
      <label className="form-label">Username<input className="form-input" value={username} onChange={(event) => setUsername(event.target.value)} autoComplete="username" required /></label>
      <label className="form-label">Password<input className="form-input" type="password" value={password} onChange={(event) => setPassword(event.target.value)} autoComplete="current-password" required /></label>
      {loginError && <div className="error-box" role="alert">{loginError}</div>}
      <button className="button button-primary login-submit" disabled={isSigningIn}>{isSigningIn ? <LoaderCircle className="spin" size={16} /> : <LockKeyhole size={15} />}{isSigningIn ? 'Signing in…' : 'Sign in'}</button>
    </form>
    <p className="session-note">Sessions are short-lived and held in memory only.</p>
  </div></div>;
}
