import { useState, useEffect, useCallback, useRef } from "react";
import { Gem, Minus, Plus, Trash2, ChevronDown } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

const product = { name: "Sterling Silver Necklace", variant: '18" / Polished', price: 185.0, qty: 1 };

const upsells = [
  {
    headline: "Lifetime Shine Guarantee",
    description: "Keep your gold finish flawless forever. Free professional cleaning, re-plating, and repair for life. We'll restore it anytime it fades.",
    price: 7.0,
    optOut: "No thanks, I'll maintain it myself",
    performance: { rate: "55%", winner: false },
  },
  {
    headline: "Lifetime Tarnish Protection",
    description: "Never polish again. We'll keep your silver looking brand new forever with our anti-tarnish guarantee and free replacement if it ever dulls.",
    price: 9.0,
    optOut: "No thanks, I'll polish it myself",
    performance: { rate: "61%", winner: true },
  },
  {
    headline: "White Glove Delivery Protection",
    description: "Signature-required delivery with damage protection. We'll replace your bracelet if it's lost, damaged, or stolen in transit. Plus priority processing.",
    price: 32.0,
    optOut: "No thanks, standard shipping is fine",
    performance: { rate: "48%", winner: false },
  },
  {
    headline: "Loss & Theft Protection",
    description: "Jewelry gets lost. We'll replace your earrings if they're lost, stolen, or damaged—no questions asked. Covers you for 2 years.",
    price: 19.0,
    optOut: "No thanks, I'll be careful",
    performance: { rate: "52%", winner: false },
  },
  {
    headline: "Checkout+",
    description: "Complete coverage: tarnish protection, loss coverage, free repairs, and lifetime shine guarantee. Everything you need to keep your jewelry perfect.",
    price: 11.0,
    optOut: "No thanks, I'll skip the protection",
    performance: { rate: "67%", winner: true },
  },
];

const annotations = {
  left: [
    {
      title: "HEADLINE COPY",
      lines: ["We test value propositions:", "- Protection-focused", "- Benefit-focused", "- Outcome-focused"],
      footer: "Finds strongest resonance",
    },
    {
      title: "DESCRIPTION COPY",
      lines: ["We test messaging:", "- Feature statements", "- Benefit statements", "- Emotional triggers"],
      footer: "Drives purchase decision",
    },
  ],
  right: [
    {
      title: "PRICE OPTIMIZATION",
      lines: ["Multiple price points tested:", "- 3-4% of cart value", "- 4-5% of cart value", "- 5-6% of cart value"],
      footer: "Optimizes revenue, not just attach rate",
    },
    {
      title: "CTA BUTTON",
      lines: ["Action triggers tested:", '- "Checkout"', '- "Complete Order"', '- "Secure Checkout"'],
      footer: "5-10% conversion impact",
    },
  ],
  bottom: {
    title: "OPT-OUT LANGUAGE",
    lines: ["Friction levels tested:", "- Soft (product-specific)", "- Neutral (generic)", "- Formal (corporate)"],
    footer: "Softer = higher acceptance",
  },
};

const AnnotationCard = ({ title, lines, footer }: { title: string; lines: string[]; footer: string }) => (
  <div
    className="rounded-lg"
    style={{
      background: "#141414",
      border: "2px solid #10B981",
      padding: "12px 14px",
      width: 200,
      boxShadow: "0 4px 16px rgba(16, 185, 129, 0.2)",
    }}
  >
    <p style={{ fontFamily: "'Inter', sans-serif", fontWeight: 700, fontSize: 10, color: "#10B981", textTransform: "uppercase", letterSpacing: "0.8px", marginBottom: 6 }}>
      {title}
    </p>
    <div style={{ fontFamily: "'Inter', sans-serif", fontWeight: 400, fontSize: 11, color: "#ADADAD", lineHeight: 1.45 }}>
      {lines.map((line, i) => (
        <p key={i} style={{ color: line.startsWith("-") ? "#ADADAD" : "#F8F8F8", marginBottom: 1 }}>{line}</p>
      ))}
    </div>
    <p style={{ fontFamily: "'Inter', sans-serif", fontWeight: 700, fontSize: 10, color: "#10B981", marginTop: 5 }}>
      {footer}
    </p>
  </div>
);

type ArrowPaths = { headline: string; description: string; price: string; button: string; optout: string };
type CardPositions = { headline: number; description: number; price: number; button: number };

