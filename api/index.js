// api/index.js
import express from "express";
import serverless from "serverless-http";
import voiceBotEvaluator from "./voicebot-evaluator.js";

console.log("========================================");
console.log("🚀 [INIT] Starting serverless function");
console.log("🚀 [INIT] Timestamp:", new Date().toISOString());
console.log("🚀 [INIT] Environment:", process.env.VERCEL ? "VERCEL" : "LOCAL");
console.log("🚀 [INIT] Node version:", process.version);
console.log("🚀 [INIT] OpenAI Key exists:", !!process.env.OPENAI_API_KEY);
console.log("========================================");

const app = express();

// Log all incoming requests
app.use((req, res, next) => {
  const reqId = Math.random().toString(36).substring(7);
  req.startTime = Date.now();
  req.reqId = reqId;

  console.log(`📥 [${reqId}] ${req.method} ${req.url}`);
  console.log(
    `📥 [${reqId}] Full URL: ${req.protocol}://${req.get("host")}${
      req.originalUrl
    }`
  );
  console.log(`📥 [${reqId}] Content-Type: ${req.headers["content-type"]}`);
  next();
});

app.use(express.json());

console.log("✅ [INIT] Express middleware configured");

// Log parsed body
app.use((req, res, next) => {
  if (req.body && Object.keys(req.body).length > 0) {
    console.log(
      `📦 [${req.reqId}] Body keys: ${Object.keys(req.body).join(", ")}`
    );
    console.log(
      `📦 [${req.reqId}] Body preview: ${JSON.stringify(req.body).substring(
        0,
        150
      )}...`
    );
  }
  next();
});

// Add a root route for debugging
app.all("/", (req, res) => {
  console.log(`🏠 [${req.reqId}] Root route hit with ${req.method}`);
  res.json({
    message: "Voicebot Evaluator API",
    endpoints: {
      evaluate: "POST /voicebot-evaluator",
      health: "GET /health",
    },
    receivedMethod: req.method,
    receivedPath: req.url,
    hint:
      req.method === "GET"
        ? "Use POST method for /voicebot-evaluator"
        : "Wrong endpoint",
  });
});

// Mount the router WITHOUT /api (Vercel already includes /api)
app.use(voiceBotEvaluator);

console.log("✅ [INIT] Router mounted");

// Log responses
app.use((req, res, next) => {
  const originalJson = res.json;
  res.json = function (data) {
    const duration = Date.now() - req.startTime;
    console.log(`📤 [${req.reqId}] Response in ${duration}ms`);
    console.log(`📤 [${req.reqId}] Status: ${res.statusCode}`);
    return originalJson.call(this, data);
  };
  next();
});

// Catch unhandled routes
app.use((req, res) => {
  console.log(
    `⚠️ [${req.reqId}] 404 - Route not found: ${req.method} ${req.url}`
  );
  res.status(404).json({
    error: "Route not found",
    path: req.url,
    method: req.method,
    availableRoutes: ["POST /voicebot-evaluator", "GET /health", "GET /"],
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(`💥 [${req.reqId}] Error:`, err.message);
  console.error(`💥 [${req.reqId}] Stack:`, err.stack);
  res.status(500).json({ error: err.message });
});

console.log("✅ [INIT] Ready to handle requests");

// Required default export for Vercel
export default serverless(app);
