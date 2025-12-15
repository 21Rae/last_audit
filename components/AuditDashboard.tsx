import React, { useState } from 'react';
import { AuditReport, IssuePriority, AuditIssue } from '../types.ts';
import { RadialScore } from './RadialScore.tsx';
import { CheckCircle, ChevronDown, ChevronUp, Zap, Shield, Search, Smartphone, MessageSquare, Share2 } from 'lucide-react';
import { Tooltip, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';

interface Props {
  data: AuditReport;
  onRestart: () => void;
}

const PriorityBadge = ({ priority }: { priority: IssuePriority }) => {
  const colors = {
    [IssuePriority.High]: 'bg-red-100 text-red-700 border-red-200',
    [IssuePriority.Medium]: 'bg-yellow-100 text-yellow-700 border-yellow-200',
    [IssuePriority.Low]: 'bg-blue-100 text-blue-700 border-blue-200',
  };
  return (
    <span className={`px-2 py-0.5 rounded-full text-xs font-bold border ${colors[priority]}`}>
      {priority} Priority
    </span>
  );
};

const CategoryIcon = ({ category }: { category: string }) => {
  switch (category) {
    case 'CRO': return <Zap className="w-5 h-5 text-purple-600" />;
    case 'Trust': return <Shield className="w-5 h-5 text-blue-600" />;
    case 'Speed': return <Zap className="w-5 h-5 text-yellow-600" />; 
    case 'SEO': return <Search className="w-5 h-5 text-green-600" />;
    case 'Mobile': return <Smartphone className="w-5 h-5 text-pink-600" />;
    default: return <MessageSquare className="w-5 h-5 text-slate-600" />;
  }
};

const IssueCard: React.FC<{ issue: AuditIssue }> = ({ issue }) => {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="bg-white border border-slate-200 rounded-lg shadow-sm hover:shadow-md transition-shadow overflow-hidden mb-4">
      <div 
        className="p-4 flex items-start justify-between cursor-pointer" 
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-start gap-4">
          <div className="mt-1">
            <CategoryIcon category={issue.category} />
          </div>
          <div>
            <h4 className="font-semibold text-slate-900">{issue.title}</h4>
            <p className="text-sm text-slate-500 mt-1">{issue.problem}</p>
          </div>
        </div>
        <div className="flex flex-col items-end gap-2">
           <PriorityBadge priority={issue.priority} />
           {expanded ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
        </div>
      </div>
      
      {expanded && (
        <div className="bg-slate-50 px-4 py-4 border-t border-slate-100">
          <div className="grid md:grid-cols-2 gap-6">
            <div>
               <h5 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Why it hurts sales</h5>
               <p className="text-sm text-slate-700 mb-4">{issue.impact}</p>
            </div>
            <div className="bg-white p-4 rounded border border-slate-200">
               <div className="flex items-center gap-2 mb-2">
                  <div className="bg-green-100 p-1 rounded-full">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                  </div>
                  <h5 className="font-bold text-green-700">How to Fix</h5>
               </div>
               <h6 className="font-semibold text-sm mb-1">{issue.fix.title}</h6>
               <p className="text-sm text-slate-600 mb-2">{issue.fix.description}</p>
               <ul className="list-disc list-inside text-sm text-slate-600 space-y-1">
                 {issue.fix.steps.map((step, idx) => (
                   <li key={idx}>{step}</li>
                 ))}
               </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export const AuditDashboard: React.FC<Props> = ({ data, onRestart }) => {
  const radarData = data.categories.map(cat => ({
    subject: cat.name,
    A: cat.score,
    fullMark: 100,
  }));

  const priorityOrder: Record<string, number> = { 'High': 3, 'Medium': 2, 'Low': 1 };

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      {/* Sticky Header */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-30 px-6 py-4 flex justify-between items-center shadow-sm">
        <div className="flex items-center gap-3">
          <div className="bg-purple-600 p-2 rounded-lg">
            <Zap className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="font-bold text-slate-900 leading-tight">Audit Report</h1>
            <p className="text-xs text-slate-500">{new URL(data.storeUrl).hostname}</p>
          </div>
        </div>
        <div className="flex gap-3">
          <button onClick={onRestart} className="text-sm text-slate-600 hover:text-slate-900">New Audit</button>
          <button className="bg-slate-900 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-slate-800 flex items-center gap-2">
            <Share2 className="w-4 h-4" /> Share
          </button>
        </div>
      </div>

      <main className="max-w-6xl mx-auto px-4 pt-8">
        {/* Top Summary Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Overall Score */}
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col items-center justify-center">
            <h3 className="text-lg font-bold text-slate-900 mb-4">Overall Health</h3>
            <RadialScore score={data.overallScore} size={160} label={data.overallScore > 70 ? "Good Job!" : "Needs Work"} />
            <p className="text-center text-slate-500 text-sm mt-4 px-4">{data.summary}</p>
          </div>

          {/* Category Radar */}
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm md:col-span-2 min-w-0">
             <h3 className="text-lg font-bold text-slate-900 mb-4">Category Breakdown</h3>
             <div className="h-64 w-full relative">
               <ResponsiveContainer width="100%" height="100%">
                 <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                    <PolarGrid stroke="#e2e8f0" />
                    <PolarAngleAxis dataKey="subject" tick={{ fill: '#64748b', fontSize: 12 }} />
                    <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} />
                    <Radar name="Score" dataKey="A" stroke="#7c3aed" fill="#8b5cf6" fillOpacity={0.6} />
                    <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                 </RadarChart>
               </ResponsiveContainer>
             </div>
          </div>
        </div>

        {/* Detailed Category Cards Row */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-10">
          {data.categories.map((cat, idx) => (
            <div key={idx} className="bg-white p-4 rounded-lg border border-slate-200 text-center">
              <div className="flex justify-center mb-2">
                 <CategoryIcon category={cat.name} />
              </div>
              <div className="text-2xl font-bold text-slate-900">{cat.score}</div>
              <div className="text-xs text-slate-500 uppercase font-semibold">{cat.name}</div>
            </div>
          ))}
        </div>

        {/* Issues List */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-slate-900">Action Plan</h2>
            <span className="bg-red-100 text-red-800 text-xs font-bold px-3 py-1 rounded-full">
              {data.issues.length} Critical Issues Found
            </span>
          </div>

          <div className="space-y-4">
             {data.issues.sort((a, b) => {
               return (priorityOrder[b.priority] || 0) - (priorityOrder[a.priority] || 0);
             }).map((issue) => (
               <IssueCard key={issue.id} issue={issue} />
             ))}
          </div>
        </div>
      </main>
    </div>
  );
};