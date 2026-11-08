import { FlatList, Modal, Pressable, SafeAreaView, Switch, Text, View, StyleSheet } from 'react-native';
import { Brick } from '../useBrick';
import { c, g } from '../theme';

export function AppPicker({ b }: { b: Brick }) {
  return (
    <Modal visible={b.pickerOpen} animationType="slide" onRequestClose={() => b.setPickerOpen(false)}>
      <SafeAreaView style={g.root}>
        <Text style={g.title}>Apps to block</Text>
        <FlatList
          data={b.apps}
          keyExtractor={(a) => a.id}
          renderItem={({ item }) => (
            <View style={s.row}>
              <Text style={s.name}>{item.name}</Text>
              <Switch value={b.blocked.includes(item.id)} onValueChange={() => b.toggleApp(item.id)} />
            </View>
          )}
        />
        <Pressable style={g.button} onPress={() => b.setPickerOpen(false)}>
          <Text style={g.bigText}>Done</Text>
        </Pressable>
      </SafeAreaView>
    </Modal>
  );
}

const s = StyleSheet.create({
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 10 },
  name: { color: c.text, fontSize: 16 },
});
