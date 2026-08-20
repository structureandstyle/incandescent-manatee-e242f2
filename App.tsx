import React, { useState, useEffect, useRef } from 'react';
import { Header } from './components/Header';
import Hero from './components/Hero';
import Services from './components/Services';
import Stats from './components/Stats';
import Process from './components/Process';
import Portfolio from './components/Portfolio';
import Testimonials from './components/Testimonials';
import Contact from './components/Contact';
import Footer from './components/Footer';
import PortfolioArchive from './components/PortfolioArchive';
import { ChevronUp } from 'lucide-react';

export type ViewState = 'home' | 'portfolio-archive';

const App: React.FC = () => {
  const [view, setView] = useState<ViewState>('home');
  const [activeSection, setActiveSection] = useState('hero');
  const archiveContainerRef = useRef<HTMLDivElement>(null);

  // Back-to-top visibility
  const [showBackToTop, setShowBackToTop] = useState(false);

  // Handle body scroll locking to prevent the background from moving
  useEffect(() => {
    if (view === 'portfolio-archive') {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
  }, [view]);

  // Scroll spy logic + back-to-top toggle
  useEffect(() => {
    const handleScroll = () => {
      if (view !== 'home') return;

      // Toggle back-to-top button after some scroll
      setShowBackToTop(window.scrollY > 500);

      const sections = ['hero', 'services', 'portfolio', 'testimonials', 'contact'];
      const scrollPosition = window.scrollY + 100;

      for (const section of sections) {
        const element = document.getElementById(section);
        if (
          element &&
          scrollPosition >= element.offsetTop &&
          scrollPosition < element.offsetTop + element.offsetHeight
        ) {
          setActiveSection(section);
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll(); // set initial state on load/refresh

    return () => window.removeEventListener('scroll', handleScroll);
  }, [view]);

  // If not on home, hide the button
  useEffect(() => {
    if (view !== 'home') setShowBackToTop(false);
  }, [view]);

  const closeArchive = (returnToId: string = 'portfolio') => {
    setView('home');

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        const el = document.getElementById(returnToId);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        } else {
          window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
        }
      });
    });
  };

  const navigateTo = (newView: ViewState, scrollToId?: string) => {
    if (scrollToId) {
      if (view === 'portfolio-archive') setView('home');

      setTimeout(() => {
        const element = document.getElementById(scrollToId);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 100);

      return;
    }

    setView(newView);

    // If we are opening the gallery, force it to the top.
    if (newView === 'portfolio-archive') {
      setTimeout(() => {
        if (archiveContainerRef.current) {
          archiveContainerRef.current.scrollTo({
            top: 0,
            left: 0,
            behavior: 'auto'
          });
        }
      }, 100);
    }
  };

  const handleBackToTop = () => {
    window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-white relative">
      {/* HEADER */}
      <div className="fixed top-0 left-0 w-full z-[99999] pointer-events-none">
        <div className="pointer-events-auto">
          <Header
            activeSection={activeSection}
            currentView={view}
            onNavigate={navigateTo}
          />
        </div>
      </div>

      {/* BACK TO TOP BUTTON (floating, bottom-right, visible on dark backgrounds) */}
      <button
        onClick={handleBackToTop}
        aria-label="Back to top"
        className={`
          fixed bottom-8 right-8 z-[99998]
          w-12 h-12 rounded-full
          flex items-center justify-center

          bg-white/90 text-slate-900
          backdrop-blur-md border border-white/40
          shadow-xl

          hover:bg-amber-500 hover:text-black
          transition-all duration-300 ease-out

          ${showBackToTop && view === 'home'
            ? 'opacity-100 translate-y-0'
            : 'opacity-0 translate-y-3 pointer-events-none'}
        `}
      >
        <ChevronUp size={24} strokeWidth={3} />
      </button>

      <main className="relative">
        {/* HOME SECTIONS */}
        <div className={view === 'portfolio-archive' ? 'pointer-events-none opacity-50' : ''}>
          <section id="hero"><Hero onNavigate={navigateTo} /></section>
          <section id="services"><Services /></section>
          <Stats />
          <Process />
          <section id="portfolio"><Portfolio onNavigate={navigateTo} /></section>
          <section id="testimonials"><Testimonials /></section>
          <section id="contact"><Contact /></section>
          <Footer onNavigate={navigateTo} />
        </div>

        {/* GALLERY OVERLAY */}
        <div
          ref={archiveContainerRef}
          className={`fixed inset-0 z-[99990] bg-slate-950 transition-all duration-500 ease-in-out overflow-y-auto ${
            view === 'portfolio-archive'
              ? 'translate-y-0 opacity-100'
              : 'translate-y-full opacity-0 pointer-events-none'
          }`}
        >
          {view === 'portfolio-archive' && (
            <PortfolioArchive onBack={() => closeArchive('portfolio')} />
          )}
        </div>
      </main>
    </div>
  );
};

export default App;