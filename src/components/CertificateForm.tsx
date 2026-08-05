import React, { useState, useEffect } from 'react';
import { CertificateFormData, CertificateType, NidExtractedData } from '../types';
import { User, FileBadge, Calendar, MapPin, Hash, Sparkles, Send, ShieldCheck, Mail, Building } from 'lucide-react';

interface CertificateFormProps {
  initialData?: Partial<NidExtractedData>;
  onSubmitForm: (formData: CertificateFormData) => void;
  isLoading: boolean;
}

const CERTIFICATE_TYPES: CertificateType[] = [
  'নাগরিকত্ব সনদ',
  'চারিত্রিক সনদ',
  'পরিচয়পত্র ও প্রত্যয়নপত্র',
  'ভূমিহীন প্রত্যয়নপত্র',
  'বাৎসরিক আয় সনদ',
  'পুনর্বিবাহ না হওয়ার সনদ',
  'অবিবাহিত সনদ',
  'মৃত ব্যক্তির ওয়ারিশান বিবরণী',
  'অভিভাবকের সম্মতিপত্র',
  'বংশগত পরিচয় সনদ',
];

// Official 15 Villages of 02 Union Parishad, Baheratail
const UNION_VILLAGES = [
  'বহেড়াতৈল',
  'ডাবাইল',
  'কামারঙ্গ',
  'গোহাইলবাড়ী',
  'যোগীরকোফা',
  'ঘাটেশ্বরী',
  'ভুগলীচালা',
  'ধোপার চালা',
  'আমতৈল',
  'শালগ্রামপুর',
  'বগাপ্রতিমা',
  'আন্দি',
  'ছাতিয়াচালা',
  'বেতুয়া',
  'কালিয়ান',
];

// Official Post Offices in Sakhipur Upazila / Union
const POST_OFFICES = [
  { label: 'বহেড়াতৈল - ১৯৫০', value: 'বহেড়াতৈল' },
  { label: 'নাগবাড়ী - ১৯৭২', value: 'নাগবাড়ী' },
  { label: 'বেতুয়া - ১৯৫০', value: 'বেতুয়া' },
  { label: 'ছিলিমপুর - ১৯৫০', value: 'ছিলিমপুর' },
  { label: 'অন্যান্য (নিজে লিখুন)', value: 'OTHER' },
];

