import React, { useEffect, useRef, useState } from 'react';
import { PROJECTS } from '../constants';
import { ViewState } from '../App';
import { ArrowUpRight, Plus, Hash } from 'lucide-react';

interface PortfolioProps {
  onNavigate: (view: ViewState) => void;
}

const Portfolio: React.FC<PortfolioProps> = ({ onNavigate }) => {
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(entry.target);
        }
      },
      { threshold: 0.1 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const displayProjects = PROJECTS.slice(0, 3);

  return (
    <section
      id="portfolio"
      ref={sectionRef}
      className={`bg-slate-950 py-16 md:py-32 border-t border-white/5 transition-all duration-1000 ${isVisible ? 'opacity-100' : 'opacity-0'}`}
    >
      <div className="max-w-[1400px] mx-auto px-6">
        
        {/* HEADER SECTION */}
        <div className={`flex flex-col md:flex-row md:items-end justify-between mb-12 md:mb-16 gap-6 transition-all duration-1000 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
          <div className="space-y-3">
            <p className="text-[10px] font-bold text-amber-500 uppercase tracking-[0.4em]">Collections</p>
            <p className="text-4xl md:text-7xl font-black text-white tracking-tighter uppercase leading-[0.85]">
              Portfolio
            </p>
          </div>
          
          <button
            onClick={() => onNavigate('portfolio-archive')}
            className="group flex items-center gap-4 text-[11px] font-black text-slate-500 uppercase tracking-[0.3em] hover:text-white transition-all w-fit"
          >
            <span className="relative">
              Explore Gallery
              <span className="absolute -bottom-1 left-0 w-0 h-px bg-amber-500 transition-all duration-500 group-hover:w-full"></span>
            </span>
            <div className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center group-hover:bg-amber-600 group-hover:border-amber-600 transition-all">
              <ArrowUpRight size={16} className="group-hover:text-white" />
            </div>
          </button>
        </div>

        {/* PROJECTS GRID */}
        <div className={`grid grid-cols-2 gap-2 md:gap-4 transition-all duration-1000 delay-300 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
          {displayProjects.map((project) => (
            <div
              key={project.id}
              className="relative aspect-square overflow-hidden cursor-pointer group bg-slate-900"
              onClick={() => onNavigate('portfolio-archive')}
            >
              <img
                src={project.imageUrl}
                alt={project.title}
                className="w-full h-full object-cover transition-all duration-[1.5s] ease-out group-hover:scale-105"
              />
              {/* THE INWARD BORDER EFFECT */}
              <div className="absolute inset-0 border border-white/0 group-hover:border-white/20 group-hover:inset-4 transition-all duration-500 pointer-events-none z-20" />
              
              <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-10" />
              
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-all duration-500 z-30 transform scale-75 group-hover:scale-100">
                <div className="w-12 h-12 rounded-full bg-amber-600/90 flex items-center justify-center border border-white/20">
                  <ArrowUpRight size={20} className="text-white" />
                </div>
              </div>
            </div>
          ))}

          {/* STUDIO INDEX / GALLERY CARD */}
          <div
            className="relative aspect-square overflow-hidden cursor-pointer bg-slate-950 border border-white/10 flex flex-col justify-between p-6 md:p-12 group transition-all duration-500"
            onClick={() => onNavigate('portfolio-archive')}
          >
            <div className="flex justify-between items-start relative z-10">
              <Hash size={20} className="text-slate-800 group-hover:text-amber-600 transition-colors" />
              <div className="w-12 h-12 rounded-full border border-white/5 flex items-center justify-center group-hover:bg-amber-600 group-hover:border-amber-600 transition-all duration-500">
                <Plus size={20} className="text-white group-hover:rotate-90 transition-transform duration-500" />
              </div>
            </div>

            <div className="space-y-4 relative z-10">
              <div className="flex flex-col">
                <p className="text-[10px] font-bold text-amber-500 uppercase tracking-[0.4em] mb-2">Projects</p>
                <h3 className="text-3xl md:text-6xl font-black text-white uppercase tracking-tighter leading-[0.85]">
                  Gallery
                </h3>
              </div>
              <p className="text-[9px] md:text-[11px] font-bold text-slate-500 uppercase tracking-[0.2em] leading-relaxed max-w-[280px]">
                A curated selection of our recent joinery and fitted furniture projects
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Portfolio;