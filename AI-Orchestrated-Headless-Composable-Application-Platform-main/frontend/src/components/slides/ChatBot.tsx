"use client";

import { useState, useRef, useEffect } from "react";
import { SplitText } from "@/components/Animations";
import ServiceFlow from "@/components/ServiceFlow";
import ReactMarkdown from "react-markdown";

// -------------------------
// Types matching backend response
// -------------------------

interface ForecastDay {
    day: string;
    condition: string;
    temperature: string;
    humidity: number;
}

interface Weather {
    temperature: string;
    condition: string;
    city: string;
    humidity?: number;
    wind_kph?: number;
    forecast?: ForecastDay[];
}

interface Flight {
    airline: string;
    price: number;
    duration_hrs: number;
    departure?: string;
    arrival?: string;
}

interface Hotel {
    name: string;
    price_per_night: number;
    rating: number;
    amenities?: string[];
    location?: string;
}

interface BudgetEvaluation {
    status: "within_budget" | "over_budget";
    user_budget: number;
    difference: number;
}

interface BudgetMetrics {
    cost_per_day: number;
    hotel_share_pct: number;
    activity_share_pct: number;
    flight_share_pct: number;
}

interface BudgetBreakdown {
    flights: number;
    hotels: number;
    activities: number;
}

interface WorkflowStep {
    step: string;
    status: string;
    latency_ms?: number | null;
    error?: string | null;
}

interface WorkflowExplanation {
    reasoning: string;
    trace: WorkflowStep[];
}

interface Recommended {
    flight: Flight | null;
    hotel: Hotel | null;
}

interface TripPlan {
    destination: string;
    source: string;
    duration: string;
    preferences: string;
    flights: Flight[];
    hotels: Hotel[];
    weather: Weather;
    attractions: string[];
    estimated_budget: number;
    budget_breakdown: BudgetBreakdown;
    budget_metrics: BudgetMetrics;
    budget_evaluation: BudgetEvaluation | null;
    recommended: Recommended;
    workflow_explanation: WorkflowExplanation;
}

interface Message {
    role: "user" | "assistant" | "system";
    content: string;
    tripPlan?: TripPlan;
}

const GATEWAY_URL = process.env.NEXT_PUBLIC_GATEWAY_URL || "http://localhost:8000";

// Step icon helper
function stepIcon(step: string): string {
    const s = step.toLowerCase();
    if (s.includes("flight")) return "✈️";
    if (s.includes("hotel")) return "🏨";
    if (s.includes("weather")) return "🌤";
    if (s.includes("intent")) return "🧠";
    if (s.includes("place")) return "📍";
    if (s.includes("budget")) return "💰";
    return "⚙️";
}

