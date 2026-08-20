import React, { useEffect, useRef, useState } from 'react';
import { ClipboardList, PencilRuler, Hammer, CheckCircle } from 'lucide-react';

const STEPS = [
  {
    title: 'Consultation',
    description: 'Discuss ideas, space and requirements',
    icon: <ClipboardList />
  },
  {
    title: 'Design & Planning',
    description: 'Finalise details and provide a clear quote',
    icon: <PencilRuler />
  },
  {
    title: 'Build & Installation',
    description: 'Precise, professional installation',
    icon: <Hammer />
  },
  {
    title: 'Completion',
    description: 'Final checks to ensure high-quality finish',
    icon: <CheckCircle />
  }
];

const Process: React.FC = () => {
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
      ref={sectionRef} 
      className="py-16 md:py-32 bg-white overflow-hidden relative"
    >
      {/* Decorative background pattern */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none select-none">
        <div 
          className="absolute top-0 left-0 w-full h-full" 
          style={{ backgroundImage: 'radial-gradient(#92400e 1px, transparent 1px)', backgroundSize: '40px 40px' }}
        ></div>
      </div>

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className={`text-center mb-16 md:mb-24 transition-all duration-1000 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
          <h2 className="text-[10px] font-black text-amber-700 uppercase tracking-[0.4em] mb-4">Execution</h2>
          <p className="text-4xl md:text-7xl font-black text-slate-900 tracking-tighter uppercase leading-[0.9]">
            Our Process – <br className="hidden md:block" /> From Design to Installation
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 relative">
          {/* Connecting line (Desktop Only) */}
          <div className={`hidden lg:block absolute top-12 left-[12.5%] right-[12.5%] h-px bg-slate-200 -z-10 transition-all duration-[2s] delay-500 ${isVisible ? 'opacity-100 scale-x-100' : 'opacity-0 scale-x-0'} origin-left`}></div>

          {STEPS.map((step, idx) => (
            <div
              key={idx}
              className={`flex flex-col items-center text-center group p-8 rounded-[2rem] border border-slate-100 bg-white hover:border-amber-200 hover:shadow-2xl hover:shadow-amber-900/10 transition-all duration-500 cursor-default`}
              style={{
                transitionDelay: `${idx * 200}ms`,
                opacity: isVisible ? 1 : 0,
                transform: isVisible ? 'translateY(0)' : 'translateY(40px)'
              }}
            >
              <div className="relative mb-8">
                <div className="absolute inset-0 bg-amber-600 blur-2xl opacity-0 group-hover:opacity-20 transition-opacity duration-700"></div>
                <div className="relative w-20 h-20 rounded-2xl bg-slate-900 text-amber-500 flex items-center justify-center shadow-lg transition-all duration-500 group-hover:scale-110 group-hover:bg-amber-600 group-hover:text-white">
                  {React.cloneElement(step.icon as React.ReactElement, { size: 28, strokeWidth: 1.5 })}
                </div>
              </div>

              <div className="space-y-4">
                <span className="text-amber-700 font-black text-[9px] uppercase tracking-[0.3em]">Phase 0{idx + 1}</span>
                <h3 className="text-xl font-bold text-slate-900 group-hover:text-amber-900 transition-colors">{step.title}</h3>
                <p className="text-slate-500 text-sm leading-relaxed font-medium">
                  {step.description}
                </p>
                <div className="pt-4 flex justify-center">
                  <div className="w-8 h-1 bg-slate-100 group-hover:bg-amber-500/40 group-hover:w-16 transition-all duration-700 rounded-full"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Process;