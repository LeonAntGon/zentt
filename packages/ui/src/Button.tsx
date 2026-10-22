import type { ReactNode } from "react";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  type StyleProp,
  type TextStyle,
  type ViewStyle,
} from "react-native";
import { colors, radii, spacing } from "./tokens";

export type ButtonVariant = "primary" | "secondary" | "outline" | "danger";

export type ButtonProps = {
  label: string;
  onPress?: () => void;
  variant?: ButtonVariant;
  loading?: boolean;
  disabled?: boolean;
  accessibilityLabel?: string;
  style?: StyleProp<ViewStyle>;
  leading?: ReactNode;
};

export function Button({
  label,
  onPress,
  variant = "primary",
  loading = false,
  disabled = false,
  accessibilityLabel,
  style,
  leading,
}: ButtonProps) {
  const unavailable = disabled || loading;
  const spinnerColor = variant === "primary" || variant === "danger" ? "#FFFFFF" : colors.primary;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? label}
      accessibilityState={{ disabled: unavailable, busy: loading }}
      disabled={unavailable}
      onPress={onPress}
      style={({ pressed }) => [
        styles.base,
        variantStyles[variant],
        pressed && !unavailable && styles.pressed,
        unavailable && styles.unavailable,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator size="small" color={spinnerColor} />
      ) : (
        leading
      )}
      <Text style={[styles.label, labelStyles[variant]]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    minHeight: 48,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderWidth: 1,
    borderRadius: radii.medium,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: spacing.sm,
  },
  primary: { backgroundColor: colors.primary, borderColor: colors.primary },
  secondary: { backgroundColor: colors.muted, borderColor: colors.muted },
  outline: { backgroundColor: colors.card, borderColor: colors.border },
  danger: { backgroundColor: colors.destructive, borderColor: colors.destructive },
  label: { fontSize: 15, fontWeight: "700" },
  primaryLabel: { color: "#FFFFFF" },
  secondaryLabel: { color: colors.foreground },
  outlineLabel: { color: colors.foreground },
  dangerLabel: { color: "#FFFFFF" },
  pressed: { opacity: 0.82, transform: [{ scale: 0.99 }] },
  unavailable: { opacity: 0.55 },
});

const variantStyles = {
  primary: styles.primary,
  secondary: styles.secondary,
  outline: styles.outline,
  danger: styles.danger,
} satisfies Record<ButtonVariant, ViewStyle>;

const labelStyles = {
  primary: styles.primaryLabel,
  secondary: styles.secondaryLabel,
  outline: styles.outlineLabel,
  danger: styles.dangerLabel,
} satisfies Record<ButtonVariant, TextStyle>;
