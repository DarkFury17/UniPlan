import React from "react";
import { Check } from "lucide-react";

export interface StepItem {
  id: number;
  label: string;
  sublabel: string;
}

interface StepTrackerProps {
  steps: StepItem[];
  currentStep: number;
  onStepClick: (stepId: number) => void;
  canNavigateTo: (stepId: number) => boolean;
}

export const StepTracker: React.FC<StepTrackerProps> = ({
  steps,
  currentStep,
  onStepClick,
  canNavigateTo,
}) => {
  return (
    <div className="w-full bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl px-4 py-4 sm:px-6 shadow-sm">
      <div className="flex items-center justify-between">
        {steps.map((step, idx) => {
          const isCompleted = step.id < currentStep;
          const isCurrent = step.id === currentStep;
          const isClickable = canNavigateTo(step.id);

          return (
            <React.Fragment key={step.id}>
              <button
                type="button"
                onClick={() => isClickable && onStepClick(step.id)}
                disabled={!isClickable}
                className={`group flex items-center space-x-3 text-left transition-all ${
                  isClickable ? "cursor-pointer" : "cursor-default"
                }`}
              >
                {/* Step Circle con sfondo pieno */}
                <div
                  className={`w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center justify-center font-mono text-xs font-bold shrink-0 transition-all ${
                    isCompleted
                      ? "bg-emerald-800 text-white shadow-sm ring-2 ring-emerald-700/30"
                      : isCurrent
                      ? "bg-emerald-800 text-white shadow-md ring-4 ring-emerald-600/20"
                      : "bg-stone-200 dark:bg-stone-800 text-stone-700 dark:text-stone-300 border border-stone-300 dark:border-stone-700"
                  }`}
                >
                  {isCompleted ? <Check className="w-4 h-4 stroke-[3]" /> : step.id}
                </div>

                {/* Step Text ad alto contrasto */}
                <div className="hidden sm:block">
                  <div className="flex items-center space-x-1.5">
                    <span
                      className={`text-xs font-bold tracking-tight transition-colors ${
                        isCurrent
                          ? "text-stone-900 dark:text-stone-100"
                          : isCompleted
                          ? "text-emerald-900 dark:text-emerald-300"
                          : "text-stone-600 dark:text-stone-400"
                      }`}
                    >
                      {step.label}
                    </span>
                  </div>
                  <span className="text-[11px] text-stone-500 dark:text-stone-400 block font-medium">
                    {step.sublabel}
                  </span>
                </div>
              </button>

              {/* Connecting Bar a smeraldo continuo */}
              {idx < steps.length - 1 && (
                <div className="flex-1 mx-3 sm:mx-5 h-1 rounded-full bg-stone-200 dark:bg-stone-800 overflow-hidden">
                  <div
                    className={`h-full transition-all duration-300 ${
                      isCompleted ? "w-full bg-emerald-800" : "w-0 bg-transparent"
                    }`}
                  />
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};
