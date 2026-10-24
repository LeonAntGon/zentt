"use client";

import PhoneInput from "react-phone-number-input";

type PhoneFieldProps = {
  value: string;
  onChange: (value: string) => void;
  error?: string;
};

export function PhoneField({ value, onChange, error }: PhoneFieldProps) {
  return (
    <div>
      <div
        className={`rounded-xl border bg-white px-3.5 focus-within:ring-1 ${
          error
            ? "border-red-300 focus-within:border-red-400 focus-within:ring-red-300"
            : "border-slate-200 focus-within:border-primary focus-within:ring-primary"
        }`}
      >
        <PhoneInput
          international
          defaultCountry="AR"
          countryCallingCodeEditable={false}
          value={value || undefined}
          onChange={(next) => onChange(next || "")}
          placeholder="11 2345-5678"
          labels={{ country: "País", phone: "WhatsApp" }}
          countrySelectProps={{ "aria-label": "País del WhatsApp" }}
          className="PhoneInput min-w-0"
          numberInputProps={{
            className:
              "PhoneInputInput min-w-0 flex-1 bg-transparent py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none",
            "aria-invalid": Boolean(error),
          }}
        />
      </div>
      {error && <p className="mt-1.5 text-xs text-red-600">{error}</p>}
    </div>
  );
}
