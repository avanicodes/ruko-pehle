const express = require("express");
const cors = require("cors");
const path = require("node:path");
const fs = require("node:fs");
const multer = require("multer");

// Load .env automatically
try {
  process.loadEnvFile(path.resolve(__dirname, ".env"));
} catch {
  try {
    require("dotenv").config();
  } catch {}
}

const { SarvamAIClient } = require("sarvamai");

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json({ limit: "25mb" }));
app.use(express.urlencoded({ extended: true, limit: "25mb" }));

// Uploads directory for voice notes & OCR screenshots
const uploadDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}
const upload = multer({ dest: uploadDir });

// Serve static frontend files from 'public' (or root)
const publicDir = path.join(__dirname, "public");
if (fs.existsSync(publicDir)) {
  app.use(express.static(publicDir));
}
app.use(express.static(__dirname));

// Initialize Sarvam AI Client
const apiKey = process.env.SARVAM_API_KEY;
let sarvamClient = null;
if (apiKey) {
  sarvamClient = new SarvamAIClient({
    apiSubscriptionKey: apiKey,
  });
  console.log("⚡ [Sarvam AI] Client initialized successfully.");
} else {
  console.warn("⚠️ [Sarvam AI] SARVAM_API_KEY not found in environment. Please set it in .env");
}

// Language Code Mapping
const LANG_MAP = {
  hi: { name: "Hindi (हिन्दी)", code: "hi-IN" },
  mr: { name: "Marathi (मराठी)", code: "mr-IN" },
  en: { name: "English", code: "en-IN" },
};

/**
 * Health Check API
 */
app.get("/api/health", (req, res) => {
  res.json({
    status: "online",
    service: "Ruko Pehle! AI Scam Intelligence",
    sarvamConfigured: !!apiKey,
    models: {
      reasoning: "sarvam-105b-conversations",
      tts: "bulbul:v3",
      stt: "saarika",
    },
  });
});

/**
 * Core Scam Detection API (Sarvam-105B + Bulbul TTS)
 * POST /api/analyze
 * Body: { text: string, language: 'hi' | 'mr' | 'en' }
 */
app.post("/api/analyze", async (req, res) => {
  try {
    const { text, language = "en" } = req.body;

    if (!text || !text.trim()) {
      return res.status(400).json({ error: "Missing text to analyze" });
    }

    if (!sarvamClient) {
      return res.status(500).json({
        error: "Sarvam AI client is not configured. Check SARVAM_API_KEY in .env",
      });
    }

    const langInfo = LANG_MAP[language] || LANG_MAP["en"];

    console.log(`\n🔍 [Analyze] Scam inspection request received in ${langInfo.name}...`);

    const systemPrompt = `
You are the AI brain of "Ruko Pehle" (रुको पहले), a specialized scam protection app designed for Indian citizens, especially non-technical elderly users.
Your task is to analyze suspicious messages (such as fake KYC alerts, digital arrest threats, electricity cut-off threats, fake lottery/job offers, UPI collect request scams, phishing links).

CRITICAL INSTRUCTIONS:
1. Target audience includes elderly relatives and non-technical people. Use simple, reassuring, panic-free language.
2. Respond in ${langInfo.name}.
3. Structure your response as JSON matching this format:
{
  "verdict": "SCAM | SUSPICIOUS | SAFE",
  "confidenceScore": 98,
  "title": "Short punchy alert title",
  "category": "Digital Arrest | Utility Bill | Bank KYC | UPI Fraud | Phishing",
  "redFlags": [
    "Red flag 1 in simple words",
    "Red flag 2 in simple words",
    "Red flag 3 in simple words"
  ],
  "whatToDoNext": [
    "Actionable step 1",
    "Actionable step 2"
  ],
  "elderlySpokenExplanation": "A short, calm 2-3 sentence explanation meant to be spoken out loud via Text-to-Speech so grandparents immediately understand why it is fake and what to do.",
  "whatsAppFamilyCard": "A clean, copy-pasteable warning card for family WhatsApp groups without emojis, including 1930 helpline."
}
Only output valid JSON.`;

    // 1. Scam Reasoning with Sarvam-105B Conversations
    const chatResponse = await sarvamClient.chat.completions({
      model: "sarvam-105b-conversations",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: `Inspect this message:\n"${text}"` },
      ],
    });

    const rawContent = chatResponse.choices[0].message.content;
    let analysis;
    try {
      const match = rawContent.match(/\{[\s\S]*\}/);
      analysis = match ? JSON.parse(match[0]) : { raw: rawContent };
    } catch {
      analysis = { raw: rawContent };
    }

    // 2. Generate Spoken Advice Audio via Sarvam Bulbul:v3 TTS
    let audioBase64 = null;
    const speechScript = analysis.elderlySpokenExplanation || "Please be alert. This is a suspicious scam message.";

    try {
      const ttsResponse = await sarvamClient.textToSpeech.convert({
        text: speechScript,
        language_code: langInfo.code,
        model: "bulbul:v3",
      });
      audioBase64 = ttsResponse.audios?.[0] || null;
      if (audioBase64) {
        console.log(`🔊 [Bulbul:v3 TTS] Generated ${audioBase64.length} bytes audio.`);
      }
    } catch (ttsErr) {
      console.warn(`[Bulbul TTS Warning]: ${ttsErr.message}`);
    }

    res.json({
      success: true,
      analysis,
      audioBase64,
    });
  } catch (error) {
    console.error("Analysis Error:", error);
    res.status(500).json({
      error: error.message || "Failed to analyze message",
    });
  }
});

