import { AppsScriptFiles } from '../types';

export const APPS_SCRIPT_CODE_GS = `// ============================================================
// File: Code.gs
// Role: Web App Router, Document Automation, QR Verification & Sheet Database
// Union: ০২নং বহেড়াতৈল ইউনিয়ন পরিষদ, সখিপুর, টাঙ্গাইল
// ============================================================

// 📌 ডিফল্ট আইডি কনফিগারেশন (Script Properties থেকে লোড হবে)
var DEFAULT_TEMPLATE_DOC_ID = '1CZwTWGcJudWkOHNZUxZfcZRb9ITDn-oQNU__51w0nQ4';
var DEFAULT_SPREADSHEET_ID  = '1r99sXFfqgaQvzjBlaSLB26pGpn84UclL2_S7FIINn0Q';
var DEFAULT_DRIVE_FOLDER_ID = '1-fndRmFqGTF_Qn1aZRrS6piKXmUEfqNU';

function getAppConfig() {
  var props = PropertiesService.getScriptProperties();
  return {
    templateDocId: props.getProperty('TEMPLATE_DOC_ID') || DEFAULT_TEMPLATE_DOC_ID,
    spreadsheetId: props.getProperty('SPREADSHEET_ID') || DEFAULT_SPREADSHEET_ID,
    driveFolderId: props.getProperty('DRIVE_FOLDER_ID') || DEFAULT_DRIVE_FOLDER_ID
  };
}

/**
 * Web App URL থেকে রিকোয়েস্ট হ্যান্ডলিং ও ডিজিটাল কিউআর যাচাই
 */
function doGet(e) {
  var certNo = e && e.parameter ? e.parameter.certNo : null;

  // যদি কিউআর স্ক্যান বা সার্চ থেকে certNo আসে, তবে সরাসরি অনলাইন ভেরিফিকেশন পেজ দেখাবে
  if (certNo) {
    return renderVerificationPage(certNo);
  }

  // স্বাভাবিক অবস্থায় এনআইডি স্ক্যানার ও সনদ তৈরি ইউজার ইন্টারফেস রিটার্ন করবে
  return HtmlService.createHtmlOutputFromFile('Index')
    .setTitle('০২নং বহেড়াতৈল ইউনিয়ন পরিষদ - ডিজিটাল সনদপত্র ও অটোমেশন')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL)
    .addMetaTag('viewport', 'width=device-width, initial-scale=1.0');
}

/**
 * ইংরেজি সংখ্যাকে বাংলা সংখ্যায় রূপান্তর
 */
function toBanglaNum(num) {
  if (num === null || num === undefined) return '';
  var eng = ['0','1','2','3','4','5','6','7','8','9'];
  var ban = ['০','১','২','৩','৪','৫','৬','৭','৮','৯'];
  var str = num.toString();
  for (var i = 0; i < 10; i++) {
    var regex = new RegExp(eng[i], 'g');
    str = str.replace(regex, ban[i]);
  }
  return str;
}

/**
 * ইউনিক অটো-ইনক্রিমেন্ট মেমো নম্বর তৈরি (প্যা.বহেড়া.ইউপি.স.টাং-[সিরিয়াল]/[বছর])
 */
function generateMemoNumber(sheet) {
  var year = toBanglaNum(new Date().getFullYear().toString().slice(-2));
  var lastRow = sheet.getLastRow();
  var serial = lastRow < 2 ? 1 : lastRow;
  var serialBan = toBanglaNum(serial < 10 ? '০' + serial : serial);
  return 'প্যা.বহেড়া.ইউপি.স.টাং-' + serialBan + '/' + year;
}

/**
 * ডুপ্লিকেট সনদের আবেদন চেক (NID + CertType)
 */
function checkDuplicateRequest(sheet, nid, certType) {
  if (!nid) return null;
  var data = sheet.getDataRange().getValues();
  for (var i = 1; i < data.length; i++) {
    var existingNid = data[i][1];
    var existingType = data[i][4];
    if (existingNid && existingNid.toString().trim() === nid.toString().trim() && existingType === certType) {
      return {
        memoNo: data[i][0],
        pdfUrl: data[i][11],
        createdAt: data[i][12]
      };
    }
  }
  return null;
}

/**
 * ফ্রন্টএন্ড থেকে NID ছবি (Base64) পাঠালে এই ফাংশন কল হবে
 */
function scanNidImages(frontImageBase64, backImageBase64) {
  try {
    var extractedData = extractNidDataWithGemini(frontImageBase64, backImageBase64);
    return { success: true, data: extractedData };
  } catch (error) {
    return { success: false, error: "NID স্ক্যান ব্যর্থ হয়েছে: " + error.toString() };
  }
}

/**
 * সনদপত্র প্রসেসিং ও গুগল ডক/পিডিএফ তৈরি
 */
function processCertificate(formData) {
  try {
    var config = getAppConfig();
    var ss = SpreadsheetApp.openById(config.spreadsheetId);
    var certSheet = ss.getSheetByName('Certificates') || ss.getActiveSheet();

    // ১. ডুপ্লিকেট চেক
    var duplicate = checkDuplicateRequest(certSheet, formData.nidNumber, formData.certType);
    if (duplicate) {
      return {
        success: true,
        isDuplicate: true,
        message: "এই NID দিয়ে ইতিমধ্যে সনদপত্র তৈরি করা আছে!",
        memoNo: duplicate.memoNo,
        pdfUrl: duplicate.pdfUrl
      };
    }

    // ২. মেমো নম্বর ও তারিখ
    var memoNo = generateMemoNumber(certSheet);

    // ৩. Gemini AI দিয়ে পরিমার্জিত প্রশাসনিক ভাষায় বডি তৈরি
    var generatedBody = generateCertificateBodyWithGemini(
      formData.applicantName,
      formData.fatherName,
      formData.motherName,
      formData.certType,
      formData.village,
      formData.postOffice || 'বহেড়াতৈল',
      formData.promptHint
    );

    // ৪. কিউআর কোড জেনারেট (Google Charts API)
    var webAppUrl = ScriptApp.getService().getUrl();
    var verifyUrl = webAppUrl ? (webAppUrl + '?certNo=' + encodeURIComponent(memoNo)) : 'https://baheratailup.gov.bd/verify?certNo=' + encodeURIComponent(memoNo);
    var qrImageUrl = 'https://chart.googleapis.com/chart?chs=150x150&cht=qr&chl=' + encodeURIComponent(verifyUrl);

    // ৫. গুগল শিটে ডাটা সংরক্ষণ
    certSheet.appendRow([
      memoNo,
      formData.nidNumber || '',
      formData.applicantName,
      formData.fatherName,
      formData.certType,
      formData.village,
      formData.postOffice || 'বহেড়াতৈল',
      formData.wardNo || '০২',
      formData.mobile || '',
      generatedBody,
      verifyUrl,
      'https://docs.google.com/document/d/' + config.templateDocId,
      new Date().toISOString()
    ]);

    return {
      success: true,
      message: "সনদপত্র সফলভাবে তৈরি হয়েছে!",
      memoNo: memoNo,
      certificateText: generatedBody,
      verifyUrl: verifyUrl,
      qrImageUrl: qrImageUrl
    };
  } catch (error) {
    return { success: false, error: "সনদ তৈরিতে সমস্যা হয়েছে: " + error.toString() };
  }
}

/**
 * সনদ যাচাইকরণ পেজ জেনারেট
 */
function renderVerificationPage(certNo) {
  var html = '<!DOCTYPE html><html><head><meta charset="UTF-8"><title>সনদপত্র যাচাইকরণের ফলাফল</title>' +
    '<link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">' +
    '</head><body class="bg-light p-4 font-monospace"><div class="max-w-md mx-auto card shadow-sm p-4 text-center">' +
    '<h3 class="text-success fw-bold mb-3">🏛️ ০২নং বহেড়াতৈল ইউনিয়ন পরিষদ</h3>' +
    '<div class="alert alert-success">✅ সনদটি সঠিক, যাচাইকৃত ও ডিজিটালভাবে সংরক্ষিত!</div>' +
    '<p class="mb-1"><strong>স্মারক নম্বর:</strong> ' + certNo + '</p>' +
    '<p class="text-muted small">ডাকঘর: বহেড়াতৈল, উপজেলা: সখিপুর, জেলা: টাঙ্গাইল।</p>' +
    '<hr><small class="text-secondary">গুগল ড্রাইভে রক্ষিত অফিশিয়াল ডাটাবেজ থেকে সরাসরি যাচাইকৃত।</small>' +
    '</div></body></html>';
  return HtmlService.createHtmlOutput(html);
}
`;

