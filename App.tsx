import React, { useState } from 'react';
import { HashRouter } from 'react-router-dom';
import { performAudit, fileToBase64 } from './services/geminiService.ts';
import { AuditReport, AuditRequest } from './types.ts';
import { AuditDashboard } from './components/AuditDashboard.tsx';
import { ChatAssistant } from './components/ChatAssistant.tsx';
import { ArrowRight, Upload, Zap, Globe, ShoppingBag, LayoutTemplate } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

function App() {
  const [status, setStatus] = useState<'idle' | 'scanning' | 'complete' | 'error'>('idle');
  const [formData, setFormData] = useState<AuditRequest>({ url: '', niche: '', targetMarket: '' });
  const [report, setReport] = useState<AuditReport | null>(null);
  const [loadingStep, setLoadingStep] = useState(0);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const base64 = await fileToBase64(e.target.files[0]);
      setFormData({ ...formData, screenshot: base64 });
    }
  };

  const startAudit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.url) return;

    setStatus('scanning');
    setLoadingStep(0);
    
    // Simulate steps for UX while waiting for API
    const steps = setInterval(() => {
      setLoadingStep(prev => (prev < 95 ? prev + Math.floor(Math.random() * 10) : prev));
    }, 500);

    try {
      const result = await performAudit(formData);
      setReport(result);
      clearInterval(steps);
      setLoadingStep(100);
      setTimeout(() => setStatus('complete'), 500); // Small delay to show 100%
    } catch (error) {
      console.error(error);
      clearInterval(steps);
      setStatus('error');
    }
  };

  const loadingMessages = [
    "Connecting to store...",
    "Scanning homepage structure...",
    "Analyzing visual hierarchy...",
    "Checking mobile responsiveness...",
    "Evaluating trust signals...",
    "Calculating conversion score...",
    "Generating fix recommendations..."
  ];

  const currentLoadingMessage = loadingMessages[Math.min(Math.floor((loadingStep / 100) * loadingMessages.length), loadingMessages.length - 1)];

  return (
    <HashRouter>
      <div className="font-sans text-slate-900">
        
        {/* State: IDLE (Landing Page) */}
        {status === 'idle' && (
          <div className="min-h-screen flex flex-col relative overflow-hidden bg-slate-50">
             {/* Background decoration */}
             <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] bg-brand-200 rounded-full blur-[100px] opacity-40"></div>
             <div className="absolute bottom-[-10%] left-[-10%] w-[600px] h-[600px] bg-blue-200 rounded-full blur-[120px] opacity-40"></div>

            <header className="px-6 py-6 flex justify-between items-center relative z-10 max-w-7xl mx-auto w-full">
              <div className="flex items-center gap-2 font-bold text-2xl tracking-tight">
                <div className="bg-brand-600 text-white p-1.5 rounded-lg">
                  <Zap className="w-6 h-6" />
                </div>
                <span>Sirz Shopify Audit <span className="text-brand-600">AI</span></span>
              </div>
            </header>

            <main className="flex-1 flex flex-col items-center justify-center px-4 relative z-10">
              <div className="max-w-3xl w-full text-center mb-12">
                <div className="inline-flex items-center gap-2 bg-brand-50 border border-brand-100 text-brand-700 px-4 py-1.5 rounded-full text-sm font-medium mb-6">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-brand-500"></span>
                  </span>
                  New: Multimodal Vision Analysis
                </div>
                <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-slate-900 mb-6">
                  Why isn't your store <br/>
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-600 to-blue-600">converting?</span>
                </h1>
                <p className="text-xl text-slate-600 mb-8 max-w-2xl mx-auto leading-relaxed">
                  Get a comprehensive, AI-powered audit of your Shopify store in seconds. 
                  See exactly what's killing your sales and get step-by-step fixes.
                </p>
                
                <form onSubmit={startAudit} className="bg-white p-2 rounded-2xl shadow-xl border border-slate-200 flex flex-col md:flex-row max-w-2xl mx-auto">
                  <div className="flex-1 px-4 py-3 border-b border-slate-100 md:border-b-0 md:border-r">
                     <label className="block text-xs font-bold text-slate-400 uppercase tracking-wide mb-1">Store URL</label>
                     <input 
                       required
                       name="url"
                       type="url" 
                       placeholder="https://mystore.com" 
                       className="w-full bg-white outline-none text-slate-900 placeholder-slate-400 font-medium"
                       value={formData.url}
                       onChange={handleInputChange}
                     />
                  </div>
                  <div className="md:w-1/3 px-4 py-3">
                     <label className="block text-xs font-bold text-slate-400 uppercase tracking-wide mb-1">Niche (Optional)</label>
                     <input 
                       name="niche"
                       type="text" 
                       placeholder="e.g. Fashion" 
                       className="w-full bg-white outline-none text-slate-900 placeholder-slate-400 font-medium"
                       value={formData.niche}
                       onChange={handleInputChange}
                     />
                  </div>
                  <button 
                    type="submit"
                    className="bg-brand-600 hover:bg-brand-700 text-white rounded-xl px-8 py-3 md:py-0 font-bold text-lg transition-all flex items-center justify-center gap-2 shadow-lg shadow-brand-200 m-1"
                  >
                    Audit <ArrowRight className="w-5 h-5" />
                  </button>
                </form>

                <div className="mt-6 flex flex-col items-center">
                    <label className="cursor-pointer flex items-center gap-2 text-sm text-slate-500 hover:text-brand-600 transition bg-white px-4 py-2 rounded-full border border-slate-200 shadow-sm">
                        <Upload className="w-4 h-4" />
                        <span>Optional: Upload Homepage Screenshot for Better Visual Analysis</span>
                        <input type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
                    </label>
                    {formData.screenshot && <span className="text-xs text-green-600 mt-2 font-medium">Screenshot attached ✓</span>}
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl w-full border-t border-slate-200 pt-12">
                  {[
                    { icon: Globe, label: "SEO Check" },
                    { icon: Zap, label: "Speed Audit" },
                    { icon: ShoppingBag, label: "CRO Analysis" },
                    { icon: LayoutTemplate, label: "UX Review" }
                  ].map((item, i) => (
                    <div key={i} className="flex flex-col items-center gap-2 text-slate-400">
                       <item.icon className="w-6 h-6 mb-1" />
                       <span className="font-semibold text-sm">{item.label}</span>
                    </div>
                  ))}
              </div>
            </main>
          </div>
        )}

        {/* State: SCANNING */}
        {status === 'scanning' && (
          <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center relative overflow-hidden">
             {/* Radar Scan Effect */}
             <div className="absolute inset-0 flex items-center justify-center opacity-20">
                <div className="w-[600px] h-[600px] border border-brand-500 rounded-full animate-ping absolute"></div>
                <div className="w-[400px] h-[400px] border border-brand-500 rounded-full animate-ping absolute delay-75"></div>
                <div className="w-[200px] h-[200px] border border-brand-500 rounded-full animate-pulse absolute"></div>
             </div>

             <div className="relative z-10 text-center max-w-md w-full px-6">
                <div className="mb-8">
                  <div className="w-24 h-24 bg-slate-800 rounded-2xl mx-auto flex items-center justify-center border border-slate-700 shadow-2xl relative">
                     <div className="absolute inset-0 bg-brand-500 blur-xl opacity-20"></div>
                     <Zap className="w-10 h-10 text-brand-400 animate-pulse" />
                  </div>
                </div>
                
                <h2 className="text-2xl font-bold text-white mb-2">Analyzing Store...</h2>
                <p className="text-brand-200 mb-8 h-6">{currentLoadingMessage}</p>

                <div className="w-full bg-slate-800 rounded-full h-2 mb-4 overflow-hidden">
                   <motion.div 
                     className="bg-brand-500 h-full rounded-full"
                     initial={{ width: 0 }}
                     animate={{ width: `${loadingStep}%` }}
                     transition={{ ease: "easeOut" }}
                   />
                </div>
                <div className="flex justify-between text-xs text-slate-500 font-mono">
                   <span>INITIATED</span>
                   <span>{loadingStep}%</span>
                </div>
             </div>
          </div>
        )}

        {/* State: ERROR */}
        {status === 'error' && (
           <div className="min-h-screen flex items-center justify-center bg-slate-50">
             <div className="text-center p-8">
               <h2 className="text-xl font-bold text-red-600 mb-2">Audit Failed</h2>
               <p className="text-slate-600 mb-4">We couldn't reach the AI auditor. Please check your API key or try again.</p>
               <button onClick={() => setStatus('idle')} className="text-brand-600 underline">Try Again</button>
             </div>
           </div>
        )}

        {/* State: COMPLETE (Dashboard) */}
        {status === 'complete' && report && (
           <>
            <AuditDashboard data={report} onRestart={() => setStatus('idle')} />
            <ChatAssistant report={report} />
           </>
        )}

      </div>
    </HashRouter>
  );
}

export default App;