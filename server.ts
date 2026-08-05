import express from "express";
import path from "path";
import { GoogleGenAI } from "@google/genai";
import { createServer as createViteServer } from "vite";

const app = express();
const PORT = 3000;

// Middleware for parsing JSON body with higher limit for image base64
app.use(express.json({ limit: "25mb" }));

// Helper to initialize Gemini Client
function getGeminiClient() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not set in environment variables.");
  }
  return new GoogleGenAI({
    apiKey: apiKey,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });
}

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", union: "০২নং বহেড়াতৈল ইউনিয়ন পরিষদ" });
});

// API Endpoint 1: Extract NID Data using Gemini Vision
app.post("/api/extract-nid", async (req, res) => {
  try {
    const { frontImage, backImage } = req.body;

    if (!frontImage && !backImage) {
      return res.status(400).json({ error: "At least one NID image is required" });
    }

    const ai = getGeminiClient();

    const parts: any[] = [];

    parts.push({
      text: `You are an expert Bangladeshi NID (National ID Card) document parser and OCR engine.
Analyze the provided image(s) of the Bangladesh National ID card (Front/Back) carefully.
Extract the relevant details accurately.
Return ONLY a valid JSON object matching this schema (do NOT include markdown code blocks, do NOT write markdown):

{
  "applicantName": "আবেদনকারীর বাংলা নাম",
  "applicantNameEng": "Name in English if available",
  "fatherName": "পিতার নাম",
  "motherName": "মাতার নাম",
  "spouseName": "স্বামীর/স্ত্রীর নাম (থাকলে)",
  "nidNumber": "জাতীয় পরিচয়পত্র নম্বর / NID No",
  "dob": "YYYY-MM-DD",
  "village": "গ্রাম (Address/গ্রাম line from card)",
  "postOffice": "ডাকঘর",
  "upazila": "সখিপুর",
  "district": "টাঙ্গাইল",
  "gender": "পুরুষ/নারী",
  "bloodGroup": "রক্তের গ্রুপ (থাকলে)"
}

Rules:
1. If any field is missing or cannot be clearly read, return an empty string "" for that field.
2. Clean up extraneous symbols or OCR noise.
3. Make sure names and village names are rendered in proper Bangla spelling.`,
    });

    if (frontImage) {
      const cleanFront = frontImage.replace(/^data:image\/[a-z]+;base64,/, "");
      parts.push({
        inlineData: {
          mimeType: "image/jpeg",
          data: cleanFront,
        },
      });
    }

    if (backImage) {
      const cleanBack = backImage.replace(/^data:image\/[a-z]+;base64,/, "");
      parts.push({
        inlineData: {
          mimeType: "image/jpeg",
          data: cleanBack,
        },
      });
    }

    const response = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents: { parts: parts },
      config: {
        temperature: 0.1,
        responseMimeType: "application/json",
      },
    });

    const rawText = response.text || "{}";
    const cleanedText = rawText.replace(/```json/gi, "").replace(/```/g, "").trim();
    const data = JSON.parse(cleanedText);

    return res.json({ success: true, data });
  } catch (err: any) {
    console.error("NID Extract Error:", err);
    return res.status(500).json({
      success: false,
      error: err.message || "Failed to analyze NID image.",
    });
  }
});

// API Endpoint 2: Generate Official Certificate Body Text
app.post("/api/generate-certificate", async (req, res) => {
  try {
    const {
      applicantName,
      fatherName,
      motherName,
      spouseName,
      certType,
      village,
      postOffice = "বহেড়াতৈল",
      upazila = "সখিপুর",
      district = "টাঙ্গাইল",
      wardNo = "০২",
      promptHint = "",
    } = req.body;

    if (!applicantName || !fatherName || !certType) {
      return res.status(400).json({
        error: "আবেদনকারীর নাম, পিতার নাম ও সনদের ধরন প্রদান করা বাধ্যতামূলক।",
      });
    }

    const ai = getGeminiClient();

    const promptText = `আপনি বাংলাদেশের ইউনিয়ন পরিষদের একজন অভিজ্ঞ প্রশাসনিক নথি রচয়িতা।
ইউনিয়ন পরিষদ: ০২নং বহেড়াতৈল ইউনিয়ন পরিষদ, ডাকঘর: ${postOffice}, উপজেলা: ${upazila}, জেলা: ${district}।

নিচের প্রদত্ত তথ্যের উপর ভিত্তি করে পরিমার্জিত, সপ্রমাণ ও সরকারি দাপ্তরিক বাংলায় ৩ থেকে ৪ লাইনের একটি প্রত্যয়ন বিবরণী (Body Text) রচনা করুন:

- আবেদনকারীর নাম: ${applicantName}
- পিতার নাম: ${fatherName}
- মাতার নাম: ${motherName || "নবাগত/অপ্রযোজ্য"}
${spouseName ? `- স্বামী/স্ত্রীর নাম: ${spouseName}` : ""}
- ঠিকানা: গ্রাম: ${village}, ওয়ার্ড নং: ${wardNo}, ডাকঘর: ${postOffice}, উপজেলা: ${upazila}, জেলা: ${district}।
- প্রত্যয়নপত্রের ধরন: ${certType}
- স্পেশাল ভ্যালিডেশন/নোট: ${promptHint || "নিয়মিত জন্মসূত্রে স্থায়ী বাসিন্দা ও সুচরিত্রের অধিকারী"}

গুরুত্বপূর্ণ নির্দেশনা:
১. প্রত্যয়ন বিবরণীটি সরাসরি "এই মর্মে প্রত্যয়ন করা যাচ্ছে যে, ..." দিয়ে শুরু করবেন।
২. বিবরণীটি ৩-৪ লাইনে সুন্দর ও সাবলীল সরকারি প্রশাসনিক ভাষায় সমাপ্ত হতে হবে।
৩. কোনো শিরোনাম, হেডার, স্বাক্ষর বা তারিখ যুক্ত করবেন না (এগুলো টেমপ্লেটে রয়েছে)।
৪. বানান যেন ১০০% বিশুদ্ধ বাংলা ব্যাকরণ মেনে চলে।`;

    const response = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents: promptText,
      config: {
        temperature: 0.2,
        maxOutputTokens: 600,
      },
    });

    const certificateBody = response.text ? response.text.trim() : "";

    return res.json({
      success: true,
      certificateBody: certificateBody,
    });
  } catch (err: any) {
    console.error("Certificate Generation Error:", err);
    return res.status(500).json({
      success: false,
      error: err.message || "প্রত্যয়নপত্র তৈরিতে ত্রুটি ঘটেছে।",
    });
  }
});

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*all", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
