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
import { useFocusEffect, useRouter } from "expo-router";
import * as Haptics from "expo-haptics";

import { colors, radius, spacing, typography } from "@/src/theme";
import { getWorkouts, Workout } from "@/src/storage";

export default function SchedeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const w = await getWorkouts();
    setWorkouts(w);
    setLoading(false);
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  const onCreate = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push("/workout/new");
  };

  return (
    <SafeAreaView style={styles.safe} edges={["top"]} testID="schede-screen">
      <View style={styles.header}>
        <View style={{ flex: 1 }}>
          <Text style={styles.title}>Le Mie Schede</Text>
          <Text style={styles.subtitle}>
            {workouts.length === 0
              ? "Crea la tua prima scheda di allenamento"
              : `${workouts.length} schede attive`}
          </Text>
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
      </View>

      {loading ? null : workouts.length === 0 ? (
        <View style={styles.empty}>
          <View style={styles.emptyIconWrap}>
            <Ionicons name="barbell-outline" size={56} color={colors.brandPrimary} />
          </View>
          <Text style={styles.emptyTitle}>Nessuna scheda</Text>
          <Text style={styles.emptyText}>
            Crea la tua prima scheda e inizia a tracciare i tuoi allenamenti.
          </Text>
        </View>
      ) : (
        <FlatList
          data={workouts}
          keyExtractor={(it) => it.id}
          contentContainerStyle={{
            padding: spacing.lg,
            paddingBottom: 120 + insets.bottom,
          }}
          ItemSeparatorComponent={() => <View style={{ height: spacing.md }} />}
          renderItem={({ item }) => <WorkoutCard w={item} />}
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

function WorkoutCard({ w }: { w: Workout }) {
  const router = useRouter();
  const muscles = Array.from(new Set(w.exercises.map((e) => e.muscleGroup))).join(" · ");
  const totalSets = w.exercises.reduce((s, e) => s + e.targetSets, 0);
  const estMinutes = Math.max(
    5,
    Math.round(
      w.exercises.length * 2 +
        (totalSets * (w.exercises[0]?.restSeconds || 90)) / 60,
    ),
  );

  return (
    <Pressable
      onPress={() => {
        Haptics.selectionAsync();
        router.push(`/workout/${w.id}` as any);
      }}
      style={({ pressed }) => [styles.card, pressed && { opacity: 0.9 }]}
      testID={`workout-card-${w.id}`}
    >
      <View style={styles.cardHeader}>
        <Text style={styles.cardTitle} numberOfLines={1}>{w.name}</Text>
        <View style={styles.cardBadge}>
          <Text style={styles.cardBadgeText}>{w.exercises.length} ESERCIZI</Text>
        </View>
      </View>
      <Text style={styles.cardMuscles} numberOfLines={1}>
        {muscles || "Nessun esercizio"}
      </Text>
      <View style={styles.cardFooter}>
        <View style={styles.metric}>
          <Ionicons name="layers-outline" size={14} color={colors.onSurfaceSecondary} />
          <Text style={styles.metricText}>{totalSets} serie</Text>
        </View>
        <View style={styles.metric}>
          <Ionicons name="time-outline" size={14} color={colors.onSurfaceSecondary} />
          <Text style={styles.metricText}>~{estMinutes} min</Text>
        </View>
        <View style={styles.cardCta}>
          <Ionicons name="play" size={14} color={colors.brandPrimary} />
          <Text style={styles.cardCtaText}>Allena</Text>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.surface },
  header: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.md,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
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
  empty: { flex: 1, alignItems: "center", justifyContent: "center", padding: spacing.xl },
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
    marginBottom: spacing.xs,
  },
  cardTitle: {
    color: colors.onSurface,
    fontSize: typography.sizes.xl,
    fontWeight: "700",
    flex: 1,
    marginRight: spacing.md,
  },
  cardBadge: {
    backgroundColor: colors.brandTertiary,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: radius.sm,
  },
  cardBadgeText: {
    color: colors.brandPrimary,
    fontSize: typography.sizes.xs,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  cardMuscles: {
    color: colors.onSurfaceSecondary,
    fontSize: typography.sizes.sm,
    marginBottom: spacing.md,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  cardFooter: { flexDirection: "row", alignItems: "center", gap: spacing.md },
  metric: { flexDirection: "row", alignItems: "center", gap: 4 },
  metricText: {
    color: colors.onSurfaceSecondary,
    fontSize: typography.sizes.sm,
  },
  cardCta: {
    marginLeft: "auto",
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: colors.brandTertiary,
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
    borderRadius: radius.pill,
  },
  cardCtaText: { color: colors.brandPrimary, fontSize: typography.sizes.sm, fontWeight: "700" },
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
