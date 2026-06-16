import { useState } from "react";
import { cn } from "../utils/cn";
import {
  BuildingIcon,
  ChevronLeftIcon,
  MapPinIcon,
  HomeIcon,
  BriefcaseIcon,
  ScaleIcon,
  UserIcon,
  LandmarkIcon,
  FileCheckIcon,
  CoinsIcon,
  GavelIcon,
  BanknoteIcon,
  ClockIcon,
  KeyRoundIcon,
} from "./Icons";

export interface IntakeAnswers {
  location: string;
  userType: string;
  propertyType: string;
  topic: string;
}

const LOCATIONS = [
  { value: "Maharashtra", label: "Maharashtra" },
  { value: "Karnataka", label: "Karnataka" },
  { value: "Delhi", label: "Delhi" },
  { value: "Gujarat", label: "Gujarat" },
  { value: "Other", label: "Other" },
];

const USER_TYPES = [
  { value: "Home Buyer", label: "Home Buyer", icon: HomeIcon },
  { value: "Property Investor", label: "Property Investor", icon: CoinsIcon },
  { value: "Builder / Developer", label: "Builder / Developer", icon: BuildingIcon },
  { value: "Legal Professional", label: "Legal Professional", icon: ScaleIcon },
  { value: "Property Owner", label: "Property Owner", icon: UserIcon },
];

const PROPERTY_TYPES = [
  { value: "Flat / Apartment", label: "Flat / Apartment", icon: BuildingIcon },
  { value: "Independent House", label: "Independent House", icon: HomeIcon },
  { value: "Plot / Land", label: "Plot / Land", icon: MapPinIcon },
  { value: "Commercial Property", label: "Commercial Property", icon: BriefcaseIcon },
  { value: "Under-construction Project", label: "Under-construction Project", icon: ClockIcon },
];

const TOPICS = [
  { value: "RERA", label: "RERA", icon: LandmarkIcon },
  { value: "Document Verification", label: "Document Verification", icon: FileCheckIcon },
  { value: "Stamp Duty & Registration", label: "Stamp Duty & Registration", icon: BanknoteIcon },
  { value: "Property Disputes", label: "Property Disputes", icon: GavelIcon },
  { value: "Home Loan", label: "Home Loan", icon: BanknoteIcon },
  { value: "Builder Delay", label: "Builder Delay", icon: ClockIcon },
  { value: "Buying Property", label: "Buying Property", icon: KeyRoundIcon },
];

type Step = "location" | "userType" | "propertyType" | "topic";

const STEPS: Step[] = ["location", "userType", "propertyType", "topic"];

