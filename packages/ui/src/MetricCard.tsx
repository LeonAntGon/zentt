import { StyleSheet, Text, View } from "react-native";
import { Card } from "./Card";
import { colors, spacing } from "./tokens";

export type MetricCardProps = {
  label: string;
  value: string | number;
  detail?: string;
};

export function MetricCard({ label, value, detail }: MetricCardProps) {
  return (
    <Card style={styles.card}>
      <Text style={styles.label}>{label}</Text>
      <Text accessibilityRole="header" style={styles.value}>
        {value}
      </Text>
      {detail ? <Text style={styles.detail}>{detail}</Text> : null}
    </Card>
  );
}

const styles = StyleSheet.create({
  card: { flex: 1, gap: spacing.xs, minWidth: 135 },
  label: { color: colors.mutedForeground, fontSize: 12, fontWeight: "600" },
  value: { color: colors.foreground, fontSize: 25, fontWeight: "800" },
  detail: { color: colors.brand, fontSize: 12, fontWeight: "600" },
});
