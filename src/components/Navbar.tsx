import React from 'react';
import { Landmark, FileText, Code2, History, BookOpen, ShieldCheck } from 'lucide-react';

interface NavbarProps {
  activeTab: 'generator' | 'history' | 'appsScript' | 'guide';
  setActiveTab: (tab: 'generator' | 'history' | 'appsScript' | 'guide') => void;
  savedCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({ activeTab, setActiveTab, savedCount }) => {
  return (
    <header className="bg-gradient-to-r from-emerald-900 via-emerald-800 to-teal-900 text-white border-b-4 border-amber-500 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          
          {/* Logo & Union Title */}
          <div className="flex items-center gap-3">
            <div className="w-14 h-14 rounded-full bg-amber-500/20 border-2 border-amber-400 flex items-center justify-center shrink-0 shadow-inner">
              <Landmark className="w-8 h-8 text-amber-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="bg-amber-500 text-emerald-950 text-xs font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                  ডিজিটাল ইউপি
                </span>
                <span className="text-emerald-200 text-xs font-medium flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-300" /> সখিপুর, টাঙ্গাইল
                </span>
              </div>
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white mt-0.5 font-bengali">
                ০২নং বহেড়াতৈল ইউনিয়ন পরিষদ কার্যালয়
              </h1>
              <p className="text-xs text-emerald-100 opacity-90 font-bengali">
                AI চালিত স্মার্ট সনদপত্র অটোমেশন ও NID স্ক্যানার সিস্টেম
              </p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <nav className="flex flex-wrap items-center gap-2 bg-emerald-950/50 p-1.5 rounded-xl border border-emerald-700/50">
            <button
              onClick={() => setActiveTab('generator')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-semibold transition-all ${
                activeTab === 'generator'
                  ? 'bg-amber-500 text-emerald-950 shadow-md font-bold'
                  : 'text-emerald-100 hover:bg-emerald-800/60 hover:text-white'
              }`}
            >
              <FileText className="w-4 h-4" />
              <span>সনদপত্র জেনারেটর</span>
            </button>

            <button
              onClick={() => setActiveTab('history')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-semibold transition-all ${
                activeTab === 'history'
                  ? 'bg-amber-500 text-emerald-950 shadow-md font-bold'
                  : 'text-emerald-100 hover:bg-emerald-800/60 hover:text-white'
              }`}
            >
              <History className="w-4 h-4" />
              <span>আর্কাইভ</span>
              {savedCount > 0 && (
                <span className="ml-1 bg-emerald-700 text-amber-300 text-xs px-2 py-0.5 rounded-full border border-amber-400/40">
                  {savedCount}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('appsScript')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-semibold transition-all ${
                activeTab === 'appsScript'
                  ? 'bg-amber-500 text-emerald-950 shadow-md font-bold'
                  : 'text-emerald-100 hover:bg-emerald-800/60 hover:text-white'
              }`}
            >
              <Code2 className="w-4 h-4" />
              <span>Apps Script কোড</span>
            </button>

            <button
              onClick={() => setActiveTab('guide')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-semibold transition-all ${
                activeTab === 'guide'
                  ? 'bg-amber-500 text-emerald-950 shadow-md font-bold'
                  : 'text-emerald-100 hover:bg-emerald-800/60 hover:text-white'
              }`}
            >
              <BookOpen className="w-4 h-4" />
              <span>নির্দেশিকা</span>
            </button>
          </nav>

        </div>
      </div>
    </header>
  );
};
