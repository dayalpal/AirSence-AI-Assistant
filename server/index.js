require("dotenv").config();
const express = require("express");
const cors    = require("cors");
const { GoogleGenAI } = require("@google/genai");

// =============================================================================
//  CONFIG  (developer-only — not user-facing)
// =============================================================================
const PORT     = process.env.PORT || 5000;
const MODEL    = "gemini-3.6-flash";
const SYSTEM   = `You are AirSense AI, a helpful air quality assistant.
Answer questions about AQI, pollution levels, health effects, and safety tips.
Be concise and use bullet points where helpful.`;

// =============================================================================
//  APP
// =============================================================================
const app = express();
app.use(cors({ origin: "*" }));
app.use(express.json());

// =============================================================================
//  GEMINI CLIENT
// =============================================================================
let ai = null;

function initAI(key) {
  ai = new GoogleGenAI({ apiKey: key });
}

const AQI_BREAKPOINTS = [
  { concentration: [0, 12], aqi: [0, 50] },
  { concentration: [12.1, 35.4], aqi: [51, 100] },
  { concentration: [35.5, 55.4], aqi: [101, 150] },
  { concentration: [55.5, 150.4], aqi: [151, 200] },
  { concentration: [150.5, 250.4], aqi: [201, 300] },
  { concentration: [250.5, 350.4], aqi: [301, 400] },
  { concentration: [350.5, 500.4], aqi: [401, 500] },
];

function calculatePm25Aqi(value) {
  const concentration = Math.floor(Number(value) * 10) / 10;
  const range = AQI_BREAKPOINTS.find(({ concentration: [low, high] }) => concentration >= low && concentration <= high);
  if (!range) return null;
  const [cLow, cHigh] = range.concentration;
  const [aLow, aHigh] = range.aqi;
  return Math.round(((aHigh - aLow) / (cHigh - cLow)) * (concentration - cLow) + aLow);
}

function toPpb(value, molecularWeight) {
  return Number.isFinite(value) ? Number((value * 24.45 / molecularWeight).toFixed(1)) : null;
}

function toPpm(value) {
  return Number.isFinite(value) ? Number((value / 1145).toFixed(2)) : null;
}

// Auto-init from .env on startup
const envKey = process.env.GEMINI_API_KEY;
if (envKey && envKey !== "your_gemini_api_key_here") {
  initAI(envKey);
  console.log(`✅ Gemini ready  (${MODEL})`);
}

// =============================================================================
//  ROUTES
// =============================================================================

// --- status ------------------------------------------------------------------
app.get("/api/status", (_req, res) => {
  res.json({ ready: !!ai, model: MODEL });
});

// --- city air quality -------------------------------------------------------
app.get("/api/air-quality", async (req, res) => {
  const city = req.query.city?.trim();
  if (!city) return res.status(400).json({ error: "city is required" });

  try {
    const geocodeUrl = new URL("https://geocoding-api.open-meteo.com/v1/search");
    geocodeUrl.search = new URLSearchParams({ name: city, count: "1", language: "en", format: "json" });
    const geocodeResponse = await fetch(geocodeUrl);
    if (!geocodeResponse.ok) throw new Error(`Geocoding failed (${geocodeResponse.status})`);
    const geocode = await geocodeResponse.json();
    const place = geocode.results?.[0];
    if (!place) return res.status(404).json({ error: `No city found for "${city}"` });

    const airUrl = new URL("https://air-quality-api.open-meteo.com/v1/air-quality");
    airUrl.search = new URLSearchParams({
      latitude: String(place.latitude),
      longitude: String(place.longitude),
      current: "pm2_5,pm10,carbon_monoxide,nitrogen_dioxide,ozone,sulphur_dioxide",
      timezone: "auto",
    });
    const airResponse = await fetch(airUrl);
    if (!airResponse.ok) throw new Error(`Air-quality lookup failed (${airResponse.status})`);
    const air = await airResponse.json();
    const current = air.current || {};
    const pollutants = {
      pm25: current.pm2_5 ?? null,
      pm10: current.pm10 ?? null,
      no2: toPpb(current.nitrogen_dioxide, 46.0055),
      o3: toPpb(current.ozone, 48),
      co: toPpm(current.carbon_monoxide),
      so2: toPpb(current.sulphur_dioxide, 64.066),
    };
    const aqi = calculatePm25Aqi(pollutants.pm25);
    if (aqi == null) return res.status(502).json({ error: "The air-quality provider returned no PM2.5 reading." });

    res.json({
      location: [place.name, place.country].filter(Boolean).join(", "),
      latitude: place.latitude,
      longitude: place.longitude,
      aqi,
      pollutants,
      source: "Open-Meteo",
      observedAt: current.time || null,
    });
  } catch (error) {
    res.status(502).json({ error: `Could not retrieve air quality: ${error.message}` });
  }
});

// --- chat --------------------------------------------------------------------
app.post("/api/chat", async (req, res) => {
  if (!ai) return res.status(503).json({ error: "API key is not configured on the server." });

  const { message, history = [] } = req.body;
  if (!message?.trim()) return res.status(400).json({ error: "message is required" });

  try {
    const chat = ai.chats.create({
      model: MODEL,
      config: { systemInstruction: SYSTEM, temperature: 0.7 },
      history: history.map(m => ({
        role: m.role === "bot" || m.role === "model" || m.role === "assistant" ? "model" : "user",
        parts: [{ text: m.text }],
      })),
    });
    const result = await chat.sendMessage({ message });
    res.json({ reply: result.text });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// --- analyze -----------------------------------------------------------------
app.post("/api/analyze", async (req, res) => {
  if (!ai) return res.status(503).json({ error: "API key is not configured on the server." });

  const { aqi, location, pollutants = {} } = req.body;
  if (aqi == null) return res.status(400).json({ error: "aqi is required" });

  const pollStr = Object.entries(pollutants)
    .filter(([, v]) => v !== "" && v != null)
    .map(([k, v]) => `${k.toUpperCase()}: ${v}`)
    .join(", ");

  const prompt = [
    `AQI: ${aqi}`,
    location ? `Location: ${location}` : "",
    pollStr  ? `Pollutants: ${pollStr}` : "",
    "",
    "Give a short analysis:",
    "1. What this AQI level means",
    "2. Health impact for general public, children/elderly, and sensitive groups",
    "3. 3 practical safety tips",
    "4. Is outdoor activity recommended?",
  ].filter(Boolean).join("\n");

  try {
    const result = await ai.models.generateContent({
      model:    MODEL,
      contents: prompt,
      config:   { systemInstruction: SYSTEM, temperature: 0.7 },
    });
    res.json({ analysis: result.text });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// =============================================================================
//  START
// =============================================================================
app.listen(PORT, () => {
  console.log(`\n🌿  AirSense API  →  http://localhost:${PORT}`);
  console.log(`    Model         :  ${MODEL}`);
  console.log(`    Gemini        :  ${ai ? "✅ Ready" : "⚠️  No key — configure server/.env"}\n`);
});
