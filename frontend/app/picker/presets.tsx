import { useState } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import * as Haptics from "expo-haptics";

import { colors, radius, spacing, typography } from "@/src/theme";
import { PRESETS, Preset, presetToWorkouts } from "@/src/presets";
import { saveWorkout } from "@/src/storage";

export default function PresetsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [importing, setImporting] = useState<string | null>(null);

  const onChoose = async (p: Preset) => {
    setImporting(p.id);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    const workouts = presetToWorkouts(p);
    for (const w of workouts) {
      await saveWorkout(w);
    }
    setImporting(null);
    router.back();
  };

  return (
    <SafeAreaView style={styles.safe} edges={["top"]} testID="presets-screen">
      <View style={styles.topBar}>
        <Pressable onPress={() => router.back()} hitSlop={12}>
          <Ionicons name="close" size={26} color={colors.onSurface} />
        </Pressable>
        <Text style={styles.topTitle}>Schede Pronte</Text>
        <View style={{ width: 26 }} />
      </View>

      <ScrollView
        contentContainerStyle={{
          padding: spacing.lg,
          paddingBottom: spacing.xl + insets.bottom,
          gap: spacing.lg,
        }}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.hero}>
          Importa una scheda preimpostata e modificala come vuoi.
        </Text>

        {PRESETS.map((p) => (
          <View key={p.id} style={styles.card} testID={`preset-${p.id}`}>
            <View style={styles.cardHead}>
              <View style={{ flex: 1 }}>
                <Text style={styles.cardTitle}>{p.name}</Text>
                <Text style={styles.cardDesc}>{p.description}</Text>
              </View>
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{p.days.length} GG</Text>
              </View>
            </View>

            <View style={styles.daysList}>
              {p.days.map((d, i) => (
                <View key={i} style={styles.dayRow}>
                  <View style={styles.dayDot} />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.dayName}>{d.name}</Text>
                    <Text style={styles.dayMeta}>{d.exercises.length} esercizi</Text>
                  </View>
                </View>
              ))}
            </View>

            <Pressable
              onPress={() => onChoose(p)}
              disabled={importing === p.id}
              style={[styles.importBtn, importing === p.id && { opacity: 0.6 }]}
              testID={`import-preset-${p.id}`}
            >
              <Ionicons name="download-outline" size={18} color={colors.onBrandPrimary} />
              <Text style={styles.importText}>
                {importing === p.id ? "Importazione..." : "Importa Scheda"}
              </Text>
            </Pressable>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.surface },
  topBar: { height: 52, flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: spacing.lg },
  topTitle: { color: colors.onSurface, fontSize: typography.sizes.lg, fontWeight: "700" },
  hero: {
    color: colors.onSurfaceSecondary,
    fontSize: typography.sizes.base,
    lineHeight: 22,
  },
  card: {
    backgroundColor: colors.surfaceSecondary,
    borderRadius: radius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
    gap: spacing.md,
  },
  cardHead: { flexDirection: "row", alignItems: "flex-start", gap: spacing.md },
  cardTitle: { color: colors.onSurface, fontSize: typography.sizes.xl, fontWeight: "800" },
  cardDesc: { color: colors.onSurfaceSecondary, fontSize: typography.sizes.sm, marginTop: 2, lineHeight: 20 },
  badge: {
    backgroundColor: colors.brandTertiary,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: radius.sm,
  },
  badgeText: { color: colors.brandPrimary, fontWeight: "800", fontSize: 11, letterSpacing: 0.5 },
  daysList: { gap: spacing.sm },
  dayRow: { flexDirection: "row", alignItems: "center", gap: spacing.md },
  dayDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.brandPrimary },
  dayName: { color: colors.onSurface, fontWeight: "600", fontSize: typography.sizes.base },
  dayMeta: { color: colors.onSurfaceTertiary, fontSize: typography.sizes.xs },
  importBtn: {
    backgroundColor: colors.brandPrimary,
    borderRadius: radius.pill,
    paddingVertical: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.xs,
    marginTop: spacing.sm,
  },
  importText: { color: colors.onBrandPrimary, fontWeight: "800", fontSize: typography.sizes.base },
});
