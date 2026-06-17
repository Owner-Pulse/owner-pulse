import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle, ArrowRight, Send, X } from "lucide-react";

const WHY_OPTIONS = [
  { value: "approval", label: "Approval needed" },
  { value: "outside_authority", label: "Outside my authority" },
  { value: "financial_limit", label: "Financial decision above my limit" },
  { value: "safety_legal", label: "Safety / legal / regulatory" },
  { value: "other", label: "Other" },
];

const ACTION_OPTIONS = [
  { value: "approve_reject", label: "Approve / Reject" },
  { value: "decide_options", label: "Decide between options" },
  { value: "call_vendor", label: "Call a vendor" },
  { value: "call_parent", label: "Call a parent / family" },
  { value: "sign_document", label: "Sign or authorize a document" },
  { value: "other", label: "Other" },
];

const EscalationPrompt = ({ isOpen, onClose, onSubmit, itemDescription = "" }) => {
  const [step, setStep] = useState(0);
  const [why, setWhy] = useState("");
  const [whyOther, setWhyOther] = useState("");
  const [action, setAction] = useState("");
  const [actionOther, setActionOther] = useState("");
  const [showOpsPrompt, setShowOpsPrompt] = useState(false);

  const handleClose = () => {
    setStep(0);
    setWhy("");
    setWhyOther("");
    setAction("");
    setActionOther("");
    setShowOpsPrompt(false);
    onClose();
  };

  const handleContinue = () => {
    if (!why) return;
    setStep(1);
  };

  const isVague = () => {
    return why === "other" && action === "other" && whyOther.length < 20;
  };

  const handleFinalSubmit = () => {
    if (!why || !action) return;

    if (!showOpsPrompt && isVague()) {
      setShowOpsPrompt(true);
      return;
    }

    onSubmit({
      why,
      whyOther: why === "other" ? whyOther : undefined,
      action,
      actionOther: action === "other" ? actionOther : undefined,
      itemDescription,
      timestamp: new Date().toISOString(),
    });
    handleClose();
  };

  const handleOpsHandle = () => {
    // Director chose to handle it in ops - log it as ops-handled
    onSubmit({
      why,
      whyOther: why === "other" ? whyOther : undefined,
      action,
      actionOther: action === "other" ? actionOther : undefined,
      itemDescription,
      timestamp: new Date().toISOString(),
      handledInOps: true,
    });
    handleClose();
  };

  const whyLabel = WHY_OPTIONS.find((o) => o.value === why)?.label || why;
  const actionLabel = ACTION_OPTIONS.find((o) => o.value === action)?.label || action;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={handleClose}>
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-white rounded-2xl shadow-2xl w-full max-w-lg"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Escalate to Owner</h2>
                  <p className="text-sm text-gray-500 mt-0.5">
                    {itemDescription || "Route this item to the Owner for a decision"}
                  </p>
                </div>
                <button onClick={handleClose} className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
                  <X size={20} className="text-gray-400" />
                </button>
              </div>

              {!showOpsPrompt ? (
                <div className="space-y-5">
                  {step === 0 && (
                    <>
                      <p className="text-xs font-bold uppercase tracking-wider text-gray-400">
                        Step 1 of 2
                      </p>
                      <div>
                        <label className="block text-sm font-bold text-gray-700 mb-3">
                          Why does the Owner need to be involved?
                        </label>
                        <div className="space-y-2">
                          {WHY_OPTIONS.map((opt) => (
                            <button
                              key={opt.value}
                              type="button"
                              onClick={() => setWhy(opt.value)}
                              className={`w-full text-left px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                                why === opt.value
                                  ? "bg-blue-50 border-2 border-blue-500 text-blue-700"
                                  : "bg-gray-50 border border-gray-200 text-gray-700 hover:bg-gray-100"
                              }`}
                            >
                              {opt.label}
                            </button>
                          ))}
                        </div>
                        {why === "other" && (
                          <div className="mt-3">
                            <input
                              type="text"
                              value={whyOther}
                              onChange={(e) => setWhyOther(e.target.value)}
                              placeholder="Explain why the Owner needs to be involved (min 100 chars)..."
                              maxLength={100}
                              className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                          </div>
                        )}
                      </div>
                      <button
                        onClick={handleContinue}
                        disabled={!why || (why === "other" && whyOther.length < 10)}
                        className="w-full py-3 rounded-xl bg-[#1E3A5F] text-white text-sm font-semibold hover:bg-[#15294A] transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                      >
                        Continue <ArrowRight size={16} />
                      </button>
                    </>
                  )}

                  {step === 1 && (
                    <>
                      <div className="flex items-center gap-2 text-xs text-gray-400 mb-1">
                        <button onClick={() => setStep(0)} className="text-blue-600 hover:underline font-medium">
                          ← Back
                        </button>
                        <span>·</span>
                        <span className="font-medium">Why: {whyLabel}</span>
                      </div>

                      <p className="text-xs font-bold uppercase tracking-wider text-gray-400">
                        Step 2 of 2
                      </p>

                      <div>
                        <label className="block text-sm font-bold text-gray-700 mb-3">
                          What action does the Owner need to take?
                        </label>
                        <p className="text-[10px] text-gray-400 mb-2">Every escalation must declare a decision needed.</p>
                        <div className="space-y-2">
                          {ACTION_OPTIONS.map((opt) => (
                            <button
                              key={opt.value}
                              type="button"
                              onClick={() => setAction(opt.value)}
                              className={`w-full text-left px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                                action === opt.value
                                  ? "bg-blue-50 border-2 border-blue-500 text-blue-700"
                                  : "bg-gray-50 border border-gray-200 text-gray-700 hover:bg-gray-100"
                              }`}
                            >
                              {opt.label}
                            </button>
                          ))}
                        </div>
                        {action === "other" && (
                          <div className="mt-3">
                            <input
                              type="text"
                              value={actionOther}
                              onChange={(e) => setActionOther(e.target.value)}
                              placeholder="What action is needed? (min 100 chars)..."
                              maxLength={100}
                              className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                          </div>
                        )}
                      </div>

                      <button
                        onClick={handleFinalSubmit}
                        disabled={!action || (action === "other" && actionOther.length < 10)}
                        className="w-full py-3 rounded-xl bg-[#1E3A5F] text-white text-sm font-semibold hover:bg-[#15294A] transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                      >
                        <Send size={16} /> Escalate to Owner
                      </button>
                    </>
                  )}
                </div>
              ) : (
                /* ── Soft Ops prompt ── */
                <div className="space-y-4">
                  <div className="flex items-center gap-2 p-3 rounded-xl bg-amber-50 border border-amber-200">
                    <AlertTriangle size={16} className="text-amber-500 flex-shrink-0" />
                    <p className="text-xs text-amber-800">
                      This may belong in <strong>Ops handling</strong> rather than Owner involvement.
                    </p>
                  </div>

                  <div className="p-3 rounded-xl bg-gray-50 text-xs text-gray-500 space-y-1">
                    <p><strong>Why Owner:</strong> {whyLabel}</p>
                    <p><strong>Action needed:</strong> {actionLabel}</p>
                  </div>

                  <p className="text-sm text-gray-600 italic">
                    You decide — your judgment.
                  </p>

                  <div className="flex gap-3">
                    <button
                      onClick={handleOpsHandle}
                      className="flex-1 py-3 rounded-xl border-2 border-emerald-500 text-emerald-700 text-sm font-bold hover:bg-emerald-50 transition-colors"
                    >
                      You're right, I'll handle it
                    </button>
                    <button
                      onClick={handleFinalSubmit}
                      className="flex-1 py-3 rounded-xl bg-[#1E3A5F] text-white text-sm font-bold hover:bg-[#15294A] transition-colors"
                    >
                      Yes, the Owner needs to decide this
                    </button>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default EscalationPrompt;
