import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  RefreshCw,
  CheckCircle2,
  Clock,
  DollarSign,
  ArrowRight,
  Lightbulb,
  ShieldCheck,
  Loader2,
  Award,
  Calendar,
  FileCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  useGetInsuranceShopping,
  useAddInsuranceQuote,
  useSelectInsuranceQuote,
  useCompleteInsuranceShopping,
} from "@/hooks/owner-hook/compliance.hook";

const InsuranceWorkflowModal = ({ isOpen, onClose, insuranceItem }) => {
  const [carrierInput, setCarrierInput] = useState("");
  const [amountInput, setAmountInput] = useState("");
  const [coverageInput, setCoverageInput] = useState("");
  const [newExpiryDate, setNewExpiryDate] = useState("2027-09-01");
  const [selectingQuoteId, setSelectingQuoteId] = useState(null);

  // API Hooks
  const { insuranceData, isLoading: isFetchingData, refetch } = useGetInsuranceShopping();
  const { addQuote, isPending: isAddingQuote } = useAddInsuranceQuote();
  const { selectQuote, isPending: isSelectingQuote } = useSelectInsuranceQuote();
  const { completeInsuranceShopping, isPending: isCompleting } = useCompleteInsuranceShopping();

  useEffect(() => {
    if (isOpen) {
      refetch();
    }
  }, [isOpen, refetch]);

  if (!isOpen) return null;

  const currentItem = insuranceItem || {
    id: 1,
    item: "Commercial General Liability & Property Insurance",
  };

  const renewalId = insuranceData?.id || 1;
  const rawStage = insuranceData?.current_stage || "collect_quotes";
  const quotesList = insuranceData?.quotes || [];
  const selectedQuoteId = insuranceData?.selected_quote_id;
  const policyExpiryDate = insuranceData?.policy_expiry_date || currentItem?.expires || "2026-10-07";

  // Compute lowest quote premium among all valid quotes
  const validPremiums = quotesList
    .map((q) => Number(q.annual_premium ?? q.amount ?? 0))
    .filter((p) => p > 0);
  const lowestPremium = validPremiums.length > 0 ? Math.min(...validPremiums) : null;

  // Map API stage names to timeline stepper IDs
  const stageMap = {
    shopping: "collect_quotes",
    collect_quotes: "collect_quotes",
    quotes_received: "select_carrier",
    select_carrier: "select_carrier",
    carrier_selected: "select_carrier",
    completed: "policy_issued",
    policy_issued: "policy_issued",
  };
  const activeStageId = stageMap[rawStage] || "collect_quotes";

  const handleAddQuote = async (e) => {
    e.preventDefault();
    if (!carrierInput.trim() || !amountInput) return;
    await addQuote({
      insurance_renewal_id: renewalId,
      carrier_name: carrierInput.trim(),
      annual_premium: parseFloat(amountInput) || amountInput,
      coverage: coverageInput.trim() || "$1M / $2M General Liability",
    });
    setCarrierInput("");
    setAmountInput("");
    setCoverageInput("");
  };

  const handleSelectCarrier = async (quoteId) => {
    setSelectingQuoteId(quoteId);
    try {
      await selectQuote(quoteId);
    } finally {
      setSelectingQuoteId(null);
    }
  };

  const handleCompletePolicyRenewal = async () => {
    await completeInsuranceShopping({
      insurance_renewal_id: renewalId,
      new_policy_expiry_date: newExpiryDate,
    });
    onClose();
  };

  const stages = [
    { id: "reminder_set", title: "60-Day Shop Window", date: "Sept 1, 2026", desc: "Shopping reminder triggered" },
    { id: "collect_quotes", title: "Collect Quotes", date: "Sept 5, 2026", desc: "Get 2-3 quotes from carriers" },
    { id: "select_carrier", title: "Select Carrier", date: "Sept 20, 2026", desc: "Compare & select best carrier" },
    { id: "policy_issued", title: "Policy Issued & Renewed", date: "Oct 15, 2026", desc: "Upload policy & update expiry" },
  ];

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="relative w-full max-w-3xl bg-white rounded-2xl shadow-2xl overflow-hidden my-8 border border-gray-100"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 bg-[#1E3A5F] text-white">
            <div className="flex items-center gap-2">
              <RefreshCw size={20} className="text-[#9DB8D9]" />
              <h2 className="text-base md:text-lg font-bold">Insurance Renewal & Shopping Workflow</h2>
            </div>
            <button onClick={onClose} className="p-1 text-white/80 hover:text-white rounded-lg cursor-pointer">
              <X size={20} />
            </button>
          </div>

          <div className="p-6 space-y-6 max-h-[82vh] overflow-y-auto">
            {isFetchingData ? (
              <div className="py-12 flex flex-col items-center justify-center space-y-3">
                <Loader2 size={32} className="animate-spin text-[#1E3A5F]" />
                <p className="text-xs text-gray-500 font-medium">Loading insurance pipeline data...</p>
              </div>
            ) : (
              <>
                {/* Timeline Stepper */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-center">
                  {stages.map((stg, i) => {
                    const activeIdx = stages.findIndex((s) => s.id === activeStageId);
                    const isCurrent = activeStageId === stg.id;
                    const isPast = activeIdx > i || activeStageId === "policy_issued";

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

                {/* ── Carrier Quotes Section — Side-by-Side Cards (B-05) ── */}
                <div className="p-4 rounded-xl bg-gray-50/80 border border-gray-200 space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                    <div>
                      <h4 className="text-xs font-extrabold text-gray-900 flex items-center gap-1.5 uppercase tracking-wider">
                        <DollarSign size={14} className="text-[#1E3A5F]" /> Side-by-Side Carrier Quote Cards
                      </h4>
                      <p className="text-[11px] text-gray-500">Compare quotes directly with automatic lowest premium highlighting</p>
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#1E3A5F]/10 text-[#1E3A5F]">
                      {quotesList.length} Quotes Received
                    </span>
                  </div>

                  {/* Side-by-Side Cards Grid */}
                  {quotesList.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                      {quotesList.map((q, idx) => {
                        const isSelected = q.is_selected || selectedQuoteId === q.id;
                        const isThisSelecting = selectingQuoteId === q.id;
                        const carrierName = q.carrier_name || q.carrier || `Carrier #${idx + 1}`;
                        const premium = Number(q.annual_premium ?? q.amount ?? 0);
                        const isLowest = lowestPremium !== null && premium === lowestPremium;
                        const coverageText = q.coverage || "$1M / $2M General Liability";
                        const expiryText = q.expiry_date || q.policy_expiry_date || policyExpiryDate;

                        return (
                          <div
                            key={q.id || idx}
                            className={`relative p-4 rounded-xl border flex flex-col justify-between transition-all duration-300 hover:shadow-md ${
                              isLowest
                                ? "bg-[#3E7A54]/[0.06] border-[#3E7A54] ring-2 ring-[#3E7A54]/30 shadow-sm"
                                : isSelected
                                ? "bg-[#1E3A5F]/[0.08] border-[#1E3A5F] ring-1 ring-[#1E3A5F]/30"
                                : "bg-white border-gray-200"
                            }`}
                          >
                            {/* Lowest Highlight Badge */}
                            {isLowest && (
                              <div className="mb-2">
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-[#3E7A54] text-white shadow-xs">
                                  <Award size={10} /> Lowest Quote
                                </span>
                              </div>
                            )}

                            <div>
                              <div className="flex items-start justify-between gap-1 mb-1">
                                <h5 className="font-bold text-gray-900 text-sm">{carrierName}</h5>
                                {isSelected && (
                                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded">
                                    Active
                                  </span>
                                )}
                              </div>

                              <p className="text-xl font-black text-[#1E3A5F] my-1">
                                ${premium.toLocaleString()}<span className="text-xs font-normal text-gray-500">/yr</span>
                              </p>

                              <div className="space-y-1.5 mt-3 text-[11px] text-gray-600">
                                <div className="flex items-center gap-1.5 bg-gray-100/70 p-1.5 rounded-md">
                                  <FileCheck size={12} className="text-[#1E3A5F] shrink-0" />
                                  <span className="font-medium truncate" title={coverageText}>{coverageText}</span>
                                </div>
                                <div className="flex items-center gap-1.5 px-1.5 py-0.5">
                                  <Calendar size={12} className="text-gray-400 shrink-0" />
                                  <span>Expires: {expiryText}</span>
                                </div>
                              </div>
                            </div>

                            <div className="mt-4 pt-3 border-t border-gray-100">
                              <button
                                type="button"
                                disabled={isThisSelecting || isSelectingQuote}
                                onClick={() => handleSelectCarrier(q.id)}
                                className={`w-full py-1.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1 ${
                                  isSelected
                                    ? "bg-[#1E3A5F] text-white shadow-xs"
                                    : isLowest
                                    ? "bg-[#3E7A54] hover:bg-[#2F6042] text-white shadow-xs"
                                    : "bg-gray-100 hover:bg-gray-200 text-gray-800"
                                } disabled:opacity-60 cursor-pointer`}
                              >
                                {isThisSelecting ? (
                                  <>
                                    <Loader2 size={12} className="animate-spin text-white" /> Selecting...
                                  </>
                                ) : isSelected ? (
                                  "Selected Carrier ✓"
                                ) : (
                                  "Select Quote"
                                )}
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="p-6 text-center bg-white rounded-xl border border-dashed border-gray-200">
                      <p className="text-xs text-gray-400 italic">
                        No carrier quotes submitted yet. Use the form below to add carrier quotes for side-by-side comparison.
                      </p>
                    </div>
                  )}

                  {/* Add Quote Form */}
                  <form onSubmit={handleAddQuote} className="pt-3 border-t border-gray-200 space-y-2">
                    <p className="text-[10px] font-bold text-gray-700 uppercase tracking-wider">Add New Carrier Quote</p>
                    <div className="flex flex-col sm:flex-row items-center gap-2">
                      <Input
                        type="text"
                        placeholder="Carrier Name (e.g. Travelers)"
                        value={carrierInput}
                        disabled={isAddingQuote}
                        onChange={(e) => setCarrierInput(e.target.value)}
                        className="text-xs h-8 flex-1"
                      />
                      <Input
                        type="number"
                        placeholder="Annual Premium $"
                        value={amountInput}
                        disabled={isAddingQuote}
                        onChange={(e) => setAmountInput(e.target.value)}
                        className="text-xs h-8 w-full sm:w-32"
                      />
                      <Input
                        type="text"
                        placeholder="Coverage (optional)"
                        value={coverageInput}
                        disabled={isAddingQuote}
                        onChange={(e) => setCoverageInput(e.target.value)}
                        className="text-xs h-8 flex-1"
                      />
                      <Button
                        type="submit"
                        size="sm"
                        disabled={isAddingQuote || !carrierInput.trim() || !amountInput}
                        className="bg-[#1E3A5F] hover:bg-[#15294A] text-white text-xs h-8 shrink-0 flex items-center gap-1 w-full sm:w-auto"
                      >
                        {isAddingQuote ? (
                          <>
                            <Loader2 size={12} className="animate-spin text-white" /> Adding...
                          </>
                        ) : (
                          "+ Add Quote Card"
                        )}
                      </Button>
                    </div>
                  </form>
                </div>

                {/* Insight Tip */}
                <div className="p-3 rounded-lg bg-[#1E3A5F]/[0.04] border border-[#1E3A5F]/10 flex items-start gap-2 text-xs text-[#1E3A5F]/80">
                  <Lightbulb size={16} className="shrink-0 text-[#1E3A5F] mt-0.5" />
                  <p>
                    <strong>Pro-Tip:</strong> Finalizing carrier selection by Sept 20 ensures policy documentation is issued prior to October/November deadline, keeping Pulse Score at 100/100.
                  </p>
                </div>

                {/* Complete Renewal Controls */}
                <div className="pt-3 border-t border-gray-100 space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-2 text-xs text-gray-600">
                      <span>Current Expiry: <strong>{policyExpiryDate}</strong></span>
                    </div>
                    <div className="flex items-center gap-2">
                      <label className="text-xs text-gray-500 font-medium">New Expiry:</label>
                      <Input
                        type="date"
                        value={newExpiryDate}
                        disabled={isCompleting}
                        onChange={(e) => setNewExpiryDate(e.target.value)}
                        className="text-xs h-8 w-36"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <Button
                      onClick={handleCompletePolicyRenewal}
                      disabled={isCompleting}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs md:text-sm font-bold flex items-center gap-1.5"
                    >
                      {isCompleting ? (
                        <>
                          <Loader2 size={14} className="animate-spin text-white" /> Completing...
                        </>
                      ) : (
                        <>
                          <ShieldCheck size={14} /> Complete Policy Renewal
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default InsuranceWorkflowModal;
