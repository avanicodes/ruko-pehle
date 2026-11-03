# 🛑 Ruko Pehle! (रुको पहले)
### Pehle Check Karo, Phir Trust Karo

> **AI-Powered Indian Scam Intelligence & Family Guardian Platform**  
> *Built with Sarvam AI: Sarvam-105B Reasoning • Bulbul:v3 Spoken Warnings • Saarika Speech-to-Text*

---

## 🌟 Overview

Every month in India, elderly citizens and non-technical families lose over **₹1,200 Crores** to predatory cyber scams:
- **Digital Arrest Extortion** (CBI / Mumbai Police impersonation via WhatsApp video)
- **Power Cutoff Threats** ("Electricity will be disconnected tonight at 9:30 pm")
- **Bank Account / YONO Suspension** (Malicious APK phishing links)
- **UPI Collect Scams** ("You won ₹25,000! Enter PIN to receive money")

**Ruko Pehle** acts as an instant protective shield. Before sending money or panic-clicking a link, users scan the alert. In 3 seconds, Sarvam AI delivers:
1. **Clear Verdict & Risk Score** in simple, panic-free language.
2. **Red Flags Breakdown** highlighting specific deception techniques.
3. **Spoken Audio Warning** powered by **Sarvam Bulbul:v3** in **Hindi**, **Marathi**, and **Indian English**.
4. **1-Tap WhatsApp Family Card** to protect parent WhatsApp groups.
5. **Kavach Guardian**: Automatic SOS link to call children before funds move.
6. **1930 Helpline**: Direct Golden Hour cyber fraud reporting assistance.

---

## 🤖 Sarvam AI Agents & Models Integrated

| Agent / Model | Role in Ruko Pehle |
| :--- | :--- |
| **`sarvam-105b-conversations`** | Deep semantic reasoning on Indian fraud patterns, generating verdicts, red flags, and safe next steps. |
| **`bulbul:v3` (Text-to-Speech)** | Generates calm, reassuring native spoken audio explanations in **Hindi (`hi-IN`)**, **Marathi (`mr-IN`)**, and **English (`en-IN`)**. |
| **`saarika` (Speech-to-Text)** | Transcribes suspicious phone calls and voice notes put on speaker directly into text for fraud scanning. |

---

## 🚀 Quick Start (Local Setup)

### 1. Clone the repository
```bash
git clone https://github.com/your-username/ruko-pehle.git
cd ruko-pehle
```

### 2. Install dependencies
```bash
npm install
```

### 3. Configure your Sarvam AI API Key
Create a `.env` file from the example:
```bash
cp .env.example .env
```
Add your key to `.env`:
```env
SARVAM_API_KEY=your_actual_sarvam_api_key_here
PORT=3000
```

### 4. Run the Server
```bash
npm start
```
Open your browser and navigate to:
```
http://localhost:3000
```

---

## 📁 Repository Structure

```
ruko-pehle/
├── server.js               # Express API backend integrating Sarvam AI models
├── ruko_pehle_backend.js   # Standalone Sarvam scam reasoning & Bulbul pipeline
├── package.json            # Node.js dependencies & scripts
├── .env.example            # Environment configuration template
├── .gitignore              # Ignores .env, node_modules, uploads
├── README.md               # Documentation & deployment guide
└── public/
    └── index.html          # Sleek glassmorphic mobile UI with live API integration
```

---

## 🌐 Deploy to Cloud (Render / Railway / VPS)

### Deploy to Render
1. Create a new **Web Service** on [Render](https://render.com).
2. Connect your GitHub repository.
3. Set **Build Command**: `npm install`
4. Set **Start Command**: `npm start`
5. In **Environment Variables**, add:
   - `SARVAM_API_KEY`: `your_key_here`
   - `PORT`: `3000`

### Deploy to Railway
1. Click **New Project** &rarr; **Deploy from GitHub repo**.
2. Add your `SARVAM_API_KEY` under the **Variables** tab.
3. Railway automatically detects `npm start` and deploys your service.

---

## 🛡️ Built for Indian Cyber Safety
- **National Cyber Crime Helpline:** 1930
- **Official Reporting Portal:** [cybercrime.gov.in](https://cybercrime.gov.in)
- **Powered by:** [Sarvam AI](https://sarvam.ai)
