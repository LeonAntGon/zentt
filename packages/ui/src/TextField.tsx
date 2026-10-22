import { useState } from "react";
import {
  StyleSheet,
  Text,
  TextInput,
  View,
  type StyleProp,
  type TextInputProps,
  type TextStyle,
  type ViewStyle,
} from "react-native";
import { colors, radii, spacing } from "./tokens";

export type TextFieldProps = Omit<TextInputProps, "style"> & {
  label: string;
  error?: string;
  hint?: string;
  containerStyle?: StyleProp<ViewStyle>;
  inputStyle?: StyleProp<TextStyle>;
};

export function TextField({
  label,
  error,
  hint,
  containerStyle,
  inputStyle,
  editable = true,
  onFocus,
  onBlur,
  ...inputProps
}: TextFieldProps) {
  const [focused, setFocused] = useState(false);

  return (
    <View style={[styles.container, containerStyle]}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        accessibilityLabel={label}
        accessibilityState={{ disabled: !editable }}
        editable={editable}
        placeholderTextColor={colors.mutedForeground}
        style={[
          styles.input,
          error && styles.inputError,
          focused && !error && styles.inputFocused,
          !editable && styles.inputDisabled,
          inputStyle,
        ]}
        onFocus={(event) => {
          setFocused(true);
          onFocus?.(event);
        }}
        onBlur={(event) => {
          setFocused(false);
          onBlur?.(event);
        }}
        {...inputProps}
      />
      {error ? (
        <Text accessibilityRole="alert" style={styles.error}>
          {error}
        </Text>
      ) : hint ? (
        <Text style={styles.hint}>{hint}</Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: spacing.xs },
  label: { color: colors.foreground, fontSize: 13, fontWeight: "700" },
  input: {
    minHeight: 48,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.medium,
    backgroundColor: colors.card,
    color: colors.foreground,
    fontSize: 15,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  inputError: { borderColor: colors.destructive },
  inputFocused: { borderColor: colors.brand },
  inputDisabled: { backgroundColor: colors.muted, opacity: 0.65 },
  error: { color: colors.destructive, fontSize: 12 },
  hint: { color: colors.mutedForeground, fontSize: 12 },
});
