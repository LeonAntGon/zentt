import type { ReactNode } from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import { Button } from "./Button";
import { colors, radii, spacing } from "./tokens";

export type FeedbackVariant = "loading" | "empty" | "error" | "success";

export type FeedbackPanelProps = {
  variant: FeedbackVariant;
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  children?: ReactNode;
};

export function FeedbackPanel({
  variant,
  title,
  description,
  actionLabel,
  onAction,
  children,
}: FeedbackPanelProps) {
  return (
    <View
      accessibilityLiveRegion={variant === "error" ? "polite" : "none"}
      style={styles.panel}
    >
      {variant === "loading" ? (
        <ActivityIndicator color={colors.brand} />
      ) : (
        <View
          style={[
            styles.indicator,
            variant === "error" && styles.errorIndicator,
            variant === "success" && styles.successIndicator,
          ]}
        >
          <Text style={styles.indicatorText}>
            {variant === "error" ? "!" : variant === "success" ? "✓" : "•"}
          </Text>
        </View>
      )}
      <Text style={styles.title}>{title}</Text>
      {description ? <Text style={styles.description}>{description}</Text> : null}
      {children}
      {actionLabel && onAction ? (
        <Button
          label={actionLabel}
          onPress={onAction}
          variant={variant === "error" ? "outline" : "secondary"}
          style={styles.action}
        />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  panel: {
    alignItems: "center",
    backgroundColor: colors.card,
    borderColor: colors.border,
    borderRadius: radii.large,
    borderWidth: 1,
    gap: spacing.sm,
    padding: spacing.xl,
  },
  indicator: {
    alignItems: "center",
    backgroundColor: colors.muted,
    borderRadius: 24,
    height: 40,
    justifyContent: "center",
    width: 40,
  },
  errorIndicator: { backgroundColor: "#FEE2E2" },
  successIndicator: { backgroundColor: "#DCFCE7" },
  indicatorText: { color: colors.brand, fontSize: 18, fontWeight: "800" },
  title: { color: colors.foreground, fontSize: 16, fontWeight: "800", textAlign: "center" },
  description: { color: colors.mutedForeground, fontSize: 13, lineHeight: 19, textAlign: "center" },
  action: { marginTop: spacing.xs },
});
