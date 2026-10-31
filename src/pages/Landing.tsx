import { Link } from 'react-router-dom';
import type { AccountInfo } from '@azure/msal-browser';
import type { RoleName } from '../lib/types';

interface LandingProps {
  account: AccountInfo | null;
  roles: RoleName[];
}

export function Landing({ account, roles }: LandingProps) {
  const isAdmin = roles.includes('admin');
  const isUnderwriter = roles.includes('user') || isAdmin;

  return (
    <div className="panel">
      <div className="panel-head">
        <div>
          <p className="eyebrow">Signed in</p>
          <h2>Welcome, {account?.name || 'there'}</h2>
          <p className="muted">
            Your access is determined by your Microsoft Entra group membership.
          </p>
        </div>
      </div>

      {roles.length === 0 && (
        <div className="status error">
          You are signed in but have no application roles yet. Ask an administrator to map one of
          your AD groups to a role.
        </div>
      )}

      <div className="card-grid">
        {isUnderwriter && (
          <Link to="/policy" className="feature-card">
            <h3>Policy admin system</h3>
            <p className="muted">Create quotes and bind / issue policies as an underwriter.</p>
            <span className="feature-cta">Open dashboard →</span>
          </Link>
        )}

        {isAdmin && (
          <Link to="/admin/mappings" className="feature-card feature-card-admin">
            <h3>Admin control</h3>
            <p className="muted">Configure AD group to role mappings for the organization.</p>
            <span className="feature-cta">Manage mappings →</span>
          </Link>
        )}

        {!isUnderwriter && !isAdmin && (
          <div className="feature-card feature-card-locked">
            <h3>No applications available</h3>
            <p className="muted">Once a role is assigned, your apps will appear here.</p>
          </div>
        )}
      </div>
    </div>
  );
}
