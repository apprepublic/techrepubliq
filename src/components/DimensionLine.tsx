import { cn } from "@/lib/utils";

interface DimensionLineProps {
  steps: { label: string }[];
  currentStep: number;
  className?: string;
  hideLabels?: boolean;
}

export function DimensionLine({
  steps,
  currentStep,
  className,
  hideLabels,
}: DimensionLineProps) {
  return (
    <div
      className={cn("dimension-line w-full", className)}
      role="progressbar"
      aria-valuenow={currentStep}
      aria-valuemin={0}
      aria-valuemax={steps.length - 1}
      aria-label={`Step ${currentStep + 1} of ${steps.length}`}
    >
      {steps.map((step, i) => (
        <div
          key={step.label}
          className={cn(
            "dimension-tick flex-1 flex flex-col items-center",
            i <= currentStep && "active"
          )}
        >
          <span
            className={cn(
              "tick-label mt-sm text-sm font-body",
              hideLabels && "hidden",
              i <= currentStep ? "text-accent" : "text-slate"
            )}
          >
            {step.label}
          </span>
        </div>
      ))}
    </div>
  );
}