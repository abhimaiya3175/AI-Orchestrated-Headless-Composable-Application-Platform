"use client";

import { useState, useRef, useEffect, useCallback } from "react";

/* ── Types ── */
interface TripPlan {
  title: string;
  flight: { label: string; value: string; price: string };
  hotel: { label: string; value: string; price: string };
  weather: { label: string; value: string };
  places: { label: string; value: string };
  budget: { label: string; total: string };
}

interface ChatResponse {
  services: string[];
  plan: TripPlan;
  meta: string;
}

interface Message {
  type: "user" | "ai" | "error" | "typing";
  text?: string;
  data?: ChatResponse;
}

/* ── Constants ── */
const API_BASE = "http://localhost:8000";

const MOCK_RESPONSES: Record<string, ChatResponse> = {
  goa: {
    services: ["flight_service", "hotel_service", "weather_service", "places_service", "budget_service"],
    plan: {
      title: "🏖️ Goa — 2 Day Trip",
      flight: { label: "✈️ Flight", value: "IndiGo · HYD→GOI", price: "₹4,500" },
      hotel: { label: "🏨 Hotel", value: "Beach Resort · 2 nights", price: "₹7,000" },
      weather: { label: "🌤️ Weather", value: "☀️ Sunny · 30°C" },
      places: { label: "🗺️ Places", value: "Baga Beach, Calangute, Fort Aguada" },
      budget: { label: "💰 Total Budget", total: "₹11,500" },
    },
    meta: "Parallel execution · 5 services · ~2.3s",
  },
  manali: {
    services: ["flight_service", "hotel_service", "weather_service", "places_service", "budget_service"],
    plan: {
      title: "🏔️ Manali — 3 Day Trip",
      flight: { label: "✈️ Flight", value: "Air India · DEL→KUU", price: "₹5,200" },
      hotel: { label: "🏨 Hotel", value: "Snow Peak Inn · 3 nights", price: "₹8,400" },
      weather: { label: "🌤️ Weather", value: "❄️ Cold · 8°C" },
      places: { label: "🗺️ Places", value: "Rohtang Pass, Solang Valley, Hadimba Temple" },
      budget: { label: "💰 Total Budget", total: "₹16,600" },
    },
    meta: "Parallel execution · 5 services · ~2.1s",
  },
  jaipur: {
    services: ["flight_service", "hotel_service", "weather_service", "places_service", "budget_service"],
    plan: {
      title: "🏰 Jaipur — 2 Day Trip",
      flight: { label: "✈️ Flight", value: "SpiceJet · BOM→JAI", price: "₹3,800" },
      hotel: { label: "🏨 Hotel", value: "Heritage Haveli · 2 nights", price: "₹4,400" },
      weather: { label: "🌤️ Weather", value: "🌤 Partly Cloudy · 26°C" },
      places: { label: "🗺️ Places", value: "Amber Fort, City Palace, Hawa Mahal" },
      budget: { label: "💰 Total Budget", total: "₹8,200" },
    },
    meta: "Parallel execution · 5 services · ~1.9s",
  },
};

const QUICK_CHIPS = [
  { label: "🏖️ Goa 2 days ₹15k", query: "Plan a 2-day trip to Goa under ₹15000" },
  { label: "🏔️ Manali 3 days ₹20k", query: "Plan a 3-day trip to Manali under ₹20000" },
  { label: "🏰 Jaipur 2 days ₹10k", query: "Plan a 2-day trip to Jaipur under ₹10000" },
];

/* ── Helpers ── */
function detectDestination(query: string): string {
  const q = query.toLowerCase();
  if (q.includes("goa")) return "goa";
  if (q.includes("manali")) return "manali";
  if (q.includes("jaipur")) return "jaipur";
  return "goa";
}

