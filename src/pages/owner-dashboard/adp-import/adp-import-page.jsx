import React from "react";
import AdpHoursImportPanel from "@/pages/shared/data-import/components/AdpHoursImportPanel";

const AdpImportPage = () => (
  <div className="space-y-6 pb-8">
    <div>
      <h1 className="text-3xl font-bold tracking-tight text-gray-900">ADP Import</h1>
      <p className="text-sm text-gray-500 mt-1">Upload ADP staff hours for payroll.</p>
    </div>
    <AdpHoursImportPanel />
  </div>
);

export default AdpImportPage;
