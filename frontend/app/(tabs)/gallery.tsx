import { useCallback, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
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
import * as ImagePicker from "expo-image-picker";
import * as FileSystem from "expo-file-system/legacy";

import { colors, radius, spacing, typography } from "@/src/theme";
import {
  ProgressPhoto,
  deleteProgressPhoto,
  getProgressPhotos,
  saveProgressPhoto,
  uid,
} from "@/src/storage";

function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}

function formatDateLong(iso: string): string {
  const d = new Date(iso + "T00:00:00");
  return d.toLocaleDateString("it-IT", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
}

function formatDateShort(iso: string): string {
  const d = new Date(iso + "T00:00:00");
  return d.toLocaleDateString("it-IT", { day: "numeric", month: "short", year: "numeric" });
}

type DayGroup = { date: string; photos: ProgressPhoto[] };

export default function GalleryScreen() {
  const insets = useSafeAreaInsets();
  const [photos, setPhotos] = useState<ProgressPhoto[]>([]);
  const [adding, setAdding] = useState(false);
  const [compareMode, setCompareMode] = useState(false);
  const [compareSelection, setCompareSelection] = useState<ProgressPhoto[]>([]);
  const [viewerPhoto, setViewerPhoto] = useState<ProgressPhoto | null>(null);
  const [noteDraft, setNoteDraft] = useState("");

  const load = useCallback(() => {
    getProgressPhotos().then(setPhotos);
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  const groups: DayGroup[] = useMemo(() => {
    const byDate = new Map<string, ProgressPhoto[]>();
    for (const p of photos) {
      const arr = byDate.get(p.date) || [];
      arr.push(p);
      byDate.set(p.date, arr);
    }
    return Array.from(byDate.entries())
      .map(([date, photos]) => ({ date, photos }))
      .sort((a, b) => b.date.localeCompare(a.date));
  }, [photos]);

  const addPhoto = async (fromCamera: boolean) => {
    Haptics.selectionAsync();
    const permission = fromCamera
      ? await ImagePicker.requestCameraPermissionsAsync()
      : await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert(
        "Permesso necessario",
        fromCamera
          ? "Per scattare una foto serve l'accesso alla fotocamera."
          : "Per scegliere una foto serve l'accesso alla galleria.",
      );
      return;
    }

    const result = fromCamera
      ? await ImagePicker.launchCameraAsync({ quality: 0.7, allowsEditing: false })
      : await ImagePicker.launchImageLibraryAsync({ quality: 0.7, allowsEditing: false });

    if (result.canceled || !result.assets?.[0]) return;

    setAdding(true);
    try {
      const sourceUri = result.assets[0].uri;
      const dir = FileSystem.documentDirectory + "progress-photos/";
      const dirInfo = await FileSystem.getInfoAsync(dir);
      if (!dirInfo.exists) {
        await FileSystem.makeDirectoryAsync(dir, { intermediates: true });
      }
      const fileName = `${uid()}.jpg`;
      const destUri = dir + fileName;
      await FileSystem.copyAsync({ from: sourceUri, to: destUri });

      await saveProgressPhoto({
        id: uid(),
        date: todayISO(),
        uri: destUri,
        createdAt: new Date().toISOString(),
      });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      load();
    } catch {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert("Errore", "Non è stato possibile salvare la foto.");
    } finally {
      setAdding(false);
    }
  };

  const promptAddPhoto = () => {
    Alert.alert("Aggiungi Foto", "Come vuoi aggiungere la foto?", [
      { text: "Annulla", style: "cancel" },
      { text: "Scatta Foto", onPress: () => addPhoto(true) },
      { text: "Scegli dalla Galleria", onPress: () => addPhoto(false) },
    ]);
  };

  const confirmDelete = (photo: ProgressPhoto) => {
    Alert.alert("Elimina Foto", `Eliminare la foto del ${formatDateShort(photo.date)}?`, [
      { text: "Annulla", style: "cancel" },
      {
        text: "Elimina",
        style: "destructive",
        onPress: async () => {
          await deleteProgressPhoto(photo.id);
          setViewerPhoto(null);
          load();
        },
      },
    ]);
  };

  const toggleCompareMode = () => {
    Haptics.selectionAsync();
    setCompareMode((v) => !v);
    setCompareSelection([]);
  };

  const onPhotoTap = (photo: ProgressPhoto) => {
    if (!compareMode) {
      setViewerPhoto(photo);
      return;
    }
    setCompareSelection((prev) => {
      const exists = prev.find((p) => p.id === photo.id);
      if (exists) return prev.filter((p) => p.id !== photo.id);
      if (prev.length >= 2) return [prev[1], photo];
      return [...prev, photo];
    });
  };

  const isSelectedForCompare = (photo: ProgressPhoto) =>
    compareSelection.some((p) => p.id === photo.id);

  // ---- Comparison view ----
  if (compareMode && compareSelection.length === 2) {
    const [a, b] = [...compareSelection].sort((x, y) => x.date.localeCompare(y.date));
    return (
      <SafeAreaView style={styles.safe} edges={["top"]} testID="gallery-compare-screen">
        <View style={styles.topBar}>
          <Pressable onPress={() => setCompareSelection([])} hitSlop={12}>
            <Ionicons name="close" size={26} color={colors.onSurface} />
          </Pressable>
          <Text style={styles.topTitle}>Confronto</Text>
          <Pressable onPress={toggleCompareMode} hitSlop={12}>
            <Text style={styles.exitCompareText}>Esci</Text>
          </Pressable>
        </View>
        <View style={styles.compareRow}>
          <View style={styles.compareCol}>
            <Image source={{ uri: a.uri }} style={styles.compareImage} resizeMode="cover" />
            <Text style={styles.compareDate}>{formatDateShort(a.date)}</Text>
          </View>
          <View style={styles.compareCol}>
            <Image source={{ uri: b.uri }} style={styles.compareImage} resizeMode="cover" />
            <Text style={styles.compareDate}>{formatDateShort(b.date)}</Text>
          </View>
        </View>
        <Text style={styles.compareHint}>
          Tocca "Esci" e seleziona altre due foto per un nuovo confronto.
        </Text>
      </SafeAreaView>
    );
  }

  // ---- Full-screen single photo viewer ----
  if (viewerPhoto) {
    return (
      <SafeAreaView style={styles.safe} edges={["top"]} testID="gallery-viewer-screen">
        <View style={styles.topBar}>
          <Pressable onPress={() => setViewerPhoto(null)} hitSlop={12}>
            <Ionicons name="close" size={26} color={colors.onSurface} />
          </Pressable>
          <Text style={styles.topTitle}>{formatDateShort(viewerPhoto.date)}</Text>
          <Pressable onPress={() => confirmDelete(viewerPhoto)} hitSlop={12}>
            <Ionicons name="trash-outline" size={22} color={colors.error} />
          </Pressable>
        </View>
        <Image source={{ uri: viewerPhoto.uri }} style={styles.fullImage} resizeMode="contain" />
      </SafeAreaView>
    );
  }

  // ---- Main timeline ----
  return (
    <SafeAreaView style={styles.safe} edges={["top"]} testID="gallery-screen">
      <View style={styles.header}>
        <View style={{ flex: 1 }}>
          <Text style={styles.title}>Foto Progressi</Text>
          <Text style={styles.subtitle}>
            {photos.length === 0
              ? "Nessuna foto ancora"
              : `${photos.length} ${photos.length === 1 ? "foto" : "foto"}`}
          </Text>
        </View>
        {photos.length >= 2 && (
          <Pressable
            onPress={toggleCompareMode}
            style={[styles.headerBtn, compareMode && styles.headerBtnActive]}
            hitSlop={8}
            testID="toggle-compare-btn"
          >
            <Ionicons
              name="git-compare-outline"
              size={20}
              color={compareMode ? colors.onBrandPrimary : colors.onSurface}
            />
          </Pressable>
        )}
        <Pressable
          onPress={promptAddPhoto}
          style={styles.headerBtnPrimary}
          hitSlop={8}
          disabled={adding}
          testID="add-photo-btn"
        >
          {adding ? (
            <ActivityIndicator size="small" color={colors.onBrandPrimary} />
          ) : (
            <Ionicons name="add" size={24} color={colors.onBrandPrimary} />
          )}
        </Pressable>
      </View>

      {compareMode && (
        <View style={styles.compareBanner}>
          <Ionicons name="information-circle-outline" size={16} color={colors.brandPrimary} />
          <Text style={styles.compareBannerText}>
            Seleziona 2 foto da confrontare ({compareSelection.length}/2)
          </Text>
        </View>
      )}

      <ScrollView
        contentContainerStyle={{ padding: spacing.lg, paddingBottom: insets.bottom + spacing.xl }}
        showsVerticalScrollIndicator={false}
      >
        {groups.length === 0 ? (
          <View style={styles.empty}>
            <Ionicons name="camera-outline" size={48} color={colors.onSurfaceTertiary} />
            <Text style={styles.emptyTitle}>Nessuna foto ancora</Text>
            <Text style={styles.emptyText}>
              Scatta o aggiungi una foto per iniziare a documentare i tuoi progressi fisici nel tempo.
            </Text>
          </View>
        ) : (
          groups.map((group) => (
            <View key={group.date} style={styles.dayGroup}>
              <Text style={styles.dayGroupTitle}>{formatDateLong(group.date)}</Text>
              <View style={styles.photoGrid}>
                {group.photos.map((photo) => (
                  <Pressable
                    key={photo.id}
                    onPress={() => onPhotoTap(photo)}
                    style={[
                      styles.photoThumbWrap,
                      isSelectedForCompare(photo) && styles.photoThumbSelected,
                    ]}
                    testID={`photo-thumb-${photo.id}`}
                  >
                    <Image source={{ uri: photo.uri }} style={styles.photoThumb} resizeMode="cover" />
                    {isSelectedForCompare(photo) && (
                      <View style={styles.selectedBadge}>
                        <Ionicons name="checkmark" size={14} color={colors.onBrandPrimary} />
                      </View>
                    )}
                  </Pressable>
                ))}
              </View>
            </View>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.surface },
  header: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    gap: spacing.sm,
  },
  title: { color: colors.onSurface, fontSize: typography.sizes.xxl, fontWeight: "800", letterSpacing: -0.5 },
  subtitle: { color: colors.onSurfaceSecondary, fontSize: typography.sizes.sm, marginTop: 4 },
  headerBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.surfaceSecondary,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
  },
  headerBtnActive: { backgroundColor: colors.brandPrimary, borderColor: colors.brandPrimary },
  headerBtnPrimary: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.brandPrimary,
    alignItems: "center",
    justifyContent: "center",
  },
  compareBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    marginHorizontal: spacing.lg,
    marginTop: spacing.sm,
    backgroundColor: colors.brandTertiary,
    borderRadius: radius.sm,
    paddingVertical: 8,
    paddingHorizontal: spacing.sm,
  },
  compareBannerText: { color: colors.brandPrimary, fontSize: 12, fontWeight: "600" },
  empty: {
    alignItems: "center",
    justifyContent: "center",
    paddingTop: spacing.xxxl,
    paddingHorizontal: spacing.xl,
    gap: spacing.md,
  },
  emptyTitle: { color: colors.onSurface, fontSize: typography.sizes.lg, fontWeight: "700" },
  emptyText: { color: colors.onSurfaceSecondary, textAlign: "center", fontSize: typography.sizes.sm, lineHeight: 19 },
  dayGroup: { marginBottom: spacing.lg },
  dayGroupTitle: {
    color: colors.onSurfaceSecondary,
    fontSize: typography.sizes.sm,
    fontWeight: "700",
    textTransform: "capitalize",
    marginBottom: spacing.sm,
  },
  photoGrid: { flexDirection: "row", flexWrap: "wrap", gap: spacing.sm },
  photoThumbWrap: {
    width: "31%",
    aspectRatio: 0.8,
    borderRadius: radius.sm,
    overflow: "hidden",
    borderWidth: 2,
    borderColor: "transparent",
  },
  photoThumbSelected: { borderColor: colors.brandPrimary },
  photoThumb: { width: "100%", height: "100%" },
  selectedBadge: {
    position: "absolute",
    top: 4,
    right: 4,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: colors.brandPrimary,
    alignItems: "center",
    justifyContent: "center",
  },
  topBar: {
    height: 52,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.lg,
  },
  topTitle: { color: colors.onSurface, fontSize: typography.sizes.base, fontWeight: "700" },
  exitCompareText: { color: colors.brandPrimary, fontWeight: "700" },
  fullImage: { flex: 1, width: "100%" },
  compareRow: { flex: 1, flexDirection: "row", gap: 1 },
  compareCol: { flex: 1, alignItems: "center" },
  compareImage: { width: "100%", flex: 1 },
  compareDate: {
    color: colors.onSurface,
    fontSize: typography.sizes.sm,
    fontWeight: "700",
    paddingVertical: spacing.sm,
  },
  compareHint: {
    color: colors.onSurfaceTertiary,
    fontSize: typography.sizes.xs,
    textAlign: "center",
    paddingVertical: spacing.sm,
  },
});
