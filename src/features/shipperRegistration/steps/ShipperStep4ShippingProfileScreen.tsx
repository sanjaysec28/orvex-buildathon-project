import {
  ArrowLeft,
  ArrowRight,
  Box,
  CalendarClock,
  ChevronDown,
  MapPin,
  Navigation,
  Plus,
  Scale,
  Tag,
  Truck,
  X,
} from 'lucide-react';
import { useMemo, useState, type FormEvent } from 'react';
import { cn } from '../../../utils/cn';
import { INDIAN_STATES_CITIES } from '../../registration/indianLocations';
import { WizardPillSelect } from '../../registration/components/RegistrationInputs';
import { validateShippingProfileStep } from '../shipperValidation';
import type {
  MainGoodsCategory,
  ShipmentFrequency,
  ShipperRegistrationDraft,
  ShipperVehicleType,
  ShippingProfileData,
  WeightUnit,
} from '../shipperTypes';

export interface ShipperStep4ShippingProfileScreenProps {
  draft: ShipperRegistrationDraft;
  onUpdateProfile: (patch: Partial<ShippingProfileData>) => void;
  onToggleCargoTag: (tag: string) => void;
  onToggleVehicleType: (vehicleType: ShipperVehicleType) => void;
  onAddDeliveryLocation: (location: string) => void;
  onRemoveDeliveryLocation: (location: string) => void;
  onBack: () => void;
  onContinue: () => void;
}

const GOODS_CATEGORIES: ReadonlyArray<{ value: MainGoodsCategory; label: string }> = [
  { value: 'General Goods', label: 'General Goods' },
  { value: 'FMCG', label: 'FMCG' },
  { value: 'Textiles', label: 'Textiles' },
  { value: 'Machinery', label: 'Machinery' },
  { value: 'Agricultural Products', label: 'Agricultural Products' },
  { value: 'Electronics', label: 'Electronics' },
  { value: 'Other', label: 'Other' },
];

const SUGGESTED_CARGO_TAGS: readonly string[] = [
  'Cartons & Pallets',
  'FMCG',
  'Textiles',
  'Machinery Parts',
  'Agricultural Produce',
  'Electronics',
];

const VEHICLE_OPTIONS: readonly ShipperVehicleType[] = [
  '14 ft',
  '17 ft',
  '20 ft',
  '32 ft',
  'Open Body',
  'Container',
  'Trailer',
];

const FREQUENCY_OPTIONS: ReadonlyArray<{ value: ShipmentFrequency; label: string }> = [
  { value: 'Daily', label: 'Daily' },
  { value: 'Weekly', label: 'Weekly' },
  { value: 'Monthly', label: 'Monthly' },
  { value: 'Occasional', label: 'Occasional' },
];

const ALL_INDIAN_CITIES = Array.from(
  new Set(INDIAN_STATES_CITIES.flatMap((entry) => entry.cities)),
).sort((a, b) => a.localeCompare(b));

