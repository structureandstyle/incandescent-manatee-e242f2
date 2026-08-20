import React, { useEffect, useRef, useState } from 'react';
import { TESTIMONIALS } from '../constants';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const Testimonials: React.FC = () => {
  const [index, setIndex] = useState(0);
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

  const next = () => setIndex((prev) => (prev + 1) % TESTIMONIALS.length);
  const prev = () => setIndex((prev) => (prev - 1 + TESTIMONIALS.length) % TESTIMONIALS.length);

  return (
    <section 
      id="testimonials" 
      ref={sectionRef}
      className={`py-12 md:py-16 bg-white border-b border-slate-100 transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
    >
      <div className="max-w-4xl mx-auto px-6 text-center">
        
        {/* Sleek Minimal Header with Google Logo */}
        <div className="mb-6 flex flex-col items-center gap-2">
          <svg viewBox="0 0 24 24" className="w-5 h-5" xmlns="http://www.w3.org/2000/svg">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
          </svg>
          <div className="text-[10px] font-black text-slate-300 uppercase tracking-[0.5em]">
            Google Reviews
          </div>
        </div>

        <div className="min-h-[160px] md:min-h-[180px] flex items-center justify-center">
          <div key={index} className="animate-fade-in flex flex-col items-center">
            <blockquote className="text-lg md:text-xl font-light text-slate-700 leading-relaxed italic px-2">
              "{TESTIMONIALS[index].content}"
            </blockquote>

            {/* 5-Star Rating directly under review / above the name */}
            <div className="flex gap-0.5 mt-6 mb-2">
              {[...Array(5)].map((_, i) => (
                <svg key={i} className="w-3.5 h-3.5 text-amber-500 fill-amber-500" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              ))}
            </div>
            
            <div className="mt-4 flex items-center justify-center gap-3">
              <span className="h-px w-6 bg-amber-500/30" />
              <p className="text-[10px] font-black text-slate-900 uppercase tracking-widest">
                {TESTIMONIALS[index].name}
              </p>
              <span className="h-px w-6 bg-amber-500/30" />
            </div>
          </div>
        </div>

        {/* Navigation with the "Orange Thing" (Minimalist Indicator) */}
        <div className="mt-8 flex items-center justify-center gap-8">
          <button 
            onClick={prev} 
            className="p-2 text-slate-300 hover:text-amber-600 transition-colors active:scale-90"
            aria-label="Previous review"
          >
            <ChevronLeft size={20} />
          </button>

          {/* Sleek Dash Indicator */}
          <div className="flex gap-1.5">
            {TESTIMONIALS.map((_, i) => (
              <div 
                key={i} 
                className={`h-[2px] rounded-full transition-all duration-300 ${
                  i === index ? 'w-4 bg-amber-500' : 'w-1.5 bg-slate-200'
                }`}
              />
            ))}
          </div>

          <button 
            onClick={next} 
            className="p-2 text-slate-300 hover:text-amber-600 transition-colors active:scale-90"
            aria-label="Next review"
          >
            <ChevronRight size={20} />
          </button>
        </div>

      </div>
    </section>
  );
};

export default Testimonials;