import { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { bindQuote, listQuotes } from '../../lib/policyStore';
import type { Quote } from '../../lib/types';

const currency = (value: number) =>
  value.toLocaleString(undefined, { style: 'currency', currency: 'USD' });

export function BindPolicy() {
  const location = useLocation();
  const preselectedId = (location.state as { quoteId?: string } | null)?.quoteId;

  const [quotes, setQuotes] = useState<Quote[]>(() => listQuotes());
  const [selectedId, setSelectedId] = useState<string>(
    preselectedId || quotes.find((quote) => quote.status === 'quoted')?.id || '',
  );
  const [notice, setNotice] = useState('');
  const [error, setError] = useState('');

  const selected = quotes.find((quote) => quote.id === selectedId);
  const openQuotes = quotes.filter((quote) => quote.status === 'quoted');

  const handleBind = () => {
    setNotice('');
    setError('');

    if (!selected) {
      setError('Select a quote to bind.');
      return;
    }
    if (selected.status === 'bound') {
      setError('This quote is already bound.');
      return;
    }

    const bound = bindQuote(selected.id);
    if (bound) {
      setQuotes(listQuotes());
      setNotice(`Policy ${bound.policyNumber} issued for ${bound.applicantName}.`);
    }
  };

  return (
    <div className="panel">
      <div className="panel-head">
        <div>
          <p className="eyebrow">Policy admin system</p>
          <h2>Bind / issue policy</h2>
          <p className="muted">Review a quote and issue the bound policy.</p>
        </div>
      </div>

      <div className="field">
        <label htmlFor="quote">Select quote</label>
        <select
          id="quote"
          value={selectedId}
          onChange={(event) => setSelectedId(event.target.value)}
        >
          <option value="">— Choose a quote —</option>
          {openQuotes.map((quote) => (
            <option key={quote.id} value={quote.id}>
              {quote.id} · {quote.applicantName} · {quote.product}
            </option>
          ))}
        </select>
        {openQuotes.length === 0 && (
          <span className="muted">No open quotes. Create one first.</span>
        )}
      </div>

      {selected && (
        <div className="summary-card">
          <div className="summary-row">
            <span className="muted">Reference</span>
            <span className="mono">{selected.policyNumber || selected.id}</span>
          </div>
          <div className="summary-row">
            <span className="muted">Applicant</span>
            <span>{selected.applicantName}</span>
          </div>
          <div className="summary-row">
            <span className="muted">Product</span>
            <span>{selected.product}</span>
          </div>
          <div className="summary-row">
            <span className="muted">Coverage</span>
            <span>{currency(selected.coverageAmount)}</span>
          </div>
          <div className="summary-row">
            <span className="muted">Premium</span>
            <span className="premium-value">{currency(selected.premium)}</span>
          </div>
          <div className="summary-row">
            <span className="muted">Status</span>
            <span className={`badge badge-${selected.status}`}>{selected.status}</span>
          </div>
        </div>
      )}

      {notice && <div className="status success">{notice}</div>}
      {error && <div className="status error">{error}</div>}

      <button
        className="primary-button"
        type="button"
        onClick={handleBind}
        disabled={!selected || selected.status === 'bound'}
      >
        {selected?.status === 'bound' ? 'Already issued' : 'Bind & issue policy'}
      </button>
    </div>
  );
}
