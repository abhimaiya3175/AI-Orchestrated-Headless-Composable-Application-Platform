# 🚀 AI-Orchestrated Headless Composable Application Platform
## UPDATED — Website Build Prompt + Image Generation Prompts
## Palette: Sapphire Night #1D2D44 × Opal #A7DADC

---

# ═══════════════════════════════════════════════
# PART 1 — WEBSITE BUILD PROMPT
# Paste into: Claude / V0 / Bolt / Cursor / Replit
# ═══════════════════════════════════════════════

```
Build a premium, dark-tech single-page application for "AI-Orchestrated Headless Composable Application Platform" (AOHCAP). The entire site must feel like a AAA enterprise SaaS product — futuristic, editorial, deeply polished, and technically impressive.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
TYPOGRAPHY
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Display / Headings / Nav / Buttons / Labels → Orbitron (Google Fonts)
Body / Paragraphs / Descriptions → Space Mono (Google Fonts)
Import via:
<link href="https://fonts.googleapis.com/css2?family=Orbitron:wght@400;600;700;900&family=Space+Mono:ital,wght@0,400;0,700;1,400&display=swap" rel="stylesheet">

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
COLOR SYSTEM — SAPPHIRE NIGHT × OPAL
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
:root {
  --bg-primary:     #1D2D44;   /* Sapphire Night — main background */
  --bg-deep:        #111820;   /* Deeper dark — cards, overlays */
  --bg-surface:     #243450;   /* Surface — section backgrounds */
  --accent:         #A7DADC;   /* Opal — glows, CTAs, highlights */
  --accent-dim:     rgba(167, 218, 220, 0.15); /* Opal transparent — glow halos */
  --accent-glow:    rgba(167, 218, 220, 0.35); /* Opal glow — box shadows */
  --text-primary:   #E8F4F5;   /* Near white — headings, body */
  --text-muted:     #5A7D8A;   /* Muted opal — secondary text */
  --border:         rgba(167, 218, 220, 0.18); /* Card borders */
  --overlay:        rgba(17, 24, 32, 0.75);   /* Dark glass overlay */
}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PAGE STRUCTURE — SLIDE ARCHITECTURE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
RULE: Only the Landing Page (Slide 1) is vertically scrollable with parallax.
All other pages (Slides 2–8) are FULL-SCREEN NON-SCROLLABLE SLIDES
that transition like a presentation deck — no scroll, only nav-triggered transitions.

Implement a JavaScript SlideController:
- Arrow keys (← →) navigate between slides 2–8
- Clicking nav dots jumps to any slide
- Slide 1 (Landing) scrolls normally; reaching bottom auto-advances to Slide 2
- Swipe support on mobile (touchstart/touchend delta)
- Current slide stored in URL hash (#slide-2, #slide-3, etc.)
- Slide number counter bottom-right: "02 / 08" in Orbitron font

Slide List:
  Slide 1 — LANDING PAGE         (scrollable + parallax)
  Slide 2 — PLATFORM OVERVIEW    (full-screen, non-scroll)
  Slide 3 — ARCHITECTURE         (full-screen, non-scroll)
  Slide 4 — AI ORCHESTRATION     (full-screen, non-scroll)
  Slide 5 — COMPOSABLE MODULES   (full-screen, non-scroll)
  Slide 6 — INTEGRATIONS         (full-screen, non-scroll)
  Slide 7 — PRICING              (full-screen, non-scroll)
  Slide 8 — CONTACT / CTA        (full-screen, non-scroll)

Fixed Navigation Bar (all slides):
- Logo left: "AOHCAP" in Orbitron 700, Opal color
- Nav links center: Overview · Architecture · AI Core · Modules · Integrations · Pricing · Contact
- CTA button right: [GET STARTED] — Orbitron, Opal border + glow
- Dot navigation: vertical strip on right edge, Opal active dot
- All text: Orbitron font, letter-spacing: 2px, uppercase

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
ANIMATION 1 — SPOTLIGHT HOVER EFFECT
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Apply to: ALL cards, feature blocks, pricing tiers, module tiles, integration cells.

Implementation:
- Listen to mousemove on each card element
- Calculate cursor position relative to card bounds using getBoundingClientRect()
- Set CSS custom properties: card.style.setProperty('--mouse-x', x + 'px') and '--mouse-y'
- Apply via ::before pseudo-element:
  background: radial-gradient(600px circle at var(--mouse-x) var(--mouse-y),
    rgba(167,218,220,0.12), transparent 60%);
- On mouseleave: fade gradient to transparent (transition: opacity 0.4s)
- Cards must have: position: relative; overflow: hidden;
- Effect color: Opal (#A7DADC) at 12% opacity — subtle, premium

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
ANIMATION 2 — INFINITE MARQUEE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Apply to: Bottom of Landing Page hero section AND Integrations Slide (Slide 6).

Implementation:
- Two rows, stacked vertically
- Row 1 scrolls LEFT continuously, Row 2 scrolls RIGHT continuously
- Content: "AI ORCHESTRATION · HEADLESS CMS · COMPOSABLE APIS · EDGE DEPLOY · REAL-TIME SYNC · MODULAR ARCHITECTURE · ZERO LOCK-IN · AUTONOMOUS AGENTS · SCHEMA-FIRST · EVENT DRIVEN ·"
- Duplicate content 3× inside each row to ensure seamless loop
- CSS only: @keyframes marquee-left { from { transform: translateX(0) } to { transform: translateX(-33.333%) } }
- Animation duration: 30s linear infinite for Row 1, 25s linear infinite for Row 2
- Pause on hover: .marquee:hover .marquee-track { animation-play-state: paused }
- Style: Orbitron font, 11px, letter-spacing: 4px, color: var(--text-muted), uppercase
- Separator dots: color: var(--accent)
- Container: overflow: hidden, border-top + border-bottom: 1px solid var(--border)
- Fade edges: use mask-image: linear-gradient(to right, transparent, black 10%, black 90%, transparent)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
ANIMATION 3 — SPLIT TEXT ANIMATION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Apply to: Every H1 and H2 heading across ALL slides on slide enter.

Implementation:
- On DOMContentLoaded: find all [data-split-text] elements
- Split inner text by spaces into individual <span class="word"> elements
- Wrap each word span in <span class="word-outer"> (acts as clip mask with overflow:hidden)
- Initial state: .word { transform: translateY(100%); opacity: 0; }
- On slide become active: trigger .word { transform: translateY(0); opacity: 1; transition: transform 0.7s cubic-bezier(0.16,1,0.3,1), opacity 0.5s ease; }
- Stagger: each word gets transition-delay: calc(var(--word-index) * 0.07s)
- Set --word-index via JS: span.style.setProperty('--word-index', index)
- On slide exit: reverse animation (translateY(-100%) with 0.3s duration)
- Apply data-split-text to: all h1, h2 with class "hero-title", "slide-title"

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
ANIMATION 4 — PAGE TRANSITION ANIMATIONS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Apply to: All slide-to-slide transitions (Slide 2 through 8).

Implementation:
- Full-screen overlay div: position fixed, z-index 9999, inset 0
- Background: var(--bg-deep) with 3px horizontal scanlines pattern:
  background-image: repeating-linear-gradient(0deg, rgba(167,218,220,0.03) 0px, transparent 1px, transparent 3px)
- Phase 1 (IN): overlay slides UP from bottom (translateY(100%) → translateY(0)), duration 300ms ease-in
- Phase 2 (HOLD): 80ms pause — swap slide content during this window
- Phase 3 (OUT): overlay slides UP off screen (translateY(0) → translateY(-100%)), duration 300ms ease-out
- Total transition: ~680ms
- Add Opal progress line at top of overlay: thin 2px bar that fills left-to-right during hold phase
- Also animate: new slide content fades from scale(0.97) to scale(1) as overlay exits
- Add subtle chromatic aberration effect on overlay using text-shadow offset in red/blue on any text visible during transition

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
ANIMATION 5 — PARALLAX DEPTH SCROLLING
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Apply to: LANDING PAGE (Slide 1) ONLY.

Three depth layers using requestAnimationFrame + scroll event:
  Layer 0 — Hero background image:    translateY(scrollY * 0.3)  ← slowest
  Layer 1 — Floating SVG hexagons:    translateY(scrollY * 0.15) ← very slow
  Layer 2 — Floating SVG nodes/lines: translateY(scrollY * 0.5)  ← medium
  Layer 3 — Floating orbs/particles:  translateY(scrollY * 0.7)  ← faster
  Layer 4 — Hero text + CTA:          translateY(scrollY * 1.0)  ← normal scroll

Floating SVG Elements (generate in JS):
- 8–12 hexagon outlines, 40–120px, opacity 0.08–0.15, random positions
- Neural network: 20 nodes connected by 30 lines, Opal color, opacity 0.06
- 4 large blurred circles (radial gradient, Opal, opacity 0.04) as ambient light

Performance: use will-change: transform on all parallax layers, passive scroll listener.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
ANIMATION 6 — SKELETON LOADING ANIMATION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Apply to: Slide 2 (Platform Overview) and Slide 3 (Architecture) on FIRST VISIT only.

Implementation:
- Create exact skeleton HTML that mirrors real content layout (same dimensions, same grid)
- Skeleton colors: background: #1D3055 (slightly lighter than bg)
- Shimmer animation: @keyframes shimmer { from { background-position: -400px 0 } to { background-position: 400px 0 } }
- Skeleton gradient: background: linear-gradient(90deg, #1D3055 25%, #2A4066 50%, #1D3055 75%)
- background-size: 800px 100%; animation: shimmer 1.8s infinite linear
- After 1500ms: fade skeleton out (opacity: 0, transition: 0.5s), swap in real content (opacity: 0→1)
- Track first visit per slide with a JS Set — never show skeleton on revisit
- Skeleton shapes: rounded rectangles for text lines (heights: 32px title, 16px body), square cards
- Border-radius on all skeleton elements: 4px; overflow: hidden

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
GLOBAL VISUAL DESIGN
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Background texture: SVG noise filter at 4% opacity over entire page body
  filter: url(#noise) — generate inline SVG feTurbulence noise filter in <defs>

Cards — Glassmorphism style:
  background: rgba(29, 45, 68, 0.55);
  backdrop-filter: blur(16px);
  border: 1px solid var(--border);
  box-shadow: 0 0 30px rgba(167,218,220,0.06), inset 0 1px 0 rgba(255,255,255,0.04);
  border-radius: 16px;

Buttons:
  font-family: Orbitron; font-weight: 700; letter-spacing: 3px; text-transform: uppercase;
  Primary: background: var(--accent); color: var(--bg-deep); padding: 14px 36px;
  Secondary: background: transparent; border: 1.5px solid var(--accent); color: var(--accent);
  Hover glow: box-shadow: 0 0 20px rgba(167,218,220,0.4), 0 0 60px rgba(167,218,220,0.15);

Custom Cursor:
  Hide default cursor: cursor: none on body
  Create div#cursor: 10px circle, background: var(--accent), border-radius 50%, pointer-events: none, fixed position
  Create div#cursor-ring: 36px ring, border: 1.5px solid var(--accent), border-radius 50%, opacity 0.5
  JS: update both on mousemove with lerp smoothing for ring lag
  On hovering links/buttons: cursor scale(2.5) + ring scale(0.5) with 0.2s transition

Scroll progress bar (Landing page only):
  Fixed top: 0, full width, 2px height
  Background: var(--accent), width driven by (scrollY / maxScroll * 100)%
  Glow: box-shadow: 0 0 8px var(--accent)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SLIDE 1 — LANDING PAGE (Scrollable)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Section A — Hero (100vh):
  Background: hero-bg.jpg (parallax layer 0, speed 0.3x)
  Dark overlay: rgba(17,24,32,0.55) gradient from center
  Parallax floating SVG hexagons (layer 1–3)
  H1 [data-split-text]: "ORCHESTRATE. COMPOSE. DEPLOY."
    Font: Orbitron 900, 72px, color: white, line-height: 1.1
  H2 subheading: "The AI-native platform assembling applications from intelligent, headless, composable modules."
    Font: Space Mono, 18px, color: var(--text-muted), max-width: 600px
  CTA Row: [GET STARTED] (primary) + [WATCH DEMO] (secondary, with ▶ icon)
  Badge strip below CTAs: "200+ Modules · 99.99% Uptime · SOC2 Certified · 10M+ API/sec"
    Orbitron 10px, letter-spacing: 3px, muted color, separated by opal dots

Section B — Infinite Marquee Strip (80px height)

Section C — Features Overview (auto height, scrollable):
  3-column grid of feature cards with Spotlight Hover:
    Card 1: "AI Orchestration" — Neural network icon
    Card 2: "Headless Architecture" — Modular cube icon
    Card 3: "Composable APIs" — Chain link icon
    Card 4: "Edge Deployment" — Globe with nodes icon
    Card 5: "Real-time Sync" — Pulse waveform icon
    Card 6: "Zero Lock-in" — Open lock icon
  Each card: glassmorphism style, Spotlight Hover, icon in Opal, title in Orbitron

Section D — Stats Bar:
  Full-width dark strip with 4 animated counters (count up on scroll into view):
  "10M+" · "200+" · "99.99%" · "500+"
  Labels below in Space Mono: "API Calls/sec" · "Composable Modules" · "Uptime SLA" · "Enterprise Clients"

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SLIDE 2 — PLATFORM OVERVIEW
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Layout: 50/50 split screen
Left panel: platform-overview.jpg image, full panel height, object-fit: cover
Right panel: content
  H2 [data-split-text]: "ONE PLATFORM. INFINITE COMPOSITIONS."
  Paragraph: Space Mono, 15px describing the platform
  4 feature rows (icon + bold label + short desc):
    → Plug-and-play module registry
    → AI-driven composition engine
    → Schema-first API layer
    → Universal deployment target
  Each row is a card with Spotlight Hover effect
Skeleton loading on FIRST VISIT (1.5s shimmer then reveal)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SLIDE 3 — ARCHITECTURE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Layout: Full-width architecture.jpg as background (70% height, centered)
Overlay content above and below image:
  H2 [data-split-text] top: "HEADLESS BY DESIGN. INTELLIGENT BY NATURE."
  3 animated callout labels pointing to image regions (absolute positioned, connected by dashed Opal lines):
    Label A: "Infrastructure Layer"
    Label B: "Orchestration Core"
    Label C: "Composable Modules"
  Labels animate in with 200ms stagger after slide transition
  Below image: 3 column mini-stats (Orbitron numbers + Space Mono labels)
Skeleton loading on FIRST VISIT

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SLIDE 4 — AI ORCHESTRATION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Layout: Full screen, centered content + right image panel
Background: Animated SVG neural network (JS-generated):
  30 nodes (8px circles, Opal color, opacity 0.25) at random positions
  50 connecting lines (1px, rgba(167,218,220,0.08))
  Pulse animation: random nodes glow brighter every 2s with 1s fade
  Data packets: small dots traveling along lines with JS animation

Center content:
  Eyebrow: "CORE ENGINE" in Orbitron 10px, Opal color, letter-spacing: 6px
  H2 [data-split-text]: "AI AT THE CORE OF EVERYTHING."
  Description: Space Mono, 15px
  3 animated stat counters that trigger on slide enter:
    "10M+" API Calls/Second
    "99.99%" Uptime Guarantee
    "200+" Composable Modules
  Counter animation: rapid number increment over 1.5s (requestAnimationFrame)

Right panel: ai-orchestration.jpg, rounded 20px, opal glow border

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SLIDE 5 — COMPOSABLE MODULES
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Background: modules-bg.jpg at 15% opacity
Layout: Full screen
  H2 [data-split-text]: "PICK. COMPOSE. LAUNCH."
  Subtitle in Space Mono: "Choose from 200+ pre-built modules. Compose them visually. Ship in minutes."
  Interactive 3×3 module card grid (9 cards) with Spotlight Hover:
    CMS Core · Auth Engine · Search API · Analytics · Notifications
    Media CDN · Commerce · Workflow AI · Edge Functions
  Each card: glassmorphism, 16px Orbitron module name, Space Mono 12px description, Opal icon
  Hover: card lifts (translateY -4px), Spotlight glow activates, border brightens
  Active/selected card: Opal full border glow

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SLIDE 6 — INTEGRATIONS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Layout: Full screen
  H2 [data-split-text]: "CONNECT EVERYTHING."
  integrations.jpg centered (600px wide, rounded, Opal glow)
  Double infinite marquee (same as Landing Page marquee but with integration names):
    Row 1 (left): "AWS · VERCEL · NETLIFY · SHOPIFY · STRIPE · CONTENTFUL · ALGOLIA · SANITY ·"
    Row 2 (right): "NEXT.JS · REACT · VUE · SVELTE · GRAPHQL · REST · GRPC · WEBHOOKS ·"
  Below image: "50+ native integrations. REST, GraphQL, gRPC. One unified SDK."

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SLIDE 7 — PRICING
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Layout: Full screen centered
  H2 [data-split-text]: "SIMPLE PRICING. UNLIMITED SCALE."
  3 pricing tier cards (horizontal row) with Spotlight Hover:
    Card 1 — STARTER: $0/mo — 5 modules · 100K API calls · Community support
    Card 2 — SCALE: $299/mo — 50 modules · 5M API calls · Priority support ← HIGHLIGHTED
    Card 3 — ENTERPRISE: Custom — Unlimited · Dedicated infra · SLA guarantee
  Middle card SCALE:
    border: 1.5px solid var(--accent)
    box-shadow: 0 0 40px rgba(167,218,220,0.2), 0 0 80px rgba(167,218,220,0.08)
    "MOST POPULAR" badge in Orbitron, Opal background, absolute positioned top-center
  All cards: Orbitron tier name, Orbitron price, Space Mono feature list
  CTA button per card: [START FREE] · [GET STARTED] · [CONTACT SALES]
  Fine print: Space Mono 12px, muted: "All plans include 14-day free trial. No credit card required."

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SLIDE 8 — CONTACT / CTA
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Background: cta-bg.jpg, full cover, dark overlay rgba(17,24,32,0.65)
Layout: Full screen centered
  H2 [data-split-text]: "START BUILDING TODAY."
  Subtext: Space Mono, "Join 500+ engineering teams composing the future."
  Email input + [LAUNCH NOW] button (inline row):
    Input: Orbitron placeholder "Enter your work email", glassmorphism style
    Button: Orbitron, Opal background, hover glow, arrow icon →
  Trust badges row: "SOC2 Type II · GDPR Compliant · 99.99% SLA · 24/7 Support"
  Social/footer links row: GitHub · Docs · Twitter/X · LinkedIn
  Bottom: "© 2025 AOHCAP. Built for builders." in Space Mono 11px, muted

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
TECHNICAL REQUIREMENTS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Stack: Single HTML file with embedded CSS + JS (no build tools needed)
OR: React JSX with Tailwind + vanilla JS for animations

Image references (place files in /images/ folder):
  hero-bg.jpg           → Slide 1 hero background
  platform-overview.jpg → Slide 2 left panel
  architecture.jpg      → Slide 3 full-width background
  ai-orchestration.jpg  → Slide 4 right panel
  modules-bg.jpg        → Slide 5 background (15% opacity)
  integrations.jpg      → Slide 6 center image
  cta-bg.jpg            → Slide 8 full background

Performance:
  - Only use transform and opacity for animations (GPU-composited, no layout thrash)
  - Add will-change: transform to all animated elements
  - Passive event listeners for scroll and mousemove
  - Lazy load slide images (loading="lazy" except slide 1)
  - Throttle mousemove handlers to 16ms (60fps cap)

Responsive (< 768px mobile):
  - All slides become scrollable (remove slide snap behavior)
  - Nav collapses to hamburger menu
  - Grid layouts go single column
  - Marquee speed reduced 50%
  - Custom cursor disabled
  - Parallax disabled (performance)
  - Font sizes scale down: H1 40px, H2 28px
```


