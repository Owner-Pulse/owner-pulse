import React from "react";
import { motion } from "framer-motion";
import { AlertTriangle } from "lucide-react";
import { Card } from "@/components/ui/card";

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } },
};

// One accent per section so the long form is easy to scan
export const SECTION_TONES = {
  cash: { chip: "bg-[#3E7A54]/10 text-[#3E7A54]", bar: "bg-[#3E7A54]" },
  cards: { chip: "bg-[#1E3A5F]/10 text-[#1E3A5F]", bar: "bg-[#1E3A5F]" },
  students: { chip: "bg-purple-100 text-purple-700", bar: "bg-purple-500" },
  attendance: { chip: "bg-[#B78A2F]/15 text-[#8F6A1F]", bar: "bg-[#B78A2F]" },
  collections: { chip: "bg-[#AE4A3E]/10 text-[#AE4A3E]", bar: "bg-[#AE4A3E]" },
  notes: { chip: "bg-slate-100 text-slate-600", bar: "bg-slate-400" },
  file: { chip: "bg-[#AE4A3E]/10 text-[#AE4A3E]", bar: "bg-[#AE4A3E]" },
};

export const Section = ({ tone = "cards", icon: Icon, title, hint, action, children, className = "" }) => {
  const t = SECTION_TONES[tone] || SECTION_TONES.cards;
  return (
    <motion.div variants={itemVariants}>
      <Card className={`relative bg-white border-none shadow-sm py-0 gap-0 ${className}`}>
        <span className={`absolute left-0 top-0 h-1 w-full ${t.bar}`} aria-hidden="true" />
        <div className="px-4 sm:px-5 pt-5 pb-4 sm:pb-5">
          <div className="flex items-start justify-between gap-3 mb-4">
            <div className="flex items-center gap-2.5 min-w-0">
              {Icon && (
                <span className={`p-2 rounded-xl shrink-0 ${t.chip}`}>
                  <Icon size={16} />
                </span>
              )}
              <div className="min-w-0">
                <h2 className="text-sm font-bold text-gray-900">{title}</h2>
                {hint && <p className="text-[11px] text-gray-500">{hint}</p>}
              </div>
            </div>
            {action}
          </div>
          {children}
        </div>
      </Card>
    </motion.div>
  );
};

export const FieldError = ({ message }) =>
  message ? (
    <p className="mt-1 flex items-start gap-1 text-[11px] font-medium text-[#8A362C]">
      <AlertTriangle size={11} className="shrink-0 mt-0.5" /> <span className="break-words min-w-0">{message}</span>
    </p>
  ) : null;

export const inputClass = (hasError) =>
  `w-full h-10 px-3 rounded-xl border text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#1E3A5F] disabled:bg-gray-50 disabled:text-gray-500 ${
    hasError ? "border-[#AE4A3E]" : "border-gray-200"
  }`;

const noSpin = "[appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none";

export const FromPdfTag = () => (
  <span className="inline-flex items-center shrink-0 whitespace-nowrap px-1.5 py-px rounded-md bg-[#AE4A3E]/10 text-[#8A362C] text-[9px] font-bold uppercase tracking-wide">
    From PDF
  </span>
);

export const Field = ({ id, label, hint, error, fromPdf = false, children }) => (
  <div className="min-w-0">
    <label htmlFor={id} className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 mb-1.5">
      {label}
      {fromPdf && <FromPdfTag />}
    </label>
    {children}
    {hint && !error && <p className="mt-1 text-[11px] text-gray-400">{hint}</p>}
    <FieldError message={error} />
  </div>
);

export const MoneyInput = ({ id, value, onChange, error, disabled, placeholder = "0.00" }) => (
  <div className="relative">
    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-semibold text-gray-400 pointer-events-none">$</span>
    <input
      id={id}
      type="number"
      inputMode="decimal"
      min="0"
      step="0.01"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      disabled={disabled}
      className={`${inputClass(error)} pl-7 tabular-nums ${noSpin}`}
    />
  </div>
);

export const CountInput = ({ id, value, onChange, error, disabled, placeholder = "0" }) => (
  <input
    id={id}
    type="number"
    inputMode="numeric"
    min="0"
    step="1"
    value={value}
    onChange={(e) => onChange(e.target.value)}
    placeholder={placeholder}
    disabled={disabled}
    className={`${inputClass(error)} tabular-nums ${noSpin}`}
  />
);

export const TextInput = ({ id, value, onChange, error, disabled, placeholder, type = "text" }) => (
  <input
    id={id}
    type={type}
    value={value}
    onChange={(e) => onChange(e.target.value)}
    placeholder={placeholder}
    disabled={disabled}
    className={inputClass(error)}
  />
);

export const TextArea = ({ id, value, onChange, error, disabled, placeholder, rows = 3 }) => (
  <textarea
    id={id}
    value={value}
    onChange={(e) => onChange(e.target.value)}
    placeholder={placeholder}
    rows={rows}
    disabled={disabled}
    className={`${inputClass(error)} h-auto py-2.5 resize-none`}
  />
);
