import { useCallback, useMemo, useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "expo-router";

import { colors, radius, spacing, typography } from "@/src/theme";
import { HistoryEntry, getHistory } from "@/src/storage";
import { WorkoutCalendar, toLocalDateKey } from "@/src/components/WorkoutCalendar";

export default function ProgressScreen() {
  const insets = useSafeAreaInsets();
  const [history, setHistory] = useState<HistoryEntry[]>([]);

  useFocusEffect(
    useCallback(() => {
      getHistory().then(setHistory);
    }, []),
  );

  const stats = useMemo(() => {
    const totalWorkouts = history.length;
    const totalVolume = history.reduce((s, h) => s + h.totalVolume, 0);
    const totalSets = history.reduce((s, h) => s + h.totalSets, 0);
    const totalMinutes = Math.round(
      history.reduce((s, h) => s + h.durationSec, 0) / 60,
    );

    // weekly chart - last 7 days volumes
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const days: { label: string; value: number; date: string }[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      const label = d.toLocaleDateString("it-IT", { weekday: "short" });
      const dayKey = d.toISOString().slice(0, 10);
      const value = history
        .filter((h) => h.finishedAt.slice(0, 10) === dayKey)
        .reduce((s, h) => s + h.totalVolume, 0);
      days.push({ label, value, date: dayKey });
    }
    const maxVal = Math.max(1, ...days.map((d) => d.value));

    // top exercises by volume (last 30 days)
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - 30);
    const exVol: Record<string, { name: string; volume: number; sets: number }> = {};
    for (const h of history) {
      if (new Date(h.finishedAt) < cutoff) continue;
      for (const ex of h.exercises) {
        const v = ex.sets
          .filter((s) => s.done)
          .reduce((s, x) => s + x.reps * x.weight, 0);
        if (!exVol[ex.exerciseId]) {
          exVol[ex.exerciseId] = { name: ex.exerciseName, volume: 0, sets: 0 };
        }
        exVol[ex.exerciseId].volume += v;
        exVol[ex.exerciseId].sets += ex.sets.filter((s) => s.done).length;
      }
    }
    const topExercises = Object.values(exVol)
      .sort((a, b) => b.volume - a.volume)
      .slice(0, 5);

    // estimated 1RM via Epley for top exercises
    const oneRM: Record<string, { name: string; estimated: number; latest: string }> = {};
    for (const h of history) {
      for (const ex of h.exercises) {
        for (const s of ex.sets) {
          if (!s.done || s.reps === 0) continue;
          const est = s.weight * (1 + s.reps / 30);
          if (!oneRM[ex.exerciseId] || oneRM[ex.exerciseId].estimated < est) {
            oneRM[ex.exerciseId] = {
              name: ex.exerciseName,
              estimated: est,
              latest: h.finishedAt,
            };
          }
        }
      }
    }
    const top1RM = Object.values(oneRM)
      .sort((a, b) => b.estimated - a.estimated)
      .slice(0, 5);

    // streak: consecutive days with at least one finished workout
    const workoutDays = new Set(history.map((h) => h.finishedAt.slice(0, 10)));
    let currentStreak = 0;
    const cursor = new Date(today);
    // if no workout today yet, start counting from yesterday so the streak
    // doesn't reset to 0 before the day is even over
    if (!workoutDays.has(cursor.toISOString().slice(0, 10))) {
      cursor.setDate(cursor.getDate() - 1);
    }
    while (workoutDays.has(cursor.toISOString().slice(0, 10))) {
      currentStreak += 1;
      cursor.setDate(cursor.getDate() - 1);
    }

    let bestStreak = 0;
    if (workoutDays.size > 0) {
      const sortedDays = Array.from(workoutDays).sort();
      let run = 1;
      bestStreak = 1;
      for (let i = 1; i < sortedDays.length; i++) {
        const prev = new Date(sortedDays[i - 1]);
        const cur = new Date(sortedDays[i]);
        const diffDays = Math.round((cur.getTime() - prev.getTime()) / 86400000);
        if (diffDays === 1) {
          run += 1;
        } else {
          run = 1;
        }
        bestStreak = Math.max(bestStreak, run);
      }
    }

    return {
      totalWorkouts,
      totalVolume,
      totalSets,
      totalMinutes,
      days,
      maxVal,
      topExercises,
      top1RM,
      currentStreak,
      bestStreak,
    };
  }, [history]);

	const workoutDates = useMemo(
	  () => new Set(history.map((h) => toLocalDateKey(h.finishedAt))),
	  [history],
	);

  return (
    <SafeAreaView style={styles.safe} edges={["top"]} testID="progress-screen">
      <ScrollView
        contentContainerStyle={{ padding: spacing.lg, paddingBottom: insets.bottom + spacing.xl }}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.title}>Progressi</Text>
        <Text style={styles.subtitle}>I tuoi numeri di palestra</Text>

        {history.length === 0 ? (
          <View style={styles.empty}>
            <Ionicons name="trending-up-outline" size={48} color={colors.brandPrimary} />
            <Text style={styles.emptyTitle}>Nessun dato ancora</Text>
            <Text style={styles.emptyText}>
              Completa il tuo primo allenamento per iniziare a tracciare i progressi.
            </Text>
          </View>
        ) : (
          <>
            <View style={styles.streakCard}>
              <View style={styles.streakIconWrap}>
                <Ionicons
                  name="flame"
                  size={28}
                  color={stats.currentStreak > 0 ? "#FF8A3D" : colors.onSurfaceTertiary}
                />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.streakValue}>
                  {stats.currentStreak} {stats.currentStreak === 1 ? "giorno" : "giorni"} di fila
                </Text>
                <Text style={styles.streakSubtitle}>
                  {stats.currentStreak > 0
                    ? "Continua così, non rompere la catena!"
                    : "Allenati oggi per iniziare una nuova streak"}
                </Text>
              </View>
              {stats.bestStreak > stats.currentStreak && (
                <View style={styles.streakBest}>
                  <Text style={styles.streakBestValue}>{stats.bestStreak}</Text>
                  <Text style={styles.streakBestLabel}>record</Text>
                </View>
              )}
            </View>

            <WorkoutCalendar workoutDates={workoutDates} />

            <View style={styles.statsGrid}>
              <StatCard label="Allenamenti" value={String(stats.totalWorkouts)} icon="flame" />
              <StatCard
                label="Volume Totale"
                value={`${Math.round(stats.totalVolume).toLocaleString("it-IT")} kg`}
                icon="barbell"
              />
              <StatCard label="Serie" value={String(stats.totalSets)} icon="layers" />
              <StatCard label="Minuti" value={String(stats.totalMinutes)} icon="time" />
            </View>

            <Text style={styles.section}>Volume Settimanale</Text>
            <View style={styles.chartCard}>
              <View style={styles.chartArea}>
                {stats.days.map((d) => (
                  <View key={d.date} style={styles.barColumn}>
                    <View style={styles.barTrack}>
                      <View
                        style={[
                          styles.barFill,
                          {
                            height: `${(d.value / stats.maxVal) * 100}%`,
                            backgroundColor:
                              d.value > 0 ? colors.brandPrimary : colors.surfaceTertiary,
                          },
                        ]}
                      />
                    </View>
                    <Text style={styles.barLabel}>{d.label.slice(0, 3)}</Text>
                  </View>
                ))}
              </View>
            </View>

            {stats.top1RM.length > 0 && (
              <>
                <Text style={styles.section}>1RM Stimato (Top 5)</Text>
                <View style={styles.listCard}>
                  {stats.top1RM.map((e, i) => (
                    <View
                      key={i}
                      style={[styles.listRow, i > 0 && styles.listRowBorder]}
                    >
                      <Text style={styles.listRowName} numberOfLines={1}>{e.name}</Text>
                      <Text style={styles.listRowValue}>
                        {Math.round(e.estimated)} kg
                      </Text>
                    </View>
                  ))}
                </View>
              </>
            )}

            {stats.topExercises.length > 0 && (
              <>
                <Text style={styles.section}>Top Esercizi (30gg)</Text>
                <View style={styles.listCard}>
                  {stats.topExercises.map((e, i) => (
                    <View
                      key={i}
                      style={[styles.listRow, i > 0 && styles.listRowBorder]}
                    >
                      <Text style={styles.listRowName} numberOfLines={1}>{e.name}</Text>
                      <Text style={styles.listRowValue}>
                        {Math.round(e.volume).toLocaleString("it-IT")} kg · {e.sets} serie
                      </Text>
                    </View>
                  ))}
                </View>
              </>
            )}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function StatCard({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon: keyof typeof Ionicons.glyphMap;
}) {
  return (
    <View style={styles.statCard} testID={`stat-${label}`}>
      <Ionicons name={icon} size={18} color={colors.brandPrimary} />
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.surface },
  title: {
    color: colors.onSurface,
    fontSize: typography.sizes.xxxl,
    fontWeight: "800",
    letterSpacing: -0.5,
  },
  subtitle: {
    color: colors.onSurfaceSecondary,
    fontSize: typography.sizes.base,
    marginTop: spacing.xs,
    marginBottom: spacing.xl,
  },
  empty: { alignItems: "center", paddingVertical: spacing.xxxl, gap: spacing.md },
  emptyTitle: {
    color: colors.onSurface,
    fontSize: typography.sizes.xl,
    fontWeight: "700",
  },
  emptyText: {
    color: colors.onSurfaceSecondary,
    textAlign: "center",
    fontSize: typography.sizes.base,
    paddingHorizontal: spacing.xl,
  },
  statsGrid: { flexDirection: "row", flexWrap: "wrap", gap: spacing.sm },
  streakCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.surfaceSecondary,
    borderRadius: radius.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  streakIconWrap: {
    width: 48,
    height: 48,
    borderRadius: radius.md,
    backgroundColor: colors.surfaceTertiary,
    alignItems: "center",
    justifyContent: "center",
  },
  streakValue: {
    color: colors.onSurface,
    fontSize: typography.sizes.lg,
    fontWeight: "800",
    letterSpacing: -0.3,
  },
  streakSubtitle: {
    color: colors.onSurfaceSecondary,
    fontSize: typography.sizes.sm,
    marginTop: 2,
  },
  streakBest: { alignItems: "center", paddingLeft: spacing.sm },
  streakBestValue: {
    color: colors.brandPrimary,
    fontSize: typography.sizes.lg,
    fontWeight: "800",
  },
  streakBestLabel: {
    color: colors.onSurfaceTertiary,
    fontSize: typography.sizes.xs,
    textTransform: "uppercase",
    fontWeight: "600",
  },
  statCard: {
    flexBasis: "48%",
    flexGrow: 1,
    backgroundColor: colors.surfaceSecondary,
    borderRadius: radius.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 4,
  },
  statValue: {
    color: colors.onSurface,
    fontSize: typography.sizes.xxl,
    fontWeight: "800",
    letterSpacing: -0.5,
  },
  statLabel: { color: colors.onSurfaceSecondary, fontSize: typography.sizes.sm },
  section: {
    color: colors.onSurface,
    fontSize: typography.sizes.lg,
    fontWeight: "700",
    marginTop: spacing.xl,
    marginBottom: spacing.md,
  },
  chartCard: {
    backgroundColor: colors.surfaceSecondary,
    borderRadius: radius.md,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  chartArea: { flexDirection: "row", height: 140, alignItems: "flex-end", gap: spacing.sm },
  barColumn: { flex: 1, alignItems: "center", gap: spacing.xs },
  barTrack: {
    width: "100%",
    height: 110,
    backgroundColor: colors.surfaceTertiary,
    borderRadius: radius.sm,
    overflow: "hidden",
    justifyContent: "flex-end",
  },
  barFill: { width: "100%", borderRadius: radius.sm },
  barLabel: {
    color: colors.onSurfaceSecondary,
    fontSize: typography.sizes.xs,
    fontWeight: "600",
    textTransform: "uppercase",
  },
  listCard: {
    backgroundColor: colors.surfaceSecondary,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: "hidden",
  },
  listRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    gap: spacing.md,
  },
  listRowBorder: { borderTopWidth: 0.5, borderTopColor: colors.border },
  listRowName: { flex: 1, color: colors.onSurface, fontWeight: "600" },
  listRowValue: { color: colors.brandPrimary, fontWeight: "700", fontSize: typography.sizes.sm },
});
