import { useEffect, useState, type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';

export function Logo() {
  return (
    <div className="logo">
      <i />
      Manhunt
    </div>
  );
}

export function Spinner() {
  return (
    <div className="loading" role="status" aria-label="Loading">
      <div className="spinner" />
    </div>
  );
}

export function ErrorBanner({ message }: { message: string | null }) {
  if (!message) return null;
  return (
    <div className="banner error" role="alert">
      {message}
    </div>
  );
}

export function BackBar({ title, to }: { title: string; to?: string }) {
  const nav = useNavigate();
  return (
    <div className="row">
      <button className="btn ghost small" onClick={() => (to ? nav(to) : nav(-1))} aria-label="Back">
        Back
      </button>
      <h1 className="title" style={{ fontSize: 22 }}>
        {title}
      </h1>
    </div>
  );
}

export function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="field">
      <span>{label}</span>
      {children}
    </label>
  );
}

export function Slider(props: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  format: (v: number) => string;
  onChange: (v: number) => void;
  hint?: string;
}) {
  return (
    <div className="slider">
      <div className="top">
        <span className="eyebrow">{props.label}</span>
        <b>{props.format(props.value)}</b>
      </div>
      <input
        type="range"
        aria-label={props.label}
        min={props.min}
        max={props.max}
        step={props.step}
        value={props.value}
        onChange={(e) => props.onChange(Number(e.target.value))}
      />
      {props.hint && <span className="small muted">{props.hint}</span>}
    </div>
  );
}

/** Banner that shows while the device has no connection. */
export function OfflineBar() {
  const [online, setOnline] = useState(navigator.onLine);
  useEffect(() => {
    const up = () => setOnline(true);
    const down = () => setOnline(false);
    window.addEventListener('online', up);
    window.addEventListener('offline', down);
    return () => {
      window.removeEventListener('online', up);
      window.removeEventListener('offline', down);
    };
  }, []);
  if (online) return null;
  return <div className="offline-bar">Offline. Reconnecting when your signal returns.</div>;
}