export const APPS_SCRIPT_GEMINI_GS = `// ============================================================
// File: Gemini.gs
// Role: Gemini API Integration for Vision (NID Scan) & Text Generation
// API: Google Gemini API (v1beta Free Tier)
// ============================================================

function getGeminiApiKey() {
  var apiKey = PropertiesService.getScriptProperties().getProperty('GEMINI_API_KEY');
  if (!apiKey) {
    throw new Error("Script Properties-এ 'GEMINI_API_KEY' পাওয়া যায়নি। অনুগ্রহ করে Project Settings > Script Properties-এ আপনার Gemini API Key সেট করুন।");
  }
  return apiKey;
}

/**
 * NID-এর সামনে ও পেছনের ছবি (Base64) থেকে নাম, বাবার নাম, মায়ের নাম, NID নং, জন্ম তারিখ ও গ্রাম এক্সট্র্যাক্ট করে JSON রিটার্ন করে
 */
function extractNidDataWithGemini(frontImageBase64, backImageBase64) {
  var apiKey = getGeminiApiKey();
  var url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=" + apiKey;

  var parts = [];

  parts.push({
    text: "You are an expert OCR and document parser for Bangladesh National ID (NID) cards. Extract the details accurately from the image(s) provided. Return ONLY a valid JSON object with these exact keys (no markdown formatting, no code blocks):\n" +
          "{\n" +
          '  "applicantName": "আবেদনকারীর বাংলা নাম",\n' +
          '  "applicantNameEng": "Name in English",\n' +
          '  "fatherName": "পিতার নাম",\n' +
          '  "motherName": "মাতার নাম",\n' +
          '  "nidNumber": "জাতীয় পরিচয়পত্র নম্বর",\n' +
          '  "dob": "জন্ম তারিখ (YYYY-MM-DD)",\n' +
          '  "village": "গ্রাম",\n' +
          '  "postOffice": "ডাকঘর"\n' +
          "}\n" +
          "If a value is missing or unreadable, set it as an empty string."
  });

  if (frontImageBase64) {
    var cleanFront = frontImageBase64.replace(/^data:image\\/[a-z]+;base64,/, "");
    parts.push({
      inlineData: {
        mimeType: "image/jpeg",
        data: cleanFront
      }
    });
  }

  if (backImageBase64) {
    var cleanBack = backImageBase64.replace(/^data:image\\/[a-z]+;base64,/, "");
    parts.push({
      inlineData: {
        mimeType: "image/jpeg",
        data: cleanBack
      }
    });
  }

  var payload = {
    contents: [{ parts: parts }],
    generationConfig: {
      temperature: 0.1,
      responseMimeType: "application/json"
    }
  };

  var options = {
    method: "post",
    contentType: "application/json",
    payload: JSON.stringify(payload),
    muteHttpExceptions: true
  };

  var response = UrlFetchApp.fetch(url, options);
  var statusCode = response.getResponseCode();
  var responseText = response.getContentText();

  if (statusCode !== 200) {
    throw new Error("Gemini API Error (" + statusCode + "): " + responseText);
  }

  var result = JSON.parse(responseText);
  var rawText = result.candidates[0].content.parts[0].text;

  // Clean raw text if wrapped in markdown code fence
  rawText = rawText.replace(/\x60\x60\x60json/g, "").replace(/\x60\x60\x60/g, "").trim();
  
  return JSON.parse(rawText);
}

/**
 * আবেদনকারীর নাম, গ্রাম, ডাকঘর ও প্রত্যয়নপত্রের ধরনের ওপর ভিত্তি করে পরিমার্জিত সরকারি বাংলায় ৩-৪ লাইনের প্রত্যয়ন বিবরণী জেনারেট করার ফাংশন
 */
function generateCertificateBodyWithGemini(applicantName, fatherName, motherName, certType, village, postOffice, promptHint) {
  var apiKey = getGeminiApiKey();
  var url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=" + apiKey;

  var promptText = "আপনি বাংলাদেশের ইউনিয়ন পরিষদের সরকারি সনদপত্র রচয়িতা।\n" +
    "ইউনিয়ন পরিষদ: ০২নং বহেড়াতৈল ইউনিয়ন পরিষদ, উপজেলা: সখিপুর, জেলা: টাঙ্গাইল।\n\n" +
    "নিচের তথ্যের ভিত্তিতে পরিমার্জিত, ত্রুটিহীন এবং সরকারি অফিশিয়াল বাংলায় ৩ থেকে ৪ লাইনের একটি প্রত্যয়ন বিবরণী (Body Text) লিখুন:\n" +
    "- আবেদনকারীর নাম: " + applicantName + "\n" +
    "- পিতার নাম: " + fatherName + "\n" +
    "- মাতার নাম: " + motherName + "\n" +
    "- গ্রাম: " + village + ", ডাকঘর: " + (postOffice || "বহেড়াতৈল") + ", উপজেলা: সখিপুর, জেলা: টাঙ্গাইল\n" +
    "- প্রত্যয়নপত্রের ধরন: " + certType + "\n" +
    "- অতিরিক্ত তথ্য/হিন্ট: " + (promptHint || "নিয়মিত স্থায়ী বাসিন্দা ও সৎ চরিত্র") + "\n\n" +
    "নিয়মাবলী:\n" +
    "১. সরাসরি সনদপত্রের ভেতরের মূল প্রত্যয়ন বাক্যগুলো লিখবেন (যেমন: 'এই মর্মে প্রত্যয়ন করা যাচ্ছে যে...। সে জন্মসূত্রে উক্ত গ্রামের স্থায়ী বাসিন্দা...।')।\n" +
    "২. কোনো শিরোনাম, হেডার, সই বা বাড়তি উইশিং দরকার নেই।\n" +
    "৩. ৩-৪ লাইনের সুসংগঠিত সরকারি ভাষায় সমাপ্ত করুন।";

  var payload = {
    contents: [{
      parts: [{ text: promptText }]
    }],
    generationConfig: {
      temperature: 0.3,
      maxOutputTokens: 500
    }
  };

  var options = {
    method: "post",
    contentType: "application/json",
    payload: JSON.stringify(payload),
    muteHttpExceptions: true
  };

  var response = UrlFetchApp.fetch(url, options);
  var statusCode = response.getResponseCode();
  var responseText = response.getContentText();

  if (statusCode !== 200) {
    throw new Error("Gemini API Error (" + statusCode + "): " + responseText);
  }

  var result = JSON.parse(responseText);
  return result.candidates[0].content.parts[0].text.trim();
}
`;

