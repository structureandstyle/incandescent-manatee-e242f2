import React, { useState, useEffect, useCallback } from 'react';
import { ArrowLeft, Maximize2, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { PROJECTS } from '../constants';

interface PortfolioArchiveProps {
  onBack: () => void;
}

const PortfolioArchive: React.FC<PortfolioArchiveProps> = ({ onBack }) => {
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);

  const handleNext = useCallback(() => {
    setSelectedIdx((prev) => (prev !== null ? (prev + 1) % PROJECTS.length : null));
  }, []);

  const handlePrev = useCallback(() => {
    setSelectedIdx((prev) => (prev !== null ? (prev - 1 + PROJECTS.length) % PROJECTS.length : null));
  }, []);

  // 1. LOCK SCROLLING when an image is selected (Lightbox open)
  useEffect(() => {
    if (selectedIdx !== null) {
      document.body.style.overflow = 'hidden';
    } else {
      // Re-enable overflow when closed
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [selectedIdx]);

  // 2. Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (selectedIdx === null) return;
      if (e.key === 'ArrowRight') handleNext();
      if (e.key === 'ArrowLeft') handlePrev();
      if (e.key === 'Escape') setSelectedIdx(null);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedIdx, handleNext, handlePrev]);

  return (
    <div className={`min-h-screen bg-slate-950 pt-40 pb-12 relative ${selectedIdx !== null ? 'overflow-hidden h-screen' : ''}`}>
      <div className="max-w-[1600px] mx-auto px-6">

        {/* Navigation: Close Gallery */}
        <div className="mb-12">
          <button
            onClick={(e) => {
              e.preventDefault();
              onBack();
            }}
            className="group flex items-center gap-4 text-slate-400 hover:text-white transition-all"
          >
            <div className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center group-hover:bg-amber-600 group-hover:border-amber-600 transition-all">
              <ArrowLeft size={18} />
            </div>
            <span className="text-[10px] font-black uppercase tracking-[0.5em]">Close Gallery</span>
          </button>
        </div>

        {/* Gallery Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {PROJECTS.map((project, idx) => (
            <div
              key={project.id}
              className="group relative aspect-square overflow-hidden cursor-pointer bg-slate-900"
              onClick={() => setSelectedIdx(idx)}
            >
              <img
                src={project.imageUrl}
                alt={project.alt} // ✅ use ALT text (SEO + accessibility)
                className="w-full h-full object-cover transition-all duration-[1.5s] group-hover:scale-110"
                loading="lazy"
                decoding="async"
              />
              <div className="absolute inset-0 border border-white/0 group-hover:border-white/20 group-hover:inset-4 transition-all duration-500 pointer-events-none z-20" />
              <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-10" />
              <div className="absolute inset-0 flex items-center justify-center z-30 opacity-0 group-hover:opacity-100 transition-all">
                <div className="w-12 h-12 rounded-full bg-amber-600 flex items-center justify-center shadow-xl">
                  <Maximize2 size={20} className="text-white" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Lightbox Overlay */}
      {selectedIdx !== null && (
        <div
          className="fixed inset-0 z-[100000] bg-slate-950/98 backdrop-blur-2xl flex flex-col items-center justify-center overflow-hidden"
          onClick={() => setSelectedIdx(null)}
          onWheel={(e) => e.stopPropagation()}
          onTouchMove={(e) => e.stopPropagation()}
        >
          {/* THE FIXED X BUTTON - Adjusted top position to clear headers */}
          <button
            onClick={(e) => { e.stopPropagation(); setSelectedIdx(null); }}
            className="fixed top-12 right-6 md:top-24 md:right-12 z-[100001] w-12 h-12 flex items-center justify-center bg-white/10 border border-white/10 rounded-full text-white hover:bg-amber-600 hover:border-amber-600 transition-all shadow-2xl"
          >
            <X size={24} />
          </button>

          <div className="relative w-full max-w-5xl px-6 flex flex-col items-center" onClick={e => e.stopPropagation()}>
            <img
              src={PROJECTS[selectedIdx].imageUrl}
              alt={PROJECTS[selectedIdx].alt} // ✅ use ALT text in lightbox too
              className="max-h-[70vh] w-auto shadow-2xl mb-8 animate-in fade-in zoom-in-95 duration-300 rounded-sm"
              decoding="async"
            />

            <div className="text-center">
              <h3 className="text-white text-sm font-black uppercase tracking-[0.4em] mb-2">
                {PROJECTS[selectedIdx].title}
              </h3>
              <p className="text-amber-500 text-[10px] font-bold uppercase tracking-[0.2em]">
                Project {selectedIdx + 1} of {PROJECTS.length}
              </p>
            </div>

            {/* Nav Arrows */}
            <button
              onClick={(e) => { e.stopPropagation(); handlePrev(); }}
              className="absolute left-[-15px] md:left-[-80px] top-1/2 -translate-y-1/2 text-white/30 hover:text-white transition-all p-4"
            >
              <ChevronLeft size={60} strokeWidth={1} />
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); handleNext(); }}
              className="absolute right-[-15px] md:right-[-80px] top-1/2 -translate-y-1/2 text-white/30 hover:text-white transition-all p-4"
            >
              <ChevronRight size={60} strokeWidth={1} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PortfolioArchive;