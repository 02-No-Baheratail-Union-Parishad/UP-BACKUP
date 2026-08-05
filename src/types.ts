export interface NidExtractedData {
  applicantName: string;
  applicantNameEng?: string;
  fatherName: string;
  motherName: string;
  spouseName?: string;
  nidNumber: string;
  dob: string;
  village: string;
  postOffice?: string;
  upazila?: string;
  district?: string;
  gender?: string;
  bloodGroup?: string;
}

export type CertificateType =
  | 'নাগরিকত্ব সনদ'
  | 'চারিত্রিক সনদ'
  | 'পরিচয়পত্র ও প্রত্যয়নপত্র'
  | 'ভূমিহীন প্রত্যয়নপত্র'
  | 'বাৎসরিক আয় সনদ'
  | 'পুনর্বিবাহ না হওয়ার সনদ'
  | 'অবিবাহিত সনদ'
  | 'মৃত ব্যক্তির ওয়ারিশান বিবরণী'
  | 'অভিভাবকের সম্মতিপত্র'
  | 'বংশগত পরিচয় সনদ';

export interface CertificateFormData {
  applicantName: string;
  applicantNameEng?: string;
  fatherName: string;
  motherName: string;
  spouseName?: string;
  nidNumber: string;
  dob: string;
  village: string;
  postOffice: string;
  upazila: string;
  district: string;
  wardNo: string;
  certType: CertificateType;
  promptHint?: string;
  issueDate: string;
  memoNo: string;
}

export interface GeneratedCertificateRecord extends CertificateFormData {
  id: string;
  certificateBody: string;
  createdAt: string;
  chairmanName: string;
  unionName: string;
}

export interface AppsScriptFiles {
  codeGs: string;
  geminiGs: string;
  indexHtml: string;
}
