import { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
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
import { useRouter } from "expo-router";

import { colors, radius, spacing, typography } from "@/src/theme";
import {
  ExerciseListItem,
  MuscleGroup,
  fetchExercises,
  fetchGroups,
} from "@/src/api";

export default function LibraryScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [groups, setGroups] = useState<MuscleGroup[]>([]);
  const [muscle, setMuscle] = useState("all");
  const [query, setQuery] = useState("");
  const [items, setItems] = useState<ExerciseListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchGroups()
      .then(setGroups)
      .catch(() => setGroups([]));
  }, []);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    fetchExercises({ muscle })
      .then((d) => !cancelled && setItems(d))
      .catch((e) => !cancelled && setError(e.message))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [muscle]);

  const filtered = useMemo(() => {
    if (!query.trim()) return items;
    const q = query.toLowerCase();
    return items.filter(
      (e) =>
        e.name.toLowerCase().includes(q) ||
        e.muscle_group.toLowerCase().includes(q) ||
        e.equipment.toLowerCase().includes(q),
    );
  }, [items, query]);

  return (
    <SafeAreaView style={styles.safe} edges={["top"]} testID="library-screen">
      <View style={styles.header}>
        <Text style={styles.title}>Libreria</Text>
        <Text style={styles.subtitle}>{items.length} esercizi disponibili</Text>
      </View>

      <View style={styles.searchWrap}>
        <Ionicons name="search" size={18} color={colors.onSurfaceTertiary} />
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder="Cerca esercizio..."
          placeholderTextColor={colors.onSurfaceTertiary}
          style={styles.searchInput}
          autoCorrect={false}
          testID="library-search-input"
        />
        {query.length > 0 && (
          <Pressable onPress={() => setQuery("")}>
            <Ionicons name="close-circle" size={18} color={colors.onSurfaceTertiary} />
          </Pressable>
        )}
      </View>

      <View style={styles.chipsRow}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: spacing.lg, gap: spacing.sm }}
        >
          {groups.map((g) => {
            const active = muscle === g.id;
            return (
              <Pressable
                key={g.id}
                onPress={() => setMuscle(g.id)}
                style={[styles.chip, active && styles.chipActive]}
                testID={`muscle-chip-${g.id}`}
              >
                <Text style={[styles.chipText, active && styles.chipTextActive]}>
                  {g.name}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>
      </View>

      {loading ? (
        <View style={styles.loadingWrap}>
          <ActivityIndicator color={colors.brandPrimary} />
          <Text style={styles.loadingText}>Caricamento esercizi...</Text>
        </View>
      ) : error ? (
        <View style={styles.loadingWrap}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(it) => it.id}
          contentContainerStyle={{
            paddingHorizontal: spacing.lg,
            paddingTop: spacing.md,
            paddingBottom: spacing.xxl + insets.bottom,
          }}
          ItemSeparatorComponent={() => <View style={{ height: spacing.sm }} />}
          ListEmptyComponent={
            <Text style={styles.empty}>Nessun esercizio trovato</Text>
          }
          renderItem={({ item }) => (
            <ExerciseRow
              item={item}
              onPress={() => router.push(`/exercise/${item.id}` as any)}
            />
          )}
        />
      )}
    </SafeAreaView>
  );
}

export function ExerciseRow({
  item,
  onPress,
}: {
  item: ExerciseListItem;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.row, pressed && { opacity: 0.8 }]}
      testID={`exercise-row-${item.id}`}
    >
      <View style={styles.thumb}>
        {item.image ? (
          <Image
            source={{ uri: item.image }}
            style={{ width: "100%", height: "100%" }}
            contentFit="cover"
            transition={200}
          />
        ) : (
          <Ionicons name="barbell" size={20} color={colors.onSurfaceTertiary} />
        )}
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.rowTitle} numberOfLines={1}>{item.name}</Text>
        <Text style={styles.rowMeta} numberOfLines={1}>
          {item.muscle_group} · {item.equipment}
        </Text>
      </View>
      <Ionicons name="chevron-forward" size={18} color={colors.onSurfaceTertiary} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.surface },
  header: { paddingHorizontal: spacing.lg, paddingTop: spacing.md },
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
  searchWrap: {
    marginTop: spacing.lg,
    marginHorizontal: spacing.lg,
    backgroundColor: colors.surfaceSecondary,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    height: 44,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  searchInput: {
    flex: 1,
    color: colors.onSurface,
    fontSize: typography.sizes.base,
  },
  chipsRow: { height: 56, alignItems: "center" },
  chip: {
    height: 36,
    paddingHorizontal: spacing.md,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surfaceSecondary,
    justifyContent: "center",
    flexShrink: 0,
  },
  chipActive: {
    backgroundColor: colors.brandPrimary,
    borderColor: colors.brandPrimary,
  },
  chipText: { color: colors.onSurfaceSecondary, fontWeight: "600", fontSize: 13 },
  chipTextActive: { color: colors.onBrandPrimary },
  row: {
    backgroundColor: colors.surfaceSecondary,
    borderRadius: radius.md,
    padding: spacing.sm,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  thumb: {
    width: 56,
    height: 56,
    borderRadius: radius.sm,
    backgroundColor: colors.surfaceTertiary,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  rowTitle: {
    color: colors.onSurface,
    fontSize: typography.sizes.base,
    fontWeight: "600",
  },
  rowMeta: {
    color: colors.onSurfaceSecondary,
    fontSize: typography.sizes.sm,
    marginTop: 2,
  },
  loadingWrap: { flex: 1, alignItems: "center", justifyContent: "center", gap: spacing.sm },
  loadingText: { color: colors.onSurfaceSecondary, fontSize: typography.sizes.sm },
  errorText: { color: colors.error, fontSize: typography.sizes.base },
  empty: {
    color: colors.onSurfaceSecondary,
    textAlign: "center",
    paddingVertical: spacing.xxl,
  },
});
