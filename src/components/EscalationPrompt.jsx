import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle, Send, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCreateEscalation } from "@/hooks/escalation.hook";
import {
  DECISION_OPTIONS,
  REASON_OPTIONS,
  DECISION_DETAILS_MIN,
  REASON_DETAILS_MIN,
  EMPTY_ESCALATION,
  cleanEscalation,
  clearEditedErrors,
  isEscalationValid,
  parseValidationErrors,
} from "@/lib/escalation";

const FieldError = ({ message }) =>
  message ? (
    <p className="mt-1 flex items-start gap-1 text-[11px] font-medium text-[#8A362C]">
      <AlertTriangle size={11} className="shrink-0 mt-0.5" /> <span className="break-words min-w-0">{message}</span>
    </p>
  ) : null;

const Question = ({
  number,
  title,
  options,
  type,
  onType,
  typeError,
  detailsLabel,
  details,
  onDetails,
  detailsError,
  min,
  placeholder,
  disabled,
}) => {
  const length = details.trim().length;
  const reached = length >= min;

  return (
    <div>
      <p className="text-sm font-bold text-gray-800 mb-2 lg:mb-1.5">
        <span className="text-gray-400 mr-1">{number}.</span>
        {title}
      </p>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        {options.map((opt) => (
          <button
            key={opt.value}
            type="button"
            disabled={disabled}
            aria-pressed={type === opt.value}
            onClick={() => onType(opt.value)}
            className={`text-left px-3 py-2 lg:py-1.5 rounded-xl text-xs font-medium leading-snug border transition-all cursor-pointer disabled:cursor-not-allowed ${
              type === opt.value
                ? "bg-[#1E3A5F]/10 border-[#1E3A5F] text-[#1E3A5F] font-semibold ring-1 ring-[#1E3A5F]"
                : "bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100"
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>
      <FieldError message={typeError} />

      <label className="block text-xs font-semibold text-gray-500 mt-3 mb-1.5 lg:mt-2 lg:mb-1">{detailsLabel} *</label>
      <textarea
        value={details}
        onChange={(e) => onDetails(e.target.value)}
        placeholder={placeholder}
        rows={3}
        disabled={disabled}
        className={`w-full px-4 py-3 lg:py-2 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-[#1E3A5F] resize-none ${
          detailsError ? "border-[#AE4A3E]" : "border-gray-200"
        }`}
      />
      <p className={`mt-1 text-[11px] font-medium ${reached ? "text-[#2F6042]" : "text-gray-400"}`}>
        Minimum {min} characters · {length}/{min}
      </p>
      <FieldError message={detailsError} />
    </div>
  );
};

/**
 * The two required escalation questions — the last step of every Director → Owner send flow.
 *
 * Props:
 * - value: { decision_type, decision_details, reason_type, reason_details }
 * - onChange: (nextValue) => void
 * - errors: { [field]: message } from a 422 response (see parseValidationErrors)
 * - leading: shown above question 1 (in the left column on desktop)
 */
export const EscalationQuestions = ({ value, onChange, errors = {}, disabled = false, leading = null }) => {
  const set = (key) => (next) => onChange({ ...value, [key]: next });

  return (
    <div className="space-y-5 lg:space-y-0 lg:grid lg:grid-cols-2 lg:gap-x-8 lg:items-start">
      <div className="space-y-5 lg:space-y-3 min-w-0">
        {leading}
        <Question
          number={1}
          title="What decision are you asking the Owner to make?"
          options={DECISION_OPTIONS}
          type={value.decision_type}
          onType={set("decision_type")}
          typeError={errors.decision_type}
          detailsLabel="Describe the decision"
          details={value.decision_details}
          onDetails={set("decision_details")}
          detailsError={errors.decision_details}
          min={DECISION_DETAILS_MIN}
          placeholder="e.g. Approve the $1,850 quote from CoolAir to replace the PreK-3 AC unit"
          disabled={disabled}
        />
      </div>
      <Question
        number={2}
        title="Why does this need the Owner?"
        options={REASON_OPTIONS}
        type={value.reason_type}
        onType={set("reason_type")}
        typeError={errors.reason_type}
        detailsLabel="What have you already tried, or why is it beyond your authority?"
        details={value.reason_details}
        onDetails={set("reason_details")}
        detailsError={errors.reason_details}
        min={REASON_DETAILS_MIN}
        placeholder="e.g. Got two quotes; both are above my $500 spending limit"
        disabled={disabled}
      />
    </div>
  );
};

/**
 * Class names for an escalation popup. `wide` (the questions step) is ~70% of the screen on
 * desktop with the header and buttons pinned and only the body scrolling; below lg, and when
 * not wide, it is the usual narrow modal that scrolls as a whole.
 */
export const escalationModal = (wide = true) => ({
  panel: `bg-white rounded-2xl shadow-2xl w-full max-h-[90vh] overflow-y-auto ${
    wide ? "lg:w-[70vw] lg:max-w-[1100px] lg:flex lg:flex-col lg:overflow-hidden" : "max-w-lg"
  }`,
  header: `px-6 pt-6 pb-6 ${wide ? "lg:pb-3 lg:shrink-0" : ""}`,
  form: wide ? "lg:flex-1 lg:min-h-0 lg:flex lg:flex-col" : "",
  body: `px-6 space-y-4 ${wide ? "lg:flex-1 lg:min-h-0 lg:overflow-y-auto lg:py-1" : ""}`,
  footer: `flex gap-3 px-6 pt-6 pb-6 ${wide ? "lg:pt-3 lg:shrink-0" : ""}`,
});

/**
 * Standalone escalation (no task or maintenance item behind it) — POST /director/escalations
 *
 * Props:
 * - isOpen, onClose
 * - defaultTitle: prefilled, editable title
 * - context: optional text sent along and shown to the Owner (e.g. the family or invoice)
 * - editableContext: let the Director type the context instead of showing a fixed one
 */
const EscalationPrompt = ({ isOpen, onClose, defaultTitle = "", context = "", editableContext = false }) => {
  const { createEscalation, isPending } = useCreateEscalation();
  const [title, setTitle] = useState(defaultTitle);
  const [contextText, setContextText] = useState(context);
  const [answers, setAnswers] = useState(EMPTY_ESCALATION);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (!isOpen) return;
    setTitle(defaultTitle);
    setContextText(context);
    setAnswers(EMPTY_ESCALATION);
    setErrors({});
  }, [isOpen, defaultTitle, context]);

  const canSend = title.trim().length > 0 && isEscalationValid(answers) && !isPending;

  const changeAnswers = (next) => {
    setErrors((prev) => clearEditedErrors(prev, answers, next));
    setAnswers(next);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!canSend) return;
    setErrors({});

    const payload = { title: title.trim(), ...cleanEscalation(answers) };
    if (contextText.trim()) payload.context = contextText.trim();

    try {
      await createEscalation(payload);
      onClose();
    } catch (err) {
      setErrors(parseValidationErrors(err));
    }
  };

  const modal = escalationModal();

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className={modal.panel}
            onClick={(e) => e.stopPropagation()}
          >
            <div className={`flex items-start justify-between gap-3 ${modal.header}`}>
              <div className="min-w-0">
                <h2 className="text-xl font-bold text-gray-900">Escalate to Owner</h2>
                <p className="text-sm text-gray-500 mt-0.5">Both questions are required before you can send.</p>
              </div>
              <button type="button" onClick={onClose} className="p-2 hover:bg-gray-100 rounded-xl transition-colors cursor-pointer shrink-0">
                <X size={20} className="text-gray-400" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className={modal.form}>
              <div className={modal.body}>
                <EscalationQuestions
                  value={answers}
                  onChange={changeAnswers}
                  errors={errors}
                  disabled={isPending}
                  leading={
                    <>
                      <div>
                        <label className="block text-xs font-semibold text-gray-500 mb-1.5 lg:mb-1">Title *</label>
                        <input
                          type="text"
                          value={title}
                          onChange={(e) => setTitle(e.target.value)}
                          placeholder="What is this about?"
                          disabled={isPending}
                          className={`w-full px-4 py-3 lg:py-2 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-[#1E3A5F] ${
                            errors.title ? "border-[#AE4A3E]" : "border-gray-200"
                          }`}
                        />
                        <FieldError message={errors.title} />
                        {!editableContext && context && (
                          <p className="mt-2 p-2.5 rounded-xl bg-gray-50 border border-gray-100 text-xs text-gray-600 break-words">
                            {context}
                          </p>
                        )}
                        {!editableContext && <FieldError message={errors.context} />}
                      </div>

                      {editableContext && (
                        <div>
                          <label className="block text-xs font-semibold text-gray-500 mb-1.5 lg:mb-1">Context (optional)</label>
                          <textarea
                            value={contextText}
                            onChange={(e) => setContextText(e.target.value)}
                            placeholder="e.g. the family, invoice or vendor this is about"
                            rows={2}
                            disabled={isPending}
                            className={`w-full px-4 py-3 lg:py-2 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-[#1E3A5F] resize-none ${
                              errors.context ? "border-[#AE4A3E]" : "border-gray-200"
                            }`}
                          />
                          <FieldError message={errors.context} />
                        </div>
                      )}
                    </>
                  }
                />
              </div>

              <div className={modal.footer}>
                <Button type="button" variant="outline" onClick={onClose} disabled={isPending} className="flex-1">
                  Cancel
                </Button>
                <Button type="submit" disabled={!canSend} className="flex-1 bg-[#1E3A5F] hover:bg-[#15294A] text-white">
                  {isPending ? (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                  ) : (
                    <Send size={16} className="mr-2" />
                  )}
                  {isPending ? "Sending..." : "Send to Owner"}
                </Button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default EscalationPrompt;
