import React, { useState } from 'react';
import { Upload, Sparkles, RefreshCw, CheckCircle2, AlertCircle, Camera, Image as ImageIcon, X } from 'lucide-react';
import { NidExtractedData } from '../types';

interface NidScannerProps {
  onDataExtracted: (data: NidExtractedData) => void;
}

export const NidScanner: React.FC<NidScannerProps> = ({ onDataExtracted }) => {
  const [frontImage, setFrontImage] = useState<string | null>(null);
  const [backImage, setBackImage] = useState<string | null>(null);
  const [isExtracting, setIsExtracting] = useState<boolean>(false);
  const [extractStatus, setExtractStatus] = useState<{ type: 'idle' | 'success' | 'error'; message: string }>({
    type: 'idle',
    message: '',
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, isFront: boolean) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        const base64 = reader.result as string;
        if (isFront) {
          setFrontImage(base64);
        } else {
          setBackImage(base64);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const clearImage = (isFront: boolean) => {
    if (isFront) setFrontImage(null);
    else setBackImage(null);
  };

  const handleScanNid = async () => {
    if (!frontImage && !backImage) {
      setExtractStatus({
        type: 'error',
        message: 'অনুগ্রহ করে NID কার্ডের অন্তত একটি ছবি (সামনে বা পেছনে) আপলোড করুন।',
      });
      return;
    }

    setIsExtracting(true);
    setExtractStatus({
      type: 'idle',
      message: 'Gemini AI ছবি বিশ্লেষণ করছে...',
    });

    try {
      const response = await fetch('/api/extract-nid', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          frontImage: frontImage || null,
          backImage: backImage || null,
        }),
      });

      const result = await response.json();

      if (result.success && result.data) {
        onDataExtracted(result.data);
        setExtractStatus({
          type: 'success',
          message: 'NID তথ্য সফলভাবে এক্সট্র্যাক্ট করে ফরমে বসানো হয়েছে!',
        });
      } else {
        setExtractStatus({
          type: 'error',
          message: result.error || 'NID এক্সট্র্যাক্ট করতে ব্যর্থ হয়েছে। স্পষ্ট ছবি পুনরায় চেষ্টা করুন।',
        });
      }
    } catch (err: any) {
      setExtractStatus({
        type: 'error',
        message: 'নেটওয়ার্ক বা সার্ভার সমস্যা: ' + (err.message || 'Error occurred'),
      });
    } finally {
      setIsExtracting(false);
    }
  };

  const handleDemoFill = () => {
    const demoData: NidExtractedData = {
      applicantName: 'মোঃ আব্দুর রহমান',
      applicantNameEng: 'MD. ABDUR RAHMAN',
      fatherName: 'মোঃ জব্বার আলী',
      motherName: 'মোছাঃ ছালেহা বেগম',
      spouseName: 'মোছাঃ ফাতেমা খাতুন',
      nidNumber: '১৯৯১২৬৯১৫৬৪০০১২৩৪',
      dob: '1991-05-12',
      village: 'বহেড়াতৈল (পশ্চিমপাড়া)',
      postOffice: 'বহেড়াতৈল',
      upazila: 'সখিপুর',
      district: 'টাঙ্গাইল',
      gender: 'পুরুষ',
      bloodGroup: 'B+',
    };
    onDataExtracted(demoData);
    setExtractStatus({
      type: 'success',
      message: 'ডেমো ডেটা ডেমোনস্ট্রেশনের জন্য ফরমে বসানো হয়েছে!',
    });
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-emerald-100 p-5 font-bengali">
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-emerald-100 text-emerald-800 rounded-lg">
            <Camera className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-gray-900">NID স্মার্ট স্ক্যানার (AI OCR)</h2>
            <p className="text-xs text-gray-500">NID কার্ডের ছবি থেকে স্বয়ংক্রিয়ভাবে তথ্য গ্রহণ</p>
          </div>
        </div>
        <button
          onClick={handleDemoFill}
          className="text-xs bg-emerald-50 text-emerald-700 hover:bg-emerald-100 px-2.5 py-1.5 rounded-lg border border-emerald-200 font-semibold transition"
          title="পরীক্ষা করার জন্য নমুনা ডেটা বসান"
        >
          ডেমো ডেটা
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
        
        {/* Front Image Upload */}
        <div className="relative border-2 border-dashed border-emerald-200 hover:border-emerald-400 bg-emerald-50/30 rounded-xl p-3 text-center transition">
          {frontImage ? (
            <div className="relative group">
              <img
                src={frontImage}
                alt="NID Front"
                className="w-full h-32 object-contain rounded-lg bg-gray-900/5 p-1"
              />
              <button
                onClick={() => clearImage(true)}
                className="absolute top-1 right-1 p-1 bg-red-600 text-white rounded-full shadow hover:bg-red-700"
                title="ছবি সরান"
              >
                <X className="w-3.5 h-3.5" />
              </button>
              <span className="text-[11px] font-medium text-emerald-800 mt-1 block">NID সামনের দিক</span>
            </div>
          ) : (
            <label className="cursor-pointer block py-3">
              <Upload className="w-6 h-6 text-emerald-600 mx-auto mb-1 opacity-80" />
              <span className="text-xs font-semibold text-emerald-900 block">NID সামনের ছবি</span>
              <span className="text-[10px] text-gray-500 block mt-0.5">ক্লিক করুন বা ড্র্যাগ করুন</span>
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => handleFileChange(e, true)}
              />
            </label>
          )}
        </div>

        {/* Back Image Upload */}
        <div className="relative border-2 border-dashed border-teal-200 hover:border-teal-400 bg-teal-50/30 rounded-xl p-3 text-center transition">
          {backImage ? (
            <div className="relative group">
              <img
                src={backImage}
                alt="NID Back"
                className="w-full h-32 object-contain rounded-lg bg-gray-900/5 p-1"
              />
              <button
                onClick={() => clearImage(false)}
                className="absolute top-1 right-1 p-1 bg-red-600 text-white rounded-full shadow hover:bg-red-700"
                title="ছবি সরান"
              >
                <X className="w-3.5 h-3.5" />
              </button>
              <span className="text-[11px] font-medium text-teal-800 mt-1 block">NID পেছনের দিক</span>
            </div>
          ) : (
            <label className="cursor-pointer block py-3">
              <ImageIcon className="w-6 h-6 text-teal-600 mx-auto mb-1 opacity-80" />
              <span className="text-xs font-semibold text-teal-900 block">NID পেছনের ছবি</span>
              <span className="text-[10px] text-gray-500 block mt-0.5">ক্লিক করুন বা ড্র্যাগ করুন</span>
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => handleFileChange(e, false)}
              />
            </label>
          )}
        </div>

      </div>

      {/* Action Button */}
      <button
        onClick={handleScanNid}
        disabled={isExtracting || (!frontImage && !backImage)}
        className={`w-full py-2.5 px-4 rounded-xl font-bold text-sm flex items-center justify-center gap-2 shadow hover:shadow-md transition ${
          isExtracting || (!frontImage && !backImage)
            ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
            : 'bg-gradient-to-r from-amber-500 to-amber-600 text-amber-950 hover:from-amber-400 hover:to-amber-500'
        }`}
      >
        {isExtracting ? (
          <>
            <RefreshCw className="w-4 h-4 animate-spin text-amber-900" />
            <span>Gemini AI ছবি বিশ্লেষণ করছে...</span>
          </>
        ) : (
          <>
            <Sparkles className="w-4 h-4 text-amber-950" />
            <span>AI দিয়ে NID তথ্য অটো ফিল করুন</span>
          </>
        )}
      </button>

      {/* Status Feedback */}
      {extractStatus.message && (
        <div
          className={`mt-3 p-2.5 rounded-lg text-xs font-medium flex items-center gap-2 ${
            extractStatus.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
              : extractStatus.type === 'error'
              ? 'bg-red-50 text-red-800 border border-red-200'
              : 'bg-amber-50 text-amber-900 border border-amber-200'
          }`}
        >
          {extractStatus.type === 'success' && <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />}
          {extractStatus.type === 'error' && <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />}
          {extractStatus.type === 'idle' && <RefreshCw className="w-4 h-4 text-amber-600 animate-spin shrink-0" />}
          <span>{extractStatus.message}</span>
        </div>
      )}
    </div>
  );
};
