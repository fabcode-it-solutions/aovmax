import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import aovmaxLogo from "@/assets/aovmax-logo.svg";

const Navbar = () => {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-border" style={{ background: "rgba(10,10,10,0.92)", backdropFilter: "blur(12px)" }}>
      <div className="container mx-auto flex items-center justify-between h-16 px-6">
        <img src={aovmaxLogo} alt="AOVMAX" className="h-[144px]" />
        <div className="hidden md:flex items-center gap-8">
          <a href="#system" className="text-[13px] font-medium text-secondary-foreground hover:text-foreground transition-colors">The System</a>
          <a href="#proof" className="text-[13px] font-medium text-secondary-foreground hover:text-foreground transition-colors">Proof</a>
          <a href="#how" className="text-[13px] font-medium text-secondary-foreground hover:text-foreground transition-colors">How It Works</a>
          <a href="#faq" className="text-[13px] font-medium text-secondary-foreground hover:text-foreground transition-colors">FAQ</a>
        </div>
        <div className="flex items-center gap-3">
          <a
            href="https://calendly.com/aovmax/30min"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-primary text-primary-foreground text-[13px] font-semibold px-5 py-2.5 rounded-md hover:brightness-110 transition-all"
          >
            Book a Call <ArrowRight className="h-3.5 w-3.5" />
          </a>
          <Link
            to="/login"
            className="inline-flex items-center gap-2 bg-primary text-primary-foreground text-[13px] font-semibold px-5 py-2.5 rounded-md hover:brightness-110 transition-all"
          >
            Login
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
