"use client";

import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import Cursor from "@/components/Cursor";
import TransitionOverlay from "@/components/TransitionOverlay";
import Slide1 from "@/components/slides/Slide1";
import Slide2 from "@/components/slides/Slide2";
import Slide4 from "@/components/slides/Slide4";
import Slide5 from "@/components/slides/Slide5";
import ChatBot from "@/components/slides/ChatBot";

// Map array to render dynamically
const SLIDES = [Slide1, Slide2, Slide4, Slide5, ChatBot];

export default function Home() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [slideOut, setSlideOut] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Responsive check
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Update hash on slide change
  useEffect(() => {
    if (currentSlide > 0) {
      window.location.hash = `#slide-${currentSlide + 1}`;
    } else {
      window.history.pushState(null, "", window.location.pathname);
    }
  }, [currentSlide]);

  // Initial load from hash
  useEffect(() => {
    const hash = window.location.hash;
    const slideMatch = hash.match(/#slide-(\d+)/);
    if (slideMatch) {
      const idx = parseInt(slideMatch[1]) - 1;
      if (idx >= 0 && idx < SLIDES.length) {
        setCurrentSlide(idx);
      }
    }
  }, []);

  const changeSlide = (newIndex: number) => {
    if (isTransitioning || newIndex === currentSlide || newIndex < 0 || newIndex >= SLIDES.length) return;

    // If mobile, smooth scroll to the section instead of transition
    if (isMobile) {
      const section = document.getElementById(`slide-${newIndex + 1}`);
      if (section) section.scrollIntoView({ behavior: "smooth" });
      setCurrentSlide(newIndex);
      return;
    }

    setIsTransitioning(true);
    // Phase 1: Wait for overlay to come IN (300ms)
    setTimeout(() => {
      setCurrentSlide(newIndex);
      setSlideOut(true);

      // Phase 2 + 3: Hold 80ms, then slide Out
      setTimeout(() => {
        setIsTransitioning(false);
        setSlideOut(false);
      }, 380);
    }, 300);
  };

  // Keyboard and wheel navigation
  useEffect(() => {
    if (isMobile) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight" || e.key === "ArrowDown") {
        changeSlide(currentSlide + 1);
      } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
        changeSlide(currentSlide - 1);
      }
    };

    // Note: Slide 1 has native scroll, SlideController triggers change globally
    let wheelTimer: NodeJS.Timeout;
    const handleWheel = (e: WheelEvent) => {
      if (currentSlide === 0) return; // Slide 1 handles its own wheel

      if (isTransitioning) return;

      clearTimeout(wheelTimer);
      wheelTimer = setTimeout(() => {
        if (e.deltaY > 50) changeSlide(currentSlide + 1);
        else if (e.deltaY < -50) changeSlide(currentSlide - 1);
      }, 50);
    };

    let touchStartY = 0;
    const handleTouchStart = (e: TouchEvent) => {
      touchStartY = e.touches[0].clientY;
    };
    const handleTouchEnd = (e: TouchEvent) => {
      if (currentSlide === 0) return;
      const touchEndY = e.changedTouches[0].clientY;
      const delta = touchStartY - touchEndY;
      if (delta > 50) changeSlide(currentSlide + 1);
      else if (delta < -50) changeSlide(currentSlide - 1);
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("wheel", handleWheel, { passive: true });
    window.addEventListener("touchstart", handleTouchStart, { passive: true });
    window.addEventListener("touchend", handleTouchEnd, { passive: true });
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("wheel", handleWheel);
      window.removeEventListener("touchstart", handleTouchStart);
      window.removeEventListener("touchend", handleTouchEnd);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentSlide, isTransitioning, isMobile]);

  return (
    <main className="w-full text-text-primary">
      <Cursor />
      <Navbar
        currentSlide={currentSlide}
        totalSlides={SLIDES.length}
        setSlide={changeSlide}
        isMobile={isMobile}
      />

      {!isMobile && <TransitionOverlay isTransitioning={isTransitioning} slideOut={slideOut} />}

      {isMobile ? (
        // Mobile view: Stack all slides vertically
        <div className="flex flex-col">
          {SLIDES.map((SlideComp, idx) => (
            <div key={idx} id={`slide-${idx + 1}`} className="w-full min-h-screen relative overflow-hidden shrink-0">
              {idx === 1 || idx === 2 || idx === 4 ? <SlideComp isActive={true} nextSlide={() => setCurrentSlide(Math.min(SLIDES.length - 1, idx + 1))} /> : <SlideComp isActive={true} nextSlide={() => setCurrentSlide(Math.min(SLIDES.length - 1, idx + 1))} isMobile={isMobile} />}
            </div>
          ))}
        </div>
      ) : (
        // Desktop view: Slide controller showing only current slide
        <div className="flex w-full h-screen overflow-hidden">
          {SLIDES.map((SlideComp, idx) => {
            const isActive = idx === currentSlide;
            if (!isActive && !isTransitioning) return null; // Unmount completely when not needed (unless transitioning to/from)
            return (
              <div
                key={idx}
                className="absolute inset-0 w-full h-screen"
                style={{
                  zIndex: isActive ? 10 : 1,
                  opacity: isActive || isTransitioning ? 1 : 0,
                  pointerEvents: isActive ? "auto" : "none"
                }}
              >
                {idx === 1 || idx === 2 || idx === 4 ? <SlideComp isActive={isActive} nextSlide={() => changeSlide(idx + 1)} /> : <SlideComp isActive={isActive} nextSlide={() => changeSlide(idx + 1)} isMobile={isMobile} />}
              </div>
            );
          })}
        </div>
      )}
    </main>
  );
}