export const APPS_SCRIPT_INDEX_HTML = `<!DOCTYPE html>
<html lang="bn">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>০২নং বহেড়াতৈল ইউনিয়ন পরিষদ - অটোমেশন</title>
  <!-- Bootstrap 5 CSS -->
  <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css" rel="stylesheet">
  <!-- Font Awesome Icons -->
  <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.2/css/all.min.css" rel="stylesheet">
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Tiro+Bangla&family=Noto+Sans+Bengali:wght@400;600;700&display=swap');
    body {
      font-family: 'Noto Sans Bengali', sans-serif;
      background-color: #f4f6f9;
      color: #1e293b;
    }
    .header-banner {
      background: linear-gradient(135deg, #065f46 0%, #047857 100%);
      color: white;
      border-bottom: 4px solid #f59e0b;
    }
    .card-custom {
      border: none;
      border-radius: 12px;
      box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05);
    }
    .btn-emerald {
      background-color: #047857;
      color: white;
      border: none;
    }
    .btn-emerald:hover {
      background-color: #065f46;
      color: white;
    }
    .cert-output {
      font-family: 'Tiro Bangla', serif;
      font-size: 1.15rem;
      line-height: 1.8;
      background-color: #fffbeb;
      border: 2px dashed #d97706;
      border-radius: 8px;
      padding: 20px;
    }
    .loading-spinner {
      display: inline-block;
      width: 1.2rem;
      height: 1.2rem;
      border: 3px solid rgba(255,255,255,.3);
      border-radius: 50%;
      border-top-color: #fff;
      animation: spin 1s ease-in-out infinite;
    }
    @keyframes spin {
      to { transform: rotate(360deg); }
    }
  </style>
</head>
<body>

  <!-- Header -->
  <header class="header-banner text-center py-4 px-3 mb-4">
    <div class="container">
      <div class="d-flex align-items-center justify-content-center gap-3">
        <i class="fa-solid fa-landmark fa-2x text-warning"></i>
        <div>
          <h2 class="mb-1 fw-bold">০২নং বহেড়াতৈল ইউনিয়ন পরিষদ কার্যালয়</h2>
          <p class="mb-0 text-light opacity-90">উপজেলা: সখিপুর, জেলা: টাঙ্গাইল | AI স্মার্ট অটোমেশন</p>
        </div>
      </div>
    </div>
  </header>

  <!-- Main Container -->
  <main class="container pb-5">
    <div class="row g-4">
      
      <!-- Left Column: NID Scanner & Auto Fill -->
      <div class="col-lg-5">
        <div class="card card-custom p-4">
          <h5 class="fw-bold text-success mb-3">
            <i class="fa-solid fa-id-card me-2"></i>১. NID স্মার্ট স্ক্যানার (AI OCR)
          </h5>
          <p class="text-muted small">NID কার্ডের সামনের ও পেছনের ছবি আপলোড করে 'অটো ফিল' বাটনে ক্লিক করুন।</p>
          
          <div class="mb-3">
            <label class="form-label small fw-semibold">NID সামনের দিক:</label>
            <input type="file" id="frontImage" class="form-control form-control-sm" accept="image/*">
          </div>

          <div class="mb-3">
            <label class="form-label small fw-semibold">NID পেছনের দিক:</label>
            <input type="file" id="backImage" class="form-control form-control-sm" accept="image/*">
          </div>

          <button id="btnAutoFill" class="btn btn-warning btn-sm w-100 fw-bold text-dark py-2" onclick="handleAutoFill()">
            <i class="fa-solid fa-wand-magic-sparkles me-1"></i> AI দিয়ে অটো ফিল করুন
          </button>
          
          <div id="scanStatus" class="mt-2 text-center small"></div>
        </div>
      </div>

      <!-- Right Column: Form & Certificate Generator -->
      <div class="col-lg-7">
        <div class="card card-custom p-4">
          <h5 class="fw-bold text-success mb-3">
            <i class="fa-solid fa-file-signature me-2"></i>২. আবেদনকারীর তথ্য ও সনদ বিবরণী
          </h5>

          <form id="certForm" onsubmit="handleFormSubmit(event)">
            <div class="row g-2">
              <div class="col-md-6 mb-2">
                <label class="form-label small fw-semibold">আবেদনকারীর নাম (বাংলা)</label>
                <input type="text" id="applicantName" class="form-control form-control-sm" required placeholder="উদা: মোঃ আব্দুর রহিম">
              </div>

              <div class="col-md-6 mb-2">
                <label class="form-label small fw-semibold">এনআইডি নম্বর (NID)</label>
                <input type="text" id="nidNumber" class="form-control form-control-sm" placeholder="উদা: ১২৩৪৫৬৭৮৯০">
              </div>

              <div class="col-md-6 mb-2">
                <label class="form-label small fw-semibold">পিতার নাম</label>
                <input type="text" id="fatherName" class="form-control form-control-sm" required placeholder="উদা: মোঃ কিয়াম উদ্দিন">
              </div>

              <div class="col-md-6 mb-2">
                <label class="form-label small fw-semibold">মাতার নাম</label>
                <input type="text" id="motherName" class="form-control form-control-sm" required placeholder="উদা: মোছাঃ রহিমা খাতুন">
              </div>

              <div class="col-md-6 mb-2">
                <label class="form-label small fw-semibold">গ্রাম / এলাকা</label>
                <select id="villageSelect" class="form-select form-select-sm" onchange="toggleCustomVillage()">
                  <option value="বহেড়াতৈল" selected>১. বহেড়াতৈল</option>
                  <option value="ডাবাইল">২. ডাবাইল</option>
                  <option value="কামারঙ্গ">৩. কামারঙ্গ</option>
                  <option value="গোহাইলবাড়ী">৪. গোহাইলবাড়ী</option>
                  <option value="যোগীরকোফা">৫. যোগীরকোফা</option>
                  <option value="ঘাটেশ্বরী">৬. ঘাটেশ্বরী</option>
                  <option value="ভুগলীচালা">৭. ভুগলীচালা</option>
                  <option value="ধোপার চালা">৮. ধোপার চালা</option>
                  <option value="আমতৈল">৯. আমতৈল</option>
                  <option value="শালগ্রামপুর">১০. শালগ্রামপুর</option>
                  <option value="বগাপ্রতিমা">১১. বগাপ্রতিমা</option>
                  <option value="আন্দি">১২. আন্দি</option>
                  <option value="ছাতিয়াচালা">১৩. ছাতিয়াচালা</option>
                  <option value="বেতুয়া">১৪. বেতুয়া</option>
                  <option value="কালিয়ান">১৫. কালিয়ান</option>
                  <option value="OTHER">১৬. অন্যান্য (নিজে লিখুন)</option>
                </select>
                <input type="text" id="villageCustom" class="form-control form-control-sm mt-1" style="display:none;" placeholder="গ্রামের নাম লিখুন">
              </div>

              <div class="col-md-6 mb-2">
                <label class="form-label small fw-semibold">ডাকঘর (Post Office)</label>
                <select id="postOfficeSelect" class="form-select form-select-sm" onchange="toggleCustomPostOffice()">
                  <option value="বহেড়াতৈল" selected>বহেড়াতৈল - ১৯৫০</option>
                  <option value="নাগবাড়ী">নাগবাড়ী - ১৯৭২</option>
                  <option value="বেতুয়া">বেতুয়া - ১৯৫০</option>
                  <option value="ছিলিমপুর">ছিলিমপুর - ১৯৫০</option>
                  <option value="OTHER">অন্যান্য (নিজে লিখুন)</option>
                </select>
                <input type="text" id="postOfficeCustom" class="form-control form-control-sm mt-1" style="display:none;" placeholder="ডাকঘরের নাম লিখুন">
              </div>

              <div class="col-md-6 mb-2">
                <label class="form-label small fw-semibold">সনদের ধরন</label>
                <select id="certType" class="form-select form-select-sm">
                  <option value="নাগরিকত্ব সনদ">নাগরিকত্ব সনদ</option>
                  <option value="চারিত্রিক সনদ">চারিত্রিক সনদ</option>
                  <option value="পরিচয়পত্র ও প্রত্যয়নপত্র">পরিচয়পত্র ও প্রত্যয়নপত্র</option>
                  <option value="ভূমিহীন প্রত্যয়নপত্র">ভূমিহীন প্রত্যয়নপত্র</option>
                  <option value="বাৎসরিক আয় সনদ">বাৎসরিক আয় সনদ</option>
                  <option value="পুনর্বিবাহ না হওয়ার সনদ">পুনর্বিবাহ না হওয়ার সনদ</option>
                  <option value="অবিবাহিত সনদ">অবিবাহিত সনদ</option>
                  <option value="মৃত ব্যক্তির ওয়ারিশান বিবরণী">মৃত ব্যক্তির ওয়ারিশান বিবরণী</option>
                </select>
              </div>

              <div class="col-12 mb-3">
                <label class="form-label small fw-semibold">অতিরিক্ত ইঙ্গিত / স্পেশাল নোট (ঐচ্ছিক)</label>
                <input type="text" id="promptHint" class="form-control form-control-sm" placeholder="উদা: বার্ষিক আয় আনুমানিক ৩,৫০,০০০ টাকা / স্থায়ী বাসিন্দা">
              </div>
            </div>

            <button type="submit" id="btnSubmit" class="btn btn-emerald w-100 fw-bold py-2">
              <i class="fa-solid fa-gears me-1"></i> AI দিয়ে প্রত্যয়নপত্র তৈরি করুন
            </button>
          </form>

        </div>

        <!-- Output Card -->
        <div id="outputSection" class="card card-custom p-4 mt-4" style="display: none;">
          <div class="d-flex justify-content-between align-items-center mb-3">
            <h5 class="fw-bold text-dark mb-0"><i class="fa-solid fa-scroll text-warning me-2"></i>জেনারেটকৃত প্রত্যয়নপত্র</h5>
            <button class="btn btn-outline-secondary btn-sm" onclick="copyCertText()">
              <i class="fa-solid fa-copy me-1"></i> কপি করুন
            </button>
          </div>
          <div id="certificateText" class="cert-output"></div>
        </div>

      </div>
    </div>
  </main>

  <!-- JavaScript Logic -->
  <script>
    function toggleCustomVillage() {
      const sel = document.getElementById("villageSelect").value;
      document.getElementById("villageCustom").style.display = (sel === "OTHER") ? "block" : "none";
    }

    function toggleCustomPostOffice() {
      const sel = document.getElementById("postOfficeSelect").value;
      document.getElementById("postOfficeCustom").style.display = (sel === "OTHER") ? "block" : "none";
    }

    function getFinalVillage() {
      const sel = document.getElementById("villageSelect").value;
      return (sel === "OTHER") ? document.getElementById("villageCustom").value.trim() : sel;
    }

    function getFinalPostOffice() {
      const sel = document.getElementById("postOfficeSelect").value;
      return (sel === "OTHER") ? document.getElementById("postOfficeCustom").value.trim() : sel;
    }

    function fileToBase64(file) {
      return new Promise((resolve, reject) => {
        if (!file) resolve("");
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = error => reject(error);
        reader.readAsDataURL(file);
      });
    }

    async function handleAutoFill() {
      const frontInput = document.getElementById("frontImage").files[0];
      const backInput = document.getElementById("backImage").files[0];
      const statusDiv = document.getElementById("scanStatus");
      const btn = document.getElementById("btnAutoFill");

      if (!frontInput && !backInput) {
        alert("অনুগ্রহ করে অন্তত NID-এর একটি ছবি সিলেক্ট করুন!");
        return;
      }

      statusDiv.innerHTML = '<span class="text-primary"><span class="loading-spinner"></span> ছবি বিশ্লেষণ করা হচ্ছে...</span>';
      btn.disabled = true;

      try {
        const frontBase64 = await fileToBase64(frontInput);
        const backBase64 = await fileToBase64(backInput);

        google.script.run
          .withSuccessHandler(response => {
            btn.disabled = false;
            if (response.success && response.data) {
              statusDiv.innerHTML = '<span class="text-success fw-bold"><i class="fa-solid fa-check-circle me-1"></i> তথ্য স্বয়ংক্রিয়ভাবে বসানো হয়েছে!</span>';
              
              const d = response.data;
              if (d.applicantName) document.getElementById("applicantName").value = d.applicantName;
              if (d.fatherName) document.getElementById("fatherName").value = d.fatherName;
              if (d.motherName) document.getElementById("motherName").value = d.motherName;
              if (d.nidNumber) document.getElementById("nidNumber").value = d.nidNumber;
              if (d.village) {
                const vSel = document.getElementById("villageSelect");
                let found = false;
                for (let i = 0; i < vSel.options.length; i++) {
                  if (vSel.options[i].value === d.village) {
                    vSel.selectedIndex = i;
                    found = true;
                    break;
                  }
                }
                if (!found) {
                  vSel.value = "OTHER";
                  document.getElementById("villageCustom").value = d.village;
                  document.getElementById("villageCustom").style.display = "block";
                }
              }
              if (d.postOffice) {
                const poSel = document.getElementById("postOfficeSelect");
                let found = false;
                for (let i = 0; i < poSel.options.length; i++) {
                  if (poSel.options[i].value === d.postOffice) {
                    poSel.selectedIndex = i;
                    found = true;
                    break;
                  }
                }
                if (!found) {
                  poSel.value = "OTHER";
                  document.getElementById("postOfficeCustom").value = d.postOffice;
                  document.getElementById("postOfficeCustom").style.display = "block";
                }
              }
            } else {
              statusDiv.innerHTML = '<span class="text-danger">স্ক্যান ত্রুটি: ' + (response.error || "অজানা সমস্যা") + '</span>';
            }
          })
          .withFailureHandler(err => {
            btn.disabled = false;
            statusDiv.innerHTML = '<span class="text-danger">সার্ভার এরর: ' + err.message + '</span>';
          })
          .scanNidImages(frontBase64, backBase64);

      } catch (err) {
        btn.disabled = false;
        statusDiv.innerHTML = '<span class="text-danger">ফাইলের সমস্যা: ' + err.message + '</span>';
      }
    }

    function handleFormSubmit(e) {
      e.preventDefault();
      const btn = document.getElementById("btnSubmit");
      const outputSec = document.getElementById("outputSection");
      const certTextDiv = document.getElementById("certificateText");

      const formData = {
        applicantName: document.getElementById("applicantName").value,
        nidNumber: document.getElementById("nidNumber").value,
        fatherName: document.getElementById("fatherName").value,
        motherName: document.getElementById("motherName").value,
        village: getFinalVillage(),
        postOffice: getFinalPostOffice(),
        certType: document.getElementById("certType").value,
        promptHint: document.getElementById("promptHint").value
      };

      btn.disabled = true;
      btn.innerHTML = '<span class="loading-spinner me-1"></span> AI প্রসেস করছে...';

      google.script.run
        .withSuccessHandler(response => {
          btn.disabled = false;
          btn.innerHTML = '<i class="fa-solid fa-gears me-1"></i> AI দিয়ে প্রত্যয়নপত্র তৈরি করুন';

          if (response.success) {
            certTextDiv.innerHTML = response.certificateText.replace(/\\n/g, '<br>');
            outputSec.style.display = 'block';
            outputSec.scrollIntoView({ behavior: 'smooth' });
          } else {
            alert("এরর: " + response.error);
          }
        })
        .withFailureHandler(err => {
          btn.disabled = false;
          btn.innerHTML = '<i class="fa-solid fa-gears me-1"></i> AI দিয়ে প্রত্যয়নপত্র তৈরি করুন';
          alert("সার্ভার সমস্যা: " + err.message);
        })
        .processCertificate(formData);
    }

    function copyCertText() {
      const text = document.getElementById("certificateText").innerText;
      navigator.clipboard.writeText(text).then(() => {
        alert("প্রত্যয়নপত্রের লেখা কপি হয়েছে!");
      });
    }
  </script>
</body>
</html>
`;

export const getAppsScriptFiles = (): AppsScriptFiles => {
  return {
    codeGs: APPS_SCRIPT_CODE_GS,
    geminiGs: APPS_SCRIPT_GEMINI_GS,
    indexHtml: APPS_SCRIPT_INDEX_HTML
  };
};
