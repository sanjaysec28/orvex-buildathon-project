import { AlertCircle, ArrowRight, Loader2, Truck } from 'lucide-react';
import { useState, type FormEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate } from 'react-router-dom';
import { useRoleContext } from '../../hooks/useRoleContext';
import {
  isValidIndianMobileNumber,
  isValidPassword,
  loginTransporterWithMobilePassword,
  persistRememberMePreference,
  readRememberMePreference,
  requestTransporterWhatsAppOtp,
  type TransporterAuthErrorCode,
} from '../../services/auth/transporterAuthService';
import { getWorkspaceBasePath } from '../../utils/roleRouting';
import { AuthDivider } from './components/AuthDivider';
import { PasswordField } from './components/PasswordField';
import { PhoneNumberField } from './components/PhoneNumberField';
import { WhatsAppLoginButton } from './components/WhatsAppLoginButton';

function mapAuthErrorToTranslationKey(errorCode?: TransporterAuthErrorCode): string {
  switch (errorCode) {
    case 'INVALID_CREDENTIALS':
      return 'auth.errors.invalidCredentials';
    case 'ACCOUNT_DISABLED':
      return 'auth.errors.accountDisabled';
    case 'NETWORK_ERROR':
      return 'auth.errors.networkError';
    case 'WHATSAPP_OTP_NOT_CONFIGURED':
      return 'auth.errors.whatsappNotConfigured';
    case 'AUTH_NOT_CONFIGURED':
    default:
      return 'auth.errors.providerNotConfigured';
  }
}

