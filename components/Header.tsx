import React, { useState, useEffect } from 'react';
import { Menu, X } from 'lucide-react';
import { ViewState } from '../App';

interface HeaderProps {
  activeSection: string;
  currentView: ViewState;
  onNavigate: (view: ViewState, scrollId?: string) => void;
}

export const Header: React.FC<HeaderProps> = ({ activeSection, currentView, onNavigate }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = 'hidden';
      document.body.style.touchAction = 'none';
    } else {
      document.body.style.overflow = 'unset';
      document.body.style.touchAction = 'auto';
    }
    return () => {
      document.body.style.overflow = 'unset';
      document.body.style.touchAction = 'auto';
    };
  }, [isMenuOpen]);

  const navLinks = [
    { name: 'Services', id: 'services' },
    { name: 'Portfolio', id: 'portfolio' },
    { name: 'Reviews', id: 'testimonials' },
    { name: 'Contact', id: 'contact' },
  ];

  const handleLinkClick = (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    setIsMenuOpen(false);
    onNavigate('home', id);
  };

  const handleLogoClick = () => {
    setIsMenuOpen(false);
    onNavigate('home');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const scrolled = isScrolled || currentView !== 'home' || isMenuOpen;

  return (
    <>
      <header
        style={{ WebkitBackfaceVisibility: 'hidden', backfaceVisibility: 'hidden' }}
        className={`fixed top-0 left-0 right-0 z-[1000]
          border-b border-transparent
          transition-[background-color,backdrop-filter,padding,box-shadow] duration-500 ease-in-out
          ${scrolled
            ? 'bg-slate-950/98 backdrop-blur-xl py-3 shadow-2xl border-white/5'
            : 'bg-transparent py-6 md:py-8'
          }`}
      >
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between relative z-[1002]">
          {/* Logo */}
          <button onClick={handleLogoClick} className="flex items-center gap-3 shrink-0 group">
            <div className="bg-white rounded-lg p-1 flex items-center justify-center transition-transform group-hover:rotate-6 shadow-lg">
              <img
                src="/images/logo.png"
                alt="Structure & Style Logo"
                className="w-8 h-8 md:w-10 md:h-10 object-contain"
              />
            </div>
            <div className="flex flex-col text-left">
              <span className="text-white font-black text-lg md:text-xl leading-none tracking-tighter uppercase drop-shadow-[0_2px_4px_rgba(0,0,0,0.3)]">
                STRUCTURE<span className="text-amber-500 italic"> & </span>STYLE
              </span>
            </div>
          </button>

          {/* Desktop Nav */}
          <nav className="hidden lg:flex items-center gap-10">
            {navLinks.map((link) => (
              <button
                key={link.id}
                onClick={(e) => handleLinkClick(e, link.id)}
                className={`text-[10px] font-black uppercase tracking-[0.3em] transition-all hover:text-amber-500 hover:translate-y-[-1px] drop-shadow-sm ${
                  activeSection === link.id && currentView === 'home' ? 'text-amber-500' : 'text-slate-400'
                }`}
              >
                {link.name}
              </button>
            ))}

            <button
              onClick={() => onNavigate('home', 'contact')}
              className="px-8 py-3 bg-amber-600 text-white text-[10px] font-black uppercase tracking-[0.2em] hover:bg-amber-500 transition-all shadow-xl shadow-amber-900/20 active:scale-95"
            >
              Get Quote
            </button>
          </nav>

          {/* Mobile Controls */}
          <div className="lg:hidden flex items-center gap-3">
            <button
              className="flex items-center justify-center text-white w-12 h-12 bg-white/5 rounded-full transition-all hover:bg-white/10 active:scale-90 relative z-[1003]"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      <div
        className={`fixed inset-0 z-[999] bg-slate-950 flex flex-col transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] lg:hidden ${
          isMenuOpen ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0 pointer-events-none'
        }`}
        style={{ height: '100dvh' }}
      >
        <div className="flex-1 flex flex-col items-center justify-center gap-8 px-6 pt-24 pb-12 overflow-y-auto">
          {navLinks.map((link, idx) => (
            <button
              key={link.id}
              onClick={(e) => handleLinkClick(e, link.id)}
              className={`w-full text-center text-4xl font-black text-white uppercase tracking-tighter hover:text-amber-500 transition-all duration-300 transform ${
                isMenuOpen ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
              }`}
              style={{ transitionDelay: isMenuOpen ? `${150 + idx * 60}ms` : '0ms' }}
            >
              {link.name}
            </button>
          ))}

          <div
            className={`w-full max-w-xs mt-4 pt-8 border-t border-white/10 transition-all duration-500 transform ${
              isMenuOpen ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
            }`}
            style={{ transitionDelay: isMenuOpen ? '450ms' : '0ms' }}
          >
            <button
              onClick={() => {
                onNavigate('home', 'contact');
                setIsMenuOpen(false);
              }}
              className="w-full py-5 bg-amber-600 text-white font-black uppercase tracking-widest text-xs shadow-2xl active:scale-95 hover:bg-amber-500 transition-colors"
            >
              Request A Quote
            </button>
          </div>
        </div>

        <div
          className={`p-10 text-center transition-all duration-700 ${isMenuOpen ? 'opacity-40' : 'opacity-0'}`}
          style={{ transitionDelay: '600ms' }}
        >
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.6em]">London's Finest Woodwork</p>
          <p className="text-[8px] font-bold text-slate-600 uppercase tracking-[0.4em] mt-2">
            STRUCTURE & STYLE JOINERY &copy; 2025
          </p>
        </div>
      </div>
    </>
  );
};