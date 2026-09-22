import { ArrowRight } from "lucide-react";
import { useScrollReveal, useCountUp } from "@/hooks/use-scroll-reveal";

const ProofSection = () => {
  const { ref, visible } = useScrollReveal(0.2);

  const attachRate = useCountUp(642, 1800, 0, visible);
  const largestProfit = useCountUp(28400, 2000, 0, visible);
  const days = useCountUp(7, 1200, 0, visible);

  const stats = [
    { value: `${(attachRate / 10).toFixed(1)}%`, label: "Average Attach Rate" },
    { value: `$${largestProfit.toLocaleString()}`, label: "Largest Monthly Profit (Single Brand)" },
    { value: `${days} Days`, label: "Average Time to First Results" },
  ];

  return (
    <section id="proof" className="py-28 relative" style={{ background: "#059669" }}>
      <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23fff' fill-opacity='1'%3E%3Ccircle cx='1' cy='1' r='1'/%3E%3C/g%3E%3C/svg%3E\")" }} />
      
      <div ref={ref} className={`container mx-auto px-6 text-center relative z-10 transition-all duration-700 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
        <p className="text-[11px] font-bold uppercase tracking-[1.5px] mb-6" style={{ color: "rgba(255,255,255,0.5)" }}>
          PROOF IN THE NUMBERS
        </p>
        <h2 className="font-tight font-extrabold text-[38px] md:text-[52px] tracking-[-1.2px] leading-[1.02] mb-4" style={{ color: "#fff" }}>
          $347,293 in Total Profit Generated
        </h2>
        <p className="text-base md:text-lg mb-14 max-w-lg mx-auto" style={{ color: "rgba(255,255,255,0.7)" }}>
          Across 18 active brands. 100% performance-based. Zero upfront cost.
        </p>

        <div className="grid md:grid-cols-3 gap-4 mb-14 max-w-3xl mx-auto">
          {stats.map((stat, i) => (
            <div
              key={stat.label}
              className={`rounded-xl p-7 transition-all duration-600 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}
              style={{
                background: "rgba(255,255,255,0.08)",
                border: "1px solid rgba(255,255,255,0.12)",
                backdropFilter: "blur(8px)",
                transitionDelay: `${300 + i * 120}ms`,
              }}
            >
              <p className="font-tight font-extrabold text-[36px] md:text-[42px] tabular-nums leading-none" style={{ color: "#fff" }}>
                {stat.value}
              </p>
              <p className="text-[11px] uppercase tracking-wider font-medium mt-3" style={{ color: "rgba(255,255,255,0.6)" }}>
                {stat.label}
              </p>
            </div>
          ))}
        </div>

        <a
          href="https://calendly.com/aovmax/30min"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 font-semibold px-8 py-3.5 rounded-md hover:opacity-90 transition-all text-sm"
          style={{ background: "#fff", color: "#059669" }}
        >
          See Live Dashboard <ArrowRight className="h-4 w-4" />
        </a>
      </div>
    </section>
  );
};

export default ProofSection;