# ═══════════════════════════════════════════════
# QUICK REFERENCE — ALL IMAGE FILES
# ═══════════════════════════════════════════════

| # | Filename              | Size (px)      | Slide Location              | Grok/ChatGPT Ratio |
|---|-----------------------|----------------|-----------------------------|--------------------|
| 1 | hero-bg.jpg           | 1920 × 1080    | Slide 1 — Hero background   | 16:9 wide          |
| 2 | platform-overview.jpg | 960 × 1080     | Slide 2 — Left panel        | Portrait ~1:1.1    |
| 3 | architecture.jpg      | 1920 × 900     | Slide 3 — Full width        | Ultra-wide 2:1     |
| 4 | ai-orchestration.jpg  | 960 × 960      | Slide 4 — Right panel       | 1:1 square         |
| 5 | modules-bg.jpg        | 1920 × 1080    | Slide 5 — BG (15% opacity)  | 16:9 wide          |
| 6 | integrations.jpg      | 1200 × 800     | Slide 6 — Center image      | 3:2 landscape      |
| 7 | cta-bg.jpg            | 1920 × 1080    | Slide 8 — Full background   | 16:9 wide          |

---

# ═══════════════════════════════════════════════
# COLOR PALETTE — FINAL CONFIRMED
# ═══════════════════════════════════════════════