/* eslint-disable @typescript-eslint/no-explicit-any */
function transformAPIResponse(data: Record<string, unknown>): ChatResponse {
  const tp = data.trip_plan as Record<string, any>;
  const flight = tp.flights?.[0];
  const hotel = tp.hotels?.[0];
  const weather = tp.weather || {};
  const places: Array<Record<string, string> | string> = tp.attractions || [];
  const trace: Array<{ step: string; status: string; details?: Record<string, unknown> }> = tp.workflow_explanation?.trace || [];
  const services = trace
    .filter((t) => t.step !== "Intent Detection")
    .map((t) => t.step.replace(" service", "_service"));

  return {
    services: services.length > 0 ? services : ["flight_service", "hotel_service", "weather_service", "places_service", "budget_service"],
    plan: {
      title: `📍 ${tp.destination} — ${tp.duration}`,
      flight: {
        label: "✈️ Flight",
        value: flight ? `${flight.airline} · ${flight.duration_hrs}h` : "N/A",
        price: flight ? `₹${flight.price.toLocaleString("en-IN")}` : "—",
      },
      hotel: {
        label: "🏨 Hotel",
        value: hotel ? `${hotel.name || hotel.hotel || "Hotel"} · ${tp.duration}` : "N/A",
        price: hotel ? `₹${(hotel.price_per_night || hotel.price || 0).toLocaleString("en-IN")}/night` : "—",
      },
      weather: {
        label: "🌤️ Weather",
        value: weather.condition
          ? `${weather.condition} · ${weather.temperature || ""}`
          : weather.description
            ? `${weather.description} · ${weather.temperature || weather.temp || ""}°C`
            : weather.forecast || "N/A",
      },
      places: {
        label: "🗺️ Places",
        value: Array.isArray(places)
          ? places.map((p) => (typeof p === "string" ? p : p.name || p.place || "")).slice(0, 3).join(", ")
          : "N/A",
      },
      budget: {
        label: "💰 Total Budget",
        total: `₹${(tp.estimated_budget || 0).toLocaleString("en-IN")}`,
      },
    },
    meta: `Live API · ${services.length} services · ${tp.destination}`,
  };
}

