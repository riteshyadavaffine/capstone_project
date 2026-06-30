import { useState } from 'react';
import { ErrorBanner } from '../components/ErrorBanner';
import { LoadingState } from '../components/LoadingState';
import { useAuth } from '../hooks/useAuth';
import { login } from '../services/api';

export function LoginPage() {
  const { setAuth, isBootstrapping } = useAuth();
  const [email, setEmail] = useState('customer@supportpilot.dev');
  const [password, setPassword] = useState('Password123!');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (isBootstrapping) {
    return <LoadingState label="Restoring your session…" />;
  }

  return (
    <div className="auth-layout">
      <section className="auth-card">
        <div className="eyebrow">Capstone Demo</div>
        <h1>SupportPilot</h1>
        <p className="auth-copy">
          An AI customer support assistant with conversation history, escalation logic, and admin prompt controls.
        </p>
        <ErrorBanner message={error} />
        <form
          className="auth-form"
          onSubmit={async (event) => {
            event.preventDefault();
            setError(null);
            setLoading(true);
            try {
              const result = await login(email, password);
              setAuth(result);
            } catch (caught) {
              setError(caught instanceof Error ? caught.message : 'Unable to sign you in right now.');
            } finally {
              setLoading(false);
            }
          }}
        >
          <label>
            Email
            <input value={email} onChange={(event) => setEmail(event.target.value)} type="email" />
          </label>
          <label>
            Password
            <input value={password} onChange={(event) => setPassword(event.target.value)} type="password" />
          </label>
          <button className="primary-button" type="submit" disabled={loading}>
            {loading ? 'Signing in…' : 'Sign in'}
          </button>
        </form>
        <div className="demo-credentials">
          <strong>Demo accounts</strong>
          <span>Customer: customer@supportpilot.dev / Password123!</span>
          <span>Admin: admin@supportpilot.dev / AdminPass123!</span>
        </div>
      </section>
    </div>
  );
}