export function TransporterLoginPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { role } = useRoleContext();

  const [mobileNumber, setMobileNumber] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState<boolean>(readRememberMePreference);

  const [mobileError, setMobileError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleRememberMeChange = (checked: boolean) => {
    setRememberMe(checked);
    persistRememberMePreference(checked);
  };

  const handleMobileChange = (nextValue: string) => {
    setMobileNumber(nextValue);
    if (mobileError) setMobileError(null);
    if (statusMessage) setStatusMessage(null);
  };

  const handlePasswordChange = (nextValue: string) => {
    setPassword(nextValue);
    if (passwordError) setPasswordError(null);
    if (statusMessage) setStatusMessage(null);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (isSubmitting) return;

    const trimmedMobile = mobileNumber.trim();
    let hasError = false;

    if (!trimmedMobile) {
      setMobileError(t('auth.validation.mobileRequired'));
      hasError = true;
    } else if (!isValidIndianMobileNumber(trimmedMobile)) {
      setMobileError(t('auth.validation.mobileInvalid'));
      hasError = true;
    } else {
      setMobileError(null);
    }

    if (!password) {
      setPasswordError(t('auth.validation.passwordRequired'));
      hasError = true;
    } else if (!isValidPassword(password)) {
      setPasswordError(t('auth.validation.passwordTooShort'));
      hasError = true;
    } else {
      setPasswordError(null);
    }

    if (hasError) {
      setStatusMessage(null);
      return;
    }

    setIsSubmitting(true);
    setStatusMessage(null);

    try {
      const result = await loginTransporterWithMobilePassword({
        mobileNumber: trimmedMobile,
        password,
        role: role === 'transporter' ? 'transporter' : role,
        rememberMe,
      });

      if (result.ok && result.session) {
        navigate(getWorkspaceBasePath('transporter'));
        return;
      }

      setStatusMessage(t(mapAuthErrorToTranslationKey(result.errorCode)));
    } catch {
      setStatusMessage(t('auth.errors.networkError'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleWhatsAppLogin = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    try {
      const result = await requestTransporterWhatsAppOtp();
      if (!result.ok) {
        setStatusMessage(t(mapAuthErrorToTranslationKey(result.errorCode)));
      }
    } catch {
      setStatusMessage(t('auth.errors.networkError'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="relative min-h-[100dvh] w-full overflow-x-hidden bg-gradient-to-b from-[#EAF6FF] via-[#F6FBFF] to-[#F6FBFF] text-[#18364B] flex flex-col">
      {/* Decorative corner accents aligned with approved Pages 02 & 03 */}
      <svg
        aria-hidden="true"
        viewBox="0 0 120 140"
        className="pointer-events-none fixed top-0 start-0 w-16 sm:w-24 h-auto text-[#C8F542]"
        fill="currentColor"
      >
        <path d="M0,0 L34,0 C52,32 76,62 96,90 C62,74 30,48 0,18 Z" />
      </svg>

      <svg
        aria-hidden="true"
        viewBox="0 0 120 120"
        className="pointer-events-none fixed top-24 end-0 w-16 sm:w-24 h-auto text-[#73CFFF]/65"
        fill="currentColor"
      >
        <path d="M120,0 C84,12 52,36 32,74 C66,60 94,48 120,42 Z" />
      </svg>

      <svg
        aria-hidden="true"
        viewBox="0 0 400 70"
        preserveAspectRatio="none"
        className="pointer-events-none fixed bottom-0 inset-x-0 w-full h-9 sm:h-12"
      >
        <path
          d="M0,18 C65,24 115,46 168,70 L0,70 Z"
          fill="#73CFFF"
        />
        <path
          d="M150,70 C245,42 330,18 400,8 L400,70 Z"
          fill="#C8F542"
        />
      </svg>

      {/* Main centred vertical column */}
      <div className="relative z-10 flex-1 w-full max-w-[440px] mx-auto px-5 sm:px-6 pt-5 sm:pt-7 pb-[max(2.75rem,calc(env(safe-area-inset-bottom)+2rem))] flex flex-col justify-between">
        <div>
          {/* ORVEX branding */}
          <header className="text-center">
            <div
              dir="ltr"
              className="inline-flex items-center justify-center"
              aria-label={t('brand.name')}
            >
              <svg viewBox="0 0 142 38" className="h-8 sm:h-9 w-auto" role="img" aria-label="ORVEX">
                <text
                  x="4"
                  y="30"
                  fill="#18364B"
                  fontFamily="Plus Jakarta Sans, system-ui, sans-serif"
                  fontWeight="800"
                  fontSize="32"
                  letterSpacing="-0.03em"
                >
                  ORVE
                </text>
                <path
                  d="M97 6 L112 20 L97 32 L104 32 L115 22 L125 32 L133 32 L119 19 L132 6 L125 6 L115 16 L105 6 Z"
                  fill="#18364B"
                />
                <path d="M97 6 L112 20 L115 17 L105 6 Z" fill="#C8F542" />
                <path d="M132 6 L114 23 L104 32 L111 32 L121 21 L132 6 Z" fill="#73CFFF" />
              </svg>
            </div>

            <p className="mt-1.5 text-[15.5px] sm:text-[16.5px] font-bold italic leading-[1.28] text-[#18364B] max-w-[205px] mx-auto">
              {t('brand.tagline')}
            </p>

            <svg
              aria-hidden="true"
              viewBox="0 0 180 12"
              className="mx-auto mt-1.5 w-32 h-2.5"
              fill="none"
            >
              <path
                d="M6 9 C58 2, 122 2, 174 6"
                stroke="#C8F542"
                strokeWidth="4.2"
                strokeLinecap="round"
              />
            </svg>
          </header>

          {/* Freight truck illustration over subtle sky-blue arch */}
          <div dir="ltr" className="relative mt-2 flex items-center justify-center">
            <svg
              aria-hidden="true"
              viewBox="0 0 320 96"
              className="pointer-events-none absolute bottom-1 w-[275px] sm:w-[300px] h-auto"
            >
              <defs>
                <linearGradient id="orvex-truck-dome" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#AEE0FA" stopOpacity="0.82" />
                  <stop offset="100%" stopColor="#F6FBFF" stopOpacity="0" />
                </linearGradient>
              </defs>
              <path
                d="M8,94 C54,18 266,18 312,94 Z"
                fill="url(#orvex-truck-dome)"
              />
            </svg>

            <img
              src="/assets/orvex-transporter-truck.webp"
              alt=""
              aria-hidden="true"
              loading="eager"
              decoding="async"
              className="relative z-10 h-[108px] sm:h-[120px] w-auto object-contain select-none pointer-events-none"
            />
          </div>

          {/* Page heading, subtitle, and Truck Owner indicator */}
          <div className="mt-2.5 text-center">
            <h1 className="text-[25px] sm:text-[27px] font-bold tracking-tight leading-[1.24] text-[#18364B]">
              {t('auth.transporterLoginTitle')}
            </h1>
            <p className="mt-1 text-[13.5px] sm:text-[14px] text-[#3F5B6E]">
              {t('auth.transporterLoginSubtitle')}
            </p>
            <div className="mt-2.5 flex justify-center">
              <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-[#DCEFFC] text-[#18364B] text-[12.5px] font-bold">
                <Truck className="w-3.5 h-3.5 stroke-[2.2]" aria-hidden="true" />
                <span>{t('auth.truckOwnerBadge')}</span>
              </span>
            </div>
          </div>

          {/* Login form */}
          <form onSubmit={handleSubmit} noValidate className="mt-4 space-y-3">
            <PhoneNumberField
              id="transporter-mobile"
              label={t('auth.mobileLabel')}
              placeholder={t('auth.mobilePlaceholder')}
              value={mobileNumber}
              onChange={handleMobileChange}
              error={mobileError}
              disabled={isSubmitting}
            />

            <PasswordField
              id="transporter-password"
              label={t('auth.passwordLabel')}
              placeholder={t('auth.passwordPlaceholder')}
              showPasswordLabel={t('auth.showPassword')}
              hidePasswordLabel={t('auth.hidePassword')}
              value={password}
              onChange={handlePasswordChange}
              error={passwordError}
              disabled={isSubmitting}
            />

            {/* Remember me & Forgot password */}
            <div className="flex items-center justify-between gap-2 px-1 pt-0.5">
              <label className="min-h-[36px] inline-flex items-center gap-2 text-[13.5px] font-medium text-[#18364B] cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(event) => handleRememberMeChange(event.target.checked)}
                  className="w-[18px] h-[18px] rounded-[4px] border border-[#9BB6C9] accent-[#1C9CF0] cursor-pointer focus-visible:outline-2 focus-visible:outline-[#18364B] focus-visible:outline-offset-2"
                />
                <span>{t('auth.rememberMe')}</span>
              </label>

              <Link
                to="/auth/forgot-password?role=transporter"
                className="min-h-[36px] inline-flex items-center text-[13.5px] font-medium text-[#1570EF] underline underline-offset-2 hover:text-[#0F56BD] focus-visible:outline-2 focus-visible:outline-[#18364B] rounded-sm"
              >
                {t('auth.forgotPassword')}
              </Link>
            </div>

            {statusMessage ? (
              <div
                role="alert"
                className="rounded-2xl border border-[#BFE2F5] bg-[#E8F5FD] px-3.5 py-2.5 text-[12.5px] leading-snug text-[#18364B] flex items-start gap-2"
              >
                <AlertCircle className="w-4 h-4 text-[#1570EF] shrink-0 mt-0.5" aria-hidden="true" />
                <span>{statusMessage}</span>
              </div>
            ) : null}

            {/* Primary Login CTA */}
            <div className="pt-0.5">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full h-[52px] rounded-full bg-[#C8F542] hover:bg-[#BCE934] active:bg-[#AFDC28] disabled:opacity-70 text-[#18364B] font-bold text-[16px] inline-flex items-center justify-center gap-2 shadow-[0_6px_18px_-4px_rgba(24,54,75,0.14)] transition-colors cursor-pointer focus-visible:outline-2 focus-visible:outline-[#18364B] focus-visible:outline-offset-2 disabled:cursor-wait"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" aria-hidden="true" />
                    <span>{t('auth.loggingIn')}</span>
                  </>
                ) : (
                  <>
                    <span>{t('auth.loginButton')}</span>
                    <ArrowRight className="w-5 h-5 rtl:rotate-180" aria-hidden="true" />
                  </>
                )}
              </button>
            </div>

            {/* Or divider */}
            <div className="py-1">
              <AuthDivider label={t('auth.orDivider')} />
            </div>

            {/* WhatsApp secondary button */}
            <WhatsAppLoginButton
              label={t('auth.loginWithWhatsApp')}
              onClick={handleWhatsAppLogin}
              disabled={isSubmitting}
            />
          </form>
        </div>

        {/* Create Account footer link */}
        <p className="mt-5 text-center text-[13.5px] text-[#3F5B6E]">
          <span>{t('auth.newToOrvex')} </span>
          <Link
            to="/auth/register?role=transporter"
            className="font-bold text-[#1570EF] underline underline-offset-2 hover:text-[#0F56BD] focus-visible:outline-2 focus-visible:outline-[#18364B] rounded-sm"
          >
            {t('auth.createAccount')}
          </Link>
        </p>
      </div>
    </div>
  );
}
