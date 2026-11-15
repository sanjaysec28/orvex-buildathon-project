import { ArrowRight, Handshake, MapPin } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { fetchTransporterOffers } from '../../../services/transporter/transporterDashboardService';
import { TransporterDashboardShell } from '../components/TransporterDashboardShell';
import type { TransporterOffer } from '../transporterDashboardTypes';
import { formatInr } from '../transporterDashboardUtils';

export function TransporterOffersPage() {
  const [offers, setOffers] = useState<TransporterOffer[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    void fetchTransporterOffers().then((res) => {
      if (!active) return;
      if (res.ok) setOffers(res.data.offers);
      setLoading(false);
    });
    return () => {
      active = false;
    };
  }, []);

  return (
    <TransporterDashboardShell pageTitle="Offers & Negotiations">
      <div className="space-y-4">
        <div className="rounded-[20px] bg-white border border-[#DCEAF4] p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-extrabold text-[#18364B]">
              Submitted Freight Offers ({offers.length})
            </h2>
            <p className="text-xs sm:text-sm text-[#4A6578]">
              Track quotes submitted for outbound and return corridor shipments.
            </p>
          </div>
          <Link
            to="/transporter/loads"
            className="h-10 px-5 rounded-full bg-[#C8F542] hover:bg-[#BCE934] text-[#18364B] text-sm font-bold inline-flex items-center justify-center gap-1.5 shrink-0"
          >
            <span>Browse Loads</span>
            <ArrowRight className="w-4 h-4" aria-hidden="true" />
          </Link>
        </div>

        {loading ? (
          <div className="rounded-[20px] bg-white border border-[#DCEAF4] p-8 text-center text-sm text-[#4A6578]">
            Loading offers...
          </div>
        ) : offers.length === 0 ? (
          <div className="rounded-[20px] bg-white border border-[#DCEAF4] p-8 text-center space-y-3">
            <Handshake className="w-9 h-9 text-[#5A7486] mx-auto" aria-hidden="true" />
            <h3 className="text-base font-bold text-[#18364B]">No active offers submitted yet.</h3>
            <p className="text-sm text-[#4A6578]">
              Open any compatible freight opportunity in Load Discovery to submit a freight quote.
            </p>
            <Link
              to="/transporter/loads"
              className="inline-flex items-center gap-1.5 h-10 px-5 rounded-full bg-[#C8F542] hover:bg-[#BCE934] text-[#18364B] text-sm font-bold"
            >
              <span>Discover Loads</span>
              <ArrowRight className="w-4 h-4" aria-hidden="true" />
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {offers.map((offer) => (
              <article
                key={offer.id}
                className="rounded-[20px] bg-white border border-[#DCEAF4] p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-1.5 text-[15px] font-extrabold text-[#18364B]">
                    <MapPin className="w-4 h-4 text-[#DC2626]" aria-hidden="true" />
                    <span>
                      {offer.originCity}, {offer.originState} → {offer.destinationCity}, {offer.destinationState}
                    </span>
                  </div>
                  <p className="text-xs text-[#4A6578]">
                    {offer.cargoType} · Vehicle: <span className="font-bold text-[#18364B]">{offer.vehicleReg}</span>
                  </p>
                  {offer.notes ? <p className="text-xs text-[#5A7486]">{offer.notes}</p> : null}
                </div>

                <div className="sm:text-right space-y-1 shrink-0">
                  <p className="text-lg font-extrabold text-[#18364B]">
                    {formatInr(offer.proposedFreightInr)}
                  </p>
                  <span className="inline-flex px-3 py-0.5 rounded-full bg-[#FFF3D6] text-[#9A6700] border border-[#F4DB88] text-xs font-bold">
                    {offer.status}
                  </span>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </TransporterDashboardShell>
  );
}
