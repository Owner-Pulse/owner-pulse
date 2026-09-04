import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  UploadCloud,
  FileSpreadsheet,
  CheckCircle2,
  AlertCircle,
  Loader2,
  FileText,
  Trash2,
  Info,
  Database,
  Layers,
  Clock,
  ArrowRight,
  RefreshCw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import toast from "react-hot-toast";
import { useGetCsvFileTypes, useUploadCsv } from "@/hooks/owner-hook/csv-manage.hook";

// Default fallback options provided by the API specs
const DEFAULT_FILE_TYPES = [
  {
    key: "procare",
    label: "Procare Main (Persons & Accounts)",
    description: "Imports master Persons, Accounts, Addresses, Phones, and Account-Person links.",
    default_file: "procare-OK.csv",
  },
  {
    key: "students",
    label: "Enrolled Students & Classrooms",
    description: "Imports Children, Classrooms, and Guardian Relationships.",
    default_file: "all enrolled students.csv",
  },
  {
    key: "employees",
    label: "Employee / Staff Info",
    description: "Imports Staff, Employees, and Work Area Classrooms.",
    default_file: "emplyee info.csv",
  },
  {
    key: "ledger",
    label: "Account Ledger Entries",
    description: "Imports financial ledger card transactions.",
    default_file: "account ledger-OK.csv",
  },
  {
    key: "billing",
    label: "Billing Activities",
    description: "Imports billing charges, credits, and ledger cycles.",
    default_file: "billing ativity-OK.csv",
  },
  {
    key: "billing_box",
    label: "Billing Box Activity",
    description: "Imports billing box enrollment schedules.",
    default_file: "billing box activity enrollemnt.csv",
  },
  {
    key: "enrollment",
    label: "Enrollment Status Logs",
    description: "Imports historical child enrollment status logs.",
    default_file: "all enrollment data all active OK.csv",
  },
  {
    key: "timeclock",
    label: "Children Live Time Clock",
    description: "Imports live real-time child check-in and check-out entries.",
    default_file: "Current Time clock in childrent- OK.csv",
  },
  {
    key: "timecard",
    label: "Child Time Card Entries",
    description: "Imports historical child timecard punch logs.",
    default_file: "child time card-OK.csv",
  },
  {
    key: "logsheet",
    label: "Child Daily Log Sheets",
    description: "Imports daily log sheet notes and comments for children.",
    default_file: "child log sheet.csv",
  },
  {
    key: "accountinfo",
    label: "Account User Defined Info",
    description: "Imports custom account attributes and MyProcare registration dates.",
    default_file: "accout info user defined-OK.csv",
  },
  {
    key: "scholarship",
    label: "Scholarships & Pending Invoice Payments",
    description: "Imports scholarship payments and pending business invoices.",
    default_file: "ReportingExport_8_17_2026 12_41_51 PM-pending invpice paymeny scholorship (1).csv",
  },
];

