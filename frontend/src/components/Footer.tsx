import aovmaxLogo from "@/assets/aovmax-logo.svg";

const Footer = () => {
  return (
    <footer className="py-10 border-t border-border">
      <div className="container mx-auto px-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <img src={aovmaxLogo} alt="AOVMAX" className="h-[120px]" />
          <div className="flex items-center gap-8">
            <a href="#system" className="text-[12px] text-muted-foreground hover:text-secondary-foreground transition-colors">The System</a>
            <a href="#proof" className="text-[12px] text-muted-foreground hover:text-secondary-foreground transition-colors">Proof</a>
            <a href="#how" className="text-[12px] text-muted-foreground hover:text-secondary-foreground transition-colors">How It Works</a>
            <a href="#faq" className="text-[12px] text-muted-foreground hover:text-secondary-foreground transition-colors">FAQ</a>
          </div>
          <p className="text-[11px] text-muted-foreground">
            © 2026 Reserve Relief LLC. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
