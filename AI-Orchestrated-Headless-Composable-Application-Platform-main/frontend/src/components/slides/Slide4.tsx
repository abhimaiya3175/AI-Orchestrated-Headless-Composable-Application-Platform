//frontend/src/components/slides/Slide4.tsx
"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { SplitText } from "@/components/Animations";

// Background Animated SVG Neural Network
function NeuralNetworkBG() {
    const [nodes, setNodes] = useState<{ id: number, x: number, y: number }[]>([]);
    const [lines, setLines] = useState<{ id: number, x1: number, y1: number, x2: number, y2: number }[]>([]);

    useEffect(() => {
        // Generate static random positions on mount
        const newNodes = Array.from({ length: 30 }).map((_, i) => ({
            id: i,
            x: 5 + Math.random() * 90,
            y: 5 + Math.random() * 90
        }));

        const newLines = [];
        for (let i = 0; i < 50; i++) {
            const a = newNodes[Math.floor(Math.random() * newNodes.length)];
            const b = newNodes[Math.floor(Math.random() * newNodes.length)];
            newLines.push({ id: i, x1: a.x, y1: a.y, x2: b.x, y2: b.y });
        }

        setNodes(newNodes);
        setLines(newLines);
    }, []);

    return (
        <div className="absolute inset-0 z-0 overflow-hidden bg-bg-deep opacity-60">
            <svg className="w-full h-full">
                <defs>
                    <filter id="glow">
                        <feGaussianBlur stdDeviation="3.5" result="coloredBlur" />
                        <feMerge>
                            <feMergeNode in="coloredBlur" />
                            <feMergeNode in="SourceGraphic" />
                        </feMerge>
                    </filter>
                </defs>

                {lines.map((l) => (
                    <line key={`line-${l.id}`} x1={`${l.x1}%`} y1={`${l.y1}%`} x2={`${l.x2}%`} y2={`${l.y2}%`} stroke="rgba(167,218,220,0.08)" strokeWidth="1" />
                ))}

                {nodes.map((n) => (
                    <circle
                        key={`node-${n.id}`}
                        cx={`${n.x}%`}
                        cy={`${n.y}%`}
                        r="4"
                        fill="#A7DADC"
                        opacity="0.25"
                        filter="url(#glow)"
                        className="animate-[pulse_4s_ease-in-out_infinite]"
                        style={{ animationDelay: `${Math.random() * 4}s` }}
                    />
                ))}
            </svg>
        </div>
    );
}

function AnimatedCounter({ value, label, trigger }: { value: number, label: string, trigger: boolean }) {
    const [count, setCount] = useState(0);

    useEffect(() => {
        if (!trigger) {
            setCount(0);
            return;
        }
        const duration = 1500;
        const startTime = performance.now();

        const easeOutQuart = (x: number): number => 1 - Math.pow(1 - x, 4);

        const step = (currentTime: number) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);

            setCount(Math.floor(easeOutQuart(progress) * value));

            if (progress < 1) {
                requestAnimationFrame(step);
            } else {
                setCount(value);
            }
        };

        requestAnimationFrame(step);
    }, [value, trigger]);

    // Map our target values to their string representations
    const finalDisplay = count === value
        ? (value === 10000000 ? "10M+" : (value === 9999 ? "99.99%" : `${value}+`))
        : (value === 9999 ? `${(count / 100).toFixed(2)}%` : count);

    return (
        <div className="flex flex-col">
            <span className="font-orbitron font-bold text-3xl md:text-4xl text-white mb-1 tracking-[1px]">{finalDisplay}</span>
            <span className="font-space text-[11px] md:text-xs text-text-muted uppercase tracking-[2px]">{label}</span>
        </div>
    );
}

export default function Slide4({ isActive }: { isActive: boolean }) {
    return (
        <div className={`slide-container bg-bg-deep flex items-center justify-center ${isActive ? 'slide-active' : 'slide-exit'}`}>
            <NeuralNetworkBG />

            <div className="flex flex-col md:flex-row items-center justify-between w-full max-w-7xl px-8 z-10 gap-16">

                <div className="flex-1 flex flex-col justify-center max-w-xl">
                    <div className="font-orbitron text-[10px] text-opal tracking-[6px] uppercase mb-6">CORE ENGINE</div>

                    <h2 className="font-orbitron font-bold text-3xl md:text-5xl text-white leading-tight mb-8">
                        <SplitText text="AI AT THE CORE" delayIndex={0} />
                        <br />
                        <SplitText text="OF EVERYTHING." delayIndex={4} />
                    </h2>

                    <p className="font-space text-sm md:text-[15px] text-text-muted mb-12 leading-relaxed">
                        Our proprietary orchestration engine uses LLMs to interpret intent, dynamically selecting and assembling the perfect microservice pipeline for any request in real-time.
                    </p>

                    <div className="flex flex-wrap gap-8 md:gap-12">
                        <AnimatedCounter value={10000000} label="API Calls/Second" trigger={isActive} />
                        <AnimatedCounter value={9999} label="Uptime Guarantee" trigger={isActive} />
                        <AnimatedCounter value={200} label="Composable Modules" trigger={isActive} />
                    </div>
                </div>

                <div className="flex-1 w-full max-w-md relative group mt-12 md:mt-0 min-h-[300px] md:min-h-[400px] aspect-square">
                    <div className="absolute -inset-1 bg-gradient-to-tr from-opal/50 to-transparent rounded-[24px] blur-xl opacity-30 group-hover:opacity-60 transition-opacity duration-700" />
                    <Image
                        src="/images/ai-orchestration.jpg"
                        alt="AI Orchestration Visualization"
                        fill
                        className="object-cover rounded-[20px] border border-opal/20 shadow-[0_0_40px_rgba(167,218,220,0.1)]"
                    />
                </div>

            </div>
        </div>
    );
}