| Name           | HEX       | Usage                                    |
|----------------|-----------|------------------------------------------|
| Sapphire Night | #1D2D44   | Primary background — all pages           |
| Deep Dark      | #111820   | Cards, overlays, CTA background          |
| Surface        | #243450   | Section dividers, card backgrounds       |
| Opal           | #A7DADC   | ALL accents: glows, CTAs, highlights     |
| Opal Dim       | 15% opal  | Spotlight hover, borders, shimmer        |
| Text White     | #E8F4F5   | All headings and body text               |
| Muted          | #5A7D8A   | Secondary text, nav links, fine print    |

---

# ═══════════════════════════════════════════════
# ANIMATION IMPLEMENTATION CHECKLIST
# ═══════════════════════════════════════════════

  ✅  Spotlight Hover     → Cards on ALL slides (mousemove radial gradient)
  ✅  Infinite Marquee    → Slide 1 bottom + Slide 6 (2 rows, opposing directions)
  ✅  Split Text          → Every H1 + H2 on every slide (word-by-word stagger)
  ✅  Page Transition     → Slide 2→8 transitions (sapphire wipe + scanline overlay)
  ✅  Parallax Scrolling  → Slide 1 ONLY (3 depth layers + floating SVG elements)
  ✅  Skeleton Loading    → Slide 2 + Slide 3 first visit only (1.5s shimmer reveal)

---

*Topic: AI-Orchestrated Headless Composable Application Platform*
*Font: Orbitron (all headings/UI) + Space Mono (body/paragraphs)*
*Palette: Sapphire Night #1D2D44 × Opal #A7DADC — CONFIRMED FINAL*
*Slides: 8 total — Landing scrollable, Slides 2–8 full-screen non-scrollable*