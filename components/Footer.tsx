import React from 'react';
import { ViewState } from '../App';

interface FooterProps {
  onNavigate: (view: ViewState, id?: string) => void;
}

const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-slate-950 text-white py-16 md:py-24 border-t border-white/5">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex flex-col md:flex-row justify-between items-start gap-16 md:gap-24">

          {/* Brand Info */}
          <div className="max-w-2xl space-y-8">
            <div className="flex flex-col">
              <h2 className="text-3xl md:text-5xl font-black tracking-tighter uppercase leading-none">
                Structure<span className="text-amber-500 italic">&</span>style
              </h2>
            </div>

            <p className="text-slate-400 text-lg md:text-xl font-light leading-relaxed">
              Structure & Style is a London-based bespoke carpentry and interiors company specialising in fitted furniture, custom storage, and detailed interior joinery. We deliver high-quality finishes that enhance everyday living.
            </p>

            <div className="space-y-2 text-slate-500 text-sm font-medium">
              <p>Structure & Style Ltd</p>
              <p>London, United Kingdom</p>
              <p>Email: <a href="mailto:info@structureandstyle.co.uk" className="text-slate-300 hover:text-amber-500 transition-colors cursor-pointer">info@structureandstyle.co.uk</a></p>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex flex-col gap-4 min-w-[150px]">
            <h4 className="text-[10px] font-black uppercase tracking-[0.5em] text-slate-600 mb-2">Explore</h4>
            
            <button
              onClick={() => {
                onNavigate('home');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="text-xs font-black uppercase tracking-[0.3em] text-slate-400 hover:text-white transition-colors text-left"
            >
              Home
            </button>
            
            <button
              onClick={() => onNavigate('portfolio-archive')}
              className="text-xs font-black uppercase tracking-[0.3em] text-slate-400 hover:text-white transition-colors text-left"
            >
              Portfolio
            </button>
            
            <button
              onClick={() => onNavigate('home', 'services')}
              className="text-xs font-black uppercase tracking-[0.3em] text-slate-400 hover:text-white transition-colors text-left"
            >
              Services
            </button>
            
            <button
              onClick={() => onNavigate('home', 'contact')}
              className="text-xs font-black uppercase tracking-[0.3em] text-slate-400 hover:text-amber-500 transition-colors text-left"
            >
              Contact
            </button>
          </nav>
        </div>

        <div className="mt-20 pt-8 border-t border-white/5">
          <p className="text-[10px] text-slate-600 font-bold uppercase tracking-[0.4em]">
            &copy; {currentYear} STRUCTURE AND STYLE LTD. ALL RIGHTS RESERVED.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;