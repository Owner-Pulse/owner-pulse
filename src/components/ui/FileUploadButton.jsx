import React, { forwardRef, useRef } from "react";
import { cn } from "@/lib/utils";

/** Primary navy upload trigger — matches Owner Pulse dashboard actions */
export const themeUploadButtonClass =
  "cursor-pointer inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-[#1E3A5F] hover:bg-[#15294A] text-white text-xs sm:text-sm font-semibold shadow-sm transition-colors disabled:opacity-50 disabled:pointer-events-none";

function assignRef(ref, node) {
  if (!ref) return;
  if (typeof ref === "function") ref(node);
  else ref.current = node;
}

/**
 * Hidden file input + visible "Upload" button.
 * The input stays off-screen (not display:none) so the browser will open the file picker.
 * Forwarded ref points at the input so dropzones can call .click() too.
 */
export const FileUploadButton = forwardRef(function FileUploadButton(
  {
    accept,
    multiple = false,
    disabled = false,
    onFileSelect,
    buttonText = "Upload",
    className,
    buttonClassName,
    resetOnSelect = true,
    children,
    ...inputProps
  },
  forwardedRef
) {
  const inputRef = useRef(null);

  const setInputRef = (node) => {
    inputRef.current = node;
    assignRef(forwardedRef, node);
  };

  const handleChange = (e) => {
    const files = e.target.files;
    if (!files?.length) return;
    if (multiple) {
      onFileSelect?.(Array.from(files));
    } else {
      onFileSelect?.(files[0]);
    }
    if (resetOnSelect) {
      e.target.value = "";
    }
  };

  return (
    <div className={cn("inline-flex items-center", className)}>
      <button
        type="button"
        disabled={disabled}
        onClick={() => inputRef.current?.click()}
        className={cn(themeUploadButtonClass, buttonClassName)}
      >
        {children ?? buttonText}
      </button>
      <input
        {...inputProps}
        ref={setInputRef}
        type="file"
        accept={accept}
        multiple={multiple}
        disabled={disabled}
        tabIndex={-1}
        onChange={handleChange}
        className="sr-only"
      />
    </div>
  );
});

/**
 * Label + Upload button + selected file name (replaces native "Choose File" row).
 */
export function FileUploadField({
  label,
  required,
  hint,
  fileName,
  emptyHint = "No file chosen",
  showFileHint = true,
  labelClassName,
  inputRef,
  ...buttonProps
}) {
  return (
    <div>
      {label && (
        <p className={cn("block text-xs font-semibold text-gray-700 mb-1.5", labelClassName)}>
          {label}
          {required && <span className="text-red-500"> *</span>}
        </p>
      )}
      <div className="flex flex-wrap items-center gap-3">
        <FileUploadButton ref={inputRef} {...buttonProps} />
        {showFileHint &&
          (fileName ? (
            <span className="text-xs text-gray-600 font-medium truncate max-w-md">{fileName}</span>
          ) : (
            <span className="text-xs text-gray-400">{emptyHint}</span>
          ))}
      </div>
      {hint && <p className="text-xs text-gray-500 mt-1.5">{hint}</p>}
    </div>
  );
}
