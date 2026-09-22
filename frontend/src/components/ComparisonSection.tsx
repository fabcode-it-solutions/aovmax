import { X, Check } from "lucide-react";
import { useScrollReveal } from "@/hooks/use-scroll-reveal";

const rows = [
  { diy: "You build and test offers yourself", aovmax: "We build custom offers for your products and test them weekly" },
  { diy: "Set it and hope it works", aovmax: "Continuously optimized with A/B testing" },
  { diy: "You waste time and money on offers that don't work", aovmax: "Performance-based — you only pay when it generates profit" },
  { diy: "You handle all setup, troubleshooting, and optimization", aovmax: "We handle everything end-to-end" },
  { diy: "Typical attach rate: 25-35%", aovmax: "Average attach rate: 50-65%", highlight: true },
];

const ComparisonSection = () => {
  const { ref, visible } = useScrollReveal();

  return (
    <section className="py-28 border-t border-border">
      <div ref={ref} className={`container mx-auto px-6 transition-all duration-700 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
        <div className="text-center mb-16">
          <p className="section-label mb-4">WHY BRANDS SWITCH TO AOVMAX</p>
          <h2 className="font-tight font-extrabold text-[36px] md:text-[48px] tracking-[-1px] text-foreground">
            The difference between DIY<br className="hidden md:block" /> and done-for-you.
          </h2>
        </div>

        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-2 gap-4 mb-3">
            <div className="px-6 py-3 bg-card border border-border rounded-lg">
              <p className="text-[11px] font-bold uppercase tracking-[1.3px] text-muted-foreground">DIY Approach</p>
            </div>
            <div className="px-6 py-3 rounded-lg accent-bg border accent-border">
              <p className="text-[11px] font-bold uppercase tracking-[1.3px] text-primary">AOVMAX (Managed)</p>
            </div>
          </div>

          <div className="space-y-2">
            {rows.map((row, i) => (
              <div
                key={i}
                className={`grid grid-cols-2 gap-4 transition-all duration-500 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
                style={{ transitionDelay: `${300 + i * 100}ms` }}
              >
                <div className="px-6 py-4 bg-card border border-border rounded-lg flex items-start gap-3">
                  <X className="h-3.5 w-3.5 text-muted-foreground mt-0.5 shrink-0" strokeWidth={1.5} />
                  <p className="text-sm text-secondary-foreground">{row.diy}</p>
                </div>
                <div className="px-6 py-4 rounded-lg flex items-start gap-3 bg-primary border border-primary">
                  <Check className="h-3.5 w-3.5 text-white mt-0.5 shrink-0" strokeWidth={2.5} />
                  <p className="text-sm font-medium text-white">
                    {row.aovmax}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default ComparisonSection;
