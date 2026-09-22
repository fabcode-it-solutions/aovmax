import { Check, ArrowRightLeft, TrendingUp, ArrowRight } from "lucide-react";
import { useScrollReveal } from "@/hooks/use-scroll-reveal";
import UpsellDemo from "@/components/UpsellDemo";

const columns = [
  {
    icon: Check,
    step: "01",
    headline: "Done in 48 Hours",
    label: "Install",
    body: "We build custom digital offers that complement your products and brand. Tailored to what your customers actually value.",
  },
  {
    icon: ArrowRightLeft,
    step: "02",
    headline: "Tested Weekly",
    label: "Optimize",
    body: "We A/B test everything week-over-week to find what converts highest. Different offers. Different price points. Different copy. The system learns what your customers respond to and optimizes automatically.",
  },
  {
    icon: TrendingUp,
    step: "03",
    headline: "Profit Compounds",
    label: "Scale",
    body: "Every order generates more margin. No new traffic needed. No ad spend increase. Just more profit from the orders already coming in.",
  },
];

const SystemSection = () => {
  const { ref, visible } = useScrollReveal();

  return (
    <section id="system" className="py-28 border-t border-border">
      <div ref={ref} className={`container mx-auto px-6 transition-all duration-700 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
        <div className="text-center mb-16">
          <p className="section-label mb-4">THE SYSTEM</p>
          <h2 className="font-tight font-extrabold text-[36px] md:text-[48px] tracking-[-1px] text-foreground">
            We Install. We Test. You Profit.
          </h2>
        </div>

        {/* Live upsell demo */}
        <UpsellDemo />

        {/* Three columns */}
        <div className="grid md:grid-cols-3 gap-5 mb-12">
          {columns.map((col, i) => (
            <div
              key={col.label}
              className={`border border-border rounded-xl p-8 bg-card group hover:border-primary/20 transition-all duration-700 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
              style={{ transitionDelay: `${i * 120}ms` }}
            >
              <div className="flex items-center gap-3 mb-5">
                <span className="stat-number text-[13px]">{col.step}</span>
                <div className="h-px flex-1 bg-border" />
                <col.icon className="h-4 w-4 text-primary" strokeWidth={1.5} />
              </div>
              <p className="section-label mb-2">{col.label}</p>
              <h3 className="font-semibold text-foreground text-xl mb-3">{col.headline}</h3>
              <p className="text-sm text-secondary-foreground leading-relaxed">{col.body}</p>
            </div>
          ))}
        </div>

        {/* Case study card */}
        <div className="border border-border rounded-xl overflow-hidden bg-card">
          <div className="px-8 pt-6 pb-2">
            <p className="section-label">CASE STUDY (2/1/2026 - 2/14/2026)</p>
          </div>
          <div className="px-8 pb-8">
            <p className="text-foreground font-semibold text-lg mb-1">Flash Fitness</p>
            <p className="text-sm text-muted-foreground mb-6">66 orders over 14 days</p>
            <div className="grid md:grid-cols-2 gap-0 border border-border rounded-lg overflow-hidden">
              <div className="p-6 md:p-8 bg-background">
                <p className="section-label mb-4">Before AOVMAX</p>
                <p className="font-tight font-extrabold text-[36px] text-foreground leading-none">$0</p>
                <p className="text-sm text-secondary-foreground mt-2">Upsell Revenue</p>
                <div className="mt-4 pt-4 border-t border-border">
                  <p className="text-sm text-muted-foreground">0% Attach Rate</p>
                </div>
              </div>
              <div className="p-6 md:p-8 border-t md:border-t-0 md:border-l border-border accent-bg">
                <p className="section-label mb-4 text-primary">After AOVMAX</p>
                <p className="font-tight font-extrabold text-[36px] text-primary leading-none">$10,200</p>
                <p className="text-sm text-secondary-foreground mt-2">Upsell Revenue</p>
                <div className="mt-4 pt-4 border-t accent-border">
                  <p className="text-sm text-primary font-medium">58.4% Attach Rate</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default SystemSection;
