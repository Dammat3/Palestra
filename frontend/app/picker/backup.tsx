import { useState } from "react";
import { ActivityIndicator, Alert, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import * as FileSystem from "expo-file-system/legacy";
import * as Sharing from "expo-sharing";
import * as DocumentPicker from "expo-document-picker";
import * as Haptics from "expo-haptics";

import { colors, radius, spacing, typography } from "@/src/theme";
import { exportAllData, importAllData, BackupPayload } from "@/src/storage";

function formatFileDate(d: Date) {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}-${pad(d.getHours())}${pad(d.getMinutes())}`;
}

export default function BackupScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [exporting, setExporting] = useState(false);
  const [importing, setImporting] = useState(false);

  const handleExport = async () => {
    setExporting(true);
    try {
      const backup = await exportAllData();
      const fileName = `palestra-backup-${formatFileDate(new Date())}.json`;
      const fileUri = FileSystem.documentDirectory + fileName;
      await FileSystem.writeAsStringAsync(fileUri, JSON.stringify(backup, null, 2), {
        encoding: FileSystem.EncodingType.UTF8,
      });

      const canShare = await Sharing.isAvailableAsync();
      if (canShare) {
        await Sharing.shareAsync(fileUri, {
          mimeType: "application/json",
          dialogTitle: "Salva il backup di Palestra",
        });
      } else {
        Alert.alert(
          "Backup creato",
          `Il file è stato salvato come ${fileName}, ma la condivisione non è disponibile su questo dispositivo.`,
        );
      }
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (e) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert("Errore", "Non è stato possibile creare il backup.");
    } finally {
      setExporting(false);
    }
  };

  const handleImport = async (replace: boolean) => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: "application/json",
        copyToCacheDirectory: true,
      });
      if (result.canceled || !result.assets?.[0]) return;

      setImporting(true);
      const content = await FileSystem.readAsStringAsync(result.assets[0].uri);
      const backup = JSON.parse(content) as BackupPayload;
      const counts = await importAllData(backup, { replace });

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert(
        "Importazione completata",
        `Schede: ${counts.workouts} · Sessioni cronologia: ${counts.history} · Esercizi personalizzati: ${counts.customExercises}`,
        [{ text: "OK", onPress: () => router.back() }],
      );
    } catch (e) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert("Errore", "Il file selezionato non è un backup valido di Palestra.");
    } finally {
      setImporting(false);
    }
  };

  const confirmImport = () => {
    Alert.alert(
      "Importa backup",
      "Vuoi unire i dati del backup con quelli già presenti, oppure sostituire completamente i dati attuali?",
      [
        { text: "Annulla", style: "cancel" },
        { text: "Unisci (consigliato)", onPress: () => handleImport(false) },
        { text: "Sostituisci tutto", style: "destructive", onPress: () => handleImport(true) },
      ],
    );
  };

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <View style={styles.topBar}>
        <Pressable onPress={() => router.back()} hitSlop={12}>
          <Ionicons name="close" size={26} color={colors.onSurface} />
        </Pressable>
        <Text style={styles.topTitle}>Backup e Ripristino</Text>
        <View style={{ width: 26 }} />
      </View>

      <ScrollView
        contentContainerStyle={{ padding: spacing.lg, paddingBottom: insets.bottom + spacing.xl }}
      >
        <View style={styles.card}>
          <Ionicons name="cloud-upload-outline" size={28} color={colors.brandPrimary} />
          <Text style={styles.cardTitle}>Esporta i tuoi dati</Text>
          <Text style={styles.cardText}>
            Crea un file con tutte le tue schede, la cronologia degli allenamenti e gli esercizi
            personalizzati. Salvalo dove preferisci (Drive, email, file manager) prima di
            reinstallare l'app o cambiare telefono.
          </Text>
          <Pressable onPress={handleExport} style={styles.actionBtn} disabled={exporting}>
            {exporting ? (
              <ActivityIndicator color={colors.onBrandPrimary} />
            ) : (
              <>
                <Ionicons name="download-outline" size={18} color={colors.onBrandPrimary} />
                <Text style={styles.actionBtnText}>Crea ed Esporta Backup</Text>
              </>
            )}
          </Pressable>
        </View>

        <View style={styles.card}>
          <Ionicons name="cloud-download-outline" size={28} color={colors.brandPrimary} />
          <Text style={styles.cardTitle}>Importa un backup</Text>
          <Text style={styles.cardText}>
            Scegli un file di backup creato in precedenza per ripristinare le tue schede. Puoi
            scegliere se unirlo ai dati attuali o sostituirli completamente.
          </Text>
          <Pressable
            onPress={confirmImport}
            style={[styles.actionBtn, styles.actionBtnSecondary]}
            disabled={importing}
          >
            {importing ? (
              <ActivityIndicator color={colors.brandPrimary} />
            ) : (
              <>
                <Ionicons name="folder-open-outline" size={18} color={colors.brandPrimary} />
                <Text style={[styles.actionBtnText, styles.actionBtnTextSecondary]}>
                  Scegli File di Backup
                </Text>
              </>
            )}
          </Pressable>
        </View>

        <Text style={styles.hint}>
          Consiglio: esporta un backup ogni volta prima di disinstallare l'app o installare una
          nuova build, così non perdi mai le tue schede.
        </Text>
      </ScrollView>
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
  card: {
    backgroundColor: colors.surfaceSecondary,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    gap: spacing.sm,
  },
  cardTitle: { color: colors.onSurface, fontSize: typography.sizes.lg, fontWeight: "700", marginTop: spacing.xs },
  cardText: { color: colors.onSurfaceSecondary, fontSize: typography.sizes.sm, lineHeight: 19 },
  actionBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: colors.brandPrimary,
    borderRadius: radius.pill,
    paddingVertical: 14,
    marginTop: spacing.sm,
  },
  actionBtnSecondary: { backgroundColor: colors.surfaceTertiary, borderWidth: 1, borderColor: colors.borderStrong },
  actionBtnText: { color: colors.onBrandPrimary, fontWeight: "700" },
  actionBtnTextSecondary: { color: colors.brandPrimary },
  hint: {
    color: colors.onSurfaceTertiary,
    fontSize: typography.sizes.xs,
    textAlign: "center",
    lineHeight: 16,
    marginTop: spacing.sm,
  },
});