const formatFileSize = (bytes) => {
  if (!bytes || bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
};

const CsvUploadModal = ({ isOpen, onClose }) => {
  const fileInputRef = useRef(null);
  const { fileTypes: apiFileTypes, isLoading: isLoadingTypes } = useGetCsvFileTypes();
  const { uploadCsv, isPending, reset: resetMutation } = useUploadCsv();

  // Combine API options with fallback list if needed
  const fileTypesList = (apiFileTypes && apiFileTypes.length > 0) ? apiFileTypes : DEFAULT_FILE_TYPES;

  const [selectedType, setSelectedType] = useState("procare");
  const [selectedFile, setSelectedFile] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [uploadResult, setUploadResult] = useState(null);

  // Set default selected key when options load
  useEffect(() => {
    if (fileTypesList && fileTypesList.length > 0 && !selectedType) {
      setSelectedType(fileTypesList[0].key);
    }
  }, [fileTypesList, selectedType]);

  // Reset modal state on close or open
  const handleReset = () => {
    setSelectedFile(null);
    setUploadResult(null);
    setIsDragging(false);
    resetMutation();
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleCloseModal = () => {
    handleReset();
    onClose();
  };

  if (!isOpen) return null;

  // Selected Option Object
  const currentOption = fileTypesList.find((item) => item.key === selectedType) || fileTypesList[0];

  const handleFileSelect = (file) => {
    if (!file) return;
    if (!file.name.toLowerCase().endsWith(".csv") && file.type !== "text/csv" && file.type !== "application/vnd.ms-excel") {
      toast.error("Invalid file format. Please select a valid CSV (.csv) file.");
      return;
    }
    setSelectedFile(file);
    setUploadResult(null);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedType) {
      toast.error("Please select a CSV file type.");
      return;
    }
    if (!selectedFile) {
      toast.error("Please choose a CSV file to upload.");
      return;
    }

    const formData = new FormData();
    formData.append("type", selectedType);
    formData.append("file", selectedFile);

    try {
      const response = await uploadCsv(formData);
      if (response?.status || response?.code === 200) {
        toast.success(response?.message || "CSV file uploaded and imported successfully!");
        setUploadResult(response?.data || response);
      } else {
        toast.error(response?.message || "Failed to process CSV file.");
      }
    } catch (err) {
      console.error("CSV Upload Error:", err);
      const errMsg = err?.response?.data?.message || err?.message || "An error occurred while uploading the CSV.";
      toast.error(errMsg);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="relative w-full max-w-xl bg-white rounded-2xl shadow-2xl overflow-hidden my-8 border border-gray-100"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4.5 bg-[#1E3A5F] text-white">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/10 rounded-xl">
                <FileSpreadsheet className="text-[#9DB8D9]" size={22} />
              </div>
              <div>
                <h2 className="text-base md:text-lg font-bold tracking-wide">
                  Upload Procare CSV
                </h2>
                <p className="text-xs text-white/70">
                  Import Procare CSV data files into the system
                </p>
              </div>
            </div>
            <button
              onClick={handleCloseModal}
              className="p-1.5 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          {/* Body */}
          <div className="p-6 max-h-[82vh] overflow-y-auto">
            {uploadResult ? (
              /* Success Result View */
              <div className="space-y-5 animate-fadeIn">
                <div className="flex items-center gap-3 p-4 bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-xl">
                  <CheckCircle2 size={28} className="text-emerald-600 shrink-0" />
                  <div>
                    <h4 className="text-sm font-bold text-emerald-900">
                      Import Processed Successfully
                    </h4>
                    <p className="text-xs text-emerald-700 mt-0.5">
                      {uploadResult?.label || currentOption?.label} CSV data has been processed into the system.
                    </p>
                  </div>
                </div>

                {/* Response Metadata Card */}
                <div className="bg-slate-50 rounded-xl border border-slate-200 p-4 space-y-3">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                    <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      Import Summary
                    </span>
                    <span className="text-[11px] font-mono font-medium px-2 py-0.5 bg-slate-200 text-slate-700 rounded">
                      Key: {uploadResult?.option_key || selectedType}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div className="flex items-center gap-2 p-2.5 bg-white rounded-lg border border-slate-100 shadow-2xs">
                      <Database size={16} className="text-[#1E3A5F]" />
                      <div>
                        <p className="text-[10px] text-slate-400">Target Table</p>
                        <p className="font-semibold text-slate-800 truncate">
                          {uploadResult?.target_table || "N/A"}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 p-2.5 bg-white rounded-lg border border-slate-100 shadow-2xs">
                      <Layers size={16} className="text-[#3E7A54]" />
                      <div>
                        <p className="text-[10px] text-slate-400">Total Rows</p>
                        <p className="font-semibold text-slate-800">
                          {uploadResult?.total_rows ?? 0}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 p-2.5 bg-white rounded-lg border border-slate-100 shadow-2xs">
                      <CheckCircle2 size={16} className="text-emerald-600" />
                      <div>
                        <p className="text-[10px] text-slate-400">Imported Rows</p>
                        <p className="font-semibold text-emerald-700">
                          {uploadResult?.imported_rows ?? 0}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 p-2.5 bg-white rounded-lg border border-slate-100 shadow-2xs">
                      <AlertCircle size={16} className="text-amber-500" />
                      <div>
                        <p className="text-[10px] text-slate-400">Skipped Rows</p>
                        <p className="font-semibold text-slate-800">
                          {uploadResult?.skipped_rows ?? 0}
                        </p>
                      </div>
                    </div>
                  </div>

                  {(uploadResult?.file_name || uploadResult?.processed_at) && (
                    <div className="pt-2 text-[11px] text-slate-500 space-y-1">
                      {uploadResult?.file_name && (
                        <p className="truncate">
                          <span className="font-medium text-slate-600">File Name:</span>{" "}
                          <span className="font-mono text-slate-700">{uploadResult.file_name}</span>
                        </p>
                      )}
                      {uploadResult?.processed_at && (
                        <p className="flex items-center gap-1">
                          <Clock size={12} className="text-slate-400" />
                          <span>Processed At: {uploadResult.processed_at}</span>
                        </p>
                      )}
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-end gap-3 pt-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleReset}
                    className="text-xs font-semibold flex items-center gap-1.5"
                  >
                    <RefreshCw size={14} /> Upload Another File
                  </Button>
                  <Button
                    type="button"
                    onClick={handleCloseModal}
                    className="bg-[#1E3A5F] hover:bg-[#15294A] text-white text-xs font-semibold"
                  >
                    Done
                  </Button>
                </div>
              </div>
            ) : (
              /* Upload Form View */
              <form onSubmit={handleSubmit} className="space-y-5">
                {/* File Type Selection */}
                <div>
                  <label className="block text-xs font-bold text-gray-800 mb-1.5 flex items-center justify-between">
                    <span>
                      CSV File Type <span className="text-red-500">*</span>
                    </span>
                    {isLoadingTypes && (
                      <span className="text-[10px] font-normal text-slate-400 flex items-center gap-1">
                        <Loader2 size={10} className="animate-spin" /> Loading options...
                      </span>
                    )}
                  </label>
                  <select
                    value={selectedType}
                    onChange={(e) => setSelectedType(e.target.value)}
                    disabled={isPending}
                    className="w-full h-10 rounded-xl border border-gray-200 bg-slate-50/50 px-3 py-2 text-xs md:text-sm font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#1E3A5F] focus:bg-white transition-all"
                  >
                    {fileTypesList.map((item) => (
                      <option key={item.key} value={item.key}>
                        {item.label}
                      </option>
                    ))}
                  </select>

                  {/* Selected Option Details Card */}
                  {currentOption && (
                    <div className="mt-2.5 p-3 rounded-xl bg-blue-50/60 border border-blue-100 text-xs space-y-1">
                      <div className="flex items-center gap-1.5 font-semibold text-[#1E3A5F]">
                        <Info size={14} className="text-[#1E3A5F] shrink-0" />
                        <span>{currentOption.label}</span>
                      </div>
                      {currentOption.description && (
                        <p className="text-slate-600 text-[11px] leading-relaxed pl-5">
                          {currentOption.description}
                        </p>
                      )}
                      {currentOption.default_file && (
                        <div className="pl-5 pt-1">
                          <span className="inline-flex items-center gap-1 text-[10px] font-mono bg-white px-2 py-0.5 rounded-md border border-blue-200 text-slate-700">
                            <FileText size={10} className="text-blue-500" /> Default file: {currentOption.default_file}
                          </span>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* File Dropzone */}
                <div>
                  <label className="block text-xs font-bold text-gray-800 mb-1.5">
                    Select CSV File <span className="text-red-500">*</span>
                  </label>

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".csv,text/csv,application/vnd.ms-excel"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        handleFileSelect(e.target.files[0]);
                      }
                    }}
                    className="hidden"
                  />

                  {selectedFile ? (
                    <div className="p-4 bg-emerald-50/70 border border-emerald-200 rounded-xl flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="p-2.5 bg-emerald-100 text-emerald-700 rounded-lg shrink-0">
                          <FileSpreadsheet size={24} />
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-slate-800 truncate">
                            {selectedFile.name}
                          </p>
                          <p className="text-[10px] text-slate-500 mt-0.5">
                            {formatFileSize(selectedFile.size)}
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={handleReset}
                        disabled={isPending}
                        className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors shrink-0"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ) : (
                    <div
                      onDragOver={handleDragOver}
                      onDragLeave={handleDragLeave}
                      onDrop={handleDrop}
                      onClick={() => fileInputRef.current?.click()}
                      className={`cursor-pointer p-6 md:p-8 border-2 border-dashed rounded-2xl flex flex-col items-center justify-center text-center transition-all ${
                        isDragging
                          ? "border-[#1E3A5F] bg-[#1E3A5F]/5 scale-[0.99]"
                          : "border-slate-200 bg-slate-50/50 hover:bg-slate-100/50 hover:border-slate-300"
                      }`}
                    >
                      <div className="p-3 bg-white shadow-xs rounded-full border border-slate-100 mb-3 text-[#1E3A5F]">
                        <UploadCloud size={28} />
                      </div>
                      <p className="text-xs md:text-sm font-semibold text-slate-700">
                        Click to browse or drag & drop CSV file
                      </p>
                      <p className="text-[11px] text-slate-400 mt-1">
                        Only <span className="font-medium text-slate-600">.csv</span> files are supported
                      </p>
                    </div>
                  )}
                </div>

                {/* Footer Actions */}
                <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleCloseModal}
                    disabled={isPending}
                    className="text-xs font-semibold"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={isPending || !selectedFile}
                    className="bg-[#1E3A5F] hover:bg-[#15294A] text-white text-xs font-semibold px-5 shadow-sm disabled:opacity-50 flex items-center gap-2"
                  >
                    {isPending ? (
                      <>
                        <Loader2 size={14} className="animate-spin" />
                        Uploading CSV...
                      </>
                    ) : (
                      <>
                        <span>Upload & Import</span>
                        <ArrowRight size={14} />
                      </>
                    )}
                  </Button>
                </div>
              </form>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default CsvUploadModal;
