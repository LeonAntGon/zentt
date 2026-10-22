import { StyleSheet, Text, View } from "react-native";
import { colors, radii, spacing } from "./tokens";

export type StatusTone = "neutral" | "success" | "warning" | "danger" | "info";

export type StatusBadgeProps = {
  label: string;
  tone?: StatusTone;
};

const tones = {
  neutral: { backgroundColor: colors.muted, color: colors.foreground },
  success: { backgroundColor: "#DCFCE7", color: "#166534" },
  warning: { backgroundColor: "#FEF3C7", color: "#92400E" },
  danger: { backgroundColor: "#FEE2E2", color: "#991B1B" },
  info: { backgroundColor: "#DBEAFE", color: "#1E40AF" },
} satisfies Record<StatusTone, { backgroundColor: string; color: string }>;

export function StatusBadge({ label, tone = "neutral" }: StatusBadgeProps) {
  return (
    <View style={[styles.badge, { backgroundColor: tones[tone].backgroundColor }]}>
      <Text style={[styles.label, { color: tones[tone].color }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    alignSelf: "flex-start",
    borderRadius: radii.small,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  label: { fontSize: 12, fontWeight: "700" },
});
