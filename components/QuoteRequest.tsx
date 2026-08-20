import React, { useState } from 'react';
import { ArrowLeft, Send, CheckCircle, Shield, Clock, MapPin } from 'lucide-react';

interface QuoteRequestProps {
  onBack: () => void;
}

const QuoteRequest: React.FC<QuoteRequestProps> = ({ onBack }) => {
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-white pt-40 pb-20 flex items-center justify-center px-6">
        <div className="max-w-md w-full text-center space-y-8 animate-fade-in">
          <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto text-green-600">
            <CheckCircle size={48} />
          </div>
          <div className="space-y-4">
            <h1 className="text-4xl font-black text-slate-900 tracking-tight">Request Received</h1>
            <p className="text-slate-500 font-medium">
              Uwe or Kas will review your project details and get back to you within 24 hours to schedule a consultation.
            </p>
          </div>
          <button 
            onClick={onBack}
            className="w-full py-5 bg-slate-900 text-white font-black uppercase tracking-widest rounded-xl shadow-xl hover:bg-slate-800 transition-all"
          >
            Back to Overview
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pt-32 pb-24">
      <div className="max-w-6xl mx-auto px-6">
        {/* Navigation */}
        <button 
          onClick={onBack}
          className="group flex items-center gap-2 text-slate-500 hover:text-slate-900 transition-colors mb-12"
        >
          <div className="w-10 h-10 rounded-full bg-white border border-slate-200 flex items-center justify-center group-hover:bg-slate-900 group-hover:text-white transition-all">
            <ArrowLeft size={20} />
          </div>
          <span className="text-xs font-black uppercase tracking-widest">Back to Overview</span>
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-20">
          {/* Left Side: Context */}
          <div className="space-y-12">
            <div className="space-y-6">
              <h1 className="text-6xl md:text-8xl font-black text-slate-900 tracking-tighter uppercase leading-[0.85]">
                Start Your<br />
                <span className="text-amber-600">Project</span>
              </h1>
              <p className="text-slate-600 text-xl font-light leading-relaxed max-w-md">
                We believe in precision from the first interaction. Tell us about your space and requirements.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 pt-8">
              <div className="p-6 bg-white rounded-2xl border border-slate-200 shadow-sm space-y-4">
                <Shield className="text-amber-600" size={28} />
                <h3 className="font-bold text-slate-900">Premium Guarantee</h3>
                <p className="text-xs text-slate-500 leading-relaxed font-medium uppercase tracking-wider">Master artisans (Kas & Uwe) oversee every project phase personally.</p>
              </div>
              <div className="p-6 bg-white rounded-2xl border border-slate-200 shadow-sm space-y-4">
                <Clock className="text-amber-600" size={28} />
                <h3 className="font-bold text-slate-900">24hr Response</h3>
                <p className="text-xs text-slate-500 leading-relaxed font-medium uppercase tracking-wider">Fast-track response for all residential and architectural inquiries.</p>
              </div>
              <div className="p-6 bg-white rounded-2xl border border-slate-200 shadow-sm space-y-4">
                <MapPin className="text-amber-600" size={28} />
                <h3 className="font-bold text-slate-900">Greater London</h3>
                <p className="text-xs text-slate-500 leading-relaxed font-medium uppercase tracking-wider">Serving all London boroughs with site-specific precision joinery.</p>
              </div>
            </div>
          </div>

          {/* Right Side: Form */}
          <div className="bg-white p-8 md:p-12 rounded-[2.5rem] shadow-2xl border border-slate-100">
            <form className="space-y-8" onSubmit={handleSubmit}>
              <div className="space-y-6">
                <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-300">Contact Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Your Name</label>
                    <input required type="text" className="w-full bg-slate-50 border border-slate-200 px-5 py-4 rounded-xl focus:ring-2 focus:ring-amber-600 focus:outline-none transition-all font-medium" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Email Address</label>
                    <input required type="email" className="w-full bg-slate-50 border border-slate-200 px-5 py-4 rounded-xl focus:ring-2 focus:ring-amber-600 focus:outline-none transition-all font-medium" />
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-300">Project Specifics</h3>
                <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Type of Service</label>
                    <select className="w-full bg-slate-50 border border-slate-200 px-5 py-4 rounded-xl focus:ring-2 focus:ring-amber-600 focus:outline-none transition-all font-medium appearance-none">
                      <option>Bespoke Fitted Furniture</option>
                      <option>Kitchen Installation</option>
                      <option>Wood Flooring</option>
                      <option>Architectural Joinery</option>
                      <option>Full Interior Fit-out</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Project Brief</label>
                    <textarea 
                      rows={5} 
                      className="w-full bg-slate-50 border border-slate-200 px-5 py-4 rounded-xl focus:ring-2 focus:ring-amber-600 focus:outline-none transition-all font-medium resize-none"
                      placeholder="Tell us about the space, dimensions, or specific vision..."
                    ></textarea>
                  </div>
                </div>
              </div>

              <button 
                type="submit"
                className="w-full flex items-center justify-center gap-3 py-6 bg-slate-900 text-white font-black uppercase tracking-[0.2em] rounded-2xl shadow-2xl hover:bg-amber-600 transition-all hover:translate-y-[-4px] active:scale-95 group"
              >
                Request Consultation
                <Send size={18} className="group-hover:translate-x-1 transition-transform" />
              </button>
              
              <p className="text-center text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                Data protected under GDPR. We never share client information.
              </p>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default QuoteRequest;