import { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { Image } from "expo-image";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import * as Haptics from "expo-haptics";

import { colors, radius, spacing, typography } from "@/src/theme";
import {
  ExerciseListItem,
  MuscleGroup,
  fetchExercises,
  fetchGroups,
} from "@/src/api";
import {
  ExerciseEntry,
  getPrefs,
  getWorkout,
  saveWorkout,
} from "@/src/storage";

export default function ExercisePicker() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { workoutId } = useLocalSearchParams<{ workoutId: string }>();
  const [groups, setGroups] = useState<MuscleGroup[]>([]);
  const [muscle, setMuscle] = useState("all");
  const [query, setQuery] = useState("");
  const [items, setItems] = useState<ExerciseListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Record<string, ExerciseListItem>>({});

  useEffect(() => {
    fetchGroups().then(setGroups).catch(() => setGroups([]));
  }, []);

  useEffect(() => {
    setLoading(true);
    fetchExercises({ muscle })
      .then(setItems)
      .finally(() => setLoading(false));
  }, [muscle]);

  const filtered = useMemo(() => {
    if (!query.trim()) return items;
    const q = query.toLowerCase();
    return items.filter(
      (e) =>
        e.name.toLowerCase().includes(q) ||
        e.equipment.toLowerCase().includes(q),
    );
  }, [items, query]);

  const toggle = (e: ExerciseListItem) => {
    Haptics.selectionAsync();
    setSelected((s) => {
      const ns = { ...s };
      if (ns[e.id]) delete ns[e.id];
      else ns[e.id] = e;
      return ns;
    });
  };

  const onConfirm = async () => {
    if (!workoutId) return;
    const list = Object.values(selected);
    if (list.length === 0) {
      router.back();
      return;
    }
    const w = await getWorkout(workoutId);
    if (!w) return;
    const prefs = await getPrefs();
    const additions: ExerciseEntry[] = list.map((e) => ({
      exerciseId: e.id,
      exerciseName: e.name,
      muscleGroup: e.muscle_group,
      image: e.image,
      targetSets: prefs.defaultSets,
      targetReps: prefs.defaultReps,
      targetWeight: 0,
      restSeconds: prefs.defaultRestSetSec,
    }));
    await saveWorkout({ ...w, exercises: [...w.exercises, ...additions] });
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    router.back();
  };

  const count = Object.keys(selected).length;

  return (
    <SafeAreaView style={styles.safe} edges={["top"]} testID="exercise-picker">
      <View style={styles.topBar}>
        <Pressable onPress={() => router.back()} hitSlop={12}>
          <Ionicons name="close" size={26} color={colors.onSurface} />
        </Pressable>
        <Text style={styles.topTitle}>Aggiungi Esercizi</Text>
        <View style={{ width: 26 }} />
      </View>

      <View style={styles.searchWrap}>
        <Ionicons name="search" size={18} color={colors.onSurfaceTertiary} />
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder="Cerca..."
          placeholderTextColor={colors.onSurfaceTertiary}
          style={styles.searchInput}
          autoCorrect={false}
          testID="picker-search-input"
        />
      </View>

      <View style={styles.chipsRow}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: spacing.lg, gap: spacing.sm }}
        >
          {groups.map((g) => {
            const active = muscle === g.id;
            return (
              <Pressable
                key={g.id}
                onPress={() => setMuscle(g.id)}
                style={[styles.chip, active && styles.chipActive]}
                testID={`muscle-chip-${g.id}`}
              >
                <Text style={[styles.chipText, active && styles.chipTextActive]}>
                  {g.name}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>
      </View>

      {loading ? (
        <View style={styles.loading}>
          <ActivityIndicator color={colors.brandPrimary} />
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(it) => it.id}
          contentContainerStyle={{
            paddingHorizontal: spacing.lg,
            paddingTop: spacing.md,
            paddingBottom: 110 + insets.bottom,
          }}
          ItemSeparatorComponent={() => <View style={{ height: spacing.sm }} />}
          renderItem={({ item }) => {
            const isSel = !!selected[item.id];
            return (
              <Pressable
                onPress={() => toggle(item)}
                style={[styles.row, isSel && styles.rowSelected]}
                testID={`pick-${item.id}`}
              >
                <View style={styles.thumb}>
                  {item.image ? (
                    <Image source={{ uri: item.image }} style={{ width: "100%", height: "100%" }} contentFit="cover" />
                  ) : (
                    <Ionicons name="barbell" size={20} color={colors.onSurfaceTertiary} />
                  )}
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.rowTitle} numberOfLines={1}>{item.name}</Text>
                  <Text style={styles.rowMeta}>{item.muscle_group} · {item.equipment}</Text>
                </View>
                <View style={[styles.check, isSel && styles.checkActive]}>
                  {isSel && <Ionicons name="checkmark" size={16} color={colors.onBrandPrimary} />}
                </View>
              </Pressable>
            );
          }}
        />
      )}

      <View style={[styles.bottomBar, { paddingBottom: 16 + insets.bottom }]}>
        <Pressable
          onPress={onConfirm}
          style={[styles.confirmBtn, count === 0 && { opacity: 0.5 }]}
          disabled={count === 0}
          testID="confirm-picker-btn"
        >
          <Text style={styles.confirmText}>
            {count === 0 ? "Seleziona esercizi" : `Aggiungi ${count} esercizi`}
          </Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.surface },
  topBar: { height: 52, flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: spacing.lg },
  topTitle: { color: colors.onSurface, fontSize: typography.sizes.lg, fontWeight: "700" },
  searchWrap: {
    marginHorizontal: spacing.lg,
    backgroundColor: colors.surfaceSecondary,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    height: 44,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  searchInput: { flex: 1, color: colors.onSurface, fontSize: typography.sizes.base },
  chipsRow: { height: 56, alignItems: "center" },
  chip: {
    height: 36,
    paddingHorizontal: spacing.md,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surfaceSecondary,
    justifyContent: "center",
    flexShrink: 0,
  },
  chipActive: { backgroundColor: colors.brandPrimary, borderColor: colors.brandPrimary },
  chipText: { color: colors.onSurfaceSecondary, fontWeight: "600", fontSize: 13 },
  chipTextActive: { color: colors.onBrandPrimary },
  loading: { flex: 1, alignItems: "center", justifyContent: "center" },
  row: {
    backgroundColor: colors.surfaceSecondary,
    borderRadius: radius.md,
    padding: spacing.sm,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  rowSelected: { borderColor: colors.brandPrimary, backgroundColor: colors.brandTertiary },
  thumb: {
    width: 48,
    height: 48,
    borderRadius: radius.sm,
    backgroundColor: colors.surfaceTertiary,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  rowTitle: { color: colors.onSurface, fontWeight: "600" },
  rowMeta: { color: colors.onSurfaceSecondary, fontSize: typography.sizes.sm, marginTop: 2 },
  check: {
    width: 26,
    height: 26,
    borderRadius: 13,
    borderWidth: 2,
    borderColor: colors.borderStrong,
    alignItems: "center",
    justifyContent: "center",
  },
  checkActive: { backgroundColor: colors.brandPrimary, borderColor: colors.brandPrimary },
  bottomBar: { position: "absolute", left: 0, right: 0, bottom: 0, paddingHorizontal: spacing.lg, paddingTop: spacing.md, backgroundColor: colors.surface, borderTopWidth: 0.5, borderTopColor: colors.border },
  confirmBtn: { backgroundColor: colors.brandPrimary, borderRadius: radius.pill, paddingVertical: 16, alignItems: "center", justifyContent: "center" },
  confirmText: { color: colors.onBrandPrimary, fontWeight: "800", fontSize: typography.sizes.base, letterSpacing: 0.3 },
});
