import { useEffect, useMemo, useRef, useState } from "react";
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
import { useLocalSearchParams, useRouter } from "expo-router";
import * as Haptics from "expo-haptics";
import { useAudioPlayer, setAudioModeAsync } from "expo-audio";

const countdownBeep = require("@/assets/sounds/countdown_beep.wav");
const restCompleteChime = require("@/assets/sounds/rest_complete.wav");

import { colors, radius, spacing, typography } from "@/src/theme";
import {
  HistoryEntry,
  SessionExerciseLog,
  SetLog,
  Workout,
  getWorkout,
  saveHistory,
  uid,
} from "@/src/storage";
import { AnimatedExerciseImage } from "@/src/components/AnimatedExerciseImage";

function fmtSec(total: number) {
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

type RestState = {
  active: boolean;
  remaining: number;
  total: number;
  label: string;
};

export default function ActiveWorkoutScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [w, setW] = useState<Workout | null>(null);
  const [logs, setLogs] = useState<SessionExerciseLog[]>([]);
  const [elapsed, setElapsed] = useState(0);
  const [rest, setRest] = useState<RestState>({ active: false, remaining: 0, total: 0, label: "" });
  const [confirmEnd, setConfirmEnd] = useState(false);
  const startTimeRef = useRef<number>(Date.now());
  const beepPlayer = useAudioPlayer(countdownBeep);
  const chimePlayer = useAudioPlayer(restCompleteChime);

  useEffect(() => {
    if (!id) return;
    getWorkout(id).then((data) => {
      if (!data) return;
      setW(data);
      setLogs(
        data.exercises.map<SessionExerciseLog>((e) => ({
          exerciseId: e.exerciseId,
          exerciseName: e.exerciseName,
          muscleGroup: e.muscleGroup,
          sets: Array.from({ length: e.targetSets }, () => ({
            reps: e.targetReps,
            weight: e.targetWeight,
            done: false,
          })),
        })),
      );
    });
  }, [id]);

  // Elapsed timer
  useEffect(() => {
    setAudioModeAsync({ playsInSilentMode: true });
    const i = setInterval(() => {
      setElapsed(Math.floor((Date.now() - startTimeRef.current) / 1000));
    }, 1000);
    return () => clearInterval(i);
  }, []);

  // Rest countdown
  useEffect(() => {
    if (!rest.active) return;
    const i = setInterval(() => {
      setRest((r) => {
        if (!r.active) return r;
        if (r.remaining <= 1) {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          chimePlayer.seekTo(0);
          chimePlayer.play();
          return { ...r, active: false, remaining: 0 };
        }
        if (r.remaining <= 4 && r.remaining > 1) {
          Haptics.selectionAsync();
          beepPlayer.seekTo(0);
          beepPlayer.play();
        }
        return { ...r, remaining: r.remaining - 1 };
      });
    }, 1000);
    return () => clearInterval(i);
  }, [rest.active]);

  const totals = useMemo(() => {
    let vol = 0,
      setsDone = 0,
      setsTotal = 0;
    for (const ex of logs) {
      for (const s of ex.sets) {
        setsTotal++;
        if (s.done) {
          setsDone++;
          vol += s.reps * s.weight;
        }
      }
    }
    return { vol, setsDone, setsTotal };
  }, [logs]);

  if (!w) return <View style={styles.safe} />;

  const updateSet = (exIdx: number, setIdx: number, patch: Partial<SetLog>) => {
    setLogs((ls) =>
      ls.map((ex, i) =>
        i !== exIdx
          ? ex
          : { ...ex, sets: ex.sets.map((s, j) => (j === setIdx ? { ...s, ...patch } : s)) },
      ),
    );
  };

  const addSet = (exIdx: number) => {
    setLogs((ls) =>
      ls.map((ex, i) => {
        if (i !== exIdx) return ex;
        const last = ex.sets[ex.sets.length - 1];
        return {
          ...ex,
          sets: [...ex.sets, { reps: last?.reps || 0, weight: last?.weight || 0, done: false }],
        };
      }),
    );
  };

  const completeSet = (exIdx: number, setIdx: number) => {
    const set = logs[exIdx].sets[setIdx];
    const wasDone = set.done;
    updateSet(exIdx, setIdx, { done: !wasDone });
    if (!wasDone) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      const ex = w.exercises[exIdx];
      const isLastSetOfEx = setIdx === logs[exIdx].sets.length - 1;

      // Superset behavior: if this exercise is part of a superset group,
      // don't rest between exercises in the same set round. Rest only after
      // the LAST exercise of the group has completed this set index.
      const grp = ex.supersetGroup;
      if (grp) {
        const groupIndices = w.exercises
          .map((e, i) => (e.supersetGroup === grp ? i : -1))
          .filter((i) => i >= 0);
        const isLastInGroup = exIdx === groupIndices[groupIndices.length - 1];
        if (!isLastInGroup) {
          // Don't start a rest; user moves to next exercise in superset.
          return;
        }
        // Use ~half-rest after a full superset round (or the exercise rest)
        const restSec = isLastSetOfEx ? w.exerciseRestSeconds : ex.restSeconds;
        setRest({
          active: true,
          remaining: restSec,
          total: restSec,
          label: isLastSetOfEx ? "Pausa Superset" : "Pausa Giro Superset",
        });
        return;
      }

      const restSec = isLastSetOfEx ? w.exerciseRestSeconds : ex.restSeconds;
      const label = isLastSetOfEx ? "Pausa Esercizio" : "Pausa Serie";
      setRest({ active: true, remaining: restSec, total: restSec, label });
    }
  };

  const skipRest = () => {
    setRest((r) => ({ ...r, active: false, remaining: 0 }));
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const addTime = (sec: number) => {
    setRest((r) => ({ ...r, remaining: Math.max(0, r.remaining + sec) }));
    Haptics.selectionAsync();
  };

  const finishWorkout = async () => {
    const finishedAt = new Date().toISOString();
    const durationSec = Math.floor((Date.now() - startTimeRef.current) / 1000);
    const entry: HistoryEntry = {
      id: uid(),
      workoutId: w.id,
      workoutName: w.name,
      startedAt: new Date(startTimeRef.current).toISOString(),
      finishedAt,
      durationSec,
      totalVolume: totals.vol,
      totalSets: totals.setsDone,
      exercises: logs,
    };
    await saveHistory(entry);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    router.replace("/(tabs)/history" as any);
  };

  return (
    <SafeAreaView style={styles.safe} edges={["top"]} testID="active-workout-screen">
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={{ flex: 1 }}
      >
        <View style={styles.topBar}>
          <Pressable onPress={() => setConfirmEnd(true)} hitSlop={12} testID="end-workout-btn">
            <Text style={styles.endText}>Termina</Text>
          </Pressable>
          <View style={styles.timer}>
            <Ionicons name="time-outline" size={14} color={colors.onSurfaceSecondary} />
            <Text style={styles.timerText}>{fmtSec(elapsed)}</Text>
          </View>
          <View style={styles.statsTop}>
            <Text style={styles.statsTopVal}>{totals.setsDone}/{totals.setsTotal}</Text>
            <Text style={styles.statsTopLab}>SERIE</Text>
          </View>
        </View>

        <View style={styles.progress}>
          <View
            style={[
              styles.progressFill,
              { width: `${totals.setsTotal ? (totals.setsDone / totals.setsTotal) * 100 : 0}%` },
            ]}
          />
        </View>

        <Text style={styles.workoutName}>{w.name}</Text>

        <ScrollView
          contentContainerStyle={{
            paddingHorizontal: spacing.lg,
            paddingTop: spacing.md,
            paddingBottom: 240 + insets.bottom,
          }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {logs.map((ex, exIdx) => {
            const meta = w.exercises[exIdx];
            const isSuperset = !!meta?.supersetGroup;
            const isFirstOfGroup =
              isSuperset &&
              (exIdx === 0 || w.exercises[exIdx - 1].supersetGroup !== meta?.supersetGroup);
            return (
              <View key={exIdx} style={{ marginBottom: spacing.md }} testID={`active-ex-${exIdx}`}>
                {isFirstOfGroup && (
                  <View style={styles.supersetBadge}>
                    <Ionicons name="link" size={12} color={colors.brandPrimary} />
                    <Text style={styles.supersetBadgeText}>SUPERSET</Text>
                  </View>
                )}
                <View style={[styles.exBlock, isSuperset && styles.exBlockSuperset]}>
                  <View style={styles.exHead}>
                    {meta?.images && meta.images.length > 0 ? (
                      <AnimatedExerciseImage
                        images={meta.images}
                        style={styles.exImg}
                        contentFit="cover"
                      />
                    ) : meta?.image ? (
                      <Image source={{ uri: meta.image }} style={styles.exImg} contentFit="cover" />
                    ) : (
                      <View style={[styles.exImg, { alignItems: "center", justifyContent: "center" }]}>
                        <Ionicons name="barbell" size={18} color={colors.onSurfaceTertiary} />
                      </View>
                    )}
                    <View style={{ flex: 1 }}>
                      <Text style={styles.exTitle}>{ex.exerciseName}</Text>
                      <Text style={styles.exSub}>
                        {ex.muscleGroup} · {meta?.targetSets || ex.sets.length}x{meta?.targetReps || "?"} · Pausa {meta?.restSeconds}s
                      </Text>
                    </View>
                  </View>

                <View style={styles.setHeader}>
                  <Text style={[styles.setHeaderText, { width: 28 }]}>#</Text>
                  <Text style={[styles.setHeaderText, { flex: 1 }]}>RIP</Text>
                  <Text style={[styles.setHeaderText, { flex: 1 }]}>KG</Text>
                  <Text style={[styles.setHeaderText, { width: 44, textAlign: "right" }]}>OK</Text>
                </View>

                {ex.sets.map((s, sIdx) => (
                  <View
                    key={sIdx}
                    style={[styles.setRow, s.done && styles.setRowDone]}
                  >
                    <Text style={styles.setIdx}>{sIdx + 1}</Text>
                    <TextInput
                      value={String(s.reps)}
                      onChangeText={(v) =>
                        updateSet(exIdx, sIdx, { reps: parseInt(v) || 0 })
                      }
                      keyboardType="number-pad"
                      selectTextOnFocus
                      style={styles.setInput}
                      testID={`set-reps-${exIdx}-${sIdx}`}
                    />
                    <TextInput
                      value={String(s.weight)}
                      onChangeText={(v) =>
                        updateSet(exIdx, sIdx, { weight: parseFloat(v.replace(",", ".")) || 0 })
                      }
                      keyboardType="decimal-pad"
                      selectTextOnFocus
                      style={styles.setInput}
                      testID={`set-weight-${exIdx}-${sIdx}`}
                    />
                    <Pressable
                      onPress={() => completeSet(exIdx, sIdx)}
                      style={[styles.checkBtn, s.done && styles.checkBtnDone]}
                      testID={`set-check-${exIdx}-${sIdx}`}
                    >
                      <Ionicons
                        name={s.done ? "checkmark" : "ellipse-outline"}
                        size={22}
                        color={s.done ? colors.onBrandPrimary : colors.onSurfaceTertiary}
                      />
                    </Pressable>
                  </View>
                ))}

                <Pressable
                  onPress={() => addSet(exIdx)}
                  style={styles.addSetBtn}
                  testID={`add-set-${exIdx}`}
                >
                  <Ionicons name="add" size={16} color={colors.brandPrimary} />
                  <Text style={styles.addSetText}>Aggiungi serie</Text>
                </Pressable>
              </View>
              </View>
            );
          })}
        </ScrollView>

        {rest.active && (
          <View
            style={[styles.restPanel, { paddingBottom: 16 + insets.bottom }]}
            testID="rest-timer-panel"
          >
            <View style={styles.restHead}>
              <Text style={styles.restLabel}>{rest.label}</Text>
              <Pressable onPress={skipRest} hitSlop={10}>
                <Text style={styles.restSkip}>Salta</Text>
              </Pressable>
            </View>
            <Text style={styles.restTime} testID="rest-time-display">
              {fmtSec(rest.remaining)}
            </Text>
            <View style={styles.restBar}>
              <View
                style={[
                  styles.restBarFill,
                  { width: `${(rest.remaining / rest.total) * 100}%` },
                ]}
              />
            </View>
            <View style={styles.restActions}>
              <Pressable onPress={() => addTime(-15)} style={styles.restBtn}>
                <Ionicons name="remove" size={18} color={colors.onSurface} />
                <Text style={styles.restBtnText}>15s</Text>
              </Pressable>
              <Pressable onPress={() => addTime(15)} style={styles.restBtn}>
                <Ionicons name="add" size={18} color={colors.onSurface} />
                <Text style={styles.restBtnText}>15s</Text>
              </Pressable>
              <Pressable onPress={skipRest} style={[styles.restBtn, styles.restBtnPrimary]} testID="rest-done-btn">
                <Ionicons name="checkmark" size={18} color={colors.onBrandPrimary} />
                <Text style={[styles.restBtnText, { color: colors.onBrandPrimary }]}>Fatto</Text>
              </Pressable>
            </View>
          </View>
        )}

        {confirmEnd && (
          <View style={styles.modalBackdrop}>
            <View style={styles.modal}>
              <Text style={styles.modalTitle}>Terminare l&apos;allenamento?</Text>
              <Text style={styles.modalText}>
                Verrà salvato nello storico con {totals.setsDone} serie completate.
              </Text>
              <View style={styles.modalActions}>
                <Pressable
                  onPress={() => setConfirmEnd(false)}
                  style={[styles.modalBtn, styles.modalBtnSecondary]}
                  testID="cancel-end-btn"
                >
                  <Text style={styles.modalBtnText}>Continua</Text>
                </Pressable>
                <Pressable
                  onPress={finishWorkout}
                  style={[styles.modalBtn, styles.modalBtnPrimary]}
                  testID="confirm-end-btn"
                >
                  <Text style={[styles.modalBtnText, { color: colors.onBrandPrimary }]}>
                    Salva e termina
                  </Text>
                </Pressable>
              </View>
            </View>
          </View>
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.surface },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.lg,
    height: 48,
  },
  endText: { color: colors.error, fontWeight: "700", fontSize: typography.sizes.base },
  timer: { flexDirection: "row", alignItems: "center", gap: 4 },
  timerText: { color: colors.onSurface, fontWeight: "700", fontSize: typography.sizes.base, letterSpacing: 1 },
  statsTop: { alignItems: "flex-end" },
  statsTopVal: { color: colors.brandPrimary, fontWeight: "800", fontSize: typography.sizes.base },
  statsTopLab: { color: colors.onSurfaceTertiary, fontSize: 9, fontWeight: "700", letterSpacing: 0.5 },
  progress: { height: 3, backgroundColor: colors.surfaceTertiary, marginHorizontal: spacing.lg, borderRadius: 2, overflow: "hidden" },
  progressFill: { height: "100%", backgroundColor: colors.brandPrimary },
  workoutName: {
    color: colors.onSurface,
    fontSize: typography.sizes.xxl,
    fontWeight: "800",
    letterSpacing: -0.5,
    paddingHorizontal: spacing.lg,
    marginTop: spacing.md,
  },
  exBlock: { backgroundColor: colors.surfaceSecondary, borderRadius: radius.md, padding: spacing.md, borderWidth: 1, borderColor: colors.border },
  exBlockSuperset: { borderColor: colors.brandPrimary },
  supersetBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    alignSelf: "flex-start",
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    backgroundColor: colors.brandTertiary,
    borderRadius: radius.sm,
    marginBottom: spacing.xs,
  },
  supersetBadgeText: { color: colors.brandPrimary, fontWeight: "800", fontSize: 10, letterSpacing: 1 },
  exHead: { flexDirection: "row", alignItems: "center", gap: spacing.md, marginBottom: spacing.md },
  exImg: { width: 44, height: 44, borderRadius: radius.sm, backgroundColor: colors.surfaceTertiary, overflow: "hidden" },
  exTitle: { color: colors.onSurface, fontWeight: "700", fontSize: typography.sizes.base },
  exSub: { color: colors.onSurfaceSecondary, fontSize: typography.sizes.sm, marginTop: 2 },
  setHeader: { flexDirection: "row", paddingHorizontal: spacing.sm, paddingBottom: spacing.xs, gap: spacing.sm },
  setHeaderText: { color: colors.onSurfaceTertiary, fontSize: 10, fontWeight: "700", letterSpacing: 0.8 },
  setRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 6,
    paddingHorizontal: spacing.sm,
    gap: spacing.sm,
    borderRadius: radius.sm,
  },
  setRowDone: { backgroundColor: colors.brandTertiary },
  setIdx: { width: 28, color: colors.onSurfaceSecondary, fontWeight: "700", textAlign: "center" },
  setInput: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: radius.sm,
    paddingVertical: 10,
    textAlign: "center",
    color: colors.onSurface,
    fontWeight: "700",
    fontSize: typography.sizes.lg,
    borderWidth: 1,
    borderColor: colors.border,
    minHeight: 44,
  },
  checkBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1.5,
    borderColor: colors.borderStrong,
  },
  checkBtnDone: { backgroundColor: colors.brandPrimary, borderColor: colors.brandPrimary },
  addSetBtn: {
    marginTop: spacing.sm,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
    paddingVertical: 10,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.border,
    borderStyle: "dashed",
  },
  addSetText: { color: colors.brandPrimary, fontWeight: "700", fontSize: typography.sizes.sm },
  restPanel: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: colors.surfaceSecondary,
    borderTopWidth: 1,
    borderTopColor: colors.brandPrimary,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    gap: spacing.sm,
  },
  restHead: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  restLabel: { color: colors.brandPrimary, fontWeight: "800", fontSize: typography.sizes.sm, letterSpacing: 1, textTransform: "uppercase" },
  restSkip: { color: colors.onSurfaceSecondary, fontWeight: "600" },
  restTime: { color: colors.onSurface, fontSize: 64, fontWeight: "800", letterSpacing: -2, fontVariant: ["tabular-nums"], textAlign: "center" },
  restBar: { height: 4, backgroundColor: colors.surfaceTertiary, borderRadius: 2, overflow: "hidden" },
  restBarFill: { height: "100%", backgroundColor: colors.brandPrimary },
  restActions: { flexDirection: "row", gap: spacing.sm, marginTop: spacing.sm },
  restBtn: {
    flex: 1,
    backgroundColor: colors.surfaceTertiary,
    borderRadius: radius.pill,
    paddingVertical: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
  },
  restBtnPrimary: { backgroundColor: colors.brandPrimary },
  restBtnText: { color: colors.onSurface, fontWeight: "700" },
  modalBackdrop: { position: "absolute", inset: 0 as any, top: 0, bottom: 0, left: 0, right: 0, backgroundColor: "rgba(0,0,0,0.7)", alignItems: "center", justifyContent: "center", padding: spacing.lg },
  modal: { width: "100%", backgroundColor: colors.surfaceSecondary, borderRadius: radius.lg, padding: spacing.lg, borderWidth: 1, borderColor: colors.border },
  modalTitle: { color: colors.onSurface, fontWeight: "800", fontSize: typography.sizes.xl, marginBottom: spacing.sm },
  modalText: { color: colors.onSurfaceSecondary, fontSize: typography.sizes.base, marginBottom: spacing.lg, lineHeight: 22 },
  modalActions: { flexDirection: "row", gap: spacing.sm },
  modalBtn: { flex: 1, paddingVertical: 14, borderRadius: radius.pill, alignItems: "center" },
  modalBtnSecondary: { backgroundColor: colors.surfaceTertiary },
  modalBtnPrimary: { backgroundColor: colors.brandPrimary },
  modalBtnText: { color: colors.onSurface, fontWeight: "700" },
});