export default function IntakeFlow({
  onComplete,
}: {
  onComplete: (answers: IntakeAnswers) => void;
}) {
  const [step, setStep] = useState<Step>("location");
  const [answers, setAnswers] = useState<IntakeAnswers>({
    location: "",
    userType: "",
    propertyType: "",
    topic: "",
  });
  const [customLocation, setCustomLocation] = useState("");
  const [customActive, setCustomActive] = useState(false);

  const currentIndex = STEPS.indexOf(step);

  const select = (key: keyof IntakeAnswers, value: string) => {
    setAnswers((prev) => ({ ...prev, [key]: value }));
    if (key === "topic") {
      onComplete({ ...answers, [key]: value });
      return;
    }
    setStep(STEPS[currentIndex + 1]);
  };

  const goBack = () => {
    if (currentIndex > 0) {
      setStep(STEPS[currentIndex - 1]);
    }
  };

  const handleLocationSelect = (value: string) => {
    if (value === "Other") {
      setCustomActive(true);
      return;
    }
    select("location", value);
  };

  const submitCustomLocation = () => {
    const loc = customLocation.trim();
    if (!loc) return;
    select("location", loc);
  };

  const progress = ((currentIndex + 1) / STEPS.length) * 100;

  return (
    <div className="animate-in mx-auto w-full max-w-xl px-2 py-4 sm:py-8">
      {/* Progress bar */}
      <div className="mb-6 h-1.5 w-full overflow-hidden rounded-full bg-white/10">
        <div
          className="h-full rounded-full bg-gradient-to-r from-emerald-400 via-teal-500 to-cyan-500 transition-all duration-500"
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className="glass-strong rounded-3xl p-5 shadow-2xl sm:p-8">
        {/* Header */}
        <div className="mb-6 flex items-center gap-3">
          {currentIndex > 0 && (
            <button
              onClick={goBack}
              className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/5 text-slate-300 transition-all hover:border-white/20 hover:text-white"
            >
              <ChevronLeftIcon className="h-5 w-5" />
            </button>
          )}
          <div>
            <h2 className="text-lg font-bold text-white sm:text-xl">
              {step === "location" && "👋 Welcome to EstateSage AI"}
              {step === "userType" && "What best describes you?"}
              {step === "propertyType" && "What property are you dealing with?"}
              {step === "topic" && "What do you need help with?"}
            </h2>
            <p className="text-xs text-slate-400 sm:text-sm">
              Step {currentIndex + 1} of {STEPS.length}
            </p>
          </div>
        </div>

        {/* Step: Location */}
        {step === "location" && (
          <div className="animate-in space-y-4">
            <p className="text-sm text-slate-300">
              To provide accurate property guidance, tell me:
            </p>
            <p className="text-sm font-medium text-slate-200">
              📍 Which state are you from?
            </p>

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {LOCATIONS.map((loc) => (
                <button
                  key={loc.value}
                  onClick={() => handleLocationSelect(loc.value)}
                  className={cn(
                    "rounded-xl border px-3 py-3 text-sm font-medium transition-all",
                    "border-white/10 bg-white/5 text-slate-200 hover:-translate-y-0.5 hover:border-emerald-400/40 hover:bg-white/[0.08]"
                  )}
                >
                  {loc.label}
                </button>
              ))}
            </div>

            <div className="relative mt-4">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-white/10" />
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="bg-[#0f1424] px-2 text-slate-500">or enter your city/state</span>
              </div>
            </div>

            {customActive ? (
              <div className="flex gap-2">
                <input
                  autoFocus
                  type="text"
                  value={customLocation}
                  onChange={(e) => setCustomLocation(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && submitCustomLocation()}
                  placeholder="e.g. Pune, Maharashtra"
                  className="flex-1 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white placeholder:text-slate-500 focus:border-emerald-400/50 focus:outline-none"
                />
                <button
                  onClick={submitCustomLocation}
                  disabled={!customLocation.trim()}
                  className="rounded-xl bg-gradient-to-br from-emerald-400 to-teal-500 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-emerald-500/30 disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            ) : (
              <button
                onClick={() => setCustomActive(true)}
                className="w-full rounded-xl border border-dashed border-white/10 bg-white/[0.03] px-4 py-3 text-left text-sm text-slate-400 transition-all hover:border-emerald-400/30 hover:text-slate-200"
              >
                Enter your city/state…
              </button>
            )}
          </div>
        )}

        {/* Step: User Type */}
        {step === "userType" && (
          <div className="animate-in grid grid-cols-1 gap-3 sm:grid-cols-2">
            {USER_TYPES.map((ut) => {
              const Icon = ut.icon;
              return (
                <button
                  key={ut.value}
                  onClick={() => select("userType", ut.value)}
                  className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 p-4 text-left transition-all hover:-translate-y-0.5 hover:border-emerald-400/40 hover:bg-white/[0.08]"
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-400/20 to-teal-500/20 text-emerald-400">
                    <Icon className="h-5 w-5" />
                  </div>
                  <span className="font-medium text-slate-100">{ut.label}</span>
                </button>
              );
            })}
          </div>
        )}

        {/* Step: Property Type */}
        {step === "propertyType" && (
          <div className="animate-in grid grid-cols-1 gap-3 sm:grid-cols-2">
            {PROPERTY_TYPES.map((pt) => {
              const Icon = pt.icon;
              return (
                <button
                  key={pt.value}
                  onClick={() => select("propertyType", pt.value)}
                  className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 p-4 text-left transition-all hover:-translate-y-0.5 hover:border-emerald-400/40 hover:bg-white/[0.08]"
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-cyan-400/20 to-blue-500/20 text-cyan-400">
                    <Icon className="h-5 w-5" />
                  </div>
                  <span className="font-medium text-slate-100">{pt.label}</span>
                </button>
              );
            })}
          </div>
        )}

        {/* Step: Topic */}
        {step === "topic" && (
          <div className="animate-in grid grid-cols-1 gap-3 sm:grid-cols-2">
            {TOPICS.map((t) => {
              const Icon = t.icon;
              return (
                <button
                  key={t.value}
                  onClick={() => select("topic", t.value)}
                  className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 p-4 text-left transition-all hover:-translate-y-0.5 hover:border-emerald-400/40 hover:bg-white/[0.08]"
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-violet-400/20 to-indigo-500/20 text-violet-400">
                    <Icon className="h-5 w-5" />
                  </div>
                  <span className="font-medium text-slate-100">{t.label}</span>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
