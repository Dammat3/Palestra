/**
 * Redirect helper: creates a new draft workout and replaces with /workout/[id].
 */
import { useEffect } from "react";
import { ActivityIndicator, StyleSheet, View } from "react-native";
import { useRouter } from "expo-router";

import { colors } from "@/src/theme";
import { Workout, getPrefs, saveWorkout, uid } from "@/src/storage";

export default function NewWorkoutScreen() {
  const router = useRouter();

  useEffect(() => {
    (async () => {
      const id = uid();
      const prefs = await getPrefs();
      const w: Workout = {
        id,
        name: "Nuova Scheda",
        createdAt: new Date().toISOString(),
        exercises: [],
        exerciseRestSeconds: prefs.defaultRestExerciseSec,
      };
      await saveWorkout(w);
      router.replace(`/workout/${id}` as any);
    })();
  }, [router]);

  return (
    <View style={styles.wrap}>
      <ActivityIndicator color={colors.brandPrimary} />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.surface,
  },
});
