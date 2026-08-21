import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, RefreshCw, CheckCircle2, Clock, DollarSign, ArrowRight, Lightbulb, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const InsuranceWorkflowModal = ({ isOpen, onClose, insuranceItem, onUpdateWorkflow }) => {
  const [carrierInput, setCarrierInput] = useState("");
  const [amountInput, setAmountInput] = useState("");

  if (!isOpen || !insuranceItem) return null;

  const workflow = insuranceItem.insuranceWorkflow || {
    stage: "shopping",
    quotes: [
      { carrier: "Hartford Commercial", amount: 14200, status: "Received" },
      { carrier: "Travelers School Plus", amount: 13800, status: "Received" },
    ],
    selectedCarrier: "Travelers School Plus",
  };

  const handleAddQuote = (e) => {
    e.preventDefault();
    if (!carrierInput.trim() || !amountInput) return;
    const newQuotes = [
      ...(workflow.quotes || []),
      { carrier: carrierInput.trim(), amount: parseFloat(amountInput), status: "Received" },
    ];
    onUpdateWorkflow(insuranceItem.id, { quotes: newQuotes, stage: "quotes_received" });
    setCarrierInput("");
    setAmountInput("");
  };

  const handleSelectCarrier = (carrierName) => {
    onUpdateWorkflow(insuranceItem.id, { selectedCarrier: carrierName, stage: "carrier_selected" });
  };

  const handleCompletePolicyRenewal = () => {
    // Update expiry to 1 year ahead & set status to compliant
    const nextYearDate = "2027-11-18";
    onUpdateWorkflow(insuranceItem.id, {
      stage: "policy_issued",
      expires: nextYearDate,
      shopReminder: "2027-09-19",
      status: "compliant",
      logNote: `Renewed policy with ${workflow.selectedCarrier || "selected carrier"}. New expiry date: Nov 18, 2027.`,
    });
    onClose();
  };

  const stages = [
    { id: "reminder_set", title: "60-Day Shop Window", date: "Sept 1, 2026", desc: "Shopping reminder triggered" },
    { id: "shopping", title: "Collect Quotes", date: "Sept 5, 2026", desc: "Get 2-3 quotes from carriers" },
    { id: "quotes_received", title: "Select Carrier", date: "Sept 20, 2026", desc: "Compare & select best carrier" },
    { id: "policy_issued", title: "Policy Issued & Renewed", date: "Oct 15, 2026", desc: "Upload policy & update expiry" },
  ];

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="relative w-full max-w-xl bg-white rounded-2xl shadow-xl overflow-hidden my-8 border border-gray-100"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 bg-[#1E3A5F] text-white">
            <div className="flex items-center gap-2">
              <RefreshCw size={20} className="text-[#9DB8D9]" />
              <h2 className="text-base md:text-lg font-bold">Insurance Renewal & Shopping Workflow</h2>
            </div>
            <button onClick={onClose} className="p-1 text-white/80 hover:text-white rounded-lg">
              <X size={20} />
            </button>
          </div>

          <div className="p-6 space-y-5 max-h-[80vh] overflow-y-auto">
            {/* Timeline Stepper */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-center">
              {stages.map((stg, i) => {
                const isCurrent = workflow.stage === stg.id;
                const isPast =
                  stages.findIndex((s) => s.id === workflow.stage) > i || workflow.stage === "policy_issued";

                return (
                  <div
                    key={stg.id}
                    className={`p-2.5 rounded-xl border text-xs flex flex-col items-center justify-between transition-all ${
                      isPast
                        ? "bg-emerald-50 border-emerald-200 text-emerald-800"
                        : isCurrent
                        ? "bg-[#1E3A5F] text-white border-[#1E3A5F] shadow-sm"
                        : "bg-gray-50 border-gray-200 text-gray-400"
                    }`}
                  >
                    <div className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold mb-1">
                      {isPast ? <CheckCircle2 size={16} className="text-emerald-600" /> : i + 1}
                    </div>
                    <p className="font-bold text-[11px] leading-tight">{stg.title}</p>
                    <span className="text-[9px] opacity-75 mt-0.5">{stg.date}</span>
                  </div>
                );
              })}
            </div>

            {/* Carrier Quotes Section */}
            <div className="p-4 rounded-xl bg-gray-50 border border-gray-200 space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-gray-900 flex items-center gap-1.5">
                  <DollarSign size={14} className="text-[#1E3A5F]" /> Carrier Quotes & Comparison
                </h4>
                <span className="text-[10px] text-gray-500 font-medium">Target 3 Quotes</span>
              </div>

              {/* Quotes List */}
              <div className="space-y-2">
                {workflow.quotes && workflow.quotes.length > 0 ? (
                  workflow.quotes.map((q, idx) => {
                    const isSelected = workflow.selectedCarrier === q.carrier;
                    return (
                      <div
                        key={idx}
                        className={`p-3 rounded-lg border flex items-center justify-between text-xs transition-all ${
                          isSelected
                            ? "bg-[#1E3A5F]/[0.08] border-[#1E3A5F] ring-1 ring-[#1E3A5F]/30"
                            : "bg-white border-gray-200"
                        }`}
                      >
                        <div>
                          <p className="font-bold text-gray-900">{q.carrier}</p>
                          <p className="text-[10px] text-gray-500">Status: {q.status}</p>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="font-bold text-[#1E3A5F]">${q.amount?.toLocaleString()}/yr</span>
                          <button
                            type="button"
                            onClick={() => handleSelectCarrier(q.carrier)}
                            className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all ${
                              isSelected
                                ? "bg-[#1E3A5F] text-white"
                                : "bg-gray-100 hover:bg-gray-200 text-gray-700"
                            }`}
                          >
                            {isSelected ? "Selected ✓" : "Select"}
                          </button>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <p className="text-xs text-gray-400 italic text-center py-2">No quotes added yet.</p>
                )}
              </div>

              {/* Add Quote Form */}
              <form onSubmit={handleAddQuote} className="pt-2 flex items-center gap-2 border-t border-gray-200">
                <Input
                  type="text"
                  placeholder="Carrier Name (e.g. Travelers)"
                  value={carrierInput}
                  onChange={(e) => setCarrierInput(e.target.value)}
                  className="text-xs h-8"
                />
                <Input
                  type="number"
                  placeholder="Annual Quote $"
                  value={amountInput}
                  onChange={(e) => setAmountInput(e.target.value)}
                  className="text-xs h-8 w-28"
                />
                <Button type="submit" size="sm" className="bg-[#1E3A5F] hover:bg-[#15294A] text-white text-xs h-8 shrink-0">
                  + Quote
                </Button>
              </form>
            </div>

            {/* Insight Tip */}
            <div className="p-3 rounded-lg bg-[#1E3A5F]/[0.04] border border-[#1E3A5F]/10 flex items-start gap-2 text-xs text-[#1E3A5F]/80">
              <Lightbulb size={16} className="shrink-0 text-[#1E3A5F] mt-0.5" />
              <p>
                <strong>Pro-Tip:</strong> Finalizing carrier selection by Sept 20 ensures policy documentation is issued prior to November deadline, keeping Pulse Score at 100/100.
              </p>
            </div>

            {/* Complete Renewal Button */}
            <div className="pt-2 border-t border-gray-100 flex items-center justify-between">
              <span className="text-xs text-gray-500">Current Policy Expiry: {insuranceItem.expires}</span>
              <Button
                onClick={handleCompletePolicyRenewal}
                className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs md:text-sm font-bold"
              >
                <ShieldCheck size={14} className="mr-1.5" /> Complete Policy Renewal
              </Button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default InsuranceWorkflowModal;
