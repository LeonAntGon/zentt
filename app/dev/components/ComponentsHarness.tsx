"use client";

import { useState } from "react";
import {
  Button,
  Card,
  FeedbackPanel,
  MetricCard,
  StatusBadge,
  TextField,
  bookingFixtures,
  colors,
  messageFixtures,
  type FeedbackVariant,
} from "@zentt/ui";
import { ScrollView, StyleSheet, Switch, Text, View } from "react-native";

const feedbackVariants: FeedbackVariant[] = ["loading", "empty", "error", "success"];

export default function ComponentsHarnessPage() {
  const [feedback, setFeedback] = useState<FeedbackVariant>("empty");
  const [loading, setLoading] = useState(false);
  const [disabled, setDisabled] = useState(false);
  const [fieldDisabled, setFieldDisabled] = useState(false);
  const [invalid, setInvalid] = useState(false);
  const [value, setValue] = useState("Cabaña del Bosque");

  return (
    <ScrollView contentContainerStyle={styles.page}>
      <View style={styles.header}>
        <Text style={styles.eyebrow}>ZENTT · UI WORKBENCH</Text>
        <Text accessibilityRole="header" style={styles.title}>
          Catálogo de componentes
        </Text>
        <Text style={styles.subtitle}>
          Vista aislada del backend. Cambiá los controles para probar estados e interacciones.
        </Text>
      </View>

      <View style={styles.metrics}>
        <MetricCard label="Alojamientos" value="4" detail="1 borrador" />
        <MetricCard label="Reservas" value="12" detail="3 pendientes" />
        <MetricCard label="Mensajes" value="5" detail="2 sin leer" />
      </View>

      <Card>
        <Text style={styles.sectionTitle}>Botones</Text>
        <View style={styles.controls}>
          <View style={styles.controlRow}>
            <Text style={styles.controlLabel}>Cargando</Text>
            <Switch value={loading} onValueChange={setLoading} />
          </View>
          <View style={styles.controlRow}>
            <Text style={styles.controlLabel}>Deshabilitado</Text>
            <Switch value={disabled} onValueChange={setDisabled} />
          </View>
        </View>
        <View style={styles.buttonRow}>
          <Button label="Principal" loading={loading} disabled={disabled} onPress={() => setLoading(true)} />
          <Button label="Secundario" variant="secondary" disabled={disabled} />
          <Button label="Outline" variant="outline" disabled={disabled} />
          <Button label="Destructivo" variant="danger" disabled={disabled} />
        </View>
      </Card>

      <Card>
        <Text style={styles.sectionTitle}>Campos y validación</Text>
        <View style={styles.controlRow}>
          <Text style={styles.controlLabel}>Campo deshabilitado</Text>
          <Switch value={fieldDisabled} onValueChange={setFieldDisabled} />
        </View>
        <TextField
          label="Nombre del alojamiento"
          value={value}
          onChangeText={setValue}
          editable={!fieldDisabled}
          error={invalid ? "Ingresá un nombre válido." : undefined}
          hint="El mismo componente se usa en web y móvil."
          placeholder="Ej. Cabaña del Bosque"
        />
        <View style={styles.inlineActions}>
          <Button
            label={invalid ? "Limpiar error" : "Mostrar error"}
            variant="outline"
            onPress={() => setInvalid((current) => !current)}
          />
        </View>
      </Card>

      <Card>
        <Text style={styles.sectionTitle}>Estados de carga, vacío y error</Text>
        <View style={styles.buttonRow}>
          {feedbackVariants.map((variant) => (
            <Button
              key={variant}
              label={variant}
              variant={feedback === variant ? "primary" : "outline"}
              onPress={() => setFeedback(variant)}
            />
          ))}
        </View>
        <FeedbackPanel
          variant={feedback}
          title={
            feedback === "loading"
              ? "Cargando datos"
              : feedback === "error"
                ? "No se pudo cargar"
                : feedback === "success"
                  ? "Todo actualizado"
                  : "Todavía no hay reservas"
          }
          description="Estado de ejemplo controlado desde este catálogo, sin requests reales."
          actionLabel={feedback === "error" ? "Reintentar" : undefined}
          onAction={() => setFeedback("loading")}
        />
      </Card>

      <Card>
        <Text style={styles.sectionTitle}>Estados de reserva</Text>
        <View style={styles.list}>
          {bookingFixtures.map((booking, index) => (
            <View key={booking.id} style={styles.listItem}>
              <View style={styles.listCopy}>
                <Text style={styles.itemTitle}>{booking.guest}</Text>
                <Text style={styles.itemDetail}>
                  {booking.property} · {booking.dates}
                </Text>
              </View>
              <StatusBadge
                label={booking.status}
                tone={index === 0 ? "warning" : "success"}
              />
            </View>
          ))}
        </View>
      </Card>

      <Card>
        <Text style={styles.sectionTitle}>Mensajes de ejemplo</Text>
        <View style={styles.list}>
          {messageFixtures.map((message) => (
            <View key={message.id} style={styles.listItem}>
              <View style={styles.listCopy}>
                <Text style={styles.itemTitle}>{message.guest}</Text>
                <Text numberOfLines={2} style={styles.itemDetail}>
                  {message.preview}
                </Text>
              </View>
              {message.unread ? <StatusBadge label="Nuevo" tone="info" /> : null}
            </View>
          ))}
        </View>
      </Card>

      <Text style={styles.footer}>
        Fuente compartida: `@zentt/ui` · Paleta {colors.brand} · Sin conexión al backend
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  page: {
    alignSelf: "center",
    backgroundColor: colors.background,
    gap: 16,
    maxWidth: 900,
    padding: 24,
    width: "100%",
  },
  header: { gap: 8, paddingBottom: 4 },
  eyebrow: { color: colors.brand, fontSize: 12, fontWeight: "800", letterSpacing: 1.2 },
  title: { color: colors.foreground, fontSize: 30, fontWeight: "800" },
  subtitle: { color: colors.mutedForeground, fontSize: 15, lineHeight: 22 },
  metrics: { flexDirection: "row", flexWrap: "wrap", gap: 12 },
  sectionTitle: { color: colors.foreground, fontSize: 18, fontWeight: "800", marginBottom: 14 },
  controls: { flexDirection: "row", flexWrap: "wrap", gap: 18, marginBottom: 12 },
  controlRow: { alignItems: "center", flexDirection: "row", gap: 8 },
  controlLabel: { color: colors.foreground, fontSize: 13, fontWeight: "600" },
  buttonRow: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 12 },
  inlineActions: { alignItems: "flex-start", marginTop: 12 },
  list: { gap: 8 },
  listItem: {
    alignItems: "center",
    borderBottomColor: colors.border,
    borderBottomWidth: StyleSheet.hairlineWidth,
    flexDirection: "row",
    gap: 12,
    justifyContent: "space-between",
    paddingVertical: 10,
  },
  listCopy: { flex: 1, gap: 3 },
  itemTitle: { color: colors.foreground, fontSize: 14, fontWeight: "700" },
  itemDetail: { color: colors.mutedForeground, fontSize: 12, lineHeight: 18 },
  footer: { color: colors.mutedForeground, fontSize: 12, paddingVertical: 8, textAlign: "center" },
});
