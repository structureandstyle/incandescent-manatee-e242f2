import React, { useEffect, useRef, useState } from 'react';
import { SERVICES } from '../constants';

const Services: React.FC = () => {
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

  return (
    <section 
      id="services" 
      ref={sectionRef}
      className={`pt-20 md:pt-32 pb-16 bg-slate-950 transition-all duration-1000 ${isVisible ? 'opacity-100' : 'opacity-0'}`}
    >
      <div className="max-w-7xl mx-auto px-6">
        {/* Updated Header Section to match screenshot */}
        <div className={`flex items-center mb-12 transition-all duration-1000 delay-100 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
          <h2 className="text-[10px] font-black text-amber-500 uppercase tracking-[0.6em] whitespace-nowrap">What We Do</h2>
          <div className="h-px flex-1 ml-8 bg-white/10"></div>
        </div>

        {/* Updated Main Description text from screenshot */}
        <div className={`max-w-4xl mb-24 transition-all duration-1000 delay-200 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
          <p className="text-slate-300 text-xl md:text-3xl font-light leading-relaxed">
            Structure & Style designs, builds and installs <span className="text-white font-medium">bespoke fitted furniture</span> and interior joinery across London, combining precision craftsmanship with practical design for residential and commercial spaces.
          </p>
        </div>

        {/* Service Grid with updated content from screenshots */}
        <div className={`grid grid-cols-1 md:grid-cols-3 gap-px bg-white/5 border border-white/5 transition-all duration-1000 delay-300 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
          {SERVICES.map((s) => (
            <div 
              key={s.id} 
              className="bg-slate-950 p-8 md:p-16 hover:bg-slate-900 transition-all duration-700 flex flex-col min-h-[400px] group relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-amber-600/0 group-hover:bg-amber-600/[0.03] transition-colors duration-700" />
              
              <div className="text-amber-600 group-hover:text-amber-500 group-hover:scale-110 transition-all duration-500 relative z-10 mb-12">
                {React.cloneElement(s.icon as React.ReactElement, { size: 40, strokeWidth: 1 })}
              </div>
              
              <div className="mt-auto relative z-10">
                <h3 className="text-lg md:text-xl font-black text-white uppercase tracking-[0.15em] group-hover:text-amber-500 transition-colors mb-4 leading-tight">
                  {s.title}
                </h3>
                {/* Updated description text styling to match the screenshot's professional look */}
                <p className="text-[11px] md:text-xs text-slate-400 font-bold uppercase tracking-[0.2em] leading-relaxed group-hover:text-slate-300 transition-colors duration-500">
                  {s.description}
                </p>
                <div className="mt-8 w-12 h-[2px] bg-amber-600 group-hover:w-20 group-hover:bg-amber-500 transition-all duration-700" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Services;