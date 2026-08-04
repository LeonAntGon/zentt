import { format, formatDistanceToNow, parseISO } from "date-fns";
import { es } from "date-fns/locale";

export function formatRelativeTime(value: string) {
  try {
    return `hace ${formatDistanceToNow(parseISO(value), {
      addSuffix: false,
      locale: es,
    })}`;
  } catch {
    return "";
  }
}

export function formatFullDateTime(value: string) {
  try {
    return format(parseISO(value), "d 'de' MMMM yyyy, HH:mm", { locale: es });
  } catch {
    return "";
  }
}
