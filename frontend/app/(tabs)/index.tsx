import { useCallback, useMemo, useState } from "react";
import {
  FlatList,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useFocusEffect, useRouter } from "expo-router";
import * as Haptics from "expo-haptics";

import { colors, radius, spacing, typography } from "@/src/theme";
import { getWorkouts, getHistory, reorderWorkouts, Workout, HistoryEntry } from "@/src/storage";

const MUSCLE_COLORS: Record<string, string> = {
  Petto: "#E07B6A",
  Dorso: "#6A9FE0",
  Gambe: "#6AE09F",
  Glutei: "#B06AE0",
  Spalle: "#E0C56A",
  Bicipiti: "#E08F6A",
  Tricipiti: "#6AB5E0",
  Addome: "#E0E06A",
  Polpacci: "#6AE0C5",
  Cardio: "#E06A6A",
};

function greeting(): string {
  const h = new Date().getHours();
  if (h < 12) return "Buongiorno";
  if (h < 18) return "Buon pomeriggio";
  return "Buonasera";
}

function daysSince(isoDate: string): string {
  const diff = Math.floor(
    (Date.now() - new Date(isoDate).getTime()) / 86400000,
  );
  if (diff === 0) return "oggi";
  if (diff === 1) return "ieri";
  return `${diff} giorni fa`;
}

function fmtDur(sec: number): string {
  const m = Math.floor(sec / 60);
  return `${m} min`;
}

export default function SchedeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    const [w, h] = await Promise.all([getWorkouts(), getHistory()]);
    setWorkouts(w);
    setHistory(h);
    setLoading(false);
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
      return () => setEditMode(false);
    }, [load]),
  );

  const lastWorkout = useMemo(
    () => (history.length > 0 ? history[history.length - 1] : null),
    [history],
  );

  const streak = useMemo(() => {
    const days = new Set(history.map((h) => h.finishedAt.slice(0, 10)));
    let count = 0;
    const cursor = new Date();
    cursor.setHours(0, 0, 0, 0);
    if (!days.has(cursor.toISOString().slice(0, 10))) {
      cursor.setDate(cursor.getDate() - 1);
    }
    while (days.has(cursor.toISOString().slice(0, 10))) {
      count++;
      cursor.setDate(cursor.getDate() - 1);
    }
    return count;
  }, [history]);

  const onCreate = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push("/workout/new");
  };

  const onReorder = (index: number, direction: -1 | 1) => {
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= workouts.length) return;
    Haptics.selectionAsync();
    const next = [...workouts];
    const [moved] = next.splice(index, 1);
    next.splice(targetIndex, 0, moved);
    setWorkouts(next);
    reorderWorkouts(index, targetIndex);
  };

  return (
    <SafeAreaView style={styles.safe} edges={["top"]} testID="schede-screen">
      {/* Header */}
      <View style={styles.header}>
        <View style={{ flex: 1 }}>
          <Text style={styles.greeting}>{greeting()}</Text>
          <Text style={styles.title}>Le Mie Schede</Text>
        </View>
        <Pressable
          onPress={() => router.push("/picker/calculator")}
          hitSlop={8}
          style={styles.headerBtn}
          testID="open-calculator-btn"
        >
          <Ionicons name="calculator-outline" size={22} color={colors.onSurface} />
        </Pressable>
        <Pressable
          onPress={() => router.push("/picker/presets")}
          hitSlop={8}
          style={styles.headerBtn}
          testID="open-presets-btn"
        >
          <Ionicons name="library-outline" size={22} color={colors.onSurface} />
        </Pressable>
        {workouts.length > 1 && (
          <Pressable
            onPress={() => {
              Haptics.selectionAsync();
              setEditMode((v) => !v);
            }}
            hitSlop={8}
            style={[styles.headerBtn, editMode && styles.headerBtnActive]}
            testID="toggle-edit-mode-btn"
          >
            <Ionicons
              name={editMode ? "checkmark" : "swap-vertical-outline"}
              size={22}
              color={editMode ? colors.onBrandPrimary : colors.onSurface}
            />
          </Pressable>
        )}
      </View>

      {loading ? null : (
        <FlatList
          data={workouts}
          keyExtractor={(it) => it.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            paddingHorizontal: spacing.lg,
            paddingBottom: 120 + insets.bottom,
          }}
          ListHeaderComponent={
            <>
              {/* Context banner */}
              {history.length > 0 && (
                <LinearGradient
                  colors={[colors.brandTertiary, colors.surfaceSecondary]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.contextBanner}
                >
                  <View style={styles.contextLeft}>
                    <View style={styles.contextIconWrap}>
                      <Ionicons name="flash" size={18} color={colors.brandPrimary} />
                    </View>
                    <View>
                      <Text style={styles.contextLabel}>Ultimo allenamento</Text>
                      <Text style={styles.contextWorkout} numberOfLines={1}>
                        {lastWorkout!.workoutName}
                      </Text>
                      <Text style={styles.contextMeta}>
                        {daysSince(lastWorkout!.finishedAt)} ·{" "}
                        {Math.round(lastWorkout!.totalVolume).toLocaleString("it-IT")} kg ·{" "}
                        {fmtDur(lastWorkout!.durationSec)}
                      </Text>
                    </View>
                  </View>
                  {streak > 0 && (
                    <View style={styles.streakPill}>
                      <Text style={styles.streakFlame}>🔥</Text>
                      <Text style={styles.streakCount}>{streak}</Text>
                    </View>
                  )}
                </LinearGradient>
              )}

              {/* Section label */}
              {workouts.length > 0 && (
                <View style={styles.sectionHeader}>
                  <Text style={styles.sectionLabel}>SCHEDE ATTIVE</Text>
                  <Text style={styles.sectionCount}>{workouts.length}</Text>
                </View>
              )}
            </>
          }
          ItemSeparatorComponent={() => <View style={{ height: spacing.md }} />}
          renderItem={({ item, index }) => (
            <WorkoutCard
              w={item}
              editMode={editMode}
              canUp={index > 0}
              canDown={index < workouts.length - 1}
              onMoveUp={() => onReorder(index, -1)}
              onMoveDown={() => onReorder(index, 1)}
            />
          )}
          ListEmptyComponent={
            !loading ? (
              <View style={styles.empty}>
                <View style={styles.emptyIconWrap}>
                  <Ionicons name="barbell-outline" size={56} color={colors.brandPrimary} />
                </View>
                <Text style={styles.emptyTitle}>Nessuna scheda</Text>
                <Text style={styles.emptyText}>
                  Crea la tua prima scheda e inizia a tracciare i tuoi allenamenti.
                </Text>
              </View>
            ) : null
          }
        />
      )}

      <View style={[styles.fabWrap, { bottom: 16 + insets.bottom }]}>
        <Pressable
          style={({ pressed }) => [styles.fab, pressed && { opacity: 0.85 }]}
          onPress={onCreate}
          testID="create-workout-fab"
        >
          <Ionicons name="add" size={24} color={colors.onBrandPrimary} />
          <Text style={styles.fabText}>Nuova Scheda</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

