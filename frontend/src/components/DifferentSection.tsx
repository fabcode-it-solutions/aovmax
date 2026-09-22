import { useScrollReveal } from "@/hooks/use-scroll-reveal";

const cards = [
  { num: "01", title: "No Setup Work", body: "We install everything. You approve the offers. That's it." },
  { num: "02", title: "Continuous Optimization", body: "We test new offers, pricing, and copy every single week." },
  { num: "03", title: "Performance-Based Pricing", body: "You pay nothing unless the system generates profit." },
  { num: "04", title: "Full Transparency", body: "Real-time dashboard shows every order, every upsell, every dollar." },
];


const DifferentSection = () => {
  const { ref, visible } = useScrollReveal();

  return (
    <section id="how" className="py-28 border-t border-border">
      <div ref={ref} className={`container mx-auto px-6 transition-all duration-700 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
        <div className="text-center mb-16">
          <p className="section-label mb-4">HOW IT'S DIFFERENT</p>
          <h2 className="font-tight font-extrabold text-[36px] md:text-[48px] tracking-[-1px] text-foreground">
            We don't just give you software.<br className="hidden md:block" /> We run it for you.
          </h2>
        </div>

        <div className="grid md:grid-cols-2 gap-4 mb-4">
          {cards.map((card, i) => (
            <div
              key={card.title}
              className={`bg-card border border-border rounded-xl p-7 group hover:border-primary/20 transition-all duration-600 relative overflow-hidden ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}
              style={{ transitionDelay: `${200 + i * 100}ms` }}
            >
              <div className="absolute left-0 top-0 bottom-0 w-[2px] bg-primary" />
              <div className="flex items-center gap-3 mb-4">
                <span className="stat-number text-[12px]">{card.num}</span>
                <div className="h-px flex-1 bg-border" />
              </div>
              <h3 className="font-semibold text-foreground text-lg mb-2">{card.title}</h3>
              <p className="text-sm text-secondary-foreground leading-relaxed">{card.body}</p>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};

export default DifferentSection;
