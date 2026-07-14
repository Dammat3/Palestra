import { useMemo, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { colors, radius, spacing, typography } from "@/src/theme";

const WEEKDAY_LABELS = ["L", "M", "M", "G", "V", "S", "D"];
const MONTH_NAMES = [
  "Gennaio", "Febbraio", "Marzo", "Aprile", "Maggio", "Giugno",
  "Luglio", "Agosto", "Settembre", "Ottobre", "Novembre", "Dicembre",
];

/**
 * Converts any ISO timestamp to a local YYYY-MM-DD key.
 * Using toISOString().slice(0,10) gives UTC date, which can differ from
 * local date for evening workouts in UTC+1/+2 — this fixes that.
 */
function toLocalDateKey(isoTimestamp: string): string {
  const d = new Date(isoTimestamp);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function toDateKey(d: Date): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function WorkoutCalendar({ workoutDates }: { workoutDates: Set<string> }) {
  const today = useMemo(() => {
    const t = new Date();
    t.setHours(0, 0, 0, 0);
    return t;
  }, []);
  const todayKey = toDateKey(today);

  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());

  const isCurrentMonth = viewYear === today.getFullYear() && viewMonth === today.getMonth();

  const goPrevMonth = () => {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear((y) => y - 1);
    } else {
      setViewMonth((m) => m - 1);
    }
  };

  const goNextMonth = () => {
    if (isCurrentMonth) return;
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear((y) => y + 1);
    } else {
      setViewMonth((m) => m + 1);
    }
  };

  const cells = useMemo(() => {
    const firstOfMonth = new Date(viewYear, viewMonth, 1);
    const jsWeekday = firstOfMonth.getDay();
    const mondayFirstOffset = (jsWeekday + 6) % 7;
    const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();

    const result: { day: number | null; key: string | null }[] = [];
    for (let i = 0; i < mondayFirstOffset; i++) {
      result.push({ day: null, key: null });
    }
    for (let day = 1; day <= daysInMonth; day++) {
      const d = new Date(viewYear, viewMonth, day);
      result.push({ day, key: toDateKey(d) });
    }
    return result;
  }, [viewYear, viewMonth]);

  const monthWorkoutCount = useMemo(
    () => cells.filter((c) => c.key && workoutDates.has(c.key)).length,
    [cells, workoutDates],
  );

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Pressable onPress={goPrevMonth} hitSlop={10} testID="calendar-prev-month">
          <Ionicons name="chevron-back" size={20} color={colors.onSurfaceSecondary} />
        </Pressable>
        <Text style={styles.headerTitle}>
          {MONTH_NAMES[viewMonth]} {viewYear}
        </Text>
        <Pressable
          onPress={goNextMonth}
          hitSlop={10}
          disabled={isCurrentMonth}
          style={{ opacity: isCurrentMonth ? 0.25 : 1 }}
          testID="calendar-next-month"
        >
          <Ionicons name="chevron-forward" size={20} color={colors.onSurfaceSecondary} />
        </Pressable>
      </View>

      <View style={styles.weekdayRow}>
        {WEEKDAY_LABELS.map((w, i) => (
          <Text key={i} style={styles.weekdayLabel}>{w}</Text>
        ))}
      </View>

      <View style={styles.grid}>
        {cells.map((c, i) => {
          if (c.day === null) {
            return <View key={i} style={styles.cell} />;
          }
          const isWorkoutDay = c.key !== null && workoutDates.has(c.key);
          const isToday = c.key === todayKey;
          const isFuture = c.key !== null && c.key > todayKey;
          return (
            <View key={i} style={styles.cell}>
              <View
                style={[
                  styles.dayCircle,
                  isWorkoutDay && styles.dayCircleActive,
                  isToday && !isWorkoutDay && styles.dayCircleToday,
                ]}
              >
                <Text
                  style={[
                    styles.dayText,
                    isWorkoutDay && styles.dayTextActive,
                    isToday && !isWorkoutDay && styles.dayTextToday,
                    isFuture && styles.dayTextFuture,
                  ]}
                >
                  {c.day}
                </Text>
              </View>
            </View>
          );
        })}
      </View>

      <Text style={styles.footerText}>
        {monthWorkoutCount === 0
          ? "Nessun allenamento in questo mese"
          : `${monthWorkoutCount} ${monthWorkoutCount === 1 ? "giorno allenato" : "giorni allenati"} questo mese`}
      </Text>
    </View>
  );
}

// Export the local date converter so progress.tsx can use it consistently
export { toLocalDateKey };

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surfaceSecondary,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    marginBottom: spacing.lg,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: spacing.md,
  },
  headerTitle: {
    color: colors.onSurface,
    fontSize: typography.sizes.base,
    fontWeight: "700",
    textTransform: "capitalize",
  },
  weekdayRow: { flexDirection: "row", marginBottom: spacing.xs },
  weekdayLabel: {
    flex: 1,
    textAlign: "center",
    color: colors.onSurfaceTertiary,
    fontSize: 11,
    fontWeight: "600",
  },
  grid: { flexDirection: "row", flexWrap: "wrap" },
  cell: { width: `${100 / 7}%`, aspectRatio: 1, alignItems: "center", justifyContent: "center" },
  dayCircle: {
    width: "78%",
    height: "78%",
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
  },
  dayCircleActive: { backgroundColor: colors.brandPrimary },
  dayCircleToday: { borderWidth: 1.5, borderColor: colors.brandPrimary },
  dayText: { color: colors.onSurfaceSecondary, fontSize: 13, fontWeight: "600" },
  dayTextActive: { color: colors.onBrandPrimary, fontWeight: "800" },
  dayTextToday: { color: colors.brandPrimary, fontWeight: "800" },
  dayTextFuture: { opacity: 0.3 },
});