function WorkoutCard({
  w,
  editMode,
  canUp,
  canDown,
  onMoveUp,
  onMoveDown,
}: {
  w: Workout;
  editMode: boolean;
  canUp: boolean;
  canDown: boolean;
  onMoveUp: () => void;
  onMoveDown: () => void;
}) {
  const router = useRouter();
  const muscles = Array.from(new Set(w.exercises.map((e) => e.muscleGroup)));
  const totalSets = w.exercises.reduce((s, e) => s + e.targetSets, 0);
  const estMinutes = Math.max(
    5,
    Math.round(
      w.exercises.length * 2 +
        (totalSets * (w.exercises[0]?.restSeconds || 90)) / 60,
    ),
  );

  return (
    <View style={styles.cardRow}>
      {editMode && (
        <View style={styles.reorderCol}>
          <Pressable
            onPress={onMoveUp}
            disabled={!canUp}
            hitSlop={8}
            style={{ opacity: canUp ? 1 : 0.25 }}
            testID={`move-up-${w.id}`}
          >
            <Ionicons name="chevron-up" size={20} color={colors.onSurfaceSecondary} />
          </Pressable>
          <Pressable
            onPress={onMoveDown}
            disabled={!canDown}
            hitSlop={8}
            style={{ opacity: canDown ? 1 : 0.25 }}
            testID={`move-down-${w.id}`}
          >
            <Ionicons name="chevron-down" size={20} color={colors.onSurfaceSecondary} />
          </Pressable>
        </View>
      )}
      <Pressable
        onPress={() => {
          if (editMode) return;
          Haptics.selectionAsync();
          router.push(`/workout/${w.id}` as any);
        }}
        style={({ pressed }) => [styles.card, { flex: 1 }, pressed && !editMode && { opacity: 0.9 }]}
        testID={`workout-card-${w.id}`}
      >
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle} numberOfLines={1}>{w.name}</Text>
          <View style={styles.cardCta}>
            <Ionicons name="play" size={12} color={colors.brandPrimary} />
            <Text style={styles.cardCtaText}>Allena</Text>
          </View>
        </View>

        {/* Muscle group chips */}
        <View style={styles.muscleChips}>
          {muscles.slice(0, 4).map((m) => (
            <View
              key={m}
              style={[
                styles.muscleChip,
                { borderColor: MUSCLE_COLORS[m] || colors.border },
              ]}
            >
              <View
                style={[
                  styles.muscleChipDot,
                  { backgroundColor: MUSCLE_COLORS[m] || colors.onSurfaceTertiary },
                ]}
              />
              <Text style={styles.muscleChipText}>{m}</Text>
            </View>
          ))}
          {muscles.length > 4 && (
            <View style={styles.muscleChip}>
              <Text style={styles.muscleChipText}>+{muscles.length - 4}</Text>
            </View>
          )}
        </View>

        <View style={styles.cardFooter}>
          <View style={styles.metric}>
            <Ionicons name="barbell-outline" size={13} color={colors.onSurfaceTertiary} />
            <Text style={styles.metricText}>{w.exercises.length} esercizi</Text>
          </View>
          <View style={styles.metricDot} />
          <View style={styles.metric}>
            <Ionicons name="layers-outline" size={13} color={colors.onSurfaceTertiary} />
            <Text style={styles.metricText}>{totalSets} serie</Text>
          </View>
          <View style={styles.metricDot} />
          <View style={styles.metric}>
            <Ionicons name="time-outline" size={13} color={colors.onSurfaceTertiary} />
            <Text style={styles.metricText}>~{estMinutes} min</Text>
          </View>
        </View>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.surface },
  header: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    paddingBottom: spacing.sm,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  greeting: {
    color: colors.onSurfaceTertiary,
    fontSize: typography.sizes.sm,
    fontWeight: "600",
    letterSpacing: 0.3,
  },
  title: {
    color: colors.onSurface,
    fontSize: typography.sizes.xxl,
    fontWeight: "800",
    letterSpacing: -0.5,
  },
  headerBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.surfaceSecondary,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
  },
  headerBtnActive: { backgroundColor: colors.brandPrimary, borderColor: colors.brandPrimary },
  contextBanner: {
    borderRadius: radius.lg,
    padding: spacing.md,
    marginBottom: spacing.lg,
    marginTop: spacing.sm,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 1,
    borderColor: colors.brandSecondary,
  },
  contextLeft: { flexDirection: "row", alignItems: "center", gap: spacing.sm, flex: 1 },
  contextIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.brandSecondary,
    alignItems: "center",
    justifyContent: "center",
  },
  contextLabel: {
    color: colors.onSurfaceTertiary,
    fontSize: 11,
    fontWeight: "600",
    letterSpacing: 0.4,
    textTransform: "uppercase",
  },
  contextWorkout: {
    color: colors.onSurface,
    fontSize: typography.sizes.base,
    fontWeight: "700",
    marginTop: 1,
  },
  contextMeta: {
    color: colors.onSurfaceSecondary,
    fontSize: typography.sizes.xs,
    marginTop: 2,
  },
  streakPill: {
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.brandSecondary,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    minWidth: 52,
  },
  streakFlame: { fontSize: 18 },
  streakCount: {
    color: colors.brandPrimary,
    fontSize: typography.sizes.lg,
    fontWeight: "800",
    marginTop: 2,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: spacing.sm,
  },
  sectionLabel: {
    color: colors.onSurfaceTertiary,
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.8,
  },
  sectionCount: {
    color: colors.onSurfaceTertiary,
    fontSize: typography.sizes.sm,
    fontWeight: "600",
  },
  empty: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: spacing.xl,
    marginTop: spacing.xxxl,
  },
  emptyIconWrap: {
    width: 96,
    height: 96,
    borderRadius: radius.pill,
    backgroundColor: colors.brandSecondary,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.lg,
  },
  emptyTitle: {
    color: colors.onSurface,
    fontSize: typography.sizes.xl,
    fontWeight: "700",
    marginBottom: spacing.sm,
  },
  emptyText: {
    color: colors.onSurfaceSecondary,
    fontSize: typography.sizes.base,
    textAlign: "center",
    lineHeight: 22,
  },
  cardRow: { flexDirection: "row", alignItems: "stretch", gap: spacing.sm },
  reorderCol: {
    justifyContent: "center",
    alignItems: "center",
    gap: spacing.sm,
    paddingHorizontal: 4,
  },
  card: {
    backgroundColor: colors.surfaceSecondary,
    borderRadius: radius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: spacing.sm,
  },
  cardTitle: {
    color: colors.onSurface,
    fontSize: typography.sizes.xl,
    fontWeight: "700",
    flex: 1,
    marginRight: spacing.sm,
  },
  cardCta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: colors.brandTertiary,
    paddingHorizontal: spacing.sm,
    paddingVertical: 6,
    borderRadius: radius.pill,
  },
  cardCtaText: { color: colors.brandPrimary, fontSize: 12, fontWeight: "700" },
  muscleChips: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.xs,
    marginBottom: spacing.md,
  },
  muscleChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surfaceTertiary,
  },
  muscleChipDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  muscleChipText: {
    color: colors.onSurfaceSecondary,
    fontSize: 11,
    fontWeight: "600",
  },
  cardFooter: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  metric: { flexDirection: "row", alignItems: "center", gap: 4 },
  metricDot: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: colors.border,
  },
  metricText: { color: colors.onSurfaceTertiary, fontSize: 12 },
  fabWrap: { position: "absolute", left: 16, right: 16 },
  fab: {
    backgroundColor: colors.brandPrimary,
    borderRadius: radius.pill,
    paddingVertical: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
  },
  fabText: {
    color: colors.onBrandPrimary,
    fontWeight: "700",
    fontSize: typography.sizes.base,
    letterSpacing: 0.3,
  },
});
