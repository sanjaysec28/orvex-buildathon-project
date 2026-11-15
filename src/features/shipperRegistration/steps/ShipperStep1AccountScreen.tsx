import {
  AlertCircle,
  ArrowRight,
  Eye,
  EyeOff,
  Lock,
  Mail,
  Phone,
  ShieldCheck,
  User,
} from 'lucide-react';
import { useMemo, useState, type FormEvent } from 'react';
import { cn } from '../../../utils/cn';
import { WizardPillInput } from '../../registration/components/RegistrationInputs';
import {
  isValidEmailAddress,
  isValidIndianMobile,
  validateStep1Account,
} from '../shipperValidation';
import type { ShipperAccountDraftData } from '../shipperTypes';

export interface ShipperStep1AccountScreenProps {
  account: ShipperAccountDraftData;
  password: string;
  confirmPassword: string;
  otp: string;
  otpStatusMessage: string | null;
  isRequestingOtp: boolean;
  onChangeAccount: (patch: Partial<ShipperAccountDraftData>) => void;
  onChangePassword: (value: string) => void;
  onChangeConfirmPassword: (value: string) => void;
  onChangeOtp: (value: string) => void;
  onRequestOtp: () => void;
  onOpenLegal: (topic: 'terms' | 'privacy') => void;
  onContinue: () => void;
}

