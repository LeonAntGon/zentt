"use client";

import { useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export const OTP_LENGTH = 6;

type OtpInputProps = {
  value: string[];
  onChange: (next: string[]) => void;
  disabled?: boolean;
  className?: string;
  autoFocus?: boolean;
};

export function OtpInput({
  value,
  onChange,
  disabled,
  className,
  autoFocus = true,
}: OtpInputProps) {
  const refs = useRef<Array<HTMLInputElement | null>>([]);
  const digits = value.length === OTP_LENGTH ? value : Array(OTP_LENGTH).fill("");

  useEffect(() => {
    if (autoFocus) {
      refs.current[0]?.focus();
    }
  }, [autoFocus]);

  const setDigit = (index: number, digit: string) => {
    const next = [...digits];
    next[index] = digit;
    onChange(next);
  };

  const handleChange = (index: number, raw: string) => {
    const cleaned = raw.replace(/\D/g, "");
    if (cleaned.length > 1) {
      // Multi-digit from mobile autofill on one box
      const next = [...digits];
      for (let i = 0; i < cleaned.length && index + i < OTP_LENGTH; i++) {
        next[index + i] = cleaned[i];
      }
      onChange(next);
      const focusAt = Math.min(index + cleaned.length, OTP_LENGTH - 1);
      refs.current[focusAt]?.focus();
      return;
    }
    const digit = cleaned.slice(-1);
    setDigit(index, digit);
    if (digit && index < OTP_LENGTH - 1) {
      refs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (
    index: number,
    e: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (e.key === "Backspace") {
      e.preventDefault();
      if (digits[index]) {
        setDigit(index, "");
        return;
      }
      if (index > 0) {
        setDigit(index - 1, "");
        refs.current[index - 1]?.focus();
      }
      return;
    }
    if (e.key === "ArrowLeft" && index > 0) {
      e.preventDefault();
      refs.current[index - 1]?.focus();
    } else if (e.key === "ArrowRight" && index < OTP_LENGTH - 1) {
      e.preventDefault();
      refs.current[index + 1]?.focus();
    }
  };

  const handlePaste = (
    index: number,
    e: React.ClipboardEvent<HTMLInputElement>
  ) => {
    const pasted = e.clipboardData
      .getData("text")
      .replace(/\D/g, "")
      .slice(0, OTP_LENGTH - index);
    if (!pasted) return;
    e.preventDefault();
    const next = [...digits];
    for (let i = 0; i < pasted.length; i++) {
      next[index + i] = pasted[i];
    }
    onChange(next);
    const nextFocus = Math.min(index + pasted.length, OTP_LENGTH - 1);
    refs.current[nextFocus]?.focus();
  };

  return (
    <fieldset className={cn(className)}>
      <legend className="sr-only">Código de verificación de 6 dígitos</legend>
      <div
        className="flex justify-center gap-2"
        role="group"
        aria-label="Código de verificación"
      >
        {digits.map((digit, index) => (
          <Input
            key={index}
            ref={(el) => {
              refs.current[index] = el;
            }}
            value={digit}
            maxLength={1}
            inputMode="numeric"
            autoComplete={index === 0 ? "one-time-code" : "off"}
            pattern="[0-9]*"
            disabled={disabled}
            aria-label={`Dígito ${index + 1} de ${OTP_LENGTH}`}
            className="h-12 w-11 text-center text-xl font-bold focus-visible:ring-2 focus-visible:ring-primary/40"
            onChange={(e) => handleChange(index, e.target.value)}
            onKeyDown={(e) => handleKeyDown(index, e)}
            onPaste={(e) => handlePaste(index, e)}
            onFocus={(e) => e.target.select()}
          />
        ))}
      </div>
    </fieldset>
  );
}

export function otpToString(value: string[]): string {
  return value.join("");
}

export function emptyOtp(): string[] {
  return Array(OTP_LENGTH).fill("");
}
