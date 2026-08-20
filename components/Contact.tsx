import React, { useEffect, useRef, useState } from 'react';
import { Mail, Phone, MessageSquare } from 'lucide-react';

const Contact: React.FC = () => {
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
      id="contact" 
      ref={sectionRef}
      className={`py-16 md:py-24 bg-slate-950 relative scroll-mt-20 overflow-hidden transition-all duration-1000 ${isVisible ? 'opacity-100' : 'opacity-0'}`}
    >
      <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-amber-600/10 blur-[120px] pointer-events-none transition-opacity duration-[2s] ${isVisible ? 'opacity-100' : 'opacity-0'}`} />

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="max-w-3xl mx-auto text-center">
          <div className={`space-y-4 mb-12 transition-all duration-1000 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
            <h2 className="text-[10px] font-black text-amber-500 uppercase tracking-[0.4em]">Inquiry</h2>
            <p className="text-4xl md:text-6xl font-black text-white tracking-tighter leading-[1.1] uppercase">
              Start Your <span className="text-amber-600 italic">Consultation</span>
            </p>
            <p className="text-slate-400 text-sm md:text-base leading-relaxed max-w-xl mx-auto font-light">
              Every project is carefully planned, built with durable materials, and installed with a clean, professional finish. Discuss your bespoke project directly with Kas and Uwe.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <a 
              href="tel:07309872555" 
              className={`group flex flex-row md:flex-col items-center gap-5 p-5 bg-white/5 border border-white/10 hover:border-amber-600/50 hover:bg-white/[0.07] transition-all duration-1000 ${isVisible ? 'translate-x-0 opacity-100' : '-translate-x-10 opacity-0'} delay-200`}
            >
              <div className="w-10 h-10 md:w-12 md:h-12 flex items-center justify-center bg-white/5 text-amber-500 rounded-full group-hover:bg-amber-600 group-hover:text-white transition-all shrink-0">
                <Phone size={18} />
              </div>
              <div className="text-left md:text-center overflow-hidden">
                <span className="block text-[8px] font-black text-slate-500 uppercase tracking-widest mb-1">Direct Line</span>
                <span className="text-sm md:text-base font-bold text-white block">07309872555</span>
              </div>
            </a>

            <a 
              href="https://wa.me/447309872555" 
              target="_blank" 
              rel="noopener noreferrer" 
              className={`group flex flex-row md:flex-col items-center gap-5 p-5 bg-white/5 border border-white/10 hover:border-green-500/50 hover:bg-white/[0.07] transition-all duration-1000 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'} delay-400`}
            >
              <div className="w-10 h-10 md:w-12 md:h-12 flex items-center justify-center bg-white/5 text-green-500 rounded-full group-hover:bg-green-600 group-hover:text-white transition-all shrink-0">
                <MessageSquare size={18} />
              </div>
              <div className="text-left md:text-center overflow-hidden">
                <span className="block text-[8px] font-black text-slate-500 uppercase tracking-widest mb-1">WhatsApp Chat</span>
                <span className="text-sm md:text-base font-bold text-white block">Message Now</span>
              </div>
            </a>

            <a 
              href="mailto:info@structureandstyle.co.uk" 
              className={`group flex flex-row md:flex-col items-center gap-5 p-5 bg-white/5 border border-white/10 hover:border-amber-600/50 hover:bg-white/[0.07] transition-all duration-1000 ${isVisible ? 'translate-x-0 opacity-100' : 'translate-x-10 opacity-0'} delay-600`}
            >
              <div className="w-10 h-10 md:w-12 md:h-12 flex items-center justify-center bg-white/5 text-amber-500 rounded-full group-hover:bg-amber-600 group-hover:text-white transition-all shrink-0">
                <Mail size={18} />
              </div>
              <div className="text-left md:text-center overflow-hidden">
                <span className="block text-[8px] font-black text-slate-500 uppercase tracking-widest mb-1">Email Brief</span>
                <span className="text-sm md:text-base font-bold text-white block truncate">info@structureandstyle.co.uk</span>
              </div>
            </a>
          </div>

          <div className={`mt-12 flex flex-col items-center gap-4 transition-all duration-1000 delay-700 ${isVisible ? 'opacity-100' : 'opacity-0'}`}>
            <p className="text-[9px] font-bold text-slate-600 uppercase tracking-[0.3em]">Built to last with quality materials</p>
            <div className="h-px w-12 bg-white/10" />
          </div>
        </div>
      </div>
    </section>
  );
};

export default Contact;