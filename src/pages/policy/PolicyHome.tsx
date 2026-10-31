import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { listQuotes } from '../../lib/policyStore';

const currency = (value: number) =>
  value.toLocaleString(undefined, { style: 'currency', currency: 'USD' });

export function PolicyHome() {
  // Re-read on each mount; the store is synchronous localStorage.
  const [quotes] = useState(() => listQuotes());

  const stats = useMemo(() => {
    const bound = quotes.filter((quote) => quote.status === 'bound');
    const quoted = quotes.filter((quote) => quote.status === 'quoted');
    const premium = bound.reduce((sum, quote) => sum + quote.premium, 0);
    return { total: quotes.length, bound: bound.length, quoted: quoted.length, premium };
  }, [quotes]);

  return (
    <div className="panel">
      <div className="panel-head">
        <div>
          <p className="eyebrow">Policy admin system</p>
          <h2>Underwriting dashboard</h2>
          <p className="muted">Create quotes, then bind and issue policies.</p>
        </div>
        <Link className="primary-button" to="/policy/quote">
          New quote
        </Link>
      </div>

      <div className="stat-grid">
        <div className="stat-card">
          <span className="stat-value">{stats.total}</span>
          <span className="stat-label">Total submissions</span>
        </div>
        <div className="stat-card">
          <span className="stat-value">{stats.quoted}</span>
          <span className="stat-label">Open quotes</span>
        </div>
        <div className="stat-card">
          <span className="stat-value">{stats.bound}</span>
          <span className="stat-label">Bound policies</span>
        </div>
        <div className="stat-card">
          <span className="stat-value">{currency(stats.premium)}</span>
          <span className="stat-label">Bound premium</span>
        </div>
      </div>

      <div className="table-wrap">
        <table className="data-table">
          <thead>
            <tr>
              <th>Reference</th>
              <th>Applicant</th>
              <th>Product</th>
              <th>Coverage</th>
              <th>Premium</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {quotes.length === 0 && (
              <tr>
                <td colSpan={6} className="muted center">
                  No quotes yet. Start by creating one.
                </td>
              </tr>
            )}
            {quotes.map((quote) => (
              <tr key={quote.id}>
                <td className="mono">{quote.policyNumber || quote.id}</td>
                <td>{quote.applicantName}</td>
                <td>{quote.product}</td>
                <td>{currency(quote.coverageAmount)}</td>
                <td>{currency(quote.premium)}</td>
                <td>
                  <span className={`badge badge-${quote.status}`}>{quote.status}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
