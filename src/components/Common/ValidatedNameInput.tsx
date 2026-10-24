import React, { useState } from 'react';
import { User, AlertCircle, CheckCircle2, Languages } from 'lucide-react';
import { filterLettersOnly, validateName, detectNameScript } from '../../utils/nameValidation';

interface ValidatedNameInputProps {
  id?: string;
  name?: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  className?: string;
  inputClassName?: string;
  showIcon?: boolean;
  autoComplete?: string;
  helperText?: string;
}

/**
 * Reusable input for person names and institution contact names.
 * Enforces strictly letters-only (English Latin & Amharic Ethiopic script).
 * Intercepts numbers and special symbols on keystroke, displays interactive instant notices,
 * and shows real-time validation feedback.
 */
export const ValidatedNameInput: React.FC<ValidatedNameInputProps> = ({
  id,
  name,
  label,
  value,
  onChange,
  placeholder = 'Enter name (letters only)',
  required = false,
  disabled = false,
  className = '',
  inputClassName = '',
  showIcon = true,
  autoComplete = 'name',
  helperText,
}) => {
  const [interactiveWarning, setInteractiveWarning] = useState<string | null>(null);
  const [isTouched, setIsTouched] = useState(false);

  const script = detectNameScript(value);
  const validation = isTouched && value.length > 0 ? validateName(value, label) : null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawVal = e.target.value;
    
    // Check if input contained forbidden characters (numbers or symbols)
    const { cleaned, hadInvalidChar, invalidCharMessage } = filterLettersOnly(rawVal);

    if (hadInvalidChar) {
      setInteractiveWarning(invalidCharMessage || 'Only letters (A-Z or Amharic) are allowed. Numbers and symbols cannot be entered.');
      setTimeout(() => {
        setInteractiveWarning((current) => (current === invalidCharMessage ? null : current));
      }, 3500);
    } else {
      setInteractiveWarning(null);
    }

    onChange(cleaned);
  };

  const handleBlur = () => {
    setIsTouched(true);
  };

  return (
    <div className={`space-y-1 ${className}`}>
      <div className="flex items-center justify-between">
        <label htmlFor={id} className="text-xs font-semibold text-slate-700 dark:text-zinc-300 flex items-center space-x-1">
          {showIcon && <User className="w-3.5 h-3.5 text-slate-400 dark:text-zinc-500" />}
          <span>{label}</span>
          {required && <span className="text-red-500 font-bold">*</span>}
        </label>

        {/* Script badge & validation indicator */}
        {value.trim().length >= 2 && !interactiveWarning && (
          <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400 flex items-center space-x-1">
            <Languages className="w-3 h-3 text-slate-500" />
            <span>{script === 'amharic' ? 'Amharic' : script === 'english' ? 'English' : 'Letters'}</span>
          </span>
        )}
      </div>

      <div className="relative">
        <input
          id={id}
          name={name}
          type="text"
          required={required}
          disabled={disabled}
          autoComplete={autoComplete}
          value={value}
          onChange={handleChange}
          onBlur={handleBlur}
          placeholder={placeholder}
          className={`w-full px-3.5 py-2.5 rounded-xl text-xs bg-slate-50 dark:bg-zinc-900 border text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-zinc-500 transition-all outline-none ${
            interactiveWarning || (validation && !validation.isValid)
              ? 'border-amber-500 ring-2 ring-amber-500/20 dark:border-amber-500'
              : validation && validation.isValid
              ? 'border-emerald-500/80 ring-1 ring-emerald-500/20'
              : 'border-slate-300 dark:border-zinc-800 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:focus:border-blue-400'
          } ${inputClassName}`}
        />

        {/* Status icons */}
        <div className="absolute right-3 top-2.5 flex items-center space-x-1 pointer-events-none">
          {interactiveWarning && (
            <AlertCircle className="w-4 h-4 text-amber-500 animate-pulse" />
          )}
          {!interactiveWarning && validation && validation.isValid && (
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          )}
        </div>
      </div>

      {/* Live Notice / Warning message for wrong inputs */}
      {interactiveWarning ? (
        <div className="p-1.5 px-2 bg-amber-50 dark:bg-amber-950/70 border border-amber-200 dark:border-amber-800/80 rounded-lg text-[11px] text-amber-800 dark:text-amber-300 flex items-center space-x-1.5 animate-in fade-in slide-in-from-top-1 duration-150">
          <AlertCircle className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 shrink-0" />
          <span className="font-medium">{interactiveWarning}</span>
        </div>
      ) : validation && !validation.isValid ? (
        <p className="text-[11px] text-red-600 dark:text-red-400 font-medium flex items-center space-x-1">
          <AlertCircle className="w-3 h-3 shrink-0" />
          <span>{validation.error}</span>
        </p>
      ) : helperText ? (
        <p className="text-[11px] text-slate-500 dark:text-zinc-400">{helperText}</p>
      ) : null}
    </div>
  );
};
