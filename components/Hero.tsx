import React from 'react';
import { ChevronRight } from 'lucide-react';
import { ViewState } from '../App';

interface HeroProps {
  onNavigate: (view: ViewState, scrollId?: string) => void;
}

const Hero: React.FC<HeroProps> = ({ onNavigate }) => {
  return (
    <section
      id="hero"
      className="relative min-h-[100svh] flex items-center overflow-hidden bg-[#020617] antialiased"
    >
      {/* BACKGROUND IMAGE LAYER */}
      <div className="absolute inset-0 z-0">
        <img
          src="/images/hero-bg-highres.jpg" 
          className="w-full h-full object-cover object-center brightness-[0.45] contrast-[1.1] saturate-[1.1]"
          style={{ imageRendering: 'high-quality' }}
          alt="Premium Joinery and Carpentry London"
          loading="eager"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#020617]/70 via-[#020617]/30 to-transparent" />
      </div>

      {/* MAIN CONTENT CONTAINER */}
      <div className="relative z-10 w-full pl-6 sm:pl-10 md:pl-14 lg:pl-16 pt-20">
        <div className="flex flex-col items-start">
          
          {/* HEADING GROUP WITH INTEGRATED ACCENT LINE */}
          <div className="relative group">
            {/* THE ORANGE LINE 
               - Positioned relative to the H1 height
               - -left matches parent padding to stay on the screen edge
            */}
            <div 
              className="absolute -left-6 sm:-left-10 md:-left-14 lg:-left-16 top-0 bottom-0 w-[10px] md:w-[12px] bg-[#d97706] shadow-[10px_0_30px_rgba(217,119,6,0.5)] animate-fade-in translate-x-[-4px]" 
            />

            <h1 
              className="text-[52px] sm:text-[75px] md:text-[95px] lg:text-[118px] font-[900] text-white leading-[0.82] tracking-[-0.04em] uppercase animate-fade-up antialiased subpixel-antialiased"
              style={{ textShadow: '0 4px 30px rgba(0,0,0,0.6)' }}
            >
              Bespoke <br />
              Carpentry <br />
              <span className="text-[#d97706]">&amp;</span> Joinery <br />
              London
            </h1>
          </div>

          <p className="mt-8 text-lg md:text-xl text-slate-200 font-medium max-w-xl animate-fade-up delay-200 antialiased">
            Designed, built and installed across London.
          </p>

          {/* ACTION BUTTONS */}
          <div className="mt-12 flex flex-wrap gap-5 animate-fade-up delay-300">
            <button
              onClick={() => onNavigate('home', 'contact')}
              className="px-10 py-5 bg-[#d97706] text-white font-[900] uppercase tracking-[0.15em] text-[12px] hover:bg-[#b45309] transition-all flex items-center justify-center gap-3 group shadow-2xl antialiased"
            >
              Get Quote <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </button>

            <button
              onClick={() => onNavigate('portfolio-archive')}
              className="px-10 py-5 bg-white/10 backdrop-blur-md border border-white/10 text-white font-[900] uppercase tracking-[0.15em] text-[12px] hover:bg-white/20 transition-all active:scale-95 antialiased"
            >
              View Work
            </button>
          </div>
        </div>
      </div>

      {/* Subtle bottom-right branding */}
      <div className="absolute right-10 bottom-10 hidden lg:block">
        <div className="flex items-center gap-4 rotate-90 origin-right translate-x-12">
          <span className="text-white/20 uppercase tracking-[0.4em] text-[10px] font-bold antialiased">Structure & Style</span>
          <div className="w-16 h-[1px] bg-white/20" />
        </div>
      </div>
    </section>
  );
};

export default Hero;