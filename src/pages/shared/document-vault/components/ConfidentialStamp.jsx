const ConfidentialStamp = ({ className = "" }) => (
  <span
    className={`inline-flex items-center justify-center rounded-sm border-2 border-red-600 px-1.5 py-0.5 text-[9px] font-black uppercase tracking-[0.12em] text-red-600 ${className}`}
    style={{ boxShadow: "inset 0 0 0 1px rgba(220,38,38,0.35)" }}
    title="Confidential — Owner only"
  >
    Confidential
  </span>
);

export default ConfidentialStamp;