export default function ChatBot({ isActive }: { isActive: boolean }) {
    const [messages, setMessages] = useState<Message[]>([
        {
            role: "system",
            content:
                "Welcome! I'm your AI Travel Planner powered by LangChain + Ollama. Try: **\"Plan a 2-day trip to Goa under ₹15000\"**",
        },
    ]);
    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(false);
    const [showTrace, setShowTrace] = useState<number | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const sendQuery = async () => {
        const query = input.trim();
        if (!query || loading) return;

        const userMsg: Message = { role: "user", content: query };
        setMessages((prev) => [...prev, userMsg]);
        setInput("");
        setLoading(true);

        try {
            const res = await fetch(`${GATEWAY_URL}/plan`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ query }),
            });

            if (!res.ok) {
                const errBody = await res.text();
                throw new Error(`Server error ${res.status}: ${errBody}`);
            }

            const data = await res.json();

            if (data.status !== "success" || !data.trip_plan) {
                throw new Error("Unexpected response shape from server.");
            }

            const plan: TripPlan = data.trip_plan;

            setMessages((prev) => [
                ...prev,
                {
                    role: "assistant",
                    content: `Here's your travel plan for **${plan.destination}** (${plan.duration}) from **${plan.source?.toUpperCase()}**:`,
                    tripPlan: plan,
                },
            ]);
        } catch (err) {
            setMessages((prev) => [
                ...prev,
                {
                    role: "assistant",
                    content: `⚠️ Could not reach the AI backend. Make sure the backend is running and Ollama is serving the model.\n\nError: ${err instanceof Error ? err.message : String(err)}`,
                },
            ]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div
            className={`slide-container bg-bg-deep flex flex-col items-center justify-start pt-24 pb-8 ${
                isActive ? "slide-active" : "slide-exit"
            }`}
        >
            {/* Header */}
            <div className="z-10 text-center mb-6 px-4">
                <h2 className="font-orbitron font-bold text-3xl md:text-5xl text-white mb-3">
                    <SplitText text="AI TRAVEL PLANNER" delayIndex={0} />
                </h2>
                <p className="font-space text-text-muted text-sm max-w-xl mx-auto">
                    Powered by <span className="text-opal">LangChain</span> +{" "}
                    <span className="text-opal">Ollama (LLaMA)</span> — ask a natural
                    language query and watch the AI orchestrate 5 microservices.
                </p>
            </div>

            {/* Chat Container */}
            <div className="z-10 w-full max-w-3xl flex-1 flex flex-col mx-auto px-4 overflow-hidden">
                <div className="glass-card flex-1 flex flex-col overflow-hidden border-opal/20">

                    {/* Service flow animation while loading */}
                    {loading && <ServiceFlow active={loading} />}

                    {/* Messages */}
                    <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4 scrollbar-thin">
                        {messages.map((msg, i) => (
                            <div key={i}>
                                {/* Bubble */}
                                <div
                                    className={`flex ${
                                        msg.role === "user" ? "justify-end" : "justify-start"
                                    }`}
                                >
                                    <div
                                        className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm font-space leading-relaxed ${
                                            msg.role === "user"
                                                ? "bg-opal/20 text-white border border-opal/30"
                                                : msg.role === "system"
                                                ? "bg-sapphire-night text-text-muted border border-border"
                                                : "bg-sapphire-night/80 text-white border border-opal/10"
                                        }`}
                                    >
                                        <ReactMarkdown>{msg.content}</ReactMarkdown>
                                    </div>
                                </div>

                                {/* Trip Plan Cards */}
                                {msg.tripPlan && (
                                    <div className="mt-3 space-y-3">

                                        {/* Execution Pipeline (post-response) */}
                                        {msg.tripPlan.workflow_explanation && (
                                            <div className="glass-card p-4 border-opal/10">
                                                <h4 className="font-orbitron text-xs text-opal tracking-[3px] uppercase mb-3">
                                                    ⚙️ Execution Pipeline
                                                </h4>
                                                <div className="flex flex-wrap gap-3">
                                                    {msg.tripPlan.workflow_explanation.trace.map((step, idx) => (
                                                        <div
                                                            key={idx}
                                                            className="flex items-center gap-2 px-3 py-2 rounded-lg border border-opal/20 bg-sapphire-night/60"
                                                            title={step.error ?? undefined}
                                                        >
                                                            <span
                                                                className={`w-2 h-2 rounded-full ${
                                                                    step.status === "completed"
                                                                        ? "bg-green-400"
                                                                        : "bg-red-400"
                                                                }`}
                                                            />
                                                            <span className="text-xs font-space text-white">
                                                                {stepIcon(step.step)} {step.step}
                                                            </span>
                                                            {step.latency_ms != null && (
                                                                <span className="text-xs text-text-muted">
                                                                    {step.latency_ms}ms
                                                                </span>
                                                            )}
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {/* Recommended combo */}
                                        {msg.tripPlan.recommended?.flight && msg.tripPlan.recommended?.hotel && (
                                            <div className="glass-card p-4 border-opal/20 bg-opal/5">
                                                <h4 className="font-orbitron text-xs text-opal tracking-[3px] uppercase mb-3">
                                                    ⭐ Best Budget Pick
                                                </h4>
                                                <div className="flex flex-col sm:flex-row gap-3 font-space text-sm text-white">
                                                    <div className="flex-1">
                                                        <span className="text-text-muted text-xs">Flight</span>
                                                        <p>
                                                            {msg.tripPlan.recommended.flight.airline}{" "}
                                                            <span className="text-opal font-bold">
                                                                ₹{msg.tripPlan.recommended.flight.price}
                                                            </span>
                                                            <span className="text-text-muted text-xs ml-1">
                                                                ({msg.tripPlan.recommended.flight.duration_hrs}h)
                                                            </span>
                                                        </p>
                                                    </div>
                                                    <div className="flex-1">
                                                        <span className="text-text-muted text-xs">Hotel</span>
                                                        <p>
                                                            {msg.tripPlan.recommended.hotel.name}{" "}
                                                            <span className="text-opal font-bold">
                                                                ₹{msg.tripPlan.recommended.hotel.price_per_night}/night
                                                            </span>
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        )}

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
                                                            className="flex justify-between items-center font-space text-sm text-white"
                                                        >
                                                            <div>
                                                                <span>{f.airline}</span>
                                                                {f.departure && (
                                                                    <span className="text-text-muted text-xs ml-2">
                                                                        {f.departure} · {f.duration_hrs}h
                                                                    </span>
                                                                )}
                                                            </div>
                                                            <span className="text-opal font-bold">
                                                                ₹{f.price.toLocaleString()}
                                                            </span>
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
                                                        <div key={j}>
                                                            <div className="flex justify-between items-center font-space text-sm text-white">
                                                                <div>
                                                                    <span>{h.name}</span>
                                                                    <span className="text-text-muted text-xs ml-2">
                                                                        ⭐ {h.rating}
                                                                    </span>
                                                                    {h.location && (
                                                                        <span className="text-text-muted text-xs ml-1">
                                                                            · {h.location.replace("_", " ")}
                                                                        </span>
                                                                    )}
                                                                </div>
                                                                <span className="text-opal font-bold">
                                                                    ₹{h.price_per_night.toLocaleString()}/night
                                                                </span>
                                                            </div>
                                                            {h.amenities && h.amenities.length > 0 && (
                                                                <div className="flex flex-wrap gap-1 mt-1">
                                                                    {h.amenities.map((a, k) => (
                                                                        <span
                                                                            key={k}
                                                                            className="text-xs bg-opal/10 text-opal px-2 py-0.5 rounded-full"
                                                                        >
                                                                            {a}
                                                                        </span>
                                                                    ))}
                                                                </div>
                                                            )}
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {/* Weather + Attractions Row */}
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                            {msg.tripPlan.weather?.temperature && (
                                                <div className="glass-card p-4 border-opal/10">
                                                    <h4 className="font-orbitron text-xs text-opal tracking-[3px] uppercase mb-2">
                                                        🌤️ Weather in {msg.tripPlan.weather.city}
                                                    </h4>
                                                    <p className="font-space text-sm text-white">
                                                        {msg.tripPlan.weather.temperature} — {msg.tripPlan.weather.condition}
                                                    </p>
                                                    {msg.tripPlan.weather.humidity != null && (
                                                        <p className="font-space text-xs text-text-muted mt-1">
                                                            Humidity: {msg.tripPlan.weather.humidity}% · Wind: {msg.tripPlan.weather.wind_kph} kph
                                                        </p>
                                                    )}
                                                    {msg.tripPlan.weather.forecast && msg.tripPlan.weather.forecast.length > 0 && (
                                                        <div className="mt-2 space-y-1">
                                                            {msg.tripPlan.weather.forecast.map((f, fi) => (
                                                                <div key={fi} className="flex justify-between font-space text-xs text-text-muted">
                                                                    <span>{f.day}</span>
                                                                    <span>{f.temperature} · {f.condition}</span>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                            )}

                                            {msg.tripPlan.attractions.length > 0 && (
                                                <div className="glass-card p-4 border-opal/10">
                                                    <h4 className="font-orbitron text-xs text-opal tracking-[3px] uppercase mb-2">
                                                        📍 Top Attractions
                                                    </h4>
                                                    <ul className="font-space text-sm text-white space-y-1">
                                                        {msg.tripPlan.attractions.map((a, j) => (
                                                            <li key={j}>• {a}</li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            )}
                                        </div>

                                        {/* Budget Summary */}
                                        {msg.tripPlan.estimated_budget > 0 && (
                                            <div className="glass-card p-4 border-opal/20 bg-opal/5">
                                                <div className="flex justify-between items-center mb-3">
                                                    <span className="font-orbitron text-xs text-opal tracking-[3px] uppercase">
                                                        💰 Estimated Budget
                                                    </span>
                                                    <span className="font-orbitron font-bold text-xl text-white">
                                                        ₹{msg.tripPlan.estimated_budget.toLocaleString()}
                                                    </span>
                                                </div>

                                                {/* Breakdown */}
                                                {msg.tripPlan.budget_breakdown && (
                                                    <div className="space-y-1 font-space text-xs text-text-muted">
                                                        <div className="flex justify-between">
                                                            <span>✈️ Flights</span>
                                                            <span>₹{msg.tripPlan.budget_breakdown.flights?.toLocaleString()}</span>
                                                        </div>
                                                        <div className="flex justify-between">
                                                            <span>🏨 Hotels</span>
                                                            <span>₹{msg.tripPlan.budget_breakdown.hotels?.toLocaleString()}</span>
                                                        </div>
                                                        <div className="flex justify-between">
                                                            <span>🎯 Activities</span>
                                                            <span>₹{msg.tripPlan.budget_breakdown.activities?.toLocaleString()}</span>
                                                        </div>
                                                    </div>
                                                )}

                                                {/* Budget evaluation badge */}
                                                {msg.tripPlan.budget_evaluation && (
                                                    <div
                                                        className={`mt-3 inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-space font-bold ${
                                                            msg.tripPlan.budget_evaluation.status === "within_budget"
                                                                ? "bg-green-500/20 text-green-400"
                                                                : "bg-red-500/20 text-red-400"
                                                        }`}
                                                    >
                                                        {msg.tripPlan.budget_evaluation.status === "within_budget"
                                                            ? `✅ Within budget · saves ₹${msg.tripPlan.budget_evaluation.difference.toLocaleString()}`
                                                            : `⚠️ Over budget by ₹${Math.abs(msg.tripPlan.budget_evaluation.difference).toLocaleString()}`}
                                                    </div>
                                                )}
                                            </div>
                                        )}

                                        {/* AI Workflow Trace (expandable) */}
                                        {msg.tripPlan.workflow_explanation && (
                                            <div className="glass-card p-4 border-opal/10">
                                                <button
                                                    onClick={() =>
                                                        setShowTrace(showTrace === i ? null : i)
                                                    }
                                                    className="font-orbitron text-xs text-opal tracking-[3px] uppercase hover:text-white transition-colors"
                                                >
                                                    🧠 AI Workflow Trace {showTrace === i ? "▲" : "▼"}
                                                </button>
                                                {showTrace === i && (
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
                                                                            className={`w-2 h-2 rounded-full flex-shrink-0 ${
                                                                                t.status === "completed"
                                                                                    ? "bg-green-400"
                                                                                    : "bg-red-400"
                                                                            }`}
                                                                        />
                                                                        <span className="text-white">{stepIcon(t.step)} {t.step}</span>
                                                                        <span className="text-text-muted">— {t.status}</span>
                                                                        {t.latency_ms != null && (
                                                                            <span className="text-text-muted">
                                                                                ({t.latency_ms}ms)
                                                                            </span>
                                                                        )}
                                                                        {t.error && (
                                                                            <span className="text-red-400 text-xs truncate max-w-[120px]" title={t.error}>
                                                                                · {t.error}
                                                                            </span>
                                                                        )}
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

                        {/* Loading pulse indicator */}
                        {loading && (
                            <div className="flex justify-start">
                                <div className="bg-sapphire-night border border-opal/20 rounded-2xl px-4 py-3">
                                    <div className="flex items-center gap-2">
                                        <div className="flex gap-1">
                                            {[0, 150, 300].map((delay) => (
                                                <div
                                                    key={delay}
                                                    className="w-2 h-2 rounded-full bg-opal animate-bounce"
                                                    style={{ animationDelay: `${delay}ms` }}
                                                />
                                            ))}
                                        </div>
                                        <span className="font-space text-xs text-text-muted">
                                            AI is analyzing intent and orchestrating services...
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