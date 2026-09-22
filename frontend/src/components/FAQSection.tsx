import { useState } from "react";
import { Plus, X } from "lucide-react";
import { useScrollReveal } from "@/hooks/use-scroll-reveal";

const faqs = [
  { q: "How quickly can I see profit?", a: "Most brands see measurable results within the first 7–14 days. Our system begins testing immediately after installation, and the A/B engine quickly identifies winning offers for your specific audience." },
  { q: "Do I need any technical setup or development?", a: "No. We handle the entire installation and setup process. There's zero technical work required from your team—our engineers integrate directly with your Shopify store." },
  { q: "What if it doesn't generate extra profit?", a: "Then you pay nothing. We operate on a 100% performance-based model. We only earn when we generate incremental profit for you. There's zero risk." },
  { q: "Will this affect my ad campaigns, tracking, or conversion rate (CVR)?", a: "No. Our system operates entirely within the cart/checkout flow and does not interfere with your ad pixels, attribution, or conversion tracking. Most brands see no impact on CVR—and many see it improve." },
  { q: "How does the pricing work?", a: "We charge 20% of the incremental profit we generate. No upfront costs, no monthly fees, no minimums. You only pay when we deliver measurable results." },
  { q: "What platforms do you support?", a: "We currently support Shopify and Shopify Plus stores. If you're on a different platform, reach out—we may be able to accommodate." },
  { q: "How long does setup take?", a: "Setup typically takes 24–48 hours. Our team handles everything, and you'll be live with your first A/B test within days of signing up." },
  { q: "Can it be customized for my brand?", a: "Absolutely. Every offer, copy, and design element is customized to match your brand's look and feel. Your customers will never know it's a third-party system." },
];

const FAQSection = () => {
  const [open, setOpen] = useState<number | null>(null);
  const { ref, visible } = useScrollReveal();

  return (
    <section id="faq" className="py-28 border-t border-border">
      <div ref={ref} className={`container mx-auto px-6 transition-all duration-700 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
        <div className="text-center mb-14">
          <p className="section-label mb-4">FAQ</p>
          <h2 className="font-tight font-extrabold text-[36px] md:text-[48px] tracking-[-1px] text-foreground">
            Frequently Asked Questions
          </h2>
        </div>

        <div className="max-w-2xl mx-auto space-y-2">
          {faqs.map((faq, i) => {
            const isOpen = open === i;
            return (
              <div
                key={i}
                className={`border rounded-xl bg-card overflow-hidden transition-all duration-500 ${isOpen ? "border-primary/20 glow-sm" : "border-border"} ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
                style={{ transitionDelay: `${200 + i * 60}ms` }}
              >
                <button
                  onClick={() => setOpen(isOpen ? null : i)}
                  className="w-full flex items-center justify-between p-5 md:p-6 text-left"
                >
                  <span className="text-[15px] font-semibold text-foreground pr-4">{faq.q}</span>
                  <span className={`h-6 w-6 rounded-full flex items-center justify-center shrink-0 transition-colors ${isOpen ? "bg-primary" : "bg-muted"}`}>
                    {isOpen ? (
                      <X className="h-3 w-3 text-primary-foreground" strokeWidth={2.5} />
                    ) : (
                      <Plus className="h-3 w-3 text-foreground" strokeWidth={2.5} />
                    )}
                  </span>
                </button>
                {isOpen && (
                  <div className="px-5 md:px-6 pb-5 md:pb-6">
                    <div className="border-t border-border pt-4">
                      <p className="text-sm text-secondary-foreground leading-relaxed">{faq.a}</p>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default FAQSection;
