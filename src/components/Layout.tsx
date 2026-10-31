import { NavLink, Outlet } from 'react-router-dom';
import type { AccountInfo } from '@azure/msal-browser';
import type { RoleName } from '../lib/types';

interface LayoutProps {
  account: AccountInfo | null;
  roles: RoleName[];
  onLogout: () => void;
}

export function Layout({ account, roles, onLogout }: LayoutProps) {
  const isAdmin = roles.includes('admin');
  const isUnderwriter = roles.includes('user') || isAdmin;

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <span className="brand-mark">UW</span>
          <span className="brand-text">Policy Portal</span>
        </div>

        <nav className="side-nav">
          <NavLink to="/home" className="nav-link">
            Home
          </NavLink>

          {isUnderwriter && (
            <>
              <span className="nav-group">Policy admin system</span>
              <NavLink to="/policy" end className="nav-link">
                Dashboard
              </NavLink>
              <NavLink to="/policy/quote" className="nav-link">
                Create quote
              </NavLink>
              <NavLink to="/policy/bind" className="nav-link">
                Bind / issue policy
              </NavLink>
            </>
          )}

          {isAdmin && (
            <>
              <span className="nav-group">Administration</span>
              <NavLink to="/admin/mappings" className="nav-link">
                Group role mapping
              </NavLink>
            </>
          )}
        </nav>

        <div className="sidebar-footer">
          <div className="user-chip">
            <span className="user-name">{account?.name || 'Signed in'}</span>
            <span className="user-mail">{account?.username}</span>
          </div>
          <div className="role-badges">
            {roles.length === 0 && <span className="badge badge-none">no roles</span>}
            {roles.map((role) => (
              <span key={role} className={`badge badge-${role}`}>
                {role}
              </span>
            ))}
          </div>
          <button type="button" className="secondary-button block" onClick={onLogout}>
            Log out
          </button>
        </div>
      </aside>

      <main className="content">
        <Outlet />
      </main>
    </div>
  );
}
