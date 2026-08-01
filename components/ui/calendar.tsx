"use client";

import * as React from "react";
import { DayPicker } from "react-day-picker";
import { es } from "date-fns/locale";
import { cn } from "@/lib/utils";

import "react-day-picker/style.css";

export type CalendarProps = React.ComponentProps<typeof DayPicker>;

function Calendar({ className, ...props }: CalendarProps) {
  return (
    <DayPicker
      locale={es}
      className={cn("rdp-zentt rdp-root w-full max-w-full p-1 sm:p-2", className)}
      {...props}
    />
  );
}
Calendar.displayName = "Calendar";

export { Calendar };
