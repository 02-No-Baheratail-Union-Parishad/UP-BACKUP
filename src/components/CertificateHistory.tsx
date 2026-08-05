import React, { useState } from 'react';
import { GeneratedCertificateRecord } from '../types';
import { Search, Trash2, Eye, Printer, Copy, Download, History, FileText, Calendar } from 'lucide-react';

interface CertificateHistoryProps {
  records: GeneratedCertificateRecord[];
  onSelectRecord: (record: GeneratedCertificateRecord) => void;
  onDeleteRecord: (id: string) => void;
  onClearAll: () => void;
}

export const CertificateHistory: React.FC<CertificateHistoryProps> = ({
  records,
  onSelectRecord,
  onDeleteRecord,
  onClearAll,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('ALL');

  const filteredRecords = records.filter((rec) => {
    const matchesSearch =
      rec.applicantName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      rec.nidNumber.includes(searchTerm) ||
      rec.memoNo.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesType = filterType === 'ALL' || rec.certType === filterType;

    return matchesSearch && matchesType;
  });

  const handleExportJson = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(records, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `baheratail_up_certificates_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-emerald-100 p-5 font-bengali space-y-4">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-emerald-100 text-emerald-800 rounded-lg">
            <History className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-gray-900">সনদপত্র আর্কাইভ ও হিস্ট্রি</h2>
            <p className="text-xs text-gray-500">সংরক্ষিত সকল সনদপত্রের ডিজিটাল রেজিস্টার ({records.length} টি)</p>
          </div>
        </div>

        {records.length > 0 && (
          <div className="flex items-center gap-2">
            <button
              onClick={handleExportJson}
              className="flex items-center gap-1.5 text-xs font-semibold bg-emerald-50 text-emerald-700 hover:bg-emerald-100 px-3 py-1.5 rounded-lg border border-emerald-200 transition"
            >
              <Download className="w-3.5 h-3.5" />
              <span>ব্যাকআপ ডাটাসেট</span>
            </button>

            <button
              onClick={onClearAll}
              className="flex items-center gap-1.5 text-xs font-semibold bg-red-50 text-red-700 hover:bg-red-100 px-3 py-1.5 rounded-lg border border-red-200 transition"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>সকল তথ্য মুছুন</span>
            </button>
          </div>
        )}
      </div>

      {/* Filter & Search Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="sm:col-span-2 relative">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="আবেদনকারীর নাম, NID নম্বর বা স্মারক নম্বর দিয়ে খুঁজুন..."
            className="w-full text-xs pl-9 pr-3 py-2 rounded-xl border border-gray-200 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
          />
        </div>

        <div>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="w-full text-xs rounded-xl border border-gray-200 p-2 bg-gray-50 text-gray-700 font-semibold"
          >
            <option value="ALL">সকল সনদের ধরন</option>
            <option value="নাগরিকত্ব সনদ">নাগরিকত্ব সনদ</option>
            <option value="চারিত্রিক সনদ">চারিত্রিক সনদ</option>
            <option value="পরিচয়পত্র ও প্রত্যয়নপত্র">পরিচয়পত্র ও প্রত্যয়নপত্র</option>
            <option value="ভূমিহীন প্রত্যয়নপত্র">ভূমিহীন প্রত্যয়নপত্র</option>
            <option value="বাৎসরিক আয় সনদ">বাৎসরিক আয় সনদ</option>
            <option value="পুনর্বিবাহ না হওয়ার সনদ">পুনর্বিবাহ না হওয়ার সনদ</option>
          </select>
        </div>
      </div>

      {/* Table / List */}
      {filteredRecords.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-xl border border-dashed border-gray-200">
          <FileText className="w-10 h-10 text-gray-300 mx-auto mb-2" />
          <p className="text-sm font-bold text-gray-600">কোনো সনদপত্র পাওয়া যায়নি</p>
          <p className="text-xs text-gray-400 mt-1">নতুন একটি সনদপত্র প্রস্তুত করে আর্কিভে সংরক্ষণ করুন।</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-gray-200">
          <table className="w-full text-left text-xs text-gray-700">
            <thead className="bg-emerald-900 text-emerald-100 font-bold border-b border-emerald-800">
              <tr>
                <th className="p-3">আবেদনকারীর নাম</th>
                <th className="p-3">সনদের ধরন</th>
                <th className="p-3">পিতার নাম</th>
                <th className="p-3">স্মারক নং / তারিখ</th>
                <th className="p-3 text-right">অ্যাকশন</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {filteredRecords.map((rec) => (
                <tr key={rec.id} className="hover:bg-emerald-50/40 transition">
                  <td className="p-3">
                    <div className="font-bold text-emerald-950">{rec.applicantName}</div>
                    <div className="text-[11px] text-gray-500">{rec.village}, ওয়ার্ড: {rec.wardNo}</div>
                  </td>

                  <td className="p-3">
                    <span className="bg-emerald-100 text-emerald-800 text-[11px] font-bold px-2 py-0.5 rounded-md border border-emerald-200">
                      {rec.certType}
                    </span>
                  </td>

                  <td className="p-3 font-medium text-gray-800">
                    {rec.fatherName}
                  </td>

                  <td className="p-3 font-mono text-[11px]">
                    <div className="text-gray-900 font-semibold">{rec.memoNo}</div>
                    <div className="text-gray-500 flex items-center gap-1 mt-0.5">
                      <Calendar className="w-3 h-3 text-gray-400" />
                      {rec.issueDate}
                    </div>
                  </td>

                  <td className="p-3 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => onSelectRecord(rec)}
                        className="p-1.5 bg-emerald-100 text-emerald-800 hover:bg-emerald-200 rounded-lg transition"
                        title="প্রিন্ট ও ভিউ করুন"
                      >
                        <Eye className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => onDeleteRecord(rec.id)}
                        className="p-1.5 bg-red-100 text-red-700 hover:bg-red-200 rounded-lg transition"
                        title="মুছে ফেলুন"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

    </div>
  );
};
