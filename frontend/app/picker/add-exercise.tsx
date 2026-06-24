import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import * as Haptics from "expo-haptics";

import { colors, radius, spacing, typography } from "@/src/theme";
import { fetchGroups, MuscleGroup } from "@/src/api";
import { saveCustomExercise, isCustomExerciseIdTaken, uid } from "@/src/storage";
import {
  RemoteSearchResult,
  searchRemoteExercises,
  importRemoteExercise,
} from "@/src/exerciseImport";

const EQUIPMENT_OPTIONS = [
  "Corpo libero",
  "Manubri",
  "Bilanciere",
  "Bilanciere EZ",
  "Kettlebell",
  "Macchina",
  "Cavi",
  "Elastici",
  "Sbarra",
  "Altro",
];

const LEVEL_OPTIONS = ["Principiante", "Intermedio", "Avanzato"];

export default function AddExerciseScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [mode, setMode] = useState<"search" | "manual">("search");

  // ---- Search mode state ----
  const [query, setQuery] = useState("");
  const [searching, setSearching] = useState(false);
  const [results, setResults] = useState<RemoteSearchResult[]>([]);
  const [searched, setSearched] = useState(false);
  const [importingId, setImportingId] = useState<string | null>(null);
  const [searchError, setSearchError] = useState<string | null>(null);

  // ---- Manual mode state ----
  const [groups, setGroups] = useState<MuscleGroup[]>([]);
  const [name, setName] = useState("");
  const [muscleGroup, setMuscleGroup] = useState<string>("");
  const [equipment, setEquipment] = useState("Corpo libero");
  const [level, setLevel] = useState("Intermedio");
  const [instructions, setInstructions] = useState("");
  const [tips, setTips] = useState("");
  const [saving, setSaving] = useState(false);

  const openManual = () => {
    if (groups.length === 0) {
      fetchGroups().then((g) => setGroups(g.filter((x) => x.id !== "all")));
    }
    if (query.trim() && !name) setName(query.trim());
    setMode("manual");
  };

  const runSearch = async () => {
    const q = query.trim();
    if (!q) return;
    setSearching(true);
    setSearchError(null);
    Haptics.selectionAsync();
    try {
      const r = await searchRemoteExercises(q);
      setResults(r);
      setSearched(true);
    } catch {
      setSearchError(
        "Impossibile contattare il database online. Controlla la connessione internet e riprova, oppure inserisci l'esercizio a mano.",
      );
      setResults([]);
      setSearched(true);
    } finally {
      setSearching(false);
    }
  };

  const importOne = async (r: RemoteSearchResult) => {
    setImportingId(r.remoteId);
    try {
      const exercise = await importRemoteExercise(r.remoteId);
      // Avoid id collisions if the same exercise was already imported before
      let finalId = exercise.id;
      if (await isCustomExerciseIdTaken(finalId)) {
        finalId = `${exercise.id}-${uid()}`;
      }
      await saveCustomExercise({ ...exercise, id: finalId });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert("Importato", `"${r.name}" è stato aggiunto alla tua libreria.`, [
        { text: "OK", onPress: () => router.back() },
      ]);
    } catch (e) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert("Errore", "Non è stato possibile importare questo esercizio.");
    } finally {
      setImportingId(null);
    }
  };

  const saveManual = async () => {
    if (!name.trim() || !muscleGroup) {
      Alert.alert("Dati incompleti", "Inserisci almeno nome e gruppo muscolare.");
      return;
    }
    setSaving(true);
    try {
      const parsedInstructions = instructions
        .split("\n")
        .map((s) => s.trim())
        .filter(Boolean);
      await saveCustomExercise({
        id: `manual-${uid()}`,
        name: name.trim(),
        category: "Forza",
        muscle_group: muscleGroup,
        secondary_muscles: [],
        equipment,
        level,
        instructions: parsedInstructions.length > 0 ? parsedInstructions : ["Nessuna istruzione inserita."],
        tips: tips.trim() || "Nessun consiglio aggiunto.",
        images: [],
        source: "manual",
        createdAt: new Date().toISOString(),
      });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert("Salvato", `"${name.trim()}" è stato aggiunto alla tua libreria.`, [
        { text: "OK", onPress: () => router.back() },
      ]);
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={["top"]} testID="add-exercise-screen">
      <View style={styles.topBar}>
        <Pressable onPress={() => router.back()} hitSlop={12}>
          <Ionicons name="close" size={26} color={colors.onSurface} />
        </Pressable>
        <Text style={styles.topTitle}>Nuovo Esercizio</Text>
        <View style={{ width: 26 }} />
      </View>

      <View style={styles.tabsRow}>
        <Pressable
          onPress={() => setMode("search")}
          style={[styles.tabBtn, mode === "search" && styles.tabBtnActive]}
        >
          <Ionicons
            name="cloud-search-outline"
            size={16}
            color={mode === "search" ? colors.onBrandPrimary : colors.onSurfaceSecondary}
          />
          <Text style={[styles.tabText, mode === "search" && styles.tabTextActive]}>
            Cerca Online
          </Text>
        </Pressable>
        <Pressable
          onPress={openManual}
          style={[styles.tabBtn, mode === "manual" && styles.tabBtnActive]}
        >
          <Ionicons
            name="create-outline"
            size={16}
            color={mode === "manual" ? colors.onBrandPrimary : colors.onSurfaceSecondary}
          />
          <Text style={[styles.tabText, mode === "manual" && styles.tabTextActive]}>
            Inserisci a Mano
          </Text>
        </Pressable>
      </View>

      {mode === "search" ? (
        <>
          <View style={styles.searchWrap}>
            <Ionicons name="search" size={18} color={colors.onSurfaceTertiary} />
            <TextInput
              value={query}
              onChangeText={setQuery}
              onSubmitEditing={runSearch}
              placeholder="Nome esercizio (es. Cable Crossover)"
              placeholderTextColor={colors.onSurfaceTertiary}
              style={styles.searchInput}
              autoCorrect={false}
              returnKeyType="search"
              testID="remote-search-input"
            />
            <Pressable onPress={runSearch} hitSlop={10}>
              <Ionicons name="arrow-forward-circle" size={26} color={colors.brandPrimary} />
            </Pressable>
          </View>
          <Text style={styles.hint}>
            La ricerca usa un database online: serve connessione internet. Il database è in
            inglese, ma puoi cercare anche termini parziali.
          </Text>

          {searching ? (
            <View style={styles.loading}>
              <ActivityIndicator color={colors.brandPrimary} />
            </View>
          ) : searchError ? (
            <View style={styles.empty}>
              <Ionicons name="cloud-offline-outline" size={40} color={colors.onSurfaceTertiary} />
              <Text style={styles.emptyText}>{searchError}</Text>
              <Pressable onPress={openManual} style={styles.manualFallbackBtn}>
                <Text style={styles.manualFallbackText}>Inserisci a mano</Text>
              </Pressable>
            </View>
          ) : searched && results.length === 0 ? (
            <View style={styles.empty}>
              <Ionicons name="search-outline" size={40} color={colors.onSurfaceTertiary} />
              <Text style={styles.emptyText}>
                Nessun risultato per "{query}". Puoi inserirlo a mano.
              </Text>
              <Pressable onPress={openManual} style={styles.manualFallbackBtn}>
                <Text style={styles.manualFallbackText}>Inserisci "{query}" a mano</Text>
              </Pressable>
            </View>
          ) : (
            <FlatList
              data={results}
              keyExtractor={(it) => it.remoteId}
              contentContainerStyle={{
                paddingHorizontal: spacing.lg,
                paddingTop: spacing.md,
                paddingBottom: insets.bottom + spacing.xl,
              }}
              ItemSeparatorComponent={() => <View style={{ height: spacing.sm }} />}
              renderItem={({ item }) => (
                <View style={styles.resultRow}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.resultName} numberOfLines={1}>
                      {item.name}
                    </Text>
                    <Text style={styles.resultMeta}>
                      {item.muscleGroupGuess} · {item.equipmentGuess}
                    </Text>
                  </View>
                  <Pressable
                    onPress={() => importOne(item)}
                    style={styles.importBtn}
                    disabled={importingId === item.remoteId}
                    testID={`import-${item.remoteId}`}
                  >
                    {importingId === item.remoteId ? (
                      <ActivityIndicator size="small" color={colors.onBrandPrimary} />
                    ) : (
                      <Ionicons name="download-outline" size={16} color={colors.onBrandPrimary} />
                    )}
                    <Text style={styles.importBtnText}>Importa</Text>
                  </Pressable>
                </View>
              )}
            />
          )}
        </>
      ) : (
        <ScrollView
          contentContainerStyle={{
            padding: spacing.lg,
            paddingBottom: insets.bottom + spacing.xxxl,
          }}
        >
          <Text style={styles.fieldLabel}>Nome esercizio</Text>
          <TextInput
            value={name}
            onChangeText={setName}
            placeholder="es. Curl al Cavo Singolo"
            placeholderTextColor={colors.onSurfaceTertiary}
            style={styles.input}
          />

          <Text style={styles.fieldLabel}>Gruppo muscolare</Text>
          <View style={styles.optionsWrap}>
            {groups.map((g) => (
              <Pressable
                key={g.id}
                onPress={() => setMuscleGroup(g.id)}
                style={[styles.optionChip, muscleGroup === g.id && styles.optionChipActive]}
              >
                <Text
                  style={[
                    styles.optionChipText,
                    muscleGroup === g.id && styles.optionChipTextActive,
                  ]}
                >
                  {g.name}
                </Text>
              </Pressable>
            ))}
          </View>

          <Text style={styles.fieldLabel}>Attrezzatura</Text>
          <View style={styles.optionsWrap}>
            {EQUIPMENT_OPTIONS.map((eq) => (
              <Pressable
                key={eq}
                onPress={() => setEquipment(eq)}
                style={[styles.optionChip, equipment === eq && styles.optionChipActive]}
              >
                <Text
                  style={[styles.optionChipText, equipment === eq && styles.optionChipTextActive]}
                >
                  {eq}
                </Text>
              </Pressable>
            ))}
          </View>

          <Text style={styles.fieldLabel}>Livello</Text>
          <View style={styles.optionsWrap}>
            {LEVEL_OPTIONS.map((lv) => (
              <Pressable
                key={lv}
                onPress={() => setLevel(lv)}
                style={[styles.optionChip, level === lv && styles.optionChipActive]}
              >
                <Text style={[styles.optionChipText, level === lv && styles.optionChipTextActive]}>
                  {lv}
                </Text>
              </Pressable>
            ))}
          </View>

          <Text style={styles.fieldLabel}>Istruzioni (una per riga)</Text>
          <TextInput
            value={instructions}
            onChangeText={setInstructions}
            placeholder={"Posizionati...\nEsegui il movimento...\nRipeti per il numero previsto."}
            placeholderTextColor={colors.onSurfaceTertiary}
            style={[styles.input, styles.textArea]}
            multiline
            textAlignVertical="top"
          />

          <Text style={styles.fieldLabel}>Consigli (opzionale)</Text>
          <TextInput
            value={tips}
            onChangeText={setTips}
            placeholder="Un consiglio tecnico per eseguire bene l'esercizio"
            placeholderTextColor={colors.onSurfaceTertiary}
            style={[styles.input, styles.textArea]}
            multiline
            textAlignVertical="top"
          />

          <Pressable
            onPress={saveManual}
            style={[styles.saveBtn, saving && { opacity: 0.6 }]}
            disabled={saving}
            testID="save-manual-exercise-btn"
          >
            {saving ? (
              <ActivityIndicator color={colors.onBrandPrimary} />
            ) : (
              <Text style={styles.saveBtnText}>Salva Esercizio</Text>
            )}
          </Pressable>
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.surface },
  topBar: {
    height: 52,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.lg,
  },
  topTitle: { color: colors.onSurface, fontSize: typography.sizes.lg, fontWeight: "700" },
  tabsRow: {
    flexDirection: "row",
    marginHorizontal: spacing.lg,
    marginTop: spacing.sm,
    backgroundColor: colors.surfaceSecondary,
    borderRadius: radius.md,
    padding: 4,
    gap: 4,
  },
  tabBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 10,
    borderRadius: radius.sm,
  },
  tabBtnActive: { backgroundColor: colors.brandPrimary },
  tabText: { color: colors.onSurfaceSecondary, fontWeight: "700", fontSize: 13 },
  tabTextActive: { color: colors.onBrandPrimary },
  searchWrap: {
    marginHorizontal: spacing.lg,
    marginTop: spacing.lg,
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
  searchInput: { flex: 1, color: colors.onSurface, fontSize: typography.sizes.base },
  hint: {
    color: colors.onSurfaceTertiary,
    fontSize: typography.sizes.xs,
    marginHorizontal: spacing.lg,
    marginTop: spacing.sm,
    lineHeight: 16,
  },
  loading: { flex: 1, alignItems: "center", justifyContent: "center" },
  empty: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: spacing.xl,
    gap: spacing.md,
    paddingTop: spacing.xxxl,
  },
  emptyText: { color: colors.onSurfaceSecondary, textAlign: "center", fontSize: typography.sizes.base },
  manualFallbackBtn: {
    backgroundColor: colors.brandPrimary,
    borderRadius: radius.pill,
    paddingVertical: 12,
    paddingHorizontal: spacing.lg,
  },
  manualFallbackText: { color: colors.onBrandPrimary, fontWeight: "700" },
  resultRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.surfaceSecondary,
    borderRadius: radius.md,
    padding: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
    gap: spacing.md,
  },
  resultName: { color: colors.onSurface, fontWeight: "600" },
  resultMeta: { color: colors.onSurfaceSecondary, fontSize: typography.sizes.sm, marginTop: 2 },
  importBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: colors.brandPrimary,
    borderRadius: radius.pill,
    paddingVertical: 8,
    paddingHorizontal: spacing.md,
  },
  importBtnText: { color: colors.onBrandPrimary, fontWeight: "700", fontSize: 13 },
  fieldLabel: {
    color: colors.onSurface,
    fontWeight: "700",
    fontSize: typography.sizes.sm,
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },
  input: {
    backgroundColor: colors.surfaceSecondary,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.md,
    paddingVertical: 12,
    color: colors.onSurface,
    fontSize: typography.sizes.base,
  },
  textArea: { minHeight: 90 },
  optionsWrap: { flexDirection: "row", flexWrap: "wrap", gap: spacing.sm },
  optionChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: 8,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surfaceSecondary,
  },
  optionChipActive: { backgroundColor: colors.brandPrimary, borderColor: colors.brandPrimary },
  optionChipText: { color: colors.onSurfaceSecondary, fontWeight: "600", fontSize: 13 },
  optionChipTextActive: { color: colors.onBrandPrimary },
  saveBtn: {
    backgroundColor: colors.brandPrimary,
    borderRadius: radius.pill,
    paddingVertical: 16,
    alignItems: "center",
    justifyContent: "center",
    marginTop: spacing.xl,
  },
  saveBtnText: { color: colors.onBrandPrimary, fontWeight: "800", fontSize: typography.sizes.base },
});
