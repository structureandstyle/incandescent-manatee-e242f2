import React, { useEffect, useState, useRef } from 'react';

interface ValueProps {
  label: string;
  sublabel: string;
  delay?: number;
}

const ValueCard: React.FC<ValueProps> = ({ label, sublabel, delay = 0 }) => {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setIsVisible(true);
      },
      { threshold: 0.1 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return (
    <div 
      ref={ref} 
      className={`text-center py-6 px-4 transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      <div className="text-xl md:text-2xl font-black text-white mb-2 uppercase tracking-tighter">
        {label}
      </div>
      <div className="text-amber-500 font-black uppercase tracking-[0.2em] text-[8px] md:text-[10px]">
        {sublabel}
      </div>
    </div>
  );
};

const Stats: React.FC = () => {
  return (
    <section className="bg-slate-950 pt-0 pb-16 border-y border-white/5">
      <div className="max-w-7xl mx-auto px-6 mb-12 text-center">
         <h2 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.6em] mb-4">Why Choose Us</h2>
         <div className="w-12 h-px bg-amber-600 mx-auto opacity-40"></div>
      </div>
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8">
        <ValueCard label="Bespoke Joinery" sublabel="Fitted Specialists" delay={100} />
        <ValueCard label="Clean & Precise" sublabel="Workmanship" delay={300} />
        <ValueCard label="Tidy & Respectful" sublabel="In Your Home" delay={500} />
        <ValueCard label="Quality Built" sublabel="Durable Materials" delay={700} />
      </div>
    </section>
  );
};

export default Stats;