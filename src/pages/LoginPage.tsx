interface LoginPageProps {
  onLogin: () => void;
}

export function LoginPage({ onLogin }: LoginPageProps) {
  return (
    <div className="page-shell">
      <div className="card login-card">
        <p className="eyebrow">Secure access</p>
        <h1>Policy Portal SSO</h1>
        <p className="subtitle">
          Authenticate with Microsoft Entra ID to reach the underwriting and administration tools.
        </p>
        <button className="primary-button" type="button" onClick={onLogin}>
          Continue with Azure SSO
        </button>
      </div>
    </div>
  );
}
