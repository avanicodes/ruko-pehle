const path = require("node:path");
const fs = require("node:fs");

// Load API key from .env
try {
  process.loadEnvFile(path.resolve(__dirname, ".env"));
} catch {}

const { SarvamAIClient } = require("sarvamai");

const client = new SarvamAIClient({
  apiSubscriptionKey: process.env.SARVAM_API_KEY,
});

/**
 * RUKO PEHLE (रुको पहले) - Core Scam Analysis Pipeline
 *
 * @param {Object} params
 * @param {string} params.suspiciousText - Suspicious SMS, transcript, or link
 * @param {'hi' | 'mr' | 'en'} params.language - User preferred language (Hindi, Marathi, English)
 */
async function analyzeScam({ suspiciousText, language = "hi" }) {
  console.log(`\n🛑 [Ruko Pehle] Analyzing suspicious content in language: ${language.toUpperCase()}...`);

  const langNames = {
    hi: "Hindi (हिन्दी)",
    mr: "Marathi (मराठी)",
    en: "English",
  };

  const systemPrompt = `
You are the AI brain of "Ruko Pehle" (रुको पहले), a specialized scam protection app designed for Indian citizens, especially non-technical elderly users.
Your task is to analyze suspicious messages (such as fake KYC alerts, digital arrest threats, electricity cut-off threats, fake lottery/job offers, UPI collect request scams, phishing links).

CRITICAL INSTRUCTIONS:
1. Target audience includes elderly relatives and non-technical people. Use simple, reassuring, and panic-free language.
2. Respond in ${langNames[language]}.
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
    "Actionable step 2",
    "Actionable step 3"
  ],
  "elderlySpokenExplanation": "A short, calm 2-3 sentence explanation meant to be spoken out loud via Text-to-Speech so grandparents immediately understand why it is fake and what to do.",
  "whatsAppFamilyCard": "A clean, copy-pasteable warning card for family WhatsApp groups with emojis and cyber helpline 1930."
}
Only output valid JSON.`;

  // 1. Scam Reasoning with Sarvam-105B
  const chatResponse = await client.chat.completions({
    model: "sarvam-105b-conversations",
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: `Please inspect this message:\n"${suspiciousText}"` },
    ],
  });

  const rawContent = chatResponse.choices[0].message.content;
  let parsed;
  try {
    const jsonMatch = rawContent.match(/\{[\s\S]*\}/);
    parsed = jsonMatch ? JSON.parse(jsonMatch[0]) : { raw: rawContent };
  } catch {
    parsed = { raw: rawContent };
  }

  // 2. Generate Spoken Explanation via Sarvam Bulbul TTS
  let audioBase64 = null;
  const langCodes = { hi: "hi-IN", mr: "mr-IN", en: "en-IN" };
  const speechText = parsed.elderlySpokenExplanation || "कृपया सावधान रहें। यह एक फर्जी संदेश है।";

  try {
    const ttsResponse = await client.textToSpeech.convert({
      text: speechText,
      language_code: langCodes[language] || "hi-IN",
      model: "bulbul:v3",
    });
    audioBase64 = ttsResponse.audios?.[0] || null;
    if (audioBase64) {
      console.log(`🔊 [Bulbul TTS] Generated ${audioBase64.length} bytes of spoken audio advice!`);
    }
  } catch (ttsErr) {
    console.warn(`[Bulbul TTS Note]: ${ttsErr.message}`);
  }

  return {
    analysis: parsed,
    audioBase64,
  };
}

// Quick Test Execution
async function test() {
  const sampleScam = "Dear Consumer, Your Electricity power will be disconnected Tonight at 9:30 pm from electricity office because your previous month bill was not updated. Please immediately contact our electricity officer at 9876543210. Thank you.";

  const result = await analyzeScam({
    suspiciousText: sampleScam,
    language: "mr", // Test Marathi for elder safety
  });

  console.log("\n--- [Analysis Result] ---");
  console.log(JSON.stringify(result.analysis, null, 2));
}

if (require.main === module) {
  test().catch(console.error);
}

module.exports = { analyzeScam };
