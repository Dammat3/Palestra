import { useCallback, useMemo, useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "expo-router";
import * as Haptics from "expo-haptics";

import { colors, radius, spacing, typography } from "@/src/theme";
import {
  MeasurementEntry,
  WeightEntry,
  deleteMeasurementEntry,
  deleteWeightEntry,
  getMeasurementsLog,
  getWeightLog,
  saveMeasurementEntry,
  saveWeightEntry,
} from "@/src/storage";

const MEASUREMENT_FIELDS: { key: keyof Omit<MeasurementEntry, "id" | "date">; label: string }[] = [
  { key: "petto", label: "Petto" },
  { key: "addome", label: "Addome" },
  { key: "bicipite", label: "Bicipite" },
  { key: "avambraccio", label: "Avambraccio" },
  { key: "glutei", label: "Glutei" },
  { key: "coscia", label: "Coscia" },
  { key: "polpaccio", label: "Polpaccio" },
];

function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}

function formatDateIT(iso: string): string {
  const d = new Date(iso + "T00:00:00");
  return d.toLocaleDateString("it-IT", { day: "numeric", month: "short", year: "numeric" });
}

export default function MeasurementsScreen() {
  const insets = useSafeAreaInsets();
  const [weightLog, setWeightLog] = useState<WeightEntry[]>([]);
  const [measurementsLog, setMeasurementsLog] = useState<MeasurementEntry[]>([]);
  const [weightInput, setWeightInput] = useState("");
  const [measureInputs, setMeasureInputs] = useState<Record<string, string>>({});
  const [savingWeight, setSavingWeight] = useState(false);
  const [savingMeasurements, setSavingMeasurements] = useState(false);

  const load = useCallback(() => {
    getWeightLog().then(setWeightLog);
    getMeasurementsLog().then(setMeasurementsLog);
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  const lastWeight = weightLog[weightLog.length - 1];
  const prevWeight = weightLog[weightLog.length - 2];
  const weightDelta = lastWeight && prevWeight ? lastWeight.weightKg - prevWeight.weightKg : null;

  const lastMeasurement = measurementsLog[measurementsLog.length - 1];

  const recentWeights = useMemo(() => [...weightLog].reverse().slice(0, 8), [weightLog]);
  const recentMeasurements = useMemo(
    () => [...measurementsLog].reverse().slice(0, 5),
    [measurementsLog],
  );

  const submitWeight = async () => {
    const val = parseFloat(weightInput.replace(",", "."));
    if (!Number.isFinite(val) || val <= 0) {
      Alert.alert("Valore non valido", "Inserisci un peso valido in kg.");
      return;
    }
    setSavingWeight(true);
    try {
      await saveWeightEntry(todayISO(), val);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setWeightInput("");
      load();
    } finally {
      setSavingWeight(false);
    }
  };

  const submitMeasurements = async () => {
    const values: Record<string, number> = {};
    let hasAny = false;
    for (const f of MEASUREMENT_FIELDS) {
      const raw = measureInputs[f.key];
      if (raw && raw.trim()) {
        const val = parseFloat(raw.replace(",", "."));
        if (Number.isFinite(val) && val > 0) {
          values[f.key] = val;
          hasAny = true;
        }
      }
    }
    if (!hasAny) {
      Alert.alert("Nessun dato", "Inserisci almeno una misura prima di salvare.");
      return;
    }
    setSavingMeasurements(true);
    try {
      await saveMeasurementEntry(todayISO(), values);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setMeasureInputs({});
      load();
    } finally {
      setSavingMeasurements(false);
    }
  };

  const confirmDeleteWeight = (entry: WeightEntry) => {
    Alert.alert("Elimina voce", `Eliminare il peso del ${formatDateIT(entry.date)}?`, [
      { text: "Annulla", style: "cancel" },
      {
        text: "Elimina",
        style: "destructive",
        onPress: async () => {
          await deleteWeightEntry(entry.id);
          load();
        },
      },
    ]);
  };

  const confirmDeleteMeasurement = (entry: MeasurementEntry) => {
    Alert.alert("Elimina voce", `Eliminare le misure del ${formatDateIT(entry.date)}?`, [
      { text: "Annulla", style: "cancel" },
      {
        text: "Elimina",
        style: "destructive",
        onPress: async () => {
          await deleteMeasurementEntry(entry.id);
          load();
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.safe} edges={["top"]} testID="measurements-screen">
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={{
            padding: spacing.lg,
            paddingBottom: insets.bottom + 280,
          }}
          keyboardShouldPersistTaps="handled"
        >
          <Text style={styles.title}>Peso e Misure</Text>
          <Text style={styles.subtitle}>Tieni traccia dei tuoi progressi fisici nel tempo</Text>

          {/* ---- Weight section ---- */}
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Ionicons name="scale-outline" size={20} color={colors.brandPrimary} />
              <Text style={styles.cardTitle}>Peso Corporeo</Text>
            </View>

            {lastWeight && (
              <View style={styles.lastValueRow}>
                <View>
                  <Text style={styles.lastValueNumber}>{lastWeight.weightKg.toFixed(1)} kg</Text>
                  <Text style={styles.lastValueDate}>{formatDateIT(lastWeight.date)}</Text>
                </View>
                {weightDelta !== null && (
                  <View
                    style={[
                      styles.deltaPill,
                      weightDelta < 0 && styles.deltaPillDown,
                      weightDelta > 0 && styles.deltaPillUp,
                    ]}
                  >
                    <Ionicons
                      name={weightDelta < 0 ? "trending-down" : weightDelta > 0 ? "trending-up" : "remove"}
                      size={12}
                      color={colors.onSurface}
                    />
                    <Text style={styles.deltaPillText}>
                      {weightDelta > 0 ? "+" : ""}
                      {weightDelta.toFixed(1)} kg
                    </Text>
                  </View>
                )}
              </View>
            )}

            <View style={styles.inputRow}>
              <TextInput
                value={weightInput}
                onChangeText={setWeightInput}
                placeholder="es. 78.5"
                placeholderTextColor={colors.onSurfaceTertiary}
                keyboardType="decimal-pad"
                style={styles.weightInput}
                testID="weight-input"
              />
              <Text style={styles.unitLabel}>kg</Text>
              <Pressable
                onPress={submitWeight}
                style={[styles.saveBtn, savingWeight && { opacity: 0.6 }]}
                disabled={savingWeight}
                testID="save-weight-btn"
              >
                <Text style={styles.saveBtnText}>Salva</Text>
              </Pressable>
            </View>
            <Text style={styles.hint}>
              Registra il peso di oggi. Se inserisci di nuovo, sostituisce il valore di oggi.
            </Text>

            {recentWeights.length > 0 && (
              <View style={styles.historyList}>
                {recentWeights.map((e) => (
                  <Pressable
                    key={e.id}
                    style={styles.historyRow}
                    onLongPress={() => confirmDeleteWeight(e)}
                  >
                    <Text style={styles.historyDate}>{formatDateIT(e.date)}</Text>
                    <Text style={styles.historyValue}>{e.weightKg.toFixed(1)} kg</Text>
                  </Pressable>
                ))}
              </View>
            )}
          </View>

          {/* ---- Body measurements section ---- */}
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Ionicons name="body-outline" size={20} color={colors.brandPrimary} />
              <Text style={styles.cardTitle}>Misure Corporee</Text>
            </View>
            <Text style={styles.hint}>
              Compila solo le misure che vuoi aggiornare oggi, anche una alla volta.
            </Text>

            <View style={styles.measureGrid}>
              {MEASUREMENT_FIELDS.map((f) => (
                <View key={f.key} style={styles.measureField}>
                  <Text style={styles.measureLabel}>{f.label}</Text>
                  <View style={styles.measureInputWrap}>
                    <TextInput
                      value={measureInputs[f.key] || ""}
                      onChangeText={(v) => setMeasureInputs((prev) => ({ ...prev, [f.key]: v }))}
                      placeholder={
                        lastMeasurement?.[f.key] ? String(lastMeasurement[f.key]) : "cm"
                      }
                      placeholderTextColor={colors.onSurfaceTertiary}
                      keyboardType="decimal-pad"
                      style={styles.measureInput}
                      testID={`measure-input-${f.key}`}
                    />
                  </View>
                </View>
              ))}
            </View>

            <Pressable
              onPress={submitMeasurements}
              style={[styles.saveBtnFull, savingMeasurements && { opacity: 0.6 }]}
              disabled={savingMeasurements}
              testID="save-measurements-btn"
            >
              <Text style={styles.saveBtnText}>Salva Misure di Oggi</Text>
            </Pressable>

            {recentMeasurements.length > 0 && (
              <View style={styles.historyList}>
                {recentMeasurements.map((e) => (
                  <Pressable
                    key={e.id}
                    style={styles.measurementHistoryCard}
                    onLongPress={() => confirmDeleteMeasurement(e)}
                  >
                    <Text style={styles.historyDate}>{formatDateIT(e.date)}</Text>
                    <View style={styles.measurementHistoryRow}>
                      {MEASUREMENT_FIELDS.filter((f) => e[f.key] !== undefined).map((f) => (
                        <Text key={f.key} style={styles.measurementHistoryItem}>
                          {f.label}: {e[f.key]} cm
                        </Text>
                      ))}
                    </View>
                  </Pressable>
                ))}
              </View>
            )}
          </View>

          <Text style={styles.deleteHint}>
            Tieni premuta una voce nello storico per eliminarla.
          </Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.surface },
  title: {
    color: colors.onSurface,
    fontSize: typography.sizes.xxl,
    fontWeight: "800",
    letterSpacing: -0.5,
  },
  subtitle: {
    color: colors.onSurfaceSecondary,
    fontSize: typography.sizes.sm,
    marginTop: 4,
    marginBottom: spacing.lg,
  },
  card: {
    backgroundColor: colors.surfaceSecondary,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    marginBottom: spacing.lg,
  },
  cardHeader: { flexDirection: "row", alignItems: "center", gap: spacing.sm, marginBottom: spacing.sm },
  cardTitle: { color: colors.onSurface, fontSize: typography.sizes.lg, fontWeight: "700" },
  lastValueRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: colors.surfaceTertiary,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  lastValueNumber: { color: colors.onSurface, fontSize: typography.sizes.xxl, fontWeight: "800" },
  lastValueDate: { color: colors.onSurfaceTertiary, fontSize: typography.sizes.xs, marginTop: 2 },
  deltaPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: colors.surface,
    borderRadius: radius.pill,
    paddingVertical: 6,
    paddingHorizontal: 10,
  },
  deltaPillDown: { backgroundColor: "#1F2E22" },
  deltaPillUp: { backgroundColor: "#2E2220" },
  deltaPillText: { color: colors.onSurface, fontSize: 12, fontWeight: "700" },
  inputRow: { flexDirection: "row", alignItems: "center", gap: spacing.sm },
  weightInput: {
    flex: 1,
    backgroundColor: colors.surfaceTertiary,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.md,
    paddingVertical: 12,
    color: colors.onSurface,
    fontSize: typography.sizes.base,
  },
  unitLabel: { color: colors.onSurfaceSecondary, fontWeight: "600" },
  saveBtn: {
    backgroundColor: colors.brandPrimary,
    borderRadius: radius.md,
    paddingVertical: 12,
    paddingHorizontal: spacing.lg,
  },
  saveBtnFull: {
    backgroundColor: colors.brandPrimary,
    borderRadius: radius.pill,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: spacing.sm,
  },
  saveBtnText: { color: colors.onBrandPrimary, fontWeight: "700" },
  hint: {
    color: colors.onSurfaceTertiary,
    fontSize: typography.sizes.xs,
    marginTop: spacing.sm,
    lineHeight: 16,
  },
  historyList: { marginTop: spacing.md, gap: spacing.xs },
  historyRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 8,
    paddingHorizontal: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  historyDate: { color: colors.onSurfaceSecondary, fontSize: typography.sizes.sm },
  historyValue: { color: colors.onSurface, fontWeight: "700", fontSize: typography.sizes.sm },
  measureGrid: { flexDirection: "row", flexWrap: "wrap", gap: spacing.sm, marginTop: spacing.sm },
  measureField: { width: "47%" },
  measureLabel: {
    color: colors.onSurfaceSecondary,
    fontSize: typography.sizes.xs,
    fontWeight: "600",
    marginBottom: 4,
  },
  measureInputWrap: {},
  measureInput: {
    backgroundColor: colors.surfaceTertiary,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.sm,
    paddingVertical: 10,
    color: colors.onSurface,
    fontSize: typography.sizes.sm,
  },
  measurementHistoryCard: {
    backgroundColor: colors.surfaceTertiary,
    borderRadius: radius.sm,
    padding: spacing.sm,
    marginBottom: spacing.xs,
  },
  measurementHistoryRow: { flexDirection: "row", flexWrap: "wrap", gap: spacing.sm, marginTop: 4 },
  measurementHistoryItem: { color: colors.onSurfaceSecondary, fontSize: 12 },
  deleteHint: {
    color: colors.onSurfaceTertiary,
    fontSize: typography.sizes.xs,
    textAlign: "center",
    marginTop: spacing.sm,
  },
});
