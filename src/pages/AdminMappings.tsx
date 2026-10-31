import { useEffect, useMemo, useState } from 'react';
import { apiFetch } from '../lib/auth';
import type { GroupRoleMapping, Role } from '../lib/types';

interface RolesResponse {
  roles: Role[];
}

interface MappingsResponse {
  mappings: GroupRoleMapping[];
}

// Quick-fill shortcuts for the known Entra security groups in this tenant.
const KNOWN_GROUPS = [
  { name: 'SSO_SETUP_ADMIN', id: '6637f07b-c9a4-41f7-9149-27f6d501b753' },
  { name: 'SSO_SETUP_USER', id: '533975f0-640b-491e-a273-3aef32cd81f3' },
];

export function AdminMappings() {
  const [roles, setRoles] = useState<Role[]>([]);
  const [mappings, setMappings] = useState<GroupRoleMapping[]>([]);
  const [groupName, setGroupName] = useState('');
  const [groupObjectId, setGroupObjectId] = useState('');
  const [roleName, setRoleName] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  const loadData = async () => {
    setLoading(true);
    setError('');
    try {
      const [rolesRes, mappingsRes] = await Promise.all([
        apiFetch<RolesResponse>('/api/admin/roles'),
        apiFetch<MappingsResponse>('/api/admin/group-role-mappings'),
      ]);
      setRoles(rolesRes.roles);
      setMappings(mappingsRes.mappings);
      if (!roleName && rolesRes.roles.length > 0) {
        setRoleName(rolesRes.roles[0].roleName);
      }
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Failed to load admin data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setSaving(true);
    setError('');
    setNotice('');
    try {
      await apiFetch('/api/admin/group-role-mappings', {
        method: 'POST',
        body: JSON.stringify({
          groupObjectId: groupObjectId.trim(),
          groupName: groupName.trim(),
          roleName,
        }),
      });
      setNotice(`Mapped ${groupName || groupObjectId} to "${roleName}".`);
      setGroupName('');
      setGroupObjectId('');
      await loadData();
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'Failed to save mapping.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (mapping: GroupRoleMapping) => {
    setError('');
    setNotice('');
    try {
      await apiFetch(
        `/api/admin/group-role-mappings/${encodeURIComponent(mapping.groupObjectId)}/${encodeURIComponent(mapping.roleName)}`,
        { method: 'DELETE' },
      );
      setNotice('Mapping removed.');
      await loadData();
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : 'Failed to delete mapping.');
    }
  };

  const applyKnownGroup = (group: { name: string; id: string }) => {
    setGroupName(group.name);
    setGroupObjectId(group.id);
  };

  const canSubmit = useMemo(
    () => groupObjectId.trim().length > 0 && roleName.length > 0 && !saving,
    [groupObjectId, roleName, saving],
  );

  return (
    <div className="panel">
      <div className="panel-head">
        <div>
          <p className="eyebrow">Admin control</p>
          <h2>AD group to role mapping</h2>
          <p className="muted">
            Map a Microsoft Entra security group to an application role. Users in that group
            receive the role on their next sign-in.
          </p>
        </div>
      </div>

      <form className="mapping-form" onSubmit={handleSubmit}>
        <div className="field">
          <label htmlFor="groupName">AD group name</label>
          <input
            id="groupName"
            type="text"
            placeholder="SSO_SETUP_ADMIN"
            value={groupName}
            onChange={(event) => setGroupName(event.target.value)}
          />
        </div>

        <div className="field">
          <label htmlFor="groupObjectId">Group object ID</label>
          <input
            id="groupObjectId"
            type="text"
            placeholder="00000000-0000-0000-0000-000000000000"
            value={groupObjectId}
            onChange={(event) => setGroupObjectId(event.target.value)}
            required
          />
        </div>

        <div className="field">
          <label htmlFor="roleName">Role</label>
          <select
            id="roleName"
            value={roleName}
            onChange={(event) => setRoleName(event.target.value)}
          >
            {roles.map((role) => (
              <option key={role.roleName} value={role.roleName}>
                {role.displayName} ({role.roleName})
              </option>
            ))}
          </select>
        </div>

        <div className="field field-actions">
          <button className="primary-button" type="submit" disabled={!canSubmit}>
            {saving ? 'Saving...' : 'Add mapping'}
          </button>
        </div>
      </form>

      <div className="quick-fill">
        <span className="muted">Quick fill:</span>
        {KNOWN_GROUPS.map((group) => (
          <button
            key={group.id}
            type="button"
            className="chip"
            onClick={() => applyKnownGroup(group)}
          >
            {group.name}
          </button>
        ))}
      </div>

      {notice && <div className="status success">{notice}</div>}
      {error && <div className="status error">{error}</div>}

      <div className="table-wrap">
        <table className="data-table">
          <thead>
            <tr>
              <th>Group name</th>
              <th>Group object ID</th>
              <th>Role</th>
              <th aria-label="actions" />
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr>
                <td colSpan={4} className="muted center">
                  Loading mappings...
                </td>
              </tr>
            )}
            {!loading && mappings.length === 0 && (
              <tr>
                <td colSpan={4} className="muted center">
                  No mappings yet. Add one above.
                </td>
              </tr>
            )}
            {!loading &&
              mappings.map((mapping) => (
                <tr key={`${mapping.groupObjectId}-${mapping.roleName}`}>
                  <td>{mapping.groupName || '—'}</td>
                  <td className="mono">{mapping.groupObjectId}</td>
                  <td>
                    <span className={`badge badge-${mapping.roleName}`}>{mapping.roleName}</span>
                  </td>
                  <td className="right">
                    <button
                      type="button"
                      className="link-danger"
                      onClick={() => handleDelete(mapping)}
                    >
                      Remove
                    </button>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
