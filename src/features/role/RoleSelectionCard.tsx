import { Check, Package, Truck } from 'lucide-react';
import type { UserRole } from '../../types/domain';
import { cn } from '../../utils/cn';

export interface RoleSelectionCardProps {
  role: UserRole;
  iconName: 'truck' | 'package';
  illustrationSrc: string;
  title: string;
  roleTag: string;
  description: string;
  isSelected: boolean;
  onSelect: (role: UserRole) => void;
}

export function RoleSelectionCard({
  role,
  iconName,
  illustrationSrc,
  title,
  roleTag,
  description,
  isSelected,
  onSelect,
}: RoleSelectionCardProps) {
  const Icon = iconName === 'truck' ? Truck : Package;

  return (
    <button
      type="button"
      role="radio"
      aria-checked={isSelected}
      data-role-option={role}
      onClick={() => onSelect(role)}
      className={cn(
        'relative w-full h-full min-h-[178px] sm:min-h-[192px] rounded-[22px] p-3.5 sm:p-4 flex items-center text-start transition-colors duration-150 cursor-pointer focus-visible:outline-2 focus-visible:outline-[#18364B] focus-visible:outline-offset-2',
        isSelected
          ? 'bg-[#E5F4FF] border-[1.75px] border-[#2196F3] shadow-[0_6px_18px_-4px_rgba(33,150,243,0.18)]'
          : 'bg-white border border-[#DCEAF4] shadow-[0_4px_14px_-4px_rgba(24,54,75,0.06)] hover:border-[#9FD4F2]',
      )}
    >
      {/* Top-end radio / checkmark indicator */}
      <span
        aria-hidden="true"
        className={cn(
          'absolute top-3 end-3 w-[22px] h-[22px] rounded-full flex items-center justify-center transition-colors',
          isSelected
            ? 'bg-[#1C9CF0] text-white shadow-xs'
            : 'border-[1.75px] border-[#647B8C] bg-white',
        )}
      >
        {isSelected ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : null}
      </span>

      {/* Left studio illustration section */}
      <div className="w-[40%] shrink-0 pe-2 flex items-center justify-center">
        <img
          src={illustrationSrc}
          alt=""
          aria-hidden="true"
          loading="eager"
          decoding="async"
          className="w-full max-h-[126px] sm:max-h-[140px] object-contain select-none pointer-events-none"
        />
      </div>

      {/* Subtle vertical divider matching reference */}
      <span
        aria-hidden="true"
        className="w-px self-stretch my-2 bg-[#D5E6F2] shrink-0"
      />

      {/* Right role icon, title, tag, and description */}
      <div className="flex-1 min-w-0 ps-3 pe-1 flex flex-col justify-center">
        <div className="flex items-center gap-2.5 pe-5">
          <span
            aria-hidden="true"
            className="w-9 h-9 rounded-[10px] bg-[#D6EEFC] text-[#18364B] flex items-center justify-center shrink-0"
          >
            <Icon className="w-[18px] h-[18px] stroke-[2]" />
          </span>

          <div className="min-w-0">
            <span className="block text-[16.5px] sm:text-[18px] font-bold leading-tight text-[#18364B]">
              {title}
            </span>
            <span className="block text-[12.5px] sm:text-[13.5px] font-medium text-[#3F5B6E] leading-tight mt-0.5">
              {roleTag}
            </span>
          </div>
        </div>

        <p className="mt-2.5 text-[12.5px] sm:text-[13px] leading-[1.38] text-[#4A6578]">
          {description}
        </p>
      </div>
    </button>
  );
}
