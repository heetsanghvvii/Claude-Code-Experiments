import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { ArenaMap } from '../../../components/ArenaMap';
import { Button, ErrorText } from '../../../components/ui';
import { useAuth } from '../../../lib/auth';
import { clientPhase, formatMs } from '../../../lib/phase';
import { colors, space } from '../../../lib/theme';
import { useGame } from '../../../lib/useGame';

const PHASE_LABEL = {
  LOBBY: 'Lobby',
  COUNTDOWN: 'Starting in',
  HEAD_START: 'Head start',
  HUNT: 'Hunt ends in',
  FINISHED: 'Game over',
} as const;

export default function GameMap() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { session } = useAuth();
  const { game, players, snapshots, error } = useGame(id, { withSnapshots: true, tickMs: 5_000 });
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);

  if (!game) {
    return (
      <View style={styles.root}>
        <ErrorText>{error}</ErrorText>
      </View>
    );
  }

  const me = players.find((p) => p.player_id === session?.user.id);
  const { phase, msLeft } = clientPhase(game, now);
  const finished = game.status === 'COMPLETED' || game.status === 'CANCELLED';
  const runnersLeft = players.filter((p) => p.role === 'RUNNER' && p.status === 'ACTIVE').length;
  // Show only the latest released snapshot per runner.
  const latest = [...new Map(snapshots.map((s) => [s.player_id, s])).values()];

  return (
    <View style={styles.root}>
      <ArenaMap center={{ lat: game.arena_lat, lng: game.arena_lng }} radiusM={game.arena_radius_m} snapshots={me?.role === 'HUNTER' ? latest : []} />
      <View style={styles.hud} accessibilityLiveRegion="polite">
        <Text style={[styles.role, { color: me?.role === 'HUNTER' ? colors.accent : colors.runner }]}>
          {me?.role ?? 'SPECTATOR'}
          {me?.status === 'ELIMINATED' ? ' · ELIMINATED' : ''}
        </Text>
        <Text style={styles.phase}>
          {PHASE_LABEL[phase]} {formatMs(msLeft)}
        </Text>
        <Text style={styles.meta}>{runnersLeft} runners left · code {game.code}</Text>
        {finished && (
          <Text style={styles.result}>
            {game.status === 'CANCELLED' ? 'Cancelled' : `${game.winner === 'HUNTERS' ? 'Hunters' : 'Runners'} win`}
          </Text>
        )}
        <ErrorText>{error}</ErrorText>
        {finished && <Button label="Home" onPress={() => router.replace('/')} />}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  hud: {
    position: 'absolute', left: space(4), right: space(4), bottom: space(8), gap: space(1),
    padding: space(4), borderRadius: 14, backgroundColor: 'rgba(11, 15, 20, 0.92)', borderWidth: 1, borderColor: colors.border,
  },
  role: { fontSize: 13, fontWeight: '800', letterSpacing: 2 },
  phase: { color: colors.text, fontSize: 26, fontWeight: '800', fontVariant: ['tabular-nums'] },
  meta: { color: colors.muted, fontSize: 14 },
  result: { color: colors.text, fontSize: 22, fontWeight: '800', marginTop: space(2) },
});
