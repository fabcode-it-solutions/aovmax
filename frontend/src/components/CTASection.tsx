import { ArrowRight } from "lucide-react";
import { useScrollReveal } from "@/hooks/use-scroll-reveal";

const CTASection = () => {
  const { ref, visible } = useScrollReveal();

  return (
    <section className="py-28 border-t border-border">
      <div ref={ref} className={`container mx-auto px-6 text-center transition-all duration-700 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
        <div className="max-w-2xl mx-auto">
          <p className="section-label mb-6">GET STARTED</p>
          <h2 className="font-tight font-extrabold text-[36px] md:text-[48px] tracking-[-1px] text-foreground mb-5 leading-[1.05]">
            Most brands leave 5-15% profit on the table every month.
          </h2>
          <p className="text-xl text-secondary-foreground italic mb-6">We help you keep it.</p>
          <p className="text-sm text-secondary-foreground leading-relaxed mb-10 max-w-lg mx-auto">
            Book a 15-minute call. We'll show you exactly what we'd build for your store and how much profit you're currently missing.
          </p>
          <a
            href="https://calendly.com/aovmax/30min"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-primary text-primary-foreground font-semibold px-8 py-3.5 rounded-md hover:brightness-110 transition-all text-sm"
          >
            Book a Call <ArrowRight className="h-4 w-4" />
          </a>
          <p className="text-[12px] text-muted-foreground mt-5">
            Average profit increase: $8K–$12K/month · 100% performance-based
          </p>
        </div>
      </div>
    </section>
  );
};

export default CTASection;
