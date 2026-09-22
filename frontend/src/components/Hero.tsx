import { ArrowRight } from "lucide-react";
import { useScrollReveal, useCountUp } from "@/hooks/use-scroll-reveal";

const Hero = () => {
  const { ref: statsRef, visible: statsVisible } = useScrollReveal(0.3);

  const totalProfit = useCountUp(347293, 2000, 0, statsVisible);
  const attachRate = useCountUp(642, 1800, 0, statsVisible);
  const today = useCountUp(2941, 1600, 0, statsVisible);

  return (
    <section className="min-h-screen flex flex-col items-center justify-center pt-16 px-6 relative overflow-hidden">
      {/* Subtle radial glow */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[500px] rounded-full opacity-30 pointer-events-none" style={{ background: "radial-gradient(ellipse, rgba(16,185,129,0.08) 0%, transparent 70%)" }} />
      
      <div className="max-w-3xl w-full text-center relative z-10">
        {/* Live badge */}
        <div className="inline-flex items-center gap-2.5 rounded-full border border-border bg-card px-4 py-1.5 text-[12px] text-secondary-foreground mb-8 animate-fade-up">
          <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse-dot" />
          Live across 18 brands right now
        </div>

        {/* Headline */}
        <h1 className="font-tight font-extrabold text-[42px] md:text-[60px] leading-[1.02] tracking-[-1.5px] text-foreground mb-5 animate-fade-up" style={{ animationDelay: "0.1s" }}>
          Generate 5-15% More Profit<br />From Every Order.
        </h1>

        {/* Subhead */}
        <p className="text-lg md:text-xl text-secondary-foreground mb-12 animate-fade-up" style={{ animationDelay: "0.2s" }}>
          Without changing your ads, traffic, or product.
        </p>

        {/* Live stats card */}
        <div ref={statsRef} className="border border-border rounded-xl bg-card p-8 md:p-10 mb-10 glow-sm animate-fade-up" style={{ animationDelay: "0.3s" }}>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3 md:gap-8">
            <div>
              <p className="stat-number text-[28px] md:text-[36px] leading-none">${totalProfit.toLocaleString()}</p>
              <p className="text-[10px] md:text-[11px] font-medium uppercase tracking-wider text-muted-foreground mt-2">Total Profit Generated</p>
            </div>
            <div className="border-t md:border-t-0 md:border-l md:border-r border-border pt-6 md:pt-0 md:px-8">
              <p className="stat-number text-[28px] md:text-[36px] leading-none">{(attachRate / 10).toFixed(1)}%</p>
              <p className="text-[10px] md:text-[11px] font-medium uppercase tracking-wider text-muted-foreground mt-2">Attach Rate</p>
            </div>
            <div className="border-t md:border-t-0 border-border pt-6 md:pt-0">
              <p className="stat-number text-[28px] md:text-[36px] leading-none">+${today.toLocaleString()}</p>
              <p className="text-[10px] md:text-[11px] font-medium uppercase tracking-wider text-muted-foreground mt-2">Today</p>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="animate-fade-up" style={{ animationDelay: "0.4s" }}>
          <a
            href="https://calendly.com/aovmax/30min"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-primary text-primary-foreground font-semibold px-8 py-3.5 rounded-md hover:brightness-110 transition-all text-sm"
          >
            See How It Works <ArrowRight className="h-4 w-4" />
          </a>

          <p className="text-[12px] text-muted-foreground mt-5">
            Trusted by brands doing $100k–$5M/month
          </p>
        </div>
      </div>

    </section>
  );
};

export default Hero;
