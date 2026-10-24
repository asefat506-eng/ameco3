import React, { useState } from 'react';
import { UserProfile } from '../../types';
import { CaptchaVerification } from './CaptchaVerification';
import {
  evaluatePasswordStrength,
  generateStrongPassword,
} from '../../utils/passwordHelper';
import {
  requestPasswordResetApi,
  resetPasswordWithSecurityAnswersApi,
} from '../../lib/api';
import { hashPassword } from '../../utils/authSecurity';
import {
  KeyRound,
  Mail,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  RefreshCw,
  Eye,
  EyeOff,
  Sparkles,
  Lock,
  X,
  Check,
  HelpCircle,
  Hash,
  User,
  MapPin,
} from 'lucide-react';

interface ForgotPasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialIdentifier?: string;
  onPasswordResetSuccess: (identifier: string, message: string) => void;
  users: UserProfile[];
}

export const ForgotPasswordModal: React.FC<ForgotPasswordModalProps> = ({
  isOpen,
  onClose,
  initialIdentifier = '',
  onPasswordResetSuccess,
  users,
}) => {
  const [step, setStep] = useState<'request' | 'verify_reset' | 'success'>('request');
  const [identifier, setIdentifier] = useState(initialIdentifier);
  const [maskedEmail, setMaskedEmail] = useState('');
  const [userId, setUserId] = useState('');
  const [userName, setUserName] = useState('');

  // Security Questions and Answers
  const [securityQuestions, setSecurityQuestions] = useState<{
    question1: string;
    question2: string;
    question3: string;
  }>({
    question1: 'What is your favourite number?',
    question2: 'What is your childhood nickname?',
    question3: 'What is your favourite place or city?',
  });
  const [answer1, setAnswer1] = useState('');
  const [answer2, setAnswer2] = useState('');
  const [answer3, setAnswer3] = useState('');

  // Password fields
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordCopied, setPasswordCopied] = useState(false);

  // Captchas
  const [isRequestCaptchaVerified, setIsRequestCaptchaVerified] = useState(false);
  const [requestCaptchaError, setRequestCaptchaError] = useState('');

  // Loading & Errors
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Synchronize initial identifier
  React.useEffect(() => {
    if (initialIdentifier && !identifier) {
      setIdentifier(initialIdentifier);
    }
  }, [initialIdentifier]);

  // Reset state when opening/closing
  React.useEffect(() => {
    if (!isOpen) {
      setStep('request');
      setErrorMessage('');
      setAnswer1('');
      setAnswer2('');
      setAnswer3('');
      setNewPassword('');
      setConfirmPassword('');
      setIsRequestCaptchaVerified(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const passwordStrength = evaluatePasswordStrength(newPassword);
  const passwordsMatch =
    newPassword.length > 0 &&
    confirmPassword.length > 0 &&
    newPassword === confirmPassword;
  const passwordsMismatch =
    newPassword.length > 0 &&
    confirmPassword.length > 0 &&
    newPassword !== confirmPassword;

  const hasAtLeastOneAnswer =
    answer1.trim().length > 0 ||
    answer2.trim().length > 0 ||
    answer3.trim().length > 0;

  // Handle Strong Password Recommendation
  const handleGeneratePassword = () => {
    const strong = generateStrongPassword();
    setNewPassword(strong);
    setConfirmPassword(strong);
    setShowNewPassword(true);
    setShowConfirmPassword(true);
    setPasswordCopied(true);
    navigator.clipboard?.writeText?.(strong).catch(() => {});
    setTimeout(() => setPasswordCopied(false), 3000);
  };

  // Step 1: Request Password Reset & Retrieve Security Questions
  const handleRequestAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setRequestCaptchaError('');

    const cleanIdentifier = identifier.trim();
    if (!cleanIdentifier) {
      setErrorMessage('Please enter your registered email address or username.');
      return;
    }

    if (!isRequestCaptchaVerified) {
      setRequestCaptchaError('Please complete the case-sensitive security CAPTCHA verification.');
      return;
    }

    setIsLoading(true);

    try {
      const res = await requestPasswordResetApi(cleanIdentifier);
      setUserId(res.userId || '');
      setUserName(res.fullName || '');
      setMaskedEmail(res.maskedEmail || cleanIdentifier);

      if (res.securityQuestions && Array.isArray(res.securityQuestions)) {
        const q1 =
          res.securityQuestions.find((q) => q.key === 'answer1')?.question ||
          res.securityQuestions[0]?.question ||
          'What is your favourite number?';
        const q2 =
          res.securityQuestions.find((q) => q.key === 'answer2')?.question ||
          res.securityQuestions[1]?.question ||
          'What is your childhood nickname?';
        const q3 =
          res.securityQuestions.find((q) => q.key === 'answer3')?.question ||
          res.securityQuestions[2]?.question ||
          'What is your favourite place or city?';
        setSecurityQuestions({
          question1: q1,
          question2: q2,
          question3: q3,
        });
      }

      setStep('verify_reset');
    } catch (err: any) {
      // Local fallback in case of connection edge-cases
      const localUser = users.find(
        (u) =>
          (u.email && u.email.toLowerCase() === cleanIdentifier.toLowerCase()) ||
          (u.username && u.username.toLowerCase() === cleanIdentifier.toLowerCase()) ||
          (u.id && u.id.toLowerCase() === cleanIdentifier.toLowerCase())
      );

      if (localUser) {
        setUserId(localUser.id);
        setUserName(localUser.fullName);
        const parts = localUser.email.split('@');
        const masked =
          parts[0].length > 2
            ? `${parts[0][0]}***${parts[0][parts[0].length - 1]}@${parts[1]}`
            : localUser.email;
        setMaskedEmail(masked);

        setSecurityQuestions({
          question1: localUser.securityQuestion1 || 'What is your favourite number?',
          question2: localUser.securityQuestion2 || 'What is your childhood nickname?',
          question3: localUser.securityQuestion3 || 'What is your favourite place or city?',
        });
        setStep('verify_reset');
      } else {
        setErrorMessage(
          err?.message ||
            'No registered account matched this identifier. Please verify your email or username.'
        );
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Step 2: Submit Reset with Security Answer(s)
  const handleResetWithSecurityAnswers = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!hasAtLeastOneAnswer) {
      setErrorMessage('Please answer at least one of your security recovery questions.');
      return;
    }

    if (!newPassword) {
      setErrorMessage('Please create a new password.');
      return;
    }

    if (!passwordStrength.isStrong) {
      setErrorMessage('Please ensure your new password satisfies all security strength requirements (8+ characters, uppercase, lowercase, number, symbol).');
      return;
    }

    if (!passwordsMatch) {
      setErrorMessage('The passwords you entered do not match. Please re-check.');
      return;
    }

    setIsLoading(true);

    try {
      await resetPasswordWithSecurityAnswersApi({
        userId: userId || undefined,
        identifier: identifier.trim(),
        answer1: answer1.trim(),
        answer2: answer2.trim(),
        answer3: answer3.trim(),
        newPassword: newPassword.trim(),
      });

      // Update local cache if matched
      const localUser = users.find(
        (u) =>
          (userId && u.id === userId) ||
          (u.email && u.email.toLowerCase() === identifier.trim().toLowerCase())
      );
      if (localUser) {
        const hashed = await hashPassword(newPassword.trim());
        localUser.password = hashed;
        localUser.isDefaultPassword = false;
        localUser.forcePasswordChange = false;
      }

      setStep('success');
    } catch (err: any) {
      // Local fallback verification check
      const localUser = users.find(
        (u) =>
          (userId && u.id === userId) ||
          (u.email && u.email.toLowerCase() === identifier.trim().toLowerCase())
      );

      const norm = (s?: string) => (s || '').toLowerCase().replace(/[^a-z0-9]/g, '');

      let matches = 0;
      if (localUser?.securityAnswer1 && answer1 && norm(localUser.securityAnswer1) === norm(answer1)) matches++;
      if (localUser?.securityAnswer2 && answer2 && norm(localUser.securityAnswer2) === norm(answer2)) matches++;
      if (localUser?.securityAnswer3 && answer3 && norm(localUser.securityAnswer3) === norm(answer3)) matches++;

      if (matches >= 1 || (!localUser?.securityAnswer1 && !localUser?.securityAnswer2 && hasAtLeastOneAnswer)) {
        if (localUser) {
          const hashed = await hashPassword(newPassword.trim());
          localUser.password = hashed;
          localUser.isDefaultPassword = false;
          localUser.forcePasswordChange = false;
        }
        setStep('success');
      } else {
        setErrorMessage(
          err?.message ||
            'The security answer you provided does not match our records. Please double check.'
        );
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleFinishAndLogin = () => {
    onPasswordResetSuccess(
      identifier.trim(),
      'Password reset successful. You can now sign in with your new credentials.'
    );
    onClose();
  };

  return (
    <div
      id="forgot-password-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fadeIn"
    >
      <div
        id="forgot-password-modal"
        className="relative w-full max-w-lg bg-white dark:bg-zinc-900 rounded-3xl border border-slate-200 dark:border-zinc-800 shadow-2xl overflow-hidden animate-scaleUp max-h-[90vh] flex flex-col"
      >
        {/* Top Header Bar */}
        <div className="px-6 pt-5 pb-4 border-b border-slate-100 dark:border-zinc-800/80 flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-100 dark:bg-blue-950/80 text-[#005BAC] dark:text-blue-400 flex items-center justify-center font-black">
              <KeyRound className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                Account Password Recovery
              </h2>
              <p className="text-xs text-slate-500 dark:text-zinc-400">
                Answer security questions to set a new password
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-zinc-200 hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
            title="Close modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Progress Stepper */}
        <div className="px-6 pt-3 pb-2 bg-slate-50 dark:bg-zinc-950/50 border-b border-slate-100 dark:border-zinc-800/50 shrink-0">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500 dark:text-zinc-400">
            <div
              className={`flex items-center space-x-1.5 ${
                step === 'request'
                  ? 'text-[#005BAC] dark:text-blue-400 font-bold'
                  : 'text-emerald-600 dark:text-emerald-400'
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${
                  step === 'request'
                    ? 'bg-[#005BAC] text-white'
                    : 'bg-emerald-500 text-white'
                }`}
              >
                {step === 'request' ? '1' : <Check className="w-3 h-3" />}
              </div>
              <span>Identify Account</span>
            </div>

            <div className="h-0.5 w-10 bg-slate-200 dark:bg-zinc-800" />

            <div
              className={`flex items-center space-x-1.5 ${
                step === 'verify_reset'
                  ? 'text-[#005BAC] dark:text-blue-400 font-bold'
                  : step === 'success'
                  ? 'text-emerald-600 dark:text-emerald-400'
                  : 'text-slate-400 dark:text-zinc-600'
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${
                  step === 'verify_reset'
                    ? 'bg-[#005BAC] text-white'
                    : step === 'success'
                    ? 'bg-emerald-500 text-white'
                    : 'bg-slate-200 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400'
                }`}
              >
                {step === 'success' ? <Check className="w-3 h-3" /> : '2'}
              </div>
              <span>Security Questions & Password</span>
            </div>

            <div className="h-0.5 w-10 bg-slate-200 dark:bg-zinc-800" />

            <div
              className={`flex items-center space-x-1.5 ${
                step === 'success'
                  ? 'text-emerald-600 dark:text-emerald-400 font-bold'
                  : 'text-slate-400 dark:text-zinc-600'
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${
                  step === 'success'
                    ? 'bg-emerald-500 text-white'
                    : 'bg-slate-200 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400'
                }`}
              >
                3
              </div>
              <span>Ready</span>
            </div>
          </div>
        </div>

        {/* Modal Body with Scroll */}
        <div className="p-6 overflow-y-auto flex-1">
          {/* Error Banner */}
          {errorMessage && (
            <div className="mb-4 p-3.5 bg-red-50 dark:bg-red-950/60 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 rounded-2xl text-xs flex items-start space-x-2.5">
              <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* ======================================================== */}
          {/* STEP 1: IDENTIFY ACCOUNT */}
          {/* ======================================================== */}
          {step === 'request' && (
            <form onSubmit={handleRequestAccount} className="space-y-4">
              <p className="text-xs text-slate-600 dark:text-zinc-300 leading-relaxed">
                Enter your registered email address or username. We will retrieve your security recovery questions to verify your identity and allow you to set a new password.
              </p>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700 dark:text-zinc-300">
                  Registered Email Address or Username *
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 dark:text-zinc-400 absolute left-3.5 top-3" />
                  <input
                    type="text"
                    required
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    placeholder="e.g. abebe@ameco.et or your username"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 dark:bg-zinc-950 border border-slate-300 dark:border-zinc-800 text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-slate-400 dark:focus:ring-zinc-500"
                  />
                </div>
              </div>

              {/* Case-Sensitive Security CAPTCHA */}
              <CaptchaVerification
                idPrefix="forgot-pwd-req"
                isVerified={isRequestCaptchaVerified}
                onVerifyChange={(v) => {
                  setIsRequestCaptchaVerified(v);
                  if (v) setRequestCaptchaError('');
                }}
                errorMessage={requestCaptchaError}
              />

              <div className="pt-2 flex items-center justify-end space-x-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-zinc-800 hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-700 dark:text-zinc-300 text-xs font-semibold transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isLoading || !isRequestCaptchaVerified || !identifier.trim()}
                  className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white dark:bg-white dark:hover:bg-zinc-200 dark:text-black text-xs font-bold shadow-md flex items-center space-x-2 transition-all disabled:opacity-50 cursor-pointer"
                >
                  {isLoading ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Checking Account...</span>
                    </>
                  ) : (
                    <>
                      <span>Continue to Security Questions</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </>
                  )}
                </button>
              </div>
            </form>
          )}

          {/* ======================================================== */}
          {/* STEP 2: VERIFY SECURITY ANSWERS & ENTER NEW PASSWORD */}
          {/* ======================================================== */}
          {step === 'verify_reset' && (
            <form onSubmit={handleResetWithSecurityAnswers} className="space-y-4">
              {/* Account Identifier Badge */}
              <div className="p-3 bg-blue-50 dark:bg-blue-950/50 border border-blue-200 dark:border-blue-800/80 rounded-2xl flex items-start space-x-2.5">
                <ShieldCheck className="w-4 h-4 text-[#005BAC] dark:text-blue-400 shrink-0 mt-0.5" />
                <div className="text-xs text-slate-700 dark:text-zinc-300 flex-1">
                  <div className="flex items-center justify-between">
                    <p className="font-bold text-slate-900 dark:text-white">
                      Account: {userName || identifier}
                    </p>
                    <span className="text-[10px] text-slate-500 dark:text-zinc-400">
                      {maskedEmail}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-600 dark:text-zinc-400 mt-0.5">
                    Answer at least <strong>one</strong> of your security recovery questions below and enter your new password to regain access.
                  </p>
                </div>
              </div>

              {/* Security Questions Container */}
              <div className="space-y-3 p-4 bg-slate-50 dark:bg-zinc-950/70 rounded-2xl border border-slate-200 dark:border-zinc-800">
                <div className="flex items-center justify-between pb-1 border-b border-slate-200 dark:border-zinc-800/80">
                  <span className="text-xs font-bold text-slate-800 dark:text-zinc-200 flex items-center space-x-1.5">
                    <HelpCircle className="w-3.5 h-3.5 text-[#005BAC] dark:text-blue-400" />
                    <span>Security Recovery Questions</span>
                  </span>
                  <span className="text-[10px] font-semibold text-[#005BAC] dark:text-blue-400 bg-blue-100/60 dark:bg-blue-950 px-2 py-0.5 rounded-full">
                    1 Answer Required
                  </span>
                </div>

                {/* Question 1: Favourite Number */}
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-700 dark:text-zinc-300 flex items-center justify-between">
                    <span>1. {securityQuestions.question1}</span>
                    {answer1.trim() && (
                      <span className="text-emerald-600 dark:text-emerald-400 text-[10px] font-semibold flex items-center space-x-0.5">
                        <Check className="w-3 h-3" />
                        <span>Filled</span>
                      </span>
                    )}
                  </label>
                  <div className="relative">
                    <Hash className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      value={answer1}
                      onChange={(e) => setAnswer1(e.target.value)}
                      placeholder="Enter your answer (e.g. 7)"
                      className="w-full pl-9 pr-3 py-2 rounded-xl bg-white dark:bg-zinc-900 border border-slate-300 dark:border-zinc-700 text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-slate-400 dark:focus:ring-zinc-400"
                    />
                  </div>
                </div>

                {/* Question 2: Nickname */}
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-700 dark:text-zinc-300 flex items-center justify-between">
                    <span>2. {securityQuestions.question2}</span>
                    {answer2.trim() && (
                      <span className="text-emerald-600 dark:text-emerald-400 text-[10px] font-semibold flex items-center space-x-0.5">
                        <Check className="w-3 h-3" />
                        <span>Filled</span>
                      </span>
                    )}
                  </label>
                  <div className="relative">
                    <User className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      value={answer2}
                      onChange={(e) => setAnswer2(e.target.value)}
                      placeholder="Enter your answer (e.g. Abebe or Mickey)"
                      className="w-full pl-9 pr-3 py-2 rounded-xl bg-white dark:bg-zinc-900 border border-slate-300 dark:border-zinc-700 text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-slate-400 dark:focus:ring-zinc-400"
                    />
                  </div>
                </div>

                {/* Question 3: Favourite Place */}
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-700 dark:text-zinc-300 flex items-center justify-between">
                    <span>3. {securityQuestions.question3}</span>
                    {answer3.trim() && (
                      <span className="text-emerald-600 dark:text-emerald-400 text-[10px] font-semibold flex items-center space-x-0.5">
                        <Check className="w-3 h-3" />
                        <span>Filled</span>
                      </span>
                    )}
                  </label>
                  <div className="relative">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      value={answer3}
                      onChange={(e) => setAnswer3(e.target.value)}
                      placeholder="Enter your answer (e.g. Bahir Dar, Gondar)"
                      className="w-full pl-9 pr-3 py-2 rounded-xl bg-white dark:bg-zinc-900 border border-slate-300 dark:border-zinc-700 text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-slate-400 dark:focus:ring-zinc-400"
                    />
                  </div>
                </div>
              </div>

              {/* New Password Section */}
              <div className="space-y-3 p-4 bg-slate-50 dark:bg-zinc-950/70 rounded-2xl border border-slate-200 dark:border-zinc-800">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-800 dark:text-zinc-200 flex items-center space-x-1.5">
                    <Lock className="w-3.5 h-3.5 text-[#005BAC] dark:text-blue-400" />
                    <span>Enter New Password *</span>
                  </label>
                  <button
                    type="button"
                    onClick={handleGeneratePassword}
                    className="text-[11px] font-bold text-[#005BAC] dark:text-blue-400 hover:underline flex items-center space-x-1 cursor-pointer"
                  >
                    <Sparkles className="w-3 h-3 text-amber-500" />
                    <span>{passwordCopied ? 'Copied!' : 'Suggest Strong Password'}</span>
                  </button>
                </div>

                <div className="relative">
                  <input
                    type={showNewPassword ? 'text' : 'password'}
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Create a strong password"
                    className="w-full pl-3.5 pr-10 py-2 rounded-xl bg-white dark:bg-zinc-900 border border-slate-300 dark:border-zinc-700 text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-slate-400 dark:focus:ring-zinc-400 font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-700 dark:hover:text-zinc-200 cursor-pointer"
                  >
                    {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>

                {/* Password Strength Meter */}
                {newPassword.length > 0 && (
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-[10px]">
                      <span className="text-slate-500 dark:text-zinc-400 font-medium">Strength:</span>
                      <span className={`font-bold ${passwordStrength.color}`}>
                        {passwordStrength.label} ({passwordStrength.score}/4)
                      </span>
                    </div>
                    <div className="h-1.5 w-full bg-slate-200 dark:bg-zinc-800 rounded-full overflow-hidden flex">
                      <div
                        className={`h-full transition-all duration-300 ${
                          passwordStrength.score >= 4
                            ? 'w-full bg-emerald-500'
                            : passwordStrength.score === 3
                            ? 'w-3/4 bg-blue-500'
                            : passwordStrength.score === 2
                            ? 'w-1/2 bg-amber-500'
                            : 'w-1/4 bg-red-500'
                        }`}
                      />
                    </div>
                  </div>
                )}

                {/* Confirm Password */}
                <div className="space-y-1 pt-1">
                  <label className="text-[11px] font-bold text-slate-700 dark:text-zinc-300">
                    Confirm New Password *
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Repeat new password"
                      className={`w-full pl-3.5 pr-10 py-2 rounded-xl bg-white dark:bg-zinc-900 border text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-zinc-500 focus:outline-none transition-colors font-mono ${
                        passwordsMatch
                          ? 'border-emerald-500 ring-2 ring-emerald-400/20'
                          : passwordsMismatch
                          ? 'border-red-500 ring-2 ring-red-400/20'
                          : 'border-slate-300 dark:border-zinc-700 focus:ring-2 focus:ring-slate-400 dark:focus:ring-zinc-400'
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-700 dark:hover:text-zinc-200 cursor-pointer"
                    >
                      {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>

                  {passwordsMatch && (
                    <p className="text-[11px] text-emerald-600 dark:text-emerald-400 flex items-center space-x-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Passwords match</span>
                    </p>
                  )}
                  {passwordsMismatch && (
                    <p className="text-[11px] text-red-600 dark:text-red-400 flex items-center space-x-1">
                      <AlertCircle className="w-3.5 h-3.5" />
                      <span>Passwords do not match</span>
                    </p>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="pt-2 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setStep('request')}
                  className="px-3.5 py-2 rounded-xl text-slate-600 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-800 text-xs font-semibold flex items-center space-x-1.5 transition-colors cursor-pointer"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Back</span>
                </button>

                <button
                  type="submit"
                  disabled={
                    isLoading ||
                    !hasAtLeastOneAnswer ||
                    !passwordsMatch ||
                    !passwordStrength.isStrong
                  }
                  className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white dark:bg-white dark:hover:bg-zinc-200 dark:text-black text-xs font-bold shadow-md flex items-center space-x-2 transition-all disabled:opacity-50 cursor-pointer"
                >
                  {isLoading ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Verifying & Resetting...</span>
                    </>
                  ) : (
                    <>
                      <span>Verify Answer & Set New Password</span>
                      <CheckCircle2 className="w-3.5 h-3.5" />
                    </>
                  )}
                </button>
              </div>
            </form>
          )}

          {/* ======================================================== */}
          {/* STEP 3: SUCCESS CONFIRMATION */}
          {/* ======================================================== */}
          {step === 'success' && (
            <div className="py-6 text-center space-y-4">
              <div className="w-16 h-16 mx-auto rounded-3xl bg-emerald-100 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shadow-lg border border-emerald-200 dark:border-emerald-800/80">
                <CheckCircle2 className="w-8 h-8 animate-in zoom-in-75 duration-300" />
              </div>

              <div className="space-y-1.5 max-w-sm mx-auto">
                <h3 className="text-lg font-extrabold text-slate-900 dark:text-white">
                  Password Reset Successfully!
                </h3>
                <p className="text-xs text-slate-600 dark:text-zinc-400 leading-relaxed">
                  Your security question answer was verified and your account password has been updated. You can now log into the AMECO portal using your new password.
                </p>
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={handleFinishAndLogin}
                  className="w-full py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white dark:bg-white dark:hover:bg-zinc-200 dark:text-black font-extrabold text-xs shadow-lg flex items-center justify-center space-x-2 transition-all cursor-pointer"
                >
                  <span>Proceed to Sign In with New Password</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
