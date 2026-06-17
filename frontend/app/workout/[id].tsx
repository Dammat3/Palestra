import { useCallback, useState } from "react";
import {
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
import { Image } from "expo-image";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import * as Haptics from "expo-haptics";

import { colors, radius, spacing, typography } from "@/src/theme";
import {
  ExerciseEntry,
  Workout,
  deleteWorkout,
  getWorkout,
  saveWorkout,
} from "@/src/storage";
import { AnimatedExerciseImage } from "@/src/components/AnimatedExerciseImage";

export default function WorkoutEditScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const [w, setW] = useState<Workout | null>(null);

  const load = useCallback(async () => {
    if (!id) return;
    const data = await getWorkout(id);
    setW(data);
  }, [id]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  if (!w) {
    return <View style={styles.safe} />;
  }

  const updateName = (name: string) => {
    const nw = { ...w, name };
    setW(nw);
    saveWorkout(nw);
  };

  const updateExercise = (idx: number, patch: Partial<ExerciseEntry>) => {
    const exercises = w.exercises.map((e, i) =>
      i === idx ? { ...e, ...patch } : e,
    );
    const nw = { ...w, exercises };
    setW(nw);
    saveWorkout(nw);
  };

  const removeExercise = (idx: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const exercises = w.exercises.filter((_, i) => i !== idx);
    const nw = { ...w, exercises };
    setW(nw);
    saveWorkout(nw);
  };

  const moveExercise = (idx: number, dir: -1 | 1) => {
    const newIdx = idx + dir;
    if (newIdx < 0 || newIdx >= w.exercises.length) return;
    const exercises = [...w.exercises];
    [exercises[idx], exercises[newIdx]] = [exercises[newIdx], exercises[idx]];
    const nw = { ...w, exercises };
    setW(nw);
    saveWorkout(nw);
  };

  // Toggle superset link with the PREVIOUS exercise.
  const toggleSuperset = (idx: number) => {
    if (idx === 0) return;
    Haptics.selectionAsync();
    const prev = w.exercises[idx - 1];
    const cur = w.exercises[idx];
    const exercises = [...w.exercises];
    if (cur.supersetGroup && cur.supersetGroup === prev.supersetGroup) {
      // unlink: clear current's group (and possibly subsequent ones that shared it)
      const grp = cur.supersetGroup;
      for (let i = idx; i < exercises.length; i++) {
        if (exercises[i].supersetGroup === grp) {
          exercises[i] = { ...exercises[i], supersetGroup: null };
        } else {
          break;
        }
      }
    } else {
      const grp = prev.supersetGroup || `g${Date.now().toString(36)}`;
      exercises[idx - 1] = { ...prev, supersetGroup: grp };
      exercises[idx] = { ...cur, supersetGroup: grp };
    }
    const nw = { ...w, exercises };
    setW(nw);
    saveWorkout(nw);
  };

  const onAddExercise = () => {
    router.push({ pathname: "/picker/exercises", params: { workoutId: w.id } });
  };

  const onStart = () => {
    if (w.exercises.length === 0) return;
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    router.push(`/workout/active/${w.id}` as any);
  };

  const onDelete = async () => {
    await deleteWorkout(w.id);
    router.back();
  };

  return (
    <SafeAreaView style={styles.safe} edges={["top"]} testID="workout-edit-screen">
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={{ flex: 1 }}
      >
        <View style={styles.topBar}>
          <Pressable onPress={() => router.back()} hitSlop={12} testID="back-btn">
            <Ionicons name="chevron-back" size={26} color={colors.onSurface} />
          </Pressable>
          <Text style={styles.topTitle}>Modifica Scheda</Text>
          <Pressable onPress={onDelete} hitSlop={12} testID="delete-workout-btn">
            <Ionicons name="trash-outline" size={22} color={colors.error} />
          </Pressable>
        </View>

        <ScrollView
          contentContainerStyle={{
            padding: spacing.lg,
            paddingBottom: 120 + insets.bottom,
          }}
          keyboardShouldPersistTaps="handled"
        >
          <Text style={styles.label}>Nome scheda</Text>
          <TextInput
            value={w.name}
            onChangeText={updateName}
            placeholder="Es. Petto e Tricipiti"
            placeholderTextColor={colors.onSurfaceTertiary}
            style={styles.nameInput}
            testID="workout-name-input"
          />

          <View style={styles.exHeader}>
            <Text style={styles.sectionTitle}>Esercizi</Text>
            <Text style={styles.sectionCount}>{w.exercises.length}</Text>
          </View>

          {w.exercises.length === 0 ? (
            <Pressable onPress={onAddExercise} style={styles.addFirst} testID="add-first-exercise">
              <Ionicons name="add-circle" size={32} color={colors.brandPrimary} />
              <Text style={styles.addFirstText}>Aggiungi il primo esercizio</Text>
            </Pressable>
          ) : (
            <View style={{ gap: spacing.md }}>
              {w.exercises.map((ex, idx) => {
                const isSuperset =
                  !!ex.supersetGroup &&
                  ((idx > 0 && w.exercises[idx - 1].supersetGroup === ex.supersetGroup) ||
                    (idx < w.exercises.length - 1 &&
                      w.exercises[idx + 1].supersetGroup === ex.supersetGroup));
                const linkedWithPrev =
                  idx > 0 && !!ex.supersetGroup &&
                  w.exercises[idx - 1].supersetGroup === ex.supersetGroup;
                return (
                  <View key={`${ex.exerciseId}-${idx}`}>
                    {linkedWithPrev && (
                      <View style={styles.supersetLink}>
                        <Ionicons name="link" size={12} color={colors.brandPrimary} />
                        <Text style={styles.supersetLinkText}>SUPERSET</Text>
                      </View>
                    )}
                    <ExerciseEditCard
                      ex={ex}
                      isSuperset={isSuperset}
                      onChange={(p) => updateExercise(idx, p)}
                      onRemove={() => removeExercise(idx)}
                      onUp={() => moveExercise(idx, -1)}
                      onDown={() => moveExercise(idx, 1)}
                      onToggleSuperset={idx > 0 ? () => toggleSuperset(idx) : undefined}
                      canUp={idx > 0}
                      canDown={idx < w.exercises.length - 1}
                    />
                  </View>
                );
              })}
              <Pressable
                onPress={onAddExercise}
                style={styles.addMore}
                testID="add-more-exercise"
              >
                <Ionicons name="add" size={18} color={colors.brandPrimary} />
                <Text style={styles.addMoreText}>Aggiungi Esercizio</Text>
              </Pressable>
            </View>
          )}
        </ScrollView>

        <View style={[styles.startBar, { paddingBottom: 16 + insets.bottom }]}>
          <Pressable
            onPress={onStart}
            disabled={w.exercises.length === 0}
            style={[
              styles.startBtn,
              w.exercises.length === 0 && { opacity: 0.4 },
            ]}
            testID="start-workout-btn"
          >
            <Ionicons name="play" size={20} color={colors.onBrandPrimary} />
            <Text style={styles.startText}>Inizia Allenamento</Text>
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function ExerciseEditCard({
  ex,
  isSuperset,
  onChange,
  onRemove,
  onUp,
  onDown,
  onToggleSuperset,
  canUp,
  canDown,
}: {
  ex: ExerciseEntry;
  isSuperset?: boolean;
  onChange: (p: Partial<ExerciseEntry>) => void;
  onRemove: () => void;
  onUp: () => void;
  onDown: () => void;
  onToggleSuperset?: () => void;
  canUp: boolean;
  canDown: boolean;
}) {
  const num = (v: string) => {
    const n = parseFloat(v.replace(",", "."));
    return Number.isFinite(n) ? n : 0;
  };
  return (
    <View style={[styles.exCard, isSuperset && styles.exCardSuperset]}>
      <View style={styles.exCardTop}>
        <View style={styles.exThumb}>
          {ex.images && ex.images.length > 0 ? (
            <AnimatedExerciseImage
              images={ex.images}
              style={{ width: "100%", height: "100%" }}
              contentFit="cover"
            />
          ) : ex.image ? (
            <Image source={{ uri: ex.image }} style={{ width: "100%", height: "100%" }} contentFit="cover" />
          ) : (
            <Ionicons name="barbell" size={20} color={colors.onSurfaceTertiary} />
          )}
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.exName} numberOfLines={2}>{ex.exerciseName}</Text>
          <Text style={styles.exMuscle}>{ex.muscleGroup}</Text>
        </View>
        <View style={styles.exActions}>
          {onToggleSuperset && (
            <Pressable
              onPress={onToggleSuperset}
              hitSlop={6}
              testID={`toggle-superset-${ex.exerciseId}`}
            >
              <Ionicons
                name={isSuperset ? "link" : "link-outline"}
                size={18}
                color={isSuperset ? colors.brandPrimary : colors.onSurfaceSecondary}
              />
            </Pressable>
          )}
          <Pressable
            onPress={onUp}
            disabled={!canUp}
            hitSlop={6}
            style={{ opacity: canUp ? 1 : 0.3 }}
          >
            <Ionicons name="chevron-up" size={18} color={colors.onSurfaceSecondary} />
          </Pressable>
          <Pressable
            onPress={onDown}
            disabled={!canDown}
            hitSlop={6}
            style={{ opacity: canDown ? 1 : 0.3 }}
          >
            <Ionicons name="chevron-down" size={18} color={colors.onSurfaceSecondary} />
          </Pressable>
          <Pressable onPress={onRemove} hitSlop={6}>
            <Ionicons name="close" size={18} color={colors.error} />
          </Pressable>
        </View>
      </View>

      <View style={styles.fieldRow}>
        <Field
          label="Serie"
          value={String(ex.targetSets)}
          onChange={(v) => onChange({ targetSets: Math.max(1, Math.round(num(v))) })}
          testID={`field-sets-${ex.exerciseId}`}
        />
        <Field
          label="Ripetizioni"
          value={String(ex.targetReps)}
          onChange={(v) => onChange({ targetReps: Math.max(0, Math.round(num(v))) })}
          testID={`field-reps-${ex.exerciseId}`}
        />
        <Field
          label="Peso (kg)"
          value={String(ex.targetWeight)}
          onChange={(v) => onChange({ targetWeight: Math.max(0, num(v)) })}
          testID={`field-weight-${ex.exerciseId}`}
        />
        <Field
          label="Pausa (s)"
          value={String(ex.restSeconds)}
          onChange={(v) => onChange({ restSeconds: Math.max(10, Math.round(num(v))) })}
          testID={`field-rest-${ex.exerciseId}`}
        />
      </View>
    </View>
  );
}

function Field({
  label,
  value,
  onChange,
  testID,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  testID?: string;
}) {
  return (
    <View style={styles.field}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <TextInput
        value={value}
        onChangeText={onChange}
        keyboardType="decimal-pad"
        selectTextOnFocus
        style={styles.fieldInput}
        testID={testID}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.surface },
  topBar: {
    height: 48,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.lg,
  },
  topTitle: { color: colors.onSurface, fontSize: typography.sizes.lg, fontWeight: "700" },
  label: { color: colors.onSurfaceSecondary, fontSize: typography.sizes.sm, marginBottom: spacing.xs, textTransform: "uppercase", letterSpacing: 0.5 },
  nameInput: {
    backgroundColor: colors.surfaceSecondary,
    color: colors.onSurface,
    fontSize: typography.sizes.xl,
    fontWeight: "700",
    padding: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  exHeader: {
    flexDirection: "row",
    alignItems: "baseline",
    justifyContent: "space-between",
    marginTop: spacing.xl,
    marginBottom: spacing.md,
  },
  sectionTitle: { color: colors.onSurface, fontSize: typography.sizes.xl, fontWeight: "700" },
  sectionCount: { color: colors.brandPrimary, fontWeight: "800", fontSize: typography.sizes.lg },
  addFirst: {
    backgroundColor: colors.surfaceSecondary,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    borderStyle: "dashed",
    paddingVertical: spacing.xxl,
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
  },
  addFirstText: { color: colors.onSurface, fontWeight: "600" },
  addMore: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.xs,
    paddingVertical: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.brandPrimary,
    borderStyle: "dashed",
  },
  addMoreText: { color: colors.brandPrimary, fontWeight: "700" },
  exCard: {
    backgroundColor: colors.surfaceSecondary,
    borderRadius: radius.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    gap: spacing.md,
  },
  exCardSuperset: { borderColor: colors.brandPrimary },
  supersetLink: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    alignSelf: "center",
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    backgroundColor: colors.brandTertiary,
    borderRadius: radius.sm,
    marginBottom: -spacing.xs,
    marginTop: -spacing.xs,
  },
  supersetLinkText: { color: colors.brandPrimary, fontWeight: "800", fontSize: 10, letterSpacing: 1 },
  exCardTop: { flexDirection: "row", alignItems: "center", gap: spacing.md },
  exThumb: {
    width: 48,
    height: 48,
    borderRadius: radius.sm,
    backgroundColor: colors.surfaceTertiary,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  exName: { color: colors.onSurface, fontWeight: "700", fontSize: typography.sizes.base },
  exMuscle: { color: colors.onSurfaceSecondary, fontSize: typography.sizes.sm, marginTop: 2 },
  exActions: { flexDirection: "row", alignItems: "center", gap: spacing.md },
  fieldRow: { flexDirection: "row", gap: spacing.sm },
  field: { flex: 1 },
  fieldLabel: { color: colors.onSurfaceSecondary, fontSize: 10, fontWeight: "600", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 4 },
  fieldInput: {
    backgroundColor: colors.surface,
    borderRadius: radius.sm,
    paddingVertical: 10,
    textAlign: "center",
    color: colors.onSurface,
    fontWeight: "700",
    fontSize: typography.sizes.base,
    borderWidth: 1,
    borderColor: colors.border,
  },
  startBar: { position: "absolute", left: 0, right: 0, bottom: 0, paddingHorizontal: spacing.lg, paddingTop: spacing.md, backgroundColor: colors.surface, borderTopWidth: 0.5, borderTopColor: colors.border },
  startBtn: {
    backgroundColor: colors.brandPrimary,
    borderRadius: radius.pill,
    paddingVertical: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
  },
  startText: { color: colors.onBrandPrimary, fontWeight: "800", fontSize: typography.sizes.base, letterSpacing: 0.3 },
});
