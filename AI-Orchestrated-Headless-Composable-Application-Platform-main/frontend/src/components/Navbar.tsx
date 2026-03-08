"use client";

import React from "react";

interface NavbarProps {
  currentSlide: number;
  totalSlides: number;
  setSlide: (idx: number) => void;
  isMobile: boolean;
}

export default function Navbar({ currentSlide, totalSlides, setSlide, isMobile }: NavbarProps) {
  const navLinks = [
    { label: "Overview", slide: 1 },
    { label: "AI Core", slide: 2 },
    { label: "Modules", slide: 3 },
    { label: "AI Planner", slide: 4 },
  ];

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-[100] h-20 bg-sapphire-night/80 backdrop-blur-md border-b justify-between items-center border-border px-8 flex">
        <div
          className="font-orbitron font-bold text-2xl text-opal tracking-[2px] cursor-pointer"
          onClick={() => setSlide(0)}
        >
          AOHCAP
        </div>

        {!isMobile && (
          <div className="flex items-center gap-8 text-sm font-semibold tracking-[2px] uppercase">
            {navLinks.map((link) => (
              <button
                key={link.label}
                onClick={() => setSlide(link.slide)}
                className={`transition-colors font-orbitron ${currentSlide === link.slide ? "text-opal" : "text-text-muted hover:text-text-primary"
                  }`}
              >
                {link.label}
              </button>
            ))}
          </div>
        )}

        <div className="flex items-center gap-4">
          {!isMobile && (
            <button
              className="btn-primary"
              onClick={() => setSlide(4)}
            >
              [AI PLANNER]
            </button>
          )}
          {isMobile && (
            <div className="space-y-[5px] cursor-pointer">
              <div className="w-5 h-0.5 bg-text-primary rounded-sm" />
              <div className="w-5 h-0.5 bg-text-primary rounded-sm" />
            </div>
          )}
        </div>
      </nav>

      {/* Slide Progress Dots (Right Edge) - Only visible on desktop if multiple slides */}
      {!isMobile && (
        <div className="fixed right-6 top-1/2 -translate-y-1/2 z-[100] flex flex-col gap-4 nav-dots">
          {Array.from({ length: totalSlides }).map((_, i) => (
            <button
              key={i}
              onClick={() => setSlide(i)}
              className={`w-2 h-2 rounded-full transition-all duration-300 ${currentSlide === i ? "bg-opal scale-150 shadow-[0_0_8px_var(--accent)]" : "bg-text-muted/40 hover:bg-text-muted"
                }`}
              aria-label={`Go to slide ${i + 1}`}
            />
          ))}
        </div>
      )}

      {/* Slide Counter (Bottom Right) */}
      {!isMobile && (
        <div className="fixed bottom-8 right-8 z-[100] font-orbitron font-bold text-lg tracking-[2px] text-opal/80">
          0{currentSlide + 1} / 0{totalSlides}
        </div>
      )}
    </>
  );
}