export function ShipperStep1AccountScreen({
  account,
  password,
  confirmPassword,
  otp,
  otpStatusMessage,
  isRequestingOtp,
  onChangeAccount,
  onChangePassword,
  onChangeConfirmPassword,
  onChangeOtp,
  onRequestOtp,
  onOpenLegal,
  onContinue,
}: ShipperStep1AccountScreenProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [submittedAttempt, setSubmittedAttempt] = useState(false);

  const validationErrors = useMemo(
    () =>
      validateStep1Account(
        account.fullName,
        account.mobileNumber,
        account.email,
        password,
        confirmPassword,
        account.termsAccepted,
      ),
    [
      account.fullName,
      account.mobileNumber,
      account.email,
      password,
      confirmPassword,
      account.termsAccepted,
    ],
  );

  const isStepValid = Object.keys(validationErrors).length === 0;

  const visibleError = (field: string): string | undefined => {
    if (!submittedAttempt && !touched[field]) return undefined;
    return validationErrors[field];
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmittedAttempt(true);
    if (!isStepValid) {
      return;
    }
    onContinue();
  };

  const canRequestOtp = isValidIndianMobile(account.mobileNumber) && !isRequestingOtp;

  return (
    <form onSubmit={handleSubmit} noValidate className="flex-1 flex flex-col justify-between gap-4">
      <div className="space-y-3">
        <WizardPillInput
          label="Full Name"
          placeholder="Full Name"
          icon={<User className="w-[18px] h-[18px]" />}
          autoComplete="name"
          value={account.fullName}
          onChange={(e) => onChangeAccount({ fullName: e.target.value })}
          onBlur={() => setTouched((prev) => ({ ...prev, fullName: true }))}
          error={visibleError('fullName')}
        />

        <WizardPillInput
          label="Mobile Number"
          placeholder="Mobile Number"
          type="tel"
          inputMode="numeric"
          maxLength={14}
          autoComplete="tel-national"
          icon={<Phone className="w-[18px] h-[18px]" />}
          value={account.mobileNumber}
          onChange={(e) => onChangeAccount({ mobileNumber: e.target.value })}
          onBlur={() => setTouched((prev) => ({ ...prev, mobileNumber: true }))}
          error={visibleError('mobileNumber')}
          rightAdornment={
            <button
              type="button"
              onClick={() => {
                setTouched((prev) => ({ ...prev, mobileNumber: true }));
                if (isValidIndianMobile(account.mobileNumber)) {
                  onRequestOtp();
                }
              }}
              disabled={isRequestingOtp}
              className={cn(
                'h-[34px] px-3.5 rounded-full text-[12px] font-bold transition-colors cursor-pointer whitespace-nowrap',
                canRequestOtp
                  ? 'bg-[#1565C0] hover:bg-[#10529E] text-white'
                  : 'bg-[#1565C0]/85 text-white',
              )}
            >
              {isRequestingOtp ? 'Sending...' : 'Get OTP'}
            </button>
          }
        />

        <WizardPillInput
          label="Enter OTP"
          placeholder="Enter OTP"
          type="text"
          inputMode="numeric"
          maxLength={6}
          autoComplete="one-time-code"
          icon={<ShieldCheck className="w-[18px] h-[18px]" />}
          value={otp}
          onChange={(e) => onChangeOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
        />

        {otpStatusMessage ? (
          <div
            role="status"
            className="rounded-2xl border border-[#BFE2F5] bg-[#E8F5FD] px-3.5 py-2.5 text-[12px] leading-snug text-[#18364B] flex items-start gap-2"
          >
            <AlertCircle className="w-4 h-4 text-[#1570EF] shrink-0 mt-0.5" aria-hidden="true" />
            <span>{otpStatusMessage}</span>
          </div>
        ) : null}

        <WizardPillInput
          label="Email Address"
          placeholder="Email Address"
          type="email"
          autoComplete="email"
          icon={<Mail className="w-[18px] h-[18px]" />}
          value={account.email}
          onChange={(e) => onChangeAccount({ email: e.target.value })}
          onBlur={() => setTouched((prev) => ({ ...prev, email: true }))}
          error={
            visibleError('email') ??
            (touched.email && account.email && !isValidEmailAddress(account.email)
              ? validationErrors.email
              : undefined)
          }
        />

        <div>
          <label htmlFor="shp-reg-password" className="sr-only">
            Password
          </label>
          <div className="relative flex items-center">
            <Lock
              className="pointer-events-none absolute start-4 w-[18px] h-[18px] text-[#5A7486]"
              aria-hidden="true"
            />
            <input
              id="shp-reg-password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="new-password"
              placeholder="Password"
              value={password}
              onChange={(e) => onChangePassword(e.target.value)}
              onBlur={() => setTouched((prev) => ({ ...prev, password: true }))}
              aria-invalid={Boolean(visibleError('password'))}
              className={cn(
                'w-full h-[48px] rounded-full bg-white ps-11 pe-11 text-[14.5px] text-[#18364B] placeholder:text-[#6E8696] shadow-[0_1px_3px_rgba(24,54,75,0.03)] focus:outline-none',
                visibleError('password')
                  ? 'border-[1.5px] border-[#D9383A]'
                  : 'border border-[#DCEAF4] focus:border-[#38B6FF]',
              )}
            />
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
              aria-pressed={showPassword}
              className="absolute end-1.5 min-h-[38px] min-w-[38px] rounded-full flex items-center justify-center text-[#3F5B6E] hover:bg-[#E5F3FA] cursor-pointer"
            >
              {showPassword ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
            </button>
          </div>
          {visibleError('password') ? (
            <p role="alert" className="mt-1 ps-4 text-[12px] font-medium text-[#C62828]">
              {visibleError('password')}
            </p>
          ) : null}
        </div>

        <div>
          <label htmlFor="shp-reg-confirm-password" className="sr-only">
            Confirm Password
          </label>
          <div className="relative flex items-center">
            <Lock
              className="pointer-events-none absolute start-4 w-[18px] h-[18px] text-[#5A7486]"
              aria-hidden="true"
            />
            <input
              id="shp-reg-confirm-password"
              type={showConfirmPassword ? 'text' : 'password'}
              autoComplete="new-password"
              placeholder="Confirm Password"
              value={confirmPassword}
              onChange={(e) => onChangeConfirmPassword(e.target.value)}
              onBlur={() => setTouched((prev) => ({ ...prev, confirmPassword: true }))}
              aria-invalid={Boolean(visibleError('confirmPassword'))}
              className={cn(
                'w-full h-[48px] rounded-full bg-white ps-11 pe-11 text-[14.5px] text-[#18364B] placeholder:text-[#6E8696] shadow-[0_1px_3px_rgba(24,54,75,0.03)] focus:outline-none',
                visibleError('confirmPassword')
                  ? 'border-[1.5px] border-[#D9383A]'
                  : 'border border-[#DCEAF4] focus:border-[#38B6FF]',
              )}
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword((prev) => !prev)}
              aria-label={showConfirmPassword ? 'Hide confirm password' : 'Show confirm password'}
              aria-pressed={showConfirmPassword}
              className="absolute end-1.5 min-h-[38px] min-w-[38px] rounded-full flex items-center justify-center text-[#3F5B6E] hover:bg-[#E5F3FA] cursor-pointer"
            >
              {showConfirmPassword ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
            </button>
          </div>
          {visibleError('confirmPassword') ? (
            <p role="alert" className="mt-1 ps-4 text-[12px] font-medium text-[#C62828]">
              {visibleError('confirmPassword')}
            </p>
          ) : null}
        </div>

        {/* Terms of Service & Privacy Policy checkbox */}
        <div className="pt-1 px-1">
          <label className="inline-flex items-start gap-2.5 text-[13px] leading-snug text-[#18364B] cursor-pointer select-none">
            <input
              type="checkbox"
              checked={account.termsAccepted}
              onChange={(e) => onChangeAccount({ termsAccepted: e.target.checked })}
              className="mt-0.5 w-[18px] h-[18px] rounded-[4px] border border-[#9BB6C9] accent-[#1C9CF0] cursor-pointer shrink-0"
            />
            <span>
              I agree to the{' '}
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  onOpenLegal('terms');
                }}
                className="font-semibold text-[#1570EF] underline underline-offset-2 hover:text-[#0F56BD] cursor-pointer"
              >
                Terms of Service
              </button>{' '}
              and{' '}
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  onOpenLegal('privacy');
                }}
                className="font-semibold text-[#1570EF] underline underline-offset-2 hover:text-[#0F56BD] cursor-pointer"
              >
                Privacy Policy
              </button>
              .
            </span>
          </label>
          {visibleError('termsAccepted') ? (
            <p role="alert" className="mt-1 ps-6 text-[12px] font-medium text-[#C62828]">
              {visibleError('termsAccepted')}
            </p>
          ) : null}
        </div>
      </div>

      <div className="pt-2">
        <button
          type="submit"
          disabled={!isStepValid}
          className="w-full h-[52px] rounded-full bg-[#C8F542] hover:bg-[#BCE934] active:bg-[#AFDC28] disabled:bg-[#E2EFE0] disabled:text-[#788D9C] disabled:cursor-not-allowed text-[#18364B] font-bold text-[16px] inline-flex items-center justify-center gap-2 shadow-[0_6px_18px_-4px_rgba(24,54,75,0.14)] transition-colors cursor-pointer"
        >
          <span>Continue</span>
          <ArrowRight className="w-5 h-5" aria-hidden="true" />
        </button>
      </div>
    </form>
  );
}
