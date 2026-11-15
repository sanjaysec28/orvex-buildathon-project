import { AlertCircle, ArrowRight, FlaskConical, Loader2, Phone, Smartphone } from 'lucide-react';
import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useRoleContext } from '../../hooks/useRoleContext';
import {
  loginShipperWithCredential,
  persistShipperRememberMePreference,
  readShipperRememberMePreference,
  requestShipperOtpLogin,
} from '../../services/auth/shipperAuthService';
import {
  fetchAuthSession,
  loginAsDemoRole,
  mapDemoLoginErrorMessage,
} from '../../services/transporter/transporterDashboardService';
import { useDemoLoginAvailability } from '../demo/useDemoLoginAvailability';
import { isValidMobileOrEmailIdentifier } from '../shipperRegistration/shipperValidation';
import { AuthDivider } from '../authentication/components/AuthDivider';
import { PasswordField } from '../authentication/components/PasswordField';
import { ShipperWarehouseIllustration } from '../shipperRegistration/components/ShipperIllustrations';
import { cn } from '../../utils/cn';

export function ShipperLoginPage() {
  const navigate = useNavigate();
  const { setRole } = useRoleContext();
  const demoLoginAvailable = useDemoLoginAvailability();

  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState<boolean>(readShipperRememberMePreference);

  const [identifierError, setIdentifierError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [demoError, setDemoError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDemoSubmitting, setIsDemoSubmitting] = useState(false);

  const handleRememberMeChange = (checked: boolean) => {
    setRememberMe(checked);
    persistShipperRememberMePreference(checked);
  };

  const handleIdentifierChange = (nextValue: string) => {
    setIdentifier(nextValue);
    if (identifierError) setIdentifierError(null);
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

    const trimmed = identifier.trim();
    let hasError = false;

    if (!trimmed) {
      setIdentifierError('Please enter your mobile number or email address.');
      hasError = true;
    } else if (!isValidMobileOrEmailIdentifier(trimmed)) {
      setIdentifierError('Enter a valid 10-digit Indian mobile number or email address.');
      hasError = true;
    } else {
      setIdentifierError(null);
    }

    if (!password) {
      setPasswordError('Please enter your password.');
      hasError = true;
    } else if (password.length < 6) {
      setPasswordError('Password must be at least 6 characters.');
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
      const result = await loginShipperWithCredential({
        identifier: trimmed,
        password,
        role: 'shipper',
        rememberMe,
      });

      if (result.ok && result.session && result.session.role === 'shipper') {
        setRole('shipper');
        navigate('/shipper');
        return;
      }

      setStatusMessage(
        result.message ??
          'Authentication service is not connected yet. Connect Firebase Authentication before signing in.',
      );
    } catch {
      setStatusMessage('Network error. Please check your connection and try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOtpLogin = async () => {
    if (isSubmitting || isDemoSubmitting) return;
    setIsSubmitting(true);
    setStatusMessage(null);
    try {
      const result = await requestShipperOtpLogin(identifier);
      if (!result.ok) {
        setStatusMessage(
          result.message ??
            'OTP login is not configured yet in this environment. Connect Firebase Authentication to enable OTP login.',
        );
      }
    } catch {
      setStatusMessage('Network error while checking OTP service. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDemoShipperLogin = async () => {
    if (isSubmitting || isDemoSubmitting) return;
    setIsDemoSubmitting(true);
    setStatusMessage(null);
    setDemoError(null);
    try {
      const result = await loginAsDemoRole('shipper');
      if (!result.ok) {
        setDemoError(result.message);
        return;
      }

      if (result.user.role !== 'shipper') {
        setDemoError(mapDemoLoginErrorMessage('ROLE_MISMATCH'));
        return;
      }

      const sessionCheck = await fetchAuthSession();
      if (!sessionCheck.authenticated || !sessionCheck.user) {
        setDemoError(
          'Your browser blocked the HttpOnly demo session cookie (common when third-party cookies are disabled inside an embedded preview iframe). Allow cookies for this site or open the app URL in a new tab.',
        );
        return;
      }

      if (sessionCheck.user.role !== 'shipper') {
        setDemoError(mapDemoLoginErrorMessage('ROLE_MISMATCH'));
        return;
      }

      setRole('shipper');
      navigate('/shipper', { replace: true });
    } catch {
      setDemoError(mapDemoLoginErrorMessage('NETWORK_ERROR'));
    } finally {
      setIsDemoSubmitting(false);
    }
  };

  return (
    <div className="relative min-h-[100dvh] w-full overflow-x-hidden bg-gradient-to-b from-[#EAF6FF] via-[#F6FBFF] to-[#F6FBFF] text-[#18364B] flex flex-col">
      {/* Subtle ORVEX corner accents matching locked brand design */}
      <svg
        aria-hidden="true"
        viewBox="0 0 120 140"
        className="pointer-events-none fixed top-0 start-0 w-14 sm:w-22 h-auto text-[#C8F542]"
        fill="currentColor"
      >
        <path d="M0,0 L34,0 C52,32 76,62 96,90 C62,74 30,48 0,18 Z" />
      </svg>

      <svg
        aria-hidden="true"
        viewBox="0 0 120 120"
        className="pointer-events-none fixed top-20 end-0 w-14 sm:w-22 h-auto text-[#73CFFF]/60"
        fill="currentColor"
      >
        <path d="M120,0 C84,12 52,36 32,74 C66,60 94,48 120,42 Z" />
      </svg>

      <svg
        aria-hidden="true"
        viewBox="0 0 400 70"
        preserveAspectRatio="none"
        className="pointer-events-none fixed bottom-0 inset-x-0 w-full h-9 sm:h-11"
      >
        <path d="M0,18 C65,24 115,46 168,70 L0,70 Z" fill="#73CFFF" />
        <path d="M150,70 C245,42 330,18 400,8 L400,70 Z" fill="#C8F542" />
      </svg>

      {/* Main centred vertical container */}
      <div className="relative z-10 flex-1 w-full max-w-[440px] mx-auto px-5 sm:px-6 pt-6 sm:pt-8 pb-[max(2.75rem,calc(env(safe-area-inset-bottom)+2rem))] flex flex-col justify-between">
        <div>
          {/* ORVEX wordmark centered at the top */}
          <header className="text-center">
            <div dir="ltr" className="inline-flex items-center justify-center" aria-label="ORVEX">
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
          </header>

          {/* Small warehouse & cardboard-box illustration */}
          <div className="mt-2 flex items-center justify-center">
            <ShipperWarehouseIllustration />
          </div>

          {/* Heading & Subtitle */}
          <div className="mt-1 text-center">
            <h1 className="text-[26px] sm:text-[28px] font-bold tracking-tight leading-[1.2] text-[#18364B]">
              Shipper Login
            </h1>
            <p className="mt-1 text-[14px] text-[#3F5B6E]">
              Move your business forward with ORVEX.
            </p>
          </div>

          {/* Login Form */}
          <form onSubmit={handleSubmit} noValidate className="mt-5 space-y-3">
            {/* Mobile Number / Email input */}
            <div>
              <div className="relative flex items-center">
                <label htmlFor="shipper-identifier" className="sr-only">
                  Mobile Number / Email
                </label>
                <Smartphone
                  className="pointer-events-none absolute start-4 w-[18px] h-[18px] text-[#5A7486]"
                  aria-hidden="true"
                />
                <input
                  id="shipper-identifier"
                  name="identifier"
                  type="text"
                  autoComplete="username"
                  disabled={isSubmitting}
                  value={identifier}
                  onChange={(e) => handleIdentifierChange(e.target.value)}
                  placeholder="Mobile Number / Email"
                  aria-invalid={Boolean(identifierError)}
                  aria-describedby={identifierError ? 'shipper-identifier-error' : undefined}
                  className={cn(
                    'w-full h-[50px] rounded-full bg-white ps-11 pe-4 text-[15px] text-[#18364B] placeholder:text-[#6E8696] shadow-[0_1px_4px_rgba(24,54,75,0.03)] transition-colors focus:outline-none disabled:opacity-60',
                    identifierError
                      ? 'border-[1.5px] border-[#D9383A] focus:border-[#D9383A]'
                      : 'border border-[#DCEAF4] focus:border-[#38B6FF]',
                  )}
                />
              </div>
              {identifierError ? (
                <p
                  id="shipper-identifier-error"
                  role="alert"
                  className="mt-1.5 ps-4 text-[12.5px] font-medium text-[#C62828]"
                >
                  {identifierError}
                </p>
              ) : null}
            </div>

            {/* Password input */}
            <PasswordField
              id="shipper-password"
              label="Password"
              placeholder="Password"
              showPasswordLabel="Show password"
              hidePasswordLabel="Hide password"
              value={password}
              onChange={handlePasswordChange}
              error={passwordError}
              disabled={isSubmitting}
            />

            {/* Remember me & Forgot Password */}
            <div className="flex items-center justify-between gap-2 px-1 pt-0.5">
              <label className="min-h-[36px] inline-flex items-center gap-2 text-[13.5px] font-medium text-[#18364B] cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(event) => handleRememberMeChange(event.target.checked)}
                  className="w-[18px] h-[18px] rounded-[4px] border border-[#9BB6C9] accent-[#1C9CF0] cursor-pointer focus-visible:outline-2 focus-visible:outline-[#18364B] focus-visible:outline-offset-2"
                />
                <span>Remember me</span>
              </label>

              <Link
                to="/auth/forgot-password?role=shipper"
                className="min-h-[36px] inline-flex items-center text-[13.5px] font-medium text-[#1570EF] underline underline-offset-2 hover:text-[#0F56BD] focus-visible:outline-2 focus-visible:outline-[#18364B] rounded-sm"
              >
                Forgot Password?
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
                className="w-full h-[52px] rounded-full bg-[#C8F542] hover:bg-[#BCE934] active:bg-[#AFDC28] disabled:opacity-70 text-[#18364B] font-bold text-[16px] inline-flex items-center justify-center gap-2 shadow-[0_6px_18px_-4px_rgba(24,54,75,0.14)] transition-colors cursor-pointer focus-visible:outline-2 focus-visible:outline-[#18364B] focus-visible:outline-offset-2"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" aria-hidden="true" />
                    <span>Signing in...</span>
                  </>
                ) : (
                  <>
                    <span>Login</span>
                    <ArrowRight className="w-5 h-5" aria-hidden="true" />
                  </>
                )}
              </button>
            </div>

            {/* OR divider */}
            <div className="py-1">
              <AuthDivider label="OR" />
            </div>

            {/* Continue with OTP secondary button */}
            <button
              type="button"
              onClick={() => void handleOtpLogin()}
              disabled={isSubmitting || isDemoSubmitting}
              className="w-full h-[50px] rounded-full bg-white border border-[#DCEAF4] hover:border-[#A8D4EC] hover:bg-[#F5FAFF] text-[#18364B] font-bold text-[15px] inline-flex items-center justify-center gap-2.5 shadow-[0_1px_4px_rgba(24,54,75,0.03)] transition-colors cursor-pointer focus-visible:outline-2 focus-visible:outline-[#18364B] focus-visible:outline-offset-2 disabled:opacity-60"
            >
              <Phone className="w-[18px] h-[18px] text-[#18364B]" aria-hidden="true" />
              <span>Continue with OTP</span>
            </button>
          </form>

          {demoLoginAvailable ? (
            <div className="mt-3 pt-1 space-y-2.5">
              <AuthDivider label="DEV DEMO" />
              {demoError ? (
                <div
                  role="alert"
                  className="rounded-2xl border border-[#F5B5B5] bg-[#FEF3F2] px-3.5 py-2.5 text-[12.5px] leading-snug text-[#B42318] flex items-start gap-2"
                >
                  <AlertCircle className="w-4 h-4 text-[#B42318] shrink-0 mt-0.5" aria-hidden="true" />
                  <span>{demoError}</span>
                </div>
              ) : null}
              <button
                type="button"
                onClick={() => void handleDemoShipperLogin()}
                disabled={isSubmitting || isDemoSubmitting}
                className="w-full h-[46px] rounded-full bg-[#EAF5FD] border border-[#BFE2F5] hover:border-[#73CFFF] hover:bg-[#DCEFFC] text-[#18364B] font-bold text-[14px] inline-flex items-center justify-center gap-2 transition-colors cursor-pointer focus-visible:outline-2 focus-visible:outline-[#18364B] focus-visible:outline-offset-2 disabled:opacity-60 disabled:cursor-wait"
              >
                {isDemoSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
                    <span>Opening Demo Shipper...</span>
                  </>
                ) : (
                  <>
                    <FlaskConical className="w-4 h-4 text-[#1570EF]" aria-hidden="true" />
                    <span>Continue as Demo Shipper</span>
                  </>
                )}
              </button>
            </div>
          ) : null}
        </div>

        {/* Create an Account link */}
        <p className="mt-5 text-center text-[13.5px] text-[#3F5B6E]">
          <span>New to ORVEX? </span>
          <Link
            to="/shipper/register"
            className="font-bold text-[#1570EF] underline underline-offset-2 hover:text-[#0F56BD] focus-visible:outline-2 focus-visible:outline-[#18364B] rounded-sm"
          >
            Create an Account
          </Link>
        </p>
      </div>
    </div>
  );
}
