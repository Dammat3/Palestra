import { useEffect, useRef } from "react";
import { Animated, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import * as Haptics from "expo-haptics";

import { colors, radius, spacing, typography } from "@/src/theme";

type PRItem = { exerciseId: string; exerciseName: string; estimated: number };

function fmtDuration(totalSec: number): string {
  const m = Math.floor(totalSec / 60);
  const s = totalSec % 60;
  if (m === 0) return `${s}s`;
  return `${m} min ${s}s`;
}

export default function WorkoutSummaryScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{
    workoutName: string;
    durationSec: string;
    totalVolume: string;
    totalSets: string;
    prs: string;
  }>();

  const durationSec = parseInt(params.durationSec || "0", 10);
  const totalVolume = parseFloat(params.totalVolume || "0");
  const totalSets = parseInt(params.totalSets || "0", 10);
  let prs: PRItem[] = [];
  try {
    prs = JSON.parse(params.prs || "[]");
  } catch {
    prs = [];
  }
  const hasPRs = prs.length > 0;

  const scale = useRef(new Animated.Value(0.6)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    Animated.parallel([
      Animated.spring(scale, { toValue: 1, friction: 5, tension: 60, useNativeDriver: true }),
      Animated.timing(opacity, { toValue: 1, duration: 350, useNativeDriver: true }),
    ]).start();
  }, []);

  const goHome = () => {
    Haptics.selectionAsync();
    router.replace("/(tabs)" as any);
  };

  const goHistory = () => {
    Haptics.selectionAsync();
    router.replace("/(tabs)/history" as any);
  };

  return (
    <SafeAreaView style={styles.safe} edges={["top"]} testID="workout-summary-screen">
      <ScrollView
        contentContainerStyle={{
          padding: spacing.lg,
          paddingBottom: insets.bottom + spacing.xl,
          alignItems: "center",
        }}
      >
        <Animated.View
          style={[styles.iconWrap, { transform: [{ scale }], opacity }]}
        >
          <Ionicons
            name={hasPRs ? "trophy" : "checkmark-circle"}
            size={56}
            color={hasPRs ? "#FFD700" : colors.brandPrimary}
          />
        </Animated.View>

        <Text style={styles.title}>Allenamento Completato!</Text>
        <Text style={styles.subtitle}>{params.workoutName}</Text>

        <View style={styles.statsRow}>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>{fmtDuration(durationSec)}</Text>
            <Text style={styles.statLabel}>DURATA</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>{Math.round(totalVolume)} kg</Text>
            <Text style={styles.statLabel}>VOLUME</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>{totalSets}</Text>
            <Text style={styles.statLabel}>SERIE</Text>
          </View>
        </View>

        {hasPRs ? (
          <View style={styles.prSection}>
            <Text style={styles.prSectionTitle}>
              🏆 {prs.length === 1 ? "Nuovo Record Personale" : `${prs.length} Nuovi Record Personali`}
            </Text>
            {prs.map((pr) => (
              <View key={pr.exerciseId} style={styles.prRow}>
                <Ionicons name="trending-up" size={16} color="#FFD700" />
                <Text style={styles.prRowName} numberOfLines={1}>{pr.exerciseName}</Text>
                <Text style={styles.prRowValue}>{Math.round(pr.estimated)} kg</Text>
              </View>
            ))}
          </View>
        ) : (
          <View style={styles.noPrSection}>
            <Text style={styles.noPrText}>
              Nessun nuovo record questa volta, ma ogni allenamento conta. Continua così!
            </Text>
          </View>
        )}

        <Pressable onPress={goHome} style={styles.primaryBtn} testID="summary-go-home-btn">
          <Text style={styles.primaryBtnText}>Torna alla Home</Text>
        </Pressable>
        <Pressable onPress={goHistory} style={styles.secondaryBtn} testID="summary-go-history-btn">
          <Text style={styles.secondaryBtnText}>Vedi Cronologia</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.surface },
  iconWrap: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: colors.surfaceSecondary,
    alignItems: "center",
    justifyContent: "center",
    marginTop: spacing.xl,
    marginBottom: spacing.lg,
  },
  title: {
    color: colors.onSurface,
    fontSize: typography.sizes.xxl,
    fontWeight: "800",
    letterSpacing: -0.5,
    textAlign: "center",
  },
  subtitle: {
    color: colors.onSurfaceSecondary,
    fontSize: typography.sizes.base,
    marginTop: 4,
    marginBottom: spacing.xl,
    textAlign: "center",
  },
  statsRow: {
    flexDirection: "row",
    gap: spacing.sm,
    width: "100%",
    marginBottom: spacing.xl,
  },
  statBox: {
    flex: 1,
    backgroundColor: colors.surfaceSecondary,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    paddingVertical: spacing.md,
    alignItems: "center",
  },
  statValue: { color: colors.onSurface, fontSize: typography.sizes.lg, fontWeight: "800" },
  statLabel: {
    color: colors.onSurfaceTertiary,
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 0.5,
    marginTop: 4,
  },
  prSection: {
    width: "100%",
    backgroundColor: colors.surfaceSecondary,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: "#FFD700",
    padding: spacing.md,
    marginBottom: spacing.xl,
    gap: spacing.sm,
  },
  prSectionTitle: {
    color: colors.onSurface,
    fontWeight: "800",
    fontSize: typography.sizes.base,
    marginBottom: 4,
  },
  prRow: { flexDirection: "row", alignItems: "center", gap: spacing.sm },
  prRowName: { flex: 1, color: colors.onSurfaceSecondary, fontSize: typography.sizes.sm },
  prRowValue: { color: colors.onSurface, fontWeight: "700", fontSize: typography.sizes.sm },
  noPrSection: { marginBottom: spacing.xl, paddingHorizontal: spacing.lg },
  noPrText: {
    color: colors.onSurfaceTertiary,
    fontSize: typography.sizes.sm,
    textAlign: "center",
    lineHeight: 19,
  },
  primaryBtn: {
    width: "100%",
    backgroundColor: colors.brandPrimary,
    borderRadius: radius.pill,
    paddingVertical: 16,
    alignItems: "center",
    marginBottom: spacing.sm,
  },
  primaryBtnText: { color: colors.onBrandPrimary, fontWeight: "800", fontSize: typography.sizes.base },
  secondaryBtn: { width: "100%", paddingVertical: 14, alignItems: "center" },
  secondaryBtnText: { color: colors.onSurfaceSecondary, fontWeight: "600", fontSize: typography.sizes.base },
});
