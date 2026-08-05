import React, { useState } from 'react';
import { getAppsScriptFiles } from '../data/appsScriptTemplates';
import { Code2, Copy, Check, Download, FileCode, ExternalLink, HelpCircle, Key, Server, Sparkles } from 'lucide-react';

export const AppsScriptHub: React.FC = () => {
  const files = getAppsScriptFiles();
  const [selectedTab, setSelectedTab] = useState<'codeGs' | 'geminiGs' | 'indexHtml'>('codeGs');
  const [copiedTab, setCopiedTab] = useState<string | null>(null);

  const getCodeContent = () => {
    switch (selectedTab) {
      case 'codeGs':
        return files.codeGs;
      case 'geminiGs':
        return files.geminiGs;
      case 'indexHtml':
        return files.indexHtml;
      default:
        return files.codeGs;
    }
  };

  const getFileName = () => {
    switch (selectedTab) {
      case 'codeGs':
        return 'Code.gs';
      case 'geminiGs':
        return 'Gemini.gs';
      case 'indexHtml':
        return 'Index.html';
    }
  };

  const handleCopyCode = (code: string, name: string) => {
    navigator.clipboard.writeText(code);
    setCopiedTab(name);
    setTimeout(() => setCopiedTab(null), 2000);
  };

  const handleDownloadFile = (filename: string, content: string) => {
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6 font-bengali">
      
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-emerald-950 to-slate-900 text-white rounded-2xl p-6 shadow-md border border-emerald-800/50">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Code2 className="w-6 h-6 text-amber-400" />
              <h2 className="text-xl font-bold">Google Apps Script রেডিমেড কোড হাব (100% Free Tier)</h2>
            </div>
            <p className="text-xs text-gray-300">
              ০২নং বহেড়াতৈল ইউনিয়ন পরিষদের জন্য গুগলের সম্পূর্ণ বিনামূল্যে চালানো উপযোগী ব্যাকএন্ড ও ফ্রন্টএন্ড কোড
            </p>
          </div>

          <div className="flex items-center gap-2">
            <a
              href="https://script.google.com"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-xs font-bold bg-amber-500 hover:bg-amber-400 text-amber-950 px-4 py-2.5 rounded-xl transition shadow"
            >
              <span>Google Apps Script খুলুন</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      </div>

      {/* Configured Google Workspace Asset IDs */}
      <div className="bg-emerald-950 text-emerald-100 rounded-2xl p-5 shadow-sm border border-emerald-800 space-y-3">
        <div className="flex items-center justify-between border-b border-emerald-800/80 pb-2.5">
          <div className="flex items-center gap-2">
            <Server className="w-5 h-5 text-amber-400" />
            <h3 className="text-sm font-bold text-white">সংযুক্ত গুগল ড্রাইভ, ডক ও শিট আইডি (Official Workspace IDs)</h3>
          </div>
          <span className="text-[10px] bg-amber-500/20 text-amber-300 px-2.5 py-1 rounded-full border border-amber-400/30">
            ০২নং বহেড়াতৈল ইউনিয়ন পরিষদ
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
          
          {/* Google Doc */}
          <div className="bg-emerald-900/60 p-3 rounded-xl border border-emerald-700/60 space-y-1.5">
            <span className="text-[11px] font-bold text-amber-300 block">📄 Google Doc Template ID:</span>
            <div className="flex items-center justify-between bg-black/40 p-1.5 rounded-lg border border-emerald-800">
              <code className="text-[11px] font-mono text-emerald-200 truncate max-w-[180px]">
                1CZwTWGcJudWkOHNZUxZfcZRb9ITDn-oQNU__51w0nQ4
              </code>
              <button
                onClick={() => handleCopyCode('1CZwTWGcJudWkOHNZUxZfcZRb9ITDn-oQNU__51w0nQ4', 'DocID')}
                className="text-[10px] bg-emerald-700 hover:bg-emerald-600 px-2 py-1 rounded text-white flex items-center gap-1 transition shrink-0"
              >
                {copiedTab === 'DocID' ? <Check className="w-3 h-3 text-amber-300" /> : <Copy className="w-3 h-3" />}
                <span>{copiedTab === 'DocID' ? 'কপি' : 'কপি'}</span>
              </button>
            </div>
            <a
              href="https://docs.google.com/document/d/1CZwTWGcJudWkOHNZUxZfcZRb9ITDn-oQNU__51w0nQ4"
              target="_blank"
              rel="noreferrer"
              className="text-[10px] text-emerald-400 hover:underline inline-flex items-center gap-1 mt-1"
            >
              <span>ডক খুলুন</span>
              <ExternalLink className="w-2.5 h-2.5" />
            </a>
          </div>

          {/* Google Sheet */}
          <div className="bg-emerald-900/60 p-3 rounded-xl border border-emerald-700/60 space-y-1.5">
            <span className="text-[11px] font-bold text-amber-300 block">📊 Google Sheet Database ID:</span>
            <div className="flex items-center justify-between bg-black/40 p-1.5 rounded-lg border border-emerald-800">
              <code className="text-[11px] font-mono text-emerald-200 truncate max-w-[180px]">
                1r99sXFfqgaQvzjBlaSLB26pGpn84UclL2_S7FIINn0Q
              </code>
              <button
                onClick={() => handleCopyCode('1r99sXFfqgaQvzjBlaSLB26pGpn84UclL2_S7FIINn0Q', 'SheetID')}
                className="text-[10px] bg-emerald-700 hover:bg-emerald-600 px-2 py-1 rounded text-white flex items-center gap-1 transition shrink-0"
              >
                {copiedTab === 'SheetID' ? <Check className="w-3 h-3 text-amber-300" /> : <Copy className="w-3 h-3" />}
                <span>{copiedTab === 'SheetID' ? 'কপি' : 'কপি'}</span>
              </button>
            </div>
            <a
              href="https://docs.google.com/spreadsheets/d/1r99sXFfqgaQvzjBlaSLB26pGpn84UclL2_S7FIINn0Q"
              target="_blank"
              rel="noreferrer"
              className="text-[10px] text-emerald-400 hover:underline inline-flex items-center gap-1 mt-1"
            >
              <span>শিট খুলুন</span>
              <ExternalLink className="w-2.5 h-2.5" />
            </a>
          </div>

          {/* Google Drive Folder */}
          <div className="bg-emerald-900/60 p-3 rounded-xl border border-emerald-700/60 space-y-1.5">
            <span className="text-[11px] font-bold text-amber-300 block">📁 Google Drive Folder ID:</span>
            <div className="flex items-center justify-between bg-black/40 p-1.5 rounded-lg border border-emerald-800">
              <code className="text-[11px] font-mono text-emerald-200 truncate max-w-[180px]">
                1-fndRmFqGTF_Qn1aZRrS6piKXmUEfqNU
              </code>
              <button
                onClick={() => handleCopyCode('1-fndRmFqGTF_Qn1aZRrS6piKXmUEfqNU', 'FolderID')}
                className="text-[10px] bg-emerald-700 hover:bg-emerald-600 px-2 py-1 rounded text-white flex items-center gap-1 transition shrink-0"
              >
                {copiedTab === 'FolderID' ? <Check className="w-3 h-3 text-amber-300" /> : <Copy className="w-3 h-3" />}
                <span>{copiedTab === 'FolderID' ? 'কপি' : 'কপি'}</span>
              </button>
            </div>
            <a
              href="https://drive.google.com/drive/folders/1-fndRmFqGTF_Qn1aZRrS6piKXmUEfqNU"
              target="_blank"
              rel="noreferrer"
              className="text-[10px] text-emerald-400 hover:underline inline-flex items-center gap-1 mt-1"
            >
              <span>ফোল্ডার খুলুন</span>
              <ExternalLink className="w-2.5 h-2.5" />
            </a>
          </div>

        </div>
      </div>

      {/* Deployment Guide Steps Card */}
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-emerald-100">
        <h3 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
          <HelpCircle className="w-4 h-4 text-emerald-600" />
          <span>৩টি ধাপে কীভাবে Apps Script-এ ফ্রিতে সেটআপ করবেন:</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="bg-emerald-50/50 p-3.5 rounded-xl border border-emerald-200/60">
            <div className="flex items-center gap-2 mb-1.5 text-emerald-900 font-bold">
              <span className="w-5 h-5 rounded-full bg-emerald-700 text-white flex items-center justify-center text-[10px]">১</span>
              <span>প্রজেক্ট তৈরি ও ফাইল তৈরি</span>
            </div>
            <p className="text-gray-600 leading-relaxed">
              <a href="https://script.google.com" target="_blank" className="text-emerald-700 underline font-semibold">script.google.com</a> এ গিয়ে 'New Project' দিন। ৩টি ফাইল (<strong>Code.gs</strong>, <strong>Gemini.gs</strong>, এবং <strong>Index.html</strong>) তৈরি করে নিচের কোডগুলো পেস্ট করুন।
            </p>
          </div>

          <div className="bg-amber-50/50 p-3.5 rounded-xl border border-amber-200/60">
            <div className="flex items-center gap-2 mb-1.5 text-amber-900 font-bold">
              <span className="w-5 h-5 rounded-full bg-amber-600 text-white flex items-center justify-center text-[10px]">২</span>
              <span>Gemini API Key সেটআপ</span>
            </div>
            <p className="text-gray-600 leading-relaxed">
              Google AI Studio থেকে ফ্রি <strong>GEMINI_API_KEY</strong> নিন। Apps Script-এর <strong>Project Settings (⚙️) &gt; Script Properties</strong>-এ নাম দিন <code className="bg-amber-100 px-1 py-0.5 rounded text-amber-900">GEMINI_API_KEY</code> এবং ভ্যালু পেস্ট করুন।
            </p>
          </div>

          <div className="bg-teal-50/50 p-3.5 rounded-xl border border-teal-200/60">
            <div className="flex items-center gap-2 mb-1.5 text-teal-900 font-bold">
              <span className="w-5 h-5 rounded-full bg-teal-700 text-white flex items-center justify-center text-[10px]">৩</span>
              <span>Web App হিসেবে প্রকাশ</span>
            </div>
            <p className="text-gray-600 leading-relaxed">
              উপরে <strong>Deploy &gt; New deployment</strong> এ চাপুন। Select type: <strong>Web App</strong> দিন। Execute as: <strong>Me</strong> এবং Who has access: <strong>Anyone</strong> দিয়ে Deploy চাপুন!
            </p>
          </div>
        </div>
      </div>

      {/* Code File Explorer Box */}
      <div className="bg-slate-900 rounded-2xl shadow-xl overflow-hidden border border-slate-800">
        
        {/* File Tabs */}
        <div className="flex flex-wrap items-center justify-between bg-slate-950 px-4 py-2 border-b border-slate-800">
          <div className="flex items-center gap-2 overflow-x-auto">
            <button
              onClick={() => setSelectedTab('codeGs')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition ${
                selectedTab === 'codeGs'
                  ? 'bg-emerald-600 text-white shadow'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              <FileCode className="w-3.5 h-3.5" />
              <span>Code.gs</span>
            </button>

            <button
              onClick={() => setSelectedTab('geminiGs')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition ${
                selectedTab === 'geminiGs'
                  ? 'bg-amber-600 text-white shadow'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>Gemini.gs</span>
            </button>

            <button
              onClick={() => setSelectedTab('indexHtml')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition ${
                selectedTab === 'indexHtml'
                  ? 'bg-teal-600 text-white shadow'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              <Server className="w-3.5 h-3.5" />
              <span>Index.html</span>
            </button>
          </div>

          <div className="flex items-center gap-2 my-1">
            <button
              onClick={() => handleCopyCode(getCodeContent(), getFileName())}
              className="flex items-center gap-1.5 text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-emerald-400 px-3 py-1.5 rounded-lg border border-slate-700 transition"
            >
              {copiedTab === getFileName() ? (
                <>
                  <Check className="w-3.5 h-3.5 text-amber-400" />
                  <span>কপি হয়েছে</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>কপি কোড</span>
                </>
              )}
            </button>

            <button
              onClick={() => handleDownloadFile(getFileName(), getCodeContent())}
              className="flex items-center gap-1.5 text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 px-3 py-1.5 rounded-lg border border-slate-700 transition"
            >
              <Download className="w-3.5 h-3.5" />
              <span>ডাউনলোড</span>
            </button>
          </div>
        </div>

        {/* Code View Area */}
        <div className="p-4 overflow-x-auto max-h-[500px]">
          <pre className="text-xs font-mono text-emerald-300 leading-relaxed whitespace-pre font-normal">
            <code>{getCodeContent()}</code>
          </pre>
        </div>

        <div className="bg-slate-950 px-4 py-2 text-[11px] text-slate-500 border-t border-slate-800 flex justify-between items-center">
          <span>০২নং বহেড়াতৈল ইউনিয়ন পরিষদ - Google Apps Script Production Code</span>
          <span>ফাইল: {getFileName()}</span>
        </div>

      </div>

    </div>
  );
};
