import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { Button, ErrorText, Muted, Screen } from '../../../components/ui';
import { assignTeams, cancelGame, leaveGame, setPlayerRole, startGame } from '../../../lib/api';
import { useAuth } from '../../../lib/auth';
import { friendlyError } from '../../../lib/errors';
import { colors, space } from '../../../lib/theme';
import type { LobbyPlayer, Role } from '../../../lib/types';
import { useGame } from '../../../lib/useGame';

export default function Lobby() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { session } = useAuth();
  const me = session?.user.id;
  const { game, players, error, refresh, setError } = useGame(id);
  const [busy, setBusy] = useState<string | null>(null);

  const isHost = !!game && game.host_id === me;
  const hunters = players.filter((p) => p.role === 'HUNTER').length;
  const runners = players.filter((p) => p.role === 'RUNNER').length;
  const canStart = isHost && players.length >= 2 && hunters > 0 && runners > 0 && hunters + runners === players.length;

  // Once the server starts the game, everyone moves to the map.
  useEffect(() => {
    if (game && game.status !== 'LOBBY' && game.status !== 'CANCELLED') {
      router.replace({ pathname: '/map/[id]', params: { id: game.id } });
    }
  }, [game]);

  async function act(name: string, fn: () => Promise<unknown>) {
    setBusy(name);
    setError(null);
    try {
      await fn();
      await refresh();
    } catch (e) {
      setError(friendlyError(e));
    } finally {
      setBusy(null);
    }
  }

  const toggleRole = (p: LobbyPlayer) => {
    if (!isHost || !id) return;
    const next: Role = p.role === 'HUNTER' ? 'RUNNER' : 'HUNTER';
    void act(`role-${p.player_id}`, () => setPlayerRole(id, p.player_id, next));
  };

  if (!game) {
    return (
      <Screen>
        <Muted>Loading lobby…</Muted>
        <ErrorText>{error}</ErrorText>
      </Screen>
    );
  }

  if (game.status === 'CANCELLED') {
    return (
      <Screen>
        <Muted>This game was cancelled ({game.end_reason?.toLowerCase().replace(/_/g, ' ')}).</Muted>
        <Button label="Home" onPress={() => router.replace('/')} />
      </Screen>
    );
  }

  return (
    <Screen>
      <View style={styles.codeBox}>
        <Text style={styles.codeLabel}>GAME CODE</Text>
        <Text style={styles.code} accessibilityLabel={`Game code ${game.code.split('').join(' ')}`} selectable>
          {game.code}
        </Text>
        <Muted>
          {Math.round(game.arena_radius_m)} m arena · {Math.round(game.duration_s / 60)} min · {Math.round(game.head_start_s / 60)} min head start
        </Muted>
      </View>

      <Muted>
        {players.length} players · {hunters} hunters · {runners} runners{isHost ? ' · tap a player to switch team' : ''}
      </Muted>

      <FlatList
        data={players}
        keyExtractor={(p) => p.player_id}
        contentContainerStyle={{ gap: space(2) }}
        renderItem={({ item }) => (
          <Pressable
            onPress={() => toggleRole(item)}
            disabled={!isHost || busy !== null}
            accessibilityRole={isHost ? 'button' : undefined}
            accessibilityLabel={`${item.display_name}, ${item.role ?? 'no team'}`}
            style={styles.row}
          >
            <Text style={styles.name}>
              {item.display_name}
              {item.player_id === game.host_id ? ' (host)' : ''}
              {item.player_id === me ? ' (you)' : ''}
            </Text>
            <Text style={[styles.chip, item.role === 'HUNTER' && styles.hunter, item.role === 'RUNNER' && styles.runner]}>
              {item.role ?? 'NO TEAM'}
            </Text>
          </Pressable>
        )}
      />

      <ErrorText>{error}</ErrorText>
      {isHost && (
        <>
          <Button label="Shuffle teams" variant="secondary" busy={busy === 'assign'} disabled={busy !== null || players.length < 2}
            onPress={() => id && void act('assign', () => assignTeams(id))} />
          <Button label="Start game" busy={busy === 'start'} disabled={!canStart || busy !== null}
            onPress={() => id && void act('start', () => startGame(id))} />
          <Button label="Cancel game" variant="danger" busy={busy === 'cancel'} disabled={busy !== null}
            onPress={() => id && void act('cancel', () => cancelGame(id))} />
        </>
      )}
      {!isHost && (
        <>
          <Muted>Waiting for the host to start…</Muted>
          <Button label="Leave" variant="secondary" busy={busy === 'leave'} disabled={busy !== null}
            onPress={() => id && void act('leave', async () => { await leaveGame(id); router.replace('/'); })} />
        </>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  codeBox: { alignItems: 'center', gap: space(1), padding: space(4), backgroundColor: colors.surface, borderRadius: 12 },
  codeLabel: { color: colors.muted, fontSize: 12, fontWeight: '700', letterSpacing: 2 },
  code: { color: colors.text, fontSize: 40, fontWeight: '800', letterSpacing: 8, fontVariant: ['tabular-nums'] },
  row: {
    minHeight: 52, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: space(3), borderRadius: 10, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border,
  },
  name: { color: colors.text, fontSize: 16, flexShrink: 1 },
  chip: { color: colors.muted, fontSize: 12, fontWeight: '800', letterSpacing: 1, paddingHorizontal: space(2), paddingVertical: space(1), borderRadius: 6, overflow: 'hidden', backgroundColor: colors.border },
  hunter: { color: colors.bg, backgroundColor: colors.accent },
  runner: { color: colors.bg, backgroundColor: colors.runner },
});