export function ShipperStep4ShippingProfileScreen({
  draft,
  onUpdateProfile,
  onToggleCargoTag,
  onToggleVehicleType,
  onAddDeliveryLocation,
  onRemoveDeliveryLocation,
  onBack,
  onContinue,
}: ShipperStep4ShippingProfileScreenProps) {
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [cargoInput, setCargoInput] = useState('');
  const [pickupFocused, setPickupFocused] = useState(false);
  const [deliveryDraft, setDeliveryDraft] = useState('');

  const sp = draft.shippingProfile;

  const clearError = (key: string) => {
    if (errors[key]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[key];
        return next;
      });
    }
  };

  const pickupSuggestions = useMemo(() => {
    const q = sp.primaryPickupLocation.trim().toLowerCase();
    const list = q
      ? ALL_INDIAN_CITIES.filter((c) => c.toLowerCase().includes(q))
      : ['Chennai', 'Bengaluru', 'Hosur', 'Coimbatore', 'Hyderabad', 'Mumbai', 'Pune', 'New Delhi'];
    return list.slice(0, 6);
  }, [sp.primaryPickupLocation]);

  const deliverySuggestions = useMemo(() => {
    const q = deliveryDraft.trim().toLowerCase();
    const existing = new Set(sp.regularDeliveryLocations.map((x) => x.toLowerCase()));
    const base = q
      ? ALL_INDIAN_CITIES.filter((c) => c.toLowerCase().includes(q) && !existing.has(c.toLowerCase()))
      : ['Bengaluru', 'Hyderabad', 'Coimbatore', 'Chennai', 'Mumbai', 'Pune'].filter(
          (c) => !existing.has(c.toLowerCase()),
        );
    return base.slice(0, 5);
  }, [deliveryDraft, sp.regularDeliveryLocations]);

  const handleAddCargo = () => {
    const trimmed = cargoInput.trim();
    if (trimmed.length < 2) return;
    clearError('typicalCargo');
    if (!sp.typicalCargo.includes(trimmed)) {
      onToggleCargoTag(trimmed);
    }
    setCargoInput('');
  };

  const handleAddDelivery = () => {
    const trimmed = deliveryDraft.trim();
    if (trimmed.length < 2) return;
    clearError('regularDeliveryLocations');
    onAddDeliveryLocation(trimmed);
    setDeliveryDraft('');
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const validationErrors = validateShippingProfileStep(draft);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    setErrors({});
    onContinue();
  };

  return (
    <form onSubmit={handleSubmit} noValidate className="flex-1 flex flex-col justify-between gap-4">
      <div className="space-y-3">
        {/* 1. Main Goods Category */}
        <div>
          <label
            htmlFor="shp-goods-category"
            className="block text-[12px] font-semibold text-[#3F5B6E] ps-3 mb-1"
          >
            Main Goods Category
          </label>
          <WizardPillSelect
            id="shp-goods-category"
            compact
            label="Main Goods Category"
            placeholder="Main Goods Category"
            icon={<Box className="w-[17px] h-[17px]" />}
            value={sp.mainGoodsCategory}
            options={GOODS_CATEGORIES}
            onChange={(val) => {
              clearError('mainGoodsCategory');
              onUpdateProfile({ mainGoodsCategory: val as MainGoodsCategory });
            }}
            error={errors.mainGoodsCategory}
          />
        </div>

        {/* 2. Typical Cargo (multi-select chips + custom input) */}
        <div className="rounded-[18px] bg-white border border-[#DCEAF4] p-3.5 shadow-[0_1px_4px_rgba(24,54,75,0.03)] space-y-2">
          <div className="flex items-center gap-2 text-[12.5px] font-bold text-[#18364B]">
            <Tag className="w-4 h-4 text-[#5A7486]" aria-hidden="true" />
            <span>Typical Cargo</span>
          </div>

          <div className="flex flex-wrap gap-1.5">
            {Array.from(new Set([...SUGGESTED_CARGO_TAGS, ...sp.typicalCargo])).map((tag) => {
              const selected = sp.typicalCargo.includes(tag);
              return (
                <button
                  key={tag}
                  type="button"
                  aria-pressed={selected}
                  onClick={() => {
                    clearError('typicalCargo');
                    onToggleCargoTag(tag);
                  }}
                  className={cn(
                    'px-3 py-1.5 rounded-full text-[12px] font-semibold transition-colors cursor-pointer border',
                    selected
                      ? 'bg-[#C8F542] border-[#82CF1F] text-[#18364B]'
                      : 'bg-[#F4F9FD] border-[#DCEAF4] text-[#3F5B6E] hover:border-[#9FD4F2]',
                  )}
                >
                  {tag}
                </button>
              );
            })}
          </div>

          <div className="flex items-center gap-2 pt-0.5">
            <input
              type="text"
              placeholder="Add custom cargo (e.g., Auto Spares)"
              value={cargoInput}
              onChange={(e) => setCargoInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAddCargo();
                }
              }}
              className="flex-1 h-9 rounded-full bg-[#F6FBFF] border border-[#DCEAF4] px-3.5 text-[13px] text-[#18364B] placeholder:text-[#6E8696] focus:outline-none focus:border-[#38B6FF]"
            />
            <button
              type="button"
              onClick={handleAddCargo}
              aria-label="Add custom cargo"
              className="w-9 h-9 rounded-full bg-[#EAF5FC] hover:bg-[#D4ECFA] text-[#1570EF] flex items-center justify-center shrink-0 cursor-pointer"
            >
              <Plus className="w-4 h-4" aria-hidden="true" />
            </button>
          </div>

          {errors.typicalCargo ? (
            <p role="alert" className="text-[12px] font-medium text-[#C62828]">
              {errors.typicalCargo}
            </p>
          ) : null}
        </div>

        {/* 3. Average Shipment Weight */}
        <div>
          <label
            htmlFor="shp-avg-weight"
            className="block text-[12px] font-semibold text-[#3F5B6E] ps-3 mb-1"
          >
            Average Shipment Weight
          </label>
          <div
            className={cn(
              'flex items-center rounded-full bg-white h-[46px] ps-4 pe-1.5 shadow-[0_1px_3px_rgba(24,54,75,0.03)]',
              errors.averageWeightValue
                ? 'border-[1.5px] border-[#D9383A]'
                : 'border border-[#DCEAF4] focus-within:border-[#38B6FF]',
            )}
          >
            <Scale className="w-[17px] h-[17px] text-[#5A7486] shrink-0" aria-hidden="true" />
            <input
              id="shp-avg-weight"
              type="number"
              min="0.1"
              step="0.1"
              inputMode="decimal"
              placeholder="e.g., 5"
              value={sp.averageWeightValue}
              onChange={(e) => {
                clearError('averageWeightValue');
                onUpdateProfile({ averageWeightValue: e.target.value });
              }}
              className="flex-1 min-w-0 bg-transparent ps-2.5 pe-2 text-[14.5px] text-[#18364B] placeholder:text-[#6E8696] focus:outline-none tabular-nums"
            />
            <div className="relative flex items-center shrink-0">
              <select
                aria-label="Weight Unit"
                value={sp.averageWeightUnit}
                onChange={(e) =>
                  onUpdateProfile({ averageWeightUnit: e.target.value as WeightUnit })
                }
                className="appearance-none h-[34px] rounded-full bg-[#EEF6FC] ps-3.5 pe-7 text-[13px] font-bold text-[#18364B] focus:outline-none cursor-pointer"
              >
                <option value="Tonnes">Tonnes</option>
                <option value="Kg">Kg</option>
              </select>
              <ChevronDown
                className="pointer-events-none absolute end-2 w-3.5 h-3.5 text-[#3F5B6E]"
                aria-hidden="true"
              />
            </div>
          </div>
          {errors.averageWeightValue ? (
            <p role="alert" className="mt-1 ps-4 text-[12px] font-medium text-[#C62828]">
              {errors.averageWeightValue}
            </p>
          ) : null}
        </div>

        {/* 4. Preferred Vehicle Types */}
        <div className="rounded-[18px] bg-white border border-[#DCEAF4] p-3.5 shadow-[0_1px_4px_rgba(24,54,75,0.03)] space-y-2">
          <div className="flex items-center gap-2 text-[12.5px] font-bold text-[#18364B]">
            <Truck className="w-4 h-4 text-[#5A7486]" aria-hidden="true" />
            <span>Preferred Vehicle Types</span>
          </div>

          <div className="flex flex-wrap gap-2">
            {VEHICLE_OPTIONS.map((vType) => {
              const selected = sp.preferredVehicleTypes.includes(vType);
              return (
                <button
                  key={vType}
                  type="button"
                  aria-pressed={selected}
                  data-vehicle-type={vType}
                  onClick={() => {
                    clearError('preferredVehicleTypes');
                    onToggleVehicleType(vType);
                  }}
                  className={cn(
                    'min-h-[36px] px-3.5 rounded-full text-[13px] font-bold transition-colors cursor-pointer border',
                    selected
                      ? 'bg-[#C8F542] border-[#82CF1F] text-[#18364B] shadow-[0_2px_6px_rgba(130,207,31,0.2)]'
                      : 'bg-white border-[#DCEAF4] text-[#18364B] hover:border-[#9FD4F2]',
                  )}
                >
                  {vType}
                </button>
              );
            })}
          </div>

          {errors.preferredVehicleTypes ? (
            <p role="alert" className="text-[12px] font-medium text-[#C62828]">
              {errors.preferredVehicleTypes}
            </p>
          ) : null}
        </div>

        {/* 5. Primary Pickup Location (searchable input) */}
        <div className="relative">
          <label
            htmlFor="shp-pickup-location"
            className="block text-[12px] font-semibold text-[#3F5B6E] ps-3 mb-1"
          >
            Primary Pickup Location
          </label>
          <div
            className={cn(
              'relative flex items-center rounded-full bg-white h-[46px] shadow-[0_1px_3px_rgba(24,54,75,0.03)]',
              errors.primaryPickupLocation
                ? 'border-[1.5px] border-[#D9383A]'
                : 'border border-[#DCEAF4] focus-within:border-[#38B6FF]',
            )}
          >
            <MapPin
              className="pointer-events-none absolute start-4 w-[17px] h-[17px] text-[#5A7486]"
              aria-hidden="true"
            />
            <input
              id="shp-pickup-location"
              type="text"
              placeholder="Search pickup city (e.g., Chennai)"
              value={sp.primaryPickupLocation}
              onFocus={() => setPickupFocused(true)}
              onBlur={() => {
                window.setTimeout(() => setPickupFocused(false), 160);
              }}
              onChange={(e) => {
                clearError('primaryPickupLocation');
                onUpdateProfile({ primaryPickupLocation: e.target.value });
              }}
              className="w-full h-full rounded-full bg-transparent ps-11 pe-4 text-[14.5px] text-[#18364B] placeholder:text-[#6E8696] focus:outline-none"
            />
          </div>

          {pickupFocused && pickupSuggestions.length > 0 ? (
            <div className="mt-1 rounded-2xl bg-white border border-[#DCEAF4] shadow-md p-1.5 flex flex-wrap gap-1.5">
              {pickupSuggestions.map((city) => (
                <button
                  key={city}
                  type="button"
                  onMouseDown={(e) => {
                    e.preventDefault();
                    clearError('primaryPickupLocation');
                    onUpdateProfile({ primaryPickupLocation: city });
                    setPickupFocused(false);
                  }}
                  className="px-2.5 py-1 rounded-full bg-[#F4F9FD] hover:bg-[#E1F1FC] text-[12px] font-medium text-[#18364B] cursor-pointer"
                >
                  {city}
                </button>
              ))}
            </div>
          ) : null}

          {errors.primaryPickupLocation ? (
            <p role="alert" className="mt-1 ps-4 text-[12px] font-medium text-[#C62828]">
              {errors.primaryPickupLocation}
            </p>
          ) : null}
        </div>

        {/* 6. Regular Delivery Locations */}
        <div className="rounded-[18px] bg-white border border-[#DCEAF4] p-3.5 shadow-[0_1px_4px_rgba(24,54,75,0.03)] space-y-2">
          <div className="flex items-center gap-2 text-[12.5px] font-bold text-[#18364B]">
            <Navigation className="w-4 h-4 text-[#5A7486]" aria-hidden="true" />
            <span>Regular Delivery Locations</span>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="text"
              aria-label="Add delivery location"
              placeholder="Add city (e.g., Bengaluru, Hyderabad)"
              value={deliveryDraft}
              onChange={(e) => setDeliveryDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAddDelivery();
                }
              }}
              className="flex-1 h-10 rounded-full bg-[#F6FBFF] border border-[#DCEAF4] px-3.5 text-[13.5px] text-[#18364B] placeholder:text-[#6E8696] focus:outline-none focus:border-[#38B6FF]"
            />
            <button
              type="button"
              onClick={handleAddDelivery}
              aria-label="Add delivery location"
              className="w-10 h-10 rounded-full bg-[#DCEFFC] hover:bg-[#C7E4FA] text-[#18364B] flex items-center justify-center shrink-0 cursor-pointer"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" aria-hidden="true" />
            </button>
          </div>

          {deliverySuggestions.length > 0 ? (
            <div className="flex flex-wrap gap-1.5">
              {deliverySuggestions.map((city) => (
                <button
                  key={city}
                  type="button"
                  onClick={() => {
                    clearError('regularDeliveryLocations');
                    onAddDeliveryLocation(city);
                    setDeliveryDraft('');
                  }}
                  className="px-2.5 py-1 rounded-full bg-[#F4F9FD] hover:bg-[#E1F1FC] text-[11.5px] font-medium text-[#3F5B6E] cursor-pointer"
                >
                  + {city}
                </button>
              ))}
            </div>
          ) : null}

          {sp.regularDeliveryLocations.length > 0 ? (
            <div className="flex flex-wrap gap-1.5 pt-0.5">
              {sp.regularDeliveryLocations.map((loc) => (
                <span
                  key={loc}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#E8F5FD] border border-[#BFE2F5] text-[12px] font-semibold text-[#18364B]"
                >
                  <span>{loc}</span>
                  <button
                    type="button"
                    onClick={() => onRemoveDeliveryLocation(loc)}
                    aria-label={`Remove ${loc}`}
                    className="w-4 h-4 rounded-full hover:bg-[#CBE7F8] flex items-center justify-center cursor-pointer"
                  >
                    <X className="w-3 h-3" aria-hidden="true" />
                  </button>
                </span>
              ))}
            </div>
          ) : null}

          {errors.regularDeliveryLocations ? (
            <p role="alert" className="text-[12px] font-medium text-[#C62828]">
              {errors.regularDeliveryLocations}
            </p>
          ) : null}
        </div>

        {/* 7. Shipment Frequency */}
        <div>
          <label
            htmlFor="shp-frequency"
            className="block text-[12px] font-semibold text-[#3F5B6E] ps-3 mb-1"
          >
            Shipment Frequency
          </label>
          <WizardPillSelect
            id="shp-frequency"
            compact
            label="Shipment Frequency"
            placeholder="Shipment Frequency"
            icon={<CalendarClock className="w-[17px] h-[17px]" />}
            value={sp.shipmentFrequency}
            options={FREQUENCY_OPTIONS}
            onChange={(val) => {
              clearError('shipmentFrequency');
              onUpdateProfile({ shipmentFrequency: val as ShipmentFrequency });
            }}
            error={errors.shipmentFrequency}
          />
        </div>

        <p className="text-[11.5px] text-[#4A6578] px-2 leading-snug">
          These shipping preferences help tailor load suggestions and remain editable anytime after onboarding.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 pt-2">
        <button
          type="button"
          onClick={onBack}
          className="h-[50px] rounded-full bg-white border border-[#DCEAF4] hover:border-[#A8D4EC] text-[#18364B] font-bold text-[15px] inline-flex items-center justify-center gap-2 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" aria-hidden="true" />
          <span>Back</span>
        </button>

        <button
          type="submit"
          className="h-[50px] rounded-full bg-[#C8F542] hover:bg-[#BCE934] active:bg-[#AFDC28] text-[#18364B] font-bold text-[15px] inline-flex items-center justify-center gap-2 shadow-[0_6px_18px_-4px_rgba(24,54,75,0.14)] transition-colors cursor-pointer"
        >
          <span>Continue</span>
          <ArrowRight className="w-4 h-4" aria-hidden="true" />
        </button>
      </div>
    </form>
  );
}
