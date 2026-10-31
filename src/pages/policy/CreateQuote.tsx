import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { calculatePremium, createQuote } from '../../lib/policyStore';

const PRODUCTS = ['Commercial Property', 'General Liability', 'Professional Indemnity', 'Cyber'];

const currency = (value: number) =>
  value.toLocaleString(undefined, { style: 'currency', currency: 'USD' });

interface CreateQuoteProps {
  underwriter?: string;
}

export function CreateQuote({ underwriter }: CreateQuoteProps) {
  const navigate = useNavigate();
  const [applicantName, setApplicantName] = useState('');
  const [product, setProduct] = useState(PRODUCTS[0]);
  const [coverageAmount, setCoverageAmount] = useState('100000');
  const [error, setError] = useState('');

  const coverageNumber = Number(coverageAmount) || 0;
  const premiumPreview = useMemo(
    () => (coverageNumber > 0 ? calculatePremium(coverageNumber) : 0),
    [coverageNumber],
  );

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    setError('');

    if (!applicantName.trim()) {
      setError('Applicant name is required.');
      return;
    }
    if (coverageNumber <= 0) {
      setError('Coverage amount must be greater than zero.');
      return;
    }

    const quote = createQuote({
      applicantName: applicantName.trim(),
      product,
      coverageAmount: coverageNumber,
      createdBy: underwriter,
    });

    navigate('/policy/bind', { state: { quoteId: quote.id } });
  };

  return (
    <div className="panel">
      <div className="panel-head">
        <div>
          <p className="eyebrow">Policy admin system</p>
          <h2>Create quote</h2>
          <p className="muted">Enter the risk details to generate an indicative premium.</p>
        </div>
      </div>

      <form className="stacked-form" onSubmit={handleSubmit}>
        <div className="field">
          <label htmlFor="applicant">Applicant name</label>
          <input
            id="applicant"
            type="text"
            placeholder="Acme Manufacturing Ltd"
            value={applicantName}
            onChange={(event) => setApplicantName(event.target.value)}
            required
          />
        </div>

        <div className="field">
          <label htmlFor="product">Product</label>
          <select id="product" value={product} onChange={(event) => setProduct(event.target.value)}>
            {PRODUCTS.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </div>

        <div className="field">
          <label htmlFor="coverage">Coverage amount (USD)</label>
          <input
            id="coverage"
            type="number"
            min={0}
            step={1000}
            value={coverageAmount}
            onChange={(event) => setCoverageAmount(event.target.value)}
            required
          />
        </div>

        <div className="premium-preview">
          <span className="muted">Indicative premium</span>
          <span className="premium-value">{currency(premiumPreview)}</span>
        </div>

        {error && <div className="status error">{error}</div>}

        <button className="primary-button" type="submit">
          Generate quote
        </button>
      </form>
    </div>
  );
}
