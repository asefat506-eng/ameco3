import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  RefreshCw,
  Volume2,
  CheckCircle2,
  AlertCircle,
  Lock,
  Bot,
} from 'lucide-react';

interface CaptchaVerificationProps {
  idPrefix: string;
  isVerified: boolean;
  onVerifyChange: (verified: boolean) => void;
  className?: string;
  errorMessage?: string;
  autoFocus?: boolean;
}

// Alphanumeric character pool with clearly distinguishable mixed-case letters and numbers
// Omits visually ambiguous characters like 0, O, o, 1, I, l, etc.
const CHAR_SET = '23456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz';

function generateRandomCode(length = 6): string {
  let result = '';
  // Ensure mixed uppercase, lowercase, and numbers in the generated code
  const upperPool = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
  const lowerPool = 'abcdefghijkmnpqrstuvwxyz';
  const numPool = '23456789';

  // Seed with at least one upper, one lower, one number
  const seed = [
    upperPool[Math.floor(Math.random() * upperPool.length)],
    lowerPool[Math.floor(Math.random() * lowerPool.length)],
    numPool[Math.floor(Math.random() * numPool.length)],
  ];

  for (let i = 3; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * CHAR_SET.length);
    seed.push(CHAR_SET[randomIndex]);
  }

  // Shuffle the seeded array
  for (let i = seed.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [seed[i], seed[j]] = [seed[j], seed[i]];
  }

  return seed.join('');
}

