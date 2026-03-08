"use client";

import { useEffect, useState } from "react";
import { SplitText } from "@/components/Animations";

const steps = [
  { label: "User Request", icon: "👤" },
  { label: "AI Intent Detection", icon: "🧠" },
  { label: "Workflow Composer", icon: "⚙️" },
  { label: "API Gateway", icon: "🌐" },
  { label: "Microservices", icon: "🧩" },
  { label: "Unified Response", icon: "📦" },
];

export default function Slide3({ isActive }: { isActive: boolean }) {
  const [activeStep, setActiveStep] = useState(0);

  useEffect(() => {
    if (!isActive) return;

    setActiveStep(0);

    const interval = setInterval(() => {
      setActiveStep((prev) => (prev + 1) % steps.length);
    }, 1200);

    return () => clearInterval(interval);
  }, [isActive]);

  return (
    <div
      className={`slide-container bg-bg-deep flex flex-col items-center justify-center ${
        isActive ? "slide-active" : "slide-exit"
      }`}
    >
      <div className="text-center mb-16">
        <h2 className="font-orbitron font-bold text-4xl md:text-5xl text-white mb-6">
          <SplitText text="SYSTEM ARCHITECTURE" />
        </h2>

        <p className="font-space text-text-muted max-w-xl mx-auto">
          AI orchestrates modular services dynamically to fulfill user requests.
        </p>
      </div>

      <div className="flex flex-wrap justify-center gap-6 max-w-5xl">
        {steps.map((step, i) => (
          <div
            key={i}
            className={`glass-card p-6 w-[180px] text-center transition-all duration-500 ${
              i === activeStep
                ? "border-opal scale-105 shadow-lg"
                : "opacity-60"
            }`}
          >
            <div className="text-3xl mb-3">{step.icon}</div>

            <div className="font-orbitron text-xs tracking-[2px] text-white">
              {step.label}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-12 font-space text-xs text-text-muted text-center max-w-lg">
        The AI orchestration engine interprets intent, composes workflows,
        and dynamically calls modular services to produce the final response.
      </div>
    </div>
  );
}