import { useCallback, useEffect, useState } from 'react';
import { Alert, AppState, Modal, Platform, Pressable, SafeAreaView, ScrollView, StyleSheet, Switch, Text, View } from 'react-native';
import AppBlocker, { BlockMode } from '../../modules/app-blocker';
import { Brick } from '../useBrick';
import { getNfcStatus, NfcStatus, openNfcSettings } from '../nfc';
import { batteryGuide, RESTRICTED_SETTINGS_STEPS } from '../deviceGuide';
import { openSupport } from '../support';
import { c, g } from '../theme';

// Status colours for checks only. Kept local so src/theme.ts stays owned by the brand work.
const GOOD = '#4CC38A';
const WARN = '#F2B33D';

type Props = { b: Brick; visible: boolean; onClose: () => void };

function ago(ms: number): string {
  if (!ms) return 'never';
  const m = Math.floor((Date.now() - ms) / 60000);
  if (m < 1) return 'just now';
  if (m < 60) return `${m} min ago`;
  const h = Math.floor(m / 60);
  return h < 48 ? `${h} h ago` : `${Math.floor(h / 24)} days ago`;
}

function Check({ ok, label, note, action, onPress }: { ok: boolean; label: string; note?: string; action?: string; onPress?: () => void }) {
  return (
    <View style={s.check}>
      <View style={[s.dot, { backgroundColor: ok ? GOOD : WARN }]} />
      <View style={s.checkText}>
        <Text style={s.checkLabel}>{label}</Text>
        {!!note && <Text style={s.checkNote}>{note}</Text>}
      </View>
      {!ok && action && onPress ? (
        <Pressable style={s.fix} onPress={onPress} accessibilityRole="button">
          <Text style={s.fixText}>{action}</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

function Steps({ steps }: { steps: string[] }) {
  return (
    <>
      {steps.map((t, i) => (
        <Text key={i} style={s.step}>{i + 1}. {t}</Text>
      ))}
    </>
  );
}

export function SetupDoctor({ b, visible, onClose }: Props) {
  const [nfc, setNfc] = useState<NfcStatus | null>(null);
  const d = b.diag;
  const android = Platform.OS === 'android';

  const refresh = useCallback(async () => {
    setNfc(await getNfcStatus());
    await b.refreshPerm();
  }, [b.refreshPerm]);

  useEffect(() => {
    if (!visible) return;
    refresh();
    const sub = AppState.addEventListener('change', (st) => { if (st === 'active') refresh(); });
    return () => sub.remove();
  }, [visible, refresh]);

  const chooseMode = (m: BlockMode) => {
    if (m === b.mode) return;
    if (b.on) return Alert.alert('Unlock first', 'Unlock with your puck before changing how Nope blocks.');
    b.setMode(m);
  };

  const toggleStrict = (v: boolean) => {
    if (!v) { AppBlocker.setStrictMode(false); b.refreshHealth(); return; }
    Alert.alert(
      'Turn on strict mode?',
      'While locked, Nope will also send you home from the Settings pages that could switch it off or uninstall it. Phone and emergency calls always work. Your backup code and emergency unlocks still work.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Turn on', onPress: () => { AppBlocker.setStrictMode(true); b.refreshHealth(); } },
      ],
    );
  };

  const guide = batteryGuide(d?.manufacturer ?? '', d?.brand ?? '');
  const usage = b.mode === 'usage';

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <SafeAreaView style={g.root}>
        <ScrollView contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>
          <Text style={g.title}>Setup doctor</Text>
          {d && android && (
            <Text style={s.device}>{d.brand} {d.model}, Android API {d.sdk}</Text>
          )}

          <View style={[s.summary, { borderColor: d?.blockingHealthy ? GOOD : WARN }]}>
            <Text style={s.summaryTitle}>{d?.blockingHealthy ? 'Blocking is ready' : 'Blocking needs attention'}</Text>
            <Text style={s.summaryBody}>
              {d?.blockingHealthy
                ? 'Everything Nope needs to block apps is switched on.'
                : 'Fix the amber items below. Until then, your apps may not be blocked.'}
            </Text>
          </View>

          <Text style={s.section}>Checks</Text>
          <View style={g.card}>
            <View style={s.cardPad}>
              <Check
                ok={nfc === 'ok'}
                label={nfc === 'ok' ? 'NFC is on' : nfc === 'off' ? 'NFC is off' : nfc === 'unsupported' ? 'This phone has no NFC' : 'Checking NFC'}
                note={nfc === 'unsupported'
                  ? 'Nope needs NFC to read your puck, so it cannot work on this phone. Sorry about that.'
                  : 'Nope needs NFC to read your puck.'}
                action={nfc === 'off' ? 'Turn on' : undefined}
                onPress={openNfcSettings}
              />
              {android && d && !usage && (
                <Check
                  ok={d.accessibilityEnabled}
                  label="Accessibility switch for Nope"
                  note={d.accessibilityEnabled ? undefined : 'Switch is grey? See Restricted settings below.'}
                  action="Open"
                  onPress={() => AppBlocker.requestAccessibility()}
                />
              )}
              {android && d && usage && (
                <>
                  <Check ok={d.usageAccessGranted} label="Usage access" action="Open" onPress={() => AppBlocker.requestUsageAccess()} />
                  <Check ok={d.overlayGranted} label="Display over other apps" note="Lets Nope show the blocked screen." action="Open" onPress={() => AppBlocker.requestOverlay()} />
                </>
              )}
              {android && d && (
                <Check
                  ok={d.serviceAlive || (usage && !b.on)}
                  label={usage && !b.on ? 'Blocking service starts when you lock' : d.serviceAlive ? 'Blocking service is running' : 'Blocking service is not running'}
                  note={`Last sign of life: ${ago(d.lastHeartbeat)}.${!d.serviceAlive && !usage && d.accessibilityEnabled ? ' Switch Nope off and on again in Accessibility.' : ''}`}
                  action={!usage ? 'Open' : undefined}
                  onPress={() => AppBlocker.requestAccessibility()}
                />
              )}
              {android && d && (
                <Check
                  ok={d.batteryOptimizationIgnored}
                  label="Battery saver leaves Nope alone"
                  note={d.batteryOptimizationIgnored ? undefined : 'Some phones stop Nope in the background. Also follow the steps below.'}
                  action="Allow"
                  onPress={() => AppBlocker.requestIgnoreBatteryOptimization()}
                />
              )}
            </View>
          </View>

          {android && (
            <>
              <Text style={s.section}>How Nope blocks</Text>
              <View style={g.card}>
                <Pressable style={[s.option, !usage && s.optionOn]} onPress={() => chooseMode('accessibility')}>
                  <Text style={s.optionTitle}>Accessibility (recommended)</Text>
                  <Text style={s.optionBody}>Fastest. Notices the moment a blocked app opens.</Text>
                </Pressable>
                <Pressable style={[s.option, usage && s.optionOn]} onPress={() => chooseMode('usage')}>
                  <Text style={s.optionTitle}>Usage access (fallback)</Text>
                  <Text style={s.optionBody}>Use this if the accessibility switch will not turn on. Checks about twice a second and shows a small notification while locked.</Text>
                </Pressable>
              </View>

              {d?.strictModeAvailable && !usage && (
                <>
                  <Text style={s.section}>Strict mode</Text>
                  <View style={[g.card, s.cardPad]}>
                    <View style={s.switchRow}>
                      <Text style={[s.checkLabel, { flex: 1 }]}>Block Settings pages that turn Nope off</Text>
                      <Switch value={!!d?.strictMode} onValueChange={toggleStrict} />
                    </View>
                    <Text style={s.checkNote}>
                      Off by default. While locked, Nope sends you home from the Accessibility page, the Nope App info page, the uninstall screen and the Usage access page. Phone and emergency calls always work. Only for phones that got Nope as an APK file, not from the Play Store.
                    </Text>
                  </View>
                </>
              )}

              {d && d.sdk >= 33 && (
                <>
                  <Text style={s.section}>Restricted settings (Android 13 and later)</Text>
                  <View style={[g.card, s.cardPad]}>
                    <Text style={s.checkNote}>If you installed Nope from an APK file, Android may grey out the switch. Steps (menu names may differ on your phone):</Text>
                    <Steps steps={RESTRICTED_SETTINGS_STEPS} />
                    <Pressable style={g.button} onPress={() => AppBlocker.openAppDetails()}>
                      <Text style={g.buttonText}>Open app info</Text>
                    </Pressable>
                  </View>
                </>
              )}

              <Text style={s.section}>Battery: {guide.name}</Text>
              <View style={[g.card, s.cardPad]}>
                <Text style={s.checkNote}>So your phone does not stop Nope in the background. Menu names are approximate and may differ on your phone.</Text>
                <Steps steps={guide.steps} />
              </View>
            </>
          )}

          <Pressable style={g.button} onPress={() => openSupport('Hi, I need help setting up my Nope.')}>
            <Text style={g.buttonText}>Message support</Text>
          </Pressable>
          <Pressable style={[g.button, { backgroundColor: c.link }]} onPress={onClose}>
            <Text style={[g.buttonText, { color: c.onAccent }]}>Done</Text>
          </Pressable>
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
}

const s = StyleSheet.create({
  content: { paddingBottom: 32 },
  device: { color: c.dim, marginTop: -12, marginBottom: 16 },
  summary: { backgroundColor: c.card, borderRadius: 16, padding: 16, borderWidth: 1, marginBottom: 8 },
  summaryTitle: { color: c.text, fontSize: 18, fontWeight: '700' },
  summaryBody: { color: c.dim, marginTop: 4, lineHeight: 20 },
  section: { color: c.dim, fontSize: 13, fontWeight: '700', textTransform: 'uppercase', marginTop: 16, marginBottom: 8 },
  cardPad: { padding: 16 },
  check: { flexDirection: 'row', alignItems: 'center', paddingVertical: 8, gap: 12 },
  dot: { width: 12, height: 12, borderRadius: 6 },
  checkText: { flex: 1 },
  checkLabel: { color: c.text, fontSize: 16 },
  checkNote: { color: c.dim, fontSize: 14, marginTop: 2, lineHeight: 20 },
  fix: { backgroundColor: c.btn, borderRadius: 10, paddingVertical: 8, paddingHorizontal: 12 },
  fixText: { color: c.link, fontWeight: '700' },
  option: { padding: 16, borderBottomWidth: StyleSheet.hairlineWidth, borderColor: c.line, borderLeftWidth: 4, borderLeftColor: 'transparent' },
  optionOn: { borderLeftColor: c.link },
  optionTitle: { color: c.text, fontSize: 16, fontWeight: '700' },
  optionBody: { color: c.dim, marginTop: 4, lineHeight: 20 },
  switchRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 8 },
  step: { color: c.text, fontSize: 15, lineHeight: 22, marginTop: 6 },
});
