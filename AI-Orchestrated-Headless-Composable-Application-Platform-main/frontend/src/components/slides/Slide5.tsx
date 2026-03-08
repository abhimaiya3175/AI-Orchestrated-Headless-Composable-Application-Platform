"use client";

import { useEffect } from "react";
import { SplitText, initSpotlightHover } from "@/components/Animations";

export default function Slide5({ isActive, isMobile }: { isActive: boolean, isMobile: boolean }) {

    useEffect(() => {
        if (isActive && !isMobile) {
            setTimeout(initSpotlightHover, 100);
        }
    }, [isActive, isMobile]);

    const modules = [
        { title: "CMS Core", desc: "Headless structured content with visual schema builder", icon: "📑" },
        { title: "Auth Engine", desc: "OAuth2, SAML, Magic Links via stateless JWT tokens", icon: "🔑" },
        { title: "Search API", desc: "Vector semantic search backed by integrated embedding models", icon: "🔍" },
        { title: "Analytics", desc: "Real-time edge event ingestion and real-user monitoring", icon: "📊" },
        { title: "Notifications", desc: "Unified multi-channel push, email, SMS delivery pipeline", icon: "🔔" },
        { title: "Media CDN", desc: "On-the-fly edge image optimization and video streaming", icon: "🖼️" },
        { title: "Commerce", desc: "Cart, checkout, inventory logic for headless storefronts", icon: "🛍️" },
        { title: "Workflow AI", desc: "State machine orchestrator for multi-step AI agents", icon: "⚙️" },
        { title: "Edge Functions", desc: "Serverless TS/WASM compute running closest to your users", icon: "⚡" }
    ];

    return (
        <div className={`slide-container bg-bg-deep flex flex-col items-center justify-center ${isActive ? 'slide-active' : 'slide-exit'}`}>

            <div
                className="absolute inset-0 z-0 bg-cover bg-center opacity-15"
                style={{ backgroundImage: "url('/images/modules-bg.jpg')" }}
            />

            <div className="z-10 text-center mb-12 animate-[fadeUp_0.8s_ease_0.2s_both] px-4">
                <h2 className="font-orbitron font-bold text-4xl md:text-5xl text-white mb-4">
                    <SplitText text="PICK. COMPOSE. LAUNCH." delayIndex={0} />
                </h2>
                <p className="font-space text-text-muted text-sm md:text-base max-w-2xl mx-auto">
                    Choose from 200+ pre-built modules. Compose them visually. Ship in minutes.
                </p>
            </div>

            <div className="z-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto px-6 auto-rows-fr">
                {modules.map((mod, i) => (
                    <div
                        key={i}
                        className="glass-card spotlight-hover p-6 group transition-all duration-300 hover:-translate-y-1 hover:border-opal cursor-none flex flex-col"
                        style={{ animation: isActive ? `fadeUp 0.6s ease ${0.3 + (i * 0.05)}s both` : 'none' }}
                        onMouseEnter={(e) => {
                            if (!isMobile) {
                                const c = e.currentTarget;
                                c.style.setProperty("--mouse-x", `${e.clientX - c.getBoundingClientRect().left}px`);
                                c.style.setProperty("--mouse-y", `${e.clientY - c.getBoundingClientRect().top}px`);
                            }
                        }}
                    >
                        <div className="text-2xl mb-4 text-opal opacity-80 group-hover:opacity-100 transition-opacity">{mod.icon}</div>
                        <h3 className="font-orbitron font-semibold text-white text-base mb-2 group-hover:text-opal transition-colors">{mod.title}</h3>
                        <p className="font-space text-text-muted text-xs leading-relaxed flex-grow">{mod.desc}</p>
                    </div>
                ))}
            </div>

        </div>
    );
}
