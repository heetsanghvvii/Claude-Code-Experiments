import { useState, type FormEvent } from 'react';
import { Link, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../lib/auth';
import { friendlyError } from '../lib/errors';
import { ErrorBanner, Field, Logo } from '../components/ui';

export function AuthScreen({ mode }: { mode: 'in' | 'up' }) {
  const { user, signIn, signUp } = useAuth();
  const loc = useLocation();
  const from = (loc.state as { from?: string } | null)?.from ?? '/';
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  if (user) return <Navigate to={from} replace />;

  async function submit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    setNotice(null);
    try {
      if (mode === 'in') await signIn(email.trim(), password);
      else {
        const signedIn = await signUp(email.trim(), password, name);
        if (!signedIn) setNotice('Check your email to confirm your account, then sign in.');
      }
    } catch (err) {
      setError(friendlyError(err));
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="screen center">
      <Logo />
      <h1 className="hero">
        {mode === 'in' ? (
          <>
            Back in the <em>hunt.</em>
          </>
        ) : (
          <>
            Run. Hide. <em>Don't get tagged.</em>
          </>
        )}
      </h1>
      <p className="muted">Real-world hide and hunt. The phone is the referee.</p>
      <form className="stack" onSubmit={submit}>
        {mode === 'up' && (
          <Field label="Display name">
            <input
              className="input"
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={32}
              required
              autoComplete="nickname"
              placeholder="What your friends call you"
            />
          </Field>
        )}
        <Field label="Email">
          <input
            className="input"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
            inputMode="email"
          />
        </Field>
        <Field label="Password">
          <input
            className="input"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
            autoComplete={mode === 'in' ? 'current-password' : 'new-password'}
          />
        </Field>
        <ErrorBanner message={error} />
        {notice && <div className="banner ok">{notice}</div>}
        <button className="btn primary" disabled={busy || !email || !password || (mode === 'up' && !name.trim())}>
          {busy ? 'One sec...' : mode === 'in' ? 'Sign in' : 'Create account'}
        </button>
      </form>
      <Link className="btn link" to={mode === 'in' ? '/sign-up' : '/sign-in'} state={loc.state}>
        {mode === 'in' ? 'New here? Create an account' : 'Have an account? Sign in'}
      </Link>
      <Link className="btn link" to="/privacy">
        Privacy
      </Link>
    </main>
  );
}