export const CaptchaVerification: React.FC<CaptchaVerificationProps> = ({
  idPrefix,
  isVerified,
  onVerifyChange,
  className = '',
  errorMessage,
  autoFocus = false,
}) => {
  const [captchaCode, setCaptchaCode] = useState<string>('');
  const [userInput, setUserInput] = useState<string>('');
  const [hasInteracted, setHasInteracted] = useState<boolean>(false);
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [isAudioAvailable, setIsAudioAvailable] = useState<boolean>(true);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Generate new captcha code and redraw
  const refreshCaptcha = useCallback(() => {
    const newCode = generateRandomCode(6);
    setCaptchaCode(newCode);
    setUserInput('');
    onVerifyChange(false);
    setHasInteracted(false);
  }, [onVerifyChange]);

  // Initial generation
  useEffect(() => {
    refreshCaptcha();
    if (typeof window !== 'undefined' && !('speechSynthesis' in window)) {
      setIsAudioAvailable(false);
    }
  }, []);

  // Draw captcha onto canvas whenever captchaCode changes
  useEffect(() => {
    if (!canvasRef.current || !captchaCode) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;

    // Background gradient
    const isDarkMode = document.documentElement.classList.contains('dark');
    const bgGradient = ctx.createLinearGradient(0, 0, width, height);
    if (isDarkMode) {
      bgGradient.addColorStop(0, '#0f172a');
      bgGradient.addColorStop(0.5, '#1e293b');
      bgGradient.addColorStop(1, '#0f172a');
    } else {
      bgGradient.addColorStop(0, '#f1f5f9');
      bgGradient.addColorStop(0.5, '#e2e8f0');
      bgGradient.addColorStop(1, '#f8fafc');
    }
    ctx.fillStyle = bgGradient;
    ctx.fillRect(0, 0, width, height);

    // Draw background grid/dots noise
    for (let i = 0; i < 40; i++) {
      ctx.beginPath();
      ctx.arc(
        Math.random() * width,
        Math.random() * height,
        Math.random() * 2 + 0.5,
        0,
        Math.PI * 2
      );
      ctx.fillStyle = isDarkMode
        ? `rgba(148, 163, 184, ${Math.random() * 0.35 + 0.1})`
        : `rgba(100, 116, 139, ${Math.random() * 0.35 + 0.1})`;
      ctx.fill();
    }

    // Draw interference curved lines
    for (let i = 0; i < 4; i++) {
      ctx.beginPath();
      ctx.moveTo(Math.random() * width * 0.3, Math.random() * height);
      ctx.bezierCurveTo(
        Math.random() * width,
        Math.random() * height,
        Math.random() * width,
        Math.random() * height,
        Math.random() * width * 0.7 + width * 0.3,
        Math.random() * height
      );
      ctx.strokeStyle = isDarkMode
        ? `rgba(56, 189, 248, ${Math.random() * 0.35 + 0.15})`
        : `rgba(2, 132, 199, ${Math.random() * 0.35 + 0.15})`;
      ctx.lineWidth = Math.random() * 2 + 1;
      ctx.stroke();
    }

    // Draw each character with slight rotation and distortion
    const charWidth = (width - 30) / captchaCode.length;
    const fonts = ['bold 26px monospace', 'bold 28px sans-serif', '900 27px Courier New', 'bold 29px Arial'];
    const colors = isDarkMode
      ? ['#38bdf8', '#818cf8', '#34d399', '#f472b6', '#fbbf24', '#a78bfa']
      : ['#0284c7', '#4f46e5', '#059669', '#db2777', '#d97706', '#7c3aed'];

    for (let i = 0; i < captchaCode.length; i++) {
      const char = captchaCode[i];
      const x = 16 + i * charWidth;
      const y = height / 2 + 8 + (Math.random() * 6 - 3);
      const angle = (Math.random() * 32 - 16) * (Math.PI / 180);

      ctx.save();
      ctx.translate(x + 10, y - 4);
      ctx.rotate(angle);
      ctx.font = fonts[Math.floor(Math.random() * fonts.length)];
      ctx.fillStyle = colors[i % colors.length];
      ctx.shadowColor = isDarkMode ? 'rgba(0,0,0,0.8)' : 'rgba(0,0,0,0.15)';
      ctx.shadowOffsetX = 1;
      ctx.shadowOffsetY = 1;
      ctx.shadowBlur = 2;
      ctx.fillText(char, -10, 4);
      ctx.restore();
    }

    // Draw foreground strike-through line
    ctx.beginPath();
    ctx.moveTo(10, Math.random() * (height - 20) + 10);
    ctx.lineTo(width - 10, Math.random() * (height - 20) + 10);
    ctx.strokeStyle = isDarkMode ? 'rgba(248, 113, 113, 0.4)' : 'rgba(239, 68, 68, 0.35)';
    ctx.lineWidth = 1.5;
    ctx.stroke();
  }, [captchaCode]);

  // Handle user input verification (strictly case-sensitive)
  const handleInputChange = (val: string) => {
    // Preserve exact case, only strip non-alphanumeric characters, max 6 characters
    const formatted = val.replace(/[^a-zA-Z0-9]/g, '').slice(0, 6);
    setUserInput(formatted);
    setHasInteracted(true);

    if (formatted.length === captchaCode.length) {
      if (formatted === captchaCode) {
        onVerifyChange(true);
      } else {
        onVerifyChange(false);
      }
    } else {
      onVerifyChange(false);
    }
  };

  // Text-to-Speech audio reading of characters with explicit case announcement
  const handlePlayAudio = () => {
    if (!('speechSynthesis' in window) || !captchaCode) return;
    window.speechSynthesis.cancel();

    setIsSpeaking(true);
    // Spell characters letter by letter with case clarification
    const spokenLetters = captchaCode
      .split('')
      .map((c) => {
        if (/[A-Z]/.test(c)) return `Capital ${c}`;
        if (/[a-z]/.test(c)) return `Small ${c}`;
        return `Number ${c}`;
      })
      .join(', ');

    const spokenText = `Security verification code: ${spokenLetters}. Please note the code is case sensitive. Repeat: ${spokenLetters}.`;
    const utterance = new SpeechSynthesisUtterance(spokenText);
    utterance.rate = 0.85;
    utterance.pitch = 1.0;
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.speak(utterance);
  };

  const isCaseMismatch =
    hasInteracted &&
    userInput.length === captchaCode.length &&
    userInput.toLowerCase() === captchaCode.toLowerCase() &&
    userInput !== captchaCode;

  const isInputMismatch =
    hasInteracted && userInput.length >= captchaCode.length && userInput !== captchaCode;

  return (
    <div
      id={`${idPrefix}-captcha-container`}
      className={`p-3.5 rounded-2xl border transition-all ${
        isVerified
          ? 'bg-emerald-50/70 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-700/80'
          : isInputMismatch
          ? 'bg-red-50/50 dark:bg-red-950/30 border-red-300 dark:border-red-800/80'
          : 'bg-slate-50 dark:bg-zinc-900/90 border-slate-200 dark:border-zinc-800'
      } ${className}`}
    >
      {/* Header Label */}
      <div className="flex items-center justify-between mb-2.5">
        <div className="flex items-center space-x-1.5">
          <div
            className={`w-6 h-6 rounded-lg flex items-center justify-center ${
              isVerified
                ? 'bg-emerald-500 text-white'
                : 'bg-blue-100 dark:bg-blue-950 text-[#005BAC] dark:text-blue-400'
            }`}
          >
            {isVerified ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Bot className="w-3.5 h-3.5" />}
          </div>
          <span className="text-xs font-bold text-slate-800 dark:text-zinc-200">
            Human Security Verification (CAPTCHA) *
          </span>
        </div>

        {isVerified ? (
          <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 flex items-center space-x-1">
            <CheckCircle2 className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
            <span>Verified</span>
          </span>
        ) : (
          <span className="text-[10px] font-semibold text-slate-400 dark:text-zinc-500">
            Anti-Bot Shield
          </span>
        )}
      </div>

      {/* Visual Canvas + Audio + Refresh Row */}
      <div className="space-y-2.5">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
          {/* Canvas Box */}
          <div className="relative rounded-xl overflow-hidden border border-slate-300 dark:border-zinc-700 shadow-inner bg-slate-100 dark:bg-zinc-950 shrink-0 flex items-center justify-center">
            <canvas
              ref={canvasRef}
              width={180}
              height={50}
              className="block cursor-pointer select-none"
              title="Click to refresh CAPTCHA code"
              onClick={refreshCaptcha}
            />
            {/* Quick overlay indicator on hover */}
            <div
              onClick={refreshCaptcha}
              className="absolute inset-0 bg-black/0 hover:bg-black/10 dark:hover:bg-white/5 transition-colors cursor-pointer flex items-center justify-end pr-2 opacity-0 hover:opacity-100"
              title="Click to generate new code"
            >
              <RefreshCw className="w-4 h-4 text-slate-600 dark:text-zinc-300 bg-white/80 dark:bg-black/80 rounded p-0.5" />
            </div>
          </div>

          {/* Action Tools (Refresh & Audio) */}
          <div className="flex items-center space-x-1.5 shrink-0">
            <button
              type="button"
              id={`${idPrefix}-captcha-refresh-btn`}
              onClick={refreshCaptcha}
              className="p-2 rounded-xl bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-slate-700 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-700 hover:text-slate-900 transition-colors shadow-xs flex items-center justify-center cursor-pointer"
              title="Generate a new security code"
            >
              <RefreshCw className="w-4 h-4" />
            </button>

            {isAudioAvailable && (
              <button
                type="button"
                id={`${idPrefix}-captcha-audio-btn`}
                onClick={handlePlayAudio}
                disabled={isSpeaking}
                className={`p-2 rounded-xl bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-slate-700 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-700 hover:text-slate-900 transition-colors shadow-xs flex items-center justify-center cursor-pointer ${
                  isSpeaking ? 'animate-pulse text-[#005BAC] dark:text-blue-400' : ''
                }`}
                title="Listen to the security code audio"
              >
                {isSpeaking ? <Volume2 className="w-4 h-4 text-blue-500" /> : <Volume2 className="w-4 h-4" />}
              </button>
            )}
          </div>
        </div>

        {/* Input Box for CAPTCHA typing */}
        <div className="relative">
          <input
            type="text"
            id={`${idPrefix}-captcha-input`}
            autoFocus={autoFocus}
            value={userInput}
            onChange={(e) => handleInputChange(e.target.value)}
            maxLength={6}
            placeholder="Enter exact 6-char code (Case-Sensitive)"
            className={`w-full pl-3.5 pr-10 py-2 rounded-xl bg-white dark:bg-zinc-950 border font-mono tracking-widest text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-zinc-500 focus:outline-none transition-colors ${
              isVerified
                ? 'border-emerald-500 ring-2 ring-emerald-400/20'
                : isInputMismatch
                ? 'border-red-500 ring-2 ring-red-400/20'
                : 'border-slate-300 dark:border-zinc-700 focus:ring-2 focus:ring-slate-400 dark:focus:ring-zinc-500'
            }`}
          />
          <div className="absolute right-3 top-2.5 flex items-center space-x-1">
            {isVerified ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-500 animate-in zoom-in-50 duration-150" />
            ) : isInputMismatch ? (
              <AlertCircle className="w-4 h-4 text-red-500" />
            ) : (
              <span className="text-[10px] font-mono text-slate-400 dark:text-zinc-500">
                {userInput.length}/6
              </span>
            )}
          </div>
        </div>

        {/* Status / Error feedback */}
        {isCaseMismatch ? (
          <p className="text-[11px] text-amber-600 dark:text-amber-400 flex items-center space-x-1">
            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
            <span>Case Mismatch: CAPTCHA is case-sensitive (distinguishes A-Z and a-z).</span>
          </p>
        ) : isInputMismatch ? (
          <p className="text-[11px] text-red-600 dark:text-red-400 flex items-center space-x-1">
            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
            <span>Code does not match. Please re-enter or click refresh.</span>
          </p>
        ) : null}

        {errorMessage && !isVerified && (
          <p className="text-[11px] text-red-600 dark:text-red-400 flex items-center space-x-1">
            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
            <span>{errorMessage}</span>
          </p>
        )}

        {/* Help footer */}
        <div className="flex items-center justify-between text-[10px] text-slate-500 dark:text-zinc-400 pt-0.5">
          <span className="font-medium text-slate-600 dark:text-zinc-400">
            Case-Sensitive (A-Z, a-z, 0-9)
          </span>
          <span className="flex items-center space-x-1">
            <Lock className="w-2.5 h-2.5" />
            <span>AMECO Security Gateway</span>
          </span>
        </div>
      </div>
    </div>
  );
};