/* ── Component ── */
export default function ChatDemo() {
  const [messages, setMessages] = useState<Message[]>([
    {
      type: "ai",
      text: "Hello! I'm your AI Travel Planner. Tell me where you want to go, your budget, and how many days — I'll handle the rest. ✨",
    },
  ]);
  const [input, setInput] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [backendStatus, setBackendStatus] = useState<"checking" | "online" | "offline">("checking");
  const chatBodyRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = useCallback(() => {
    if (chatBodyRef.current) {
      chatBodyRef.current.scrollTo({ top: chatBodyRef.current.scrollHeight, behavior: "smooth" });
    }
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  // Check backend health on mount
  useEffect(() => {
    const controller = new AbortController();
    fetch(`${API_BASE}/health`, { signal: controller.signal })
      .then((r) => {
        if (r.ok) setBackendStatus("online");
        else setBackendStatus("offline");
      })
      .catch(() => setBackendStatus("offline"));
    return () => controller.abort();
  }, []);

  const handleSend = async (text?: string) => {
    const query = (text || input).trim();
    if (!query || isProcessing) return;

    setInput("");
    setIsProcessing(true);
    setMessages((prev) => [...prev, { type: "user", text: query }, { type: "typing" }]);

    try {
      const res = await fetch(`${API_BASE}/plan`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query }),
      });
      if (!res.ok) throw new Error(`API returned ${res.status}`);
      const apiData = await res.json();
      const displayData = transformAPIResponse(apiData);
      setMessages((prev) => prev.filter((m) => m.type !== "typing").concat({ type: "ai", data: displayData }));
      setBackendStatus("online");
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : String(err);
      // Show error, then fall back to mock
      setMessages((prev) =>
        prev
          .filter((m) => m.type !== "typing")
          .concat({ type: "error", text: `Backend unavailable: ${errMsg}` })
      );
      setBackendStatus("offline");

      // Delay then show mock
      await new Promise((r) => setTimeout(r, 800));
      setMessages((prev) => [...prev, { type: "typing" }]);
      await new Promise((r) => setTimeout(r, 1000));

      const dest = detectDestination(query);
      setMessages((prev) =>
        prev.filter((m) => m.type !== "typing").concat({ type: "ai", data: MOCK_RESPONSES[dest] })
      );
    }

    setIsProcessing(false);
  };

  return (
    <section className="chat-section reveal" id="demo">
      <span className="section-tag">Live Demo</span>
      <h2 className="section-title font-syne">Try the AI Planner</h2>
      <p className="section-desc">
        Type a travel query or click a quick prompt — the AI orchestrates a complete plan in real-time.
      </p>

      <div className="chat-container">
        <div className="chat-header">
          <div className="chat-header-left font-syne">🤖 TravelAI Planner</div>
          <div className="chat-header-right">
            <span
              className="pulse-dot"
              style={backendStatus === "offline" ? { background: "var(--gold)" } : undefined}
            />
            {backendStatus === "online"
              ? "Backend Connected"
              : backendStatus === "offline"
                ? "Demo Mode"
                : "Checking..."}
          </div>
        </div>
        <div className="chat-body" ref={chatBodyRef}>
          <div className="chat-messages">
            {messages.map((msg, i) => {
              if (msg.type === "typing") {
                return (
                  <div key={i} className="message-row">
                    <div className="msg-avatar ai">✈</div>
                    <div className="typing-dots">
                      <span />
                      <span />
                      <span />
                    </div>
                  </div>
                );
              }
              if (msg.type === "user") {
                return (
                  <div key={i} className="message-row user">
                    <div className="msg-avatar user-av">👤</div>
                    <div className="msg-bubble user-bubble">{msg.text}</div>
                  </div>
                );
              }
              if (msg.type === "error") {
                return (
                  <div key={i} className="message-row">
                    <div className="msg-avatar ai">✈</div>
                    <div className="msg-bubble ai-bubble" style={{ borderColor: "rgba(239,68,68,0.3)" }}>
                      ⚠️ {msg.text}
                      <br />
                      <br />
                      <span style={{ color: "var(--muted)", fontSize: 13 }}>
                        Falling back to demo mode with sample data...
                      </span>
                    </div>
                  </div>
                );
              }
              // AI response with data
              if (msg.type === "ai" && msg.data) {
                const { services, plan, meta } = msg.data;
                return (
                  <div key={i} className="message-row">
                    <div className="msg-avatar ai">✈</div>
                    <div className="msg-bubble ai-bubble">
                      <div className="workflow-tags">
                        {services.map((s) => (
                          <span key={s} className="wf-tag">
                            ✓ {s}
                          </span>
                        ))}
                      </div>
                      {"Here's your AI-generated travel plan! 🎉"}
                      <div className="trip-card">
                        <div className="trip-card-title font-syne">{plan.title}</div>
                        <div className="trip-row">
                          <span className="trip-label">{plan.flight.label}</span>
                          <span className="trip-value">{plan.flight.value}</span>
                          <span className="trip-price">{plan.flight.price}</span>
                        </div>
                        <div className="trip-row">
                          <span className="trip-label">{plan.hotel.label}</span>
                          <span className="trip-value">{plan.hotel.value}</span>
                          <span className="trip-price">{plan.hotel.price}</span>
                        </div>
                        <div className="trip-row">
                          <span className="trip-label">{plan.weather.label}</span>
                          <span className="trip-value">{plan.weather.value}</span>
                        </div>
                        <div className="trip-row">
                          <span className="trip-label">{plan.places.label}</span>
                          <span className="trip-value">{plan.places.value}</span>
                        </div>
                        <div className="trip-row">
                          <span className="trip-label">{plan.budget.label}</span>
                          <span className="trip-total">{plan.budget.total}</span>
                        </div>
                      </div>
                      <div className="trip-footer">{meta}</div>
                    </div>
                  </div>
                );
              }
              // Plain AI text message (welcome)
              return (
                <div key={i} className="message-row">
                  <div className="msg-avatar ai">✈</div>
                  <div className="msg-bubble ai-bubble">{msg.text}</div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="chat-input-area">
        <div className="chat-input-row">
          <input
            type="text"
            className="chat-input font-dm"
            placeholder="e.g. Plan a 2-day trip to Goa under ₹15000"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleSend();
            }}
          />
          <button className="chat-send" onClick={() => handleSend()}>
            Send →
          </button>
        </div>
        <div className="chat-chips">
          {QUICK_CHIPS.map((chip) => (
            <button
              key={chip.query}
              className="chip"
              onClick={() => handleSend(chip.query)}
              disabled={isProcessing}
            >
              {chip.label}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
