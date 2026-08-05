import React, { useRef } from 'react';
import { GeneratedCertificateRecord } from '../types';
import { Printer, Copy, Check, QrCode, Download, Save, Sparkles, Award } from 'lucide-react';

interface CertificatePreviewProps {
  record: GeneratedCertificateRecord;
  onSaveToHistory?: () => void;
  isSaved?: boolean;
}

export const CertificatePreview: React.FC<CertificatePreviewProps> = ({
  record,
  onSaveToHistory,
  isSaved = false,
}) => {
  const [copied, setCopied] = React.useState(false);
  const certRef = useRef<HTMLDivElement>(null);

  const handlePrint = () => {
    window.print();
  };

  const handleCopy = () => {
    const fullText = `গণপ্রজাতন্ত্রী বাংলাদেশ সরকার\n০২নং বহেড়াতৈল ইউনিয়ন পরিষদ কার্যালয়\nউপজেলা: সখিপুর, জেলা: টাঙ্গাইল।\n\nস্মারক নং: ${record.memoNo}\nতারিখ: ${record.issueDate}\n\nবিষয়: ${record.certType}\n\n${record.certificateBody}\n\nস্বাক্ষর:\nচেয়ারম্যান\n০২নং বহেড়াতৈল ইউনিয়ন পরিষদ`;
    navigator.clipboard.writeText(fullText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-4 font-bengali">
      {/* Top Control Bar */}
      <div className="bg-emerald-900 text-white rounded-xl p-3.5 flex flex-wrap items-center justify-between gap-3 shadow-md print:hidden">
        <div className="flex items-center gap-2">
          <Award className="w-5 h-5 text-amber-400" />
          <span className="text-sm font-bold">অফিশিয়াল সনদপত্র প্রিভিউ (প্রিন্ট রেডি)</span>
        </div>
        
        <div className="flex items-center gap-2">
          {onSaveToHistory && (
            <button
              onClick={onSaveToHistory}
              disabled={isSaved}
              className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg transition ${
                isSaved
                  ? 'bg-emerald-800 text-emerald-300 cursor-default'
                  : 'bg-emerald-700 hover:bg-emerald-600 text-white border border-emerald-500'
              }`}
            >
              <Save className="w-3.5 h-3.5" />
              <span>{isSaved ? 'আর্কাইভে সংরক্ষিত' : 'আর্কাইভে সংরক্ষণ করুন'}</span>
            </button>
          )}

          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 text-xs font-semibold bg-emerald-800 hover:bg-emerald-700 text-emerald-100 px-3 py-1.5 rounded-lg border border-emerald-600 transition"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-amber-300" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'কপি হয়েছে' : 'টেক্সট কপি'}</span>
          </button>

          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 text-xs font-bold bg-amber-500 hover:bg-amber-400 text-amber-950 px-4 py-1.5 rounded-lg shadow-sm transition"
          >
            <Printer className="w-4 h-4" />
            <span>প্রিন্ট করুন</span>
          </button>
        </div>
      </div>

      {/* Certificate Document Container (Print Target) */}
      <div
        ref={certRef}
        id="printableCertificate"
        className="bg-white text-gray-900 p-8 sm:p-12 rounded-2xl shadow-xl border-8 border-double border-emerald-800 relative overflow-hidden print:border-4 print:shadow-none print:m-0 print:p-8"
        style={{ minHeight: '680px' }}
      >
        {/* Decorative Corner Ornaments */}
        <div className="absolute top-2 left-2 w-12 h-12 border-t-2 border-l-2 border-amber-600 rounded-tl-lg pointer-events-none" />
        <div className="absolute top-2 right-2 w-12 h-12 border-t-2 border-r-2 border-amber-600 rounded-tr-lg pointer-events-none" />
        <div className="absolute bottom-2 left-2 w-12 h-12 border-b-2 border-l-2 border-amber-600 rounded-bl-lg pointer-events-none" />
        <div className="absolute bottom-2 right-2 w-12 h-12 border-b-2 border-r-2 border-amber-600 rounded-br-lg pointer-events-none" />

        {/* Background Watermark Crest */}
        <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] pointer-events-none">
          <div className="w-96 h-96 border-[24px] border-emerald-900 rounded-full flex items-center justify-center">
            <span className="text-9xl font-bold text-emerald-900">০২</span>
          </div>
        </div>

        {/* Official Union Parishad Letterhead Pad Header (Exact Image Match) */}
        <div className="relative z-10 mb-6 border-b-2 border-emerald-950 pb-4">
          
          {/* Top Line 1: Bismillah */}
          <div className="text-center text-xs font-semibold text-gray-700 tracking-wide mb-1 font-serif">
            বিসমিল্লাহির রহমানির রাহিম
          </div>

          {/* Top Line 2: Government Title */}
          <div className="text-center text-sm font-bold text-gray-900 tracking-wide mb-3">
            গণপ্রজাতন্ত্রী বাংলাদেশ সরকার
          </div>

          {/* 3-Column Header: Left (Bangla Admin Info), Center (Official BD Seal), Right (English Admin Info) */}
          <div className="grid grid-cols-12 items-center text-xs gap-2 mb-4">
            
            {/* Left Admin Info (Bangla) */}
            <div className="col-span-4 text-left leading-tight text-gray-800 font-serif">
              <p className="font-bold text-sm text-emerald-950">মোঃ মাসুদুর রহমান</p>
              <p className="font-semibold text-gray-700">প্রশাসক</p>
              <p className="text-gray-800 font-medium">২নং বহেড়াতৈল ইউনিয়ন পরিষদ</p>
              <p className="text-gray-600">সখিপুর, টাঙ্গাইল।</p>
            </div>

            {/* Center: Official Bangladesh National Emblem Seal */}
            <div className="col-span-4 flex justify-center">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full border-2 border-emerald-800 bg-emerald-900 text-amber-300 flex items-center justify-center p-1 shadow-md relative">
                <div className="w-full h-full rounded-full border border-amber-400 bg-emerald-950 flex flex-col items-center justify-center text-center p-1">
                  <div className="w-7 h-7 bg-red-600 rounded-full flex items-center justify-center border border-yellow-400 shadow-inner my-0.5">
                    <span className="text-[10px] text-yellow-300 font-bold">★</span>
                  </div>
                  <span className="text-[8px] text-amber-300 font-bold uppercase tracking-tighter leading-none mt-0.5">
                    গণপ্রজাতন্ত্রী বাংলাদেশ
                  </span>
                  <span className="text-[7px] text-white font-semibold leading-none">
                    সরকার
                  </span>
                </div>
              </div>
            </div>

            {/* Right Admin Info (English) */}
            <div className="col-span-4 text-right leading-tight text-gray-800 font-sans">
              <p className="font-bold text-sm text-gray-950">Md. Masudur Rahman</p>
              <p className="font-semibold text-gray-700">Administrator</p>
              <p className="text-gray-800 font-medium">2 No. Baheratoil Union Parishad</p>
              <p className="text-gray-600">Sakhipur, Tangail.</p>
            </div>

          </div>

          {/* Big Center Title: 2নং বহেড়াতৈল ইউনিয়ন পরিষদ কার্যালয় */}
          <div className="text-center pt-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-emerald-950 tracking-tight font-serif drop-shadow-sm border-b-4 border-double border-emerald-900 inline-block pb-1 px-4">
              ২নং বহেড়াতৈল ইউনিয়ন পরিষদ কার্যালয়
            </h1>
          </div>

        </div>

        {/* Memo & Date Meta Line (Exact "সূত্র :" and "তারিখ :" style from pad) */}
        <div className="flex justify-between items-center text-xs sm:text-sm font-bold text-gray-900 mb-6 relative z-10 font-serif border-b border-dashed border-gray-300 pb-2">
          <div>
            <span className="text-emerald-950">সূত্র / স্মারক নং : </span>
            <span className="font-mono font-semibold text-gray-800">{record.memoNo}</span>
          </div>
          <div>
            <span className="text-emerald-950">তারিখ : </span>
            <span className="font-mono font-semibold text-gray-800">{record.issueDate}</span>
          </div>
        </div>

        {/* Certificate Title Banner */}
        <div className="text-center mb-8 relative z-10">
          <div className="inline-block bg-gradient-to-r from-emerald-900 via-emerald-800 to-emerald-900 text-amber-300 px-8 py-2 rounded-lg border-2 border-amber-400 shadow-md">
            <h2 className="text-xl sm:text-2xl font-bold tracking-wider font-serif">
              {record.certType}
            </h2>
          </div>
        </div>

        {/* Certificate Body Paragraph */}
        <div className="relative z-10 mb-12 px-2 sm:px-6">
          <div className="text-gray-900 text-base sm:text-lg leading-relaxed text-justify font-serif space-y-4 border-l-4 border-emerald-700 pl-4 bg-emerald-50/20 py-3 rounded-r-xl">
            <p className="whitespace-pre-line font-medium text-gray-900">
              {record.certificateBody}
            </p>
          </div>

          {/* Key Facts Summary Table inside Certificate */}
          <div className="mt-6 grid grid-cols-2 sm:grid-cols-5 gap-2 text-xs bg-gray-50 p-3 rounded-xl border border-gray-200">
            <div>
              <span className="text-gray-500 block">আবেদনকারী:</span>
              <span className="font-bold text-gray-800">{record.applicantName}</span>
            </div>
            <div>
              <span className="text-gray-500 block">পিতার নাম:</span>
              <span className="font-semibold text-gray-800">{record.fatherName}</span>
            </div>
            <div>
              <span className="text-gray-500 block">NID / জন্ম সনদ:</span>
              <span className="font-mono text-gray-800">{record.nidNumber || 'প্রযোজ্য নয়'}</span>
            </div>
            <div>
              <span className="text-gray-500 block">গ্রাম ও ওয়ার্ড:</span>
              <span className="font-semibold text-gray-800">{record.village} (ওয়ার্ড-{record.wardNo})</span>
            </div>
            <div>
              <span className="text-gray-500 block">ডাকঘর:</span>
              <span className="font-semibold text-gray-800">{record.postOffice}</span>
            </div>
          </div>
        </div>

        {/* Footer Security Features & Signatures */}
        <div className="mt-16 pt-8 border-t border-gray-200 grid grid-cols-2 gap-4 items-end relative z-10">
          
          {/* Security Stamp / Hologram & QR Code */}
          <div className="flex items-center gap-3">
            <div className="p-1.5 bg-white border border-gray-300 rounded-lg shadow-inner text-center shrink-0">
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=${encodeURIComponent(
                  `https://baheratailup.gov.bd/verify?certNo=${record.memoNo}&nid=${record.nidNumber}`
                )}`}
                alt="Verification QR"
                className="w-12 h-12 mx-auto"
              />
              <span className="text-[9px] text-gray-500 block mt-0.5 uppercase tracking-tighter">যাচাইকৃত QR</span>
            </div>
            <div className="hidden sm:block text-[11px] text-gray-500 leading-tight">
              <p className="font-bold text-emerald-900">ডিজিটাল ইউপি সিস্টেম</p>
              <p>০২নং বহেড়াতৈল ইউনিয়ন পরিষদ</p>
              <p className="text-[10px] text-emerald-700 font-medium mt-0.5">ডাকঘর: {record.postOffice}</p>
            </div>
          </div>

          {/* Chairman Signature Area */}
          <div className="text-center space-y-1">
            <div className="h-12 border-b border-dashed border-gray-400 w-44 mx-auto flex items-end justify-center pb-1">
              <span className="text-xs text-gray-400 italic font-serif">[অফিশিয়াল স্বাক্ষর ও সীল]</span>
            </div>
            <p className="font-bold text-sm text-emerald-950 mt-1 font-serif">চেয়ারম্যান</p>
            <p className="text-xs text-gray-700">০২নং বহেড়াতৈল ইউনিয়ন পরিষদ</p>
            <p className="text-[11px] text-gray-500">{record.upazila}, {record.district}।</p>
          </div>

        </div>

        {/* Certificate Bottom Notice */}
        <div className="mt-8 text-center text-[10px] text-gray-400 border-t border-gray-100 pt-3">
          <p>এই সনদপত্রটি ০২নং বহেড়াতৈল ইউনিয়ন পরিষদ ডিজিটাল অটোমেশন সিস্টেমের মাধ্যমে প্রস্তুতকৃত।</p>
        </div>

      </div>
    </div>
  );
};
