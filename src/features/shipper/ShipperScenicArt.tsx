import { Package } from 'lucide-react';
import { useState } from 'react';
import shipperWarehouseHeroImg from '../../assets/images/shipper_warehouse_hero_1794757457325.jpg';
import { cn } from '../../utils/cn';

export function ShipperWelcomeBannerBackdrop({ className }: { className?: string }) {
  const [imgFailed, setImgFailed] = useState(false);

  return (
    <div
      className={cn(
        'absolute inset-0 pointer-events-none overflow-hidden bg-gradient-to-r from-[#E6F4FD] via-[#D8EEFC] to-[#B4E0FA]',
        className,
      )}
      aria-hidden="true"
    >
      {!imgFailed ? (
        <img
          src={shipperWarehouseHeroImg}
          alt=""
          referrerPolicy="no-referrer"
          onError={() => setImgFailed(true)}
          className="absolute right-0 top-0 h-full w-[82%] sm:w-[64%] md:w-[58%] object-cover object-[50%_76%] select-none"
        />
      ) : null}

      {/* Smooth left-side cloud-white & sky-blue readability wash while keeping truck & warehouse crisp */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'linear-gradient(90deg, #EAF6FE 0%, #EAF6FE 34%, rgba(234,246,254,0.88) 42%, rgba(234,246,254,0.22) 49%, rgba(234,246,254,0) 56%)',
        }}
      />

      {/* Subtle bottom edge mist for crisp integration */}
      <div className="absolute inset-x-0 bottom-0 h-4 bg-gradient-to-t from-[#EBF6FE]/55 to-transparent" />
    </div>
  );
}

export function ShipperSidebarPromoArt({ className }: { className?: string }) {
  const [imgFailed, setImgFailed] = useState(false);

  return (
    <div
      className={cn(
        'relative h-24 bg-gradient-to-b from-[#2E628D]/50 to-[#0C2237] overflow-hidden',
        className,
      )}
      aria-hidden="true"
    >
      {!imgFailed ? (
        <img
          src={shipperWarehouseHeroImg}
          alt=""
          referrerPolicy="no-referrer"
          onError={() => setImgFailed(true)}
          className="w-full h-full object-cover object-[48%_74%] group-hover:scale-[1.03] transition-transform duration-200"
        />
      ) : null}
      <div className="absolute inset-0 bg-gradient-to-t from-[#0A1E31]/75 via-transparent to-[#0D253C]/15" />
      <div
        className="absolute inset-x-0 bottom-0 h-7 bg-[#C8F542] opacity-95"
        style={{ clipPath: 'ellipse(95% 88% at 22% 100%)' }}
      />
    </div>
  );
}

export function ShipperCargoThumb({
  className,
  alt = 'Shipment cargo boxes',
}: {
  className?: string;
  alt?: string;
}) {
  const [imgFailed, setImgFailed] = useState(false);

  if (imgFailed) {
    return (
      <div
        className={cn(
          'w-14 h-11 rounded-xl bg-[#F4FAFE] border border-[#E1EFF8] flex items-center justify-center shrink-0 text-[#5A7486]',
          className,
        )}
      >
        <Package className="w-5 h-5" aria-hidden="true" />
      </div>
    );
  }

  return (
    <div
      className={cn(
        'w-14 h-11 rounded-xl bg-[#F4FAFE] border border-[#E1EFF8] flex items-center justify-center shrink-0 overflow-hidden p-1',
        className,
      )}
    >
      <img
        src="/assets/orvex-shipper-pallet.webp"
        alt={alt}
        referrerPolicy="no-referrer"
        onError={() => setImgFailed(true)}
        className="w-full h-full object-contain select-none pointer-events-none"
      />
    </div>
  );
}
