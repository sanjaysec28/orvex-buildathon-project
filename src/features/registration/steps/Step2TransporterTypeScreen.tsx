import { ArrowLeft, ArrowRight } from 'lucide-react';
import { cn } from '../../../utils/cn';
import type { TransporterType } from '../registrationTypes';

export interface Step2TransporterTypeScreenProps {
  selectedType: TransporterType;
  onSelectType: (type: TransporterType) => void;
  onContinue: () => void;
  onBack: () => void;
}

const TRANSPORTER_CARDS: ReadonlyArray<{
  type: TransporterType;
  title: string;
  description: string;
  imageSrc: string;
}> = [
  {
    type: 'individual',
    title: 'Individual Owner',
    description: 'Manage your own transport operations.',
    imageSrc: '/assets/orvex-transporter-truck.webp',
  },
  {
    type: 'company',
    title: 'Transport Company',
    description: 'Manage a transport business, fleet and drivers.',
    imageSrc: '/assets/orvex-company-fleet.webp',
  },
];

export function Step2TransporterTypeScreen({
  selectedType,
  onSelectType,
  onContinue,
  onBack,
}: Step2TransporterTypeScreenProps) {
  return (
    <div className="flex-1 flex flex-col justify-between gap-4">
      <div
        role="radiogroup"
        aria-label="Choose Transporter Type"
        className="space-y-3.5 my-auto py-1"
      >
        {TRANSPORTER_CARDS.map((card) => {
          const isSelected = selectedType === card.type;
          return (
            <button
              key={card.type}
              type="button"
              role="radio"
              aria-checked={isSelected}
              data-transporter-type={card.type}
              onClick={() => onSelectType(card.type)}
              className={cn(
                'relative w-full min-h-[158px] rounded-[20px] p-4 flex items-center gap-3 text-start transition-colors cursor-pointer focus-visible:outline-2 focus-visible:outline-[#18364B] focus-visible:outline-offset-2',
                isSelected
                  ? 'bg-white border-[2px] border-[#82CF1F] shadow-[0_6px_18px_-4px_rgba(130,207,31,0.22)]'
                  : 'bg-white border border-[#DCEAF4] shadow-[0_3px_12px_-3px_rgba(24,54,75,0.06)] hover:border-[#9FD4F2]',
              )}
            >
              {/* Top-right radio indicator */}
              <span
                aria-hidden="true"
                className={cn(
                  'absolute top-3.5 end-3.5 w-5 h-5 rounded-full flex items-center justify-center border-[1.75px] transition-colors',
                  isSelected
                    ? 'border-[#339E35] bg-white'
                    : 'border-[#9FB5C5] bg-white',
                )}
              >
                {isSelected ? (
                  <span className="w-2.5 h-2.5 rounded-full bg-[#339E35]" />
                ) : null}
              </span>

              <div className="w-[46%] shrink-0 flex items-center justify-center">
                <img
                  src={card.imageSrc}
                  alt=""
                  aria-hidden="true"
                  className="w-full max-h-[108px] object-contain select-none pointer-events-none"
                />
              </div>

              <div className="flex-1 min-w-0 pe-4">
                <p className="text-[17px] font-bold leading-snug text-[#18364B]">
                  {card.title}
                </p>
                <p className="mt-1 text-[13px] leading-relaxed text-[#3F5B6E]">
                  {card.description}
                </p>
              </div>
            </button>
          );
        })}
      </div>

      <div className="space-y-2.5 pt-2">
        <button
          type="button"
          disabled={!selectedType}
          onClick={onContinue}
          className="w-full h-[52px] rounded-full bg-[#C8F542] hover:bg-[#BCE934] active:bg-[#AFDC28] disabled:opacity-60 text-[#18364B] font-bold text-[16px] inline-flex items-center justify-center gap-2 shadow-[0_6px_18px_-4px_rgba(24,54,75,0.14)] transition-colors cursor-pointer"
        >
          <span>Continue</span>
          <ArrowRight className="w-5 h-5" aria-hidden="true" />
        </button>

        <button
          type="button"
          onClick={onBack}
          className="w-full h-[48px] rounded-full bg-white border border-[#DCEAF4] hover:border-[#A8D4EC] text-[#18364B] font-bold text-[15px] inline-flex items-center justify-center gap-2 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" aria-hidden="true" />
          <span>Back</span>
        </button>
      </div>
    </div>
  );
}
