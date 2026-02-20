
import React from 'react';

interface LandingPageProps {
  onStart: () => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onStart }) => {
  return (
    <div className="flex-1">
      {/* Hero Section */}
      <section className="relative pt-20 pb-32 overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-bold tracking-wider uppercase mb-8 animate-in fade-in slide-in-from-bottom-4 duration-1000">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
              </span>
              Now powering 10k+ financial workflows
            </div>

            <h1 className="text-6xl md:text-8xl font-black text-white tracking-tight leading-[0.9] mb-8 animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-100">
              Master Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400">Wealth</span> Engineering.
            </h1>

            <p className="text-xl text-slate-400 leading-relaxed mb-12 animate-in fade-in slide-in-from-bottom-12 duration-1000 delay-200">
              The elite financial tracking platform for professionals. Secure, intelligent, and designed for total fiscal clarity.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-6 animate-in fade-in slide-in-from-bottom-16 duration-1000 delay-300">
              <button
                onClick={onStart}
                className="group relative px-8 py-4 bg-indigo-600 rounded-2xl font-bold text-lg text-white overflow-hidden transition-all hover:scale-105 active:scale-95 shadow-2xl shadow-indigo-600/30"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-indigo-400 to-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <span className="relative flex items-center gap-3">
                  Open Terminal <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
                </span>
              </button>

              <button className="px-8 py-4 bg-white/5 border border-white/10 rounded-2xl font-bold text-lg text-white hover:bg-white/10 transition-all">
                View Documentation
              </button>
            </div>
          </div>
        </div>

        {/* Decorative Grid & Blobs */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1200px] h-[800px] bg-indigo-600/5 blur-[160px] rounded-full -z-10 animate-pulse"></div>
        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-cyan-600/5 blur-[120px] rounded-full -z-10"></div>
      </section>

      {/* Feature Grid */}
      <section className="py-24 bg-slate-900/40 relative">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-8 rounded-3xl bg-white/5 border border-white/10 hover:border-indigo-500/50 transition-all group">
              <div className="w-12 h-12 bg-indigo-600/20 rounded-xl flex items-center justify-center text-indigo-400 text-2xl mb-6 group-hover:scale-110 transition-transform">⚡</div>
              <h3 className="text-xl font-bold text-white mb-4">Precision Analysis</h3>
              <p className="text-slate-400 leading-relaxed">Advanced algorithms calculate your savings rate and distribution patterns with absolute accuracy.</p>
            </div>

            <div className="p-8 rounded-3xl bg-white/5 border border-white/10 hover:border-emerald-500/50 transition-all group">
              <div className="w-12 h-12 bg-emerald-600/20 rounded-xl flex items-center justify-center text-emerald-400 text-2xl mb-6 group-hover:scale-110 transition-transform">🔒</div>
              <h3 className="text-xl font-bold text-white mb-4">Privacy First</h3>
              <p className="text-slate-400 leading-relaxed">Your data never leaves your browser. Zero cloud storage, 100% privacy, total control over your financials.</p>
            </div>

            <div className="p-8 rounded-3xl bg-white/5 border border-white/10 hover:border-rose-500/50 transition-all group">
              <div className="w-12 h-12 bg-rose-600/20 rounded-xl flex items-center justify-center text-rose-400 text-2xl mb-6 group-hover:scale-110 transition-transform">📊</div>
              <h3 className="text-xl font-bold text-white mb-4">Visual Insights</h3>
              <p className="text-slate-400 leading-relaxed">Dynamic charts and heatmaps provide a clear picture of your spending habits and financial health.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Social Proof / Stats */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="bg-gradient-to-br from-indigo-900/20 to-slate-900/40 rounded-[40px] px-12 py-12 border border-white/5 flex flex-wrap justify-between items-center gap-12">
            <div>
              <p className="text-slate-500 text-sm font-bold uppercase tracking-widest mb-2">Total Savings Generated</p>
              <h4 className="text-4xl font-black text-white">$4.2M+</h4>
            </div>
            <div className="w-px h-12 bg-white/10 hidden md:block"></div>
            <div>
              <p className="text-slate-500 text-sm font-bold uppercase tracking-widest mb-2">User Reliability Rating</p>
              <h4 className="text-4xl font-black text-white">99.9%</h4>
            </div>
            <div className="w-px h-12 bg-white/10 hidden md:block"></div>
            <div>
              <p className="text-slate-500 text-sm font-bold uppercase tracking-widest mb-2">Active Monthly Flows</p>
              <h4 className="text-4xl font-black text-white">25k+</h4>
            </div>
            <button
              onClick={onStart}
              className="px-8 py-3 bg-white text-slate-950 rounded-xl font-bold hover:bg-slate-200 transition-all ml-auto"
            >
              Get Started Free
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
