import { useMemo, useState } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

import { colors, radius, spacing, typography } from "@/src/theme";
import { calculatePlates } from "@/src/plates";

const BAR_OPTIONS = [20, 15, 10, 7];

export default function PlateCalculatorScreen() {
  const router = useRouter();
  const [target, setTarget] = useState("60");
  const [bar, setBar] = useState(20);

  const targetNum = parseFloat(target.replace(",", ".")) || 0;
  const result = useMemo(() => calculatePlates(targetNum, bar), [targetNum, bar]);

  return (
    <SafeAreaView style={styles.safe} edges={["top"]} testID="plate-calculator-screen">
      <View style={styles.topBar}>
        <Pressable onPress={() => router.back()} hitSlop={12}>
          <Ionicons name="close" size={26} color={colors.onSurface} />
        </Pressable>
        <Text style={styles.title}>Calcolatore Dischi</Text>
        <View style={{ width: 26 }} />
      </View>

      <ScrollView contentContainerStyle={{ padding: spacing.lg, gap: spacing.lg }}>
        <View>
          <Text style={styles.label}>Peso Totale (kg)</Text>
          <TextInput
            value={target}
            onChangeText={setTarget}
            keyboardType="decimal-pad"
            selectTextOnFocus
            style={styles.bigInput}
            placeholderTextColor={colors.onSurfaceTertiary}
            testID="target-weight-input"
          />
        </View>

        <View>
          <Text style={styles.label}>Bilanciere</Text>
          <View style={styles.barRow}>
            {BAR_OPTIONS.map((b) => (
              <Pressable
                key={b}
                onPress={() => setBar(b)}
                style={[styles.barChip, bar === b && styles.barChipActive]}
                testID={`bar-${b}`}
              >
                <Text style={[styles.barChipText, bar === b && styles.barChipTextActive]}>
                  {b} kg
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        <View style={styles.summaryCard}>
          <Text style={styles.summaryLabel}>Per Lato</Text>
          <Text style={styles.summaryValue} testID="per-side-total">
            {result.totalPerSide.toFixed(2).replace(/\.?0+$/, "")} kg
          </Text>
          <Text style={styles.summaryHint}>
            Totale: {result.total.toFixed(2).replace(/\.?0+$/, "")} kg
            {result.remaining > 0 && ` · ${result.remaining} kg non raggiungibili`}
          </Text>
        </View>

        <Text style={styles.section}>Dischi per Lato</Text>
        {result.perSide.length === 0 ? (
          <Text style={styles.empty}>
            {targetNum <= bar
              ? "Il peso target è ≤ del bilanciere"
              : "Nessun disco standard adeguato"}
          </Text>
        ) : (
          <View style={{ gap: spacing.sm }}>
            {result.perSide.map((p) => (
              <View key={p.plate} style={styles.plateRow} testID={`plate-${p.plate}`}>
                <View style={[styles.plateDisc, plateColor(p.plate)]}>
                  <Text style={styles.plateDiscText}>{p.plate}</Text>
                </View>
                <Text style={styles.plateKg}>{p.plate} kg</Text>
                <View style={styles.plateMult}>
                  <Text style={styles.plateCount}>×{p.count}</Text>
                </View>
              </View>
            ))}
          </View>
        )}

        <View style={styles.legendCard}>
          <Text style={styles.legendTitle}>Visualizzazione barra</Text>
          <View style={styles.barViz}>
            {[...result.perSide].reverse().map((p, i) => (
              <View
                key={i}
                style={[
                  styles.barDisc,
                  plateColor(p.plate),
                  { width: 8 + p.plate * 1.3, height: 30 + p.plate * 1.4 },
                ]}
              />
            ))}
            <View style={styles.barBar} />
            {result.perSide.map((p, i) => (
              <View
                key={`r${i}`}
                style={[
                  styles.barDisc,
                  plateColor(p.plate),
                  { width: 8 + p.plate * 1.3, height: 30 + p.plate * 1.4 },
                ]}
              />
            ))}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function plateColor(p: number) {
  // Standard IPF colors
  if (p === 25) return { backgroundColor: "#C25953", borderColor: "#A04640" };
  if (p === 20) return { backgroundColor: "#1f3a8a", borderColor: "#1a2f6c" };
  if (p === 15) return { backgroundColor: "#E0A96D", borderColor: "#B8884F" };
  if (p === 10) return { backgroundColor: "#3e6d3e", borderColor: "#2d5230" };
  if (p === 5) return { backgroundColor: "#F2F2F2", borderColor: "#999" };
  return { backgroundColor: "#5a5a5a", borderColor: "#3a3a3a" };
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.surface },
  topBar: { height: 52, flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: spacing.lg },
  title: { color: colors.onSurface, fontSize: typography.sizes.lg, fontWeight: "700" },
  label: { color: colors.onSurfaceSecondary, fontSize: typography.sizes.sm, marginBottom: spacing.sm, textTransform: "uppercase", letterSpacing: 0.5 },
  bigInput: {
    backgroundColor: colors.surfaceSecondary,
    borderRadius: radius.md,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.md,
    color: colors.onSurface,
    fontSize: 48,
    fontWeight: "800",
    letterSpacing: -1,
    textAlign: "center",
    borderWidth: 1,
    borderColor: colors.border,
  },
  barRow: { flexDirection: "row", gap: spacing.sm },
  barChip: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surfaceSecondary,
    alignItems: "center",
  },
  barChipActive: { backgroundColor: colors.brandPrimary, borderColor: colors.brandPrimary },
  barChipText: { color: colors.onSurfaceSecondary, fontWeight: "700" },
  barChipTextActive: { color: colors.onBrandPrimary },
  summaryCard: {
    backgroundColor: colors.surfaceSecondary,
    borderRadius: radius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.brandPrimary,
    alignItems: "center",
  },
  summaryLabel: { color: colors.brandPrimary, fontWeight: "700", fontSize: typography.sizes.sm, letterSpacing: 1, textTransform: "uppercase" },
  summaryValue: { color: colors.onSurface, fontSize: 56, fontWeight: "800", letterSpacing: -2, marginTop: spacing.xs },
  summaryHint: { color: colors.onSurfaceSecondary, fontSize: typography.sizes.sm, marginTop: 4 },
  section: { color: colors.onSurface, fontWeight: "700", fontSize: typography.sizes.lg },
  empty: { color: colors.onSurfaceSecondary, textAlign: "center", paddingVertical: spacing.lg },
  plateRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.surfaceSecondary,
    borderRadius: radius.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    gap: spacing.md,
  },
  plateDisc: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
  },
  plateDiscText: { color: "#fff", fontWeight: "800", fontSize: 12 },
  plateKg: { flex: 1, color: colors.onSurface, fontWeight: "700", fontSize: typography.sizes.base },
  plateMult: { backgroundColor: colors.brandTertiary, paddingHorizontal: spacing.md, paddingVertical: 6, borderRadius: radius.sm },
  plateCount: { color: colors.brandPrimary, fontWeight: "800", fontSize: typography.sizes.base },
  legendCard: { backgroundColor: colors.surfaceSecondary, borderRadius: radius.md, padding: spacing.md, borderWidth: 1, borderColor: colors.border },
  legendTitle: { color: colors.onSurfaceSecondary, fontSize: typography.sizes.sm, marginBottom: spacing.md },
  barViz: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 3 },
  barDisc: { borderRadius: 3, borderWidth: 1 },
  barBar: { width: 90, height: 7, backgroundColor: "#9b9b9b" },
});