export const CertificateForm: React.FC<CertificateFormProps> = ({
  initialData,
  onSubmitForm,
  isLoading,
}) => {
  const [formData, setFormData] = useState<CertificateFormData>({
    applicantName: '',
    applicantNameEng: '',
    fatherName: '',
    motherName: '',
    spouseName: '',
    nidNumber: '',
    dob: '',
    village: 'বহেড়াতৈল',
    postOffice: 'বহেড়াতৈল',
    upazila: 'সখিপুর',
    district: 'টাঙ্গাইল',
    wardNo: '০২',
    certType: 'নাগরিকত্ব সনদ',
    promptHint: '',
    issueDate: new Date().toISOString().split('T')[0],
    memoNo: `৪৬.৪৩.৯৩${Math.floor(10 + Math.random() * 90)}.${Math.floor(100 + Math.random() * 900)}.${new Date().getFullYear()}`,
  });

  // Track if village or post office selected 'OTHER'
  const [villageSelect, setVillageSelect] = useState<string>('বহেড়াতৈল');
  const [customVillage, setCustomVillage] = useState<string>('');

  const [postOfficeSelect, setPostOfficeSelect] = useState<string>('বহেড়াতৈল');
  const [customPostOffice, setCustomPostOffice] = useState<string>('');

  // Auto update placeholder/hint when certType changes
  useEffect(() => {
    let defaultHint = '';
    switch (formData.certType) {
      case 'বাৎসরিক আয় সনদ':
        defaultHint = 'আবেদনকারীর সকল উৎস হতে আনুমানিক বাৎসরিক আয় ৩,৫০,০০০ (তিন লক্ষ পঞ্চাশ হাজার) টাকা।';
        break;
      case 'চারিত্রিক সনদ':
        defaultHint = 'আমার জানামতে সে একজন সৎ, সামাজিক ও চরিত্রবান নাগরিক। তাহার বিরুদ্ধে রাষ্ট্রীয় কোনো অভিযোগ নাই।';
        break;
      case 'ভূমিহীন প্রত্যয়নপত্র':
        defaultHint = 'আবেদনকারী বা তাহার পরিবারের নামে কোনো নিজস্ব বসতভিটা বা কৃষি জমি নাই, সে প্রকৃত ভূমিহীন।';
        break;
      case 'মৃত ব্যক্তির ওয়ারিশান বিবরণী':
        defaultHint = 'মৃত ব্যক্তির মৃত্যুর তারিখ: ১২-০৫-২০২৩। তিনি মৃত্যুকালে ২ পুত্র ও ১ কন্যা সন্তান ওয়ারিশ রাখিয়া যান।';
        break;
      case 'অবিবাহিত সনদ':
        defaultHint = 'আবেদনকারী এ যাবৎ বিবাহ বন্ধনে আবদ্ধ হন নাই, সে একজন অবিবাহিত নাগরিক।';
        break;
      case 'পুনর্বিবাহ না হওয়ার সনদ':
        defaultHint = 'তাহার স্বামী পরলোকগমন করার পর সে অদ্যবধি কোনো দ্বিতীয় বিবাহে আবদ্ধ হন নাই।';
        break;
      default:
        defaultHint = 'নিয়মিত জন্মসূত্রে ০২নং বহেড়াতৈল ইউনিয়ন পরিষদের স্থায়ী বাসিন্দা ও সুচরিত্রের অধিকারী।';
    }
    setFormData((prev) => ({ ...prev, promptHint: defaultHint }));
  }, [formData.certType]);

  // Whenever initialData from NID scanner updates, reflect into state
  useEffect(() => {
    if (initialData) {
      const scannedVillage = initialData.village || '';
      const scannedPostOffice = initialData.postOffice || '';

      // Match Village
      if (scannedVillage && UNION_VILLAGES.includes(scannedVillage)) {
        setVillageSelect(scannedVillage);
        setCustomVillage('');
      } else if (scannedVillage) {
        setVillageSelect('OTHER');
        setCustomVillage(scannedVillage);
      }

      // Match Post Office
      const matchedPo = POST_OFFICES.find((p) => p.value === scannedPostOffice);
      if (matchedPo && matchedPo.value !== 'OTHER') {
        setPostOfficeSelect(matchedPo.value);
        setCustomPostOffice('');
      } else if (scannedPostOffice) {
        setPostOfficeSelect('OTHER');
        setCustomPostOffice(scannedPostOffice);
      }

      setFormData((prev) => ({
        ...prev,
        applicantName: initialData.applicantName || prev.applicantName,
        applicantNameEng: initialData.applicantNameEng || prev.applicantNameEng,
        fatherName: initialData.fatherName || prev.fatherName,
        motherName: initialData.motherName || prev.motherName,
        spouseName: initialData.spouseName || prev.spouseName,
        nidNumber: initialData.nidNumber || prev.nidNumber,
        dob: initialData.dob || prev.dob,
        village: scannedVillage || prev.village,
        postOffice: scannedPostOffice || prev.postOffice,
        upazila: initialData.upazila || prev.upazila,
        district: initialData.district || prev.district,
      }));
    }
  }, [initialData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleVillageSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    setVillageSelect(val);
    if (val !== 'OTHER') {
      setFormData((prev) => ({ ...prev, village: val }));
    } else {
      setFormData((prev) => ({ ...prev, village: customVillage }));
    }
  };

  const handleCustomVillageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setCustomVillage(val);
    setFormData((prev) => ({ ...prev, village: val }));
  };

  const handlePostOfficeSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    setPostOfficeSelect(val);
    if (val !== 'OTHER') {
      setFormData((prev) => ({ ...prev, postOffice: val }));
    } else {
      setFormData((prev) => ({ ...prev, postOffice: customPostOffice }));
    }
  };

  const handleCustomPostOfficeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setCustomPostOffice(val);
    setFormData((prev) => ({ ...prev, postOffice: val }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmitForm(formData);
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-emerald-100 p-5 font-bengali">
      <div className="flex items-center gap-2 mb-4 pb-3 border-b border-gray-100">
        <div className="p-2 bg-emerald-100 text-emerald-800 rounded-lg">
          <FileBadge className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-base font-bold text-gray-900">২. আবেদনকারী ও সনদের সম্পূর্ণ বিবরণী</h2>
          <p className="text-xs text-gray-500">সরকারি রেজিস্টারের সাথে সামঞ্জস্য রেখে তথ্য প্রদান করুন</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        
        {/* Certificate Type Selector */}
        <div>
          <label className="block text-xs font-bold text-emerald-900 mb-1 flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            সনদের ধরন <span className="text-red-500">*</span>
          </label>
          <select
            name="certType"
            value={formData.certType}
            onChange={handleChange}
            className="w-full text-sm rounded-xl border border-emerald-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 p-2.5 bg-emerald-50/30 font-semibold text-emerald-950 shadow-sm"
          >
            {CERTIFICATE_TYPES.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </div>

        {/* Name Fields */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              আবেদনকারীর নাম (বাংলা) <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
              <input
                type="text"
                name="applicantName"
                value={formData.applicantName}
                onChange={handleChange}
                required
                placeholder="উদা: মোঃ আব্দুর রহমান"
                className="w-full text-sm pl-9 pr-3 py-2 rounded-lg border border-gray-200 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              আবেদনকারীর নাম (English - ঐচ্ছিক)
            </label>
            <input
              type="text"
              name="applicantNameEng"
              value={formData.applicantNameEng || ''}
              onChange={handleChange}
              placeholder="e.g. MD. ABDUR RAHMAN"
              className="w-full text-sm px-3 py-2 rounded-lg border border-gray-200 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
            />
          </div>
        </div>

        {/* NID & Parents */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              জাতীয় পরিচয়পত্র (NID) / জন্ম সনদ
            </label>
            <div className="relative">
              <Hash className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
              <input
                type="text"
                name="nidNumber"
                value={formData.nidNumber}
                onChange={handleChange}
                placeholder="১৭ বা ১০ ডিজিটের NID"
                className="w-full text-sm pl-9 pr-3 py-2 rounded-lg border border-gray-200 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              পিতার নাম <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="fatherName"
              value={formData.fatherName}
              onChange={handleChange}
              required
              placeholder="পিতার নাম"
              className="w-full text-sm px-3 py-2 rounded-lg border border-gray-200 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              মাতার নাম <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="motherName"
              value={formData.motherName}
              onChange={handleChange}
              required
              placeholder="মাতার নাম"
              className="w-full text-sm px-3 py-2 rounded-lg border border-gray-200 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
            />
          </div>
        </div>

        {/* Spouse & Village Address & Ward */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              স্বামী/স্ত্রীর নাম (যদি থাকে)
            </label>
            <input
              type="text"
              name="spouseName"
              value={formData.spouseName || ''}
              onChange={handleChange}
              placeholder="স্বামী বা স্ত্রীর নাম"
              className="w-full text-sm px-3 py-2 rounded-lg border border-gray-200 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
            />
          </div>

          {/* Village Select + Custom Input */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1 flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-emerald-600" />
              গ্রাম নির্বাচন <span className="text-red-500">*</span>
            </label>
            <select
              value={villageSelect}
              onChange={handleVillageSelectChange}
              className="w-full text-sm px-3 py-2 rounded-lg border border-gray-200 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 bg-white"
            >
              {UNION_VILLAGES.map((v, idx) => (
                <option key={v} value={v}>
                  {idx + 1}. {v}
                </option>
              ))}
              <option value="OTHER">১৬. অন্যান্য (নিজে লিখুন)</option>
            </select>
            {villageSelect === 'OTHER' && (
              <input
                type="text"
                value={customVillage}
                onChange={handleCustomVillageChange}
                placeholder="গ্রামের নাম বাংলায় লিখুন"
                className="w-full text-xs mt-1 px-3 py-1.5 rounded-lg border border-amber-300 bg-amber-50/50"
                required
              />
            )}
          </div>

          {/* Ward Selector */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">ওয়ার্ড নং <span className="text-red-500">*</span></label>
            <select
              name="wardNo"
              value={formData.wardNo}
              onChange={handleChange}
              className="w-full text-sm px-3 py-2 rounded-lg border border-gray-200 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 bg-white"
            >
              {['০১', '০২', '০৩', '০৪', '০৫', '০৬', '০৭', '০৮', '০৯'].map((w) => (
                <option key={w} value={w}>
                  ওয়ার্ড নং {w}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Post Office (ডাকঘর), Upazila, District Section */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-emerald-50/40 p-3.5 rounded-xl border border-emerald-100">
          
          {/* Post Office Dropdown */}
          <div>
            <label className="block text-xs font-bold text-emerald-900 mb-1 flex items-center gap-1">
              <Mail className="w-3.5 h-3.5 text-emerald-700" />
              ডাকঘর (Post Office) <span className="text-red-500">*</span>
            </label>
            <select
              value={postOfficeSelect}
              onChange={handlePostOfficeSelectChange}
              className="w-full text-sm px-3 py-2 rounded-lg border border-emerald-200 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 bg-white font-medium"
            >
              {POST_OFFICES.map((p) => (
                <option key={p.value} value={p.value}>
                  {p.label}
                </option>
              ))}
            </select>
            {postOfficeSelect === 'OTHER' && (
              <input
                type="text"
                value={customPostOffice}
                onChange={handleCustomPostOfficeChange}
                placeholder="ডাকঘরের নাম ও কোড লিখুন"
                className="w-full text-xs mt-1.5 px-3 py-1.5 rounded-lg border border-amber-300 bg-amber-50"
                required
              />
            )}
          </div>

          {/* Upazila */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1 flex items-center gap-1">
              <Building className="w-3.5 h-3.5 text-gray-500" />
              উপজেলা
            </label>
            <input
              type="text"
              name="upazila"
              value={formData.upazila}
              onChange={handleChange}
              className="w-full text-sm px-3 py-2 rounded-lg border border-gray-200 bg-white"
            />
          </div>

          {/* District */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">জেলা</label>
            <input
              type="text"
              name="district"
              value={formData.district}
              onChange={handleChange}
              className="w-full text-sm px-3 py-2 rounded-lg border border-gray-200 bg-white"
            />
          </div>

        </div>

        {/* Memo & Issue Date */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-gray-50 p-3 rounded-xl border border-gray-200">
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">স্মারক নম্বর (অফিশিয়াল)</label>
            <input
              type="text"
              name="memoNo"
              value={formData.memoNo}
              onChange={handleChange}
              className="w-full text-xs font-mono px-3 py-1.5 rounded-lg border border-gray-300 bg-white"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">ইস্যুর তারিখ</label>
            <div className="relative">
              <Calendar className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-2.5" />
              <input
                type="date"
                name="issueDate"
                value={formData.issueDate}
                onChange={handleChange}
                className="w-full text-xs pl-8 pr-3 py-1.5 rounded-lg border border-gray-300 bg-white"
              />
            </div>
          </div>
        </div>

        {/* Prompt Hint / Extra Specifics for AI */}
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1">
            অতিরিক্ত তথ্য / বিশেষ পরিমার্জন (Gemini AI সরকারি খসড়ার জন্য)
          </label>
          <textarea
            name="promptHint"
            value={formData.promptHint}
            onChange={handleChange}
            rows={2}
            placeholder="উদাহরণ: বাৎসরিক আয় ৩,৫০,০০০ টাকা / অথবা ওয়ারিশ বিবরণী বিস্তারিত..."
            className="w-full text-xs rounded-xl border border-gray-200 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 p-2.5"
          />
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isLoading}
          className={`w-full py-3 px-4 rounded-xl font-bold text-sm flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition ${
            isLoading
              ? 'bg-emerald-700 text-white opacity-80 cursor-wait'
              : 'bg-emerald-700 hover:bg-emerald-800 text-white'
          }`}
        >
          {isLoading ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              <span>Gemini AI সরকারি ভাষার নির্ভুল খসড়া তৈরি করছে...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4 text-amber-300" />
              <span>AI দিয়ে অফিশিয়াল প্রত্যয়নপত্র প্রস্তুত করুন</span>
              <Send className="w-4 h-4 ml-1 opacity-80" />
            </>
          )}
        </button>

      </form>
    </div>
  );
};

