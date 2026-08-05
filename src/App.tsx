import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { NidScanner } from './components/NidScanner';
import { CertificateForm } from './components/CertificateForm';
import { CertificatePreview } from './components/CertificatePreview';
import { CertificateHistory } from './components/CertificateHistory';
import { AppsScriptHub } from './components/AppsScriptHub';
import { GuideModal } from './components/GuideModal';
import { CertificateFormData, GeneratedCertificateRecord, NidExtractedData } from './types';
import { Sparkles, FileText, ArrowLeft } from 'lucide-react';

const STORAGE_KEY = 'baheratail_up_certificates';

export default function App() {
  const [activeTab, setActiveTab] = useState<'generator' | 'history' | 'appsScript' | 'guide'>('generator');
  const [extractedNid, setExtractedNid] = useState<Partial<NidExtractedData>>({});
  const [currentRecord, setCurrentRecord] = useState<GeneratedCertificateRecord | null>(null);
  const [historyRecords, setHistoryRecords] = useState<GeneratedCertificateRecord[]>([]);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Load saved certificates from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        setHistoryRecords(JSON.parse(saved));
      }
    } catch (e) {
      console.error('Failed to load certificates history:', e);
    }
  }, []);

  // Save history to localStorage when changed
  const saveHistoryToStorage = (updatedList: GeneratedCertificateRecord[]) => {
    setHistoryRecords(updatedList);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedList));
    } catch (e) {
      console.error('Failed to save to localStorage:', e);
    }
  };

  const handleNidExtracted = (data: NidExtractedData) => {
    setExtractedNid(data);
  };

  const handleFormSubmit = async (formData: CertificateFormData) => {
    setIsGenerating(true);
    setErrorMsg(null);

    try {
      const response = await fetch('/api/generate-certificate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (result.success && result.certificateBody) {
        const newRecord: GeneratedCertificateRecord = {
          ...formData,
          id: `CERT-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
          certificateBody: result.certificateBody,
          createdAt: new Date().toISOString(),
          chairmanName: 'চেয়ারম্যান',
          unionName: '০২নং বহেড়াতৈল ইউনিয়ন পরিষদ',
        };

        setCurrentRecord(newRecord);

        // Auto add to history if not already present
        const updated = [newRecord, ...historyRecords];
        saveHistoryToStorage(updated);
      } else {
        setErrorMsg(result.error || 'সনদপত্র তৈরিতে সমস্যা হয়েছে। আবার চেষ্টা করুন।');
      }
    } catch (err: any) {
      setErrorMsg('সার্ভার যোগাযোগ ত্রুটি: ' + (err.message || 'Error'));
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDeleteRecord = (id: string) => {
    const updated = historyRecords.filter((r) => r.id !== id);
    saveHistoryToStorage(updated);
    if (currentRecord?.id === id) {
      setCurrentRecord(null);
    }
  };

  const handleClearAllHistory = () => {
    if (window.confirm('আপনি কি নিশ্চিত যে সকল সংরক্ষিত সনদপত্রের রেকর্ড মুছে ফেলতে চান?')) {
      saveHistoryToStorage([]);
      setCurrentRecord(null);
    }
  };

  const handleSelectRecordFromHistory = (rec: GeneratedCertificateRecord) => {
    setCurrentRecord(rec);
    setActiveTab('generator');
  };

  return (
    <div className="min-h-screen bg-slate-100/70 text-gray-900 font-bengali flex flex-col">
      
      {/* Navigation Header */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        savedCount={historyRecords.length}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        
        {/* Error Notification Bar */}
        {errorMsg && (
          <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs font-semibold flex items-center justify-between shadow-sm">
            <span>{errorMsg}</span>
            <button
              onClick={() => setErrorMsg(null)}
              className="text-red-600 font-bold hover:underline ml-3"
            >
              বন্ধ করুন
            </button>
          </div>
        )}

        {/* TAB 1: GENERATOR */}
        {activeTab === 'generator' && (
          <div className="space-y-6">
            
            {/* If a certificate was generated / selected, display preview at top with option to create another */}
            {currentRecord && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <button
                    onClick={() => setCurrentRecord(null)}
                    className="flex items-center gap-1.5 text-xs font-bold text-emerald-800 bg-white hover:bg-emerald-50 px-3.5 py-2 rounded-xl border border-emerald-200 shadow-sm transition"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span>নতুন সনদপত্র তৈরি করুন</span>
                  </button>

                  <span className="text-xs text-gray-500 bg-emerald-100/60 px-3 py-1 rounded-full border border-emerald-200">
                    স্মারক নম্বর: <strong>{currentRecord.memoNo}</strong>
                  </span>
                </div>

                <CertificatePreview
                  record={currentRecord}
                  isSaved={historyRecords.some((r) => r.id === currentRecord.id)}
                  onSaveToHistory={() => {
                    if (!historyRecords.some((r) => r.id === currentRecord.id)) {
                      saveHistoryToStorage([currentRecord, ...historyRecords]);
                    }
                  }}
                />
              </div>
            )}

            {/* Grid Layout: Scanner (Left) + Form (Right) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              <div className="lg:col-span-5 space-y-6">
                <NidScanner onDataExtracted={handleNidExtracted} />
              </div>

              <div className="lg:col-span-7 space-y-6">
                <CertificateForm
                  initialData={extractedNid}
                  onSubmitForm={handleFormSubmit}
                  isLoading={isGenerating}
                />
              </div>
            </div>

          </div>
        )}

        {/* TAB 2: HISTORY ARCHIVE */}
        {activeTab === 'history' && (
          <CertificateHistory
            records={historyRecords}
            onSelectRecord={handleSelectRecordFromHistory}
            onDeleteRecord={handleDeleteRecord}
            onClearAll={handleClearAllHistory}
          />
        )}

        {/* TAB 3: GOOGLE APPS SCRIPT HUB */}
        {activeTab === 'appsScript' && (
          <AppsScriptHub />
        )}

        {/* TAB 4: USER GUIDE */}
        {activeTab === 'guide' && (
          <GuideModal />
        )}

      </main>

      {/* Footer */}
      <footer className="bg-emerald-950 text-emerald-200 text-xs py-6 border-t border-emerald-800 mt-12 print:hidden font-bengali">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
          <div>
            <p className="font-bold text-white">০২নং বহেড়াতৈল ইউনিয়ন পরিষদ কার্যালয়</p>
            <p className="text-[11px] text-emerald-400 mt-0.5">ডাকঘর: বহেড়াতৈল, উপজেলা: সখিপুর, জেলা: টাঙ্গাইল।</p>
          </div>
          <div className="text-[11px] text-emerald-300">
            <span>গুগল অ্যাপস স্ক্রিপ্ট ও Gemini AI সমর্থিত ১০০% ফ্রি প্ল্যাটফর্ম</span>
          </div>
        </div>
      </footer>

    </div>
  );
}
