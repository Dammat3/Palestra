import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";

import { colors, radius, spacing, typography } from "@/src/theme";
import { ExerciseDetail, fetchExerciseDetail } from "@/src/api";

export default function ExerciseDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [ex, setEx] = useState<ExerciseDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    fetchExerciseDetail(id)
      .then(setEx)
      .finally(() => setLoading(false));
  }, [id]);

  return (
    <View style={styles.safe} testID="exercise-detail-screen">
      <ScrollView contentContainerStyle={{ paddingBottom: 80 }}>
        {loading ? (
          <View style={styles.loading}>
            <ActivityIndicator color={colors.brandPrimary} />
          </View>
        ) : ex ? (
          <>
            <View style={styles.hero}>
              {ex.images[0] ? (
                <Image
                  source={{ uri: ex.images[0] }}
                  style={{ width: "100%", height: "100%" }}
                  contentFit="cover"
                  transition={250}
                />
              ) : (
                <View style={styles.heroPlaceholder}>
                  <Ionicons name="barbell" size={48} color={colors.onSurfaceTertiary} />
                </View>
              )}
              <LinearGradient
                colors={["transparent", colors.surface]}
                style={styles.heroScrim}
              />
              <SafeAreaView style={styles.heroTopBar} edges={["top"]}>
                <Pressable onPress={() => router.back()} hitSlop={12} style={styles.closeBtn}>
                  <Ionicons name="close" size={22} color={colors.onSurface} />
                </Pressable>
              </SafeAreaView>
            </View>

            <View style={styles.content}>
              <Text style={styles.name}>{ex.name}</Text>
              <View style={styles.tags}>
                <Tag label={ex.muscle_group} primary />
                <Tag label={ex.equipment} />
                <Tag label={ex.level} />
                <Tag label={ex.category} />
              </View>

              {ex.images.length > 1 && (
                <View style={styles.gallery}>
                  {ex.images.map((img, i) => (
                    <Image
                      key={i}
                      source={{ uri: img }}
                      style={styles.gImg}
                      contentFit="cover"
                    />
                  ))}
                </View>
              )}

              <Text style={styles.section}>Esecuzione</Text>
              <View style={styles.stepsCard}>
                {ex.instructions.map((step, i) => (
                  <View key={i} style={styles.stepRow}>
                    <View style={styles.stepNum}>
                      <Text style={styles.stepNumText}>{i + 1}</Text>
                    </View>
                    <Text style={styles.stepText}>{step}</Text>
                  </View>
                ))}
              </View>

              {ex.tips ? (
                <>
                  <Text style={styles.section}>Suggerimento</Text>
                  <View style={styles.tipCard}>
                    <Ionicons name="bulb-outline" size={20} color={colors.brandPrimary} />
                    <Text style={styles.tipText}>{ex.tips}</Text>
                  </View>
                </>
              ) : null}

              {ex.secondary_muscles?.length ? (
                <>
                  <Text style={styles.section}>Muscoli Secondari</Text>
                  <View style={styles.tags}>
                    {ex.secondary_muscles.map((m, i) => <Tag key={i} label={m} />)}
                  </View>
                </>
              ) : null}
            </View>
          </>
        ) : (
          <Text style={{ color: colors.error, textAlign: "center", padding: spacing.xl }}>
            Esercizio non trovato
          </Text>
        )}
      </ScrollView>
    </View>
  );
}

function Tag({ label, primary }: { label: string; primary?: boolean }) {
  return (
    <View style={[styles.tag, primary && styles.tagPrimary]}>
      <Text style={[styles.tagText, primary && styles.tagTextPrimary]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.surface },
  loading: { padding: spacing.xxxl, alignItems: "center" },
  hero: { height: 320, backgroundColor: colors.surfaceTertiary, position: "relative" },
  heroPlaceholder: { flex: 1, alignItems: "center", justifyContent: "center" },
  heroScrim: { position: "absolute", left: 0, right: 0, bottom: 0, height: 120 },
  heroTopBar: { position: "absolute", top: 0, left: 0, right: 0, padding: spacing.md },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(0,0,0,0.55)",
    alignItems: "center",
    justifyContent: "center",
  },
  content: { padding: spacing.lg, marginTop: -spacing.xl },
  name: { color: colors.onSurface, fontSize: typography.sizes.xxl, fontWeight: "800", letterSpacing: -0.5 },
  tags: { flexDirection: "row", flexWrap: "wrap", gap: spacing.xs, marginTop: spacing.md },
  tag: {
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
    borderRadius: radius.pill,
    backgroundColor: colors.surfaceSecondary,
    borderWidth: 1,
    borderColor: colors.border,
  },
  tagPrimary: { backgroundColor: colors.brandTertiary, borderColor: colors.brandSecondary },
  tagText: { color: colors.onSurfaceSecondary, fontWeight: "600", fontSize: 13 },
  tagTextPrimary: { color: colors.brandPrimary },
  gallery: { flexDirection: "row", gap: spacing.sm, marginTop: spacing.lg },
  gImg: { flex: 1, height: 120, borderRadius: radius.md, backgroundColor: colors.surfaceTertiary },
  section: { color: colors.onSurface, fontWeight: "700", fontSize: typography.sizes.lg, marginTop: spacing.xl, marginBottom: spacing.md },
  stepsCard: {
    backgroundColor: colors.surfaceSecondary,
    borderRadius: radius.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    gap: spacing.md,
  },
  stepRow: { flexDirection: "row", gap: spacing.md, alignItems: "flex-start" },
  stepNum: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.brandTertiary,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 2,
  },
  stepNumText: { color: colors.brandPrimary, fontWeight: "800", fontSize: 12 },
  stepText: { flex: 1, color: colors.onSurface, fontSize: typography.sizes.base, lineHeight: 22 },
  tipCard: {
    backgroundColor: colors.surfaceSecondary,
    borderRadius: radius.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    flexDirection: "row",
    gap: spacing.sm,
  },
  tipText: { flex: 1, color: colors.onSurface, fontSize: typography.sizes.base, lineHeight: 22 },
});
