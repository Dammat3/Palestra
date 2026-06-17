import { useCallback, useState } from "react";
import {
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "expo-router";

import { colors, radius, spacing, typography } from "@/src/theme";
import { HistoryEntry, deleteHistory, getHistory } from "@/src/storage";

function fmtDate(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString("it-IT", {
    weekday: "short",
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function fmtDur(sec: number) {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m}m ${String(s).padStart(2, "0")}s`;
}

export default function HistoryScreen() {
  const insets = useSafeAreaInsets();
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [expanded, setExpanded] = useState<string | null>(null);

  const load = useCallback(() => {
    getHistory().then(setHistory);
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  const onDelete = async (id: string) => {
    await deleteHistory(id);
    load();
  };

  return (
    <SafeAreaView style={styles.safe} edges={["top"]} testID="history-screen">
      <View style={styles.header}>
        <Text style={styles.title}>Storico</Text>
        <Text style={styles.subtitle}>{history.length} allenamenti completati</Text>
      </View>

      {history.length === 0 ? (
        <View style={styles.empty}>
          <Ionicons name="time-outline" size={48} color={colors.brandPrimary} />
          <Text style={styles.emptyTitle}>Nessun allenamento</Text>
          <Text style={styles.emptyText}>
            Completa una sessione e la vedrai qui.
          </Text>
        </View>
      ) : (
        <FlatList
          data={history}
          keyExtractor={(it) => it.id}
          contentContainerStyle={{
            paddingHorizontal: spacing.lg,
            paddingTop: spacing.md,
            paddingBottom: spacing.xxl + insets.bottom,
          }}
          ItemSeparatorComponent={() => <View style={{ height: spacing.sm }} />}
          renderItem={({ item }) => (
            <HistoryItem
              h={item}
              open={expanded === item.id}
              onToggle={() => setExpanded(expanded === item.id ? null : item.id)}
              onDelete={() => onDelete(item.id)}
            />
          )}
        />
      )}
    </SafeAreaView>
  );
}

function HistoryItem({
  h,
  open,
  onToggle,
  onDelete,
}: {
  h: HistoryEntry;
  open: boolean;
  onToggle: () => void;
  onDelete: () => void;
}) {
  return (
    <Pressable
      onPress={onToggle}
      style={styles.card}
      testID={`history-item-${h.id}`}
    >
      <View style={styles.cardHead}>
        <View style={{ flex: 1 }}>
          <Text style={styles.cardTitle} numberOfLines={1}>{h.workoutName}</Text>
          <Text style={styles.cardDate}>{fmtDate(h.finishedAt)}</Text>
        </View>
        <Ionicons
          name={open ? "chevron-up" : "chevron-down"}
          size={18}
          color={colors.onSurfaceTertiary}
        />
      </View>

      <View style={styles.metricsRow}>
        <Metric label="Volume" value={`${Math.round(h.totalVolume).toLocaleString("it-IT")} kg`} />
        <Metric label="Serie" value={String(h.totalSets)} />
        <Metric label="Durata" value={fmtDur(h.durationSec)} />
      </View>

      {open && (
        <View style={styles.details}>
          {h.exercises.map((ex, idx) => {
            const completedSets = ex.sets.filter((s) => s.done);
            const vol = completedSets.reduce((s, x) => s + x.reps * x.weight, 0);
            return (
              <View key={idx} style={styles.exDetail}>
                <Text style={styles.exName}>{ex.exerciseName}</Text>
                <Text style={styles.exMeta}>
                  {completedSets.length} serie · {Math.round(vol)} kg
                </Text>
                <View style={styles.setsTags}>
                  {completedSets.map((s, i) => (
                    <View key={i} style={styles.setTag}>
                      <Text style={styles.setTagText}>
                        {s.reps}x{s.weight}kg
                      </Text>
                    </View>
                  ))}
                </View>
              </View>
            );
          })}
          <Pressable
            onPress={onDelete}
            style={styles.deleteBtn}
            testID={`delete-history-${h.id}`}
          >
            <Ionicons name="trash-outline" size={16} color={colors.error} />
            <Text style={styles.deleteText}>Elimina</Text>
          </Pressable>
        </View>
      )}
    </Pressable>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.metricBox}>
      <Text style={styles.metricValue}>{value}</Text>
      <Text style={styles.metricLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.surface },
  header: { paddingHorizontal: spacing.lg, paddingTop: spacing.md, paddingBottom: spacing.md },
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
  },
  empty: { flex: 1, alignItems: "center", justifyContent: "center", gap: spacing.md, padding: spacing.xl },
  emptyTitle: { color: colors.onSurface, fontSize: typography.sizes.xl, fontWeight: "700" },
  emptyText: { color: colors.onSurfaceSecondary, textAlign: "center" },
  card: {
    backgroundColor: colors.surfaceSecondary,
    borderRadius: radius.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cardHead: { flexDirection: "row", alignItems: "center", marginBottom: spacing.md },
  cardTitle: { color: colors.onSurface, fontSize: typography.sizes.lg, fontWeight: "700" },
  cardDate: { color: colors.onSurfaceSecondary, fontSize: typography.sizes.sm, marginTop: 2 },
  metricsRow: { flexDirection: "row", gap: spacing.sm },
  metricBox: { flex: 1, backgroundColor: colors.surface, borderRadius: radius.sm, padding: spacing.sm },
  metricValue: { color: colors.onSurface, fontWeight: "700", fontSize: typography.sizes.base },
  metricLabel: { color: colors.onSurfaceSecondary, fontSize: typography.sizes.xs, marginTop: 2 },
  details: { marginTop: spacing.md, gap: spacing.md, paddingTop: spacing.md, borderTopWidth: 0.5, borderTopColor: colors.border },
  exDetail: { gap: spacing.xs },
  exName: { color: colors.onSurface, fontWeight: "600", fontSize: typography.sizes.base },
  exMeta: { color: colors.onSurfaceSecondary, fontSize: typography.sizes.sm },
  setsTags: { flexDirection: "row", flexWrap: "wrap", gap: spacing.xs, marginTop: spacing.xs },
  setTag: { backgroundColor: colors.surfaceTertiary, paddingHorizontal: spacing.sm, paddingVertical: 4, borderRadius: radius.sm },
  setTagText: { color: colors.onSurface, fontSize: typography.sizes.xs, fontWeight: "600" },
  deleteBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.xs,
    paddingVertical: spacing.sm,
    borderWidth: 1,
    borderColor: colors.error,
    borderRadius: radius.sm,
    marginTop: spacing.sm,
  },
  deleteText: { color: colors.error, fontWeight: "600" },
});
