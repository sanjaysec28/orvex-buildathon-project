import { CheckCircle2, Globe, LogOut, ShieldCheck } from 'lucide-react';
import { useState, type FormEvent } from 'react';
import { useSearchParams } from 'react-router-dom';
import { LanguageSwitcherModal } from '../../../components/ui/LanguageSwitcherModal';
import { useLanguagePreferences } from '../../language/useLanguagePreferences';
import { updateTransporterProfile } from '../../../services/transporter/transporterDashboardService';
import { useTransporterSession } from '../components/TransporterAuthGuard';
import { TransporterDashboardShell } from '../components/TransporterDashboardShell';
import { getInitials } from '../transporterDashboardUtils';

export function TransporterProfileSubPage() {
  const [searchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') === 'settings' ? 'settings' : 'profile';

  const { session, refreshSession, logout } = useTransporterSession();
  const { currentLanguage } = useLanguagePreferences();

  const [displayName, setDisplayName] = useState(session.displayName);
  const [companyName, setCompanyName] = useState(session.companyName ?? '');
  const [city, setCity] = useState(session.city ?? 'Chennai');
  const [state, setState] = useState(session.state ?? 'Tamil Nadu');
  const [email, setEmail] = useState(session.email ?? '');
  const [saving, setSaving] = useState(false);
  const [savedMsg, setSavedMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [langModalOpen, setLangModalOpen] = useState(false);

  const handleSave = async (event: FormEvent) => {
    event.preventDefault();
    setSaving(true);
    setSavedMsg(null);
    setErrorMsg(null);
    const res = await updateTransporterProfile({
      displayName,
      companyName,
      city,
      state,
      email,
    });
    setSaving(false);
    if (!res.ok) {
      setErrorMsg(res.message);
      return;
    }
    await refreshSession();
    setSavedMsg('Profile & operational details updated.');
  };

  return (
    <TransporterDashboardShell
      pageTitle={activeTab === 'settings' ? 'Account Settings' : 'Profile & Settings'}
    >
      <div className="space-y-4 max-w-3xl">
        {/* Account Overview Header */}
        <section className="rounded-[20px] bg-white border border-[#DCEAF4] p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <span className="w-14 h-14 rounded-full bg-[#DCEEFB] text-[#18364B] text-lg font-extrabold flex items-center justify-center shrink-0">
              {getInitials(session.displayName)}
            </span>
            <div>
              <h2 className="text-lg font-extrabold text-[#18364B]">{session.displayName}</h2>
              <p className="text-xs text-[#4A6578]">
                {session.mobileNumber} {session.applicationId ? `· ${session.applicationId}` : ''}
              </p>
              <span className="mt-1 inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#D8FA7B] text-[#18364B] text-[11px] font-bold">
                <ShieldCheck className="w-3.5 h-3.5 text-[#228B22]" aria-hidden="true" />
                <span>{session.verificationStatus} Transporter</span>
              </span>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setLangModalOpen(true)}
              className="h-10 px-4 rounded-full border border-[#CBE0EE] bg-[#F8FCFF] hover:bg-[#EAF5FD] text-xs font-bold text-[#18364B] inline-flex items-center gap-1.5 cursor-pointer"
            >
              <Globe className="w-4 h-4 text-[#1570EF]" aria-hidden="true" />
              <span>Language: {currentLanguage.nativeName}</span>
            </button>
            <button
              type="button"
              onClick={() => void logout()}
              className="h-10 px-4 rounded-full border border-[#F5B5B5] bg-[#FEF3F2] text-xs font-bold text-[#B42318] inline-flex items-center gap-1.5 cursor-pointer"
            >
              <LogOut className="w-4 h-4" aria-hidden="true" />
              <span>Logout</span>
            </button>
          </div>
        </section>

        {/* Editable Form */}
        <form
          onSubmit={handleSave}
          className="rounded-[20px] bg-white border border-[#DCEAF4] p-5 space-y-4"
        >
          <h3 className="text-base font-extrabold text-[#18364B]">Transporter Profile Details</h3>

          {savedMsg ? (
            <div className="rounded-xl bg-[#E7F8D8] border border-[#B7EC42] px-3.5 py-2.5 text-xs font-bold text-[#18364B] flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#286B14]" aria-hidden="true" />
              <span>{savedMsg}</span>
            </div>
          ) : null}

          {errorMsg ? (
            <div className="rounded-xl bg-[#FEF3F2] border border-[#F5B5B5] px-3.5 py-2.5 text-xs font-bold text-[#B42318]">
              {errorMsg}
            </div>
          ) : null}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <label className="space-y-1 text-xs font-bold text-[#18364B]">
              <span>Full / Display Name</span>
              <input
                type="text"
                required
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="w-full h-11 px-3.5 rounded-xl border border-[#CBE0EE] bg-[#F8FCFF] text-sm font-semibold text-[#18364B]"
              />
            </label>

            <label className="space-y-1 text-xs font-bold text-[#18364B]">
              <span>Transport Business Name (Optional)</span>
              <input
                type="text"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                className="w-full h-11 px-3.5 rounded-xl border border-[#CBE0EE] bg-[#F8FCFF] text-sm font-semibold text-[#18364B]"
              />
            </label>

            <label className="space-y-1 text-xs font-bold text-[#18364B]">
              <span>Primary Operating City</span>
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full h-11 px-3.5 rounded-xl border border-[#CBE0EE] bg-[#F8FCFF] text-sm font-semibold text-[#18364B]"
              />
            </label>

            <label className="space-y-1 text-xs font-bold text-[#18364B]">
              <span>State</span>
              <input
                type="text"
                value={state}
                onChange={(e) => setState(e.target.value)}
                className="w-full h-11 px-3.5 rounded-xl border border-[#CBE0EE] bg-[#F8FCFF] text-sm font-semibold text-[#18364B]"
              />
            </label>

            <label className="sm:col-span-2 space-y-1 text-xs font-bold text-[#18364B]">
              <span>Email Address</span>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full h-11 px-3.5 rounded-xl border border-[#CBE0EE] bg-[#F8FCFF] text-sm font-semibold text-[#18364B]"
              />
            </label>
          </div>

          <button
            type="submit"
            disabled={saving}
            className="h-11 px-6 rounded-full bg-[#C8F542] hover:bg-[#BCE934] disabled:opacity-60 text-[#18364B] text-sm font-bold cursor-pointer"
          >
            {saving ? 'Saving Changes...' : 'Save Profile Changes'}
          </button>
        </form>
      </div>

      <LanguageSwitcherModal open={langModalOpen} onClose={() => setLangModalOpen(false)} />
    </TransporterDashboardShell>
  );
}
