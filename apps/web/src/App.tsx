import { lazy, Suspense, type ComponentType, type ReactNode } from 'react';
import { Navigate, Route, Routes, useLocation, useParams } from 'react-router-dom';
import { useAuth } from './lib/auth';
import { hasConsented } from './lib/consent';
import { supabaseConfigured } from './lib/supabase';
import { OfflineBar, Spinner } from './components/ui';
import { AuthScreen } from './screens/AuthScreen';
import { HomeScreen } from './screens/HomeScreen';
import { CreateScreen } from './screens/CreateScreen';
import { JoinScreen } from './screens/JoinScreen';
import { LobbyScreen } from './screens/LobbyScreen';
import { ResultsScreen } from './screens/ResultsScreen';
import { ConsentScreen } from './screens/ConsentScreen';
import { PrivacyScreen } from './screens/PrivacyScreen';
import { SetupNotice } from './screens/SetupNotice';

// PlayScreen is owned by another module. Resolve it lazily so the app builds and runs before it lands.
const playModules = import.meta.glob<{ PlayScreen: ComponentType<{ gameId: string }> }>(
  './features/play/PlayScreen.tsx',
);
const loadPlay = Object.values(playModules)[0];
const PlayScreen = lazy(async () =>
  loadPlay
    ? { default: (await loadPlay()).PlayScreen }
    : {
        default: ({ gameId }: { gameId: string }) => (
          <main className="screen center">
            <h1 className="title">Play screen not installed</h1>
            <p className="muted">Game {gameId} is live, but features/play/PlayScreen has not been added yet.</p>
          </main>
        ),
      },
);

function RequireAuth({ children }: { children: ReactNode }) {
  const { user, ready } = useAuth();
  const loc = useLocation();
  if (!ready) return <Spinner />;
  if (!user) return <Navigate to="/sign-in" replace state={{ from: loc.pathname + loc.search }} />;
  return <>{children}</>;
}

/** Safety consent must be given on this device before creating or joining a game. */
function RequireConsent({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const loc = useLocation();
  if (!user || !hasConsented(user.id)) {
    return <Navigate to={`/consent?next=${encodeURIComponent(loc.pathname)}`} replace />;
  }
  return <>{children}</>;
}

function PlayRoute() {
  const { id } = useParams();
  if (!id) return <Navigate to="/" replace />;
  return (
    <Suspense fallback={<Spinner />}>
      <PlayScreen gameId={id} />
    </Suspense>
  );
}

export function App() {
  if (!supabaseConfigured) return <SetupNotice />;
  const guard = (el: ReactNode) => <RequireAuth>{el}</RequireAuth>;
  const gated = (el: ReactNode) => guard(<RequireConsent>{el}</RequireConsent>);
  return (
    <>
      <OfflineBar />
      <Routes>
        <Route path="/sign-in" element={<AuthScreen mode="in" />} />
        <Route path="/sign-up" element={<AuthScreen mode="up" />} />
        <Route path="/privacy" element={<PrivacyScreen />} />
        <Route path="/safety" element={<ConsentScreen readOnly />} />
        <Route path="/" element={guard(<HomeScreen />)} />
        <Route path="/consent" element={guard(<ConsentScreen />)} />
        <Route path="/create" element={gated(<CreateScreen />)} />
        <Route path="/join" element={gated(<JoinScreen />)} />
        <Route path="/join/:code" element={gated(<JoinScreen />)} />
        <Route path="/game/:id" element={guard(<LobbyScreen />)} />
        <Route path="/game/:id/play" element={guard(<PlayRoute />)} />
        <Route path="/game/:id/results" element={guard(<ResultsScreen />)} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}
