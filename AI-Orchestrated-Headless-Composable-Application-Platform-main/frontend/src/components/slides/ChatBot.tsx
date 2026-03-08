"use client";

import { useState, useRef, useEffect } from "react";
import { SplitText } from "@/components/Animations";

interface TripPlan {
    destination: string;
    duration: string;
    preferences: string;
    flights: { airline: string; price: number; duration_hrs?: number }[];
    hotels: { name: string; price_per_night: number; rating?: number }[];
    weather: { temperature?: string; condition?: string; city?: string };
    attractions: string[];
    estimated_budget: number;
    workflow_explanation?: {
        reasoning: string;
        trace: { step: string; status: string; details?: unknown; error?: string }[];
    };
}

interface Message {
    role: "user" | "assistant" | "system";
    content: string;
    tripPlan?: TripPlan;
}

const GATEWAY_URL = process.env.NEXT_PUBLIC_GATEWAY_URL || "http://localhost:8000";

export default function ChatBot({ isActive }: { isActive: boolean }) {
    const [messages, setMessages] = useState<Message[]>([
        {
            role: "system",
            content:
                "Welcome! I'm your AI Travel Planner powered by LangChain + Ollama. Ask me anything like: \"Plan a 2-day trip to Goa under ₹15000\"",
        },
    ]);
    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(false);
    const [showTrace, setShowTrace] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const sendQuery = async () => {
        const query = input.trim();
        if (!query || loading) return;

        setMessages((prev) => [...prev, { role: "user", content: query }]);
        setInput("");
        setLoading(true);

        try {
            const res = await fetch(`${GATEWAY_URL}/plan`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ query }),
            });

            if (!res.ok) throw new Error(`Server error: ${res.status}`);

            const data = await res.json();
            const plan: TripPlan = data.trip_plan;

            setMessages((prev) => [
                ...prev,
                {
                    role: "assistant",
                    content: `Here's your travel plan for **${plan.destination}** (${plan.duration}):`,
                    tripPlan: plan,
                },
            ]);
        } catch (err) {
            setMessages((prev) => [
                ...prev,
                {
                    role: "assistant",
                    content: `⚠️ Could not reach the AI backend. Make sure the backend is running (\`py start_backend.py\`) and Ollama is serving the model.\n\nError: ${err instanceof Error ? err.message : String(err)}`,
                },
            ]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div
            className={`slide-container bg-bg-deep flex flex-col items-center justify-start pt-24 pb-8 ${isActive ? "slide-active" : "slide-exit"}`}
        >
            {/* Header */}
            <div className="z-10 text-center mb-6 px-4">
                <h2 className="font-orbitron font-bold text-3xl md:text-5xl text-white mb-3">
                    <SplitText text="AI TRAVEL PLANNER" delayIndex={0} />
                </h2>
                <p className="font-space text-text-muted text-sm max-w-xl mx-auto">
                    Powered by <span className="text-opal">LangChain</span> +{" "}
                    <span className="text-opal">Ollama (LLaMA)</span> — ask a natural
                    language travel query and watch the AI orchestrate 5 microservices.
                </p>
            </div>

            {/* Chat Container */}
            <div className="z-10 w-full max-w-3xl flex-1 flex flex-col mx-auto px-4 overflow-hidden">
                <div className="glass-card flex-1 flex flex-col overflow-hidden border-opal/20">
                    {/* Messages */}
                    <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4 scrollbar-thin">
                        {messages.map((msg, i) => (
                            <div key={i}>
                                {/* Message bubble */}
                                <div
                                    className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                                >
                                    <div
                                        className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm font-space leading-relaxed ${msg.role === "user"
                                                ? "bg-opal/20 text-white border border-opal/30"
                                                : msg.role === "system"
                                                    ? "bg-sapphire-night text-text-muted border border-border"
                                                    : "bg-sapphire-night/80 text-white border border-opal/10"
                                            }`}
                                    >
                                        {msg.content}
                                    </div>
                                </div>

                                {/* Trip Plan Card */}
                                {msg.tripPlan && (
                                    <div className="mt-3 ml-0 space-y-3">
                                        {/* Flights */}
                                        {msg.tripPlan.flights.length > 0 && (
                                            <div className="glass-card p-4 border-opal/10">
                                                <h4 className="font-orbitron text-xs text-opal tracking-[3px] uppercase mb-3">
                                                    ✈️ Flights
                                                </h4>
                                                <div className="space-y-2">
                                                    {msg.tripPlan.flights.map((f, j) => (
                                                        <div
                                                            key={j}
                                                            className="flex justify-between font-space text-sm text-white"
                                                        >
                                                            <span>{f.airline}</span>
                                                            <span className="text-opal font-bold">₹{f.price}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {/* Hotels */}
                                        {msg.tripPlan.hotels.length > 0 && (
                                            <div className="glass-card p-4 border-opal/10">
                                                <h4 className="font-orbitron text-xs text-opal tracking-[3px] uppercase mb-3">
                                                    🏨 Hotels
                                                </h4>
                                                <div className="space-y-2">
                                                    {msg.tripPlan.hotels.map((h, j) => (
                                                        <div
                                                            key={j}
                                                            className="flex justify-between font-space text-sm text-white"
                                                        >
                                                            <span>
                                                                {h.name}{" "}
                                                                {h.rating && (
                                                                    <span className="text-text-muted text-xs">
                                                                        ⭐ {h.rating}
                                                                    </span>
                                                                )}
                                                            </span>
                                                            <span className="text-opal font-bold">
                                                                ₹{h.price_per_night}/night
                                                            </span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {/* Weather + Places Row */}
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                            {msg.tripPlan.weather?.temperature && (
                                                <div className="glass-card p-4 border-opal/10">
                                                    <h4 className="font-orbitron text-xs text-opal tracking-[3px] uppercase mb-2">
                                                        🌤️ Weather
                                                    </h4>
                                                    <p className="font-space text-sm text-white">
                                                        {msg.tripPlan.weather.temperature} —{" "}
                                                        {msg.tripPlan.weather.condition}
                                                    </p>
                                                </div>
                                            )}

                                            {msg.tripPlan.attractions.length > 0 && (
                                                <div className="glass-card p-4 border-opal/10">
                                                    <h4 className="font-orbitron text-xs text-opal tracking-[3px] uppercase mb-2">
                                                        📍 Attractions
                                                    </h4>
                                                    <ul className="font-space text-sm text-white space-y-1">
                                                        {msg.tripPlan.attractions.map((a, j) => (
                                                            <li key={j}>• {a}</li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            )}
                                        </div>

                                        {/* Budget */}
                                        {msg.tripPlan.estimated_budget > 0 && (
                                            <div className="glass-card p-4 border-opal/20 bg-opal/5">
                                                <div className="flex justify-between items-center">
                                                    <span className="font-orbitron text-xs text-opal tracking-[3px] uppercase">
                                                        💰 Estimated Budget
                                                    </span>
                                                    <span className="font-orbitron font-bold text-xl text-white">
                                                        ₹{msg.tripPlan.estimated_budget.toLocaleString()}
                                                    </span>
                                                </div>
                                            </div>
                                        )}

                                        {/* Workflow Trace Toggle */}
                                        {msg.tripPlan.workflow_explanation && (
                                            <div className="glass-card p-4 border-opal/10">
                                                <button
                                                    onClick={() => setShowTrace(!showTrace)}
                                                    className="font-orbitron text-xs text-opal tracking-[3px] uppercase hover:text-white transition-colors"
                                                >
                                                    🧠 AI Workflow Trace {showTrace ? "▲" : "▼"}
                                                </button>
                                                {showTrace && (
                                                    <div className="mt-3 space-y-2">
                                                        <p className="font-space text-xs text-text-muted">
                                                            {msg.tripPlan.workflow_explanation.reasoning}
                                                        </p>
                                                        <div className="space-y-1">
                                                            {msg.tripPlan.workflow_explanation.trace.map(
                                                                (t, j) => (
                                                                    <div
                                                                        key={j}
                                                                        className="flex items-center gap-2 font-space text-xs"
                                                                    >
                                                                        <span
                                                                            className={`w-2 h-2 rounded-full ${t.status === "completed" ? "bg-green-400" : "bg-red-400"}`}
                                                                        />
                                                                        <span className="text-white">{t.step}</span>
                                                                        <span className="text-text-muted">
                                                                            — {t.status}
                                                                        </span>
                                                                    </div>
                                                                )
                                                            )}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        ))}

                        {/* Loading indicator */}
                        {loading && (
                            <div className="flex justify-start">
                                <div className="bg-sapphire-night border border-opal/20 rounded-2xl px-4 py-3">
                                    <div className="flex items-center gap-2">
                                        <div className="flex gap-1">
                                            <div className="w-2 h-2 rounded-full bg-opal animate-bounce" style={{ animationDelay: "0ms" }} />
                                            <div className="w-2 h-2 rounded-full bg-opal animate-bounce" style={{ animationDelay: "150ms" }} />
                                            <div className="w-2 h-2 rounded-full bg-opal animate-bounce" style={{ animationDelay: "300ms" }} />
                                        </div>
                                        <span className="font-space text-xs text-text-muted">
                                            AI is orchestrating services...
                                        </span>
                                    </div>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input Bar */}
                    <div className="p-4 border-t border-border">
                        <div className="flex gap-3">
                            <input
                                type="text"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyDown={(e) => e.key === "Enter" && sendQuery()}
                                placeholder="e.g. Plan a 2-day trip to Goa under ₹15000..."
                                className="flex-1 bg-bg-deep border border-border rounded-xl px-4 py-3 text-sm font-space text-white placeholder-text-muted/60 focus:outline-none focus:border-opal/50 transition-colors"
                                disabled={loading}
                            />
                            <button
                                onClick={sendQuery}
                                disabled={loading || !input.trim()}
                                className="btn-primary px-6 disabled:opacity-40 disabled:cursor-not-allowed"
                            >
                                {loading ? "..." : "Send"}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