/**
 * Dedicated Bulbul TTS Endpoint
 * POST /api/tts
 * Body: { text: string, language_code: string }
 */
app.post("/api/tts", async (req, res) => {
  try {
    const { text, language_code = "en-IN" } = req.body;

    if (!text) {
      return res.status(400).json({ error: "Text is required for TTS" });
    }

    if (!sarvamClient) {
      return res.status(500).json({ error: "Sarvam AI client not configured" });
    }

    const ttsResponse = await sarvamClient.textToSpeech.convert({
      text,
      language_code,
      model: "bulbul:v3",
    });

    const audioBase64 = ttsResponse.audios?.[0] || null;

    res.json({
      success: true,
      audioBase64,
    });
  } catch (err) {
    console.error("TTS Error:", err);
    res.status(500).json({ error: err.message });
  }
});

/**
 * Voice Note & Call Audio Transcription (Saarika STT)
 * POST /api/stt
 * Multipart Form with 'audio' file
 */
app.post("/api/stt", upload.single("audio"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No audio file uploaded" });
    }

    if (!sarvamClient) {
      return res.status(500).json({ error: "Sarvam AI client not configured" });
    }

    const filePath = req.file.path;
    console.log(`🎙️ [Saarika STT] Transcribing voice input: ${req.file.originalname || req.file.filename}...`);

    let transcript = "";
    try {
      const sttResponse = await sarvamClient.speechToText.transcribe({
        file: fs.createReadStream(filePath),
      });
      transcript = sttResponse.transcript || "";
    } finally {
      // Clean up uploaded temporary audio file
      try {
        fs.unlinkSync(filePath);
      } catch {}
    }

    res.json({
      success: true,
      transcript,
    });
  } catch (err) {
    console.error("STT Error:", err);
    res.status(500).json({ error: err.message });
  }
});

// Fallback to index.html for single-page app
app.get("*", (req, res) => {
  const p1 = path.join(publicDir, "index.html");
  const p2 = path.join(__dirname, "ruko_pehle_ui.html");
  if (fs.existsSync(p1)) {
    res.sendFile(p1);
  } else if (fs.existsSync(p2)) {
    res.sendFile(p2);
  } else {
    res.send("Ruko Pehle Backend Running.");
  }
});

app.listen(PORT, () => {
  console.log(`
==================================================
  🛑 RUKO PEHLE! (रुको पहले) AI SCAM SHIELD
  Sarvam AI Agents: Sarvam-105B • Bulbul:v3 • Saarika
  Server running at: http://localhost:${PORT}
==================================================
  `);
});
