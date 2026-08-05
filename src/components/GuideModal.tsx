import React from 'react';
import { BookOpen, Landmark, Sparkles, CheckCircle, ShieldCheck, Code2, Cpu, HelpCircle } from 'lucide-react';

export const GuideModal: React.FC = () => {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-emerald-100 p-6 font-bengali space-y-6">
      
      {/* Banner */}
      <div className="bg-gradient-to-r from-emerald-900 to-teal-800 text-white rounded-xl p-5 shadow">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-amber-500/20 border border-amber-400/40 rounded-xl">
            <Landmark className="w-8 h-8 text-amber-300" />
          </div>
          <div>
            <h2 className="text-xl font-bold">ব্যবহারের সহায়িকা ও নির্দেশিকা</h2>
            <p className="text-xs text-emerald-100">
              ০২নং বহেড়াতৈল ইউনিয়ন পরিষদ ডিজিটাল সনদপত্র ও অটোমেশন সিস্টেম
            </p>
          </div>
        </div>
      </div>

      {/* Feature Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
        
        <div className="border border-emerald-200 bg-emerald-50/30 p-4 rounded-xl space-y-2">
          <div className="flex items-center gap-2 text-emerald-900 font-bold text-sm">
            <Sparkles className="w-4 h-4 text-amber-500" />
            <span>১. AI NID স্ক্যানার ব্যবহার</span>
          </div>
          <p className="text-gray-600 leading-relaxed">
            এনআইডি কার্ডের সামনের ও পেছনের দিক আপলোড করে <strong>'AI দিয়ে NID তথ্য অটো ফিল করুন'</strong> বাটনে চাপলেই সিস্টেমটি স্বয়ংক্রিয়ভাবে আবেদনকারীর নাম, পিতার নাম, মাতার নাম, এনআইডি নম্বর ও ঠিকানা রিড করে ফরমে বসিয়ে দেবে।
          </p>
        </div>

        <div className="border border-teal-200 bg-teal-50/30 p-4 rounded-xl space-y-2">
          <div className="flex items-center gap-2 text-teal-900 font-bold text-sm">
            <ShieldCheck className="w-4 h-4 text-teal-600" />
            <span>২. পরিমার্জিত সরকারি বাংলা জেনারেটর</span>
          </div>
          <p className="text-gray-600 leading-relaxed">
            নাগরিকত্ব, চারিত্রিক, ভূমিহীন, বাৎসরিক আয়, পুনর্বিবাহ না হওয়া সনদ ইত্যাদির ধরন নির্বাচন করে সাবমিট দিলে Gemini AI সম্পূর্ণ সরকারি প্রশাসনিক ব্যাকরণ মেনে ৩-৪ লাইনের নির্ভুল সনদ বক্তব্য তৈরি করে।
          </p>
        </div>

        <div className="border border-amber-200 bg-amber-50/30 p-4 rounded-xl space-y-2">
          <div className="flex items-center gap-2 text-amber-900 font-bold text-sm">
            <CheckCircle className="w-4 h-4 text-amber-600" />
            <span>৩. প্রিন্ট ও ডিজিটাল আর্কাইভিং</span>
          </div>
          <p className="text-gray-600 leading-relaxed">
            তৈরিকৃত সনদপত্রটি সাথে সাথে অফিশিয়াল লেটারহেড প্যাডে প্রিন্ট করা যাবে এবং পরবর্তীতে খোঁজার জন্য ব্যাকআপ ফাইল হিসেবে লোকাল আর্কাইভে সংরক্ষণ করে রাখা যায়।
          </p>
        </div>

        <div className="border border-purple-200 bg-purple-50/30 p-4 rounded-xl space-y-2">
          <div className="flex items-center gap-2 text-purple-900 font-bold text-sm">
            <Code2 className="w-4 h-4 text-purple-600" />
            <span>৪. Google Apps Script ইন্টিগ্রেশন (100% Free)</span>
          </div>
          <p className="text-gray-600 leading-relaxed">
            যদি আপনার নিজস্ব গুগল ড্রাইভে একদম বিনামূল্যে (Free Tier) এই সিস্টেম চালাতে চান, তবে 'Apps Script কোড' ট্যাব থেকে ৩টি ফাইলের কোড অনায়াসে কপি করে script.google.com এ বসিয়ে নিতে পারেন।
          </p>
        </div>

      </div>

      {/* Office Info Footer */}
      <div className="bg-gray-50 rounded-xl p-4 border border-gray-200 text-xs text-gray-700 flex flex-col sm:flex-row justify-between items-center gap-2">
        <div>
          <span className="font-bold text-emerald-900">কার্যালয়:</span> ০২নং বহেড়াতৈল ইউনিয়ন পরিষদ কার্যালয়, সখিপুর, টাঙ্গাইল।
        </div>
        <div className="text-gray-500">
          প্রযুক্তি সহায়তায়: Google Gemini 3.6 Flash AI Engine
        </div>
      </div>

    </div>
  );
};
