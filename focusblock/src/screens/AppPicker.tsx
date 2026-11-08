import { Alert, FlatList, Modal, Pressable, SafeAreaView, Switch, Text, View, StyleSheet } from 'react-native';
import { Brick } from '../useBrick';
import { c, g } from '../theme';
import { getEssential } from '../essentials';

export function AppPicker({ b }: { b: Brick }) {
  const onToggle = (id: string) => {
    const ess = getEssential(id);
    if (ess?.level === 'never') return;
    if (ess && !b.blocked.includes(id)) {
      Alert.alert('Keep reachable?', 'This could lock you out of calls or payments. Block anyway?', [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Block anyway', style: 'destructive', onPress: () => b.toggleApp(id) },
      ]);
      return;
    }
    b.toggleApp(id);
  };

  return (
    <Modal visible={b.pickerOpen} animationType="slide" onRequestClose={() => b.setPickerOpen(false)}>
      <SafeAreaView style={g.root}>
        <Text style={g.title}>Apps to block</Text>
        <View style={s.setting}>
          <View style={s.settingText}>
            <Text style={s.name}>Also block web browsers while locked</Text>
            <Text style={s.note}>Stops Instagram.com and YouTube.com in Chrome. Also blocks Chrome for everything else.</Text>
          </View>
          <Switch value={b.settings.blockBrowsers} onValueChange={b.setBlockBrowsers} />
        </View>
        <FlatList
          data={b.apps}
          keyExtractor={(a) => a.id}
          renderItem={({ item }) => {
            const ess = getEssential(item.id);
            const never = ess?.level === 'never';
            return (
              <View style={[s.row, never && s.disabled]}>
                <View style={s.rowText}>
                  <Text style={s.name}>{item.name}</Text>
                  {never ? <Text style={s.tagDim}>Always allowed for safety</Text> : null}
                  {ess && !never ? <Text style={s.tag}>Keep reachable</Text> : null}
                </View>
                <Switch
                  disabled={never}
                  value={!never && b.blocked.includes(item.id)}
                  onValueChange={() => onToggle(item.id)}
                />
              </View>
            );
          }}
        />
        <Pressable style={g.button} onPress={() => b.setPickerOpen(false)}>
          <Text style={g.bigText}>Done</Text>
        </Pressable>
      </SafeAreaView>
    </Modal>
  );
}

const s = StyleSheet.create({
  setting: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: c.card, borderRadius: 14,
    padding: 14, marginBottom: 12, gap: 12,
  },
  settingText: { flex: 1 },
  note: { color: c.dim, fontSize: 13, marginTop: 4 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 10 },
  rowText: { flex: 1, paddingRight: 12 },
  disabled: { opacity: 0.6 },
  name: { color: c.text, fontSize: 16 },
  tag: { color: c.link, fontSize: 12, marginTop: 2 },
  tagDim: { color: c.dim, fontSize: 12, marginTop: 2 },
});