const UpsellDemo = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [visible, setVisible] = useState(true);
  const [arrows, setArrows] = useState<ArrowPaths | null>(null);
  const [cardPositions, setCardPositions] = useState<CardPositions | null>(null);
  const isMobile = useIsMobile();

  const containerRef = useRef<HTMLDivElement>(null);
  const headlineRef = useRef<HTMLParagraphElement>(null);
  const descriptionRef = useRef<HTMLParagraphElement>(null);
  const priceRef = useRef<HTMLParagraphElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const optOutRef = useRef<HTMLParagraphElement>(null);

  const cardHeadlineRef = useRef<HTMLDivElement>(null);
  const cardDescriptionRef = useRef<HTMLDivElement>(null);
  const cardPriceRef = useRef<HTMLDivElement>(null);
  const cardButtonRef = useRef<HTMLDivElement>(null);
  const cardOptOutRef = useRef<HTMLDivElement>(null);

  const rotate = useCallback(() => {
    setVisible(false);
    setTimeout(() => {
      setCurrentIndex((prev) => (prev + 1) % upsells.length);
      setVisible(true);
    }, 300);
  }, []);

  useEffect(() => {
    const interval = setInterval(rotate, 5000);
    return () => clearInterval(interval);
  }, [rotate]);

  const calculateArrows = useCallback(() => {
    if (isMobile || !containerRef.current) return;
    const container = containerRef.current.getBoundingClientRect();

    const rel = (el: HTMLElement | null) => {
      if (!el) return null;
      const r = el.getBoundingClientRect();
      return { left: r.left - container.left, right: r.right - container.left, top: r.top - container.top, bottom: r.bottom - container.top, cx: r.left - container.left + r.width / 2, cy: r.top - container.top + r.height / 2 };
    };

    const h = rel(headlineRef.current);
    const d = rel(descriptionRef.current);
    const p = rel(priceRef.current);
    const b = rel(buttonRef.current);
    const o = rel(optOutRef.current);
    const co = rel(cardOptOutRef.current);

    if (!h || !d || !p || !b || !o || !co) return;

    const chEl = cardHeadlineRef.current;
    const cdEl = cardDescriptionRef.current;
    const cpEl = cardPriceRef.current;
    const cbEl = cardButtonRef.current;
    const chH = chEl ? chEl.getBoundingClientRect().height : 0;
    const cdH = cdEl ? cdEl.getBoundingClientRect().height : 0;
    const cpH = cpEl ? cpEl.getBoundingClientRect().height : 0;
    const cbH = cbEl ? cbEl.getBoundingClientRect().height : 0;

    // Position cards vertically centered on their target elements
    let headlineTop = h.cy - chH / 2;
    let descriptionTop = d.cy - cdH / 2;
    let priceTop = p.cy - cpH / 2;
    let buttonTop = b.cy - cbH / 2;

    // Ensure left cards don't overlap
    const gap = 16;
    if (headlineTop + chH + gap > descriptionTop) {
      const overlap = (headlineTop + chH + gap) - descriptionTop;
      headlineTop -= overlap / 2;
      descriptionTop += overlap / 2;
    }

    // Ensure right cards don't overlap
    if (priceTop + cpH + gap > buttonTop) {
      const overlap = (priceTop + cpH + gap) - buttonTop;
      priceTop -= overlap / 2;
      buttonTop += overlap / 2;
    }

    setCardPositions({
      headline: headlineTop,
      description: descriptionTop,
      price: priceTop,
      button: buttonTop,
    });

    // Straight-line arrows from card edges to target element edges
    const leftCardRight = 200;
    const rightCardLeft = container.width - 200;
    const headlineCardCY = headlineTop + chH / 2;
    const descriptionCardCY = descriptionTop + cdH / 2;
    const priceCardCY = priceTop + cpH / 2;
    const buttonCardCY = buttonTop + cbH / 2;

    // Left arrows: card right edge → target left edge (straight line)
    const a1 = `M ${leftCardRight},${headlineCardCY} L ${h.left},${h.cy}`;
    const a2 = `M ${leftCardRight},${descriptionCardCY} L ${d.left},${d.cy}`;
    // Right arrows: card left edge → target right edge (straight line)
    const a3 = `M ${rightCardLeft},${priceCardCY} L ${p.right},${p.cy}`;
    const a4 = `M ${rightCardLeft},${buttonCardCY} L ${b.right},${b.cy}`;
    // Bottom: opt-out text bottom → card top, vertical
    const a5 = `M ${o.cx},${o.bottom} L ${o.cx},${co.top}`;

    setArrows({ headline: a1, description: a2, price: a3, button: a4, optout: a5 });
  }, [isMobile]);

  useEffect(() => {
    // Only recalculate when content is visible and fully rendered
    if (!visible) return;
    // Use requestAnimationFrame + delay to ensure DOM is settled after opacity transition
    const timer = setTimeout(() => {
      requestAnimationFrame(() => {
        calculateArrows();
      });
    }, 350); // Wait for the 300ms opacity transition to complete
    return () => clearTimeout(timer);
  }, [calculateArrows, currentIndex, visible]);

  useEffect(() => {
    window.addEventListener("resize", calculateArrows);
    return () => window.removeEventListener("resize", calculateArrows);
  }, [calculateArrows]);

  const upsell = upsells[currentIndex];
  const lineTotal = product.price * product.qty;

  return (
    <div ref={containerRef} className="max-w-[1100px] mx-auto mb-16 relative">
      <p className="section-label text-center mb-4">LIVE DEMO</p>

      <div className="relative flex items-start justify-center" style={{ minHeight: isMobile ? "auto" : 700, paddingBottom: isMobile ? 0 : 120 }}>

        {/* LEFT annotation cards — positioned to align with headline & description */}
        {!isMobile && (
          <div className="absolute" style={{ left: 110, top: 0, width: 200 }}>
            <div ref={cardHeadlineRef} style={{ position: "absolute", top: cardPositions?.headline ?? 340 }}>
              <AnnotationCard {...annotations.left[0]} />
            </div>
            <div ref={cardDescriptionRef} style={{ position: "absolute", top: cardPositions?.description ?? 480 }}>
              <AnnotationCard {...annotations.left[1]} />
            </div>
          </div>
        )}

        {/* RIGHT annotation cards */}
        {!isMobile && (
          <div className="absolute" style={{ right: 110, top: 0, width: 200 }}>
            <div ref={cardPriceRef} style={{ position: "absolute", top: cardPositions?.headline ?? 340, right: 0 }}>
              <AnnotationCard {...annotations.right[0]} />
            </div>
            <div ref={cardButtonRef} style={{ position: "absolute", top: cardPositions?.description ?? 480, right: 0 }}>
              <AnnotationCard {...annotations.right[1]} />
            </div>
          </div>
        )}


        {/* CART */}
        <div className="relative" style={{ width: "100%", maxWidth: 420, zIndex: 2, marginTop: 40 }}>
          <div className="rounded-lg overflow-hidden shadow-2xl" style={{ background: "#FFFFFF" }}>

            {/* Cart header */}
            <div className="px-5 py-4 border-b" style={{ borderColor: "#E5E5E5" }}>
              <div className="flex items-center justify-between">
                <h3 style={{ color: "#1A1A1A", fontSize: 16, fontWeight: 700, fontFamily: "'Inter', sans-serif", letterSpacing: "-0.01em" }}>Your Cart</h3>
                <button style={{ color: "#999", fontSize: 12, fontFamily: "'Inter', sans-serif", textDecoration: "underline" }}>Continue shopping</button>
              </div>
              <div className="flex items-center justify-between mt-3">
                <span style={{ color: "#999", fontSize: 11, fontFamily: "'Inter', sans-serif", textTransform: "uppercase", letterSpacing: "0.05em" }}>Product</span>
                <span style={{ color: "#999", fontSize: 11, fontFamily: "'Inter', sans-serif", textTransform: "uppercase", letterSpacing: "0.05em" }}>Total</span>
              </div>
            </div>

            {/* Product line */}
            <div className="px-5 pt-5 pb-5 border-b" style={{ borderColor: "#E5E5E5" }}>
              <div className="flex gap-3.5">
                <div className="w-[80px] h-[80px] rounded flex items-center justify-center shrink-0" style={{ background: "#F3E5F5" }}>
                  <Gem className="w-8 h-8" style={{ color: "#8E24AA" }} strokeWidth={1.5} />
                </div>
                <div className="flex-1 min-w-0">
                  <p style={{ color: "#1A1A1A", fontSize: 14, fontWeight: 500, fontFamily: "'Inter', sans-serif", lineHeight: 1.3 }}>{product.name}</p>
                  <p style={{ color: "#999", fontSize: 12, fontFamily: "'Inter', sans-serif", marginTop: 2 }}>{product.variant}</p>
                  <p style={{ color: "#1A1A1A", fontSize: 13, fontWeight: 500, fontFamily: "'Inter', sans-serif", marginTop: 4 }}>${product.price.toFixed(2)}</p>
                  <div className="flex items-center mt-2.5 gap-3">
                    <div className="flex items-center rounded" style={{ border: "1px solid #D4D4D4" }}>
                      <button className="px-2 py-1.5" style={{ color: "#666" }}><Minus className="w-3 h-3" /></button>
                      <span style={{ color: "#1A1A1A", fontSize: 13, fontFamily: "'Inter', sans-serif", fontWeight: 500, width: 24, textAlign: "center", display: "inline-block" }}>{product.qty}</span>
                      <button className="px-2 py-1.5" style={{ color: "#666" }}><Plus className="w-3 h-3" /></button>
                    </div>
                    <button style={{ color: "#999" }} className="hover:opacity-70 transition-opacity"><Trash2 className="w-3.5 h-3.5" /></button>
                  </div>
                </div>
                <div className="shrink-0 text-right">
                  <p style={{ color: "#1A1A1A", fontSize: 14, fontWeight: 500, fontFamily: "'Inter', sans-serif" }}>${lineTotal.toFixed(2)}</p>
                </div>
              </div>
            </div>

            {/* Order note */}
            <div className="px-5 py-3 border-b" style={{ borderColor: "#E5E5E5" }}>
              <button className="flex items-center gap-1.5" style={{ color: "#999", fontSize: 12, fontFamily: "'Inter', sans-serif" }}>
                <ChevronDown className="w-3 h-3" />
                Add order note
              </button>
            </div>

            {/* Subtotal line */}
            <div className="px-5 py-3 flex items-center justify-between border-b" style={{ borderColor: "#E5E5E5" }}>
              <span style={{ color: "#1A1A1A", fontSize: 13, fontWeight: 600, fontFamily: "'Inter', sans-serif" }}>Subtotal</span>
              <span style={{ color: "#1A1A1A", fontSize: 13, fontWeight: 600, fontFamily: "'Inter', sans-serif" }}>${lineTotal.toFixed(2)}</span>
            </div>

            {/* Upsell section */}
            <div className="transition-opacity duration-300 ease-in-out" style={{ opacity: visible ? 1 : 0 }}>
              <div className="px-5 py-4">
                {/* Headline row with inline performance badge */}
                <div className="flex items-center gap-2 mb-1.5">
                  <p ref={headlineRef} className="font-bold" style={{ color: "#1A1A1A", fontSize: 15, fontWeight: 700, fontFamily: "'Inter', sans-serif", lineHeight: 1.3 }}>{upsell.headline}</p>
                  <p ref={priceRef} className="shrink-0 ml-auto" style={{ color: "#1A1A1A", fontSize: 15, fontWeight: 600, fontFamily: "'Inter', sans-serif" }}>${upsell.price.toFixed(2)}</p>
                </div>
                <p ref={descriptionRef} style={{ color: "#666", fontSize: 13, fontFamily: "'Inter', sans-serif", lineHeight: 1.55 }}>{upsell.description}</p>
              </div>
            </div>

            {/* Checkout footer */}
            <div className="px-5 pb-5 pt-1">
              <button
                ref={buttonRef}
                className="w-full transition-opacity hover:opacity-90"
                style={{ background: "#1A1A1A", color: "#FFFFFF", fontSize: 15, fontWeight: 600, fontFamily: "'Inter', sans-serif", padding: "16px 24px", borderRadius: 40 }}
              >
                {upsell.headline === "Checkout+" ? "Checkout +" : upsell.headline === "Loss & Theft Protection" ? "Secure Checkout" : "Checkout"}
              </button>
              <p
                ref={optOutRef}
                className="text-center mt-3 cursor-pointer transition-opacity duration-300"
                style={{ opacity: visible ? 1 : 0, color: "#1A1A1A", fontSize: 13, fontFamily: "'Inter', sans-serif", textDecoration: "underline" }}
              >
                {upsell.optOut}
              </p>
            </div>
          </div>

          {/* Progress dots */}
          <div className="flex items-center justify-center gap-2 mt-4">
            {upsells.map((_, i) => (
              <button
                key={i}
                onClick={() => {
                  setVisible(false);
                  setTimeout(() => { setCurrentIndex(i); setVisible(true); }, 300);
                }}
                className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${i === currentIndex ? "bg-primary w-4" : "bg-muted-foreground/40"}`}
              />
            ))}
          </div>
        </div>

        {/* Bottom annotation */}
        {!isMobile && (
          <div ref={cardOptOutRef} className="absolute flex justify-center" style={{ bottom: -30, left: "50%", transform: "translateX(-50%)", zIndex: 3 }}>
            <AnnotationCard {...annotations.bottom} />
          </div>
        )}
      </div>
    </div>
  );
};

export default UpsellDemo;
