import { useEffect, useState } from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import type { AccountInfo } from '@azure/msal-browser';
import './App.css';

import { LOGIN_SCOPES, apiFetch, getActiveAccount, msalInstance } from './lib/auth';
import type { Profile, RoleName } from './lib/types';
import { Layout } from './components/Layout';
import { LoginPage } from './pages/LoginPage';
import { Landing } from './pages/Landing';
import { AdminMappings } from './pages/AdminMappings';
import { PolicyHome } from './pages/policy/PolicyHome';
import { CreateQuote } from './pages/policy/CreateQuote';
import { BindPolicy } from './pages/policy/BindPolicy';

function AccessDenied() {
  return (
    <div className="panel">
      <div className="panel-head">
        <div>
          <p className="eyebrow">Access denied</p>
          <h2>You do not have permission</h2>
          <p className="muted">This area requires a role your account has not been granted.</p>
        </div>
      </div>
    </div>
  );
}

function RequireRole({
  roles,
  allowed,
  children,
}: {
  roles: RoleName[];
  allowed: RoleName[];
  children: React.ReactNode;
}) {
  const hasAccess = roles.some((role) => allowed.includes(role));
  return hasAccess ? <>{children}</> : <AccessDenied />;
}

function App() {
  const [account, setAccount] = useState<AccountInfo | null>(null);
  const [roles, setRoles] = useState<RoleName[]>([]);
  const [initializing, setInitializing] = useState(true);
  const [loadingProfile, setLoadingProfile] = useState(false);

  useEffect(() => {
    const initialize = async () => {
      try {
        await msalInstance.initialize();
        await msalInstance.handleRedirectPromise();
        setAccount(getActiveAccount() || null);
      } catch (error) {
        console.error('MSAL initialization failed:', error);
      } finally {
        setInitializing(false);
      }
    };

    void initialize();
  }, []);

  useEffect(() => {
    if (!account) {
      setRoles([]);
      return;
    }

    const loadProfile = async () => {
      setLoadingProfile(true);
      try {
        const profile = await apiFetch<Profile>('/api/profile');
        setRoles(profile.roles || []);
      } catch (error) {
        console.error('Failed to load profile:', error);
        setRoles([]);
      } finally {
        setLoadingProfile(false);
      }
    };

    void loadProfile();
  }, [account]);

  const handleLogin = () => {
    void msalInstance.loginRedirect({ scopes: LOGIN_SCOPES });
  };

  const handleLogout = () => {
    void msalInstance.logoutRedirect();
  };

  if (initializing) {
    return (
      <div className="page-shell">
        <div className="card loading-card">Checking Azure session...</div>
      </div>
    );
  }

  if (!account) {
    return <LoginPage onLogin={handleLogin} />;
  }

  if (loadingProfile) {
    return (
      <div className="page-shell">
        <div className="card loading-card">Loading your access...</div>
      </div>
    );
  }

  const underwriterRoles: RoleName[] = ['user', 'admin'];
  const adminRoles: RoleName[] = ['admin'];
  const underwriterName = account.name || account.username;

  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout account={account} roles={roles} onLogout={handleLogout} />}>
          <Route index element={<Navigate to="/home" replace />} />
          <Route path="/home" element={<Landing account={account} roles={roles} />} />

          <Route
            path="/policy"
            element={
              <RequireRole roles={roles} allowed={underwriterRoles}>
                <PolicyHome />
              </RequireRole>
            }
          />
          <Route
            path="/policy/quote"
            element={
              <RequireRole roles={roles} allowed={underwriterRoles}>
                <CreateQuote underwriter={underwriterName} />
              </RequireRole>
            }
          />
          <Route
            path="/policy/bind"
            element={
              <RequireRole roles={roles} allowed={underwriterRoles}>
                <BindPolicy />
              </RequireRole>
            }
          />

          <Route
            path="/admin/mappings"
            element={
              <RequireRole roles={roles} allowed={adminRoles}>
                <AdminMappings />
              </RequireRole>
            }
          />

          <Route path="*" element={<Navigate to="/home" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
