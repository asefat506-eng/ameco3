import React, { useState } from 'react';
import { Mail, AlertCircle, CheckCircle2, Sparkles } from 'lucide-react';
import { validateEmail } from '../../utils/emailValidation';

interface FormalEmailInputProps {
  id?: string;
  name?: string;
  label?: string;
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
  requiredBadgeText?: string;
}

/**
 * Reusable formal email input component.
 * Validates strict RFC formal email structure as user writes,
 * provides interactive notice for incomplete or malformed emails,
 * blocks spaces automatically, and provides one-click domain typo suggestions.
 */
export const FormalEmailInput: React.FC<FormalEmailInputProps> = ({
  id,
  name,
  label = 'Email Address',
  value,
  onChange,
  placeholder = 'e.g. name@domain.com or user@ameco.et',
  required = true,
  disabled = false,
  className = '',
  inputClassName = '',
  showIcon = true,
  autoComplete = 'email',
  helperText,
  requiredBadgeText,
}) => {
  const [isTouched, setIsTouched] = useState(false);
  const [interactiveWarning, setInteractiveWarning] = useState<string | null>(null);

  const cleanVal = (value || '').trim();
  const validation = isTouched && cleanVal.length > 0 ? validateEmail(cleanVal) : null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let rawVal = e.target.value;

    // Check for space attempt
    if (/\s/.test(rawVal)) {
      setInteractiveWarning('Email addresses cannot contain spaces.');
      rawVal = rawVal.replace(/\s+/g, '');
      setTimeout(() => {
        setInteractiveWarning((cur) => (cur === 'Email addresses cannot contain spaces.' ? null : cur));
      }, 3000);
    } else {
      setInteractiveWarning(null);
    }

    onChange(rawVal);
  };

  const handleBlur = () => {
    setIsTouched(true);
  };

  const handleApplySuggestion = (suggestedEmail: string) => {
    onChange(suggestedEmail);
  };

  return (
    <div className={`space-y-1 ${className}`}>
      <div className="flex items-center justify-between">
        <label htmlFor={id} className="text-xs font-semibold text-slate-700 dark:text-zinc-300 flex items-center space-x-1.5">
          {showIcon && <Mail className="w-3.5 h-3.5 text-[#005BAC] dark:text-blue-400" />}
          <span>{label}</span>
          {required && <span className="text-red-500 font-bold">*</span>}
        </label>

        {requiredBadgeText ? (
          <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold">
            {requiredBadgeText}
          </span>
        ) : validation && validation.isValid ? (
          <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 font-bold flex items-center space-x-0.5">
            <span>Formal Email</span>
          </span>
        ) : null}
      </div>

      <div className="relative">
        <input
          id={id}
          name={name}
          type="email"
          required={required}
          disabled={disabled}
          autoComplete={autoComplete}
          value={value}
          onChange={handleChange}
          onBlur={handleBlur}
          placeholder={placeholder}
          className={`w-full ${showIcon ? 'pl-9' : 'pl-3.5'} pr-9 py-2.5 rounded-xl text-xs bg-slate-50 dark:bg-zinc-900 border text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-zinc-500 transition-all outline-none ${
            interactiveWarning || (validation && !validation.isValid)
              ? 'border-red-400 dark:border-red-600 ring-2 ring-red-400/20'
              : validation && validation.isValid
              ? 'border-emerald-500/80 ring-1 ring-emerald-500/20'
              : 'border-slate-300 dark:border-zinc-800 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:focus:border-blue-400'
          } ${inputClassName}`}
        />

        {showIcon && (
          <Mail className="w-4 h-4 text-slate-400 dark:text-zinc-500 absolute left-3 top-3 pointer-events-none" />
        )}

        {/* Status icons */}
        <div className="absolute right-3 top-2.5 flex items-center space-x-1 pointer-events-none">
          {interactiveWarning && (
            <AlertCircle className="w-4 h-4 text-amber-500 animate-pulse" />
          )}
          {!interactiveWarning && validation && !validation.isValid && (
            <AlertCircle className="w-4 h-4 text-red-500" />
          )}
          {!interactiveWarning && validation && validation.isValid && (
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          )}
        </div>
      </div>

      {/* Domain Suggestion banner if typo detected */}
      {validation && validation.suggestion && (
        <div className="p-1.5 px-2 bg-blue-50 dark:bg-blue-950/70 border border-blue-200 dark:border-blue-800 rounded-lg text-[11px] text-blue-800 dark:text-blue-300 flex items-center justify-between">
          <div className="flex items-center space-x-1.5">
            <Sparkles className="w-3.5 h-3.5 text-blue-500" />
            <span>Did you mean <strong>{validation.suggestion}</strong>?</span>
          </div>
          <button
            type="button"
            onClick={() => handleApplySuggestion(validation.suggestion!)}
            className="text-[10px] font-bold underline hover:text-blue-950 dark:hover:text-white ml-2 cursor-pointer"
          >
            Apply Fix
          </button>
        </div>
      )}

      {/* Live Warning notice on input */}
      {interactiveWarning ? (
        <p className="text-[11px] text-amber-600 dark:text-amber-400 font-medium flex items-center space-x-1 animate-in fade-in">
          <AlertCircle className="w-3 h-3 shrink-0" />
          <span>{interactiveWarning}</span>
        </p>
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
